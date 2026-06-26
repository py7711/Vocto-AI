import "server-only";

import {createHash, createHmac, timingSafeEqual, randomBytes, scrypt as scryptCallback} from "crypto";
import {promisify} from "util";
import {cookies} from "next/headers";
import {env} from "@/lib/env";
import {prisma} from "@/lib/prisma";

const scrypt = promisify(scryptCallback);
const sessionCookieName = "votxt_session";
const oauthStateCookieName = "votxt_oauth_state";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;

function sign(value: string) {
  return createHmac("sha256", env.AUTH_SECRET).update(value).digest("base64url");
}

function encodeSession(userId: string) {
  const payload = Buffer.from(JSON.stringify({userId, issuedAt: Date.now()})).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decodeSession(token: string | undefined) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
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

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedHash: string | null | undefined) {
  if (!storedHash) return false;
  const [algorithm, salt, hash] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) return false;

  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "base64url");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function setSessionCookie(userId: string) {
  cookies().set(sessionCookieName, encodeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NEXT_PUBLIC_APP_URL.startsWith("https://"),
    maxAge: sessionMaxAgeSeconds,
    path: "/"
  });
}

export function setOAuthStateCookie(state: string) {
  cookies().set(oauthStateCookieName, `${state}.${sign(state)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NEXT_PUBLIC_APP_URL.startsWith("https://"),
    maxAge: 10 * 60,
    path: "/"
  });
}

export function consumeOAuthStateCookie(expectedState: string) {
  const value = cookies().get(oauthStateCookieName)?.value;
  cookies().set(oauthStateCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NEXT_PUBLIC_APP_URL.startsWith("https://"),
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
    secure: env.NEXT_PUBLIC_APP_URL.startsWith("https://"),
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
      emailVerifiedAt: true,
      lastLoginAt: true,
      dailyFreeCount: true,
      dailyResetAt: true,
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
  });
}
