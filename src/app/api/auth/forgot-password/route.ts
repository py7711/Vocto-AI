import {NextResponse} from "next/server";
import {z} from "zod";
import {createPasswordResetToken} from "@/lib/auth";
import {sendPasswordResetEmail} from "@/lib/email";
import {prisma} from "@/lib/prisma";
import {getRequestOrigin} from "@/lib/request-origin";
import {logApiError} from "@/lib/api-logger";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  locale: z.string().default("en")
});

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));
    const input = forgotPasswordSchema.parse(payload);
    const email = input.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: {email},
      select: {id: true, email: true, name: true}
    });

    if (!user) {
      return NextResponse.json({ok: true, sent: false});
    }

    const token = await createPasswordResetToken(user.id);
    const appUrl = getRequestOrigin(request);
    const resetUrl = `${appUrl}/${input.locale}/auth/reset-password?token=${encodeURIComponent(token)}`;
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
      locale: input.locale
    });

    return NextResponse.json({
      ok: true,
      sent: emailResult.sent,
      resetUrl: "resetUrl" in emailResult ? emailResult.resetUrl : undefined
    });
  } catch (error) {
    logApiError(error, request);
    return NextResponse.json({error: "无法创建密码重置链接。"}, {status: 400});
  }
}
