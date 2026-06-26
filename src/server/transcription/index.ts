import {AssemblyAIProvider} from "./assemblyai";
import {DeepgramProvider} from "./deepgram";
import {GroqWhisperProvider} from "./groq";
import type {TranscriptionProvider, TranscriptionRequest, TranscriptionResult} from "./types";

export async function transcribeWithFallback(input: TranscriptionRequest): Promise<TranscriptionResult> {
  // 需要发言人识别时，优先选择支持 diarization 的 Deepgram/AssemblyAI；
  // 不需要发言人识别时，优先选择速度和成本更适合批量任务的 Groq Whisper。
  const providers: TranscriptionProvider[] = input.enableSpeakerLabels
    ? [new DeepgramProvider(), new AssemblyAIProvider(), new GroqWhisperProvider()]
    : [new GroqWhisperProvider(), new DeepgramProvider(), new AssemblyAIProvider()];

  const errors: string[] = [];

  for (const provider of providers) {
    try {
      return await provider.transcribe(input);
    } catch (error) {
      // 单个服务商失败不影响任务，记录错误后继续尝试下一个服务商。
      errors.push(`${provider.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`所有转写服务商均失败。${errors.join(" | ")}`);
}
