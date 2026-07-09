import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {enqueueTranscribeJob} from "@/lib/queue";
import {anonymousUserId} from "@/lib/tasks";
import {assertRateLimit} from "@/lib/rate-limit";
import {getCurrentUser} from "@/lib/auth";
import {normalizeDurationSeconds} from "@/lib/duration";
import {assertAndUpdateFreeDailyQuota, assertFreeMinutesCanCoverDuration, assertFreeSpeakerIdentificationQuota, billableMinutesFromDurationSeconds, estimatedMinutesFromFileSize, quotaErrorStatus, releaseQuotaForFailedTask, reserveQuotaForTask} from "@/lib/usage";
import {normalizeSummaryTemplate, summaryTemplateInputValues} from "@/lib/summary-template";
import {jsonSafe} from "@/lib/json";
import {getRequestOrigin} from "@/lib/request-origin";
import {serializeShareLinkForOwner} from "@/lib/share-links";
import {logApiError} from "@/lib/api-logger";

const createTaskSchema = z.object({
  sourceType: z.enum(["UPLOAD", "YOUTUBE", "GOOGLE_DRIVE"]),
  sourceUrl: z.string().url(),
  objectKey: z.string().optional(),
  originalName: z.string().optional(),
  folderId: z.string().nullable().optional(),
  language: z.string().default("auto"),
  enableSpeakerLabels: z.boolean().default(true),
  subtitleEnabled: z.boolean().default(true),
  premiumModel: z.boolean().default(false),
  summaryTemplate: z.enum(summaryTemplateInputValues).default("standard"),
  summaryLanguage: z.string().default("en"),
  fileSizeBytes: z.number().int().positive().optional(),
  durationSeconds: z.number().positive().optional()
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({tasks: []});
    }

    const url = new URL(request.url);
    const locale = url.searchParams.get("locale") || user.locale;
    const appUrl = getRequestOrigin(request);
    const take = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 30)));
    const folderId = url.searchParams.get("folderId");
    const tasks = await prisma.mediaTask.findMany({
      where: {userId: user.id, ...(folderId ? {folderId: folderId === "uncategorized" ? null : folderId} : {})},
      orderBy: {createdAt: "desc"},
      take,
      select: {
        id: true,
        sourceType: true,
        originalName: true,
        folderId: true,
        folder: {select: {id: true, name: true, position: true}},
        status: true,
        statusMessage: true,
        progress: true,
        provider: true,
        detectedLanguage: true,
        durationSeconds: true,
        speakerCount: true,
        createdAt: true,
        completedAt: true,
        transcript: {select: {id: true}},
        insights: {
          select: {
            type: true,
            content: true,
            createdAt: true,
            updatedAt: true
          }
        },
        shareLinks: {
          where: {enabled: true},
          select: {
            id: true,
            tokenHash: true,
            title: true,
            enabled: true,
            expiresAt: true,
            accessCount: true,
            lastAccessAt: true,
            createdAt: true
          },
          orderBy: {createdAt: "desc"},
          take: 1
        },
        mediaAssets: {
          select: {
            id: true,
            kind: true,
            url: true,
            objectKey: true,
            fileName: true,
            contentType: true,
            sizeBytes: true,
            durationSeconds: true,
            startSeconds: true,
            endSeconds: true,
            chunkIndex: true,
            createdAt: true
          },
          orderBy: [{kind: "asc"}, {chunkIndex: "asc"}]
        }
      }
    });

    return NextResponse.json({
      tasks: jsonSafe(tasks.map((task) => ({
        ...task,
        shareLinks: task.shareLinks.map((shareLink) =>
          serializeShareLinkForOwner(shareLink, {appUrl, locale})
        )
      })))
    });
  } catch (error) {
    logApiError(error, request);
    const message = error instanceof Error ? error.message : "无法读取转写任务列表。";
    return NextResponse.json({error: message}, {status: 400});
  }
}

