import type {Metadata} from "next";
import {PricingPage} from "@/components/content-pages";
import {getWorkspaceCopy} from "@/components/workspace/copy";

type MetadataWorkspaceCopy = ReturnType<typeof getWorkspaceCopy> &
  Partial<{
    marketingIntro: string;
    plansTitle: string;
    pricing: string;
    subheadline: string;
  }>;

export function generateMetadata({params}: {params: {locale: string}}): Metadata {
  const copy = getWorkspaceCopy(params.locale) as MetadataWorkspaceCopy;
  const title = copy.plansTitle ?? copy.pricing;

  return {
    title: {
      absolute: `${title} | Votxt`
    },
    description: copy.marketingIntro ?? copy.subheadline
  };
}

export default function PricingRoute() {
  return <PricingPage />;
}
