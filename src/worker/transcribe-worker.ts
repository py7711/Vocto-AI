import "dotenv/config";
import {randomUUID} from "node:crypto";
import {Worker} from "bullmq";
import {TRANSCRIBE_QUEUE, type TranscribeJob} from "@/lib/queue";
import {createRedisConnection, describeRedisConnectionError, getRedisConnectionError} from "@/lib/redis";
import {prisma} from "@/lib/prisma";
import {env} from "@/lib/env";
import {updateTaskStatus} from "@/lib/task-status";
import {assertFreeMinutesCanCoverDuration, releaseQuotaForFailedTask} from "@/lib/usage";
import {resolvePrimaryProviders} from "@/server/transcription";
import {transcribeChunkedWithGroq} from "@/server/transcription/groq-chunked";
import {finalizeTranscriptionResult, saveJobContext, type TranscriptionJobContext} from "@/server/transcription/finalize";
import type {TranscriptionRequest} from "@/server/transcription/types";
import {isGoogleDriveShareUrl, prepareTaskAudioAsset, resolveGoogleDriveDownloadUrl} from "@/server/media/prepare";

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

async function isTaskCompleted(taskId: string) {
  const task = await prisma.mediaTask.findUnique({where: {id: taskId}, select: {status: true}});
  return task?.status === "COMPLETED";
}

function callbackBaseUrl() {
  return (env.TRANSCRIPTION_CALLBACK_BASE_URL || env.NEXT_PUBLIC_APP_URL).replace(/\/$/, "");
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 提交异步任务并注册回调；随后按超时轮询服务商，任一先完成即幂等收尾。
// 返回 true 表示已完成收尾。
async function runWithCallbackAndPolling(
  taskId: string,
  request: TranscriptionRequest,
  baseContext: TranscriptionJobContext
): Promise<boolean> {
  const [primary] = resolvePrimaryProviders(request);
  if (!primary) return false;

  const callbackToken = randomUUID();
  const callbackUrl = `${callbackBaseUrl()}/api/transcription/callback/${primary.name}?taskId=${encodeURIComponent(taskId)}&token=${encodeURIComponent(callbackToken)}`;

  let providerJobId: string;
  try {
    const submitResult = await primary.submit({...request, callbackUrl, callbackToken});
    providerJobId = submitResult.providerJobId;
  } catch (error) {
    console.warn(`[transcribe] ${primary.name} 异步提交失败，转同步兜底：`, error instanceof Error ? error.message : error);
    return false;
  }

  await saveJobContext(taskId, {
    ...baseContext,
    provider: primary.name as "deepgram" | "assemblyai",
    providerJobId,
    callbackToken
  });

  const timeoutMs = env.TRANSCRIPTION_CALLBACK_TIMEOUT_SECONDS * 1000;
  const intervalMs = env.TRANSCRIPTION_POLL_INTERVAL_SECONDS * 1000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await sleep(intervalMs);
    await assertNotCanceled(taskId);

    // 回调可能已抢先完成收尾。
    if (await isTaskCompleted(taskId)) return true;

    try {
      const polled = await primary.fetchResult(providerJobId, request);
      if (polled) {
        return await finalizeTranscriptionResult({taskId, result: polled, context: baseContext});
      }
    } catch (error) {
      console.warn(`[transcribe] ${primary.name} 轮询失败：`, error instanceof Error ? error.message : error);
      return false;
    }
  }

  // 超时仍未收到回调/查询到结果：交给同步兜底链路。
  return await isTaskCompleted(taskId);
}

// 同步兜底：依次尝试主力服务商的阻塞式 transcribe，最后回退到 Groq 分段转写。
async function runSyncFallback(
  taskId: string,
  request: TranscriptionRequest,
  baseContext: TranscriptionJobContext
): Promise<boolean> {
  const errors: string[] = [];

  for (const provider of resolvePrimaryProviders(request)) {
    try {
      const result = await provider.transcribe(request);
      return await finalizeTranscriptionResult({taskId, result, context: baseContext});
    } catch (error) {
      errors.push(`${provider.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 最终兜底：Deepgram/AssemblyAI 均不可用时，才对音频智能分段并逐段调用 Groq，再由 AI 生成摘要。
  await updateTaskStatus(taskId, "TRANSCRIBING", {
    progress: 55,
    statusMessage: "主转写服务商不可用，正在对音频智能分段并使用兜底转写。"
  });
  const groqResult = await transcribeChunkedWithGroq(request);
  return await finalizeTranscriptionResult({taskId, result: groqResult, context: baseContext});
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
      // 幂等保护：若任务已完成（例如 job 被判定 stalled 后重新处理），直接跳过，避免重复下载与转写。
      if (await isTaskCompleted(taskId)) return;
      await updateTaskStatus(taskId, "PROCESSING", {
        progress: 15,
        statusMessage: "正在提取音频并上传到 R2。"
      });

      const taskRecord = await prisma.mediaTask.findUnique({
        where: {id: taskId},
        select: {originalName: true, objectKey: true, userId: true}
      });
      const preparableSourceUrl = sourceType === "GOOGLE_DRIVE" && isGoogleDriveShareUrl(sourceUrl)
        ? resolveGoogleDriveDownloadUrl(sourceUrl)
        : sourceUrl;
      const prepared = await prepareTaskAudioAsset({
        taskId,
        sourceType,
        sourceUrl: preparableSourceUrl,
        originalName: taskRecord?.originalName,
        objectKey: taskRecord?.objectKey,
        enableSpeakerLabels
      });
      if (taskRecord?.userId) {
        await assertFreeMinutesCanCoverDuration({
          userId: taskRecord.userId,
          mediaTaskId: taskId,
          durationSeconds: prepared.durationSeconds
        });
      }

      await assertNotCanceled(taskId);
      await updateTaskStatus(taskId, "TRANSCRIBING", {
        progress: 35,
        statusMessage: "音频已就绪，正在转写。"
      });

      const request: TranscriptionRequest = {
        mediaUrl: prepared.mediaUrl,
        language,
        enableSpeakerLabels,
        subtitleEnabled,
        premiumModel
      };
      const baseContext: TranscriptionJobContext = {
        language,
        enableSpeakerLabels,
        subtitleEnabled,
        summaryTemplate,
        summaryLanguage,
        preparedDurationSeconds: prepared.durationSeconds ?? undefined
      };

      // 优先走 webhook 回调 + 容错轮询；未在超时内完成则转同步兜底链路。
      const finishedByCallback = await runWithCallbackAndPolling(taskId, request, baseContext);
      if (finishedByCallback || (await isTaskCompleted(taskId))) return;

      await runSyncFallback(taskId, request, baseContext);
    },
    {
      connection: connection as any,
      concurrency: 3,
      // 音频下载/转码可能耗时数分钟，默认 30s 锁易被误判 stalled 而触发重复处理。
      // 这里延长锁时长并降低 stalled 重试次数，配合幂等保护杜绝重复下载。
      lockDuration: 300_000,
      stalledInterval: 60_000,
      maxStalledCount: 1
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
