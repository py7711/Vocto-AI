import {useState} from "react";
import {Copy, Download, FileText, Save, Share2} from "lucide-react";
import clsx from "clsx";
import type {WorkspaceCopy} from "./copy";
import {exportFormats, languageChoices, outlineFormats} from "./copy";
import type {Task} from "./types";
import type {TranscriptSegment} from "./types";
import {PanelTitle} from "./primitives";
import {formatTime} from "./format";

export type ExportUiOptions = {
  exportContent: "original" | "translation" | "bilingual";
  exportTarget: string;
  showSpeaker: boolean;
  showTimestamp: boolean;
  subtitleMaxChars: number;
  subtitleMaxDurationSeconds: number;
};

export function buildExportQuery(options: ExportUiOptions) {
  const params = new URLSearchParams();
  if (options.exportContent !== "original") {
    params.set("content", options.exportContent);
    params.set("target", options.exportTarget);
  }
  params.set("showSpeaker", String(options.showSpeaker));
  params.set("showTimestamp", String(options.showTimestamp));
  params.set("subtitleMaxChars", String(options.subtitleMaxChars));
  params.set("subtitleMaxDurationSeconds", String(options.subtitleMaxDurationSeconds));
  const query = params.toString();
  return query ? `?${query}` : "";
}

function ExportOptionsControls({
  options,
  setOptions
}: {
  options: ExportUiOptions;
  setOptions: (patch: Partial<ExportUiOptions>) => void;
}) {
  return (
    <div className="mt-3 grid gap-3">
      <div className="flex flex-wrap gap-2">
        <select value={options.exportContent} onChange={(event) => setOptions({exportContent: event.target.value as ExportUiOptions["exportContent"]})} className="field h-9 max-w-44 bg-white text-sm font-bold">
          <option value="original">Original</option>
          <option value="translation">Translation</option>
          <option value="bilingual">Bilingual</option>
        </select>
        {options.exportContent !== "original" ? (
          <select value={options.exportTarget} onChange={(event) => setOptions({exportTarget: event.target.value})} className="field h-9 max-w-36 bg-white text-sm font-bold">
            {languageChoices.filter((item) => item !== "auto").map((item) => (
              <option key={item} value={item}>{item.toUpperCase()}</option>
            ))}
          </select>
        ) : null}
      </div>
      <div className="grid gap-2 rounded-xl border border-ink/10 bg-white/60 p-3 text-xs font-bold text-ink/65">
        <label className="flex items-center justify-between gap-3">
          <span>Speaker names</span>
          <input type="checkbox" checked={options.showSpeaker} onChange={(event) => setOptions({showSpeaker: event.target.checked})} className="h-4 w-4 accent-violet" />
        </label>
        <label className="flex items-center justify-between gap-3">
          <span>Timestamps</span>
          <input type="checkbox" checked={options.showTimestamp} onChange={(event) => setOptions({showTimestamp: event.target.checked})} className="h-4 w-4 accent-violet" />
        </label>
        <label className="grid gap-1">
          <span>Subtitle max chars</span>
          <input type="number" min={1} max={2000} value={options.subtitleMaxChars} onChange={(event) => setOptions({subtitleMaxChars: Number(event.target.value) || 84})} className="field h-9 bg-white text-sm" />
        </label>
        <label className="grid gap-1">
          <span>Subtitle max seconds</span>
          <input type="number" min={0.1} max={60} step={0.1} value={options.subtitleMaxDurationSeconds} onChange={(event) => setOptions({subtitleMaxDurationSeconds: Number(event.target.value) || 6})} className="field h-9 bg-white text-sm" />
        </label>
      </div>
    </div>
  );
}

