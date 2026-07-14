import {z} from "zod";

const youtubeVideoIdPattern = /^[A-Za-z0-9_-]{11}$/;

export function extractYoutubeVideoId(input: string) {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 2048) return null;

  try {
    const value = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    let videoId: string | null = null;

    if (host === "youtu.be") {
      videoId = parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      videoId = parsed.searchParams.get("v");
      if (!videoId) {
        const parts = parsed.pathname.split("/").filter(Boolean);
        const marker = parts.findIndex((part) => part === "embed" || part === "shorts" || part === "live");
        videoId = marker >= 0 ? parts[marker + 1] ?? null : null;
      }
    }

    return videoId && youtubeVideoIdPattern.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

export function canonicalizeYoutubeUrl(input: string) {
  const videoId = extractYoutubeVideoId(input);
  if (!videoId) throw new Error("请提供有效的 YouTube 视频链接。");
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export const youtubeUrlSchema = z.string().trim().min(1).max(2048).transform((value, context) => {
  try {
    return canonicalizeYoutubeUrl(value);
  } catch (error) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: error instanceof Error ? error.message : "YouTube 链接无效。"
    });
    return z.NEVER;
  }
});
