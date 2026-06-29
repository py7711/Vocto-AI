import type {Metadata} from "next";
import type {ReactNode} from "react";
import {NextIntlClientProvider} from "next-intl";
import {notFound} from "next/navigation";
import {isLocale, locales, messagesLocale} from "@/lib/locales";

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

type LocaleParams = {locale: string};

export function generateMetadata({params}: {params: LocaleParams}): Metadata {
  const {locale} = params;
  const titleByLocale: Record<string, string> = {
    zh: "免费在线语音转文本转换器",
    en: "Convert audio and video to text online for free",
    es: "Convertidor gratuito de voz a texto en línea",
    fr: "Convertisseur gratuit voix en texte en ligne",
    de: "Kostenloser Online-Sprache-zu-Text-Konverter",
    ja: "無料オンライン音声テキスト変換",
    ko: "무료 온라인 음성 텍스트 변환기",
    pt: "Conversor gratuito de voz para texto online"
  };

  return {
    title: titleByLocale[locale] ?? titleByLocale.en,
    description: "UniScribe lets you upload audio and video files or paste YouTube Links, quickly turning them into text with AI. It also creates summaries, mind maps, and key questions, and lets you export the text in different formats.",
    icons: {
      icon: "/favicon.svg"
    }
  };
}

async function loadMessages(locale: string) {
  return (await import(`../../../messages/${messagesLocale(locale)}.json`)).default;
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
