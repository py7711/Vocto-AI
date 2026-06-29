import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, publishTaskUpdate, taskAccessErrorResponse} from "@/lib/tasks";

const updateTranscriptSchema = z.object({
  editedText: z.string().min(1).optional(),
  segments: z.array(z.object({
    start: z.number(),
    end: z.number(),
    text: z.string().min(1),
    speaker: z.string().optional()
  })).optional()
}).refine((value) => Boolean(value.editedText || value.segments?.length), {
  message: "请提供 editedText 或 segments。"
});

export async function PATCH(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "write", request.headers);
    const input = updateTranscriptSchema.parse(await request.json());
    const editedText = input.segments
      ? input.segments.map((segment) => segment.text).join("\n\n")
      : input.editedText;
    const transcript = await prisma.transcript.update({
      where: {mediaTaskId: params.taskId},
      data: {
        editedText,
        ...(input.segments ? {segments: input.segments} : {})
      }
    });

    await publishTaskUpdate(params.taskId);
    return NextResponse.json(transcript);
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法保存转写文本。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
