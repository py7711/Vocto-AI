import {Document, Page, StyleSheet, Text, renderToBuffer} from "@react-pdf/renderer";
import {NextResponse} from "next/server";
import {createElement} from "react";
import {prisma} from "@/lib/prisma";
import {parseExportOptions, renderCsv, renderDocx, renderJson, renderMarkdown, renderSrt, renderTxt, renderVtt} from "@/lib/exporters";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";

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

export async function GET(request: Request, {params}: {params: {taskId: string; format: string}}) {
  try {
    await assertTaskAccess(params.taskId, "read", request.headers);
    const format = params.format.toLowerCase();
    if (!contentTypes[format]) {
      return NextResponse.json({error: "不支持的导出格式。"}, {status: 400});
    }

    const exportOptions = parseExportOptions(new URL(request.url));
    const transcript = await prisma.transcript.findUnique({
      where: {mediaTaskId: params.taskId},
      include: {mediaTask: true}
    });
    if (!transcript) return NextResponse.json({error: "转写文本尚未准备好。"}, {status: 404});

    const baseName = (transcript.mediaTask.originalName || `uniscribe-${params.taskId}`).replace(/[^\w.\-]+/g, "_");
    const fileName = `${baseName}.${format}`;

    if (format === "pdf") {
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
      return new Response(new Uint8Array(buffer), {
        headers: {"Content-Type": contentTypes.pdf, "Content-Disposition": `attachment; filename="${fileName}"`}
      });
    }

    if (format === "docx") {
      const buffer = await renderDocx(transcript, {
        ...exportOptions,
        title: transcript.mediaTask.originalName || "UniScribe Transcript",
        meta: transcript.mediaTask.provider || undefined
      });
      return new Response(new Uint8Array(buffer), {
        headers: {"Content-Type": contentTypes.docx, "Content-Disposition": `attachment; filename="${fileName}"`}
      });
    }

    const body =
      format === "srt"
        ? renderSrt(transcript, exportOptions)
        : format === "vtt"
          ? renderVtt(transcript, exportOptions)
          : format === "json"
            ? renderJson(transcript)
            : format === "md"
              ? renderMarkdown(transcript, {...exportOptions, title: transcript.mediaTask.originalName || undefined, meta: transcript.mediaTask.provider || undefined})
              : format === "csv"
                ? renderCsv(transcript, exportOptions)
                : renderTxt(transcript);

    return new Response(body, {
      headers: {"Content-Type": contentTypes[format], "Content-Disposition": `attachment; filename="${fileName}"`}
    });
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法导出转写。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
