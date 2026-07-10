import {NextResponse} from "next/server";
import {addonPacks, billingPlans, oneTimePacks, type AddonPack, type BillingPlan, type OneTimePack, verifyStripeWebhookSignature} from "@/lib/billing";
import {prisma, prismaTransactionOptions} from "@/lib/prisma";
import {logApiError} from "@/lib/api-logger";

export const dynamic = "force-dynamic";

type StripeEvent = {
  id?: string;
  type: string;
  data: {
    object: any;
  };
};

function normalizeStatus(status: string) {
  if (status === "trialing") return "TRIALING";
  if (status === "active") return "ACTIVE";
  if (status === "past_due") return "PAST_DUE";
  if (status === "canceled") return "CANCELED";
  return "INCOMPLETE";
}

function orderIdFromSession(session: any) {
  return session.metadata?.orderId ?? session.client_reference_id ?? null;
}

function orderIdFromSubscription(stripeSubscription: any) {
  return stripeSubscription.metadata?.orderId ?? null;
}

function paidAtFromSession(session: any) {
  return session.created ? new Date(session.created * 1000) : new Date();
}

function invoiceIdFromSession(session: any) {
  return session.invoice ? String(session.invoice) : null;
}

function paymentIntentIdFromSession(session: any) {
  return session.payment_intent ? String(session.payment_intent) : null;
}

function subscriptionCheckoutGrantReason(planKey: BillingPlan, sessionId: string, stripeSubscriptionId: string) {
  return `Stripe subscription ${planKey} session ${sessionId} subscription ${stripeSubscriptionId}`;
}

function subscriptionCheckoutIdempotencyKey(sessionId: string) {
  return `stripe:subscription:${sessionId}`;
}

function oneTimePackIdempotencyKey(sessionId: string) {
  return `stripe:one-time-pack:${sessionId}`;
}

function addonPackIdempotencyKey(sessionId: string) {
  return `stripe:addon-pack:${sessionId}`;
}

function webhookProcessingError(message: string, details: Record<string, unknown>) {
  const error = new Error(message) as Error & {details?: Record<string, unknown>};
  error.details = details;
  return error;
}

function stripeObjectLogContext(object: any) {
  return {
    objectId: object?.id ? String(object.id) : null,
    objectType: object?.object ? String(object.object) : null,
    mode: object?.mode ? String(object.mode) : null,
    checkoutStatus: object?.status ? String(object.status) : null,
    paymentStatus: object?.payment_status ? String(object.payment_status) : null,
    customer: object?.customer ? String(object.customer) : null,
    subscription: object?.subscription ? String(object.subscription) : null,
    paymentIntent: object?.payment_intent ? String(object.payment_intent) : null,
    invoice: object?.invoice ? String(object.invoice) : null,
    clientReferenceId: object?.client_reference_id ? String(object.client_reference_id) : null,
    metadata: object?.metadata ?? null
  };
}

function stripeEventLogContext(event: StripeEvent | null | undefined, step?: string) {
  const object = event?.data?.object;
  return {
    step,
    stripeEventId: event?.id ?? null,
    stripeEventType: event?.type ?? null,
    stripeObject: stripeObjectLogContext(object)
  };
}

async function updateOrderFromCheckoutSession(session: any, status: "PAID" | "EXPIRED" | "FAILED") {
  const orderId = orderIdFromSession(session);
  const sessionId = session.id ? String(session.id) : null;
  if (!orderId && !sessionId) return;

  await prisma.billingOrder.updateMany({
    where: orderId ? {id: String(orderId)} : {stripeCheckoutSessionId: sessionId},
    data: {
      status,
      stripeCheckoutSessionId: sessionId,
      stripeCustomerId: session.customer ? String(session.customer) : undefined,
      stripePaymentIntentId: paymentIntentIdFromSession(session),
      stripeSubscriptionId: session.subscription ? String(session.subscription) : undefined,
      stripeInvoiceId: invoiceIdFromSession(session),
      stripePaymentStatus: session.payment_status ? String(session.payment_status) : undefined,
      currency: session.currency ? String(session.currency) : undefined,
      amountSubtotal: typeof session.amount_subtotal === "number" ? session.amount_subtotal : undefined,
      amountTotal: typeof session.amount_total === "number" ? session.amount_total : undefined,
      paidAt: status === "PAID" ? paidAtFromSession(session) : undefined,
      canceledAt: status === "EXPIRED" || status === "FAILED" ? new Date() : undefined,
      metadata: {
        stripeEvent: "checkout.session",
        checkoutStatus: session.status,
        paymentStatus: session.payment_status
      }
    }
  });
}

