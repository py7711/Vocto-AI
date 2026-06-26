export const locales = ["en", "zh", "es", "fr", "de", "ja", "ko", "pt"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(locale: string | undefined): locale is Locale {
  return Boolean(locale && locales.includes(locale as Locale));
}
