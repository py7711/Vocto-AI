import {CallbackUrl, createClient} from "@deepgram/sdk";
import {env} from "@/lib/env";
import type {
  AsyncTranscriptionProvider,
  TranscriptSegment,
  TranscriptionRequest,
  TranscriptionResult,
  TranscriptionSubmitResult
} from "./types";

function client() {
  if (!env.DEEPGRAM_API_KEY) {
    throw new Error("DEEPGRAM_API_KEY 未配置。");
  }
  return createClient(env.DEEPGRAM_API_KEY);
}

function deepgramOptions(input: TranscriptionRequest) {
  return {
    model: "nova-2",
    smart_format: true,
    diarize: input.enableSpeakerLabels,
    detect_language: !input.language || input.language === "auto",
    language: input.language && input.language !== "auto" ? input.language : undefined,
    utterances: true
  } as const;
}

// 将 Deepgram 的预录结果映射为统一的转写结构。
function mapDeepgramResult(result: any): TranscriptionResult {
  const channel = result.results?.channels?.[0];
  const alternative = channel?.alternatives?.[0];
  const utterances = result.results?.utterances ?? [];
  const segments: TranscriptSegment[] =
    utterances.length > 0
      ? utterances.map((utterance: any) => ({
          start: utterance.start,
          end: utterance.end,
          text: utterance.transcript,
          speaker: utterance.speaker !== undefined ? `发言人 ${Number(utterance.speaker) + 1}` : undefined
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
    provider: "deepgram",
    language: result.results?.channels?.[0]?.detected_language,
    durationSeconds: result.metadata?.duration,
    text: alternative?.transcript ?? segments.map((segment) => segment.text).join("\n"),
    segments,
    words: alternative?.words?.map((word: any) => ({
      start: word.start,
      end: word.end,
      word: word.word,
      confidence: word.confidence,
      speaker: word.speaker !== undefined ? `发言人 ${Number(word.speaker) + 1}` : undefined
    })),
    speakerCount: speakers.size || undefined
  };
}

export class DeepgramProvider implements AsyncTranscriptionProvider {
  name = "deepgram" as const;
  supportsSpeakerLabels = true;

  async transcribe(input: TranscriptionRequest): Promise<TranscriptionResult> {
    // Deepgram 支持 URL 直传、自动语言检测、智能标点和发言人分离。
    const {result, error} = await client().listen.prerecorded.transcribeUrl(
      {url: input.mediaUrl},
      deepgramOptions(input)
    );

    if (error) {
      throw error;
    }

    return mapDeepgramResult(result);
  }

  // 提交异步任务并注册回调地址；Deepgram 预录接口的结果只通过 callback 投递。
  async submit(input: TranscriptionRequest): Promise<TranscriptionSubmitResult> {
    if (!input.callbackUrl) {
      throw new Error("Deepgram 异步提交需要 callbackUrl。");
    }
    const {result, error} = await client().listen.prerecorded.transcribeUrlCallback(
      {url: input.mediaUrl},
      new CallbackUrl(input.callbackUrl),
      deepgramOptions(input)
    );
    if (error) {
      throw error;
    }
    const requestId = (result as any)?.request_id;
    if (!requestId) {
      throw new Error("Deepgram 未返回 request_id。");
    }
    return {provider: this.name, providerJobId: String(requestId)};
  }

  // Deepgram 预录接口不支持按 request_id 轮询结果，只能依赖回调；返回 null 让上层走同步兜底。
  async fetchResult(): Promise<TranscriptionResult | null> {
    return null;
  }

  // 供回调端点解析 Deepgram 回调 body。
  static parseCallback(body: unknown): TranscriptionResult {
    return mapDeepgramResult(body);
  }
}
