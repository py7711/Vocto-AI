import {existsSync, readdirSync} from "node:fs";
import {join} from "node:path";
import {Readable} from "node:stream";
import type {Browser, BrowserContext, Locator, Page} from "playwright";
import {env} from "@/lib/env";
import {putObject} from "@/lib/storage";
import {canonicalizeYoutubeUrl, extractYoutubeVideoId} from "@/lib/youtube-url";

const maxAudioBytes = 500 * 1024 * 1024;
const defaultPollIntervalMs = 1_000;
const defaultPollTimeoutMs = 90_000;

type YtDownJob = {
  jobUrl: string;
  fileName: string;
};

type StoredAudio = {
  key: string;
  publicUrl: string;
  sizeBytes: number;
};

type IngestedYtDownAudio = StoredAudio & {
  fileName: string;
  provider: "ytdown";
};

type DownloadedYoutubeAudio = {
  filePath: string;
  directory: string;
};

type PutObjectInput = {
  key: string;
  body: Readable;
  contentType: string;
  contentLength: number;
};

type YtDownAudioIngestorAdapters = {
  resolveJob: (youtubeUrl: string) => Promise<YtDownJob>;
  fetch: typeof fetch;
  putObject: (input: PutObjectInput) => Promise<StoredAudio>;
  sleep?: (milliseconds: number) => Promise<void>;
  pollTimeoutMs?: number;
};

type YtDownJobResponse = {
  status?: string;
  fileName?: string;
  fileUrl?: string;
  fileSizeBytes?: number;
};

type FlareSolverrCookie = {
  name: string;
  value: string;
  domain: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
};

type FlareSolverrClearance = {
  userAgent?: string;
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Lax" | "Strict" | "None";
  }>;
};

let browserPromise: Promise<Browser> | undefined;
let contextPromise: Promise<BrowserContext> | undefined;
export function isYtDownCloudflareChallengeTitle(title: string) {
  return /just a moment|attention required|please wait|请稍候|安全验证/i.test(title);
}

export function createYtDownChallengeGate(input: {cooldownMs: number; now?: () => number}) {
  const now = input.now ?? Date.now;
  let cooldownUntil = 0;
  return {
    assertAvailable() {
      if (now() < cooldownUntil) throw new Error("YTDown is temporarily paused after a Cloudflare challenge.");
    },
    recordChallenge() {
      cooldownUntil = now() + input.cooldownMs;
    },
    isBlocked() {
      return now() < cooldownUntil;
    }
  };
}

const challengeGate = createYtDownChallengeGate({cooldownMs: env.YTDOWN_CHALLENGE_COOLDOWN_MS});

function resolveChromiumExecutable() {
  if (env.YTDOWN_BROWSER_EXECUTABLE_PATH) return env.YTDOWN_BROWSER_EXECUTABLE_PATH;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!root || !existsSync(root)) return undefined;
  // Prefer full Chromium over headless_shell; Cloudflare blocks headless_shell more aggressively.
  const chromeDir = readdirSync(root).find((name) => /^chromium-\d+$/.test(name));
  if (!chromeDir) return undefined;
  const candidate = join(root, chromeDir, "chrome-linux64", "chrome");
  return existsSync(candidate) ? candidate : undefined;
}

