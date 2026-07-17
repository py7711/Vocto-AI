import type {Metadata} from "next";
import {SharedTranscriptionPage} from "@/components/shared-transcription-page";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import {buildPrivateMetadata} from "@/lib/seo";

export function generateMetadata({params}: {params: {locale: string; token: string}}): Metadata {
  return buildPrivateMetadata(getWorkspaceCopy(params.locale).shareTitle, params.locale, `/share/${params.token}`);
}

export default function ShareRoute({params}: {params: {locale: string; token: string}}) {
  return <SharedTranscriptionPage token={params.token} />;
}
