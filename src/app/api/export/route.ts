import {Document, Page, StyleSheet, Text, renderToBuffer} from "@react-pdf/renderer";
import {NextResponse} from "next/server";
import {createElement} from "react";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {renderCsv, renderDocx, renderJson, renderMarkdown, renderSrt, renderTxt, renderVtt} from "@/lib/exporters";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";

const exportSchema = z.object({
  fileId: z.string().min(1),
  transcriptionId: z.string().optional(),
  fileType: z.enum(["txt", "srt", "vtt", "json", "md", "csv", "docx", "pdf"]).default("txt"),
  showSpeakerName: z.boolean().optional(),
  showTimestamps: z.boolean().optional(),
  subtitleMaxChars: z.number().int().min(1).max(2000).optional(),
  subtitleMaxDurationSeconds: z.number().min(0.1).max(60).optional()
});

const contentTypes: Record<string, string> = {
  txt: "text/plain; charset=utf-8",
  srt: "application/x-subrip; charset=utf-8",
  vtt: "text/vtt; charset=utf-8",
  json: "application/json; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  csv: "text/csv; charset=utf-8",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf"
};

const styles = StyleSheet.create({
  page: {padding: 36, fontSize: 11, lineHeight: 1.55, color: "#101820"},
  title: {fontSize: 20, marginBottom: 16},
  meta: {color: "#5d6870", marginBottom: 18},
  paragraph: {marginBottom: 10}
});

export async function POST(request: Request) {
  try {
    const input = exportSchema.parse(await request.json().catch(() => ({})));
    const taskId = input.transcriptionId ?? input.fileId;
    await assertTaskAccess(taskId, "read", request.headers);
    const transcript = await prisma.transcript.findUnique({where: {mediaTaskId: taskId}, include: {mediaTask: true}});
    if (!transcript) return NextResponse.json({error: "转写文本尚未准备好。"}, {status: 404});
    const options = {
      showSpeakerName: input.showSpeakerName,
      showTimestamps: input.showTimestamps,
      subtitleMaxChars: input.subtitleMaxChars,
      subtitleMaxDurationSeconds: input.subtitleMaxDurationSeconds
    };
    const baseName = (transcript.mediaTask.originalName || `uniscribe-${taskId}`).replace(/[^\w.\-]+/g, "_");
    const fileName = `${baseName}.${input.fileType}`;

    if (input.fileType === "pdf") {
      const text = renderTxt(transcript);
      const buffer = await renderToBuffer(
        createElement(
          Document,
          {title: baseName, author: "UniScribe"},
          createElement(
            Page,
            {size: "A4", style: styles.page},
            createElement(Text, {style: styles.title}, transcript.mediaTask.originalName || "UniScribe Transcript"),
            createElement(Text, {style: styles.meta}, transcript.mediaTask.provider || "UniScribe"),
            ...text.split(/\n{2,}/).map((paragraph, index) => createElement(Text, {key: index, style: styles.paragraph}, paragraph))
          )
        )
      );
      return new Response(new Uint8Array(buffer), {headers: {"Content-Type": contentTypes.pdf, "Content-Disposition": `attachment; filename="${fileName}"`}});
    }
    if (input.fileType === "docx") {
      const buffer = await renderDocx(transcript, {...options, title: transcript.mediaTask.originalName || "UniScribe Transcript", meta: transcript.mediaTask.provider || undefined});
      return new Response(new Uint8Array(buffer), {headers: {"Content-Type": contentTypes.docx, "Content-Disposition": `attachment; filename="${fileName}"`}});
    }

    const body =
      input.fileType === "srt"
        ? renderSrt(transcript, options)
        : input.fileType === "vtt"
          ? renderVtt(transcript, options)
          : input.fileType === "json"
            ? renderJson(transcript)
            : input.fileType === "md"
              ? renderMarkdown(transcript, {...options, title: transcript.mediaTask.originalName || undefined, meta: transcript.mediaTask.provider || undefined})
              : input.fileType === "csv"
                ? renderCsv(transcript, options)
                : renderTxt(transcript);

    return new Response(body, {headers: {"Content-Type": contentTypes[input.fileType], "Content-Disposition": `attachment; filename="${fileName}"`}});
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    return NextResponse.json({error: error instanceof Error ? error.message : "无法导出转写。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
