# Votxt

Votxt 是一个基于 Next.js 的 SaaS 工作区，专注于音视频转录和 AI 后处理。它支持本地媒体上传、YouTube 链接、区分发言人的转录文本、摘要、思维导图、问答、翻译以及数据导出。

## 技术栈

- **Next.js App Router**：用于构建用户界面和路由处理程序
- **Prisma + TiDB Cloud**：用于持久化存储任务、转录文本、订阅、导出以及分析洞察数据
- **Upstash Redis + BullMQ**：用于速率限制、异步任务处理以及基于 SSE（服务器发送事件）的状态分发
- **Cloudflare R2**：用于存储原始媒体文件和导出文件
- **Groq Whisper、Deepgram 和 AssemblyAI**：提供转录服务，并具备服务商备用切换机制
- **FFmpeg 和 yt-dlp**：用于生产环境下的媒体文件预处理钩子（Hooks）

## 项目配置

1. 安装依赖：
```bash
pnpm install
```


2. 复制环境变量模板：

```bash
cp .env.example .env
```

3. 填写 `.env` 文件中的 `DATABASE_URL`、Upstash Redis 协议连接、R2 凭证以及至少一个语音转文字（STT）服务商的 API 密钥。

Upstash Redis 请使用 Redis 协议地址，通常是 `rediss://`：

```bash
REDIS_URL="rediss://default:PASSWORD@HOST.upstash.io:6379"
```

也支持使用 `UPSTASH_REDIS_URL` 或 Vercel KV 的 `KV_URL`。不要把 `UPSTASH_REDIS_REST_URL` 填给 BullMQ，REST API 不支持队列 Worker 需要的 Redis 连接和阻塞命令。

4. 生成并推送数据库架构（Schema）:

```bash
pnpm run prisma:generate
pnpm run prisma:push
```

如果需要保留 MySQL 字段中文注释，可以直接导入 [prisma/sql/000_schema_with_comments.sql](./prisma/sql/000_schema_with_comments.sql)。该脚本会重建全部业务表，只适合空库或可重建环境。

如果是旧库升级，需要先备份数据库，再按顺序执行增量 SQL：

```bash
pnpm exec prisma db execute --file prisma/sql/003_auth_fields.sql --schema prisma/schema.prisma
pnpm exec prisma db execute --file prisma/sql/004_optimize_field_lengths.sql --schema prisma/schema.prisma
pnpm exec prisma db execute --file prisma/sql/005_oauth_email_verification.sql --schema prisma/schema.prisma
pnpm exec prisma db execute --file prisma/sql/006_usage_ledger.sql --schema prisma/schema.prisma
pnpm exec prisma db execute --file prisma/sql/007_enterprise_workspace.sql --schema prisma/schema.prisma
pnpm exec prisma db execute --file prisma/sql/008_share_links.sql --schema prisma/schema.prisma
pnpm exec prisma db execute --file prisma/sql/009_webhook_endpoints.sql --schema prisma/schema.prisma
pnpm exec prisma db execute --file prisma/sql/010_align_free_plan_defaults.sql --schema prisma/schema.prisma
```

SQL 文件说明和字段长度优化原则见 [prisma/sql/README.md](./prisma/sql/README.md)。

5. 在不同的终端窗口中分别运行 Web 应用和 Worker 进程：
```bash
pnpm run dev
pnpm run worker
```

打开 `http://localhost:3000`。

## 注意事项

- 免费和付费的配额字段已在 Prisma 中建模。任务创建会预留分钟，Worker 完成后按实际时长结算，失败时释放预留分钟，并通过 `UsageLedger` 保存用量流水。仪表盘会调用 `/api/teams/current/usage` 展示真实今日文件数、账期分钟、剩余分钟、本月任务数和最近流水。
- 仪表盘资产管理支持 Transcription / Translation 双视图。服务端提供 `/api/teams/current/assets?type=transcriptions|translations`，翻译资产来自 `AIInsight.TRANSLATION`。
- 企业团队空间已建模。用户登录后会自动拥有默认团队，团队支持成员邀请、API Key、审计日志和任务团队归属。
- 转写结果支持创建公开分享链接。分享 Token 明文只存在 URL 中，数据库只保存哈希，并提供公开只读页面和公开导出接口。
- 企业 Webhook 支持任务完成、任务失败和分享链接创建事件。签名密钥明文只返回一次，投递记录会保存响应状态和错误摘要。
- `src/server/media/prepare.ts` 包含了 FFmpeg 和 yt-dlp 的命令封装。Worker 的结构设计支持在调用 STT 之前，先对上传的音频进行规范化（Normalization）处理.
- YouTube 任务会在 Worker 中使用 `yt-dlp --get-url` 来解析出直接的音频流，然后再调用备用服务商进行转录。
- AssemblyAI 的集成使用了官方的 Node SDK，并支持 `speech_models`（语音模型）、`speaker_labels`（发言人标签）以及语言检测和服务器端密钥处理.

## 文档

- 企业级商业化产品文档：[product-doc.md](./product-doc.md)
- Vercel 和云服务商部署文档：[docs/deployment.md](./docs/deployment.md)
