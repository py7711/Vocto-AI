import "server-only";

import {Prisma} from "@prisma/client";
import {prisma} from "@/lib/prisma";

export const freeDailyFileLimit = 3;

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
  return prisma.$transaction((tx) => run(tx));
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
  });
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
  });
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
  return prisma.$transaction((tx) => run(tx));
}

export function estimatedMinutesFromFileSize(fileSizeBytes: number | undefined) {
  if (!fileSizeBytes) return 1;
  // 粗略估算：按压缩音视频常见 12MB/分钟保守预留，避免大文件瞬间超用量。
  return Math.max(1, Math.ceil(fileSizeBytes / (12 * 1024 * 1024)));
}

export function quotaErrorStatus(message: string) {
  return message.includes("额度") || message.includes("订阅") ? 402 : 400;
}

export type UsageTransaction = Prisma.TransactionClient;
