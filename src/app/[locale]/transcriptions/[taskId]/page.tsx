import type {Metadata} from "next";
import {TranscriptionPage} from "@/components/transcription-page";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import {buildPrivateMetadata} from "@/lib/seo";

export function generateMetadata({params}: {params: {locale: string; taskId: string}}): Metadata {
  const copy = getWorkspaceCopy(params.locale);
  return buildPrivateMetadata(copy.transcriptTab, params.locale, `/transcriptions/${params.taskId}`);
}

export default function TranscriptionDetailPage({params}: {params: {locale: string; taskId: string}}) {
  return <TranscriptionPage taskId={params.taskId} />;
}
