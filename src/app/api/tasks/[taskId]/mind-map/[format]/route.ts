import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";
import {userHasActiveMembership} from "@/lib/membership";
import {normalizeMindMapExportNode, renderMindMapMarkdown, renderMindMapXmind} from "@/lib/mind-map-exporters";
import {logApiError} from "@/lib/api-logger";

function safeDownloadName(value: string | null | undefined) {
  return (value || "votxt").replace(/[^\w.\-]+/g, "_").replace(/^_+|_+$/g, "") || "votxt";
}

export async function GET(request: Request, {params}: {params: {taskId: string; format: string}}) {
  try {
    const format = params.format?.toLowerCase();
    if (format !== "md" && format !== "xmind") {
      return NextResponse.json({error: "不支持的导出格式。"}, {status: 400});
    }

    const access = await assertTaskAccess(params.taskId, "read", request.headers);

    // 思维导图导出为会员专享能力：免费用户在前端已被拦截，此处做服务端二次校验。
    const isMember = await userHasActiveMembership(access.user?.id);
    if (!isMember) {
      return NextResponse.json({error: "思维导图导出为会员专享功能，请先升级套餐。", code: "MEMBERSHIP_REQUIRED"}, {status: 403});
    }

    const transcript = await prisma.transcript.findUnique({where: {mediaTaskId: params.taskId}, select: {mindMap: true}});
    const node = normalizeMindMapExportNode(transcript?.mindMap);
    if (!node) {
      return NextResponse.json({error: "尚未生成思维导图，无法导出。"}, {status: 404});
    }

    const task = await prisma.mediaTask.findUnique({where: {id: params.taskId}, select: {originalName: true}});
    const title = task?.originalName || node.label;
    const baseName = `${safeDownloadName(task?.originalName)}-mind-map`;

    if (format === "md") {
      const markdown = renderMindMapMarkdown({title, provider: null, node});
      return new Response(markdown, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${baseName}.md"`
        }
      });
    }

    const workbook = renderMindMapXmind({title, node});
    return new Response(new Uint8Array(workbook), {
      headers: {
        "Content-Type": "application/vnd.xmind.workbook",
        "Content-Disposition": `attachment; filename="${baseName}.xmind"`
      }
    });
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法导出思维导图。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
