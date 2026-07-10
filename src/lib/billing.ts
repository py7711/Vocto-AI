import "server-only";

import {createHmac, timingSafeEqual} from "crypto";
import {env} from "@/lib/env";

export type BillingPlan = "BASIC" | "STANDARD" | "PRO";
export type OneTimePack = "LITE" | "PLUS";
export type AddonPack = "ADDON_BASIC" | "ADDON_STANDARD" | "ADDON_PRO";
export type BillingInterval = "monthly" | "annual";
export type BillingDiscountCampaign = "BASIC_ANNUAL_BFY60";

const stripeApiBase = "https://api.stripe.com/v1";
const basicAnnualPromotionCode = env.STRIPE_BASIC_ANNUAL_PROMOTION_CODE?.trim() || "BFY60";
const promotionCodeLookupCache = new Map<string, Promise<string | null>>();

export const billingPlans: Record<BillingPlan, {prices: Record<BillingInterval, string | undefined>; appPlan: BillingPlan; label: string; minutes: number; maxSingleFileMinutes: number; monthlyAmountUsd: number; annualAmountUsd: number}> = {
  BASIC: {
    prices: {monthly: env.STRIPE_PRICE_BASIC_MONTHLY ?? env.STRIPE_PRICE_BASIC, annual: env.STRIPE_PRICE_BASIC_ANNUAL},
    appPlan: "BASIC",
    label: "Basic",
    minutes: 1200,
    maxSingleFileMinutes: 600,
    monthlyAmountUsd: 10,
    annualAmountUsd: 72
  },
  STANDARD: {
    prices: {monthly: env.STRIPE_PRICE_STANDARD_MONTHLY ?? env.STRIPE_PRICE_STANDARD, annual: env.STRIPE_PRICE_STANDARD_ANNUAL},
    appPlan: "STANDARD",
    label: "Standard",
    minutes: 3000,
    maxSingleFileMinutes: 900,
    monthlyAmountUsd: 20,
    annualAmountUsd: 144
  },
  PRO: {
    prices: {monthly: env.STRIPE_PRICE_PRO_MONTHLY ?? env.STRIPE_PRICE_PRO, annual: env.STRIPE_PRICE_PRO_ANNUAL},
    appPlan: "PRO",
    label: "Pro",
    minutes: 6000,
    maxSingleFileMinutes: 1200,
    monthlyAmountUsd: 30,
    annualAmountUsd: 216
  }
};

export const oneTimePacks: Record<OneTimePack, {priceEnv?: string; planId: string; label: string; minutes: number; validityDays: number; amountUsd: number}> = {
  LITE: {priceEnv: env.STRIPE_PRICE_LITE, planId: "lite_20260124", label: "Lite", minutes: 300, validityDays: 90, amountUsd: 12.9},
  PLUS: {priceEnv: env.STRIPE_PRICE_PLUS, planId: "plus_20260124", label: "Plus", minutes: 600, validityDays: 90, amountUsd: 19.9}
};

export const addonPacks: Record<AddonPack, {priceEnv?: string; planId: string; label: string; minutes: number; amountUsd: number}> = {
  ADDON_BASIC: {priceEnv: env.STRIPE_PRICE_ADDON_BASIC, planId: "addon_basic", label: "Basic", minutes: 500, amountUsd: 10},
  ADDON_STANDARD: {priceEnv: env.STRIPE_PRICE_ADDON_STANDARD, planId: "addon_standard", label: "Standard", minutes: 1000, amountUsd: 15},
  ADDON_PRO: {priceEnv: env.STRIPE_PRICE_ADDON_PRO, planId: "addon_pro", label: "Pro", minutes: 3000, amountUsd: 20}
};

export function amountUsdToCents(amountUsd: number) {
  return Math.round(amountUsd * 100);
}

function requireStripePriceId(priceId: string | undefined, label: string) {
  if (!priceId) {
    throw new Error(`${label} 未配置。请填写 Stripe Price ID，格式为 price_...，不要填写 prod_... 产品 ID。`);
  }
  if (!priceId.startsWith("price_")) {
    throw new Error(`${label} 配置错误：当前值是 ${priceId}。请填写 Stripe Price ID，格式为 price_...，不要填写 prod_... 产品 ID。`);
  }
  return priceId;
}

export function getBillingPlanPrice(planKey: BillingPlan, interval: BillingInterval) {
  const plan = billingPlans[planKey];
  const priceId = requireStripePriceId(plan.prices[interval], `Stripe ${interval === "annual" ? "年付" : "月付"}价格 ID：${planKey}`);

  return {
    priceId,
    amountCents: amountUsdToCents(interval === "annual" ? plan.annualAmountUsd : plan.monthlyAmountUsd)
  };
}