export async function POST(request: Request) {
  try {
    const input = createTaskSchema.parse(await request.json());
    const user = await getCurrentUser();
    const quotaUserId = user?.id;
    // 已登录用户按用户 ID 限流，匿名用户按 IP 限流。
    await assertRateLimit(quotaUserId ?? anonymousUserId(request.headers), 20, 60 * 60);

    // 任务创建和额度预留必须处于同一事务，避免额度不足时产生孤儿排队任务。
    const task = await prisma.$transaction(async (tx) => {
      if (quotaUserId) {
        await assertFreeMinutesCanCoverDuration({userId: quotaUserId, durationSeconds: input.durationSeconds, tx});
        await assertAndUpdateFreeDailyQuota({userId: quotaUserId, tx});
        if (input.enableSpeakerLabels) {
          await assertFreeSpeakerIdentificationQuota({userId: quotaUserId, tx});
        }
      }

      if (quotaUserId && input.folderId) {
        const folder = await tx.folder.findFirst({
          where: {id: input.folderId, userId: quotaUserId},
          select: {id: true}
        });
        if (!folder) throw new Error("文件夹不存在或无权访问。");
      }

      const createdTask = await tx.mediaTask.create({
        data: {
          userId: user?.id,
          folderId: quotaUserId ? input.folderId ?? undefined : undefined,
          sourceType: input.sourceType === "GOOGLE_DRIVE" ? "UPLOAD" : input.sourceType,
          sourceUrl: input.sourceUrl,
          objectKey: input.objectKey,
          originalName: input.originalName,
          language: input.language,
          durationSeconds: normalizeDurationSeconds(input.durationSeconds),
          fileSizeBytes: input.fileSizeBytes,
          status: "QUEUED",
          statusMessage: "任务已进入队列。",
          progress: 5
        }
      });

      await tx.mediaAsset.create({
        data: {
          mediaTaskId: createdTask.id,
          kind: "SOURCE_MEDIA",
          chunkIndex: -1,
          url: input.sourceUrl,
          objectKey: input.objectKey,
          fileName: input.originalName,
          sizeBytes: input.fileSizeBytes,
          durationSeconds: normalizeDurationSeconds(input.durationSeconds),
          metadata: {sourceType: input.sourceType, speakerLabelsRequested: input.enableSpeakerLabels}
        }
      });

      if (quotaUserId) {
        await reserveQuotaForTask({
          userId: quotaUserId,
          mediaTaskId: createdTask.id,
          estimatedMinutes: billableMinutesFromDurationSeconds(input.durationSeconds) ?? estimatedMinutesFromFileSize(input.fileSizeBytes),
          tx
        });
      }

      return createdTask;
    });

    // 转写属于长耗时任务，交给 BullMQ Worker 执行，Web 请求只负责排队。
    try {
      await enqueueTranscribeJob({
        taskId: task.id,
        sourceType: input.sourceType,
        sourceUrl: input.sourceUrl,
        language: input.language,
        enableSpeakerLabels: input.enableSpeakerLabels,
        subtitleEnabled: input.subtitleEnabled,
        premiumModel: input.premiumModel,
        summaryTemplate: normalizeSummaryTemplate(input.summaryTemplate),
        summaryLanguage: input.summaryLanguage
      });
    } catch (queueError) {
      logApiError(queueError, request);
      await releaseQuotaForFailedTask(task.id);
      await prisma.mediaTask.update({
        where: {id: task.id},
        data: {status: "FAILED", progress: 100, statusMessage: "队列服务不可用。", errorCode: "QUEUE_UNAVAILABLE"}
      });
      throw queueError;
    }

    return NextResponse.json(task);
  } catch (error) {
    logApiError(error, request);
    const message = error instanceof Error ? error.message : "无法创建转写任务。";
    return NextResponse.json({error: message}, {status: message === "RATE_LIMITED" ? 429 : quotaErrorStatus(message)});
  }
}
