import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {createDownloadUrl} from "@/lib/storage";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";
import {isGoogleDriveShareUrl, resolveGoogleDriveDownloadUrl} from "@/server/media/prepare";
import {logApiError} from "@/lib/api-logger";

async function resolveUrl(task: {objectKey: string | null; normalizedUrl: string | null; sourceUrl: string; sourceType: string}) {
  if (task.normalizedUrl) return task.normalizedUrl;
  if (task.objectKey) return createDownloadUrl(task.objectKey);
  if (isGoogleDriveShareUrl(task.sourceUrl)) return resolveGoogleDriveDownloadUrl(task.sourceUrl);
  return task.sourceUrl;
}

export async function GET(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "read", request.headers);
    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      select: {objectKey: true, normalizedUrl: true, sourceUrl: true, sourceType: true, originalName: true}
    });
    if (!task) return NextResponse.json({error: "转写任务不存在。"}, {status: 404});
    const url = await resolveUrl(task);
    return NextResponse.json({url, fileName: task.originalName, sourceType: task.sourceType});
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    return NextResponse.json({error: error instanceof Error ? error.message : "无法创建音频下载链接。"}, {status: 400});
  }
}
