import {NextResponse} from "next/server";
import {getPublicShare} from "@/lib/share-links";
import {logApiError} from "@/lib/api-logger";

function serializeShare(share: NonNullable<Awaited<ReturnType<typeof getPublicShare>>>) {
  const task = share.mediaTask;
  const transcript = task.transcript;

  return {
    id: share.id,
    code: share.tokenHash,
    title: share.title,
    enabled: share.enabled,
    expiresAt: share.expiresAt,
    accessCount: share.accessCount,
    lastAccessAt: share.lastAccessAt,
    createdAt: share.createdAt,
    mediaTaskId: share.mediaTaskId,
    transcription: {
      ...task,
      transcriptionFileId: task.id,
      fileId: task.id,
      filename: task.originalName,
      languageCode: task.language,
      transcript,
      summary: transcript?.summary ?? null,
      translations: transcript?.translations ?? null
    }
  };
}

export async function GET(_request: Request, {params}: {params: {token: string}}) {
  try {
    const share = await getPublicShare(params.token);
    if (!share) {
      return NextResponse.json({error: "分享链接不存在或已过期。"}, {status: 404});
    }
    return NextResponse.json(serializeShare(share));
  } catch (error) {
    logApiError(error, _request);
    const message = error instanceof Error ? error.message : "无法读取分享链接。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
