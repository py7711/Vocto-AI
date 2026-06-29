"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {ArrowLeft, Brain, Copy, Download, ExternalLink, Languages, Link2, Loader2, MoreHorizontal, Network, Pencil, RotateCcw, Save, Share2, Sparkles, Star, Trash2} from "lucide-react";
import {MediaPlayer} from "@/components/media-player";
import {TranslationEditor} from "@/components/translation-editor";
import {fallbackMessages, getWorkspaceCopy, exportFormats, languageChoices, outlineFormats} from "@/components/workspace/copy";
import type {Task, TranscriptSegment} from "@/components/workspace/types";
import {formatDateTime, formatDuration} from "@/components/workspace/format";
import {InsightPanel, MindMap, PanelTitle} from "@/components/workspace/primitives";
import {buildExportQuery, type ExportUiOptions} from "@/components/workspace/panels";

export function TranscriptionPage({taskId}: {taskId: string}) {
  const locale = useLocale();
  const translate = useTranslations("app");
  const copy = getWorkspaceCopy(locale);
  const [task, setTask] = useState<Task | null>(null);
  const [draftText, setDraftText] = useState("");
  const [segmentDrafts, setSegmentDrafts] = useState<TranscriptSegment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [translationTarget, setTranslationTarget] = useState(locale);
  const [exportContent, setExportContent] = useState<"original" | "translation" | "bilingual">("original");
  const [exportTarget, setExportTarget] = useState(locale);
  const [showExportSpeaker, setShowExportSpeaker] = useState(true);
  const [showExportTimestamp, setShowExportTimestamp] = useState(true);
  const [subtitleMaxChars, setSubtitleMaxChars] = useState(84);
  const [subtitleMaxDurationSeconds, setSubtitleMaxDurationSeconds] = useState(6);
  const [seekSignal, setSeekSignal] = useState<{time: number; nonce: number} | null>(null);
  const [speakerDrafts, setSpeakerDrafts] = useState<Record<string, string>>({});

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
  const translation = useMemo(() => {
    const translations = task?.insights?.filter((item) => item.type === "TRANSLATION") ?? [];
    return (translations.find((item) => item.locale === translationTarget) ?? translations[0])?.content;
  }, [task, translationTarget]);
  const uniqueSpeakers = useMemo(() => {
    return Array.from(new Set(segmentDrafts.map((segment) => segment.speaker?.trim()).filter(Boolean) as string[]));
  }, [segmentDrafts]);

  const loadTask = useCallback(async () => {
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
  }, [copy.readTaskError, taskId]);

  useEffect(() => {
    loadTask().catch(() => undefined);
  }, [loadTask]);

  useEffect(() => {
    if (task?.transcript) {
      setDraftText(task.transcript.editedText || task.transcript.plainText || "");
      setSegmentDrafts(task.transcript.segments ?? []);
    }
    if (task?.originalName) {
      setTitleDraft(task.originalName);
    }
  }, [task?.originalName, task?.transcript]);

  useEffect(() => {
    setSpeakerDrafts((current) => {
      const next: Record<string, string> = {};
      for (const speaker of uniqueSpeakers) {
        next[speaker] = current[speaker] ?? speaker;
      }
      return next;
    });
  }, [uniqueSpeakers]);

  async function saveTranscript() {
    if (!task?.id || !draftText.trim()) return;
    setBusy(true);
    setNotice(null);
    setError(null);
    try {
      const transcript = await fetch(`/api/tasks/${task.id}/transcript`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({editedText: draftText})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.transcriptSaved);
        return body;
      });
      setTask({...task, transcript: {...task.transcript!, ...transcript}});
      setNotice(copy.transcriptSaved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function copyTranscript() {
    if (!draftText.trim()) return;
    await navigator.clipboard.writeText(draftText);
    setNotice(t("copied"));
  }

  async function saveSegments() {
    if (!task?.id || !segmentDrafts.length) return;
    setBusy(true);
    setNotice(null);
    setError(null);
    try {
      const transcript = await fetch(`/api/tasks/${task.id}/transcript`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({segments: segmentDrafts})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.transcriptSaved);
        return body;
      });
      setTask({...task, transcript: {...task.transcript!, ...transcript}});
      setDraftText(transcript.editedText || transcript.plainText || "");
      setNotice(copy.transcriptSaved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function saveSpeakerNames() {
    if (!task?.id || !uniqueSpeakers.length) return;
    const speakers = uniqueSpeakers
      .map((from) => ({from, to: (speakerDrafts[from] ?? from).trim()}))
      .filter((speaker) => speaker.to && speaker.to !== speaker.from);
    if (!speakers.length) return;

    setBusy(true);
    setNotice(null);
    setError(null);
    try {
      const data = await fetch(`/api/tasks/${task.id}/speakers`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({speakers})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法更新发言人。");
        return body as {transcript: NonNullable<Task["transcript"]>; changedCount: number};
      });
      setTask({...task, transcript: {...task.transcript!, ...data.transcript}});
      setSegmentDrafts(data.transcript.segments ?? []);
      setDraftText(data.transcript.editedText || data.transcript.plainText || "");
      setNotice(`已在 ${data.changedCount} 个片段中更新发言人名称。`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  function updateSegmentDraft(index: number, patch: Partial<TranscriptSegment>) {
    setSegmentDrafts((items) => items.map((item, itemIndex) => (itemIndex === index ? {...item, ...patch} : item)));
  }

  function seekToSegment(time: number) {
    setSeekSignal({time, nonce: Date.now()});
  }

  function updateTranslationContent(content: any) {
    if (!task) return;
    const insights = task.insights?.map((item) => (item.type === "TRANSLATION" && item.locale === translationTarget ? {...item, content} : item)) ?? [];
    setTask({...task, insights});
    setNotice(copy.transcriptSaved);
  }

  async function generateInsights() {
    if (!task) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const insights = await fetch(`/api/tasks/${task.id}/insights`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({locale})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.insightError);
        return body;
      });
      setTask({...task, insights});
      setNotice(copy.translationGenerated);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function generateSingleInsight(taskType: "summary" | "mind_map" | "qa") {
    if (!task?.id) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const record = await fetch(`/api/tasks/${task.id}/insights/single`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({taskType, locale, regenerate: true})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.insightError);
        return body as NonNullable<Task["insights"]>[number];
      });
      const others = task.insights?.filter((item) => !(item.type === record.type && item.locale === record.locale)) ?? [];
      setTask({...task, insights: [record, ...others]});
      setNotice(copy.translationGenerated);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function generateTranslation() {
    if (!task?.id) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const record = await fetch(`/api/tasks/${task.id}/translations`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({targetLanguageCode: translationTarget})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法创建翻译。");
        return body as NonNullable<Task["insights"]>[number];
      });
      const others = task.insights?.filter((item) => !(item.type === "TRANSLATION" && (item as any).locale === (record as any).locale)) ?? [];
      setTask({...task, insights: [record, ...others]});
      setNotice(copy.translationGenerated);
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
        return body as {shareLink: {id: string; url: string; title?: string | null; enabled?: boolean; expiresAt?: string | null; accessCount?: number; lastAccessAt?: string | null; createdAt: string}};
      });
      setShareUrl(data.shareLink.url);
      setTask({
        ...task,
        shareLinks: [{
          id: data.shareLink.id,
          title: data.shareLink.title ?? task.originalName ?? copy.shareTitle,
          enabled: data.shareLink.enabled ?? true,
          expiresAt: data.shareLink.expiresAt ?? null,
          accessCount: data.shareLink.accessCount ?? 0,
          lastAccessAt: data.shareLink.lastAccessAt ?? null,
          createdAt: data.shareLink.createdAt
        }]
      });
      await navigator.clipboard.writeText(data.shareLink.url).catch(() => undefined);
      setNotice(copy.shareDone);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function disableShareLink() {
    if (!task?.id) return;
    if (!window.confirm("确定要停用该转写的公开分享链接吗？")) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch(`/api/tasks/${task.id}/share`, {method: "DELETE"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法停用分享链接。");
      });
      setShareUrl(null);
      setTask({...task, shareLinks: []});
      setNotice("分享链接已停用。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function rateTranscript(rating: number) {
    if (!task?.id) return;
    setRatingBusy(true);
    setError(null);
    setNotice(null);
    try {
      const data = await fetch(`/api/tasks/${task.id}/rating`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({rating})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法保存转写评分。");
        return body as Pick<Task, "currentUserRating" | "ratingSummary">;
      });
      setTask({...task, ...data});
      setNotice("转写评分已保存。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setRatingBusy(false);
    }
  }

  async function renameTask() {
    if (!task?.id || !titleDraft.trim()) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({originalName: titleDraft})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法重命名转写。");
        return body as Task;
      });
      setTask({...task, originalName: updated.originalName});
      setRenameOpen(false);
      setNotice("转写已重命名。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function retranscribeTask() {
    if (!task?.id) return;
    if (!window.confirm("确定要重新排队转写该文件吗？现有 AI 洞察和导出缓存会重新生成。")) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch(`/api/tasks/${task.id}/retranscribe`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({language: task.language || "auto", summaryLanguage: locale})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法排队重新转写。");
      });
      await loadTask();
      setNotice("重新转写已进入队列。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function deleteTask() {
    if (!task?.id) return;
    if (!window.confirm("确定要删除该转写及其生成内容吗？")) return;
    setBusy(true);
    setError(null);
    try {
      await fetch(`/api/tasks/${task.id}`, {method: "DELETE"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法删除转写。");
      });
      window.location.href = `/${locale}/dashboard`;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setBusy(false);
    }
  }

  async function downloadOriginalFile() {
    if (!task?.id) return;
    setBusy(true);
    setError(null);
    try {
      const data = await fetch(`/api/tasks/${task.id}/original-file`, {cache: "no-store"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法下载原始媒体。");
        return body as {url: string};
      });
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function deleteOriginalFile() {
    if (!task?.id) return;
    if (!window.confirm("确定要删除原始媒体文件吗？转写稿和生成内容会保留。")) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch(`/api/tasks/${task.id}/original-file`, {method: "DELETE"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法删除原始媒体。");
      });
      await loadTask();
      setNotice("原始媒体已删除。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function cancelTask() {
    if (!task?.id) return;
    if (!window.confirm("确定要取消该转写任务吗？")) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch(`/api/tasks/${task.id}/cancel`, {method: "POST"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法取消转写。");
      });
      await loadTask();
      setNotice("转写已取消。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function retryTask(retryType: "standard" | "youtube_fallback" = "standard") {
    if (!task?.id) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch(`/api/tasks/${task.id}/retry`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({retryType})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法重试转写。");
      });
      await loadTask();
      setNotice(retryType === "youtube_fallback" ? "YouTube 兜底任务已进入队列。" : "重试任务已进入队列。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  const title = task?.originalName || copy.unnamedTask;
  const duration = task?.durationSeconds ? formatDuration(task.durationSeconds) : "--";
  const hasLoadError = Boolean(error && !task);
  const statusLabel = task?.status || (busy ? "Loading" : hasLoadError ? "Unavailable" : "Ready");
  const created = formatDateTime(task?.createdAt, copy);
  const sourceHref = task?.sourceUrl && /^https?:\/\//.test(task.sourceUrl) ? task.sourceUrl : null;
  const transcriptLineCount = task?.transcript?.segments?.length ?? 0;
  const currentRating = task?.currentUserRating?.rating ?? 0;
  const ratingAverage = task?.ratingSummary?.average;
  const ratingCount = task?.ratingSummary?.count ?? 0;
  const exportQuery = buildExportQuery({
    exportContent,
    exportTarget,
    showSpeaker: showExportSpeaker,
    showTimestamp: showExportTimestamp,
    subtitleMaxChars,
    subtitleMaxDurationSeconds
  });
  const canCancel = task ? ["UPLOADING", "QUEUED", "PROCESSING", "TRANSCRIBING", "ANALYZING"].includes(task.status) : false;
  const canRetry = task ? ["FAILED", "CANCELED"].includes(task.status) : false;

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-white/95 px-4 py-3 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <a href={`/${locale}/dashboard`} className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-ink/10 bg-white text-ink/65 transition hover:border-violet/25 hover:text-violet" aria-label="Back">
            <ArrowLeft size={16} />
          </a>
          <div className="hidden min-w-0 flex-1 md:block">
            <p className="truncate text-sm font-black text-ink/75">{hasLoadError ? "转写不可用" : title}</p>
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:flex-none">
            {sourceHref ? (
              <a href={sourceHref} target="_blank" rel="noreferrer" className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/60 transition hover:border-violet/25 hover:text-violet" aria-label="Open source">
                <ExternalLink size={16} />
              </a>
            ) : null}
            <details className="group relative">
              <summary className="focus-ring inline-flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-md border border-ink/10 text-ink/60 transition hover:border-violet/25 hover:text-violet" aria-label="More actions">
                <MoreHorizontal size={17} />
              </summary>
              <div className="absolute right-0 z-30 mt-2 w-44 rounded-lg border border-ink/10 bg-white p-1.5 shadow-card">
                <button type="button" onClick={copyTranscript} disabled={!task?.transcript} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-bold text-ink/70 transition hover:bg-paper disabled:opacity-40">
                  <Copy size={15} />
                  {t("copy")}
                </button>
                <button type="button" onClick={saveTranscript} disabled={!task?.transcript || busy} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-bold text-ink/70 transition hover:bg-paper disabled:opacity-40">
                  {busy ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
                  {t("save")}
                </button>
                <button type="button" onClick={createShareLink} disabled={!task?.transcript || busy} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-bold text-ink/70 transition hover:bg-paper disabled:opacity-40">
                  <Share2 size={15} />
                  {copy.share}
                </button>
                <button type="button" onClick={disableShareLink} disabled={busy || !task?.shareLinks?.length} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-bold text-coral transition hover:bg-coral/10 disabled:opacity-40">
                  <Trash2 size={15} />
                  关闭分享
                </button>
                <button type="button" onClick={() => { setRenameOpen(true); setTitleDraft(title); }} disabled={!task || busy} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-bold text-ink/70 transition hover:bg-paper disabled:opacity-40">
                  <Pencil size={15} />
                  重命名
                </button>
                <button type="button" onClick={retranscribeTask} disabled={!task || busy} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-bold text-ink/70 transition hover:bg-paper disabled:opacity-40">
                  <RotateCcw size={15} />
                  重新转写
                </button>
                {canCancel ? (
                  <button type="button" onClick={cancelTask} disabled={busy} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-bold text-coral transition hover:bg-coral/10 disabled:opacity-40">
                    <Trash2 size={15} />
                    Cancel job
                  </button>
                ) : null}
                {canRetry ? (
                  <button type="button" onClick={() => retryTask("standard")} disabled={busy} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-bold text-ink/70 transition hover:bg-paper disabled:opacity-40">
                    <RotateCcw size={15} />
                    Retry
                  </button>
                ) : null}
                {canRetry && task?.sourceType === "YOUTUBE" ? (
                  <button type="button" onClick={() => retryTask("youtube_fallback")} disabled={busy} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-bold text-ink/70 transition hover:bg-paper disabled:opacity-40">
                    <RotateCcw size={15} />
                    YouTube fallback
                  </button>
                ) : null}
                <button type="button" onClick={downloadOriginalFile} disabled={!task || busy} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-bold text-ink/70 transition hover:bg-paper disabled:opacity-40">
                  <Download size={15} />
                  Original file
                </button>
                <button type="button" onClick={deleteOriginalFile} disabled={!task || busy} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-bold text-coral transition hover:bg-coral/10 disabled:opacity-40">
                  <Trash2 size={15} />
                  Delete original
                </button>
                <button type="button" onClick={deleteTask} disabled={!task || busy} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-bold text-coral transition hover:bg-coral/10 disabled:opacity-40">
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            </details>
            <a href="#exports" className="btn-primary h-9 px-3 py-2">
              <Download size={16} />
              Export
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-5">
          <div className="min-w-0">
            {renameOpen ? (
              <form
                className="flex max-w-2xl flex-wrap items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  renameTask();
                }}
              >
                <input value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} className="field min-w-64 flex-1 text-base font-black md:text-lg" autoFocus />
                <button type="submit" disabled={busy || !titleDraft.trim()} className="btn-primary px-3 py-2">
                  {busy ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  保存
                </button>
                <button type="button" onClick={() => setRenameOpen(false)} className="btn-outline px-3 py-2">取消</button>
              </form>
            ) : (
              <h1 className="break-words text-2xl font-black leading-tight text-ink md:text-3xl">{hasLoadError ? "转写不可用" : title}</h1>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold text-ink/55">
              <span>{statusLabel}</span>
              <span>{duration}</span>
              <span>{created}</span>
              <span>{task?.sourceType === "YOUTUBE" ? "Link" : "File"}</span>
              {task?.detectedLanguage ? <span>{task.detectedLanguage}</span> : null}
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-ink/10 bg-paper/60 px-3 py-2 text-xs font-black text-ink/55">
            <span>{ratingBusy ? "Saving rating..." : "Rate transcript quality:"}</span>
            {[1, 2, 3, 4, 5].map((item) => (
              <button key={item} type="button" onClick={() => rateTranscript(item)} disabled={!task || ratingBusy} className="text-violet transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-45" aria-label={`Rate ${item}`}>
                <Star size={15} fill={item <= currentRating ? "currentColor" : "none"} />
              </button>
            ))}
            {ratingCount ? <span className="ml-1 text-ink/45">{ratingAverage?.toFixed(1)} ({ratingCount})</span> : null}
          </div>
        </div>

        {task && task.progress < 100 ? (
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink/8">
            <div className="h-full rounded-full bg-violet transition-all duration-500" style={{width: `${task.progress}%`}} />
          </div>
        ) : null}

        {task ? <div className="mt-5"><MediaPlayer endpoint={`/api/tasks/${task.id}/original-file`} durationSeconds={task.durationSeconds} seekSignal={seekSignal} label={title} /></div> : null}

        <div className="mt-6 grid gap-6">
          <section className="min-w-0">
            {error && task ? <p className="mb-3 rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-bold text-coral">{error}</p> : null}
            {notice ? <p className="mb-3 rounded-md border border-violet/30 bg-violet/10 px-3 py-2 text-sm font-bold text-violet">{notice}</p> : null}
            {shareUrl ? <button type="button" onClick={() => navigator.clipboard.writeText(shareUrl)} className="mb-3 w-full rounded-md border border-violet/20 bg-violet/5 px-3 py-2 text-left text-xs font-bold leading-5 text-violet">{shareUrl}</button> : null}
            {!shareUrl && task?.shareLinks?.length ? <p className="mb-3 rounded-md border border-tide/20 bg-tide/5 px-3 py-2 text-xs font-bold leading-5 text-tide">分享已启用 · {task.shareLinks[0].accessCount ?? 0} 次查看</p> : null}

            {!task ? (
              <div className="flex min-h-[560px] items-center justify-center rounded-lg bg-paper/55 text-center text-sm font-bold leading-6 text-ink/50">
                {busy ? "正在加载转写稿..." : hasLoadError ? "无法加载这个转写稿，请回到仪表盘选择可访问的文件。" : "未找到转写稿。"}
              </div>
            ) : task.transcript ? (
              <div className="grid gap-5">
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink/10 pb-3">
	                  <div>
	                    <h2 className="text-2xl font-black tracking-tight text-ink">转写稿</h2>
	                    <p className="mt-1 text-sm font-bold text-ink/50">{transcriptLineCount ? `${transcriptLineCount} 个带时间戳的片段` : "完整转写稿"}</p>
	                  </div>
	                  <div className="flex flex-wrap gap-2">
	                    <button type="button" onClick={saveSpeakerNames} disabled={!uniqueSpeakers.some((speaker) => (speakerDrafts[speaker] ?? speaker).trim() !== speaker) || busy} className="btn-outline px-3 py-2">
	                      {busy ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
	                      保存说话人
	                    </button>
	                    <button type="button" onClick={saveSegments} disabled={!segmentDrafts.length || busy} className="btn-outline px-3 py-2">
	                      {busy ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
	                      Save segments
	                    </button>
	                    <a href="#insights" className="focus-ring rounded-md border border-ink/10 px-3 py-2 text-xs font-black uppercase text-ink/55 transition hover:border-violet/25 hover:text-violet">Summary</a>
	                  </div>
	                </div>
	                {uniqueSpeakers.length ? (
	                  <div className="grid gap-2 rounded-lg border border-ink/10 bg-paper/45 p-3 sm:grid-cols-2 lg:grid-cols-3">
	                    {uniqueSpeakers.map((speaker) => (
	                      <label key={speaker} className="grid gap-1 text-xs font-black uppercase text-ink/45">
	                        {speaker}
	                        <input value={speakerDrafts[speaker] ?? speaker} onChange={(event) => setSpeakerDrafts((drafts) => ({...drafts, [speaker]: event.target.value}))} className="field h-9 bg-white text-sm font-bold normal-case text-ink/75" />
	                      </label>
	                    ))}
	                  </div>
	                ) : null}
	                {segmentDrafts.length ? (
	                  <div className="grid gap-1">
	                    {segmentDrafts.map((segment, index) => (
	                      <article key={`${segment.start}-${index}`} className="grid gap-3 border-b border-ink/5 px-1 py-3 transition hover:bg-paper/45 sm:grid-cols-[88px_minmax(0,1fr)]">
	                        <div className="text-xs font-black text-ink/45">
	                          <input value={segment.speaker || ""} onChange={(event) => updateSegmentDraft(index, {speaker: event.target.value})} className="w-full rounded-md border border-ink/10 bg-white px-2 py-1 text-xs font-black text-ink/65 outline-none focus:border-violet" placeholder="发言人 1" />
	                          <button type="button" onClick={() => seekToSegment(segment.start)} className="mt-1 text-left text-violet transition hover:text-tide hover:underline">
	                            {Math.floor(segment.start / 60).toString().padStart(2, "0")}:{Math.floor(segment.start % 60).toString().padStart(2, "0")}
	                          </button>
	                        </div>
	                        <textarea value={segment.text} onChange={(event) => updateSegmentDraft(index, {text: event.target.value})} className="focus-ring min-h-20 w-full resize-y rounded-lg border border-ink/10 bg-white p-3 text-base leading-7 text-ink/82 outline-none focus-visible:border-violet" />
	                      </article>
	                    ))}
	                  </div>
                ) : null}
                <details className="rounded-lg border border-ink/10 bg-paper/45 p-4">
                  <summary className="cursor-pointer text-sm font-black text-ink/65">Edit full transcript</summary>
                  <textarea value={draftText} onChange={(event) => setDraftText(event.target.value)} className="focus-ring mt-4 min-h-[360px] w-full resize-y rounded-lg border border-ink/15 bg-white p-4 leading-7 text-ink/85 outline-none focus-visible:border-violet" />
                </details>
              </div>
            ) : (
              <div className="min-h-[560px] rounded-lg bg-paper/55 p-5 leading-7 text-ink/65">{task.statusMessage || t("noTranscript")}</div>
            )}
          </section>

          <aside id="insights" className="grid content-start gap-4 border-t border-ink/10 pt-6 lg:grid-cols-2">
            {hasLoadError ? (
              <section className="rounded-lg border border-coral/20 bg-coral/10 p-4 text-sm font-bold leading-6 text-coral">
                {error}
                <a href={`/${locale}/dashboard`} className="mt-3 inline-flex text-ink underline">Back to dashboard</a>
              </section>
            ) : null}
            <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <PanelTitle icon={<Brain size={18} />} label={t("insightTitle")} />
                <button type="button" onClick={generateInsights} disabled={!task?.transcript || busy} className="btn-primary px-3 py-2">
                  {busy ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  {t("generateInsights")}
                </button>
              </div>
            </section>
            <InsightPanel
              icon={<Sparkles size={17} />}
              title={t("summary")}
              action={<button type="button" onClick={() => generateSingleInsight("summary")} disabled={!task?.transcript || busy} className="btn-outline px-2.5 py-1.5 text-xs">{busy ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}Regenerate</button>}
            >
              {summary ? <p>{summary.overview}</p> : <p>{t("summaryEmpty")}</p>}
            </InsightPanel>
            <InsightPanel
              icon={<Network size={17} />}
              title={t("mindMap")}
              action={<button type="button" onClick={() => generateSingleInsight("mind_map")} disabled={!task?.transcript || busy} className="btn-outline px-2.5 py-1.5 text-xs">{busy ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}Regenerate</button>}
            >
              {mindMap ? <MindMap node={mindMap} /> : <p>{t("mindMapEmpty")}</p>}
            </InsightPanel>
            <InsightPanel icon={<Languages size={17} />} title={t("translation")}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <select value={translationTarget} onChange={(event) => setTranslationTarget(event.target.value)} className="field h-9 max-w-44 bg-white text-sm font-bold">
                  {languageChoices.filter((item) => item !== "auto").map((item) => (
                    <option key={item} value={item}>{item.toUpperCase()}</option>
                  ))}
                </select>
                <button type="button" onClick={generateTranslation} disabled={!task?.transcript || busy} className="btn-outline px-3 py-2">
                  {busy ? <Loader2 className="animate-spin" size={16} /> : <Languages size={16} />}
                  Generate translation
                </button>
              </div>
              {translation && task ? (
                <TranslationEditor
                  taskId={task.id}
                  locale={translationTarget}
                  content={translation}
                  transcriptSegments={task.transcript?.segments}
                  busy={busy}
                  onSaved={updateTranslationContent}
                  onError={setError}
                />
              ) : (
                <p>{t("translationEmpty")}</p>
              )}
            </InsightPanel>
            <InsightPanel
              icon={<Link2 size={17} />}
              title={t("qa")}
              action={<button type="button" onClick={() => generateSingleInsight("qa")} disabled={!task?.transcript || busy} className="btn-outline px-2.5 py-1.5 text-xs">{busy ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}Regenerate</button>}
            >
              {qa?.length ? qa.map((item: any, index: number) => <p key={index}><strong>{item.question}</strong><br />{item.answer}</p>) : <p>{t("qaEmpty")}</p>}
            </InsightPanel>
            <section id="exports" className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft lg:col-span-2">
              <PanelTitle icon={<Download size={18} />} label={t("exports")} />
              <div className="mt-3 flex flex-wrap gap-2">
                <select value={exportContent} onChange={(event) => setExportContent(event.target.value as "original" | "translation" | "bilingual")} className="field h-9 max-w-44 bg-white text-sm font-bold">
                  <option value="original">Original</option>
                  <option value="translation">Translation</option>
                  <option value="bilingual">Bilingual</option>
                </select>
                {exportContent !== "original" ? (
                  <select value={exportTarget} onChange={(event) => setExportTarget(event.target.value)} className="field h-9 max-w-36 bg-white text-sm font-bold">
                    {languageChoices.filter((item) => item !== "auto").map((item) => (
                      <option key={item} value={item}>{item.toUpperCase()}</option>
                    ))}
                  </select>
                ) : null}
              </div>
              <div className="mt-3 grid gap-2 rounded-md border border-ink/10 bg-paper/45 p-3 text-xs font-bold text-ink/60 sm:grid-cols-2">
                <label className="flex items-center justify-between gap-2">
                  Speaker names
                  <input type="checkbox" checked={showExportSpeaker} onChange={(event) => setShowExportSpeaker(event.target.checked)} className="h-4 w-4 accent-violet" />
                </label>
                <label className="flex items-center justify-between gap-2">
                  Timestamps
                  <input type="checkbox" checked={showExportTimestamp} onChange={(event) => setShowExportTimestamp(event.target.checked)} className="h-4 w-4 accent-violet" />
                </label>
                <label className="grid gap-1">
                  Subtitle max chars
                  <input type="number" min={1} max={2000} value={subtitleMaxChars} onChange={(event) => setSubtitleMaxChars(Number(event.target.value) || 84)} className="field h-9 bg-white text-sm" />
                </label>
                <label className="grid gap-1">
                  Subtitle max seconds
                  <input type="number" min={0.1} max={60} step={0.1} value={subtitleMaxDurationSeconds} onChange={(event) => setSubtitleMaxDurationSeconds(Number(event.target.value) || 6)} className="field h-9 bg-white text-sm" />
                </label>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {exportFormats.map((format) => (
                  <a key={format} href={task?.transcript ? `/api/tasks/${task.id}/exports/${format}${exportQuery}` : undefined} className={`focus-ring rounded-md border border-ink/15 bg-paper/60 px-3 py-2 text-center text-xs font-black uppercase transition hover:border-violet/30 hover:text-violet ${!task?.transcript ? "pointer-events-none opacity-40" : ""}`}>
                    {format}
                  </a>
                ))}
              </div>
              <div className="mt-4 border-t border-ink/10 pt-3">
                <p className="text-xs font-black uppercase text-ink/35">Outline</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {outlineFormats.map((format) => (
                    <a key={format} href={task?.transcript ? `/api/tasks/${task.id}/outline/${format}` : undefined} className={`focus-ring rounded-md border border-ink/15 bg-paper/60 px-3 py-2 text-center text-xs font-black uppercase transition hover:border-violet/30 hover:text-violet ${!task?.transcript ? "pointer-events-none opacity-40" : ""}`}>
                      {format}
                    </a>
                  ))}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
