import {z} from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  KV_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(16).default("votxt-local-development-secret"),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().default("votxt-media"),
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
  GOOGLE_CLIENT_SECRET: z.string().optional()
});

const parsed = envSchema.parse(process.env);

function resolveRedisUrl() {
  const url = parsed.REDIS_URL || parsed.UPSTASH_REDIS_URL || parsed.KV_URL || "redis://localhost:6379";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    throw new Error(
      "BullMQ requires an Upstash Redis protocol URL, not the REST URL. Use REDIS_URL/UPSTASH_REDIS_URL/KV_URL with redis:// or rediss://."
    );
  }

  return url;
}

export const env = {
  ...parsed,
  REDIS_URL: resolveRedisUrl()
};
