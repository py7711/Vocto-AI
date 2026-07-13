import {AssemblyAI, type Transcript} from "assemblyai";
import {env} from "@/lib/env";
import {
  CALLBACK_AUTH_HEADER,
  type AsyncTranscriptionProvider,
  type TranscriptSegment,
  type TranscriptionRequest,
  type TranscriptionResult,
  type TranscriptionSubmitResult
} from "./types";
import {normalizeTranscriptSegments} from "./segments";

function client() {
  if (!env.ASSEMBLYAI_API_KEY) {
    throw new Error("ASSEMBLYAI_API_KEY 未配置。");
  }
  return new AssemblyAI({apiKey: env.ASSEMBLYAI_API_KEY});
}

function assemblyParams(input: TranscriptionRequest) {
  const autoDetect = !input.language || input.language === "auto";
  return {
    audio: input.mediaUrl,
    speech_models: ["universal-3-pro", "universal-2"] as string[],
    // 发言人识别：开启后 utterances / words 会带 speaker 标签。
    speaker_labels: input.enableSpeakerLabels,
    speakers_expected:
      input.enableSpeakerLabels && input.speakersExpected && input.speakersExpected > 0
        ? input.speakersExpected
        : undefined,
    // 标点与文本格式化提升可读性，也让字幕切分更自然。
    punctuate: true,
    format_text: true,
    language_detection: autoDetect,
    language_code: autoDetect ? undefined : input.language
  };
}

function mapAssemblyResult(transcript: Transcript): TranscriptionResult {
  const utterances = transcript.utterances ?? [];
  const rawSegments: TranscriptSegment[] =
    utterances.length > 0
      ? utterances.map((utterance) => ({
          start: utterance.start / 1000,
          end: utterance.end / 1000,
          text: utterance.text,
          speaker: utterance.speaker ? `发言人 ${utterance.speaker}` : undefined
        }))
      : [
          {
            // audio_duration 单位为秒，无需再除以 1000。
            start: 0,
            end: transcript.audio_duration ?? 0,
            text: transcript.text ?? "",
            speaker: undefined
          }
        ];
  const words = transcript.words?.map((word) => ({
    start: word.start / 1000,
    end: word.end / 1000,
    word: word.text,
    confidence: word.confidence,
    speaker: word.speaker ? `发言人 ${word.speaker}` : undefined
  }));
  const text = transcript.text ?? rawSegments.map((segment) => segment.text).join("\n");
  const segments = normalizeTranscriptSegments({
    text,
    durationSeconds: transcript.audio_duration ?? undefined,
    segments: rawSegments,
    words
  });

  return {
    provider: "assemblyai",
    language: transcript.language_code ?? undefined,
    // audio_duration 已是秒，直接使用，避免时长被错误缩小 1000 倍影响计费与播放。
    durationSeconds: transcript.audio_duration ?? undefined,
    text,
    segments,
    words,
    speakerCount: new Set(segments.map((segment) => segment.speaker).filter(Boolean)).size || undefined
  };
}

export class AssemblyAIProvider implements AsyncTranscriptionProvider {
  name = "assemblyai" as const;
  supportsSpeakerLabels = true;

  async transcribe(input: TranscriptionRequest): Promise<TranscriptionResult> {
    // transcribe 内部会自动轮询直到完成，作为同步兜底路径使用。
    const transcript = await client().transcripts.transcribe(assemblyParams(input) as any);
    if (transcript.status === "error") {
      throw new Error(transcript.error ?? "AssemblyAI 转写失败。");
    }
    return mapAssemblyResult(transcript);
  }

  // 提交异步任务并注册 webhook；返回 transcript id 用于回调匹配与轮询。
  async submit(input: TranscriptionRequest): Promise<TranscriptionSubmitResult> {
    const params: Record<string, unknown> = {...assemblyParams(input)};
    if (input.callbackUrl) {
      params.webhook_url = input.callbackUrl;
      // 官方 webhook 鉴权头：回调端点据此二次校验来源，避免仅依赖 URL 中的 token。
      if (input.callbackToken) {
        params.webhook_auth_header_name = CALLBACK_AUTH_HEADER;
        params.webhook_auth_header_value = input.callbackToken;
      }
    }
    const transcript = await client().transcripts.submit(params as any);
    if (!transcript.id) {
      throw new Error("AssemblyAI 未返回 transcript id。");
    }
    return {provider: this.name, providerJobId: transcript.id};
  }

  // 轮询指定 transcript：完成返回结果，处理中返回 null，出错抛异常。
  async fetchResult(providerJobId: string): Promise<TranscriptionResult | null> {
    const transcript = await client().transcripts.get(providerJobId);
    if (transcript.status === "error") {
      throw new Error(transcript.error ?? "AssemblyAI 转写失败。");
    }
    if (transcript.status !== "completed") {
      return null;
    }
    return mapAssemblyResult(transcript);
  }
}
