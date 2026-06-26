# Votxt 部署文档

本文档说明如何把 Votxt 部署到 Vercel，并给出云服务商独立部署方案。所有配置说明均为中文，便于交付和运维。

## 1. 部署架构

推荐生产架构：

- Web 应用：Vercel 托管 Next.js。
- Worker：独立云服务器、容器平台或 Railway/Fly.io/Render 运行 `pnpm run worker`。
- 数据库：TiDB Cloud 或 MySQL 8。
- Redis：Upstash Redis，必须使用 Redis 协议 URL。
- 对象存储：Cloudflare R2。
- 转写服务：Groq、Deepgram、AssemblyAI。
- AI 洞察：deepseek-v4、Gemini、Groq。
- 翻译：DeepL、deepseek-v4-flash。

## 2. 环境变量

### 2.1 基础变量

```bash
DATABASE_URL="mysql://USER:PASSWORD@HOST:4000/votxt?sslaccept=strict"
REDIS_URL="rediss://default:PASSWORD@HOST.upstash.io:6379"
NEXT_PUBLIC_APP_URL="https://你的域名"
AUTH_SECRET="至少 32 位的随机字符串"
```

注意：BullMQ 必须使用 `redis://` 或 `rediss://`，不要使用 Upstash REST URL。

### 2.2 Cloudflare R2

```bash
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET="votxt-media"
R2_PUBLIC_BASE_URL="https://media.example.com"
```

R2 需要创建 Bucket，并配置允许浏览器 PUT 的 CORS 策略。

### 2.3 转写服务商

```bash
GROQ_API_KEY=""
DEEPGRAM_API_KEY=""
ASSEMBLYAI_API_KEY=""
```

降级顺序：

- 开启发言人识别：Deepgram -> AssemblyAI -> Groq。
- 关闭发言人识别：Groq -> Deepgram -> AssemblyAI。

### 2.4 AI 洞察

```bash
DEEPSEEK_API_KEY=""
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_CHAT_MODEL="deepseek-v4"
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-1.5-flash"
GROQ_API_KEY=""
```

降级顺序：deepseek-v4 -> Gemini -> Groq -> 本地规则兜底。

### 2.5 翻译服务

```bash
DEEPL_API_KEY=""
DEEPL_API_URL="https://api-free.deepl.com/v2/translate"
DEEPSEEK_FLASH_MODEL="deepseek-v4-flash"
```

降级顺序：DeepL -> deepseek-v4-flash -> 原文兜底。

### 2.6 商业化变量

```bash
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_BASIC=""
STRIPE_PRICE_STANDARD=""
STRIPE_PRICE_PRO=""
```

当前已实现 Stripe Checkout、Customer Portal 和 Webhook 路由。生产环境还需要在 Stripe 后台创建三个订阅价格，并把 Price ID 填入：

- `STRIPE_PRICE_BASIC`：Basic 月付价格。
- `STRIPE_PRICE_STANDARD`：Standard 月付价格。
- `STRIPE_PRICE_PRO`：Pro 月付价格。

Stripe Webhook Endpoint 配置为：

```bash
https://你的域名/api/billing/webhook
```

建议订阅以下事件：

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### 2.7 认证与邮件变量

