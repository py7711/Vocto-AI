export type TranscriptSegment = {
  start: number;
  end: number;
  text: string;
  speaker?: string;
};

// words 目前通过 TranscriptionResult 间接使用，具体供应商可选择返回逐词时间戳。
// 即使没有被外部直接 import，也不能删除，否则会丢掉高精度供应商的词级结果类型。
export type TranscriptWord = {
  start: number;
  end: number;
  word: string;
  confidence?: number;
  speaker?: string;
};

export type TranscriptionRequest = {
  mediaUrl: string;
  language?: string;
  enableSpeakerLabels: boolean;
  premiumModel?: boolean;
  // 需要字幕时要求服务商返回词级时间戳，用于生成 SRT/VTT。
  subtitleEnabled?: boolean;
  // 异步回调地址：服务商完成后主动回调该地址，为空表示仅走轮询。
  callbackUrl?: string;
  // 回调校验令牌：AssemblyAI 通过自定义鉴权头回传，用于验证回调来源合法。
  callbackToken?: string;
  // 期望的发言人数量（可选），传给 AssemblyAI 提升分离准确度。
  speakersExpected?: number;
};

// AssemblyAI webhook 鉴权头名称，回调端点据此校验。
export const CALLBACK_AUTH_HEADER = "x-votxt-callback-token";

// 异步提交返回的句柄，用于回调匹配与容错轮询。
export type TranscriptionSubmitResult = {
  provider: TranscriptionResult["provider"];
  providerJobId: string;
};

export type TranscriptionResult = {
  provider: "groq" | "deepgram" | "assemblyai";
  language?: string;
  durationSeconds?: number;
  text: string;
  segments: TranscriptSegment[];
  words?: TranscriptWord[];
  speakerCount?: number;
};

export interface TranscriptionProvider {
  name: TranscriptionResult["provider"];
  supportsSpeakerLabels: boolean;
  transcribe(input: TranscriptionRequest): Promise<TranscriptionResult>;
}

// 支持 webhook 回调 + 容错轮询的服务商（Deepgram / AssemblyAI）。
export interface AsyncTranscriptionProvider extends TranscriptionProvider {
  submit(input: TranscriptionRequest): Promise<TranscriptionSubmitResult>;
  // 返回 null 表示服务商仍在处理中，调用方应继续轮询。
  fetchResult(providerJobId: string, input: TranscriptionRequest): Promise<TranscriptionResult | null>;
}
