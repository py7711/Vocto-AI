import {NextResponse} from "next/server";
import {requireCurrentTeam, teamAccessErrorResponse} from "@/lib/teams";
import {prisma} from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const {team} = await requireCurrentTeam({headers: request.headers});
    const url = new URL(request.url);
    const take = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 30)));
    const auditLogs = await prisma.auditLog.findMany({
      where: {teamId: team.id},
      orderBy: {createdAt: "desc"},
      take,
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
    });

    return NextResponse.json({auditLogs});
  } catch (error) {
    const accessError = teamAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法读取审计日志。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
