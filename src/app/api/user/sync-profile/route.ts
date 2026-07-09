import {NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {ensureFreeSubscription, getAccountUser, serializeUser} from "@/lib/account-compat";
import {prisma} from "@/lib/prisma";
import {logApiError} from "@/lib/api-logger";

const profileSchema = z.object({
  name: z.string().trim().max(120).optional(),
  fullName: z.string().trim().max(120).optional(),
  avatarUrl: z.string().url().optional(),
  image: z.string().url().optional(),
  locale: z.string().trim().max(16).optional()
});

export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) return NextResponse.json({error: "请先登录。"}, {status: 401});
    const input = profileSchema.parse(await request.json().catch(() => ({})));
    const data: {name?: string; image?: string; locale?: string} = {};
    const name = input.name ?? input.fullName;
    const image = input.image ?? input.avatarUrl;
    if (name) data.name = name;
    if (image) data.image = image;
    if (input.locale) data.locale = input.locale;
    if (Object.keys(data).length) {
      await prisma.user.update({where: {id: sessionUser.id}, data});
    }
    await ensureFreeSubscription(sessionUser.id);
    const user = await getAccountUser(sessionUser.id);
    return NextResponse.json({user: user ? serializeUser(user) : null, synced: true});
  } catch (error) {
    logApiError(error, request);
    return NextResponse.json({error: error instanceof Error ? error.message : "无法同步个人资料。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
