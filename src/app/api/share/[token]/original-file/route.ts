import {NextResponse} from "next/server";
import {createDownloadUrl} from "@/lib/storage";
import {getPublicShare} from "@/lib/share-links";
import {isGoogleDriveShareUrl, resolveGoogleDriveDownloadUrl, resolveYoutubeAudioUrl} from "@/server/media/prepare";
import {logApiError} from "@/lib/api-logger";

async function resolvePlayableUrl(task: {objectKey: string | null; normalizedUrl: string | null; sourceUrl: string; sourceType: string}) {
  if (task.objectKey) return createDownloadUrl(task.objectKey);
  if (task.normalizedUrl) return task.normalizedUrl;
  if (task.sourceType === "YOUTUBE") return resolveYoutubeAudioUrl(task.sourceUrl);
  if (isGoogleDriveShareUrl(task.sourceUrl)) return resolveGoogleDriveDownloadUrl(task.sourceUrl);
  return task.sourceUrl;
}

export async function GET(_: Request, {params}: {params: {token: string}}) {
  try {
    const share = await getPublicShare(params.token);
    if (!share) {
      return NextResponse.json({error: "分享链接不可用或已过期。"}, {status: 404});
    }

    const task = share.mediaTask;
    const url = await resolvePlayableUrl(task);
    if (!url) {
      return NextResponse.json({error: "原始媒体不可用。"}, {status: 404});
    }

    return NextResponse.json({
      url,
      fileName: task.originalName,
      sourceType: task.sourceType,
      storedObject: Boolean(task.objectKey)
    });
  } catch (error) {
    logApiError(error, _);
    const message = error instanceof Error ? error.message : "无法创建原始媒体链接。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
