import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {createDownloadUrl, deleteObject} from "@/lib/storage";
import {assertTaskAccess, publishTaskUpdate, taskAccessErrorResponse} from "@/lib/tasks";
import {isGoogleDriveShareUrl, resolveGoogleDriveDownloadUrl} from "@/server/media/prepare";
import {logApiError} from "@/lib/api-logger";

type PlayableAsset = {
  kind: string;
  url: string;
  objectKey: string | null;
  fileName: string | null;
};

async function resolveAssetUrl(asset: PlayableAsset | null | undefined) {
  if (!asset) return null;
  if (asset.objectKey) return createDownloadUrl(asset.objectKey);
  return asset.url;
}

async function resolvePlayableUrl(task: {
  objectKey: string | null;
  normalizedUrl: string | null;
  sourceUrl: string;
  sourceType: string;
  mediaAssets?: PlayableAsset[];
}) {
  const normalizedAsset = task.mediaAssets?.find((asset) => asset.kind === "NORMALIZED_AUDIO");
  const sourceAsset = task.mediaAssets?.find((asset) => asset.kind === "SOURCE_MEDIA");
  const chunkAsset = task.mediaAssets?.find((asset) => asset.kind === "AUDIO_CHUNK");
  const assetUrl = await resolveAssetUrl(normalizedAsset ?? sourceAsset ?? chunkAsset);
  if (assetUrl) return assetUrl;
  if (task.objectKey) return createDownloadUrl(task.objectKey);
  if (task.normalizedUrl) return task.normalizedUrl;
  if (isGoogleDriveShareUrl(task.sourceUrl)) return resolveGoogleDriveDownloadUrl(task.sourceUrl);
  return task.sourceUrl;
}

export async function GET(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "read", request.headers);
    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      select: {
        objectKey: true,
        normalizedUrl: true,
        sourceUrl: true,
        originalName: true,
        sourceType: true,
        mediaAssets: {
          select: {kind: true, url: true, objectKey: true, fileName: true},
          orderBy: [{kind: "asc"}, {chunkIndex: "asc"}]
        }
      }
    });

    if (!task) return NextResponse.json({error: "转写任务不存在。"}, {status: 404});

    const url = await resolvePlayableUrl(task);
    if (!url) return NextResponse.json({error: "原始媒体不可用。"}, {status: 404});

    return NextResponse.json({
      url,
      fileName: task.originalName,
      sourceType: task.sourceType,
      storedObject: Boolean(task.objectKey)
    });
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法创建原始媒体下载链接。";
    return NextResponse.json({error: message}, {status: 400});
  }
}

export async function DELETE(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "write", request.headers);
    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      select: {objectKey: true}
    });

    if (!task) return NextResponse.json({error: "转写任务不存在。"}, {status: 404});
    if (task.objectKey) {
      await deleteObject(task.objectKey);
    }

    await prisma.mediaTask.update({
      where: {id: params.taskId},
      data: {
        objectKey: null,
        sourceUrl: "",
        normalizedUrl: null
      }
    });
    await publishTaskUpdate(params.taskId);

    return NextResponse.json({ok: true});
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法删除原始媒体。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
