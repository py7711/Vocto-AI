import IORedis from "ioredis";
import {env} from "@/lib/env";

const globalForRedis = globalThis as unknown as {
  redis?: IORedis;
  redisPub?: IORedis;
};

export const redis =
  globalForRedis.redis ??
  new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null
  });

export const redisPub =
  globalForRedis.redisPub ??
  new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
  globalForRedis.redisPub = redisPub;
}
