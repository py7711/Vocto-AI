import type {Prisma} from "@prisma/client";
import {prisma} from "@/lib/prisma";

export async function setTranscriptTranslation(
  mediaTaskId: string,
  locale: string,
  content: Prisma.InputJsonValue,
  database: Pick<Prisma.TransactionClient, "$executeRaw"> = prisma
) {
  const jsonPath = `$.${JSON.stringify(locale)}`;
  const json = JSON.stringify(content);
  await database.$executeRaw`
    UPDATE Transcript
    SET translations = JSON_SET(COALESCE(translations, JSON_OBJECT()), ${jsonPath}, CAST(${json} AS JSON)),
        updatedAt = NOW(3)
    WHERE mediaTaskId = ${mediaTaskId}
  `;
}
