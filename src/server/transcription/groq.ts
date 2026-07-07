import {readFile} from "node:fs/promises";
import {basename} from "node:path";
import Groq from "groq-sdk";
import {env} from "@/lib/env";
import type {TranscriptSegment, TranscriptionProvider, TranscriptionRequest, TranscriptionResult} from "./types";

function client() {
  if (!env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY 未配置。");
  }
  return new Groq({apiKey: env.GROQ_API_KEY});
}

function mapGroqSegments(transcription: any): TranscriptSegment[] {
  return "segments" in transcription && Array.isArray(transcription.segments)
    ? transcription.segments.map((segment: any) => ({
        start: Number(segment.start ?? 0),
        end: Number(segment.end ?? 0),
        text: String(segment.text ?? "").trim()
      }))
    : [{start: 0, end: 0, text: transcription.text}];
}

async function transcribeGroqFile(file: File, language?: string): Promise<TranscriptionResult> {
  const transcription = await client().audio.transcriptions.create({
    file,
    model: "whisper-large-v3-turbo",
    response_format: "verbose_json",
    language: language && language !== "auto" ? language : undefined
  });

  return {
    provider: "groq",
    language: "language" in transcription ? String(transcription.language) : language,
    durationSeconds: "duration" in transcription ? Number(transcription.duration) : undefined,
    text: transcription.text,
    segments: mapGroqSegments(transcription)
  };
}

export class GroqWhisperProvider implements TranscriptionProvider {
  name = "groq" as const;
  supportsSpeakerLabels = false;

  async transcribe(input: TranscriptionRequest): Promise<TranscriptionResult> {
    // Groq SDK 需要 File 对象；这里先从媒体 URL 拉取音频/视频，再交给 Whisper。
    const response = await fetch(input.mediaUrl);
    if (!response.ok) {
      throw new Error(`无法为 Groq 拉取媒体文件：${response.status}`);
    }
    const blob = await response.blob();
    const file = new File([blob], "uniscribe-audio.mp3", {type: blob.type || "audio/mpeg"});
    return transcribeGroqFile(file, input.language);
  }

  // 兜底路径：直接转写本地切片文件，避免为分段音频额外上传 R2。
  async transcribeFile(filePath: string, options?: {language?: string}): Promise<TranscriptionResult> {
    const buffer = await readFile(filePath);
    const file = new File([buffer], basename(filePath) || "chunk.mp3", {type: "audio/mpeg"});
    return transcribeGroqFile(file, options?.language);
  }
}
