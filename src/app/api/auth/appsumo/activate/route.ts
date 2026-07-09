import {NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {logApiError} from "@/lib/api-logger";

const activateSchema = z.object({
  code: z.string().trim().min(3).max(120),
  plan: z.enum(["BASIC", "STANDARD", "PRO"]).default("PRO")
});

const planMinutes = {
  BASIC: 600,
  STANDARD: 1800,
  PRO: 6000
} as const;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});
    const input = activateSchema.parse(await request.json().catch(() => ({})));
    const normalizedCode = input.code.toUpperCase();
    if (!/^(AS|APPSUMO|SUMO)[A-Z0-9_-]+$/.test(normalizedCode)) {
      return NextResponse.json({error: "AppSumo 兑换码无效。"}, {status: 422});
    }
    const minutes = planMinutes[input.plan];

    const subscription = await prisma.$transaction(async (tx) => {
      await tx.subscription.updateMany({
        where: {userId: user.id, status: {in: ["TRIALING", "ACTIVE", "PAST_DUE", "INCOMPLETE"]}},
        data: {status: "CANCELED"}
      });
      const created = await tx.subscription.create({
        data: {
          userId: user.id,
          plan: input.plan,
          status: "ACTIVE",
          monthlyMinuteQuota: minutes,
          remainingMinutes: minutes,
          maxSingleFileMinutes: input.plan === "PRO" ? 240 : 120,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      });
      await tx.usageLedger.create({
        data: {
          userId: user.id,
          subscriptionId: created.id,
          type: "ADJUST",
          minutesDelta: minutes,
          reason: `AppSumo 兑换码已激活：${normalizedCode.slice(0, 12)}`
        }
      });
      return created;
    });

    return NextResponse.json({
      activated: true,
      code: normalizedCode.slice(0, 12),
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        monthlyMinuteQuota: subscription.monthlyMinuteQuota,
        remainingMinutes: subscription.remainingMinutes,
        maxSingleFileMinutes: subscription.maxSingleFileMinutes
      }
    });
  } catch (error) {
    logApiError(error, request);
    return NextResponse.json({error: error instanceof Error ? error.message : "无法激活 AppSumo 兑换码。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
