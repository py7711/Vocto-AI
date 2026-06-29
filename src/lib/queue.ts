import {Queue} from "bullmq";
import {env} from "@/lib/env";
import {createRedisConnection, describeRedisConnectionError} from "@/lib/redis";
import type {SummaryTemplateInput} from "@/lib/summary-template";

export type TranscribeJob = {
  taskId: string;
  // 队列 sourceType 描述 worker 处理策略，不完全等同于 MediaTask.sourceType。
  // Google Drive 文件入库时会规范化为 UPLOAD，但进入 worker 时仍可标记为 GOOGLE_DRIVE，
  // 用来决定是否需要通过 Drive 兼容逻辑解析原始链接。
  sourceType: "UPLOAD" | "YOUTUBE" | "GOOGLE_DRIVE";
  sourceUrl: string;
  language?: string;
  enableSpeakerLabels: boolean;
  subtitleEnabled?: boolean;
  premiumModel?: boolean;
  summaryTemplate?: SummaryTemplateInput;
  summaryLanguage?: string;
  youtubeFallback?: boolean;
};

export const TRANSCRIBE_QUEUE = env.TRANSCRIBE_QUEUE || "uniscribe-transcribe";

let transcribeQueue: Queue<TranscribeJob> | undefined;

export function getTranscribeQueue() {
  // API 路由和 worker 都会导入队列模块。这里懒创建单例，避免一次请求中重复创建
  // Redis 连接，也便于测试环境替换同一个队列实例。
  if (!transcribeQueue) {
    const queue = new Queue<TranscribeJob>(TRANSCRIBE_QUEUE, {
      connection: createRedisConnection() as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000
        },
        // 只保留最近一批完成/失败任务，既方便排障，也避免 Redis 长期积累历史 job。
        removeOnComplete: 100,
        removeOnFail: 500
      }
    });
    queue.on("error", (error) => {
      console.error(describeRedisConnectionError(error));
    });
    transcribeQueue = queue;
  }

  return transcribeQueue;
}

export async function removeQueuedTranscribeJob(taskId: string) {
  const queue = getTranscribeQueue();
  // 取消任务只能移除尚未被 worker 取走的 job。active job 需要 worker 自己在状态更新时识别取消。
  const jobs = await queue.getJobs(["waiting", "delayed", "prioritized", "paused"], 0, 500);
  const matched = jobs.filter((job) => job.data.taskId === taskId);
  await Promise.all(matched.map((job) => job.remove()));
  return matched.length;
}
