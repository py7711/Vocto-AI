import type {Metadata} from "next";
import {FAQPage} from "@/components/content-pages";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import {buildSeoMetadata} from "@/lib/seo";
import {getToolPageTitle} from "@/lib/tool-pages";

type MetadataWorkspaceCopy = ReturnType<typeof getWorkspaceCopy> &
  Partial<{
    faqTitle: string;
    marketingIntro: string;
    subheadline: string;
  }>;

export function generateMetadata({params}: {params: {locale: string}}): Metadata {
  const copy = getWorkspaceCopy(params.locale) as MetadataWorkspaceCopy;
  const title = copy.faqTitle ?? copy.dashboardPricing.faqTitle;

  const description = copy.marketingIntro ?? copy.subheadline;
  const keyword = getToolPageTitle("audio-to-text", params.locale).split("|")[0].trim();
  return buildSeoMetadata({locale: params.locale, path: "/faq", title: `${title} - ${keyword} | Votxt`, description: `${title}. ${description}`});
}

export default function FAQRoute() {
  return <FAQPage />;
}
