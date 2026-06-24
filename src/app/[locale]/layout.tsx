import type {Metadata} from "next";
import type {ReactNode} from "react";
import {NextIntlClientProvider, useMessages} from "next-intl";
import {notFound} from "next/navigation";
import {locales} from "@/i18n";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export function generateMetadata({params}: {params: {locale: string}}): Metadata {
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
    title: titleByLocale[params.locale] ?? titleByLocale.en,
    description: "Vocto AI audio and video transcription workspace"
  };
}

export default function LocaleLayout({children, params}: {children: ReactNode; params: {locale: string}}) {
  if (!locales.includes(params.locale as (typeof locales)[number])) {
    notFound();
  }

  const messages = useMessages();

  return (
    <html lang={params.locale}>
      <body>
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
