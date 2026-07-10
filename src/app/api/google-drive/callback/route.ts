import {NextResponse} from "next/server";
import {consumeSignedStateCookie, getCurrentUser} from "@/lib/auth";
import {exchangeDriveCode} from "@/lib/google-drive";
import {prisma} from "@/lib/prisma";
import {logApiError} from "@/lib/api-logger";
import {getRequestOrigin} from "@/lib/request-origin";

const stateCookie = "votxt_drive_state";

async function fetchDriveEmail(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {Authorization: `Bearer ${accessToken}`}
  });
  const data = await response.json().catch(() => ({}));
  return typeof data.email === "string" ? data.email.toLowerCase() : null;
}

export async function GET(request: Request) {
  const appUrl = getRequestOrigin(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error_description") || url.searchParams.get("error");
  const state = url.searchParams.get("state") || "";
  const [rawState, locale = "en"] = state.split(":");

  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("请先登录。");
    if (oauthError) throw new Error(oauthError);
    if (!code || !rawState || !consumeSignedStateCookie(stateCookie, rawState)) {
      throw new Error("Google Drive 授权状态已过期。");
    }

    const token = await exchangeDriveCode(code, `${appUrl}/auth/google-drive/callback`);
    const email = (await fetchDriveEmail(token.access_token!)) ?? user.email.toLowerCase();
    const existing = await prisma.googleDriveConnection.findUnique({where: {userId: user.id}});
    await prisma.googleDriveConnection.upsert({
      where: {userId: user.id},
      update: {
        email,
        accessToken: token.access_token!,
        refreshToken: token.refresh_token ?? existing?.refreshToken,
        expiresAt: new Date(Date.now() + Math.max(60, token.expires_in ?? 3600) * 1000),
        scope: token.scope
      },
      create: {
        userId: user.id,
        email,
        accessToken: token.access_token!,
        refreshToken: token.refresh_token,
        expiresAt: new Date(Date.now() + Math.max(60, token.expires_in ?? 3600) * 1000),
        scope: token.scope
      }
    });

    return NextResponse.redirect(`${appUrl}/${locale}/upload?mode=drive&drive=connected`);
  } catch (error) {
    logApiError(error, request);
    const message = encodeURIComponent(error instanceof Error ? error.message : "Google Drive 授权失败。");
    return NextResponse.redirect(`${appUrl}/${locale}/upload?mode=drive&error=${message}`);
  }
}
