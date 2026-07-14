import {spawn} from "node:child_process";
import {existsSync, readFileSync} from "node:fs";
import {createReadStream, createWriteStream} from "node:fs";
import {mkdtemp, readdir, readFile, rm, stat} from "node:fs/promises";
import {tmpdir} from "node:os";
import {basename, extname, join} from "node:path";
import {Readable} from "node:stream";
import {Transform} from "node:stream";
import {pipeline} from "node:stream/promises";
import {normalizeDurationSeconds} from "@/lib/duration";
import {env} from "@/lib/env";
import {logWarn} from "@/lib/logger";
import {prisma} from "@/lib/prisma";
import {createDownloadUrl, putObject} from "@/lib/storage";
import {normalizePublicMediaUrl} from "@/lib/media-url";
import {selectBrowserTransferStream, type ExtractedMediaFormat} from "@/lib/media-stream";
import {canonicalizeYoutubeUrl, extractYoutubeVideoId} from "@/lib/youtube-url";
import {resolveYoutubeViaInnertube, type YoutubeStreamFormat} from "@/server/media/youtube-innertube";
import {resolvePublicMediaMetadata} from "@/server/media/public-metadata";
import {createYoutubeAudioAcquirer, ingestYtDownAudioToR2} from "@/server/media/ytdown-audio";

export {canonicalizeYoutubeUrl, extractYoutubeVideoId} from "@/lib/youtube-url";
export type {YoutubeStreamFormat} from "@/server/media/youtube-innertube";

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
export const SUPPORTED_YT_DLP_VERSION = "2026.06.09";

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

const verifiedYtDlpCommands = new Map<string, Promise<void>>();

function verifyYtDlpVersion(spec: CommandSpec) {
  const label = commandLabel(spec);
  const existing = verifiedYtDlpCommands.get(label);
  if (existing) return existing;

  const verification = collect(spec.command, [...spec.args, "--version"], 10_000)
    .then((version) => {
      if (version.trim() !== SUPPORTED_YT_DLP_VERSION) {
        throw new Error(
          `yt-dlp 版本不受支持：检测到 ${version.trim() || "未知版本"}，要求 ${SUPPORTED_YT_DLP_VERSION}。请部署固定版本后重启服务。`
        );
      }
    })
    .catch((error) => {
      verifiedYtDlpCommands.delete(label);
      throw error;
    });
  verifiedYtDlpCommands.set(label, verification);
  return verification;
}

function ytDlpSpawnEnv() {
  const pathEntries = [
    process.env.PATH,
    "/usr/local/sbin",
    "/usr/local/bin",
    "/usr/sbin",
    "/usr/bin",
    "/sbin",
    "/bin",
    `${process.env.HOME ?? ""}/.local/bin`
  ].filter(Boolean);

  return {
    ...process.env,
    PATH: Array.from(new Set(pathEntries.join(":").split(":").filter(Boolean))).join(":")
  };
}

function resolveYoutubeCookiesPath() {
  if (env.YT_DLP_COOKIES_PATH && existsSync(env.YT_DLP_COOKIES_PATH)) {
    return env.YT_DLP_COOKIES_PATH;
  }

  const defaultPath = join(process.cwd(), "config/youtube-cookies.txt");
  if (existsSync(defaultPath)) {
    return defaultPath;
  }

  return undefined;
}

function validateYoutubeCookiesFile(cookiesPath: string) {
  const content = readFileSync(cookiesPath, "utf8");
  const names = new Set<string>();
  for (const line of content.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const parts = line.split("\t");
    if (parts.length >= 6 && parts[0].includes("youtube.com")) {
      names.add(parts[5].trim());
    }
  }

  const missing = ["SID", "HSID", "SSID"].filter((name) => !names.has(name));
  const hasSecureSession = names.has("__Secure-1PSID") || names.has("__Secure-3PSID");
  if (missing.length > 0 || !hasSecureSession) {
    return {
      ok: false,
      message: `cookies 文件不完整（缺少 ${missing.join("、") || "会话字段"}）。请在已登录 YouTube 的浏览器中用 Get cookies.txt LOCALLY 扩展导出完整 Netscape 格式，覆盖 ${cookiesPath}。`
    };
  }

  return {ok: true as const};
}

