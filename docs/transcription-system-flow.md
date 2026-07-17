# 转录系统业务流程

## 1. 入口与任务创建

工作台上传、录音、媒体链接和 Google Drive 最终统一调用 `POST /api/tasks`。API 依次完成登录校验、请求限流、免费次数与分钟额度校验、文件夹权限校验，并在同一数据库事务中创建 `MediaTask(QUEUED)`、`SOURCE_MEDIA` 和额度预留记录。事务成功后任务通过稳定的 `taskId` Job ID 写入 BullMQ；入队失败时任务立即改为 `FAILED/QUEUE_UNAVAILABLE` 并释放额度。

兼容入口 `/api/tasks/transcription`、`/api/tasks/youtube-transcription` 和 `/api/tasks/media-transcription` 复用同一创建与入队逻辑，不维护第二套任务生命周期。

## 2. Worker 来源分流

Worker 取到任务后先把状态改为 `PROCESSING(15%)`，再按真实 URL provider 分流：

| 来源 | 处理链路 | 禁止行为 |
| --- | --- | --- |
| YouTube URL | Gemini 直接读取完整视频，产出转录、摘要和思维导图 | 不经过 yt-dlp/FFmpeg |
| TikTok、Instagram、Facebook、X、Vimeo 等媒体链接 | yt-dlp 下载 -> FFmpeg 单声道 16kHz MP3 -> R2 -> AssemblyAI/Deepgram | 不回退 Gemini |
| 上传文件、录音、R2 文件 | 下载/复用文件 -> FFmpeg 标准化 -> R2 -> AssemblyAI/Deepgram | 不调用 Gemini |
| Google Drive | 解析下载地址后进入上传文件链路 | 不调用 Gemini |

Gemini 请求默认 10 分钟硬超时，yt-dlp 默认 5 分钟硬超时，均可通过环境变量调整。超时或不可恢复错误由 BullMQ 重试策略处理；最终失败必须落库为 `FAILED` 并释放预留额度，不能永久停留在处理中。

## 3. 音频转录与降级

需要字幕或说话人识别时优先 AssemblyAI、Deepgram 兜底；其他任务在两者间选择主服务商。Worker 同时使用 webhook 与轮询等待异步结果，回调优先完成时通过幂等状态检查阻止重复收尾。两个主服务商都失败后，才使用 Groq 分段转录作为音频链路的最终兜底。

`NORMALIZED_AUDIO` 通过 `(mediaTaskId, kind, chunkIndex)` 唯一键复用，任务重试不会重复下载和转码同一媒体。

## 4. 统一收尾

`finalizeTranscriptionResult` 是唯一收尾入口：结算实际分钟数、upsert `Transcript`、保存 segments/words/editedText，以及按模板保存或生成 summary/mindMap，最后把 `MediaTask` 更新为 `COMPLETED(100%)`。终态更新触发站内 SSE 和外部 webhook；回调、轮询和重试并发到达时以任务终态实现幂等。

## 5. Transcript 详情读取

详情页首次挂载只调用 `GET /api/tasks/:taskId`，一次返回任务标量、Transcript 和当前访问者所需的会员标记。状态变化只通过 `/api/tasks/:taskId/events` 的 SSE 推送，不再叠加 2.5 秒轮询。

`/api/folders` 仅在用户打开“移动到文件夹”对话框时按需请求，分享状态仅在打开分享对话框时读取；详情页不再调用 `/api/auth/me`。状态广播只查询状态字段与 Transcript，不查询 exports、ratings 或媒体资产。

## 6. 状态与故障恢复

主状态机为：

`QUEUED -> PROCESSING -> TRANSCRIBING -> ANALYZING(可选) -> COMPLETED`

任意处理中状态都可进入 `FAILED` 或 `CANCELED`。只有 `FAILED/CANCELED` 可重试；重试会复用稳定 Job ID、清除错误字段并重新预留必要额度。删除未完成或失败任务时释放额度。

部署后运行 `pnpm transcription:check`。检查失败表示没有注册 worker，或存在超过 15 分钟没有状态更新的活动任务。确认异常后运行 `pnpm transcription:reconcile`；它只会修复 Redis 中已经没有 active/waiting/delayed Job 的孤儿任务，释放额度并改为可重试的 `FAILED/STALE_QUEUE_TASK`。生产必须同时托管 Web 与 Worker；本地默认 `pnpm dev` 同时启动两者，`pnpm dev:web` 仅用于明确不需要转录的页面开发。

## 7. 发布顺序

涉及 Prisma Schema 的发布必须按以下顺序执行：数据库迁移 -> `prisma generate` -> 构建/安装 -> 重启 Web 与 Worker -> `pnpm transcription:check`。旧 Prisma Client 与新数据库混用会在状态广播读取 Transcript 时导致 worker 失败。
