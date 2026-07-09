import {NextResponse} from "next/server";
import {AssemblyAIProvider} from "@/server/transcription/assemblyai";
import {finalizeTranscriptionResult, loadJobContext} from "@/server/transcription/finalize";
import {CALLBACK_AUTH_HEADER} from "@/server/transcription/types";
import {logApiError, logApiInfo} from "@/lib/api-logger";

export const dynamic = "force-dynamic";

// AssemblyAI webhook 只回传 {transcript_id, status}，需要再按 id 拉取完整结果。
export async function POST(request: Request) {
  const url = new URL(request.url);
  const taskId = url.searchParams.get("taskId");
  // token 可来自 URL query 或官方 webhook 鉴权头，任一命中即视为合法来源。
  const token = url.searchParams.get("token") ?? request.headers.get(CALLBACK_AUTH_HEADER);

  let body: unknown = {};
  let bodyReadError: string | undefined;
  try {
    body = await request.json();
  } catch (error) {
    bodyReadError = error instanceof Error ? error.message : String(error);
  }

  logApiInfo("Received AssemblyAI transcription callback.", request, {
    meta: {
      provider: "assemblyai",
      callbackParams: {
        query: callbackQueryParams(url),
        auth: {
          tokenSource: url.searchParams.has("token") ? "query" : request.headers.has(CALLBACK_AUTH_HEADER) ? "header" : "missing",
          authHeaderName: CALLBACK_AUTH_HEADER,
          authHeaderPresent: request.headers.has(CALLBACK_AUTH_HEADER)
        },
        body: summarizeCallbackBody(body),
        bodyReadError
      }
    }
  });

  if (!taskId || !token) {
    return NextResponse.json({error: "缺少 taskId 或 token。"}, {status: 400});
  }

  const context = await loadJobContext(taskId);
  if (!context || context.callbackToken !== token || context.provider !== "assemblyai") {
    return NextResponse.json({error: "回调校验失败。"}, {status: 403});
  }

  try {
    const callbackBody = isRecord(body) ? body : {};
    const transcriptId = typeof callbackBody.transcript_id === "string" ? callbackBody.transcript_id : context.providerJobId;
    const status = typeof callbackBody.status === "string" ? callbackBody.status : undefined;
    if (!transcriptId) throw new Error("AssemblyAI callback did not include transcript_id.");
    if (status && status !== "completed") {
      // 非完成状态（如 error）交由 worker 的兜底链路处理。
      return NextResponse.json({ok: true, skipped: status});
    }

    const result = await new AssemblyAIProvider().fetchResult(transcriptId);
    if (result) {
      await finalizeTranscriptionResult({taskId, result, context});
    }
    return NextResponse.json({ok: true});
  } catch (error) {
    logApiError(error, request);
    return NextResponse.json({ok: false}, {status: 200});
  }
}

function callbackQueryParams(url: URL) {
  return Object.fromEntries(Array.from(url.searchParams.entries()).map(([key, value]) => [
    key,
    isSensitiveCallbackParam(key) ? "[redacted]" : value
  ]));
}

function summarizeCallbackBody(body: unknown) {
  if (!isRecord(body)) return {type: typeof body};
  return Object.fromEntries(Object.entries(body).map(([key, value]) => [key, summarizeCallbackValue(value)]));
}

function summarizeCallbackValue(value: unknown): unknown {
  if (value === null || typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") return value.length > 200 ? `${value.slice(0, 200)}...` : value;
  if (Array.isArray(value)) return {type: "array", length: value.length};
  if (isRecord(value)) return {type: "object", keys: Object.keys(value).slice(0, 20)};
  return {type: typeof value};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSensitiveCallbackParam(key: string) {
  return ["code", "key", "password", "secret", "state", "token"].some((part) => key.toLowerCase().includes(part));
}
