# Votxt 个人版产品需求文档

版本：3.0  
更新时间：2026-06-26  
产品定位：面向个人用户的 AI 音视频转写、翻译、摘要、字幕与内容整理工具  
参考站点：https://www.votxt.co

## 1. 文档目的

本文档用于统一 Votxt 个人版的产品方向、页面结构、核心功能、业务流程、商业化模型、数据库设计、部署要求和后续迭代边界。当前产品前端不做团队工作区、成员协作、团队席位计费和审计日志管理；公开 API、API Key、Webhook 相关表和接口仅作为外部集成与历史兼容层保留，不作为个人版主界面能力展示。

竞品仅用于分析公开页面、公开交互路径和通用产品结构，不复制竞品品牌、素材、私有数据或非公开内容。

## 2. 产品定位

Votxt 是给个人用户使用的 AI 音视频内容工作台。用户可以上传本地音频或视频、粘贴公开视频链接，或直接在浏览器录音，系统将媒体转换为可编辑文本，并继续生成摘要、思维导图、翻译、字幕和多格式导出。

核心价值：

- 把课程、会议录音、采访、播客、公开视频和个人素材快速转成可检索文本。
- 在同一个个人工作台完成上传、转写、编辑、AI 整理、翻译、导出和分享。
- 提供真实个人用量统计，包括今日免费文件数、本月分钟额度、剩余分钟和最近用量流水。
- 通过订阅套餐满足轻量试用、高频学习、内容创作和专业个人用户的不同工作量。
- 通过 Groq、Deepgram、AssemblyAI、DeepSeek、Gemini、DeepL 等服务商降级机制提高可用性。

## 3. 目标用户

### 3.1 学生与学习者

- 把课堂录音、网课、公开课和讲座转成可搜索笔记。
- 生成摘要和思维导图，用于复习和知识整理。
- 导出 TXT、Markdown、PDF，保存到个人知识库。

### 3.2 内容创作者

- 将视频转为字幕、脚本、博客草稿和社媒素材。
- 对长视频先生成结构化摘要，再做剪辑、拆条和二次创作。
- 使用 SRT/VTT 给 YouTube、TikTok、播客和课程视频制作字幕。

### 3.3 研究者与媒体个人用户

- 处理采访录音、口述史、新闻发布会、播客和调研素材。
- 保留时间戳、发言人段落、摘要和原始转写。
- 通过个人任务列表、搜索和资产视图管理素材。

### 3.4 知识工作者

- 转写个人会议记录、语音备忘、培训材料和客户访谈。
- 将多语言资料翻译为目标语言。
- 导出结构化文本用于 Notion、Obsidian、飞书文档或本地归档。

## 4. 产品范围

### 4.1 官网首页

路由：`/[locale]`

首页必须让用户第一屏就能开始使用，不做纯营销落地页。

页面能力：

- 顶部导航：功能、价格、常见问题、博客、仪表盘、登录、免费开始。
- 首屏工作台：上传文件、粘贴链接、浏览器录音。
- 能力标签：支持常见音视频格式、多语言识别、多格式导出。
- 个人免费计划概览：每日文件数、本月分钟数、队列任务数。
- 工作流说明：上传或录音、队列转写、编辑与导出。
- 使用场景：学习笔记、个人会议、创作者、研究媒体。
- 套餐入口和首页常见问题。

### 4.2 国际化

当前支持 8 个语言路由：

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
- 个人仪表盘和核心工作台。
- 价格页、常见问题、博客列表、博客详情。
- 服务条款、隐私政策、公开分享页。

日期、数字和界面文案应跟随当前语言。中文文档、代码注释和数据库字段注释统一使用中文。

### 4.3 登录与注册

路由：

- `/[locale]/auth/signin`
- `/[locale]/auth/signup`
- `/[locale]/auth/verify-email`

能力：

- 邮箱密码注册。
- 邮箱密码登录。
- Google OAuth 登录。
- 邮箱验证令牌和验证结果页。
- 登出接口。
- 当前用户接口。
- 签名 httpOnly Cookie 会话。
- 密码使用 `scrypt` 哈希保存。
- 注册成功自动创建个人 Free 订阅。
- 老用户登录时如果缺少订阅，补齐个人 Free 订阅。

不包含：

