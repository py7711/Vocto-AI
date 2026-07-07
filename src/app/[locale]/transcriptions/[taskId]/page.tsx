import type {Metadata} from "next";
import {TranscriptionPage} from "@/components/transcription-page";
import {getWorkspaceCopy} from "@/components/workspace/copy";

export function generateMetadata({params}: {params: {locale: string}}): Metadata {
  const copy = getWorkspaceCopy(params.locale);
  return {
    title: `${copy.transcriptTab} | UniScribe`
  };
}

export default function TranscriptionDetailPage({params}: {params: {locale: string; taskId: string}}) {
  return <TranscriptionPage taskId={params.taskId} />;
}
