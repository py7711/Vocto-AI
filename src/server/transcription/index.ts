import {AssemblyAIProvider} from "./assemblyai";
import {DeepgramProvider} from "./deepgram";
import {GroqWhisperProvider} from "./groq";
import type {TranscriptionProvider, TranscriptionRequest, TranscriptionResult} from "./types";

export async function transcribeWithFallback(input: TranscriptionRequest): Promise<TranscriptionResult> {
  const providers: TranscriptionProvider[] = input.enableSpeakerLabels
    ? [new DeepgramProvider(), new AssemblyAIProvider(), new GroqWhisperProvider()]
    : [new GroqWhisperProvider(), new DeepgramProvider(), new AssemblyAIProvider()];

  const errors: string[] = [];

  for (const provider of providers) {
    try {
      return await provider.transcribe(input);
    } catch (error) {
      errors.push(`${provider.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`All transcription providers failed. ${errors.join(" | ")}`);
}