// Stripe SDK 安装失败时使用 REST API，保持服务端依赖更轻，后续可无缝替换为官方 SDK。
function requireStripeSecret() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY 未配置。");
  }
  return env.STRIPE_SECRET_KEY;
}

async function stripeRequest<T>(path: string, body: URLSearchParams) {
  const response = await fetch(`${stripeApiBase}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireStripeSecret()}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message ?? `Stripe 请求失败：${response.status}`);
  }
  return data as T;
}

async function stripeGet<T>(path: string, query: URLSearchParams) {
  const url = new URL(`${stripeApiBase}${path}`);
  query.forEach((value, key) => url.searchParams.set(key, value));
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${requireStripeSecret()}`
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message ?? `Stripe 请求失败：${response.status}`);
  }
  return data as T;
}

async function findActivePromotionCodeId(code: string) {
  const normalizedCode = code.trim();
  if (!normalizedCode) return null;
  if (!promotionCodeLookupCache.has(normalizedCode)) {
    const lookup = (async () => {
      const query = new URLSearchParams();
      query.set("code", normalizedCode);
      query.set("active", "true");
      query.set("limit", "1");
      const result = await stripeGet<{data?: Array<{id: string}>}>("/promotion_codes", query);
      return result.data?.[0]?.id ?? null;
    })().catch((error) => {
      promotionCodeLookupCache.delete(normalizedCode);
      throw error;
    });
    promotionCodeLookupCache.set(normalizedCode, lookup);
  }
  return promotionCodeLookupCache.get(normalizedCode)!;
}

async function applyDiscountCampaign(body: URLSearchParams, campaign: BillingDiscountCampaign | undefined) {
  if (!campaign) return;
  if (campaign !== "BASIC_ANNUAL_BFY60") return;

  const configuredPromotionCodeId = env.STRIPE_BASIC_ANNUAL_PROMOTION_CODE_ID?.trim();
  if (configuredPromotionCodeId) {
    body.set("discounts[0][promotion_code]", configuredPromotionCodeId);
    return;
  }
  const couponId = env.STRIPE_BASIC_ANNUAL_COUPON_ID?.trim();
  if (couponId) {
    body.set("discounts[0][coupon]", couponId);
    return;
  }

  const promotionCodeId = await findActivePromotionCodeId(basicAnnualPromotionCode);
  if (promotionCodeId) {
    body.set("discounts[0][promotion_code]", promotionCodeId);
    return;
  }

  // 兼容把 BFY60 配成自定义 Coupon ID 的 Stripe 账号。
  body.set("discounts[0][coupon]", basicAnnualPromotionCode);
}

export async function createStripeCustomer(input: {email: string; name?: string | null; userId: string}) {
  const body = new URLSearchParams();
  body.set("email", input.email);
  if (input.name) body.set("name", input.name);
  body.set("metadata[userId]", input.userId);
  return stripeRequest<{id: string}>("/customers", body);
}

