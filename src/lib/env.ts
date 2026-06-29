import {z} from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  TRANSCRIBE_QUEUE: z.string().optional(),
  UPSTASH_REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  KV_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(16).default("uniscribe-local-development-secret"),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().default("uniscribe-media"),
  R2_PUBLIC_BASE_URL: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  DEEPGRAM_API_KEY: z.string().optional(),
  ASSEMBLYAI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_BASE_URL: z.string().url().default("https://api.deepseek.com"),
  DEEPSEEK_CHAT_MODEL: z.string().default("deepseek-v4"),
  DEEPSEEK_FLASH_MODEL: z.string().default("deepseek-v4-flash"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-1.5-flash"),
  DEEPL_API_KEY: z.string().optional(),
  DEEPL_API_URL: z.string().url().default("https://api-free.deepl.com/v2/translate"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_BASIC: z.string().optional(),
  STRIPE_PRICE_STANDARD: z.string().optional(),
  STRIPE_PRICE_PRO: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  YT_DLP_PATH: z.string().optional(),
  FFMPEG_PATH: z.string().optional(),
  FFPROBE_PATH: z.string().optional(),
  AUDIO_CHUNK_TARGET_SECONDS: z.coerce.number().int().positive().default(900),
  AUDIO_CHUNK_MIN_SECONDS: z.coerce.number().int().positive().default(420),
  AUDIO_CHUNK_MAX_SECONDS: z.coerce.number().int().positive().default(1200)
});

const parsed = envSchema.parse(process.env);

function resolveRedisUrl() {
  const url = parsed.REDIS_URL || parsed.UPSTASH_REDIS_URL || parsed.KV_URL || "redis://localhost:6379";

  // BullMQ 使用 Redis 的阻塞命令和连接级能力，Upstash REST URL 只支持 HTTP 请求。
  // 如果把 REST URL 传给 ioredis，错误会在 worker 启动或队列消费时才暴露，排障成本很高。
  if (url.startsWith("http://") || url.startsWith("https://")) {
    throw new Error(
      "BullMQ 需要 Upstash Redis 协议地址，不能使用 REST URL。请在 REDIS_URL/UPSTASH_REDIS_URL/KV_URL 中配置 redis:// 或 rediss://。"
    );
  }

  return url;
}

export const env = {
  ...parsed,
  REDIS_URL: resolveRedisUrl()
};