- 组织级单点登录。
- SAML/OIDC。
- SCIM。
- 团队成员邀请。
- 团队角色和权限。

### 4.4 个人仪表盘

路由：`/[locale]/dashboard`

仪表盘由三层组成：

- 左侧个人账号、个人额度、文件夹、任务资产列表。
- 中间输入区：上传、链接、录音、语言、发言人标签、开始转写。
- 右侧结果区：任务状态、转写编辑器、AI 工作区、导出中心。

当前应实现：

- 当前个人账号和套餐显示。
- 今日免费文件数。
- 本月账期分钟、剩余分钟、本月任务数。
- 转写和翻译双资产视图。
- 任务搜索，支持按文件名、状态、来源和服务商过滤。
- 个人文件夹，用于归档、重命名、移动和删除任务分类。
- 历史任务恢复，点击任务可重新打开详情。
- 上传单个或批量本地音视频。
- 粘贴公开视频链接。
- 粘贴公开 Google Drive 文件链接，或通过 Google Drive 只读授权导入用户选择的文件。
- 浏览器录音并转成 WebM 文件进入同一套上传/转写队列。
- 转写语言选择：自动识别、英语、中文、西语、法语、德语、日语、韩语、葡语。
- 发言人标签开关。
- SSE 实时状态更新和轮询兜底。
- 转写分段、时间戳、发言人、全文编辑、复制、保存。
- 发言人批量重命名。
- 转写评分和反馈备注。
- AI 摘要、思维导图、翻译。
- TXT、SRT、VTT、JSON、Markdown、CSV、DOCX、PDF 导出。
- 多选任务批量移动、批量删除、批量删除原始媒体和批量导出。
- 个人公开分享链接。

不包含：

- 团队空间。
- 成员管理。
- 审计日志。
- 团队用量与团队资产。

### 4.5 订阅套餐

路由：`/[locale]/pricing`

| 套餐 | 价格 | 月度分钟 | 单文件上限 | 核心能力 |
| --- | ---: | ---: | ---: | --- |
| Free | $0/月 | 120 | 30 分钟 | 每日 3 个文件、标准队列、基础导出 |
| Basic | $6/月 | 1200 | 600 分钟 | YouTube 链接、发言人识别、批量任务、更多导出 |
| Standard | $12/月 | 3000 | 900 分钟 | 优先队列、更长文件、AI 摘要和翻译增强 |
| Pro | $18/月 | 6000 | 1200 分钟 | 个人高容量、长期保留、优先支持、较低超额成本 |

已实现 Stripe 能力：

- `POST /api/billing/checkout`：创建本地 `BillingOrder`，再创建 Stripe Checkout 支付会话。
- `POST /api/billing/portal`：创建 Stripe 客户订阅管理入口。
- `POST /api/billing/webhook`：校验 Stripe 签名并同步订单状态、订阅状态、套餐、账期和分钟额度。
- 支持 Basic、Standard、Pro 的月付/年付订阅。
- 支持 Lite、Plus 一次性分钟包。
- 支持已订阅用户购买 Basic、Standard、Pro 加购分钟包。

生产环境要求：

- 在 Stripe 后台创建 Basic、Standard、Pro 的月付和年付订阅价格。
- 在 Stripe 后台创建 Lite、Plus、Add-on Basic、Add-on Standard、Add-on Pro 的一次性价格。
- 配置 `STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET`。
- 配置 `STRIPE_PRICE_BASIC_MONTHLY`、`STRIPE_PRICE_STANDARD_MONTHLY`、`STRIPE_PRICE_PRO_MONTHLY`。
- 配置 `STRIPE_PRICE_BASIC_ANNUAL`、`STRIPE_PRICE_STANDARD_ANNUAL`、`STRIPE_PRICE_PRO_ANNUAL`。
- 配置 `STRIPE_PRICE_LITE`、`STRIPE_PRICE_PLUS`。
- 配置 `STRIPE_PRICE_ADDON_BASIC`、`STRIPE_PRICE_ADDON_STANDARD`、`STRIPE_PRICE_ADDON_PRO`。
- Stripe Webhook 回调地址指向 `/api/billing/webhook`，至少订阅 `checkout.session.*` 支付结果事件和 `customer.subscription.*` 订阅事件。

