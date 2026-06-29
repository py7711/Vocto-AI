import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
import {ensurePersonalTeam} from "@/lib/developer-settings";
import {prisma} from "@/lib/prisma";

// 删除动作采用软停用，保留历史投递记录，方便兼容接口排障和审计。
export async function DELETE(_request: Request, {params}: {params: {webhookId: string}}) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});
  const team = await ensurePersonalTeam(user.id);
  await prisma.webhookEndpoint.updateMany({
    where: {id: params.webhookId, teamId: team.id},
    data: {status: "DISABLED"}
  });
  return NextResponse.json({ok: true});
}
