import {getLegalPageCopy, LegalPage} from "@/components/legal-pages";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import {buildSeoMetadata} from "@/lib/seo";
import {getTrustSeoCopy} from "@/lib/seo-copy";
import {getToolPageTitle} from "@/lib/tool-pages";

export async function generateMetadata({params}: {params: {locale: string}}) {
  const seo = await getTrustSeoCopy(params.locale);
  const copy = getWorkspaceCopy(params.locale) as ReturnType<typeof getWorkspaceCopy> & Partial<{marketingIntro: string; subheadline: string}>;
  const keyword = getToolPageTitle("audio-to-text", params.locale).split("|")[0].trim();

  return buildSeoMetadata({locale: params.locale, path: "/terms-of-service", title: `${seo.terms} - ${keyword} | Votxt`, description: `${seo.terms}. ${copy.marketingIntro ?? copy.subheadline}`});
}

export default function TermsOfServiceRoute({params}: {params: {locale: string}}) {
  return <LegalPage type="terms" locale={params.locale} />;
}
