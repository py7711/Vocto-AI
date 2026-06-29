import "server-only";

import {createHmac, randomBytes, timingSafeEqual} from "crypto";
import type {Subscription, User} from "@prisma/client";
import {env} from "@/lib/env";
import {prisma} from "@/lib/prisma";
import {freeDailyFileLimit} from "@/lib/usage";

type UserWithSubscriptions = Pick<User, "id" | "email" | "name" | "image" | "role" | "locale" | "emailVerifiedAt" | "dailyFreeCount" | "dailyResetAt" | "createdAt" | "updatedAt"> & {
  subscriptions: Subscription[];
};

const transitionMaxAgeMs = 30 * 60 * 1000;

function sign(value: string) {
  return createHmac("sha256", env.AUTH_SECRET).update(value).digest("base64url");
}

function encodeIdentityTransitionToken(input: {anonymousId: string; intentId: string; createdAt?: number}) {
  // 旧端匿名转正式账号流程不在数据库里建临时表，而是把 anonymousId 和 intentId
  // 放进带签名的短期 token。这样兼容端点可无状态校验来源，同时避免客户端篡改身份。
  const payload = Buffer.from(JSON.stringify({
    kind: "identity_transition",
    anonymousId: input.anonymousId,
    intentId: input.intentId,
    createdAt: input.createdAt ?? Date.now()
  })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeIdentityTransitionToken(token: string | null | undefined) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  // transitionToken 来自浏览器请求，必须用 timingSafeEqual 校验签名，避免泄漏可拼接的签名片段。
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      kind?: string;
      anonymousId?: string;
      intentId?: string;
      createdAt?: number;
    };
    if (data.kind !== "identity_transition" || !data.anonymousId || !data.intentId || !data.createdAt) return null;
    if (Date.now() - data.createdAt > transitionMaxAgeMs) return null;
    return data;
  } catch {
    return null;
  }
}

function dailyWindow(user: Pick<User, "dailyFreeCount" | "dailyResetAt">) {
  const now = new Date();
  // 老客户端仍读取 dailyFree.remaining/resetAt。这里按本地午夜重置窗口序列化，
  // 不直接修改数据库计数，真正扣减仍由 usage 模块负责。
  const resetAt = user.dailyResetAt && user.dailyResetAt > now ? user.dailyResetAt : (() => {
    const next = new Date();
    next.setHours(24, 0, 0, 0);
    return next;
  })();
  const used = user.dailyResetAt && user.dailyResetAt > now ? user.dailyFreeCount : 0;
  return {
    used,
    limit: freeDailyFileLimit,
    remaining: Math.max(0, freeDailyFileLimit - used),
    resetAt
  };
}

function planFeatures(plan: Subscription["plan"]) {
  // apiAccess/webhookNotifications 是旧团队版客户端保留字段。即使当前个人版隐藏入口，
  // 兼容 API 仍返回这些布尔值，避免旧前端因字段缺失崩溃。
  return {
    apiAccess: plan !== "FREE",
    batchExport: plan !== "FREE",
    googleDriveImport: true,
    speakerLabels: true,
    translations: true,
    premiumModel: ["PRO", "TEAM", "ENTERPRISE"].includes(plan),
    webhookNotifications: plan !== "FREE"
  };
}

export function serializeUser(user: UserWithSubscriptions) {
  const subscription = user.subscriptions[0] ?? null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    locale: user.locale,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    subscription: subscription ? serializeSubscription(subscription, user) : null,
    subscriptions: user.subscriptions.map((item) => serializeSubscription(item, user))
  };
}

export function serializeSubscription(subscription: Subscription, user: Pick<User, "dailyFreeCount" | "dailyResetAt">) {
  const consumedCredits = Math.max(0, subscription.monthlyMinuteQuota - subscription.remainingMinutes);
  return {
    id: subscription.id,
    plan: subscription.plan,
    status: subscription.status,
    totalCredits: subscription.monthlyMinuteQuota,
    consumedCredits,
    remainingCredits: subscription.remainingMinutes,
    monthlyMinuteQuota: subscription.monthlyMinuteQuota,
    remainingMinutes: subscription.remainingMinutes,
    maxSingleFileMinutes: subscription.maxSingleFileMinutes,
    maxUploadBytes: Number(subscription.maxUploadBytes),
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    dailyFree: dailyWindow(user),
    features: planFeatures(subscription.plan)
  };
}

export async function getAccountUser(userId: string) {
  return prisma.user.findUnique({
    where: {id: userId},
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      locale: true,
      emailVerifiedAt: true,
      dailyFreeCount: true,
      dailyResetAt: true,
      createdAt: true,
      updatedAt: true,
      subscriptions: {
        orderBy: {createdAt: "desc"}
      }
    }
  });
}

export async function ensureFreeSubscription(userId: string) {
  // 部分历史账号可能只有 User 记录没有 Subscription。兼容登录/合并接口调用这里，
  // 确保返回给客户端的 account payload 始终带一个可用的免费订阅。
  const existing = await prisma.subscription.findFirst({
    where: {userId},
    orderBy: {createdAt: "desc"}
  });
  if (existing) return existing;

  return prisma.subscription.create({
    data: {
      userId,
      plan: "FREE",
      status: "ACTIVE",
      monthlyMinuteQuota: 120,
      remainingMinutes: 120,
      maxSingleFileMinutes: 30
    }
  });
}

export function createTransitionIntent(anonymousId?: string | null) {
  // anonymousUserId/anonymousId 都是旧端本地生成的临时身份。没有传入时生成 anon_ 前缀，
  // 让后续 promote/merge 端点仍能完成握手，而不是创建真正的匿名用户记录。
  const intentId = randomBytes(16).toString("base64url");
  const resolvedAnonymousId = anonymousId?.trim() || `anon_${randomBytes(12).toString("base64url")}`;
  const transitionToken = encodeIdentityTransitionToken({
    anonymousId: resolvedAnonymousId,
    intentId
  });
  return {
    id: intentId,
    anonymousId: resolvedAnonymousId,
    transitionToken,
    expiresAt: new Date(Date.now() + transitionMaxAgeMs)
  };
}
