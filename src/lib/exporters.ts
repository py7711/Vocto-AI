import type {Transcript} from "@prisma/client";

type Segment = {
  start: number;
  end: number;
  text: string;
  speaker?: string;
};

function segments(transcript: Transcript): Segment[] {
  return Array.isArray(transcript.segments) ? (transcript.segments as Segment[]) : [];
}

function stamp(seconds: number, separator: "," | ".") {
  const date = new Date(Math.max(0, seconds) * 1000);
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  const ms = String(date.getUTCMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}${separator}${ms}`;
}

export function renderTxt(transcript: Transcript) {
  return transcript.editedText || transcript.plainText;
}

export function renderSrt(transcript: Transcript) {
  return segments(transcript)
    .map((segment, index) => {
      const speaker = segment.speaker ? `${segment.speaker}: ` : "";
      return `${index + 1}\n${stamp(segment.start, ",")} --> ${stamp(segment.end, ",")}\n${speaker}${segment.text}`;
    })
    .join("\n\n");
}

export function renderVtt(transcript: Transcript) {
  return `WEBVTT\n\n${segments(transcript)
    .map((segment) => {
      const speaker = segment.speaker ? `<v ${segment.speaker}>` : "";
      return `${stamp(segment.start, ".")} --> ${stamp(segment.end, ".")}\n${speaker}${segment.text}`;
    })
    .join("\n\n")}`;
}

export function renderJson(transcript: Transcript) {
  return JSON.stringify(
    {
      text: transcript.editedText || transcript.plainText,
      segments: transcript.segments,
      words: transcript.words
    },
    null,
    2
  );
}
