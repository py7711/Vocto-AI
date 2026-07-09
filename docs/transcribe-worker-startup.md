# transcribe-worker.ts 启动说明

本文档说明 `src/worker/transcribe-worker.ts` 的启动入口、环境变量加载、Redis 队列连接、任务处理流程、失败处理和部署时的注意事项。它适合用于排查 Worker 启动失败、任务不消费、队列卡住、回调不生效等问题。

## 1. 启动入口

项目通过 npm script 启动转写 Worker：

```bash
pnpm run worker
```

对应 `package.json`：

```json
{
  "scripts": {
    "worker": "tsx src/worker/transcribe-worker.ts"
  }
}
```

因此 Worker 是一个独立 Node.js 进程，由 `tsx` 直接执行 TypeScript 文件。它不是 Next.js 服务，不会执行 `next start`，也不会启动 HTTP 端口。

## 2. 启动时会不会监听端口

不会。

`transcribe-worker.ts` 里没有 `listen()`、`createServer()` 或 Next.js server 启动逻辑。它只会：

- 加载环境变量。
- 连接 Redis。
- 创建 BullMQ Worker。
- 监听指定 Redis 队列。
- 消费转写任务。
- 访问数据库、对象存储、转写服务商和 AI 服务商。

所以 Worker 服务器不需要在 `.env` 中单独配置 `PORT`，也不需要在云服务器安全组开放 `3000`、`80`、`443` 给公网访问。云服务器通常只需要开放 SSH 给运维人员；Worker 需要的是出站访问 Redis、数据库、R2、转写服务商和 Web 应用域名。

## 3. 环境变量加载

`transcribe-worker.ts` 第一行是：

```ts
import "dotenv/config";
```

直接执行 `pnpm run worker` 时，`dotenv/config` 会默认读取项目根目录的 `.env` 文件。生产环境有两种推荐方式：

```bash
# 方式一：项目根目录直接维护 .env
cd /srv/transcribe-worker/app
pnpm run worker
```

```bash
# 方式二：systemd 通过 EnvironmentFile 注入
EnvironmentFile=/srv/transcribe-worker/app/.env.worker
ExecStart=/usr/bin/pnpm run worker
```

如果使用 systemd 的 `EnvironmentFile`，Node 进程启动前环境变量已经注入，`dotenv/config` 即使没有读到 `.env` 也不会影响这些变量。

## 4. 必要环境变量

Worker 启动和消费任务最关键的变量如下：

```bash
DATABASE_URL="mysql://USER:PASSWORD@HOST:4000/appdb?sslaccept=strict"
REDIS_URL="rediss://default:PASSWORD@HOST.upstash.io:6379"
TRANSCRIBE_QUEUE="transcribe-jobs"

NEXT_PUBLIC_APP_URL="https://你的 Web 应用域名"
TRANSCRIPTION_CALLBACK_BASE_URL="https://你的 Web 应用域名"

R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET="media-bucket"
R2_PUBLIC_BASE_URL="https://media.example.com"

GROQ_API_KEY=""
DEEPGRAM_API_KEY=""
ASSEMBLYAI_API_KEY=""

DEEPSEEK_API_KEY=""
GEMINI_API_KEY=""
DEEPL_API_KEY=""

YT_DLP_PATH="/home/appworker/.local/bin/yt-dlp"
FFMPEG_PATH="/usr/bin/ffmpeg"
FFPROBE_PATH="/usr/bin/ffprobe"
```

说明：

- `DATABASE_URL`：Worker 读取任务、写入转写结果、更新状态和处理额度时使用。
- `REDIS_URL`：BullMQ 队列连接地址，必须是 `redis://` 或 `rediss://`。
- `TRANSCRIBE_QUEUE`：Worker 监听的队列名，必须和 Web 应用入队时使用的队列名一致。
- `NEXT_PUBLIC_APP_URL`：Web 应用公网地址。
- `TRANSCRIPTION_CALLBACK_BASE_URL`：转写服务商回调地址的基础域名；未配置时回退到 `NEXT_PUBLIC_APP_URL`。
- `R2_*`：媒体文件、音频资源和导出资源使用的对象存储配置。
- `GROQ_API_KEY`、`DEEPGRAM_API_KEY`、`ASSEMBLYAI_API_KEY`：转写服务商密钥，至少配置一个。
- `YT_DLP_PATH`：公开视频链接解析依赖，YouTube 等链接任务需要它。
- `FFMPEG_PATH`、`FFPROBE_PATH`：音频处理和时长识别依赖。

