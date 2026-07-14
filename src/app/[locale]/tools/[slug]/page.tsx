import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {ToolPage} from "@/components/tool-page";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import {getToolPageTitle, isCanonicalToolSlug} from "@/lib/tool-pages";
import {breadcrumbJsonLd, buildSeoMetadata, jsonLdString} from "@/lib/seo";

export function generateMetadata({params}: {params: {locale: string; slug: string}}): Metadata {
  if (!isCanonicalToolSlug(params.slug)) {
    return {};
  }
  const title = getToolPageTitle(params.slug, params.locale);
  const copy = getWorkspaceCopy(params.locale) as ReturnType<typeof getWorkspaceCopy> & Partial<{marketingIntro: string; subheadline: string}>;
  const description = copy.marketingIntro ?? copy.subheadline ?? "Process audio and video online, then create transcripts, subtitles, summaries, and exports.";
  return buildSeoMetadata({
    locale: params.locale,
    path: `/tools/${params.slug}`,
    title: title.includes("Votxt") ? title : `${title} | Votxt`,
    description: `${title}. ${description}`
  });
}

export default function ToolRoutePage({params}: {params: {locale: string; slug: string}}) {
  if (!isCanonicalToolSlug(params.slug)) notFound();
  const title = getToolPageTitle(params.slug, params.locale);
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLdString(breadcrumbJsonLd(params.locale, [
    {name: "Votxt", path: "/"},
    {name: title, path: `/tools/${params.slug}`}
  ]))}} /><ToolPage slug={params.slug} /></>;
}
