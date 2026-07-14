import {normalizeDurationSeconds} from "@/lib/duration";

const youtubeOrigin = "https://www.youtube.com";
const webUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
const iosCompatibilityClient = {
  apiKey: "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
  clientVersion: "20.10.4",
  userAgent: "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)"
};

export type YoutubeStreamFormat = {
  itag: number;
  mimeType: string;
  bitrate?: number;
  contentLength?: number;
  durationSeconds?: number;
  audioOnly: boolean;
  audioQuality?: string;
  audioSampleRate?: number;
  audioChannels?: number;
  qualityLabel?: string;
  url?: string;
  requiresSignature: boolean;
  requiresNsig: boolean;
};

export type YoutubeInnertubeResult = {
  title?: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
  formats: YoutubeStreamFormat[];
  audioFormat?: YoutubeStreamFormat;
  userAgent: string;
};

type PlayerFormat = {
  itag?: number;
  url?: string;
  signatureCipher?: string;
  cipher?: string;
  mimeType?: string;
  bitrate?: number;
  averageBitrate?: number;
  contentLength?: string;
  approxDurationMs?: string;
  audioQuality?: string;
  audioSampleRate?: string;
  audioChannels?: number;
  qualityLabel?: string;
};

type PlayerResponse = {
  playabilityStatus?: {status?: string; reason?: string};
  videoDetails?: {
    title?: string;
    lengthSeconds?: string;
    thumbnail?: {thumbnails?: Array<{url?: string}>};
  };
  streamingData?: {formats?: PlayerFormat[]; adaptiveFormats?: PlayerFormat[]};
};

function readConfigString(html: string, key: string) {
  const match = html.match(new RegExp(`"${key}"\\s*:\\s*("(?:\\\\.|[^"\\\\])*")`));
  if (!match) return undefined;
  try {
    return JSON.parse(match[1]) as string;
  } catch {
    return undefined;
  }
}

function readConfigNumber(html: string, key: string) {
  const match = html.match(new RegExp(`"${key}"\\s*:\\s*(\\d+)`));
  return match ? Number(match[1]) : undefined;
}

