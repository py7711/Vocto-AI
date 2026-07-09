import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getPublicShare} from "@/lib/share-links";
import {logApiError} from "@/lib/api-logger";

export async function GET(_request: Request, {params}: {params: {token: string}}) {
  try {
    const share = await getPublicShare(params.token);
    if (!share) {
      return NextResponse.json({error: "分享链接不存在或已过期。"}, {status: 404});
    }

    const translations = await prisma.aIInsight.findMany({
      where: {
        mediaTaskId: share.mediaTaskId,
        type: "TRANSLATION"
      },
      orderBy: {updatedAt: "desc"},
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

    return NextResponse.json({translations});
  } catch (error) {
    logApiError(error, _request);
    const message = error instanceof Error ? error.message : "无法读取分享翻译列表。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
