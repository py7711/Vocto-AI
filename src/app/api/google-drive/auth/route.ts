import {NextResponse} from "next/server";
import {createRawToken, getCurrentUser, setSignedStateCookie} from "@/lib/auth";
import {env} from "@/lib/env";
import {googleDriveRedirectUri, googleDriveScopes} from "@/lib/google-drive";

const stateCookie = "uniscribe_drive_state";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});
  if (!env.GOOGLE_CLIENT_ID) return NextResponse.json({error: "GOOGLE_CLIENT_ID 未配置。"}, {status: 400});

  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") || user.locale || "en";
  const state = createRawToken();
  setSignedStateCookie(stateCookie, state);

  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  authorizationUrl.searchParams.set("redirect_uri", googleDriveRedirectUri());
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", googleDriveScopes());
  authorizationUrl.searchParams.set("state", `${state}:${locale}`);
  authorizationUrl.searchParams.set("access_type", "offline");
  authorizationUrl.searchParams.set("include_granted_scopes", "true");
  authorizationUrl.searchParams.set("prompt", "consent");

  return NextResponse.redirect(authorizationUrl);
}
