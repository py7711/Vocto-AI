import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {requireCurrentTeam, teamAccessErrorResponse, writeAuditLog} from "@/lib/teams";
import {supportedWebhookEvents} from "@/lib/webhooks";

const updateWebhookSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  url: z.string().url().max(2048).optional(),
  events: z.array(z.enum(supportedWebhookEvents)).min(1).optional(),
  status: z.enum(["ACTIVE", "DISABLED"]).optional()
});

export async function PATCH(request: Request, {params}: {params: {webhookId: string}}) {
  try {
    const {user, team} = await requireCurrentTeam({manage: true, headers: request.headers});
    const input = updateWebhookSchema.parse(await request.json());
    const existing = await prisma.webhookEndpoint.findFirst({
      where: {id: params.webhookId, teamId: team.id}
    });
    if (!existing) {
      return NextResponse.json({error: "未找到 Webhook。"}, {status: 404});
    }

    const webhook = await prisma.webhookEndpoint.update({
      where: {id: existing.id},
      data: {
        name: input.name,
        url: input.url,
        events: input.events,
        status: input.status
      }
    });

    await writeAuditLog({
      teamId: team.id,
      userId: user.id,
      action: "webhook.update",
      targetType: "webhook_endpoint",
      targetId: webhook.id,
      metadata: input,
      headers: request.headers
    });

    return NextResponse.json({webhook});
  } catch (error) {
    const accessError = teamAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法更新 Webhook。";
    return NextResponse.json({error: message}, {status: 400});
  }
}

export async function DELETE(request: Request, {params}: {params: {webhookId: string}}) {
  try {
    const {user, team} = await requireCurrentTeam({manage: true, headers: request.headers});
    const existing = await prisma.webhookEndpoint.findFirst({
      where: {id: params.webhookId, teamId: team.id}
    });
    if (!existing) {
      return NextResponse.json({error: "未找到 Webhook。"}, {status: 404});
    }

    await prisma.webhookEndpoint.delete({where: {id: existing.id}});
    await writeAuditLog({
      teamId: team.id,
      userId: user.id,
      action: "webhook.delete",
      targetType: "webhook_endpoint",
      targetId: existing.id,
      metadata: {name: existing.name, url: existing.url},
      headers: request.headers
    });

    return NextResponse.json({deleted: true});
  } catch (error) {
    const accessError = teamAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法删除 Webhook。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
