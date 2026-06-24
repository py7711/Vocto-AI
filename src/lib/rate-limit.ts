import {redis} from "@/lib/redis";

export async function assertRateLimit(key: string, limit: number, windowSeconds: number) {
  const redisKey = `rate:${key}`;
  const count = await redis.incr(redisKey);

  if (count === 1) {
    await redis.expire(redisKey, windowSeconds);
  }

  if (count > limit) {
    throw new Error("RATE_LIMITED");
  }

  return {
    remaining: Math.max(0, limit - count),
    resetSeconds: await redis.ttl(redisKey)
  };
}
