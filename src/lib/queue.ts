import {Queue} from "bullmq";
import {env} from "@/lib/env";
import {logError} from "@/lib/logger";
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

export const TRANSCRIBE_QUEUE = env.TRANSCRIBE_QUEUE || "votxt-transcribe";

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
      logError(error, {
        requestUrl: "queue://transcribe",
        message: describeRedisConnectionError(error),
        meta: {queue: TRANSCRIBE_QUEUE}
      });
    });
    transcribeQueue = queue;
  }

  return transcribeQueue;
}

// 以 taskId 派生稳定 jobId，保证同一任务在队列里最多只有一个 job，从根本上避免重复入队与重复转写。
export function transcribeJobId(taskId: string) {
  return `transcribe:${taskId}`;
}

// 统一入队入口：所有创建/重试路径都应通过它排队。
// - 同一任务若已有 active job 正在处理，直接复用，避免重复下载/转写；
// - 已完成/失败/等待中的历史 job 会先移除再重新入队，保证重试能生效；
// - 使用稳定 jobId，即使并发请求也会被 BullMQ 按 jobId 去重。
export async function enqueueTranscribeJob(data: TranscribeJob) {
  const queue = getTranscribeQueue();
  const jobId = transcribeJobId(data.taskId);
  const existing = await queue.getJob(jobId);
  if (existing) {
    const state = await existing.getState().catch(() => "unknown");
    if (state === "active" || state === "waiting" || state === "delayed" || state === "prioritized") {
      // 已有 job 在排队或处理中，不再重复添加。
      return existing;
    }
    // completed/failed 等历史 job 会占用同一 jobId，重试前先移除。
    await existing.remove().catch(() => undefined);
  }
  return queue.add("transcribe" as never, data as never, {jobId});
}

export async function removeQueuedTranscribeJob(taskId: string) {
  const queue = getTranscribeQueue();
  // 优先按稳定 jobId 精确移除。
  const byId = await queue.getJob(transcribeJobId(taskId));
  if (byId) {
    await byId.remove().catch(() => undefined);
  }
  // 兼容历史上用随机 jobId 入队的 job：再按 data.taskId 扫描移除尚未取走的 job。
  const jobs = await queue.getJobs(["waiting", "delayed", "prioritized", "paused"], 0, 500);
  const matched = jobs.filter((job) => job.data.taskId === taskId);
  await Promise.all(matched.map((job) => job.remove().catch(() => undefined)));
  return matched.length + (byId ? 1 : 0);
}