### 4.6 个人用量与额度

当前规则：

- 免费用户每日 3 个文件。
- 免费计划每月 120 分钟。
- 任务创建时预留预计分钟数。
- Worker 完成后按实际时长结算。
- 任务失败或队列不可用时释放预留分钟。
- 所有额度变化写入 `UsageLedger`。
- 所有套餐点击和 Stripe 支付结果写入 `BillingOrder`，订单 ID 同步到 Stripe Checkout `client_reference_id` 与 metadata。
- 仪表盘通过 `/api/account/usage` 展示今日、账期、套餐、剩余分钟、本月任务数和最近流水。

预估规则：

- 上传文件根据文件大小估算分钟数。
- 当前粗略按 12MB/分钟预留，避免大文件瞬间超用量。
- 实际结算以转写服务商返回的媒体时长为准。

### 4.7 转写任务

任务来源：

- `UPLOAD`：用户上传本地音视频，先通过短期签名 URL 直传对象存储；浏览器录音生成的 WebM 文件、Google Drive 导入后复制到对象存储的文件，也按 `UPLOAD` 入库。
- `YOUTUBE`：用户粘贴公开视频链接，由后端使用 yt-dlp 解析直链或交给服务商处理。

任务状态：

- `QUEUED`：已进入队列。
- `PROCESSING`：正在预处理、转写或生成结果。
- `COMPLETED`：已完成转写。
- `FAILED`：处理失败。
- `CANCELED`：任务被取消。

任务归属：

- 登录用户创建的任务写入 `MediaTask.userId`。
- 任务列表、详情、转写编辑、AI 洞察、导出和分享都按当前个人账号校验访问。
- 匿名体验可以创建临时任务，但不能修改、保存或进入个人资产列表。

### 4.8 AI 后处理

转写完成后可生成：

- 摘要：一句话概览、要点、行动项。
- 思维导图：层级节点，用于快速理解内容结构。
- 翻译：把转写文本翻译为用户选择或系统默认目标语言。

AI 后处理应复用已有转写文本，不重复消耗媒体转写队列。

### 4.9 导出与分享

导出格式：

- TXT。
- Markdown。
- JSON。
- CSV。
- SRT。
- VTT。
- DOCX。
- PDF。

分享能力：

- 个人用户可为已完成转写创建公开分享链接。
- 分享链接使用随机令牌，数据库只保存哈希。
- 分享页展示标题、转写正文、分段、时间戳和基础元信息。
- 分享页支持原始媒体播放、跳转到对应时间戳、翻译查看、导出入口和访问统计。
- 分享链接可预留过期时间、启用状态和访问统计字段。

公开工具：

- YouTube 字幕下载工具：读取公开视频信息、字幕列表，并导出 SRT 或 VTT。
- YouTube 视频下载辅助工具：读取公开视频信息并准备可用下载地址。
- 浏览器本地工具：视频转音频、WAV 转 MP3 等不上传源文件的实用工具。

## 5. 页面清单

