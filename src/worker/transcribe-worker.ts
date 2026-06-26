import "dotenv/config";
import {Worker} from "bullmq";
import {TRANSCRIBE_QUEUE, type TranscribeJob} from "@/lib/queue";
import {redis} from "@/lib/redis";
import {prisma} from "@/lib/prisma";
import {updateTaskStatus} from "@/lib/tasks";
import {releaseQuotaForFailedTask, settleQuotaForCompletedTask} from "@/lib/usage";
import {transcribeWithFallback} from "@/server/transcription";
import {resolveYoutubeAudioUrl} from "@/server/media/prepare";
import {dispatchTeamWebhook} from "@/lib/webhooks";

const worker = new Worker<TranscribeJob>(
  TRANSCRIBE_QUEUE,
  async (job) => {
    const {taskId, sourceUrl, sourceType, language, enableSpeakerLabels} = job.data;
    await updateTaskStatus(taskId, "PROCESSING", {
      progress: 15,
      statusMessage: "Preparing audio for transcription."
    });

    // 生产环境在这里使用 yt-dlp 和 FFmpeg 解析链接、规范化音频，再交给 STT 服务商。
    const mediaUrl = sourceType === "YOUTUBE" ? await resolveYoutubeAudioUrl(sourceUrl) : sourceUrl;

    await updateTaskStatus(taskId, "TRANSCRIBING", {
      progress: 35,
      statusMessage: "Transcribing with provider fallback."
    });

    const result = await transcribeWithFallback({
      mediaUrl,
      language,
      enableSpeakerLabels
    });

    await prisma.transcript.upsert({
      where: {mediaTaskId: taskId},
      update: {
        plainText: result.text,
        segments: result.segments,
        words: result.words ?? undefined
      },
      create: {
        mediaTaskId: taskId,
        plainText: result.text,
        segments: result.segments,
        words: result.words ?? undefined
      }
    });

    await settleQuotaForCompletedTask({mediaTaskId: taskId, durationSeconds: result.durationSeconds});

    const completedTask = await updateTaskStatus(taskId, "COMPLETED", {
      progress: 100,
      statusMessage: "Transcript is ready.",
      provider: result.provider,
      detectedLanguage: result.language,
      durationSeconds: result.durationSeconds ? Math.round(result.durationSeconds) : undefined,
      speakerCount: result.speakerCount
    });

    await dispatchTeamWebhook({
      teamId: completedTask.teamId,
      event: "task.completed",
      targetType: "media_task",
      targetId: completedTask.id,
      payload: {
        taskId: completedTask.id,
        status: completedTask.status,
        provider: completedTask.provider,
        language: completedTask.detectedLanguage,
        durationSeconds: completedTask.durationSeconds,
        originalName: completedTask.originalName
      }
    });
  },
  {
    connection: redis as any,
    concurrency: 3
  }
);

worker.on("failed", async (job, error) => {
  if (!job) return;

  await releaseQuotaForFailedTask(job.data.taskId);
  const failedTask = await updateTaskStatus(job.data.taskId, "FAILED", {
    progress: 100,
    statusMessage: error.message,
    errorCode: "TRANSCRIPTION_FAILED"
  });

  await dispatchTeamWebhook({
    teamId: failedTask.teamId,
    event: "task.failed",
    targetType: "media_task",
    targetId: failedTask.id,
    payload: {
      taskId: failedTask.id,
      status: failedTask.status,
      errorCode: failedTask.errorCode,
      statusMessage: failedTask.statusMessage,
      originalName: failedTask.originalName
    }
  });
});

console.log(`Votxt worker is listening on ${TRANSCRIBE_QUEUE}.`);
