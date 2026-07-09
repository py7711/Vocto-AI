import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {logApiError} from "@/lib/api-logger";

const emailSchema = z.object({
  email: z.string().email()
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const input = emailSchema.parse({email: url.searchParams.get("email")});
    const existing = await prisma.user.findUnique({
      where: {email: input.email.toLowerCase()},
      select: {
        id: true,
        emailVerifiedAt: true,
        oauthAccounts: {select: {provider: true}}
      }
    });

    return NextResponse.json({
      email: input.email.toLowerCase(),
      exists: Boolean(existing),
      verified: Boolean(existing?.emailVerifiedAt),
      providers: existing?.oauthAccounts.map((item) => item.provider) ?? []
    });
  } catch (error) {
    logApiError(error, request);
    return NextResponse.json({error: error instanceof Error ? error.message : "无法检查邮箱。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
