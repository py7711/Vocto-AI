import {NextResponse} from "next/server";
import {listCompatTasks} from "@/lib/transcription-compat";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const result = await listCompatTasks(request);
    return NextResponse.json({
      data: result.items,
      transcriptions: result.items,
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / result.pageSize))
    });
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : "无法读取转写分页列表。"}, {status: 400});
  }
}
