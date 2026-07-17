import type {SummaryTemplate} from "@/lib/summary-template";

export type TimedSegment = {start: number; end: number; text: string; speaker?: string};

type SummaryEntry = {
  text: string;
  timestamps: Array<{start: number; end: number}>;
};

export function splitSummarySentences(text: string) {
  return text.split(/(?<=[.!?。！？])\s+/).map((sentence) => sentence.trim()).filter(Boolean);
}

export function transcriptTimedSegments(raw: unknown): TimedSegment[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const segment = item as Record<string, unknown>;
    const start = Number(segment.start);
    const end = Number(segment.end);
    const text = String(segment.text ?? "").trim();
    if (!text || !Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) return [];
    return [{start, end, text, speaker: typeof segment.speaker === "string" ? segment.speaker : undefined}];
  });
}

export function compactTimedSegments(segments: TimedSegment[], maxChars = 24000): TimedSegment[] {
  const result: TimedSegment[] = [];
  let total = 0;
  for (const segment of segments) {
    total += segment.text.length;
    if (total > maxChars) break;
    result.push({
      start: Math.round(segment.start * 100) / 100,
      end: Math.round(segment.end * 100) / 100,
      text: segment.text,
      speaker: segment.speaker
    });
  }
  return result;
}

function normalizedText(value: unknown) {
  return typeof value === "string" ? value.toLocaleLowerCase().replace(/\s+/g, " ").trim() : "";
}

function matchingSegment(text: unknown, segments: TimedSegment[]) {
  const needle = normalizedText(text);
  if (!needle) return undefined;
  return segments.find((segment) => {
    const source = normalizedText(segment.text);
    return source.includes(needle) || needle.includes(source);
  });
}

export function sanitizeSummaryTimestamps<T>(summary: T, segments: TimedSegment[]): T {
  if (!summary || typeof summary !== "object") return summary;
  const record = summary as Record<string, unknown>;
  const transcriptEnd = segments.reduce((maximum, segment) => Math.max(maximum, segment.end), 0);

  const sanitizeEntries = (value: unknown) => {
    if (!Array.isArray(value)) return value;
    return value.map((item) => {
      if (!item || typeof item !== "object") return item;
      const entry = item as Record<string, unknown>;
      const timestamps = Array.isArray(entry.timestamps) ? entry.timestamps : [];
      const validTimestamps = timestamps.flatMap((timestamp) => {
        if (!timestamp || typeof timestamp !== "object") return [];
        const range = timestamp as Record<string, unknown>;
        const start = Number(range.start);
        const end = Number(range.end);
        if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start || transcriptEnd <= 0 || start >= transcriptEnd) return [];
        const clippedEnd = Math.min(end, transcriptEnd);
        const overlapsTranscript = segments.some((segment) => start < segment.end && clippedEnd > segment.start);
        return overlapsTranscript ? [{start, end: clippedEnd}] : [];
      }).filter((timestamp) => timestamp.end > timestamp.start);

      if (validTimestamps.length) return {...entry, timestamps: validTimestamps};
      const segment = matchingSegment(entry.text ?? entry.label, segments);
      return {
        ...entry,
        timestamps: segment ? [{start: segment.start, end: segment.end}] : []
      };
    });
  };

  return {
    ...record,
    bullets: sanitizeEntries(record.bullets),
    takeaways: sanitizeEntries(record.takeaways)
  } as T;
}

function timedFallbackEntries(text: string, segments: TimedSegment[]): SummaryEntry[] {
  if (!segments.length) {
    return splitSummarySentences(text).map((sentence) => ({text: sentence, timestamps: []}));
  }

  return segments.flatMap((segment) => {
    const sentences = splitSummarySentences(segment.text);
    return (sentences.length ? sentences : [segment.text]).map((sentence) => ({
      text: sentence,
      timestamps: [{start: segment.start, end: segment.end}]
    }));
  });
}

export function fallbackSummary(text: string, locale: string, summaryTemplate: SummaryTemplate, segments: TimedSegment[] = []) {
  const entries = timedFallbackEntries(text, segments);
  const summaryPrefixes: Record<Exclude<SummaryTemplate, "none">, string> = {
    standard: locale.startsWith("zh") ? "摘要" : "Summary",
    meeting: locale.startsWith("zh") ? "会议纪要" : "Meeting notes",
    study: locale.startsWith("zh") ? "学习笔记" : "Study notes",
    interview: locale.startsWith("zh") ? "访谈简报" : "Interview brief"
  };
  return {
    overview: summaryTemplate === "none" ? "" : `${summaryPrefixes[summaryTemplate]}: ${entries.slice(0, 5).map((entry) => entry.text).join(" ") || text.slice(0, 800)}`,
    bullets: summaryTemplate === "none" ? [] : entries.slice(0, 8).map((entry) => ({...entry, text: entry.text.slice(0, 180)})),
    takeaways: summaryTemplate === "none" ? [] : entries.slice(8, 12).map((entry) => ({...entry, text: entry.text.slice(0, 180)}))
  };
}
