import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getRequestOrigin} from "@/lib/request-origin";
import {serializeCompatTask} from "@/lib/transcription-compat";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const task = await prisma.mediaTask.findFirst({
    where: {userId: null, teamId: null},
    orderBy: {createdAt: "desc"},
    include: {
      transcript: true,
      shareLinks: {
        where: {enabled: true},
        select: {
          id: true,
          tokenHash: true,
          title: true,
          enabled: true,
          expiresAt: true,
          accessCount: true,
          lastAccessAt: true,
          createdAt: true
        },
        orderBy: {createdAt: "desc"},
        take: 1
      }
    }
  });
  if (!task) return NextResponse.json({transcription: null}, {status: 404});
  return NextResponse.json({transcription: serializeCompatTask(task, {appUrl: getRequestOrigin(request)})});
}
