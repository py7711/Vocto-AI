import {getInfoPageCopy, InfoPage} from "@/components/info-pages";

export function generateMetadata({params}: {params: {locale: string}}) {
  const copy = getInfoPageCopy(params.locale, "affiliate");

  return {
    title: {
      absolute: `${copy.title} | Votxt`
    },
    description: copy.description
  };
}

export default function AffiliateRoute({params}: {params: {locale: string}}) {
  return <InfoPage type="affiliate" locale={params.locale} />;
}
