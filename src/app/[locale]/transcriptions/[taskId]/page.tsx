import {TranscriptionPage} from "@/components/transcription-page";

export default function TranscriptionDetailPage({params}: {params: {taskId: string}}) {
  return <TranscriptionPage taskId={params.taskId} />;
}