async function upsertSubscriptionFromStripe(stripeSubscription: any) {
  const userId = stripeSubscription.metadata?.userId;
  const planKey = stripeSubscription.metadata?.plan as BillingPlan | undefined;
  if (!userId || !planKey || !billingPlans[planKey]) return;

  const plan = billingPlans[planKey];
  const periodStart = stripeSubscription.current_period_start ? new Date(stripeSubscription.current_period_start * 1000) : null;
  const periodEnd = stripeSubscription.current_period_end ? new Date(stripeSubscription.current_period_end * 1000) : null;
  const status = normalizeStatus(stripeSubscription.status);
  const stripeCustomerId = String(stripeSubscription.customer);
  const stripeSubscriptionId = String(stripeSubscription.id);

  // Stripe 是订阅状态事实来源，Webhook 到达后把套餐、额度和账期同步回业务库。
  const existing = await prisma.subscription.findFirst({
    where: {
      OR: [
        {stripeSubscriptionId},
        {userId, stripeCustomerId}
      ]
    },
    orderBy: {createdAt: "desc"}
  });
  const periodChanged = Boolean(
    !existing?.currentPeriodEnd ||
    !periodEnd ||
    existing.currentPeriodEnd.getTime() !== periodEnd.getTime()
  );

  const orderId = orderIdFromSubscription(stripeSubscription);
  const order = orderId ? await prisma.billingOrder.findFirst({
    where: {id: String(orderId), userId},
    select: {stripeCheckoutSessionId: true}
  }) : null;
  const checkoutGrantKey = order?.stripeCheckoutSessionId ? subscriptionCheckoutIdempotencyKey(order.stripeCheckoutSessionId) : null;
  const checkoutGrant = checkoutGrantKey ? await prisma.usageLedger.findUnique({
    where: {idempotencyKey: checkoutGrantKey},
    select: {id: true}
  }) : null;
  const shouldResetRemaining = periodChanged && !(checkoutGrant && !existing?.currentPeriodEnd);

  const subscription = existing ? await prisma.subscription.update({
    where: {id: existing.id},
    data: {
      userId,
      plan: plan.appPlan,
      status,
      stripeCustomerId,
      stripeSubscriptionId,
      monthlyMinuteQuota: plan.minutes,
      ...(shouldResetRemaining ? {remainingMinutes: plan.minutes} : {}),
      maxSingleFileMinutes: plan.maxSingleFileMinutes,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd
    }
  }) : await prisma.subscription.create({
    data: {
      userId,
      plan: plan.appPlan,
      status,
      stripeCustomerId,
      stripeSubscriptionId,
      monthlyMinuteQuota: plan.minutes,
      remainingMinutes: plan.minutes,
      maxSingleFileMinutes: plan.maxSingleFileMinutes,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd
    }
  });

  if (orderId) {
    await prisma.billingOrder.updateMany({
      where: {id: String(orderId), userId},
      data: {
        subscriptionId: subscription.id,
        status: status === "ACTIVE" || status === "TRIALING" ? "ACTIVE" : status === "CANCELED" ? "CANCELED" : "FAILED",
        stripeCustomerId,
        stripeSubscriptionId,
        stripePaymentStatus: String(stripeSubscription.status),
        metadata: {
          stripeEvent: "customer.subscription",
          subscriptionStatus: stripeSubscription.status,
          currentPeriodStart: stripeSubscription.current_period_start,
          currentPeriodEnd: stripeSubscription.current_period_end
        }
      }
    });
  }
}

