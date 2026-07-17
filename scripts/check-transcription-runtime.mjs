import "dotenv/config";
import {Queue} from "bullmq";
import IORedis from "ioredis";
import {PrismaClient} from "@prisma/client";

const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL || process.env.KV_URL || "redis://localhost:6379";
const queueName = process.env.TRANSCRIBE_QUEUE || "votxt-transcribe";
const redis = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  family: 4,
  tls: redisUrl.startsWith("rediss://") ? {} : undefined
});
const queue = new Queue(queueName, {connection: redis});
const prisma = new PrismaClient();

async function retryRead(operation, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
  throw lastError;
}

try {
  const staleBefore = new Date(Date.now() - 15 * 60_000);
  const [counts, workers, staleTasks] = await Promise.all([
    queue.getJobCounts(),
    queue.getWorkers(),
    retryRead(() => prisma.mediaTask.findMany({
      where: {
        id: {not: {startsWith: "task_uniscribe_qa_"}},
        status: {in: ["QUEUED", "PROCESSING", "TRANSCRIBING", "ANALYZING"]},
        updatedAt: {lt: staleBefore}
      },
      select: {id: true, status: true, progress: true, updatedAt: true},
      orderBy: {updatedAt: "asc"},
      take: 20
    }))
  ]);

  console.log(JSON.stringify({queue: queueName, workerCount: workers.length, counts, staleTasks}, null, 2));
  if (workers.length === 0) {
    throw new Error(`队列 ${queueName} 没有已注册的 worker。`);
  }
  if (staleTasks.length > 0) {
    throw new Error(`发现 ${staleTasks.length} 个超过 15 分钟未更新的转录任务。`);
  }
} finally {
  await queue.close();
  await redis.quit();
  await prisma.$disconnect();
}
