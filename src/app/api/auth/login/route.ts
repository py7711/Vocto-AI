import {NextResponse} from "next/server";
import {z} from "zod";
import {setSessionCookie, verifyPassword} from "@/lib/auth";
import {authMessage} from "@/lib/api-copy";
import {prisma} from "@/lib/prisma";
import {ensureDefaultTeam, writeAuditLog} from "@/lib/teams";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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

    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      return NextResponse.json({error: authMessage("invalidLogin", input.locale)}, {status: 401});
    }

    const team = await ensureDefaultTeam(user);
    await prisma.user.update({where: {id: user.id}, data: {lastLoginAt: new Date()}});
    await writeAuditLog({
      teamId: team.id,
      userId: user.id,
      action: "auth.login",
      targetType: "user",
      targetId: user.id,
      headers: request.headers
    });
    await setSessionCookie(user.id);
    return NextResponse.json({user: {id: user.id, email: user.email, name: user.name, role: user.role}});
  } catch (error) {
    const status = error instanceof z.ZodError ? 422 : 400;
    return NextResponse.json({error: authMessage("loginFailed", locale)}, {status});
  }
}
