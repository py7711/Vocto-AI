import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {NextResponse} from "next/server";

export const runtime = "nodejs";

const coreDirectory = join(process.cwd(), "node_modules", "@ffmpeg", "core", "dist", "umd");
const assets = {
  "core.js": {
    path: join(coreDirectory, "ffmpeg-core.js"),
    contentType: "text/javascript; charset=utf-8"
  },
  "core.wasm": {
    path: join(coreDirectory, "ffmpeg-core.wasm"),
    contentType: "application/wasm"
  }
} as const;

export async function GET(_request: Request, {params}: {params: {asset: string}}) {
  const asset = assets[params.asset as keyof typeof assets];
  if (!asset) return NextResponse.json({error: "Asset not found."}, {status: 404});
  const body = await readFile(asset.path);
  return new NextResponse(body, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": asset.contentType
    }
  });
}
