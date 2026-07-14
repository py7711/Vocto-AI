# Docker 部署（nginx + Redis + Web + Worker，TiDB 外挂）

本文说明如何用 Docker Compose 在同一台 Ubuntu / AWS EC2 上启动：

- `nginx`：80/443 反向代理
- `redis`：BullMQ 队列
- `votxt-web`：Next.js Web
- `votxt-worker`：转写 Worker

数据库继续使用 **TiDB Cloud**（`DATABASE_URL`），不进入 Compose。

镜像内已包含锁定版 **yt-dlp `2026.06.09`** 与 **FFmpeg**，宿主机无需再安装这两样工具。

## 0. 前置条件

- 已安装 Docker Engine + Compose 插件
- 仓库代码在 `/data/votxt-worker/Vocto-AI`
- 存在 `.env`（由 `.env.example` 复制并填好 TiDB、R2、Stripe、OAuth 等）
- Let's Encrypt 证书仍在宿主机 `/etc/letsencrypt`（沿用现有 Certbot 产物）
- YouTube cookies 放在宿主机：`/data/config/youtube-cookies.txt`

首次准备 cookies：

```bash
sudo mkdir -p /data/config
# 若旧文件在仓库 config 目录，先复制过去：
sudo cp /data/votxt-worker/Vocto-AI/config/youtube-cookies.txt /data/config/youtube-cookies.txt
sudo chmod 600 /data/config/youtube-cookies.txt
```

日志目录（宿主机 `/logs/votxt` → 容器 `/logs`）：

```bash
sudo mkdir -p /logs/votxt
```

## 1. 停掉宿主机旧进程（避免端口冲突）

Compose 会占用 **80 / 443**；Redis 只走内部网络，不必再跑本机 Redis / PM2 / 本机 nginx。

```bash
sudo systemctl stop nginx || true
sudo systemctl disable nginx || true
sudo systemctl stop redis-server || true
sudo systemctl disable redis-server || true
cd /data/votxt-worker/Vocto-AI
pm2 stop all || true
pm2 delete all || true
pm2 save || true
```

确认端口空闲：

```bash
ss -tlnp | rg ':(80|443|3091|6379)\b'
```

## 2. 环境变量注意点

`.env` 仍挂给 web/worker，但 **以下项会被 `docker-compose.yml` 覆盖**（无需改成本机路径）：

| 变量 | 容器内值 |
| --- | --- |
| `REDIS_URL` | `redis://redis:6379` |
| `YT_DLP_PATH` | `/opt/votxt/bin/yt-dlp` |
| `FFMPEG_PATH` | `/usr/bin/ffmpeg` |
| `FFPROBE_PATH` | `/usr/bin/ffprobe` |
| `YT_DLP_COOKIES_PATH` | `/config/youtube-cookies.txt` |
| `LOG_DIR` | `/logs` |
| `PORT`（仅 web） | `3091` |

请继续保证：

```bash
NEXT_PUBLIC_APP_URL="https://votxt.io"
TRANSCRIPTION_CALLBACK_BASE_URL="https://votxt.io"
DATABASE_URL="mysql://...@....tidbcloud.com:4000/..."
```

## 3. 挂载一览

| 宿主机 | 容器 | 用途 |
| --- | --- | --- |
| `/data/config/youtube-cookies.txt` | `/config/youtube-cookies.txt`（ro） | yt-dlp cookies |
| `/logs/votxt` | `/logs` | `web-*.log` / `worker-*.log` |
| `/etc/letsencrypt` | `/etc/letsencrypt`（ro） | TLS 证书 |
| `/var/www/certbot` | `/var/www/certbot`（ro） | ACME 校验 |
| `./docker/nginx/votxt.conf` | nginx `default.conf` | 反代配置 |
| volume `redis-data` | Redis 数据 | AOF 持久化 |

## 4. 一键构建并启动

```bash
cd /data/votxt-worker/Vocto-AI
docker compose up -d --build
docker compose ps
docker compose logs -f --tail=100
```

验证：

```bash
docker compose exec votxt-web /opt/votxt/bin/yt-dlp --version   # 必须 2026.06.09
docker compose exec votxt-web ffmpeg -version | head -1
# YTDown 依赖镜像内 Playwright Chromium
docker compose exec votxt-worker sh -c 'ls "$PLAYWRIGHT_BROWSERS_PATH"/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell'
curl -I https://votxt.io/zh
ls -la /logs/votxt/web-*.log /logs/votxt/worker-*.log
```

YouTube 音频优先走 YTDown（`https://app.ytdown.to/zh31/youtube-to-mp3/`）：

- 镜像构建阶段执行 `playwright install chromium`
- Worker 配置 `shm_size: 1gb`，入口脚本启动 Xvfb
- 同栈 `flaresolverr` 用于绕过 Cloudflare（`YTDOWN_FLARESOLVERR_URL=http://flaresolverr:8191`）


## 5. 按服务更新 / 重启

拉取代码后，只重建变更的应用镜像并滚动服务：

```bash
cd /data/votxt-worker/Vocto-AI
git pull --ff-only

# 同时更新 web + worker（共用 votxt-app:local 镜像）
docker compose up -d --build votxt-web votxt-worker

# 仅重启 worker（配置/cookies 变了、无需重建镜像）
docker compose restart votxt-worker

# 仅重启 web
docker compose restart votxt-web

# 仅重载 nginx 配置（改了 docker/nginx/votxt.conf）
docker compose exec nginx nginx -s reload
# 或
docker compose up -d --force-recreate nginx

# 仅重启 Redis（一般少用）
docker compose restart redis
```

全部停止 / 再启动：

```bash
docker compose down
docker compose up -d
```

注意：`docker compose down -v` 会删除 Redis volume，队列数据会丢，生产慎用。

## 6. 自动重启

所有服务均设置 `restart: unless-stopped`。宿主机重启后，只要 Docker 随系统启动，Compose 服务会自动拉起。

可选：安装并启用 Docker：

```bash
sudo systemctl enable --now docker
```

## 7. 证书续期

Certbot 仍可在宿主机运行（读写 `/etc/letsencrypt`）。续期后重载容器内 nginx：

```bash
sudo certbot renew
cd /data/votxt-worker/Vocto-AI
docker compose exec nginx nginx -s reload
```

## 8. 回滚到 PM2（应急）

```bash
cd /data/votxt-worker/Vocto-AI
docker compose down
sudo systemctl start redis-server
sudo systemctl start nginx
# 按原 README / ecosystem 恢复 pm2
```

回滚前确认：`.env` 里 `REDIS_URL` 是否仍适合本机 Redis；cookies / yt-dlp 路径是否改回宿主机布局。
