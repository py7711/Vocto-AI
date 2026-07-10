# Votxt

Votxt 是一个基于 Next.js 的个人 AI 音视频转写工作区，专注于上传、公开视频链接、浏览器录音、转写、摘要、思维导图、问答、翻译、公开分享和多格式导出。

## 技术栈

- **Next.js App Router**：用于构建用户界面和路由处理程序
- **Prisma + TiDB Cloud**：用于持久化存储任务、转录文本、订阅、导出以及分析洞察数据
- **Upstash Redis / 本地 Redis + BullMQ**：用于速率限制、异步任务处理以及基于 SSE（服务器发送事件）的状态分发。生产环境推荐与 Web/Worker 同机部署本地 Redis（`redis://127.0.0.1:6379`）。
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

3. 填写 `.env` 文件中的 `DATABASE_URL`、Redis 连接、R2 凭证以及至少一个语音转文字（STT）服务商的 API 密钥。

**本地开发**默认连接本机 Redis：

```bash
REDIS_URL="redis://127.0.0.1:6379"
```

若使用 Upstash 等云 Redis，请使用 Redis 协议地址，通常是 `rediss://`：

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

6. 启动 Redis（本地开发必需）并在不同终端分别运行 Web 和 Worker：

```bash
# Ubuntu / macOS（Homebrew: brew install redis）
sudo apt install -y redis-server   # 或确保本机已有 Redis
redis-cli ping                     # 应返回 PONG

pnpm run dev
pnpm run worker
```

打开 `http://localhost:3000`。

## 生产环境部署（Ubuntu / AWS EC2）

本节说明如何在同一台 Linux 服务器上同时部署 **Web 应用**（`pnpm start`，端口 3091）和 **Worker**（`pnpm run worker`）。当前服务器已部署 Worker，按以下步骤补充 Web 服务即可。

完整排障手册见 [docs/aws-ubuntu-worker.md](./docs/aws-ubuntu-worker.md)。

### 部署架构

| 组件 | 部署位置 | 端口 | 说明 |
| --- | --- | --- | --- |
| Web 应用 | AWS EC2 / Ubuntu | **3091** | `pnpm build` + `pnpm start`，对外提供页面和 API |
| Worker | AWS EC2 / Ubuntu | 无 | `pnpm run worker`，消费转写队列，不监听 HTTP |
| 数据库 | TiDB Cloud / MySQL 8 | 4000 | Web 和 Worker 共用 `DATABASE_URL` |
| Redis | 本地 Redis（推荐）或 Upstash | 6379 | 本地部署仅监听 `127.0.0.1`，使用 `redis://127.0.0.1:6379` |
| 对象存储 | Cloudflare R2 | — | 媒体文件和导出资源 |

两台进程共用同一份代码目录 `/data/votxt-worker/Vocto-AI`，由 PM2 托管（`ecosystem.config.cjs`）。

### AWS 安全组：是否需要开放 3091？

取决于访问方式，**二选一**：

| 访问方式 | 安全组入站规则 | 3091 是否对外开放 |
| --- | --- | --- |
| **直接访问** `http://公网IP:3091` 或 `https://域名:3091` | 开放 TCP **3091**，来源 `0.0.0.0/0`（或限制为办公 IP） | **需要** |
| **反向代理**（Nginx/Caddy/Cloudflare 反代到 `127.0.0.1:3091`） | 只开放 TCP **80** 和 **443** | **不需要**（3091 仅本机监听） |

生产环境推荐反向代理方案：3091 只绑定本机，由 Nginx 在 80/443 接收流量后转发，安全性更好，也无需在 URL 中带端口号。

AWS 控制台操作路径：EC2 → 实例 → 安全 → 安全组 → 编辑入站规则 → 添加规则。

Worker 不需要开放任何 HTTP 端口，只需 SSH（22）和出站访问。

### 1. 服务器要求

- 系统：Ubuntu Server 22.04 / 24.04 LTS
- 规格：Web + Worker 同机部署建议 `t3.medium` 起步（内存 ≥ 4 GB，`pnpm build` 需要约 2 GB）
- Node.js：**22.x LTS**（最低 v22.13）
- 系统依赖：Git、pnpm、FFmpeg、yt-dlp、build-essential、python3

若 Worker 已部署，可跳过 §2 和 §3 中的重复步骤。

### 2. 安装系统依赖

```bash
apt update && apt upgrade -y
apt install -y git curl ca-certificates build-essential python3 python3-pip ffmpeg

# Node.js 22 LTS（不能用 20.x）
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v

corepack enable
corepack prepare pnpm@latest --activate
pnpm -v

python3 -m pip install --user -U yt-dlp
```

