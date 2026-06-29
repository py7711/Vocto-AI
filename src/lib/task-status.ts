import {MediaTaskStatus, Prisma} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import {redisPub} from "@/lib/redis";
import {queueWebhookEvent} from "@/lib/webhook-delivery";

// 该文件专门放“任务状态变更”这类后台 worker 和 Next 路由都需要复用的逻辑。
// 不要在这里导入 getCurrentUser、cookies 或其它带 `server-only` 的请求上下文模块；
// worker 通过 `tsx src/worker/transcribe-worker.ts` 在普通 Node 进程里启动，导入
// Next 专用模块会触发 server-only 包主动抛错，导致 worker 在监听队列前就崩溃。
export async function publishTaskUpdate(taskId: string) {
  const task = await prisma.mediaTask.findUnique({
    where: {id: taskId},
    include: {
      transcript: true,
      insights: true,
      exports: true,
      folder: {select: {id: true, name: true, position: true}},
      ratings: {
        select: {
          rating: true,
          userId: true,
          updatedAt: true
        }
      }
    }
  });

  if (task) {
    // 前端任务详情页通过 Redis Pub/Sub 接收实时进度，所以每次状态变化后都推送完整任务快照。
    await redisPub.publish(`task:${taskId}`, JSON.stringify(task));
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: MediaTaskStatus,
  data: Prisma.MediaTaskUpdateInput = {}
) {
  const task = await prisma.mediaTask.update({
    where: {id: taskId},
    data: {
      ...data,
      status,
      completedAt: status === "COMPLETED" ? new Date() : undefined
    }
  });

  await publishTaskUpdate(taskId);
  // 只有终态需要通知外部系统。处理中、转写中等中间态只推送给站内实时页面即可。
  const event =
    status === "COMPLETED"
      ? "transcription.completed"
      : status === "FAILED"
        ? "transcription.failed"
        : status === "CANCELED"
          ? "transcription.canceled"
          : null;
  if (event) {
    const fullTask = await prisma.mediaTask.findUnique({
      where: {id: taskId},
      include: {transcript: true}
    });
    if (fullTask) {
      // Webhook 发送逻辑内部会按团队和订阅事件过滤；个人任务 teamId 为空时会直接跳过。
      await queueWebhookEvent({teamId: fullTask.teamId, event, task: fullTask});
    }
  }
  return task;
}
