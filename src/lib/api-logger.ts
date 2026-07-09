import {headers} from "next/headers";
import {REQUEST_URL_LOG_HEADER} from "@/lib/logging-headers";
import {logError, type LogContext} from "@/lib/logger";

type RequestLike = {
  url?: string;
  method?: string;
};

type ApiLogContext = LogContext & {
  route?: string;
  method?: string;
};

export function logApiError(error: unknown, request?: Request | string | URL | ApiLogContext | null, context: ApiLogContext = {}) {
  const requestLike = isRequestLike(request) || typeof request === "string" || request instanceof URL ? request : undefined;
  const logContext = requestLike ? context : (request ?? context) as ApiLogContext;
  const requestUrl = logContext.requestUrl ?? requestUrlFrom(requestLike);
  logError(error, {
    ...logContext,
    requestUrl,
    meta: {
      runtime: "next-route",
      route: logContext.route,
      method: logContext.method ?? methodFrom(requestLike),
      ...logContext.meta
    }
  });
}

function requestUrlFrom(request?: Request | string | URL) {
  if (typeof request === "string" || request instanceof URL) return request;
  if (isRequestLike(request) && request.url) return request.url;
  return requestUrlFromHeaders() ?? undefined;
}

function methodFrom(request?: Request | string | URL) {
  return isRequestLike(request) ? request.method : undefined;
}

function requestUrlFromHeaders() {
  try {
    const requestHeaders = headers();
    const explicitUrl = requestHeaders.get(REQUEST_URL_LOG_HEADER);
    if (explicitUrl) return explicitUrl;

    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
    const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
    const path = requestHeaders.get("next-url") ?? requestHeaders.get("x-invoke-path") ?? requestHeaders.get("x-matched-path");
    if (host && path) return `${protocol}://${host}${path.startsWith("/") ? path : `/${path}`}`;
    if (host) return `${protocol}://${host}`;
  } catch {
    return undefined;
  }
  return undefined;
}

function isRequestLike(value: unknown): value is RequestLike {
  return typeof value === "object" && value !== null && "url" in value && typeof (value as RequestLike).url === "string";
}
