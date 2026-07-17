import {NextResponse} from "next/server";
import {getPublicShare} from "@/lib/share-links";
import {logApiError} from "@/lib/api-logger";
import {transcriptTranslations} from "@/lib/transcript-translations";

export async function GET(_request: Request, {params}: {params: {token: string; locale: string}}) {
  try {
    const share = await getPublicShare(params.token);
    if (!share) {
      return NextResponse.json({error: "分享链接不存在或已过期。"}, {status: 404});
    }

    const translation = transcriptTranslations(share.mediaTask.transcript?.translations)[params.locale];

    if (!translation) {
      return NextResponse.json({error: "翻译不存在。"}, {status: 404});
    }

    return NextResponse.json({locale: params.locale, content: translation});
  } catch (error) {
    logApiError(error, _request);
    const message = error instanceof Error ? error.message : "无法读取分享翻译。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
