import Groq from "groq-sdk";
import type {Transcript} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import {env} from "@/lib/env";

function fallbackInsights(text: string, locale: string) {
  const sentences = text.split(/(?<=[.!?。！？])\s+/).filter(Boolean);
  const summary = sentences.slice(0, 5).join(" ");
  const topics = sentences.slice(0, 6).map((sentence, index) => ({
    id: `topic-${index + 1}`,
    label: sentence.slice(0, 80),
    children: []
  }));

  return {
    summary: {
      overview: summary || text.slice(0, 800),
      bullets: sentences.slice(0, 8).map((sentence) => sentence.slice(0, 180))
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
  translationTarget = locale
) {
  const text = transcript.editedText || transcript.plainText;
  let payload = fallbackInsights(text, locale);
  let model = "local-fallback";

  if (env.GROQ_API_KEY) {
    const groq = new Groq({apiKey: env.GROQ_API_KEY});
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      response_format: {type: "json_object"},
      messages: [
        {
          role: "system",
          content:
            "You create concise SaaS transcript insights. Return strict JSON with summary, mindMap, qa, translation."
        },
        {
          role: "user",
          content: JSON.stringify({
            locale,
            translationTarget,
            transcript: text.slice(0, 24000),
            schema: {
              summary: {overview: "string", bullets: ["string"]},
              mindMap: {label: "string", children: [{label: "string", children: []}]},
              qa: [{question: "string", answer: "string"}],
              translation: {target: "string", text: "string"}
            }
          })
        }
      ]
    });

    const content = completion.choices[0]?.message.content;
    if (content) {
      payload = JSON.parse(content);
      model = "groq/llama-3.1-70b-versatile";
    }
  }

  const records = await prisma.$transaction([
    prisma.aIInsight.upsert({
      where: {mediaTaskId_type_locale: {mediaTaskId, type: "SUMMARY", locale}},
      update: {content: payload.summary, model},
      create: {mediaTaskId, type: "SUMMARY", locale, title: "Summary", content: payload.summary, model}
    }),
    prisma.aIInsight.upsert({
      where: {mediaTaskId_type_locale: {mediaTaskId, type: "MIND_MAP", locale}},
      update: {content: payload.mindMap, model},
      create: {mediaTaskId, type: "MIND_MAP", locale, title: "Mind map", content: payload.mindMap, model}
    }),
    prisma.aIInsight.upsert({
      where: {mediaTaskId_type_locale: {mediaTaskId, type: "QA", locale}},
      update: {content: payload.qa, model},
      create: {mediaTaskId, type: "QA", locale, title: "Q&A", content: payload.qa, model}
    }),
    prisma.aIInsight.upsert({
      where: {mediaTaskId_type_locale: {mediaTaskId, type: "TRANSLATION", locale}},
      update: {content: payload.translation, model},
      create: {mediaTaskId, type: "TRANSLATION", locale, title: "Translation", content: payload.translation, model}
    })
  ]);

  return records;
}