## 5. Redis URL 解析

环境变量会经过 `src/lib/env.ts` 解析。Redis 地址优先级是：

```ts
REDIS_URL || UPSTASH_REDIS_URL || KV_URL || "redis://localhost:6379"
```

如果地址以 `http://` 或 `https://` 开头，进程会抛错，因为 BullMQ 需要 Redis 协议连接，不能使用 Upstash REST URL。

正确示例：

```bash
REDIS_URL="rediss://default:PASSWORD@HOST.upstash.io:6379"
```

错误示例：

```bash
REDIS_URL="https://..."
UPSTASH_REDIS_REST_URL="https://..."
```

`src/lib/redis.ts` 创建 ioredis 连接时还会设置：

```ts
maxRetriesPerRequest: null
family: 4
lazyConnect: true
enableReadyCheck: false
connectTimeout: 10000
tls: rediss 地址时启用
```

其中 `maxRetriesPerRequest: null` 是 BullMQ 阻塞命令所需配置。

## 6. createWorker 启动流程

文件末尾调用：

```ts
void createWorker();
```

`createWorker()` 会按以下顺序执行：

1. 调用 `createRedisConnection()` 创建 Redis 客户端。
2. 执行 `await connection.connect()` 主动连接 Redis。
3. 如果 Redis 连接失败，记录错误日志，断开连接，并 `process.exit(1)` 退出进程。
4. Redis 连接成功后，创建 BullMQ `Worker`。
5. 注册 `error` 事件处理。
6. 注册 `failed` 事件处理。
7. 输出启动成功日志。

启动成功日志类似：

```text
worker listening on queue transcribe-jobs
```

实际日志里的队列名取决于 `TRANSCRIBE_QUEUE` 配置。

## 7. BullMQ Worker 配置

Worker 创建时使用以下关键配置：

```ts
{
  connection,
  concurrency: 3,
  lockDuration: 300_000,
  stalledInterval: 60_000,
  maxStalledCount: 1
}
```

含义：

- `concurrency: 3`：单个 Worker 进程最多同时处理 3 个转写任务。
- `lockDuration: 300_000`：任务锁 5 分钟，避免大文件处理时被误判为卡死。
- `stalledInterval: 60_000`：每 60 秒检查一次 stalled job。
- `maxStalledCount: 1`：最多允许 1 次 stalled 重试。

如果转写压力变大，优先横向增加 Worker 实例。多个 Worker 监听同一个队列时，BullMQ 会自动分发任务。

## 8. 队列名必须一致

Web 应用入队和 Worker 消费使用同一个队列常量：

```ts
TRANSCRIBE_QUEUE = env.TRANSCRIBE_QUEUE || 默认队列名
```

生产环境建议显式设置：

```bash
TRANSCRIBE_QUEUE="transcribe-jobs"
```

并确保 Web 应用和 Worker 使用完全相同的值。如果 Web 应用和 Worker 队列名不一致，表现通常是：

- Web 端创建任务成功。
- 任务状态一直停留在排队中。
- Worker 日志显示正在监听队列，但没有消费任务。
- Redis 中另一个队列有 waiting job。

## 9. 单个任务处理流程

Worker 消费到 job 后，会读取以下 job 数据：

```ts
taskId
sourceUrl
sourceType
language
enableSpeakerLabels
subtitleEnabled
premiumModel
summaryTemplate
summaryLanguage
```

随后按以下流程处理：

1. 调用 `assertNotCanceled(taskId)`，如果任务已取消，抛出 `JobCanceledError`。
2. 调用 `isTaskCompleted(taskId)`，如果任务已完成，直接跳过，避免重复转写。
3. 更新任务状态为 `PROCESSING`，进度为 15%。
4. 从数据库读取任务记录，包括原始文件名、对象存储 key、用户 ID。
5. 如果来源是 Google Drive 分享链接，先解析为下载链接。
6. 调用 `prepareTaskAudioAsset()` 准备音频资源。
7. 如果任务有用户 ID，调用额度检查逻辑，确认剩余分钟数足够。
8. 再次检查任务是否取消。
9. 更新任务状态为 `TRANSCRIBING`，进度为 35%。
10. 构造 `TranscriptionRequest`。
11. 优先执行异步提交 + 回调 + 轮询。
12. 如果异步路径没有完成，进入同步兜底转写。