| 页面 | 路由 | 目标 |
| --- | --- | --- |
| 官网首页 | `/[locale]` | 让访客快速理解并立即开始转写 |
| 登录 | `/[locale]/auth/signin` | 已有用户登录 |
| 注册 | `/[locale]/auth/signup` | 新用户注册和邮箱验证 |
| AppSumo 激活 | `/[locale]/auth/appsumo` | AppSumo 用户兑换激活码 |
| 认证回调 | `/[locale]/auth/callback` | 兼容旧 OAuth 或邮件跳转后的前端落点 |
| 忘记密码 | `/[locale]/auth/forgot-password` | 申请密码重置邮件 |
| 重置密码 | `/[locale]/auth/reset-password` | 使用重置令牌设置新密码 |
| 邮箱验证 | `/[locale]/auth/verify-email` | 展示验证结果 |
| 个人仪表盘 | `/[locale]/dashboard` | 个人任务、额度、转写、AI、导出 |
| 价格页 | `/[locale]/pricing` | 展示套餐和发起 Stripe 支付会话 |
| 开发者文档 | `/[locale]/docs` | 记录旧客户端和自动化集成仍可能使用的公开 API |
| 功能页 | `/[locale]/features` | 面向 SEO 的功能总览页 |
| 常见问题 | `/[locale]/faq` | 回答常见问题 |
| 博客列表 | `/[locale]/blog` | SEO 内容入口 |
| 博客详情 | `/[locale]/blog/[slug]` | 长尾关键词内容 |
| 工具着陆页 | `/[locale]/l/[slug]` | 文件格式、媒体类型和长尾关键词工具页 |
| 语言列表页 | `/[locale]/languages` | 展示支持的转写语言 |
| 语言详情页 | `/[locale]/languages/[slug]` | 单语言转写长尾关键词页面 |
| 安全页 | `/[locale]/security` | 说明上传、会话、分享和数据处理安全边界 |
| 联盟计划页 | `/[locale]/affiliate` | 展示推广合作和 AppSumo 用户相关说明 |
| 分享页 | `/[locale]/share/[token]` | 公开查看个人分享的转写 |
| 隐私政策 | `/[locale]/privacy-policy` | 数据和隐私说明，`/[locale]/privacy` 作为兼容别名重定向到此页面 |
| 服务条款 | `/[locale]/terms-of-service` | 订阅和服务条款，`/[locale]/terms` 作为兼容别名重定向到此页面 |
| 设置页 | `/[locale]/settings` | 个人资料、邮箱、密码、订阅入口和账号删除 |
| 转写详情页 | `/[locale]/transcriptions/[taskId]` | 深度编辑单个转写、评分、分享、导出和重试 |
| 上传页 | `/[locale]/upload` | 直接进入上传、链接、录音或 Google Drive 导入 |
| 工具页 | `/[locale]/tools/[slug]` | 公开媒体工具和字幕工具 |

## 6. API 清单

### 6.1 认证

- `POST /api/auth/register`：邮箱密码注册，创建用户、个人 Free 订阅和邮箱验证令牌。
- `POST /api/auth/login`：邮箱密码登录。
- `POST /api/auth/logout`：退出登录。
- `GET /api/auth/me`：读取当前个人用户。
- `POST /api/auth/forgot-password`：创建密码重置令牌并发送重置邮件。
- `POST /api/auth/reset-password`：使用重置令牌更新密码并建立会话。
- `POST /api/auth/appsumo/activate`：处理 AppSumo 激活码兑换。
- `GET /api/auth/google/start`：发起 Google OAuth。
- `GET /api/auth/google/callback`：处理 Google OAuth 回调并补齐个人订阅。
- `GET /api/auth/verify-email`：验证邮箱令牌。

### 6.2 任务

- `GET /api/tasks`：读取当前个人用户任务列表。
- `POST /api/tasks`：创建个人转写任务并预留额度。
- `GET /api/tasks/[taskId]`：读取个人任务详情。
- `GET /api/tasks/[taskId]/events`：订阅任务 SSE 更新。
- `PATCH /api/tasks/[taskId]/transcript`：保存个人转写编辑稿。
- `PATCH /api/tasks/[taskId]/speakers`：批量更新转写分段里的发言人名称。
- `POST /api/tasks/[taskId]/rating`：保存当前用户对转写质量的评分和备注。
- `PATCH /api/tasks/[taskId]/folder`：移动任务到个人文件夹。
- `POST /api/tasks/[taskId]/cancel`：取消仍在队列或处理中的任务。
- `POST /api/tasks/[taskId]/retry`：重试失败任务。
- `POST /api/tasks/[taskId]/retranscribe`：重新排队转写并清理旧 AI 洞察与导出缓存。
- `POST /api/tasks/[taskId]/insights`：生成 AI 洞察。
- `POST /api/tasks/[taskId]/insights/single`：单独重新生成摘要或思维导图。
- `GET /api/tasks/[taskId]/translations`：读取任务翻译列表。
- `POST /api/tasks/[taskId]/translations`：创建目标语言翻译。
- `PATCH /api/tasks/[taskId]/translations/[locale]`：保存人工编辑后的翻译。
- `GET /api/tasks/[taskId]/exports/[format]`：按格式导出字幕或文档。
- `GET /api/tasks/[taskId]/outline/[format]`：把 AI 洞察导出为 Markdown、TXT、JSON、DOCX 或 PDF 大纲。
- `POST /api/tasks/[taskId]/share`：创建个人分享链接。
- `DELETE /api/tasks/[taskId]/share`：停用个人分享链接。
- `GET /api/tasks/[taskId]/original-file`：获取原始媒体下载地址。
- `DELETE /api/tasks/[taskId]/original-file`：删除原始媒体文件但保留转写结果。
- `GET /api/tasks/[taskId]/status`：返回任务当前处理状态，供轻量轮询和旧客户端使用。
- `PATCH /api/tasks/batch`：批量移动、删除任务或删除原始媒体。
- `POST /api/tasks/batch/export`：批量导出选中任务。
- `POST /api/tasks/transcription`、`/api/tasks/media-transcription`、`/api/tasks/youtube-transcription`：旧客户端创建转写任务的兼容入口。
- `POST /api/tasks/retry`、`/api/tasks/youtube-transcript-fallback`：旧客户端重试和 YouTube 降级重试入口。
- `GET/POST /api/transcriptions`、`/api/transcriptions/[taskId]`、`/api/transcriptions/search`、`/api/transcriptions/page`、`/api/transcriptions/anonymous/latest`：旧客户端转写列表、详情、搜索和匿名最近任务接口。
- `/api/transcriptions/[taskId]/audio-download-url`、`/api/transcriptions/[taskId]/segments/batch`、`/api/transcriptions/[taskId]/speakers/batch`、`/api/transcriptions/[taskId]/tasks`、`/api/transcriptions/[taskId]/unlock`：旧转写编辑器的音频、分段、说话人、子任务和解锁兼容接口。
- `/api/transcriptions/batch-delete`、`/api/transcriptions/batch-delete-original-file`、`/api/transcriptions/batch-folder`、`/api/transcriptions/batch-status`：旧客户端批量删除、删除原始文件、移动文件夹和批量状态接口。

