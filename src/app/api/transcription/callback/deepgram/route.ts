import {NextResponse} from "next/server";
import {DeepgramProvider} from "@/server/transcription/deepgram";
import {finalizeTranscriptionResult, loadJobContext} from "@/server/transcription/finalize";
import {logApiError, logApiInfo} from "@/lib/api-logger";

export const dynamic = "force-dynamic";

// Deepgram 预录转写完成后主动回调，body 即完整结果 JSON。
export async function POST(request: Request) {
  const url = new URL(request.url);
  const taskId = url.searchParams.get("taskId");
  const token = url.searchParams.get("token");

  let body: unknown = {};
  let bodyReadError: string | undefined;
  try {
    body = await request.json();
  } catch (error) {
    bodyReadError = error instanceof Error ? error.message : String(error);
  }

  logApiInfo("Received Deepgram transcription callback.", request, {
    meta: {
      provider: "deepgram",
      callbackParams: {
        query: callbackQueryParams(url),
        auth: {
          tokenSource: url.searchParams.has("token") ? "query" : "missing"
        },
        contentLength: request.headers.get("content-length"),
        body: summarizeDeepgramCallbackBody(body),
        bodyReadError
      }
    }
  });

  if (!taskId || !token) {
    return NextResponse.json({error: "缺少 taskId 或 token。"}, {status: 400});
  }

  const context = await loadJobContext(taskId);
  if (!context || context.callbackToken !== token || context.provider !== "deepgram") {
    return NextResponse.json({error: "回调校验失败。"}, {status: 403});
  }

  try {
    if (bodyReadError) throw new Error(`Deepgram callback body parse failed: ${bodyReadError}`);
    const result = DeepgramProvider.parseCallback(body);
    await finalizeTranscriptionResult({taskId, result, context});
    return NextResponse.json({ok: true});
  } catch (error) {
    logApiError(error, request);
    // 回调解析失败不阻断流程，worker 的容错轮询/同步兜底会继续尝试收尾。
    return NextResponse.json({ok: false}, {status: 200});
  }
}

function callbackQueryParams(url: URL) {
  return Object.fromEntries(Array.from(url.searchParams.entries()).map(([key, value]) => [
    key,
    isSensitiveCallbackParam(key) ? "[redacted]" : value
  ]));
}

function summarizeDeepgramCallbackBody(body: unknown) {
  if (!isRecord(body)) return {type: typeof body};
  const metadata = isRecord(body.metadata) ? body.metadata : {};
  const results = isRecord(body.results) ? body.results : {};
  const channels = Array.isArray(results.channels) ? results.channels : [];
  const firstChannel = isRecord(channels[0]) ? channels[0] : {};
  const alternatives = Array.isArray(firstChannel.alternatives) ? firstChannel.alternatives : [];
  const firstAlternative = isRecord(alternatives[0]) ? alternatives[0] : {};
  const words = Array.isArray(firstAlternative.words) ? firstAlternative.words : [];
  const utterances = Array.isArray(results.utterances) ? results.utterances : [];
  const transcript = typeof firstAlternative.transcript === "string" ? firstAlternative.transcript : undefined;

  return {
    topLevelKeys: Object.keys(body),
    metadata: {
      requestId: metadata.request_id,
      created: metadata.created,
      duration: metadata.duration,
      channels: metadata.channels,
      models: metadata.models
    },
    results: {
      channelCount: channels.length,
      utteranceCount: utterances.length,
      wordCount: words.length,
      transcriptLength: transcript?.length,
      detectedLanguage: firstChannel.detected_language
    }
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSensitiveCallbackParam(key: string) {
  return ["code", "key", "password", "secret", "state", "token"].some((part) => key.toLowerCase().includes(part));
}