async function loadWebClientConfig(videoId: string) {
  const watchUrl = `${youtubeOrigin}/watch?v=${encodeURIComponent(videoId)}&hl=en`;
  const response = await fetch(watchUrl, {
    headers: {"User-Agent": webUserAgent, "Accept-Language": "en-US,en;q=0.9"},
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw new Error(`YouTube watch page failed: ${response.status} ${response.statusText}`);
  const html = await response.text();
  const apiKey = readConfigString(html, "INNERTUBE_API_KEY");
  const clientVersion = readConfigString(html, "INNERTUBE_CLIENT_VERSION");
  if (!apiKey || !clientVersion) throw new Error("YouTube watch page did not expose an InnerTube client configuration.");
  return {
    apiKey,
    clientVersion,
    clientNameHeader: String(readConfigNumber(html, "INNERTUBE_CONTEXT_CLIENT_NAME") || 1),
    visitorData: readConfigString(html, "VISITOR_DATA")
  };
}

function finiteNumber(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseFormat(input: PlayerFormat): YoutubeStreamFormat | null {
  if (typeof input.itag !== "number" || !input.mimeType) return null;
  const cipherValue = input.signatureCipher || input.cipher;
  const cipher = cipherValue ? new URLSearchParams(cipherValue) : undefined;
  const url = input.url || cipher?.get("url") || undefined;
  let requiresNsig = false;
  if (url) {
    try {
      requiresNsig = new URL(url).searchParams.has("n");
    } catch {
      requiresNsig = true;
    }
  }
  return {
    itag: input.itag,
    mimeType: input.mimeType,
    bitrate: input.averageBitrate || input.bitrate,
    contentLength: finiteNumber(input.contentLength),
    durationSeconds: normalizeDurationSeconds((finiteNumber(input.approxDurationMs) || 0) / 1000),
    audioOnly: input.mimeType.startsWith("audio/"),
    audioQuality: input.audioQuality,
    audioSampleRate: finiteNumber(input.audioSampleRate),
    audioChannels: input.audioChannels,
    qualityLabel: input.qualityLabel,
    url,
    requiresSignature: Boolean(cipher?.get("s")),
    requiresNsig
  };
}

export async function resolveYoutubeViaInnertube(videoId: string): Promise<YoutubeInnertubeResult> {
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) throw new Error("Invalid YouTube videoId.");
  const errors: string[] = [];
  let webResult: YoutubeInnertubeResult | undefined;
  try {
    const config = await loadWebClientConfig(videoId);
    const payload = await requestPlayer({
      videoId,
      apiKey: config.apiKey,
      clientName: "WEB",
      clientNameHeader: config.clientNameHeader,
      clientVersion: config.clientVersion,
      userAgent: webUserAgent,
      visitorData: config.visitorData
    });
    webResult = resultFromPlayer(payload, webUserAgent);
    if (webResult.audioFormat) return webResult;
  } catch (error) {
    errors.push(`WEB: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const payload = await requestPlayer({
      videoId,
      apiKey: iosCompatibilityClient.apiKey,
      clientName: "IOS",
      clientNameHeader: "5",
      clientVersion: iosCompatibilityClient.clientVersion,
      userAgent: iosCompatibilityClient.userAgent,
      clientDetails: {
        deviceMake: "Apple",
        deviceModel: "iPhone16,2",
        osName: "iPhone",
        osVersion: "18.3.2.22D82"
      }
    });
    return resultFromPlayer(payload, iosCompatibilityClient.userAgent);
  } catch (error) {
    errors.push(`IOS: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (webResult) return webResult;
  throw new Error(`InnerTube could not resolve this video. ${errors.join("; ")}`);
}

async function requestPlayer(input: {
  videoId: string;
  apiKey: string;
  clientName: "WEB" | "IOS";
  clientNameHeader: string;
  clientVersion: string;
  userAgent: string;
  visitorData?: string;
  clientDetails?: Record<string, string>;
}) {
  const endpoint = new URL("/youtubei/v1/player", youtubeOrigin);
  endpoint.searchParams.set("key", input.apiKey);
  endpoint.searchParams.set("prettyPrint", "false");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": input.userAgent,
      "X-YouTube-Client-Name": input.clientNameHeader,
      "X-YouTube-Client-Version": input.clientVersion,
      Origin: youtubeOrigin
    },
    body: JSON.stringify({
      videoId: input.videoId,
      contentCheckOk: true,
      racyCheckOk: true,
      context: {
        client: {
          clientName: input.clientName,
          clientVersion: input.clientVersion,
          hl: "en",
          gl: "US",
          visitorData: input.visitorData,
          ...input.clientDetails
        }
      }
    }),
    signal: AbortSignal.timeout(15_000)
  });
  if (!response.ok) throw new Error(`InnerTube player failed: ${response.status} ${response.statusText}`);
  return response.json() as Promise<PlayerResponse>;
}

function resultFromPlayer(payload: PlayerResponse, userAgent: string): YoutubeInnertubeResult {
  if (payload.playabilityStatus?.status !== "OK") {
    throw new Error(payload.playabilityStatus?.reason || "InnerTube did not return a playable response.");
  }
  const formats = [
    ...(payload.streamingData?.adaptiveFormats || []),
    ...(payload.streamingData?.formats || [])
  ].map(parseFormat).filter((format): format is YoutubeStreamFormat => Boolean(format));
  const audioFormat = formats
    .filter((format) => format.audioOnly && format.url && !format.requiresSignature && !format.requiresNsig)
    .sort((left, right) => (right.bitrate || 0) - (left.bitrate || 0))[0];
  return {
    title: payload.videoDetails?.title,
    durationSeconds: normalizeDurationSeconds(finiteNumber(payload.videoDetails?.lengthSeconds)),
    thumbnailUrl: payload.videoDetails?.thumbnail?.thumbnails?.at(-1)?.url,
    formats,
    audioFormat,
    userAgent
  };
}
