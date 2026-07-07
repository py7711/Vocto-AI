import {NextResponse} from "next/server";
import {z} from "zod";
import {createEmailVerificationToken, getCurrentUser, hashRawPassword} from "@/lib/auth";
import {sendVerificationEmail} from "@/lib/email";
import {jsonSafe} from "@/lib/json";
import {isLocale} from "@/lib/locales";
import {prisma} from "@/lib/prisma";
import {getRequestOrigin} from "@/lib/request-origin";

const profileSchema = z.object({
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  locale: z.string().refine((value) => isLocale(value), "Unsupported locale.").optional()
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

    const data: {name?: string; email?: string; passwordHash?: string; emailVerifiedAt?: Date | null; locale?: string} = {};
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
    if (input.locale) {
      data.locale = input.locale;
    }

    if (!Object.keys(data).length) {
      return NextResponse.json(jsonSafe({user}));
    }

    const updated = await prisma.user.update({
      where: {id: user.id},
      data,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        locale: true,
        passwordHash: true,
        emailVerifiedAt: true,
        dailyFreeCount: true,
        dailyResetAt: true,
        oauthAccounts: {
          select: {
            provider: true,
            email: true,
            avatarUrl: true
          }
        },
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

    let emailVerification: {verificationEmailSent: boolean; verificationUrl?: string | null} | null = null;
    if (data.email) {
      const token = await createEmailVerificationToken(updated.id);
      const appUrl = getRequestOrigin(request);
      const nextLocale = input.locale ?? updated.locale ?? user.locale ?? "en";
      const verificationUrl = `${appUrl}/${nextLocale}/auth/verify-email?token=${encodeURIComponent(token)}`;
      const emailResult = await sendVerificationEmail({
        to: updated.email,
        name: updated.name,
        verificationUrl,
        locale: nextLocale
      });
      emailVerification = {
        verificationEmailSent: emailResult.sent,
        verificationUrl: emailResult.verificationUrl ?? null
      };
    }

    return NextResponse.json(jsonSafe({user: {...updated, passwordSet: Boolean(updated.passwordHash), passwordHash: undefined}, emailVerification}));
  } catch (error) {
    const status = error instanceof z.ZodError ? 422 : 400;
    return NextResponse.json({error: error instanceof Error ? error.message : "无法更新账号设置。"}, {status});
  }
}
