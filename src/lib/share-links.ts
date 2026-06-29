import "server-only";

import {randomBytes} from "crypto";
import {hashToken} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

export function createShareToken() {
  return randomBytes(32).toString("base64url");
}

export function buildShareUrl(input: {appUrl: string; locale: string; token: string}) {
  return `${input.appUrl.replace(/\/$/, "")}/${input.locale}/share/${encodeURIComponent(input.token)}`;
}

export async function getPublicShare(token: string) {
  const tokenHash = hashToken(token);
  const shareLink = await prisma.shareLink.findUnique({
    where: {tokenHash},
    include: {
      mediaTask: {
        include: {
          transcript: true,
          insights: true,
          ratings: {
            select: {
              rating: true
            }
          }
        }
      }
    }
  });

  if (!shareLink || !shareLink.enabled || (shareLink.expiresAt && shareLink.expiresAt <= new Date())) {
    return null;
  }

  // 公开分享页只做只读展示，访问计数异步容忍失败，不影响页面打开。
  prisma.shareLink
    .update({
      where: {id: shareLink.id},
      data: {
        accessCount: {increment: 1},
        lastAccessAt: new Date()
      }
    })
    .catch(() => undefined);

  return shareLink;
}
