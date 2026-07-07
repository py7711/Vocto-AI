import {useState} from "react";
import {Copy, Download, FileText, Loader2, Save, Share2, Trash2, X} from "lucide-react";
import clsx from "clsx";
import {CompactCheckbox, CompactSelect} from "@/components/target-controls";
import type {WorkspaceCopy} from "./copy";
import {exportFormats, localeLanguageOptions, outlineFormats} from "./copy";
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

export type ActiveShareLink = NonNullable<Task["shareLinks"]>[number] | null | undefined;

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

export function ShareTranscriptionDialog({
  activeShare,
  busy,
  canShare,
  copy,
  shareUrl,
  onClose,
  onCopy,
  onDisable,
  onEnable
}: {
  activeShare?: ActiveShareLink;
  busy: boolean;
  canShare: boolean;
  copy: WorkspaceCopy;
  shareUrl: string | null;
  onClose: () => void;
  onCopy: () => void;
  onDisable: () => void;
  onEnable: () => void;
}) {
  const sharingEnabled = Boolean(activeShare || shareUrl);
  const publicUrl = shareUrl ?? activeShare?.url ?? null;
  const [disableConfirmOpen, setDisableConfirmOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <section className="relative grid w-full max-w-[448px] gap-4 rounded-lg border border-slate-200 bg-white p-0 text-[rgb(2,8,23)] shadow-none" role="dialog" aria-modal="true" aria-labelledby="share-transcription-title">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-4 w-4 place-items-center rounded text-ink transition hover:text-slate-500" aria-label={copy.close}>
          <X size={16} />
          <span className="sr-only">{copy.close}</span>
        </button>
        <div className="flex flex-col p-6 pb-4 text-center sm:text-left">
          <h2 id="share-transcription-title" className="text-xl font-semibold leading-7 tracking-[-0.5px] text-[rgb(2,8,23)]">{copy.shareDialogTitle}</h2>
          <p className="mt-1.5 text-sm leading-5 text-slate-500">{copy.shareDialogDescription}</p>
        </div>

        {sharingEnabled ? (
          <div className="flex flex-col gap-4 px-6 pb-6">
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium leading-6 text-slate-600">
              {copy.sharingEnabled(activeShare?.accessCount ?? 0)}
            </div>
            {publicUrl ? (
              <button type="button" onClick={onCopy} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium leading-5 text-slate-600 transition hover:border-primary/30 hover:text-primary">
                {publicUrl}
              </button>
            ) : (
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium leading-5 text-slate-500">{copy.publicLinkGenerated}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setDisableConfirmOpen(true)} disabled={busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-45">
                {busy ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                {copy.disableSharing}
              </button>
              <button type="button" onClick={onClose} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90">{copy.close}</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-6 pb-6">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-normal leading-5 text-slate-500">{copy.sharingDisabledDescription}</p>
              <button type="button" onClick={onEnable} disabled={!canShare || busy} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-45">
                {busy ? <Loader2 className="animate-spin" size={16} /> : null}
                {copy.enableSharing}
              </button>
            </div>
          </div>
        )}
      </section>
      {disableConfirmOpen ? (
        <DisableSharingConfirmDialog
          busy={busy}
          copy={copy}
          onCancel={() => setDisableConfirmOpen(false)}
          onConfirm={() => {
            setDisableConfirmOpen(false);
            onDisable();
          }}
        />
      ) : null}
    </div>
  );
}

function DisableSharingConfirmDialog({busy, copy, onCancel, onConfirm}: {busy: boolean; copy: WorkspaceCopy; onCancel: () => void; onConfirm: () => void}) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 px-4">
      <section className="relative grid h-[216px] w-full max-w-[448px] gap-4 rounded-lg border border-slate-200 bg-white p-0 text-[rgb(2,8,23)] shadow-none" role="dialog" aria-modal="true" aria-labelledby="disable-sharing-title">
        <div className="flex flex-col px-6 pb-4 pt-6 text-center sm:text-left">
          <h2 id="disable-sharing-title" className="text-xl font-semibold leading-7 text-[rgb(2,8,23)]">{copy.disableSharingTitle}</h2>
          <p className="mt-1.5 text-sm font-normal leading-5 text-slate-500">
            {copy.disableSharingConfirm}
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button type="button" onClick={onCancel} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium leading-5 text-[rgb(2,8,23)] transition hover:bg-slate-50">{copy.cancel}</button>
          <button type="button" onClick={onConfirm} disabled={busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium leading-5 text-slate-50 transition hover:bg-red-500/90 disabled:pointer-events-none disabled:opacity-50">
            {busy ? <Loader2 className="animate-spin" size={16} /> : null}
            {copy.disable}
          </button>
        </div>
        <button type="button" onClick={onCancel} className="absolute right-4 top-4 grid h-4 w-4 place-items-center rounded-sm text-[rgb(2,8,23)] opacity-70 transition hover:opacity-100" aria-label={copy.close}>
          <X size={16} />
          <span className="sr-only">{copy.close}</span>
        </button>
      </section>
    </div>
  );
}

function ExportOptionsControls({
  copy,
  options,
  setOptions
}: {
  copy: WorkspaceCopy;
  options: ExportUiOptions;
  setOptions: (patch: Partial<ExportUiOptions>) => void;
}) {
  const exportContentOptions = [
    ["original", copy.exportOriginal],
    ["translation", copy.exportTranslation],
    ["bilingual", copy.exportBilingual]
  ] as const;
  const exportTargetOptions = localeLanguageOptions;

  return (
    <div className="mt-3 grid gap-3">
      <div className="flex flex-wrap gap-2">
        <CompactSelect value={options.exportContent} onChange={(value) => setOptions({exportContent: value as ExportUiOptions["exportContent"]})} options={exportContentOptions} ariaLabel={copy.exportContentLabel} className="w-44" />
        {options.exportContent !== "original" ? (
          <CompactSelect value={options.exportTarget} onChange={(value) => setOptions({exportTarget: value})} options={exportTargetOptions} ariaLabel={copy.exportTargetLabel} className="w-36" />
        ) : null}
      </div>
      <div className="grid gap-2 rounded-xl border border-ink/10 bg-white/60 p-3 text-xs font-bold text-ink/65">
        <div className="flex items-center justify-between gap-3">
          <span>{copy.speakerNames}</span>
          <CompactCheckbox checked={options.showSpeaker} onChange={(checked) => setOptions({showSpeaker: checked})} label={copy.speakerNames} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>{copy.timestamps}</span>
          <CompactCheckbox checked={options.showTimestamp} onChange={(checked) => setOptions({showTimestamp: checked})} label={copy.timestamps} />
        </div>
        <label className="grid gap-1">
          <span>{copy.subtitleMaxChars}</span>
          <input type="number" min={1} max={2000} value={options.subtitleMaxChars} onChange={(event) => setOptions({subtitleMaxChars: Number(event.target.value) || 84})} className="field h-9 bg-white text-sm" />
        </label>
        <label className="grid gap-1">
          <span>{copy.subtitleMaxSeconds}</span>
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
  copy,
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
  copy: WorkspaceCopy;
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
            {copy.segments}
          </button>
          <button onClick={saveSpeakerNames} disabled={!uniqueSpeakers.some((speaker) => (speakerDrafts[speaker] ?? speaker).trim() !== speaker)} className="btn-outline px-3 py-2">
            <Save size={16} />
            {copy.speakersLabel}
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
                      <input value={segment.speaker || ""} onChange={(event) => updateSegmentDraft(index, {speaker: event.target.value})} className="min-w-0 flex-1 rounded-md border border-ink/10 bg-white px-2 py-1 text-xs font-bold normal-case text-ink/65 outline-none focus:border-tide" placeholder={`${copy.speakersLabel} 1`} />
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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const query = buildExportQuery(exportOptions);

  return (
    <div className="rounded-2xl border border-ink/10 bg-paper/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PanelTitle icon={<Download size={18} />} label={t("exports")} />
        <button onClick={() => setShareDialogOpen(true)} disabled={!task.transcript || busy} className="btn-outline px-3 py-2">
          <Share2 size={16} />
          {copy.share}
        </button>
      </div>
      {activeShare ? (
        <p className="mt-3 rounded-md border border-tide/15 bg-tide/5 px-3 py-2 text-xs font-bold leading-5 text-tide">
          {copy.sharingEnabled(activeShare.accessCount ?? 0)}{activeShare.expiresAt ? ` · ${copy.shareExpires(new Date(activeShare.expiresAt).toLocaleDateString(copy.intlLocale))}` : ""}
        </p>
      ) : null}
      <ExportOptionsControls copy={copy} options={exportOptions} setOptions={(patch) => setExportOptions((current) => ({...current, ...patch}))} />
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
        <p className="text-xs font-black uppercase text-ink/35">{copy.outline}</p>
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
      {shareDialogOpen ? (
        <ShareTranscriptionDialog
          activeShare={activeShare}
          busy={busy}
          canShare={Boolean(task.transcript)}
          copy={copy}
          shareUrl={shareUrl}
          onClose={() => setShareDialogOpen(false)}
          onCopy={() => {
            if (shareUrl) navigator.clipboard.writeText(shareUrl).catch(() => undefined);
          }}
          onDisable={disableShareLink}
          onEnable={createShareLink}
        />
      ) : null}
    </div>
  );
}
