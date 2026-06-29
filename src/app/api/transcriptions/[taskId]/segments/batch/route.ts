import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, publishTaskUpdate, taskAccessErrorResponse} from "@/lib/tasks";

type Segment = {start: number; end: number; text: string; speaker?: string};

const segmentSchema = z.object({
  segments: z.array(z.object({
    index: z.number().int().nonnegative().optional(),
    start: z.number().optional(),
    end: z.number().optional(),
    text: z.string().min(1),
    speaker: z.string().optional()
  })).min(1)
});

function readSegments(value: unknown): Segment[] {
  return Array.isArray(value) ? (value as Segment[]) : [];
}

export async function PATCH(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "write", request.headers);
    const input = segmentSchema.parse(await request.json().catch(() => ({})));
    const existing = await prisma.transcript.findUnique({where: {mediaTaskId: params.taskId}});
    if (!existing) return NextResponse.json({error: "转写文本不存在。"}, {status: 404});
    const current = readSegments(existing.segments);
    const next = current.length ? [...current] : [];
    for (const [fallbackIndex, segment] of input.segments.entries()) {
      const index = segment.index ?? fallbackIndex;
      const previous = next[index] ?? {start: segment.start ?? 0, end: segment.end ?? segment.start ?? 0, text: ""};
      next[index] = {
        ...previous,
        ...(segment.start !== undefined ? {start: segment.start} : {}),
        ...(segment.end !== undefined ? {end: segment.end} : {}),
        text: segment.text,
        ...(segment.speaker !== undefined ? {speaker: segment.speaker} : {})
      };
    }
    const transcript = await prisma.transcript.update({
      where: {mediaTaskId: params.taskId},
      data: {
        segments: next,
        editedText: next.map((segment) => segment.text).join("\n\n")
      }
    });
    await publishTaskUpdate(params.taskId);
    return NextResponse.json({transcript, segments: next});
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    return NextResponse.json({error: error instanceof Error ? error.message : "无法批量更新转写分段。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
