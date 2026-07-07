import {NextResponse} from "next/server";
import {z} from "zod";
import {createEmailVerificationToken, getCurrentUser} from "@/lib/auth";
import {authMessage} from "@/lib/api-copy";
import {sendVerificationEmail} from "@/lib/email";
import {getRequestOrigin} from "@/lib/request-origin";

const resendSchema = z.object({
  locale: z.string().default("en")
});

export async function POST(request: Request) {
  let locale = request.headers.get("accept-language");
  try {
    const payload = await request.json().catch(() => ({}));
    locale = typeof payload?.locale === "string" ? payload.locale : locale;
    const input = resendSchema.parse(payload);
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({error: authMessage("loginRequired", input.locale)}, {status: 401});
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({ok: true, alreadyVerified: true});
    }

    const token = await createEmailVerificationToken(user.id);
    const appUrl = getRequestOrigin(request);
    const verificationUrl = `${appUrl}/${input.locale}/auth/verify-email?token=${encodeURIComponent(token)}`;
    const emailResult = await sendVerificationEmail({
      to: user.email,
      name: user.name,
      verificationUrl,
      locale: input.locale
    });

    return NextResponse.json({
      ok: true,
      verificationEmailSent: emailResult.sent,
      verificationUrl: emailResult.verificationUrl ?? null
    });
  } catch (error) {
    const status = error instanceof z.ZodError ? 422 : 400;
    return NextResponse.json({error: authMessage("verifyFailed", locale)}, {status});
  }
}
