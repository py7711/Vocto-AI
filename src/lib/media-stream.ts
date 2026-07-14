export type BrowserAudioStream = {
  url: string;
  mimeType: string;
  contentLength?: number;
};

export type BrowserTransferStream = BrowserAudioStream & {
  kind: "audio" | "video";
};

export type ExtractedMediaFormat = {
  url?: string;
  mime_type?: string;
  ext?: string;
  acodec?: string;
  vcodec?: string;
  abr?: number;
  tbr?: number;
  filesize?: number;
  filesize_approx?: number;
};

function audioMimeType(format: ExtractedMediaFormat) {
  if (format.mime_type?.startsWith("audio/")) return format.mime_type;
  if (format.ext === "m4a" || format.ext === "mp4") return "audio/mp4";
  if (format.ext === "mp3") return "audio/mpeg";
  return `audio/${format.ext || "unknown"}`;
}

export function selectBrowserAudioStream(formats: ExtractedMediaFormat[]): BrowserAudioStream | undefined {
  const selected = formats
    .filter((format) => format.url?.startsWith("https://") && Boolean(format.acodec && format.acodec !== "none") && format.vcodec === "none")
    .sort((left, right) => (right.abr ?? right.tbr ?? 0) - (left.abr ?? left.tbr ?? 0))[0];
  if (!selected?.url) return undefined;
  return {
    url: selected.url,
    mimeType: audioMimeType(selected),
    contentLength: selected.filesize || selected.filesize_approx
  };
}

export function selectBrowserTransferStream(formats: ExtractedMediaFormat[]): BrowserTransferStream | undefined {
  const audio = selectBrowserAudioStream(formats);
  if (audio) return {...audio, kind: "audio"};
  const selected = formats
    .filter((format) => format.url?.startsWith("https://")
      && Boolean(format.acodec && format.acodec !== "none")
      && Boolean(format.vcodec && format.vcodec !== "none"))
    .sort((left, right) => {
      const leftSize = left.filesize || left.filesize_approx;
      const rightSize = right.filesize || right.filesize_approx;
      if (leftSize && rightSize) return leftSize - rightSize;
      return (left.tbr ?? 0) - (right.tbr ?? 0);
    })[0];
  if (!selected?.url) return undefined;
  return {
    kind: "video",
    url: selected.url,
    mimeType: `video/${selected.ext || "mp4"}`,
    contentLength: selected.filesize || selected.filesize_approx
  };
}
