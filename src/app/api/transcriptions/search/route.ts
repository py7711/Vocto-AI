import {NextResponse} from "next/server";
import {listCompatTasks} from "@/lib/transcription-compat";
import {logApiError} from "@/lib/api-logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const result = await listCompatTasks(request);
    return NextResponse.json({
      data: result.items,
      transcriptions: result.items,
      page: result.page,
      pageSize: result.pageSize,
      total: result.total
    });
  } catch (error) {
    logApiError(error, request);
    return NextResponse.json({error: error instanceof Error ? error.message : "无法搜索转写。"}, {status: 400});
  }
}