### 3. 拉取代码并安装依赖

```bash
mkdir -p /data/votxt-worker
cd /data/votxt-worker
git clone <你的仓库地址> Vocto-AI
cd Vocto-AI

pnpm install --frozen-lockfile
pnpm run prisma:generate
```

### 4. 配置环境变量

Web 和 Worker 可共用同一份环境变量文件 `.env`：

```bash
cd /data/votxt-worker/Vocto-AI
cp .env.example .env
chmod 600 .env
nano .env
```

Web 服务额外需要确认以下配置：

```bash
# Web 监听端口（systemd 也会注入，此处写入便于手动测试）
PORT="3091"

# 公网访问地址（必须与用户实际访问的域名一致，不含端口时需配合反向代理）
NEXT_PUBLIC_APP_URL="https://votxt.io"
TRANSCRIPTION_CALLBACK_BASE_URL="https://votxt.io"
AUTH_SECRET="至少 32 位的随机字符串"

DATABASE_URL="mysql://USER:PASSWORD@HOST:4000/votxt?sslaccept=strict"
REDIS_URL="redis://127.0.0.1:6379"
TRANSCRIBE_QUEUE="votxt-transcribe"

R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET="votxt-media"
R2_PUBLIC_BASE_URL="https://media.example.com"

GROQ_API_KEY=""
DEEPGRAM_API_KEY=""
ASSEMBLYAI_API_KEY=""

# Web 独有：邮件、OAuth、支付（按需填写）
SMTP_HOST=""
SMTP_PORT="465"
SMTP_USER=""
SMTP_PASSWORD=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_BASIC_MONTHLY=""
STRIPE_PRICE_STANDARD_MONTHLY=""
STRIPE_PRICE_PRO_MONTHLY=""
STRIPE_PRICE_BASIC_ANNUAL=""
STRIPE_PRICE_STANDARD_ANNUAL=""
STRIPE_PRICE_PRO_ANNUAL=""
STRIPE_PRICE_LITE=""
STRIPE_PRICE_PLUS=""
STRIPE_PRICE_ADDON_BASIC=""
STRIPE_PRICE_ADDON_STANDARD=""
STRIPE_PRICE_ADDON_PRO=""
```

关键注意事项：

- `NEXT_PUBLIC_APP_URL` 必须是用户浏览器实际访问的地址。若通过 `https://votxt.io` 反代，填域名不带端口；若直接 `http://IP:3091` 访问，需带端口。
- `TRANSCRIBE_QUEUE` 必须与 Worker 一致。
- `REDIS_URL` 本地部署填 `redis://127.0.0.1:6379`；云 Redis 填 `rediss://` 协议地址，不能填 Upstash REST URL。
- Google OAuth 回调地址需在 Google Cloud Console 配置为 `https://votxt.io/api/auth/google/callback`。
- Stripe Webhook 回调地址为 `https://votxt.io/api/billing/webhook`。

#### Stripe 后台配置步骤

1. 在 Stripe Dashboard 创建或确认产品：
   - `Votxt Basic`：订阅套餐，1200 分钟/月。
   - `Votxt Standard`：订阅套餐，3000 分钟/月。
   - `Votxt Pro`：订阅套餐，6000 分钟/月。
   - `Votxt Lite Pack`：一次性分钟包，300 分钟，90 天有效。
   - `Votxt Plus Pack`：一次性分钟包，600 分钟，90 天有效。
   - `Votxt Add-on Basic/Standard/Pro`：已订阅用户加购包，分别为 500/1000/3000 分钟。
2. 为订阅产品分别创建 recurring Price：
   - Basic 月付：`$10 / month`，填入 `STRIPE_PRICE_BASIC_MONTHLY`。
   - Standard 月付：`$20 / month`，填入 `STRIPE_PRICE_STANDARD_MONTHLY`。
   - Pro 月付：`$30 / month`，填入 `STRIPE_PRICE_PRO_MONTHLY`。
   - Basic 年付：`$72 / year`，填入 `STRIPE_PRICE_BASIC_ANNUAL`。
   - Standard 年付：`$144 / year`，填入 `STRIPE_PRICE_STANDARD_ANNUAL`。
   - Pro 年付：`$216 / year`，填入 `STRIPE_PRICE_PRO_ANNUAL`。
3. 为一次性和加购产品创建 one-time Price：
   - Lite：`$12.90`，填入 `STRIPE_PRICE_LITE`。
   - Plus：`$19.90`，填入 `STRIPE_PRICE_PLUS`。
   - Add-on Basic：`$10`，填入 `STRIPE_PRICE_ADDON_BASIC`。
   - Add-on Standard：`$15`，填入 `STRIPE_PRICE_ADDON_STANDARD`。
   - Add-on Pro：`$20`，填入 `STRIPE_PRICE_ADDON_PRO`。
