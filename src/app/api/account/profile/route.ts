import {NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentUser, hashRawPassword} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

const profileSchema = z.object({
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional()
});

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({error: "请先登录后再更新账号设置。"}, {status: 401});
    }

    const input = profileSchema.parse(await request.json().catch(() => ({})));
    const nextEmail = input.email?.trim().toLowerCase();
    if (nextEmail && nextEmail !== user.email.toLowerCase()) {
      const existing = await prisma.user.findUnique({where: {email: nextEmail}, select: {id: true}});
      if (existing && existing.id !== user.id) {
        return NextResponse.json({error: "该邮箱已被注册。"}, {status: 409});
      }
    }

    const data: {name?: string; email?: string; passwordHash?: string; emailVerifiedAt?: Date | null} = {};
    if (input.firstName !== undefined || input.lastName !== undefined) {
      const name = [input.firstName?.trim(), input.lastName?.trim()].filter(Boolean).join(" ");
      data.name = name || user.email.split("@")[0];
    }
    if (nextEmail && nextEmail !== user.email.toLowerCase()) {
      data.email = nextEmail;
      data.emailVerifiedAt = null;
    }
    if (input.password) {
      data.passwordHash = await hashRawPassword(input.password);
    }

    if (!Object.keys(data).length) {
      return NextResponse.json({user});
    }

    const updated = await prisma.user.update({
      where: {id: user.id},
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        locale: true,
        emailVerifiedAt: true,
        dailyFreeCount: true,
        dailyResetAt: true,
        subscriptions: {
          orderBy: {createdAt: "desc"},
          take: 1,
          select: {
            plan: true,
            status: true,
            remainingMinutes: true,
            monthlyMinuteQuota: true
          }
        }
      }
    });

    return NextResponse.json({user: updated});
  } catch (error) {
    const status = error instanceof z.ZodError ? 422 : 400;
    return NextResponse.json({error: error instanceof Error ? error.message : "无法更新账号设置。"}, {status});
  }
}
