import {NextResponse} from "next/server";
import {z} from "zod";
import {decodeIdentityTransitionToken} from "@/lib/account-compat";

const promoteSchema = z.object({
  transitionToken: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const input = promoteSchema.parse(await request.json().catch(() => ({})));
    // promote 端点只验证旧端 transitionToken 并告诉客户端下一步进入登录/注册；
    // 当前 schema 没有匿名用户表，因此这里不会迁移任务归属。
    const transition = decodeIdentityTransitionToken(input.transitionToken);
    if (!transition) return NextResponse.json({error: "身份迁移令牌无效或已过期。"}, {status: 400});

    return NextResponse.json({
      promoted: true,
      anonymousId: transition.anonymousId,
      transitionToken: input.transitionToken,
      nextAction: "sign_up_or_sign_in"
    });
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : "无法升级匿名身份。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
