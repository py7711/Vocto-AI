# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    ffmpeg \
    openssl \
    python3 \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable \
  && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile

FROM deps AS builder

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--max-old-space-size=1536

RUN pnpm build \
  && mkdir -p /opt/votxt/bin \
  && YT_DLP_INSTALL_PATH=/opt/votxt/bin/yt-dlp pnpm deps:yt-dlp \
  && /opt/votxt/bin/yt-dlp --version

FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3091
ENV YT_DLP_PATH=/opt/votxt/bin/yt-dlp
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV FFPROBE_PATH=/usr/bin/ffprobe
ENV YT_DLP_COOKIES_PATH=/config/youtube-cookies.txt
ENV LOG_DIR=/logs

WORKDIR /app

RUN mkdir -p /opt/votxt/bin /config /logs

COPY --from=builder /opt/votxt/bin/yt-dlp /opt/votxt/bin/yt-dlp
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/messages ./messages
COPY --from=builder /app/config ./config
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/tsconfig.json ./

EXPOSE 3091

CMD ["pnpm", "start"]
