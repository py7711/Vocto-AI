import Link from "next/link";
import {Home, Search} from "lucide-react";
import {headers} from "next/headers";
import type {Metadata} from "next";
import {isLocale, messagesLocale} from "@/lib/locales";
import {buildPrivateMetadata} from "@/lib/seo";

async function getNotFoundContext() {
  const candidate = headers().get("X-NEXT-INTL-LOCALE") ?? undefined;
  const locale = isLocale(candidate) ? candidate : "en";
  const messages = (await import(`../../messages/${messagesLocale(locale)}.json`)).default;
  return {locale, copy: messages.notFound};
}

export async function generateMetadata(): Promise<Metadata> {
  const {copy} = await getNotFoundContext();
  return buildPrivateMetadata(copy.title);
}

export default async function NotFound() {
  const {locale, copy} = await getNotFoundContext();
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 py-16 text-ink">
      <section className="w-full max-w-xl text-center">
        <p className="text-sm font-bold uppercase text-violet">404</p>
        <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">{copy.title}</h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-ink/65">
          {copy.description}
        </p>
        <nav aria-label={copy.title} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={`/${locale}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-violet px-5 py-3 font-bold text-white hover:bg-violet/90">
            <Home size={18} aria-hidden="true" />
            {copy.home}
          </Link>
          <Link href={`/${locale}/tools/audio-to-text`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-5 py-3 font-bold text-ink hover:border-violet/35">
            <Search size={18} aria-hidden="true" />
            {copy.tools}
          </Link>
        </nav>
      </section>
    </main>
  );
}
