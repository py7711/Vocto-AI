import {NextResponse} from "next/server";
import {z} from "zod";
import {POST as createTaskTranslation} from "@/app/api/tasks/[taskId]/translations/route";

const sourceTranslationSchema = z.object({
  transcriptionFileId: z.string().optional(),
  fileId: z.string().optional(),
  taskId: z.string().optional(),
  targetLanguageCode: z.string().trim().min(2).max(16),
  sourceLanguageCode: z.string().trim().max(16).optional()
}).passthrough();

export async function POST(request: Request) {
  try {
    // 兼容旧翻译任务入口：旧请求体传 transcriptionFileId 和 targetLanguageCode，
    // 当前任务翻译接口挂在 /api/tasks/[taskId]/translations。
    const input = sourceTranslationSchema.parse(await request.json().catch(() => ({})));
    const taskId = input.transcriptionFileId ?? input.fileId ?? input.taskId;
    if (!taskId) {
      return NextResponse.json({error: "请提供 transcriptionFileId。"}, {status: 422});
    }

    const forwarded = new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify({
        targetLanguageCode: input.targetLanguageCode,
        sourceLanguageCode: input.sourceLanguageCode
      })
    });

    return createTaskTranslation(forwarded, {params: {taskId}});
  } catch (error) {
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "无法创建翻译任务。"},
      {status: error instanceof z.ZodError ? 422 : 400}
    );
  }
}
