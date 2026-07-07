import {spawn} from "node:child_process";
import {createReadStream, createWriteStream} from "node:fs";
import {mkdtemp, readdir, readFile, rm, stat} from "node:fs/promises";
import {tmpdir} from "node:os";
import {basename, extname, join} from "node:path";
import {Readable} from "node:stream";
import {Transform} from "node:stream";
import {pipeline} from "node:stream/promises";
import {normalizeDurationSeconds} from "@/lib/duration";
import {env} from "@/lib/env";
import {prisma} from "@/lib/prisma";
import {createDownloadUrl, putObject} from "@/lib/storage";

export type MediaSourceProvider =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "x"
  | "vimeo"
  | "google_drive"
  | "generic";

const DEFAULT_TIMEOUT_MS = 60_000;
const audioContentType = "audio/mpeg";

type CommandSpec = {
  command: string;
  args: string[];
};

function commandLabel(spec: CommandSpec) {
  return [spec.command, ...spec.args].join(" ");
}

function executableNotFound(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function toolUnavailableMessage(message: string) {
  return /is not installed or is not available in PATH/i.test(message) ||
    /未安装，或不在 PATH 中/.test(message) ||
    /No module named yt_dlp/i.test(message);
}

function friendlyToolError(command: string, error: unknown) {
  if (executableNotFound(error)) {
    return new Error(`${command} 未安装，或不在 PATH 中。`);
  }

  return error;
}

function ytDlpCandidates() {
  const candidates: CommandSpec[] = [];

  // 生产环境经常把 yt-dlp 安装在虚拟环境、容器层或自定义路径里；
  // 显式配置 YT_DLP_PATH 时优先使用，避免依赖 Node 进程的 PATH 是否完整。
  if (env.YT_DLP_PATH) {
    candidates.push({command: env.YT_DLP_PATH, args: []});
  }

  // 兼容三种常见部署方式：
  // 1. 系统命令：brew/apt/pipx install yt-dlp 后通常可直接执行 `yt-dlp`。
  // 2. Python 模块：部分服务器只安装了 `python3 -m yt_dlp`。
  // 3. 旧 Python 命令名：少数环境没有 python3 软链，但有 python。
  candidates.push(
    {command: "yt-dlp", args: []},
    {command: "python3", args: ["-m", "yt_dlp"]},
    {command: "python", args: ["-m", "yt_dlp"]}
  );

  return candidates;
}

function ytDlpUnavailableError(attempted: string[]) {
  return new Error(
    `yt-dlp 未安装或不可用。已尝试：${attempted.join(", ")}。请安装 yt-dlp，或将 YT_DLP_PATH 设置为可执行文件路径。`
  );
}

async function withYtDlp<T>(operation: (spec: CommandSpec) => Promise<T>) {
  const attempted: string[] = [];

  for (const candidate of ytDlpCandidates()) {
    attempted.push(commandLabel(candidate));
    try {
      return await operation(candidate);
    } catch (error) {
      if (executableNotFound(error)) continue;

      const message = error instanceof Error ? error.message : "";
      // collect/run 会把底层 ENOENT 包装成更友好的 Error 文案；这里根据文案继续尝试下一个候选，
      // 确保 PATH 中没有 yt-dlp 时还能继续探测 python3/python 模块安装方式。
      if (toolUnavailableMessage(message)) {
        continue;
      }

      throw error;
    }
  }

  throw ytDlpUnavailableError(attempted);
}

function collect(command: string, args: string[], timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise<string>((resolve, reject) => {
    // collect 用于读取 yt-dlp 的 stdout，例如媒体直链、字幕列表和元数据 JSON。
    // stderr 只在失败时作为错误详情返回，避免把工具自身日志混进业务解析结果。
    const child = spawn(command, args, {stdio: ["ignore", "pipe", "pipe"]});
    const chunks: Buffer[] = [];
    const errors: Buffer[] = [];
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`${command} 执行超过 ${Math.round(timeoutMs / 1000)} 秒后超时。`));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.stderr.on("data", (chunk) => errors.push(chunk));
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(friendlyToolError(command, error));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve(Buffer.concat(chunks).toString("utf8").trim());
      } else {
        reject(new Error(Buffer.concat(errors).toString("utf8") || `${command} 退出，退出码 ${code}`));
      }
    });
  });
}

