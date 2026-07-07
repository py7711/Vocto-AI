import type {Metadata} from "next";
import {Workspace} from "@/components/workspace";
import {getWorkspaceCopy} from "@/components/workspace/copy";

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

  return {
    title: {
      absolute: `${title} | UniScribe`
    },
    description: copy.marketingIntro ?? copy.subheadline
  };
}

export default function FeaturesPage() {
  return <Workspace variant="marketing" />;
}
