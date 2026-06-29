import createMiddleware from "next-intl/middleware";
import {locales} from "@/lib/locales";

export default createMiddleware({
  locales,
  defaultLocale: "en"
});

export const config = {
  matcher: ["/", "/(en|id|ru|es|vi|ar|pt|fr|zh|zh-TW|de|it|th|uk|tr|ja|nl|pl|ko|hu)/:path*"]
};
