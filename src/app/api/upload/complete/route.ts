import {NextResponse} from "next/server";
import {z} from "zod";
import {publicObjectUrl} from "@/lib/storage";
import {logApiError} from "@/lib/api-logger";

const schema = z.object({
  key: z.string().min(1).optional(),
  fileId: z.string().min(1).optional(),
  transcriptionFileId: z.string().min(1).optional(),
  fileName: z.string().optional(),
  filename: z.string().optional(),
  contentType: z.string().optional(),
  sizeBytes: z.number().int().positive().optional()
}).refine((input) => Boolean(input.key || input.fileId || input.transcriptionFileId), {
  message: "缺少上传文件 Key。"
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json().catch(() => ({})));
    const key = input.key ?? input.fileId ?? input.transcriptionFileId ?? "";
    return NextResponse.json({
      ok: true,
      key,
      fileId: key,
      transcriptionFileId: key,
      fileName: input.fileName ?? input.filename ?? key.split("/").pop(),
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      publicUrl: publicObjectUrl(key)
    });
  } catch (error) {
    logApiError(error, request);
    return NextResponse.json({error: error instanceof Error ? error.message : "无法完成上传。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
