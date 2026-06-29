import "dotenv/config";
import {Worker} from "bullmq";
import {TRANSCRIBE_QUEUE, type TranscribeJob} from "@/lib/queue";
import {createRedisConnection, describeRedisConnectionError, getRedisConnectionError} from "@/lib/redis";
import {prisma} from "@/lib/prisma";
import {updateTaskStatus} from "@/lib/task-status";
import {releaseQuotaForFailedTask, settleQuotaForCompletedTask} from "@/lib/usage";
import {transcribeWithFallback} from "@/server/transcription";
import {isGoogleDriveShareUrl, prepareTaskAudioAsset, resolveGoogleDriveDownloadUrl} from "@/server/media/prepare";
import {generateInsights} from "@/server/ai/insights";
import {normalizeSummaryTemplate} from "@/lib/summary-template";

// worker 是独立 Node 进程，不在 Next.js 请求生命周期内运行。
// 这里避免导入包含 cookies/getCurrentUser 的 "@/lib/tasks"，否则会间接加载 `server-only`
// 并在 `pnpm run worker` 启动阶段抛错；worker 只需要状态更新能力，直接使用 task-status 即可。
class JobCanceledError extends Error {
  constructor() {
    super("转写任务已取消。");
    this.name = "JobCanceledError";
  }
}

async function assertNotCanceled(taskId: string) {
  const task = await prisma.mediaTask.findUnique({
    where: {id: taskId},
    select: {status: true}
  });
  if (task?.status === "CANCELED") {
    throw new JobCanceledError();
  }
}

async function createWorker() {
  const connection = createRedisConnection();

  try {
    await connection.connect();
  } catch (error) {
    console.error(describeRedisConnectionError(getRedisConnectionError(connection, error)));
    connection.disconnect();
    process.exit(1);
  }

  const worker = new Worker<TranscribeJob>(
    TRANSCRIBE_QUEUE,
    async (job) => {
      const {taskId, sourceUrl, sourceType, language, enableSpeakerLabels, subtitleEnabled, premiumModel, summaryTemplate, summaryLanguage} = job.data;
      await assertNotCanceled(taskId);
      await updateTaskStatus(taskId, "PROCESSING", {
        progress: 15,
        statusMessage: "正在提取音频并上传到 R2。"
      });

      const taskRecord = await prisma.mediaTask.findUnique({
        where: {id: taskId},
        select: {originalName: true, objectKey: true}
      });
      const preparableSourceUrl = sourceType === "GOOGLE_DRIVE" && isGoogleDriveShareUrl(sourceUrl)
        ? resolveGoogleDriveDownloadUrl(sourceUrl)
        : sourceUrl;
      const prepared = await prepareTaskAudioAsset({
        taskId,
        sourceType,
        sourceUrl: preparableSourceUrl,
        originalName: taskRecord?.originalName,
        objectKey: taskRecord?.objectKey
      });

      await assertNotCanceled(taskId);
      await updateTaskStatus(taskId, "TRANSCRIBING", {
        progress: 35,
        statusMessage: prepared.chunkCount ? `已创建 ${prepared.chunkCount} 个音频切片，正在使用服务商降级策略转写。` : "音频已上传 R2，正在使用服务商降级策略转写。"
      });

      const result = await transcribeWithFallback({
        mediaUrl: prepared.mediaUrl,
        language,
        enableSpeakerLabels,
        premiumModel
      });

      await assertNotCanceled(taskId);
      const transcript = await prisma.transcript.upsert({
        where: {mediaTaskId: taskId},
        update: {
          plainText: result.text,
          segments: result.segments,
          words: subtitleEnabled === false ? undefined : (result.words ?? undefined)
        },
        create: {
          mediaTaskId: taskId,
          plainText: result.text,
          segments: result.segments,
          words: subtitleEnabled === false ? undefined : (result.words ?? undefined)
        }
      });

      await settleQuotaForCompletedTask({mediaTaskId: taskId, durationSeconds: result.durationSeconds});

      await assertNotCanceled(taskId);
      const normalizedSummaryTemplate = normalizeSummaryTemplate(summaryTemplate);
      if (normalizedSummaryTemplate !== "none") {
        await updateTaskStatus(taskId, "ANALYZING", {
          progress: 82,
          statusMessage: "转写完成，正在生成 AI 摘要和思维导图。"
        });
        await generateInsights(taskId, transcript, summaryLanguage || language || "en", undefined, normalizedSummaryTemplate);
        await assertNotCanceled(taskId);
      }

      await updateTaskStatus(taskId, "COMPLETED", {
        progress: 100,
        statusMessage: normalizedSummaryTemplate === "none" ? "转写稿已就绪。" : "转写稿、AI 摘要和思维导图已就绪。",
        provider: result.provider,
        detectedLanguage: result.language,
        durationSeconds: result.durationSeconds ? Math.round(result.durationSeconds) : prepared.durationSeconds ? Math.round(prepared.durationSeconds) : undefined,
        speakerCount: result.speakerCount
      });
    },
    {
      connection: connection as any,
      concurrency: 3
    }
  );

  worker.on("error", (error) => {
    console.error(describeRedisConnectionError(error));
  });

  worker.on("failed", async (job, error) => {
    if (!job) return;
    if (error instanceof JobCanceledError) return;

    await releaseQuotaForFailedTask(job.data.taskId);
    await updateTaskStatus(job.data.taskId, "FAILED", {
      progress: 100,
      statusMessage: error.message,
      errorCode: "TRANSCRIPTION_FAILED"
    });
  });

  console.log(`UniScribe worker 正在监听队列 ${TRANSCRIBE_QUEUE}。`);
}

void createWorker();
