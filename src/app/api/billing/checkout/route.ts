import {NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {createCheckoutSession, createStripeCustomer, type AddonPack, type BillingPlan, type OneTimePack} from "@/lib/billing";
import {prisma} from "@/lib/prisma";
import {getRequestOrigin} from "@/lib/request-origin";
import {logApiError} from "@/lib/api-logger";

const checkoutSchema = z.object({
  plan: z.enum(["BASIC", "STANDARD", "PRO"]).optional(),
  pack: z.enum(["LITE", "PLUS"]).optional(),
  addon: z.enum(["ADDON_BASIC", "ADDON_STANDARD", "ADDON_PRO"]).optional(),
  mode: z.enum(["one-time", "monthly", "annual"]).optional(),
  locale: z.string().min(2).max(16).optional(),
  successPath: z.string().max(240).optional(),
  cancelPath: z.string().max(240).optional()
}).refine((value) => [value.plan, value.pack, value.addon].filter(Boolean).length === 1, {
  message: "请选择一个订阅套餐或分钟包。"
});

function normalizeReturnPath(path: string | undefined, fallback: string) {
  if (!path) return fallback;
  // 只允许站内路径，避免恶意前端把支付完成后的用户重定向到外部站点。
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) return fallback;
  return path;
}

function normalizeLocale(value?: string | null) {
  const locale = value?.trim().toLowerCase();
  return locale && /^[a-z]{2}(?:-[a-z]{2})?$/.test(locale) ? locale : "en";
}

function localeFromReferer(referer?: string | null) {
  if (!referer) return null;
  try {
    const [, locale] = new URL(referer).pathname.split("/");
    return normalizeLocale(locale);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({error: "请先登录后再升级套餐。"}, {status: 401});
    }

    const input = checkoutSchema.parse(await request.json());
    const subscription = user.subscriptions?.[0];
    const hasPaidPlan = subscription?.plan && subscription.plan !== "FREE";
    if (input.addon && !hasPaidPlan) {
      return NextResponse.json({error: "加购分钟包仅适用于已订阅或 LTD 账户。"}, {status: 400});
    }

    let stripeCustomerId = subscription?.stripeCustomerId ?? null;

    // 一个 Votxt 用户对应一个 Stripe Customer，后续升级、降级、开票都复用该客户记录。
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer({email: user.email, name: user.name, userId: user.id});
      stripeCustomerId = customer.id;
      if (subscription) {
        await prisma.subscription.update({where: {id: subscription.id}, data: {stripeCustomerId}});
      } else {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            stripeCustomerId,
            plan: "FREE",
            status: "ACTIVE",
            monthlyMinuteQuota: 120,
            remainingMinutes: 120,
            maxSingleFileMinutes: 30
          }
        });
      }
    }

    const appUrl = getRequestOrigin(request);
    const locale = normalizeLocale(input.locale ?? localeFromReferer(request.headers.get("referer")) ?? user.locale);
    const successPath = normalizeReturnPath(input.successPath, `/${locale}/dashboard?checkout=success`);
    const cancelPath = normalizeReturnPath(input.cancelPath, input.pack || input.addon ? `/${locale}/dashboard?checkout=cancel` : `/${locale}/pricing?checkout=cancel`);
    // 支付会话只返回 URL，浏览器端负责跳转到 Stripe 托管支付页。
    const session = input.addon ? await createCheckoutSession({
      customerId: stripeCustomerId,
      userId: user.id,
      addon: input.addon as AddonPack,
      successUrl: `${appUrl}${successPath}`,
      cancelUrl: `${appUrl}${cancelPath}`
    }) : input.pack ? await createCheckoutSession({
      customerId: stripeCustomerId,
      userId: user.id,
      pack: input.pack as OneTimePack,
      successUrl: `${appUrl}${successPath}`,
      cancelUrl: `${appUrl}${cancelPath}`
    }) : await createCheckoutSession({
      customerId: stripeCustomerId,
      userId: user.id,
      plan: input.plan as BillingPlan,
      successUrl: `${appUrl}${successPath}`,
      cancelUrl: `${appUrl}${cancelPath}`
    });

    return NextResponse.json({url: session.url});
  } catch (error) {
    logApiError(error, request);
    const message = error instanceof Error ? error.message : "无法创建 Stripe 支付会话。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
