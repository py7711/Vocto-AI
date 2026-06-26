import {NextResponse} from "next/server";
import {freeDailyFileLimit} from "@/lib/usage";
import {prisma} from "@/lib/prisma";
import {requireCurrentTeam, teamAccessErrorResponse} from "@/lib/teams";

export const dynamic = "force-dynamic";

function startOfCurrentDay() {
  // 用本地服务器时区统计“今日文件”，与免费次数重置逻辑保持一致。
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function resolvePeriodStart(subscription: {currentPeriodStart: Date | null; createdAt: Date}) {
  // Stripe 订阅会写入真实账期；本地免费订阅则回退到自然月。
  if (subscription.currentPeriodStart) return subscription.currentPeriodStart;
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function resolvePeriodEnd(subscription: {currentPeriodEnd: Date | null}) {
  // 没有 Stripe 账期时，按下个自然月一号作为统计结束时间。
  if (subscription.currentPeriodEnd) return subscription.currentPeriodEnd;
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

export async function GET(request: Request) {
  try {
    const {user, team} = await requireCurrentTeam({headers: request.headers});
    const subscription = await prisma.subscription.findFirst({
      where: {userId: user.id, status: {in: ["TRIALING", "ACTIVE", "PAST_DUE", "INCOMPLETE"]}},
      orderBy: {createdAt: "desc"}
    });

    if (!subscription) {
      return NextResponse.json({error: "当前账号还没有订阅记录。"}, {status: 404});
    }

    const periodStart = resolvePeriodStart(subscription);
    const periodEnd = resolvePeriodEnd(subscription);
    // 免费次数到期后界面应立刻显示 0，而不是等待下一次创建任务时才重置。
    const dailyResetAt = user.dailyResetAt && user.dailyResetAt > new Date() ? user.dailyResetAt : (() => {
      const nextReset = new Date();
      nextReset.setHours(24, 0, 0, 0);
      return nextReset;
    })();
    const dailyUsed = user.dailyResetAt && user.dailyResetAt > new Date() ? user.dailyFreeCount : 0;
    const todayStart = startOfCurrentDay();

    // 聚合任务统计和用量流水，前端仪表盘一次请求即可渲染套餐、今日、账期和最近扣减明细。
    const [periodTasks, todayTasks, recentLedger, ledgerSum] = await Promise.all([
      prisma.mediaTask.aggregate({
        where: {
          teamId: team.id,
          createdAt: {gte: periodStart, lt: periodEnd}
        },
        _count: {_all: true},
        _sum: {durationSeconds: true, quotaMinutes: true}
      }),
      prisma.mediaTask.count({
        where: {
          teamId: team.id,
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
    const accessError = teamAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法读取团队用量。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
