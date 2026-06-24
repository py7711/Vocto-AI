import {Queue} from "bullmq";
import {redis} from "@/lib/redis";

export type TranscribeJob = {
  taskId: string;
  sourceType: "UPLOAD" | "YOUTUBE";
  sourceUrl: string;
  language?: string;
  enableSpeakerLabels: boolean;
};

export const TRANSCRIBE_QUEUE = "vocto-transcribe";

export const transcribeQueue = new Queue<TranscribeJob>(TRANSCRIBE_QUEUE, {
  connection: redis,
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
