import {NextResponse} from "next/server";
import {z} from "zod";
import {env} from "@/lib/env";
import {prisma} from "@/lib/prisma";
import {buildShareUrl, createShareToken} from "@/lib/share-links";
import {hashToken} from "@/lib/auth";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";
import {writeAuditLog} from "@/lib/teams";
import {dispatchTeamWebhook} from "@/lib/webhooks";

const createShareSchema = z.object({
  locale: z.string().min(2).max(16).default("zh"),
  title: z.string().max(160).optional(),
  expiresInDays: z.number().int().min(1).max(365).optional()
});

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
        teamId: task.teamId,
        mediaTaskId: task.id,
        createdById: access.user?.id,
        tokenHash: hashToken(rawToken),
        title: input.title || task.originalName,
        expiresAt
      }
    });

    await writeAuditLog({
      teamId: task.teamId,
      userId: access.user?.id ?? null,
      action: "share_link.create",
      targetType: "share_link",
      targetId: shareLink.id,
      metadata: {mediaTaskId: task.id, expiresAt: expiresAt?.toISOString()},
      headers: request.headers
    });

    const responseShareLink = {
        id: shareLink.id,
        url: buildShareUrl({appUrl: env.NEXT_PUBLIC_APP_URL, locale: input.locale, token: rawToken}),
        expiresAt: shareLink.expiresAt,
        createdAt: shareLink.createdAt
      };

    await dispatchTeamWebhook({
      teamId: task.teamId,
      event: "share_link.create",
      targetType: "share_link",
      targetId: shareLink.id,
      payload: {
        shareLinkId: shareLink.id,
        mediaTaskId: task.id,
        url: responseShareLink.url,
        expiresAt: shareLink.expiresAt?.toISOString() ?? null
      }
    });

    return NextResponse.json({
      shareLink: responseShareLink
    });
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法创建分享链接。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
