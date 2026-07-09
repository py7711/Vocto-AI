import {NextResponse} from "next/server";
import {z} from "zod";
import {enqueueTranscribeJob} from "@/lib/queue";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, publishTaskUpdate, taskAccessErrorResponse} from "@/lib/tasks";
import {logApiError} from "@/lib/api-logger";

const fallbackSchema = z.object({
  taskId: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const input = fallbackSchema.parse(await request.json().catch(() => ({})));
    await assertTaskAccess(input.taskId, "write", request.headers);
    const task = await prisma.mediaTask.findUnique({
      where: {id: input.taskId},
      select: {id: true, sourceType: true, sourceUrl: true, language: true}
    });
    if (!task) return NextResponse.json({error: "转写任务不存在。"}, {status: 404});
    if (task.sourceType !== "YOUTUBE") return NextResponse.json({error: "YouTube 降级转写只适用于 YouTube 任务。"}, {status: 409});
    await prisma.mediaTask.update({
      where: {id: task.id},
      data: {status: "QUEUED", progress: 5, statusMessage: "YouTube 降级转写已进入队列。", errorCode: null, completedAt: null}
    });
    await enqueueTranscribeJob({
      taskId: task.id,
      sourceType: "YOUTUBE",
      sourceUrl: task.sourceUrl,
      language: task.language ?? "auto",
      enableSpeakerLabels: true,
      subtitleEnabled: true,
      premiumModel: false,
      summaryTemplate: "standard",
      summaryLanguage: "en",
      youtubeFallback: true
    });
    await publishTaskUpdate(task.id);
    return NextResponse.json({ok: true});
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    return NextResponse.json({error: error instanceof Error ? error.message : "无法加入 YouTube 降级转写队列。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
