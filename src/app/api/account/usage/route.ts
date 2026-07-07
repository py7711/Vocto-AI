import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {freeDailyFileLimit} from "@/lib/usage";

export const dynamic = "force-dynamic";

function startOfCurrentDay() {
  // 用本地服务器时区统计“今日文件”，与免费次数重置逻辑保持一致。
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function rollForwardMonthly(date: Date, now = new Date()) {
  let next = new Date(date);
  while (next <= now) {
    next = addMonths(next, 1);
  }
  return next;
}

function isLocalFreeSubscription(subscription: {plan: string; stripeSubscriptionId: string | null}) {
  return subscription.plan === "FREE" || !subscription.stripeSubscriptionId;
}

function resolvePeriodEnd(subscription: {currentPeriodEnd: Date | null; plan: string; stripeSubscriptionId: string | null}) {
  // Stripe 订阅会写入真实账期；本地免费订阅如果种子账期过期，则按月滚到未来，避免设置页显示已过期的 reset date。
  if (subscription.currentPeriodEnd) {
    return isLocalFreeSubscription(subscription) ? rollForwardMonthly(subscription.currentPeriodEnd) : subscription.currentPeriodEnd;
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

function resolvePeriodStart(subscription: {currentPeriodStart: Date | null; currentPeriodEnd: Date | null; createdAt: Date; plan: string; stripeSubscriptionId: string | null}) {
  // Stripe 订阅会写入真实账期；本地免费订阅则回退到自然月。
  if (subscription.currentPeriodStart) {
    if (isLocalFreeSubscription(subscription) && subscription.currentPeriodEnd && subscription.currentPeriodEnd <= new Date()) {
      return addMonths(resolvePeriodEnd(subscription), -1);
    }
    return subscription.currentPeriodStart;
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({error: "请先登录后再查看个人用量。"}, {status: 401});
    }

    const subscription = await prisma.subscription.findFirst({
      where: {userId: user.id, status: {in: ["TRIALING", "ACTIVE", "PAST_DUE", "INCOMPLETE"]}},
      orderBy: {createdAt: "desc"}
    });

    if (!subscription) {
      return NextResponse.json({error: "当前账号还没有订阅记录。"}, {status: 404});
    }

    const periodStart = resolvePeriodStart(subscription);
    const periodEnd = resolvePeriodEnd(subscription);
    const todayStart = startOfCurrentDay();
    const dailyResetAt = user.dailyResetAt && user.dailyResetAt > new Date() ? user.dailyResetAt : (() => {
      const nextReset = new Date();
      nextReset.setHours(24, 0, 0, 0);
      return nextReset;
    })();
    const dailyUsed = user.dailyResetAt && user.dailyResetAt > new Date() ? user.dailyFreeCount : 0;

    // 个人版所有仪表盘统计都按 userId 聚合，避免把历史团队数据暴露到产品侧。
    const [periodTasks, todayTasks, recentLedger, ledgerSum] = await Promise.all([
      prisma.mediaTask.aggregate({
        where: {
          userId: user.id,
          createdAt: {gte: periodStart, lt: periodEnd}
        },
        _count: {_all: true},
        _sum: {durationSeconds: true, quotaMinutes: true}
      }),
      prisma.mediaTask.count({
        where: {
          userId: user.id,
          createdAt: {gte: todayStart}
        }
      }),
      prisma.usageLedger.findMany({
        where: {
          userId: user.id,
          createdAt: {gte: periodStart, lt: periodEnd}
        },
        orderBy: {createdAt: "desc"},
        take: 20,
        select: {
          id: true,
          type: true,
          minutesDelta: true,
          reason: true,
          createdAt: true,
          mediaTask: {
            select: {
              id: true,
              originalName: true,
              sourceType: true,
              status: true
            }
          }
        }
      }),
      prisma.usageLedger.aggregate({
        where: {
          userId: user.id,
          createdAt: {gte: periodStart, lt: periodEnd}
        },
        _sum: {minutesDelta: true}
      })
    ]);

    const monthlyQuota = subscription.monthlyMinuteQuota;
    const remainingMinutes = subscription.remainingMinutes;
    const usedMinutes = Math.max(0, monthlyQuota - remainingMinutes);
    const ledgerMinutesDelta = ledgerSum._sum.minutesDelta ?? 0;

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        monthlyMinuteQuota: monthlyQuota,
        remainingMinutes,
        usedMinutes,
        maxSingleFileMinutes: subscription.maxSingleFileMinutes,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd
      },
      dailyFree: {
        used: dailyUsed,
        limit: freeDailyFileLimit,
        remaining: Math.max(0, freeDailyFileLimit - dailyUsed),
        resetAt: dailyResetAt
      },
      tasks: {
        todayCount: todayTasks,
        periodCount: periodTasks._count._all,
        periodDurationSeconds: periodTasks._sum.durationSeconds ?? 0,
        periodQuotaMinutes: periodTasks._sum.quotaMinutes ?? 0
      },
      ledger: {
        periodMinutesDelta: ledgerMinutesDelta,
        entries: recentLedger
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法读取个人用量。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
