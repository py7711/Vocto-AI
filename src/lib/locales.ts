export const locales = ["en", "id", "ru", "es", "vi", "ar", "pt", "fr", "zh", "zh-TW", "de", "it", "th", "uk", "tr", "ja", "nl", "pl", "ko", "hu"] as const;

export const translatedLocales = ["en", "zh", "es", "fr", "de", "ja", "ko", "pt"] as const;

type Locale = (typeof locales)[number];

export function isLocale(locale: string | undefined): locale is Locale {
  return Boolean(locale && locales.includes(locale as Locale));
}

export function messagesLocale(locale: string | undefined) {
  return translatedLocales.includes(locale as (typeof translatedLocales)[number]) ? locale! : "en";
}
