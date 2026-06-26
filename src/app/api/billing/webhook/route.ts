import {NextResponse} from "next/server";
import {billingPlans, type BillingPlan, verifyStripeWebhookSignature} from "@/lib/billing";
import {prisma} from "@/lib/prisma";

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
  // Checkout 完成事件通常比 subscription.updated 更快到达，先乐观刷新额度，后续订阅事件再校准账期。
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

export async function POST(request: Request) {
  const payload = await request.text();
  try {
    verifyStripeWebhookSignature(payload, request.headers.get("stripe-signature"));
    const event = JSON.parse(payload) as StripeEvent;

    if (event.type === "checkout.session.completed") {
      await updateSubscriptionFromCheckoutSession(event.data.object);
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