function youtubeCookiesGuidance(cookiesPath?: string) {
  const target = cookiesPath || "config/youtube-cookies.txt";
  return `请在浏览器登录 YouTube 后，用 Get cookies.txt LOCALLY 扩展导出完整 Netscape 格式 cookies，上传到 ${target}，执行 chmod 600 ${target} && pm2 restart all。`;
}

function formatYoutubeDownloadError(message: string, cookiesPath?: string) {
  if (!isYoutubeBotBlockedError(message)) return message;

  if (cookiesPath) {
    const validation = validateYoutubeCookiesFile(cookiesPath);
    if (!validation.ok) return validation.message;
    return `YouTube cookies 已配置但无效或已过期，服务器仍被识别为机器人。${youtubeCookiesGuidance(cookiesPath)}`;
  }

  return `YouTube 阻止了服务器下载音频。${youtubeCookiesGuidance()}`;
}

function isYoutubeBotBlockedError(message: string) {
  return /Sign in to confirm you.?re not a bot/i.test(message) ||
    /confirm you.?re not a bot/i.test(message);
}

function ytDlpBaseArgs() {
  const args = [
    "--js-runtimes",
    `node:${process.execPath}`
  ];

  const cookiesPath = resolveYoutubeCookiesPath();
  if (cookiesPath) {
    args.push("--cookies", cookiesPath);
  }

  return args;
}

async function resolveYoutubeMetadataViaOEmbed(url: string) {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const response = await fetch(endpoint, {signal: AbortSignal.timeout(10_000)});
  if (!response.ok) {
    throw new Error(`YouTube oEmbed 请求失败：${response.status} ${response.statusText}`);
  }

  const payload = await response.json() as {
    title?: string;
    thumbnail_url?: string;
    author_name?: string;
  };

  const videoId = extractYoutubeVideoId(url);
  return {
    title: payload.title,
    durationSeconds: undefined,
    thumbnailUrl: payload.thumbnail_url || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : undefined),
    sourceUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : url,
    providerName: "youtube",
    contentLength: undefined,
    extension: undefined
  };
}

async function resolveYoutubeMetadataViaDataApi(videoId: string) {
  if (!env.GOOGLE_API_KEY) return null;

  const endpoint = new URL("https://www.googleapis.com/youtube/v3/videos");
  endpoint.searchParams.set("part", "snippet,contentDetails");
  endpoint.searchParams.set("id", videoId);
  endpoint.searchParams.set("key", env.GOOGLE_API_KEY);

  const response = await fetch(endpoint, {signal: AbortSignal.timeout(10_000)});
  if (!response.ok) return null;

  const payload = await response.json() as {
    items?: Array<{
      snippet?: {title?: string; thumbnails?: {maxres?: {url?: string}; high?: {url?: string}; default?: {url?: string}}};
      contentDetails?: {duration?: string};
    }>;
  };
  const item = payload.items?.[0];
  if (!item) return null;

  const thumbnails = item.snippet?.thumbnails;
  const durationSeconds = item.contentDetails?.duration
    ? parseIso8601Duration(item.contentDetails.duration)
    : undefined;

  return {
    title: item.snippet?.title,
    durationSeconds,
    thumbnailUrl: thumbnails?.maxres?.url || thumbnails?.high?.url || thumbnails?.default?.url,
    sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
    providerName: "youtube",
    contentLength: undefined,
    extension: undefined
  };
}

function parseIso8601Duration(value: string) {
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return undefined;

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  return normalizeDurationSeconds(hours * 3600 + minutes * 60 + seconds);
}