async function fetchFlareSolverrClearance(url: string): Promise<FlareSolverrClearance | undefined> {
  const base = env.YTDOWN_FLARESOLVERR_URL;
  if (!base) return undefined;

  const endpoint = new URL("/v1", base.endsWith("/") ? base : `${base}/`);
  const timeoutMs = Math.max(env.YTDOWN_RESOLVE_TIMEOUT_MS, 60_000);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      cmd: "request.get",
      url,
      maxTimeout: timeoutMs
    }),
    signal: AbortSignal.timeout(timeoutMs + 10_000)
  });
  if (!response.ok) {
    throw new Error(`FlareSolverr failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json() as {
    status?: string;
    message?: string;
    solution?: {userAgent?: string; cookies?: FlareSolverrCookie[]};
  };
  if (payload.status !== "ok" || !payload.solution) {
    throw new Error(payload.message || "FlareSolverr could not clear the Cloudflare challenge.");
  }

  return {
    userAgent: payload.solution.userAgent,
    cookies: (payload.solution.cookies || []).map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path || "/",
      expires: typeof cookie.expires === "number" && cookie.expires > 0 ? cookie.expires : undefined,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite === "Lax" || cookie.sameSite === "Strict" || cookie.sameSite === "None"
        ? cookie.sameSite
        : undefined
    }))
  };
}

async function hasCloudflareChallenge(page: Page) {
  if (isYtDownCloudflareChallengeTitle(await page.title())) return true;
  return await page.locator([
    'iframe[src*="challenges.cloudflare.com"]',
    'input[name="cf-turnstile-response"]',
    ".cf-turnstile"
  ].join(",")).count() > 0;
}

async function waitForVisibleOrChallenge(page: Page, locator: Locator, timeoutMs: number, label: string) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await locator.isVisible()) return;
    if (await hasCloudflareChallenge(page)) {
      challengeGate.recordChallenge();
      throw new Error("YTDown blocked the worker browser with a Cloudflare challenge.");
    }
    await page.waitForTimeout(250);
  }
  throw new Error(`YTDown ${label} timed out.`);
}

async function launchBrowser() {
  const {chromium} = await import("playwright");
  const args = [
    "--disable-dev-shm-usage",
    "--disable-blink-features=AutomationControlled"
  ];
  if (typeof process.getuid === "function" && process.getuid() === 0) args.push("--no-sandbox");
  // When DISPLAY is set (Docker worker entrypoint starts Xvfb), use headed Chromium.
  const headed = Boolean(process.env.DISPLAY);
  return chromium.launch({
    headless: !headed,
    executablePath: resolveChromiumExecutable(),
    args
  });
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = launchBrowser().then((browser) => {
      browser.on("disconnected", () => {
        browserPromise = undefined;
        contextPromise = undefined;
      });
      return browser;
    }).catch((error) => {
      browserPromise = undefined;
      throw error;
    });
  }
  return browserPromise;
}

async function getContext() {
  if (!contextPromise) {
    contextPromise = (async () => {
      const browser = await getBrowser();
      const clearance = await fetchFlareSolverrClearance(env.YTDOWN_URL);
      const context = await browser.newContext({
        locale: "zh-CN",
        userAgent: clearance?.userAgent,
        viewport: {width: 1280, height: 720}
      });
      await context.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", {get: () => undefined});
      });
      if (clearance?.cookies.length) {
        await context.addCookies(clearance.cookies);
      }
      return context;
    })().catch((error) => {
      contextPromise = undefined;
      throw error;
    });
  }
  return contextPromise;
}

async function resolveYtDownJob(youtubeUrl: string): Promise<YtDownJob> {
  challengeGate.assertAvailable();
  const canonicalUrl = canonicalizeYoutubeUrl(youtubeUrl);
  const videoId = extractYoutubeVideoId(canonicalUrl);
  if (!videoId) throw new Error("YTDown requires a valid YouTube video URL.");

  const context = await getContext();
  const page = await context.newPage();

  try {
    await page.goto(env.YTDOWN_URL, {
      waitUntil: "domcontentloaded",
      timeout: Math.min(env.YTDOWN_RESOLVE_TIMEOUT_MS, 30_000)
    });
    const urlInput = page.locator('input[name="URLz"]');
    await waitForVisibleOrChallenge(page, urlInput, Math.max(env.YTDOWN_RESOLVE_TIMEOUT_MS, 15_000), "form");
    await urlInput.fill(canonicalUrl);
    await page.locator('button[type="submit"]').click();

    const formatSelect = page.locator("select.download-option");
    await waitForVisibleOrChallenge(page, formatSelect, env.YTDOWN_RESOLVE_TIMEOUT_MS, "format resolution");
    const mp3 = await formatSelect.locator("option").evaluateAll((options) => {
      const option = options.find((item) => item.textContent?.toUpperCase().includes("MP3")) as HTMLOptionElement | undefined;
      return option ? {jobUrl: option.value, text: option.textContent || ""} : undefined;
    });
    if (!mp3?.jobUrl) throw new Error("YTDown returned no MP3 conversion option.");

    return {
      jobUrl: assertAllowedWorkerUrl(mp3.jobUrl),
      fileName: `${videoId}.mp3`
    };
  } finally {
    await page.close().catch(() => undefined);
  }
}

function assertAllowedWorkerUrl(input: string) {
  const url = new URL(input);
  if (url.protocol !== "https:" || !/^s\d+\.worker\d+\.com$/i.test(url.hostname)) {
    throw new Error("YTDown returned an untrusted conversion worker URL.");
  }
  return url.toString();
}

function assertAllowedFileUrl(input: string) {
  const url = new URL(input);
  if (url.protocol !== "https:" || (url.hostname !== "files.ytcontent.com" && !url.hostname.endsWith(".ytcontent.net"))) {
    throw new Error("YTDown returned an untrusted audio file URL.");
  }
  return url.toString();
}

function isAudioResponse(response: Response) {
  const contentType = response.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  return contentType === "application/octet-stream" || Boolean(contentType?.startsWith("audio/"));
}

export function createYtDownAudioIngestor(adapters: YtDownAudioIngestorAdapters) {
  const sleep = adapters.sleep ?? ((milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds)));

  return async function ingest(input: {youtubeUrl: string; key: string}) {
    const job = await adapters.resolveJob(input.youtubeUrl);
    const jobUrl = assertAllowedWorkerUrl(job.jobUrl);
    const deadline = Date.now() + (adapters.pollTimeoutMs ?? defaultPollTimeoutMs);
    let completed: YtDownJobResponse | undefined;

    while (Date.now() < deadline) {
      // GET 会启动尚未开始的任务，也会返回已有任务的进度；页面“开始”按钮调用的是同一个幂等端点。
      const response = await adapters.fetch(jobUrl, {
        headers: {Accept: "application/json"},
        signal: AbortSignal.timeout(15_000)
      });
      if (!response.ok) throw new Error(`YTDown conversion failed: ${response.status} ${response.statusText}`);
      const status = await response.json() as YtDownJobResponse;
      if (status.status === "completed" && status.fileUrl) {
        completed = status;
        break;
      }
      if (status.status === "failed" || status.status === "error") {
        throw new Error("YTDown could not convert this YouTube video.");
      }
      await sleep(defaultPollIntervalMs);
    }

    if (!completed?.fileUrl) throw new Error("YTDown conversion timed out.");
    const fileUrl = assertAllowedFileUrl(completed.fileUrl);
    const response = await adapters.fetch(fileUrl, {signal: AbortSignal.timeout(2 * 60_000)});
    if (!response.ok || !response.body || !isAudioResponse(response)) {
      throw new Error(`YTDown audio download failed: ${response.status} ${response.statusText}`);
    }

    const declaredLength = Number(response.headers.get("content-length") || completed.fileSizeBytes);
    if (!Number.isSafeInteger(declaredLength) || declaredLength <= 0 || declaredLength > maxAudioBytes) {
      throw new Error("YTDown returned an invalid or oversized audio file.");
    }

    const stored = await adapters.putObject({
      key: input.key,
      body: Readable.fromWeb(response.body as never),
      contentType: "audio/mpeg",
      contentLength: declaredLength
    });

    return {
      ...stored,
      fileName: completed.fileName || job.fileName,
      provider: "ytdown" as const
    };
  };
}

export function createYoutubeAudioAcquirer(adapters: {
  ingestYtDown: (input: {youtubeUrl: string; key: string}) => Promise<IngestedYtDownAudio>;
  downloadWithYtDlp: (youtubeUrl: string) => Promise<DownloadedYoutubeAudio>;
  onYtDownError?: (error: unknown) => void;
}) {
  return async function acquire(input: {youtubeUrl: string; key: string}) {
    try {
      return {kind: "stored" as const, audio: await adapters.ingestYtDown(input)};
    } catch (error) {
      adapters.onYtDownError?.(error);
      return {kind: "downloaded" as const, ...await adapters.downloadWithYtDlp(input.youtubeUrl)};
    }
  };
}

const productionIngestor = createYtDownAudioIngestor({
  resolveJob: resolveYtDownJob,
  fetch,
  putObject: async (input) => putObject(input),
  pollTimeoutMs: env.YTDOWN_POLL_TIMEOUT_MS
});

export async function ingestYtDownAudioToR2(input: {youtubeUrl: string; key: string}) {
  if (!env.YTDOWN_ENABLED) throw new Error("YTDown audio ingestion is disabled.");
  return productionIngestor(input);
}
