export const locales = ["en", "id", "ru", "es", "vi", "ar", "pt", "fr", "zh", "zh-TW", "de", "it", "th", "uk", "tr", "ja", "nl", "pl", "ko", "hu"] as const;

export const translatedLocales = locales;

export type Locale = (typeof locales)[number];

export const localeNativeNames: Record<Locale, string> = {
  ar: "العربية",
  de: "Deutsch",
  en: "English",
  es: "Español",
  fr: "Français",
  hu: "Magyar",
  id: "Bahasa Indonesia",
  it: "Italiano",
  ja: "日本語",
  ko: "한국어",
  nl: "Nederlands",
  pl: "Polski",
  pt: "Português",
  ru: "Русский",
  th: "ไทย",
  tr: "Türkçe",
  uk: "Українська",
  vi: "Tiếng Việt",
  zh: "简体中文",
  "zh-TW": "繁體中文"
};

export const localeEnglishNames: Record<Locale, string> = {
  ar: "Arabic",
  de: "German",
  en: "English",
  es: "Spanish",
  fr: "French",
  hu: "Hungarian",
  id: "Indonesian",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  nl: "Dutch",
  pl: "Polish",
  pt: "Portuguese",
  ru: "Russian",
  th: "Thai",
  tr: "Turkish",
  uk: "Ukrainian",
  vi: "Vietnamese",
  zh: "Simplified Chinese",
  "zh-TW": "Traditional Chinese"
};

export function isLocale(locale: string | undefined): locale is Locale {
  return Boolean(locale && locales.includes(locale as Locale));
}

export function messagesLocale(locale: string | undefined) {
  return isLocale(locale) && translatedLocales.includes(locale) ? locale : "en";
}