4. 在 Developers -> API keys 复制 Secret key，填入 `STRIPE_SECRET_KEY`。生产环境使用 `sk_live_...`，本地/测试环境使用 `sk_test_...`。
5. 在 Developers -> Webhooks 新建 endpoint：`https://votxt.io/api/billing/webhook`，订阅事件：
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. 复制 Webhook signing secret，填入 `STRIPE_WEBHOOK_SECRET`。本地调试可使用 Stripe CLI 转发到 `http://localhost:3000/api/billing/webhook`，并使用 CLI 输出的 `whsec_...`。
7. 部署后重启 Web 服务，使新的环境变量生效。点击任一套餐按钮时，系统会先创建 `BillingOrder`，再把订单 ID 写入 Stripe Checkout 的 `client_reference_id` 和 metadata；Webhook 回来后会更新订单、订阅和分钟额度。

### 4.1 部署本地 Redis（推荐）

Web 和 Worker 同机部署时，推荐在本机安装 Redis，避免云 Redis 免费额度耗尽（如 Upstash `max requests limit exceeded`）或外网延迟。

#### 安装与启动

```bash
apt update
apt install -y redis-server

# 确认仅监听本机（默认 bind 127.0.0.1）
grep '^bind' /etc/redis/redis.conf

systemctl enable redis-server
systemctl start redis-server
systemctl is-active redis-server    # 应为 active
redis-cli ping                      # 应返回 PONG
```

#### 数据持久化（重启自动加载）

BullMQ 队列中的待处理任务、SSE 频道状态、速率限制计数都存储在 Redis 中。必须开启持久化，否则服务器重启后队列任务会丢失。

编辑 `/etc/redis/redis.conf`，确保以下配置：

```bash
# 与 systemd 集成，开机自启由 systemctl 管理
supervised systemd

# RDB 快照：定期将内存数据写入磁盘
save 3600 1 300 100 60 10000
dbfilename dump.rdb
dir /var/lib/redis

# AOF 日志：每次写入追加到文件，重启时优先加载（耐久性更好）
appendonly yes
appendfsync everysec
```

| 机制 | 文件位置 | 作用 |
| --- | --- | --- |
| **AOF**（主） | `/var/lib/redis/appendonlydir/` | 记录每条写命令，重启自动重放，最多丢失 1 秒数据 |
| **RDB**（备） | `/var/lib/redis/dump.rdb` | 定期快照，用于快速恢复和备份 |

一键启用（若尚未配置）：

```bash
sed -i 's/^appendonly no/appendonly yes/' /etc/redis/redis.conf
sed -i 's/^# supervised auto/supervised systemd/' /etc/redis/redis.conf
grep -q '^save 3600' /etc/redis/redis.conf || \
  sed -i '/^# save 3600 1 300 100 60 10000/s/^# //' /etc/redis/redis.conf

systemctl restart redis-server
```

验证持久化已生效：

```bash
# 确认 AOF 已开启
redis-cli CONFIG GET appendonly    # 应返回 appendonly yes

# 确认持久化文件已生成
ls -la /var/lib/redis/
# 应看到 appendonlydir/ 和 dump.rdb

# 模拟重启后数据仍在
redis-cli SET votxt:persist-test "ok"
systemctl restart redis-server
redis-cli GET votxt:persist-test    # 应返回 ok
```

**开机自启链路**：

```
服务器重启
  → systemd 启动 redis-server.service（enabled）
  → Redis 自动加载 AOF（appendonlydir/）或 RDB（dump.rdb）
  → PM2 通过 pm2-root.service 恢复 votxt-web / votxt-worker
  → Worker 继续消费队列中未完成的任务
```

确认开机自启：

```bash
systemctl is-enabled redis-server    # 应为 enabled
systemctl is-enabled pm2-root        # 应为 enabled
```

#### 配置 `.env`

```bash
REDIS_URL="redis://127.0.0.1:6379"
TRANSCRIBE_QUEUE="votxt-transcribe"
```

代码默认回退地址也是 `redis://localhost:6379`（见 `src/lib/env.ts`），但生产环境建议在 `.env` 中显式写入。

#### Redis 在系统中的用途

| 用途 | 模块 | 说明 |
| --- | --- | --- |
| 转写任务队列 | BullMQ + `src/lib/queue.ts` | Worker 通过 `bzpopmin` 等阻塞命令消费任务 |
| 任务状态推送 | `src/lib/task-status.ts` | SSE 实时推送 `task:{taskId}` 频道 |
| API 速率限制 | `src/lib/rate-limit.ts` | `rate:{key}` 计数器 |

