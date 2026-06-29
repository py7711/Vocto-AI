import "server-only";

import {env} from "@/lib/env";
import {prisma} from "@/lib/prisma";

const driveScopes = [
  // 只申请只读 Drive 权限；导入时会把媒体复制到自己的对象存储，不修改用户云盘文件。
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/userinfo.email"
];

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};

type DriveConnection = NonNullable<Awaited<ReturnType<typeof prisma.googleDriveConnection.findUnique>>>;

export function googleDriveScopes() {
  return driveScopes.join(" ");
}

export function googleDriveRedirectUri() {
  return `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/api/google-drive/callback`;
}

export async function exchangeDriveCode(code: string) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth 未配置。");
  }

  const body = new URLSearchParams();
  body.set("client_id", env.GOOGLE_CLIENT_ID);
  body.set("client_secret", env.GOOGLE_CLIENT_SECRET);
  body.set("code", code);
  body.set("grant_type", "authorization_code");
  body.set("redirect_uri", googleDriveRedirectUri());

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body
  });
  const data = (await response.json().catch(() => ({}))) as GoogleTokenResponse;
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description ?? data.error ?? "Google Drive 授权失败。");
  }
  return data;
}

async function refreshDriveConnection(connection: DriveConnection) {
  if (!connection.refreshToken || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google Drive 连接已过期，请重新连接 Google Drive。");
  }

  const body = new URLSearchParams();
  body.set("client_id", env.GOOGLE_CLIENT_ID);
  body.set("client_secret", env.GOOGLE_CLIENT_SECRET);
  body.set("grant_type", "refresh_token");
  body.set("refresh_token", connection.refreshToken);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body
  });
  const data = (await response.json().catch(() => ({}))) as GoogleTokenResponse;
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description ?? data.error ?? "无法刷新 Google Drive 访问凭据。");
  }

  // Google 有时只在首次授权返回 refresh_token，刷新时通常只返回新的 access_token。
    // 因此这里保留原刷新令牌，只更新短期访问令牌、过期时间和可能变化的授权范围。
  return prisma.googleDriveConnection.update({
    where: {id: connection.id},
    data: {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + Math.max(60, data.expires_in ?? 3600) * 1000),
      scope: data.scope ?? connection.scope
    }
  });
}

export async function getFreshDriveConnection(userId: string) {
  const connection = await prisma.googleDriveConnection.findUnique({where: {userId}});
  if (!connection) return null;
  // 提前 60 秒刷新，避免拿到连接后还没完成 Drive 下载，token 就在请求过程中失效。
  if (connection.expiresAt.getTime() - Date.now() > 60_000) return connection;
  return refreshDriveConnection(connection);
}

export async function fetchDriveJson<T>(connection: DriveConnection, url: string) {
  const response = await fetch(url, {
    headers: {Authorization: `Bearer ${connection.accessToken}`}
  });
  const data = (await response.json().catch(() => ({}))) as T & {error?: {message?: string}};
  if (!response.ok) {
    throw new Error(data.error?.message ?? "Google Drive 请求失败。");
  }
  return data;
}

export function driveDownloadUrl(fileId: string, accessToken: string) {
  // Drive 媒体下载接口不返回永久公开 URL。这里生成一次性带 access_token 的读取地址，
  // 只在服务端导入过程中使用，随后媒体会写入 UniScribe 自己的对象存储。
  const url = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`);
  url.searchParams.set("alt", "media");
  url.searchParams.set("access_token", accessToken);
  return url.toString();
}
