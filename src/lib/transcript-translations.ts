export function transcriptTranslations(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : {};
}

export function transcriptTranslationEntries(value: unknown) {
  return Object.entries(transcriptTranslations(value)).map(([locale, content]) => ({locale, content}));
}