async function updateSubscriptionFromCheckoutSession(session: any) {
  const userId = session.metadata?.userId;
  const planKey = session.metadata?.plan as BillingPlan | undefined;
  const stripeCustomerId = session.customer ? String(session.customer) : null;
  const stripeSubscriptionId = session.subscription ? String(session.subscription) : null;
  const sessionId = session.id ? String(session.id) : null;
  const isSubscriptionCheckout = session.mode === "subscription" || Boolean(stripeSubscriptionId);
  if (!userId || !planKey || !billingPlans[planKey] || !stripeCustomerId || !stripeSubscriptionId || !sessionId) {
    if (!isSubscriptionCheckout) return;
    throw webhookProcessingError("Stripe 订阅支付成功，但缺少发放会员权益所需字段。", {
      userId,
      planKey,
      stripeCustomerId,
      stripeSubscriptionId,
      sessionId,
      orderId: orderIdFromSession(session),
      metadata: session.metadata ?? null
    });
  }

  const plan = billingPlans[planKey];
  const reason = subscriptionCheckoutGrantReason(planKey, sessionId, stripeSubscriptionId);
  const idempotencyKey = subscriptionCheckoutIdempotencyKey(sessionId);
  const orderId = orderIdFromSession(session);

  await prisma.$transaction(async (tx) => {
    const existingLedger = await tx.usageLedger.findUnique({
      where: {idempotencyKey},
      select: {id: true}
    });
    if (existingLedger) return;

    let subscription = await tx.subscription.findFirst({
      where: {
        OR: [
          {stripeSubscriptionId},
          {userId, stripeCustomerId}
        ]
      },
      orderBy: {createdAt: "desc"}
    });

    if (subscription) {
      subscription = await tx.subscription.update({
        where: {id: subscription.id},
        data: {
          userId,
          plan: plan.appPlan,
          status: "ACTIVE",
          stripeCustomerId,
          stripeSubscriptionId,
          monthlyMinuteQuota: plan.minutes,
          remainingMinutes: plan.minutes,
          maxSingleFileMinutes: plan.maxSingleFileMinutes
        }
      });
    } else {
      subscription = await tx.subscription.create({
        data: {
          userId,
          plan: plan.appPlan,
          status: "ACTIVE",
          stripeCustomerId,
          stripeSubscriptionId,
          monthlyMinuteQuota: plan.minutes,
          remainingMinutes: plan.minutes,
          maxSingleFileMinutes: plan.maxSingleFileMinutes
        }
      });
    }

    await tx.usageLedger.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        type: "ADJUST",
        minutesDelta: plan.minutes,
        reason,
        idempotencyKey
      }
    });

    if (orderId) {
      await tx.billingOrder.updateMany({
        where: {id: String(orderId), userId},
        data: {
          subscriptionId: subscription.id,
          status: "PAID",
          stripeCustomerId,
          stripeSubscriptionId,
          stripeInvoiceId: invoiceIdFromSession(session),
          stripePaymentStatus: session.payment_status ? String(session.payment_status) : undefined,
          paidAt: paidAtFromSession(session)
        }
      });
    }
  }, prismaTransactionOptions);
}

