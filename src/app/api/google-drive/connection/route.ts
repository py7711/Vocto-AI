import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({connected: false});
  const connection = await prisma.googleDriveConnection.findUnique({
    where: {userId: user.id},
    select: {email: true, expiresAt: true, updatedAt: true}
  });
  return NextResponse.json({connected: Boolean(connection), connection});
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});
  await prisma.googleDriveConnection.deleteMany({where: {userId: user.id}});
  return NextResponse.json({ok: true});
}

// 旧客户端使用 POST /auth/google-drive/disconnect；rewrite 转到这里后继续复用删除逻辑。
export const POST = DELETE;
