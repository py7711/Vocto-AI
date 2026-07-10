import {NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {
  addonPacks,
  amountUsdToCents,
  billingPlans,
  createCheckoutSession,
  createStripeCustomer,
  getBillingPlanPrice,
  oneTimePacks,
  type AddonPack,
  type BillingDiscountCampaign,
  type BillingInterval,
  type BillingPlan,
  type OneTimePack
} from "@/lib/billing";
import {prisma} from "@/lib/prisma";
import {getRequestOrigin} from "@/lib/request-origin";
import {logApiError} from "@/lib/api-logger";
import {billingActionCopy, normalizeBillingLocale} from "@/lib/billing-copy";

const checkoutSchema = z.object({
  plan: z.enum(["BASIC", "STANDARD", "PRO"]).optional(),
  pack: z.enum(["LITE", "PLUS"]).optional(),
  addon: z.enum(["ADDON_BASIC", "ADDON_STANDARD", "ADDON_PRO"]).optional(),
  mode: z.enum(["one-time", "monthly", "annual"]).optional(),
  campaign: z.enum(["BASIC_ANNUAL_BFY60"]).optional(),
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

function withCheckoutSessionPlaceholder(path: string) {
  const [pathname, hash = ""] = path.split("#", 2);
  const separator = pathname.includes("?") ? "&" : "?";
  const nextPath = pathname.includes("session_id=") ? pathname : `${pathname}${separator}session_id={CHECKOUT_SESSION_ID}`;
  return hash ? `${nextPath}#${hash}` : nextPath;
}

function normalizeLocale(value?: string | null) {
  return normalizeBillingLocale(value);
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

function normalizeBillingInterval(mode: "one-time" | "monthly" | "annual" | undefined): BillingInterval {
  return mode === "annual" ? "annual" : "monthly";
}

function toCheckoutExpiresAt(expiresAt?: number) {
  return expiresAt ? new Date(expiresAt * 1000) : null;
}

function isMissingStripeCustomerError(error: unknown) {
  return error instanceof Error && /No such customer/i.test(error.message);
}

export async function POST(request: Request) {
  let responseLocale = normalizeLocale(localeFromReferer(request.headers.get("referer")));
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({error: billingActionCopy[responseLocale].loginRequired}, {status: 401});
    }
    const currentUser = user;

    const input = checkoutSchema.parse(await request.json());
    responseLocale = normalizeLocale(input.locale ?? localeFromReferer(request.headers.get("referer")) ?? currentUser.locale);
    const subscription = currentUser.subscriptions?.[0];
    const hasActivePaidPlan = subscription?.plan && subscription.plan !== "FREE" && ["ACTIVE", "TRIALING"].includes(subscription.status);
    if (input.addon && !hasActivePaidPlan) {
      return NextResponse.json({error: billingActionCopy[responseLocale].addonUnavailable}, {status: 400});
    }
    const discountCampaign = input.campaign as BillingDiscountCampaign | undefined;
    if (discountCampaign && (input.plan !== "BASIC" || normalizeBillingInterval(input.mode) !== "annual")) {
      return NextResponse.json({error: billingActionCopy[responseLocale].checkoutError}, {status: 400});
    }

    let stripeCustomerId = subscription?.stripeCustomerId ?? null;
    let subscriptionId = subscription?.id ?? null;

    // 一个 Votxt 用户对应一个 Stripe Customer，后续升级、降级、开票都复用该客户记录。
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer({email: currentUser.email, name: currentUser.name, userId: currentUser.id});
      stripeCustomerId = customer.id;
      if (subscription) {
        await prisma.subscription.update({where: {id: subscription.id}, data: {stripeCustomerId}});
      } else {
        const createdSubscription = await prisma.subscription.create({
          data: {
            userId: currentUser.id,
            stripeCustomerId,
            plan: "FREE",
            status: "ACTIVE",
            monthlyMinuteQuota: 120,
            remainingMinutes: 120,
            maxSingleFileMinutes: 30
          }
        });
        subscriptionId = createdSubscription.id;
      }
    }
    let checkoutCustomerId = stripeCustomerId;

    const appUrl = getRequestOrigin(request);
    const successPath = withCheckoutSessionPlaceholder(normalizeReturnPath(input.successPath, `/${responseLocale}/dashboard?checkout=success`));
    const cancelPath = normalizeReturnPath(input.cancelPath, input.pack || input.addon ? `/${responseLocale}/dashboard?checkout=cancel` : `/${responseLocale}/pricing?checkout=cancel`);
    const orderDraft = (() => {
      if (input.addon) {
        const addon = addonPacks[input.addon as AddonPack];
        if (!addon.priceEnv) throw new Error(`Stripe 加购分钟包价格 ID 未配置：${input.addon}`);
        return {
          type: "ADDON_PACK" as const,
          interval: "ONE_TIME" as const,
          itemCode: input.addon,
          itemName: `${addon.label} add-on pack`,
          minutes: addon.minutes,
          amountCents: amountUsdToCents(addon.amountUsd),
          priceId: addon.priceEnv,
          metadata: {planId: addon.planId, addon: input.addon}
        };
      }

      if (input.pack) {
        const pack = oneTimePacks[input.pack as OneTimePack];
        if (!pack.priceEnv) throw new Error(`Stripe 一次性套餐价格 ID 未配置：${input.pack}`);
        return {
          type: "ONE_TIME_PACK" as const,
          interval: "ONE_TIME" as const,
          itemCode: input.pack,
          itemName: `${pack.label} one-time pack`,
          minutes: pack.minutes,
          amountCents: amountUsdToCents(pack.amountUsd),
          priceId: pack.priceEnv,
          metadata: {planId: pack.planId, pack: input.pack, validityDays: pack.validityDays}
        };
      }

      const planKey = input.plan as BillingPlan;
      const interval = normalizeBillingInterval(input.mode);
      const plan = billingPlans[planKey];
      const price = getBillingPlanPrice(planKey, interval);
      return {
        type: "SUBSCRIPTION" as const,
        interval: interval === "annual" ? "ANNUAL" as const : "MONTHLY" as const,
        itemCode: planKey,
        itemName: `${plan.label} ${interval === "annual" ? "annual" : "monthly"} subscription`,
        minutes: plan.minutes,
        amountCents: price.amountCents,
        priceId: price.priceId,
        metadata: discountCampaign ? {plan: planKey, interval, discountCampaign} : {plan: planKey, interval}
      };
    })();

    const order = await prisma.billingOrder.create({
      data: {
        userId: currentUser.id,
        subscriptionId,
        type: orderDraft.type,
        status: "PENDING",
        interval: orderDraft.interval,
        itemCode: orderDraft.itemCode,
        itemName: orderDraft.itemName,
        minutes: orderDraft.minutes,
        currency: "usd",
        amountSubtotal: orderDraft.amountCents,
        amountTotal: orderDraft.amountCents,
        stripePriceId: orderDraft.priceId,
        stripeCustomerId,
        metadata: {
          ...orderDraft.metadata,
          locale: responseLocale,
          successPath,
          cancelPath
        }
      }
    });

    async function createSessionForCurrentCustomer() {
      // 支付会话只返回 URL，浏览器端负责跳转到 Stripe 托管支付页。
      return input.addon ? createCheckoutSession({
        customerId: checkoutCustomerId,
        userId: currentUser.id,
        orderId: order.id,
        addon: input.addon as AddonPack,
        successUrl: `${appUrl}${successPath}`,
        cancelUrl: `${appUrl}${cancelPath}`
      }) : input.pack ? createCheckoutSession({
        customerId: checkoutCustomerId,
        userId: currentUser.id,
        orderId: order.id,
        pack: input.pack as OneTimePack,
        successUrl: `${appUrl}${successPath}`,
        cancelUrl: `${appUrl}${cancelPath}`
      }) : createCheckoutSession({
        customerId: checkoutCustomerId,
        userId: currentUser.id,
        orderId: order.id,
        plan: input.plan as BillingPlan,
        interval: normalizeBillingInterval(input.mode),
        discountCampaign,
        successUrl: `${appUrl}${successPath}`,
        cancelUrl: `${appUrl}${cancelPath}`
      });
    }

    let session;
    try {
      session = await createSessionForCurrentCustomer();
    } catch (error) {
      if (!isMissingStripeCustomerError(error)) throw error;

      const customer = await createStripeCustomer({email: currentUser.email, name: currentUser.name, userId: currentUser.id});
      stripeCustomerId = customer.id;
      checkoutCustomerId = customer.id;

      if (subscriptionId) {
        await prisma.subscription.update({where: {id: subscriptionId}, data: {stripeCustomerId}});
      } else {
        const createdSubscription = await prisma.subscription.create({
          data: {
            userId: currentUser.id,
            stripeCustomerId,
            plan: "FREE",
            status: "ACTIVE",
            monthlyMinuteQuota: 120,
            remainingMinutes: 120,
            maxSingleFileMinutes: 30
          }
        });
        subscriptionId = createdSubscription.id;
      }

      await prisma.billingOrder.update({
        where: {id: order.id},
        data: {
          subscriptionId,
          stripeCustomerId,
          metadata: {
            ...orderDraft.metadata,
            locale: responseLocale,
            successPath,
            cancelPath,
            replacedMissingStripeCustomer: true
          }
        }
      });

      session = await createSessionForCurrentCustomer();
    }

    await prisma.billingOrder.update({
      where: {id: order.id},
      data: {
        status: "CHECKOUT_OPEN",
        stripeCheckoutSessionId: session.id,
        checkoutUrl: session.url,
        checkoutExpiresAt: toCheckoutExpiresAt(session.expires_at),
        currency: session.currency ?? "usd",
        amountSubtotal: session.amount_subtotal ?? order.amountSubtotal,
        amountTotal: session.amount_total ?? order.amountTotal
      }
    });

    return NextResponse.json({url: session.url, orderId: order.id});
  } catch (error) {
    logApiError(error, request);
    return NextResponse.json({error: billingActionCopy[responseLocale].checkoutError}, {status: 502});
  }
}
