import "server-only";

import {prisma} from "@/lib/prisma";
import {membershipPlans, membershipStatuses} from "@/lib/membership-shared";

export {subscriptionGrantsMembership, hasActiveMembershipFromSubscriptions} from "@/lib/membership-shared";

// 服务端权威校验：直接查询数据库，确认用户当前是否拥有生效的付费会员。
export async function userHasActiveMembership(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      plan: {in: [...membershipPlans]},
      status: {in: [...membershipStatuses]}
    },
    select: {id: true}
  });
  return Boolean(subscription);
}
