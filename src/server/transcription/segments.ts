import type {TranscriptSegment, TranscriptWord} from "./types";

const maxSegmentChars = 180;
const minTextSegmentChars = 16;
const maxSegmentDurationSeconds = 18;
const maxWordGapSeconds = 1.2;
const terminalPunctuationPattern = /[.!?。！？…]+["')\]]?$/;

function cleanText(value: string | undefined) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function hasTerminalPunctuation(value: string) {
  return terminalPunctuationPattern.test(value.trim());
}

function shouldJoinWithoutSpace(current: string, next: string) {
  if (!current) return true;
  if (/^[,.;:!?，。！？、；：）)\]}%]/.test(next)) return true;
  if (/[\s([{（【]$/.test(current)) return true;
  return /[\u3400-\u9fff]$/.test(current) || /^[\u3400-\u9fff]/.test(next);
}

function appendToken(current: string, token: string) {
  const clean = cleanText(token);
  if (!clean) return current;
  if (!current) return clean;
  return shouldJoinWithoutSpace(current, clean) ? `${current}${clean}` : `${current} ${clean}`;
}

function speakerForWords(words: TranscriptWord[]) {
  const speakers = Array.from(new Set(words.map((word) => word.speaker).filter(Boolean) as string[]));
  return speakers.length === 1 ? speakers[0] : undefined;
}

function segmentsFromWords(words: TranscriptWord[]) {
  const normalizedWords = words
    .map((word) => ({...word, word: cleanText(word.word)}))
    .filter((word) => word.word && Number.isFinite(word.start) && Number.isFinite(word.end));
  if (!normalizedWords.length) return [];

  const segments: TranscriptSegment[] = [];
  let group: TranscriptWord[] = [];
  let groupText = "";

  function flush() {
    if (!group.length || !groupText.trim()) return;
    segments.push({
      start: group[0].start,
      end: group[group.length - 1].end,
      text: groupText.trim(),
      speaker: speakerForWords(group)
    });
    group = [];
    groupText = "";
  }

  for (const word of normalizedWords) {
    const previous = group[group.length - 1];
    const nextText = appendToken(groupText, word.word);
    const startsAfterPause = previous ? word.start - previous.end > maxWordGapSeconds : false;
    const tooLong = nextText.length > maxSegmentChars;
    const tooLongDuration = group.length > 0 && word.end - group[0].start > maxSegmentDurationSeconds;
    const speakerChanged = previous?.speaker && word.speaker && previous.speaker !== word.speaker;

    if (group.length && (startsAfterPause || tooLong || tooLongDuration || speakerChanged)) {
      flush();
    }

    group.push(word);
    groupText = appendToken(groupText, word.word);

    if (hasTerminalPunctuation(groupText) && groupText.length >= 40) {
      flush();
    }
  }

  flush();
  return segments;
}

function sentenceParts(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  const parts = normalized.match(/[^.!?。！？\n]+[.!?。！？…]*|[\n]+/g) ?? [normalized];
  return parts
    .map((part) => cleanText(part))
    .filter(Boolean);
}

function textWeight(text: string) {
  return Math.max(1, Array.from(text).reduce((sum, char) => sum + (/[\u3400-\u9fff]/.test(char) ? 1 : 0.55), 0));
}

function segmentsFromText(text: string, durationSeconds?: number, startSeconds = 0, endSeconds?: number) {
  const parts = sentenceParts(text);
  if (!parts.length) return [];

  const chunks: string[] = [];
  let current = "";
  for (const part of parts) {
    const next = appendToken(current, part);
    if (current && (next.length > maxSegmentChars || (hasTerminalPunctuation(current) && current.length >= minTextSegmentChars))) {
      chunks.push(current);
      current = part;
    } else {
      current = next;
    }
    if (hasTerminalPunctuation(current) && current.length >= minTextSegmentChars) {
      chunks.push(current);
      current = "";
    }
  }
  if (current) chunks.push(current);

  const totalDuration = Math.max(0, (endSeconds ?? durationSeconds ?? 0) - startSeconds);
  const totalWeight = chunks.reduce((sum, chunk) => sum + textWeight(chunk), 0);
  let cursor = startSeconds;

  return chunks.map((chunk, index) => {
    const isLast = index === chunks.length - 1;
    const share = totalDuration && totalWeight ? (textWeight(chunk) / totalWeight) * totalDuration : 0;
    const end = isLast ? (endSeconds ?? (totalDuration ? startSeconds + totalDuration : cursor)) : cursor + share;
    const segment = {start: cursor, end, text: chunk};
    cursor = end;
    return segment;
  });
}

function cleanSegments(segments: TranscriptSegment[]) {
  return segments
    .map((segment) => ({
      start: Number(segment.start) || 0,
      end: Number(segment.end) || 0,
      text: cleanText(segment.text),
      speaker: segment.speaker
    }))
    .filter((segment) => segment.text);
}

export function normalizeTranscriptSegments(input: {
  text: string;
  durationSeconds?: number;
  segments?: TranscriptSegment[];
  words?: TranscriptWord[];
}): TranscriptSegment[] {
  const existing = cleanSegments(input.segments ?? []);
  if (existing.length > 1) return existing;

  const wordSegments = segmentsFromWords(input.words ?? []);
  if (wordSegments.length > 1) return wordSegments;

  const text = cleanText(input.text || existing[0]?.text);
  const textSegments = segmentsFromText(text, input.durationSeconds, existing[0]?.start ?? 0, existing[0]?.end || input.durationSeconds);
  if (textSegments.length > 1) return textSegments;

  return existing.length ? existing : textSegments;
}
