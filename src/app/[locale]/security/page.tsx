import {getInfoPageCopy, InfoPage} from "@/components/info-pages";

export function generateMetadata({params}: {params: {locale: string}}) {
  const copy = getInfoPageCopy(params.locale, "security");

  return {
    title: {
      absolute: `${copy.title} | Votxt`
    },
    description: copy.description
  };
}

export default function SecurityRoute({params}: {params: {locale: string}}) {
  return <InfoPage type="security" locale={params.locale} />;
}
