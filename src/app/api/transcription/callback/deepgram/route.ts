import {NextResponse} from "next/server";
import {DeepgramProvider} from "@/server/transcription/deepgram";
import {finalizeTranscriptionResult, loadJobContext} from "@/server/transcription/finalize";

export const dynamic = "force-dynamic";

// Deepgram 预录转写完成后主动回调，body 即完整结果 JSON。
export async function POST(request: Request) {
  const url = new URL(request.url);
  const taskId = url.searchParams.get("taskId");
  const token = url.searchParams.get("token");
  if (!taskId || !token) {
    return NextResponse.json({error: "缺少 taskId 或 token。"}, {status: 400});
  }

  const context = await loadJobContext(taskId);
  if (!context || context.callbackToken !== token || context.provider !== "deepgram") {
    return NextResponse.json({error: "回调校验失败。"}, {status: 403});
  }

  try {
    const body = await request.json();
    const result = DeepgramProvider.parseCallback(body);
    await finalizeTranscriptionResult({taskId, result, context});
    return NextResponse.json({ok: true});
  } catch (error) {
    // 回调解析失败不阻断流程，worker 的容错轮询/同步兜底会继续尝试收尾。
    console.error("[deepgram-callback] 处理失败：", error instanceof Error ? error.message : error);
    return NextResponse.json({ok: false}, {status: 200});
  }
}
