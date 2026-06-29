import {NextResponse} from "next/server";
import {z} from "zod";
import {resolveYoutubeVideoDownloadUrl} from "@/server/media/prepare";

const schema = z.object({url: z.string().min(1)});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const downloadUrl = await resolveYoutubeVideoDownloadUrl(input.url);
    return NextResponse.json({downloadUrl});
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法准备 YouTube 视频下载链接。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
