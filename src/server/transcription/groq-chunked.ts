import {rm} from "node:fs/promises";
import {chunkAudioForFallback} from "@/server/media/prepare";
import {GroqWhisperProvider} from "./groq";
import type {TranscriptSegment, TranscriptionRequest, TranscriptionResult} from "./types";

// 兜底方案：Deepgram/AssemblyAI 均不可用时才进入。
// 对完整音频按静音边界智能分段，逐段调用 Groq Whisper 转写，再按切片起始时间偏移合并为完整结果。
export async function transcribeChunkedWithGroq(input: TranscriptionRequest): Promise<TranscriptionResult> {
  const {chunks, durationSeconds, directory} = await chunkAudioForFallback({audioUrl: input.mediaUrl});
  const provider = new GroqWhisperProvider();

  try {
    const mergedSegments: TranscriptSegment[] = [];
    const textParts: string[] = [];
    let maxEnd = 0;
    let detectedLanguage: string | undefined;

    for (const chunk of chunks) {
      const offset = chunk.start;
      const result = await provider.transcribeFile(chunk.filePath, {language: input.language});
      detectedLanguage = detectedLanguage ?? result.language;
      if (result.text.trim()) textParts.push(result.text.trim());
      for (const segment of result.segments) {
        const start = segment.start + offset;
        const end = segment.end + offset;
        maxEnd = Math.max(maxEnd, end);
        mergedSegments.push({...segment, start, end});
      }
    }

    return {
      provider: "groq",
      language: detectedLanguage ?? (input.language && input.language !== "auto" ? input.language : undefined),
      durationSeconds: durationSeconds ?? (maxEnd || undefined),
      text: textParts.join("\n"),
      segments: mergedSegments.length
        ? mergedSegments
        : [{start: 0, end: 0, text: textParts.join("\n")}]
    };
  } finally {
    await rm(directory, {recursive: true, force: true}).catch(() => undefined);
  }
}
