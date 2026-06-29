import {notFound} from "next/navigation";
import {ArrowLeft, Download, Network, Sparkles, Star} from "lucide-react";
import {MediaPlayer, MediaSeekButton} from "@/components/media-player";
import {ShareExportLinks} from "@/components/share-export-links";
import {SharedTranslationPanel} from "@/components/shared-translation-panel";
import {getPublicShare} from "@/lib/share-links";

type Segment = {start: number; end: number; text: string; speaker?: string};

const shareCopy = {
  en: {
    eyebrow: "UniScribe Share",
    fallbackTitle: "Shared transcription",
    accessed: (count: number) => `${count} view${count === 1 ? "" : "s"}`,
    back: "Back",
    export: "Export",
    fullTranscript: "Transcript",
    summary: "Summary",
    noSummary: "This share does not include a summary yet.",
    translation: "Translation",
    noTranslation: "This share does not include a translation yet.",
    segments: "Segments",
    noSegments: "No timestamped segments are available yet."
  },
  zh: {
    eyebrow: "UniScribe 分享",
    fallbackTitle: "共享转写",
    accessed: (count: number) => `已访问 ${count} 次`,
    back: "返回",
    export: "导出",
    fullTranscript: "转写全文",
    summary: "摘要",
    noSummary: "该分享暂未包含摘要。",
    translation: "翻译",
    noTranslation: "该分享暂未包含翻译。",
    segments: "分段",
    noSegments: "该分享暂未包含时间戳分段。"
  }
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function readSegments(value: unknown): Segment[] {
  return Array.isArray(value) ? (value as Segment[]) : [];
}

export async function SharePage({locale, token}: {locale: string; token: string}) {
  const share = await getPublicShare(token);
  const transcript = share?.mediaTask.transcript;
  if (!share || !transcript) {
    notFound();
  }

  const copy = shareCopy[locale as keyof typeof shareCopy] ?? shareCopy.en;
  const task = share.mediaTask;
  const text = transcript.editedText || transcript.plainText;
  const segments = readSegments(transcript.segments);
  const summary = task.insights.find((item) => item.type === "SUMMARY")?.content as any;
  const translations = task.insights
    .filter((item) => item.type === "TRANSLATION")
    .map((item) => ({
      id: item.id,
      locale: item.locale,
      title: item.title,
      content: item.content,
      model: item.model,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }));
  const ratings = task.ratings ?? [];
  const ratingAverage = ratings.length ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length : 0;
  const title = share.title || task.originalName || copy.fallbackTitle;
  const seekEventId = `share-${token}`;

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-white/95 px-4 py-3 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <a href={`/${locale}`} className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-ink/10 bg-white text-ink/65 transition hover:border-violet/25 hover:text-violet" aria-label={copy.back}>
            <ArrowLeft size={16} />
          </a>
          <p className="hidden min-w-0 flex-1 truncate text-sm font-black text-ink/75 md:block">{title}</p>
          <a href="#exports" className="btn-primary h-9 px-3 py-2">
            <Download size={16} />
            {copy.export}
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-5">
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-black leading-tight text-ink md:text-3xl">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-ink/60">
              {task.provider || "UniScribe"} · {task.detectedLanguage || task.language || "auto"} · {copy.accessed(share.accessCount)}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-ink/10 bg-paper/60 px-3 py-2 text-xs font-black text-ink/55">
            <span>Rate transcript quality:</span>
            {[1, 2, 3, 4, 5].map((item) => (
              <Star key={item} size={15} className="text-violet" fill={item <= Math.round(ratingAverage) ? "currentColor" : "none"} aria-label={`Rating star ${item}`} />
            ))}
            {ratings.length ? <span className="ml-1 text-ink/45">{ratingAverage.toFixed(1)} ({ratings.length})</span> : null}
          </div>
        </div>

        <div className="mt-5">
          <MediaPlayer endpoint={`/api/share/${encodeURIComponent(token)}/original-file`} durationSeconds={task.durationSeconds} seekEventId={seekEventId} label={title} />
        </div>

        <section className="mt-6 grid gap-6">
        <article>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b border-ink/10 pb-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-ink">{copy.fullTranscript}</h2>
              <p className="mt-1 text-sm font-bold text-ink/50">{segments.length ? `${segments.length} 个带时间戳的片段` : copy.noSegments}</p>
            </div>
            <a href="#insights" className="focus-ring rounded-md border border-ink/10 px-3 py-2 text-xs font-black uppercase text-ink/55 transition hover:border-violet/25 hover:text-violet">{copy.summary}</a>
          </div>
          {segments.length > 0 ? (
            <div className="grid gap-1">
              {segments.map((segment, index) => (
                <section key={`${segment.start}-${index}`} className="grid gap-3 border-b border-ink/5 px-1 py-3 transition hover:bg-paper/45 sm:grid-cols-[88px_minmax(0,1fr)]">
                  <div className="text-xs font-black text-ink/45">
                    <div>{segment.speaker || "发言人 1"}</div>
                    <MediaSeekButton eventId={seekEventId} time={segment.start} className="mt-1 text-left text-violet transition hover:text-tide hover:underline">
                      {formatTime(segment.start)}
                    </MediaSeekButton>
                  </div>
                  <p className="text-base leading-7 text-ink/82">{segment.text}</p>
                </section>
              ))}
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-base leading-8 text-ink/78">{text}</div>
          )}
        </article>

        <aside id="insights" className="grid gap-4 border-t border-ink/10 pt-6 lg:grid-cols-3">
          <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase text-ink/70">
              <Sparkles size={18} className="text-tide" />
              {copy.summary}
            </h2>
            {summary ? (
              <div className="mt-3 text-sm leading-6 text-ink/70">
                <p>{summary.overview}</p>
                <ul className="mt-3 grid gap-2">
                  {summary.bullets?.map((item: string) => <li key={item}>- {item}</li>)}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-ink/60">{copy.noSummary}</p>
            )}
          </section>

          <SharedTranslationPanel token={token} title={copy.translation} emptyText={copy.noTranslation} translations={translations} />

          <section id="exports" className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase text-ink/70">
              <Network size={18} className="text-tide" />
              {copy.segments}
            </h2>
            <div className="mt-3">
              <ShareExportLinks token={token} />
            </div>
          </section>
        </aside>
        </section>
      </section>
    </main>
  );
}
