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


| 类型  | 端口  | 来源        | 用途     |
| --- | --- | --------- | ------ |
| SSH | 22  | 你的固定办公 IP | 远程登录维护 |


出站规则保持默认全部允许，或按最小权限放行：

- TCP 443：访问 R2、Groq、Deepgram、AssemblyAI、DeepSeek、Gemini、DeepL、Web 应用域名等 HTTPS 服务。
- Redis 端口：Upstash Redis 通常是 6379，并使用 `rediss://`。
- 数据库端口：TiDB Cloud 常见为 4000，MySQL 常见为 3306。

如果数据库或 Redis 配置了 IP 白名单，请把 EC2 的固定公网 IP 或 NAT 出口 IP 加入白名单。生产环境建议给 EC2 绑定 Elastic IP，避免重启后公网 IP 改变。

## 4. 准备运行环境（用户与目录）

登录 EC2 后先更新系统：

```bash
apt update && apt upgrade -y    # root 下可省略 sudo；非 root 则加 sudo
```

部署使用两级目录：

- **部署根目录**：`/data/votxt-worker`（存放 clone 下来的项目、日志等）
- **项目目录**：`/data/votxt-worker/Vocto-AI`（`git clone` 后的代码根，含 `package.json`、`.env.worker`；下文 systemd 的 `WorkingDirectory` 也指向此处）

下文按运行用户分两种做法，**二选一**即可。

### 4.1 方式 A：单独应用用户 `appworker`（生产推荐）

权限隔离更好，Worker 不以 root 运行，误操作风险更低。

```bash
adduser --disabled-password --gecos "" appworker
usermod -aG sudo appworker
mkdir -p /data/votxt-worker
chown -R appworker:appworker /data/votxt-worker
```

验证：

```bash
getent passwd appworker
ls -ld /home/appworker /data/votxt-worker
```

后续命令切换为该用户：

```bash
su - appworker
cd /data/votxt-worker/Vocto-AI
```

- 家目录：`/home/appworker`（用户级工具如 `~/.local/bin/yt-dlp`）
- 环境变量中 `YT_DLP_PATH` 示例：`/home/appworker/.local/bin/yt-dlp`
- systemd 服务使用 `User=appworker`（见 §9.1）

### 4.2 方式 B：直接使用 root（快速上手 / 个人测试）

**未创建** `appworker`**、全程用 root SSH 登录时走本路径。** 无需 `su - appworker`，也**不要** `cd /home/appworker`（该目录不存在是正常的）。

```bash
mkdir -p /data/votxt-worker
# 后续 git clone 到 /data/votxt-worker/Vocto-AI，pnpm install 在该项目目录下以 root 执行
```

- 家目录：`/root`（`pip install --user` 的工具在 `/root/.local/bin/`）
- 环境变量中 `YT_DLP_PATH` 示例：`/root/.local/bin/yt-dlp`
- systemd 服务**不要**写 `User=appworker`，见 §9.1 的 root 版 unit

root 部署注意：

- 生产环境仍建议日后迁移到 `appworker`，并收紧 SSH（禁用 root 密码登录、仅密钥）。
- `.env.worker` 含数据库与 API 密钥，权限设为 `chmod 600`。
- 文档里带 `sudo` 的命令在 root 下可去掉 `sudo` 直接执行。



### 4.3 家目录缺失时的修复（仅方式 A）

若已创建 `appworker` 但 `/home/appworker` 不存在：

```bash
mkdir -p /home/appworker
chown appworker:appworker /home/appworker
usermod -d /home/appworker -s /bin/bash appworker
```



## 5. 安装系统依赖



### 5.1 依赖清单

Worker 运行需要以下依赖，缺一不可：


| 依赖                      | 版本要求                   | 用途                    | 是否必需      |
| ----------------------- | ---------------------- | --------------------- | --------- |
| Git                     | 任意较新版本                 | 拉取与更新代码               | 必需        |
| Node.js                 | **22.x LTS**（最低 22.13） | 运行 Worker 进程          | 必需        |
| pnpm                    | 由 corepack 提供（最新稳定版）   | 安装依赖、运行脚本             | 必需        |
| FFmpeg / FFprobe        | 系统包版本即可                | 提取音频、转码、识别时长          | 必需        |
| yt-dlp                  | 固定校验版本                  | 下载非 YouTube 平台媒体         | 处理在线视频时必需 |
| build-essential、python3 | 系统包版本即可                | 部分依赖的原生模块编译、yt-dlp 运行 | 必需        |


