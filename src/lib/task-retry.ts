import "server-only";

import {enqueueTranscribeJob} from "@/lib/queue";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, publishTaskUpdate} from "@/lib/tasks";
import {reserveQuotaForTask} from "@/lib/usage";

// 两个重试入口保留不同请求合同：新版用路径参数，旧版用 body.taskId。
// 实际排队逻辑集中在这里，避免状态校验、额度补扣和队列参数在多个路由里漂移。
class TaskRetryError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function taskRetryErrorResponse(error: unknown) {
  if (error instanceof TaskRetryError) {
    return {body: {error: error.message}, status: error.status};
  }
  return null;
}

export async function retryTranscriptionTask({
  taskId,
  headers,
}: {
  taskId: string;
  headers: Headers;
}) {
  await assertTaskAccess(taskId, "write", headers);
  const task = await prisma.mediaTask.findUnique({
    where: {id: taskId},
    select: {
      id: true,
      userId: true,
      sourceType: true,
      sourceUrl: true,
      language: true,
      quotaMinutes: true,
      status: true
    }
  });

  if (!task) throw new TaskRetryError("转写任务不存在。", 404);
  if (!["FAILED", "CANCELED"].includes(task.status)) {
    throw new TaskRetryError("只有失败或已取消的转写可以重试。", 409);
  }

  // 早期任务可能没有记录 quotaMinutes；重新入队前补扣最小额度，避免绕过用量账本。
  if (task.userId && task.quotaMinutes <= 0) {
    await reserveQuotaForTask({
      userId: task.userId,
      mediaTaskId: task.id,
      estimatedMinutes: 1
    });
  }

  await prisma.mediaTask.update({
    where: {id: task.id},
    data: {
      status: "QUEUED",
      progress: 5,
      statusMessage: "重试任务已进入队列。",
      errorCode: null,
      completedAt: null
    }
  });

  await enqueueTranscribeJob({
    taskId: task.id,
    sourceType: task.sourceType,
    sourceUrl: task.sourceUrl,
    language: task.language ?? "auto",
    enableSpeakerLabels: true,
    subtitleEnabled: true,
    premiumModel: false,
    summaryTemplate: "standard",
    summaryLanguage: "en"
  });
  await publishTaskUpdate(task.id);

  return {ok: true};
}
