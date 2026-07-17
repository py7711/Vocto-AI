"use client";

import {useMemo, useState} from "react";
import {Languages, Loader2} from "lucide-react";
import {CompactSelect} from "@/components/target-controls";

type SharedTranslation = {
  locale: string;
  title?: string | null;
  content: any;
  model?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type SharedTranslationPanelProps = {
  token: string;
  title: string;
  emptyText: string;
  languageLabel: string;
  loadingText: string;
  readError: string;
  translations: SharedTranslation[];
};

function readTranslationText(content: any) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (typeof content.text === "string") return content.text;
  if (typeof content.translation === "string") return content.translation;
  if (Array.isArray(content.segments)) {
    return content.segments.map((segment: any) => String(segment.text ?? "")).filter(Boolean).join("\n");
  }
  return "";
}

export function SharedTranslationPanel({token, title, emptyText, languageLabel, loadingText, readError, translations}: SharedTranslationPanelProps) {
  const [selectedLocale, setSelectedLocale] = useState(translations[0]?.locale ?? "");
  const [active, setActive] = useState<SharedTranslation | null>(translations[0] ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translationText = useMemo(() => readTranslationText(active?.content), [active]);

  async function chooseTranslation(locale: string) {
    setSelectedLocale(locale);
    const cached = translations.find((item) => item.locale === locale);
    if (cached) setActive(cached);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/share/${encodeURIComponent(token)}/translations/${encodeURIComponent(locale)}`, {cache: "no-store"});
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? readError);
      setActive(body as SharedTranslation);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-black uppercase text-ink/70">
          <Languages size={18} className="text-tide" />
          {title}
        </h2>
        {translations.length > 1 ? (
          <CompactSelect
            value={selectedLocale}
            onChange={chooseTranslation}
            options={translations.map((translation) => [translation.locale, translation.locale.toUpperCase()] as const)}
            ariaLabel={languageLabel}
            className="w-32"
          />
        ) : null}
      </div>
      {loading ? (
        <p className="mt-3 flex items-center gap-2 text-sm font-bold text-ink/55">
          <Loader2 className="animate-spin" size={15} />
          {loadingText}
        </p>
      ) : error ? (
        <p className="mt-3 text-sm font-bold leading-6 text-coral">{error}</p>
      ) : translationText ? (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/70">{translationText}</p>
      ) : (
        <p className="mt-3 text-sm leading-6 text-ink/60">{emptyText}</p>
      )}
    </section>
  );
}
