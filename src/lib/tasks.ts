import {getCurrentUserIdentity} from "@/lib/auth";
import {authenticateApiKey} from "@/lib/developer-settings";
import {prisma} from "@/lib/prisma";
export {publishTaskUpdate, updateTaskStatus} from "@/lib/task-status";

export function anonymousUserId(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip");
  return forwardedFor || realIp || "local";
}

class TaskAccessError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function assertTaskAccess(taskId: string, mode: "read" | "write" = "read", headers?: Headers) {
  const hasApiKey = Boolean(headers?.get("x-api-key") || headers?.get("authorization")?.match(/^Bearer\s+/i));
  const [user, apiAccess, task] = await Promise.all([
    getCurrentUserIdentity(),
    headers && hasApiKey ? authenticateApiKey(new Request("http://local", {headers})) : null,
    prisma.mediaTask.findUnique({
      where: {id: taskId},
      select: {id: true, userId: true, teamId: true}
    })
  ]);

  if (!task) {
    throw new TaskAccessError("转写任务不存在。", 404);
  }

  if (!task.userId && !task.teamId) {
    if (mode === "write" && !user) {
      throw new TaskAccessError("请先登录后再编辑此转写。", 401);
    }
    return {task, user};
  }

  if (task.teamId) {
    if (apiAccess?.team.id === task.teamId) {
      return {task, user: apiAccess.user, apiKey: apiAccess.apiKey, team: apiAccess.team};
    }
    if (!user) {
      throw new TaskAccessError("请先登录后再编辑此转写。", 401);
    }

    // 仅兼容旧测试库中已经存在的历史团队任务；个人版不会再创建团队任务。
    const membership = await prisma.teamMember.findFirst({
      where: {teamId: task.teamId, userId: user.id, status: "ACTIVE"},
      select: {role: true}
    });
    if (!membership) {
      throw new TaskAccessError("你无权访问此转写。", 403);
    }
    if (mode === "write" && membership.role === "VIEWER") {
      throw new TaskAccessError("当前账号不能编辑此转写。", 403);
    }
    return {task, user};
  }

  if (!user) {
    throw new TaskAccessError("请先登录后再编辑此转写。", 401);
  }

  if (task.userId && task.userId !== user.id) {
    throw new TaskAccessError("你无权访问此转写。", 403);
  }

  return {task, user};
}

export function taskAccessErrorResponse(error: unknown) {
  if (error instanceof TaskAccessError) {
    return {body: {error: error.message}, status: error.status};
  }
  return null;
}
