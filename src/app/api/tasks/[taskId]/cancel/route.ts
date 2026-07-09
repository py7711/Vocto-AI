import {NextResponse} from "next/server";
import {removeQueuedTranscribeJob} from "@/lib/queue";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, taskAccessErrorResponse, updateTaskStatus} from "@/lib/tasks";
import {releaseQuotaForFailedTask} from "@/lib/usage";
import {logApiError} from "@/lib/api-logger";

const cancellableStatuses = new Set(["UPLOADING", "QUEUED", "PROCESSING", "TRANSCRIBING", "ANALYZING"]);

export async function POST(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "write", request.headers);
    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      select: {id: true, status: true}
    });

    if (!task) return NextResponse.json({error: "转写任务不存在。"}, {status: 404});
    if (!cancellableStatuses.has(task.status)) {
      return NextResponse.json({error: "当前转写状态不允许取消。"}, {status: 409});
    }

    const removedJobs = await removeQueuedTranscribeJob(task.id);
    await releaseQuotaForFailedTask(task.id);
    const updated = await updateTaskStatus(task.id, "CANCELED", {
        status: "CANCELED",
        progress: 100,
        statusMessage: removedJobs ? "已取消排队中的转写任务。" : "转写任务已取消。",
        errorCode: "CANCELED_BY_USER"
    });

    return NextResponse.json({task: updated, removedJobs});
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法取消转写。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
