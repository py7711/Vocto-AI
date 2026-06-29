import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getPublicShare} from "@/lib/share-links";

export async function GET(_request: Request, {params}: {params: {token: string; locale: string}}) {
  try {
    const share = await getPublicShare(params.token);
    if (!share) {
      return NextResponse.json({error: "分享链接不存在或已过期。"}, {status: 404});
    }

    const translation = await prisma.aIInsight.findUnique({
      where: {
        mediaTaskId_type_locale: {
          mediaTaskId: share.mediaTaskId,
          type: "TRANSLATION",
          locale: params.locale
        }
      },
      select: {
        id: true,
        locale: true,
        title: true,
        content: true,
        model: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!translation) {
      return NextResponse.json({error: "翻译不存在。"}, {status: 404});
    }

    return NextResponse.json(translation);
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法读取分享翻译。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
