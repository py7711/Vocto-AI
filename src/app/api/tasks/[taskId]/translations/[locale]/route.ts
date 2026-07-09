import {NextResponse} from "next/server";
import {z} from "zod";
import {assertTaskAccess, publishTaskUpdate, taskAccessErrorResponse} from "@/lib/tasks";
import {prisma} from "@/lib/prisma";
import {logApiError} from "@/lib/api-logger";

const segmentSchema = z.object({
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
  text: z.string(),
  speaker: z.string().optional()
});

const updateTranslationSchema = z.object({
  text: z.string().optional(),
  segments: z.array(segmentSchema).optional()
});

export async function GET(request: Request, {params}: {params: {taskId: string; locale: string}}) {
  try {
    await assertTaskAccess(params.taskId, "read", request.headers);
    const translation = await prisma.aIInsight.findUnique({
      where: {
        mediaTaskId_type_locale: {
          mediaTaskId: params.taskId,
          type: "TRANSLATION",
          locale: params.locale
        }
      }
    });

    if (!translation) {
      return NextResponse.json({error: "翻译不存在。"}, {status: 404});
    }

    return NextResponse.json(translation);
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法读取翻译。";
    return NextResponse.json({error: message}, {status: 400});
  }
}

export async function PATCH(request: Request, {params}: {params: {taskId: string; locale: string}}) {
  try {
    await assertTaskAccess(params.taskId, "write", request.headers);
    const input = updateTranslationSchema.parse(await request.json());
    const existing = await prisma.aIInsight.findUnique({
      where: {
        mediaTaskId_type_locale: {
          mediaTaskId: params.taskId,
          type: "TRANSLATION",
          locale: params.locale
        }
      }
    });

    if (!existing) {
      return NextResponse.json({error: "翻译不存在。"}, {status: 404});
    }

    const previous = typeof existing.content === "object" && existing.content ? (existing.content as Record<string, unknown>) : {};
    const text = input.text ?? input.segments?.map((segment) => segment.text).join("\n") ?? String(previous.text ?? "");
    const updated = await prisma.aIInsight.update({
      where: {id: existing.id},
      data: {
        content: {
          ...previous,
          target: params.locale,
          text,
          ...(input.segments ? {segments: input.segments} : {})
        }
      }
    });

    await publishTaskUpdate(params.taskId);
    return NextResponse.json(updated);
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法更新翻译。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
