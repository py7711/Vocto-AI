import {normalizePublicMediaUrl} from "@/lib/media-url";

export type MediaSourceProvider =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "x"
  | "vimeo"
  | "google_drive"
  | "generic";

export function resolveMediaSourceProvider(url: string): MediaSourceProvider {
  const parsed = new URL(normalizePublicMediaUrl(url));
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

  if (host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com")) return "youtube";
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
  if (host === "instagram.com" || host.endsWith(".instagram.com")) return "instagram";
  if (host === "facebook.com" || host === "fb.watch" || host.endsWith(".facebook.com")) return "facebook";
  if (host === "x.com" || host === "twitter.com" || host.endsWith(".x.com") || host.endsWith(".twitter.com")) return "x";
  if (host === "vimeo.com" || host.endsWith(".vimeo.com")) return "vimeo";
  if (host === "drive.google.com" || host.endsWith(".drive.google.com") || host === "docs.google.com" || host.endsWith(".docs.google.com")) return "google_drive";

  return "generic";
}
