import "server-only";

import {z} from "zod";
import type {MediaTask, Prisma, Transcript} from "@prisma/client";
import {getCurrentUser} from "@/lib/auth";
import {getTranscribeQueue, type TranscribeJob} from "@/lib/queue";
import {assertRateLimit} from "@/lib/rate-limit";
import {prisma} from "@/lib/prisma";
import {anonymousUserId} from "@/lib/tasks";
import {assertAndUpdateFreeDailyQuota, estimatedMinutesFromFileSize, releaseQuotaForFailedTask, reserveQuotaForTask} from "@/lib/usage";
import {normalizeSummaryTemplate, summaryTemplateInputValues} from "@/lib/summary-template";

// 兼容旧版/外部客户端的转写字段。工作台内部使用 `/api/tasks`，但历史页面、公开工具
// 和部分第三方集成会提交 fileId、sourceUrl、languageCode 等旧字段名，所以这里集中做入参归一化。
export const sourceCreateTaskSchema = z.object({
  transcriptionFileId: z.string().optional(),
  fileId: z.string().optional(),
  fileUrl: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
  url: z.string().url().optional(),
  title: z.string().max(512).optional(),
  filename: z.string().max(512).optional(),
  originalName: z.string().max(512).optional(),
  folderId: z.string().nullable().optional(),
  languageCode: z.string().default("auto"),
  language: z.string().optional(),
  transcriptionType: z.string().optional(),
  enableSpeakerDiarization: z.boolean().default(true),
  enableSpeakerLabels: z.boolean().optional(),
  subtitleEnabled: z.boolean().default(true),
  premiumModel: z.boolean().default(false),
  summaryTemplate: z.enum(summaryTemplateInputValues).default("standard"),
  summaryLanguageCode: z.string().default("en"),
  summaryLanguage: z.string().optional(),
  fileSizeBytes: z.number().int().positive().optional(),
  duration: z.number().positive().optional()
}).passthrough();

type CompatTaskPayload = z.infer<typeof sourceCreateTaskSchema>;

type TaskWithRelations = MediaTask & {
  transcript?: Transcript | null;
  insights?: Array<{type: string; content: Prisma.JsonValue; createdAt: Date; updatedAt: Date}>;
  folder?: {id: string; name: string; position: number} | null;
  shareLinks?: Array<{id: string; createdAt: Date}>;
};

export function serializeCompatTask(task: TaskWithRelations) {
  // 兼容响应保留 transcriptionFileId、fileId、filename 等旧字段，避免旧客户端升级时出现破坏性变更。
  return {
    ...task,
    transcriptionFileId: task.id,
    fileId: task.id,
    filename: task.originalName,
    languageCode: task.language,
    duration: task.durationSeconds,
    transcriptionType: task.sourceType === "YOUTUBE" ? "transcript" : "file",
    hasTranscript: Boolean(task.transcript),
    share: task.shareLinks?.[0] ?? null
  };
}

function resolveSourceUrl(input: CompatTaskPayload, sourceType: TranscribeJob["sourceType"]) {
  const key = input.transcriptionFileId ?? input.fileId;
  if (input.url) return input.url;
  if (input.sourceUrl) return input.sourceUrl;
  if (input.fileUrl) return input.fileUrl;
  if (key?.startsWith("http://") || key?.startsWith("https://")) return key;
  if (key) return `r2://uniscribe-media/${key}`;
  if (sourceType === "YOUTUBE") throw new Error("请提供 YouTube 链接。");
  throw new Error("请提供媒体链接或已上传文件 ID。");
}

