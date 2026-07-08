import {Document, Page, StyleSheet, Text, renderToBuffer} from "@react-pdf/renderer";
import {NextResponse} from "next/server";
import {createElement} from "react";
import {parseExportOptions, renderCsv, renderDocx, renderJson, renderMarkdown, renderSrt, renderTxt, renderVtt} from "@/lib/exporters";
import {getPublicShare} from "@/lib/share-links";

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

export async function GET(request: Request, {params}: {params: {token: string; format: string}}) {
  try {
    const format = params.format.toLowerCase();
    if (!contentTypes[format]) {
      return NextResponse.json({error: "不支持的导出格式。"}, {status: 400});
    }

    const share = await getPublicShare(params.token);
    if (!share) {
      return NextResponse.json({error: "分享链接不可用或已过期。"}, {status: 404});
    }

    const task = share.mediaTask;
    const transcript = task.transcript;
    if (!transcript) {
      return NextResponse.json({error: "转写文本尚未准备好。"}, {status: 404});
    }

    const exportOptions = parseExportOptions(new URL(request.url));
    const baseName = (task.originalName || `uniscribe-share-${share.id}`).replace(/[^\w.\-]+/g, "_");
    const fileName = `${baseName}.${format}`;
    const title = task.originalName || share.title || "UniScribe Transcript";
    const meta = task.provider || undefined;

    if (format === "pdf") {
      const text = renderTxt(transcript);
      const buffer = await renderToBuffer(
        createElement(
          Document,
          {title, author: "UniScribe"},
          createElement(
            Page,
            {size: "A4", style: styles.page},
            createElement(Text, {style: styles.title}, title),
            ...(meta ? [createElement(Text, {key: "meta", style: styles.meta}, meta)] : []),
            ...text.split(/\n{2,}/).map((paragraph, index) => createElement(Text, {key: index, style: styles.paragraph}, paragraph))
          )
        )
      );
      return new Response(new Uint8Array(buffer), {
        headers: {"Content-Type": contentTypes.pdf, "Content-Disposition": `attachment; filename="${fileName}"`}
      });
    }

    if (format === "docx") {
      const buffer = await renderDocx(transcript, {...exportOptions, title, meta});
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
              ? renderMarkdown(transcript, {...exportOptions, title, meta})
              : format === "csv"
                ? renderCsv(transcript, exportOptions)
                : renderTxt(transcript);

    return new Response(body, {
      headers: {"Content-Type": contentTypes[format], "Content-Disposition": `attachment; filename="${fileName}"`}
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法导出分享转写。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
