import {NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {createDeveloperSecret, ensurePersonalTeam} from "@/lib/developer-settings";
import {prisma} from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120)
});

// API Key 仍按个人 Team 归属做隔离；前端不展示管理入口时也不能放宽这里的归属校验。
export async function PATCH(request: Request, {params}: {params: {apiKeyId: string}}) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});
    const input = updateSchema.parse(await request.json());
    const team = await ensurePersonalTeam(user.id);
    const updated = await prisma.apiKey.updateMany({
      where: {id: params.apiKeyId, teamId: team.id},
      data: {name: input.name}
    });
    if (!updated.count) return NextResponse.json({error: "API Key 不存在。"}, {status: 404});
    return NextResponse.json({ok: true});
  } catch (error) {
    const status = error instanceof z.ZodError ? 422 : 400;
    return NextResponse.json({error: error instanceof Error ? error.message : "无法更新 API Key。"}, {status});
  }
}

export async function POST(_request: Request, {params}: {params: {apiKeyId: string}}) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});
  const team = await ensurePersonalTeam(user.id);
  const secret = createDeveloperSecret("usk");
  const updated = await prisma.apiKey.updateMany({
    where: {id: params.apiKeyId, teamId: team.id},
    data: {keyPrefix: secret.prefix, keyHash: secret.hash, status: "ACTIVE", revokedAt: null}
  });
  if (!updated.count) return NextResponse.json({error: "API Key 不存在。"}, {status: 404});
  return NextResponse.json({token: secret.token});
}

export async function DELETE(_request: Request, {params}: {params: {apiKeyId: string}}) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});
  const team = await ensurePersonalTeam(user.id);
  await prisma.apiKey.updateMany({
    where: {id: params.apiKeyId, teamId: team.id},
    data: {status: "REVOKED", revokedAt: new Date()}
  });
  return NextResponse.json({ok: true});
}
