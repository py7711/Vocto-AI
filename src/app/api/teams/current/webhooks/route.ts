import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {requireCurrentTeam, teamAccessErrorResponse, writeAuditLog} from "@/lib/teams";
import {createWebhookSecret, supportedWebhookEvents} from "@/lib/webhooks";

const createWebhookSchema = z.object({
  name: z.string().min(2).max(120),
  url: z.string().url().max(2048),
  events: z.array(z.enum(supportedWebhookEvents)).min(1).default(["task.completed"])
});

export async function GET(request: Request) {
  try {
    const {team} = await requireCurrentTeam({headers: request.headers});
    const webhooks = await prisma.webhookEndpoint.findMany({
      where: {teamId: team.id},
      orderBy: {createdAt: "desc"},
      select: {
        id: true,
        name: true,
        url: true,
        secretPrefix: true,
        events: true,
        status: true,
        failureCount: true,
        lastDeliveryAt: true,
        createdAt: true
      }
    });

    return NextResponse.json({webhooks});
  } catch (error) {
    const accessError = teamAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法读取 Webhook。";
    return NextResponse.json({error: message}, {status: 400});
  }
}

export async function POST(request: Request) {
  try {
    const {user, team} = await requireCurrentTeam({manage: true, headers: request.headers});
    const input = createWebhookSchema.parse(await request.json());
    const secret = createWebhookSecret();
    const webhook = await prisma.webhookEndpoint.create({
      data: {
        teamId: team.id,
        name: input.name,
        url: input.url,
        secretHash: secret.secretHash,
        secretPrefix: secret.secretPrefix,
        events: input.events,
        createdById: user.id
      },
      select: {
        id: true,
        name: true,
        url: true,
        secretPrefix: true,
        events: true,
        status: true,
        failureCount: true,
        createdAt: true
      }
    });

    await writeAuditLog({
      teamId: team.id,
      userId: user.id,
      action: "webhook.create",
      targetType: "webhook_endpoint",
      targetId: webhook.id,
      metadata: {name: webhook.name, url: webhook.url, events: input.events},
      headers: request.headers
    });

    return NextResponse.json({webhook: {...webhook, rawSecret: secret.rawSecret}});
  } catch (error) {
    const accessError = teamAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法创建 Webhook。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
