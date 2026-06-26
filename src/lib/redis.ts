import IORedis from "ioredis";
import {env} from "@/lib/env";

const globalForRedis = globalThis as unknown as {
  redis?: IORedis;
  redisPub?: IORedis;
};

const isTlsRedis = env.REDIS_URL.startsWith("rediss://");

const redisOptions = {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  enableReadyCheck: false,
  tls: isTlsRedis ? {} : undefined
} as const;

export const redis =
  globalForRedis.redis ??
  new IORedis(env.REDIS_URL, redisOptions);

export const redisPub =
  globalForRedis.redisPub ??
  new IORedis(env.REDIS_URL, redisOptions);

redis.on("error", () => {
  // 路由处理器会在真实命令处暴露 Redis 错误，这里只避免构建期未处理异常。
});

redisPub.on("error", () => {
  // 路由处理器会在真实命令处暴露 Redis 错误，这里只避免构建期未处理异常。
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
  globalForRedis.redisPub = redisPub;
}
