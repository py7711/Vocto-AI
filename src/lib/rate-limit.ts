import {redis} from "@/lib/redis";

export async function assertRateLimit(key: string, limit: number, windowSeconds: number) {
  const redisKey = `rate:${key}`;
  const count = await redis.incr(redisKey);

  if (count === 1) {
    // 第一次命中时设置窗口过期时间；后续 incr 不刷新 TTL，形成固定窗口限流。
    await redis.expire(redisKey, windowSeconds);
  }

  if (count > limit) {
    // 调用方用 RATE_LIMITED 作为稳定错误码，再映射成对应语言的用户提示。
    throw new Error("RATE_LIMITED");
  }

  return {
    remaining: Math.max(0, limit - count),
    resetSeconds: await redis.ttl(redisKey)
  };
}
