import {NextResponse} from "next/server";
import {z} from "zod";
import {listYoutubeSubtitles} from "@/server/media/prepare";
import {logApiError} from "@/lib/api-logger";

const schema = z.object({url: z.string().min(1)});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const subtitles = await listYoutubeSubtitles(input.url);
    return NextResponse.json({subtitles});
  } catch (error) {
    logApiError(error, request);
    const message = error instanceof Error ? error.message : "无法读取 YouTube 字幕列表。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
