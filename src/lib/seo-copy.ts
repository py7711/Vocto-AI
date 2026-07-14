import {isLocale, messagesLocale} from "@/lib/locales";

export async function getTrustSeoCopy(locale: string) {
  const safeLocale = isLocale(locale) ? locale : "en";
  const messages = (await import(`../../messages/${messagesLocale(safeLocale)}.json`)).default;
  return messages.trustSeo;
}
