"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import type {ReactNode} from "react";
import {useLocale, useTranslations} from "next-intl";
import {
  Brain,
  CheckCircle2,
  Download,
  FileAudio,
  FileText,
  Globe2,
  HelpCircle,
  Languages,
  Loader2,
  Network,
  Send,
  Save,
  Sparkles,
  UploadCloud,
  Youtube
} from "lucide-react";
import clsx from "clsx";

type Task = {
  id: string;
  status: string;
  statusMessage?: string;
  progress: number;
  provider?: string;
  detectedLanguage?: string;
  transcript?: {
    plainText: string;
    editedText?: string;
    segments: Array<{start: number; end: number; text: string; speaker?: string}>;
  };
  insights?: Array<{type: string; content: any}>;
};

const languages = ["auto", "en", "zh", "es", "fr", "de", "ja", "ko", "pt"];
const formats = ["txt", "srt", "vtt", "json"];

export function Workspace() {
  const t = useTranslations("app");
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"upload" | "youtube">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [language, setLanguage] = useState("auto");
  const [speakerLabels, setSpeakerLabels] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [draftText, setDraftText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => task?.insights?.find((item) => item.type === "SUMMARY")?.content, [task]);
  const mindMap = useMemo(() => task?.insights?.find((item) => item.type === "MIND_MAP")?.content, [task]);
  const qa = useMemo(() => task?.insights?.find((item) => item.type === "QA")?.content, [task]);
  const translation = useMemo(() => task?.insights?.find((item) => item.type === "TRANSLATION")?.content, [task]);

  useEffect(() => {
    if (!task?.id) return;

    const events = new EventSource(`/api/tasks/${task.id}/events`);
    events.addEventListener("update", (event) => {
      setTask(JSON.parse((event as MessageEvent).data));
    });

    return () => events.close();
  }, [task?.id]);

  useEffect(() => {
    if (task?.transcript) {
      setDraftText(task.transcript.editedText || task.transcript.plainText || "");
    }
  }, [task?.transcript]);

  async function startTask() {
    setBusy(true);
    setError(null);

    try {
      let sourceUrl = youtubeUrl;
      let objectKey: string | undefined;
      let originalName: string | undefined;
      let fileSizeBytes: number | undefined;

      if (mode === "upload") {
        if (!file) throw new Error("Choose a file first.");
        const upload = await fetch("/api/uploads", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type || "application/octet-stream",
            sizeBytes: file.size
          })
        }).then((response) => response.json());

        await fetch(upload.uploadUrl, {
          method: "PUT",
          headers: {"Content-Type": file.type || "application/octet-stream"},
          body: file
        });

        sourceUrl = upload.publicUrl;
        objectKey = upload.key;
        originalName = file.name;
        fileSizeBytes = file.size;
      }

      const created = await fetch("/api/tasks", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          sourceType: mode === "upload" ? "UPLOAD" : "YOUTUBE",
          sourceUrl,
          objectKey,
          originalName,
          language,
          enableSpeakerLabels: speakerLabels,
          fileSizeBytes
        })
      }).then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).error ?? "Unable to create task.");
        return response.json();
      });

      setTask(created);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function generateInsights() {
    if (!task) return;
    setBusy(true);
    try {
      const insights = await fetch(`/api/tasks/${task.id}/insights`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({locale})
      }).then((response) => response.json());

      setTask({...task, insights});
    } finally {
      setBusy(false);
    }
  }

  async function saveTranscript() {
    if (!task?.id || !draftText.trim()) return;

    const transcript = await fetch(`/api/tasks/${task.id}/transcript`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({editedText: draftText})
    }).then((response) => response.json());

    setTask({...task, transcript: {...task.transcript!, ...transcript}});
  }

  return (
    <main className="min-h-screen px-4 py-5 md:px-8">
      <section className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[390px_1fr]">
        <aside className="rounded border border-ink/15 bg-paper/85 p-4 shadow-lifted backdrop-blur">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <div className="text-3xl font-black tracking-normal">{t("brand")}</div>
              <p className="mt-2 max-w-72 text-sm leading-6 text-ink/70">{t("tagline")}</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded bg-ink text-paper">
              <FileAudio size={24} />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 rounded bg-ink/8 p-1">
            <button
              className={clsx("focus-ring rounded px-3 py-2 text-sm font-semibold", mode === "upload" && "bg-paper shadow")}
              onClick={() => setMode("upload")}
            >
              <UploadCloud className="mr-2 inline" size={16} />
              {t("upload")}
            </button>
            <button
              className={clsx("focus-ring rounded px-3 py-2 text-sm font-semibold", mode === "youtube" && "bg-paper shadow")}
              onClick={() => setMode("youtube")}
            >
              <Youtube className="mr-2 inline" size={16} />
              {t("youtube")}
            </button>
          </div>

          {mode === "upload" ? (
            <button
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                setFile(event.dataTransfer.files[0] ?? null);
              }}
              className="focus-ring flex min-h-44 w-full flex-col items-center justify-center rounded border border-dashed border-ink/30 bg-white/55 p-5 text-center"
            >
              <UploadCloud size={34} />
              <span className="mt-3 text-base font-bold">{file?.name ?? t("drop")}</span>
              <span className="mt-1 text-sm text-ink/55">{t("choose")}</span>
              <input ref={inputRef} type="file" className="hidden" accept="audio/*,video/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            </button>
          ) : (
            <label className="block">
              <span className="mb-2 block text-sm font-bold">{t("youtube")}</span>
              <input
                value={youtubeUrl}
                onChange={(event) => setYoutubeUrl(event.target.value)}
                className="focus-ring w-full rounded border border-ink/20 bg-white/75 px-3 py-3"
                placeholder={t("youtubePlaceholder")}
              />
            </label>
          )}

          <div className="mt-5 grid gap-4">
            <label>
              <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Languages size={16} />
                {t("language")}
              </span>
              <select value={language} onChange={(event) => setLanguage(event.target.value)} className="focus-ring w-full rounded border border-ink/20 bg-white/75 px-3 py-3">
                {languages.map((item) => (
                  <option key={item} value={item}>
                    {item === "auto" ? t("auto") : item.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center justify-between rounded border border-ink/15 bg-white/50 px-3 py-3">
              <span className="flex items-center gap-2 text-sm font-bold">
                <Globe2 size={16} />
                {t("speakerLabels")}
              </span>
              <input type="checkbox" checked={speakerLabels} onChange={(event) => setSpeakerLabels(event.target.checked)} className="h-5 w-5 accent-tide" />
            </label>

            <button
              onClick={startTask}
              disabled={busy || (mode === "upload" ? !file : !youtubeUrl)}
              className="focus-ring flex items-center justify-center gap-2 rounded bg-coral px-4 py-3 font-black text-white shadow disabled:cursor-not-allowed disabled:opacity-45"
            >
              {busy ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {t("start")}
            </button>
            {error ? <p className="rounded border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p> : null}
          </div>
        </aside>

        <section className="min-h-[calc(100vh-40px)] rounded border border-ink/15 bg-white/80 p-4 shadow-lifted backdrop-blur md:p-6">
          <StatusStrip task={task} t={t} />

          {!task ? (
            <div className="grid min-h-[560px] place-items-center text-center">
              <div>
                <Sparkles className="mx-auto text-brass" size={48} />
                <p className="mt-4 max-w-md text-lg font-semibold text-ink/70">{t("empty")}</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
              <section>
                <div className="flex items-center justify-between gap-3">
                  <PanelTitle icon={<FileText size={18} />} label={t("transcript")} />
                  <button
                    onClick={saveTranscript}
                    disabled={!task.transcript}
                    className="focus-ring flex items-center gap-2 rounded border border-ink/20 px-3 py-2 text-sm font-bold disabled:opacity-40"
                  >
                    <Save size={16} />
                    Save
                  </button>
                </div>
                <div className="mt-3 h-[620px] overflow-auto rounded border border-ink/15 bg-paper/60 p-4">
                  {task.transcript ? (
                    <div className="grid gap-4">
                      {task.transcript.segments?.length ? (
                        <div className="max-h-52 overflow-auto rounded border border-ink/10 bg-white/45 p-3">
                          {task.transcript.segments.map((segment, index) => (
                            <article key={`${segment.start}-${index}`} className="mb-3 border-b border-ink/10 pb-3 last:border-b-0">
                              <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-tide">
                                <span>{formatTime(segment.start)}</span>
                                {segment.speaker ? <span>{segment.speaker}</span> : null}
                              </div>
                              <p className="text-sm leading-6 text-ink/75">{segment.text}</p>
                            </article>
                          ))}
                        </div>
                      ) : null}
                      <textarea
                        value={draftText}
                        onChange={(event) => setDraftText(event.target.value)}
                        className="focus-ring min-h-[340px] w-full resize-y rounded border border-ink/15 bg-white/75 p-4 leading-7 text-ink/85"
                      />
                    </div>
                  ) : (
                    <p className="leading-7 text-ink/70">{task.transcript?.plainText ?? task.statusMessage}</p>
                  )}
                </div>
              </section>

              <section className="grid content-start gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <PanelTitle icon={<Brain size={18} />} label="AI" />
                  <button
                    onClick={generateInsights}
                    disabled={!task.transcript || busy}
                    className="focus-ring flex items-center gap-2 rounded bg-ink px-3 py-2 text-sm font-bold text-paper disabled:opacity-45"
                  >
                    {busy ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                    {t("generateInsights")}
                  </button>
                </div>

                <InsightPanel icon={<Sparkles size={17} />} title={t("summary")}>
                  <p>{summary?.overview}</p>
                  <ul className="mt-3 grid gap-2">
                    {summary?.bullets?.map((item: string) => <li key={item}>- {item}</li>)}
                  </ul>
                </InsightPanel>

                <InsightPanel icon={<Network size={17} />} title={t("mindMap")}>
                  <MindMap node={mindMap} />
                </InsightPanel>

                <InsightPanel icon={<HelpCircle size={17} />} title={t("qa")}>
                  <div className="grid gap-3">
                    {qa?.map((item: any, index: number) => (
                      <div key={index}>
                        <div className="font-bold">{item.question}</div>
                        <div className="text-ink/70">{item.answer}</div>
                      </div>
                    ))}
                  </div>
                </InsightPanel>

                <InsightPanel icon={<Languages size={17} />} title={t("translation")}>
                  <p>{translation?.text}</p>
                </InsightPanel>

                <div className="rounded border border-ink/15 bg-paper/60 p-4">
                  <PanelTitle icon={<Download size={18} />} label={t("exports")} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[...formats, "pdf"].map((format) => (
                      <a
                        key={format}
                        href={task.transcript ? `/api/tasks/${task.id}/exports/${format}` : undefined}
                        className={clsx(
                          "focus-ring rounded border border-ink/20 px-3 py-2 text-sm font-bold uppercase",
                          !task.transcript && "pointer-events-none opacity-40"
                        )}
                      >
                        {format}
                      </a>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function StatusStrip({task, t}: {task: Task | null; t: (key: string) => string}) {
  const icon = task?.status === "COMPLETED" ? <CheckCircle2 size={18} /> : <Loader2 className="animate-spin" size={18} />;
  return (
    <div className="rounded border border-ink/15 bg-ink px-4 py-3 text-paper">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-bold">
          {task ? icon : <FileAudio size={18} />}
          {t("status")}: {task?.status ?? "READY"}
        </div>
        <div className="text-sm text-paper/70">{task?.provider ? `${task.provider} · ${task.detectedLanguage ?? ""}` : task?.statusMessage}</div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded bg-paper/15">
        <div className="h-full rounded bg-brass transition-all" style={{width: `${task?.progress ?? 0}%`}} />
      </div>
    </div>
  );
}

function PanelTitle({icon, label}: {icon: ReactNode; label: string}) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-ink/75">
      {icon}
      {label}
    </h2>
  );
}

function InsightPanel({icon, title, children}: {icon: ReactNode; title: string; children: ReactNode}) {
  return (
    <section className="rounded border border-ink/15 bg-white/65 p-4">
      <PanelTitle icon={icon} label={title} />
      <div className="mt-3 text-sm leading-6 text-ink/78">{children}</div>
    </section>
  );
}

function MindMap({node}: {node?: any}) {
  if (!node) return null;
  return (
    <div className="overflow-auto">
      <div className="inline-block min-w-full">
        <div className="rounded bg-tide px-3 py-2 text-center font-bold text-white">{node.label}</div>
        <div className="mt-3 grid gap-2">
          {node.children?.map((child: any, index: number) => (
            <div key={`${child.label}-${index}`} className="rounded border border-tide/25 bg-tide/8 px-3 py-2">
              {child.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