async function resolveYoutubeMetadataFallback(url: string, cause: unknown) {
  const videoId = extractYoutubeVideoId(url);
  const errors: string[] = [cause instanceof Error ? cause.message : String(cause)];

  if (videoId) {
    try {
      const fromApi = await resolveYoutubeMetadataViaDataApi(videoId);
      if (fromApi?.title) return fromApi;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  try {
    const fromOEmbed = await resolveYoutubeMetadataViaOEmbed(url);
    if (fromOEmbed.title) {
      return fromOEmbed;
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  const needsCookies = errors.some((message) => isYoutubeBotBlockedError(message));
  if (needsCookies && !resolveYoutubeCookiesPath()) {
    throw new Error(
      "YouTube 已将服务器 IP 识别为机器人。请在服务器配置 config/youtube-cookies.txt（Netscape 格式），或在 .env 设置 YT_DLP_COOKIES_PATH 后执行 pm2 restart all。"
    );
  }

  throw cause instanceof Error ? cause : new Error(String(cause));
}

async function withYtDlp<T>(operation: (spec: CommandSpec) => Promise<T>) {
  const attempted: string[] = [];

  for (const candidate of ytDlpCandidates()) {
    attempted.push(commandLabel(candidate));
    try {
      await verifyYtDlpVersion(candidate);
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
    const child = spawn(command, args, {stdio: ["ignore", "pipe", "pipe"], env: ytDlpSpawnEnv()});
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
  return withYtDlp((spec) => collect(spec.command, [...spec.args, ...ytDlpBaseArgs(), ...args], timeoutMs));
}

function run(command: string, args: string[], timeoutMs = DEFAULT_TIMEOUT_MS) {
  // 与 collect/runCapture 一致捕获 stderr，避免 Worker 日志只显示「退出码 1」而看不到 bot 拦截详情。
  return runCapture(command, args, timeoutMs).then(() => undefined);
}

function runYtDlp(args: string[], timeoutMs = DEFAULT_TIMEOUT_MS) {
  return withYtDlp((spec) => run(spec.command, [...spec.args, ...ytDlpBaseArgs(), ...args], timeoutMs));
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
    const child = spawn(command, args, {stdio: ["ignore", "pipe", "pipe"], env: ytDlpSpawnEnv()});
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
    const provider = resolveMediaSourceProvider(input.sourceUrl);
    const mediaUrl = provider === "youtube" ? canonicalizeYoutubeUrl(input.sourceUrl) : normalizeMediaUrl(input.sourceUrl);
    const outputTemplate = join(input.directory, "source.%(ext)s");
    try {
      await runYtDlp([
        "--no-playlist",
        "--format",
        "bestaudio/best",
        "--output",
        outputTemplate,
        "--",
        mediaUrl
      ], 15 * 60_000);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const cookiesPath = provider === "youtube" ? resolveYoutubeCookiesPath() : undefined;
      if (provider === "youtube" && (isYoutubeBotBlockedError(message) || (cookiesPath && /退出，退出码 1/.test(message)))) {
        throw new Error(formatYoutubeDownloadError(message, cookiesPath));
      }
      throw error;
    }
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

async function persistTaskAudio(input: {
  taskId: string;
  key: string;
  publicUrl: string;
  fileName: string;
  sizeBytes: number;
  durationSeconds?: number;
  metadata: Record<string, string | number | boolean>;
}) {
  const durationSeconds = normalizeDurationSeconds(input.durationSeconds);
  await prisma.mediaAsset.upsert({
    where: {mediaTaskId_kind_chunkIndex: {mediaTaskId: input.taskId, kind: "NORMALIZED_AUDIO", chunkIndex: -1}},
    update: {
      url: input.publicUrl,
      objectKey: input.key,
      fileName: input.fileName,
      contentType: audioContentType,
      sizeBytes: input.sizeBytes,
      durationSeconds,
      metadata: input.metadata
    },
    create: {
      mediaTaskId: input.taskId,
      kind: "NORMALIZED_AUDIO",
      chunkIndex: -1,
      url: input.publicUrl,
      objectKey: input.key,
      fileName: input.fileName,
      contentType: audioContentType,
      sizeBytes: input.sizeBytes,
      durationSeconds,
      metadata: input.metadata
    }
  });

  await prisma.mediaTask.update({
    where: {id: input.taskId},
    data: {normalizedUrl: input.publicUrl, durationSeconds}
  });
  await prisma.mediaAsset.deleteMany({
    where: {mediaTaskId: input.taskId, kind: "AUDIO_CHUNK"}
  });

  return {
    mediaUrl: input.publicUrl,
    normalizedUrl: input.publicUrl,
    durationSeconds,
    chunkCount: 0
  };
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

  const stem = safeMediaStem(input.originalName, input.taskId);
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

  const fullKey = `tasks/${input.taskId}/audio/${stem}.mp3`;
  let directory: string | undefined;
  let downloadedSourcePath: string | undefined;

  if (env.YTDOWN_ENABLED && input.sourceType === "YOUTUBE" && resolveMediaSourceProvider(input.sourceUrl) === "youtube") {
    const acquireYoutubeAudio = createYoutubeAudioAcquirer({
      ingestYtDown: ingestYtDownAudioToR2,
      downloadWithYtDlp: async (youtubeUrl) => {
        const fallbackDirectory = await mkdtemp(join(tmpdir(), "votxt-media-"));
        try {
          const filePath = await downloadRemoteMedia({
            sourceUrl: youtubeUrl,
            sourceType: "YOUTUBE",
            objectKey: input.objectKey,
            directory: fallbackDirectory,
            outputPath: join(fallbackDirectory, "source")
          });
          return {filePath, directory: fallbackDirectory};
        } catch (error) {
          await rm(fallbackDirectory, {recursive: true, force: true}).catch(() => undefined);
          throw error;
        }
      },
      onYtDownError: (error) => logWarn(error, {
        requestUrl: `worker://youtube-ingest/${input.taskId}`,
        message: "YTDown audio ingestion failed; falling back to yt-dlp.",
        meta: {taskId: input.taskId}
      })
    });
    const acquired = await acquireYoutubeAudio({youtubeUrl: input.sourceUrl, key: fullKey});
    if (acquired.kind === "stored") {
      const uploadedAudio = acquired.audio;
      const task = await prisma.mediaTask.findUnique({
        where: {id: input.taskId},
        select: {durationSeconds: true}
      });
      const durationSeconds = task?.durationSeconds
        ?? await createDownloadUrl(uploadedAudio.key).then(probeDurationSeconds).catch(() => undefined);
      return persistTaskAudio({
        taskId: input.taskId,
        key: uploadedAudio.key,
        publicUrl: uploadedAudio.publicUrl,
        fileName: `${stem}.mp3`,
        sizeBytes: uploadedAudio.sizeBytes,
        durationSeconds,
        metadata: {provider: uploadedAudio.provider, passthrough: true, bitrate: "128k"}
      });
    }
    directory = acquired.directory;
    downloadedSourcePath = acquired.filePath;
  }

  directory ??= await mkdtemp(join(tmpdir(), "votxt-media-"));
  const audioPath = join(directory, "audio.mp3");
  try {
    downloadedSourcePath ??= await downloadRemoteMedia({
      sourceUrl: input.sourceUrl,
      sourceType: input.sourceType,
      objectKey: input.objectKey,
      directory,
      outputPath: join(directory, "source")
    });
    await normalizeToAudio(downloadedSourcePath, audioPath);
    const durationSeconds = await probeDurationSeconds(audioPath);
    const uploadedAudio = await uploadFileToR2({key: fullKey, filePath: audioPath, contentType: audioContentType});
    return persistTaskAudio({
      taskId: input.taskId,
      key: uploadedAudio.key,
      publicUrl: uploadedAudio.publicUrl,
      fileName: `${stem}.mp3`,
      sizeBytes: uploadedAudio.sizeBytes,
      durationSeconds,
      metadata: {sampleRate: 16000, channels: 1, bitrate: "96k"}
    });
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
  const directory = await mkdtemp(join(tmpdir(), "votxt-fallback-"));
  const audioPath = join(directory, "audio.mp3");

  // 下载完成后返回 directory 交给调用方在转写结束后清理；但下载/切片过程中任何一步出错都要
  // 在这里自行清理临时目录再抛出，否则调用方永远拿不到 directory，无法执行它自己的清理逻辑，
  // 导致失败的兜底任务在 /tmp 里永久残留完整音频文件，长期运行会占满服务器磁盘。
  try {
    const downloadUrl = input.audioUrl.startsWith("r2://") && input.objectKey
      ? await createDownloadUrl(input.objectKey)
      : input.audioUrl;
    const response = await fetch(downloadUrl);
    if (!response.ok || !response.body) {
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
  } catch (error) {
    await rm(directory, {recursive: true, force: true}).catch(() => undefined);
    throw error;
  }
}

// 元数据解析仍可向浏览器暴露临时媒体流；Worker 的正式转写路径会优先把 YTDown MP3 写入 R2，
// 失败时再由 yt-dlp 下载并用 ffmpeg 标准化，避免把短时第三方链接交给转写供应商。
export function normalizeMediaUrl(input: string) {
  return normalizePublicMediaUrl(input);
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
  const canonicalUrl = canonicalizeYoutubeUrl(url);
  const videoId = extractYoutubeVideoId(canonicalUrl)!;
  try {
    const resolved = await resolveYoutubeViaInnertube(videoId);
    if (resolved.audioFormat?.url) return resolved.audioFormat.url;
  } catch {
    // 固定版本 yt-dlp 负责处理 signature/nsig 和可播放性降级。
  }
  const output = await collectYtDlp(["--no-playlist", "--format", "bestaudio", "--get-url", "--", canonicalUrl], 30_000);
  const [audioUrl] = output.split("\n").filter(Boolean);

  if (!audioUrl) {
    throw new Error("yt-dlp 未返回音频地址。");
  }

  return audioUrl;
}

export async function resolveYoutubeVideoDownloadUrl(url: string) {
  const canonicalUrl = canonicalizeYoutubeUrl(url);
  const output = await collectYtDlp([
    "--no-playlist",
    "--format",
    "best[ext=mp4]/best",
    "--get-url",
    "--",
    canonicalUrl
  ], 30_000);
  const [videoUrl] = output.split("\n").filter(Boolean);

  if (!videoUrl) {
    throw new Error("yt-dlp 未返回视频地址。");
  }

  return videoUrl;
}

function extensionFromMimeType(mimeType: string | undefined) {
  if (!mimeType) return undefined;
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("mpeg")) return "mp3";
  return undefined;
}

async function resolveYoutubeMetadataViaYtDlp(url: string) {
  const canonicalUrl = canonicalizeYoutubeUrl(url);
  const output = await collectYtDlp(["--dump-json", "--no-playlist", "--skip-download", "--", canonicalUrl], 30_000);
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
    formats?: Array<{
      format_id?: string;
      url?: string;
      manifest_url?: string;
      mime_type?: string;
      ext?: string;
      protocol?: string;
      acodec?: string;
      vcodec?: string;
      abr?: number;
      tbr?: number;
      filesize?: number;
      filesize_approx?: number;
      audio_channels?: number;
      asr?: number;
      format_note?: string;
    }>;
  };
  const formats: YoutubeStreamFormat[] = (metadata.formats ?? []).flatMap((format) => {
    const itag = Number(format.format_id);
    if (!Number.isInteger(itag)) return [];
    const audioOnly = format.acodec !== "none" && format.vcodec === "none";
    const mimeType = format.mime_type || `${audioOnly ? "audio" : "video"}/${format.ext || "unknown"}`;
    return [{
      itag,
      mimeType,
      bitrate: format.abr ? Math.round(format.abr * 1000) : format.tbr ? Math.round(format.tbr * 1000) : undefined,
      contentLength: format.filesize || format.filesize_approx,
      durationSeconds: normalizeDurationSeconds(metadata.duration),
      audioOnly,
      audioSampleRate: format.asr,
      audioChannels: format.audio_channels,
      qualityLabel: format.format_note,
      url: format.url,
      requiresSignature: false,
      requiresNsig: false
    }];
  });
  const audioStream = formats
    .filter((format) => format.audioOnly && format.url)
    .sort((left, right) => (right.bitrate ?? 0) - (left.bitrate ?? 0))[0];

  return {
    title: metadata.title || metadata.fulltitle,
    durationSeconds: normalizeDurationSeconds(metadata.duration),
    thumbnailUrl: metadata.thumbnail,
    sourceUrl: metadata.webpage_url,
    providerName: metadata.extractor_key || "youtube:yt-dlp",
    contentLength: audioStream?.contentLength || metadata.filesize || metadata.filesize_approx,
    extension: extensionFromMimeType(audioStream?.mimeType) || metadata.ext,
    formats,
    audioStream
  };
}

export async function resolveMediaMetadata(url: string) {
  const provider = resolveMediaSourceProvider(url);

  if (provider === "youtube") {
    const canonicalUrl = canonicalizeYoutubeUrl(url);
    const videoId = extractYoutubeVideoId(canonicalUrl)!;
    let innertubeResult: Awaited<ReturnType<typeof resolveYoutubeViaInnertube>> | undefined;
    try {
      innertubeResult = await resolveYoutubeViaInnertube(videoId);
      if (innertubeResult.audioFormat?.url) {
        return {
          title: innertubeResult.title,
          durationSeconds: innertubeResult.durationSeconds,
          thumbnailUrl: innertubeResult.thumbnailUrl,
          sourceUrl: canonicalUrl,
          providerName: "youtube:innertube-web",
          contentLength: innertubeResult.audioFormat.contentLength,
          extension: extensionFromMimeType(innertubeResult.audioFormat.mimeType),
          formats: innertubeResult.formats,
          audioStream: innertubeResult.audioFormat
        };
      }
    } catch {
      // 继续使用固定版本 yt-dlp。
    }
    try {
      return await resolveYoutubeMetadataViaYtDlp(canonicalUrl);
    } catch (error) {
      const fallback = await resolveYoutubeMetadataFallback(canonicalUrl, error);
      return {
        ...fallback,
        formats: innertubeResult?.formats ?? [],
        audioStream: undefined
      };
    }
  }

  try {
    const output = await collectYtDlp(["--dump-json", "--no-playlist", "--skip-download", "--", url], 20_000);
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
      formats?: ExtractedMediaFormat[];
    };

    const browserStream = selectBrowserTransferStream(metadata.formats ?? []);
    const audioStream = browserStream?.kind === "audio" ? browserStream : undefined;

    const extracted = {
      title: metadata.title || metadata.fulltitle,
      durationSeconds: normalizeDurationSeconds(metadata.duration),
      thumbnailUrl: metadata.thumbnail,
      sourceUrl: metadata.webpage_url,
      providerName: metadata.extractor_key,
      contentLength: browserStream?.contentLength || metadata.filesize || metadata.filesize_approx,
      extension: metadata.ext,
      audioStream,
      browserStream
    };
    if (extracted.title && extracted.thumbnailUrl) return extracted;
    const fallback = await resolvePublicMediaMetadata(url, provider);
    return fallback ? {
      ...extracted,
      title: extracted.title || fallback.title,
      thumbnailUrl: extracted.thumbnailUrl || fallback.thumbnailUrl,
      sourceUrl: extracted.sourceUrl || fallback.sourceUrl,
      providerName: extracted.providerName || fallback.providerName
    } : extracted;
  } catch (error) {
    const fallback = await resolvePublicMediaMetadata(url, provider);
    if (fallback) return fallback;
    throw error;
  }
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
  const canonicalUrl = canonicalizeYoutubeUrl(url);
  const output = await collectYtDlp(["--skip-download", "--list-subs", "--no-playlist", "--", canonicalUrl], 30_000);
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
  const canonicalUrl = canonicalizeYoutubeUrl(url);
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,31}$/.test(languageCode)) {
    throw new Error("字幕语言代码无效。");
  }
  const directory = await mkdtemp(join(tmpdir(), "votxt-subs-"));
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
      "--",
      canonicalUrl
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
