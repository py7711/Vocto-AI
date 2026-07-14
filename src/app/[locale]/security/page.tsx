import {getInfoPageCopy, InfoPage} from "@/components/info-pages";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import {buildSeoMetadata} from "@/lib/seo";
import {getTrustSeoCopy} from "@/lib/seo-copy";
import {getToolPageTitle} from "@/lib/tool-pages";

export async function generateMetadata({params}: {params: {locale: string}}) {
  const seo = await getTrustSeoCopy(params.locale);
  const copy = getWorkspaceCopy(params.locale) as ReturnType<typeof getWorkspaceCopy> & Partial<{marketingIntro: string; subheadline: string}>;
  const keyword = getToolPageTitle("audio-to-text", params.locale).split("|")[0].trim();

  return buildSeoMetadata({locale: params.locale, path: "/security", title: `${seo.security} - ${keyword} | Votxt`, description: `${seo.security}. ${copy.marketingIntro ?? copy.subheadline}`});
}

export default function SecurityRoute({params}: {params: {locale: string}}) {
  return <InfoPage type="security" locale={params.locale} />;
}
