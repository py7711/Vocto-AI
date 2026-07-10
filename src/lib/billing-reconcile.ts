import "server-only";

import {addonPacks, billingPlans, oneTimePacks, type AddonPack, type BillingPlan, type OneTimePack} from "@/lib/billing";
import {prisma, prismaTransactionOptions} from "@/lib/prisma";

type CheckoutSession = {
  id: string;
  mode?: string;
  status?: string;
  payment_status?: string;
  customer?: string;
  subscription?: string;
  payment_intent?: string;
  invoice?: string;
  client_reference_id?: string;
  metadata?: Record<string, string>;
  created?: number;
  currency?: string;
  amount_subtotal?: number;
  amount_total?: number;
};

function orderIdFromSession(session: CheckoutSession) {
  return session.metadata?.orderId ?? session.client_reference_id ?? null;
}

function paidAtFromSession(session: CheckoutSession) {
  return session.created ? new Date(session.created * 1000) : new Date();
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

function isPaidCheckoutSession(session: CheckoutSession) {
  return session.status === "complete" && (session.payment_status === "paid" || session.payment_status === "no_payment_required");
}

function paymentIntentIdFromSession(session: CheckoutSession) {
  return session.payment_intent ? String(session.payment_intent) : null;
}

function invoiceIdFromSession(session: CheckoutSession) {
  return session.invoice ? String(session.invoice) : null;
}

async function updatePaidOrderFromSession(session: CheckoutSession) {
  const orderId = orderIdFromSession(session);
  const sessionId = session.id ? String(session.id) : null;
  if (!orderId && !sessionId) return;

  await prisma.billingOrder.updateMany({
    where: orderId ? {id: String(orderId)} : {stripeCheckoutSessionId: sessionId},
    data: {
      status: "PAID",
      stripeCheckoutSessionId: sessionId,
      stripeCustomerId: session.customer ? String(session.customer) : undefined,
      stripePaymentIntentId: paymentIntentIdFromSession(session),
      stripeSubscriptionId: session.subscription ? String(session.subscription) : undefined,
      stripeInvoiceId: invoiceIdFromSession(session),
      stripePaymentStatus: session.payment_status ? String(session.payment_status) : undefined,
      currency: session.currency ? String(session.currency) : undefined,
      amountSubtotal: typeof session.amount_subtotal === "number" ? session.amount_subtotal : undefined,
      amountTotal: typeof session.amount_total === "number" ? session.amount_total : undefined,
      paidAt: paidAtFromSession(session)
    }
  });
}

async function grantSubscriptionFromSession(session: CheckoutSession) {
  const userId = session.metadata?.userId;
  const planKey = session.metadata?.plan as BillingPlan | undefined;
  const stripeCustomerId = session.customer ? String(session.customer) : null;
  const stripeSubscriptionId = session.subscription ? String(session.subscription) : null;
  const sessionId = session.id ? String(session.id) : null;
  if (!userId || !planKey || !billingPlans[planKey] || !stripeCustomerId || !stripeSubscriptionId || !sessionId) return false;

  const plan = billingPlans[planKey];
  const idempotencyKey = subscriptionCheckoutIdempotencyKey(sessionId);
  const reason = `Stripe subscription ${planKey} session ${sessionId} subscription ${stripeSubscriptionId}`;
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

    subscription = subscription ? await tx.subscription.update({
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
    }) : await tx.subscription.create({
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

  return true;
}

async function creditOneTimePackFromSession(session: CheckoutSession) {
  const userId = session.metadata?.userId;
  const packKey = session.metadata?.pack as OneTimePack | undefined;
  const stripeCustomerId = session.customer ? String(session.customer) : null;
  const sessionId = session.id ? String(session.id) : null;
  if (!userId || !packKey || !oneTimePacks[packKey] || !stripeCustomerId || !sessionId) return false;

  const pack = oneTimePacks[packKey];
  const idempotencyKey = oneTimePackIdempotencyKey(sessionId);
  const reason = `Stripe one-time pack ${pack.planId} session ${sessionId}`;
  const orderId = orderIdFromSession(session);

  await prisma.$transaction(async (tx) => {
    const existingLedger = await tx.usageLedger.findUnique({where: {idempotencyKey}, select: {id: true}});
    if (existingLedger) return;

    let subscription = await tx.subscription.findFirst({where: {userId, stripeCustomerId}, orderBy: {createdAt: "desc"}});
    subscription ??= await tx.subscription.findFirst({where: {userId, status: {in: ["TRIALING", "ACTIVE"]}}, orderBy: {createdAt: "desc"}});

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
      await tx.subscription.update({
        where: {id: subscription.id},
        data: {
          ...(!subscription.stripeCustomerId ? {stripeCustomerId} : {}),
          status: subscription.status === "CANCELED" || subscription.status === "INCOMPLETE" ? "ACTIVE" : subscription.status,
          monthlyMinuteQuota: {increment: pack.minutes},
          remainingMinutes: {increment: pack.minutes},
          maxSingleFileMinutes: Math.max(subscription.maxSingleFileMinutes, 600),
          currentPeriodEnd: subscription.currentPeriodEnd ?? new Date(Date.now() + pack.validityDays * 24 * 60 * 60 * 1000)
        }
      });
    }

    await tx.usageLedger.create({
      data: {userId, subscriptionId: subscription.id, type: "ADJUST", minutesDelta: pack.minutes, reason, idempotencyKey}
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

  return true;
}

async function creditAddonPackFromSession(session: CheckoutSession) {
  const userId = session.metadata?.userId;
  const addonKey = session.metadata?.addon as AddonPack | undefined;
  const stripeCustomerId = session.customer ? String(session.customer) : null;
  const sessionId = session.id ? String(session.id) : null;
  if (!userId || !addonKey || !addonPacks[addonKey] || !stripeCustomerId || !sessionId) return false;

  const addon = addonPacks[addonKey];
  const idempotencyKey = addonPackIdempotencyKey(sessionId);
  const reason = `Stripe add-on pack ${addon.planId} session ${sessionId}`;
  const orderId = orderIdFromSession(session);

  await prisma.$transaction(async (tx) => {
    const existingLedger = await tx.usageLedger.findUnique({where: {idempotencyKey}, select: {id: true}});
    if (existingLedger) return;

    const subscription = await tx.subscription.findFirst({
      where: {userId, status: {in: ["TRIALING", "ACTIVE"]}, plan: {not: "FREE"}},
      orderBy: {createdAt: "desc"}
    });
    if (!subscription) throw new Error("Stripe 加购分钟包支付成功，但系统找不到可发放的有效付费订阅。");

    await tx.subscription.update({
      where: {id: subscription.id},
      data: {
        ...(!subscription.stripeCustomerId ? {stripeCustomerId} : {}),
        monthlyMinuteQuota: {increment: addon.minutes},
        remainingMinutes: {increment: addon.minutes}
      }
    });
    await tx.usageLedger.create({
      data: {userId, subscriptionId: subscription.id, type: "ADJUST", minutesDelta: addon.minutes, reason, idempotencyKey}
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

  return true;
}

export async function reconcilePaidCheckoutSession(session: CheckoutSession, input: {expectedUserId?: string} = {}) {
  if (!isPaidCheckoutSession(session)) {
    return {reconciled: false, reason: "not_paid" as const};
  }
  if (input.expectedUserId && session.metadata?.userId !== input.expectedUserId) {
    throw new Error("Stripe 支付会话不属于当前登录用户。");
  }

  await updatePaidOrderFromSession(session);
  const subscriptionGranted = await grantSubscriptionFromSession(session);
  const oneTimePackCredited = await creditOneTimePackFromSession(session);
  const addonPackCredited = await creditAddonPackFromSession(session);

  return {
    reconciled: subscriptionGranted || oneTimePackCredited || addonPackCredited,
    reason: "paid" as const
  };
}
