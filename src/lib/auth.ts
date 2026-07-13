import "server-only";

import {createHash, createHmac, timingSafeEqual, randomBytes, scrypt as scryptCallback} from "crypto";
import {promisify} from "util";
import {cookies, headers} from "next/headers";
import {env} from "@/lib/env";
import {prisma} from "@/lib/prisma";

const scrypt = promisify(scryptCallback);
const sessionCookieName = "votxt_session";
const oauthStateCookieName = "votxt_oauth_state";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;
// 前端不会直接提交明文密码，而是提交 sha256(votxt-password-v1:${password})。
// 后端再对这个 credential 做 scrypt 入库，避免数据库中出现可直接用于登录表单的明文等价值材料。
const passwordCredentialPattern = /^sha256:[a-f0-9]{64}$/;

function sign(value: string) {
  return createHmac("sha256", env.AUTH_SECRET).update(value).digest("base64url");
}

function encodeSession(userId: string) {
  const payload = Buffer.from(JSON.stringify({userId, issuedAt: Date.now()})).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function shouldUseSecureCookie() {
  const requestHeaders = headers();
  const host = requestHeaders.get("host")?.split(":")[0]?.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "::1") return false;

  const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  if (forwardedProto) return forwardedProto === "https";

  return env.NEXT_PUBLIC_APP_URL.startsWith("https://");
}

function decodeSession(token: string | undefined) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  // 签名比较必须使用 timingSafeEqual，避免根据比较耗时泄漏有效签名片段。
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {userId?: string; issuedAt?: number};
    if (!data.userId || !data.issuedAt) return null;
    if (Date.now() - data.issuedAt > sessionMaxAgeSeconds * 1000) return null;
    return data.userId;
  } catch {
    return null;
  }
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${hash.toString("base64url")}`;
}

async function verifyPassword(password: string, storedHash: string | null | undefined) {
  if (!storedHash) return false;
  const [algorithm, salt, hash] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) return false;

  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "base64url");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function isPasswordCredential(value: string) {
  return passwordCredentialPattern.test(value);
}

function createPasswordCredential(password: string) {
  return `sha256:${createHash("sha256").update(`votxt-password-v1:${password}`).digest("hex")}`;
}

export async function hashPasswordCredential(passwordCredential: string) {
  if (!isPasswordCredential(passwordCredential)) {
    throw new Error("密码凭据格式不正确。");
  }
  return hashPassword(passwordCredential);
}

export async function hashRawPassword(password: string) {
  // 设置密码和重置密码接收的是明文密码，必须先转换成和浏览器登录一致的 credential。
  // 如果直接 scrypt 明文密码，登录接口用 passwordCredential 校验时会永远匹配失败。
  return hashPasswordCredential(createPasswordCredential(password));
}

export async function verifyPasswordCredential(passwordCredential: string, storedHash: string | null | undefined) {
  if (!isPasswordCredential(passwordCredential)) return false;
  return verifyPassword(passwordCredential, storedHash);
}

export async function verifyPasswordCredentials(passwordCredentials: Array<string | null | undefined>, storedHash: string | null | undefined) {
  for (const passwordCredential of passwordCredentials) {
    if (passwordCredential && await verifyPasswordCredential(passwordCredential, storedHash)) {
      return true;
    }
  }
  return false;
}

export async function setSessionCookie(userId: string) {
  cookies().set(sessionCookieName, encodeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(),
    maxAge: sessionMaxAgeSeconds,
    path: "/"
  });
}

export function setOAuthStateCookie(state: string) {
  setSignedStateCookie(oauthStateCookieName, state);
}

export function setSignedStateCookie(name: string, state: string, maxAge = 10 * 60) {
  cookies().set(name, `${state}.${sign(state)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(),
    maxAge,
    path: "/"
  });
}

export function consumeOAuthStateCookie(expectedState: string) {
  return consumeSignedStateCookie(oauthStateCookieName, expectedState);
}

export function consumeSignedStateCookie(name: string, expectedState: string) {
  const value = cookies().get(name)?.value;
  cookies().set(name, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(),
    maxAge: 0,
    path: "/"
  });

  if (!value) return false;
  const [state, signature] = value.split(".");
  if (!state || !signature || state !== expectedState) return false;
  const expected = sign(state);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function clearSessionCookie() {
  cookies().set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(),
    maxAge: 0,
    path: "/"
  });
}

export function createRawToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createEmailVerificationToken(userId: string) {
  const rawToken = createRawToken();
  const tokenHash = hashToken(rawToken);
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });
  return rawToken;
}

export async function createPasswordResetToken(userId: string) {
  const rawToken = createRawToken();
  const tokenHash = hashToken(rawToken);
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    }
  });
  return rawToken;
}

export async function resetPasswordWithToken(rawToken: string, password: string) {
  const tokenHash = hashToken(rawToken);
  const token = await prisma.emailVerificationToken.findUnique({where: {tokenHash}});
  if (!token || token.usedAt || token.expiresAt < new Date()) return null;

  const passwordHash = await hashRawPassword(password);
  await prisma.$transaction([
    prisma.emailVerificationToken.update({where: {id: token.id}, data: {usedAt: new Date()}}),
    prisma.user.update({where: {id: token.userId}, data: {passwordHash}})
  ]);

  return token.userId;
}

export async function verifyEmailToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const token = await prisma.emailVerificationToken.findUnique({where: {tokenHash}});
  if (!token || token.usedAt || token.expiresAt < new Date()) return null;

  await prisma.$transaction([
    prisma.emailVerificationToken.update({where: {id: token.id}, data: {usedAt: new Date()}}),
    prisma.user.update({where: {id: token.userId}, data: {emailVerifiedAt: new Date()}})
  ]);

  return token.userId;
}

export async function getCurrentUser() {
  const userId = decodeSession(cookies().get(sessionCookieName)?.value);
  if (!userId) return null;

  return prisma.user.findUnique({
    where: {id: userId},
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      locale: true,
      passwordHash: true,
      emailVerifiedAt: true,
      lastLoginAt: true,
      dailyFreeCount: true,
      dailyResetAt: true,
      oauthAccounts: {
        select: {
          provider: true,
          email: true,
          avatarUrl: true
        }
      },
      subscriptions: {
        orderBy: {createdAt: "desc"},
        take: 1,
        select: {
          id: true,
          plan: true,
          status: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          monthlyMinuteQuota: true,
          remainingMinutes: true,
          maxSingleFileMinutes: true,
          currentPeriodStart: true,
          currentPeriodEnd: true
        }
      }
    }
  }).then((user) => user ? {...user, passwordSet: Boolean(user.passwordHash), passwordHash: undefined} : null);
}

export async function getCurrentUserIdentity() {
  const userId = decodeSession(cookies().get(sessionCookieName)?.value);
  if (!userId) return null;

  return prisma.user.findUnique({
    where: {id: userId},
    select: {
      id: true,
      email: true,
      locale: true
    }
  });
}
