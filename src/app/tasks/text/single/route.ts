import {NextResponse} from "next/server";
import {z} from "zod";
import {POST as createSingleInsight} from "@/app/api/tasks/[taskId]/insights/single/route";

const sourceSingleTextSchema = z.object({
  transcriptionFileId: z.string().optional(),
  fileId: z.string().optional(),
  taskId: z.string().optional(),
  taskType: z.enum(["summary", "mind_map", "qa"]),
  locale: z.string().optional(),
  summaryLanguageCode: z.string().optional(),
  summaryTemplate: z.enum(["none", "standard", "meeting", "study", "interview", "course_lecture", "podcast"]).optional(),
  regenerate: z.boolean().optional()
}).passthrough();

function normalizeSummaryTemplate(value: string | undefined) {
  if (value === "course_lecture") return "study";
  if (value === "podcast") return "standard";
  return value;
}

export async function POST(request: Request) {
  try {
    // 旧客户端把单项 AI 后处理称为 text task，并使用 transcriptionFileId/fileId 字段。
    // 当前实现按 taskId 路由生成单个 insight，这里负责把旧字段映射过去。
    const input = sourceSingleTextSchema.parse(await request.json().catch(() => ({})));
    const taskId = input.transcriptionFileId ?? input.fileId ?? input.taskId;
    if (!taskId) {
      return NextResponse.json({error: "请提供 transcriptionFileId。"}, {status: 422});
    }

    const forwarded = new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify({
        taskType: input.taskType,
        locale: input.locale ?? input.summaryLanguageCode ?? "en",
        summaryTemplate: normalizeSummaryTemplate(input.summaryTemplate) ?? "standard",
        regenerate: input.regenerate ?? true
      })
    });

    return createSingleInsight(forwarded, {params: {taskId}});
  } catch (error) {
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "无法创建单项 AI 后处理任务。"},
      {status: error instanceof z.ZodError ? 422 : 400}
    );
  }
}