### 6.3 文件夹、媒体和第三方导入

- `GET /api/folders`：读取当前个人文件夹。
- `POST /api/folders`：创建个人文件夹。
- `PATCH /api/folders/[folderId]`：重命名文件夹。
- `DELETE /api/folders/[folderId]`：删除文件夹并解除任务归档。
- `POST /api/media/resolve`：解析公开媒体链接，返回来源、标题、时长、缩略图和警告信息。
- `GET /api/google-drive/auth`：发起 Google Drive 只读授权。
- `GET /api/google-drive/callback`：保存 Google Drive OAuth token。
- `GET /api/google-drive/files`：读取当前用户 Drive 中的音视频文件列表。
- `POST /api/google-drive/import`：把选中的 Drive 文件创建为转写任务。
- `GET /api/google-drive/connection`：读取 Drive 连接状态。
- `DELETE /api/google-drive/connection`：断开 Drive 连接。

### 6.4 用量、订阅和账号

- `GET /api/account/usage`：读取当前个人账号套餐、今日免费次数、账期任务和用量流水。
- `PATCH /api/account/profile`：更新个人资料、邮箱或密码。
- `DELETE /api/account/deactivate`：删除当前个人账号及其数据。
- `GET /api/entitlements`：读取当前用户可用能力和套餐限制，供旧客户端判断功能开关。
- `GET/PATCH /api/user`：旧客户端读取或更新个人资料的兼容入口。
- `GET /api/user/limits`、`/api/user/geo`、`/api/user/email-check`、`/api/user/sync-profile`、`/api/user/acquisition`：旧客户端账号、限制、地区、邮箱检查、资料同步和来源记录辅助接口。
- `POST /api/user/identity-transition-intents`、`/api/user/promote-anonymous-identity`、`/api/user/merge`：旧匿名身份升级和登录合并兼容接口。
- `POST /api/billing/checkout`：创建 Stripe 支付会话。
- `POST /api/billing/portal`：打开 Stripe 客户订阅管理入口。
- `POST /api/billing/webhook`：处理 Stripe 订阅回调。
- `GET/POST /api/account/api-keys`、`/api/account/api-keys/[apiKeyId]`、`/api/account/webhooks`、`/api/account/webhooks/[webhookId]`：公开 API 与 Webhook 兼容层，个人版主界面不展示。
- `GET/POST /api/api-keys`、`/api/api-keys/[apiKeyId]`、`/api/api-keys/[apiKeyId]/reset`：旧 API 密钥短路径别名，内部复用账号 API 密钥实现。

