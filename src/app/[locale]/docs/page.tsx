import type {Metadata} from "next";
import {BookOpen, Code2, KeyRound, Link2, UploadCloud} from "lucide-react";
import {SiteFooter, SiteHeader} from "@/components/site-shell";

export const metadata: Metadata = {
  title: "UniScribe 兼容 API 说明"
};

const endpoints = [
  ["创建上传地址", "POST", "/api/v1/files/upload-url", "生成对象存储直传地址，供兼容客户端上传媒体文件。"],
  ["创建转写任务", "POST", "/api/v1/transcriptions", "通过文件 Key、公开媒体 URL 或 YouTube 链接创建转写任务。"],
  ["读取任务列表", "GET", "/api/v1/transcriptions", "读取由当前 API Key 创建的转写任务。"],
  ["读取任务详情", "GET", "/api/v1/transcriptions/{id}", "读取转写文本、元数据、语言、时长和导出所需字段。"],
  ["读取任务状态", "GET", "/api/v1/transcriptions/{id}/status", "轮询异步任务的当前状态和进度。"],
  ["创建 YouTube 转写", "POST", "/api/v1/youtube/transcriptions", "通过公开视频链接创建兼容格式的转写任务。"]
] as const;

const formats = ["aac", "amr", "awb", "flac", "m4a", "mka", "mp2", "mp3", "oga", "ogg", "opus", "wav", "weba", "webm", "wma", "3gp", "mkv", "mov", "mp4", "mpg", "ts", "wmv"];

function CodeBlock({children}: {children: string}) {
  return (
    <pre className="overflow-auto rounded-lg border border-ink/10 bg-ink p-4 text-xs leading-6 text-paper shadow-soft">
      <code>{children}</code>
    </pre>
  );
}

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-paper">
      <SiteHeader />
      <section className="border-b border-ink/10 bg-lavender px-4 pb-14 pt-32 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow"><BookOpen size={14} /> 兼容 API</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-ink md:text-5xl">UniScribe 兼容 API 说明</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/65">本页面记录旧客户端和自动化集成仍可能使用的 API。当前个人版产品不在设置页展示 API Key、Webhook、团队成员或审计日志管理入口。</p>
          <div className="mt-6 rounded-lg border border-brass/30 bg-brass/10 p-4 text-sm font-bold leading-6 text-ink/70">
            这些接口属于兼容层，不作为个人版核心功能承诺。重新开放前需要同步更新产品文档、价格页、权限策略和数据库迁移说明。
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:px-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 grid gap-1 rounded-xl border border-ink/10 bg-white p-3 text-sm font-bold shadow-soft">
            {["概览", "鉴权", "上传流程", "端点", "状态通知", "错误处理", "速率限制", "支持格式", "集成示例"].map((item) => (
              <a key={item} href={`#${item}`} className="rounded-md px-3 py-2 text-ink/65 transition hover:bg-paper hover:text-violet">{item}</a>
            ))}
          </nav>
        </aside>

        <article className="grid gap-8">
          <section id="概览" className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-black text-ink">概览</h2>
            <p className="mt-3 text-sm leading-7 text-ink/68">兼容 API 支持创建上传地址、创建转写任务、读取任务状态和读取转写结果。工作台内部优先使用 `/api/tasks`，公开或历史集成优先使用 `/api/v1`。</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[[Link2, "基础地址", "https://api.uniscribe.co"], [KeyRound, "鉴权方式", "X-API-Key 请求头"], [UploadCloud, "文件限制", "最高 5GB / 10 小时"]].map(([Icon, title, text]) => (
                <div key={title as string} className="rounded-lg bg-paper p-4">
                  <Icon className="text-violet" size={22} />
                  <h3 className="mt-3 font-black">{title as string}</h3>
                  <p className="mt-1 text-sm font-bold text-ink/55">{text as string}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="鉴权" className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-black text-ink">鉴权</h2>
            <p className="mt-3 text-sm leading-7 text-ink/68">兼容 API 使用 `X-API-Key` 请求头。当前个人版设置页不提供自助创建入口；已有旧客户端密钥仍按后端兼容策略校验。</p>
            <CodeBlock>{`X-API-Key: your_api_key_here`}</CodeBlock>
          </section>

          <section id="上传流程" className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-black text-ink">上传流程</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-ink/10 p-4">
                <h3 className="font-black">方式一：直传文件</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">先请求上传地址，再用 `PUT` 上传到对象存储，最后用返回的文件 Key 创建转写任务。</p>
              </div>
              <div className="rounded-lg border border-ink/10 p-4">
                <h3 className="font-black">方式二：外部文件 URL</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">提交可公开下载的 HTTP/HTTPS 文件地址。YouTube 链接请使用 YouTube 兼容端点。</p>
              </div>
            </div>
          </section>

          <section id="端点" className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-black text-ink">端点</h2>
            <div className="mt-5 grid gap-3">
              {endpoints.map(([title, method, path, description]) => (
                <div key={`${method}-${path}-${title}`} className="rounded-lg border border-ink/10 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-violet px-2 py-1 text-xs font-black text-white">{method}</span>
                    <code className="text-sm font-black text-ink">{path}</code>
                  </div>
                  <h3 className="mt-3 font-black">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink/65">{description}</p>
                </div>
              ))}
            </div>
            <CodeBlock>{`POST /api/v1/transcriptions
Content-Type: application/json
X-API-Key: your_api_key

{
  "file_key": "12345-abc123.mp3",
  "language": "auto",
  "speaker_labels": true
}`}</CodeBlock>
          </section>

          <section id="状态通知" className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-black text-ink">状态通知</h2>
            <p className="mt-3 text-sm leading-7 text-ink/68">后台仍保留 Webhook 投递模型，用于历史团队工作区和兼容 API。个人版页面不提供 Webhook 管理入口，站内任务进度主要通过任务状态轮询和实时事件接口展示。</p>
          </section>

          <section id="错误处理" className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-black text-ink">错误处理</h2>
            <p className="mt-3 text-sm leading-7 text-ink/68">同步请求错误会返回标准 HTTP 状态码；异步转写失败会体现在任务状态、错误代码和状态说明中。</p>
            <CodeBlock>{`{
  "success": false,
  "error": {
    "code": "INVALID_FILE_FORMAT",
    "message": "The uploaded file format is not supported."
  },
  "timestamp": "2026-06-26T10:30:00Z"
}`}</CodeBlock>
          </section>

          <section id="速率限制" className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-black text-ink">速率限制</h2>
            <p className="mt-3 text-sm leading-7 text-ink/68">速率限制取决于套餐、队列负载和接口类型。集成方应使用指数退避重试，并避免过于频繁地轮询状态。</p>
          </section>

          <section id="支持格式" className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-black text-ink">支持格式</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {formats.map((format) => <span key={format} className="rounded-md border border-ink/10 bg-paper px-3 py-1 text-xs font-black uppercase text-ink/65">{format}</span>)}
            </div>
          </section>

          <section id="集成示例" className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft">
            <h2 className="flex items-center gap-2 text-2xl font-black text-ink"><Code2 size={22} className="text-violet" /> 集成示例</h2>
            <CodeBlock>{`const response = await fetch("https://api.uniscribe.co/api/v1/transcriptions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.UNISCRIBE_API_KEY
  },
  body: JSON.stringify({
    file_url: "https://example.com/audio.mp3",
    language: "auto",
    speaker_labels: true
  })
});

const result = await response.json();`}</CodeBlock>
          </section>
        </article>
      </section>
      <SiteFooter />
    </main>
  );
}
