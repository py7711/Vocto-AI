import {NextResponse} from "next/server";
import {z} from "zod";
import {createUploadUrl, publicObjectUrl} from "@/lib/storage";

const schema = z.object({
  // 旧上传端点使用 fileName/fileSize，新接口使用 filename/sizeBytes。
  // 这里同时接收两套字段，并在响应里保留 fileId/transcriptionFileId/signedUrl 别名。
  fileName: z.string().min(1),
  filename: z.string().optional(),
  contentType: z.string().min(1).default("application/octet-stream"),
  sizeBytes: z.number().int().positive().max(10 * 1024 * 1024 * 1024).optional(),
  fileSize: z.number().int().positive().optional()
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json().catch(() => ({})));
    const cleanName = (input.fileName || input.filename || "upload").replace(/[^\w.\-]+/g, "_").slice(-120);
    const key = `uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${cleanName}`;
    const sizeBytes = input.sizeBytes ?? input.fileSize ?? 1;
    const signed = await createUploadUrl({key, contentType: input.contentType, sizeBytes});
    return NextResponse.json({
      // 这些别名会被旧版转写创建接口继续传回，不能只返回当前对象存储字段。
      key,
      fileId: key,
      transcriptionFileId: key,
      uploadUrl: signed.uploadUrl,
      signedUrl: signed.uploadUrl,
      publicUrl: signed.publicUrl || publicObjectUrl(key)
    });
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : "无法生成上传签名链接。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
