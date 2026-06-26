# Votxt 企业级商业化产品文档

版本：2.1  
更新时间：2026-06-25  
产品形态：AI 音视频转写、翻译、摘要与企业自动化工作台  
竞品参考：https://www.uniscribe.co、https://videotranscriber.ai/
竞品账号：gxx961208@gmail.com
竞品密码：Xxx123456..
可登陆竞品进行分析、复制克隆

## 1. 文档目的

本文档用于描述 Votxt 当前产品能力、页面结构、业务流程、商业化模型、技术架构、数据库设计、服务商降级策略、部署要求和后续生产化边界。文档与当前代码实现保持一致，可作为产品评审、研发交付、数据库初始化、部署上线和后续迭代的统一依据。

本文档中的竞品信息用于产品分析和功能结构实现，复制竞品品牌、素材、文案或私有数据。

## 2. 产品定位

Votxt 是面向企业团队、内容创作者、教育机构、媒体研究者和知识工作者的 AI 音视频内容生产平台。用户可以上传音频/视频、粘贴公开视频链接或直接在浏览器录音，系统会把媒体转为可编辑文本，并继续生成摘要、思维导图、问答、翻译、字幕、结构化导出和公开分享页面。

核心价值：

- 把长音视频快速变成可检索、可编辑、可复用的内容资产。
- 把转写、翻译、AI 后处理、导出、分享和团队协作放进同一个工作台。
- 通过 Groq、Deepgram、AssemblyAI、DeepSeek、Gemini、DeepL 等多服务商降级机制提高可用性。
- 面向商业化交付提供订阅套餐、用量流水、企业 API Key、Webhook、审计日志和团队权限。

## 3. 竞品调研结论

### 3.1 UniScribe

- 首页包含功能、价格、FAQ、Blog、语言切换、主题切换、登录和免费开始。
- 首屏直接提供上传文件和粘贴链接入口，用户无需先读完整营销页。
- 强调支持 11+ 媒体格式、63 种语言和多格式导出。
- 登录后仪表盘展示当前套餐、每日文件次数、本月分钟额度、升级入口、文件夹、搜索、上传、粘贴链接和空任务状态。
- Free 计划对用户最敏感的指标是“今日次数”和“本月分钟数”，因此 Votxt 必须显示真实用量，而不是静态营销数字。
- 注册流程使用居中卡片、品牌 Logo、Google 登录、邮箱分步注册、资料/密码补充和邮箱验证提示。

### 3.2 VideoTranscriber AI

- 首屏更接近工作台，左侧包含 New Video、My Assets、Pricing、Blog、Help Center 和免费计划状态。
- 输入方式包括上传、链接和录音。
- My Assets 强调 Transcription / Translation 双资产视图，以及 Name、Uploaded、Duration、Status、Operation 等任务字段。
- 官网强调准确率、多语言、发言人识别、隐私安全、YouTube/社媒转写和内容工具矩阵。
- 内容生态包含工具页、社媒转写、YouTube 工具、AI 翻译、AI 总结、竞品对比、Blog、帮助中心和页脚链接矩阵。

### 3.3 Votxt 的取舍

Votxt 当前版本选择“官网首屏即工作台”的方向：营销页面首屏直接可上传、粘贴链接或录音；登录后进入仪表盘，继续使用同一套输入区和任务结果区。这样可以同时满足 SEO 访客的低门槛试用和企业用户的高频工作流。

## 4. 目标用户与场景

### 4.1 企业团队

- 会议、访谈、培训、客户沟通转写。
- 团队成员共享任务、管理额度、审计操作。
- 使用 API Key 和 Webhook 接入内部知识库、CRM、内容系统或工单系统。

### 4.2 内容创作者

- 视频生成字幕、脚本、博客草稿和社媒素材。
- 长视频切片前先生成摘要、关键问答和结构化提纲。
- 公开分享转写结果给编辑、审稿人或合作方。

### 4.3 教育与知识工作者

- 课程、讲座、公开课、播客转成可检索笔记。
- 把多语言资料翻译成目标语言。
- 使用 SRT/VTT 生成字幕，使用 PDF/TXT 做归档。

