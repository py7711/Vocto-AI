"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {
  Brain,
  Download,
  FileAudio,
  Globe2,
  HelpCircle,
  Languages,
  Link2,
  Loader2,
  Mic,
  Network,
  PlayCircle,
  Send,
  Sparkles,
  UploadCloud,
  Youtube
} from "lucide-react";
import clsx from "clsx";
import {SiteHeader} from "@/components/site-shell";
import {fallbackMessages, getWorkspaceCopy, languageChoices} from "./copy";
import type {AssetView, CurrentUser, InputMode, Task, TaskListItem, TeamSnapshot, UsageSnapshot} from "./types";
import {Fact, InsightPanel, MindMap, ModeButton, PanelTitle, StatusStrip} from "./primitives";
import {MarketingSidebar, WorkspaceSidebar} from "./sidebar";
import {EmptyState, ExportPanel, TranscriptPanel} from "./panels";
import {DashboardSections, EnterprisePanel} from "./enterprise";
import {ProductSections} from "./marketing";

export function Workspace({variant = "marketing"}: {variant?: "marketing" | "dashboard"}) {
  const translate = useTranslations("app");
  const locale = useLocale();
  const copy = getWorkspaceCopy(locale);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const [mode, setMode] = useState<InputMode>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [language, setLanguage] = useState("auto");
  const [speakerLabels, setSpeakerLabels] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [draftText, setDraftText] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [teamSnapshot, setTeamSnapshot] = useState<TeamSnapshot | null>(null);
  const [usageSnapshot, setUsageSnapshot] = useState<UsageSnapshot | null>(null);
  const [taskList, setTaskList] = useState<TaskListItem[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [apiKeyName, setApiKeyName] = useState<string>(copy.productionApi);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [webhookName, setWebhookName] = useState<string>(copy.webhookName);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [assetView, setAssetView] = useState<AssetView>("transcripts");
  const [assetSearch, setAssetSearch] = useState("");

  const t = (key: string) => {
    try {
      return translate(key);
    } catch {
      return fallbackMessages[key] ?? key;
    }
  };

  const summary = useMemo(() => task?.insights?.find((item) => item.type === "SUMMARY")?.content, [task]);
  const mindMap = useMemo(() => task?.insights?.find((item) => item.type === "MIND_MAP")?.content, [task]);
  const qa = useMemo(() => task?.insights?.find((item) => item.type === "QA")?.content, [task]);
  const translation = useMemo(() => task?.insights?.find((item) => item.type === "TRANSLATION")?.content, [task]);
  const shownTasks = useMemo(() => {
    if (!task) return taskList;
    const exists = taskList.some((item) => item.id === task.id);
    const liveTask: TaskListItem = {
      id: task.id,
      sourceType: task.sourceType,
      originalName: task.originalName,
      status: task.status,
      statusMessage: task.statusMessage,
      progress: task.progress,
      provider: task.provider,
      createdAt: task.createdAt,
      transcript: task.transcript ? {id: task.id} : null,
      insights: task.insights?.map((item) => ({type: item.type}))
    };
    return exists ? taskList.map((item) => (item.id === task.id ? {...item, ...liveTask} : item)) : [liveTask, ...taskList];
  }, [task, taskList]);

  useEffect(() => {
    if (variant !== "dashboard") return;
    fetch("/api/auth/me", {cache: "no-store"})
      .then((response) => (response.ok ? response.json() : {user: null}))
      .then((data) => {
        setCurrentUser(data.user ?? null);
        setTeamSnapshot(data.team ?? null);
        if (data.user) {
          refreshTaskList().catch(() => undefined);
          refreshUsageSnapshot().catch(() => undefined);
        } else {
          setUsageSnapshot(null);
        }
      })
      .catch(() => {
        setCurrentUser(null);
        setTeamSnapshot(null);
        setUsageSnapshot(null);
      });
  }, [variant]);

  async function refreshTaskList() {
    const data = await fetch("/api/tasks?limit=50", {cache: "no-store"}).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? copy.readTasksError);
      return body as {tasks: TaskListItem[]};
    });
    setTaskList(data.tasks ?? []);
  }

  async function refreshUsageSnapshot() {
    const data = await fetch("/api/teams/current/usage", {cache: "no-store"}).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? copy.readUsageError);
      return body as UsageSnapshot;
    });
    setUsageSnapshot(data);
  }

  async function loadTaskDetail(taskId: string) {
    setBusy(true);
    setError(null);
    try {
      const fresh = await fetch(`/api/tasks/${taskId}`, {cache: "no-store"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.readTaskError);
        return body as Task;
      });
      setTask(fresh);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function refreshTeamSnapshot() {
    const data = await fetch("/api/teams/current", {cache: "no-store"}).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? copy.refreshTeamError);
      return body as TeamSnapshot;
    });
    setTeamSnapshot(data);
  }

  async function inviteTeamMember() {
    if (!inviteEmail.trim()) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch("/api/teams/current/members", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: inviteEmail.trim(), role: "MEMBER"})
      }).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? copy.inviteError);
        return data;
      });
      setInviteEmail("");
      await refreshTeamSnapshot();
      setNotice(copy.inviteDone);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function createTeamApiKey() {
    if (!apiKeyName.trim()) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const data = await fetch("/api/teams/current/api-keys", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name: apiKeyName.trim()})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.apiKeyError);
        return body as {apiKey: {rawKey: string}};
      });
      setNewApiKey(data.apiKey.rawKey);
      await refreshTeamSnapshot();
      setNotice(copy.apiKeyDone);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function createTeamWebhook() {
    if (!webhookName.trim() || !webhookUrl.trim()) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const data = await fetch("/api/teams/current/webhooks", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          name: webhookName.trim(),
          url: webhookUrl.trim(),
          events: ["task.completed", "task.failed", "share_link.create"]
        })
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.webhookError);
        return body as {webhook: {rawSecret: string}};
      });
      setNewWebhookSecret(data.webhook.rawSecret);
      setWebhookUrl("");
      await refreshTeamSnapshot();
      setNotice(copy.webhookDone);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function createShareLink() {
    if (!task?.id) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const data = await fetch(`/api/tasks/${task.id}/share`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({locale, title: task.originalName || copy.shareTitle})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.shareError);
        return body as {shareLink: {url: string}};
      });
      setShareUrl(data.shareLink.url);
      await navigator.clipboard.writeText(data.shareLink.url).catch(() => undefined);
      setNotice(copy.shareDone);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  // 服务端会通过 Redis Pub/Sub 推送任务进度；SSE 是最快的更新通道。
  useEffect(() => {
    if (!task?.id) return;

    const events = new EventSource(`/api/tasks/${task.id}/events`);
    events.addEventListener("update", (event) => {
      const updated = JSON.parse((event as MessageEvent).data) as Task;
      setTask(updated);
      setTaskList((items) => items.map((item) => (item.id === updated.id ? {...item, status: updated.status, statusMessage: updated.statusMessage, progress: updated.progress, provider: updated.provider, transcript: updated.transcript ? {id: updated.id} : item.transcript} : item)));
      if (["COMPLETED", "FAILED", "CANCELED"].includes(updated.status)) {
        refreshUsageSnapshot().catch(() => undefined);
      }
    });

    return () => events.close();
  }, [task?.id]);

  // 有些代理会缓冲 SSE，所以保留轻量轮询作为兜底，保证进度条不会卡住。
  useEffect(() => {
    if (!task?.id || ["COMPLETED", "FAILED", "CANCELED"].includes(task.status)) return;

    const interval = window.setInterval(async () => {
      try {
        const fresh = await fetch(`/api/tasks/${task.id}`, {cache: "no-store"}).then((response) => response.json());
        if (!fresh.error) {
          setTask(fresh);
          setTaskList((items) => items.map((item) => (item.id === fresh.id ? {...item, status: fresh.status, statusMessage: fresh.statusMessage, progress: fresh.progress, provider: fresh.provider, transcript: fresh.transcript ? {id: fresh.id} : item.transcript} : item)));
          if (["COMPLETED", "FAILED", "CANCELED"].includes(fresh.status)) {
            refreshUsageSnapshot().catch(() => undefined);
          }
        }
      } catch {
        // 轮询失败不影响主流程，下一次 SSE 或轮询会继续修正界面状态。
      }
    }, 2500);

    return () => window.clearInterval(interval);
  }, [task?.id, task?.status]);

  useEffect(() => {
    if (task?.transcript) {
      setDraftText(task.transcript.editedText || task.transcript.plainText || "");
    }
  }, [task?.transcript]);

  async function startTask() {
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      let sourceUrl = youtubeUrl;
      let objectKey: string | undefined;
      let originalName: string | undefined;
      let fileSizeBytes: number | undefined;

      // 文件和录音都先拿到短期有效的 R2 直传地址，再把公开地址交给转写队列。
      if (mode === "upload" || mode === "record") {
        if (!file) throw new Error(mode === "record" ? copy.needRecording : copy.needFile);
        const upload = await fetch("/api/uploads", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type || "application/octet-stream",
            sizeBytes: file.size
          })
        }).then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error ?? copy.uploadUrlError);
          return data;
        });

        const uploaded = await fetch(upload.uploadUrl, {
          method: "PUT",
          headers: {"Content-Type": file.type || "application/octet-stream"},
          body: file
        });
        if (!uploaded.ok) throw new Error(copy.uploadFailed);

        sourceUrl = upload.publicUrl;
        objectKey = upload.key;
        originalName = file.name;
        fileSizeBytes = file.size;
      }

      const created = await fetch("/api/tasks", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          sourceType: mode === "youtube" ? "YOUTUBE" : "UPLOAD",
          sourceUrl,
          objectKey,
          originalName,
          language,
          enableSpeakerLabels: speakerLabels,
          fileSizeBytes
        })
      }).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? copy.createTaskError);
        return data;
      });

      setTask(created);
      await refreshTaskList().catch(() => undefined);
      await refreshUsageSnapshot().catch(() => undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function generateInsights() {
    if (!task) return;
    setBusy(true);
    setError(null);
    try {
      const insights = await fetch(`/api/tasks/${task.id}/insights`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({locale})
      }).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? copy.insightError);
        return data;
      });

      setTask({...task, insights});
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
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
    setNotice(copy.transcriptSaved);
  }

  async function copyTranscript() {
    if (!draftText.trim()) return;
    await navigator.clipboard.writeText(draftText);
    setNotice(t("copied"));
  }

  async function toggleRecording() {
    setError(null);
    setNotice(null);

    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(recordedChunksRef.current, {type: "audio/webm"});
        setFile(new File([blob], `votxt-recording-${Date.now()}.webm`, {type: "audio/webm"}));
        setNotice(copy.recordingReady);
      };
      recorder.start();
      setRecording(true);
    } catch {
      setError(copy.micError);
    }
  }

  const isDashboard = variant === "dashboard";

  return (
    <main className="min-h-screen">
      <SiteHeader
        primaryCta={{
          href: `/${locale}/${isDashboard ? "dashboard" : "auth/signin"}`,
          label: isDashboard ? t("workspace") : t("tryFree"),
          icon: <PlayCircle size={16} />
        }}
      />

      <section id="workspace" className="mx-auto grid max-w-7xl gap-4 px-4 py-5 md:px-8 xl:grid-cols-[280px_minmax(390px,450px)_1fr]">
        {isDashboard ? <WorkspaceSidebar t={t} copy={copy} locale={locale} tasks={shownTasks} user={currentUser} teamSnapshot={teamSnapshot} usageSnapshot={usageSnapshot} assetView={assetView} setAssetView={setAssetView} assetSearch={assetSearch} setAssetSearch={setAssetSearch} activeTaskId={task?.id} onSelectTask={loadTaskDetail} /> : <MarketingSidebar copy={copy} locale={locale} />}

        <aside className="rounded-3xl border border-ink/10 bg-paper/90 p-5 shadow-lifted backdrop-blur">
          <div className="mb-5">
            <p className="eyebrow">
              <Sparkles size={14} />
              {t("workspace")}
            </p>
            <h1 className="mt-3 text-4xl font-black leading-[1.1] tracking-tight text-ink">{t("headline")}</h1>
            <p className="mt-3 text-sm leading-6 text-ink/70">{t("subheadline")}</p>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-2 text-xs font-bold text-ink/75">
            <Fact icon={<FileAudio size={15} />} label={t("formats")} />
            <Fact icon={<Globe2 size={15} />} label={t("languages")} />
            <Fact icon={<Download size={15} />} label={t("exportCount")} />
          </div>

          <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-ink/[0.06] p-1">
            <ModeButton active={mode === "upload"} icon={<UploadCloud size={16} />} label={t("uploadFile")} onClick={() => setMode("upload")} />
            <ModeButton active={mode === "youtube"} icon={<Youtube size={16} />} label={t("pasteLink")} onClick={() => setMode("youtube")} />
            <ModeButton active={mode === "record"} icon={<Mic size={16} />} label={t("recordAudio")} onClick={() => setMode("record")} />
          </div>

          {mode === "upload" ? (
            <button
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                setFile(event.dataTransfer.files[0] ?? null);
              }}
              className="focus-ring group flex min-h-44 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/25 bg-white/60 p-5 text-center transition hover:border-tide/50 hover:bg-white/80"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-tide/10 text-tide transition group-hover:scale-105">
                <UploadCloud size={26} />
              </span>
              <span className="mt-3 max-w-full break-words text-base font-bold">{file?.name ?? t("drop")}</span>
              <span className="mt-1 text-sm text-ink/55">{t("choose")}</span>
              <input ref={inputRef} type="file" className="hidden" accept="audio/*,video/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            </button>
          ) : mode === "youtube" ? (
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Link2 size={16} className="text-tide" />
                {t("youtube")}
              </span>
              <input
                value={youtubeUrl}
                onChange={(event) => setYoutubeUrl(event.target.value)}
                className="field"
                placeholder={t("youtubePlaceholder")}
              />
            </label>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-ink/25 bg-white/60 p-5">
              <div className="flex min-h-28 flex-col items-center justify-center text-center">
                <span className={clsx("inline-flex h-12 w-12 items-center justify-center rounded-2xl transition", recording ? "animate-pulse bg-coral/15 text-coral" : "bg-tide/10 text-tide")}>
                  <Mic size={26} />
                </span>
                <p className="mt-3 text-sm leading-6 text-ink/65">{t("recordHint")}</p>
                <button onClick={toggleRecording} className={recording ? "btn-accent mt-4" : "btn-primary mt-4"}>
                  {recording ? <Loader2 className="animate-spin" size={16} /> : <Mic size={16} />}
                  {recording ? t("stopRecord") : t("startRecord")}
                </button>
                {file && mode === "record" ? <p className="mt-3 max-w-full break-words text-xs font-bold text-tide">{file.name}</p> : null}
              </div>
            </div>
          )}

          <p className="mt-3 text-xs leading-5 text-ink/58">{t("localUploadHint")}</p>

          <div className="mt-5 grid gap-4">
            <label>
              <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Languages size={16} className="text-tide" />
                {t("language")}
              </span>
              <select value={language} onChange={(event) => setLanguage(event.target.value)} className="field">
                {languageChoices.map((item) => (
                  <option key={item} value={item}>
                    {item === "auto" ? t("auto") : item.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center justify-between rounded-xl border border-ink/15 bg-white/55 px-3.5 py-3 transition hover:border-ink/25">
              <span className="flex items-center gap-2 text-sm font-bold">
                <Globe2 size={16} className="text-tide" />
                {t("speakerLabels")}
              </span>
              <input type="checkbox" checked={speakerLabels} onChange={(event) => setSpeakerLabels(event.target.checked)} className="h-5 w-5 accent-tide" />
            </label>

            <button
              onClick={startTask}
              disabled={busy || (mode === "youtube" ? !youtubeUrl : !file)}
              className="btn-accent py-3 text-base"
            >
              {busy ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {t("start")}
            </button>
            {notice ? <p className="animate-fade-in rounded-xl border border-tide/30 bg-tide/10 px-3 py-2 text-sm text-tide">{notice}</p> : null}
            {error ? <p className="animate-fade-in rounded-xl border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p> : null}
            <p className="text-xs leading-5 text-ink/55">{t("terms")}</p>
          </div>
        </aside>

        <section className="min-h-[calc(100vh-120px)] rounded-3xl border border-ink/10 bg-white/80 p-4 shadow-lifted backdrop-blur md:p-6">
          <StatusStrip task={task} t={t} />

          {!task ? (
            <EmptyState t={t} />
          ) : (
            <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
              <TranscriptPanel task={task} draftText={draftText} setDraftText={setDraftText} saveTranscript={saveTranscript} copyTranscript={copyTranscript} t={t} />
              <section className="grid content-start gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <PanelTitle icon={<Brain size={18} />} label={t("insightTitle")} />
                  <button onClick={generateInsights} disabled={!task.transcript || busy} className="btn-primary px-3 py-2">
                    {busy ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                    {t("generateInsights")}
                  </button>
                </div>

                <InsightPanel icon={<Sparkles size={17} />} title={t("summary")}>
                  {summary ? (
                    <>
                      <p>{summary.overview}</p>
                      <ul className="mt-3 grid gap-2">
                        {summary.bullets?.map((item: string) => <li key={item}>- {item}</li>)}
                      </ul>
                    </>
                  ) : (
                    <p>{t("summaryEmpty")}</p>
                  )}
                </InsightPanel>

                <InsightPanel icon={<Network size={17} />} title={t("mindMap")}>
                  {mindMap ? <MindMap node={mindMap} /> : <p>{t("mindMapEmpty")}</p>}
                </InsightPanel>

                <InsightPanel icon={<HelpCircle size={17} />} title={t("qa")}>
                  {qa?.length ? (
                    <div className="grid gap-3">
                      {qa.map((item: any, index: number) => (
                        <div key={index}>
                          <div className="font-bold">{item.question}</div>
                          <div className="text-ink/70">{item.answer}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>{t("qaEmpty")}</p>
                  )}
                </InsightPanel>

                <InsightPanel icon={<Languages size={17} />} title={t("translation")}>
                  <p>{translation?.text ?? t("translationEmpty")}</p>
                </InsightPanel>

                <ExportPanel task={task} t={t} copy={copy} createShareLink={createShareLink} shareUrl={shareUrl} busy={busy} />
              </section>
            </div>
          )}
        </section>
      </section>

      {!isDashboard ? (
        <ProductSections t={t} copy={copy} locale={locale} />
      ) : (
        <>
          <EnterprisePanel
            teamSnapshot={teamSnapshot}
            usageSnapshot={usageSnapshot}
            copy={copy}
            inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail}
            apiKeyName={apiKeyName}
            setApiKeyName={setApiKeyName}
            newApiKey={newApiKey}
            webhookName={webhookName}
            setWebhookName={setWebhookName}
            webhookUrl={webhookUrl}
            setWebhookUrl={setWebhookUrl}
            newWebhookSecret={newWebhookSecret}
            createTeamApiKey={createTeamApiKey}
            createTeamWebhook={createTeamWebhook}
            inviteTeamMember={inviteTeamMember}
            busy={busy}
            notice={notice}
          />
          <DashboardSections t={t} copy={copy} />
        </>
      )}
    </main>
  );
}
