import {NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {driveDownloadUrl, fetchDriveJson, getFreshDriveConnection} from "@/lib/google-drive";
import {enqueueTranscribeJob} from "@/lib/queue";
import {prisma} from "@/lib/prisma";
import {putObject} from "@/lib/storage";
import {normalizeDurationSeconds} from "@/lib/duration";
import {assertAndUpdateFreeDailyQuota, assertFreeMinutesCanCoverDuration, assertFreeSpeakerIdentificationQuota, billableMinutesFromDurationSeconds, estimatedMinutesFromFileSize, quotaErrorStatus, releaseQuotaForFailedTask, reserveQuotaForTask} from "@/lib/usage";
import {normalizeSummaryTemplate, summaryTemplateInputValues} from "@/lib/summary-template";
import {logApiError} from "@/lib/api-logger";

const importSchema = z.object({
  fileId: z.string().min(1),
  folderId: z.string().nullable().optional(),
  language: z.string().default("auto"),
  enableSpeakerLabels: z.boolean().default(true),
  subtitleEnabled: z.boolean().default(true),
  premiumModel: z.boolean().default(false),
  summaryTemplate: z.enum(summaryTemplateInputValues).default("standard"),
  summaryLanguage: z.string().default("en")
});

type DriveFile = {
  id: string;
  name: string;
  mimeType?: string;
  size?: string;
  webViewLink?: string;
  videoMediaMetadata?: {
    durationMillis?: string;
  };
};

function cleanDriveFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_").slice(-120) || "google-drive-media";
}

async function importDriveMediaToStorage(input: {
  file: DriveFile;
  accessToken: string;
}) {
  // Drive 文件不能直接交给转写 worker：access token 会过期，worker 也不应该持有用户云盘权限。
  // 因此导入阶段先由服务端下载并写入 R2，后续任务只读取 Votxt 自己的对象地址。
  const mediaUrl = driveDownloadUrl(input.file.id, input.accessToken);
  const response = await fetch(mediaUrl, {
    headers: {Authorization: `Bearer ${input.accessToken}`}
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || "无法下载 Google Drive 媒体文件。");
  }

  const body = new Uint8Array(await response.arrayBuffer());
  const key = `uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${cleanDriveFileName(input.file.name)}`;
  return putObject({
    key,
    body,
    contentType: input.file.mimeType || response.headers.get("content-type") || "application/octet-stream",
    contentLength: body.byteLength
  });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});
    const input = importSchema.parse(await request.json());
    const connection = await getFreshDriveConnection(user.id);
    if (!connection) return NextResponse.json({error: "尚未连接 Google Drive。"}, {status: 404});

    const fileUrl = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(input.fileId)}`);
    fileUrl.searchParams.set("fields", "id,name,mimeType,size,webViewLink,videoMediaMetadata(durationMillis)");
    const file = await fetchDriveJson<DriveFile>(connection, fileUrl.toString());
    if (!file.mimeType?.startsWith("audio/") && !file.mimeType?.startsWith("video/")) {
      return NextResponse.json({error: "只能导入音频或视频文件。"}, {status: 400});
    }
    const stored = await importDriveMediaToStorage({
      file,
      accessToken: connection.accessToken
    });
    const durationSeconds = normalizeDurationSeconds(file.videoMediaMetadata?.durationMillis ? Number(file.videoMediaMetadata.durationMillis) / 1000 : undefined);

    const task = await prisma.$transaction(async (tx) => {
      // 创建任务、免费次数校验和额度预留必须在同一个事务内完成。
      // 如果其中任一步失败，数据库里不会留下已排队但没有额度记录的 Drive 导入任务。
      await assertFreeMinutesCanCoverDuration({userId: user.id, durationSeconds, tx});
      await assertAndUpdateFreeDailyQuota({userId: user.id, tx});
      if (input.enableSpeakerLabels) {
        await assertFreeSpeakerIdentificationQuota({userId: user.id, tx});
      }
      if (input.folderId) {
        const folder = await tx.folder.findFirst({where: {id: input.folderId, userId: user.id}, select: {id: true}});
        if (!folder) throw new Error("文件夹不存在或无权访问。");
      }

      const created = await tx.mediaTask.create({
        data: {
          userId: user.id,
          folderId: input.folderId ?? undefined,
          sourceType: "UPLOAD",
          sourceUrl: stored.publicUrl,
          objectKey: stored.key,
          originalName: file.name,
          durationSeconds,
          fileSizeBytes: file.size ? BigInt(file.size) : BigInt(stored.sizeBytes),
          status: "QUEUED",
          statusMessage: "Google Drive 文件已进入队列。",
          progress: 5
        }
      });

      await tx.mediaAsset.create({
        data: {
          mediaTaskId: created.id,
          kind: "SOURCE_MEDIA",
          chunkIndex: -1,
          url: stored.publicUrl,
          objectKey: stored.key,
          fileName: file.name,
          contentType: file.mimeType,
          sizeBytes: file.size ? BigInt(file.size) : BigInt(stored.sizeBytes),
          durationSeconds,
          metadata: {sourceType: "GOOGLE_DRIVE", speakerLabelsRequested: input.enableSpeakerLabels}
        }
      });

      await reserveQuotaForTask({
        userId: user.id,
        mediaTaskId: created.id,
        estimatedMinutes: billableMinutesFromDurationSeconds(durationSeconds) ?? estimatedMinutesFromFileSize(file.size ? Number(file.size) : undefined),
        tx
      });
      return created;
    });

    try {
      await enqueueTranscribeJob({
        taskId: task.id,
        sourceType: "UPLOAD",
        sourceUrl: task.sourceUrl,
        language: input.language,
        enableSpeakerLabels: input.enableSpeakerLabels,
        subtitleEnabled: input.subtitleEnabled,
        premiumModel: input.premiumModel,
        summaryTemplate: normalizeSummaryTemplate(input.summaryTemplate),
        summaryLanguage: input.summaryLanguage
      });
    } catch (queueError) {
      logApiError(queueError, request);
      // 队列写入发生在数据库事务之后；如果 Redis/BullMQ 不可用，需要主动释放刚预留的额度，
      // 并把任务置为失败，避免用户看到永久停在排队中的 Drive 导入任务。
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
    const message = error instanceof Error ? error.message : "无法导入 Google Drive 文件。";
    return NextResponse.json({error: message}, {status: quotaErrorStatus(message)});
  }
}
