import {prisma} from "@/lib/prisma";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";
import {openApiError, openApiTaskResponse} from "@/lib/openapi";
import {logApiError} from "@/lib/api-logger";

export async function GET(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "read", request.headers);
    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      include: {
        transcript: true,
        insights: true,
        exports: true
      }
    });

    if (!task) return openApiError("NOT_FOUND", "未找到转写任务。", 404);
    return openApiTaskResponse(task);
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return openApiError("ACCESS_DENIED", accessError.body.error, accessError.status);
    return openApiError("READ_TRANSCRIPTION_FAILED", error instanceof Error ? error.message : "无法读取转写任务。");
  }
}
