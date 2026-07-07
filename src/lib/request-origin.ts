import "server-only";

import {env} from "@/lib/env";

export function getRequestOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (forwardedHost) {
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const proto = forwardedProto || new URL(request.url).protocol.replace(":", "") || "https";
    return `${proto}://${forwardedHost}`.replace(/\/$/, "");
  }

  return env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
}
