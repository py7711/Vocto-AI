import {Document as DocxDocument, HeadingLevel, Packer, Paragraph, TextRun} from "docx";
import type {Transcript} from "@prisma/client";

type Segment = {
  start: number;
  end: number;
  text: string;
  speaker?: string;
};

export type ExportOptions = {
  title?: string;
  meta?: string;
  showSpeakerName?: boolean;
  showTimestamps?: boolean;
  subtitleMaxChars?: number;
  subtitleMaxDurationSeconds?: number;
};

export function parseExportOptions(url: URL): ExportOptions {
  const showSpeaker = url.searchParams.get("showSpeaker");
  const showTimestamp = url.searchParams.get("showTimestamp");
  const subtitleMaxChars = Number(url.searchParams.get("subtitleMaxChars") || "");
  const subtitleMaxDurationSeconds = Number(url.searchParams.get("subtitleMaxDurationSeconds") || "");

  return {
    showSpeakerName: showSpeaker === null ? undefined : showSpeaker === "true",
    showTimestamps: showTimestamp === null ? undefined : showTimestamp === "true",
    subtitleMaxChars: Number.isFinite(subtitleMaxChars) && subtitleMaxChars > 0 ? Math.min(2000, Math.floor(subtitleMaxChars)) : undefined,
    subtitleMaxDurationSeconds:
      Number.isFinite(subtitleMaxDurationSeconds) && subtitleMaxDurationSeconds > 0 ? Math.min(60, subtitleMaxDurationSeconds) : undefined
  };
}

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

function splitTextByLength(text: string, maxChars?: number) {
  if (!maxChars || maxChars < 1 || text.length <= maxChars) return [text];
  const words = text.split(/(\s+)/);
  const chunks: string[] = [];
  let current = "";

  for (const word of words) {
    if ((current + word).trim().length > maxChars && current.trim()) {
      chunks.push(current.trim());
      current = word;
    } else {
      current += word;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [text];
}

function cueSegments(list: Segment[], options: ExportOptions = {}) {
  const maxDuration = options.subtitleMaxDurationSeconds && options.subtitleMaxDurationSeconds > 0 ? options.subtitleMaxDurationSeconds : undefined;
  const maxChars = options.subtitleMaxChars && options.subtitleMaxChars > 0 ? Math.floor(options.subtitleMaxChars) : undefined;

  return list.flatMap((segment) => {
    const textChunks = splitTextByLength(segment.text, maxChars);
    const duration = Math.max(0.2, segment.end - segment.start);
    const chunkCount = maxDuration ? Math.max(textChunks.length, Math.ceil(duration / maxDuration)) : textChunks.length;
    const sliceDuration = duration / chunkCount;
    const chunks = Array.from({length: chunkCount}, (_, index) => textChunks[index] ?? "");

    return chunks.map((text, index) => ({
      ...segment,
      text: text || segment.text,
      start: segment.start + sliceDuration * index,
      end: index === chunkCount - 1 ? segment.end : segment.start + sliceDuration * (index + 1)
    }));
  });
}

function displaySegmentText(segment: Segment, options: ExportOptions = {}) {
  const speaker = options.showSpeakerName !== false && segment.speaker ? `${segment.speaker}: ` : "";
  return `${speaker}${segment.text}`;
}

export function renderSrt(transcript: Transcript, options: ExportOptions = {}) {
  return cueSegments(segments(transcript), options)
    .map((segment, index) => {
      return `${index + 1}\n${stamp(segment.start, ",")} --> ${stamp(segment.end, ",")}\n${displaySegmentText(segment, options)}`;
    })
    .join("\n\n");
}

export function renderVtt(transcript: Transcript, options: ExportOptions = {}) {
  return `WEBVTT\n\n${cueSegments(segments(transcript), options)
    .map((segment) => {
      const speaker = options.showSpeakerName !== false && segment.speaker ? `<v ${segment.speaker}>` : "";
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

export function renderMarkdown(transcript: Transcript, options: ExportOptions = {}) {
  const title = options.title || "UniScribe Transcript";
  const head = options.meta ? `# ${title}\n\n_${options.meta}_\n` : `# ${title}\n`;
  const list = segments(transcript);

  if (list.length) {
    const lines = list.map((segment) => {
      const timestamp = options.showTimestamps === false ? "" : `\`${stamp(segment.start, ".")}\` `;
      const speaker = options.showSpeakerName !== false && segment.speaker ? `**${segment.speaker}** ` : "";
      return `- ${timestamp}${speaker}${segment.text}`;
    });
    return `${head}\n${lines.join("\n")}\n`;
  }

  return `${head}\n${renderTxt(transcript)}\n`;
}

function csvCell(value: string) {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function renderCsv(transcript: Transcript, options: ExportOptions = {}) {
  const header = "start,end,speaker,text";
  const list = segments(transcript);

  if (!list.length) {
    return `\ufeff${header}\n,,,${csvCell(renderTxt(transcript))}\n`;
  }

  const rows = list.map((segment) =>
    [
      options.showTimestamps === false ? "" : stamp(segment.start, "."),
      options.showTimestamps === false ? "" : stamp(segment.end, "."),
      options.showSpeakerName === false ? "" : segment.speaker ?? "",
      segment.text
    ].map((value) => csvCell(String(value))).join(",")
  );
  return `\ufeff${header}\n${rows.join("\n")}\n`;
}

export async function renderDocx(transcript: Transcript, options: ExportOptions = {}) {
  const children: Paragraph[] = [
    new Paragraph({text: options.title || "UniScribe Transcript", heading: HeadingLevel.HEADING_1})
  ];

  if (options.meta) {
    children.push(new Paragraph({children: [new TextRun({text: options.meta, color: "5D6870", italics: true})]}));
  }

  const list = segments(transcript);
  if (list.length) {
    for (const segment of list) {
      children.push(
        new Paragraph({
          spacing: {after: 120},
          children: [
            ...(options.showTimestamps === false ? [] : [new TextRun({text: `${stamp(segment.start, ".")}  `, bold: true, color: "0E6F7C"})]),
            ...(options.showSpeakerName !== false && segment.speaker ? [new TextRun({text: `${segment.speaker}: `, bold: true})] : []),
            new TextRun({text: segment.text})
          ]
        })
      );
    }
  } else {
    for (const paragraph of renderTxt(transcript).split(/\n{2,}/)) {
      children.push(new Paragraph({text: paragraph, spacing: {after: 120}}));
    }
  }

  const document = new DocxDocument({sections: [{children}]});
  return Packer.toBuffer(document);
}
