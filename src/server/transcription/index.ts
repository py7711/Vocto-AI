import {AssemblyAIProvider} from "./assemblyai";
import {DeepgramProvider} from "./deepgram";
import {GroqWhisperProvider} from "./groq";
import type {TranscriptionProvider, TranscriptionRequest, TranscriptionResult} from "./types";

export async function transcribeWithFallback(input: TranscriptionRequest): Promise<TranscriptionResult> {
  // 需要发言人识别时，优先选择支持 diarization 的 Deepgram/AssemblyAI；
  // 高精度模式也优先选择支持更丰富时间轴和说话人能力的服务商。
  const providers: TranscriptionProvider[] = input.enableSpeakerLabels || input.premiumModel
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
