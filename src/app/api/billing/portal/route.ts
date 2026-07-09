import {NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {createBillingPortalSession} from "@/lib/billing";
import {getRequestOrigin} from "@/lib/request-origin";
import {logApiError} from "@/lib/api-logger";

const portalSchema = z.object({
  returnPath: z.string().max(240).optional()
});

function normalizeReturnPath(path: string | undefined, fallback: string) {
  if (!path) return fallback;
  // 客户门户返回地址只能是站内路径，避免开放重定向。
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) return fallback;
  return path;
}

export async function POST(request: Request) {
  try {
    const input = portalSchema.parse(await request.json().catch(() => ({})));
    const user = await getCurrentUser();
    const stripeCustomerId = user?.subscriptions?.[0]?.stripeCustomerId;

    if (!user || !stripeCustomerId) {
      return NextResponse.json({error: "当前账号还没有可管理的 Stripe 客户记录。"}, {status: 400});
    }

    const appUrl = getRequestOrigin(request);
    // 客户门户由 Stripe 托管，用于用户自助管理订阅、支付方式和发票。
    const session = await createBillingPortalSession({
      customerId: stripeCustomerId,
      returnUrl: `${appUrl}${normalizeReturnPath(input.returnPath, "/zh/dashboard?portal=returned")}`
    });

    return NextResponse.json({url: session.url});
  } catch (error) {
    logApiError(error, request);
    const message = error instanceof Error ? error.message : "无法打开客户门户。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
