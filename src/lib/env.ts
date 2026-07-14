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
  STRIPE_PRICE_BASIC_MONTHLY: z.string().optional(),
  STRIPE_PRICE_STANDARD_MONTHLY: z.string().optional(),
  STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_BASIC_ANNUAL: z.string().optional(),
  STRIPE_PRICE_STANDARD_ANNUAL: z.string().optional(),
  STRIPE_PRICE_PRO_ANNUAL: z.string().optional(),
  STRIPE_PRICE_LITE: z.string().optional(),
  STRIPE_PRICE_PLUS: z.string().optional(),
  STRIPE_PRICE_ADDON_BASIC: z.string().optional(),
  STRIPE_PRICE_ADDON_STANDARD: z.string().optional(),
  STRIPE_PRICE_ADDON_PRO: z.string().optional(),
  // Basic 年付限时活动：可配置 Stripe Promotion Code ID、Coupon ID，或用户可见的促销码。
  STRIPE_BASIC_ANNUAL_PROMOTION_CODE_ID: z.string().optional(),
  STRIPE_BASIC_ANNUAL_COUPON_ID: z.string().optional(),
  STRIPE_BASIC_ANNUAL_PROMOTION_CODE: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  // SMTP 邮件发送（如 Spacemail）：配置 SMTP_HOST 后优先于 Resend 使用。
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  YT_DLP_PATH: z.string().optional(),
  // 可选：Netscape 格式的 YouTube cookies 文件，用于绕过数据中心 IP 的 bot 检测。
  YT_DLP_COOKIES_PATH: z.string().optional(),
  YTDOWN_ENABLED: z
    .string()
    .optional()
    .transform((value) => value === undefined || value === "true"),
  YTDOWN_URL: z.string().url().default("https://app.ytdown.to/zh31/youtube-to-mp3/"),
  YTDOWN_BROWSER_EXECUTABLE_PATH: z.string().optional(),
  // 可选：FlareSolverr 基址，用于绕过 YTDown 站点的 Cloudflare。例如 http://flaresolverr:8191
  YTDOWN_FLARESOLVERR_URL: z.string().url().optional(),
  YTDOWN_RESOLVE_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  YTDOWN_POLL_TIMEOUT_MS: z.coerce.number().int().positive().default(90_000),
  YTDOWN_CHALLENGE_COOLDOWN_MS: z.coerce.number().int().positive().default(10 * 60_000),
  FFMPEG_PATH: z.string().optional(),
  FFPROBE_PATH: z.string().optional(),
  AUDIO_CHUNK_TARGET_SECONDS: z.coerce.number().int().positive().default(900),
  AUDIO_CHUNK_MIN_SECONDS: z.coerce.number().int().positive().default(420),
  AUDIO_CHUNK_MAX_SECONDS: z.coerce.number().int().positive().default(1200),
  // 服务商 webhook 回调的公网基础地址，为空时回退到 NEXT_PUBLIC_APP_URL。
  TRANSCRIPTION_CALLBACK_BASE_URL: z.string().url().optional(),
  // 提交异步任务后等待回调的最长秒数，超时自动查询服务商 API 兜底。
  TRANSCRIPTION_CALLBACK_TIMEOUT_SECONDS: z.coerce.number().int().positive().default(1200),
  // 未收到回调时轮询服务商结果的间隔秒数。
  TRANSCRIPTION_POLL_INTERVAL_SECONDS: z.coerce.number().int().positive().default(6)
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
  REDIS_URL: resolveRedisUrl(),
  // 465 端口通常使用隐式 TLS（SMTPS），587/25 通常使用 STARTTLS。
  SMTP_SECURE: parsed.SMTP_SECURE ?? parsed.SMTP_PORT === 465
};