BullMQ **必须**使用 Redis 协议地址（`redis://` 或 `rediss://`），不能使用 Upstash REST URL（`https://`）。

#### 验证连接

```bash
cd /data/votxt-worker/Vocto-AI
set -a && . ./.env && set +a

node -e "
const IORedis = require('ioredis');
const r = new IORedis(process.env.REDIS_URL, {maxRetriesPerRequest: null, enableReadyCheck: false, family: 4});
r.ping().then(p => console.log('Redis ping:', p)).finally(() => r.quit());
"

# 验证 BullMQ 队列可读
node -e "
const {Queue} = require('bullmq');
const IORedis = require('ioredis');
const r = new IORedis(process.env.REDIS_URL, {maxRetriesPerRequest: null, enableReadyCheck: false, family: 4});
const q = new Queue(process.env.TRANSCRIBE_QUEUE || 'votxt-transcribe', {connection: r});
q.getJobCounts().then(c => console.log('Queue counts:', c)).finally(async () => {await q.close(); await r.quit();});
"
```

#### 应用 Redis 配置变更

修改 `REDIS_URL` 后必须带环境变量重启 PM2：

```bash
pm2 restart all --update-env
pm2 logs votxt-worker --lines 20
```

日志中应出现 `Votxt worker listening on queue votxt-transcribe.`，且不再有 Upstash 连接错误。

#### 安全与运维

- 本地 Redis 默认只绑定 `127.0.0.1`，**不要**对公网开放 6379 端口。
- AWS 安全组无需添加 Redis 入站规则。
- 查看状态：`systemctl status redis-server`、`redis-cli info memory`
- 查看持久化：`redis-cli INFO persistence`、`ls -la /var/lib/redis/`
- 查看队列积压：`redis-cli keys 'bull:votxt-transcribe*'`（BullMQ 内部键名以实际输出为准）
- 修改 `redis.conf` 后执行 `systemctl restart redis-server` 使配置生效

#### 可选：改用云 Redis

若需多机部署 Web + Worker，可改用 Upstash 或其他托管 Redis：

```bash
REDIS_URL="rediss://default:PASSWORD@HOST.upstash.io:6379"
```

注意云 Redis 免费套餐有请求数上限；BullMQ 阻塞轮询消耗较快，生产环境建议本地 Redis 或付费套餐。

### 5. 构建 Web 应用

Web 服务需要先构建生产产物，Worker 不需要此步骤：

```bash
cd /data/votxt-worker/Vocto-AI
set -a && . ./.env && set +a

# 内存不足时（t3.small）加限制参数
NODE_OPTIONS="--max-old-space-size=2048" pnpm build
```

构建成功后会生成 `.next/` 目录。每次代码更新后都需要重新 `pnpm build` 再重启 Web 服务。

### 6. 手动启动验证（Web）

```bash
cd /data/votxt-worker/Vocto-AI
set -a && . ./.env && set +a
PORT=3091 pnpm start
```

另开终端测试：

```bash
curl -I http://127.0.0.1:3091/zh
```

返回 `200` 或 `307` 即正常。验证通过后按 `Ctrl+C` 停止，改用 PM2 托管。

### 7. 使用 PM2 托管（自动重启 + 开机自启）

生产环境使用 PM2 管理 Web 和 Worker 两个进程。**不要使用 systemd 单独托管 `votxt-web` / `votxt-worker`**，否则会与 PM2 重复启动两套服务。

#### 7.1 安装 PM2

```bash
npm install -g pm2
```

#### 7.2 清理旧的 systemd 服务（重要）

若之前用 systemd 托管过，必须先停止并删除，避免重复启动：

```bash
systemctl stop votxt-web votxt-worker 2>/dev/null || true
systemctl disable votxt-web votxt-worker 2>/dev/null || true
rm -f /etc/systemd/system/votxt-web.service /etc/systemd/system/votxt-worker.service
systemctl daemon-reload
systemctl reset-failed 2>/dev/null || true

# 确认已不存在
systemctl is-enabled votxt-web votxt-worker 2>&1   # 应显示 not-found
```

PM2 自身通过 `pm2-root.service` 实现开机自启，这是唯一需要保留的进程管理 systemd 单元。

#### 7.3 PM2 配置文件

项目已包含 `ecosystem.config.cjs`，会自动读取 `.env` 并启动两个进程：

| 进程 | 命令 | 端口 |
| --- | --- | --- |
| `votxt-web` | `pnpm start` | 3091 |
| `votxt-worker` | `pnpm run worker` | 无 |