### 6.5 上传、分享、工具和公开 API

- `POST /api/upload/generate-signed-url`：创建对象存储短期上传 URL；`POST /api/uploads` 作为旧工作台兼容别名保留。
- `POST /api/upload/complete`：确认旧上传流程完成，返回任务创建可继续使用的文件字段。
- `POST /api/upload/multipart/create`、`/api/upload/multipart/[uploadId]/part/[partNumber]/sign`、`/api/upload/multipart/[uploadId]/complete`、`/api/upload/multipart/[uploadId]/abort`、`/api/upload/multipart/[uploadId]/parts`：大文件分片上传兼容接口。
- `GET /api/upload/provider-policy`：返回上传服务商策略，供旧客户端选择上传方式。
- `GET /api/share/[token]/exports/[format]`：公开分享导出。
- `GET /api/share/[token]/original-file`：公开分享页播放原始媒体。
- `GET /api/share/[token]/translations`、`/api/share/[token]/translations/[locale]`：公开分享页读取翻译内容。
- `POST /api/export`、`/api/export/batch`、`/api/export/outline`：旧导出入口，内部复用任务导出、批量导出和大纲导出实现。
- `GET /shares/[token]`、`POST /shares/export`：旧分享详情和旧分享导出短路径，保留历史字段映射。
- `POST /tasks/text/single`、`POST /tasks/translation`：旧客户端单项 AI 后处理和翻译任务短路径，内部转发到当前任务接口。
- `POST /api/tools/youtube-info`：读取 YouTube 视频信息。
- `POST /api/tools/youtube-subtitles`：读取 YouTube 字幕列表。
- `POST /api/tools/youtube-subtitle-download`：下载 YouTube 字幕。
- `POST /api/tools/youtube-video-download-url`：准备 YouTube 视频下载地址。
- `GET/POST /api/v1/transcriptions`、`/api/v1/transcriptions/[taskId]`、`/api/v1/transcriptions/[taskId]/status`、`/api/v1/transcriptions/[taskId]/exports/[format]`、`/api/v1/youtube/transcriptions`、`/api/v1/files/upload-url`：使用 API Key 的公开 API 兼容层，面向外部集成，不在个人版主界面展示。

## 7. 数据库设计

运行时模型以 `prisma/schema.prisma` 为准，MySQL 交付脚本以 `prisma/sql/all.sql` 为准。字段必须带中文注释。

个人版核心表：

- `User`：个人账号、邮箱、密码哈希、头像、语言、每日免费次数。
- `OAuthAccount`：第三方登录账号绑定。
- `GoogleDriveConnection`：个人 Google Drive 只读授权连接，用于导入用户选择的音视频文件。
- `EmailVerificationToken`：邮箱验证令牌哈希和过期时间。
- `Subscription`：个人订阅计划、Stripe Customer、账期、额度和单文件上限。
- `BillingOrder`：套餐订单、Stripe Checkout Session、PaymentIntent、Subscription、金额、支付状态和订单状态。
- `UsageLedger`：个人分钟额度流水，记录预留、结算、释放和调整。
- `MediaTask`：个人媒体任务、来源、状态、服务商、进度、错误、时长、额度分钟。
- `MediaAsset`：原始媒体、标准化音频和长音频切片资产。
- `Folder`：个人文件夹，用于给转写任务分类和排序。
- `Transcript`：完整可编辑转写文本、分段、词级时间戳，以及当前摘要、思维导图和按语言保存的翻译；未开启摘要生成时 `summary` 为空。
- `TranscriptRating`：用户对转写质量的评分和反馈备注。
- `ExportAsset`：导出文件格式、对象存储 Key、访问 URL 和创建时间。
- `ShareLink`：个人公开分享链接令牌哈希、标题、状态和访问统计。

历史团队工作区和公开 API 兼容表处理：

- 旧版本中存在 `Team`、`TeamMember`、`ApiKey`、`AuditLog`、`WebhookEndpoint`、`WebhookDelivery` 等表。
- 个人版主界面不展示团队成员、审计日志和团队资产。
- `ApiKey`、`WebhookEndpoint`、`WebhookDelivery` 仍服务公开 API、一次性回调和历史客户端兼容；`Team` 外键结构也被这些兼容层复用。
- 这些表不能因为个人版页面不展示就直接删除；如需下线，需要先完成公开 API 与 Webhook 退役方案、迁移脚本和访问日志审计。

