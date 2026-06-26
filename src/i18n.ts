import {getRequestConfig} from "next-intl/server";
import {notFound} from "next/navigation";
import {isLocale} from "@/lib/locales";

export default getRequestConfig(async ({requestLocale}) => {
  const requestedLocale = await requestLocale;
  const locale = isLocale(requestedLocale) ? requestedLocale : "en";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
