import {z} from "zod";
import {env} from "@/lib/env";
import type {SummaryTemplateInput} from "@/lib/summary-template";
import {normalizeTranscriptParagraphs} from "./segments";
import type {TranscriptionResult} from "./types";

const timestampSchema = z.object({
  start: z.number().finite().nonnegative(),
  end: z.number().finite().nonnegative()
});

const summaryItemSchema = z.object({
  text: z.string().min(1),
  timestamps: z.array(timestampSchema)
});

type MindMapNode = {label: string; children: MindMapNode[]};
const mindMapNodeSchema: z.ZodType<MindMapNode, z.ZodTypeDef, unknown> = z.lazy(() => z.object({
  label: z.string().min(1),
  children: z.array(mindMapNodeSchema).default([])
}));

const videoAnalysisSchema = z.object({
  language: z.string().min(1),
  durationSeconds: z.number().finite().positive(),
  segments: z.array(z.object({
    start: z.number().finite().nonnegative(),
    end: z.number().finite().nonnegative(),
    speaker: z.string().min(1).optional(),
    text: z.string().min(1)
  })).min(1),
  summary: z.object({
    overview: z.string(),
    bullets: z.array(summaryItemSchema),
    takeaways: z.array(summaryItemSchema)
  }),
  mindMap: mindMapNodeSchema
});

export type GeminiVideoRequest = {
  videoUrl: string;
  expectedDurationSeconds?: number;
  language?: string;
  enableSpeakerLabels: boolean;
  summaryTemplate: SummaryTemplateInput;
  summaryLanguage?: string;
};

type GenerateInput = {model: string; videoUrl: string; prompt: string};
type Generate = (input: GenerateInput) => Promise<unknown>;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Gemini 视频分析超过 ${Math.ceil(timeoutMs / 1000)} 秒后超时。`)), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

const summaryInstructions: Record<SummaryTemplateInput, string> = {
  none: "Do not create a prose summary. Return empty overview, bullets, and takeaways, but still create the mind map.",
  standard: "Create a general summary with the main ideas and actionable takeaways.",
  meeting: "Create meeting notes covering decisions, action items, owners, risks, follow-ups, and open questions.",
  study: "Create study notes covering concepts, definitions, examples, key learnings, and review points.",
  course_lecture: "Create course notes covering concepts, definitions, examples, key learnings, and review points.",
  interview: "Create an interview brief covering themes, speaker viewpoints, notable statements, and follow-up questions.",
  podcast: "Create podcast show notes covering discussion themes, speaker viewpoints, notable statements, and takeaways."
};

function buildPrompt(input: GeminiVideoRequest) {
  const transcriptLanguage = !input.language || input.language === "auto"
    ? "the video's original spoken language"
    : input.language;
  const summaryLanguage = input.summaryLanguage || transcriptLanguage;
  const speakerInstruction = input.enableSpeakerLabels
    ? "Identify speakers consistently. Use visible names when certain; otherwise use Speaker 1, Speaker 2, and so on."
    : "Speaker labels are optional.";
  const durationInstruction = input.expectedDurationSeconds
    ? `- The verified video duration is ${input.expectedDurationSeconds} seconds. This is a hard upper bound: every segment and summary timestamp must be between 0 and ${input.expectedDurationSeconds}.`
    : "- Determine the complete video duration and never return a timestamp beyond it.";

  return `Analyze the complete video in one pass. Return only valid JSON with no Markdown.

Requirements:
- Produce a complete, verbatim transcript in ${transcriptLanguage}; do not summarize or omit spoken content.
- Organize the transcript into readable, topic-coherent paragraphs of 2-5 complete sentences, usually covering 20-45 seconds.
- Do not return one segment per sentence. Start a new segment only for a speaker change, a clear topic shift, a meaningful pause, or when the paragraph reaches 5 sentences or 45 seconds.
- Do not put the whole transcript into one segment. Each segment must contain the exact verbatim speech for that paragraph with precise start/end timestamps in seconds.
- ${speakerInstruction}
${durationInstruction}
- Produce the summary in ${summaryLanguage} using this selected template: ${input.summaryTemplate}.
- ${summaryInstructions[input.summaryTemplate]}
- Every summary bullet and takeaway must cite one or more relevant timestamp ranges.
- Create a hierarchical mind map of the complete video.
- Every mind map node must contain a children array. Use an empty array for leaf nodes.

