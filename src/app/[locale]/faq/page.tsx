import type {Metadata} from "next";
import {FAQPage} from "@/components/content-pages";
import {getWorkspaceCopy} from "@/components/workspace/copy";

type MetadataWorkspaceCopy = ReturnType<typeof getWorkspaceCopy> &
  Partial<{
    faqTitle: string;
    marketingIntro: string;
    subheadline: string;
  }>;

export function generateMetadata({params}: {params: {locale: string}}): Metadata {
  const copy = getWorkspaceCopy(params.locale) as MetadataWorkspaceCopy;
  const title = copy.faqTitle ?? copy.dashboardPricing.faqTitle;

  return {
    title: {
      absolute: `${title} | Votxt`
    },
    description: copy.marketingIntro ?? copy.subheadline
  };
}

export default function FAQRoute() {
  return <FAQPage />;
}
