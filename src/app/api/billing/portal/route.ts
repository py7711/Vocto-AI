import {NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {createBillingPortalSession} from "@/lib/billing";
import {getRequestOrigin} from "@/lib/request-origin";
import {logApiError} from "@/lib/api-logger";
import {billingActionCopy, normalizeBillingLocale} from "@/lib/billing-copy";

const portalSchema = z.object({
  returnPath: z.string().max(240).optional()
});

function normalizeReturnPath(path: string | undefined, fallback: string) {
  if (!path) return fallback;
  // 客户门户返回地址只能是站内路径，避免开放重定向。
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) return fallback;
  return path;
}

function localeFromPath(path?: string | null) {
  if (!path) return null;
  try {
    const [, locale] = path.startsWith("/") ? path.split("/") : new URL(path).pathname.split("/");
    return normalizeBillingLocale(locale);
  } catch {
    return null;
  }
}

function localeFromReferer(referer?: string | null) {
  return localeFromPath(referer);
}

export async function POST(request: Request) {
  let responseLocale = localeFromReferer(request.headers.get("referer")) ?? "en";
  try {
    const input = portalSchema.parse(await request.json().catch(() => ({})));
    const user = await getCurrentUser();
    const stripeCustomerId = user?.subscriptions?.[0]?.stripeCustomerId;
    responseLocale = localeFromPath(input.returnPath) ?? localeFromReferer(request.headers.get("referer")) ?? normalizeBillingLocale(user?.locale) ?? "en";

    if (!user || !stripeCustomerId) {
      return NextResponse.json({error: billingActionCopy[responseLocale].noPortalCustomer}, {status: 400});
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
    return NextResponse.json({error: billingActionCopy[responseLocale].portalError}, {status: 502});
  }
}
