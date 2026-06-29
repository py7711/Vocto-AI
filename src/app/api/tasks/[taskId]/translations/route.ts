import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, publishTaskUpdate, taskAccessErrorResponse} from "@/lib/tasks";
import {translateWithFallback} from "@/server/translation";

const translationSchema = z.object({
  targetLanguageCode: z.string().trim().min(2).max(16),
  sourceLanguageCode: z.string().trim().max(16).optional()
});

export async function GET(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "read", request.headers);
    const translations = await prisma.aIInsight.findMany({
      where: {mediaTaskId: params.taskId, type: "TRANSLATION"},
      orderBy: {updatedAt: "desc"},
      select: {
        id: true,
        locale: true,
        title: true,
        content: true,
        model: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({translations});
  } catch (error) {
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

    const text = task.transcript.editedText || task.transcript.plainText;
    const translation = await translateWithFallback({
      text: text.slice(0, 24000),
      targetLocale: input.targetLanguageCode,
      sourceLocale: input.sourceLanguageCode ?? task.detectedLanguage ?? task.language ?? "auto"
    });

    const record = await prisma.aIInsight.upsert({
      where: {
        mediaTaskId_type_locale: {
          mediaTaskId: task.id,
          type: "TRANSLATION",
          locale: input.targetLanguageCode
        }
      },
      update: {
        content: {
          target: input.targetLanguageCode,
          provider: translation.provider,
          text: translation.text,
          errors: translation.errors
        },
        model: translation.provider
      },
      create: {
        mediaTaskId: task.id,
        type: "TRANSLATION",
        locale: input.targetLanguageCode,
        title: "翻译",
        content: {
          target: input.targetLanguageCode,
          provider: translation.provider,
          text: translation.text,
          errors: translation.errors
        },
        model: translation.provider
      }
    });

    await publishTaskUpdate(task.id);
    return NextResponse.json(record);
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法创建翻译。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