### 4.4 媒体与研究者

- 采访录音、口述史、新闻发布会转写。
- 保留时间戳、发言人段落、摘要、问答和原始转写。
- 通过团队空间管理项目资料和审计记录。

## 5. 产品范围

### 5.1 官网首页

路由：`/[locale]`

当前首页包含：

- 顶部导航：功能、价格、FAQ、博客、仪表盘、登录/免费试用。
- 首屏工作台：上传文件、粘贴链接、浏览器录音。
- 文件格式和能力标签：11+ 媒体格式、63 种语言、多格式导出。
- 免费计划概览：每日文件数、本月分钟数、队列任务数。
- 工作流说明：上传/链接/录音、队列转写、编辑导出。
- 使用场景：学生和课程、会议和团队、创作者、研究和媒体。
- 套餐入口和首页 FAQ。

### 5.2 国际化

当前已配置 8 个语言路由：

- `en`
- `zh`
- `es`
- `fr`
- `de`
- `ja`
- `ko`
- `pt`

覆盖范围：

- 官网首页。
- 登录、注册、邮箱验证页。
- 仪表盘和核心工作台。
- 价格页、FAQ、Blog 列表、Blog 详情。
- 服务条款、隐私政策、公开分享页。

日期格式会跟随当前语言的 `Intl.DateTimeFormat` 区域设置，避免非中文页面仍使用中英文二分格式。

### 5.3 登录与注册

路由：

- `/[locale]/auth/signin`
- `/[locale]/auth/signup`
- `/[locale]/auth/verify-email`

能力：

- 邮箱密码注册。
- 邮箱密码登录。
- Google OAuth 登录。
- 邮箱验证 Token 和验证结果页。
- 登出接口。
- 当前用户接口。
- 签名 httpOnly Cookie 会话。
- 密码使用 `scrypt` 哈希保存。
- 注册成功自动创建 Free 订阅和默认团队空间。
- 老用户登录时自动补齐默认团队。

注册页设计：

- 参考竞品的居中白色卡片。
- 顶部展示 Votxt Logo。
- Google 登录入口。
- 邮箱分步注册。
- 资料/密码补充步骤。
- 邮箱验证提示。
- 展示企业级安全能力：短期上传签名、统一仪表盘、OAuth/邮箱验证/Stripe/企业 SSO 架构预留。

生产环境要求：

- 配置 Resend 后发送真实验证邮件。
- 未配置邮件服务时返回开发验证链接，便于本地和测试环境完成流程。
- 企业 SSO、SAML/OIDC、SCIM、强制 MFA 属于后续企业版能力。

### 5.4 仪表盘

路由：`/[locale]/dashboard`

仪表盘由三层组成：

- 左侧账号、团队、额度、文件夹、任务资产列表。
- 中间输入区：上传、链接、录音、语言、发言人标签、开始转写。
- 右侧结果区：任务状态、转写编辑器、AI 工作区、导出中心。

当前已实现：

- 当前账号和套餐显示。
- 默认团队空间。
- 今日免费文件数。
- 本月账期分钟、剩余分钟、本月任务数。
- Transcription / Translation 双资产视图。
- 任务搜索，支持按文件名、状态、来源和服务商过滤。
- 历史任务恢复，点击任务可重新打开详情。
- 上传本地音视频。
- 粘贴公开视频链接。
- 浏览器录音并转成 WebM 文件进入同一套上传/转写队列。
- 转写语言选择：自动识别、英语、中文、西语、法语、德语、日语、韩语、葡语。
- 发言人标签开关。
- SSE 实时状态更新和轮询兜底。
- 转写分段、时间戳、发言人、全文编辑、复制、保存。
- AI 摘要、思维导图、问答、翻译。
- TXT、SRT、VTT、JSON、Markdown、CSV、DOCX、PDF 导出。
- 公开分享链接。
- 企业控制台：成员、API Key、Webhook、审计日志、用量流水。

### 5.5 订阅套餐

