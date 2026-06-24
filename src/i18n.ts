import {getRequestConfig} from "next-intl/server";
import {notFound} from "next/navigation";

export const locales = ["en", "zh", "es", "fr", "de", "ja", "ko", "pt"] as const;

export default getRequestConfig(async ({locale}) => {
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