JSON schema:
{
  "language": "BCP-47 language code",
  "durationSeconds": 123.4,
  "segments": [{"start": 0, "end": 8.2, "speaker": "Speaker 1", "text": "..."}],
  "summary": {
    "overview": "...",
    "bullets": [{"text": "...", "timestamps": [{"start": 0, "end": 8.2}]}],
    "takeaways": [{"text": "...", "timestamps": [{"start": 0, "end": 8.2}]}]
  },
  "mindMap": {"label": "...", "children": [{"label": "...", "children": []}]}
}`;
}

function normalizeDuration(input: number | undefined) {
  return Number.isFinite(input) && Number(input) > 0 ? Number(input) : undefined;
}

function fitSummaryTimestamps(
  timestamps: Array<{start: number; end: number}>,
  durationSeconds: number
) {
  return timestamps.flatMap((timestamp) => {
    if (timestamp.start >= durationSeconds) return [];
    const end = Math.min(timestamp.end, durationSeconds);
    return end > timestamp.start ? [{start: timestamp.start, end}] : [];
  });
}

async function defaultGenerate(input: GenerateInput): Promise<unknown> {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY 未配置。");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${input.model}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: "POST",
      signal: AbortSignal.timeout(env.GEMINI_VIDEO_TIMEOUT_SECONDS * 1000),
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            {text: input.prompt},
            {fileData: {fileUri: input.videoUrl}}
          ]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 65_536,
          temperature: 0.1
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini 视频分析请求失败：${response.status} ${await response.text()}`);
  }
  const body = await response.json();
  const text = body.candidates?.[0]?.content?.parts?.find((part: {text?: string}) => part.text)?.text;
  if (!text) throw new Error("Gemini 视频分析没有返回内容。");
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Gemini 视频分析返回了无效 JSON。");
  }
}

export function createGeminiVideoTranscriber(dependencies: {generate?: Generate; timeoutMs?: number} = {}) {
  const generate = dependencies.generate ?? defaultGenerate;
  const timeoutMs = dependencies.timeoutMs ?? env.GEMINI_VIDEO_TIMEOUT_SECONDS * 1000;

  return async (input: GeminiVideoRequest): Promise<TranscriptionResult> => {
    const model = env.GEMINI_VIDEO_MODEL;
    const payload = videoAnalysisSchema.parse(await withTimeout(generate({
      model,
      videoUrl: input.videoUrl,
      prompt: buildPrompt(input)
    }), timeoutMs));
    const durationSeconds = normalizeDuration(input.expectedDurationSeconds)
      ?? payload.durationSeconds;
    const segments = normalizeTranscriptParagraphs(payload.segments, durationSeconds);
    if (!segments.length) {
      throw new Error("Gemini 视频分析没有返回有效的转写段落。");
    }
    if (input.enableSpeakerLabels) {
      const missingSpeakerIndex = payload.segments.findIndex((segment) => !segment.speaker?.trim());
      if (missingSpeakerIndex >= 0) {
        throw new Error(`Gemini 视频分析缺少第 ${missingSpeakerIndex + 1} 个段落的发言人标签。`);
      }
    }
    const speakers = new Set(segments.map((segment) => segment.speaker).filter(Boolean));
    const summary = {
      ...payload.summary,
      bullets: payload.summary.bullets.map((item) => ({
        ...item,
        timestamps: fitSummaryTimestamps(item.timestamps, durationSeconds)
      })),
      takeaways: payload.summary.takeaways.map((item) => ({
        ...item,
        timestamps: fitSummaryTimestamps(item.timestamps, durationSeconds)
      }))
    };

    return {
      provider: "gemini",
      language: payload.language,
      durationSeconds,
      text: segments.map((segment) => segment.text).join("\n\n"),
      segments,
      speakerCount: speakers.size || undefined,
      insights: {
        model: `gemini/${model}`,
        summary,
        mindMap: payload.mindMap
      }
    };
  };
}

export const transcribeVideoWithGemini = createGeminiVideoTranscriber();
