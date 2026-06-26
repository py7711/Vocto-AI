import {notFound} from "next/navigation";
import {Download, FileText, Languages, Network, Sparkles} from "lucide-react";
import {getPublicShare} from "@/lib/share-links";
import {SiteFooter, SiteHeader} from "@/components/site-shell";

type Segment = {start: number; end: number; text: string; speaker?: string};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function readSegments(value: unknown): Segment[] {
  return Array.isArray(value) ? (value as Segment[]) : [];
}

export async function SharePage({token}: {token: string}) {
  const share = await getPublicShare(token);
  const transcript = share?.mediaTask.transcript;
  if (!share || !transcript) {
    notFound();
  }

  const task = share.mediaTask;
  const text = transcript.editedText || transcript.plainText;
  const segments = readSegments(transcript.segments);
  const summary = task.insights.find((item) => item.type === "SUMMARY")?.content as any;
  const translation = task.insights.find((item) => item.type === "TRANSLATION")?.content as any;

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="border-b border-ink/10 px-4 py-10 md:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow">
            <FileText size={14} />
            Votxt Share
          </p>
          <h1 className="mt-4 break-words text-4xl font-black leading-tight text-ink">{share.title || task.originalName || "共享转写"}</h1>
          <p className="mt-3 text-sm leading-6 text-ink/60">
            {task.provider || "Votxt"} · {task.detectedLanguage || task.language || "auto"} · 已访问 {share.accessCount} 次
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["txt", "srt", "vtt", "json", "md", "csv", "docx", "pdf"].map((format) => (
              <a key={format} href={`/api/share/${encodeURIComponent(token)}/exports/${format}`} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-white/75 px-3 py-2 text-sm font-black uppercase transition hover:border-tide/40 hover:text-tide">
                <Download size={15} />
                {format}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-4 py-8 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-ink/10 bg-white/75 p-6 shadow-soft">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase text-ink/70">
            <FileText size={18} />
            转写全文
          </h2>
          <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-ink/78">{text}</div>
        </article>

        <aside className="grid content-start gap-4">
          <section className="rounded-2xl border border-ink/10 bg-white/75 p-5 shadow-soft">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase text-ink/70">
              <Sparkles size={18} className="text-tide" />
              摘要
            </h2>
            {summary ? (
              <div className="mt-3 text-sm leading-6 text-ink/70">
                <p>{summary.overview}</p>
                <ul className="mt-3 grid gap-2">
                  {summary.bullets?.map((item: string) => <li key={item}>- {item}</li>)}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-ink/60">该分享暂未包含摘要。</p>
            )}
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white/75 p-5 shadow-soft">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase text-ink/70">
              <Languages size={18} className="text-tide" />
              翻译
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink/70">{translation?.text || "该分享暂未包含翻译。"}</p>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white/75 p-5 shadow-soft">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase text-ink/70">
              <Network size={18} className="text-tide" />
              分段
            </h2>
            <div className="mt-3 grid max-h-[520px] gap-3 overflow-auto pr-1">
              {segments.map((segment, index) => (
                <article key={`${segment.start}-${index}`} className="rounded-xl border border-ink/10 bg-paper/55 p-3">
                  <p className="mb-1 text-xs font-black uppercase text-tide">
                    {formatTime(segment.start)} {segment.speaker ? `· ${segment.speaker}` : ""}
                  </p>
                  <p className="text-sm leading-6 text-ink/70">{segment.text}</p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>
      <SiteFooter />
    </main>
  );
}
