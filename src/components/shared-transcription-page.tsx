import {notFound} from "next/navigation";
import {TranscriptionPage} from "@/components/transcription-page";
import type {Task, TranscriptSegment} from "@/components/workspace/types";
import {getPublicShare} from "@/lib/share-links";

function publicSegments(value: unknown): TranscriptSegment[] {
  return Array.isArray(value) ? (value as TranscriptSegment[]) : [];
}

function publicTranslations(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export async function SharedTranscriptionPage({token}: {token: string}) {
  const share = await getPublicShare(token);
  if (!share) notFound();

  const mediaTask = share.mediaTask;
  const transcript = mediaTask.transcript;
  if (!transcript) notFound();
  const ratings = mediaTask.ratings ?? [];
  const ratingAverage = ratings.length
    ? ratings.reduce((total, item) => total + item.rating, 0) / ratings.length
    : null;
  const youtubeSourceUrl = mediaTask.sourceType === "YOUTUBE" ? mediaTask.sourceUrl : null;

  // Keep the public client payload intentionally smaller than the owner task API.
  const publicTask: Task = {
    id: mediaTask.id,
    status: mediaTask.status,
    statusMessage: mediaTask.statusMessage,
    progress: mediaTask.progress,
    provider: mediaTask.provider,
    language: mediaTask.language,
    detectedLanguage: mediaTask.detectedLanguage,
    originalName: mediaTask.originalName,
    sourceType: mediaTask.sourceType,
    sourceUrl: youtubeSourceUrl,
    durationSeconds: mediaTask.durationSeconds,
    speakerCount: mediaTask.speakerCount,
    createdAt: mediaTask.createdAt.toISOString(),
    transcript: {
      editedText: transcript.editedText,
      summary: transcript.summary,
      mindMap: transcript.mindMap,
      translations: publicTranslations(transcript.translations),
      summaryGenerationCount: transcript.summaryGenerationCount,
      segments: publicSegments(transcript.segments)
    },
    ratingSummary: {
      average: ratingAverage,
      count: ratings.length
    },
    viewer: {isMember: true}
  };

  return <TranscriptionPage key={token} taskId={mediaTask.id} initialTask={publicTask} shareToken={token} />;
}
