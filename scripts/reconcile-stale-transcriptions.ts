import "dotenv/config";
import {getTranscribeQueue, transcribeJobId} from "../src/lib/queue";
import {prisma} from "../src/lib/prisma";
import {releaseQuotaForFailedTask} from "../src/lib/usage";

const staleBefore = new Date(Date.now() - 15 * 60_000);
const queue = getTranscribeQueue();

async function main() {
  try {
    const staleTasks = await prisma.mediaTask.findMany({
      where: {
        id: {not: {startsWith: "task_uniscribe_qa_"}},
        status: {in: ["QUEUED", "PROCESSING", "TRANSCRIBING", "ANALYZING"]},
        updatedAt: {lt: staleBefore}
      },
      select: {id: true, status: true, updatedAt: true}
    });

    const repaired: string[] = [];
    const active: Array<{id: string; state: string}> = [];
    for (const task of staleTasks) {
      const job = await queue.getJob(transcribeJobId(task.id));
      const state = job ? await job.getState().catch(() => "unknown") : "missing";
      if (["active", "waiting", "delayed", "prioritized"].includes(state)) {
        active.push({id: task.id, state});
        continue;
      }

      await releaseQuotaForFailedTask(task.id);
      await prisma.mediaTask.update({
        where: {id: task.id},
        data: {
          status: "FAILED",
          progress: 100,
          statusMessage: "处理服务中断且队列任务已丢失，请重试。",
          errorCode: "STALE_QUEUE_TASK"
        }
      });
      repaired.push(task.id);
    }

    console.log(JSON.stringify({repaired, skippedActiveJobs: active}, null, 2));
  } finally {
    await queue.close();
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