function collectYtDlp(args: string[], timeoutMs = DEFAULT_TIMEOUT_MS) {
  return withYtDlp((spec) => collect(spec.command, [...spec.args, ...args], timeoutMs));
}

function run(command: string, args: string[], timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise<void>((resolve, reject) => {
    // run 只用于需要 yt-dlp 写临时文件的字幕下载；音频/视频转写走直链解析，不落地转码。
    const child = spawn(command, args, {stdio: "inherit"});
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`${command} 执行超过 ${Math.round(timeoutMs / 1000)} 秒后超时。`));
    }, timeoutMs);

    child.on("error", (error) => {
      clearTimeout(timer);
      reject(friendlyToolError(command, error));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} 退出，退出码 ${code}`));
      }
    });
  });
}

function runYtDlp(args: string[], timeoutMs = DEFAULT_TIMEOUT_MS) {
  return withYtDlp((spec) => run(spec.command, [...spec.args, ...args], timeoutMs));
}

function ffmpegCandidates() {
  return env.FFMPEG_PATH ? [env.FFMPEG_PATH, "ffmpeg"] : ["ffmpeg"];
}

function ffprobeCandidates() {
  return env.FFPROBE_PATH ? [env.FFPROBE_PATH, "ffprobe"] : ["ffprobe"];
}

async function withExecutable<T>(candidates: string[], operation: (command: string) => Promise<T>, label: string) {
  const attempted: string[] = [];
  let lastError: unknown;
  for (const command of candidates) {
    attempted.push(command);
    try {
      return await operation(command);
    } catch (error) {
      lastError = error;
      if (executableNotFound(error) || toolUnavailableMessage(error instanceof Error ? error.message : "")) continue;
      throw error;
    }
  }
  throw new Error(`${label} 未安装或不可用。已尝试：${attempted.join(", ")}。${lastError instanceof Error ? lastError.message : ""}`);
}

function runCapture(command: string, args: string[], timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise<{stdout: string; stderr: string}>((resolve, reject) => {
    const child = spawn(command, args, {stdio: ["ignore", "pipe", "pipe"]});
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`${command} 执行超过 ${Math.round(timeoutMs / 1000)} 秒后超时。`));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(friendlyToolError(command, error));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      const out = Buffer.concat(stdout).toString("utf8");
      const err = Buffer.concat(stderr).toString("utf8");
      if (code === 0) resolve({stdout: out, stderr: err});
      else reject(new Error(err || `${command} 退出，退出码 ${code}`));
    });
  });
}

function runFfmpeg(args: string[], timeoutMs = 20 * 60_000) {
  return withExecutable(ffmpegCandidates(), (command) => runCapture(command, args, timeoutMs), "FFmpeg");
}

function runFfprobe(args: string[], timeoutMs = DEFAULT_TIMEOUT_MS) {
  return withExecutable(ffprobeCandidates(), (command) => runCapture(command, args, timeoutMs), "FFprobe");
}

function safeMediaStem(value: string | undefined | null, fallback: string) {
  const raw = value ? basename(value, extname(value)) : fallback;
  const clean = raw
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
  return clean || fallback;
}

async function probeDurationSeconds(filePath: string) {
  const result = await runFfprobe([
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath
  ]);
  const duration = Number(result.stdout.trim());
  return Number.isFinite(duration) && duration > 0 ? duration : undefined;
}

function parseSilenceEnds(stderr: string) {
  return stderr
    .split("\n")
    .map((line) => line.match(/silence_end:\s*([\d.]+)/)?.[1])
    .filter(Boolean)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);
}

async function detectSilenceBoundaries(filePath: string) {
  const result = await runFfmpeg([
    "-hide_banner",
    "-nostats",
    "-i",
    filePath,
    "-af",
    "silencedetect=noise=-35dB:d=0.45",
    "-f",
    "null",
    "-"
  ], 10 * 60_000);
  return parseSilenceEnds(result.stderr);
}

function buildChunkRanges(durationSeconds: number, silenceEnds: number[]) {
  const target = env.AUDIO_CHUNK_TARGET_SECONDS;
  const min = Math.min(env.AUDIO_CHUNK_MIN_SECONDS, target);
  const max = Math.max(env.AUDIO_CHUNK_MAX_SECONDS, target);
  const ranges: Array<{start: number; end: number; index: number}> = [];
  let start = 0;
  let index = 0;

  while (durationSeconds - start > max) {
    const ideal = start + target;
    const minCut = start + min;
    const maxCut = start + max;
    const candidates = silenceEnds.filter((point) => point >= minCut && point <= maxCut);
    const cut = candidates.length
      ? candidates.reduce((best, point) => (Math.abs(point - ideal) < Math.abs(best - ideal) ? point : best), candidates[0])
      : Math.min(maxCut, durationSeconds);
    ranges.push({start, end: cut, index});
    start = cut;
    index += 1;
  }

  if (durationSeconds - start > 1) {
    ranges.push({start, end: durationSeconds, index});
  }

  return ranges.length ? ranges : [{start: 0, end: durationSeconds, index: 0}];
}

async function uploadFileToR2(input: {
  key: string;
  filePath: string;
  contentType: string;
}) {
  const fileStat = await stat(input.filePath);
  return putObject({
    key: input.key,
    body: createReadStream(input.filePath),
    contentType: input.contentType,
    contentLength: fileStat.size
  });
}

async function downloadRemoteMedia(input: {
  sourceUrl: string;
  sourceType: "UPLOAD" | "YOUTUBE" | "GOOGLE_DRIVE";
  objectKey?: string | null;
  directory: string;
  outputPath: string;
}) {
  if (input.sourceType === "YOUTUBE") {
    const outputTemplate = join(input.directory, "source.%(ext)s");
    await runYtDlp([
      "--no-playlist",
      "--format",
      "bestaudio/best",
      "--output",
      outputTemplate,
      input.sourceUrl
    ], 15 * 60_000);
    const files = await readdir(input.directory);
    const downloaded = files.find((file) => file.startsWith("source."));
    if (!downloaded) throw new Error("yt-dlp 未生成媒体文件。");
    return join(input.directory, downloaded);
  }

  const downloadUrl = input.sourceUrl.startsWith("r2://") && input.objectKey
    ? await createDownloadUrl(input.objectKey)
    : input.sourceUrl;
  const response = await fetch(downloadUrl);
  if (!response.ok || !response.body) {
    throw new Error(`无法下载媒体文件：${response.status} ${response.statusText}`);
  }
  let total = 0;
  const maxBytes = 6 * 1024 * 1024 * 1024;
  const readable = Readable.fromWeb(response.body as any);
  const limit = new Transform({
    transform(chunk, _encoding, callback) {
      total += Buffer.byteLength(chunk);
      if (total > maxBytes) {
        callback(new Error("媒体文件超过 6GB，无法进行服务端音频提取。"));
        return;
      }
      callback(null, chunk);
    }
  });
  await pipeline(readable, limit, createWriteStream(input.outputPath));
  return input.outputPath;
}

async function normalizeToAudio(inputPath: string, outputPath: string) {
  await runFfmpeg([
    "-y",
    "-i",
    inputPath,
    "-vn",
    "-ac",
    "1",
    "-ar",
    "16000",
    "-b:a",
    "96k",
    outputPath
  ], 20 * 60_000);
}

async function sliceAudio(input: {
  inputPath: string;
  outputPath: string;
  startSeconds: number;
  durationSeconds: number;
}) {
  await runFfmpeg([
    "-y",
    "-ss",
    String(input.startSeconds),
    "-t",
    String(input.durationSeconds),
    "-i",
    input.inputPath,
    "-c",
    "copy",
    input.outputPath
  ], 10 * 60_000);
}

function shouldChunk(durationSeconds: number | undefined) {
  return Boolean(durationSeconds && durationSeconds > env.AUDIO_CHUNK_MAX_SECONDS);
}

// 受控并发映射：按 limit 限制同时运行的任务数，保留输入顺序返回结果。
async function mapWithConcurrency<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const runners = Array.from({length: Math.min(limit, items.length)}, async () => {
    while (cursor < items.length) {
      const current = cursor++;
      results[current] = await worker(items[current], current);
    }
  });
  await Promise.all(runners);
  return results;
}

export async function prepareTaskAudioAsset(input: {
  taskId: string;
  sourceUrl: string;
  sourceType: "UPLOAD" | "YOUTUBE" | "GOOGLE_DRIVE";
  originalName?: string | null;
  objectKey?: string | null;
  enableSpeakerLabels?: boolean;
}) {
  // 幂等保护：若该任务已完成过音频标准化并上传 R2，直接复用，避免重试/重复处理时再次从
  // YouTube/来源下载并转码（这是重复下载同一视频的根因之一）。转写参数（语言、发言人等）
  // 只在调用服务商时生效，与标准化音频无关，因此复用完全安全。
  const existingNormalized = await prisma.mediaAsset.findUnique({
    where: {mediaTaskId_kind_chunkIndex: {mediaTaskId: input.taskId, kind: "NORMALIZED_AUDIO", chunkIndex: -1}},
    select: {url: true, durationSeconds: true}
  });
  if (existingNormalized?.url) {
    return {
      mediaUrl: existingNormalized.url,
      normalizedUrl: existingNormalized.url,
      durationSeconds: existingNormalized.durationSeconds ?? undefined,
      chunkCount: 0
    };
  }

  const directory = await mkdtemp(join(tmpdir(), "uniscribe-media-"));
  const stem = safeMediaStem(input.originalName, input.taskId);
  const sourcePath = join(directory, "source");
  const audioPath = join(directory, "audio.mp3");
  try {
    const sourceAssetKey = {mediaTaskId_kind_chunkIndex: {mediaTaskId: input.taskId, kind: "SOURCE_MEDIA" as const, chunkIndex: -1}};
    const existingSourceAsset = await prisma.mediaAsset.findUnique({
      where: sourceAssetKey,
      select: {metadata: true}
    });
    const existingMetadata = existingSourceAsset?.metadata;
    const wasSpeakerLabelsRequested = Boolean(
      existingMetadata &&
      typeof existingMetadata === "object" &&
      !Array.isArray(existingMetadata) &&
      (existingMetadata as Record<string, unknown>).speakerLabelsRequested === true
    );
    const sourceMetadata = {
      sourceType: input.sourceType,
      speakerLabelsRequested: wasSpeakerLabelsRequested || Boolean(input.enableSpeakerLabels)
    };

    await prisma.mediaAsset.upsert({
      where: sourceAssetKey,
      update: {
        url: input.sourceUrl,
        objectKey: input.objectKey ?? undefined,
        fileName: input.originalName ?? stem,
        metadata: sourceMetadata
      },
      create: {
        mediaTaskId: input.taskId,
        kind: "SOURCE_MEDIA",
        chunkIndex: -1,
        url: input.sourceUrl,
        objectKey: input.objectKey,
        fileName: input.originalName ?? stem,
        metadata: sourceMetadata
      }
    });

    const downloadedSourcePath = await downloadRemoteMedia({sourceUrl: input.sourceUrl, sourceType: input.sourceType, objectKey: input.objectKey, directory, outputPath: sourcePath});
    await normalizeToAudio(downloadedSourcePath, audioPath);
    const durationSeconds = await probeDurationSeconds(audioPath);
    const fullKey = `tasks/${input.taskId}/audio/${stem}.mp3`;
    const uploadedAudio = await uploadFileToR2({key: fullKey, filePath: audioPath, contentType: audioContentType});

    await prisma.mediaAsset.upsert({
      where: {mediaTaskId_kind_chunkIndex: {mediaTaskId: input.taskId, kind: "NORMALIZED_AUDIO", chunkIndex: -1}},
      update: {
        url: uploadedAudio.publicUrl,
        objectKey: uploadedAudio.key,
        fileName: `${stem}.mp3`,
        contentType: audioContentType,
        sizeBytes: uploadedAudio.sizeBytes,
        durationSeconds: normalizeDurationSeconds(durationSeconds),
        metadata: {sampleRate: 16000, channels: 1, bitrate: "96k"}
      },
      create: {
        mediaTaskId: input.taskId,
        kind: "NORMALIZED_AUDIO",
        chunkIndex: -1,
        url: uploadedAudio.publicUrl,
        objectKey: uploadedAudio.key,
        fileName: `${stem}.mp3`,
        contentType: audioContentType,
        sizeBytes: uploadedAudio.sizeBytes,
        durationSeconds: normalizeDurationSeconds(durationSeconds),
        metadata: {sampleRate: 16000, channels: 1, bitrate: "96k"}
      }
    });

    await prisma.mediaTask.update({
      where: {id: input.taskId},
      data: {
        normalizedUrl: uploadedAudio.publicUrl,
        durationSeconds: normalizeDurationSeconds(durationSeconds)
      }
    });

    // 主转写链路（Deepgram/AssemblyAI）直接使用完整音频，不做分段切片；
    // 只有在两家服务商都不可用、进入 Groq 兜底时才按需切片（见 chunkAudioForFallback）。
    // 这里清理历史切片资产，保证重试任务不残留旧切片。
    await prisma.mediaAsset.deleteMany({
      where: {mediaTaskId: input.taskId, kind: "AUDIO_CHUNK"}
    });

    return {
      mediaUrl: uploadedAudio.publicUrl,
      normalizedUrl: uploadedAudio.publicUrl,
      durationSeconds,
      chunkCount: 0
    };
  } finally {
    await rm(directory, {recursive: true, force: true}).catch(() => undefined);
  }
}

// 兜底切片：仅在 Deepgram/AssemblyAI 均不可用时调用。
// 下载已标准化的完整音频到临时目录，按静音边界智能分段，切成本地音频文件供 Groq 逐段转写。
// 返回的 directory 需由调用方在用完后清理。
export async function chunkAudioForFallback(input: {
  audioUrl: string;
  objectKey?: string | null;
}): Promise<{
  chunks: Array<{filePath: string; start: number; end: number; index: number}>;
  durationSeconds?: number;
  directory: string;
}> {
  const directory = await mkdtemp(join(tmpdir(), "uniscribe-fallback-"));
  const audioPath = join(directory, "audio.mp3");

  const downloadUrl = input.audioUrl.startsWith("r2://") && input.objectKey
    ? await createDownloadUrl(input.objectKey)
    : input.audioUrl;
  const response = await fetch(downloadUrl);
  if (!response.ok || !response.body) {
    await rm(directory, {recursive: true, force: true}).catch(() => undefined);
    throw new Error(`兜底切片无法下载标准化音频：${response.status} ${response.statusText}`);
  }
  await pipeline(Readable.fromWeb(response.body as any), createWriteStream(audioPath));

  const durationSeconds = await probeDurationSeconds(audioPath);

  // 短音频或时长未知：无需切片，整段交给 Groq。
  if (!shouldChunk(durationSeconds)) {
    return {
      chunks: [{filePath: audioPath, start: 0, end: durationSeconds ?? 0, index: 0}],
      durationSeconds,
      directory
    };
  }

  const silenceEnds = await detectSilenceBoundaries(audioPath).catch(() => []);
  const ranges = buildChunkRanges(durationSeconds!, silenceEnds);
  const chunks = await mapWithConcurrency(ranges, 3, async (range) => {
    const chunkPath = join(directory, `chunk-${range.index}.mp3`);
    await sliceAudio({
      inputPath: audioPath,
      outputPath: chunkPath,
      startSeconds: range.start,
      durationSeconds: range.end - range.start
    });
    return {filePath: chunkPath, start: range.start, end: range.end, index: range.index};
  });
  chunks.sort((a, b) => a.index - b.index);

  return {chunks, durationSeconds, directory};
}

// 当前转写链路不把 YouTube/公开视频下载到本地再用 ffmpeg 转码，而是用 yt-dlp 解析临时直链，
// 再把直链交给转写供应商。这样能减少 worker 磁盘占用，也避免维护未使用的音频转码路径。
export function normalizeMediaUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("请提供媒体链接。");
  }

  // 用户经常粘贴不带协议的域名。这里补 https 后再交给 URL 解析，
  // 同时拒绝 file:/ftp: 等协议，避免后台工具读取本地文件或非预期网络资源。
  const withProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProtocol);

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("仅支持 HTTP 和 HTTPS 媒体链接。");
  }

  return parsed.toString();
}

export function resolveMediaSourceProvider(url: string): MediaSourceProvider {
  const parsed = new URL(normalizeMediaUrl(url));
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

export function isGoogleDriveShareUrl(url: string) {
  const parsed = new URL(normalizeMediaUrl(url));
  const host = parsed.hostname.toLowerCase();
  return host === "drive.google.com" || host.endsWith(".drive.google.com") || host === "docs.google.com" || host.endsWith(".docs.google.com");
}

export async function resolveYoutubeAudioUrl(url: string) {
  const output = await collectYtDlp(["--no-playlist", "--format", "bestaudio", "--get-url", url], 30_000);
  const [audioUrl] = output.split("\n").filter(Boolean);

  if (!audioUrl) {
    throw new Error("yt-dlp 未返回音频地址。");
  }

  return audioUrl;
}

export async function resolveYoutubeVideoDownloadUrl(url: string) {
  const output = await collectYtDlp([
    "--no-playlist",
    "--format",
    "best[ext=mp4]/best",
    "--get-url",
    url
  ], 30_000);
  const [videoUrl] = output.split("\n").filter(Boolean);

  if (!videoUrl) {
    throw new Error("yt-dlp 未返回视频地址。");
  }

  return videoUrl;
}

export async function resolveMediaMetadata(url: string) {
  const output = await collectYtDlp(["--dump-json", "--no-playlist", "--skip-download", url], 20_000);
  const metadata = JSON.parse(output) as {
    title?: string;
    fulltitle?: string;
    duration?: number;
    thumbnail?: string;
    webpage_url?: string;
    extractor_key?: string;
    filesize?: number;
    filesize_approx?: number;
    ext?: string;
  };

  return {
    title: metadata.title || metadata.fulltitle,
    durationSeconds: normalizeDurationSeconds(metadata.duration),
    thumbnailUrl: metadata.thumbnail,
    sourceUrl: metadata.webpage_url,
    providerName: metadata.extractor_key,
    contentLength: metadata.filesize || metadata.filesize_approx,
    extension: metadata.ext
  };
}

export async function resolveYoutubeInfo(url: string) {
  const metadata = await resolveMediaMetadata(url);
  return {
    sourceUrl: metadata.sourceUrl || normalizeMediaUrl(url),
    title: metadata.title || "YouTube 视频",
    durationSeconds: metadata.durationSeconds,
    thumbnailUrl: metadata.thumbnailUrl,
    providerName: metadata.providerName
  };
}

export async function listYoutubeSubtitles(url: string) {
  const output = await collectYtDlp(["--skip-download", "--list-subs", "--no-playlist", url], 30_000);
  const lines = output.split("\n");
  const subtitles: Array<{languageCode: string; languageName: string; formats: string[]; automatic: boolean}> = [];
  let automatic = false;

  // yt-dlp 的字幕列表是面向人看的表格，不同语言名称里可能包含空格。
  // 因此只能按两个以上空格切列，并用标题行切换“人工字幕/自动字幕”状态。
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("Language") || line.startsWith("-") || line.startsWith("[")) continue;
    if (/Available automatic captions/i.test(line)) {
      automatic = true;
      continue;
    }
    if (/Available subtitles/i.test(line)) {
      automatic = false;
      continue;
    }

    const parts = line.split(/\s{2,}/).filter(Boolean);
    if (parts.length < 2) continue;
    const [languageCode, languageName = languageCode, formatsText = ""] = parts;
    const formats = formatsText.split(",").map((format) => format.trim()).filter(Boolean);
    subtitles.push({languageCode, languageName, formats, automatic});
  }

  return subtitles;
}

export async function downloadYoutubeSubtitle(url: string, languageCode: string, format: "srt" | "vtt" = "srt") {
  const directory = await mkdtemp(join(tmpdir(), "uniscribe-subs-"));
  try {
    await runYtDlp([
      "--skip-download",
      "--no-playlist",
      "--write-sub",
      "--write-auto-sub",
      "--sub-langs",
      languageCode,
      "--sub-format",
      format,
      "--convert-subs",
      format,
      "--paths",
      directory,
      "--output",
      "subtitle.%(ext)s",
      url
    ], 45_000);

    const files = await readdir(directory);
    const subtitleFile = files.find((file) => file.endsWith(`.${format}`));
    if (!subtitleFile) {
      throw new Error("该语言没有返回字幕内容。");
    }

    return readFile(join(directory, subtitleFile), "utf8");
  } finally {
    // 字幕下载会在临时目录里产生 .vtt/.srt 和中间文件；无论成功失败都要清理，
    // 防止长时间运行的 worker 把系统临时目录撑满。
    await rm(directory, {recursive: true, force: true}).catch(() => undefined);
  }
}

export function resolveGoogleDriveDownloadUrl(url: string) {
  const parsed = new URL(url);
  if (!isGoogleDriveShareUrl(url)) {
    throw new Error("不支持的 Google Drive 链接。");
  }

  const fileId = parsed.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || parsed.searchParams.get("id");
  if (!fileId) {
    throw new Error("未找到 Google Drive 文件 ID。");
  }

  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
}