路由：`/[locale]/pricing`

| 套餐 | 价格 | 月度分钟 | 单文件上限 | 核心能力 |
| --- | ---: | ---: | ---: | --- |
| Free | $0/月 | 120 | 30 分钟 | 每日 3 个文件、标准模型、基础导出 |
| Basic | $6/月 | 1200 | 600 分钟 | YouTube 链接、发言人识别、批量任务、API |
| Standard | $12/月 | 3000 | 900 分钟 | 优先队列、更长文件、团队工作台、高级导出 |
| Pro | $18/月 | 6000 | 1200 分钟 | 高容量团队、较低超额成本、优先支持、长期保留 |

已实现 Stripe 能力：

- `POST /api/billing/checkout`：创建订阅 Checkout。
- `POST /api/billing/portal`：创建 Stripe Customer Portal。
- `POST /api/billing/webhook`：校验 Stripe 签名并同步订阅状态、套餐、账期和分钟额度。

生产环境要求：

- 在 Stripe 后台创建 Basic、Standard、Pro 三个订阅价格。
- 配置 `STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET`。
- 配置 `STRIPE_PRICE_BASIC`、`STRIPE_PRICE_STANDARD`、`STRIPE_PRICE_PRO`。
- Stripe Webhook Endpoint 指向 `/api/billing/webhook`。

### 5.6 用量与额度

当前实现：

- 免费用户每日 3 个文件。
- 免费计划每月 120 分钟。
- 任务创建时预留预计分钟数。
- Worker 完成后按实际时长结算。
- 任务失败或队列不可用时释放预留分钟。
- 所有额度变化写入 `UsageLedger`。
- 仪表盘通过 `/api/teams/current/usage` 展示今日、账期、套餐、剩余分钟、本月任务数和最近流水。

预估规则：

- 上传文件根据文件大小估算分钟数。
- 当前粗略按 12MB/分钟预留，避免大文件瞬间超用量。
- 实际结算以转写服务商返回的媒体时长为准。

### 5.7 企业团队空间

当前实现：

- 默认团队：注册、登录、OAuth 后自动创建或补齐。
- 成员角色：`OWNER`、`ADMIN`、`MEMBER`、`VIEWER`。
- 管理权限：`OWNER` 和 `ADMIN` 可邀请成员、创建 API Key、创建/更新 Webhook、更新团队信息。
- 成员邀请：按邮箱创建邀请记录；若邮箱已注册则可关联用户。
- 团队任务：登录用户创建任务默认写入当前团队 `teamId`。
- 团队审计：记录注册、登录、OAuth、团队更新、成员邀请、任务创建、API Key、Webhook、分享链接等关键动作。
- 数据保留：`Team.retentionDays` 默认 180 天，后续可接入定时清理 Worker。

权限边界：

| 操作 | OWNER | ADMIN | MEMBER | VIEWER |
| --- | --- | --- | --- | --- |
| 查看团队任务 | 是 | 是 | 是 | 是 |
| 创建转写任务 | 是 | 是 | 是 | 需后续按策略限制 |
| 生成 AI 洞察 | 是 | 是 | 是 | 需后续按策略限制 |
| 创建分享链接 | 是 | 是 | 是 | 需后续按策略限制 |
| 邀请成员 | 是 | 是 | 否 | 否 |
| 创建 API Key | 是 | 是 | 否 | 否 |
| 管理 Webhook | 是 | 是 | 否 | 否 |
| 查看审计日志 | 是 | 是 | 当前接口随团队快照展示 |

### 5.8 企业 API Key

当前实现：

- 团队管理员可创建 API Key。
- 明文 Key 只在创建响应返回一次。
- 数据库只保存 SHA-256 哈希和展示前缀。
- Key 格式：`votxt_live_...`
- API Key 支持过期时间和吊销状态。
- 调用时使用 `Authorization: Bearer votxt_live_...`。
- 使用后会更新 `lastUsedAt`。

支持 API Key 的能力：

