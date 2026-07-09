import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, publishTaskUpdate, taskAccessErrorResponse} from "@/lib/tasks";
import {generateSingleInsight} from "@/server/ai/single-insight";
import {normalizeSummaryTemplate, summaryTemplateInputValues, summaryTemplateRequiresMembership} from "@/lib/summary-template";
import {userHasActiveMembership} from "@/lib/membership";
import {logApiError} from "@/lib/api-logger";

const singleInsightSchema = z.object({
  taskType: z.enum(["summary", "mind_map", "qa"]),
  locale: z.string().default("en"),
  summaryTemplate: z.enum(summaryTemplateInputValues).default("standard"),
  regenerate: z.boolean().default(true)
});

// 免费套餐用户每条转写的摘要累计生成次数上限（含转写完成后自动生成的首份摘要）。
// 首份自动摘要计 1 次，免费用户仅可再手动重新生成 1 次，达到上限后引导升级。
const FREE_SUMMARY_GENERATION_LIMIT = 2;

export async function POST(request: Request, {params}: {params: {taskId: string}}) {
  try {
    const access = await assertTaskAccess(params.taskId, "write", request.headers);
    const input = singleInsightSchema.parse(await request.json().catch(() => ({})));

    // 摘要任务的会员校验：付费会员不受任何限制；免费用户受模板与重新生成次数双重限制。
    if (input.taskType === "summary") {
      const isMember = await userHasActiveMembership(access.user?.id);

      if (!isMember) {
        // 会员专享模板：未开通会员直接引导升级。
        if (summaryTemplateRequiresMembership(input.summaryTemplate)) {
          return NextResponse.json({error: "该摘要模板为会员专享，请先开通会员。", code: "MEMBERSHIP_REQUIRED"}, {status: 403});
        }

        // 免费套餐：校验该转写摘要的累计生成次数是否已达上限。
        const existingSummary = await prisma.aIInsight.findUnique({
          where: {mediaTaskId_type_locale: {mediaTaskId: params.taskId, type: "SUMMARY", locale: input.locale}},
          select: {generationCount: true}
        });
        if ((existingSummary?.generationCount ?? 0) >= FREE_SUMMARY_GENERATION_LIMIT) {
          return NextResponse.json(
            {
              error: "免费套餐每条转写的 AI 摘要生成次数已用完，升级后可无限重新生成。",
              code: "SUMMARY_LIMIT_REACHED",
              limit: FREE_SUMMARY_GENERATION_LIMIT
            },
            {status: 403}
          );
        }
      }
    }

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
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法生成洞察。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
