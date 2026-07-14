import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {ToolPage} from "@/components/tool-page";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import {getToolPageTitle} from "@/lib/tool-pages";
import {isCanonicalLanguageSlug} from "@/lib/canonical-slugs";
import {breadcrumbJsonLd, buildSeoMetadata, jsonLdString} from "@/lib/seo";

export function generateMetadata({params}: {params: {locale: string; slug: string}}): Metadata {
  if (!isCanonicalLanguageSlug(params.slug)) {
    return {};
  }
  const title = getToolPageTitle(params.slug, params.locale);
  const copy = getWorkspaceCopy(params.locale) as ReturnType<typeof getWorkspaceCopy> & Partial<{marketingIntro: string; subheadline: string}>;
  const description = copy.marketingIntro ?? copy.subheadline ?? "Create accurate transcripts, subtitles, summaries, translations, and downloadable files.";
  return buildSeoMetadata({
    locale: params.locale,
    path: `/languages/${params.slug}`,
    title: title.includes("Votxt") ? title : `${title} | Votxt`,
    description: `${title}. ${description}`
  });
}

export default function LanguageRoutePage({params}: {params: {locale: string; slug: string}}) {
  if (!isCanonicalLanguageSlug(params.slug)) notFound();
  const title = getToolPageTitle(params.slug, params.locale);
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLdString(breadcrumbJsonLd(params.locale, [
    {name: "Votxt", path: "/"},
    {name: title, path: `/languages/${params.slug}`}
  ]))}} /><ToolPage slug={params.slug} /></>;
}
