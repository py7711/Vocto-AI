import type {Metadata} from "next";
import {Languages, Sparkles} from "lucide-react";
import {SiteFooter, SiteHeader, PageHero} from "@/components/site-shell";
import {supportedLanguagePages} from "@/lib/language-pages";

export const metadata: Metadata = {
  title: "Supported Languages | UniScribe"
};

export default function LanguagesIndexPage({params}: {params: {locale: string}}) {
  return (
    <main className="min-h-screen bg-paper">
      <SiteHeader />
      <PageHero
        eyebrow="Supported Languages"
        title="Transcribe Audio and Video in 87 Languages"
        description="Choose a language guide for accurate transcripts, subtitles, summaries, translations, and exports from the same UniScribe workspace."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {supportedLanguagePages.map((item) => (
            <a key={item.slug} href={`/${params.locale}/languages/${item.slug}`} className="group rounded-xl border border-ink/10 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-violet/25 hover:shadow-card">
              <Languages size={24} className="text-violet" />
              <h2 className="mt-4 text-xl font-black text-ink group-hover:text-violet">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/62">{item.description}</p>
            </a>
          ))}
        </div>
      </section>
      <section className="border-y border-ink/10 bg-white px-4 py-12 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="flex items-center gap-2 text-3xl font-black tracking-tight text-ink">
            <Sparkles size={25} className="text-violet" />
            More Than Transcription
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/65">
            After UniScribe creates the transcript, you can generate summaries, mind maps, key questions, translations, subtitle files, documents, and public share links.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
