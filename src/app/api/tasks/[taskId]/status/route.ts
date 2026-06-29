import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";

export async function GET(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "read", request.headers);
    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      select: {
        id: true,
        status: true,
        progress: true,
        statusMessage: true,
        errorCode: true,
        provider: true,
        detectedLanguage: true,
        durationSeconds: true,
        completedAt: true,
        updatedAt: true
      }
    });
    if (!task) return NextResponse.json({error: "任务不存在。"}, {status: 404});
    return NextResponse.json({
      ...task,
      taskId: task.id,
      transcriptionFileId: task.id
    });
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    return NextResponse.json({error: error instanceof Error ? error.message : "无法读取任务状态。"}, {status: 400});
  }
}
