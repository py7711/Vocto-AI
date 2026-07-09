import createMiddleware from "next-intl/middleware";
import {NextResponse, type NextRequest} from "next/server";
import {isLocale, locales} from "@/lib/locales";
import {REQUEST_URL_LOG_HEADER} from "@/lib/logging-headers";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "en"
});

const localePathPattern = new RegExp(`^/(${locales.join("|")})(?:/|$)`);

function requestHeadersWithLogUrl(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_URL_LOG_HEADER, request.url);
  return requestHeaders;
}

export default function middleware(request: NextRequest) {
  const requestHeaders = requestHeadersWithLogUrl(request);

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  const localeMatch = request.nextUrl.pathname.match(localePathPattern);
  const locale = localeMatch?.[1];

  if (isLocale(locale)) {
    requestHeaders.set("X-NEXT-INTL-LOCALE", locale);

    return NextResponse.rewrite(request.nextUrl, {
      request: {
        headers: requestHeaders
      }
    });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
