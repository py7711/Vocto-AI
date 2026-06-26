import {NextResponse} from "next/server";
import {requireCurrentTeam, teamAccessErrorResponse, writeAuditLog} from "@/lib/teams";
import {prisma} from "@/lib/prisma";

export async function DELETE(request: Request, {params}: {params: {apiKeyId: string}}) {
  try {
    const {user, team} = await requireCurrentTeam({manage: true, headers: request.headers});
    const apiKey = await prisma.apiKey.findFirst({
      where: {id: params.apiKeyId, teamId: team.id}
    });
    if (!apiKey) {
      return NextResponse.json({error: "未找到 API Key。"}, {status: 404});
    }

    const revoked = await prisma.apiKey.update({
      where: {id: apiKey.id},
      data: {status: "REVOKED", revokedAt: new Date()}
    });

    await writeAuditLog({
      teamId: team.id,
      userId: user.id,
      action: "api_key.revoke",
      targetType: "api_key",
      targetId: apiKey.id,
      metadata: {name: apiKey.name, keyPrefix: apiKey.keyPrefix},
      headers: request.headers
    });

    return NextResponse.json({apiKey: revoked});
  } catch (error) {
    const accessError = teamAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法吊销 API Key。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
