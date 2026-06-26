import {Copy, Download, FileText, Gauge, Save, Share2, Sparkles, UploadCloud} from "lucide-react";
import clsx from "clsx";
import type {WorkspaceCopy} from "./copy";
import {exportFormats} from "./copy";
import type {Task} from "./types";
import {PanelTitle} from "./primitives";
import {formatTime} from "./format";

export function EmptyState({t}: {t: (key: string) => string}) {
  const steps = [
    [<UploadCloud key="u" size={20} />, t("workflowUpload"), t("workflowUploadText")],
    [<Gauge key="g" size={20} />, t("workflowTranscribe"), t("workflowTranscribeText")],
    [<Download key="d" size={20} />, t("workflowExport"), t("workflowExportText")]
  ];

  return (
    <div className="grid min-h-[560px] content-center gap-7">
      <div className="animate-fade-up">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brass/20 to-coral/15 text-brass ring-1 ring-brass/20">
          <Sparkles size={28} />
        </div>
        <p className="mt-5 max-w-xl text-lg font-semibold leading-7 text-ink/70">{t("empty")}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {steps.map(([icon, title, text], index) => (
          <article key={String(title)} className="rounded-2xl border border-ink/10 bg-paper/60 p-4 transition hover:border-tide/25 hover:shadow-soft">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-tide/10 text-tide">{icon}</span>
              <span className="text-xs font-black text-ink/35">0{index + 1}</span>
            </div>
            <h3 className="mt-3 font-black">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/65">{text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function TranscriptPanel({
  task,
  draftText,
  setDraftText,
  saveTranscript,
  copyTranscript,
  t
}: {
  task: Task;
  draftText: string;
  setDraftText: (value: string) => void;
  saveTranscript: () => void;
  copyTranscript: () => void;
  t: (key: string) => string;
}) {
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PanelTitle icon={<FileText size={18} />} label={t("transcript")} />
        <div className="flex gap-2">
          <button onClick={copyTranscript} disabled={!task.transcript} className="btn-outline px-3 py-2">
            <Copy size={16} />
            {t("copy")}
          </button>
          <button onClick={saveTranscript} disabled={!task.transcript} className="btn-outline px-3 py-2">
            <Save size={16} />
            {t("save")}
          </button>
        </div>
      </div>
      <div className="mt-3 h-[620px] overflow-auto rounded-2xl border border-ink/10 bg-paper/50 p-4">
        {task.transcript ? (
          <div className="grid gap-4">
            {task.transcript.segments?.length ? (
              <div className="max-h-52 overflow-auto rounded-xl border border-ink/10 bg-white/55 p-3">
                {task.transcript.segments.map((segment, index) => (
                  <article key={`${segment.start}-${index}`} className="mb-3 border-b border-ink/10 pb-3 last:border-b-0">
                    <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-tide">
                      <span>{formatTime(segment.start)}</span>
                      {segment.speaker ? <span className="chip-tide px-2 py-0.5 normal-case">{segment.speaker}</span> : null}
                    </div>
                    <p className="text-sm leading-6 text-ink/75">{segment.text}</p>
                  </article>
                ))}
              </div>
            ) : null}
            <textarea
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
              className="focus-ring min-h-[340px] w-full resize-y rounded-xl border border-ink/15 bg-white/75 p-4 leading-7 text-ink/85 outline-none focus-visible:border-tide"
            />
          </div>
        ) : (
          <p className="leading-7 text-ink/70">{task.statusMessage || t("noTranscript")}</p>
        )}
      </div>
    </section>
  );
}

export function ExportPanel({
  task,
  t,
  copy,
  createShareLink,
  shareUrl,
  busy
}: {
  task: Task;
  t: (key: string) => string;
  copy: WorkspaceCopy;
  createShareLink: () => void;
  shareUrl: string | null;
  busy: boolean;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PanelTitle icon={<Download size={18} />} label={t("exports")} />
        <button onClick={createShareLink} disabled={!task.transcript || busy} className="btn-outline px-3 py-2">
          <Share2 size={16} />
          {copy.share}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {exportFormats.map((format) => (
          <a
            key={format}
            href={task.transcript ? `/api/tasks/${task.id}/exports/${format}` : undefined}
            className={clsx(
              "focus-ring rounded-xl border border-ink/15 bg-white/60 px-3.5 py-2 text-sm font-bold uppercase tracking-wide transition hover:border-tide/40 hover:bg-white hover:text-tide",
              !task.transcript && "pointer-events-none opacity-40"
            )}
          >
            {format}
          </a>
        ))}
      </div>
      {shareUrl ? (
        <button
          onClick={() => navigator.clipboard.writeText(shareUrl)}
          className="focus-ring mt-3 w-full rounded-xl border border-tide/25 bg-tide/5 px-3 py-2 text-left text-xs font-bold leading-5 text-tide transition hover:bg-tide/10"
        >
          {shareUrl}
        </button>
      ) : null}
    </div>
  );
}
