import {Document, Page, StyleSheet, Text, renderToBuffer} from "@react-pdf/renderer";
import {NextResponse} from "next/server";
import {createElement} from "react";
import {z} from "zod";
import type {Prisma} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import {transcriptText} from "@/lib/transcript-content";
import {transcriptTranslations} from "@/lib/transcript-translations";
import type {ExportOptions} from "@/lib/exporters";
import {renderCsv, renderDocx, renderJson, renderMarkdown, renderSrt, renderTxt, renderVtt} from "@/lib/exporters";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";
import {createZip} from "@/lib/zip";
import {logApiError} from "@/lib/api-logger";

const batchExportSchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1).max(100),
  format: z.enum(["txt", "srt", "vtt", "json", "md", "csv", "docx", "pdf"]).default("txt"),
  content: z.enum(["original", "translation", "bilingual"]).default("original"),
  target: z.string().optional(),
  showSpeaker: z.boolean().optional(),
  showTimestamp: z.boolean().optional(),
  subtitleMaxChars: z.number().int().min(1).max(2000).optional(),
  subtitleMaxDurationSeconds: z.number().min(0.1).max(60).optional()
});

const styles = StyleSheet.create({
  page: {padding: 36, fontSize: 11, lineHeight: 1.55, color: "#101820"},
  title: {fontSize: 20, marginBottom: 16},
  meta: {color: "#5d6870", marginBottom: 18},
  paragraph: {marginBottom: 10}
});

type BatchTranscript = Prisma.TranscriptGetPayload<{include: {mediaTask: true}}>;

function safeName(value: string) {
  return value.replace(/[^\w.\-]+/g, "_").replace(/^_+|_+$/g, "") || "transcript";
}

function uniqueName(name: string, used: Set<string>, suffix: string) {
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  const dot = name.lastIndexOf(".");
  const next = dot === -1 ? `${name}-${suffix}` : `${name.slice(0, dot)}-${suffix}${name.slice(dot)}`;
  used.add(next);
  return next;
}

function translationText(content: unknown) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (typeof content === "object" && "text" in content) return String((content as {text?: unknown}).text ?? "");
  if (typeof content === "object" && "translation" in content) return String((content as {translation?: unknown}).translation ?? "");
  return "";
}

async function renderExport(input: {
  transcript: BatchTranscript;
  format: z.infer<typeof batchExportSchema>["format"];
  content: z.infer<typeof batchExportSchema>["content"];
  target?: string;
  options?: ExportOptions;
}) {
  const translations = transcriptTranslations(input.transcript.translations);
  const translation = input.content === "original"
    ? null
    : input.target
      ? translations[input.target]
      : Object.values(translations)[0];
  const translated = translationText(translation);
  const original = transcriptText(input.transcript);
  const exportTranscript =
    input.content === "translation"
      ? {...input.transcript, editedText: translated || original, segments: [], words: null}
      : input.content === "bilingual"
        ? {...input.transcript, editedText: `${original}\n\n---\n\n${translated}`, segments: [], words: null}
        : input.transcript;

  if (input.format === "pdf") {
    const text = renderTxt(exportTranscript);
    const buffer = await renderToBuffer(
      createElement(
        Document,
        {title: input.transcript.mediaTask.originalName || "Votxt Transcript", author: "Votxt"},
        createElement(
          Page,
          {size: "A4", style: styles.page},
          createElement(Text, {style: styles.title}, input.transcript.mediaTask.originalName || "Votxt Transcript"),
          createElement(Text, {style: styles.meta}, input.transcript.mediaTask.provider || "Votxt"),
          ...text.split(/\n{2,}/).map((paragraph, index) => createElement(Text, {key: index, style: styles.paragraph}, paragraph))
        )
      )
    );
    return new Uint8Array(buffer);
  }

  if (input.format === "docx") {
    return new Uint8Array(
      await renderDocx(exportTranscript, {
        ...input.options,
        title: input.transcript.mediaTask.originalName || "Votxt Transcript",
        meta: input.transcript.mediaTask.provider || undefined
      })
    );
  }

  const body =
    input.format === "srt"
      ? renderSrt(exportTranscript, input.options)
      : input.format === "vtt"
        ? renderVtt(exportTranscript, input.options)
        : input.format === "json"
          ? renderJson(exportTranscript)
          : input.format === "md"
            ? renderMarkdown(exportTranscript, {...input.options, title: input.transcript.mediaTask.originalName || undefined, meta: input.transcript.mediaTask.provider || undefined})
            : input.format === "csv"
              ? renderCsv(exportTranscript, input.options)
              : renderTxt(exportTranscript);

  return new TextEncoder().encode(body);
}

export async function POST(request: Request) {
  try {
    const input = batchExportSchema.parse(await request.json());
    const options: ExportOptions = {
      showSpeakerName: input.showSpeaker,
      showTimestamps: input.showTimestamp,
      subtitleMaxChars: input.subtitleMaxChars,
      subtitleMaxDurationSeconds: input.subtitleMaxDurationSeconds
    };
    await Promise.all(input.taskIds.map((taskId) => assertTaskAccess(taskId, "read", request.headers)));

    const transcripts = await prisma.transcript.findMany({
      where: {mediaTaskId: {in: input.taskIds}},
      include: {mediaTask: true}
    });
    const byTaskId = new Map(transcripts.map((item) => [item.mediaTaskId, item]));
    const used = new Set<string>();
    const entries = [];

    for (const taskId of input.taskIds) {
      const transcript = byTaskId.get(taskId);
      if (!transcript) continue;
      const baseName = safeName(transcript.mediaTask.originalName || `votxt-${taskId}`);
      const suffix = input.content === "original" ? "" : `-${input.content}${input.target ? `-${input.target}` : ""}`;
      const name = uniqueName(`${baseName}${suffix}.${input.format}`, used, taskId);
      entries.push({
        name,
        data: await renderExport({transcript, format: input.format, content: input.content, target: input.target, options}),
        modifiedAt: transcript.updatedAt
      });
    }

    if (!entries.length) {
      return NextResponse.json({error: "选中的转写尚未准备好，无法导出。"}, {status: 404});
    }

    const archive = createZip(entries);
    const fileName = `votxt-batch-${new Date().toISOString().slice(0, 10)}-${input.format}.zip`;
    return new Response(new Uint8Array(archive), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`
      }
    });
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法导出选中的转写。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
