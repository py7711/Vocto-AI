import "server-only";

import {createHmac, randomBytes} from "crypto";
import {Prisma} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import {hashToken} from "@/lib/auth";

export const supportedWebhookEvents = ["task.completed", "task.failed", "share_link.create"] as const;
export type SupportedWebhookEvent = (typeof supportedWebhookEvents)[number];

const MAX_ATTEMPTS = 3;
// 每次重试前的退避延迟（毫秒），第一次尝试不延迟。
const BACKOFF_MS = [0, 500, 2000];
const REQUEST_TIMEOUT_MS = 8000;

export function createWebhookSecret() {
  const rawSecret = `whsec_${randomBytes(32).toString("base64url")}`;
  return {
    rawSecret,
    secretHash: hashToken(rawSecret),
    secretPrefix: rawSecret.slice(0, 14)
  };
}

function signPayload(secretHash: string, timestamp: number, payload: string) {
  return createHmac("sha256", secretHash).update(`${timestamp}.${payload}`).digest("hex");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readEvents(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export async function dispatchTeamWebhook(input: {
  teamId: string | null | undefined;
  event: SupportedWebhookEvent;
  targetType: string;
  targetId?: string | null;
  payload: Prisma.InputJsonObject;
}) {
  if (!input.teamId) return;

  const endpoints = await prisma.webhookEndpoint.findMany({
    where: {teamId: input.teamId, status: "ACTIVE"}
  });

  await Promise.all(
    endpoints
      .filter((endpoint) => readEvents(endpoint.events).includes(input.event))
      .map((endpoint) => deliverWebhook(endpoint, input))
  );
}

type DeliveryEndpoint = {id: string; teamId: string; url: string; secretHash: string};

// 带指数退避的投递：最多尝试 MAX_ATTEMPTS 次，最终结果与尝试次数写回同一条投递记录。
async function sendWithRetry(endpoint: DeliveryEndpoint, deliveryId: string, event: string, payloadText: string) {
  const startedAt = Date.now();
  let success = false;
  let lastStatus: number | null = null;
  let lastBody = "";
  let attemptsUsed = 0;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    attemptsUsed = attempt;
    if (attempt > 1) {
      await sleep(BACKOFF_MS[attempt - 1] ?? BACKOFF_MS[BACKOFF_MS.length - 1]);
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = signPayload(endpoint.secretHash, timestamp, payloadText);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const response = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Votxt-Webhooks/1.0",
          "X-Votxt-Event": event,
          "X-Votxt-Delivery": deliveryId,
          "X-Votxt-Attempt": String(attempt),
          "X-Votxt-Timestamp": String(timestamp),
          "X-Votxt-Signature": `t=${timestamp},v1=${signature}`
        },
        body: payloadText,
        signal: controller.signal
      });
      clearTimeout(timeout);

      lastStatus = response.status;
      lastBody = (await response.text().catch(() => "")).slice(0, 900);
      if (response.ok) {
        success = true;
        break;
      }
    } catch (error) {
      lastStatus = null;
      lastBody = (error instanceof Error ? error.message : "Webhook 投递失败。").slice(0, 900);
    }
  }

  const summary = `attempt ${attemptsUsed}/${MAX_ATTEMPTS}${lastBody ? `: ${lastBody}` : ""}`.slice(0, 1024);
  await prisma.$transaction([
    prisma.webhookDelivery.update({
      where: {id: deliveryId},
      data: {
        status: success ? "SUCCESS" : "FAILED",
        responseStatus: lastStatus,
        responseBody: summary,
        durationMs: Date.now() - startedAt
      }
    }),
    prisma.webhookEndpoint.update({
      where: {id: endpoint.id},
      data: {
        lastDeliveryAt: new Date(),
        failureCount: success ? 0 : {increment: 1}
      }
    })
  ]);

  return success;
}

async function deliverWebhook(
  endpoint: DeliveryEndpoint,
  input: {event: SupportedWebhookEvent; targetType: string; targetId?: string | null; payload: Prisma.InputJsonObject}
) {
  const payload = {
    id: `evt_${randomBytes(16).toString("hex")}`,
    event: input.event,
    targetType: input.targetType,
    targetId: input.targetId,
    createdAt: new Date().toISOString(),
    data: input.payload
  };
  const payloadText = JSON.stringify(payload);

  const delivery = await prisma.webhookDelivery.create({
    data: {
      endpointId: endpoint.id,
      teamId: endpoint.teamId,
      event: input.event,
      targetType: input.targetType,
      targetId: input.targetId,
      payload
    }
  });

  await sendWithRetry(endpoint, delivery.id, input.event, payloadText);
}

// 手动重放：复制原投递的载荷，重新签名并以一条新投递记录发送。
export async function replayWebhookDelivery(deliveryId: string, teamId: string) {
  const original = await prisma.webhookDelivery.findFirst({
    where: {id: deliveryId, teamId},
    include: {endpoint: true}
  });

  if (!original) {
    throw new Error("未找到 Webhook 投递记录。");
  }
  if (original.endpoint.status !== "ACTIVE") {
    throw new Error("Webhook 已停用，无法重放。");
  }

  const payloadText = JSON.stringify(original.payload);
  const delivery = await prisma.webhookDelivery.create({
    data: {
      endpointId: original.endpointId,
      teamId,
      event: original.event,
      targetType: original.targetType,
      targetId: original.targetId,
      payload: original.payload as Prisma.InputJsonValue
    }
  });

  const success = await sendWithRetry(
    {
      id: original.endpoint.id,
      teamId: original.endpoint.teamId,
      url: original.endpoint.url,
      secretHash: original.endpoint.secretHash
    },
    delivery.id,
    original.event,
    payloadText
  );

  return {deliveryId: delivery.id, success};
}
