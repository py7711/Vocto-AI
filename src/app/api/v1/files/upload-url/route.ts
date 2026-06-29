import {z} from "zod";
import {apiUnauthorizedResponse} from "@/lib/developer-settings";
import {openApiError, requireOpenApiAccess} from "@/lib/openapi";
import {createUploadUrl, publicObjectUrl} from "@/lib/storage";

const uploadSchema = z.object({
  // v1 公开 API 使用 snake_case 字段和 success/data/timestamp 响应包装，
  // 与工作台内部 camelCase 上传接口分开维护。
  file_name: z.string().min(1),
  content_type: z.string().min(1),
  size_bytes: z.number().int().positive().max(10 * 1024 * 1024 * 1024)
});

export async function POST(request: Request) {
  try {
    const access = await requireOpenApiAccess(request);
    if (!access) return apiUnauthorizedResponse();

    const input = uploadSchema.parse(await request.json());
    const cleanName = input.file_name.replace(/[^\w.\-]+/g, "_").slice(-120);
    const key = `api-uploads/${access.team.id}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${cleanName}`;
    const signed = await createUploadUrl({
      key,
      contentType: input.content_type,
      sizeBytes: input.size_bytes
    });

    return Response.json({
      success: true,
      data: {
        // 外部调用方保存 file_key 后，再用它创建转写任务或下载源文件。
        file_key: key,
        upload_url: signed.uploadUrl,
        file_url: signed.publicUrl || publicObjectUrl(key),
        expires_in: 900
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return openApiError(
      error instanceof z.ZodError ? "VALIDATION_ERROR" : "UPLOAD_URL_FAILED",
      error instanceof Error ? error.message : "无法创建上传地址。",
      error instanceof z.ZodError ? 422 : 400
    );
  }
}
