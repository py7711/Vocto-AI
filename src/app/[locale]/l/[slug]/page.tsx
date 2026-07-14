import type {Metadata} from "next";
import {notFound, permanentRedirect} from "next/navigation";
import {ToolPage} from "@/components/tool-page";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import {getToolPageTitle, isCanonicalToolSlug} from "@/lib/tool-pages";
import {isCanonicalLandingSlug} from "@/lib/canonical-slugs";
import {breadcrumbJsonLd, buildSeoMetadata, jsonLdString} from "@/lib/seo";

type LandingRouteParams = {
  locale: string;
  slug: string;
};

type LandingRouteSearchParams = Record<string, string | string[] | undefined>;

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function canonicalToolHref(params: LandingRouteParams, searchParams?: LandingRouteSearchParams) {
  const query = new URLSearchParams();
  const url = firstSearchParam(searchParams?.url);
  if (url) query.set("url", url);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return `/${params.locale}/tools/${params.slug}${suffix}`;
}

export function generateMetadata({params}: {params: LandingRouteParams}): Metadata {
  if (!isCanonicalLandingSlug(params.slug)) {
    return {};
  }
  const title = getToolPageTitle(params.slug, params.locale);
  const copy = getWorkspaceCopy(params.locale) as ReturnType<typeof getWorkspaceCopy> & Partial<{marketingIntro: string; subheadline: string}>;
  const description = copy.marketingIntro ?? copy.subheadline ?? "Convert audio and video into editable transcripts, subtitles, summaries, translations, and exports.";
  return buildSeoMetadata({
    locale: params.locale,
    path: `/l/${params.slug}`,
    title: title.includes("Votxt") ? title : `${title} | Votxt`,
    description: `${title}. ${description}`
  });
}

export default function LandingRoutePage({params, searchParams}: {params: LandingRouteParams; searchParams?: LandingRouteSearchParams}) {
  if (isCanonicalToolSlug(params.slug)) {
    permanentRedirect(canonicalToolHref(params, searchParams));
  }
  if (!isCanonicalLandingSlug(params.slug)) notFound();
  const title = getToolPageTitle(params.slug, params.locale);
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLdString(breadcrumbJsonLd(params.locale, [
    {name: "Votxt", path: "/"},
    {name: title, path: `/l/${params.slug}`}
  ]))}} /><ToolPage slug={params.slug} /></>;
}