async function creditOneTimePackFromCheckoutSession(session: any) {
  const userId = session.metadata?.userId;
  const packKey = session.metadata?.pack as OneTimePack | undefined;
  const stripeCustomerId = session.customer ? String(session.customer) : null;
  const sessionId = session.id ? String(session.id) : null;
  if (!userId || !packKey || !oneTimePacks[packKey] || !stripeCustomerId || !sessionId) {
    if (!packKey) return;
    throw webhookProcessingError("Stripe 一次性分钟包支付成功，但缺少发放权益所需字段。", {
      userId,
      packKey,
      stripeCustomerId,
      sessionId,
      orderId: orderIdFromSession(session),
      metadata: session.metadata ?? null
    });
  }

  const pack = oneTimePacks[packKey];
  const reason = `Stripe one-time pack ${pack.planId} session ${sessionId}`;
  const idempotencyKey = oneTimePackIdempotencyKey(sessionId);
  const orderId = orderIdFromSession(session);

  await prisma.$transaction(async (tx) => {
    const existingLedger = await tx.usageLedger.findUnique({
      where: {idempotencyKey},
      select: {id: true}
    });
    if (existingLedger) return;

    let subscription = await tx.subscription.findFirst({
      where: {userId, stripeCustomerId},
      orderBy: {createdAt: "desc"}
    });

    subscription ??= await tx.subscription.findFirst({
      where: {userId, status: {in: ["TRIALING", "ACTIVE"]}},
      orderBy: {createdAt: "desc"}
    });

    if (!subscription) {
      subscription = await tx.subscription.create({
        data: {
          userId,
          stripeCustomerId,
          plan: "FREE",
          status: "ACTIVE",
          monthlyMinuteQuota: 120 + pack.minutes,
          remainingMinutes: 120 + pack.minutes,
          maxSingleFileMinutes: 600,
          currentPeriodEnd: new Date(Date.now() + pack.validityDays * 24 * 60 * 60 * 1000)
        }
      });
    } else {
      const canAttachCustomerId = !subscription.stripeCustomerId;
      await tx.subscription.update({
        where: {id: subscription.id},
        data: {
          ...(canAttachCustomerId ? {stripeCustomerId} : {}),
          status: subscription.status === "CANCELED" || subscription.status === "INCOMPLETE" ? "ACTIVE" : subscription.status,
          monthlyMinuteQuota: {increment: pack.minutes},
          remainingMinutes: {increment: pack.minutes},
          maxSingleFileMinutes: Math.max(subscription.maxSingleFileMinutes, 600),
          currentPeriodEnd: subscription.currentPeriodEnd ?? new Date(Date.now() + pack.validityDays * 24 * 60 * 60 * 1000)
        }
      });
    }

    await tx.usageLedger.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        type: "ADJUST",
        minutesDelta: pack.minutes,
        reason,
        idempotencyKey
      }
    });

    if (orderId) {
      await tx.billingOrder.updateMany({
        where: {id: String(orderId), userId},
        data: {
          subscriptionId: subscription.id,
          status: "PAID",
          stripeCustomerId,
          stripePaymentIntentId: paymentIntentIdFromSession(session),
          stripePaymentStatus: session.payment_status ? String(session.payment_status) : undefined,
          paidAt: paidAtFromSession(session)
        }
      });
    }
  }, prismaTransactionOptions);
}

async function creditAddonPackFromCheckoutSession(session: any) {
  const userId = session.metadata?.userId;
  const addonKey = session.metadata?.addon as AddonPack | undefined;
  const stripeCustomerId = session.customer ? String(session.customer) : null;
  const sessionId = session.id ? String(session.id) : null;
  if (!userId || !addonKey || !addonPacks[addonKey] || !stripeCustomerId || !sessionId) {
    if (!addonKey) return;
    throw webhookProcessingError("Stripe 加购分钟包支付成功，但缺少发放权益所需字段。", {
      userId,
      addonKey,
      stripeCustomerId,
      sessionId,
      orderId: orderIdFromSession(session),
      metadata: session.metadata ?? null
    });
  }

  const addon = addonPacks[addonKey];
  const reason = `Stripe add-on pack ${addon.planId} session ${sessionId}`;
  const idempotencyKey = addonPackIdempotencyKey(sessionId);
  const orderId = orderIdFromSession(session);

  await prisma.$transaction(async (tx) => {
    const existingLedger = await tx.usageLedger.findUnique({
      where: {idempotencyKey},
      select: {id: true}
    });
    if (existingLedger) return;

    const subscription = await tx.subscription.findFirst({
      where: {
        userId,
        status: {in: ["TRIALING", "ACTIVE"]},
        plan: {not: "FREE"}
      },
      orderBy: {createdAt: "desc"}
    });
    if (!subscription) {
      throw webhookProcessingError("Stripe 加购分钟包支付成功，但系统找不到可发放的有效付费订阅。", {
        userId,
        addonKey,
        stripeCustomerId,
        sessionId,
        orderId,
        metadata: session.metadata ?? null
      });
    }

    const canAttachCustomerId = !subscription.stripeCustomerId;
    await tx.subscription.update({
      where: {id: subscription.id},
      data: {
        ...(canAttachCustomerId ? {stripeCustomerId} : {}),
        monthlyMinuteQuota: {increment: addon.minutes},
        remainingMinutes: {increment: addon.minutes}
      }
    });

    await tx.usageLedger.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        type: "ADJUST",
        minutesDelta: addon.minutes,
        reason,
        idempotencyKey
      }
    });

    if (orderId) {
      await tx.billingOrder.updateMany({
        where: {id: String(orderId), userId},
        data: {
          subscriptionId: subscription.id,
          status: "PAID",
          stripeCustomerId,
          stripePaymentIntentId: paymentIntentIdFromSession(session),
          stripePaymentStatus: session.payment_status ? String(session.payment_status) : undefined,
          paidAt: paidAtFromSession(session)
        }
      });
    }
  }, prismaTransactionOptions);
}

