import {NextResponse} from "next/server";
import {z} from "zod";
import {resetPasswordWithToken, setSessionCookie} from "@/lib/auth";
import {logApiError} from "@/lib/api-logger";

const resetPasswordSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8),
  locale: z.string().default("en")
});

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));
    const input = resetPasswordSchema.parse(payload);
    const userId = await resetPasswordWithToken(input.token, input.password);
    if (!userId) {
      return NextResponse.json({error: "重置链接无效或已过期。"}, {status: 400});
    }

    await setSessionCookie(userId);
    return NextResponse.json({ok: true});
  } catch (error) {
    logApiError(error, request);
    const status = error instanceof z.ZodError ? 422 : 400;
    return NextResponse.json({error: "无法重置密码。"}, {status});
  }
}
