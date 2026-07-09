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

## 生产环境部署（Ubuntu / AWS EC2）

本节说明如何在同一台 Linux 服务器上同时部署 **Web 应用**（`pnpm start`，端口 3091）和 **Worker**（`pnpm run worker`）。当前服务器已部署 Worker，按以下步骤补充 Web 服务即可。

完整排障手册见 [docs/aws-ubuntu-worker.md](./docs/aws-ubuntu-worker.md)。

### 部署架构

| 组件 | 部署位置 | 端口 | 说明 |
| --- | --- | --- | --- |
| Web 应用 | AWS EC2 / Ubuntu | **3091** | `pnpm build` + `pnpm start`，对外提供页面和 API |
| Worker | AWS EC2 / Ubuntu | 无 | `pnpm run worker`，消费转写队列，不监听 HTTP |
| 数据库 | TiDB Cloud / MySQL 8 | 4000 | Web 和 Worker 共用 `DATABASE_URL` |
| Redis | Upstash Redis | 6379 | 必须使用 `redis://` 或 `rediss://` 协议地址 |
| 对象存储 | Cloudflare R2 | — | 媒体文件和导出资源 |

两台进程共用同一份代码目录 `/data/votxt-worker/Vocto-AI`，分别由 `votxt-web.service` 和 `votxt-worker.service` 托管。

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

Web 和 Worker 可共用同一份环境变量文件（当前服务器使用 `env`）：

```bash
cd /data/votxt-worker/Vocto-AI
cp .env.example env          # 若已有 env 文件则跳过
chmod 600 env
nano env
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
REDIS_URL="rediss://default:PASSWORD@HOST.upstash.io:6379"
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
```

关键注意事项：

- `NEXT_PUBLIC_APP_URL` 必须是用户浏览器实际访问的地址。若通过 `https://votxt.io` 反代，填域名不带端口；若直接 `http://IP:3091` 访问，需带端口。
- `TRANSCRIBE_QUEUE` 必须与 Worker 一致。
- `REDIS_URL` 必须是 `redis://` 或 `rediss://`，不能填 Upstash REST URL。
- Google OAuth 回调地址需在 Google Cloud Console 配置为 `https://votxt.io/api/auth/google/callback`。
- Stripe Webhook 回调地址为 `https://votxt.io/api/billing/webhook`。

### 5. 构建 Web 应用

Web 服务需要先构建生产产物，Worker 不需要此步骤：

```bash
cd /data/votxt-worker/Vocto-AI
set -a && . ./env && set +a

# 内存不足时（t3.small）加限制参数
NODE_OPTIONS="--max-old-space-size=2048" pnpm build
```

构建成功后会生成 `.next/` 目录。每次代码更新后都需要重新 `pnpm build` 再重启 Web 服务。

### 6. 手动启动验证（Web）

```bash
cd /data/votxt-worker/Vocto-AI
set -a && . ./env && set +a
PORT=3091 pnpm start
```

另开终端测试：

```bash
curl -I http://127.0.0.1:3091/zh
```

返回 `200` 或 `307` 即正常。验证通过后按 `Ctrl+C` 停止，改用 systemd 托管。

### 7. 使用 systemd 托管 Web 服务

systemd 同时满足：**崩溃自动重启**（`Restart=always`）、**服务器重启自动启动**（`systemctl enable`）。

创建 Web 服务文件：

```bash
nano /etc/systemd/system/votxt-web.service
```

写入以下内容（root 部署版）：

```ini
[Unit]
Description=Votxt Next.js Web Application
After=network-online.target
Wants=network-online.target
StartLimitIntervalSec=0

[Service]
Type=simple
WorkingDirectory=/data/votxt-worker/Vocto-AI
EnvironmentFile=/data/votxt-worker/Vocto-AI/env
Environment=NODE_ENV=production
Environment=PORT=3091
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/root/.local/bin
ExecStart=/usr/bin/env pnpm start
Restart=always
RestartSec=10
KillSignal=SIGTERM
TimeoutStopSec=60
SyslogIdentifier=votxt-web

[Install]
WantedBy=multi-user.target
```

启用并启动：

```bash
systemctl daemon-reload
systemctl enable votxt-web
systemctl start votxt-web
systemctl status votxt-web --no-pager
```

确认状态：

```bash
systemctl is-enabled votxt-web    # enabled
systemctl is-active votxt-web     # active
curl -I http://127.0.0.1:3091/zh
```

### 8. Worker 服务（已部署，参考）

Worker 由 `votxt-worker.service` 托管，配置与 Web 类似但不监听端口。若尚未部署，创建 `/etc/systemd/system/votxt-worker.service`：

