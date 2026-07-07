import {AssemblyAIProvider} from "./assemblyai";
import {DeepgramProvider} from "./deepgram";
import {GroqWhisperProvider} from "./groq";
import type {
  AsyncTranscriptionProvider,
  TranscriptionProvider,
  TranscriptionRequest,
  TranscriptionResult
} from "./types";

export type ProviderName = TranscriptionResult["provider"];

function deepgram() {
  return new DeepgramProvider();
}

function assemblyai() {
  return new AssemblyAIProvider();
}

function groq() {
  return new GroqWhisperProvider();
}

// 服务商选择策略：
// - 开启字幕或发言人识别：强制 AssemblyAI（返回词级时间戳/字幕 + 发言人分离），Deepgram 作为同类兜底；
// - 两者都关闭：在 Deepgram / AssemblyAI 中随机选择一个作为主力；
// - Groq 仅作为最终分段兜底，不参与主力轮询（见 transcribeChunkedWithGroq）。
export function resolvePrimaryProviders(input: Pick<TranscriptionRequest, "enableSpeakerLabels" | "subtitleEnabled">): AsyncTranscriptionProvider[] {
  if (input.enableSpeakerLabels || input.subtitleEnabled) {
    return [assemblyai(), deepgram()];
  }

  // 随机决定 Deepgram / AssemblyAI 的主次顺序，实现“随机选择一个”的诉求，同时保留互相兜底。
  return Math.random() < 0.5 ? [deepgram(), assemblyai()] : [assemblyai(), deepgram()];
}

export function getAsyncProvider(name: ProviderName): AsyncTranscriptionProvider {
  if (name === "deepgram") return deepgram();
  if (name === "assemblyai") return assemblyai();
  throw new Error(`服务商 ${name} 不支持异步回调。`);
}

export async function transcribeWithFallback(input: TranscriptionRequest): Promise<TranscriptionResult> {
  const providers: TranscriptionProvider[] = resolvePrimaryProviders(input);
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

export {GroqWhisperProvider};
export const groqProvider = groq;
