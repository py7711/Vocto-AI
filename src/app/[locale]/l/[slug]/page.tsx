import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {ToolPage} from "@/components/tool-page";
import {getToolPageTitle} from "@/lib/tool-pages";
import {isCanonicalLandingSlug} from "@/lib/canonical-slugs";

export function generateMetadata({params}: {params: {locale: string; slug: string}}): Metadata {
  if (!isCanonicalLandingSlug(params.slug)) {
    return {};
  }
  return {
    title: getToolPageTitle(params.slug, params.locale)
  };
}

export default function LandingRoutePage({params}: {params: {slug: string}}) {
  if (!isCanonicalLandingSlug(params.slug)) notFound();
  return <ToolPage slug={params.slug} />;
}
