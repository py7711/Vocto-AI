import {NextResponse} from "next/server";
import {z} from "zod";
import {resolveYoutubeVideoDownloadUrl} from "@/server/media/prepare";
import {youtubeUrlSchema} from "@/lib/youtube-url";
import {logApiError} from "@/lib/api-logger";

const schema = z.object({
  url: youtubeUrlSchema
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const downloadUrl = await resolveYoutubeVideoDownloadUrl(input.url);
    return NextResponse.json({downloadUrl});
  } catch (error) {
    logApiError(error, request);
    const message = error instanceof Error ? error.message : "无法准备 YouTube 视频下载链接。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
