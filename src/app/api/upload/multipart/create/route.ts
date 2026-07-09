import {NextResponse} from "next/server";
import {z} from "zod";
import {createSourceMultipartUpload} from "@/lib/multipart-upload-compat";
import {logApiError} from "@/lib/api-logger";

export async function POST(request: Request) {
  try {
    const result = await createSourceMultipartUpload(await request.json().catch(() => ({})));
    return NextResponse.json(result);
  } catch (error) {
    logApiError(error, request);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "无法创建分片上传会话。"},
      {status: error instanceof z.ZodError ? 422 : 400}
    );
  }
}
