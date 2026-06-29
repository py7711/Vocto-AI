import {NextResponse} from "next/server";
import {z} from "zod";
import {completeSourceMultipartUpload} from "@/lib/multipart-upload-compat";

export async function POST(request: Request, {params}: {params: {uploadId: string}}) {
  try {
    return NextResponse.json(await completeSourceMultipartUpload(params.uploadId, await request.json().catch(() => ({}))));
  } catch (error) {
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "无法完成分片上传。"},
      {status: error instanceof z.ZodError ? 422 : 400}
    );
  }
}
