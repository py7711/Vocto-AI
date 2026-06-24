import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {transcribeQueue} from "@/lib/queue";
import {anonymousUserId} from "@/lib/tasks";
import {assertRateLimit} from "@/lib/rate-limit";

const createTaskSchema = z.object({
  sourceType: z.enum(["UPLOAD", "YOUTUBE"]),
  sourceUrl: z.string().url(),
  objectKey: z.string().optional(),
  originalName: z.string().optional(),
  language: z.string().default("auto"),
  enableSpeakerLabels: z.boolean().default(true),
  fileSizeBytes: z.number().int().positive().optional()
});

export async function POST(request: Request) {
  const input = createTaskSchema.parse(await request.json());
  await assertRateLimit(anonymousUserId(request.headers), 20, 60 * 60);

  const task = await prisma.mediaTask.create({
    data: {
      sourceType: input.sourceType,
      sourceUrl: input.sourceUrl,
      objectKey: input.objectKey,
      originalName: input.originalName,
      language: input.language,
      fileSizeBytes: input.fileSizeBytes,
      status: "QUEUED",
      statusMessage: "Task has been queued.",
      progress: 5
    }
  });

  await transcribeQueue.add("transcribe", {
    taskId: task.id,
    sourceType: input.sourceType,
    sourceUrl: input.sourceUrl,
    language: input.language,
    enableSpeakerLabels: input.enableSpeakerLabels
  });

  return NextResponse.json(task);
}
