import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

export async function POST() {
  try {
    // 旧订阅页会调用根级 /subscription/reactivate；当前个人版订阅入口在 /api/billing/*，
    // 这里仅保留“把当前订阅恢复为 ACTIVE”的兼容能力。
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});

    const subscription = user.subscriptions?.[0];
    if (!subscription) {
      return NextResponse.json({error: "没有可恢复的订阅。"}, {status: 404});
    }

    const updated = await prisma.subscription.update({
      where: {id: subscription.id},
      data: {status: "ACTIVE"}
    });

    return NextResponse.json({subscription: updated});
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法恢复订阅。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
