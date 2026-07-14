import {NextResponse} from "next/server";
import {z} from "zod";
import {
  normalizeMediaUrl,
  resolveGoogleDriveDownloadUrl,
  resolveMediaMetadata,
  resolveMediaSourceProvider,
  type MediaSourceProvider,
  type YoutubeStreamFormat
} from "@/server/media/prepare";
import {logApiError} from "@/lib/api-logger";
import {MediaUrlValidationError} from "@/lib/media-url";

const resolveSchema = z.object({
  url: z.string().trim().min(1).max(2048)
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
  const title = filenameFromUrl(url);
  return title && title !== "watch" ? title : `${providerLabels[provider]} 媒体`;
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
    let formats: YoutubeStreamFormat[] | undefined;
    let audioStream: YoutubeStreamFormat | undefined;

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
        formats = "formats" in metadata ? metadata.formats : undefined;
        audioStream = "audioStream" in metadata ? metadata.audioStream : undefined;
        resolvedUrl = metadata.sourceUrl || sourceUrl;
        contentType = audioStream?.mimeType.split(";")[0] || (metadata.extension ? `video/${metadata.extension}` : undefined);
      } catch (error) {
        logApiError(error, request);
        warnings.push("无法读取媒体元数据，已使用链接标题继续。");
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
      formats,
      audioStream,
      warnings
    });
  } catch (error) {
    if (!(error instanceof z.ZodError) && !(error instanceof MediaUrlValidationError)) {
      logApiError(error, request);
    }
    const message = error instanceof Error ? error.message : "无法解析媒体链接。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
