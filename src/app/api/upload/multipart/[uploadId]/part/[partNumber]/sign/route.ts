import {NextResponse} from "next/server";
import {signSourceMultipartPart} from "@/lib/multipart-upload-compat";

export async function POST(_request: Request, {params}: {params: {uploadId: string; partNumber: string}}) {
  try {
    return NextResponse.json(await signSourceMultipartPart(params.uploadId, Number(params.partNumber)));
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : "无法为分片生成上传签名。"}, {status: 400});
  }
}
