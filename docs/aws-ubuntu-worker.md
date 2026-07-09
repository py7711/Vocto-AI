# AWS Ubuntu Worker 部署手册

本文档说明如何在 AWS EC2 Ubuntu 服务器上独立部署本项目的转写 Worker。Worker 负责消费 BullMQ 队列、准备媒体资源、调用转写服务、写回数据库并发布任务状态，不适合部署在 Vercel 这类请求型运行环境中。

## 1. 部署目标

生产推荐拓扑：

- Web 应用：部署在 Vercel 或其他 Next.js 平台，对外提供页面、API、上传签名和转写回调入口。
- Worker：部署在 AWS EC2 Ubuntu，长期运行 `pnpm run worker`。
- Redis：Upstash Redis 或自建 Redis，必须使用 `redis://` 或 `rediss://` 协议地址。
- 数据库：TiDB Cloud 或 MySQL 8，Worker 需要能访问 `DATABASE_URL`。
- 对象存储：Cloudflare R2，Worker 需要读写原始媒体、标准化音频和导出资源。
- 转写服务：Groq、Deepgram、AssemblyAI 至少配置一个；需要发言人识别时优先使用 Deepgram 或 AssemblyAI。

Worker 不需要开放 HTTP 端口。它只需要出站访问 Redis、数据库、R2、转写服务商、AI 服务商和 Web 应用域名。Deepgram/AssemblyAI 的回调应打到 Web 应用公网域名，而不是 Worker 机器。

## 2. EC2 规格建议

小流量或测试环境：

- 实例：`t3.small` 或 `t3.medium`
- 系统盘：30 GB gp3
- 系统：Ubuntu Server 22.04 LTS 或 24.04 LTS

生产环境：

- 实例：`t3.medium` 起步，队列压力较大时使用 `t3.large` 或计算优化实例。
- 系统盘：50 GB gp3 起步，保留日志和临时文件空间。
- 可用区：尽量选择靠近数据库和 Redis 的区域，减少队列锁续期和数据库写入延迟。

当前 Worker 源码固定 BullMQ 并发为 `3`，单台机器同一时间最多处理 3 个转写任务。需要扩容时可以启动多台 Worker，它们共享同一个 `TRANSCRIBE_QUEUE`，BullMQ 会自动分配任务。

## 3. AWS 安全组

Worker 服务器的入站规则建议只开放 SSH：

| 类型 | 端口 | 来源 | 用途 |
| --- | --- | --- | --- |
| SSH | 22 | 你的固定办公 IP | 远程登录维护 |

出站规则保持默认全部允许，或按最小权限放行：

- TCP 443：访问 R2、Groq、Deepgram、AssemblyAI、DeepSeek、Gemini、DeepL、Web 应用域名等 HTTPS 服务。
- Redis 端口：Upstash Redis 通常是 6379，并使用 `rediss://`。
- 数据库端口：TiDB Cloud 常见为 4000，MySQL 常见为 3306。

如果数据库或 Redis 配置了 IP 白名单，请把 EC2 的固定公网 IP 或 NAT 出口 IP 加入白名单。生产环境建议给 EC2 绑定 Elastic IP，避免重启后公网 IP 改变。

## 4. 创建运维用户

登录 EC2 后先更新系统：

```bash
sudo apt update
sudo apt upgrade -y
```

创建单独的应用用户：

```bash
sudo adduser --disabled-password --gecos "" appworker
sudo usermod -aG sudo appworker
sudo mkdir -p /srv/transcribe-worker
sudo chown -R appworker:appworker /srv/transcribe-worker
```

后续部署命令尽量使用 `appworker` 用户执行：

```bash
sudo su - appworker
```

## 5. 安装系统依赖

Worker 需要 Git、Node.js 20、pnpm、yt-dlp、FFmpeg 和构建工具：

```bash
sudo apt update
sudo apt install -y git curl ca-certificates build-essential python3 python3-pip ffmpeg
```

安装 Node.js 20：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

启用 pnpm：

```bash
sudo corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
```

安装 yt-dlp：

```bash
python3 -m pip install --user -U yt-dlp
~/.local/bin/yt-dlp --version
```

如果系统提示不允许直接用 pip 写入用户环境，可以改用 apt 或 pipx：

```bash
sudo apt install -y pipx
pipx ensurepath
pipx install yt-dlp
```

确认工具路径：

```bash
which node
which pnpm
which ffmpeg
which ffprobe
which yt-dlp || echo "yt-dlp 可能在 ~/.local/bin/yt-dlp"
```

如果 `which yt-dlp` 找不到，但 `~/.local/bin/yt-dlp` 可执行，后续在环境变量中配置：

