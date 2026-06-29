import {NextResponse} from "next/server";
import {z} from "zod";
import {createTransitionIntent} from "@/lib/account-compat";

const intentSchema = z.object({
  anonymousId: z.string().trim().max(160).optional(),
  anonymousUserId: z.string().trim().max(160).optional()
});

export async function POST(request: Request) {
  try {
    const input = intentSchema.parse(await request.json().catch(() => ({})));
    // 兼容旧端匿名身份升级握手：这里只签发短期 transitionToken，
    // 真正的账号创建/登录仍交给后续 auth 流程处理。
    const intent = createTransitionIntent(input.anonymousId ?? input.anonymousUserId);
    return NextResponse.json({
      id: intent.id,
      anonymousId: intent.anonymousId,
      transitionToken: intent.transitionToken,
      expiresAt: intent.expiresAt
    });
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : "无法创建身份迁移意图。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