字段长度原则：

- 主键和外键 ID 使用 `VARCHAR(32)`。
- 邮箱使用 `VARCHAR(320)`。
- URL 字段使用 `VARCHAR(2048)`。
- 文件名、视频标题使用 `VARCHAR(512)`。
- 对象存储 Key 使用 `VARCHAR(1024)`。
- 状态说明和错误摘要使用 `VARCHAR(1024)`。
- 令牌哈希使用 `VARCHAR(128)`，展示前缀使用 `VARCHAR(24)`。
- 大文本内容使用 `LONGTEXT`，结构化结果使用 `JSON`。

## 8. 安全与隐私

- 密码只保存哈希。
- 会话 Cookie 使用 httpOnly、sameSite，并在生产环境开启 secure。
- 上传使用短期签名 URL。
- Google Drive 只申请只读权限，导入时把用户选择的媒体复制到对象存储或创建受控任务，不修改用户云盘文件。
- 分享令牌只保存哈希。
- Stripe Webhook 使用签名校验和 5 分钟时间窗口。
- 用户只能访问自己 `userId` 归属的任务、转写、AI 洞察和导出。
- 个人版不提供团队权限、成员协作和高级审计能力。

## 9. 部署要求

基础服务：

- Next.js App Router。
- Prisma + MySQL/TiDB。
- Redis + BullMQ。
- 对象存储 S3/R2。
- Stripe。
- 邮件服务 Resend。

必要环境变量：

- `DATABASE_URL`
- `REDIS_URL`
- `TRANSCRIBE_QUEUE`
- `NEXT_PUBLIC_APP_URL`
- `AUTH_SECRET`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL`
- `GROQ_API_KEY`
- `DEEPGRAM_API_KEY`
- `ASSEMBLYAI_API_KEY`
- `OPENAI_API_KEY`
- `DEEPSEEK_API_KEY`
- `GEMINI_API_KEY`
- `DEEPL_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_BASIC`
- `STRIPE_PRICE_STANDARD`
- `STRIPE_PRICE_PRO`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_API_KEY`
- `YT_DLP_PATH`
- `DEEPSEEK_BASE_URL`
- `DEEPSEEK_CHAT_MODEL`
- `DEEPSEEK_FLASH_MODEL`
- `GEMINI_MODEL`
- `DEEPL_API_URL`

## 10. 验收标准

### 10.1 产品与页面

- 官网首页第一屏可以上传、粘贴链接或录音。
- 国际化 8 个语言路由可访问。
- 登录、注册、邮箱验证、Google OAuth 可用。
- 个人仪表盘展示账号、套餐、今日文件、本月分钟、剩余分钟、任务资产。
- 价格页能展示 Free、Basic、Standard、Pro，并发起 Stripe 支付会话。
- 常见问题、博客列表、博客详情可访问。
- 产品可见区域不出现团队工作区、成员管理、API Key、Webhook、审计日志。
- 设置页可更新个人资料、登录邮箱、密码，并可主动删除账号。

### 10.2 任务与额度

- 登录用户创建任务后写入 `MediaTask.userId`。
- `/api/tasks` 只返回当前个人用户的任务。
- `/api/account/usage` 按当前 `userId` 统计用量。
- 免费用户每日文件数和月度分钟数真实扣减。
- 任务失败后释放预留额度。
- Google Drive 导入创建的任务按当前用户归属和额度规则处理。
- 批量操作只作用于当前用户可访问的任务。

### 10.3 导出与分享

- 已完成任务可保存编辑稿。
- 已完成任务可生成摘要、思维导图和翻译。
- 已完成任务可导出字幕和文档。
- 已完成任务可创建个人分享链接。
- 分享页可播放原始媒体、按时间戳跳转、查看翻译并导出公开文件。
- YouTube 字幕工具可列出并下载公开视频字幕。

## 11. 后续迭代

- 更细的分享权限和分享链接过期管理。
- 个人标签体系和更强的资产检索。
- 个人词表和专有名词纠错。
- 移动端录音体验优化。
- 支持更多公开视频平台。
- 公开 API/Webhook 的产品化开放或正式退役决策。
