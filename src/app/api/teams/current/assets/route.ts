import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {requireCurrentTeam, teamAccessErrorResponse} from "@/lib/teams";

export const dynamic = "force-dynamic";

function normalizeAssetType(value: string | null) {
  return value === "translations" ? "translations" : "transcriptions";
}

export async function GET(request: Request) {
  try {
    const {team} = await requireCurrentTeam({headers: request.headers});
    const url = new URL(request.url);
    const type = normalizeAssetType(url.searchParams.get("type"));
    const take = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 50)));
    const search = url.searchParams.get("search")?.trim();

    if (type === "translations") {
      // 翻译资产来自 AIInsight.TRANSLATION，保留任务信息便于前端跳转回转写详情。
      const assets = await prisma.aIInsight.findMany({
        where: {
          type: "TRANSLATION",
          mediaTask: {
            teamId: team.id,
            ...(search ? {originalName: {contains: search}} : {})
          }
        },
        orderBy: {updatedAt: "desc"},
        take,
        select: {
          id: true,
          type: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          mediaTask: {
            select: {
              id: true,
              originalName: true,
              sourceType: true,
              status: true,
              durationSeconds: true,
              provider: true,
              completedAt: true
            }
          }
        }
      });

      return NextResponse.json({type, assets});
    }

    // 转写资产以 MediaTask 为主表，保留最小必要字段用于资产页列表和搜索。
    const assets = await prisma.mediaTask.findMany({
      where: {
        teamId: team.id,
        ...(search ? {originalName: {contains: search}} : {})
      },
      orderBy: {createdAt: "desc"},
      take,
      select: {
        id: true,
        sourceType: true,
        originalName: true,
        status: true,
        statusMessage: true,
        progress: true,
        provider: true,
        durationSeconds: true,
        speakerCount: true,
        createdAt: true,
        completedAt: true,
        transcript: {select: {id: true}},
        insights: {select: {type: true, createdAt: true, updatedAt: true}}
      }
    });

    return NextResponse.json({type, assets});
  } catch (error) {
    const accessError = teamAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法读取团队资产。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
