import {NextResponse} from "next/server";
import {z} from "zod";
import {retryTranscriptionTask, taskRetryErrorResponse} from "@/lib/task-retry";
import {taskAccessErrorResponse} from "@/lib/tasks";
import {logApiError} from "@/lib/api-logger";

const retrySchema = z.object({retryType: z.literal("standard").default("standard")});

export async function POST(request: Request, {params}: {params: {taskId: string}}) {
  try {
    retrySchema.parse(await request.json().catch(() => ({})));
    // 保留路径参数版接口，前端详情页和工作台都依赖 /api/tasks/:taskId/retry。
    await retryTranscriptionTask({taskId: params.taskId, headers: request.headers});
    return NextResponse.json({ok: true});
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const retryError = taskRetryErrorResponse(error);
    if (retryError) return NextResponse.json(retryError.body, {status: retryError.status});
    const message = error instanceof Error ? error.message : "无法重试转写。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
