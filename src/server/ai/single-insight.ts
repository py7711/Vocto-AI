import type {Transcript} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import type {SummaryTemplate} from "@/lib/summary-template";
import {normalizeSummaryTemplate} from "@/lib/summary-template";
import {generateJsonWithFallback} from "@/server/ai/providers";

type SingleInsightTaskType = "summary" | "mind_map" | "qa";

const summaryResponseSchema = {
  overview: "string",
  bullets: [{text: "string", timestamps: [{start: "number", end: "number"}]}],
  takeaways: [{text: "string", timestamps: [{start: "number", end: "number"}]}]
};

const summaryTemplateInstructions: Record<SummaryTemplate, string> = {
  none: "Do not create a prose summary. Return an empty overview, bullets, and takeaways.",
  standard: "Create a general-purpose summary with overview (2-4 sentence synopsis), bullets (5-8 key points with transcript timestamps), and takeaways (3-5 actionable conclusions or lessons).",
  meeting: "Create meeting notes with overview (purpose and context), bullets (decisions, action items, owners, risks, and follow-ups with timestamps), and takeaways (next steps and open questions).",
  study: "Create study notes with overview (topic introduction), bullets (concepts, definitions, and examples with timestamps), and takeaways (review questions and key learnings).",
  interview: "Create an interview brief with overview (interview context), bullets (themes, candidate signals, and paraphrased quotes with timestamps), and takeaways (follow-up questions and hiring signals)."
};

function transcriptText(transcript: Transcript) {
  return transcript.editedText || transcript.plainText;
}

type TimedSegment = {start: number; end: number; text: string; speaker?: string};

// 从转写稿提取分段文本 + 每段音频起止时间，供 AI 生成带时间戳的要点分析。
function transcriptSegments(transcript: Transcript): TimedSegment[] {
  const raw = transcript.segments;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const segment = item as Record<string, unknown>;
      const start = Number(segment.start ?? 0);
      const end = Number(segment.end ?? start);
      const text = String(segment.text ?? "").trim();
      if (!text) return null;
      return {
        start: Number.isFinite(start) ? start : 0,
        end: Number.isFinite(end) ? end : 0,
        text,
        speaker: typeof segment.speaker === "string" ? segment.speaker : undefined
      };
    })
    .filter(Boolean) as TimedSegment[];
}

// 控制传给 AI 的分段体量，避免超长转写超出模型上下文。
function compactSegments(segments: TimedSegment[], maxChars = 24000): TimedSegment[] {
  const result: TimedSegment[] = [];
  let total = 0;
  for (const segment of segments) {
    total += segment.text.length;
    if (total > maxChars) break;
    result.push({start: Math.round(segment.start * 100) / 100, end: Math.round(segment.end * 100) / 100, text: segment.text, speaker: segment.speaker});
  }
  return result;
}

function fallbackSentences(text: string) {
  return text.split(/(?<=[.!?。！？])\s+/).filter(Boolean);
}

function fallbackSummary(text: string, locale: string, summaryTemplate: SummaryTemplate) {
  const sentences = fallbackSentences(text);
  const fallbackTimestamp = {start: 0, end: 0};
  const summaryPrefixes: Record<Exclude<SummaryTemplate, "none">, string> = {
    standard: locale.startsWith("zh") ? "摘要" : "Summary",
    meeting: locale.startsWith("zh") ? "会议纪要" : "Meeting notes",
    study: locale.startsWith("zh") ? "学习笔记" : "Study notes",
    interview: locale.startsWith("zh") ? "访谈简报" : "Interview brief"
  };
  return {
    overview: summaryTemplate === "none" ? "" : `${summaryPrefixes[summaryTemplate]}: ${sentences.slice(0, 5).join(" ") || text.slice(0, 800)}`,
    bullets: summaryTemplate === "none" ? [] : sentences.slice(0, 8).map((sentence) => ({text: sentence.slice(0, 180), timestamps: [fallbackTimestamp]})),
    takeaways: summaryTemplate === "none" ? [] : sentences.slice(8, 12).map((sentence) => ({text: sentence.slice(0, 180), timestamps: [fallbackTimestamp]}))
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

async function buildPayload(taskType: SingleInsightTaskType, text: string, locale: string, summaryTemplate: SummaryTemplate, segments: TimedSegment[] = []) {
  if (taskType === "summary") {
    const compactedSegments = compactSegments(segments);
    return generateJsonWithFallback(
      {
        system: "你是 Votxt 音视频转文字产品的摘要引擎。你会收到分段转写文本，每段包含 start/end（单位：秒）与 text。只返回严格 JSON，字段必须包含 overview、bullets 和 takeaways。每个 bullet 和 takeaway 必须在 timestamps 中给出其依据的音频起止时间（start/end 秒），时间要对应到传入分段的真实时间范围，方便用户点击跳转到对应音频位置。",
        user: {
          locale,
          summaryTemplate,
          summaryInstruction: summaryTemplateInstructions[summaryTemplate],
          // 优先传入带时间的分段，缺失时回退到纯文本。
          segments: compactedSegments.length ? compactedSegments : undefined,
          transcript: compactedSegments.length ? undefined : text.slice(0, 24000),
          schema: summaryResponseSchema
        }
      },
      fallbackSummary(text, locale, summaryTemplate)
    );
  }

  if (taskType === "mind_map") {
    return generateJsonWithFallback(
      {
        system: "你是 Votxt 音视频转文字产品的思维导图引擎。只返回严格 JSON，字段必须包含 label 和 children。",
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
      system: "你是 Votxt 音视频转文字产品的问答引擎。只返回严格 JSON 数组，每项包含 question 和 answer。",
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
  summaryTemplate?: string;
}) {
  const text = transcriptText(transcript);
  const normalizedTemplate = normalizeSummaryTemplate(summaryTemplate);
  const segments = taskType === "summary" ? transcriptSegments(transcript) : [];
  const {payload, model} = await buildPayload(taskType, text, locale, normalizedTemplate, segments);
  const meta = insightMeta(taskType);

  return prisma.aIInsight.upsert({
    where: {mediaTaskId_type_locale: {mediaTaskId, type: meta.type, locale}},
    update: {content: payload, model, generationCount: {increment: 1}},
    create: {mediaTaskId, type: meta.type, locale, title: meta.title, content: payload, model, generationCount: 1}
  });
}
