export type TranscriptSegment = {
  start: number;
  end: number;
  text: string;
  speaker?: string;
};

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
