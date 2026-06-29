import {NextResponse} from "next/server";
import {z} from "zod";
import {retryTranscriptionTask, taskRetryErrorResponse} from "@/lib/task-retry";
import {taskAccessErrorResponse} from "@/lib/tasks";

const retrySchema = z.object({
  retryType: z.enum(["standard", "youtube_fallback"]).default("standard")
});

export async function POST(request: Request, {params}: {params: {taskId: string}}) {
  try {
    const input = retrySchema.parse(await request.json().catch(() => ({})));
    // 保留路径参数版接口，前端详情页和工作台都依赖 /api/tasks/:taskId/retry。
    await retryTranscriptionTask({taskId: params.taskId, headers: request.headers, retryType: input.retryType});
    return NextResponse.json({ok: true});
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const retryError = taskRetryErrorResponse(error);
    if (retryError) return NextResponse.json(retryError.body, {status: retryError.status});
    const message = error instanceof Error ? error.message : "无法重试转写。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
