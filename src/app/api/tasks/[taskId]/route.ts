import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, publishTaskUpdate, taskAccessErrorResponse} from "@/lib/tasks";
import {releaseQuotaForFailedTask} from "@/lib/usage";
import {jsonSafe} from "@/lib/json";
import {getRequestOrigin} from "@/lib/request-origin";
import {serializeShareLinkForOwner} from "@/lib/share-links";
import {logApiError} from "@/lib/api-logger";

const updateTaskSchema = z.object({
  originalName: z.string().trim().min(1).max(512).optional(),
  language: z.string().max(16).optional(),
  languageCode: z.string().max(16).optional(),
  enableSpeakerDiarization: z.boolean().optional(),
  enableSpeakerLabels: z.boolean().optional(),
  transcriptionType: z.string().max(80).optional()
});

function serializeTaskForWorkspace<T extends {shareLinks?: Array<Parameters<typeof serializeShareLinkForOwner>[0]>}>(task: T, request: Request) {
  const locale = new URL(request.url).searchParams.get("locale") || "zh";
  const appUrl = getRequestOrigin(request);
  return {
    ...task,
    shareLinks: task.shareLinks?.map((shareLink) =>
      serializeShareLinkForOwner(shareLink, {appUrl, locale})
    )
  };
}

export async function GET(request: Request, {params}: {params: {taskId: string}}) {
  try {
    const access = await assertTaskAccess(params.taskId, "read", request.headers);
    // 返回任务详情时同时带上转写、AI 洞察和导出记录，前端一次请求即可刷新工作台。
    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      include: {
        transcript: {
          select: {
            id: true,
            mediaTaskId: true,
            plainText: true,
            segments: true,
            editedText: true,
            createdAt: true,
            updatedAt: true
          }
        },
        insights: true,
        exports: true,
        mediaAssets: {
          orderBy: [{kind: "asc"}, {chunkIndex: "asc"}]
        },
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
        },
        folder: {select: {id: true, name: true, position: true}},
        ratings: {
          select: {
            rating: true,
            userId: true,
            updatedAt: true
          }
        }
      }
    });

    if (!task) {
      return NextResponse.json({error: "转写任务不存在。"}, {status: 404});
    }

    const ratings = task.ratings ?? [];
    const ratingAverage = ratings.length ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length : null;
    const currentUserRating = access.user ? ratings.find((item) => item.userId === access.user?.id) ?? null : null;

    return NextResponse.json(jsonSafe(serializeTaskForWorkspace({
      ...task,
      currentUserRating,
      ratingSummary: {
        average: ratingAverage,
        count: ratings.length
      }
    }, request)));
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法读取转写。";
    return NextResponse.json({error: message}, {status: 400});
  }
}

export async function PATCH(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "write", request.headers);
    const input = updateTaskSchema.parse(await request.json());
    const data: {originalName?: string; language?: string; speakerCount?: number | null; statusMessage?: string} = {};
    if (input.originalName) data.originalName = input.originalName;
    const language = input.language ?? input.languageCode;
    if (language) data.language = language;
    const speakerSetting = input.enableSpeakerDiarization ?? input.enableSpeakerLabels;
    if (speakerSetting !== undefined) {
      data.speakerCount = speakerSetting ? undefined : null;
      data.statusMessage = speakerSetting ? "说话人识别已开启，将在下次重转写时生效。" : "说话人识别已关闭，将在下次重转写时生效。";
    }
    if (input.transcriptionType && !data.statusMessage) {
      data.statusMessage = `转写类型已设置为 ${input.transcriptionType}。`;
    }
    if (!Object.keys(data).length) {
      return NextResponse.json({error: "没有提供可更新的转写字段。"}, {status: 422});
    }

    const task = await prisma.mediaTask.update({
      where: {id: params.taskId},
      data,
      include: {
        transcript: {
          select: {
            id: true,
            mediaTaskId: true,
            plainText: true,
            segments: true,
            editedText: true,
            createdAt: true,
            updatedAt: true
          }
        },
        insights: true,
        exports: true,
        mediaAssets: {
          orderBy: [{kind: "asc"}, {chunkIndex: "asc"}]
        },
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
        },
        folder: {select: {id: true, name: true, position: true}},
        ratings: {
          select: {
            rating: true,
            userId: true,
            updatedAt: true
          }
        }
      }
    });

    await publishTaskUpdate(params.taskId);
    return NextResponse.json(jsonSafe(serializeTaskForWorkspace(task, request)));
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法更新转写。";
    return NextResponse.json({error: message}, {status: 400});
  }
}

export async function DELETE(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "write", request.headers);
    const task = await prisma.mediaTask.findUnique({
      where: {id: params.taskId},
      select: {status: true}
    });
    if (!task) return NextResponse.json({error: "转写任务不存在。"}, {status: 404});
    if (["UPLOADING", "QUEUED", "PROCESSING", "TRANSCRIBING", "ANALYZING", "FAILED", "CANCELED"].includes(task.status)) {
      await releaseQuotaForFailedTask(params.taskId);
    }
    await prisma.mediaTask.delete({where: {id: params.taskId}});
    return NextResponse.json({ok: true});
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法删除转写。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
