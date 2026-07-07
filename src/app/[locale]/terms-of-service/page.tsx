import {getLegalPageCopy, LegalPage} from "@/components/legal-pages";

export function generateMetadata({params}: {params: {locale: string}}) {
  const copy = getLegalPageCopy(params.locale, "terms");

  return {
    title: {
      absolute: `${copy.title} | UniScribe`
    },
    description: copy.description
  };
}

export default function TermsOfServiceRoute({params}: {params: {locale: string}}) {
  return <LegalPage type="terms" locale={params.locale} />;
}
