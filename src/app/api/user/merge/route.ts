import {NextResponse} from "next/server";
import {z} from "zod";
import {decodeIdentityTransitionToken, ensureFreeSubscription, getAccountUser, serializeUser} from "@/lib/account-compat";
import {getCurrentUser} from "@/lib/auth";
import {ensurePersonalTeam} from "@/lib/developer-settings";
import {prisma} from "@/lib/prisma";
import {logApiError} from "@/lib/api-logger";

const mergeSchema = z.object({
  transitionToken: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) return NextResponse.json({error: "请先登录。"}, {status: 401});
    const input = mergeSchema.parse(await request.json().catch(() => ({})));
    const transition = decodeIdentityTransitionToken(input.transitionToken);
    if (!transition) return NextResponse.json({error: "身份迁移令牌无效或已过期。"}, {status: 400});
    const team = await ensurePersonalTeam(sessionUser.id);

    const moved = await prisma.$transaction(async (tx) => {
      // 当前数据库还没有把匿名任务和 anonymousId 绑定的字段。
      // 旧实现按 userId/teamId 为空全量迁移，会把所有匿名任务误归属到当前登录用户。
      // 因此这里只确认 transition token 有效并记录审计；等 schema 增加匿名归属字段后，再按 anonymousId 精准迁移。
      await tx.auditLog.create({
        data: {
          teamId: team.id,
          userId: sessionUser.id,
          action: "user.identity.merge",
          targetType: "anonymous_identity",
          targetId: transition.anonymousId,
          metadata: {intentId: transition.intentId}
        }
      });
      return {tasks: 0, shareLinks: 0};
    });

    await ensureFreeSubscription(sessionUser.id);
    const user = await getAccountUser(sessionUser.id);
    return NextResponse.json({
      merged: true,
      anonymousId: transition.anonymousId,
      moved: {
        transcriptions: moved.tasks,
        shareLinks: moved.shareLinks
      },
      user: user ? serializeUser(user) : null
    });
  } catch (error) {
    logApiError(error, request);
    return NextResponse.json({error: error instanceof Error ? error.message : "无法合并匿名账号。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
