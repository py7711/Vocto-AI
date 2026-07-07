import {NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {apiAccessRequiredMessage, createDeveloperSecret, ensurePersonalTeam, hasDeveloperApiAccess} from "@/lib/developer-settings";
import {prisma} from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120)
});

// 个人版设置页不展示 API Key 管理，但公开 API 和旧客户端仍会调用这些路由。
// 这里继续使用个人 Team 作为归属容器，避免破坏历史数据模型和外部集成。
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});
  if (!(await hasDeveloperApiAccess(user.id))) {
    return NextResponse.json({error: apiAccessRequiredMessage}, {status: 403});
  }
  const team = await ensurePersonalTeam(user.id);
  const apiKeys = await prisma.apiKey.findMany({
    where: {teamId: team.id},
    orderBy: {createdAt: "desc"},
    select: {id: true, name: true, keyPrefix: true, status: true, lastUsedAt: true, expiresAt: true, createdAt: true}
  });
  return NextResponse.json({apiKeys});
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});
    if (!(await hasDeveloperApiAccess(user.id))) {
      return NextResponse.json({error: apiAccessRequiredMessage}, {status: 403});
    }
    const input = createSchema.parse(await request.json());
    const team = await ensurePersonalTeam(user.id);
    const secret = createDeveloperSecret("usk");
    const apiKey = await prisma.apiKey.create({
      data: {
        teamId: team.id,
        name: input.name,
        keyPrefix: secret.prefix,
        keyHash: secret.hash,
        createdById: user.id
      },
      select: {id: true, name: true, keyPrefix: true, status: true, lastUsedAt: true, expiresAt: true, createdAt: true}
    });
    return NextResponse.json({apiKey, token: secret.token});
  } catch (error) {
    const status = error instanceof z.ZodError ? 422 : 400;
    return NextResponse.json({error: error instanceof Error ? error.message : "无法创建 API Key。"}, {status});
  }
}