启动：

```bash
cd /data/votxt-worker/Vocto-AI
pm2 start ecosystem.config.cjs
pm2 status
```

确认两个进程均为 `online`：

```bash
pm2 list
curl -I http://127.0.0.1:3091/zh
```

#### 7.4 注册开机自启

```bash
pm2 save
pm2 startup systemd -u root --hp /root
# 按提示执行输出的 systemctl enable 命令（通常会自动执行）
systemctl is-enabled pm2-root    # 应为 enabled
```

服务器重启后，PM2 会自动 `resurrect` 恢复 `votxt-web` 和 `votxt-worker`。

#### 7.5 yt-dlp 配置（YouTube 元数据必需）

yt-dlp 用于 `/api/media/resolve` 读取 YouTube 标题、时长、缩略图，以及 Worker 解析音频流。

```bash
# 安装（pipx 或 pip 均可）
python3 -m pip install --user -U yt-dlp
/root/.local/bin/yt-dlp --version
```

在 `.env` 中配置：

```bash
YT_DLP_PATH="/root/.local/bin/yt-dlp"
```

代码已自动为 yt-dlp 注入以下参数，无需手动添加：

- `--js-runtimes node:<Node路径>`：解决 "No supported JavaScript runtime" 警告
- `--extractor-args youtube:player_client=android`：适配 AWS 数据中心 IP

**若部分视频仍报 "Sign in to confirm you're not a bot"**，需导出 YouTube cookies 文件：

1. 在本地浏览器登录 YouTube，用扩展（如 Get cookies.txt LOCALLY）导出 Netscape 格式 cookies。
2. 上传到服务器，例如 `/data/votxt-worker/Vocto-AI/config/youtube-cookies.txt`。
3. 在 `.env` 中添加：

```bash
YT_DLP_COOKIES_PATH="/data/votxt-worker/Vocto-AI/config/youtube-cookies.txt"
```

4. 重启 PM2：`pm2 restart all`

验证 yt-dlp 和接口：

```bash
/root/.local/bin/yt-dlp --js-runtimes node --extractor-args "youtube:player_client=android" \
  --dump-json --no-playlist --skip-download "https://www.youtube.com/watch?v=dQw4w9WgXcQ" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['title'], d['duration'])"

curl -s -X POST http://127.0.0.1:3091/api/media/resolve \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}' | python3 -m json.tool
```

### 8. Nginx 反向代理 + HTTPS

生产环境推荐用 Nginx 在 80/443 接收流量，反代到本机 `127.0.0.1:3091`。3091 不对外开放，AWS 安全组只需开放 **80** 和 **443**（以及 SSH 22）。

#### 8.1 前置条件：DNS 必须指向本机

申请 HTTPS 证书前，域名 A 记录必须解析到 EC2 公网 IP（当前为 `54.83.103.97`）。

```bash
# 在服务器上确认公网 IP
curl -s ifconfig.me

# 确认 DNS 已生效（应返回 EC2 公网 IP，而非 Vercel 等其他地址）
dig +short votxt.io A
dig +short www.votxt.io A
```

若 `votxt.io` 此前部署在 Vercel，需先完成迁移：

1. 在 Vercel 项目设置中移除 `votxt.io` / `www.votxt.io` 域名绑定。
2. 在域名注册商（或 Cloudflare DNS）修改记录：
   - `votxt.io` → A 记录 → `54.83.103.97`
   - `www.votxt.io` → A 记录 → `54.83.103.97`（或 CNAME 到 `votxt.io`）
3. AWS 安全组添加入站规则：TCP 80、TCP 443，来源 `0.0.0.0/0`。
4. 等待 DNS 生效（通常 5–30 分钟），再次 `dig +short votxt.io A` 确认。

#### 8.2 安装 Nginx

```bash
apt install -y nginx certbot python3-certbot-nginx
mkdir -p /var/www/certbot
```

#### 8.3 创建 Nginx 配置

