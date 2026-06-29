import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {serializeCompatTask} from "@/lib/transcription-compat";

export const dynamic = "force-dynamic";

export async function GET() {
  const task = await prisma.mediaTask.findFirst({
    where: {userId: null, teamId: null},
    orderBy: {createdAt: "desc"},
    include: {
      transcript: true,
      insights: {select: {type: true, content: true, createdAt: true, updatedAt: true}},
      shareLinks: {where: {enabled: true}, orderBy: {createdAt: "desc"}, take: 1}
    }
  });
  if (!task) return NextResponse.json({transcription: null}, {status: 404});
  return NextResponse.json({transcription: serializeCompatTask(task)});
}