- 创建任务。
- 查询任务列表。
- 查询任务详情。
- 订阅 SSE 任务事件。
- 保存转写编辑稿。
- 生成 AI 洞察。
- 导出结果。

### 5.9 企业 Webhook

当前实现：

- 团队管理员可创建 Webhook Endpoint。
- 签名密钥明文只返回一次。
- 数据库只保存密钥哈希和展示前缀。
- 支持事件：
  - `task.completed`
  - `task.failed`
  - `share_link.create`
- 投递记录写入 `WebhookDelivery`。
- 投递请求携带：
  - `X-Votxt-Signature`
  - `X-Votxt-Timestamp`
  - `X-Votxt-Event`
  - `X-Votxt-Delivery`
  - `X-Votxt-Attempt`
  - `User-Agent: Votxt-Webhooks/1.0`
- 失败时记录响应状态、错误摘要和失败次数。
- 自动重试：单次投递最多尝试 3 次，按 0ms、500ms、2000ms 指数退避，最终结果与尝试次数写回同一条投递记录。
- 手动重放：管理员可对历史投递记录重放，复制原载荷并以一条新投递记录重新签名发送。

### 5.10 公开分享

路由：`/[locale]/share/[token]`

当前实现：

- 已完成转写的任务可创建公开分享链接。
- 数据库只保存分享 Token 哈希。
- 公开页面只读展示，不允许编辑、重新生成 AI 或修改任务。
- 支持展示转写全文、分段、摘要、翻译和基础元数据。
- 支持通过公开 Token 导出 TXT、SRT、VTT、JSON、Markdown、CSV、DOCX、PDF。
- 记录访问次数和最后访问时间。

### 5.11 Blog 与内容生态

路由：

- `/[locale]/blog`
- `/[locale]/blog/[slug]`

当前已实现：

- Blog 列表页。
- Blog 详情页。
- 8 语言文章数据。
- 静态路由生成。
- 文章标题、摘要、分类、日期、阅读时间、正文分节。

首批文章主题：

- 如何把大音频压缩成适合转写的 MP3。
- 公开视频转文字完整工作流。
- 采访录音如何整理成摘要和问答。
- SRT、VTT、TXT、PDF 应该怎么选。

后续内容矩阵：

- 语言页：英语转写、中文转写、日语转写等。
- 格式页：MP3 转文字、MP4 转文字、WAV 转文字等。
- 工具页：YouTube 转写、TikTok 转写、Instagram 转写。
- 对比页：与 UniScribe、VideoTranscriber、TurboScribe 等竞品对比。
- 帮助中心：上传失败、额度、导出、发言人识别、隐私安全。

### 5.12 法务页面

路由：

- `/[locale]/terms`
- `/[locale]/privacy`

当前内容覆盖：

- 账号与订阅边界。
- 媒体处理权声明。
- AI 服务商调用说明。
- 企业功能边界。
- API Key、Webhook、分享链接的安全说明。
- 数据处理、保留和企业控制。

## 6. 核心业务流程

### 6.1 注册流程

1. 用户进入注册页。
2. 可选择 Google 登录或邮箱注册。
3. 邮箱注册第一步填写邮箱。
4. 第二步填写姓名和密码。
5. 服务端创建用户、密码哈希、Free 订阅、默认团队、邮箱验证 Token。
6. 写入签名 httpOnly Cookie。
7. 配置邮件服务时发送验证邮件；未配置时返回开发验证链接。
8. 用户进入邮箱验证页或仪表盘。

### 6.2 登录流程

1. 用户提交邮箱和密码。
2. 服务端读取用户并校验 scrypt 密码哈希。
3. 登录成功写入签名 httpOnly Cookie。
4. 自动补齐默认团队。
5. 写入审计日志。
6. 仪表盘读取 `/api/auth/me` 并展示用户、团队和套餐。

### 6.3 转写任务流程

