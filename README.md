# Vocto

Vocto 是一个基于 Next.js 的 SaaS 工作区，专注于音视频转录和 AI 后处理。它支持本地媒体上传、YouTube 链接、区分发言人的转录文本、摘要、思维导图、问答、翻译以及数据导出。

## 技术栈

- **Next.js App Router**：用于构建用户界面（UI）和路由处理程序（Route Handlers）
- **Prisma + TiDB Cloud**：用于持久化存储任务、转录文本、订阅、导出以及分析洞察数据
- **Redis + BullMQ**：用于速率限制、异步任务处理以及基于 SSE（服务器发送事件）的状态分发
- **Cloudflare R2**：用于存储原始媒体文件和导出文件
- **Groq Whisper、Deepgram 和 AssemblyAI**：提供转录服务，并具备服务商备用切换（Fallback）机制
- **FFmpeg 和 yt-dlp**：用于生产环境下的媒体文件预处理钩子（Hooks）

## 项目配置

1. 安装依赖：
```bash
npm install
```


2. Copy environment variables:

```bash
cp .env.example .env
```

3. 填写 .env 文件中的 DATABASE_URL、REDIS_URL、R2 凭证以及至少一个语音转文字（STT）服务商的 API 密钥
Fill in `DATABASE_URL`, `REDIS_URL`, R2 credentials, and at least one STT provider key.

4. 生成并推送数据库架构（Schema）:

```bash
npm run prisma:generate
npm run prisma:push
```

5. 在不同的终端窗口中分别运行 Web 应用和 Worker 进程:
```bash
npm run dev
npm run worker
```

Open `http://localhost:3000`.

## 注意事项

- 免费和付费的配额字段已在 Prisma 中建模。生产环境的身份验证（Auth）和 Stripe Webhooks 可以实时更新 `User` 和 `Subscription`数据.
- `src/server/media/prepare.ts` 包含了 FFmpeg 和 yt-dlp 的命令封装。Worker 的结构设计支持在调用 STT 之前，先对上传的音频进行规范化（Normalization）处理.
- YouTube 任务会在 Worker 中使用 `yt-dlp --get-url` 来解析出直接的音频流，然后再调用备用服务商进行转录。
- AssemblyAI 的集成使用了官方的 Node SDK，并支持 `speech_models`（语音模型）、`speaker_labels`（发言人标签）以及语言检测和服务器端密钥处理.
