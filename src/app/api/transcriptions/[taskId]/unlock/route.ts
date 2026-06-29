import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
import {ensurePersonalTeam} from "@/lib/developer-settings";
import {prisma} from "@/lib/prisma";
import {publishTaskUpdate} from "@/lib/tasks";

export async function POST(_request: Request, {params}: {params: {taskId: string}}) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({error: "请先登录后再解锁此转写。"}, {status: 401});

  const task = await prisma.mediaTask.findUnique({
    where: {id: params.taskId},
    select: {id: true, userId: true, teamId: true, status: true, progress: true}
  });
  if (!task) return NextResponse.json({error: "转写任务不存在。"}, {status: 404});

  if (task.userId && task.userId !== user.id) {
    return NextResponse.json({error: "你无权访问此转写。"}, {status: 403});
  }

  const team = await ensurePersonalTeam(user.id);
  const updated = await prisma.mediaTask.update({
    where: {id: task.id},
    data: {
      userId: user.id,
      teamId: task.teamId ?? team.id,
      status: task.status === "FAILED" || task.status === "CANCELED" ? "QUEUED" : task.status,
      progress: task.status === "FAILED" || task.status === "CANCELED" ? 5 : task.progress,
      statusMessage:
        task.status === "FAILED" || task.status === "CANCELED"
          ? "转写已解锁，可以重新重试。"
          : "转写已解锁。",
      errorCode: null
    },
    include: {
      transcript: true,
      insights: true,
      exports: true,
      folder: {select: {id: true, name: true, position: true}}
    }
  });
  await publishTaskUpdate(task.id);

  return NextResponse.json({unlocked: true, transcription: updated});
}
