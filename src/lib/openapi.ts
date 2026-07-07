import "server-only";

import {z} from "zod";
import {authenticateApiKey, apiUnauthorizedResponse, createDeveloperSecret} from "@/lib/developer-settings";
import {enqueueTranscribeJob, type TranscribeJob} from "@/lib/queue";
import {assertRateLimit} from "@/lib/rate-limit";
import {prisma} from "@/lib/prisma";
import {publicObjectUrl} from "@/lib/storage";
import {normalizeDurationSeconds} from "@/lib/duration";
import {assertFreeMinutesCanCoverDuration, assertFreeSpeakerIdentificationQuota, billableMinutesFromDurationSeconds, estimatedMinutesFromFileSize, quotaErrorStatus, reserveQuotaForTask} from "@/lib/usage";
import {serializeTranscription} from "@/lib/webhook-delivery";
import {normalizeSummaryTemplate, summaryTemplateInputValues} from "@/lib/summary-template";

// OpenAPI 入参采用 snake_case，和前端工作台的 camelCase 任务接口分开维护。
// 这样可以保持外部 API 稳定，同时让内部页面继续使用更贴近 React/TypeScript 的字段名。
export const openApiCreateSchema = z.object({
  file_key: z.string().min(1).optional(),
  file_url: z.string().url().optional(),
  url: z.string().url().optional(),
  youtube_url: z.string().url().optional(),
  source_url: z.string().url().optional(),
  original_name: z.string().max(512).optional(),
  filename: z.string().max(512).optional(),
  file_name: z.string().max(512).optional(),
  language: z.string().default("auto"),
  language_code: z.string().optional(),
  speaker_labels: z.boolean().default(true),
  enable_speaker_labels: z.boolean().optional(),
  enable_speaker_diarization: z.boolean().optional(),
  subtitle: z.boolean().default(true),
  transcription_type: z.string().optional(),
  premium_model: z.boolean().default(false),
  summary_template: z.enum(summaryTemplateInputValues).default("standard"),
  summary_language: z.string().default("en"),
  file_size_bytes: z.number().int().positive().optional(),
  duration_seconds: z.number().positive().optional(),
  webhook_url: z.string().url().optional()
}).refine((input) => Boolean(input.file_key || input.file_url || input.url || input.youtube_url || input.source_url), {
  message: "请提供 file_key、file_url、url、source_url 或 youtube_url。"
});

export function openApiError(code: string, message: string, status = 400) {
  // 公开 API 固定返回 success/error/timestamp，便于外部服务按稳定结构处理失败。
  return Response.json({
    success: false,
    error: {code, message},
    timestamp: new Date().toISOString()
  }, {status});
}

export function openApiTaskResponse(task: Parameters<typeof serializeTranscription>[0], status = 200) {
  // 所有 v1 转写响应都通过 webhook 序列化器输出，保证轮询和 webhook 字段一致。
  return Response.json({
    success: true,
    data: serializeTranscription(task),
    timestamp: new Date().toISOString()
  }, {status});
}

export async function requireOpenApiAccess(request: Request) {
  const access = await authenticateApiKey(request);
  if (!access?.user) return null;
  return access;
}

export async function createOpenApiTranscription(request: Request, forceSource?: TranscribeJob["sourceType"]) {
  try {
    const access = await requireOpenApiAccess(request);
    if (!access) return apiUnauthorizedResponse();
    const user = access.user;
    if (!user) return apiUnauthorizedResponse();
    await assertRateLimit(`api:${access.apiKey.id}`, 120, 60 * 60);

    const input = openApiCreateSchema.parse(await request.json());
    const sourceUrl = input.youtube_url || input.source_url || input.file_url || input.url || (input.file_key ? publicObjectUrl(input.file_key) : "");
    const sourceType: TranscribeJob["sourceType"] = forceSource ?? (input.youtube_url ? "YOUTUBE" : "UPLOAD");
    const language = input.language_code ?? input.language;
    const originalName = input.original_name ?? input.filename ?? input.file_name ?? input.file_key;
    const enableSpeakerLabels = input.enable_speaker_labels ?? input.enable_speaker_diarization ?? input.speaker_labels;
    const subtitleEnabled = input.transcription_type === "subtitle" ? true : input.subtitle;

    // API Key、一次性 webhook、任务创建和额度预留需要在同一事务内完成，
    // 避免外部调用成功返回后出现没有回调端点或没有扣减额度的半成品任务。
    const task = await prisma.$transaction(async (tx) => {
      if (input.webhook_url) {
        const secret = createDeveloperSecret("whsec");
        await tx.webhookEndpoint.create({
          data: {
            teamId: access.team.id,
            name: "公开 API 转写回调",
            url: input.webhook_url,
            events: ["transcription.completed", "transcription.failed", "transcription.canceled"],
            secretHash: secret.hash,
            secretPrefix: secret.prefix,
            createdById: user.id
          }
        });
      }

      const created = await tx.mediaTask.create({
        data: {
          userId: user.id,
          teamId: access.team.id,
          sourceType: sourceType === "GOOGLE_DRIVE" ? "UPLOAD" : sourceType,
          sourceUrl,
          objectKey: input.file_key,
          originalName,
          language,
          durationSeconds: normalizeDurationSeconds(input.duration_seconds),
          fileSizeBytes: input.file_size_bytes,
          status: "QUEUED",
          statusMessage: "任务已进入队列。",
          progress: 5
        }
      });

      if (enableSpeakerLabels) {
        await assertFreeSpeakerIdentificationQuota({userId: user.id, tx});
      }
      await assertFreeMinutesCanCoverDuration({userId: user.id, durationSeconds: input.duration_seconds, tx});

      await tx.mediaAsset.create({
        data: {
          mediaTaskId: created.id,
          kind: "SOURCE_MEDIA",
          chunkIndex: -1,
          url: sourceUrl,
          objectKey: input.file_key,
          fileName: originalName,
          sizeBytes: input.file_size_bytes,
          durationSeconds: normalizeDurationSeconds(input.duration_seconds),
          metadata: {sourceType, speakerLabelsRequested: enableSpeakerLabels}
        }
      });

      await reserveQuotaForTask({
        userId: user.id,
        mediaTaskId: created.id,
        estimatedMinutes: billableMinutesFromDurationSeconds(input.duration_seconds) ?? estimatedMinutesFromFileSize(input.file_size_bytes),
        tx
      });

      return created;
    });

    await enqueueTranscribeJob({
      taskId: task.id,
      sourceType,
      sourceUrl,
      language,
      enableSpeakerLabels,
      subtitleEnabled,
      premiumModel: input.premium_model,
      summaryTemplate: normalizeSummaryTemplate(input.summary_template),
      summaryLanguage: input.summary_language
    });

    const fullTask = await prisma.mediaTask.findUnique({
      where: {id: task.id},
      include: {transcript: true}
    });
    return openApiTaskResponse(fullTask ?? {...task, transcript: null}, 201);
  } catch (error) {
    const status = error instanceof z.ZodError ? 422 : error instanceof Error ? quotaErrorStatus(error.message) : 400;
    return openApiError(
      error instanceof z.ZodError ? "VALIDATION_ERROR" : "CREATE_TRANSCRIPTION_FAILED",
      error instanceof Error ? error.message : "无法创建转写。",
      status
    );
  }
}
