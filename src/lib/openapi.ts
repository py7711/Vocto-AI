import "server-only";

import {z} from "zod";
import {authenticateApiKey, apiUnauthorizedResponse, createDeveloperSecret} from "@/lib/developer-settings";
import {getTranscribeQueue, type TranscribeJob} from "@/lib/queue";
import {assertRateLimit} from "@/lib/rate-limit";
import {prisma} from "@/lib/prisma";
import {publicObjectUrl} from "@/lib/storage";
import {estimatedMinutesFromFileSize, quotaErrorStatus, reserveQuotaForTask} from "@/lib/usage";
import {serializeTranscription} from "@/lib/webhook-delivery";

// OpenAPI 入参采用 snake_case，和前端工作台的 camelCase 任务接口分开维护。
// 这样可以保持外部 API 稳定，同时让内部页面继续使用更贴近 React/TypeScript 的字段名。
export const openApiCreateSchema = z.object({
  file_key: z.string().min(1).optional(),
  file_url: z.string().url().optional(),
  url: z.string().url().optional(),
  youtube_url: z.string().url().optional(),
  source_url: z.string().url().optional(),
  original_name: z.string().max(512).optional(),
  language: z.string().default("auto"),
  speaker_labels: z.boolean().default(true),
  enable_speaker_labels: z.boolean().optional(),
  subtitle: z.boolean().default(true),
  premium_model: z.boolean().default(false),
  summary_template: z.enum(["none", "standard", "meeting", "study", "interview"]).default("standard"),
  summary_language: z.string().default("en"),
  file_size_bytes: z.number().int().positive().optional(),
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
    const enableSpeakerLabels = input.enable_speaker_labels ?? input.speaker_labels;

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
          originalName: input.original_name ?? input.file_key,
          language: input.language,
          fileSizeBytes: input.file_size_bytes,
          status: "QUEUED",
          statusMessage: "任务已进入队列。",
          progress: 5
        }
      });

      await reserveQuotaForTask({
        userId: user.id,
        mediaTaskId: created.id,
        estimatedMinutes: estimatedMinutesFromFileSize(input.file_size_bytes),
        tx
      });

      return created;
    });

    await getTranscribeQueue().add("transcribe" as never, {
      taskId: task.id,
      sourceType,
      sourceUrl,
      language: input.language,
      enableSpeakerLabels,
      subtitleEnabled: input.subtitle,
      premiumModel: input.premium_model,
      summaryTemplate: input.summary_template,
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
