import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
import {ensureFreeSubscription, getAccountUser, serializeSubscription} from "@/lib/account-compat";

export async function GET() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return NextResponse.json({error: "请先登录。"}, {status: 401});
  await ensureFreeSubscription(sessionUser.id);
  const user = await getAccountUser(sessionUser.id);
  const subscription = user?.subscriptions[0];
  if (!user || !subscription) return NextResponse.json({error: "权益信息不存在。"}, {status: 404});

  const summary = serializeSubscription(subscription, user);
  return NextResponse.json({
    summary,
    entitlements: {
      transcriptionMinutes: {
        total: summary.totalCredits,
        consumed: summary.consumedCredits,
        remaining: summary.remainingCredits
      },
      maxSingleFileMinutes: summary.maxSingleFileMinutes,
      maxUploadBytes: summary.maxUploadBytes,
      dailyFree: summary.dailyFree,
      features: summary.features
    }
  });
}
