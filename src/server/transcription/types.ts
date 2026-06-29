export type TranscriptSegment = {
  start: number;
  end: number;
  text: string;
  speaker?: string;
};

// words 目前通过 TranscriptionResult 间接使用，具体供应商可选择返回逐词时间戳。
// 即使没有被外部直接 import，也不能删除，否则会丢掉高精度供应商的词级结果类型。
type TranscriptWord = {
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
