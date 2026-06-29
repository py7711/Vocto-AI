import {NextResponse} from "next/server";
import {z} from "zod";
import type {TranscribeJob} from "@/lib/queue";
import {getTranscribeQueue} from "@/lib/queue";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, publishTaskUpdate, taskAccessErrorResponse} from "@/lib/tasks";
import {isGoogleDriveShareUrl} from "@/server/media/prepare";

const retranscribeSchema = z.object({
  language: z.string().optional(),
  enableSpeakerLabels: z.boolean().default(true),
  subtitleEnabled: z.boolean().default(true),
  premiumModel: z.boolean().default(false),
  summaryTemplate: z.enum(["none", "standard", "meeting", "study", "interview"]).default("standard"),
  summaryLanguage: z.string().default("en")
});

export async function POST(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "write", request.headers);
    const input = retranscribeSchema.parse(await request.json().catch(() => ({})));
    const existing = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      select: {
        id: true,
        sourceType: true,
        sourceUrl: true,
        language: true
      }
    });

    if (!existing) {
      return NextResponse.json({error: "转写任务不存在。"}, {status: 404});
    }

    await prisma.$transaction([
      prisma.aIInsight.deleteMany({where: {mediaTaskId: params.taskId}}),
      prisma.exportAsset.deleteMany({where: {mediaTaskId: params.taskId}}),
      prisma.mediaTask.update({
        where: {id: params.taskId},
        data: {
          language: input.language ?? existing.language ?? "auto",
          detectedLanguage: null,
          provider: null,
          speakerCount: null,
          status: "QUEUED",
          statusMessage: "重转写任务已进入队列。",
          errorCode: null,
          progress: 5,
          completedAt: null
        }
      })
    ]);

    const jobSourceType: TranscribeJob["sourceType"] =
      existing.sourceType === "UPLOAD" && isGoogleDriveShareUrl(existing.sourceUrl)
        ? "GOOGLE_DRIVE"
        : existing.sourceType;

    await getTranscribeQueue().add("transcribe" as never, {
      taskId: existing.id,
      sourceType: jobSourceType,
      sourceUrl: existing.sourceUrl,
      language: input.language ?? existing.language ?? "auto",
      enableSpeakerLabels: input.enableSpeakerLabels,
      subtitleEnabled: input.subtitleEnabled,
      premiumModel: input.premiumModel,
      summaryTemplate: input.summaryTemplate,
      summaryLanguage: input.summaryLanguage
    });

    await publishTaskUpdate(params.taskId);
    return NextResponse.json({ok: true});
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法加入重转写队列。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