## 10. 音频准备阶段

`prepareTaskAudioAsset()` 负责把任务输入变成转写服务商可使用的媒体地址。它可能会用到：

- `sourceUrl`：上传文件、公开视频链接或 Google Drive 解析后的下载链接。
- `objectKey`：R2 中的原始文件 key。
- `originalName`：原始文件名。
- `yt-dlp`：解析 YouTube 等公开视频链接。
- `ffmpeg`、`ffprobe`：处理音频和识别时长。
- R2：保存或读取媒体资源。

如果这一步失败，常见原因是：

- R2 凭证错误。
- R2 bucket 或公开域名配置错误。
- `yt-dlp` 未安装或路径不对。
- `ffmpeg` / `ffprobe` 未安装。
- 公开视频平台阻止解析。
- 原始文件 URL 不可访问。

## 11. 异步回调与轮询

Worker 会优先调用 `runWithCallbackAndPolling()`。

流程：

1. 通过 `resolvePrimaryProviders(request)` 选择主服务商。
2. 生成 `callbackToken`。
3. 拼接回调地址：

```text
${TRANSCRIPTION_CALLBACK_BASE_URL}/api/transcription/callback/{provider}?taskId={taskId}&token={token}
```

4. 调用服务商 `submit()` 提交异步转写任务。
5. 保存 provider job 上下文和 callback token。
6. 在超时时间内循环轮询服务商结果。
7. 如果 Web 回调已经先完成任务，轮询会发现任务已完成并退出。
8. 如果轮询拿到结果，调用 `finalizeTranscriptionResult()` 收尾。
9. 如果提交或轮询失败，返回 `false`，交给同步兜底。

两个相关环境变量：

```bash
TRANSCRIPTION_CALLBACK_TIMEOUT_SECONDS="1200"
TRANSCRIPTION_POLL_INTERVAL_SECONDS="6"
```

注意：回调地址必须是 Web 应用公网域名，不是 Worker 机器地址。Worker 不提供 HTTP 回调接口。

## 12. 同步兜底转写

如果异步路径失败或超时未完成，Worker 会调用 `runSyncFallback()`。

同步兜底逻辑：

1. 按 `resolvePrimaryProviders(request)` 返回的服务商顺序逐个尝试阻塞式转写。
2. 任一服务商成功后，调用 `finalizeTranscriptionResult()` 保存结果。
3. 如果主力服务商都失败，更新状态为 `TRANSCRIBING`，进度 55%。
4. 最后调用 Groq 分段转写兜底。

服务商选择通常和是否启用发言人识别有关：

- 开启发言人识别时，优先使用支持 speaker labels 的服务商。
- 未开启发言人识别时，可以优先使用速度更快或成本更低的服务商。

实际顺序由 `src/server/transcription` 中的 `resolvePrimaryProviders()` 决定。

## 13. 结果收尾

转写成功后，`finalizeTranscriptionResult()` 负责：

- 保存 transcript。
- 更新任务状态为完成。
- 记录真实音频时长。
- 结算或修正用户分钟额度。
- 生成摘要、洞察、翻译或导出相关数据。
- 发布任务状态更新。
- 触发必要的 webhook 兼容逻辑。

如果任务在处理过程中已被标记为完成，Worker 会跳过重复收尾，避免 stalled 重试导致重复写入。

## 14. 取消与幂等保护

Worker 有两个关键保护：

```ts
assertNotCanceled(taskId)
isTaskCompleted(taskId)
```

`assertNotCanceled()` 会查询数据库任务状态。如果任务是 `CANCELED`，抛出 `JobCanceledError`。

`isTaskCompleted()` 会检查任务是否已经完成。如果任务已完成，当前 job 直接返回。这用于避免以下情况导致重复处理：

- BullMQ 判断任务 stalled 后重新投递。
- Webhook 回调和 Worker 轮询同时拿到结果。
- 同一个任务被重复入队。

## 15. 失败处理

Worker 注册了 `failed` 事件：

```ts
worker.on("failed", async (job, error) => {
  ...
});
```

失败时会：

1. 如果没有 job，直接返回。
2. 如果是 `JobCanceledError`，直接返回，不按普通失败处理。
3. 记录错误日志。
4. 调用 `releaseQuotaForFailedTask()` 释放失败任务占用的用户额度。
5. 更新任务状态为 `FAILED`。
6. 设置 `errorCode` 为 `TRANSCRIPTION_FAILED`。

