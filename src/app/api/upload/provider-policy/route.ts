import {NextResponse} from "next/server";
import {env} from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    provider: env.R2_ACCOUNT_ID ? "cloudflare-r2" : "local-compatible",
    bucket: env.R2_BUCKET,
    maxUploadBytes: 10 * 1024 * 1024 * 1024,
    directUpload: true,
    multipartUpload: true,
    minMultipartPartBytes: 5 * 1024 * 1024,
    expiresInSeconds: 900
  });
}
