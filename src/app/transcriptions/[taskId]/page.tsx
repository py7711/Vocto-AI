import {redirect} from "next/navigation";

export default function TranscriptionDetailPage({params}: {params: {taskId: string}}) {
  redirect(`/en/transcriptions/${params.taskId}`);
}
