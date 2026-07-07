import {NextResponse} from "next/server";
import {getRequestOrigin} from "@/lib/request-origin";
import {createCompatTask, serializeCompatTask} from "@/lib/transcription-compat";
import {quotaErrorStatus} from "@/lib/usage";

export async function POST(request: Request) {
  try {
    const task = await createCompatTask(request, "YOUTUBE");
    return NextResponse.json(serializeCompatTask(task, {appUrl: getRequestOrigin(request)}), {status: 201});
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法创建 YouTube 转写任务。";
    return NextResponse.json({error: message}, {status: message === "RATE_LIMITED" ? 429 : quotaErrorStatus(message)});
  }
}