export async function POST(request: Request) {
  const payload = await request.text();
  let event: StripeEvent | null = null;
  async function runWebhookStep(step: string, action: () => Promise<void>) {
    try {
      await action();
    } catch (error) {
      logApiError(error, request, {
        route: "/api/billing/webhook",
        meta: stripeEventLogContext(event, step)
      });
      throw error;
    }
  }

  try {
    verifyStripeWebhookSignature(payload, request.headers.get("stripe-signature"));
    event = JSON.parse(payload) as StripeEvent;

    if (event.type === "checkout.session.completed") {
      await runWebhookStep("checkout.session.completed:update-order", () => updateOrderFromCheckoutSession(event!.data.object, "PAID"));
      await runWebhookStep("checkout.session.completed:grant-subscription", () => updateSubscriptionFromCheckoutSession(event!.data.object));
      await runWebhookStep("checkout.session.completed:credit-one-time-pack", () => creditOneTimePackFromCheckoutSession(event!.data.object));
      await runWebhookStep("checkout.session.completed:credit-addon-pack", () => creditAddonPackFromCheckoutSession(event!.data.object));
    }

    if (event.type === "checkout.session.async_payment_succeeded") {
      await runWebhookStep("checkout.session.async_payment_succeeded:update-order", () => updateOrderFromCheckoutSession(event!.data.object, "PAID"));
      await runWebhookStep("checkout.session.async_payment_succeeded:grant-subscription", () => updateSubscriptionFromCheckoutSession(event!.data.object));
      await runWebhookStep("checkout.session.async_payment_succeeded:credit-one-time-pack", () => creditOneTimePackFromCheckoutSession(event!.data.object));
      await runWebhookStep("checkout.session.async_payment_succeeded:credit-addon-pack", () => creditAddonPackFromCheckoutSession(event!.data.object));
    }

    if (event.type === "checkout.session.expired") {
      await runWebhookStep("checkout.session.expired:update-order", () => updateOrderFromCheckoutSession(event!.data.object, "EXPIRED"));
    }

    if (event.type === "checkout.session.async_payment_failed") {
      await runWebhookStep("checkout.session.async_payment_failed:update-order", () => updateOrderFromCheckoutSession(event!.data.object, "FAILED"));
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await runWebhookStep(`${event.type}:sync-subscription`, () => upsertSubscriptionFromStripe(event!.data.object));
    }

    return NextResponse.json({received: true});
  } catch (error) {
    logApiError(error, request, {
      route: "/api/billing/webhook",
      meta: {
        ...stripeEventLogContext(event, "webhook:failed"),
        payloadPreview: payload.slice(0, 4000)
      }
    });
    const message = error instanceof Error ? error.message : "Webhook 处理失败。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
