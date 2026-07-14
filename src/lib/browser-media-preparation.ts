import type {BrowserAudioStream, BrowserTransferStream} from "@/lib/media-stream";

export type BrowserCapabilities = {
  supportsWebAssembly: boolean;
  deviceMemoryGb?: number;
  mobile: boolean;
};

type LocalMediaInput = {
  kind: "local";
  contentType: string;
  sizeBytes: number;
  browser: BrowserCapabilities;
};

type RemoteMediaInput = {
  kind: "remote";
  streamKind?: "audio" | "video";
  audioStreamUrl?: string;
  contentType?: string;
  sizeBytes?: number;
  browser: {
    supportsFetch: boolean;
    supportsWebAssembly?: boolean;
    deviceMemoryGb?: number;
    mobile?: boolean;
  };
};

export type MediaPreparationPlan = {
  strategy: "browser_extract_audio" | "direct_upload" | "browser_upload_audio" | "browser_extract_remote_audio" | "worker";
};

const desktopExtractionLimitBytes = 300 * 1024 * 1024;
const mobileExtractionLimitBytes = 100 * 1024 * 1024;
const remoteAudioLimitBytes = 300 * 1024 * 1024;
const remoteMobileAudioLimitBytes = 100 * 1024 * 1024;
const remoteDesktopVideoLimitBytes = 100 * 1024 * 1024;
const remoteMobileVideoLimitBytes = 50 * 1024 * 1024;
const multipartPartSizeBytes = 5 * 1024 * 1024;

export type PreparedUpload = {
  key: string;
  publicUrl: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
};

export type RemoteAudioInput = {
  url: string;
  contentType?: string;
  sizeBytes?: number;
  fileName: string;
};

export type RemoteTaskSourceInput = {
  sourceType: "YOUTUBE";
  sourceUrl: string;
  title: string;
  fileName?: string;
  durationSeconds?: number;
  audioStream?: BrowserAudioStream;
  browserStream?: BrowserTransferStream;
};

export type PreparedTaskSource = {
  sourceType: "UPLOAD" | "YOUTUBE";
  sourceUrl: string;
  objectKey?: string;
  originalName: string;
  fileSizeBytes?: number;
  durationSeconds?: number;
};

let ffmpegPromise: Promise<import("@ffmpeg/ffmpeg").FFmpeg> | undefined;

class MultipartAbortError extends Error {
  constructor() {
    super("Unable to abort the failed multipart upload.");
    this.name = "MultipartAbortError";
  }
}

export function planMediaPreparation(input: LocalMediaInput | RemoteMediaInput): MediaPreparationPlan {
  if (input.kind === "remote") {
    if (input.streamKind === "video") {
      const sizeLimit = input.browser.mobile ? remoteMobileVideoLimitBytes : remoteDesktopVideoLimitBytes;
      const hasEnoughMemory = input.browser.deviceMemoryGb === undefined
        ? !input.browser.mobile
        : input.browser.deviceMemoryGb >= 4;
      if (
        input.audioStreamUrl
        && input.browser.supportsFetch
        && input.browser.supportsWebAssembly
        && hasEnoughMemory
        && (input.sizeBytes === undefined || input.sizeBytes <= sizeLimit)
      ) {
        return {strategy: "browser_extract_remote_audio"};
      }
      return {strategy: "worker"};
    }
    if (
      input.audioStreamUrl
      && input.browser.supportsFetch
      && (input.sizeBytes === undefined || input.sizeBytes <= (input.browser.mobile ? remoteMobileAudioLimitBytes : remoteAudioLimitBytes))
    ) {
      return {strategy: "browser_upload_audio"};
    }
    return {strategy: "worker"};
  }
  if (input.contentType.startsWith("audio/")) {
    return {strategy: "direct_upload"};
  }
  const sizeLimit = input.browser.mobile ? mobileExtractionLimitBytes : desktopExtractionLimitBytes;
  const hasEnoughMemory = input.browser.deviceMemoryGb === undefined
    ? !input.browser.mobile
    : input.browser.deviceMemoryGb >= 4;
  if (
    input.contentType.startsWith("video/")
    && input.browser.supportsWebAssembly
    && hasEnoughMemory
    && input.sizeBytes <= sizeLimit
  ) {
    return {strategy: "browser_extract_audio"};
  }
  return {strategy: "direct_upload"};
}