```bash
nano /etc/nginx/sites-available/votxt.conf
```

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;
    server_name votxt.io www.votxt.io;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://127.0.0.1:3091;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        client_max_body_size 100M;
    }
}
```

启用配置：

```bash
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/votxt.conf /etc/nginx/sites-enabled/votxt.conf
nginx -t
systemctl enable nginx
systemctl restart nginx
```

本地验证反代是否正常：

```bash
curl -I -H "Host: votxt.io" http://127.0.0.1/zh    # 应返回 200 或 307
```

#### 8.4 端口安全（不要绑定 127.0.0.1）

PM2 中 `votxt-web` 通过 `PORT=3091` 监听 3091。**不要**使用 `next start -H 127.0.0.1`，会导致 next-intl 中间件内部代理失败（页面返回 500）。

3091 不对外暴露的方式：AWS 安全组**不开放** 3091，只开放 80/443。Nginx 在本机转发到 `127.0.0.1:3091` 即可。

```bash
ss -tlnp | grep 3091    # 监听 *:3091 是正常的
curl -I -H "Host: votxt.io" http://127.0.0.1/zh    # 应返回 200
```

#### 8.5 申请 HTTPS 证书（Let's Encrypt）

**DNS 生效后**执行：

```bash
certbot --nginx \
  -d votxt.io \
  -d www.votxt.io \
  --non-interactive \
  --agree-tos \
  --register-unsafely-without-email \
  --redirect
```

Certbot 会自动：申请证书、修改 Nginx 配置、开启 443、将 HTTP 重定向到 HTTPS。证书到期前会自动续期（`certbot.timer` 已随安装启用）。

验证 HTTPS：

```bash
curl -I https://votxt.io/zh
certbot certificates
systemctl status certbot.timer --no-pager
```

#### 8.6 常见问题

**Certbot 报 `unauthorized` / `Invalid response`**

- 原因：DNS 仍指向其他服务器（如 Vercel `216.198.79.1`），Let's Encrypt 无法访问本机。
- 解决：按 §8.1 修改 DNS，等待生效后重新执行 `certbot --nginx ...`。

**访问 HTTPS 显示证书错误或连接被拒**

- 确认 AWS 安全组已开放 443。
- 确认 `systemctl is-active nginx` 为 `active`。
- 查看 Nginx 错误日志：`tail -f /var/log/nginx/error.log`。

**SSE 任务状态推送中断**

- 确认 Nginx 配置中 `proxy_buffering off` 和 `proxy_read_timeout 300s` 已设置（见 §8.3）。

### 9. 验证服务稳定性

**验证 PM2 自动重启**（模拟进程崩溃）：

```bash
pm2 pid votxt-web    # 记录 PID
kill -9 "$(pm2 pid votxt-web)"
sleep 12
pm2 status           # votxt-web 应恢复为 online
curl -I http://127.0.0.1:3091/zh
```

**验证开机自启**（服务器重启后）：

```bash
reboot
# 重新登录后：
pm2 status           # votxt-web、votxt-worker 均应为 online
systemctl is-enabled pm2-root
```

### 10. 日常运维命令

```bash
# 查看状态
pm2 status
pm2 monit

# 实时日志
pm2 logs
pm2 logs votxt-web
pm2 logs votxt-worker

# 重启 / 停止
pm2 restart votxt-web
pm2 restart votxt-worker
pm2 restart all
pm2 stop all

# 查看详细信息
pm2 show votxt-web
```

Web 代码或环境变量更新后，通常只需 `pm2 restart votxt-web`；**不需要重启 Nginx**。

### 11. 发布与升级

```bash
cd /data/votxt-worker/Vocto-AI
git fetch --all --prune
git pull --ff-only
pnpm install --frozen-lockfile
pnpm run prisma:generate

# Web 需要重新构建
set -a && . ./.env && set +a
NODE_OPTIONS="--max-old-space-size=2048" pnpm build

# 重启两个进程
pm2 restart all
pm2 status
```

### 12. 生产检查清单

- [ ] `pnpm build` 通过，`.next/` 目录存在
- [ ] `pm2 status` 中 `votxt-web`、`votxt-worker` 均为 `online`
- [ ] `systemctl is-enabled pm2-root` 为 `enabled`（PM2 开机自启）
- [ ] **不存在** `votxt-web.service` / `votxt-worker.service`（避免与 PM2 重复）
- [ ] `curl http://127.0.0.1:3091/zh` 返回 200/307
- [ ] `curl -X POST .../api/media/resolve` 能返回 YouTube 标题、时长、缩略图
- [ ] `YT_DLP_PATH` 已配置，`yt-dlp --version` 可执行
- [ ] `redis-cli ping` 返回 `PONG`，`REDIS_URL="redis://127.0.0.1:6379"`
- [ ] `systemctl is-active redis-server` 为 `active`，`is-enabled` 为 `enabled`
- [ ] `redis-cli CONFIG GET appendonly` 返回 `yes`，`/var/lib/redis/appendonlydir/` 存在
- [ ] kill 进程后 PM2 能在 10 秒内自动拉起
- [ ] Web 端创建转写任务后能从排队进入完成状态（无 `Custom Id cannot contain :` 错误）

## YouTube 音频提取技术说明

