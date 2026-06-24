import {AssemblyAI} from "assemblyai";
import {env} from "@/lib/env";
import type {TranscriptionProvider, TranscriptionRequest, TranscriptionResult} from "./types";

export class AssemblyAIProvider implements TranscriptionProvider {
  name = "assemblyai" as const;
  supportsSpeakerLabels = true;

  async transcribe(input: TranscriptionRequest): Promise<TranscriptionResult> {
    if (!env.ASSEMBLYAI_API_KEY) {
      throw new Error("ASSEMBLYAI_API_KEY is missing.");
    }

    const client = new AssemblyAI({apiKey: env.ASSEMBLYAI_API_KEY});
    const transcript = await client.transcripts.transcribe({
      audio: input.mediaUrl,
      speech_models: ["universal-3-pro", "universal-2"],
      speaker_labels: input.enableSpeakerLabels,
      language_detection: !input.language || input.language === "auto",
      language_code: input.language && input.language !== "auto" ? input.language : undefined
    });

    if (transcript.status === "error") {
      throw new Error(transcript.error ?? "AssemblyAI transcription failed.");
    }

    const utterances = transcript.utterances ?? [];
    const segments =
      utterances.length > 0
        ? utterances.map((utterance) => ({
            start: utterance.start / 1000,
            end: utterance.end / 1000,
            text: utterance.text,
            speaker: utterance.speaker ? `Speaker ${utterance.speaker}` : undefined
          }))
        : [
            {
              start: 0,
              end: (transcript.audio_duration ?? 0) / 1000,
              text: transcript.text ?? ""
            }
          ];

    return {
      provider: this.name,
      language: transcript.language_code ?? undefined,
      durationSeconds: transcript.audio_duration ? transcript.audio_duration / 1000 : undefined,
      text: transcript.text ?? segments.map((segment) => segment.text).join("\n"),
      segments,
      words: transcript.words?.map((word) => ({
        start: word.start / 1000,
        end: word.end / 1000,
        word: word.text,
        confidence: word.confidence,
        speaker: word.speaker ? `Speaker ${word.speaker}` : undefined
      })),
      speakerCount: new Set(segments.map((segment) => segment.speaker).filter(Boolean)).size || undefined
    };
  }
}
