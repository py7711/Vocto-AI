import {Document, Page, StyleSheet, Text, renderToBuffer} from "@react-pdf/renderer";
import {NextResponse} from "next/server";
import {createElement} from "react";
import {z} from "zod";
import {buildOutline, renderOutlineDocx, renderOutlineJson, renderOutlineMarkdown, renderOutlineText} from "@/lib/outline-exporters";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";

const schema = z.object({
  transcriptionId: z.string().min(1),
  format: z.enum(["md", "txt", "json", "docx", "pdf"]).default("md")
});

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
  meta: {color: "#5d6870", marginBottom: 18},
  section: {fontSize: 14, marginTop: 12, marginBottom: 6},
  line: {marginBottom: 5}
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json().catch(() => ({})));
    await assertTaskAccess(input.transcriptionId, "read", request.headers);
    const task = await prisma.mediaTask.findUnique({
      where: {id: input.transcriptionId},
      include: {insights: true}
    });
    if (!task) return NextResponse.json({error: "转写任务不存在。"}, {status: 404});
    const outline = buildOutline({
      title: task.originalName || "Votxt Outline",
      provider: task.provider || undefined,
      insights: task.insights
    });
    if (!outline.sections.length) return NextResponse.json({error: "请先生成 AI 洞察，再导出大纲。"}, {status: 409});
    const baseName = (task.originalName || `votxt-${input.transcriptionId}`).replace(/[^\w.\-]+/g, "_");
    const fileName = `${baseName}-outline.${input.format}`;
    if (input.format === "docx") {
      const buffer = await renderOutlineDocx(outline);
      return new Response(new Uint8Array(buffer), {headers: {"Content-Type": contentTypes.docx, "Content-Disposition": `attachment; filename="${fileName}"`}});
    }
    if (input.format === "pdf") {
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
              createElement(Text, {key: `${section.title}-h`, style: styles.section}, section.title),
              ...section.lines.map((line, index) => createElement(Text, {key: `${section.title}-${index}`, style: styles.line}, line))
            ])
          )
        )
      );
      return new Response(new Uint8Array(buffer), {headers: {"Content-Type": contentTypes.pdf, "Content-Disposition": `attachment; filename="${fileName}"`}});
    }
    const body = input.format === "json" ? renderOutlineJson(outline) : input.format === "txt" ? renderOutlineText(outline) : renderOutlineMarkdown(outline);
    return new Response(body, {headers: {"Content-Type": contentTypes[input.format], "Content-Disposition": `attachment; filename="${fileName}"`}});
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    return NextResponse.json({error: error instanceof Error ? error.message : "无法导出大纲。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
