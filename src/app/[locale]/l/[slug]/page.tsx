import type {Metadata} from "next";
import {notFound, permanentRedirect} from "next/navigation";
import {ToolPage} from "@/components/tool-page";
import {getToolPageTitle, isCanonicalToolSlug} from "@/lib/tool-pages";
import {isCanonicalLandingSlug} from "@/lib/canonical-slugs";

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
  return {
    title: getToolPageTitle(params.slug, params.locale)
  };
}

export default function LandingRoutePage({params, searchParams}: {params: LandingRouteParams; searchParams?: LandingRouteSearchParams}) {
  if (isCanonicalToolSlug(params.slug)) {
    permanentRedirect(canonicalToolHref(params, searchParams));
  }
  if (!isCanonicalLandingSlug(params.slug)) notFound();
  return <ToolPage slug={params.slug} />;
}
