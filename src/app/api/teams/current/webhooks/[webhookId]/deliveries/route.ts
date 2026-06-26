import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {requireCurrentTeam, teamAccessErrorResponse, writeAuditLog} from "@/lib/teams";
import {replayWebhookDelivery} from "@/lib/webhooks";

const replaySchema = z.object({deliveryId: z.string().min(1).max(64)});

export async function GET(request: Request, {params}: {params: {webhookId: string}}) {
  try {
    const {team} = await requireCurrentTeam({headers: request.headers});
    const url = new URL(request.url);
    const take = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 30)));
    const endpoint = await prisma.webhookEndpoint.findFirst({
      where: {id: params.webhookId, teamId: team.id},
      select: {id: true}
    });
    if (!endpoint) {
      return NextResponse.json({error: "未找到 Webhook。"}, {status: 404});
    }

    const deliveries = await prisma.webhookDelivery.findMany({
      where: {endpointId: endpoint.id},
      orderBy: {createdAt: "desc"},
      take,
      select: {
        id: true,
        event: true,
        targetType: true,
        targetId: true,
        status: true,
        responseStatus: true,
        responseBody: true,
        durationMs: true,
        createdAt: true
      }
    });

    return NextResponse.json({deliveries});
  } catch (error) {
    const accessError = teamAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法读取 Webhook 投递记录。";
    return NextResponse.json({error: message}, {status: 400});
  }
}

export async function POST(request: Request, {params}: {params: {webhookId: string}}) {
  try {
    const {user, team} = await requireCurrentTeam({manage: true, headers: request.headers});
    const {deliveryId} = replaySchema.parse(await request.json());

    const endpoint = await prisma.webhookEndpoint.findFirst({
      where: {id: params.webhookId, teamId: team.id},
      select: {id: true}
    });
    if (!endpoint) {
      return NextResponse.json({error: "未找到 Webhook。"}, {status: 404});
    }

    const delivery = await prisma.webhookDelivery.findFirst({
      where: {id: deliveryId, endpointId: endpoint.id, teamId: team.id},
      select: {id: true}
    });
    if (!delivery) {
      return NextResponse.json({error: "未找到 Webhook 投递记录。"}, {status: 404});
    }

    const result = await replayWebhookDelivery(delivery.id, team.id);

    await writeAuditLog({
      teamId: team.id,
      userId: user.id,
      action: "webhook.replay",
      targetType: "webhook_delivery",
      targetId: result.deliveryId,
      metadata: {sourceDeliveryId: delivery.id, success: result.success},
      headers: request.headers
    });

    return NextResponse.json({replay: result});
  } catch (error) {
    const accessError = teamAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法重放 Webhook 投递。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
