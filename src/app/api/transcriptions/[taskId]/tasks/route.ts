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
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        insights: {select: {id: true, type: true, title: true, createdAt: true, updatedAt: true}}
      }
    });
    if (!task) return NextResponse.json({tasks: []}, {status: 404});
    return NextResponse.json({
      tasks: [
        {
          id: task.id,
          taskId: task.id,
          type: "transcription",
          status: task.status,
          progress: task.progress,
          statusMessage: task.statusMessage,
          errorCode: task.errorCode,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          completedAt: task.completedAt
        },
        ...task.insights.map((insight) => ({
          id: insight.id,
          taskId: insight.id,
          type: insight.type.toLowerCase(),
          status: "COMPLETED",
          title: insight.title,
          createdAt: insight.createdAt,
          updatedAt: insight.updatedAt
        }))
      ]
    });
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    return NextResponse.json({error: error instanceof Error ? error.message : "无法读取转写任务记录。"}, {status: 400});
  }
}
