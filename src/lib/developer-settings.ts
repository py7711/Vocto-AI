import {createHash, randomBytes} from "crypto";
import {prisma} from "@/lib/prisma";

function hashDeveloperSecret(value: string) {
  // API Key 和 webhook secret 只保存 SHA-256 摘要；创建后明文 token 不再入库。
  return createHash("sha256").update(value).digest("hex");
}

export function createDeveloperSecret(prefix: string) {
  const token = `${prefix}_${randomBytes(24).toString("base64url")}`;
  return {
    token,
    // 只展示短前缀用于后台识别；完整密钥只在创建或重置时返回一次。
    prefix: token.slice(0, 18),
    hash: hashDeveloperSecret(token)
  };
}

function readApiKey(request: Request) {
  // 公开 API 同时支持 X-API-Key 和 Authorization: Bearer，兼容不同服务端集成习惯。
  const headerKey = request.headers.get("x-api-key")?.trim();
  const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  return headerKey || bearer || null;
}

export async function authenticateApiKey(request: Request) {
  const token = readApiKey(request);
  if (!token) return null;

  const keyHash = hashDeveloperSecret(token);
  const apiKey = await prisma.apiKey.findFirst({
    where: {
      keyHash,
      status: "ACTIVE",
      OR: [{expiresAt: null}, {expiresAt: {gt: new Date()}}]
    },
    include: {
      team: {
        select: {
          id: true,
          ownerId: true
        }
      },
      createdBy: {
        select: {
          id: true,
          email: true,
          name: true,
          locale: true
        }
      }
    }
  });

  if (!apiKey) return null;

  await prisma.apiKey.update({
    where: {id: apiKey.id},
    data: {lastUsedAt: new Date()}
  });

  return {
    apiKey: {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix
    },
    team: apiKey.team,
    user: apiKey.createdBy
  };
}

export function apiUnauthorizedResponse() {
  return Response.json(
    {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "请提供有效的 X-API-Key 或 Bearer token。"
      },
      timestamp: new Date().toISOString()
    },
    {status: 401}
  );
}

export async function ensurePersonalTeam(userId: string) {
  const existing = await prisma.team.findFirst({
    where: {ownerId: userId},
    orderBy: {createdAt: "asc"},
    select: {id: true}
  });
  if (existing) return existing;

  // 当前产品是个人工作区，但 API Key/Webhook 沿用 Team 归属模型。
  // 因此为每个用户懒创建一个个人 Team，既兼容旧表结构，也不向前端暴露团队管理复杂度。
  return prisma.team.create({
    data: {
      ownerId: userId,
      name: "个人工作区",
      defaultLocale: "en",
      members: {
        create: {
          userId,
          role: "OWNER",
          status: "ACTIVE"
        }
      }
    },
    select: {id: true}
  });
}
