import "server-only";

import {createHash, randomBytes} from "crypto";
import {Prisma, TeamMemberRole} from "@prisma/client";
import {getCurrentUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

type PrismaClientLike = typeof prisma | Prisma.TransactionClient;

export class TeamAccessError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function slugifyTeamName(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "team";
}

function readableUserName(user: {email: string; name?: string | null}) {
  return user.name?.trim() || user.email.split("@")[0] || "Votxt";
}

function canManage(role: TeamMemberRole) {
  return role === "OWNER" || role === "ADMIN";
}

function requestMeta(headers?: Headers) {
  if (!headers) return {};
  return {
    ipAddress: headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || undefined,
    userAgent: headers.get("user-agent") || undefined
  };
}

export function hashApiKey(rawKey: string) {
  return createHash("sha256").update(rawKey).digest("hex");
}

export function createApiKeySecret() {
  const rawKey = `votxt_live_${randomBytes(32).toString("base64url")}`;
  return {
    rawKey,
    keyHash: hashApiKey(rawKey),
    keyPrefix: rawKey.slice(0, 18)
  };
}

export async function ensureDefaultTeam(
  user: {id: string; email: string; name?: string | null; locale?: string | null},
  tx: PrismaClientLike = prisma
) {
  const existingMembership = await tx.teamMember.findFirst({
    where: {userId: user.id, status: "ACTIVE"},
    orderBy: [{role: "asc"}, {createdAt: "asc"}],
    include: {team: true}
  });

  if (existingMembership?.team) {
    return existingMembership.team;
  }

  const teamName = `${readableUserName(user)} 的团队`;
  const team = await tx.team.create({
    data: {
      name: teamName,
      slug: `${slugifyTeamName(readableUserName(user))}-${user.id.slice(-6)}`,
      ownerId: user.id,
      defaultLocale: user.locale || "zh",
      members: {
        create: {
          userId: user.id,
          invitedEmail: user.email,
          role: "OWNER",
          status: "ACTIVE",
          title: "团队所有者",
          joinedAt: new Date()
        }
      }
    }
  });

  await tx.auditLog.create({
    data: {
      teamId: team.id,
      userId: user.id,
      action: "team.create",
      targetType: "team",
      targetId: team.id,
      metadata: {name: team.name}
    }
  });

  return team;
}

export async function requireCurrentTeam(options: {manage?: boolean; headers?: Headers} = {}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new TeamAccessError("请先登录后再访问团队空间。", 401);
  }

  const team = await ensureDefaultTeam(user);
  const membership = await prisma.teamMember.findFirst({
    where: {teamId: team.id, userId: user.id, status: "ACTIVE"}
  });

  if (!membership) {
    throw new TeamAccessError("当前账号不属于该团队。", 403);
  }
  if (options.manage && !canManage(membership.role)) {
    throw new TeamAccessError("只有团队所有者或管理员可以执行该操作。", 403);
  }

  return {user, team, membership, meta: requestMeta(options.headers)};
}

export async function getCurrentTeamSnapshot() {
  const {user, team, membership} = await requireCurrentTeam();
  const [members, apiKeys, webhookEndpoints, auditLogs] = await Promise.all([
    prisma.teamMember.findMany({
      where: {teamId: team.id},
      orderBy: [{role: "asc"}, {createdAt: "asc"}],
      select: {
        id: true,
        role: true,
        status: true,
        title: true,
        invitedEmail: true,
        joinedAt: true,
        createdAt: true,
        user: {select: {id: true, email: true, name: true, image: true}}
      }
    }),
    prisma.apiKey.findMany({
      where: {teamId: team.id},
      orderBy: {createdAt: "desc"},
      take: 12,
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        status: true,
        lastUsedAt: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true
      }
    }),
    prisma.webhookEndpoint.findMany({
      where: {teamId: team.id},
      orderBy: {createdAt: "desc"},
      take: 12,
      select: {
        id: true,
        name: true,
        url: true,
        secretPrefix: true,
        events: true,
        status: true,
        failureCount: true,
        lastDeliveryAt: true,
        createdAt: true,
        deliveries: {
          orderBy: {createdAt: "desc"},
          take: 3,
          select: {
            id: true,
            event: true,
            status: true,
            responseStatus: true,
            durationMs: true,
            createdAt: true
          }
        }
      }
    }),
    prisma.auditLog.findMany({
      where: {teamId: team.id},
      orderBy: {createdAt: "desc"},
      take: 20,
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        ipAddress: true,
        userAgent: true,
        metadata: true,
        createdAt: true,
        user: {select: {email: true, name: true}}
      }
    })
  ]);

  return {userId: user.id, team, membership, members, apiKeys, webhookEndpoints, auditLogs};
}

export async function writeAuditLog(input: {
  teamId?: string | null;
  userId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Prisma.InputJsonValue;
  headers?: Headers;
  tx?: PrismaClientLike;
}) {
  const client = input.tx ?? prisma;
  const meta = requestMeta(input.headers);
  return client.auditLog.create({
    data: {
      teamId: input.teamId,
      userId: input.userId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      metadata: input.metadata
    }
  });
}

export async function authenticateApiKey(headers: Headers) {
  const authorization = headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  const rawKey = match[1].trim();
  const keyHash = hashApiKey(rawKey);
  const apiKey = await prisma.apiKey.findUnique({
    where: {keyHash},
    include: {team: true}
  });

  if (!apiKey || apiKey.status !== "ACTIVE" || (apiKey.expiresAt && apiKey.expiresAt <= new Date())) {
    throw new TeamAccessError("API Key 无效或已过期。", 401);
  }

  await prisma.apiKey.update({
    where: {id: apiKey.id},
    data: {lastUsedAt: new Date()}
  });

  return {apiKey, team: apiKey.team};
}

export function teamAccessErrorResponse(error: unknown) {
  if (error instanceof TeamAccessError) {
    return {body: {error: error.message}, status: error.status};
  }
  return null;
}
