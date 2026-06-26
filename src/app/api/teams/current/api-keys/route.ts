import {NextResponse} from "next/server";
import {z} from "zod";
import {createApiKeySecret, requireCurrentTeam, teamAccessErrorResponse, writeAuditLog} from "@/lib/teams";
import {prisma} from "@/lib/prisma";

const createApiKeySchema = z.object({
  name: z.string().min(2).max(120),
  expiresAt: z.string().datetime().optional()
});

export async function POST(request: Request) {
  try {
    const {user, team} = await requireCurrentTeam({manage: true, headers: request.headers});
    const input = createApiKeySchema.parse(await request.json());
    const secret = createApiKeySecret();

    const apiKey = await prisma.apiKey.create({
      data: {
        teamId: team.id,
        name: input.name,
        keyPrefix: secret.keyPrefix,
        keyHash: secret.keyHash,
        createdById: user.id,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        status: true,
        expiresAt: true,
        createdAt: true
      }
    });

    await writeAuditLog({
      teamId: team.id,
      userId: user.id,
      action: "api_key.create",
      targetType: "api_key",
      targetId: apiKey.id,
      metadata: {name: apiKey.name, keyPrefix: apiKey.keyPrefix},
      headers: request.headers
    });

    // 明文 API Key 只在创建响应返回一次，数据库只保存哈希，后续无法找回。
    return NextResponse.json({apiKey: {...apiKey, rawKey: secret.rawKey}});
  } catch (error) {
    const accessError = teamAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法创建 API Key。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
