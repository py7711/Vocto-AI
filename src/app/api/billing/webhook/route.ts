import {NextResponse} from "next/server";
import {addonPacks, billingPlans, oneTimePacks, type AddonPack, type BillingPlan, type OneTimePack, verifyStripeWebhookSignature} from "@/lib/billing";
import {prisma, prismaTransactionOptions} from "@/lib/prisma";

export const dynamic = "force-dynamic";

type StripeEvent = {
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

async function upsertSubscriptionFromStripe(stripeSubscription: any) {
  const userId = stripeSubscription.metadata?.userId;
  const planKey = stripeSubscription.metadata?.plan as BillingPlan | undefined;
  if (!userId || !planKey || !billingPlans[planKey]) return;

  const plan = billingPlans[planKey];
  const periodStart = stripeSubscription.current_period_start ? new Date(stripeSubscription.current_period_start * 1000) : null;
  const periodEnd = stripeSubscription.current_period_end ? new Date(stripeSubscription.current_period_end * 1000) : null;

  // Stripe 是订阅状态事实来源，Webhook 到达后把套餐、额度和账期同步回业务库。
  await prisma.subscription.upsert({
    where: {stripeSubscriptionId: stripeSubscription.id},
    update: {
      userId,
      plan: plan.appPlan,
      status: normalizeStatus(stripeSubscription.status),
      stripeCustomerId: String(stripeSubscription.customer),
      monthlyMinuteQuota: plan.minutes,
      remainingMinutes: plan.minutes,
      maxSingleFileMinutes: plan.maxSingleFileMinutes,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd
    },
    create: {
      userId,
      plan: plan.appPlan,
      status: normalizeStatus(stripeSubscription.status),
      stripeCustomerId: String(stripeSubscription.customer),
      stripeSubscriptionId: stripeSubscription.id,
      monthlyMinuteQuota: plan.minutes,
      remainingMinutes: plan.minutes,
      maxSingleFileMinutes: plan.maxSingleFileMinutes,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd
    }
  });
}

async function updateSubscriptionFromCheckoutSession(session: any) {
  const userId = session.metadata?.userId;
  const planKey = session.metadata?.plan as BillingPlan | undefined;
  const stripeCustomerId = session.customer ? String(session.customer) : null;
  const stripeSubscriptionId = session.subscription ? String(session.subscription) : null;
  if (!userId || !planKey || !billingPlans[planKey] || !stripeCustomerId || !stripeSubscriptionId) return;

  const plan = billingPlans[planKey];
  // 支付会话完成事件通常比 subscription.updated 更快到达，先乐观刷新额度，后续订阅事件再校准账期。
  await prisma.subscription.updateMany({
    where: {userId, stripeCustomerId},
    data: {
      plan: plan.appPlan,
      status: "ACTIVE",
      stripeSubscriptionId,
      monthlyMinuteQuota: plan.minutes,
      remainingMinutes: plan.minutes,
      maxSingleFileMinutes: plan.maxSingleFileMinutes
    }
  });
}

async function creditOneTimePackFromCheckoutSession(session: any) {
  const userId = session.metadata?.userId;
  const packKey = session.metadata?.pack as OneTimePack | undefined;
  const stripeCustomerId = session.customer ? String(session.customer) : null;
  const sessionId = session.id ? String(session.id) : null;
  if (!userId || !packKey || !oneTimePacks[packKey] || !stripeCustomerId || !sessionId) return;

  const pack = oneTimePacks[packKey];
  const reason = `Stripe one-time pack ${pack.planId} session ${sessionId}`;

  await prisma.$transaction(async (tx) => {
    const existingLedger = await tx.usageLedger.findFirst({
      where: {userId, reason},
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
        reason
      }
    });
  }, prismaTransactionOptions);
}

async function creditAddonPackFromCheckoutSession(session: any) {
  const userId = session.metadata?.userId;
  const addonKey = session.metadata?.addon as AddonPack | undefined;
  const stripeCustomerId = session.customer ? String(session.customer) : null;
  const sessionId = session.id ? String(session.id) : null;
  if (!userId || !addonKey || !addonPacks[addonKey] || !stripeCustomerId || !sessionId) return;

  const addon = addonPacks[addonKey];
  const reason = `Stripe add-on pack ${addon.planId} session ${sessionId}`;

  await prisma.$transaction(async (tx) => {
    const existingLedger = await tx.usageLedger.findFirst({
      where: {userId, reason},
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
    if (!subscription) return;

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
        reason
      }
    });
  }, prismaTransactionOptions);
}

export async function POST(request: Request) {
  const payload = await request.text();
  try {
    verifyStripeWebhookSignature(payload, request.headers.get("stripe-signature"));
    const event = JSON.parse(payload) as StripeEvent;

    if (event.type === "checkout.session.completed") {
      await updateSubscriptionFromCheckoutSession(event.data.object);
      await creditOneTimePackFromCheckoutSession(event.data.object);
      await creditAddonPackFromCheckoutSession(event.data.object);
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await upsertSubscriptionFromStripe(event.data.object);
    }

    return NextResponse.json({received: true});
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook 处理失败。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
