import type {Metadata} from "next";
import type {ReactNode} from "react";
import {NextIntlClientProvider} from "next-intl";
import {notFound} from "next/navigation";
import {SystemUpdateNoticeDialog} from "@/components/system-update-notice";
import {isLocale, locales, messagesLocale} from "@/lib/locales";
import {buildSeoMetadata} from "@/lib/seo";

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

type LocaleParams = {locale: string};

async function loadMessages(locale: string) {
  return (await import(`../../../messages/${messagesLocale(locale)}.json`)).default;
}

export async function generateMetadata({params}: {params: LocaleParams}): Promise<Metadata> {
  const {locale} = params;
  const messages = await loadMessages(locale);

  const title = messages.meta?.title ?? "Convert audio and video to text online for free";
  const description = messages.meta?.description ?? "Votxt turns audio, video, and YouTube links into editable transcripts, subtitles, summaries, translations, and export-ready documents.";
  return buildSeoMetadata({locale, title: `${title} | Votxt`, description});
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
      <SystemUpdateNoticeDialog />
    </NextIntlClientProvider>
  );
}
