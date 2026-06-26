import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";

export async function GET(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "read", request.headers);
    // 返回任务详情时同时带上转写、AI 洞察和导出记录，前端一次请求即可刷新工作台。
    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      include: {
        transcript: true,
        insights: true,
        exports: true
      }
    });

    if (!task) {
      return NextResponse.json({error: "未找到转写任务。"}, {status: 404});
    }

    return NextResponse.json(task);
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法读取转写任务。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