说明：

- Worker 通过 `pnpm run worker`（即 `tsx src/worker/transcribe-worker.ts`）直接运行 TypeScript 源码，**不需要预编译**。`tsx` 位于 `devDependencies`，因此安装依赖时必须安装完整依赖，**不能使用** `--prod` **/** `NODE_ENV=production` **裁剪 devDependencies**，否则 Worker 无法启动。
- Worker 依赖 `@prisma/client`，安装后必须执行 `pnpm run prisma:generate` 生成客户端，否则启动会报模块错误。



### 5.2 安装基础工具与 FFmpeg

```bash
sudo apt update
sudo apt install -y git curl ca-certificates build-essential python3 python3-pip ffmpeg
```



### 5.3 安装 Node.js 22 LTS

pnpm 10+ 依赖 `node:sqlite`（Node.js 22.5 引入），pnpm 11+ 还要求 Node.js ≥ 22.13。
**必须安装 Node.js 22.x**，不能使用 20.x，否则执行 `corepack prepare pnpm@latest` 后会报 `ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite` 错误，导致 pnpm 完全无法运行。

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v     # 应输出 v22.x.x
npm -v
```

如果服务器上已安装了 Node.js 20，需先卸载再安装 22：

```bash
sudo apt remove -y nodejs
sudo apt autoremove -y
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
```



### 5.4 启用 pnpm

Node.js 22 就绪后再启用 pnpm，否则 corepack 下载的最新 pnpm 会因 Node.js 版本过低而启动失败。

```bash
sudo corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
```



### 5.5 安装 yt-dlp

在拉取代码并安装 pnpm 依赖后，通过仓库脚本安装固定版本。脚本会校验官方 SHA-256，
不要使用 `pip install -U` 或在运行中的 Worker 内自动更新：

```bash
sudo mkdir -p /opt/votxt/bin
sudo chown "$(id -u):$(id -g)" /opt/votxt/bin
YT_DLP_INSTALL_PATH="/opt/votxt/bin/yt-dlp" pnpm deps:yt-dlp
/opt/votxt/bin/yt-dlp --version # 必须输出 2026.06.09
```

确认工具路径：

```bash
which node
which pnpm
which ffmpeg
which ffprobe
/opt/votxt/bin/yt-dlp --version
```

在 `.env.worker` 中配置经过校验的固定路径：

```bash
YT_DLP_PATH="/opt/votxt/bin/yt-dlp"
```



## 6. 拉取代码

进入部署根目录并 clone（**root 或 appworker 均可**）。目标目录名须与下文路径一致（示例为 `Vocto-AI`；若 clone 时用了其他名字，后续所有 `/data/votxt-worker/Vocto-AI` 请改成实际目录名）：

```bash
mkdir -p /data/votxt-worker
cd /data/votxt-worker
git clone <你的仓库地址> Vocto-AI
cd Vocto-AI
```

如果是私有仓库，推荐使用 GitHub Deploy Key 或只读 Personal Access Token。示例：

```bash
ssh-keygen -t ed25519 -f ~/.ssh/work_key -C "deploy@business-server"
```

不要把长期可写 token 写进 shell 历史或提交到仓库。

### 6.1 安装依赖并生成 Prisma 客户端

```bash
cd /data/votxt-worker/Vocto-AI
pnpm install --frozen-lockfile
pnpm run prisma:generate
```

- `pnpm install --frozen-lockfile`：严格按 `pnpm-lock.yaml` 安装，包含 `tsx` 等 devDependencies（Worker 必需）。
- `pnpm run prisma:generate`：生成 `@prisma/client`，Worker 启动前必须执行。



### 6.2 关于“打包构建”

本项目分两类进程，构建要求不同：

- **Web 应用**（Vercel/Next.js）：需要 `pnpm build`（`next build`）产物。
- **Worker（本机部署）**：由 `tsx` 在运行时直接执行 TypeScript 源码，**不需要** `next build`**，也没有独立的 dist 产物**。所谓“部署”，就是把源码 + 完整依赖 + 生成的 Prisma 客户端放到服务器，再用 systemd 拉起 `pnpm run worker`。

因此 Worker 服务器的最小可运行集合是：

1. 项目源码（`git clone`/`git pull`）。
2. `pnpm install --frozen-lockfile` 安装的 `node_modules`（含 devDependencies）。
3. `pnpm run prisma:generate` 生成的 Prisma 客户端。
4. 配置好的环境变量文件 `.env.worker`。



### 6.3 可选：构建自检

发布前可执行一次构建自检，提前暴露 TypeScript / 依赖兼容问题（不产出 Worker 运行所需的产物，仅作校验）：

```bash
pnpm build
```

若服务器内存较小（`t3.small`），`next build` 可能因内存不足失败；此时可跳过该自检，改在本地或 CI 完成，不影响 Worker 运行。

## 7. 配置环境变量

推荐把 Worker 环境变量放在项目目录 `/data/votxt-worker/Vocto-AI/.env.worker`，并由 systemd 的 `EnvironmentFile` 注入。这样不依赖 `dotenv/config` 默认读取 `.env` 的行为，也方便和 Web 应用环境分开维护。

创建文件：

```bash
cd /data/votxt-worker/Vocto-AI
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
GEMINI_VIDEO_MODEL="gemini-3.1-flash-lite"

DEEPL_API_KEY=""
DEEPL_API_URL="https://api-free.deepl.com/v2/translate"

# 使用 §5.5 安装并校验的固定版本：
YT_DLP_PATH="/opt/votxt/bin/yt-dlp"
FFMPEG_PATH="/usr/bin/ffmpeg"
FFPROBE_PATH="/usr/bin/ffprobe"

TRANSCRIPTION_CALLBACK_TIMEOUT_SECONDS="1200"
TRANSCRIPTION_POLL_INTERVAL_SECONDS="6"

LOG_DIR="/data/votxt-worker/Vocto-AI/logs"
```

关键注意事项：

- `REDIS_URL` 必须是 Redis 协议地址，例如 `rediss://default:PASSWORD@HOST:6379`，不能填写 `https://` 开头的 Upstash REST URL。
- `TRANSCRIBE_QUEUE` 必须和 Web 应用创建任务时使用的队列名一致；生产建议显式配置，避免不同环境使用不同默认值。
- `NEXT_PUBLIC_APP_URL` 和 `TRANSCRIPTION_CALLBACK_BASE_URL` 应指向 Web 应用公网域名，用于转写服务商回调。
- `AUTH_SECRET` 建议和 Web 应用保持一致，避免共享逻辑未来依赖签名配置时产生不一致。
- Groq、Deepgram、AssemblyAI 至少配置一个；如果需要发言人标签，建议配置 Deepgram 或 AssemblyAI。
- `GEMINI_API_KEY` 和 `GEMINI_VIDEO_MODEL` 是 YouTube 直接视频分析的必需配置，默认模型为 `gemini-3.1-flash-lite`。
- `YT_DLP_PATH`、`FFMPEG_PATH`、`FFPROBE_PATH` 只服务于 TikTok、Instagram、Facebook、X、Vimeo 和其他媒体链接。
- `YT_DLP_PATH`、`FFMPEG_PATH`、`FFPROBE_PATH` 可以不填，代码会尝试从 PATH 查找；生产环境显式填写更好排障。
- `LOG_DIR` 必须指向运行用户可写的目录。日志组件默认写入 `/logs`；请显式配置并创建：`mkdir -p /data/votxt-worker/Vocto-AI/logs`。

验证环境变量文件不会被普通用户读取：

```bash
ls -l /data/votxt-worker/Vocto-AI/.env.worker
```

权限应类似（属主为运行该 Worker 的用户，root 或 appworker）：

```text
-rw------- 1 root root ... .env.worker
```



## 8. 手动启动验证

先创建日志目录，再用一条命令验证 Worker 可以连接 Redis 和数据库：

```bash
cd /data/votxt-worker/Vocto-AI
mkdir -p logs
set -a
. ./.env.worker
set +a
pnpm run worker
```

正常日志应包含（JSON 单行，`message` 字段含如下子串）：

```text
listening on queue transcribe-jobs.
```

如果出现 Redis REST URL 错误，检查 `REDIS_URL` 是否误填了 `UPSTASH_REDIS_REST_URL`。如果出现数据库连接失败，检查 TiDB/MySQL 白名单、端口、安全组和 `DATABASE_URL`。

手动验证完成后按 `Ctrl+C` 停止 Worker，改用 systemd 长期运行。

## 9. 使用 systemd 托管（保证自动重启与开机自启）

用 systemd 托管 Worker 可以同时满足三个稳定性目标：

- **进程异常退出/崩溃后自动拉起**：`Restart=always` + `RestartSec`。
- **崩溃循环也不会被永久放弃**：`StartLimitIntervalSec=0` 关闭“启动频率超限即停止重试”的保护。
- **服务器重启后自动启动**：`systemctl enable` + `WantedBy=multi-user.target`。



### 9.1 创建服务文件

```bash
sudo nano /etc/systemd/system/votxt-worker.service
```

写入以下内容。**未创建** `appworker`**、用 root 部署时选「方式 B」**（不要写 `User=appworker`，否则服务会因用户不存在而启动失败）。

方式 A（`appworker`，§4.1）：

```ini
[Unit]
Description=BullMQ Transcription Worker
After=network-online.target
Wants=network-online.target
StartLimitIntervalSec=0

[Service]
Type=simple
User=appworker
Group=appworker
WorkingDirectory=/data/votxt-worker/Vocto-AI
EnvironmentFile=/data/votxt-worker/Vocto-AI/.env.worker
Environment=NODE_ENV=production
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/appworker/.local/bin
ExecStart=/usr/bin/env pnpm run worker
Restart=always
RestartSec=10
KillSignal=SIGTERM
TimeoutStopSec=60
SyslogIdentifier=transcribe-worker

[Install]
WantedBy=multi-user.target
```

方式 B（**root**，§4.2）：

```ini
[Unit]
Description=BullMQ Transcription Worker
After=network-online.target
Wants=network-online.target
StartLimitIntervalSec=0

[Service]
Type=simple
WorkingDirectory=/data/votxt-worker/Vocto-AI
EnvironmentFile=/data/votxt-worker/Vocto-AI/.env.worker
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

说明：

- root 下创建/编辑 unit 可省略 `sudo`；`systemctl` 同理。
- `WorkingDirectory` 和 `EnvironmentFile` 必须指向**项目目录**（含 `package.json` 的路径），不能仅写到部署根 `/data/votxt-worker`，否则 systemd 会报 `Failed to load environment files: No such file or directory` 并反复重启。
- `ExecStart=/usr/bin/env pnpm run worker` 通过 `env` 在 `PATH` 中查找 `pnpm`，避免不同机器上 `pnpm` 绝对路径不一致的问题。若要写死路径，先用 `which pnpm` 查出实际路径再填。
- `Restart=always` 覆盖了“进程被 kill、崩溃、正常退出”等所有情况，配合 `RestartSec=10` 每 10 秒重试一次。
- `StartLimitIntervalSec=0` 是稳定运行的关键：systemd 默认在 10 秒内重启超过 5 次会放弃并置为 `failed`，Worker 场景不希望被永久放弃，这里显式关闭该限制。
- `KillSignal=SIGTERM` + `TimeoutStopSec=60` 给正在处理的任务留出退出时间；即使被强制结束，BullMQ 的 stalled 机制配合任务幂等保护也会安全重试。



### 9.2 启用并启动（开机自启的关键是 enable）

```bash
sudo systemctl daemon-reload
sudo systemctl enable votxt-worker   # 注册开机自启（服务器重启后自动拉起）
sudo systemctl start votxt-worker
sudo systemctl status votxt-worker --no-pager


# 1. 查看服务的当前状态和最近几行日志
sudo systemctl status votxt-worker.service

# 2. 查看该服务最详细的错误日志（直接跳转到文件末尾）
sudo journalctl -xeu votxt-worker.service -n 50
```

`enable` 成功后可确认已建立开机自启软链：

```bash
systemctl is-enabled votxt-worker    # 预期输出 enabled
```

也可以用一条命令同时 enable + start：

```bash
sudo systemctl enable --now votxt-worker
```



### 9.3 常用运维命令

查看实时日志：

```bash
journalctl -u votxt-worker -f
```

重启 / 停止服务：

```bash
sudo systemctl restart votxt-worker
sudo systemctl stop votxt-worker
```



### 9.4 验证“自动重启”与“开机自启”

验证一：进程被杀后自动拉起（模拟崩溃）。记录当前 PID，强制杀掉，稍等约 10 秒后 PID 应变为新的值：

```bash
systemctl show -p MainPID --value votxt-worker
sudo kill -9 "$(systemctl show -p MainPID --value votxt-worker)"
sleep 12
systemctl show -p MainPID --value votxt-worker   # 应为新的、非 0 的 PID
systemctl is-active votxt-worker                  # 应为 active
```

验证二：服务器重启后自动启动。

```bash
sudo reboot
# 重新登录后：
systemctl is-active votxt-worker    # 应为 active
journalctl -u votxt-worker -n 50 --no-pager
```



## 10. PM2 备选方案

如果团队更熟悉 PM2，也可以用 PM2 托管 Worker。systemd 更适合纯服务器运维，PM2 更适合已有 Node.js 运维习惯的团队。

安装 PM2：

```bash
sudo npm install -g pm2
```

启动 Worker：

```bash
cd /data/votxt-worker/Vocto-AI
mkdir -p logs
set -a
. ./.env.worker
set +a
pm2 start "pnpm run worker" --name votxt-worker
pm2 save                                          # 保存当前进程列表
pm2 startup systemd -u appworker --hp /home/appworker   # 按提示复制执行输出的 sudo 命令，注册开机自启
```

PM2 的进程崩溃/退出后会自动重启（默认 `autorestart: true`）；`pm2 save` + `pm2 startup` 负责服务器重启后恢复进程列表，从而实现开机自启。执行完 `pm2 startup` 后，务必按它打印出的 `sudo env PATH=... pm2 startup ...` 命令再执行一次，否则开机自启不会真正生效。

查看日志：

```bash
pm2 logs votxt-worker
```

验证自动重启：

```bash
pm2 restart votxt-worker
pm2 status
```

如果使用 PM2，不要同时启用 `votxt-worker.service`，否则会运行两套 Worker。多套 Worker 本身可以并行消费队列，但同一台机器上重复托管会增加排障复杂度。二选一即可：纯服务器运维推荐 systemd（本文默认方案）。

## 11. 发布与升级

推荐发布流程（root 下省略 `sudo`，且无需 `su - appworker`）：

```bash
cd /data/votxt-worker/Vocto-AI
git fetch --all --prune
git checkout main
git pull --ff-only
pnpm install --frozen-lockfile
pnpm run prisma:generate
# pnpm build   # 可选自检
systemctl restart votxt-worker
systemctl status votxt-worker --no-pager
```

回滚流程：

```bash
cd /data/votxt-worker/Vocto-AI
git checkout <上一版提交或标签>
pnpm install --frozen-lockfile
pnpm run prisma:generate
systemctl restart votxt-worker
```

如果数据库已经执行了不可逆迁移，代码回滚前必须先确认旧代码是否兼容新表结构。

## 12. 健康检查



### 12.1 进程检查

```bash
systemctl is-active votxt-worker
systemctl status votxt-worker --no-pager
journalctl -u votxt-worker -n 100 --no-pager
```



### 12.2 Redis 队列检查

在服务器上执行：

```bash
cd /data/votxt-worker/Vocto-AI
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
du -sh /data/votxt-worker
journalctl --disk-usage
```

Worker 媒体预处理会使用系统临时目录，代码会清理临时文件，但生产仍建议监控 `/tmp` 和根分区空间。

## 14. 常见故障



### 14.1 systemd 报 `Failed to load environment files` 且 `Result: resources`

**现象：**

```text
votxt-worker.service: Failed to load environment files: No such file or directory
votxt-worker.service: Failed to spawn 'start' task: No such file or directory
Active: activating (auto-restart) (Result: resources)
```

**原因：** unit 里的 `EnvironmentFile` 或 `WorkingDirectory` 指向了不存在的路径。常见情况是代码 clone 在 `/data/votxt-worker/Vocto-AI`，但 unit 仍写成 `/data/votxt-worker/.env.worker`。

**排查：**

```bash
systemctl cat votxt-worker.service
ls -la /data/votxt-worker/Vocto-AI/.env.worker
ls -la /data/votxt-worker/Vocto-AI/package.json
which pnpm
```

**修复：** 将 unit 中的路径改为实际项目目录，然后：

```bash
sudo systemctl daemon-reload
sudo systemctl restart votxt-worker
sudo systemctl status votxt-worker --no-pager
```

若 clone 时目录名不是 `Vocto-AI`，把 unit 中的路径改成你服务器上的实际目录名。

### 14.2 Worker 启动后立刻退出

排查：

```bash
journalctl -u votxt-worker -n 200 --no-pager
```

常见原因：

- `.env.worker` 路径不对或权限不可读（应在项目目录，例如 `/data/votxt-worker/Vocto-AI/.env.worker`）。
- `ExecStart` 中的 `pnpm` 路径不对。
- `REDIS_URL` 使用了 `https://` REST 地址。
- `DATABASE_URL` 不存在或数据库拒绝连接。



### 14.3 日志提示 BullMQ 需要 Redis 协议地址

把 Upstash 控制台里的 Redis 协议地址填入：

```bash
REDIS_URL="rediss://default:PASSWORD@HOST.upstash.io:6379"
```

不要使用：

```bash
UPSTASH_REDIS_REST_URL="https://..."
```



### 14.4 任务一直停在 QUEUED

排查顺序：

1. `systemctl status votxt-worker` 确认 Worker 正在运行。
2. 确认 Web 和 Worker 的 `TRANSCRIBE_QUEUE` 一致。
3. 确认 Web 和 Worker 使用同一个 `REDIS_URL`。
4. 用 Redis 队列检查命令查看 `waiting`、`active`、`failed` 数量。
5. 查看 Worker 日志是否有数据库、R2 或服务商错误。



### 14.5 YouTube 或公开视频任务失败

YouTube 任务先确认 `GEMINI_API_KEY` 有效且模型可用：

```bash
GEMINI_VIDEO_MODEL="gemini-3.1-flash-lite"
```

非 YouTube 平台再确认 yt-dlp 固定版本可用：

```bash
/opt/votxt/bin/yt-dlp --version # 必须输出 2026.06.09
```

如果 systemd 找不到 yt-dlp，在 `.env.worker` 中配置：

```bash
YT_DLP_PATH="/opt/votxt/bin/yt-dlp"
```

然后重启：

```bash
sudo systemctl restart votxt-worker
```



### 14.6 音频处理或时长识别失败

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



### 14.7 回调没有生效但任务最后仍完成

Worker 会优先提交服务商异步任务并等待回调，同时按 `TRANSCRIPTION_POLL_INTERVAL_SECONDS` 轮询。若超出 `TRANSCRIPTION_CALLBACK_TIMEOUT_SECONDS`，会进入同步兜底链路。因此偶发回调失败不一定导致任务失败。

仍需检查：

- `TRANSCRIPTION_CALLBACK_BASE_URL` 是否是公网 HTTPS 域名。
- Web 应用是否部署了 `/api/transcription/callback/deepgram` 和 `/api/transcription/callback/assemblyai`。
- 服务商控制台是否能访问回调地址。
- Web 应用日志是否有 callback token 校验失败。



### 14.8 任务失败后用户分钟数异常

Worker 的失败事件会调用额度释放逻辑。请检查：

- Worker 日志里是否执行到 `failed` 事件。
- 数据库 `UsageLedger` 是否有对应释放流水。
- 任务是否被取消；取消任务不会按普通失败逻辑重复释放。