async function readJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const body = await response.json().catch(() => ({})) as {error?: string};
  if (!response.ok) throw new Error(body.error || fallbackMessage);
  return body as T;
}

async function readResponseBlobWithLimit(response: Response, limitBytes: number, contentType: string) {
  if (!response.body) {
    const blob = await response.blob();
    return blob.size > 0 && blob.size <= limitBytes ? blob : null;
  }
  const reader = response.body.getReader();
  const chunks: ArrayBuffer[] = [];
  let total = 0;
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limitBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(Uint8Array.from(value).buffer);
  }
  return total ? new Blob(chunks, {type: contentType}) : null;
}

function isMediaResponse(response: Response) {
  const contentType = response.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  return !contentType
    || contentType.startsWith("audio/")
    || contentType.startsWith("video/")
    || contentType === "application/octet-stream";
}

async function abortMultipartSession(uploadId: string) {
  const url = `/api/upload/multipart/${encodeURIComponent(uploadId)}/abort`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {method: "POST"});
      if (response.ok) return;
    } catch {
      // 网络恢复后继续重试同一个清理请求。
    }
  }
  throw new MultipartAbortError();
}

export async function uploadBlobToR2(blob: Blob, input: {fileName: string; contentType: string}): Promise<PreparedUpload> {
  const session = await fetch("/api/upload/multipart/create", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({filename: input.fileName, contentType: input.contentType, sizeBytes: blob.size})
  }).then((response) => readJsonResponse<{
    uploadId: string;
    key: string;
    publicUrl: string;
  }>(response, "Unable to create the upload session."));

  try {
    const parts: Array<{PartNumber: number; ETag: string}> = [];
    const partCount = Math.ceil(blob.size / multipartPartSizeBytes);
    for (let partNumber = 1; partNumber <= partCount; partNumber += 1) {
      const signed = await fetch(
        `/api/upload/multipart/${encodeURIComponent(session.uploadId)}/part/${partNumber}/sign`,
        {method: "POST"}
      ).then((response) => readJsonResponse<{url: string}>(response, "Unable to sign the upload part."));
      const start = (partNumber - 1) * multipartPartSizeBytes;
      const uploaded = await fetch(signed.url, {
        method: "PUT",
        body: blob.slice(start, Math.min(start + multipartPartSizeBytes, blob.size))
      });
      if (!uploaded.ok) throw new Error(`Unable to upload media part ${partNumber}.`);
      const etag = uploaded.headers.get("etag");
      if (!etag) throw new Error("The storage response did not expose an ETag header.");
      parts.push({PartNumber: partNumber, ETag: etag});
    }

    const completed = await fetch(`/api/upload/multipart/${encodeURIComponent(session.uploadId)}/complete`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({parts})
    }).then((response) => readJsonResponse<{key?: string; publicUrl?: string}>(response, "Unable to complete the upload."));

    return {
      key: completed.key || session.key,
      publicUrl: completed.publicUrl || session.publicUrl,
      fileName: input.fileName,
      contentType: input.contentType,
      sizeBytes: blob.size
    };
  } catch (error) {
    await abortMultipartSession(session.uploadId);
    throw error;
  }
}

async function uploadBlobWithSignedPut(blob: Blob, input: {fileName: string; contentType: string}): Promise<PreparedUpload> {
  const signed = await fetch("/api/uploads", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({fileName: input.fileName, contentType: input.contentType, sizeBytes: blob.size})
  }).then((response) => readJsonResponse<{
    key: string;
    uploadUrl: string;
    publicUrl: string;
  }>(response, "Unable to create an upload URL."));
  const uploaded = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: {"Content-Type": input.contentType},
    body: blob
  });
  if (!uploaded.ok) throw new Error("Unable to upload the prepared media.");
  return {
    key: signed.key,
    publicUrl: signed.publicUrl,
    fileName: input.fileName,
    contentType: input.contentType,
    sizeBytes: blob.size
  };
}

