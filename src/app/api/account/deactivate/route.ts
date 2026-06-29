import {NextResponse} from "next/server";
import {clearSessionCookie, getCurrentUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});
  await prisma.user.delete({where: {id: user.id}});
  clearSessionCookie();
  return NextResponse.json({ok: true});
}

// 旧客户端使用 POST /user/deactivate；rewrite 转到规范接口后仍保留同一方法兼容。
export const POST = DELETE;
