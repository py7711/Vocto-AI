import {MediaTaskStatus, Prisma} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import {redisPub} from "@/lib/redis";

export async function publishTaskUpdate(taskId: string) {
  const task = await prisma.mediaTask.findUnique({
    where: {id: taskId},
    include: {
      transcript: true,
      insights: true,
      exports: true
    }
  });

  if (task) {
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
  return task;
}

export function anonymousUserId(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip");
  return forwardedFor || realIp || "local";
}
