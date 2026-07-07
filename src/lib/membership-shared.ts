// 会员判定的纯逻辑，客户端与服务端共用，不依赖数据库或 server-only 模块。

// 视为“已开通会员”的付费套餐。FREE 属于本地免费订阅，不算会员。
export const membershipPlans = ["BASIC", "STANDARD", "PRO", "TEAM", "ENTERPRISE"] as const;
// 只有处于生效或试用中的订阅才授予会员权益，过期/取消/未完成的不算。
export const membershipStatuses = ["ACTIVE", "TRIALING"] as const;

type MembershipSubscription = {
  plan?: string | null;
  status?: string | null;
};

export function subscriptionGrantsMembership(subscription: MembershipSubscription | null | undefined): boolean {
  if (!subscription?.plan) return false;
  const plan = subscription.plan.toUpperCase();
  const status = subscription.status?.toUpperCase();
  if (!membershipPlans.includes(plan as (typeof membershipPlans)[number])) return false;
  return !status || membershipStatuses.includes(status as (typeof membershipStatuses)[number]);
}

export function hasActiveMembershipFromSubscriptions(subscriptions: MembershipSubscription[] | null | undefined): boolean {
  return Boolean(subscriptions?.some(subscriptionGrantsMembership));
}
