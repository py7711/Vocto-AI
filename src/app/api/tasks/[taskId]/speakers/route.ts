import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, publishTaskUpdate, taskAccessErrorResponse} from "@/lib/tasks";

type Segment = {
  start: number;
  end: number;
  text: string;
  speaker?: string;
};

const updateSpeakersSchema = z.object({
  speakers: z.array(z.object({
    from: z.string().trim().min(1).max(120),
    to: z.string().trim().min(1).max(120)
  })).min(1)
});

function readSegments(value: unknown): Segment[] {
  return Array.isArray(value) ? (value as Segment[]) : [];
}

export async function PATCH(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "write", request.headers);
    const input = updateSpeakersSchema.parse(await request.json());
    const renameMap = new Map(input.speakers.map((speaker) => [speaker.from, speaker.to]));

    const existing = await prisma.transcript.findUnique({
      where: {mediaTaskId: params.taskId}
    });
    if (!existing) {
      return NextResponse.json({error: "转写文本不存在。"}, {status: 404});
    }

    const currentSegments = readSegments(existing.segments);
    if (!currentSegments.length) {
      return NextResponse.json({error: "当前没有可更新时间戳分段。"}, {status: 409});
    }

    const nextSegments = currentSegments.map((segment) => {
      const nextSpeaker = segment.speaker ? renameMap.get(segment.speaker) : undefined;
      return nextSpeaker ? {...segment, speaker: nextSpeaker} : segment;
    });
    const changedCount = nextSegments.reduce((count, segment, index) => count + (segment.speaker !== currentSegments[index]?.speaker ? 1 : 0), 0);
    const transcript = await prisma.transcript.update({
      where: {mediaTaskId: params.taskId},
      data: {
        segments: nextSegments,
        editedText: nextSegments.map((segment) => segment.text).join("\n\n")
      }
    });

    await publishTaskUpdate(params.taskId);
    return NextResponse.json({transcript, changedCount});
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法更新说话人。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
