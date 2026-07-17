import type {Transcript} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import type {SummaryTemplate} from "@/lib/summary-template";
import {normalizeSummaryTemplate} from "@/lib/summary-template";
import {generateJsonWithFallback} from "@/server/ai/providers";
import {compactTimedSegments, fallbackSummary, sanitizeSummaryTimestamps, transcriptTimedSegments, type TimedSegment} from "@/server/ai/summary-source";
import {transcriptText} from "@/lib/transcript-content";

type SingleInsightTaskType = "summary" | "mind_map";

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

function fallbackSentences(text: string) {
  return text.split(/(?<=[.!?。！？])\s+/).filter(Boolean);
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

function insightMeta(taskType: SingleInsightTaskType) {
  if (taskType === "summary") return {type: "SUMMARY" as const, title: "Summary"};
  return {type: "MIND_MAP" as const, title: "Mind map"};
}

async function buildPayload(taskType: SingleInsightTaskType, text: string, locale: string, summaryTemplate: SummaryTemplate, segments: TimedSegment[] = []) {
  if (taskType === "summary") {
    const compactedSegments = compactTimedSegments(segments);
    const result = await generateJsonWithFallback(
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
      fallbackSummary(text, locale, summaryTemplate, compactedSegments)
    );
    return {...result, payload: sanitizeSummaryTimestamps(result.payload, compactedSegments)};
  }

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
  const segments = taskType === "summary" ? transcriptTimedSegments(transcript.segments) : [];
  const {payload, model} = await buildPayload(taskType, text, locale, normalizedTemplate, segments);
  const meta = insightMeta(taskType);
  const data = taskType === "summary" ? {summary: payload} : {mindMap: payload};
  await prisma.transcript.update({where: {mediaTaskId}, data});
  return {taskType, type: meta.type, locale, content: payload, model};
}