```bash
YT_DLP_PATH="/home/appworker/.local/bin/yt-dlp"
```

## 6. 拉取代码

切换到应用用户：

```bash
sudo su - appworker
```

把仓库放到 `/srv/transcribe-worker/app`：

```bash
cd /srv/transcribe-worker
git clone <你的仓库地址> app
cd app
```

如果是私有仓库，推荐使用 GitHub Deploy Key 或只读 Personal Access Token。不要把长期可写 token 写进 shell 历史或提交到仓库。

安装依赖：

```bash
pnpm install --frozen-lockfile
pnpm run prisma:generate
```

生产发布前建议至少执行一次构建检查：

```bash
pnpm build
```

Worker 本身通过 `tsx src/worker/transcribe-worker.ts` 启动，不依赖 Next.js HTTP 服务，但 `pnpm build` 可以提前暴露 TypeScript、Next.js 和环境兼容问题。

## 7. 配置环境变量

推荐把 Worker 环境变量放在 `/srv/transcribe-worker/app/.env.worker`，并由 systemd 的 `EnvironmentFile` 注入。这样不依赖 `dotenv/config` 默认读取 `.env` 的行为，也方便和 Web 应用环境分开维护。

创建文件：

```bash
cd /srv/transcribe-worker/app
cp .env.example .env.worker 2>/dev/null || touch .env.worker
chmod 600 .env.worker
nano .env.worker
```

最小生产配置示例：

```bash
DATABASE_URL="mysql://USER:PASSWORD@HOST:4000/appdb?sslaccept=strict"
REDIS_URL="rediss://default:PASSWORD@HOST.upstash.io:6379"
TRANSCRIBE_QUEUE="transcribe-jobs"

NEXT_PUBLIC_APP_URL="https://你的站点域名"
TRANSCRIPTION_CALLBACK_BASE_URL="https://你的站点域名"
AUTH_SECRET="至少 32 位的随机字符串，需和 Web 应用保持一致"

R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET="media-bucket"
R2_PUBLIC_BASE_URL="https://media.example.com"

GROQ_API_KEY=""
DEEPGRAM_API_KEY=""
ASSEMBLYAI_API_KEY=""

DEEPSEEK_API_KEY=""
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_CHAT_MODEL="deepseek-v4"
DEEPSEEK_FLASH_MODEL="deepseek-v4-flash"
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-1.5-flash"

DEEPL_API_KEY=""
DEEPL_API_URL="https://api-free.deepl.com/v2/translate"

YT_DLP_PATH="/home/appworker/.local/bin/yt-dlp"
FFMPEG_PATH="/usr/bin/ffmpeg"
FFPROBE_PATH="/usr/bin/ffprobe"

TRANSCRIPTION_CALLBACK_TIMEOUT_SECONDS="1200"
TRANSCRIPTION_POLL_INTERVAL_SECONDS="6"
```

关键注意事项：

- `REDIS_URL` 必须是 Redis 协议地址，例如 `rediss://default:PASSWORD@HOST:6379`，不能填写 `https://` 开头的 Upstash REST URL。
- `TRANSCRIBE_QUEUE` 必须和 Web 应用创建任务时使用的队列名一致；生产建议显式配置，避免不同环境使用不同默认值。
- `NEXT_PUBLIC_APP_URL` 和 `TRANSCRIPTION_CALLBACK_BASE_URL` 应指向 Web 应用公网域名，用于转写服务商回调。
- `AUTH_SECRET` 建议和 Web 应用保持一致，避免共享逻辑未来依赖签名配置时产生不一致。
- Groq、Deepgram、AssemblyAI 至少配置一个；如果需要发言人标签，建议配置 Deepgram 或 AssemblyAI。
- `YT_DLP_PATH`、`FFMPEG_PATH`、`FFPROBE_PATH` 可以不填，代码会尝试从 PATH 查找；生产环境显式填写更好排障。

验证环境变量文件不会被普通用户读取：

```bash
ls -l /srv/transcribe-worker/app/.env.worker
```

权限应类似：

```text
-rw------- 1 appworker appworker ... .env.worker
```

## 8. 手动启动验证

先用一条命令验证 Worker 可以连接 Redis 和数据库：

```bash
cd /srv/transcribe-worker/app
set -a
. ./.env.worker
set +a
pnpm run worker
```

正常日志应包含：

```text
worker 正在监听队列 transcribe-jobs。
```

如果出现 Redis REST URL 错误，检查 `REDIS_URL` 是否误填了 `UPSTASH_REDIS_REST_URL`。如果出现数据库连接失败，检查 TiDB/MySQL 白名单、端口、安全组和 `DATABASE_URL`。

手动验证完成后按 `Ctrl+C` 停止 Worker，改用 systemd 长期运行。

