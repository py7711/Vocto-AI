import "server-only";

import {createHmac, timingSafeEqual} from "crypto";
import {env} from "@/lib/env";

export type BillingPlan = "BASIC" | "STANDARD" | "PRO";

const stripeApiBase = "https://api.stripe.com/v1";

export const billingPlans: Record<BillingPlan, {priceEnv?: string; appPlan: BillingPlan; minutes: number; maxSingleFileMinutes: number}> = {
  BASIC: {priceEnv: env.STRIPE_PRICE_BASIC, appPlan: "BASIC", minutes: 1200, maxSingleFileMinutes: 600},
  STANDARD: {priceEnv: env.STRIPE_PRICE_STANDARD, appPlan: "STANDARD", minutes: 3000, maxSingleFileMinutes: 900},
  PRO: {priceEnv: env.STRIPE_PRICE_PRO, appPlan: "PRO", minutes: 6000, maxSingleFileMinutes: 1200}
};

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
  plan: BillingPlan;
  successUrl: string;
  cancelUrl: string;
}) {
  const plan = billingPlans[input.plan];
  if (!plan.priceEnv) {
    throw new Error(`Stripe 价格 ID 未配置：${input.plan}`);
  }

  // 在 Checkout Session 和 Subscription 上同时写入元数据，确保任一 Webhook 先到都能找到用户和套餐。
  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("customer", input.customerId);
  body.set("line_items[0][price]", plan.priceEnv);
  body.set("line_items[0][quantity]", "1");
  body.set("success_url", input.successUrl);
  body.set("cancel_url", input.cancelUrl);
  body.set("metadata[userId]", input.userId);
  body.set("metadata[plan]", input.plan);
  body.set("subscription_data[metadata][userId]", input.userId);
  body.set("subscription_data[metadata][plan]", input.plan);
  return stripeRequest<{id: string; url: string}>("/checkout/sessions", body);
}

export async function createBillingPortalSession(input: {customerId: string; returnUrl: string}) {
  const body = new URLSearchParams();
  body.set("customer", input.customerId);
  body.set("return_url", input.returnUrl);
  return stripeRequest<{url: string}>("/billing_portal/sessions", body);
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
