import {NextResponse} from "next/server";
import {getPublicShare} from "@/lib/share-links";

function serializeShare(share: NonNullable<Awaited<ReturnType<typeof getPublicShare>>>) {
  // 旧分享详情接口返回 transcription/fileId/transcriptionFileId 等历史字段；
  // 新分享页直接读取规范公开接口，但旧客户端仍依赖这个响应形状。
  const task = share.mediaTask;
  const transcript = task.transcript;
  const summary = task.insights.find((item) => item.type === "SUMMARY") ?? null;
  const translations = task.insights.filter((item) => item.type === "TRANSLATION");

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
      summary,
      translations
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
    const message = error instanceof Error ? error.message : "无法读取分享链接。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
