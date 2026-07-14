import type {Metadata} from "next";
import {Workspace} from "@/components/workspace";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import type {CurrentUser} from "@/components/workspace/types";
import {getCurrentUser} from "@/lib/auth";
import {jsonSafe} from "@/lib/json";
import {buildSeoMetadata} from "@/lib/seo";
import {getToolPageTitle} from "@/lib/tool-pages";

type MetadataWorkspaceCopy = ReturnType<typeof getWorkspaceCopy> &
  Partial<{
    features: string;
    marketingIntro: string;
    subheadline: string;
    whyTitle: string;
    workspace: string;
    workflowTitle: string;
  }>;

export function generateMetadata({params}: {params: {locale: string}}): Metadata {
  const copy = getWorkspaceCopy(params.locale) as MetadataWorkspaceCopy;
  const title = copy.features ?? copy.whyTitle ?? copy.workflowTitle ?? copy.workspace;

  const description = copy.marketingIntro ?? copy.subheadline;
  const keyword = getToolPageTitle("audio-to-text", params.locale).split("|")[0].trim();
  return buildSeoMetadata({locale: params.locale, path: "/features", title: `${title} - ${keyword} | Votxt`, description: `${title}. ${description}`});
}

export default async function FeaturesPage() {
  const user = await getCurrentUser();
  return <Workspace variant="marketing" initialUser={jsonSafe(user) as CurrentUser | null} />;
}
