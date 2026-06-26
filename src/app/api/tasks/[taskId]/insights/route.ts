import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {generateInsights} from "@/server/ai/insights";
import {assertTaskAccess, publishTaskUpdate, taskAccessErrorResponse} from "@/lib/tasks";

const insightSchema = z.object({
  locale: z.string().default("en"),
  translationTarget: z.string().optional()
});

export async function POST(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "write", request.headers);
    const input = insightSchema.parse(await request.json().catch(() => ({})));
    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      include: {transcript: true}
    });

    if (!task?.transcript) {
      return NextResponse.json({error: "Transcript is not ready"}, {status: 409});
    }

    const insights = await generateInsights(task.id, task.transcript, input.locale, input.translationTarget);
    await publishTaskUpdate(task.id);

    return NextResponse.json(insights);
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法生成 AI 洞察。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