本节说明 YouTube 链接转写的完整链路、本地与服务器环境差异、cookies 作用，以及推荐的生产架构。

### 一、完整链路拆解

YouTube 转录实际经过 4 步，每步依赖不同的 YouTube 接口：

```
用户提交 YouTube URL
  → ① 元数据解析（title / thumbnail / duration）
  → ② 音频提取（yt-dlp 下载 bestaudio）
  → ③ FFmpeg 标准化（16kHz mono MP3）
  → ④ 上传 R2 → STT 转写（Deepgram / AssemblyAI / Groq）
```

| 步骤 | 工具 | 访问的 YouTube 接口 | AWS 服务器现状 |
| --- | --- | --- | --- |
| 元数据 | yt-dlp → oEmbed 回退 | oEmbed API（轻量） | ✅ 可用 |
| **音频下载** | **yt-dlp** | Innertube Player API → googlevideo.com | ❌ 易被 bot 拦截 |
| 转码 | FFmpeg | 本地文件 | ✅ 可用（前提是上一步成功） |
| 转写 | 第三方 STT | 自有 API | ✅ 可用 |

**FFmpeg 不能直接从 YouTube URL 提取音频。** 它只能处理本地文件或直链；真正从 YouTube 获取媒体流的是 yt-dlp，FFmpeg 仅负责后续标准化。

代码中的关键路径（`src/server/media/prepare.ts`）：

- **元数据**：`resolveMediaMetadata()` → yt-dlp 失败时对 YouTube 回退 oEmbed / Data API
- **音频下载**：`downloadRemoteMedia()` → 仅走 yt-dlp，**没有回退路径**

这就是「元数据能解析、转录却失败」的根本原因。

### 二、为什么本地不需要 cookies，服务器需要？

差异在 **IP 信誉 + YouTube 反爬策略**，不在代码逻辑。

| 因素 | 本地开发机 | AWS EC2 服务器 |
| --- | --- | --- |
| IP 类型 | 住宅 / 宽带 IP | 数据中心 IP（Amazon 段） |
| YouTube 信任度 | 高 | 低，默认识别为 bot |
| 浏览器会话 | 本机常已登录 YouTube | 无浏览器上下文 |
| yt-dlp 行为 | 通常直接通过 Player API | 返回 `Sign in to confirm you're not a bot` |

YouTube 对不同接口的保护强度不同：

```
保护强度：低 ──────────────────────────────→ 高

oEmbed API          Data API v3        Innertube Player API      音频 CDN 直链
(标题/缩略图)        (元数据/时长)       (yt-dlp 核心)              (googlevideo.com)
  ✅ 服务器可用        ✅ 需 API Key        ❌ DC IP 常被拦              ❌ 需先过 Player API
```

本地「不用配 cookies 就能转录」，是因为住宅 IP 通过了 YouTube 的 bot 检测；**代码路径与服务器完全相同**。

### 三、cookies 过期 = 转录失败？

**在当前架构下：是的。**

cookies 只作用于 yt-dlp 的 Innertube 请求。一旦失效：

1. `downloadRemoteMedia()` 抛出 bot 错误
2. Worker job 进入 `FAILED`
3. 用户看到转录失败

但需注意：

- cookies 是**账号级会话凭证**，不是视频级；一份有效 cookies 可下载所有该账号能访问的公开视频
- 通常数周至数月过期，需定期从浏览器重新导出
- 代码中已有 `youtubeFallback` 字段和字幕下载函数，但 Worker **尚未实现**音频失败后的字幕降级

### 四、技术方案对比

#### 方案 A：服务器共享 cookies（当前方案）

```
服务器放一份 cookies → 所有任务共用 → 定期手动更新
```

| 优点 | 缺点 |
| --- | --- |
| 实现最简单 | cookies 会过期，需人工维护 |
| 用户无感知 | 多 IP 并发可能触发风控 |
| 与 yt-dlp 生态兼容 | 合规风险（借用个人账号） |

适合 MVP 快速上线，不适合长期稳定生产的唯一依赖。

#### 方案 B：住宅代理（Residential Proxy）

```
yt-dlp --proxy socks5://residential-proxy → 用住宅 IP 访问 Player API
```

| 优点 | 缺点 |
| --- | --- |
| 不依赖 cookies，稳定性高 | 按流量计费 |
| 多 IP 轮换，抗封能力强 | 需集成代理池管理 |

推荐作为生产主方案，cookies 作为备用。

#### 方案 C：字幕优先降级（Caption-first Fallback）

```
yt-dlp 音频下载失败 → 下载 manual/auto 字幕 → 解析 SRT/VTT → 直接写入 Transcript
```

