import {NextResponse} from "next/server";
import {z} from "zod";
import {requireCurrentTeam, teamAccessErrorResponse, writeAuditLog} from "@/lib/teams";
import {prisma} from "@/lib/prisma";

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
  title: z.string().max(120).optional()
});

export async function POST(request: Request) {
  try {
    const {user, team} = await requireCurrentTeam({manage: true, headers: request.headers});
    const input = inviteMemberSchema.parse(await request.json());
    const email = input.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({where: {email}, select: {id: true, email: true}});

    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: team.id,
        OR: [{invitedEmail: email}, ...(existingUser ? [{userId: existingUser.id}] : [])]
      }
    });
    const memberData = {
      userId: existingUser?.id,
      invitedEmail: email,
      role: input.role,
      status: existingUser ? "ACTIVE" as const : "INVITED" as const,
      title: input.title,
      invitedById: user.id,
      joinedAt: existingUser ? new Date() : undefined
    };
    const member = existingMember
      ? await prisma.teamMember.update({
          where: {id: existingMember.id},
          data: memberData
        })
      : await prisma.teamMember.create({
          data: {
            teamId: team.id,
            ...memberData
          }
        });

    await writeAuditLog({
      teamId: team.id,
      userId: user.id,
      action: "team.member.invite",
      targetType: "team_member",
      targetId: member.id,
      metadata: {email, role: input.role, status: member.status},
      headers: request.headers
    });

    return NextResponse.json({member});
  } catch (error) {
    const accessError = teamAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法邀请团队成员。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
