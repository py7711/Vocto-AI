import {Prisma, type Transcript} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import type {SummaryTemplate} from "@/lib/summary-template";
import {normalizeSummaryTemplate} from "@/lib/summary-template";
import {generateJsonWithFallback} from "@/server/ai/providers";
import {compactTimedSegments, fallbackSummary, sanitizeSummaryTimestamps, splitSummarySentences, transcriptTimedSegments, type TimedSegment} from "@/server/ai/summary-source";
import {translateWithFallback} from "@/server/translation";
import {transcriptText} from "@/lib/transcript-content";
import {setTranscriptTranslation} from "@/server/transcript-translations";

const summaryResponseSchema = {
  overview: "string",
  bullets: [{text: "string", timestamps: [{start: "number", end: "number"}]}],
  takeaways: [{text: "string", timestamps: [{start: "number", end: "number"}]}]
};

const summaryTemplateInstructions: Record<SummaryTemplate, string> = {
  none: "Do not create a prose summary. Return an empty overview, bullets, and takeaways, but still create mindMap.",
  standard: "Create a general-purpose summary with overview (2-4 sentence synopsis), bullets (5-8 key points with transcript timestamps), and takeaways (3-5 actionable conclusions or lessons).",
  meeting: "Create meeting notes with overview (purpose and context), bullets (decisions, action items, owners, risks, and follow-ups with timestamps), and takeaways (next steps and open questions).",
  study: "Create study notes with overview (topic introduction), bullets (concepts, definitions, and examples with timestamps), and takeaways (review questions and key learnings).",
  interview: "Create an interview brief with overview (interview context), bullets (themes, candidate signals, and paraphrased quotes with timestamps), and takeaways (follow-up questions and hiring signals)."
};

function fallbackInsights(text: string, locale: string, summaryTemplate: SummaryTemplate, segments: TimedSegment[] = []) {
  const sentences = splitSummarySentences(text);
  const topics = sentences.slice(0, 6).map((sentence, index) => ({
    id: `topic-${index + 1}`,
    label: sentence.slice(0, 80),
    children: []
  }));

  return {
    summary: fallbackSummary(text, locale, summaryTemplate, segments),
    mindMap: {
      label: locale.startsWith("zh") ? "核心内容" : "Core ideas",
      children: topics
    },
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
  summaryTemplateInput: string = "standard",
  incrementSummaryGenerationCount = true
) {
  const summaryTemplate = normalizeSummaryTemplate(summaryTemplateInput);
  const text = transcriptText(transcript);
  const segments = compactTimedSegments(transcriptTimedSegments(transcript.segments));
  const fallbackPayload = fallbackInsights(text, locale, summaryTemplate, segments);
  const {payload, model} = await generateJsonWithFallback(
    {
      system: "你是 Votxt 音视频转文字产品的 AI 洞察引擎，帮助用户整理摘要和思维导图。你会收到分段转写文本，每段包含 start/end（单位：秒）与 text。只返回严格 JSON，字段必须包含 summary 和 mindMap。每个摘要 bullet 和 takeaway 必须给出对应原文的真实时间范围。",
      user: {
        locale,
        summaryTemplate,
        summaryInstruction: summaryTemplateInstructions[summaryTemplate],
        segments: segments.length ? segments : undefined,
        transcript: segments.length ? undefined : text.slice(0, 24000),
        schema: {
          summary: summaryResponseSchema,
          mindMap: {label: "string", children: [{label: "string", children: []}]}
        }
      }
    },
    {
      summary: fallbackPayload.summary,
      mindMap: fallbackPayload.mindMap
    }
  );

  const translation = await translateWithFallback({
    text: text.slice(0, 24000),
    targetLocale: translationTarget,
    sourceLocale: locale
  });
  const finalPayload = {
    ...payload,
    summary: sanitizeSummaryTimestamps(payload.summary, segments),
    translation: {
      target: translationTarget,
      provider: translation.provider,
      text: translation.text
    }
  };

  await prisma.$transaction(async (transaction) => {
    await transaction.transcript.update({
      where: {mediaTaskId},
      data: {
        summary: summaryTemplate === "none" ? Prisma.DbNull : finalPayload.summary,
        mindMap: finalPayload.mindMap,
        ...(summaryTemplate === "none" || !incrementSummaryGenerationCount ? {} : {summaryGenerationCount: {increment: 1}})
      }
    });
    await setTranscriptTranslation(mediaTaskId, translationTarget, finalPayload.translation, transaction);
  });

  return {...finalPayload, model};
}
