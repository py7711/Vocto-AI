import {createClient} from "@deepgram/sdk";
import {env} from "@/lib/env";
import type {TranscriptSegment, TranscriptionProvider, TranscriptionRequest, TranscriptionResult} from "./types";

export class DeepgramProvider implements TranscriptionProvider {
  name = "deepgram" as const;
  supportsSpeakerLabels = true;

  async transcribe(input: TranscriptionRequest): Promise<TranscriptionResult> {
    if (!env.DEEPGRAM_API_KEY) {
      throw new Error("DEEPGRAM_API_KEY is missing.");
    }

    const deepgram = createClient(env.DEEPGRAM_API_KEY);
    // Deepgram 支持 URL 直传、自动语言检测、智能标点和发言人分离。
    const {result, error} = await deepgram.listen.prerecorded.transcribeUrl(
      {url: input.mediaUrl},
      {
        model: "nova-2",
        smart_format: true,
        diarize: input.enableSpeakerLabels,
        detect_language: !input.language || input.language === "auto",
        language: input.language && input.language !== "auto" ? input.language : undefined,
        utterances: true
      }
    );

    if (error) {
      throw error;
    }

    const channel = result.results?.channels?.[0];
    const alternative = channel?.alternatives?.[0];
    const utterances = result.results?.utterances ?? [];
    const segments: TranscriptSegment[] =
      utterances.length > 0
        ? utterances.map((utterance) => ({
            start: utterance.start,
            end: utterance.end,
            text: utterance.transcript,
            speaker: utterance.speaker !== undefined ? `Speaker ${Number(utterance.speaker) + 1}` : undefined
          }))
        : [
            {
              start: 0,
              end: result.metadata?.duration ?? 0,
              text: alternative?.transcript ?? "",
              speaker: undefined
            }
          ];

    const speakers = new Set(segments.map((segment) => segment.speaker).filter(Boolean));

    return {
      provider: this.name,
      language: result.results?.channels?.[0]?.detected_language,
      durationSeconds: result.metadata?.duration,
      text: alternative?.transcript ?? segments.map((segment) => segment.text).join("\n"),
      segments,
      words: alternative?.words?.map((word) => ({
        start: word.start,
        end: word.end,
        word: word.word,
        confidence: word.confidence,
        speaker: word.speaker !== undefined ? `Speaker ${Number(word.speaker) + 1}` : undefined
      })),
      speakerCount: speakers.size || undefined
    };
  }
}