1. 用户选择上传、链接或录音。
2. 上传和录音先请求 `/api/uploads` 获取 R2 预签名上传地址。
3. 浏览器把文件直传对象存储。
4. 前端调用 `POST /api/tasks` 创建任务。
5. 服务端校验限流、团队、免费次数和分钟额度。
6. 任务进入 `QUEUED` 状态，并写入预留用量流水。
7. 服务端把任务推送到 BullMQ 队列。
8. Worker 取出任务，必要时预处理媒体。
9. Worker 调用转写服务商降级链。
10. 转写完成后写入 `Transcript`、更新 `MediaTask`、结算额度、触发 Webhook。
11. 前端通过 SSE 或轮询刷新进度。

### 6.4 AI 洞察流程

1. 任务完成后，用户点击生成 AI 洞察。
2. 服务端读取转写文本。
3. 调用 AI JSON 生成降级链，生成摘要、思维导图和问答。
4. 调用翻译降级链生成目标语言译文。
5. 结果写入 `AIInsight`。
6. 前端展示摘要、思维导图、问答和翻译。

### 6.5 导出流程

1. 用户在任务详情点击导出格式。
2. 服务端校验任务归属或公开分享 Token。
3. 根据 `Transcript` 生成 TXT、SRT、VTT、JSON、Markdown、CSV、DOCX 或 PDF。
4. 浏览器下载文件。

### 6.6 分享流程

1. 用户在任务完成后点击分享。
2. 服务端生成随机 Token，只保存哈希。
3. 返回公开 URL。
4. 前端复制分享链接。
5. 外部访客打开分享页。
6. 分享页只读展示并记录访问次数。
7. 创建分享链接时触发 `share_link.create` Webhook。

## 7. AI 与服务商降级策略

### 7.1 转写服务商

发言人识别开启时：

1. Deepgram
2. AssemblyAI
3. Groq Whisper

发言人识别关闭时：

1. Groq Whisper
2. Deepgram
3. AssemblyAI

失败处理：

- 单个服务商失败只记录错误，不终止任务。
- 自动调用下一个服务商。
- 全部失败后任务标记为 `FAILED`。
- 失败任务会释放预留分钟。
- 失败任务会触发 `task.failed` Webhook。

### 7.2 AI 洞察模型

降级顺序：

1. `deepseek-v4`
2. Gemini
3. Groq `llama-3.1-70b-versatile`
4. 本地规则兜底

输出结构：

- `summary`：概览和要点。
- `mindMap`：树状节点。
- `qa`：关键问题和答案。

服务商输出要求：

- 使用 JSON 输出。
- 失败时记录错误并尝试下一个模型。
- 全部失败后使用本地规则生成最小可用结果。

### 7.3 翻译服务

降级顺序：

1. DeepL Translate
2. `deepseek-v4-flash`
3. 原文兜底

DeepL 语言映射：

- `zh` -> `ZH-HANS`
- `en` -> `EN-US`
- `pt` -> `PT-BR`

翻译结果写入 `AIInsight` 的 `TRANSLATION` 类型，内容包含目标语言、服务商和译文。

## 8. 技术架构

| 模块 | 当前选型 | 说明 |
| --- | --- | --- |
| 前端 | Next.js App Router、React、Tailwind CSS | 页面、工作台、表单和仪表盘 |
| 国际化 | next-intl | 8 语言路由和消息文件 |
| API | Next.js Route Handlers | 认证、任务、团队、订阅、分享 |
| 数据库 | Prisma + MySQL/TiDB Cloud | 业务模型、团队、用量、审计 |
| 队列 | BullMQ + Redis | 转写长任务异步处理 |
| 存储 | Cloudflare R2 | 媒体文件和导出资产 |
| 转写 | Groq、Deepgram、AssemblyAI | 多服务商降级 |
| AI | DeepSeek、Gemini、Groq | 摘要、思维导图、问答 |
| 翻译 | DeepL、DeepSeek Flash | 翻译降级 |
| 支付 | Stripe REST API | Checkout、Customer Portal、Webhook |
| 邮件 | Resend | 邮箱验证邮件 |
| Webhook | 自研签名投递 | 企业自动化回调 |

## 9. 页面清单

