import {NextResponse} from "next/server";
import type {Prisma} from "@prisma/client";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {ensurePersonalTeam} from "@/lib/developer-settings";
import {prisma} from "@/lib/prisma";

const acquisitionSchema = z.object({
  landingUrl: z.string().max(2048).nullable().optional(),
  referrerUrl: z.string().max(2048).nullable().optional(),
  utmSource: z.string().max(160).nullable().optional(),
  utmMedium: z.string().max(160).nullable().optional(),
  utmCampaign: z.string().max(160).nullable().optional(),
  utmTerm: z.string().max(160).nullable().optional(),
  utmContent: z.string().max(160).nullable().optional(),
  gclid: z.string().max(255).nullable().optional(),
  gbraid: z.string().max(255).nullable().optional(),
  wbraid: z.string().max(255).nullable().optional(),
  fbclid: z.string().max(255).nullable().optional(),
  msclkid: z.string().max(255).nullable().optional(),
  ref: z.string().max(160).nullable().optional(),
  via: z.string().max(160).nullable().optional(),
  source: z.string().max(160).nullable().optional(),
  capturedAt: z.string().max(80).nullable().optional(),
  authUserCreatedAt: z.string().max(80).nullable().optional()
}).passthrough();

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});
    const input = acquisitionSchema.parse(await request.json().catch(() => ({})));
    const team = await ensurePersonalTeam(user.id);
    const audit = await prisma.auditLog.create({
      data: {
        teamId: team.id,
        userId: user.id,
        action: "user.acquisition.sync",
        targetType: "user",
        targetId: user.id,
        metadata: input as Prisma.InputJsonObject
      },
      select: {id: true, createdAt: true}
    });

    return NextResponse.json({
      acquisition: {
        id: audit.id,
        synced: true,
        createdAt: audit.createdAt
      }
    });
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : "无法同步获客来源。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
