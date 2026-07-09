import {NextResponse} from "next/server";
import {listSourceMultipartParts} from "@/lib/multipart-upload-compat";
import {logApiError} from "@/lib/api-logger";

export async function GET(_request: Request, {params}: {params: {uploadId: string}}) {
  try {
    return NextResponse.json(await listSourceMultipartParts(params.uploadId));
  } catch (error) {
    logApiError(error, _request);
    return NextResponse.json({error: error instanceof Error ? error.message : "无法读取分片列表。"}, {status: 400});
  }
}
