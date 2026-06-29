import {NextResponse} from "next/server";
import {z} from "zod";
import {
  normalizeMediaUrl,
  resolveGoogleDriveDownloadUrl,
  resolveMediaMetadata,
  resolveMediaSourceProvider,
  type MediaSourceProvider
} from "@/server/media/prepare";

const resolveSchema = z.object({
  url: z.string().min(1)
});

const providerLabels: Record<MediaSourceProvider, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X / Twitter",
  vimeo: "Vimeo",
  google_drive: "Google Drive",
  generic: "媒体链接"
};

function filenameFromUrl(url: string) {
  const parsed = new URL(url);
  const last = parsed.pathname.split("/").filter(Boolean).pop();
  if (!last) return undefined;
  return decodeURIComponent(last).replace(/\+/g, " ");
}

function titleFromUrl(url: string, provider: MediaSourceProvider) {
  return filenameFromUrl(url) || `${providerLabels[provider]} 媒体`;
}

function sourceTypeForProvider(provider: MediaSourceProvider) {
  return provider === "google_drive" ? "GOOGLE_DRIVE" : "YOUTUBE";
}

export async function POST(request: Request) {
  try {
    const input = resolveSchema.parse(await request.json());
    const sourceUrl = normalizeMediaUrl(input.url);
    const provider = resolveMediaSourceProvider(sourceUrl);
    const warnings: string[] = [];
    let resolvedUrl = sourceUrl;
    let title = provider === "google_drive" ? "Google Drive 文件" : titleFromUrl(sourceUrl, provider);
    let durationSeconds: number | undefined;
    let contentLength: number | undefined;
    let contentType: string | undefined;
    let thumbnailUrl: string | undefined;

    if (provider === "google_drive") {
      resolvedUrl = resolveGoogleDriveDownloadUrl(sourceUrl);
      warnings.push("Google Drive 文件必须设置为知道链接即可访问。");
    } else {
      try {
        const metadata = await resolveMediaMetadata(sourceUrl);
        title = metadata.title || title;
        durationSeconds = metadata.durationSeconds;
        contentLength = metadata.contentLength;
        thumbnailUrl = metadata.thumbnailUrl;
        resolvedUrl = metadata.sourceUrl || sourceUrl;
        contentType = metadata.extension ? `video/${metadata.extension}` : undefined;
      } catch (error) {
        warnings.push(error instanceof Error && (error.message.includes("yt-dlp is not installed") || error.message.includes("yt-dlp 未安装"))
          ? "服务器未安装 yt-dlp，暂时无法读取详细媒体元数据。"
          : "暂时无法读取详细媒体元数据，转写开始后 Worker 会重试。");
      }
    }

    return NextResponse.json({
      sourceUrl,
      resolvedUrl,
      provider,
      providerLabel: providerLabels[provider],
      sourceType: sourceTypeForProvider(provider),
      title,
      filename: provider === "google_drive" ? "Google Drive 文件" : title,
      durationSeconds,
      contentLength,
      contentType,
      thumbnailUrl,
      warnings
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法解析媒体链接。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
