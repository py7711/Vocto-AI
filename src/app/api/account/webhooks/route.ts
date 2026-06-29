import {NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {createDeveloperSecret, ensurePersonalTeam} from "@/lib/developer-settings";
import {prisma} from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  url: z.string().url().max(2048),
  events: z.array(z.string().min(1)).default(["task.completed", "task.failed"])
});

// Webhook 是公开 API 和历史集成的兼容能力。个人版界面不展示入口，但路由保留，
// 并通过个人 Team 复用原有 WebhookEndpoint/WebhookDelivery 外键结构。
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});
  const team = await ensurePersonalTeam(user.id);
  const webhooks = await prisma.webhookEndpoint.findMany({
    where: {teamId: team.id},
    orderBy: {createdAt: "desc"},
    select: {id: true, name: true, url: true, secretPrefix: true, events: true, status: true, failureCount: true, lastDeliveryAt: true, createdAt: true}
  });
  return NextResponse.json({webhooks});
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});
    const input = createSchema.parse(await request.json());
    const team = await ensurePersonalTeam(user.id);
    const secret = createDeveloperSecret("whsec");
    const webhook = await prisma.webhookEndpoint.create({
      data: {
        teamId: team.id,
        name: input.name,
        url: input.url,
        events: input.events,
        secretHash: secret.hash,
        secretPrefix: secret.prefix,
        createdById: user.id
      },
      select: {id: true, name: true, url: true, secretPrefix: true, events: true, status: true, failureCount: true, lastDeliveryAt: true, createdAt: true}
    });
    return NextResponse.json({webhook, secret: secret.token});
  } catch (error) {
    const status = error instanceof z.ZodError ? 422 : 400;
    return NextResponse.json({error: error instanceof Error ? error.message : "无法创建 Webhook。"}, {status});
  }
}
