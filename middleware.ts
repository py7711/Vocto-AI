import createMiddleware from "next-intl/middleware";
import {locales} from "@/lib/locales";

export default createMiddleware({
  locales,
  defaultLocale: "en"
});

export const config = {
  matcher: ["/", "/(zh|en|es|fr|de|ja|ko|pt)/:path*"]
};