async function uploadPreparedBlob(blob: Blob, input: {fileName: string; contentType: string}) {
  try {
    return await uploadBlobToR2(blob, input);
  } catch (error) {
    if (error instanceof MultipartAbortError) throw error;
    return uploadBlobWithSignedPut(blob, input);
  }
}

function browserCapabilities(): BrowserCapabilities {
  if (typeof navigator === "undefined") {
    return {supportsWebAssembly: typeof WebAssembly === "object", mobile: false};
  }
  const navigatorWithMemory = navigator as Navigator & {deviceMemory?: number; userAgentData?: {mobile?: boolean}};
  return {
    supportsWebAssembly: typeof WebAssembly === "object",
    deviceMemoryGb: navigatorWithMemory.deviceMemory,
    mobile: navigatorWithMemory.userAgentData?.mobile
      ?? /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  };
}

function extensionFromFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension && /^[a-z0-9]{1,8}$/.test(extension) ? extension : "bin";
}

function mediaContentType(file: File) {
  if (file.type) return file.type;
  const extension = extensionFromFileName(file.name);
  if (["mp4", "mov", "mkv", "webm", "wmv", "mpeg", "mpg"].includes(extension)) return `video/${extension}`;
  if (["mp3", "wav", "m4a", "aac", "flac", "ogg", "opus"].includes(extension)) return `audio/${extension}`;
  return "application/octet-stream";
}

async function loadFfmpeg() {
  if (!ffmpegPromise) {
    ffmpegPromise = import("@ffmpeg/ffmpeg").then(async ({FFmpeg}) => {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: "/api/media/ffmpeg-core/core.js",
        wasmURL: "/api/media/ffmpeg-core/core.wasm"
      });
      return ffmpeg;
    }).catch((error) => {
      ffmpegPromise = undefined;
      throw error;
    });
  }
  return ffmpegPromise;
}

async function extractAudio(file: File) {
  const ffmpeg = await loadFfmpeg();
  const id = crypto.randomUUID();
  const inputPath = `input-${id}.${extensionFromFileName(file.name)}`;
  const outputPath = `audio-${id}.mp3`;
  try {
    await ffmpeg.writeFile(inputPath, new Uint8Array(await file.arrayBuffer()));
    const exitCode = await ffmpeg.exec([
      "-i", inputPath,
      "-vn",
      "-ac", "1",
      "-ar", "16000",
      "-c:a", "libmp3lame",
      "-b:a", "48k",
      outputPath
    ], 20 * 60_000);
    if (exitCode !== 0) throw new Error(`Browser audio extraction failed with exit code ${exitCode}.`);
    const output = await ffmpeg.readFile(outputPath);
    if (!(output instanceof Uint8Array)) throw new Error("Browser audio extraction returned invalid data.");
    const audioBytes = Uint8Array.from(output);
    return new Blob([audioBytes.buffer], {type: "audio/mpeg"});
  } finally {
    await ffmpeg.deleteFile(inputPath).catch(() => undefined);
    await ffmpeg.deleteFile(outputPath).catch(() => undefined);
  }
}

function audioFileName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "").trim() || "audio";
  return `${baseName}.mp3`;
}

export async function prepareAndUploadLocalMedia(file: File): Promise<PreparedUpload> {
  const contentType = mediaContentType(file);
  const plan = planMediaPreparation({
    kind: "local",
    contentType,
    sizeBytes: file.size,
    browser: browserCapabilities()
  });
  if (plan.strategy === "browser_extract_audio") {
    try {
      const audio = await extractAudio(file);
      return await uploadPreparedBlob(audio, {fileName: audioFileName(file.name), contentType: "audio/mpeg"});
    } catch (error) {
      if (error instanceof MultipartAbortError) throw error;
      // 浏览器能力、内存或编解码失败时上传原文件，Worker 继续完成音频提取。
    }
  }
  return uploadPreparedBlob(file, {fileName: file.name, contentType});
}

