import {Workspace} from "@/components/workspace";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import type {CurrentUser} from "@/components/workspace/types";
import {getCurrentUser} from "@/lib/auth";
import {jsonSafe} from "@/lib/json";
import {faqJsonLd, jsonLdString, websiteJsonLd} from "@/lib/seo";

export default async function HomePage({params}: {params: {locale: string}}) {
  const user = await getCurrentUser();
  const copy = getWorkspaceCopy(params.locale) as ReturnType<typeof getWorkspaceCopy> & Partial<{
    homeFaqs: ReadonlyArray<readonly [string, string]>;
    marketingIntro: string;
    subheadline: string;
  }>;
  const description = copy.marketingIntro ?? copy.subheadline ?? "Votxt AI transcription workspace";
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLdString(websiteJsonLd(description))}} />
      {copy.homeFaqs ? <script type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLdString(faqJsonLd(copy.homeFaqs))}} /> : null}
      <Workspace variant="marketing" initialUser={jsonSafe(user) as CurrentUser | null} />
    </>
  );
}
