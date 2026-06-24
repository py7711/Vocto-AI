import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {publishTaskUpdate} from "@/lib/tasks";

const updateTranscriptSchema = z.object({
  editedText: z.string().min(1)
});

export async function PATCH(request: Request, {params}: {params: {taskId: string}}) {
  const input = updateTranscriptSchema.parse(await request.json());
  const transcript = await prisma.transcript.update({
    where: {mediaTaskId: params.taskId},
    data: {editedText: input.editedText}
  });

  await publishTaskUpdate(params.taskId);
  return NextResponse.json(transcript);
}
