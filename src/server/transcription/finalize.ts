import {Prisma} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import {normalizeDurationSeconds} from "@/lib/duration";
import {updateTaskStatus} from "@/lib/task-status";
import {settleQuotaForCompletedTask} from "@/lib/usage";
import {generateInsights} from "@/server/ai/insights";
import {normalizeSummaryTemplate, type SummaryTemplateInput} from "@/lib/summary-template";
import type {TranscriptionResult} from "./types";

const SOURCE_ASSET_KEY = (taskId: string) => ({
  mediaTaskId_kind_chunkIndex: {mediaTaskId: taskId, kind: "SOURCE_MEDIA" as const, chunkIndex: -1}
});

// 转写任务上下文：提交异步任务时持久化到 SOURCE_MEDIA.metadata.jobContext，
// 供 webhook 回调端点在没有 BullMQ job.data 的情况下完成收尾。
export type TranscriptionJobContext = {
  provider?: "deepgram" | "assemblyai";
  providerJobId?: string;
  language?: string;
  enableSpeakerLabels: boolean;
  subtitleEnabled?: boolean;
  summaryTemplate?: SummaryTemplateInput;
  summaryLanguage?: string;
  preparedDurationSeconds?: number;
  callbackToken?: string;
};

export async function saveJobContext(taskId: string, context: TranscriptionJobContext) {
  const asset = await prisma.mediaAsset.findUnique({where: SOURCE_ASSET_KEY(taskId), select: {metadata: true}});
  const existing = asset?.metadata && typeof asset.metadata === "object" && !Array.isArray(asset.metadata)
    ? (asset.metadata as Record<string, unknown>)
    : {};
  await prisma.mediaAsset.update({
    where: SOURCE_ASSET_KEY(taskId),
    data: {metadata: {...existing, jobContext: context as unknown} as any}
  });
}

export async function loadJobContext(taskId: string): Promise<TranscriptionJobContext | null> {
  const asset = await prisma.mediaAsset.findUnique({where: SOURCE_ASSET_KEY(taskId), select: {metadata: true}});
  const metadata = asset?.metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const context = (metadata as Record<string, unknown>).jobContext;
  return context ? (context as TranscriptionJobContext) : null;
}

// 统一收尾：写入转写稿、结算额度、按需生成摘要、标记完成。
// 通过状态判断实现幂等，避免回调与轮询重复收尾。
export async function finalizeTranscriptionResult(input: {
  taskId: string;
  result: TranscriptionResult;
  context: TranscriptionJobContext;
}): Promise<boolean> {
  const {taskId, result, context} = input;

  const current = await prisma.mediaTask.findUnique({where: {id: taskId}, select: {status: true}});
  if (!current || current.status === "COMPLETED" || current.status === "CANCELED" || current.status === "FAILED") {
    return false;
  }

  await settleQuotaForCompletedTask({mediaTaskId: taskId, durationSeconds: result.durationSeconds ?? context.preparedDurationSeconds});

  const transcript = await prisma.transcript.upsert({
    where: {mediaTaskId: taskId},
    update: {
      editedText: result.text,
      summary: Prisma.DbNull,
      mindMap: Prisma.DbNull,
      translations: Prisma.DbNull,
      summaryGenerationCount: 0,
      segments: result.segments,
      words: context.subtitleEnabled === false ? undefined : (result.words ?? undefined)
    },
    create: {
      mediaTaskId: taskId,
      editedText: result.text,
      segments: result.segments,
      words: context.subtitleEnabled === false ? undefined : (result.words ?? undefined)
    }
  });

  const normalizedSummaryTemplate = normalizeSummaryTemplate(context.summaryTemplate);
  if (result.insights) {
    await prisma.transcript.update({
      where: {mediaTaskId: taskId},
      data: {
        summary: normalizedSummaryTemplate === "none" ? Prisma.DbNull : result.insights.summary as any,
        mindMap: result.insights.mindMap as any,
        summaryGenerationCount: normalizedSummaryTemplate === "none" ? 0 : 1
      }
    });
  } else if (normalizedSummaryTemplate !== "none") {
    await updateTaskStatus(taskId, "ANALYZING", {
      progress: 82,
      statusMessage: "转写完成，正在生成 AI 摘要和思维导图。"
    });
    await generateInsights(taskId, transcript, context.summaryLanguage || context.language || "en", undefined, normalizedSummaryTemplate);
  }

  await updateTaskStatus(taskId, "COMPLETED", {
    progress: 100,
    statusMessage: normalizedSummaryTemplate === "none" ? "The transcription is ready." : "Transcripts, AI summaries and mind maps are ready.",
    provider: result.provider,
    detectedLanguage: result.language,
    durationSeconds: normalizeDurationSeconds(result.durationSeconds) ?? normalizeDurationSeconds(context.preparedDurationSeconds),
    speakerCount: result.speakerCount
  });

  return true;
}
