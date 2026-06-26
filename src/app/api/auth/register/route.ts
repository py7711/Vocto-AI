import {NextResponse} from "next/server";
import {z} from "zod";
import {createEmailVerificationToken, hashPassword, setSessionCookie} from "@/lib/auth";
import {authMessage} from "@/lib/api-copy";
import {sendVerificationEmail} from "@/lib/email";
import {env} from "@/lib/env";
import {prisma} from "@/lib/prisma";
import {ensureDefaultTeam, writeAuditLog} from "@/lib/teams";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
  locale: z.string().default("zh")
});

export async function POST(request: Request) {
  let locale = request.headers.get("accept-language");
  try {
    const payload = await request.json().catch(() => ({}));
    locale = typeof payload?.locale === "string" ? payload.locale : locale;
    const input = registerSchema.parse(payload);
    const email = input.email.toLowerCase();
    const existing = await prisma.user.findUnique({where: {email}});

    if (existing) {
      return NextResponse.json({error: authMessage("emailExists", input.locale)}, {status: 409});
    }

    const name = [input.firstName, input.lastName].filter(Boolean).join(" ") || email.split("@")[0];
    const passwordHash = await hashPassword(input.password);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          locale: input.locale,
          subscriptions: {
            create: {
              plan: "FREE",
              status: "ACTIVE",
              monthlyMinuteQuota: 120,
              remainingMinutes: 120,
              maxSingleFileMinutes: 30
            }
          }
        },
        select: {id: true, email: true, name: true, role: true, locale: true}
      });

      const team = await ensureDefaultTeam(createdUser, tx);
      await writeAuditLog({
        teamId: team.id,
        userId: createdUser.id,
        action: "auth.register",
        targetType: "user",
        targetId: createdUser.id,
        metadata: {email: createdUser.email},
        tx
      });

      return createdUser;
    });

    const token = await createEmailVerificationToken(user.id);
    const appUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
    const verificationUrl = `${appUrl}/${input.locale}/auth/verify-email?token=${encodeURIComponent(token)}`;
    const emailResult = await sendVerificationEmail({
      to: user.email,
      name: user.name,
      verificationUrl,
      locale: input.locale
    });

    await setSessionCookie(user.id);
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      requiresEmailVerification: true,
      verificationEmailSent: emailResult.sent,
      verificationUrl: emailResult.verificationUrl
    });
  } catch (error) {
    const status = error instanceof z.ZodError ? 422 : 400;
    return NextResponse.json({error: authMessage("registerFailed", locale)}, {status});
  }
}
