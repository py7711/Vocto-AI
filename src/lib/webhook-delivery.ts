import {createHmac, randomUUID} from "crypto";
import type {MediaTask, Prisma, Transcript} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import {transcriptText} from "@/lib/transcript-content";

// Webhook 投递由 API 路由和后台 worker 共同触发：用户取消任务、worker 完成任务或失败任务
// 都需要进入同一套事件发送逻辑。本模块不依赖 cookies/headers 等请求上下文，所以保持为
// 普通 Node 可导入模块，避免 worker 启动时触发 `server-only` 限制。
type WebhookTask = MediaTask & {
  transcript?: Transcript | null;
};

const eventAliases: Record<string, string[]> = {
  "transcription.completed": ["task.completed"],
  "transcription.failed": ["task.failed"],
  "transcription.canceled": ["task.canceled"]
};

function subscribed(events: unknown, event: string) {
  const values = Array.isArray(events) ? events.map(String) : [];
  return values.includes(event) || (eventAliases[event] ?? []).some((alias) => values.includes(alias));
}

export function serializeTranscription(task: WebhookTask) {
  return {
    id: task.id,
    status: task.status.toLowerCase(),
    source_type: task.sourceType.toLowerCase(),
    original_name: task.originalName,
    language: task.language,
    detected_language: task.detectedLanguage,
    duration_seconds: task.durationSeconds,
    provider: task.provider,
    speaker_count: task.speakerCount,
    progress: task.progress,
    status_message: task.statusMessage,
    error_code: task.errorCode,
    created_at: task.createdAt.toISOString(),
    updated_at: task.updatedAt.toISOString(),
    completed_at: task.completedAt?.toISOString() ?? null,
    transcript: task.transcript
      ? {
          text: transcriptText(task.transcript),
          segments: task.transcript.segments,
          words: task.transcript.words
        }
      : null
  };
}

function signPayload(payload: string, secretMaterial: string) {
  return createHmac("sha256", secretMaterial).update(payload).digest("hex");
}

async function deliver(endpoint: {id: string; teamId: string; url: string; secretHash: string}, event: string, payload: Prisma.InputJsonObject) {
  const body = JSON.stringify(payload);
  const startedAt = Date.now();
  // endpoint.secretHash 是创建 Webhook 时生成的服务端密钥材料，不是用户可见明文。
  // 签名覆盖完整 JSON body，接收方应使用原始请求体复算，不能先 parse 再 stringify。
  const signature = signPayload(body, endpoint.secretHash);
  const delivery = await prisma.webhookDelivery.create({
    data: {
      endpointId: endpoint.id,
      teamId: endpoint.teamId,
      event,
      targetType: "transcription",
      targetId: String(payload.data && typeof payload.data === "object" && "id" in payload.data ? payload.data.id : ""),
      payload
    }
  });

  try {
    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "Votxt-Webhook/1.0",
        "x-votxt-event": event,
        "x-votxt-delivery": delivery.id,
        "x-votxt-signature": `sha256=${signature}`
      },
      body,
      signal: AbortSignal.timeout(10_000)
    });
    const text = await response.text().catch(() => "");
    const ok = response.status >= 200 && response.status < 300;

    await prisma.$transaction([
      prisma.webhookDelivery.update({
        where: {id: delivery.id},
        data: {
          status: ok ? "SUCCESS" : "FAILED",
          responseStatus: response.status,
          responseBody: text.slice(0, 1024),
          durationMs: Date.now() - startedAt
        }
      }),
      prisma.webhookEndpoint.update({
        where: {id: endpoint.id},
        data: {
          lastDeliveryAt: new Date(),
          failureCount: ok ? 0 : {increment: 1}
        }
      })
    ]);
  } catch (error) {
    await prisma.$transaction([
      prisma.webhookDelivery.update({
        where: {id: delivery.id},
        data: {
          status: "FAILED",
          responseBody: error instanceof Error ? error.message.slice(0, 1024) : "Webhook 投递失败。",
          durationMs: Date.now() - startedAt
        }
      }),
      prisma.webhookEndpoint.update({
        where: {id: endpoint.id},
        data: {
          lastDeliveryAt: new Date(),
          failureCount: {increment: 1}
        }
      })
    ]);
  }
}

export async function queueWebhookEvent(input: {
  teamId: string | null | undefined;
  event: "transcription.completed" | "transcription.failed" | "transcription.canceled";
  task: WebhookTask;
}) {
  if (!input.teamId) return;

  const endpoints = await prisma.webhookEndpoint.findMany({
    where: {
      teamId: input.teamId,
      status: "ACTIVE"
    },
    select: {
      id: true,
      teamId: true,
      url: true,
      secretHash: true,
      events: true
    }
  });
  const matching = endpoints.filter((endpoint) => subscribed(endpoint.events, input.event));
  if (!matching.length) return;

  const payload = {
    id: randomUUID(),
    event: input.event,
    created_at: new Date().toISOString(),
    api_version: "2026-06-27",
    data: serializeTranscription(input.task)
  };

  if (process.env.NODE_ENV === "test") {
    // 测试环境只落库不发真实 HTTP，避免单元/集成测试依赖外部回调服务。
    // 这里仍然创建 delivery 记录，方便断言订阅事件过滤和 payload 结构。
    await Promise.all(matching.map((endpoint) => prisma.webhookDelivery.create({
      data: {
        endpointId: endpoint.id,
        teamId: endpoint.teamId,
        event: input.event,
        targetType: "transcription",
        targetId: input.task.id,
        status: "PENDING",
        payload
      }
    })));
    return;
  }

  await Promise.allSettled(matching.map((endpoint) => deliver(endpoint, input.event, payload)));
}
