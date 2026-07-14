import {getInfoPageCopy, InfoPage} from "@/components/info-pages";
import {buildSeoMetadata} from "@/lib/seo";

export function generateMetadata({params}: {params: {locale: string}}) {
  const copy = getInfoPageCopy(params.locale, "affiliate");

  return buildSeoMetadata({locale: params.locale, path: "/affiliate", title: `${copy.title} | Votxt`, description: copy.description});
}

export default function AffiliateRoute({params}: {params: {locale: string}}) {
  return <InfoPage type="affiliate" locale={params.locale} />;
}
