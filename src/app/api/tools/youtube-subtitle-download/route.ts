import {NextResponse} from "next/server";
import {z} from "zod";
import {downloadYoutubeSubtitle} from "@/server/media/prepare";
import {logApiError} from "@/lib/api-logger";
import {youtubeUrlSchema} from "@/lib/youtube-url";

const schema = z.object({
  url: youtubeUrlSchema,
  languageCode: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,31}$/),
  format: z.enum(["srt", "vtt"]).default("srt"),
  title: z.string().optional()
});

function safeName(input: string) {
  return input.replace(/[^\w.\-]+/g, "_").replace(/^_+|_+$/g, "") || "youtube-subtitle";
}

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const content = await downloadYoutubeSubtitle(input.url, input.languageCode, input.format);
    const fileName = `${safeName(input.title || "youtube-subtitle")}-${safeName(input.languageCode)}.${input.format}`;

    return new Response(content, {
      headers: {
        "Content-Type": input.format === "srt" ? "application/x-subrip; charset=utf-8" : "text/vtt; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`
      }
    });
  } catch (error) {
    logApiError(error, request);
    const message = error instanceof Error ? error.message : "无法下载 YouTube 字幕。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
