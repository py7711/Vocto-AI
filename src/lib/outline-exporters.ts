import {Document as DocxDocument, HeadingLevel, Packer, Paragraph, TextRun} from "docx";

type OutlineSection = {
  title: string;
  lines: string[];
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function formatSeconds(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return "";
  const totalSeconds = Math.floor(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function timestampLabel(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  const timestamp = value as {label?: unknown; start?: unknown; end?: unknown};
  const label = text(timestamp.label);
  if (label) return label;
  const start = formatSeconds(timestamp.start);
  if (!start) return "";
  const end = formatSeconds(timestamp.end);
  return end ? `${start}-${end}` : start;
}

function insightLine(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  const entry = value as {text?: unknown; label?: unknown; timestamps?: unknown; timestamp?: unknown};
  const body = text(entry.text) || text(entry.label);
  if (!body) return "";
  const timestamps = Array.isArray(entry.timestamps) ? entry.timestamps.map(timestampLabel).filter(Boolean) : [];
  const singleTimestamp = timestampLabel(entry.timestamp);
  if (singleTimestamp) timestamps.push(singleTimestamp);
  return timestamps.length ? `${body} (${timestamps.join(", ")})` : body;
}

function flattenMindMap(node: any, depth = 0): string[] {
  if (!node) return [];
  const label = insightLine(node.label);
  const current = label ? [`${"  ".repeat(depth)}- ${label}`] : [];
  const children = Array.isArray(node.children) ? node.children.flatMap((child: any) => flattenMindMap(child, depth + 1)) : [];
  return [...current, ...children];
}

export function buildOutline(input: {title: string; provider?: string | null; summary?: any; mindMap?: any}) {
  const {summary, mindMap} = input;
  const sections: OutlineSection[] = [];

  const overview = text(summary?.overview);
  const bullets: string[] = Array.isArray(summary?.bullets) ? summary.bullets.map(insightLine).filter(Boolean) : [];
  if (overview || bullets.length) {
    sections.push({
      title: "Summary",
      lines: [overview, ...bullets.map((line) => `- ${line}`)].filter(Boolean)
    });
  }

  const mindMapLines = flattenMindMap(mindMap);
  if (mindMapLines.length) {
    sections.push({title: "Mind map", lines: mindMapLines});
  }

  return {
    title: input.title || "Votxt Outline",
    provider: input.provider ?? null,
    sections
  };
}

type Outline = ReturnType<typeof buildOutline>;

export function renderOutlineMarkdown(outline: Outline) {
  const meta = outline.provider ? `\n\n_${outline.provider}_` : "";
  const sections = outline.sections.map((section) => `## ${section.title}\n\n${section.lines.join("\n")}`).join("\n\n");
  return `# ${outline.title}${meta}\n\n${sections || "_No outline content is available yet._"}\n`;
}

export function renderOutlineText(outline: Outline) {
  const sections = outline.sections.map((section) => `${section.title}\n${"-".repeat(section.title.length)}\n${section.lines.join("\n")}`).join("\n\n");
  return `${outline.title}${outline.provider ? `\n${outline.provider}` : ""}\n\n${sections || "No outline content is available yet."}\n`;
}

export function renderOutlineJson(outline: Outline) {
  return JSON.stringify(outline, null, 2);
}

export async function renderOutlineDocx(outline: Outline) {
  const children: Paragraph[] = [
    new Paragraph({text: outline.title, heading: HeadingLevel.HEADING_1})
  ];
  if (outline.provider) {
    children.push(new Paragraph({children: [new TextRun({text: outline.provider, italics: true, color: "5D6870"})]}));
  }
  for (const section of outline.sections) {
    children.push(new Paragraph({text: section.title, heading: HeadingLevel.HEADING_2}));
    for (const line of section.lines) {
      children.push(new Paragraph({text: line, spacing: {after: 80}}));
    }
  }
  if (!outline.sections.length) {
    children.push(new Paragraph({text: "No outline content is available yet."}));
  }
  return Packer.toBuffer(new DocxDocument({sections: [{children}]}));
}