```bash
RESEND_API_KEY=""
EMAIL_FROM="Votxt <no-reply@example.com>"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

Google OAuth 回调地址需要在 Google Cloud Console 中配置为：

```bash
https://你的域名/api/auth/google/callback
```

邮箱验证使用 Resend REST API。未配置 `RESEND_API_KEY` 时，注册接口仍会生成验证链接并返回给前端，方便本地和测试环境完成验证流程。

## 3. Vercel 部署步骤

1. 推送代码到 GitHub。
2. 在 Vercel 导入项目。
3. Framework 选择 Next.js。
4. Build Command 使用：

```bash
pnpm build
```

5. Install Command 使用：

```bash
pnpm install
```

6. 在 Vercel Project Settings -> Environment Variables 填写所有生产环境变量。
7. 部署完成后访问：

```bash
https://你的域名/zh
https://你的域名/zh/dashboard
https://你的域名/zh/pricing
```

## 4. 数据库初始化

在本地或 CI 中执行：

```bash
pnpm run prisma:generate
pnpm run prisma:push
```

如需要直接执行带中文注释的 MySQL 建表 SQL：

```bash
mysql -h HOST -u USER -p DATABASE < prisma/sql/000_schema_with_comments.sql
```

注意：`000_schema_with_comments.sql` 会先删除再重建业务表，只适合空库、测试库或确认可重建的环境。已有生产数据请使用后续增量脚本，并先完成数据库备份。SQL 执行顺序、字段长度依据和 Prisma 对齐要求见 [prisma/sql/README.md](../prisma/sql/README.md)。

导入演示数据：

```bash
mysql -h HOST -u USER -p DATABASE < prisma/sql/001_initial_data.sql
mysql -h HOST -u USER -p DATABASE < prisma/sql/002_test_data.sql
```

如果是从旧版本升级到带真实认证字段的版本，需要执行：

```bash
pnpm exec prisma db execute --file prisma/sql/003_auth_fields.sql --schema prisma/schema.prisma
```

如果部署环境无法使用 Prisma 执行 SQL，也可以通过数据库控制台执行 [prisma/sql/003_auth_fields.sql](../prisma/sql/003_auth_fields.sql)。

如果是从旧版字段长度升级到当前商业化版本，需要继续执行字段长度优化脚本：

```bash
pnpm exec prisma db execute --file prisma/sql/004_optimize_field_lengths.sql --schema prisma/schema.prisma
```

该脚本会补齐邮箱、文件名、URL、对象存储 Key、服务商、模型名等字段的 MySQL 长度和中文注释。

如果是从没有 OAuth 和邮箱验证表的版本升级，需要继续执行：

```bash
pnpm exec prisma db execute --file prisma/sql/005_oauth_email_verification.sql --schema prisma/schema.prisma
```

该脚本会创建 `OAuthAccount` 和 `EmailVerificationToken`，字段均包含中文注释。

如果是从没有用量流水表的版本升级，需要继续执行：

```bash
pnpm exec prisma db execute --file prisma/sql/006_usage_ledger.sql --schema prisma/schema.prisma
```

该脚本会创建 `UsageLedger`，用于记录任务预留、实际结算、失败释放和手工调整等额度变化。

如果是从没有企业团队空间的版本升级，需要继续执行：

```bash
pnpm exec prisma db execute --file prisma/sql/007_enterprise_workspace.sql --schema prisma/schema.prisma
```

该脚本会创建 `Team`、`TeamMember`、`ApiKey`、`AuditLog`，扩展 `MediaTask.teamId`，并把订阅套餐枚举对齐为 Free、Basic、Standard、Pro、Team、Enterprise。上线后老用户首次登录会自动补齐默认团队。

如果是从没有公开分享链接的版本升级，需要继续执行：

```bash
pnpm exec prisma db execute --file prisma/sql/008_share_links.sql --schema prisma/schema.prisma
```

该脚本会创建 `ShareLink`，用于保存公开分享 Token 哈希、任务关联、过期时间和访问统计。

如果是从没有企业 Webhook 的版本升级，需要继续执行：

```bash
pnpm exec prisma db execute --file prisma/sql/009_webhook_endpoints.sql --schema prisma/schema.prisma
```

该脚本会创建 `WebhookEndpoint` 和 `WebhookDelivery`，用于保存团队回调地址、签名密钥哈希、订阅事件和每次投递记录。

如果旧库的 Free 套餐默认值仍是 90 分钟，需要继续执行：

```bash
pnpm exec prisma db execute --file prisma/sql/010_align_free_plan_defaults.sql --schema prisma/schema.prisma
```

该脚本会把 `Subscription.monthlyMinuteQuota` 和 `Subscription.remainingMinutes` 的默认值统一为 120，并修正仍保持 90 分钟默认额度的 Free 订阅。

## 5. Worker 部署

Vercel 不适合长期运行 BullMQ Worker，Worker 应独立部署。

### 5.1 云服务器部署

1. 准备 Node.js 20。
2. 拉取代码。
3. 安装依赖：

```bash
pnpm install
```

4. 配置 `.env.production` 或系统环境变量。
5. 启动 Worker：

```bash
pnpm run worker
```

6. 推荐使用 PM2：

```bash
pm2 start "pnpm run worker" --name votxt-worker
pm2 save
```

### 5.2 Docker 部署建议

Web 和 Worker 可以使用同一镜像，不同启动命令：

- Web：`pnpm start`
- Worker：`pnpm run worker`

Worker 容器必须能访问 Redis、数据库、R2 和所有 AI 服务商。

## 6. Cloudflare R2 CORS

示例 CORS：

```json
[
  {
    "AllowedOrigins": ["https://你的域名"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## 7. 生产检查清单

- `pnpm build` 通过。
- `/zh`、`/zh/auth/signup`、`/zh/dashboard`、`/zh/pricing`、`/zh/blog`、`/zh/blog/public-video-to-text-workflow`、`/zh/terms`、`/zh/privacy` 可访问。
- `/api/auth/register`、`/api/auth/login`、`/api/auth/me`、`/api/auth/verify-email` 可用，Cookie 使用 httpOnly。
- Google OAuth 回调地址已配置，`/api/auth/google/start` 可以跳转到 Google 授权页。
- `/api/tasks`、`/api/tasks/:taskId`、`/api/tasks/:taskId/events`、`/api/tasks/:taskId/transcript`、`/api/tasks/:taskId/insights`、`/api/tasks/:taskId/exports/:format` 均会校验任务归属。
- `User` 表包含 `password_hash`、`role`、`email_verified_at`、`last_login_at` 字段。
- 数据库包含 `OAuthAccount` 和 `EmailVerificationToken` 表。
- 数据库包含 `UsageLedger` 表，任务创建会预留分钟，任务完成会按实际时长结算，任务失败会释放预留分钟。
- 数据库包含 `Team`、`TeamMember`、`ApiKey`、`AuditLog` 表，`MediaTask` 包含 `teamId` 字段。
- 数据库包含 `ShareLink` 表。
- 数据库包含 `WebhookEndpoint` 和 `WebhookDelivery` 表。
- 已执行 `prisma/sql/004_optimize_field_lengths.sql`，或新库直接使用最新 Prisma schema/初始化 SQL。
- 已执行 `prisma/sql/007_enterprise_workspace.sql`，或新库直接使用最新 Prisma schema/初始化 SQL。
- 已执行 `prisma/sql/008_share_links.sql`，或新库直接使用最新 Prisma schema/初始化 SQL。
- 已执行 `prisma/sql/009_webhook_endpoints.sql`，或新库直接使用最新 Prisma schema/初始化 SQL。
- 已执行 `prisma/sql/010_align_free_plan_defaults.sql`，或确认新库 Free 套餐默认额度为 120 分钟。
- `/api/teams/current`、`/api/teams/current/usage`、`/api/teams/current/assets`、`/api/teams/current/members`、`/api/teams/current/api-keys`、`/api/teams/current/webhooks`、`/api/teams/current/audit-logs` 可用。
- 仪表盘能显示真实今日文件数、账期分钟、剩余分钟、本月任务数、Transcription / Translation 资产双视图、企业控制台、成员、API Key、Webhook、审计日志和用量流水。
- 使用企业 API Key 调用任务接口时，请在请求头添加 `Authorization: Bearer votxt_live_...`。`POST /api/tasks` 会创建团队任务并扣减团队所有者订阅额度，任务详情、SSE、编辑稿、AI 洞察和导出接口也会按 API Key 所属团队校验访问权限。
- `/api/tasks/:taskId/share` 可创建公开分享链接，`/[locale]/share/:token` 和 `/api/share/:token/exports/:format` 可公开只读访问。
- Webhook 投递会在任务完成、任务失败和分享链接创建时触发，并携带 `X-Votxt-Signature`、`X-Votxt-Timestamp`、`X-Votxt-Event` 请求头。
- Stripe 已配置 `STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET`、`STRIPE_PRICE_BASIC`、`STRIPE_PRICE_STANDARD`、`STRIPE_PRICE_PRO`。
- Stripe Webhook Endpoint 指向 `/api/billing/webhook`，并订阅 Checkout 与 Subscription 事件。
- `/api/uploads` 在 R2 配置后可返回上传 URL。
- `/api/tasks` 在 Redis 和数据库配置后可创建任务，也可返回当前团队历史任务列表。
- Worker 能消费 `votxt-transcribe` 队列。
- Groq、Deepgram、AssemblyAI 至少配置一个。
- DeepL 或 DeepSeek 至少配置一个翻译服务。
- deepseek-v4、Gemini、Groq 至少配置一个 AI 洞察服务。
- 日志中无 Redis REST URL 误用。

## 8. 监控与告警

建议监控：

- API 错误率。
- BullMQ 队列等待数、失败数、平均耗时。
- Redis 连接错误。
- 数据库慢查询。
- R2 上传失败。
- 各 AI 服务商失败率和降级次数。
- 用户额度扣减异常。

## 9. 回滚策略

- Web 应用使用 Vercel Deployment 回滚。
- Worker 使用上一版本镜像或 PM2 进程回滚。
- 数据库变更必须先备份，重大结构变更使用迁移脚本。
- 服务商密钥泄漏时立即轮换，并清理 Vercel、云服务器和 CI 环境变量。
