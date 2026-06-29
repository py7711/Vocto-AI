import {prisma} from "@/lib/prisma";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";
import {openApiError} from "@/lib/openapi";

export async function GET(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "read", request.headers);
    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      select: {
        id: true,
        status: true,
        progress: true,
        statusMessage: true,
        errorCode: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true
      }
    });

    if (!task) return openApiError("NOT_FOUND", "未找到转写任务。", 404);
    return Response.json({
      success: true,
      data: {
        id: task.id,
        status: task.status.toLowerCase(),
        progress: task.progress,
        status_message: task.statusMessage,
        error_code: task.errorCode,
        created_at: task.createdAt.toISOString(),
        updated_at: task.updatedAt.toISOString(),
        completed_at: task.completedAt?.toISOString() ?? null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return openApiError("ACCESS_DENIED", accessError.body.error, accessError.status);
    return openApiError("READ_STATUS_FAILED", error instanceof Error ? error.message : "无法读取转写状态。");
  }
}
