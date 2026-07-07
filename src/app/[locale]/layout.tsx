import type {Metadata} from "next";
import type {ReactNode} from "react";
import {NextIntlClientProvider} from "next-intl";
import {notFound} from "next/navigation";
import {SystemUpdateNoticeDialog} from "@/components/system-update-notice";
import {isLocale, locales, messagesLocale} from "@/lib/locales";

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

  return {
    title: messages.meta?.title ?? "Convert audio and video to text online for free",
    description: messages.meta?.description ?? "UniScribe lets you upload audio and video files or paste YouTube Links, quickly turning them into text with AI. It also creates summaries, mind maps, and key questions, and lets you export the text in different formats.",
    icons: {
      icon: "/favicon.svg"
    }
  };
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
