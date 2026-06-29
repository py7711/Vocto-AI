import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, publishTaskUpdate, taskAccessErrorResponse} from "@/lib/tasks";

type Segment = {start: number; end: number; text: string; speaker?: string};

const updateSegmentSchema = z.object({
  text: z.string().min(1).optional(),
  start: z.number().optional(),
  end: z.number().optional(),
  speaker: z.string().optional()
}).refine((value) => Object.keys(value).length > 0, {message: "请提供要更新的转写片段字段。"});

function readSegments(value: unknown): Segment[] {
  return Array.isArray(value) ? (value as Segment[]) : [];
}

function resolveSegmentIndex(segmentId: string) {
  const index = Number(segmentId);
  return Number.isInteger(index) && index >= 0 ? index : null;
}

export async function PATCH(request: Request, {params}: {params: {taskId: string; segmentId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "write", request.headers);
    const input = updateSegmentSchema.parse(await request.json().catch(() => ({})));
    const index = resolveSegmentIndex(params.segmentId);
    if (index === null) return NextResponse.json({error: "片段 ID 必须是从 0 开始的序号。"}, {status: 422});

    const existing = await prisma.transcript.findUnique({where: {mediaTaskId: params.taskId}});
    if (!existing) return NextResponse.json({error: "转写稿不存在。"}, {status: 404});

    const segments = readSegments(existing.segments);
    const current = segments[index];
    if (!current) return NextResponse.json({error: "转写片段不存在。"}, {status: 404});

    const next = [...segments];
    next[index] = {
      ...current,
      ...(input.start !== undefined ? {start: input.start} : {}),
      ...(input.end !== undefined ? {end: input.end} : {}),
      ...(input.text !== undefined ? {text: input.text} : {}),
      ...(input.speaker !== undefined ? {speaker: input.speaker} : {})
    };

    const transcript = await prisma.transcript.update({
      where: {mediaTaskId: params.taskId},
      data: {
        segments: next,
        editedText: next.map((segment) => segment.text).join("\n\n")
      }
    });
    await publishTaskUpdate(params.taskId);
    return NextResponse.json({transcript, segment: next[index], segments: next});
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "无法更新转写片段。"},
      {status: error instanceof z.ZodError ? 422 : 400}
    );
  }
}
