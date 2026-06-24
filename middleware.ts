import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "zh", "es", "fr", "de", "ja", "ko", "pt"],
  defaultLocale: "en"
});

export const config = {
  matcher: ["/", "/(zh|en|es|fr|de|ja|ko|pt)/:path*"]
};