| 路由 | 页面 | 状态 |
| --- | --- | --- |
| `/` | 默认重定向/入口 | 已实现 |
| `/[locale]` | 官网首页和首屏工作台 | 已实现 |
| `/[locale]/auth/signin` | 登录页 | 已实现 |
| `/[locale]/auth/signup` | 注册页 | 已实现 |
| `/[locale]/auth/verify-email` | 邮箱验证结果页 | 已实现 |
| `/[locale]/dashboard` | 仪表盘 | 已实现 |
| `/[locale]/pricing` | 订阅套餐 | 已实现 |
| `/[locale]/faq` | FAQ | 已实现 |
| `/[locale]/blog` | Blog 列表 | 已实现 |
| `/[locale]/blog/[slug]` | Blog 详情 | 已实现 |
| `/[locale]/terms` | 服务条款 | 已实现 |
| `/[locale]/privacy` | 隐私政策 | 已实现 |
| `/[locale]/share/[token]` | 公开分享页 | 已实现 |

## 10. API 清单

### 10.1 认证

- `POST /api/auth/register`：邮箱密码注册，创建用户、Free 订阅、默认团队和邮箱验证 Token。
- `POST /api/auth/login`：邮箱密码登录，写入签名 Cookie。
- `POST /api/auth/logout`：清除登录 Cookie。
- `GET /api/auth/me`：读取当前用户和团队快照。
- `POST /api/auth/verify-email`：验证邮箱 Token。
- `GET /api/auth/google/start`：开始 Google OAuth 登录。
- `GET /api/auth/google/callback`：处理 Google OAuth 回调。

### 10.2 上传与任务

- `POST /api/uploads`：创建 R2 预签名上传地址。
- `GET /api/tasks`：读取当前用户或 API Key 所属团队任务列表。
- `POST /api/tasks`：创建转写任务并推送队列。
- `GET /api/tasks/[taskId]`：查询任务详情。
- `GET /api/tasks/[taskId]/events`：SSE 任务更新。
- `PATCH /api/tasks/[taskId]/transcript`：保存转写编辑稿。
- `POST /api/tasks/[taskId]/insights`：生成摘要、思维导图、问答和翻译。
- `GET /api/tasks/[taskId]/exports/[format]`：导出 TXT、SRT、VTT、JSON、Markdown、CSV、DOCX、PDF。
- `POST /api/tasks/[taskId]/share`：创建公开分享链接。

### 10.3 公开分享

- `GET /api/share/[token]/exports/[format]`：通过公开分享 Token 下载导出文件。

### 10.4 团队与企业

- `GET /api/teams/current`：读取当前团队、成员、API Key、Webhook、审计日志快照。
- `PATCH /api/teams/current`：更新团队名称、默认语言和数据保留期。
- `GET /api/teams/current/usage`：读取套餐、今日次数、账期任务、剩余分钟和用量流水。
- `GET /api/teams/current/assets?type=transcriptions|translations`：读取团队资产列表。
- `POST /api/teams/current/members`：邀请团队成员。
- `POST /api/teams/current/api-keys`：创建企业 API Key。
- `DELETE /api/teams/current/api-keys/[apiKeyId]`：吊销企业 API Key。
- `GET /api/teams/current/audit-logs`：读取团队审计日志。
- `GET /api/teams/current/webhooks`：读取 Webhook Endpoint。
- `POST /api/teams/current/webhooks`：创建 Webhook Endpoint。
- `PATCH /api/teams/current/webhooks/[webhookId]`：更新 Webhook。
- `DELETE /api/teams/current/webhooks/[webhookId]`：删除 Webhook。
- `GET /api/teams/current/webhooks/[webhookId]/deliveries`：读取 Webhook 投递记录。
- `POST /api/teams/current/webhooks/[webhookId]/deliveries`：重放指定的 Webhook 投递记录。

### 10.5 订阅支付

- `POST /api/billing/checkout`：创建 Stripe Checkout 订阅会话。
- `POST /api/billing/portal`：创建 Stripe Customer Portal 会话。
- `POST /api/billing/webhook`：接收 Stripe 事件并同步订阅权益。

## 11. 数据模型

