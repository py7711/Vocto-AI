import {NextResponse} from "next/server";
import {consumeOAuthStateCookie, setSessionCookie} from "@/lib/auth";
import {env} from "@/lib/env";
import {prisma} from "@/lib/prisma";
import {logApiError} from "@/lib/api-logger";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

type VerifiedGoogleUserInfo = GoogleUserInfo & {sub: string; email: string};

async function exchangeCodeForToken(code: string, redirectUri: string) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth 环境变量未配置。");
  }

  const body = new URLSearchParams();
  body.set("client_id", env.GOOGLE_CLIENT_ID);
  body.set("client_secret", env.GOOGLE_CLIENT_SECRET);
  body.set("code", code);
  body.set("grant_type", "authorization_code");
  body.set("redirect_uri", redirectUri);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body
  });
  const data = (await response.json().catch(() => ({}))) as GoogleTokenResponse;
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description ?? data.error ?? "Google 授权失败。");
  }
  return data.access_token;
}

async function fetchGoogleUser(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {Authorization: `Bearer ${accessToken}`}
  });
  const data = (await response.json().catch(() => ({}))) as GoogleUserInfo;
  if (!response.ok || !data.sub || !data.email) {
    throw new Error("无法读取 Google 用户信息。");
  }
  return data as VerifiedGoogleUserInfo;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const appUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") || "";
  const [rawState, locale = "en", encodedNext = ""] = state.split(":");
  const requestedNext = encodedNext ? decodeURIComponent(encodedNext) : "";
  const nextPath = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : `/${locale}/dashboard?oauth=google`;

  try {
    if (!code || !rawState || !consumeOAuthStateCookie(rawState)) {
      throw new Error("Google 登录状态已失效，请重新登录。");
    }

    const accessToken = await exchangeCodeForToken(code, `${appUrl}/api/auth/google/callback`);
    const profile = await fetchGoogleUser(accessToken);
    const email = profile.email.toLowerCase();

    const existingAccount = await prisma.oAuthAccount.findUnique({
      where: {provider_providerAccountId: {provider: "google", providerAccountId: profile.sub}},
      include: {user: true}
    });

    const user = existingAccount?.user ?? await prisma.user.upsert({
      where: {email},
      update: {
        name: profile.name,
        image: profile.picture,
        emailVerifiedAt: profile.email_verified ? new Date() : undefined,
        lastLoginAt: new Date()
      },
      create: {
        email,
        name: profile.name || email.split("@")[0],
        image: profile.picture,
        locale,
        emailVerifiedAt: profile.email_verified ? new Date() : null,
        lastLoginAt: new Date(),
        subscriptions: {
          create: {
            plan: "FREE",
            status: "ACTIVE",
            monthlyMinuteQuota: 120,
            remainingMinutes: 120,
            maxSingleFileMinutes: 30
          }
        }
      }
    });

    await prisma.oAuthAccount.upsert({
      where: {provider_providerAccountId: {provider: "google", providerAccountId: profile.sub}},
      update: {userId: user.id, email, avatarUrl: profile.picture},
      create: {userId: user.id, provider: "google", providerAccountId: profile.sub, email, avatarUrl: profile.picture}
    });

    const subscription = await prisma.subscription.findFirst({where: {userId: user.id}, select: {id: true}});
    if (!subscription) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: "FREE",
          status: "ACTIVE",
          monthlyMinuteQuota: 120,
          remainingMinutes: 120,
          maxSingleFileMinutes: 30
        }
      });
    }

    await prisma.user.update({where: {id: user.id}, data: {lastLoginAt: new Date()}});
    await setSessionCookie(user.id);
    return NextResponse.redirect(`${appUrl}${nextPath}`);
  } catch (error) {
    logApiError(error, request);
    const message = encodeURIComponent(error instanceof Error ? error.message : "Google 登录失败。");
    return NextResponse.redirect(`${appUrl}/${locale}/auth/signin?error=${message}`);
  }
}