```ini
[Unit]
Description=BullMQ Transcription Worker
After=network-online.target
Wants=network-online.target
StartLimitIntervalSec=0

[Service]
Type=simple
WorkingDirectory=/data/votxt-worker/Vocto-AI
EnvironmentFile=/data/votxt-worker/Vocto-AI/env
Environment=NODE_ENV=production
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/root/.local/bin
ExecStart=/usr/bin/env pnpm run worker
Restart=always
RestartSec=10
KillSignal=SIGTERM
TimeoutStopSec=60
SyslogIdentifier=transcribe-worker

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable votxt-worker
systemctl start votxt-worker
```

### 9. Nginx 反向代理 + HTTPS

生产环境推荐用 Nginx 在 80/443 接收流量，反代到本机 `127.0.0.1:3091`。3091 不对外开放，AWS 安全组只需开放 **80** 和 **443**（以及 SSH 22）。

#### 9.1 前置条件：DNS 必须指向本机

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

#### 9.2 安装 Nginx

```bash
apt install -y nginx certbot python3-certbot-nginx
mkdir -p /var/www/certbot
```

#### 9.3 创建 Nginx 配置

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

#### 9.4 端口安全（不要绑定 127.0.0.1）

`votxt-web.service` 通过 `Environment=PORT=3091` 监听 3091。**不要**使用 `next start -H 127.0.0.1`，会导致 next-intl 中间件内部代理失败（页面返回 500）。

3091 不对外暴露的方式：AWS 安全组**不开放** 3091，只开放 80/443。Nginx 在本机转发到 `127.0.0.1:3091` 即可。

```bash
ss -tlnp | grep 3091    # 监听 *:3091 是正常的
curl -I -H "Host: votxt.io" http://127.0.0.1/zh    # 应返回 200
```

#### 9.5 申请 HTTPS 证书（Let's Encrypt）

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

#### 9.6 常见问题

**Certbot 报 `unauthorized` / `Invalid response`**

- 原因：DNS 仍指向其他服务器（如 Vercel `216.198.79.1`），Let's Encrypt 无法访问本机。
- 解决：按 §9.1 修改 DNS，等待生效后重新执行 `certbot --nginx ...`。

**访问 HTTPS 显示证书错误或连接被拒**

- 确认 AWS 安全组已开放 443。
- 确认 `systemctl is-active nginx` 为 `active`。
- 查看 Nginx 错误日志：`tail -f /var/log/nginx/error.log`。

**SSE 任务状态推送中断**

- 确认 Nginx 配置中 `proxy_buffering off` 和 `proxy_read_timeout 300s` 已设置（见 §9.3）。

### 10. 验证服务稳定性

**验证 Web 自动重启**：

```bash
kill -9 "$(systemctl show -p MainPID --value votxt-web)"
sleep 12
systemctl is-active votxt-web     # 应为 active
curl -I http://127.0.0.1:3091/zh
```

**验证开机自启**（服务器重启后）：

```bash
reboot
# 重新登录后：
systemctl is-active votxt-web
systemctl is-active votxt-worker
journalctl -u votxt-web -n 20 --no-pager
```

### 11. 日常运维命令

```bash
# Web 日志
journalctl -u votxt-web -f
journalctl -u votxt-web -n 100 --no-pager

# Worker 日志
journalctl -u votxt-worker -f

# 重启服务
systemctl restart votxt-web
systemctl restart votxt-worker

# 查看状态
systemctl status votxt-web votxt-worker --no-pager
```

### 12. 发布与升级

```bash
cd /data/votxt-worker/Vocto-AI
git fetch --all --prune
git pull --ff-only
pnpm install --frozen-lockfile
pnpm run prisma:generate

# Web 需要重新构建
set -a && . ./env && set +a
NODE_OPTIONS="--max-old-space-size=2048" pnpm build

# 重启两个服务
systemctl restart votxt-web votxt-worker
systemctl status votxt-web votxt-worker --no-pager
```

### 13. 生产检查清单

- [ ] `pnpm build` 通过，`.next/` 目录存在
- [ ] `systemctl is-active votxt-web` 为 `active`，`curl http://127.0.0.1:3091/zh` 返回 200/307
- [ ] `systemctl is-enabled votxt-web` 为 `enabled`（开机自启）
- [ ] kill Web 进程后 10 秒内自动拉起
- [ ] `systemctl is-active votxt-worker` 为 `active`，日志含 `listening on queue`
- [ ] `TRANSCRIBE_QUEUE` Web 与 Worker 一致
- [ ] `NEXT_PUBLIC_APP_URL` 与用户实际访问地址一致
- [ ] AWS 安全组已按访问方式开放对应端口（3091 或 80/443）
- [ ] 转写服务商回调地址 `https://votxt.io/api/transcription/callback/*` 可达
- [ ] Web 端创建转写任务后能从排队进入完成状态

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
- AWS Ubuntu Worker 部署手册：[docs/aws-ubuntu-worker.md](./docs/aws-ubuntu-worker.md)
- transcribe-worker.ts 启动说明：[docs/transcribe-worker-startup.md](./docs/transcribe-worker-startup.md)
- 项目结构、清理规则和中文注释规范：[docs/project-structure.md](./docs/project-structure.md)
