import "dotenv/config";
import {Worker} from "bullmq";
import {TRANSCRIBE_QUEUE, type TranscribeJob} from "@/lib/queue";
import {redis} from "@/lib/redis";
import {prisma} from "@/lib/prisma";
import {updateTaskStatus} from "@/lib/tasks";
import {transcribeWithFallback} from "@/server/transcription";
import {resolveYoutubeAudioUrl} from "@/server/media/prepare";

const worker = new Worker<TranscribeJob>(
  TRANSCRIBE_QUEUE,
  async (job) => {
    const {taskId, sourceUrl, sourceType, language, enableSpeakerLabels} = job.data;
    await updateTaskStatus(taskId, "PROCESSING", {
      progress: 15,
      statusMessage: "Preparing audio for transcription."
    });

    // In production this is where yt-dlp and FFmpeg normalize files before the STT call.
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

    await updateTaskStatus(taskId, "COMPLETED", {
      progress: 100,
      statusMessage: "Transcript is ready.",
      provider: result.provider,
      detectedLanguage: result.language,
      durationSeconds: result.durationSeconds ? Math.round(result.durationSeconds) : undefined,
      speakerCount: result.speakerCount
    });
  },
  {
    connection: redis,
    concurrency: 3
  }
);

worker.on("failed", async (job, error) => {
  if (!job) return;

  await updateTaskStatus(job.data.taskId, "FAILED", {
    progress: 100,
    statusMessage: error.message,
    errorCode: "TRANSCRIPTION_FAILED"
  });
});

console.log(`Vocto worker is listening on ${TRANSCRIBE_QUEUE}.`);
