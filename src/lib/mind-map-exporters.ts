import {createZip} from "@/lib/zip";

export type MindMapExportNode = {
  label: string;
  children: MindMapExportNode[];
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeLabel(value: unknown, fallback: string) {
  if (typeof value === "string") return value.trim() || fallback;
  if (value && typeof value === "object") {
    const entry = value as {label?: unknown; text?: unknown; title?: unknown};
    return text(entry.label) || text(entry.text) || text(entry.title) || fallback;
  }
  return fallback;
}

export function normalizeMindMapExportNode(node: unknown, fallback = "Mind Map"): MindMapExportNode | null {
  if (!node || typeof node !== "object") return null;
  const entry = node as {label?: unknown; text?: unknown; title?: unknown; children?: unknown};
  const label = normalizeLabel(entry.label ?? entry.text ?? entry.title, fallback);
  const children = Array.isArray(entry.children)
    ? entry.children
      .map((child, index) => normalizeMindMapExportNode(child, `Topic ${index + 1}`))
      .filter((child): child is MindMapExportNode => Boolean(child))
    : [];
  return {label, children};
}

function flattenMarkdown(node: MindMapExportNode, depth = 0): string[] {
  const current = `${"  ".repeat(depth)}- ${node.label}`;
  return [current, ...node.children.flatMap((child) => flattenMarkdown(child, depth + 1))];
}

export function renderMindMapMarkdown(input: {title: string; provider?: string | null; node: MindMapExportNode}) {
  const meta = input.provider ? `\n\n_${input.provider}_` : "";
  return `# ${input.title || input.node.label}${meta}\n\n${flattenMarkdown(input.node).join("\n")}\n`;
}

function safeId(value: string) {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "node";
}

function toXmindTopic(node: MindMapExportNode, path: string): Record<string, unknown> {
  const topic: Record<string, unknown> = {
    id: `topic-${safeId(path)}`,
    class: "topic",
    title: node.label
  };

  if (node.children.length) {
    topic.children = {
      attached: node.children.map((child, index) => toXmindTopic(child, `${path}-${index + 1}-${child.label}`))
    };
  }

  return topic;
}

function jsonData(value: unknown) {
  return new TextEncoder().encode(JSON.stringify(value, null, 2));
}

export function renderMindMapXmind(input: {title: string; node: MindMapExportNode}) {
  const sheetId = "sheet-votxt-mind-map";
  const content = [
    {
      id: sheetId,
      class: "sheet",
      title: input.title || input.node.label,
      rootTopic: toXmindTopic(input.node, `root-${input.node.label}`),
      topicPositioning: "floating",
      extensions: []
    }
  ];
  const metadata = {
    creator: {
      name: "Votxt",
      version: "0.1.0"
    },
    activeSheetId: sheetId
  };
  const manifest = {
    "file-entries": {
      "content.json": {"media-type": "application/json"},
      "metadata.json": {"media-type": "application/json"}
    }
  };

  return createZip([
    {name: "content.json", data: jsonData(content)},
    {name: "metadata.json", data: jsonData(metadata)},
    {name: "manifest.json", data: jsonData(manifest)}
  ]);
}
