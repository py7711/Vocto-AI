import {Document as DocxDocument, HeadingLevel, Packer, Paragraph, TextRun} from "docx";
import type {Transcript} from "@prisma/client";

type Segment = {
  start: number;
  end: number;
  text: string;
  speaker?: string;
};

type ExportMeta = {title?: string; meta?: string};

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

export function renderMarkdown(transcript: Transcript, options: ExportMeta = {}) {
  const title = options.title || "Votxt Transcript";
  const head = options.meta ? `# ${title}\n\n_${options.meta}_\n` : `# ${title}\n`;
  const list = segments(transcript);

  if (list.length) {
    const lines = list.map((segment) => {
      const speaker = segment.speaker ? `**${segment.speaker}** ` : "";
      return `- \`${stamp(segment.start, ".")}\` ${speaker}${segment.text}`;
    });
    return `${head}\n${lines.join("\n")}\n`;
  }

  return `${head}\n${renderTxt(transcript)}\n`;
}

function csvCell(value: string) {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function renderCsv(transcript: Transcript) {
  const header = "start,end,speaker,text";
  const list = segments(transcript);

  if (!list.length) {
    return `\ufeff${header}\n,,,${csvCell(renderTxt(transcript))}\n`;
  }

  const rows = list.map((segment) =>
    [stamp(segment.start, "."), stamp(segment.end, "."), segment.speaker ?? "", segment.text].map((value) => csvCell(String(value))).join(",")
  );
  return `\ufeff${header}\n${rows.join("\n")}\n`;
}

export async function renderDocx(transcript: Transcript, options: ExportMeta = {}) {
  const children: Paragraph[] = [
    new Paragraph({text: options.title || "Votxt Transcript", heading: HeadingLevel.HEADING_1})
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
            new TextRun({text: `${stamp(segment.start, ".")}  `, bold: true, color: "0E6F7C"}),
            ...(segment.speaker ? [new TextRun({text: `${segment.speaker}: `, bold: true})] : []),
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