| 优点 | 缺点 |
| --- | --- |
| 不依赖音频，成本低 | 仅有字幕的视频可用 |
| 速度极快 | 字幕质量不如 STT |
| 无 bot 风险（部分场景） | 无发言人识别 |

代码已有 `listYoutubeSubtitles` / `downloadYoutubeSubtitle`，`youtubeFallback` 字段已预留，Worker 尚未接入。

#### 方案 D：YouTube Data API + Captions API（官方）

| 优点 | 缺点 |
| --- | --- |
| 官方合规 | **不能下载音频/视频** |
| 稳定 | 只能获取已发布字幕的视频 |
| | 需 OAuth，无法批量处理任意公开视频 |

只能作为字幕补充，不能替代音频提取。

#### 方案 E：客户端提取（Browser-side）

用户在浏览器或本地工具提取音频后上传。

| 优点 | 缺点 |
| --- | --- |
| 完全绕过服务器 IP 限制 | 用户体验差 |
| 无 cookies 维护 | 无法自动化 |

#### 方案 F：专用提取节点（非 AWS）

在非数据中心 VPS 或自建 Invidious 上专门负责 YouTube 提取，主服务器只做转写。

| 优点 | 缺点 |
| --- | --- |
| IP 信誉好于 AWS | 仍可能被封锁 |
| 架构解耦 | 多一套运维 |

### 五、推荐生产架构

对 SaaS 转录服务，建议 **分层降级**，而非单点依赖 cookies：

```
YouTube URL 进入 Worker
  ↓
yt-dlp 音频下载
  ├─ 成功 → FFmpeg → R2 → STT 转写
  └─ bot 拦截
       ├─ 有 cookies → 带 cookies 重试
       ├─ 有住宅代理 → 代理 IP 重试
       ├─ 视频有字幕 → 字幕降级转写
       └─ 均失败 → 提示用户上传音频文件
```

#### 短期（1–2 天）

1. 上传 cookies 到 `config/youtube-cookies.txt`，恢复 Worker 基本功能
2. 配置 `GOOGLE_API_KEY` 获取视频时长（元数据更完整）
3. 添加 cookies 健康检查：`node scripts/check-yt-dlp.mjs`，失败时告警

#### 中期（1–2 周）

4. 实现 `youtubeFallback` 降级：音频失败 → 自动尝试字幕转写
5. 集成住宅代理，`yt-dlp --proxy` 作为 cookies 失效时的备用
6. cookies 自动轮换监控

#### 长期

7. 独立 YouTube 提取微服务（非 AWS IP + 代理池）
8. 按视频类型智能路由：有字幕走字幕路径，无字幕走音频 + STT

### 六、常见问题直接回答

**Q1：cookies 过期就会转录失败？**

在当前代码下，**是的**。音频下载只有 yt-dlp 一条路。可通过住宅代理或字幕降级降低对 cookies 的依赖。

**Q2：为什么本地不需要 cookies？**

本地住宅 IP 能通过 YouTube bot 检测。代码路径相同，差异在网络层。

**Q3：技术上怎么彻底解决？**

YouTube **不提供官方音频下载 API**。行业通行做法是 **cookies + 住宅代理 + 字幕降级 + 健康监控** 的组合，而不是单一依赖 cookies。

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
- `src/server/media/prepare.ts` 包含 yt-dlp 命令候选、超时控制、媒体 URL 标准化、Google Drive 公开链接解析、YouTube 元数据（oEmbed 回退）和字幕读取能力。Worker 通过 yt-dlp 下载 YouTube 音频，经 FFmpeg 标准化后上传 R2 再交给转写服务商。
- YouTube 任务在 AWS 数据中心 IP 上常被识别为 bot，需配置 `config/youtube-cookies.txt` 才能稳定下载音频；元数据解析已支持 oEmbed 回退，不依赖 cookies。详见上文「YouTube 音频提取技术说明」。
- AssemblyAI 的集成使用官方 Node SDK，并支持 `speech_models`（语音模型）、`speaker_labels`（发言人标签）、语言检测和服务器端密钥处理。

## 文档

- 个人版产品需求文档：[product-doc.md](./product-doc.md)
- Vercel 和云服务商部署文档：[docs/deployment.md](./docs/deployment.md)
- AWS Ubuntu Worker 部署手册：[docs/aws-ubuntu-worker.md](./docs/aws-ubuntu-worker.md)
- transcribe-worker.ts 启动说明：[docs/transcribe-worker-startup.md](./docs/transcribe-worker-startup.md)
- 项目结构、清理规则和中文注释规范：[docs/project-structure.md](./docs/project-structure.md)
