import {Prisma} from "@prisma/client";
import {subscriptionGrantsMembership} from "@/lib/membership-shared";
import {prisma, prismaTransactionOptions} from "@/lib/prisma";

// 用量结算既会被 Next.js API 路由调用，也会被转写 worker 在任务完成/失败后调用。
// 因此本模块不能使用 `server-only`：worker 是普通 Node 进程，没有 Next 的 Server Component
// 编译上下文，导入 `server-only` 会在启动时直接抛错。
export const freeDailyFileLimit = 3;
export const freeSpeakerIdentificationLimit = 3;
export const freeSpeakerIdentificationLimitMessage = "Speaker identification is limited to 3 free uses. Upgrade to continue.";
export const insufficientFreeMinutesMessage = "Insufficient free minutes, please upgrade your plan.";

function secondsToBillableMinutes(seconds: number | null | undefined) {
  if (!seconds || seconds <= 0) return 1;
  return Math.max(1, Math.ceil(seconds / 60));
}

type PrismaClientLike = typeof prisma | Prisma.TransactionClient;

export async function reserveQuotaForTask(input: {
  userId: string;
  mediaTaskId: string;
  estimatedMinutes?: number;
  tx?: PrismaClientLike;
}) {
  const estimatedMinutes = Math.max(1, input.estimatedMinutes ?? 1);
  const client = input.tx ?? prisma;

  async function run(tx: PrismaClientLike) {
    // 预留额度必须和任务创建处于同一个事务边界内，否则任务已入库但额度未扣、
    // 或额度已扣但任务创建失败，都会让用户账面分钟数和真实任务状态不一致。
    const subscription = await tx.subscription.findFirst({
      where: {userId: input.userId, status: {in: ["TRIALING", "ACTIVE"]}},
      orderBy: {createdAt: "desc"}
    });

    if (!subscription) {
      throw new Error("当前账号没有可用订阅。");
    }
    if (subscription.plan === "FREE" && subscription.remainingMinutes < estimatedMinutes) {
      throw new Error("免费分钟额度不足，请升级套餐。");
    }
    if (subscription.remainingMinutes < estimatedMinutes) {
      throw new Error("订阅分钟额度不足，请升级或等待下个账期。");
    }

    // 先扣减订阅余额，再把预留分钟写回任务，并记录账本。
    // 后续完成或失败时只看 mediaTask.quotaMinutes 做结算/释放，避免重复扣费。
    await tx.subscription.update({
      where: {id: subscription.id},
      data: {remainingMinutes: {decrement: estimatedMinutes}}
    });
    await tx.mediaTask.update({
      where: {id: input.mediaTaskId},
      data: {quotaMinutes: estimatedMinutes}
    });
    await tx.usageLedger.create({
      data: {
        userId: input.userId,
        subscriptionId: subscription.id,
        mediaTaskId: input.mediaTaskId,
        type: "RESERVE",
        minutesDelta: -estimatedMinutes,
        reason: "任务创建时预留预计转写分钟数"
      }
    });

    return subscription;
  }

  if (input.tx) return run(client);
  return prisma.$transaction((tx) => run(tx), prismaTransactionOptions);
}

export async function settleQuotaForCompletedTask(input: {
  mediaTaskId: string;
  durationSeconds?: number | null;
}) {
  const actualMinutes = secondsToBillableMinutes(input.durationSeconds);

  return prisma.$transaction(async (tx) => {
    const task = await tx.mediaTask.findUnique({
      where: {id: input.mediaTaskId},
      select: {id: true, userId: true, quotaMinutes: true}
    });
    if (!task?.userId) return null;

    const subscription = await tx.subscription.findFirst({
      where: {userId: task.userId, status: {in: ["TRIALING", "ACTIVE"]}},
      orderBy: {createdAt: "desc"}
    });
    if (!subscription) return null;

    if (subscription.plan === "FREE" && actualMinutes > subscription.remainingMinutes + task.quotaMinutes) {
      throw new Error(insufficientFreeMinutesMessage);
    }

    // 结算只调整“预留分钟”和“实际分钟”的差额：
    // delta > 0 表示退回多预留的分钟，delta < 0 表示任务比预估更长，需要补扣。
    const delta = task.quotaMinutes - actualMinutes;
    if (delta !== 0) {
      await tx.subscription.update({
        where: {id: subscription.id},
        data: {remainingMinutes: {increment: delta}}
      });
    }

    await tx.mediaTask.update({
      where: {id: task.id},
      data: {quotaMinutes: actualMinutes}
    });
    await tx.usageLedger.create({
      data: {
        userId: task.userId,
        subscriptionId: subscription.id,
        mediaTaskId: task.id,
        type: "SETTLE",
        minutesDelta: delta,
        reason: `任务完成后按实际时长结算，实际 ${actualMinutes} 分钟`
      }
    });

    return {actualMinutes, delta};
  }, prismaTransactionOptions);
}

