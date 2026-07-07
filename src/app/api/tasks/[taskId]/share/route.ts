import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {getRequestOrigin} from "@/lib/request-origin";
import {createShareToken, serializeShareLinkForOwner} from "@/lib/share-links";
import {hashToken} from "@/lib/auth";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";

const createShareSchema = z.object({
  locale: z.string().min(2).max(16).default("zh"),
  title: z.string().max(160).optional(),
  expiresInDays: z.number().int().min(1).max(365).optional()
});

export async function GET(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "read", request.headers);
    const url = new URL(request.url);
    const locale = url.searchParams.get("locale") || "zh";
    const now = new Date();
    const shareLink = await prisma.shareLink.findFirst({
      where: {
        mediaTaskId: params.taskId,
        enabled: true,
        OR: [{expiresAt: null}, {expiresAt: {gt: now}}]
      },
      orderBy: {createdAt: "desc"},
      select: {
        id: true,
        tokenHash: true,
        title: true,
        enabled: true,
        expiresAt: true,
        accessCount: true,
        lastAccessAt: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      shareLink: shareLink ? serializeShareLinkForOwner(shareLink, {appUrl: getRequestOrigin(request), locale}) : null
    });
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法读取分享状态。";
    return NextResponse.json({error: message}, {status: 400});
  }
}

export async function POST(request: Request, {params}: {params: {taskId: string}}) {
  try {
    const access = await assertTaskAccess(params.taskId, "write", request.headers);
    const input = createShareSchema.parse(await request.json().catch(() => ({})));
    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      select: {id: true, teamId: true, originalName: true, status: true, transcript: {select: {id: true}}}
    });

    if (!task?.transcript) {
      return NextResponse.json({error: "转写完成后才能创建分享链接。"}, {status: 409});
    }

    const rawToken = createShareToken();
    const expiresAt = input.expiresInDays ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000) : null;
    const shareLink = await prisma.shareLink.create({
      data: {
        id: rawToken,
        teamId: task.teamId,
        mediaTaskId: task.id,
        createdById: access.user?.id,
        tokenHash: hashToken(rawToken),
        title: input.title || task.originalName,
        expiresAt
      }
    });

    return NextResponse.json({
      shareLink: serializeShareLinkForOwner(shareLink, {appUrl: getRequestOrigin(request), locale: input.locale})
    });
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法创建分享链接。";
    return NextResponse.json({error: message}, {status: 400});
  }
}

export async function DELETE(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "write", request.headers);
    const result = await prisma.shareLink.updateMany({
      where: {
        mediaTaskId: params.taskId,
        enabled: true
      },
      data: {
        enabled: false
      }
    });

    return NextResponse.json({ok: true, disabledCount: result.count});
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法停用分享链接。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