### 11.1 核心表

- `User`：账号、邮箱、密码哈希、头像、角色、语言、免费次数。
- `Subscription`：套餐、状态、Stripe 信息、月度额度、剩余分钟、账期。
- `MediaTask`：媒体来源、团队、状态、服务商、进度、错误、时长、额度分钟。
- `Transcript`：纯文本、分段、词级时间戳、编辑稿。
- `AIInsight`：摘要、思维导图、问答、翻译。
- `ExportAsset`：导出格式、对象 Key、访问 URL。

### 11.2 认证与企业表

- `OAuthAccount`：Google 等第三方账号绑定。
- `EmailVerificationToken`：邮箱验证 Token 哈希。
- `Team`：企业团队空间、所有者、默认语言、数据保留期。
- `TeamMember`：成员、角色、状态、邀请邮箱。
- `ApiKey`：企业 API Key 哈希、前缀、状态、过期和吊销时间。
- `AuditLog`：团队审计日志。

### 11.3 商业化与自动化表

- `UsageLedger`：额度预留、结算、释放、手工调整流水。
- `ShareLink`：公开分享 Token 哈希、过期、访问统计。
- `WebhookEndpoint`：企业回调地址、事件、签名密钥哈希、失败次数。
- `WebhookDelivery`：Webhook 投递记录、响应状态、耗时和错误摘要。

### 11.4 字段长度优化原则

- 用户邮箱：`VARCHAR(320)`，覆盖 RFC 邮箱最大长度。
- URL 类字段：`VARCHAR(2048)`，覆盖公开视频链接、对象存储 URL 和预处理媒体 URL。
- 文件名/视频标题：`VARCHAR(512)`，避免长标题任务失败。
- R2 对象 Key：`VARCHAR(1024)`，适配日期目录、UUID 和长文件名。
- 语言代码：`VARCHAR(16)`。
- 服务商、错误码：`VARCHAR(64)`。
- AI 模型名：`VARCHAR(128)`。
- 团队名称：`VARCHAR(160)`。
- 团队短标识：`VARCHAR(80)`。
- API Key 前缀：`VARCHAR(24)`。
- API Key 哈希：`VARCHAR(128)`。
- 审计动作和对象类型：`VARCHAR(80)`。
- User-Agent：`VARCHAR(512)`。
- 分享标题：`VARCHAR(160)`。
- 分享 Token 哈希：`VARCHAR(128)`。
- Webhook URL：`VARCHAR(2048)`。
- Webhook 响应摘要：`VARCHAR(1024)`。

### 11.5 MySQL SQL 文件

所有 SQL 文件均要求字段带中文注释。

初始化空库：

- [prisma/sql/000_schema_with_comments.sql](prisma/sql/000_schema_with_comments.sql)
- [prisma/sql/001_initial_data.sql](prisma/sql/001_initial_data.sql)

测试数据：

- [prisma/sql/002_test_data.sql](prisma/sql/002_test_data.sql)

已有数据库增量升级顺序：

1. [prisma/sql/003_auth_fields.sql](prisma/sql/003_auth_fields.sql)
2. [prisma/sql/004_optimize_field_lengths.sql](prisma/sql/004_optimize_field_lengths.sql)
3. [prisma/sql/005_oauth_email_verification.sql](prisma/sql/005_oauth_email_verification.sql)
4. [prisma/sql/006_usage_ledger.sql](prisma/sql/006_usage_ledger.sql)
5. [prisma/sql/007_enterprise_workspace.sql](prisma/sql/007_enterprise_workspace.sql)
6. [prisma/sql/008_share_links.sql](prisma/sql/008_share_links.sql)
7. [prisma/sql/009_webhook_endpoints.sql](prisma/sql/009_webhook_endpoints.sql)
8. [prisma/sql/010_align_free_plan_defaults.sql](prisma/sql/010_align_free_plan_defaults.sql)

执行说明见 [prisma/sql/README.md](prisma/sql/README.md)。

## 12. 安全与合规

当前已实现或已预留：

