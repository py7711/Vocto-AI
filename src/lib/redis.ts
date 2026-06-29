import IORedis from "ioredis";
import {env} from "@/lib/env";

const globalForRedis = globalThis as unknown as {
  redis?: IORedis;
  redisPub?: IORedis;
};

const isTlsRedis = env.REDIS_URL.startsWith("rediss://");
const redisConnectionErrors = new WeakMap<IORedis, Error>();

export const redisOptions = {
  // BullMQ 要求 maxRetriesPerRequest 为 null；否则阻塞命令在网络抖动时会被 ioredis 提前中断。
  maxRetriesPerRequest: null,
  // Upstash 等云 Redis 可能同时返回 IPv6/IPv4；部分本地网络和部署平台没有 IPv6 出口，
  // 会表现为 EHOSTUNREACH 或连接超时。BullMQ 只需要普通 TCP 连接，这里固定 IPv4 更稳。
  family: 4,
  lazyConnect: true,
  enableReadyCheck: false,
  connectTimeout: 10000,
  tls: isTlsRedis ? {} : undefined
} as const;

export function describeRedisConnectionError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Redis 连接失败。";
  }

  const code = "code" in error ? String(error.code) : undefined;
  const base = code ? `Redis 连接失败（${code}）：${error.message}` : `Redis 连接失败：${error.message}`;

  if (code === "ETIMEDOUT" || code === "EHOSTUNREACH" || code === "ENETUNREACH") {
    return `${base}。请检查 REDIS_URL/UPSTASH_REDIS_URL/KV_URL 是否是可访问的 redis:// 或 rediss:// 地址，以及当前机器是否允许访问 Redis 主机的 6379 端口。`;
  }

  return base;
}

export function createRedisConnection() {
  const client = new IORedis(env.REDIS_URL, redisOptions);
  client.on("error", (error) => {
    redisConnectionErrors.set(client, error);
    // 调用方会在真实命令或启动预检处处理错误；这里避免 EventEmitter 未监听 error 事件导致进程崩溃。
  });
  client.on("ready", () => {
    redisConnectionErrors.delete(client);
  });
  return client;
}

export function getRedisConnectionError(client: IORedis, fallback: unknown) {
  return redisConnectionErrors.get(client) ?? fallback;
}

export const redis =
  globalForRedis.redis ??
  createRedisConnection();

export const redisPub =
  globalForRedis.redisPub ??
  createRedisConnection();

if (process.env.NODE_ENV !== "production") {
  // Next.js 开发模式会频繁热重载模块，把客户端挂到 global 可以复用连接，
  // 避免本地开发时 Redis 连接数随着每次保存持续增长。
  globalForRedis.redis = redis;
  globalForRedis.redisPub = redisPub;
}
