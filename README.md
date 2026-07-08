# Votxt

Votxt 是一个基于 Next.js 的个人 AI 音视频转写工作区，专注于上传、公开视频链接、浏览器录音、转写、摘要、思维导图、问答、翻译、公开分享和多格式导出。

## 技术栈

- **Next.js App Router**：用于构建用户界面和路由处理程序
- **Prisma + TiDB Cloud**：用于持久化存储任务、转录文本、订阅、导出以及分析洞察数据
- **Upstash Redis + BullMQ**：用于速率限制、异步任务处理以及基于 SSE（服务器发送事件）的状态分发
- **Cloudflare R2**：用于存储原始媒体文件和导出文件
- **Groq Whisper、Deepgram 和 AssemblyAI**：提供转录服务，并具备服务商备用切换机制
- **yt-dlp**：用于公开视频直链解析、媒体元数据读取、YouTube 字幕列表和字幕下载

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

4. 安装或配置 `yt-dlp`。公开视频链接解析、视频元数据读取和 YouTube 音频流解析都依赖它。应用会依次尝试 `YT_DLP_PATH`、`yt-dlp`、`python3 -m yt_dlp`、`python -m yt_dlp`：

```bash
# 任选一种安装方式
brew install yt-dlp
python3 -m pip install -U yt-dlp

# 如果 yt-dlp 不在 Node 进程 PATH 中，在 .env 显式指定路径
YT_DLP_PATH="/usr/local/bin/yt-dlp"
```

5. 生成并推送数据库架构（Schema）:

```bash
pnpm run prisma:generate
pnpm run prisma:push
```

如果需要保留 MySQL 字段中文注释，可以直接导入 [prisma/sql/all.sql](./prisma/sql/all.sql)。该脚本会重建全部业务表，并写入演示数据与 QA 测试数据，只适合空库、测试库或确认可重建的环境。

当前仓库只保留合并后的 SQL 交付脚本。已有生产库升级前必须先备份数据库，再以 `prisma/schema.prisma` 和 `prisma/sql/all.sql` 对照生成迁移方案；不要把 `all.sql` 直接导入已有生产库。

个人版页面不展示团队工作区、成员管理和审计日志，但当前数据库模型里的分享、公开 API 和 Webhook 兼容层仍复用 `Team` 外键结构。`MediaAsset` 用于保存原始媒体、标准化音频和长音频切片，支撑播放、下载、重转写和大文件处理。

SQL 文件说明和字段长度优化原则见 [prisma/sql/README.md](./prisma/sql/README.md)。

QA 测试账号为 `qa@votxt.local`，原始密码为 `aa123456`。浏览器登录时会提交 `sha256(votxt-password-v1:${password})` 格式的 `passwordCredential`，SQL 种子数据保存的是该 credential 的 scrypt 哈希。修改认证算法或测试密码后，请运行：

```bash
pnpm run auth:seed:check
```

6. 在不同的终端窗口中分别运行 Web 应用和 Worker 进程：
```bash
pnpm run dev
pnpm run worker
```

打开 `http://localhost:3000`。

## 维护检查

整理项目结构、文档或静态资源后，建议运行：

```bash
pnpm run docs:check
pnpm run assets:check
pnpm run auth:seed:check
pnpm run deps:check
pnpm run source:check
pnpm run structure:check
pnpm run unused:check
./node_modules/.bin/tsc --noEmit
```

其中 `docs:check` 用于确认项目 Markdown 文档都已登记、保持中文交付口径且没有旧品牌或克隆过程残留；`assets:check` 用于确认 `public` 静态资源仍有真实引用；`auth:seed:check` 用于确认 QA 测试账号种子密码与登录算法一致；`deps:check` 用于发现疑似未使用的 package 依赖；`source:check` 用于确认源码可由 Next 路由、Worker、脚本或配置入口静态追踪到，并检查关键边界文件的中文注释覆盖；`structure:check` 用于确认路由文件没有完全重复、`@/app` 代理目标存在、产品文档覆盖当前页面和 API、Prisma 模型与 `all.sql` 表结构一致；`unused:check` 用于发现未使用的声明、导入、参数和类型残留。

## 注意事项

- 免费和付费的配额字段已在 Prisma 中建模。任务创建会预留分钟，Worker 完成后按实际时长结算，失败时释放预留分钟，并通过 `UsageLedger` 保存用量流水。仪表盘会调用 `/api/account/usage` 展示真实今日文件数、账期分钟、剩余分钟、本月任务数和最近流水。
- 仪表盘资产管理支持转写和翻译双视图。`GET /api/tasks` 会返回当前个人账号的历史任务，翻译资产来自 `AIInsight.TRANSLATION`。
- 产品定位为个人用户使用，不包含团队工作区、成员管理、API Key、Webhook 和审计日志等历史高级管理能力。
- 转写结果支持创建公开分享链接。分享令牌明文只存在 URL 中，数据库只保存哈希，并提供公开只读页面和公开导出接口。
- `src/server/media/prepare.ts` 包含 yt-dlp 命令候选、超时控制、媒体 URL 标准化、Google Drive 公开链接解析、YouTube 元数据和字幕读取能力。当前 Worker 不再落地转码上传音频，而是把可访问媒体地址交给转写服务商处理。
- YouTube 任务会在 Worker 中使用 yt-dlp 来解析出直接的音频流；如果服务器没有安装 yt-dlp，媒体元数据会降级为 URL 标题，转写开始时也无法解析公开视频音频流。
- AssemblyAI 的集成使用官方 Node SDK，并支持 `speech_models`（语音模型）、`speaker_labels`（发言人标签）、语言检测和服务器端密钥处理。

## 文档

- 个人版产品需求文档：[product-doc.md](./product-doc.md)
- Vercel 和云服务商部署文档：[docs/deployment.md](./docs/deployment.md)
- 项目结构、清理规则和中文注释规范：[docs/project-structure.md](./docs/project-structure.md)
