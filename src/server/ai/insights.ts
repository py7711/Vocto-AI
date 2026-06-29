import type {Transcript} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import {generateJsonWithFallback} from "@/server/ai/providers";
import {translateWithFallback} from "@/server/translation";

type SummaryTemplate = "none" | "standard" | "meeting" | "study" | "interview";

const summaryTemplateInstructions: Record<SummaryTemplate, string> = {
  none: "Do not create a prose summary. Return an empty summary overview and no summary bullets, but still create mindMap and qa.",
  standard: "Create a concise general-purpose summary with the most important points.",
  meeting: "Create meeting notes focused on decisions, action items, owners, risks, and follow-ups.",
  study: "Create study notes focused on concepts, definitions, examples, and review questions.",
  interview: "Create an interview brief focused on themes, quotes-as-paraphrases, candidate signals, and follow-up questions."
};

function fallbackInsights(text: string, locale: string, summaryTemplate: SummaryTemplate) {
  const sentences = text.split(/(?<=[.!?。！？])\s+/).filter(Boolean);
  const summary = sentences.slice(0, 5).join(" ");
  const summaryPrefixes: Record<Exclude<SummaryTemplate, "none">, string> = {
    standard: locale.startsWith("zh") ? "摘要" : "Summary",
    meeting: locale.startsWith("zh") ? "会议纪要" : "Meeting notes",
    study: locale.startsWith("zh") ? "学习笔记" : "Study notes",
    interview: locale.startsWith("zh") ? "访谈简报" : "Interview brief"
  };
  const topics = sentences.slice(0, 6).map((sentence, index) => ({
    id: `topic-${index + 1}`,
    label: sentence.slice(0, 80),
    children: []
  }));

  return {
    summary: {
      overview: summaryTemplate === "none" ? "" : `${summaryPrefixes[summaryTemplate]}: ${summary || text.slice(0, 800)}`,
      bullets: summaryTemplate === "none" ? [] : sentences.slice(0, 8).map((sentence) => sentence.slice(0, 180))
    },
    mindMap: {
      label: locale.startsWith("zh") ? "核心内容" : "Core ideas",
      children: topics
    },
    qa: sentences.slice(0, 6).map((sentence, index) => ({
      question: locale.startsWith("zh") ? `要点 ${index + 1} 是什么？` : `What is point ${index + 1}?`,
      answer: sentence
    })),
    translation: {
      target: locale,
      text
    }
  };
}

export async function generateInsights(
  mediaTaskId: string,
  transcript: Transcript,
  locale: string,
  translationTarget = locale,
  summaryTemplate: SummaryTemplate = "standard"
) {
  const text = transcript.editedText || transcript.plainText;
  const fallbackPayload = fallbackInsights(text, locale, summaryTemplate);
  const {payload, model} = await generateJsonWithFallback(
    {
      system: "你是 UniScribe 音视频转文字产品的 AI 洞察引擎，帮助用户整理摘要、思维导图和问答。只返回严格 JSON，字段必须包含 summary、mindMap、qa。",
      user: {
        locale,
        summaryTemplate,
        summaryInstruction: summaryTemplateInstructions[summaryTemplate],
        transcript: text.slice(0, 24000),
        schema: {
          summary: {overview: "string", bullets: ["string"]},
          mindMap: {label: "string", children: [{label: "string", children: []}]},
          qa: [{question: "string", answer: "string"}]
        }
      }
    },
    {
      summary: fallbackPayload.summary,
      mindMap: fallbackPayload.mindMap,
      qa: fallbackPayload.qa
    }
  );

  const translation = await translateWithFallback({
    text: text.slice(0, 24000),
    targetLocale: translationTarget,
    sourceLocale: locale
  });
  const finalPayload = {
    ...payload,
    translation: {
      target: translationTarget,
      provider: translation.provider,
      text: translation.text
    }
  };

  const records = await prisma.$transaction([
    prisma.aIInsight.upsert({
      where: {mediaTaskId_type_locale: {mediaTaskId, type: "SUMMARY", locale}},
      update: {content: finalPayload.summary, model},
      create: {mediaTaskId, type: "SUMMARY", locale, title: "Summary", content: finalPayload.summary, model}
    }),
    prisma.aIInsight.upsert({
      where: {mediaTaskId_type_locale: {mediaTaskId, type: "MIND_MAP", locale}},
      update: {content: finalPayload.mindMap, model},
      create: {mediaTaskId, type: "MIND_MAP", locale, title: "Mind map", content: finalPayload.mindMap, model}
    }),
    prisma.aIInsight.upsert({
      where: {mediaTaskId_type_locale: {mediaTaskId, type: "QA", locale}},
      update: {content: finalPayload.qa, model},
      create: {mediaTaskId, type: "QA", locale, title: "Q&A", content: finalPayload.qa, model}
    }),
    prisma.aIInsight.upsert({
      where: {mediaTaskId_type_locale: {mediaTaskId, type: "TRANSLATION", locale}},
      update: {content: finalPayload.translation, model: translation.provider},
      create: {mediaTaskId, type: "TRANSLATION", locale, title: "Translation", content: finalPayload.translation, model: translation.provider}
    })
  ]);

  return records;
}
