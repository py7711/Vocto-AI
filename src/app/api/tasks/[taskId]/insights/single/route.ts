import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, publishTaskUpdate, taskAccessErrorResponse} from "@/lib/tasks";
import {generateSingleInsight} from "@/server/ai/single-insight";
import {normalizeSummaryTemplate, summaryTemplateInputValues} from "@/lib/summary-template";

const singleInsightSchema = z.object({
  taskType: z.enum(["summary", "mind_map", "qa"]),
  locale: z.string().default("en"),
  summaryTemplate: z.enum(summaryTemplateInputValues).default("standard"),
  regenerate: z.boolean().default(true)
});

export async function POST(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "write", request.headers);
    const input = singleInsightSchema.parse(await request.json().catch(() => ({})));
    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      include: {transcript: true}
    });

    if (!task?.transcript) {
      return NextResponse.json({error: "转写文本尚未准备好。"}, {status: 409});
    }

    const insight = await generateSingleInsight({
      mediaTaskId: task.id,
      transcript: task.transcript,
      taskType: input.taskType,
      locale: input.locale,
      summaryTemplate: normalizeSummaryTemplate(input.summaryTemplate)
    });
    await publishTaskUpdate(task.id);

    return NextResponse.json(insight);
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法生成洞察。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