export async function tryUploadRemoteAudioToR2(input: RemoteAudioInput): Promise<PreparedUpload | null> {
  const capabilities = browserCapabilities();
  const plan = planMediaPreparation({
    kind: "remote",
    audioStreamUrl: input.url,
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
    browser: {supportsFetch: typeof fetch === "function", mobile: capabilities.mobile}
  });
  if (plan.strategy !== "browser_upload_audio") return null;

  try {
    const response = await fetch(input.url, {signal: AbortSignal.timeout(2 * 60_000)});
    if (!response.ok || !isMediaResponse(response)) return null;
    const sizeLimit = capabilities.mobile ? remoteMobileAudioLimitBytes : remoteAudioLimitBytes;
    const declaredLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > sizeLimit) return null;
    const audio = await readResponseBlobWithLimit(
      response,
      sizeLimit,
      input.contentType || response.headers.get("content-type") || "audio/mp4"
    );
    if (!audio) return null;
    return await uploadPreparedBlob(audio, {
      fileName: input.fileName,
      contentType: input.contentType || audio.type || "audio/mp4"
    });
  } catch (error) {
    if (error instanceof MultipartAbortError) throw error;
    return null;
  }
}

async function tryExtractRemoteVideoToR2(input: RemoteAudioInput): Promise<PreparedUpload | null> {
  const capabilities = browserCapabilities();
  const plan = planMediaPreparation({
    kind: "remote",
    streamKind: "video",
    audioStreamUrl: input.url,
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
    browser: {supportsFetch: typeof fetch === "function", ...capabilities}
  });
  if (plan.strategy !== "browser_extract_remote_audio") return null;
  const sizeLimit = capabilities.mobile ? remoteMobileVideoLimitBytes : remoteDesktopVideoLimitBytes;
  try {
    const response = await fetch(input.url, {signal: AbortSignal.timeout(2 * 60_000)});
    if (!response.ok || !isMediaResponse(response)) return null;
    const declaredLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > sizeLimit) return null;
    const video = await readResponseBlobWithLimit(
      response,
      sizeLimit,
      input.contentType || response.headers.get("content-type") || "video/mp4"
    );
    if (!video) return null;
    const source = new File([video], input.fileName, {type: input.contentType || video.type || "video/mp4"});
    const audio = await extractAudio(source);
    return await uploadPreparedBlob(audio, {fileName: audioFileName(input.fileName), contentType: "audio/mpeg"});
  } catch (error) {
    if (error instanceof MultipartAbortError) throw error;
    return null;
  }
}

export async function prepareRemoteMediaForTask(input: RemoteTaskSourceInput): Promise<PreparedTaskSource> {
  const fallback: PreparedTaskSource = {
    sourceType: input.sourceType,
    sourceUrl: input.sourceUrl,
    originalName: input.fileName || input.title,
    durationSeconds: input.durationSeconds
  };
  const browserStream = input.browserStream
    ?? (input.audioStream ? {...input.audioStream, kind: "audio" as const} : undefined);
  if (!browserStream?.url) return fallback;
  const extension = browserStream.mimeType.includes("webm")
    ? "webm"
    : browserStream.mimeType.includes("mpeg")
      ? "mp3"
      : browserStream.kind === "video"
        ? "mp4"
        : "m4a";
  const transferInput = {
    url: browserStream.url,
    contentType: browserStream.mimeType,
    sizeBytes: browserStream.contentLength,
    fileName: `${input.title.replace(/\.[^.]+$/, "")}.${extension}`
  };
  const prepared = browserStream.kind === "video"
    ? await tryExtractRemoteVideoToR2(transferInput)
    : await tryUploadRemoteAudioToR2(transferInput);
  if (!prepared) return fallback;
  return {
    sourceType: "UPLOAD",
    sourceUrl: prepared.publicUrl,
    objectKey: prepared.key,
    originalName: prepared.fileName,
    fileSizeBytes: prepared.sizeBytes,
    durationSeconds: input.durationSeconds
  };
}
