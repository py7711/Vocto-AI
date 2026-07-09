import {NextResponse} from "next/server";
import {abortSourceMultipartUpload} from "@/lib/multipart-upload-compat";
import {logApiError} from "@/lib/api-logger";

export async function POST(_request: Request, {params}: {params: {uploadId: string}}) {
  try {
    return NextResponse.json(await abortSourceMultipartUpload(params.uploadId));
  } catch (error) {
    logApiError(error, _request);
    return NextResponse.json({error: error instanceof Error ? error.message : "无法中止分片上传。"}, {status: 400});
  }
}
