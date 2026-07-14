import type {Metadata} from "next";
import {BlogPage} from "@/components/content-pages";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import {buildSeoMetadata} from "@/lib/seo";
import {getToolPageTitle} from "@/lib/tool-pages";

export function generateMetadata({params}: {params: {locale: string}}): Metadata {
  const copy = getWorkspaceCopy(params.locale) as ReturnType<typeof getWorkspaceCopy> & Partial<{marketingIntro: string; subheadline: string}>;
  const description = copy.marketingIntro ?? copy.subheadline ?? "Guides for transcription, subtitles, audio, video, and AI productivity.";
  const keyword = getToolPageTitle("audio-to-text", params.locale).split("|")[0].trim();
  return buildSeoMetadata({
    locale: params.locale,
    path: "/blog",
    title: `${copy.blog} - ${keyword} | Votxt`,
    description: `${copy.blog}. ${description}`
  });
}

export default function BlogRoute() {
  return <BlogPage />;
}