export function TranscriptPanel({
  task,
  draftText,
  setDraftText,
  segmentDrafts,
  updateSegmentDraft,
  speakerDrafts,
  setSpeakerDrafts,
  uniqueSpeakers,
  saveSpeakerNames,
  saveTranscript,
  saveSegments,
  copyTranscript,
  t
}: {
  task: Task;
  draftText: string;
  setDraftText: (value: string) => void;
  segmentDrafts: TranscriptSegment[];
  updateSegmentDraft: (index: number, patch: Partial<TranscriptSegment>) => void;
  speakerDrafts: Record<string, string>;
  setSpeakerDrafts: (value: Record<string, string> | ((drafts: Record<string, string>) => Record<string, string>)) => void;
  uniqueSpeakers: string[];
  saveSpeakerNames: () => void;
  saveTranscript: () => void;
  saveSegments: () => void;
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
          <button onClick={saveSegments} disabled={!segmentDrafts.length} className="btn-outline px-3 py-2">
            <Save size={16} />
            Segments
          </button>
          <button onClick={saveSpeakerNames} disabled={!uniqueSpeakers.some((speaker) => (speakerDrafts[speaker] ?? speaker).trim() !== speaker)} className="btn-outline px-3 py-2">
            <Save size={16} />
            Speakers
          </button>
        </div>
      </div>
      <div className="mt-3 h-[620px] overflow-auto rounded-2xl border border-ink/10 bg-paper/50 p-4">
        {task.transcript ? (
          <div className="grid gap-4">
            {uniqueSpeakers.length ? (
              <div className="grid gap-2 rounded-xl border border-ink/10 bg-white/60 p-3 sm:grid-cols-2">
                {uniqueSpeakers.map((speaker) => (
                  <label key={speaker} className="grid gap-1 text-xs font-black uppercase text-ink/45">
                    {speaker}
                    <input value={speakerDrafts[speaker] ?? speaker} onChange={(event) => setSpeakerDrafts((drafts) => ({...drafts, [speaker]: event.target.value}))} className="field h-9 bg-white text-sm font-bold normal-case text-ink/75" />
                  </label>
                ))}
              </div>
            ) : null}
            {segmentDrafts.length ? (
              <div className="max-h-52 overflow-auto rounded-xl border border-ink/10 bg-white/55 p-3">
                {segmentDrafts.map((segment, index) => (
                  <article key={`${segment.start}-${index}`} className="mb-3 border-b border-ink/10 pb-3 last:border-b-0">
                    <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-tide">
                      <span>{formatTime(segment.start)}</span>
                      <input value={segment.speaker || ""} onChange={(event) => updateSegmentDraft(index, {speaker: event.target.value})} className="min-w-0 flex-1 rounded-md border border-ink/10 bg-white px-2 py-1 text-xs font-bold normal-case text-ink/65 outline-none focus:border-tide" placeholder="发言人 1" />
                    </div>
                    <textarea value={segment.text} onChange={(event) => updateSegmentDraft(index, {text: event.target.value})} className="focus-ring min-h-16 w-full resize-y rounded-lg border border-ink/10 bg-white p-2 text-sm leading-6 text-ink/75 outline-none focus-visible:border-tide" />
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
  disableShareLink,
  shareUrl,
  activeShare,
  busy
}: {
  task: Task;
  t: (key: string) => string;
  copy: WorkspaceCopy;
  createShareLink: () => void;
  disableShareLink: () => void;
  shareUrl: string | null;
  activeShare?: NonNullable<Task["shareLinks"]>[number] | null;
  busy: boolean;
}) {
  const [exportOptions, setExportOptions] = useState<ExportUiOptions>({
    exportContent: "original",
    exportTarget: "en",
    showSpeaker: true,
    showTimestamp: true,
    subtitleMaxChars: 84,
    subtitleMaxDurationSeconds: 6
  });
  const query = buildExportQuery(exportOptions);

  return (
    <div className="rounded-2xl border border-ink/10 bg-paper/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PanelTitle icon={<Download size={18} />} label={t("exports")} />
        <button onClick={createShareLink} disabled={!task.transcript || busy} className="btn-outline px-3 py-2">
          <Share2 size={16} />
          {copy.share}
        </button>
        <button onClick={disableShareLink} disabled={busy || (!shareUrl && !activeShare)} className="btn-outline border-coral/25 px-3 py-2 text-coral disabled:opacity-45">
          关闭分享
        </button>
      </div>
      {activeShare ? (
        <p className="mt-3 rounded-md border border-tide/15 bg-tide/5 px-3 py-2 text-xs font-bold leading-5 text-tide">
          分享已启用 · {activeShare.accessCount ?? 0} 次查看{activeShare.expiresAt ? ` · ${new Date(activeShare.expiresAt).toLocaleDateString()} 到期` : ""}
        </p>
      ) : null}
      <ExportOptionsControls options={exportOptions} setOptions={(patch) => setExportOptions((current) => ({...current, ...patch}))} />
      <div className="mt-3 flex flex-wrap gap-2">
        {exportFormats.map((format) => (
          <a
            key={format}
            href={task.transcript ? `/api/tasks/${task.id}/exports/${format}${query}` : undefined}
            className={clsx(
              "focus-ring rounded-xl border border-ink/15 bg-white/60 px-3.5 py-2 text-sm font-bold uppercase tracking-wide transition hover:border-tide/40 hover:bg-white hover:text-tide",
              !task.transcript && "pointer-events-none opacity-40"
            )}
          >
            {format}
          </a>
        ))}
      </div>
      <div className="mt-4 border-t border-ink/10 pt-3">
        <p className="text-xs font-black uppercase text-ink/35">Outline</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {outlineFormats.map((format) => (
            <a
              key={format}
              href={task.transcript ? `/api/tasks/${task.id}/outline/${format}` : undefined}
              className={clsx(
                "focus-ring rounded-xl border border-ink/15 bg-white/60 px-3.5 py-2 text-sm font-bold uppercase tracking-wide transition hover:border-violet/35 hover:bg-white hover:text-violet",
                !task.transcript && "pointer-events-none opacity-40"
              )}
            >
              {format}
            </a>
          ))}
        </div>
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
