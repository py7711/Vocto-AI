import {getRequestConfig} from "next-intl/server";
import {isLocale, messagesLocale} from "@/lib/locales";

export default getRequestConfig(async ({requestLocale}) => {
  const requestedLocale = await requestLocale;
  const locale = isLocale(requestedLocale) ? requestedLocale : "en";

  return {
    locale,
    messages: (await import(`../messages/${messagesLocale(locale)}.json`)).default
  };
});