export async function createCompatTask(request: Request, sourceType: TranscribeJob["sourceType"]) {
  const input = sourceCreateTaskSchema.parse(await request.json().catch(() => ({})));
  const user = await getCurrentUser();
  const quotaUserId = user?.id;
  await assertRateLimit(quotaUserId ?? anonymousUserId(request.headers), 20, 60 * 60);

  const sourceUrl = resolveSourceUrl(input, sourceType);
  const language = input.language ?? input.languageCode ?? "auto";
  const enableSpeakerLabels = input.enableSpeakerLabels ?? input.enableSpeakerDiarization;
  const summaryTemplate = normalizeSummaryTemplate(input.summaryTemplate);
  const summaryLanguage = input.summaryLanguage ?? input.summaryLanguageCode ?? "en";

  // 兼容入口也必须沿用正式任务创建的额度事务：先校验免费次数和订阅分钟，再创建任务并预留额度。
  const task = await prisma.$transaction(async (tx) => {
    if (quotaUserId) {
      await assertAndUpdateFreeDailyQuota({userId: quotaUserId, tx});
    }

    if (quotaUserId && input.folderId) {
      const folder = await tx.folder.findFirst({
        where: {id: input.folderId, userId: quotaUserId},
        select: {id: true}
      });
        if (!folder) throw new Error("文件夹不存在或无权访问。");
    }

    const created = await tx.mediaTask.create({
      data: {
        userId: user?.id,
        folderId: quotaUserId ? input.folderId ?? undefined : undefined,
        sourceType: sourceType === "GOOGLE_DRIVE" ? "UPLOAD" : sourceType,
        sourceUrl,
        objectKey: input.transcriptionFileId ?? input.fileId,
        originalName: input.originalName ?? input.filename ?? input.title ?? input.transcriptionFileId ?? input.fileId,
        language,
        fileSizeBytes: input.fileSizeBytes,
        durationSeconds: input.duration ? Math.round(input.duration) : undefined,
        status: "QUEUED",
        statusMessage: "任务已进入队列。",
        progress: 5
      }
    });

    await tx.mediaAsset.create({
      data: {
        mediaTaskId: created.id,
        kind: "SOURCE_MEDIA",
        chunkIndex: -1,
        url: sourceUrl,
        objectKey: input.transcriptionFileId ?? input.fileId,
        fileName: input.originalName ?? input.filename ?? input.title,
        sizeBytes: input.fileSizeBytes,
        durationSeconds: input.duration ? Math.round(input.duration) : undefined,
        metadata: {sourceType}
      }
    });

    if (quotaUserId) {
      await reserveQuotaForTask({
        userId: quotaUserId,
        mediaTaskId: created.id,
        estimatedMinutes: estimatedMinutesFromFileSize(input.fileSizeBytes),
        tx
      });
    }

    return created;
  });

  try {
    await getTranscribeQueue().add("transcribe" as never, {
      taskId: task.id,
      sourceType,
      sourceUrl,
      language,
      enableSpeakerLabels,
      subtitleEnabled: input.subtitleEnabled,
      premiumModel: input.premiumModel,
      summaryTemplate,
      summaryLanguage
    });
  } catch (error) {
    await releaseQuotaForFailedTask(task.id);
    await prisma.mediaTask.update({
      where: {id: task.id},
      data: {status: "FAILED", progress: 100, statusMessage: "队列服务不可用。", errorCode: "QUEUE_UNAVAILABLE"}
    });
    throw error;
  }

  return task;
}

export async function listCompatTasks(request: Request) {
  const user = await getCurrentUser();
  if (!user) return {items: [], total: 0, page: 1, pageSize: 30};
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || url.searchParams.get("limit") || 30)));
  const folder = url.searchParams.get("folder") ?? url.searchParams.get("folderId");
  const keyword = url.searchParams.get("keyword")?.trim();
  const where: Prisma.MediaTaskWhereInput = {
    userId: user.id,
    ...(folder && folder !== "all" ? {folderId: folder === "unclassified" || folder === "uncategorized" ? null : folder} : {}),
    ...(keyword ? {originalName: {contains: keyword}} : {})
  };
  const [total, items] = await Promise.all([
    prisma.mediaTask.count({where}),
    prisma.mediaTask.findMany({
      where,
      orderBy: {createdAt: "desc"},
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        transcript: true,
        insights: {select: {type: true, content: true, createdAt: true, updatedAt: true}},
        folder: {select: {id: true, name: true, position: true}},
        shareLinks: {where: {enabled: true}, orderBy: {createdAt: "desc"}, take: 1}
      }
    })
  ]);
  return {items: items.map(serializeCompatTask), total, page, pageSize};
}
