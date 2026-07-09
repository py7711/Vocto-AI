import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {getRequestOrigin} from "@/lib/request-origin";
import {assertTaskAccess, publishTaskUpdate, taskAccessErrorResponse} from "@/lib/tasks";
import {serializeCompatTask} from "@/lib/transcription-compat";
import {releaseQuotaForFailedTask} from "@/lib/usage";
import {logApiError} from "@/lib/api-logger";

const updateSchema = z.object({
  // 旧转写详情页会提交 filename/languageCode/transcriptionType 等字段，
  // 当前 MediaTask 只保存 originalName/language/statusMessage，所以这里做边界映射。
  filename: z.string().trim().min(1).max(512).optional(),
  originalName: z.string().trim().min(1).max(512).optional(),
  languageCode: z.string().max(16).optional(),
  language: z.string().max(16).optional(),
  transcriptionType: z.string().max(80).optional(),
  enableSpeakerDiarization: z.boolean().optional(),
  enableSpeakerLabels: z.boolean().optional(),
  summaryTemplate: z.string().optional(),
  summaryLanguageCode: z.string().optional()
});

export async function GET(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "read", request.headers);
    const locale = new URL(request.url).searchParams.get("locale") ?? undefined;
    // 兼容详情接口需要一次性带出 transcript、insights、folder 和最新分享链接，
    // serializeCompatTask 会在当前任务模型外补回旧字段名。
    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      include: {
        transcript: true,
        insights: {select: {type: true, content: true, createdAt: true, updatedAt: true}},
        folder: {select: {id: true, name: true, position: true}},
        shareLinks: {
          where: {enabled: true},
          select: {
            id: true,
            tokenHash: true,
            title: true,
            enabled: true,
            expiresAt: true,
            accessCount: true,
            lastAccessAt: true,
            createdAt: true
          },
          orderBy: {createdAt: "desc"},
          take: 1
        }
      }
    });
    if (!task) return NextResponse.json({error: "转写任务不存在。"}, {status: 404});
    return NextResponse.json(serializeCompatTask(task, {locale, appUrl: getRequestOrigin(request)}));
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    return NextResponse.json({error: error instanceof Error ? error.message : "无法读取转写。"}, {status: 400});
  }
}

export async function PATCH(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "write", request.headers);
    const locale = new URL(request.url).searchParams.get("locale") ?? undefined;
    const input = updateSchema.parse(await request.json().catch(() => ({})));
    const data: {originalName?: string; language?: string; speakerCount?: number | null; statusMessage?: string} = {};
    const filename = input.filename ?? input.originalName;
    if (filename) data.originalName = filename;
    const language = input.language ?? input.languageCode;
    if (language) data.language = language;
    const speakerSetting = input.enableSpeakerDiarization ?? input.enableSpeakerLabels;
    if (speakerSetting !== undefined) {
      // 旧客户端用布尔开关控制说话人识别；当前重转写时再读取 speakerCount/statusMessage。
      data.speakerCount = speakerSetting ? undefined : null;
      data.statusMessage = speakerSetting ? "说话人识别已开启，将在下次重转写时生效。" : "说话人识别已关闭，将在下次重转写时生效。";
    }
    if (input.transcriptionType && !data.statusMessage) data.statusMessage = `转写类型已设置为 ${input.transcriptionType}。`;
    if (!Object.keys(data).length) return NextResponse.json({error: "没有提供可更新字段。"}, {status: 422});
    const task = await prisma.mediaTask.update({
      where: {id: params.taskId},
      data,
      include: {
        transcript: true,
        insights: {select: {type: true, content: true, createdAt: true, updatedAt: true}},
        folder: {select: {id: true, name: true, position: true}},
        shareLinks: {
          where: {enabled: true},
          select: {
            id: true,
            tokenHash: true,
            title: true,
            enabled: true,
            expiresAt: true,
            accessCount: true,
            lastAccessAt: true,
            createdAt: true
          },
          orderBy: {createdAt: "desc"},
          take: 1
        }
      }
    });
    await publishTaskUpdate(params.taskId);
    return NextResponse.json(serializeCompatTask(task, {locale, appUrl: getRequestOrigin(request)}));
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    return NextResponse.json({error: error instanceof Error ? error.message : "无法更新转写。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}

export async function DELETE(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "write", request.headers);
    const task = await prisma.mediaTask.findUnique({where: {id: params.taskId}, select: {status: true}});
    if (!task) return NextResponse.json({error: "转写任务不存在。"}, {status: 404});
    if (["UPLOADING", "QUEUED", "PROCESSING", "TRANSCRIBING", "ANALYZING", "FAILED", "CANCELED"].includes(task.status)) {
      // 删除未完成或失败任务前释放预留额度，避免旧客户端删除任务后分钟数被永久占用。
      await releaseQuotaForFailedTask(params.taskId);
    }
    await prisma.mediaTask.delete({where: {id: params.taskId}});
    return NextResponse.json({ok: true});
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    return NextResponse.json({error: error instanceof Error ? error.message : "无法删除转写。"}, {status: 400});
  }
}
