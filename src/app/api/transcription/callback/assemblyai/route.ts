import {NextResponse} from "next/server";
import {AssemblyAIProvider} from "@/server/transcription/assemblyai";
import {finalizeTranscriptionResult, loadJobContext} from "@/server/transcription/finalize";
import {CALLBACK_AUTH_HEADER} from "@/server/transcription/types";

export const dynamic = "force-dynamic";

// AssemblyAI webhook 只回传 {transcript_id, status}，需要再按 id 拉取完整结果。
export async function POST(request: Request) {
  const url = new URL(request.url);
  const taskId = url.searchParams.get("taskId");
  // token 可来自 URL query 或官方 webhook 鉴权头，任一命中即视为合法来源。
  const token = url.searchParams.get("token") ?? request.headers.get(CALLBACK_AUTH_HEADER);
  if (!taskId || !token) {
    return NextResponse.json({error: "缺少 taskId 或 token。"}, {status: 400});
  }

  const context = await loadJobContext(taskId);
  if (!context || context.callbackToken !== token || context.provider !== "assemblyai") {
    return NextResponse.json({error: "回调校验失败。"}, {status: 403});
  }

  try {
    const body = await request.json().catch(() => ({}));
    const transcriptId = body.transcript_id ?? context.providerJobId;
    const status = body.status;
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
    console.error("[assemblyai-callback] 处理失败：", error instanceof Error ? error.message : error);
    return NextResponse.json({ok: false}, {status: 200});
  }
}
