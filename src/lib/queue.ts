import {Queue} from "bullmq";
import {redis} from "@/lib/redis";

export type TranscribeJob = {
  taskId: string;
  sourceType: "UPLOAD" | "YOUTUBE";
  sourceUrl: string;
  language?: string;
  enableSpeakerLabels: boolean;
};

export const TRANSCRIBE_QUEUE = "votxt-transcribe";

let transcribeQueue: Queue<TranscribeJob> | undefined;

export function getTranscribeQueue() {
  transcribeQueue ??= new Queue<TranscribeJob>(TRANSCRIBE_QUEUE, {
    connection: redis as any,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000
      },
      removeOnComplete: 100,
      removeOnFail: 500
    }
  });

  return transcribeQueue;
}
