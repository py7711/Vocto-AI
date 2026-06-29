import {NextResponse} from "next/server";
import {createRawToken, setOAuthStateCookie} from "@/lib/auth";
import {env} from "@/lib/env";

export async function GET(request: Request) {
  if (!env.GOOGLE_CLIENT_ID) {
    return NextResponse.json({error: "GOOGLE_CLIENT_ID 未配置。"}, {status: 400});
  }

  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") || "zh";
  const requestedNext = url.searchParams.get("next");
  const nextPath = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "";
  const state = createRawToken();
  setOAuthStateCookie(state);

  const appUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  authorizationUrl.searchParams.set("redirect_uri", `${appUrl}/api/auth/google/callback`);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid email profile");
  authorizationUrl.searchParams.set("state", `${state}:${locale}:${encodeURIComponent(nextPath)}`);
  authorizationUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(authorizationUrl);
}