- 服务商密钥只存在服务端和 Worker 环境变量。
- 上传通过短期预签名 URL 直传对象存储。
- 登录使用签名 httpOnly Cookie。
- 密码使用 scrypt 哈希保存。
- API Key、分享 Token、Webhook 密钥只保存哈希，不保存明文。
- Stripe Webhook 使用签名校验和 5 分钟时间窗口。
- 任务详情、SSE、编辑、AI 洞察、导出均进行归属校验。
- 公开分享页只读展示。
- 团队关键操作写入审计日志。
- API 创建任务有基础限流。
- Webhook 使用 HMAC 签名头，客户系统可校验来源。

仍需生产化增强：

- 企业 SSO、SAML/OIDC、SCIM。
- 强制 MFA。
- 更细粒度角色权限。
- 数据删除工单。
- DPA 和区域化数据存储策略。
- 媒体保留期清理 Worker。
- 安全审计和漏洞扫描。

## 13. 部署与运维

详细部署文档见 [docs/deployment.md](docs/deployment.md)。

推荐架构：

- Web：Vercel 部署 Next.js。
- Worker：云服务器、容器平台、Railway、Fly.io 或 Render 独立运行 `pnpm run worker`。
- 数据库：TiDB Cloud 或 MySQL。
- Redis：Upstash Redis 协议地址，必须使用 `redis://` 或 `rediss://`。
- 存储：Cloudflare R2。
- 邮件：Resend。
- 支付：Stripe。

生产环境必须配置：

- `DATABASE_URL`
- `REDIS_URL`
- `NEXT_PUBLIC_APP_URL`
- `SESSION_SECRET`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL`
- 至少一个转写服务商 Key。
- 至少一个 AI 洞察服务商 Key。
- 至少一个翻译服务商 Key。
- Stripe 订阅相关环境变量。
- Resend 邮件相关环境变量。
- Google OAuth 环境变量。

## 14. 当前完成状态

已完成：

- 官网首页。
- 8 语言国际化。
- 登录、注册、邮箱验证、Google OAuth。
- 仪表盘和首屏工作台。
- 上传、公开视频链接、浏览器录音。
- 任务队列、SSE 状态、轮询兜底。
- Groq、Deepgram、AssemblyAI 转写降级。
- deepseek-v4、Gemini、Groq AI 洞察降级。
- DeepL、deepseek-v4-flash 翻译降级。
- 转写编辑器、摘要、思维导图、问答、翻译。
- TXT、SRT、VTT、JSON、Markdown、CSV、DOCX、PDF 导出。
- Stripe Checkout、Customer Portal、Webhook。
- Free、Basic、Standard、Pro 套餐模型。
- 用量预留、结算、释放和 UsageLedger。
- 默认团队、成员邀请、企业 API Key、审计日志。
- 企业 Webhook、投递记录、自动重试和手动重放。
- 公开分享链接、公开分享页和公开导出。
- Blog 列表、Blog 详情和首批 8 语言内容。
- 服务条款和隐私政策。
- MySQL SQL 文件和中文字段注释。
- Vercel 与云服务商部署文档。

## 15. 后续生产化路线

优先级 P0：

- 配置真实生产服务商密钥并进行端到端转写测试。
- 部署独立 Worker 并配置进程守护和告警。
- 配置 Stripe 真实 Price ID、Webhook 和 Customer Portal。
- 配置 Resend、Google OAuth、生产域名和回调地址。
- 对 MySQL/TiDB 执行 SQL 初始化或增量升级。

优先级 P1：

- 企业 SSO、SCIM、MFA。
- 更细粒度团队权限。
- 批量上传和批量导出。
- 媒体保留期清理 Worker。
- Blog CMS 和后台发布。
- 帮助中心、工具页、格式页、语言页和竞品对比页。

优先级 P2：

- 超额包和团队席位计费。
- 发票、税务和企业合同。
- 项目/文件夹/标签体系。
- 全文搜索和向量检索。
- 更多导出格式：DOCX、CSV、Markdown。
- 客户级数据区域、DPA 和审计报表。
