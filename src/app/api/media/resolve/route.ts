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
import type {BrowserAudioStream, BrowserTransferStream} from "@/lib/media-stream";

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
  generic: "URL"
};

function filenameFromUrl(url: string) {
  const parsed = new URL(url);
  const last = parsed.pathname.split("/").filter(Boolean).pop();
  if (!last) return undefined;
  return decodeURIComponent(last).replace(/\+/g, " ");
}

function titleFromUrl(url: string, provider: MediaSourceProvider) {
  const title = filenameFromUrl(url);
  return title && title !== "watch" ? title : providerLabels[provider];
}

function sourceTypeForProvider(provider: MediaSourceProvider) {
  return provider === "google_drive" ? "GOOGLE_DRIVE" : "YOUTUBE";
}

export async function POST(request: Request) {
  try {
    const input = resolveSchema.parse(await request.json());
    const sourceUrl = normalizeMediaUrl(input.url);
    const provider = resolveMediaSourceProvider(sourceUrl);
    let resolvedUrl = sourceUrl;
    let title = provider === "google_drive" ? "Google Drive" : titleFromUrl(sourceUrl, provider);
    let durationSeconds: number | undefined;
    let contentLength: number | undefined;
    let contentType: string | undefined;
    let thumbnailUrl: string | undefined;
    let formats: YoutubeStreamFormat[] | undefined;
    let audioStream: BrowserAudioStream | undefined;
    let browserStream: BrowserTransferStream | undefined;

    if (provider === "google_drive") {
      resolvedUrl = resolveGoogleDriveDownloadUrl(sourceUrl);
    } else {
      try {
        const metadata = await resolveMediaMetadata(sourceUrl);
        const streamMetadata = metadata as typeof metadata & {
          formats?: YoutubeStreamFormat[];
          audioStream?: BrowserAudioStream;
          browserStream?: BrowserTransferStream;
        };
        title = metadata.title || title;
        durationSeconds = metadata.durationSeconds;
        contentLength = metadata.contentLength;
        thumbnailUrl = metadata.thumbnailUrl;
        formats = streamMetadata.formats;
        audioStream = streamMetadata.audioStream;
        browserStream = streamMetadata.browserStream || (audioStream ? {...audioStream, kind: "audio"} : undefined);
        resolvedUrl = metadata.sourceUrl || sourceUrl;
        contentType = audioStream?.mimeType.split(";")[0] || (metadata.extension ? `video/${metadata.extension}` : undefined);
      } catch (error) {
        logApiError(error, request);
      }
    }

    return NextResponse.json({
      sourceUrl,
      resolvedUrl,
      provider,
      providerLabel: providerLabels[provider],
      sourceType: sourceTypeForProvider(provider),
      title,
      filename: provider === "google_drive" ? "Google Drive" : title,
      durationSeconds,
      contentLength,
      contentType,
      thumbnailUrl,
      formats,
      audioStream,
      browserStream,
      warnings: []
    });
  } catch (error) {
    if (!(error instanceof z.ZodError) && !(error instanceof MediaUrlValidationError)) {
      logApiError(error, request);
    }
    const message = error instanceof Error ? error.message : "无法解析媒体链接。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
