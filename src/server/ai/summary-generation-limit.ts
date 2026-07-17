import {prisma} from "@/lib/prisma";

export const FREE_SUMMARY_GENERATION_LIMIT = 2;

export async function reserveSummaryGeneration(mediaTaskId: string, unlimited: boolean) {
  const result = await prisma.transcript.updateMany({
    where: {
      mediaTaskId,
      ...(unlimited ? {} : {summaryGenerationCount: {lt: FREE_SUMMARY_GENERATION_LIMIT}})
    },
    data: {summaryGenerationCount: {increment: 1}}
  });
  return result.count === 1;
}

export async function releaseSummaryGeneration(mediaTaskId: string) {
  await prisma.transcript.updateMany({
    where: {mediaTaskId, summaryGenerationCount: {gt: 0}},
    data: {summaryGenerationCount: {decrement: 1}}
  });
}