export async function createCheckoutSession(input: {
  customerId: string;
  userId: string;
  orderId: string;
  plan: BillingPlan;
  interval: BillingInterval;
  discountCampaign?: BillingDiscountCampaign;
  successUrl: string;
  cancelUrl: string;
} | {
  customerId: string;
  userId: string;
  orderId: string;
  pack: OneTimePack;
  successUrl: string;
  cancelUrl: string;
} | {
  customerId: string;
  userId: string;
  orderId: string;
  addon: AddonPack;
  successUrl: string;
  cancelUrl: string;
}) {
  if ("addon" in input) {
    const addon = addonPacks[input.addon];
    const priceId = requireStripePriceId(addon.priceEnv, `Stripe 加购分钟包价格 ID：${input.addon}`);

    const body = new URLSearchParams();
    body.set("mode", "payment");
    body.set("customer", input.customerId);
    body.set("client_reference_id", input.orderId);
    body.set("line_items[0][price]", priceId);
    body.set("line_items[0][quantity]", "1");
    body.set("success_url", input.successUrl);
    body.set("cancel_url", input.cancelUrl);
    body.set("metadata[orderId]", input.orderId);
    body.set("metadata[userId]", input.userId);
    body.set("metadata[addon]", input.addon);
    body.set("metadata[planId]", addon.planId);
    body.set("metadata[minutes]", String(addon.minutes));
    body.set("payment_intent_data[metadata][userId]", input.userId);
    body.set("payment_intent_data[metadata][orderId]", input.orderId);
    body.set("payment_intent_data[metadata][addon]", input.addon);
    body.set("payment_intent_data[metadata][planId]", addon.planId);
    return stripeRequest<{id: string; url: string; expires_at?: number; amount_subtotal?: number; amount_total?: number; currency?: string}>("/checkout/sessions", body);
  }

  if ("pack" in input) {
    const pack = oneTimePacks[input.pack];
    const priceId = requireStripePriceId(pack.priceEnv, `Stripe 一次性套餐价格 ID：${input.pack}`);

    const body = new URLSearchParams();
    body.set("mode", "payment");
    body.set("customer", input.customerId);
    body.set("client_reference_id", input.orderId);
    body.set("line_items[0][price]", priceId);
    body.set("line_items[0][quantity]", "1");
    body.set("success_url", input.successUrl);
    body.set("cancel_url", input.cancelUrl);
    body.set("metadata[orderId]", input.orderId);
    body.set("metadata[userId]", input.userId);
    body.set("metadata[pack]", input.pack);
    body.set("metadata[planId]", pack.planId);
    body.set("metadata[minutes]", String(pack.minutes));
    body.set("metadata[validityDays]", String(pack.validityDays));
    body.set("payment_intent_data[metadata][userId]", input.userId);
    body.set("payment_intent_data[metadata][orderId]", input.orderId);
    body.set("payment_intent_data[metadata][pack]", input.pack);
    body.set("payment_intent_data[metadata][planId]", pack.planId);
    return stripeRequest<{id: string; url: string; expires_at?: number; amount_subtotal?: number; amount_total?: number; currency?: string}>("/checkout/sessions", body);
  }

  const plan = billingPlans[input.plan];
  const price = getBillingPlanPrice(input.plan, input.interval);

  // 在 Stripe 支付会话和订阅对象上同时写入元数据，确保任一 Webhook 先到都能找到用户和套餐。
  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("customer", input.customerId);
  body.set("client_reference_id", input.orderId);
  body.set("line_items[0][price]", price.priceId);
  body.set("line_items[0][quantity]", "1");
  body.set("success_url", input.successUrl);
  body.set("cancel_url", input.cancelUrl);
  body.set("metadata[orderId]", input.orderId);
  body.set("metadata[userId]", input.userId);
  body.set("metadata[plan]", input.plan);
  body.set("metadata[interval]", input.interval);
  body.set("subscription_data[metadata][orderId]", input.orderId);
  body.set("subscription_data[metadata][userId]", input.userId);
  body.set("subscription_data[metadata][plan]", input.plan);
  body.set("subscription_data[metadata][interval]", input.interval);
  if (input.discountCampaign) {
    body.set("metadata[discountCampaign]", input.discountCampaign);
    body.set("subscription_data[metadata][discountCampaign]", input.discountCampaign);
    await applyDiscountCampaign(body, input.discountCampaign);
  }
  return stripeRequest<{id: string; url: string; expires_at?: number; amount_subtotal?: number; amount_total?: number; currency?: string}>("/checkout/sessions", body);
}

export async function createBillingPortalSession(input: {customerId: string; returnUrl: string}) {
  const body = new URLSearchParams();
  body.set("customer", input.customerId);
  body.set("return_url", input.returnUrl);
  return stripeRequest<{url: string}>("/billing_portal/sessions", body);
}

export async function retrieveCheckoutSession(sessionId: string) {
  return stripeGet<{
    id: string;
    mode?: string;
    status?: string;
    payment_status?: string;
    customer?: string;
    subscription?: string;
    payment_intent?: string;
    invoice?: string;
    client_reference_id?: string;
    metadata?: Record<string, string>;
    created?: number;
    currency?: string;
    amount_subtotal?: number;
    amount_total?: number;
  }>(`/checkout/sessions/${encodeURIComponent(sessionId)}`, new URLSearchParams());
}

export function verifyStripeWebhookSignature(payload: string, signatureHeader: string | null) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET 未配置。");
  }
  if (!signatureHeader) {
    throw new Error("Stripe 签名头缺失。");
  }

  const parsedEntries = signatureHeader.split(",").map((part) => {
    const [key, value] = part.split("=");
    return [key, value];
  });
  const timestamp = parsedEntries.find(([key]) => key === "t")?.[1];
  const signatures = parsedEntries.filter(([key]) => key === "v1").map(([, value]) => value).filter(Boolean);
  if (!timestamp || signatures.length === 0) {
    throw new Error("Stripe 签名格式不正确。");
  }

  // 限制 5 分钟时间窗口，避免旧 Webhook 请求被重复发送。
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds) || Math.abs(Date.now() - timestampSeconds * 1000) > 5 * 60 * 1000) {
    throw new Error("Stripe Webhook 签名已过期。");
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", env.STRIPE_WEBHOOK_SECRET).update(signedPayload).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  const matched = signatures.some((signature) => {
    const actualBuffer = Buffer.from(signature, "hex");
    return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
  });

  if (!matched) {
    throw new Error("Stripe Webhook 签名验证失败。");
  }
}
