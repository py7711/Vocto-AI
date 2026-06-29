import {NextResponse} from "next/server";
import {z} from "zod";
import {GET as exportSharedTranscription} from "@/app/api/share/[token]/exports/[format]/route";

const shareExportSchema = z.object({
  shareCode: z.string().optional(),
  code: z.string().optional(),
  token: z.string().optional(),
  fileType: z.string().optional(),
  format: z.string().optional(),
  showSpeakerName: z.boolean().optional(),
  showTimestamps: z.boolean().optional(),
  subtitleMaxChars: z.number().int().optional(),
  subtitleMaxDurationSeconds: z.number().optional()
}).passthrough();

export async function POST(request: Request) {
  try {
    // 旧分享导出接口使用 POST + shareCode/fileType；当前公开分享导出使用 GET + token/format。
    // 这里只做字段归一化和查询参数转发，不复制导出实现。
    const input = shareExportSchema.parse(await request.json().catch(() => ({})));
    const token = input.shareCode ?? input.code ?? input.token;
    const format = (input.fileType ?? input.format ?? "txt").toLowerCase();
    if (!token) return NextResponse.json({error: "请提供 shareCode。"}, {status: 422});

    const url = new URL(request.url);
    for (const key of ["showSpeakerName", "showTimestamps", "subtitleMaxChars", "subtitleMaxDurationSeconds"] as const) {
      const value = input[key];
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const forwarded = new Request(url, {headers: request.headers});
    return exportSharedTranscription(forwarded, {params: {token, format}});
  } catch (error) {
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "无法导出分享转写。"},
      {status: error instanceof z.ZodError ? 422 : 400}
    );
  }
}