这意味着普通失败会释放额度；用户主动取消不会重复走普通失败释放逻辑。

## 16. 启动失败排查

### 16.1 Redis 连接失败

现象：

- 进程启动后退出。
- 日志包含 Redis 连接失败。
- 可能出现 `ETIMEDOUT`、`EHOSTUNREACH`、`ENETUNREACH`。

排查：

```bash
echo "$REDIS_URL"
```

确认：

- 使用 `redis://` 或 `rediss://`。
- 没有误用 `https://` REST URL。
- 当前服务器可以访问 Redis 主机和端口。
- 云 Redis 白名单允许当前服务器出口 IP。

### 16.2 队列不消费

现象：

- Worker 启动成功。
- Web 端任务一直排队。
- Worker 没有处理日志。

排查：

```bash
echo "$TRANSCRIBE_QUEUE"
```

确认：

- Web 和 Worker 的 `TRANSCRIBE_QUEUE` 完全一致。
- Web 和 Worker 使用同一个 Redis 实例。
- Redis 中 waiting job 所在队列就是 Worker 正在监听的队列。

### 16.3 数据库连接失败

现象：

- Worker 拿到任务后失败。
- 日志里出现 Prisma 或 MySQL/TiDB 连接错误。

排查：

- `DATABASE_URL` 是否正确。
- 数据库是否允许当前服务器 IP。
- 数据库端口是否可访问。
- 是否已经执行 Prisma generate。

### 16.4 媒体准备失败

现象：

- 任务进入 `PROCESSING` 后失败。
- 日志里出现 R2、yt-dlp、ffmpeg、URL 下载相关错误。

排查：

```bash
yt-dlp --version
ffmpeg -version
ffprobe -version
```

确认：

- `YT_DLP_PATH` 指向真实可执行文件。
- `FFMPEG_PATH` 和 `FFPROBE_PATH` 正确。
- R2 bucket、access key、secret key 和 public base URL 正确。

### 16.5 回调不生效

现象：

- 服务商异步任务提交成功。
- Web 回调没有收到。
- Worker 最后可能通过轮询或同步兜底完成任务。

排查：

- `TRANSCRIPTION_CALLBACK_BASE_URL` 是否是公网 HTTPS 域名。
- Web 应用是否部署了 `/api/transcription/callback/deepgram` 和 `/api/transcription/callback/assemblyai`。
- 服务商控制台是否能访问回调 URL。
- Web 应用日志是否有 token 校验失败。

## 17. systemd 启动示例

示例服务文件：

```ini
[Unit]
Description=BullMQ Transcription Worker
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=appworker
Group=appworker
WorkingDirectory=/srv/transcribe-worker/app
EnvironmentFile=/srv/transcribe-worker/app/.env.worker
Environment=NODE_ENV=production
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/appworker/.local/bin
ExecStart=/usr/bin/pnpm run worker
Restart=always
RestartSec=10
KillSignal=SIGTERM
TimeoutStopSec=60
SyslogIdentifier=transcribe-worker

[Install]
WantedBy=multi-user.target
```

常用命令：

```bash
sudo systemctl daemon-reload
sudo systemctl enable transcribe-worker
sudo systemctl start transcribe-worker
sudo systemctl status transcribe-worker --no-pager
journalctl -u transcribe-worker -f
```

## 18. 本地启动示例

本地开发时可以直接运行：

```bash
pnpm install
pnpm run prisma:generate
pnpm run worker
```

如果不想使用根目录 `.env`，也可以手动导入指定环境文件：

```bash
set -a
. ./.env.worker
set +a
pnpm run worker
```

## 19. 快速判断启动是否正常

启动正常应满足：

- 进程没有立刻退出。
- Redis 连接成功。
- 日志显示正在监听目标队列。
- Web 创建任务后，任务能从排队进入处理中。
- 数据库任务状态会更新为 `PROCESSING`、`TRANSCRIBING`、`COMPLETED` 或 `FAILED`。

如果只看到 Worker 启动成功，但任务不动，优先检查：

1. `TRANSCRIBE_QUEUE` 是否一致。
2. Web 和 Worker 是否连接同一个 Redis。
3. Redis 里 job 是否在 waiting 状态。
4. Worker 是否有权限访问数据库、R2 和外部服务。
