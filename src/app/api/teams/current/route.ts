import {NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentTeamSnapshot, requireCurrentTeam, teamAccessErrorResponse, writeAuditLog} from "@/lib/teams";
import {prisma} from "@/lib/prisma";

const updateTeamSchema = z.object({
  name: z.string().min(2).max(160).optional(),
  defaultLocale: z.string().min(2).max(16).optional(),
  retentionDays: z.number().int().min(7).max(3650).nullable().optional()
});

export async function GET() {
  try {
    const snapshot = await getCurrentTeamSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    const accessError = teamAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法读取团队空间。";
    return NextResponse.json({error: message}, {status: 400});
  }
}

export async function PATCH(request: Request) {
  try {
    const {user, team} = await requireCurrentTeam({manage: true, headers: request.headers});
    const input = updateTeamSchema.parse(await request.json());
    const updatedTeam = await prisma.team.update({
      where: {id: team.id},
      data: {
        name: input.name,
        defaultLocale: input.defaultLocale,
        retentionDays: input.retentionDays
      }
    });

    await writeAuditLog({
      teamId: team.id,
      userId: user.id,
      action: "team.update",
      targetType: "team",
      targetId: team.id,
      metadata: input,
      headers: request.headers
    });

    return NextResponse.json({team: updatedTeam});
  } catch (error) {
    const accessError = teamAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法更新团队空间。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