## 9. 使用 systemd 托管

创建服务文件：

```bash
sudo nano /etc/systemd/system/transcribe-worker.service
```

写入以下内容：

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

如果 `which pnpm` 输出不是 `/usr/bin/pnpm`，把 `ExecStart` 改成实际路径。也可以使用：

```ini
ExecStart=/usr/bin/env pnpm run worker
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable transcribe-worker
sudo systemctl start transcribe-worker
sudo systemctl status transcribe-worker --no-pager
```

查看日志：

```bash
journalctl -u transcribe-worker -f
```

重启服务：

```bash
sudo systemctl restart transcribe-worker
```

停止服务：

```bash
sudo systemctl stop transcribe-worker
```

## 10. PM2 备选方案

如果团队更熟悉 PM2，也可以用 PM2 托管 Worker。systemd 更适合纯服务器运维，PM2 更适合已有 Node.js 运维习惯的团队。

安装 PM2：

```bash
sudo npm install -g pm2
```

启动 Worker：

```bash
cd /srv/transcribe-worker/app
set -a
. ./.env.worker
set +a
pm2 start "pnpm run worker" --name transcribe-worker
pm2 save
pm2 startup systemd -u appworker --hp /home/appworker
```

查看日志：

```bash
pm2 logs transcribe-worker
```

如果使用 PM2，不要同时启用 `transcribe-worker.service`，否则会运行两套 Worker。多套 Worker 本身可以并行消费队列，但同一台机器上重复托管会增加排障复杂度。

## 11. 发布与升级

推荐发布流程：

```bash
sudo su - appworker
cd /srv/transcribe-worker/app
git fetch --all --prune
git checkout main
git pull --ff-only
pnpm install --frozen-lockfile
pnpm run prisma:generate
pnpm build
exit
sudo systemctl restart transcribe-worker
sudo systemctl status transcribe-worker --no-pager
```

如果本次发布包含数据库结构变更，应先在数据库侧完成备份和迁移，再重启 Worker。不要把 `prisma/sql/all.sql` 直接导入已有生产库，因为该脚本会重建业务表，只适合空库或确认可重建的环境。

回滚流程：

```bash
sudo su - appworker
cd /srv/transcribe-worker/app
git checkout <上一版提交或标签>
pnpm install --frozen-lockfile
pnpm run prisma:generate
pnpm build
exit
sudo systemctl restart transcribe-worker
```

如果数据库已经执行了不可逆迁移，代码回滚前必须先确认旧代码是否兼容新表结构。

## 12. 健康检查

### 12.1 进程检查

```bash
systemctl is-active transcribe-worker
systemctl status transcribe-worker --no-pager
journalctl -u transcribe-worker -n 100 --no-pager
```

### 12.2 Redis 队列检查

在服务器上执行：

```bash
cd /srv/transcribe-worker/app
set -a
. ./.env.worker
set +a
node -e "const {Queue}=require('bullmq'); const IORedis=require('ioredis'); const r=new IORedis(process.env.REDIS_URL,{maxRetriesPerRequest:null,enableReadyCheck:false,tls:process.env.REDIS_URL.startsWith('rediss://')?{}:undefined}); const q=new Queue(process.env.TRANSCRIBE_QUEUE||'transcribe-jobs',{connection:r}); q.getJobCounts().then(c=>console.log(c)).finally(async()=>{await q.close(); await r.quit();})"
```

正常会输出类似：

```text
{
  waiting: 0,
  active: 0,
  completed: 10,
  failed: 0,
  delayed: 0,
  paused: 0
}
```

### 12.3 端到端检查

1. 打开 Web 应用，登录测试账号。
2. 上传一个短音频或粘贴公开视频链接。
3. 确认任务状态从 `QUEUED` 变为 `PROCESSING`、`TRANSCRIBING`，最终变为 `COMPLETED`。
4. 在 Worker 日志中确认没有 Redis、数据库、R2、yt-dlp 或转写服务错误。
5. 导出 TXT/SRT 或打开分享页，确认转写结果已写入数据库。

## 13. 日志与磁盘维护

systemd 日志由 journald 管理。可以限制日志占用：

```bash
sudo nano /etc/systemd/journald.conf
```

建议配置：

```ini
SystemMaxUse=1G
MaxRetentionSec=14day
```

重启 journald：

```bash
sudo systemctl restart systemd-journald
```

查看磁盘：

```bash
df -h
du -sh /srv/transcribe-worker/app
journalctl --disk-usage
```

Worker 媒体预处理会使用系统临时目录，代码会清理临时文件，但生产仍建议监控 `/tmp` 和根分区空间。

## 14. 常见故障

### 14.1 Worker 启动后立刻退出

