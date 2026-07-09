import {NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentUser, hashRawPassword} from "@/lib/auth";
import {ensureFreeSubscription, getAccountUser, serializeUser} from "@/lib/account-compat";
import {prisma} from "@/lib/prisma";
import {logApiError} from "@/lib/api-logger";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  firstName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
  locale: z.string().trim().max(16).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional()
});

function displayName(input: z.infer<typeof updateSchema>) {
  if (input.name) return input.name;
  const name = [input.firstName, input.lastName].filter(Boolean).join(" ").trim();
  return name || undefined;
}

export async function GET() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return NextResponse.json({user: null}, {status: 401});
  await ensureFreeSubscription(sessionUser.id);
  const user = await getAccountUser(sessionUser.id);
  return NextResponse.json({user: user ? serializeUser(user) : null});
}

export async function PUT(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) return NextResponse.json({error: "请先登录。"}, {status: 401});
    const input = updateSchema.parse(await request.json().catch(() => ({})));
    const nextEmail = input.email?.trim().toLowerCase();
    if (nextEmail && nextEmail !== sessionUser.email.toLowerCase()) {
      const existing = await prisma.user.findUnique({where: {email: nextEmail}, select: {id: true}});
      if (existing && existing.id !== sessionUser.id) {
        return NextResponse.json({error: "该邮箱已被注册。"}, {status: 409});
      }
    }

    const data: {name?: string; locale?: string; email?: string; emailVerifiedAt?: Date | null; passwordHash?: string} = {};
    const name = displayName(input);
    if (name) data.name = name;
    if (input.locale) data.locale = input.locale;
    if (nextEmail && nextEmail !== sessionUser.email.toLowerCase()) {
      data.email = nextEmail;
      data.emailVerifiedAt = null;
    }
    if (input.password) data.passwordHash = await hashRawPassword(input.password);

    if (Object.keys(data).length) {
      await prisma.user.update({where: {id: sessionUser.id}, data});
    }
    await ensureFreeSubscription(sessionUser.id);
    const user = await getAccountUser(sessionUser.id);
    return NextResponse.json({user: user ? serializeUser(user) : null});
  } catch (error) {
    logApiError(error, request);
    return NextResponse.json({error: error instanceof Error ? error.message : "无法更新用户信息。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
