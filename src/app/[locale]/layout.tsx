import type {Metadata} from "next";
import type {ReactNode} from "react";
import {NextIntlClientProvider} from "next-intl";
import {notFound} from "next/navigation";
import {isLocale, locales} from "@/lib/locales";

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

type LocaleParams = {locale: string};

export function generateMetadata({params}: {params: LocaleParams}): Metadata {
  const {locale} = params;
  const titleByLocale: Record<string, string> = {
    zh: "免费在线语音转文本转换器",
    en: "Free Online Speech to Text Converter",
    es: "Convertidor gratuito de voz a texto en línea",
    fr: "Convertisseur gratuit voix en texte en ligne",
    de: "Kostenloser Online-Sprache-zu-Text-Konverter",
    ja: "無料オンライン音声テキスト変換",
    ko: "무료 온라인 음성 텍스트 변환기",
    pt: "Conversor gratuito de voz para texto online"
  };

  return {
    title: titleByLocale[locale] ?? titleByLocale.en,
    description: "Votxt AI audio and video transcription workspace",
    icons: {
      icon: "/favicon.svg"
    }
  };
}

async function loadMessages(locale: string) {
  return (await import(`../../../messages/${locale}.json`)).default;
}

export default async function LocaleLayout({children, params}: {children: ReactNode; params: LocaleParams}) {
  const {locale} = params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = await loadMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
