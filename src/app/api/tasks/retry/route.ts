import {NextResponse} from "next/server";
import {z} from "zod";
import {retryTranscriptionTask, taskRetryErrorResponse, type TaskRetryType} from "@/lib/task-retry";
import {taskAccessErrorResponse} from "@/lib/tasks";
import {logApiError} from "@/lib/api-logger";

const retrySchema = z.object({
  taskId: z.string().min(1),
  retryType: z.enum(["standard", "youtube_fallback", "error_retry"]).default("error_retry")
});

export async function POST(request: Request) {
  try {
    const input = retrySchema.parse(await request.json().catch(() => ({})));
    // 兼容旧客户端提交 body.taskId 的接口；error_retry 是历史名称，语义等同普通重试。
    const retryType: TaskRetryType = input.retryType === "youtube_fallback" ? "youtube_fallback" : "standard";
    await retryTranscriptionTask({taskId: input.taskId, headers: request.headers, retryType});
    return NextResponse.json({ok: true});
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const retryError = taskRetryErrorResponse(error);
    if (retryError) return NextResponse.json(retryError.body, {status: retryError.status});
    return NextResponse.json({error: error instanceof Error ? error.message : "无法重试转写。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
