import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
import {ensureFreeSubscription, getAccountUser, serializeSubscription} from "@/lib/account-compat";

export async function GET() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return NextResponse.json({error: "请先登录。"}, {status: 401});
  await ensureFreeSubscription(sessionUser.id);
  const user = await getAccountUser(sessionUser.id);
  const subscription = user?.subscriptions[0];
  if (!user || !subscription) return NextResponse.json({error: "额度信息不存在。"}, {status: 404});
  const summary = serializeSubscription(subscription, user);

  return NextResponse.json({
    plan: summary.plan,
    status: summary.status,
    dailyFileLimit: summary.dailyFree.limit,
    dailyFileUsed: summary.dailyFree.used,
    dailyFileRemaining: summary.dailyFree.remaining,
    dailyResetAt: summary.dailyFree.resetAt,
    monthlyMinuteQuota: summary.monthlyMinuteQuota,
    remainingMinutes: summary.remainingMinutes,
    maxSingleFileMinutes: summary.maxSingleFileMinutes,
    maxUploadBytes: summary.maxUploadBytes,
    features: summary.features
  });
}
