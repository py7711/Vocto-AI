import {getLegalPageCopy, LegalPage} from "@/components/legal-pages";

export function generateMetadata({params}: {params: {locale: string}}) {
  const copy = getLegalPageCopy(params.locale, "privacy");

  return {
    title: {
      absolute: `${copy.title} | UniScribe`
    },
    description: copy.description
  };
}

export default function PrivacyPolicyRoute({params}: {params: {locale: string}}) {
  return <LegalPage type="privacy" locale={params.locale} />;
}