排查：

```bash
journalctl -u transcribe-worker -n 200 --no-pager
```

常见原因：

- `.env.worker` 路径不对或权限不可读。
- `ExecStart` 中的 `pnpm` 路径不对。
- `REDIS_URL` 使用了 `https://` REST 地址。
- `DATABASE_URL` 不存在或数据库拒绝连接。

### 14.2 日志提示 BullMQ 需要 Redis 协议地址

把 Upstash 控制台里的 Redis 协议地址填入：

```bash
REDIS_URL="rediss://default:PASSWORD@HOST.upstash.io:6379"
```

不要使用：

```bash
UPSTASH_REDIS_REST_URL="https://..."
```

### 14.3 任务一直停在 QUEUED

排查顺序：

1. `systemctl status transcribe-worker` 确认 Worker 正在运行。
2. 确认 Web 和 Worker 的 `TRANSCRIBE_QUEUE` 一致。
3. 确认 Web 和 Worker 使用同一个 `REDIS_URL`。
4. 用 Redis 队列检查命令查看 `waiting`、`active`、`failed` 数量。
5. 查看 Worker 日志是否有数据库、R2 或服务商错误。

### 14.4 YouTube 或公开视频任务失败

确认 yt-dlp 可用：

```bash
/home/appworker/.local/bin/yt-dlp --version
yt-dlp --version
```

如果 systemd 找不到 yt-dlp，在 `.env.worker` 中配置：

```bash
YT_DLP_PATH="/home/appworker/.local/bin/yt-dlp"
```

然后重启：

```bash
sudo systemctl restart transcribe-worker
```

### 14.5 音频处理或时长识别失败

确认 FFmpeg 和 FFprobe：

```bash
ffmpeg -version
ffprobe -version
```

必要时配置：

```bash
FFMPEG_PATH="/usr/bin/ffmpeg"
FFPROBE_PATH="/usr/bin/ffprobe"
```

### 14.6 回调没有生效但任务最后仍完成

Worker 会优先提交服务商异步任务并等待回调，同时按 `TRANSCRIPTION_POLL_INTERVAL_SECONDS` 轮询。若超出 `TRANSCRIPTION_CALLBACK_TIMEOUT_SECONDS`，会进入同步兜底链路。因此偶发回调失败不一定导致任务失败。

仍需检查：

- `TRANSCRIPTION_CALLBACK_BASE_URL` 是否是公网 HTTPS 域名。
- Web 应用是否部署了 `/api/transcription/callback/deepgram` 和 `/api/transcription/callback/assemblyai`。
- 服务商控制台是否能访问回调地址。
- Web 应用日志是否有 callback token 校验失败。

### 14.7 任务失败后用户分钟数异常

Worker 的失败事件会调用额度释放逻辑。请检查：

- Worker 日志里是否执行到 `failed` 事件。
- 数据库 `UsageLedger` 是否有对应释放流水。
- 任务是否被取消；取消任务不会按普通失败逻辑重复释放。

## 15. 生产检查清单

- EC2 绑定 Elastic IP，数据库和 Redis 白名单已放行。
- 安全组入站只开放 SSH，Worker 不暴露公网 HTTP 端口。
- Node.js 20、pnpm、yt-dlp、ffmpeg、ffprobe 均可执行。
- `/srv/transcribe-worker/app/.env.worker` 权限为 `600`，未提交到 Git。
- `REDIS_URL` 是 `redis://` 或 `rediss://`。
- Web 和 Worker 使用相同 `TRANSCRIBE_QUEUE`。
- `NEXT_PUBLIC_APP_URL` 和 `TRANSCRIPTION_CALLBACK_BASE_URL` 指向 Web 应用公网域名。
- `DATABASE_URL`、R2、转写服务商、AI 洞察和翻译密钥已配置。
- `pnpm install --frozen-lockfile`、`pnpm run prisma:generate`、`pnpm build` 通过。
- `systemctl status transcribe-worker` 为 active。
- 日志包含 `worker 正在监听队列 transcribe-jobs。`
- Web 上传一个短音频后任务能从排队进入完成状态。
- journald 日志占用和磁盘空间有监控。

## 16. 运维建议

- 使用 systemd 作为默认守护方式，减少 Node.js 进程管理层级。
- 生产密钥只放在服务器环境变量、AWS Systems Manager Parameter Store 或 Secrets Manager，不提交到仓库。
- 队列积压时优先横向增加 Worker 实例；扩容前确认 Redis、数据库和转写服务商限额足够。
- 大版本发布前先在一台灰度 Worker 上验证，再滚动重启其他 Worker。
- 服务商密钥泄漏时立即轮换，并同步更新 Web、Worker、CI 和部署平台环境变量。
