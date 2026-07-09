import {NextResponse} from "next/server";
import {z} from "zod";
import {isPasswordCredential, setSessionCookie, verifyPasswordCredentials} from "@/lib/auth";
import {authMessage} from "@/lib/api-copy";
import {prisma} from "@/lib/prisma";
import {logApiError} from "@/lib/api-logger";

const loginSchema = z.object({
  email: z.string().email(),
  passwordCredential: z.string().refine(isPasswordCredential),
  legacyPasswordCredential: z.string().refine(isPasswordCredential).optional(),
  locale: z.string().default("en")
});

export async function POST(request: Request) {
  let locale = request.headers.get("accept-language");
  try {
    const payload = await request.json().catch(() => ({}));
    locale = typeof payload?.locale === "string" ? payload.locale : locale;
    const input = loginSchema.parse(payload);
    const user = await prisma.user.findUnique({
      where: {email: input.email.toLowerCase()},
      select: {id: true, email: true, name: true, role: true, passwordHash: true}
    });

    if (!user || !(await verifyPasswordCredentials([input.passwordCredential, input.legacyPasswordCredential], user.passwordHash))) {
      return NextResponse.json({error: authMessage("invalidLogin", input.locale)}, {status: 401});
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({where: {id: user.id}, data: {lastLoginAt: new Date()}});
      const subscription = await tx.subscription.findFirst({where: {userId: user.id}, select: {id: true}});
      if (!subscription) {
        await tx.subscription.create({
          data: {
            userId: user.id,
            plan: "FREE",
            status: "ACTIVE",
            monthlyMinuteQuota: 120,
            remainingMinutes: 120,
            maxSingleFileMinutes: 30
          }
        });
      }
    });
    await setSessionCookie(user.id);
    return NextResponse.json({user: {id: user.id, email: user.email, name: user.name, role: user.role}});
  } catch (error) {
    logApiError(error, request);
    const status = error instanceof z.ZodError ? 422 : 400;
    return NextResponse.json({error: authMessage("loginFailed", locale)}, {status});
  }
}
