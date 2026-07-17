import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, publishTaskUpdate, taskAccessErrorResponse} from "@/lib/tasks";
import {translateBatchWithFallback} from "@/server/translation";
import {logApiError} from "@/lib/api-logger";
import {transcriptText} from "@/lib/transcript-content";
import {transcriptTranslationEntries} from "@/lib/transcript-translations";
import {setTranscriptTranslation} from "@/server/transcript-translations";

const translationSchema = z.object({
  targetLanguageCode: z.string().trim().min(2).max(16),
  sourceLanguageCode: z.string().trim().max(16).optional()
});

type TranslationUnit = {
  text: string;
  start?: number;
  end?: number;
  speaker?: string;
};

const TRANSLATION_BATCH_CHAR_LIMIT = 20000;

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function buildTranslationUnits(transcript: {editedText?: string | null; segments: unknown}): TranslationUnit[] {
  if (Array.isArray(transcript.segments)) {
    const segmentUnits = transcript.segments
      .map((segment) => {
        if (!segment || typeof segment !== "object") return null;
        const record = segment as Record<string, unknown>;
        const text = textValue(record.text);
        if (!text) return null;
        return {
          text,
          start: numberValue(record.start),
          end: numberValue(record.end),
          speaker: textValue(record.speaker) || undefined
        };
      })
      .filter(Boolean) as TranslationUnit[];
    if (segmentUnits.length) return segmentUnits;
  }

  const text = transcriptText(transcript);
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => ({text: paragraph, start: index === 0 ? 0 : undefined}));
}

function batchTranslationUnits(units: TranslationUnit[]) {
  const batches: TranslationUnit[][] = [];
  let current: TranslationUnit[] = [];
  let currentChars = 0;

  for (const unit of units) {
    const unitChars = Math.max(unit.text.length, 1);
    if (current.length && currentChars + unitChars > TRANSLATION_BATCH_CHAR_LIMIT) {
      batches.push(current);
      current = [];
      currentChars = 0;
    }
    current.push(unit);
    currentChars += unitChars;
  }

  if (current.length) batches.push(current);
  return batches;
}

export async function GET(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "read", request.headers);
    const transcript = await prisma.transcript.findUnique({where: {mediaTaskId: params.taskId}, select: {translations: true}});
    const translations = transcriptTranslationEntries(transcript?.translations);

    return NextResponse.json({translations});
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法读取翻译列表。";
    return NextResponse.json({error: message}, {status: 400});
  }
}

export async function POST(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "write", request.headers);
    const input = translationSchema.parse(await request.json());
    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      include: {transcript: true}
    });

    if (!task?.transcript) {
      return NextResponse.json({error: "转写文本尚未准备好。"}, {status: 409});
    }

    const units = buildTranslationUnits(task.transcript);
    if (!units.length) {
      return NextResponse.json({error: "转写文本尚未准备好。"}, {status: 409});
    }

    const translatedTexts: string[] = [];
    const providers = new Set<string>();
    const errors: string[] = [];
    const sourceLocale = input.sourceLanguageCode ?? task.detectedLanguage ?? task.language ?? "auto";

    for (const batch of batchTranslationUnits(units)) {
      const translation = await translateBatchWithFallback({
        texts: batch.map((unit) => unit.text),
        targetLocale: input.targetLanguageCode,
        sourceLocale
      });
      translatedTexts.push(...translation.texts);
      providers.add(translation.provider);
      errors.push(...translation.errors);
    }

    const provider = Array.from(providers).join(", ") || "local-fallback";
    const segments = units.map((unit, index) => {
      const segment: {text: string; start?: number; end?: number; speaker?: string} = {text: translatedTexts[index] ?? unit.text};
      if (unit.start !== undefined) segment.start = unit.start;
      if (unit.end !== undefined) segment.end = unit.end;
      if (unit.speaker) segment.speaker = unit.speaker;
      return segment;
    });
    const content = {
      target: input.targetLanguageCode,
      provider,
      text: segments.map((segment) => segment.text).join("\n\n"),
      segments,
      errors
    };

    await setTranscriptTranslation(task.id, input.targetLanguageCode, content);

    await publishTaskUpdate(task.id);
    return NextResponse.json({locale: input.targetLanguageCode, content});
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法创建翻译。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
