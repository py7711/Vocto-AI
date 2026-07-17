import {Prisma} from "@prisma/client";
import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";
import {generateSingleInsight} from "@/server/ai/single-insight";
import {normalizeSummaryTemplate, summaryTemplateInputValues, summaryTemplateRequiresMembership} from "@/lib/summary-template";
import {userHasActiveMembership} from "@/lib/membership";
import {logApiError} from "@/lib/api-logger";
import {FREE_SUMMARY_GENERATION_LIMIT, releaseSummaryGeneration, reserveSummaryGeneration} from "@/server/ai/summary-generation-limit";

const singleInsightSchema = z.object({
  taskType: z.enum(["summary", "mind_map"]),
  locale: z.string().default("en"),
  summaryTemplate: z.enum(summaryTemplateInputValues).default("standard"),
  regenerate: z.boolean().default(true)
});

export async function POST(request: Request, {params}: {params: {taskId: string}}) {
  let summaryGenerationReserved = false;
  try {
    const access = await assertTaskAccess(params.taskId, "write", request.headers);
    const input = singleInsightSchema.parse(await request.json().catch(() => ({})));

    if (input.taskType === "summary" && input.summaryTemplate === "none" && !input.regenerate) {
      await prisma.transcript.update({where: {mediaTaskId: params.taskId}, data: {summary: Prisma.DbNull}});
      return NextResponse.json({cleared: true});
    }

    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      include: {transcript: true}
    });

    if (!task?.transcript) {
      return NextResponse.json({error: "转写文本尚未准备好。"}, {status: 409});
    }

    if (input.taskType === "summary") {
      const isMember = await userHasActiveMembership(access.user?.id);

      if (!isMember) {
        // 会员专享模板：未开通会员直接引导升级。
        if (summaryTemplateRequiresMembership(input.summaryTemplate)) {
          return NextResponse.json({error: "该摘要模板为会员专享，请先开通会员。", code: "MEMBERSHIP_REQUIRED"}, {status: 403});
        }
      }
      if (input.summaryTemplate !== "none") {
        summaryGenerationReserved = await reserveSummaryGeneration(task.id, isMember);
        if (!summaryGenerationReserved) {
          return NextResponse.json({
            error: "免费套餐每条转写的 AI 摘要生成次数已用完，升级后可无限重新生成。",
            code: "SUMMARY_LIMIT_REACHED",
            limit: FREE_SUMMARY_GENERATION_LIMIT
          }, {status: 403});
        }
      }
    }

    const insight = await generateSingleInsight({
      mediaTaskId: task.id,
      transcript: task.transcript,
      taskType: input.taskType,
      locale: input.locale,
      summaryTemplate: normalizeSummaryTemplate(input.summaryTemplate)
    });
    summaryGenerationReserved = false;
    return NextResponse.json(insight);
  } catch (error) {
    if (summaryGenerationReserved) {
      await releaseSummaryGeneration(params.taskId).catch(() => undefined);
    }
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法生成洞察。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
