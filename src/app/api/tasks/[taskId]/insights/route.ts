import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {generateInsights} from "@/server/ai/insights";
import {assertTaskAccess, publishTaskUpdate, taskAccessErrorResponse} from "@/lib/tasks";
import {normalizeSummaryTemplate, summaryTemplateInputValues, summaryTemplateRequiresMembership} from "@/lib/summary-template";
import {userHasActiveMembership} from "@/lib/membership";

const insightSchema = z.object({
  locale: z.string().default("en"),
  translationTarget: z.string().optional(),
  summaryTemplate: z.enum(summaryTemplateInputValues).default("standard")
});

export async function POST(request: Request, {params}: {params: {taskId: string}}) {
  try {
    const access = await assertTaskAccess(params.taskId, "write", request.headers);
    const input = insightSchema.parse(await request.json().catch(() => ({})));

    // 会员专享模板必须验证当前用户拥有生效的付费会员。
    if (summaryTemplateRequiresMembership(input.summaryTemplate)) {
      const isMember = await userHasActiveMembership(access.user?.id);
      if (!isMember) {
        return NextResponse.json({error: "该摘要模板为会员专享，请先开通会员。", code: "MEMBERSHIP_REQUIRED"}, {status: 403});
      }
    }

    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      include: {transcript: true}
    });

    if (!task?.transcript) {
      return NextResponse.json({error: "转写文本尚未准备好。"}, {status: 409});
    }

    const insights = await generateInsights(task.id, task.transcript, input.locale, input.translationTarget, normalizeSummaryTemplate(input.summaryTemplate));
    await publishTaskUpdate(task.id);

    return NextResponse.json(insights);
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法生成 AI 洞察。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
