import {MediaTaskStatus, Prisma} from "@prisma/client";
import {getCurrentUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {redisPub} from "@/lib/redis";
import {authenticateApiKey, ensureDefaultTeam} from "@/lib/teams";

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

export class TaskAccessError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function assertTaskAccess(taskId: string, mode: "read" | "write" = "read", headers?: Headers) {
  const user = await getCurrentUser();
  const apiCredential = user ? null : headers ? await authenticateApiKey(headers) : null;
  const task = await prisma.mediaTask.findUnique({
    where: {id: taskId},
    select: {id: true, userId: true, teamId: true}
  });

  if (!task) {
    throw new TaskAccessError("未找到转写任务。", 404);
  }

  if (apiCredential) {
    if (task.teamId !== apiCredential.team.id) {
      throw new TaskAccessError("API Key 无权访问该团队任务。", 403);
    }
    return {task, user: null, apiCredential};
  }

  if (!task.userId && !task.teamId) {
    if (mode === "write" && !user) {
      throw new TaskAccessError("请先登录后再修改转写任务。", 401);
    }
    return {task, user, apiCredential: null};
  }

  if (!user) {
    throw new TaskAccessError("请先登录后再修改转写任务。", 401);
  }

  if (task.teamId) {
    const membership = await prisma.teamMember.findFirst({
      where: {teamId: task.teamId, userId: user.id, status: "ACTIVE"},
      select: {role: true}
    });
    if (!membership) {
      throw new TaskAccessError("无权访问该团队转写任务。", 403);
    }
    if (mode === "write" && membership.role === "VIEWER") {
      throw new TaskAccessError("只读成员不能修改转写任务。", 403);
    }
    return {task, user, apiCredential: null};
  }

  if (task.userId && task.userId !== user.id) {
    throw new TaskAccessError("无权访问该转写任务。", 403);
  }

  return {task, user, apiCredential: null};
}

export async function resolveTaskTeamForUser(user: {id: string; email: string; name?: string | null; locale?: string | null} | null) {
  if (!user) return null;
  return ensureDefaultTeam(user);
}

export function taskAccessErrorResponse(error: unknown) {
  if (error instanceof TaskAccessError) {
    return {body: {error: error.message}, status: error.status};
  }
  return null;
}
