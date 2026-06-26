import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {getTranscribeQueue} from "@/lib/queue";
import {anonymousUserId, resolveTaskTeamForUser} from "@/lib/tasks";
import {assertRateLimit} from "@/lib/rate-limit";
import {getCurrentUser} from "@/lib/auth";
import {assertAndUpdateFreeDailyQuota, estimatedMinutesFromFileSize, quotaErrorStatus, releaseQuotaForFailedTask, reserveQuotaForTask} from "@/lib/usage";
import {authenticateApiKey, teamAccessErrorResponse, writeAuditLog} from "@/lib/teams";

const createTaskSchema = z.object({
  sourceType: z.enum(["UPLOAD", "YOUTUBE"]),
  sourceUrl: z.string().url(),
  objectKey: z.string().optional(),
  originalName: z.string().optional(),
  language: z.string().default("auto"),
  enableSpeakerLabels: z.boolean().default(true),
  fileSizeBytes: z.number().int().positive().optional()
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const apiCredential = user ? null : await authenticateApiKey(request.headers);
    const team = apiCredential?.team ?? await resolveTaskTeamForUser(user);

    if (!user && !apiCredential) {
      return NextResponse.json({tasks: []});
    }

    const url = new URL(request.url);
    const take = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 30)));
    const tasks = await prisma.mediaTask.findMany({
      where: team ? {teamId: team.id} : {userId: user?.id},
      orderBy: {createdAt: "desc"},
      take,
      select: {
        id: true,
        sourceType: true,
        originalName: true,
        status: true,
        statusMessage: true,
        progress: true,
        provider: true,
        detectedLanguage: true,
        durationSeconds: true,
        speakerCount: true,
        createdAt: true,
        completedAt: true,
        transcript: {select: {id: true}},
        insights: {
          select: {
            type: true,
            content: true,
            createdAt: true,
            updatedAt: true
          }
        },
        shareLinks: {
          where: {enabled: true},
          select: {id: true, createdAt: true},
          orderBy: {createdAt: "desc"},
          take: 1
        }
      }
    });

    return NextResponse.json({tasks});
  } catch (error) {
    const accessError = teamAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法读取转写任务列表。";
    return NextResponse.json({error: message}, {status: 400});
  }
}

export async function POST(request: Request) {
  try {
    const input = createTaskSchema.parse(await request.json());
    const user = await getCurrentUser();
    const apiCredential = user ? null : await authenticateApiKey(request.headers);
    const quotaUserId = user?.id ?? apiCredential?.team.ownerId;
    // 已登录用户按用户 ID 限流，匿名用户按 IP 限流。
    await assertRateLimit(quotaUserId ?? anonymousUserId(request.headers), 20, 60 * 60);
    const team = apiCredential?.team ?? await resolveTaskTeamForUser(user);

    // 任务创建和额度预留必须处于同一事务，避免额度不足时产生孤儿排队任务。
    const task = await prisma.$transaction(async (tx) => {
      if (quotaUserId) {
        await assertAndUpdateFreeDailyQuota({userId: quotaUserId, tx});
      }

      const createdTask = await tx.mediaTask.create({
        data: {
          userId: user?.id ?? apiCredential?.team.ownerId,
          teamId: team?.id,
          sourceType: input.sourceType,
          sourceUrl: input.sourceUrl,
          objectKey: input.objectKey,
          originalName: input.originalName,
          language: input.language,
          fileSizeBytes: input.fileSizeBytes,
          status: "QUEUED",
          statusMessage: "Task has been queued.",
          progress: 5
        }
      });

      if (quotaUserId) {
        await reserveQuotaForTask({
          userId: quotaUserId,
          mediaTaskId: createdTask.id,
          estimatedMinutes: estimatedMinutesFromFileSize(input.fileSizeBytes),
          tx
        });
      }

      if (quotaUserId && team) {
        await writeAuditLog({
          teamId: team.id,
          userId: user?.id ?? null,
          action: "task.create",
          targetType: "media_task",
          targetId: createdTask.id,
          metadata: {
            sourceType: input.sourceType,
            language: input.language,
            enableSpeakerLabels: input.enableSpeakerLabels,
            via: apiCredential ? "api_key" : "web",
            apiKeyPrefix: apiCredential?.apiKey.keyPrefix
          },
          headers: request.headers,
          tx
        });
      }

      return createdTask;
    });

    // 转写属于长耗时任务，交给 BullMQ Worker 执行，Web 请求只负责排队。
    try {
      await getTranscribeQueue().add("transcribe" as never, {
        taskId: task.id,
        sourceType: input.sourceType,
        sourceUrl: input.sourceUrl,
        language: input.language,
        enableSpeakerLabels: input.enableSpeakerLabels
      });
    } catch (queueError) {
      await releaseQuotaForFailedTask(task.id);
      await prisma.mediaTask.update({
        where: {id: task.id},
        data: {status: "FAILED", progress: 100, statusMessage: "Queue is unavailable.", errorCode: "QUEUE_UNAVAILABLE"}
      });
      throw queueError;
    }

    return NextResponse.json(task);
  } catch (error) {
    const accessError = teamAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法创建转写任务。";
    return NextResponse.json({error: message}, {status: message === "RATE_LIMITED" ? 429 : quotaErrorStatus(message)});
  }
}
