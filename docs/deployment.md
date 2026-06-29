# UniScribe 部署文档

本文档说明如何把 UniScribe 部署到 Vercel，并给出云服务商独立部署方案。所有配置说明均为中文，便于交付和运维。

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
DATABASE_URL="mysql://USER:PASSWORD@HOST:4000/uniscribe?sslaccept=strict"
REDIS_URL="rediss://default:PASSWORD@HOST.upstash.io:6379"
TRANSCRIBE_QUEUE="uniscribe-transcribe"
NEXT_PUBLIC_APP_URL="https://你的域名"
AUTH_SECRET="至少 32 位的随机字符串"
```

注意：BullMQ 必须使用 `redis://` 或 `rediss://`，不要使用 Upstash REST URL。

### 2.2 Cloudflare R2

```bash
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET="uniscribe-media"
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

当前已实现 Stripe 支付会话、客户订阅管理入口和 Webhook 路由。生产环境还需要在 Stripe 后台创建三个订阅价格，并把价格 ID 填入：

- `STRIPE_PRICE_BASIC`：Basic 月付价格。
- `STRIPE_PRICE_STANDARD`：Standard 月付价格。
- `STRIPE_PRICE_PRO`：Pro 月付价格。

Stripe Webhook 回调地址配置为：

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
EMAIL_FROM="UniScribe <no-reply@example.com>"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

Google OAuth 回调地址需要在 Google Cloud Console 中配置为：

```bash
https://你的域名/api/auth/google/callback
```

如果启用 Google Drive 导入，还需要在同一个 OAuth 客户端中加入：

```bash
https://你的域名/api/google-drive/callback
```

邮箱验证使用 Resend REST API。未配置 `RESEND_API_KEY` 时，注册接口仍会生成验证链接并返回给前端，方便本地和测试环境完成验证流程。

### 2.8 媒体解析依赖

公开视频链接解析、视频元数据读取、字幕列表读取和 Worker 中的 YouTube 音频流解析依赖 `yt-dlp`。应用启动后会依次尝试：

1. `YT_DLP_PATH` 指定的可执行文件。
2. 系统 PATH 中的 `yt-dlp`。
3. `python3 -m yt_dlp`。
4. `python -m yt_dlp`。

推荐在 Worker 所在服务器或容器中安装：

```bash
python3 -m pip install -U yt-dlp
```

如果部署平台的 Node 进程 PATH 找不到 `yt-dlp`，请显式配置：

```bash
YT_DLP_PATH="/usr/local/bin/yt-dlp"
```

未安装或未配置时，`/api/media/resolve` 会返回可用的基础 URL 信息，但无法提供详细媒体标题、时长、缩略图等元数据；Worker 处理公开视频转写时也无法解析直连音频流。

## 3. Vercel 部署步骤

1. 推送代码到 GitHub。
2. 在 Vercel 导入项目。
3. 框架选择 Next.js。
4. 构建命令使用：

```bash
pnpm build
```

5. 安装命令使用：

```bash
pnpm install
```

6. 在 Vercel 项目设置的环境变量页面填写所有生产环境变量。
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
mysql -h HOST -u USER -p DATABASE < prisma/sql/all.sql
```

注意：`all.sql` 会先删除再重建业务表，只适合空库、测试库或确认可重建的环境。该脚本已经包含基础数据、演示数据、QA 测试数据和全部当前业务表。生产环境若不需要种子数据，可按 [prisma/sql/README.md](../prisma/sql/README.md) 的说明删除脚本中的种子数据段落后再导入。

当前仓库只保留合并后的 SQL 交付脚本。已有生产库升级前必须先完成数据库备份，再以 `prisma/schema.prisma` 和 `prisma/sql/all.sql` 对照生成迁移方案；不要把 `all.sql` 直接导入已有生产库。需要追溯旧版本增量脚本时，请从对应发布版本或 Git 历史中恢复。

当前完整模型包含 `User`、`OAuthAccount`、`GoogleDriveConnection`、`EmailVerificationToken`、`Subscription`、`UsageLedger`、`Folder`、`MediaTask`、`MediaAsset`、`Transcript`、`TranscriptRating`、`AIInsight`、`ShareLink`、`ExportAsset` 以及公开 API/Webhook 兼容层使用的团队相关表。

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
pm2 start "pnpm run worker" --name uniscribe-worker
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
- `/zh`、`/zh/auth/signup`、`/zh/dashboard`、`/zh/pricing`、`/zh/blog`、`/zh/blog/audio-to-srt-online-free-guide`、`/zh/terms-of-service`、`/zh/privacy-policy` 可访问。
- `/api/auth/register`、`/api/auth/login`、`/api/auth/me`、`/api/auth/verify-email` 可用，Cookie 使用 httpOnly。
- Google OAuth 回调地址已配置，`/api/auth/google/start` 可以跳转到 Google 授权页。
- `/api/tasks`、`/api/tasks/:taskId`、`/api/tasks/:taskId/events`、`/api/tasks/:taskId/transcript`、`/api/tasks/:taskId/insights`、`/api/tasks/:taskId/exports/:format` 均会校验任务归属。
- `User` 表包含 `password_hash`、`role`、`email_verified_at`、`last_login_at` 字段。
- 数据库包含 `OAuthAccount` 和 `EmailVerificationToken` 表。
- 数据库包含 `UsageLedger` 表，任务创建会预留分钟，任务完成会按实际时长结算，任务失败会释放预留分钟。
- 数据库包含 `ShareLink` 表。
- 数据库结构已与 `prisma/schema.prisma` 对齐；空库可使用 `prisma/sql/all.sql`，已有生产库需使用经过审核的迁移方案。
- `/api/account/usage` 可返回当前个人账号的套餐、今日文件数、账期分钟、剩余分钟、本月任务数和最近流水。
- 仪表盘能显示真实今日文件数、账期分钟、剩余分钟、本月任务数、转写和翻译资产双视图、个人任务列表和用量流水。
- `/api/tasks/:taskId/share` 可创建公开分享链接，`/[locale]/share/:token` 和 `/api/share/:token/exports/:format` 可公开只读访问。
- Stripe 已配置 `STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET`、`STRIPE_PRICE_BASIC`、`STRIPE_PRICE_STANDARD`、`STRIPE_PRICE_PRO`。
- Stripe Webhook 回调地址指向 `/api/billing/webhook`，并订阅支付会话与订阅事件。
- `/api/upload/generate-signed-url` 在 R2 配置后可返回上传 URL；`/api/uploads` 作为旧工作台兼容别名保留。
- `/api/tasks` 在 Redis 和数据库配置后可创建任务，也可返回当前个人账号历史任务列表。
- Worker 能消费 `TRANSCRIBE_QUEUE` 配置的队列，默认是 `uniscribe-transcribe`。
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
