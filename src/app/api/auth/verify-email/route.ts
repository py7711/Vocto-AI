import {NextResponse} from "next/server";
import {z} from "zod";
import {setSessionCookie, verifyEmailToken} from "@/lib/auth";
import {authMessage} from "@/lib/api-copy";

const verifySchema = z.object({
  token: z.string().min(16),
  locale: z.string().default("en")
});

export async function POST(request: Request) {
  let locale = request.headers.get("accept-language");
  try {
    const payload = await request.json().catch(() => ({}));
    locale = typeof payload?.locale === "string" ? payload.locale : locale;
    const input = verifySchema.parse(payload);
    const userId = await verifyEmailToken(input.token);
    if (!userId) {
      return NextResponse.json({error: authMessage("verifyInvalid", input.locale)}, {status: 400});
    }

    await setSessionCookie(userId);
    return NextResponse.json({ok: true});
  } catch (error) {
    const status = error instanceof z.ZodError ? 422 : 400;
    return NextResponse.json({error: authMessage("verifyFailed", locale)}, {status});
  }
}