export async function assertFreeMinutesCanCoverDuration(input: {
  userId: string;
  durationSeconds?: number | null;
  mediaTaskId?: string;
  tx?: PrismaClientLike;
}) {
  if (!input.durationSeconds || input.durationSeconds <= 0) return;
  const requiredMinutes = secondsToBillableMinutes(input.durationSeconds);

  async function run(tx: PrismaClientLike) {
    const subscriptions = await tx.subscription.findMany({
      where: {userId: input.userId, status: {in: ["TRIALING", "ACTIVE"]}},
      orderBy: {createdAt: "desc"},
      select: {id: true, plan: true, status: true, remainingMinutes: true}
    });

    if (subscriptions.some(subscriptionGrantsMembership)) return;
    const freeSubscription = subscriptions.find((subscription) => subscription.plan === "FREE");
    if (!freeSubscription) return;

    const task = input.mediaTaskId
      ? await tx.mediaTask.findFirst({
          where: {id: input.mediaTaskId, userId: input.userId},
          select: {quotaMinutes: true}
        })
      : null;
    const availableMinutes = freeSubscription.remainingMinutes + (task?.quotaMinutes ?? 0);
    if (requiredMinutes > availableMinutes) {
      throw new Error(insufficientFreeMinutesMessage);
    }
  }

  if (input.tx) return run(input.tx);
  return prisma.$transaction((tx) => run(tx), prismaTransactionOptions);
}

export async function releaseQuotaForFailedTask(mediaTaskId: string) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.mediaTask.findUnique({
      where: {id: mediaTaskId},
      select: {id: true, userId: true, quotaMinutes: true}
    });
    if (!task?.userId || task.quotaMinutes <= 0) return null;

    const subscription = await tx.subscription.findFirst({
      where: {userId: task.userId, status: {in: ["TRIALING", "ACTIVE"]}},
      orderBy: {createdAt: "desc"}
    });
    if (!subscription) return null;

    // 失败和取消都要把预留额度清零。清零是幂等保护：同一个失败任务被重试释放时，
    // 下一次会因为 quotaMinutes <= 0 直接返回，不会重复返还分钟。
    await tx.subscription.update({
      where: {id: subscription.id},
      data: {remainingMinutes: {increment: task.quotaMinutes}}
    });
    await tx.mediaTask.update({where: {id: task.id}, data: {quotaMinutes: 0}});
    await tx.usageLedger.create({
      data: {
        userId: task.userId,
        subscriptionId: subscription.id,
        mediaTaskId: task.id,
        type: "RELEASE",
        minutesDelta: task.quotaMinutes,
        reason: "任务失败或取消后释放预留分钟数"
      }
    });

    return {releasedMinutes: task.quotaMinutes};
  }, prismaTransactionOptions);
}

export async function assertAndUpdateFreeDailyQuota(input: {userId: string; tx?: PrismaClientLike}) {
  async function run(tx: PrismaClientLike) {
    const now = new Date();
    const user = await tx.user.findUnique({
      where: {id: input.userId},
      select: {id: true, dailyFreeCount: true, dailyResetAt: true, subscriptions: {orderBy: {createdAt: "desc"}, take: 1}}
    });
    if (!user) throw new Error("用户不存在。");

    const subscription = user.subscriptions[0];
    if (subscription?.plan !== "FREE") return;

    const shouldReset = !user.dailyResetAt || user.dailyResetAt <= now;
    const count = shouldReset ? 0 : user.dailyFreeCount;
    if (count >= freeDailyFileLimit) {
      throw new Error("免费版今日文件次数已用完，请升级套餐。");
    }

    // 免费版按自然日限制文件次数。这里用服务器本地时区推进到次日 00:00，
    // 和页面展示的“今日次数”保持一致；如需按用户时区统计，应同时调整展示和结算文案。
    const nextReset = new Date(now);
    nextReset.setHours(24, 0, 0, 0);
    await tx.user.update({
      where: {id: input.userId},
      data: {
        dailyFreeCount: count + 1,
        dailyResetAt: shouldReset ? nextReset : user.dailyResetAt
      }
    });
  }

  if (input.tx) return run(input.tx);
  return prisma.$transaction((tx) => run(tx), prismaTransactionOptions);
}

export async function assertFreeSpeakerIdentificationQuota(input: {userId: string; tx?: PrismaClientLike}) {
  async function run(tx: PrismaClientLike) {
    const subscriptions = await tx.subscription.findMany({
      where: {userId: input.userId, status: {in: ["TRIALING", "ACTIVE"]}},
      orderBy: {createdAt: "desc"},
      select: {plan: true, status: true}
    });

    if (subscriptions.some(subscriptionGrantsMembership) || !subscriptions.some((subscription) => subscription.plan === "FREE")) return;

    const usedCount = await tx.mediaTask.count({
      where: {
        userId: input.userId,
        OR: [
          {
            mediaAssets: {
              some: {
                kind: "SOURCE_MEDIA",
                metadata: {path: "$.speakerLabelsRequested", equals: true}
              }
            }
          },
          {speakerCount: {not: null}}
        ]
      }
    });

    if (usedCount >= freeSpeakerIdentificationLimit) {
      throw new Error(freeSpeakerIdentificationLimitMessage);
    }
  }

  if (input.tx) return run(input.tx);
  return prisma.$transaction((tx) => run(tx), prismaTransactionOptions);
}

export function estimatedMinutesFromFileSize(fileSizeBytes: number | undefined) {
  if (!fileSizeBytes) return 1;
  // 粗略估算：按压缩音视频常见 12MB/分钟保守预留，避免大文件瞬间超用量。
  return Math.max(1, Math.ceil(fileSizeBytes / (12 * 1024 * 1024)));
}

export function billableMinutesFromDurationSeconds(durationSeconds: number | null | undefined) {
  if (!durationSeconds || durationSeconds <= 0) return undefined;
  return secondsToBillableMinutes(durationSeconds);
}

export function quotaErrorStatus(message: string) {
  return message.includes("额度") || message.includes("订阅") || message.includes("Speaker identification") || message === insufficientFreeMinutesMessage ? 402 : 400;
}
