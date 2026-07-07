import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {ToolPage} from "@/components/tool-page";
import {getToolPageTitle, isCanonicalToolSlug} from "@/lib/tool-pages";

export function generateMetadata({params}: {params: {locale: string; slug: string}}): Metadata {
  if (!isCanonicalToolSlug(params.slug)) {
    return {};
  }
  return {
    title: getToolPageTitle(params.slug, params.locale)
  };
}

export default function ToolRoutePage({params}: {params: {slug: string}}) {
  if (!isCanonicalToolSlug(params.slug)) notFound();
  return <ToolPage slug={params.slug} />;
}
