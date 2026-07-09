import {prisma} from "@/lib/prisma";
import {apiUnauthorizedResponse} from "@/lib/developer-settings";
import {createOpenApiTranscription, openApiError, requireOpenApiAccess} from "@/lib/openapi";
import {serializeTranscription} from "@/lib/webhook-delivery";
import {logApiError} from "@/lib/api-logger";

export async function GET(request: Request) {
  try {
    const access = await requireOpenApiAccess(request);
    if (!access) return apiUnauthorizedResponse();

    const url = new URL(request.url);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 30)));
    const status = url.searchParams.get("status")?.toUpperCase();
    // v1 接口按 API Key 关联的 teamId 隔离数据，这是公开 API 的授权边界；
    // 不能改成当前登录用户，否则服务端集成会读不到自己的历史任务。
    const tasks = await prisma.mediaTask.findMany({
      where: {
        teamId: access.team.id,
        ...(status ? {status: status as never} : {})
      },
      orderBy: {createdAt: "desc"},
      take: limit,
      include: {transcript: true}
    });

    return Response.json({
      success: true,
      data: tasks.map(serializeTranscription),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logApiError(error, request);
    return openApiError("LIST_TRANSCRIPTIONS_FAILED", error instanceof Error ? error.message : "无法列出转写任务。");
  }
}

export async function POST(request: Request) {
  // 创建逻辑集中在 openapi 模块，确保公开 API 的鉴权、额度和 webhook 行为一致。
  return createOpenApiTranscription(request);
}
