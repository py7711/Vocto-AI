import {Document, Page, StyleSheet, Text, renderToBuffer} from "@react-pdf/renderer";
import {NextResponse} from "next/server";
import {createElement} from "react";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";
import {buildOutline, renderOutlineDocx, renderOutlineJson, renderOutlineMarkdown, renderOutlineText} from "@/lib/outline-exporters";
import {logApiError} from "@/lib/api-logger";

const contentTypes: Record<string, string> = {
  md: "text/markdown; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  json: "application/json; charset=utf-8",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf"
};

const styles = StyleSheet.create({
  page: {padding: 36, fontSize: 11, lineHeight: 1.55, color: "#101820"},
  title: {fontSize: 20, marginBottom: 14},
  meta: {color: "#5d6870", marginBottom: 16},
  heading: {fontSize: 14, marginTop: 10, marginBottom: 6},
  paragraph: {marginBottom: 5}
});

export async function GET(request: Request, {params}: {params: {taskId: string; format: string}}) {
  try {
    await assertTaskAccess(params.taskId, "read", request.headers);
    const format = params.format.toLowerCase();
    if (!contentTypes[format]) {
      return NextResponse.json({error: "不支持的大纲导出格式。"}, {status: 400});
    }

    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      select: {
        id: true,
        originalName: true,
        provider: true,
        insights: {
          where: {type: {in: ["SUMMARY", "MIND_MAP", "QA"]}},
          select: {type: true, content: true}
        }
      }
    });
    if (!task) {
      return NextResponse.json({error: "转写任务不存在。"}, {status: 404});
    }

    const outline = buildOutline({
      title: task.originalName || `votxt-${task.id}`,
      provider: task.provider,
      insights: task.insights
    });
    if (!outline.sections.length) {
      return NextResponse.json({error: "请先生成 AI 洞察，再导出大纲。"}, {status: 409});
    }

    const baseName = (task.originalName || `votxt-${task.id}`).replace(/[^\w.\-]+/g, "_");
    const fileName = `${baseName}-outline.${format}`;

    if (format === "docx") {
      const buffer = await renderOutlineDocx(outline);
      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type": contentTypes.docx,
          "Content-Disposition": `attachment; filename="${fileName}"`
        }
      });
    }

    if (format === "pdf") {
      const buffer = await renderToBuffer(
        createElement(
          Document,
          {title: outline.title, author: "Votxt"},
          createElement(
            Page,
            {size: "A4", style: styles.page},
            createElement(Text, {style: styles.title}, outline.title),
            outline.provider ? createElement(Text, {style: styles.meta}, outline.provider) : null,
            ...outline.sections.flatMap((section) => [
              createElement(Text, {key: `${section.title}-heading`, style: styles.heading}, section.title),
              ...section.lines.map((line, index) => createElement(Text, {key: `${section.title}-${index}`, style: styles.paragraph}, line))
            ])
          )
        )
      );
      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type": contentTypes.pdf,
          "Content-Disposition": `attachment; filename="${fileName}"`
        }
      });
    }

    const body = format === "json" ? renderOutlineJson(outline) : format === "txt" ? renderOutlineText(outline) : renderOutlineMarkdown(outline);
    return new Response(body, {
      headers: {
        "Content-Type": contentTypes[format],
        "Content-Disposition": `attachment; filename="${fileName}"`
      }
    });
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法导出大纲。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
