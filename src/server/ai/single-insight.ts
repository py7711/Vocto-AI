import type {Transcript} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import {generateJsonWithFallback} from "@/server/ai/providers";

type SingleInsightTaskType = "summary" | "mind_map" | "qa";
type SummaryTemplate = "none" | "standard" | "meeting" | "study" | "interview";

const summaryTemplateInstructions: Record<SummaryTemplate, string> = {
  none: "Do not create a prose summary. Return an empty summary overview and no summary bullets.",
  standard: "Create a concise general-purpose summary with the most important points.",
  meeting: "Create meeting notes focused on decisions, action items, owners, risks, and follow-ups.",
  study: "Create study notes focused on concepts, definitions, examples, and review questions.",
  interview: "Create an interview brief focused on themes, quotes-as-paraphrases, candidate signals, and follow-up questions."
};

function transcriptText(transcript: Transcript) {
  return transcript.editedText || transcript.plainText;
}

function fallbackSentences(text: string) {
  return text.split(/(?<=[.!?。！？])\s+/).filter(Boolean);
}

function fallbackSummary(text: string, locale: string, summaryTemplate: SummaryTemplate) {
  const sentences = fallbackSentences(text);
  const summaryPrefixes: Record<Exclude<SummaryTemplate, "none">, string> = {
    standard: locale.startsWith("zh") ? "摘要" : "Summary",
    meeting: locale.startsWith("zh") ? "会议纪要" : "Meeting notes",
    study: locale.startsWith("zh") ? "学习笔记" : "Study notes",
    interview: locale.startsWith("zh") ? "访谈简报" : "Interview brief"
  };
  return {
    overview: summaryTemplate === "none" ? "" : `${summaryPrefixes[summaryTemplate]}: ${sentences.slice(0, 5).join(" ") || text.slice(0, 800)}`,
    bullets: summaryTemplate === "none" ? [] : sentences.slice(0, 8).map((sentence) => sentence.slice(0, 180))
  };
}

function fallbackMindMap(text: string, locale: string) {
  return {
    label: locale.startsWith("zh") ? "核心内容" : "Core ideas",
    children: fallbackSentences(text).slice(0, 6).map((sentence, index) => ({
      id: `topic-${index + 1}`,
      label: sentence.slice(0, 80),
      children: []
    }))
  };
}

function fallbackQa(text: string, locale: string) {
  return fallbackSentences(text).slice(0, 6).map((sentence, index) => ({
    question: locale.startsWith("zh") ? `要点 ${index + 1} 是什么？` : `What is point ${index + 1}?`,
    answer: sentence
  }));
}

function insightMeta(taskType: SingleInsightTaskType) {
  if (taskType === "summary") return {type: "SUMMARY" as const, title: "Summary"};
  if (taskType === "mind_map") return {type: "MIND_MAP" as const, title: "Mind map"};
  return {type: "QA" as const, title: "Q&A"};
}

async function buildPayload(taskType: SingleInsightTaskType, text: string, locale: string, summaryTemplate: SummaryTemplate) {
  if (taskType === "summary") {
    return generateJsonWithFallback(
      {
        system: "你是 UniScribe 音视频转文字产品的摘要引擎。只返回严格 JSON，字段必须包含 overview 和 bullets。",
        user: {
          locale,
          summaryTemplate,
          summaryInstruction: summaryTemplateInstructions[summaryTemplate],
          transcript: text.slice(0, 24000),
          schema: {overview: "string", bullets: ["string"]}
        }
      },
      fallbackSummary(text, locale, summaryTemplate)
    );
  }

  if (taskType === "mind_map") {
    return generateJsonWithFallback(
      {
        system: "你是 UniScribe 音视频转文字产品的思维导图引擎。只返回严格 JSON，字段必须包含 label 和 children。",
        user: {
          locale,
          transcript: text.slice(0, 24000),
          schema: {label: "string", children: [{label: "string", children: []}]}
        }
      },
      fallbackMindMap(text, locale)
    );
  }

  return generateJsonWithFallback(
    {
      system: "你是 UniScribe 音视频转文字产品的问答引擎。只返回严格 JSON 数组，每项包含 question 和 answer。",
      user: {
        locale,
        transcript: text.slice(0, 24000),
        schema: [{question: "string", answer: "string"}]
      }
    },
    fallbackQa(text, locale)
  );
}

export async function generateSingleInsight({
  mediaTaskId,
  transcript,
  taskType,
  locale,
  summaryTemplate = "standard"
}: {
  mediaTaskId: string;
  transcript: Transcript;
  taskType: SingleInsightTaskType;
  locale: string;
  summaryTemplate?: SummaryTemplate;
}) {
  const text = transcriptText(transcript);
  const {payload, model} = await buildPayload(taskType, text, locale, summaryTemplate);
  const meta = insightMeta(taskType);

  return prisma.aIInsight.upsert({
    where: {mediaTaskId_type_locale: {mediaTaskId, type: meta.type, locale}},
    update: {content: payload, model},
    create: {mediaTaskId, type: meta.type, locale, title: meta.title, content: payload, model}
  });
}
