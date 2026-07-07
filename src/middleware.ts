import createMiddleware from "next-intl/middleware";
import {NextResponse, type NextRequest} from "next/server";
import {isLocale, locales} from "@/lib/locales";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "en"
});

const localePathPattern = new RegExp(`^/(${locales.join("|")})(?:/|$)`);

export default function middleware(request: NextRequest) {
  const localeMatch = request.nextUrl.pathname.match(localePathPattern);
  const locale = localeMatch?.[1];

  if (isLocale(locale)) {
    const requestHeaders = new Headers(request.headers);
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
  matcher: ["/((?!api|_next|.*\\..*).*)"]
};
