import Groq from "groq-sdk";
import {env} from "@/lib/env";
import type {TranscriptionProvider, TranscriptionRequest, TranscriptionResult} from "./types";

export class GroqWhisperProvider implements TranscriptionProvider {
  name = "groq" as const;
  supportsSpeakerLabels = false;

  async transcribe(input: TranscriptionRequest): Promise<TranscriptionResult> {
    if (!env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY 未配置。");
    }

    const client = new Groq({apiKey: env.GROQ_API_KEY});
    // Groq SDK 需要 File 对象；这里先从媒体 URL 拉取音频/视频，再交给 Whisper。
    const response = await fetch(input.mediaUrl);

    if (!response.ok) {
      throw new Error(`无法为 Groq 拉取媒体文件：${response.status}`);
    }

    const blob = await response.blob();
    const file = new File([blob], "uniscribe-audio.mp3", {type: blob.type || "audio/mpeg"});
    const transcription = await client.audio.transcriptions.create({
      file,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      language: input.language && input.language !== "auto" ? input.language : undefined
    });

    const segments =
      "segments" in transcription && Array.isArray(transcription.segments)
        ? transcription.segments.map((segment) => ({
            start: Number(segment.start ?? 0),
            end: Number(segment.end ?? 0),
            text: String(segment.text ?? "").trim()
          }))
        : [
            {
              start: 0,
              end: 0,
              text: transcription.text
            }
          ];

    return {
      provider: this.name,
      language: "language" in transcription ? String(transcription.language) : input.language,
      durationSeconds: "duration" in transcription ? Number(transcription.duration) : undefined,
      text: transcription.text,
      segments
    };
  }
}
