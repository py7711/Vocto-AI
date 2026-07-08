"use client";

import {type RefObject, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {AlertCircle, ArrowLeft, Brain, Check, CheckCircle2, ChevronDown, Copy, Crown, Download, ExternalLink, FileArchive, FileText, FolderOpen, Image as ImageIcon, Languages, Lightbulb, List, ListChecks, Loader2, Lock, Maximize2, Minimize2, MoreHorizontal, Pencil, Play, RefreshCw, Replace as ReplaceIcon, RotateCcw, Scan, Search, Share2, Sparkles, Star, TicketCheck, Trash2, Users, Wand2, X, Youtube, ZoomIn, ZoomOut} from "lucide-react";
import clsx from "clsx";
import {MediaPlayer} from "@/components/media-player";
import {CompactCheckbox} from "@/components/target-controls";
import {PricingAction} from "@/components/pricing-actions";
import {DashboardPricingOverlay} from "@/components/workspace/Workspace";
import {fallbackMessages, getWorkspaceCopy, exportFormats, languageChoiceLabel} from "@/components/workspace/copy";
import {WorkspaceLanguageSwitcher} from "@/components/workspace/sidebar";
import {mergeTaskSnapshot, type CurrentUser, type FolderItem, type Task, type TranscriptSegment} from "@/components/workspace/types";
import {formatTime} from "@/components/workspace/format";
import {buildExportQuery, ShareTranscriptionDialog} from "@/components/workspace/panels";
import {summaryTemplateChoices, summaryTemplateRequiresMembership, type SummaryTemplateInput} from "@/lib/summary-template";
import {hasActiveMembershipFromSubscriptions} from "@/lib/membership-shared";
import {isLocale, localeEnglishNames, localeNativeNames, locales, type Locale} from "@/lib/locales";

export function TranscriptionPage({taskId}: {taskId: string}) {
  const locale = useLocale();
  const currentLocale = isLocale(locale) ? locale : "en";
  const translate = useTranslations("app");
  const copy = getWorkspaceCopy(locale);
  const detailCopy = transcriptionControlsFor(locale);
  const translationCopy = translationSettingsFor(locale);
  const [task, setTask] = useState<Task | null>(null);
  const [draftText, setDraftText] = useState("");
  const [segmentDrafts, setSegmentDrafts] = useState<TranscriptSegment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [ratingBusy, setRatingBusy] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [summaryLimitOpen, setSummaryLimitOpen] = useState(false);
  const [mindMapPremiumOpen, setMindMapPremiumOpen] = useState(false);
  const [generatingMindMap, setGeneratingMindMap] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [templateSelectOpen, setTemplateSelectOpen] = useState(false);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [moveFolderId, setMoveFolderId] = useState<string | null | undefined>(undefined);
  const [exportFormat, setExportFormat] = useState<(typeof exportFormats)[number]>("txt");
  const [titleDraft, setTitleDraft] = useState("");
  const [exportContent, setExportContent] = useState<"original" | "translation" | "bilingual">("original");
  const [exportTarget, setExportTarget] = useState(locale);
  const [showExportSpeaker, setShowExportSpeaker] = useState(true);
  const [showExportTimestamp, setShowExportTimestamp] = useState(true);
  const [subtitleMaxChars, setSubtitleMaxChars] = useState(84);
  const [subtitleMaxDurationSeconds, setSubtitleMaxDurationSeconds] = useState(6);
  const [seekSignal, setSeekSignal] = useState<{time: number; nonce: number} | null>(null);
  const [speakerDrafts, setSpeakerDrafts] = useState<Record<string, string>>({});
  const [insightTab, setInsightTab] = useState<"summary" | "mind_map">("summary");
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [summaryTemplate, setSummaryTemplate] = useState<SummaryTemplateInput>("none");
  const [transcriptSearchOpen, setTranscriptSearchOpen] = useState(false);
  const [transcriptSearchTab, setTranscriptSearchTab] = useState<"search" | "replace">("search");
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [transcriptReplacement, setTranscriptReplacement] = useState("");
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);
  const [hoveredSegmentIndex, setHoveredSegmentIndex] = useState<number | null>(null);
  const [editingSegmentIndex, setEditingSegmentIndex] = useState<number | null>(null);
  const [speakerHintOpen, setSpeakerHintOpen] = useState(true);
  const [ratingDismissed, setRatingDismissed] = useState(false);
  const [speakerOptionsOpen, setSpeakerOptionsOpen] = useState(false);
  const [showSpeakerLabels, setShowSpeakerLabels] = useState(true);
  const [hiddenSpeakers, setHiddenSpeakers] = useState<Set<string>>(new Set());
  const translationSettingsRef = useRef<HTMLDivElement | null>(null);
  const [translationSettingsOpen, setTranslationSettingsOpen] = useState(false);
  const [translationTarget, setTranslationTarget] = useState<Locale>(currentLocale);
  const [translationSearch, setTranslationSearch] = useState("");
  const [generatingTranslation, setGeneratingTranslation] = useState(false);

  const t = (key: string) => {
    try {
      return translate(key);
    } catch {
      return fallbackMessages[key] ?? key;
    }
  };

  const summary = useMemo(() => task?.insights?.find((item) => item.type === "SUMMARY")?.content, [task]);
  const mindMap = useMemo(() => task?.insights?.find((item) => item.type === "MIND_MAP")?.content, [task]);
  const uniqueSpeakers = useMemo(() => {
    return Array.from(new Set(segmentDrafts.map((segment) => segment.speaker?.trim()).filter(Boolean) as string[]));
  }, [segmentDrafts]);

  const loadTask = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const fresh = await fetch(`/api/tasks/${taskId}?locale=${encodeURIComponent(locale)}`, {cache: "no-store"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.readTaskError);
        return body as Task;
      });
      setTask((current) => mergeTaskSnapshot(current, fresh));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }, [copy.readTaskError, locale, taskId]);

  useEffect(() => {
    loadTask().catch(() => undefined);
  }, [loadTask]);

  useEffect(() => {
    fetch("/api/folders", {cache: "no-store"})
      .then((response) => (response.ok ? response.json() : {folders: []}))
      .then((data) => setFolders(data.folders ?? []))
      .catch(() => setFolders([]));
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", {cache: "no-store"})
      .then((response) => (response.ok ? response.json() : {user: null}))
      .then((data) => setMe(data.user ?? null))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    const events = new EventSource(`/api/tasks/${taskId}/events`);
    events.addEventListener("update", (event) => {
      const updated = JSON.parse((event as MessageEvent).data) as Task;
      setTask((current) => mergeTaskSnapshot(current, updated));
    });
    events.addEventListener("error", () => {
      events.close();
    });
    return () => events.close();
  }, [taskId]);

  useEffect(() => {
    if (!task || ["COMPLETED", "FAILED", "CANCELED"].includes(task.status)) return;
    const interval = window.setInterval(async () => {
      try {
        const fresh = await fetch(`/api/tasks/${taskId}?locale=${encodeURIComponent(locale)}`, {cache: "no-store"}).then((response) => response.json());
        if (!fresh.error) setTask((current) => mergeTaskSnapshot(current, fresh as Task));
      } catch {
        // Polling is only a fallback for buffered SSE connections.
      }
    }, 2500);
    return () => window.clearInterval(interval);
  }, [locale, task, taskId]);

  useEffect(() => {
    if (!task?.id) return;
    const existingSummary = task.insights?.find((item) => item.type === "SUMMARY")?.content;
    const hasSummaryContent = Boolean(
      existingSummary?.overview ||
      existingSummary?.bullets?.length ||
      existingSummary?.takeaways?.length ||
      existingSummary?.insights?.length
    );
    setSummaryTemplate(hasSummaryContent ? "standard" : "none");
  }, [task?.id]);

  useEffect(() => {
    if (!moreOpen) return;
    function closeMoreMenuOnOutsideClick(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node) || moreMenuRef.current?.contains(target)) return;
      setMoreOpen(false);
    }
    document.addEventListener("pointerdown", closeMoreMenuOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeMoreMenuOnOutsideClick);
  }, [moreOpen]);

  useEffect(() => {
    if (!translationSettingsOpen) return;
    function closeTranslationSettings(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node) || translationSettingsRef.current?.contains(target)) return;
      setTranslationSettingsOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setTranslationSettingsOpen(false);
    }
    document.addEventListener("pointerdown", closeTranslationSettings);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeTranslationSettings);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [translationSettingsOpen]);

  useEffect(() => {
    setTranslationTarget((target) => (isLocale(target) ? target : currentLocale));
  }, [currentLocale]);

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
        if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.speakersFailed);
        return body as {transcript: NonNullable<Task["transcript"]>; changedCount: number};
      });
      setTask({...task, transcript: {...task.transcript!, ...data.transcript}});
      setSegmentDrafts(data.transcript.segments ?? []);
      setDraftText(data.transcript.editedText || data.transcript.plainText || "");
      setNotice(copy.taskWorkspace.speakersUpdated(data.changedCount));
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

  function playSegment(index: number, time: number) {
    setActiveSegmentIndex(index);
    seekToSegment(time);
  }

  async function copySegmentText(text: string) {
    if (!text.trim()) return;
    await navigator.clipboard.writeText(text);
    setNotice(t("copied"));
  }

  function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function replaceTranscriptMatch(replaceAll: boolean) {
    const searchTerm = transcriptSearch.trim();
    if (!searchTerm) return;
    const expression = new RegExp(escapeRegExp(searchTerm), replaceAll ? "gi" : "i");
    let changedCount = 0;

    if (segmentDrafts.length) {
      const nextSegments = segmentDrafts.map((item) => {
        if (!replaceAll && changedCount > 0) return item;
        const matches = item.text.match(expression);
        if (!matches?.length) return item;
        changedCount += replaceAll ? matches.length : 1;
        return {...item, text: item.text.replace(expression, transcriptReplacement)};
      });
      setSegmentDrafts(nextSegments);
    } else {
      const matches = draftText.match(expression);
      if (matches?.length) {
        changedCount = replaceAll ? matches.length : 1;
        setDraftText(draftText.replace(expression, transcriptReplacement));
      }
    }

    setNotice(changedCount ? detailCopy.replaceNotice(changedCount, replaceAll) : detailCopy.noMatchNotice);
  }

  async function generateSingleInsight(taskType: "summary" | "mind_map" | "qa", templateOverride?: SummaryTemplateInput) {
    if (!task?.id) return;
    const template = templateOverride ?? summaryTemplate;
    if (taskType === "summary" && summaryTemplateRequiresMembership(template) && !isMember) {
      setPlansOpen(true);
      return;
    }
    if (taskType === "summary") setGeneratingSummary(true);
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const record = await fetch(`/api/tasks/${task.id}/insights/single`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({taskType, locale, summaryTemplate: template, regenerate: true})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (response.status === 403 && body.code === "MEMBERSHIP_REQUIRED") {
          setPlansOpen(true);
          throw new Error(body.error ?? upgradeUiFor(locale).upgradeDescription);
        }
        if (response.status === 403 && body.code === "SUMMARY_LIMIT_REACHED") {
          setSummaryLimitOpen(true);
          throw new Error(body.error ?? upgradeUiFor(locale).summaryLimitDescription);
        }
        if (!response.ok) throw new Error(body.error ?? copy.insightError);
        return body as NonNullable<Task["insights"]>[number];
      });
      const others = task.insights?.filter((item) => !(item.type === record.type && item.locale === record.locale)) ?? [];
      setTask({...task, insights: [record, ...others]});
      if (taskType === "summary" && template !== "none") {
        setSummaryTemplate(template);
      }
      setNotice(copy.translationGenerated);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      if (taskType === "summary") setGeneratingSummary(false);
      setBusy(false);
    }
  }

  async function generateGeneralSummary() {
    setSummaryTemplate("standard");
    await generateSingleInsight("summary", "standard");
  }

  async function generateMindMap() {
    setGeneratingMindMap(true);
    try {
      await generateSingleInsight("mind_map");
    } finally {
      setGeneratingMindMap(false);
    }
  }

  async function generateTranslation() {
    if (!task?.id || !task.transcript) return;
    setGeneratingTranslation(true);
    setError(null);
    setNotice(null);
    try {
      const record = await fetch(`/api/tasks/${task.id}/translations`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          targetLanguageCode: translationTarget,
          sourceLanguageCode: task.detectedLanguage ?? task.language ?? "auto"
        })
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? translationCopy.translationFailed);
        return body as NonNullable<Task["insights"]>[number];
      });
      const others = task.insights?.filter((item) => !(item.type === "TRANSLATION" && item.locale === record.locale)) ?? [];
      setTask({...task, insights: [record, ...others]});
      setNotice(translationCopy.translationGenerated);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setGeneratingTranslation(false);
    }
  }

  function selectSummaryTemplate(value: SummaryTemplateInput) {
    if (summaryTemplateRequiresMembership(value) && !isMember) {
      setPlansOpen(true);
      return;
    }
    setSummaryTemplate(value);
    if (value === "none") return;
    if (task?.transcript) {
      generateSingleInsight("summary", value).catch(() => undefined);
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
        return body as {shareLink: {id: string; url?: string | null; title?: string | null; enabled?: boolean; expiresAt?: string | null; accessCount?: number; lastAccessAt?: string | null; createdAt: string}};
      });
      setShareUrl(data.shareLink.url ?? null);
      setTask({
        ...task,
        shareLinks: [{
          id: data.shareLink.id,
          url: data.shareLink.url ?? null,
          title: data.shareLink.title ?? task.originalName ?? copy.shareTitle,
          enabled: data.shareLink.enabled ?? true,
          expiresAt: data.shareLink.expiresAt ?? null,
          accessCount: data.shareLink.accessCount ?? 0,
          lastAccessAt: data.shareLink.lastAccessAt ?? null,
          createdAt: data.shareLink.createdAt
        }]
      });
      if (data.shareLink.url) await navigator.clipboard.writeText(data.shareLink.url).catch(() => undefined);
      setNotice(copy.shareDone);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function disableShareLink() {
    if (!task?.id) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch(`/api/tasks/${task.id}/share`, {method: "DELETE"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.disableShareFailed);
      });
      setShareUrl(null);
      setTask({...task, shareLinks: []});
      setNotice(copy.taskWorkspace.shareDisabled);
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
        if (!response.ok) throw new Error(body.error ?? detailCopy.unableSaveRating);
        return body as Pick<Task, "currentUserRating" | "ratingSummary">;
      });
      setTask({...task, ...data});
      setNotice(detailCopy.ratingSaved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setRatingBusy(false);
    }
  }

  async function renameTask() {
    if (!task?.id || !canRename) return;
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
        if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.renameTaskFailed);
        return body as Task;
      });
      setTask({...task, originalName: updated.originalName});
      setRenameOpen(false);
      setNotice(copy.taskWorkspace.taskRenamed);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function moveTask() {
    if (!task?.id) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await fetch(`/api/tasks/${task.id}/folder`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({folderId: moveFolderId || null})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.moveTaskFailed);
        return body as Task;
      });
      setTask({...task, folderId: updated.folderId ?? null, folder: updated.folder ?? null});
      setMoveOpen(false);
      setNotice(copy.taskWorkspace.batchMoved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  function runExport() {
    if (!task?.transcript) return;
    const query = buildExportQuery({
      exportContent,
      exportTarget,
      showSpeaker: showExportSpeaker,
      showTimestamp: showExportTimestamp,
      subtitleMaxChars,
      subtitleMaxDurationSeconds
    });
    window.location.href = `/api/tasks/${task.id}/exports/${exportFormat}${query}`;
    setExportOpen(false);
  }

  async function deleteTask() {
    if (!task?.id) return;
    setBusy(true);
    setError(null);
    try {
      await fetch(`/api/tasks/${task.id}`, {method: "DELETE"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.deleteTaskFailed);
      });
      window.location.href = `/${locale}/dashboard`;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setBusy(false);
    }
  }

  const title = task?.originalName || copy.unnamedTask;
  const isMember = useMemo(() => hasActiveMembershipFromSubscriptions(me?.subscriptions), [me]);
  const hasLoadError = Boolean(error && !task);
  const statusLabel = task?.status || (busy ? t("processing") : hasLoadError ? t("failed") : t("ready"));
  const sourceHref = task?.sourceUrl && /^https?:\/\//.test(task.sourceUrl) ? task.sourceUrl : null;
  const isYoutubeSource = task?.sourceType === "YOUTUBE" || Boolean(sourceHref && /(?:youtube\.com|youtu\.be)/i.test(sourceHref));
  const transcriptLineCount = task?.transcript?.segments?.length ?? 0;
  const currentRating = task?.currentUserRating?.rating ?? 0;
  const ratingAverage = task?.ratingSummary?.average;
  const ratingCount = task?.ratingSummary?.count ?? 0;
  const hasSpeakerLabels = uniqueSpeakers.length > 0;
  const initialMedia = useMemo(() => {
    const asset = task?.mediaAssets?.find((item) => item.kind === "NORMALIZED_AUDIO") ??
      task?.mediaAssets?.find((item) => item.kind === "SOURCE_MEDIA") ??
      task?.mediaAssets?.find((item) => item.kind === "AUDIO_CHUNK");
    if (asset?.url) {
      return {
        url: asset.url,
        fileName: asset.fileName ?? task?.originalName,
        sourceType: task?.sourceType,
        storedObject: Boolean(asset.objectKey)
      };
    }
    if (task?.normalizedUrl) {
      return {
        url: task.normalizedUrl,
        fileName: task.originalName,
        sourceType: task.sourceType,
        storedObject: Boolean(task.objectKey)
      };
    }
    return null;
  }, [task]);
  // 发言人 -> 序号映射，用于渲染带编号的圆形头像标签。
  const speakerIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    uniqueSpeakers.forEach((speaker, index) => map.set(speaker, index + 1));
    return map;
  }, [uniqueSpeakers]);
  const normalizedTranscriptSearch = transcriptSearch.trim().toLowerCase();
  const visibleSegments = (normalizedTranscriptSearch
    ? segmentDrafts.map((segment, index) => ({segment, index})).filter(({segment}) =>
        [segment.text, segment.speaker, formatTime(segment.start)]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedTranscriptSearch))
      )
    : segmentDrafts.map((segment, index) => ({segment, index}))
  ).filter(({segment}) => {
    // Hide segments filtered out in the speaker options menu.
    const speaker = segment.speaker?.trim();
    return !speaker || !hiddenSpeakers.has(speaker);
  });
  const transcriptTextMatchCount = useMemo(() => {
    const searchTerm = transcriptSearch.trim();
    if (!searchTerm) return 0;
    const expression = new RegExp(escapeRegExp(searchTerm), "gi");
    if (segmentDrafts.length) {
      return segmentDrafts.reduce((sum, segment) => sum + (segment.text.match(expression)?.length ?? 0), 0);
    }
    return draftText.match(expression)?.length ?? 0;
  }, [draftText, segmentDrafts, transcriptSearch]);
  const selectedFolderName = task?.folder?.name ?? t("uncategorized");
  const moveChoices = [{id: null, name: t("uncategorized")}, ...folders.map((folder) => ({id: folder.id, name: folder.name}))].filter((folder) => folder.id !== (task?.folderId ?? null));
  const canRename = Boolean(task?.id && titleDraft.trim() && titleDraft.trim() !== title.trim());
  const exportQuery = buildExportQuery({
    exportContent,
    exportTarget,
    showSpeaker: showExportSpeaker,
    showTimestamp: showExportTimestamp,
    subtitleMaxChars,
    subtitleMaxDurationSeconds
  });
  const translationRecords = task?.insights?.filter((item) => item.type === "TRANSLATION") ?? [];
  const selectedTranslation = translationRecords.find((item) => item.locale === translationTarget)?.content ?? null;
  const selectedTranslationSegments = useMemo(() => translationSegmentsFromContent(selectedTranslation), [selectedTranslation]);
  const normalizedTranslationSearch = translationSearch.trim().toLowerCase();
  const filteredTranslationOptions = useMemo(() => {
    if (!normalizedTranslationSearch) return translationLanguageOptions;
    return translationLanguageOptions.filter((option) =>
      [option.locale, option.label, option.english, option.native]
        .join(" ")
        .toLowerCase()
        .includes(normalizedTranslationSearch)
    );
  }, [normalizedTranslationSearch]);
  const popularTranslationOptions = filteredTranslationOptions.filter((option) => popularTranslationLocales.includes(option.locale));
  return (
    <main className="flex h-[100dvh] overflow-hidden bg-white text-ink">
      <div className="flex min-w-0 flex-1 flex-col">
      <header className="z-30 flex h-16 flex-none items-center border-b border-ink/10 bg-white px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <a href={`/${locale}/dashboard`} className="focus-ring inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-white text-ink transition hover:bg-paper hover:text-violet" aria-label={copy.goToDashboard}>
            <ArrowLeft size={16} />
          </a>
          <div className="hidden min-w-0 w-full max-w-[600px] flex-none md:block">
            <h1 className="truncate text-xl font-normal leading-7 text-ink">{hasLoadError ? detailCopy.transcriptionUnavailable : title}</h1>
          </div>
          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 md:flex-none md:gap-3">
            <div className="relative z-40 w-32 shrink-0 sm:w-44">
              <WorkspaceLanguageSwitcher locale={locale} copy={copy} placement="below" />
            </div>
            {sourceHref ? (
              <a href={sourceHref} target="_blank" rel="noreferrer" className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[12px] text-coral transition hover:bg-coral/10" aria-label={isYoutubeSource ? t("youtube") : t("mediaLinkTranscription")}>
                {isYoutubeSource ? <Youtube size={16} /> : <ExternalLink size={16} />}
              </a>
            ) : null}
            <button type="button" onClick={() => setShareOpen(true)} disabled={!task?.transcript || busy} className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[12px] text-violet transition hover:bg-violet/10 disabled:opacity-40" aria-label={copy.shareDialogTitle}>
              <Share2 size={16} />
            </button>
            <div ref={moreMenuRef} className="relative">
              <button type="button" onClick={() => setMoreOpen((value) => !value)} className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[12px] text-slate-500 transition hover:bg-paper hover:text-ink" aria-label={copy.exportOptions} aria-expanded={moreOpen}>
                <MoreHorizontal size={17} />
              </button>
              {moreOpen ? (
                <div className="absolute right-0 z-30 mt-1 w-[260px] rounded-[12px] border border-slate-200 bg-white p-1.5 shadow-none" role="menu">
                  <button type="button" onClick={() => { setMoreOpen(false); setRenameOpen(true); setTitleDraft(title); }} disabled={!task || busy} className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm font-normal leading-5 text-ink transition hover:bg-paper disabled:opacity-40" role="menuitem">
                    <Pencil size={15} />
                    {copy.rename}
                  </button>
                  <button type="button" onClick={() => { setMoreOpen(false); setMoveOpen(true); setMoveFolderId(undefined); }} disabled={!task || busy} className="mt-1 flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm font-normal leading-5 text-ink transition hover:bg-paper disabled:opacity-40" role="menuitem">
                    <FolderOpen size={15} />
                    {copy.move}
                  </button>
                  <div className="my-1 h-px bg-slate-100" />
                  <button type="button" onClick={() => { setMoreOpen(false); setDeleteOpen(true); }} disabled={!task || busy} className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm font-normal leading-5 text-red-600 transition hover:bg-coral/10 disabled:opacity-40" role="menuitem">
                    <Trash2 size={15} />
                    {copy.deleteTranscription}
                  </button>
                </div>
              ) : null}
            </div>
            <button type="button" onClick={() => setExportOpen(true)} disabled={!task?.transcript} className="btn-primary ml-2 h-10 !rounded-[12px] px-5 py-2 font-semibold disabled:opacity-45">
              <Download size={16} />
              {copy.exportAction}
            </button>
          </div>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col xl:flex-row xl:overflow-hidden">
          <section className="flex h-[calc(100dvh-100px)] min-h-0 min-w-0 flex-none flex-col bg-white xl:h-auto xl:flex-1">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white px-4 pb-2 pt-4 sm:px-6">
                <div className="flex h-8 max-w-[210px] items-center justify-between md:max-w-none md:gap-3">
                  <div>
                <h2 className="text-base font-semibold text-ink">{t("transcript")}</h2>
                <span aria-label={transcriptLineCount ? detailCopy.timestampedSegments(transcriptLineCount) : task?.statusMessage || statusLabel} />
              </div>
                  <div className="relative flex flex-none items-center">
                <button type="button" onClick={() => { setTranscriptSearchOpen((value) => !value); setTranscriptSearchTab("search"); setSpeakerHintOpen(false); }} disabled={!task?.transcript} className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-paper hover:text-ink disabled:opacity-40" aria-label={detailCopy.searchTranscript}>
                  <Search size={17} />
                </button>
                <button type="button" onClick={() => { setTranscriptSearchOpen(true); setTranscriptSearchTab("replace"); setSpeakerHintOpen(false); }} disabled={!task?.transcript} className={`focus-ring ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md transition disabled:opacity-40 ${transcriptSearchOpen && transcriptSearchTab === "replace" ? "bg-violet/10 text-violet" : "text-slate-500 hover:bg-paper hover:text-ink"}`} aria-label={detailCopy.replaceTranscriptText}>
                  <ReplaceIcon size={16} />
                </button>
                <button type="button" onClick={copyTranscript} disabled={!task?.transcript} className="focus-ring ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-paper hover:text-ink disabled:opacity-40" aria-label={detailCopy.copyTranscript}>
                  <Copy size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTranslationSettingsOpen((value) => !value);
                    setSpeakerHintOpen(false);
                    setSpeakerOptionsOpen(false);
                    setTranscriptSearchOpen(false);
                  }}
                  disabled={!task?.transcript || generatingTranslation}
                  className={clsx(
                    "focus-ring ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md transition disabled:opacity-40",
                    translationSettingsOpen ? "bg-violet text-white" : "text-slate-500 hover:bg-paper hover:text-ink"
                  )}
                  aria-label={translationCopy.openTranslationSettings}
                  aria-expanded={translationSettingsOpen}
                >
                  {generatingTranslation ? <Loader2 className="animate-spin" size={16} /> : <Languages size={16} />}
                </button>
                {translationSettingsOpen && task?.transcript ? (
                  <TranslationSettingsCard
                    refObject={translationSettingsRef}
                    copy={translationCopy}
                    target={translationTarget}
                    search={translationSearch}
                    options={filteredTranslationOptions}
                    popularOptions={popularTranslationOptions}
                    hasTranslation={Boolean(selectedTranslation)}
                    generating={generatingTranslation}
                    disabled={!task?.transcript}
                    onSearchChange={setTranslationSearch}
                    onTargetChange={setTranslationTarget}
                    onGenerate={generateTranslation}
                    onClose={() => setTranslationSettingsOpen(false)}
                  />
                ) : null}
                <button type="button" onClick={() => { setSpeakerHintOpen((value) => !value); setTranscriptSearchOpen(false); setSpeakerOptionsOpen(false); }} disabled={!task?.transcript} className={`focus-ring ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full transition disabled:opacity-40 ${speakerHintOpen ? "bg-violet/10 text-violet" : "text-slate-500 hover:bg-paper hover:text-ink"}`} aria-label={detailCopy.speakerRecognitionDetails}>
                  <Sparkles size={16} />
                </button>
                <button type="button" onClick={() => { setSpeakerOptionsOpen((value) => !value); setSpeakerHintOpen(false); setTranscriptSearchOpen(false); }} disabled={!task?.transcript} className={`focus-ring ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md transition disabled:opacity-40 ${speakerOptionsOpen ? "bg-violet/10 text-violet" : "text-slate-500 hover:bg-paper hover:text-ink"}`} aria-label={detailCopy.speakerOptions} title={detailCopy.speakerOptions}>
                  <Users size={16} />
                </button>
                {speakerHintOpen && task?.transcript ? (
                  <div className="absolute right-0 top-10 z-50 w-[260px] rounded-lg border border-slate-200 bg-white p-3 text-left text-xs leading-relaxed text-slate-500 shadow-lg">
                    <p>
                      {hasSpeakerLabels ? detailCopy.speakerRecognitionEnabled : detailCopy.speakerRecognitionDisabled}{" "}
                      <button type="button" className="inline-flex rounded px-1 text-xs font-medium leading-4 text-violet transition-colors hover:text-violet/80">{detailCopy.details}</button>
                    </p>
                  </div>
                ) : null}
                {speakerOptionsOpen && task?.transcript ? (
                  <div className="absolute right-0 top-10 z-50 w-[300px] rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xl">
                    <p className="text-sm font-semibold leading-5 text-ink">{detailCopy.speakerOptions}</p>
                    <div className="mt-4">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        <Users size={13} /> {detailCopy.displayMode}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium leading-5 text-ink">{detailCopy.showSpeakerLabels}</p>
                          <p className="text-xs leading-4 text-slate-400">{detailCopy.displayNamesNextToText}</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={showSpeakerLabels}
                          onClick={() => setShowSpeakerLabels((value) => !value)}
                          className={clsx("relative inline-flex h-6 w-11 flex-none items-center rounded-full transition", showSpeakerLabels ? "bg-violet" : "bg-slate-200")}
                        >
                          <span className={clsx("inline-block h-5 w-5 transform rounded-full bg-white shadow transition", showSpeakerLabels ? "translate-x-5" : "translate-x-0.5")} />
                        </button>
                      </div>
                    </div>
                    {hasSpeakerLabels ? (
                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <div className="flex items-center justify-between">
                          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            <Users size={13} /> {detailCopy.filterSpeakers}
                          </p>
                          <button
                            type="button"
                            onClick={() => setHiddenSpeakers((current) => (current.size === uniqueSpeakers.length ? new Set() : new Set(uniqueSpeakers)))}
                            className="text-xs font-medium text-violet transition hover:text-violet/80"
                          >
                            {hiddenSpeakers.size === uniqueSpeakers.length ? detailCopy.selectAll : detailCopy.unselectAll}
                          </button>
                        </div>
                        <ul className="mt-2 grid max-h-52 gap-1 overflow-y-auto">
                          {uniqueSpeakers.map((speaker) => {
                            const checked = !hiddenSpeakers.has(speaker);
                            const count = segmentDrafts.filter((segment) => segment.speaker?.trim() === speaker).length;
                            const percent = segmentDrafts.length ? Math.round((count / segmentDrafts.length) * 100) : 0;
                            return (
                              <li key={speaker}>
                                <button
                                  type="button"
                                  onClick={() => setHiddenSpeakers((current) => {
                                    const next = new Set(current);
                                    if (next.has(speaker)) next.delete(speaker);
                                    else next.add(speaker);
                                    return next;
                                  })}
                                  className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left transition hover:bg-slate-50"
                                >
                                  <span className={clsx("grid h-4 w-4 flex-none place-items-center rounded border", checked ? "border-violet bg-violet text-white" : "border-slate-300 text-transparent")}>
                                    <Check size={11} />
                                  </span>
                                  <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-violet/10 text-[11px] font-semibold text-violet">
                                    {speakerIndexMap.get(speaker) ?? 1}
                                  </span>
                                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{speaker}</span>
                                  <span className="flex-none text-[11px] font-medium tabular-nums text-slate-400">{percent}%</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-6">
                {task && task.progress < 100 ? (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/8">
                    <div className="h-full rounded-full bg-violet transition-all duration-500" style={{width: `${task.progress}%`}} />
                  </div>
                ) : null}

                {error && task ? <p className="mt-3 rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-bold text-coral">{error}</p> : null}
                {notice ? <p className="mt-3 rounded-md border border-violet/30 bg-violet/10 px-3 py-2 text-sm font-bold text-violet">{notice}</p> : null}
                {!ratingDismissed ? (
                <div className="relative mb-4 mt-4 max-w-[210px] rounded border border-slate-200 bg-white px-3 py-2 text-base font-normal leading-6 text-slate-500 md:mt-5 md:max-w-none">
                  <button type="button" onClick={() => setRatingDismissed(true)} className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-violet/10 hover:text-ink md:hidden" aria-label={copy.close}>
                    <X size={16} />
                  </button>
                  <div className="flex flex-col gap-2 pr-8 md:flex-row md:items-center">
                    <div className="flex min-w-0 flex-wrap items-center gap-2 md:flex-nowrap">
                      <span className="shrink-0 whitespace-nowrap text-xs font-normal leading-4 text-slate-500 md:text-sm md:leading-5">{ratingBusy ? detailCopy.savingRating : detailCopy.rateTranscriptQuality}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((item) => (
                          <button key={item} type="button" onClick={() => rateTranscript(item)} disabled={!task || ratingBusy} className="rounded text-slate-500 transition hover:scale-110 hover:text-violet disabled:cursor-not-allowed disabled:opacity-45" aria-label={detailCopy.rateLabel(item)}>
                            <Star className="h-5 w-5 md:h-[19px] md:w-[19px]" fill={item <= currentRating ? "currentColor" : "none"} />
                          </button>
                        ))}
                      </div>
                    </div>
                    {ratingCount ? <span className="text-xs text-ink/45">{ratingAverage?.toFixed(1)} ({ratingCount})</span> : null}
                  </div>
                </div>
                ) : null}
              </div>

            {!task ? (
              <div className="mx-4 mt-8 flex min-h-[360px] items-center justify-center rounded-lg bg-paper/55 text-center text-sm font-bold leading-6 text-ink/50 sm:mx-6">
                {busy ? t("processing") : hasLoadError ? copy.readTaskError : t("noTranscript")}
              </div>
            ) : task.transcript ? (
              <div className="mt-4 grid gap-2 px-4 pb-8 sm:px-6">
                {segmentDrafts.length ? (
                  <div className="grid gap-2">
                    {visibleSegments.map(({segment, index}) => {
                      const segmentActionsVisible = hoveredSegmentIndex === index || activeSegmentIndex === index || editingSegmentIndex === index;
                      return (
                      <article key={`${segment.start}-${index}`} onMouseEnter={() => setHoveredSegmentIndex(index)} onMouseLeave={() => setHoveredSegmentIndex((current) => (current === index ? null : current))} className="relative max-w-[242px] rounded-lg p-4 transition hover:bg-slate-50 md:max-w-none">
                        <div className="mb-3 flex h-[19.5px] items-center justify-between gap-3">
                          <button type="button" onClick={() => playSegment(index, segment.start)} className="text-left text-[13px] font-normal leading-[19.5px] tabular-nums text-slate-500/70 transition hover:text-violet hover:underline">
                            {formatTime(segment.start)}
                          </button>
                          <div className={clsx("flex items-center gap-2 transition", segmentActionsVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")}>
                            <button type="button" onClick={() => playSegment(index, segment.start)} className="focus-ring inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-violet" aria-label={detailCopy.playFrom(formatTime(segment.start))}>
                              <Play size={15} />
                            </button>
                            <button type="button" onClick={() => copySegmentText(segment.text)} className="focus-ring inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-violet" aria-label={detailCopy.copySegment}>
                              <Copy size={15} />
                            </button>
                            <button type="button" onClick={() => setEditingSegmentIndex((current) => (current === index ? null : index))} className="focus-ring inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-violet" aria-label={detailCopy.editSegment}>
                              <Pencil size={15} />
                            </button>
                          </div>
                        </div>
                        <div role="button" tabIndex={0} onClick={() => playSegment(index, segment.start)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); playSegment(index, segment.start); } }} className={clsx("rounded-lg border-2 p-2 transition hover:border-violet focus:border-violet focus:outline-none sm:p-3", activeSegmentIndex === index ? "border-violet bg-violet text-white" : "border-transparent bg-white")}>
                          {showSpeakerLabels && segment.speaker ? (
                            <button type="button" onClick={(event) => { event.stopPropagation(); playSegment(index, segment.start); }} className={clsx("mb-1.5 flex items-center gap-2 text-left transition")}>
                              <span className={clsx("grid h-5 w-5 flex-none place-items-center rounded-full text-[11px] font-semibold", activeSegmentIndex === index ? "bg-white/20 text-white" : "bg-violet/10 text-violet")}>
                                {speakerIndexMap.get(segment.speaker.trim()) ?? 1}
                              </span>
                              <span className={clsx("text-xs font-semibold", activeSegmentIndex === index ? "text-white/90" : "text-ink/80")}>{segment.speaker}</span>
                              <span className={clsx("text-[11px] font-normal tabular-nums", activeSegmentIndex === index ? "text-white/70" : "text-slate-400")}>{formatTime(segment.start)}</span>
                            </button>
                          ) : null}
                          {editingSegmentIndex === index ? (
                            <textarea
                              value={segment.text}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) => updateSegmentDraft(index, {text: event.target.value})}
                              className="min-h-[92px] w-full resize-y rounded-md border border-violet/30 bg-white px-3 py-2 text-sm leading-[22.75px] text-ink outline-none focus:border-violet focus:ring-2 focus:ring-violet/15"
                              aria-label={detailCopy.editSegmentAt(formatTime(segment.start))}
                              autoFocus
                            />
                          ) : (
                            <p className={clsx("text-sm leading-[22.75px]", activeSegmentIndex === index ? "text-white" : "text-ink")}>{segment.text}</p>
                          )}
                        </div>
                        {selectedTranslationSegments[index]?.text ? (
                          <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              <Languages size={12} />
                              <span>{translationCopy.translationResult}</span>
                            </div>
                            <p className="text-sm leading-[22.75px] text-slate-700">{selectedTranslationSegments[index].text}</p>
                          </div>
                        ) : null}
                      </article>
                      );
                    })}
                    {!visibleSegments.length ? (
                      <div className="rounded-lg bg-paper/55 p-6 text-sm font-bold leading-6 text-ink/50">
                        {detailCopy.noSegmentSearchResults}
                      </div>
                    ) : null}
                    <div className="hidden">
                      {segmentDrafts.map((segment, index) => (
                        <label key={`${segment.start}-${index}-editor`}>
                          <span>{formatTime(segment.start)}</span>
                          <input value={segment.speaker || ""} onChange={(event) => updateSegmentDraft(index, {speaker: event.target.value})} />
                          <textarea value={segment.text} onChange={(event) => updateSegmentDraft(index, {text: event.target.value})} />
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {draftText.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => (
                      <article key={`${paragraph.slice(0, 24)}-${index}`} className="max-w-[242px] rounded-lg p-4 md:max-w-none">
                        <div className="mb-3 flex h-[19.5px] items-center space-x-2">
                          <span className="text-[13px] font-normal leading-[19.5px] tabular-nums text-slate-500/70">{index === 0 ? "00:00" : ""}</span>
                        </div>
                        <div className="rounded-lg border-2 border-transparent bg-white p-2 transition hover:border-violet sm:p-3">
                          <p className="text-sm leading-[22.75px] text-ink">{paragraph}</p>
                        </div>
                        {selectedTranslationSegments[index]?.text ? (
                          <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              <Languages size={12} />
                              <span>{translationCopy.translationResult}</span>
                            </div>
                            <p className="text-sm leading-[22.75px] text-slate-700">{selectedTranslationSegments[index].text}</p>
                          </div>
                        ) : null}
                      </article>
                    ))}
                    <textarea value={draftText} onChange={(event) => setDraftText(event.target.value)} className="sr-only" aria-label={detailCopy.editableTranscriptField} />
                  </div>
                )}
                {!isMember ? <UpgradeYourPlanCard locale={locale} onUpgrade={() => setPlansOpen(true)} /> : null}
              </div>
            ) : (
              <div className="mx-4 mt-8 flex min-h-[360px] flex-col items-center justify-center rounded-lg bg-paper/55 px-6 py-10 sm:mx-6">
                <PreprocessingStatusCard status={task.status} progress={task.progress} locale={locale} />
              </div>
            )}
            </div>
            {task ? (
              <div className="flex h-[212px] flex-none flex-col border-t border-ink/10 bg-white xl:h-auto xl:block">
                {task.transcript ? <DetailUpgradeCard locale={locale} onUpgrade={() => setPlansOpen(true)} /> : null}
                <MediaPlayer endpoint={`/api/tasks/${task.id}/original-file`} initialMedia={initialMedia} durationSeconds={task.durationSeconds} seekSignal={seekSignal} label={title} chrome="bar" />
              </div>
            ) : null}
          </section>

          <aside id="insights" className="min-h-0 flex-none overflow-y-auto px-6 py-0 xl:w-[486px] xl:border-l xl:border-ink/10">
            <div role="tablist" className="inline-flex h-14 items-center gap-8 py-1">
              <button type="button" role="tab" aria-selected={insightTab === "summary"} data-state={insightTab === "summary" ? "active" : "inactive"} onClick={() => setInsightTab("summary")} className={`relative inline-flex h-9 items-center justify-center py-1.5 text-base transition after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:rounded-full ${insightTab === "summary" ? "font-semibold text-ink after:bg-violet" : "font-medium text-ink/70 after:bg-transparent hover:text-ink"}`}>
                {t("summary")}
              </button>
              <button type="button" role="tab" aria-selected={insightTab === "mind_map"} data-state={insightTab === "mind_map" ? "active" : "inactive"} onClick={() => setInsightTab("mind_map")} className={`relative inline-flex h-9 items-center justify-center py-1.5 text-base transition after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:rounded-full ${insightTab === "mind_map" ? "font-semibold text-ink after:bg-violet" : "font-medium text-ink/70 after:bg-transparent hover:text-ink"}`}>
                {t("mindMap")}
              </button>
            </div>

            {insightTab === "summary" ? (
              <div className="mt-2 flex h-10 items-center justify-between gap-3">
                <SummaryTemplateSelect
                  locale={locale}
                  value={summaryTemplate}
                  onSelect={selectSummaryTemplate}
                  isMember={isMember}
                  disabled={!task?.transcript || busy}
                  open={templateSelectOpen}
                  onOpenChange={setTemplateSelectOpen}
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => generateSingleInsight("summary")} disabled={!task?.transcript || busy || generatingSummary || summaryTemplate === "none" || !summary} className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[12px] text-slate-500 transition hover:bg-slate-100 hover:text-violet disabled:opacity-40" aria-label={detailCopy.regenerateAiSummary} title={detailCopy.regenerateAiSummary}>
                    {busy || generatingSummary ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                  </button>
                  <button type="button" onClick={() => navigator.clipboard.writeText(formatSummaryForCopy(summary))} disabled={!summary} className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[12px] text-slate-500 transition hover:bg-slate-100 hover:text-violet disabled:opacity-40" aria-label={detailCopy.copyInsight}>
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            ) : null}

            {insightTab === "summary" ? (
              <section className="mt-5 text-[14px] leading-[22.75px] text-[rgba(2,8,23,0.8)]">
                {generatingSummary ? (
                  <SummaryLoadingState locale={locale} />
                ) : summary ? (
                  <SummaryContent summary={summary} locale={locale} onSeek={seekToSegment} />
                ) : (
                  <SummaryEmptyState
                    locale={locale}
                    onGenerateGeneral={generateGeneralSummary}
                    onChooseTemplate={() => setTemplateSelectOpen(true)}
                    disabled={busy || generatingSummary || !task?.transcript}
                  />
                )}
              </section>
            ) : (
              <section className="mt-4" role="tabpanel">
                <div className="mb-2 flex h-5 items-center justify-between">
                  <h2 className="text-sm font-semibold leading-5 text-ink/90">{t("mindMap")}</h2>
                </div>
                {mindMap ? (
                  <DetailMindMap
                    node={mindMap}
                    taskId={task?.id}
                    title={title}
                    locale={locale}
                    busy={busy}
                    isMember={isMember}
                    onRegenerate={generateMindMap}
                    onRequirePremium={() => setMindMapPremiumOpen(true)}
                    onError={setError}
                  />
                ) : generatingMindMap ? (
                  <MindMapLoadingState locale={locale} />
                ) : (
                  <MindMapEmptyState locale={locale} onGenerate={generateMindMap} disabled={busy || !task?.transcript} />
                )}
              </section>
            )}

          </aside>
      </section>
      </div>

      {transcriptSearchOpen && task?.transcript ? (
        <div className="fixed right-0 top-2 z-[80] w-[300px] max-w-[calc(100vw-8px)] overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-xl">
          <div className="grid h-12 grid-cols-[1fr_1fr_44px] border-b border-slate-200">
            <button type="button" onMouseDown={(event) => { event.stopPropagation(); setTranscriptSearchTab("search"); }} onClick={() => setTranscriptSearchTab("search")} className={`text-xs font-semibold transition ${transcriptSearchTab === "search" ? "border-b-2 border-violet bg-violet/10 text-violet" : "text-slate-500 hover:bg-slate-50 hover:text-ink"}`}>
              {detailCopy.search}
            </button>
            <button type="button" onMouseDown={(event) => { event.stopPropagation(); setTranscriptSearchTab("replace"); }} onClick={() => setTranscriptSearchTab("replace")} className={`text-xs font-semibold transition ${transcriptSearchTab === "replace" ? "border-b-2 border-violet bg-violet/10 text-violet" : "text-slate-500 hover:bg-slate-50 hover:text-ink"}`}>
              {detailCopy.replace}
            </button>
            <button type="button" onClick={() => setTranscriptSearchOpen(false)} className="inline-flex items-center justify-center text-slate-400 transition hover:bg-slate-50 hover:text-ink" aria-label={detailCopy.closeSearchReplace}>
              <X size={16} />
            </button>
          </div>
          <div className="grid gap-3 p-3.5">
            <label className="grid gap-1.5">
              <span className="text-sm font-semibold leading-5 text-ink">{detailCopy.search}</span>
              <input value={transcriptSearch} onChange={(event) => setTranscriptSearch(event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-ink outline-none transition placeholder:text-slate-400 focus:border-violet focus:ring-2 focus:ring-violet/15" placeholder={detailCopy.searchTermPlaceholder} autoFocus />
            </label>
            {transcriptSearch ? (
              <p className="text-[11px] font-medium leading-4 text-slate-500">{detailCopy.matchCount(transcriptTextMatchCount)}</p>
            ) : null}
            {transcriptSearchTab === "replace" ? (
              <>
                <label className="grid gap-1.5">
                  <span className="text-sm font-semibold leading-5 text-ink">{detailCopy.replace}</span>
                  <input value={transcriptReplacement} onChange={(event) => setTranscriptReplacement(event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-ink outline-none transition placeholder:text-slate-400 focus:border-violet focus:ring-2 focus:ring-violet/15" placeholder={detailCopy.replacementPlaceholder} />
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button type="button" onClick={() => replaceTranscriptMatch(true)} disabled={!transcriptSearch.trim() || !transcriptTextMatchCount} className="focus-ring h-10 rounded-md bg-violet/55 px-3 text-sm font-semibold text-white transition hover:bg-violet disabled:cursor-not-allowed disabled:opacity-50">
                    {detailCopy.replaceAll}
                  </button>
                  <button type="button" onClick={() => replaceTranscriptMatch(false)} disabled={!transcriptSearch.trim() || !transcriptTextMatchCount} className="focus-ring h-10 rounded-md bg-violet/55 px-3 text-sm font-semibold text-white transition hover:bg-violet disabled:cursor-not-allowed disabled:opacity-50">
                    {detailCopy.replace}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {summaryLimitOpen ? (
        <SummaryLimitDialog
          locale={locale}
          onClose={() => setSummaryLimitOpen(false)}
          onShowPlans={() => {
            setSummaryLimitOpen(false);
            setPlansOpen(true);
          }}
        />
      ) : null}

      {mindMapPremiumOpen ? (
        <MindMapPremiumDialog
          locale={locale}
          onClose={() => setMindMapPremiumOpen(false)}
          onShowPlans={() => {
            setMindMapPremiumOpen(false);
            setPlansOpen(true);
          }}
        />
      ) : null}

      {plansOpen ? <DashboardPricingOverlay locale={locale} initialMode="annual" onClose={() => setPlansOpen(false)} /> : null}

      {exportOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-6">
          <section className="relative h-[512px] w-full max-w-[500px] rounded-lg border border-slate-200 bg-white p-0 text-ink shadow-none" role="dialog" aria-modal="true" aria-labelledby="detail-export-title">
            <div className="flex items-start justify-between gap-4">
              <div className="px-6 pt-6">
                <h2 id="detail-export-title" className="text-lg font-semibold leading-7 text-ink">{copy.exportOptions}</h2>
                <p className="mt-1 text-sm leading-6 text-ink/60">{copy.exportDescription}</p>
              </div>
              <button type="button" onClick={() => setExportOpen(false)} className="absolute right-4 top-4 grid h-4 w-4 place-items-center rounded text-ink transition hover:text-slate-500" aria-label={copy.close}>
                <X size={16} />
              </button>
            </div>

            <div className="px-6 pt-7">
              <p className="text-base font-semibold leading-6 text-ink">{copy.fileFormat}</p>
              <div className="mt-2.5 grid grid-cols-2 gap-x-2.5 gap-y-2.5">
                {[
                  ["txt", "TXT (.txt)"],
                  ["docx", "DOCX (.docx)"],
                  ["pdf", "PDF (.pdf)"],
                  ["csv", "CSV (.csv)"],
                  ["srt", "SRT (.srt)"],
                  ["vtt", "VTT (.vtt)"]
                ].map(([format, label]) => (
                  <label key={format} className="flex h-[52px] w-[220px] cursor-pointer items-center gap-3 text-base font-normal leading-6 text-ink transition hover:text-primary">
                    <input
                      type="radio"
                      name="export-format"
                      value={format}
                      checked={exportFormat === format}
                      onChange={() => setExportFormat(format as (typeof exportFormats)[number])}
                      className="sr-only"
                    />
                    <span className={clsx("grid h-4 w-4 shrink-0 place-items-center rounded-full border", exportFormat === format ? "border-primary" : "border-slate-300")}>
                      {exportFormat === format ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                    </span>
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="px-6 pt-6">
              <p className="text-base font-semibold leading-6 text-ink">{copy.exportOptions}</p>
              <div className="mt-3 flex items-center gap-8">
                <label className="flex h-5 cursor-pointer items-center gap-2 text-base font-normal leading-6 text-ink">
                  <CompactCheckbox checked={showExportSpeaker} onChange={setShowExportSpeaker} label={copy.showSpeakerNames} />
                  {copy.showSpeakerNames}
                </label>
                <label className="flex h-5 cursor-pointer items-center gap-2 text-base font-normal leading-6 text-ink">
                  <CompactCheckbox checked={showExportTimestamp} onChange={setShowExportTimestamp} label={copy.showTimestamps} />
                  {copy.showTimestamps}
                </label>
              </div>
            </div>

            <div className="flex justify-center px-6 pb-6 pt-7">
              <button type="button" onClick={runExport} disabled={!task?.transcript} className="btn-primary h-12 w-[220px] !rounded-[12px] justify-center text-base font-bold leading-6 disabled:opacity-45">
                {copy.exportAction}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {shareOpen && task ? (
        <ShareTranscriptionDialog
          activeShare={task.shareLinks?.[0] ?? null}
          busy={busy}
          canShare={Boolean(task.transcript)}
          copy={copy}
          shareUrl={shareUrl}
          onClose={() => setShareOpen(false)}
          onCopy={() => {
            const publicUrl = shareUrl ?? task.shareLinks?.[0]?.url;
            if (publicUrl) navigator.clipboard.writeText(publicUrl).catch(() => undefined);
          }}
          onDisable={disableShareLink}
          onEnable={createShareLink}
        />
      ) : null}

      {renameOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-6">
          <section className="relative w-full max-w-[425px] rounded-lg border border-slate-200 bg-white p-0 shadow-none" role="dialog" aria-modal="true" aria-labelledby="detail-rename-title">
            <button type="button" onClick={() => setRenameOpen(false)} className="absolute right-4 top-4 grid h-4 w-4 place-items-center rounded text-ink transition hover:text-slate-500" aria-label={copy.close}>
              <X size={16} />
            </button>
            <div className="flex flex-col px-6 pb-4 pt-6 text-center sm:text-left">
              <h2 id="detail-rename-title" className="text-xl font-semibold leading-7 text-ink">{copy.renameFile}</h2>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                renameTask();
              }}
            >
              <div className="grid gap-4 px-6 pb-6 pt-4">
                <input
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  className="flex h-10 w-full rounded-md border border-violet bg-white px-3 py-2 text-sm font-normal leading-5 text-ink outline-none transition placeholder:text-slate-500 focus-visible:border-violet focus-visible:ring-[3px] focus-visible:ring-violet/10"
                  placeholder={copy.enterNewFilename}
                  autoFocus
                />
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setRenameOpen(false)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium leading-5 text-ink transition hover:bg-slate-50">{copy.cancel}</button>
                  <button type="submit" disabled={busy || !canRename} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-violet px-4 py-2 text-sm font-medium leading-5 text-white transition hover:bg-violetDark disabled:pointer-events-none disabled:opacity-50">
                    {busy ? <Loader2 className="animate-spin" size={16} /> : null}
                    {copy.rename}
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {moveOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <section className="relative w-full max-w-[448px] rounded-lg border border-slate-200 bg-white p-6 shadow-none" role="dialog" aria-modal="true" aria-labelledby="detail-move-title">
            <h2 id="detail-move-title" className="pr-8 text-xl font-semibold leading-7 text-ink">{copy.moveToFolder}</h2>
            <button type="button" onClick={() => setMoveOpen(false)} className="absolute right-4 top-4 grid h-4 w-4 place-items-center rounded text-ink transition hover:text-slate-500" aria-label={copy.close}>
                <X size={16} />
            </button>
            <p className="mt-5 text-sm leading-6 text-slate-500">
              {copy.movingFileFrom(title, selectedFolderName)}
            </p>
            <div className="mt-5 grid gap-2">
              {moveChoices.length ? (
                moveChoices.map((folder) => {
                  const value = folder.id ?? null;
                  return (
                    <button
                      key={folder.id ?? "uncategorized"}
                      type="button"
                      onClick={() => setMoveFolderId(value)}
                      className={clsx("h-[38px] rounded-md border px-3 text-left text-sm font-normal transition", moveFolderId === value ? "border-violet bg-violet/8 text-violet" : "border-slate-200 text-ink hover:bg-slate-50")}
                    >
                      {folder.name}
                    </button>
                  );
                })
              ) : (
                <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-500">{copy.noFoldersAvailable}</p>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setMoveOpen(false)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium leading-5 text-ink transition hover:bg-slate-50">{copy.cancel}</button>
              <button type="button" onClick={moveTask} disabled={busy || !task || moveFolderId === undefined} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-violet px-4 py-2 text-sm font-medium leading-5 text-white transition hover:bg-violetDark disabled:pointer-events-none disabled:opacity-50">
                {busy ? <Loader2 className="animate-spin" size={16} /> : <FolderOpen size={16} />}
                {copy.move}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {deleteOpen ? (
        <DeleteTranscriptionConfirmDialog
          busy={busy}
          copy={copy}
          title={title}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={() => {
            setDeleteOpen(false);
            deleteTask();
          }}
        />
      ) : null}
    </main>
  );
}

type TranslationLanguageOption = {
  locale: Locale;
  label: string;
  english: string;
  native: string;
};

const translationLanguageOptions: TranslationLanguageOption[] = locales.map((item) => ({
  locale: item,
  label: languageChoiceLabel(item),
  english: localeEnglishNames[item],
  native: localeNativeNames[item]
}));

const popularTranslationLocales: Locale[] = ["en", "ru", "id", "es", "ar", "th", "it", "pt", "zh"];

type TranslationDisplaySegment = {
  text: string;
  start?: number;
  end?: number;
  speaker?: string;
};

function translationSegmentsFromContent(content: unknown): TranslationDisplaySegment[] {
  if (!content || typeof content !== "object") return [];
  const record = content as Record<string, unknown>;
  if (Array.isArray(record.segments)) {
    return record.segments
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const segment = item as Record<string, unknown>;
        const text = typeof segment.text === "string" ? segment.text.trim() : "";
        if (!text) return null;
        return {
          text,
          start: typeof segment.start === "number" ? segment.start : undefined,
          end: typeof segment.end === "number" ? segment.end : undefined,
          speaker: typeof segment.speaker === "string" && segment.speaker.trim() ? segment.speaker.trim() : undefined
        };
      })
      .filter(Boolean) as TranslationDisplaySegment[];
  }

  const text = typeof record.text === "string" ? record.text : typeof record.translation === "string" ? record.translation : "";
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({text: paragraph}));
}

type TranslationSettingsCopy = {
  openTranslationSettings: string;
  translationSettings: string;
  selectTargetLanguage: string;
  searchLanguagePlaceholder: string;
  popularLanguages: string;
  allLanguages: string;
  generateTranslation: string;
  generatingTranslation: string;
  regenerateTranslation: string;
  translationGenerated: string;
  translationFailed: string;
  translationResult: string;
  close: string;
  noLanguageResults: string;
};

function TranslationSettingsCard({
  refObject,
  copy,
  target,
  search,
  options,
  popularOptions,
  hasTranslation,
  generating,
  disabled,
  onSearchChange,
  onTargetChange,
  onGenerate,
  onClose
}: {
  refObject: RefObject<HTMLDivElement>;
  copy: TranslationSettingsCopy;
  target: Locale;
  search: string;
  options: TranslationLanguageOption[];
  popularOptions: TranslationLanguageOption[];
  hasTranslation: boolean;
  generating: boolean;
  disabled: boolean;
  onSearchChange: (value: string) => void;
  onTargetChange: (value: Locale) => void;
  onGenerate: () => void | Promise<void>;
  onClose: () => void;
}) {
  const [listOpen, setListOpen] = useState(true);
  const selectedLabel = languageChoiceLabel(target);

  const renderLanguageButton = (option: TranslationLanguageOption) => {
    const selected = option.locale === target;
    return (
      <button
        key={option.locale}
        type="button"
        role="option"
        aria-selected={selected}
        onClick={() => {
          onTargetChange(option.locale);
          onSearchChange("");
        }}
        className={clsx(
          "flex min-h-8 w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-medium leading-4 transition",
          selected ? "bg-violet text-white" : "bg-white text-ink hover:bg-slate-100"
        )}
      >
        <span className="min-w-0 flex-1 truncate">{option.label}</span>
        {selected ? <Check size={13} className="ml-2 flex-none" /> : null}
      </button>
    );
  };

  return (
    <div ref={refObject} className="absolute right-0 top-10 z-[70] w-[320px] max-w-[calc(100vw-24px)] rounded-lg border border-slate-200 bg-white p-3 text-left text-ink shadow-xl">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold leading-5 text-ink">{copy.translationSettings}</h3>
        <button type="button" onClick={onClose} className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-ink" aria-label={copy.close}>
          <X size={13} />
        </button>
      </div>

      <label className="mt-3 grid gap-1.5">
        <span className="text-xs font-semibold leading-4 text-slate-600">{copy.selectTargetLanguage}</span>
        <button
          type="button"
          onClick={() => setListOpen((value) => !value)}
          className="flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-2.5 text-left text-xs font-semibold text-ink transition hover:border-slate-300"
          aria-expanded={listOpen}
        >
          <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
          <ChevronDown className={clsx("h-3.5 w-3.5 flex-none text-slate-400 transition-transform", listOpen && "rotate-180")} />
        </button>
      </label>

      {listOpen ? (
        <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                className="h-8 w-full rounded-md border border-violet bg-white pl-8 pr-2.5 text-xs font-medium text-ink outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-violet"
                placeholder={copy.searchLanguagePlaceholder}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[220px] overflow-y-auto p-1.5" role="listbox">
            {popularOptions.length ? (
              <div>
                <p className="px-2.5 pb-1 pt-0.5 text-[11px] font-semibold leading-4 text-slate-500">{copy.popularLanguages}</p>
                <div className="grid gap-0.5">{popularOptions.map(renderLanguageButton)}</div>
              </div>
            ) : null}
            <div className={popularOptions.length ? "mt-1.5 border-t border-slate-200 pt-1.5" : ""}>
              <p className="px-2.5 pb-1 pt-0.5 text-[11px] font-semibold leading-4 text-slate-500">{copy.allLanguages}</p>
              {options.length ? <div className="grid gap-0.5">{options.map(renderLanguageButton)}</div> : <p className="px-2.5 py-2 text-xs font-medium text-slate-500">{copy.noLanguageResults}</p>}
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onGenerate}
        disabled={disabled || generating}
        className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-violet px-3 text-xs font-semibold text-white transition hover:bg-violetDark disabled:pointer-events-none disabled:opacity-50"
      >
        {generating ? <Loader2 className="animate-spin" size={14} /> : <Languages size={14} />}
        {generating ? copy.generatingTranslation : hasTranslation ? copy.regenerateTranslation : copy.generateTranslation}
      </button>
    </div>
  );
}

function SummaryTemplateSelect({
  locale,
  value,
  onSelect,
  isMember,
  disabled,
  open: controlledOpen,
  onOpenChange
}: {
  locale: string;
  value: SummaryTemplateInput;
  onSelect: (value: SummaryTemplateInput) => void;
  isMember: boolean;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const templateCopy = summaryTemplateUiFor(locale);
  const selectedLabel = summaryTemplateLabel(locale, value);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-60">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        aria-label={templateCopy.summaryTemplate}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-9 w-full items-center justify-between rounded-[12px] bg-slate-100/55 px-3 py-2 text-left text-[13px] font-medium leading-[19.5px] text-[rgba(2,8,23,0.85)] shadow-none transition hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-45"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={clsx("h-4 w-4 shrink-0 text-ink/55 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div role="menu" className="absolute left-0 top-full z-50 mt-1 w-[260px] rounded-[16px] border border-slate-200 bg-white p-2 text-ink shadow-lg">
          <p className="px-2.5 pb-1.5 pt-1 text-xs font-medium leading-4 text-slate-500">{templateCopy.selectTemplate}</p>
          {summaryTemplateChoices.map((choice) => {
            const isSelected = choice.value === value;
            const locked = choice.pro && !isMember;
            return (
              <button
                key={choice.value}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  onSelect(choice.value);
                  if (!locked) setOpen(false);
                }}
                className={clsx(
                  "flex h-9 w-full items-center justify-between rounded-[12px] px-2.5 py-1.5 text-left text-sm font-medium leading-5 text-ink outline-none transition hover:bg-slate-100",
                  isSelected && "bg-violet/10 text-violet"
                )}
              >
                <span className="min-w-0 flex-1 truncate pr-1">{summaryTemplateLabel(locale, choice.value)}</span>
                <span className="ml-2 flex shrink-0 items-center gap-1.5">
                  {choice.pro ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-violet/10 px-1.5 py-0.5 text-[10px] font-semibold leading-3 text-violet">
                      {locked ? <Lock size={10} /> : null}
                      {templateCopy.pro}
                    </span>
                  ) : null}
                  {isSelected ? <Check className="h-4 w-4 text-violet" /> : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

type PreprocessingStatusKey = "UPLOADING" | "QUEUED" | "TRANSCRIBING" | "ANALYZING" | "FAILED" | "CANCELED" | "PROCESSING";

type TranscriptionControlCopy = {
  searchTranscript: string;
  replaceTranscriptText: string;
  copyTranscript: string;
  saveTranscript: string;
  speakerRecognitionDetails: string;
  speakerOptions: string;
  speakerRecognitionEnabled: string;
  speakerRecognitionDisabled: string;
  details: string;
  displayMode: string;
  showSpeakerLabels: string;
  displayNamesNextToText: string;
  filterSpeakers: string;
  selectAll: string;
  unselectAll: string;
  savingRating: string;
  rateTranscriptQuality: string;
  rateLabel: (value: number) => string;
  playFrom: (time: string) => string;
  copySegment: string;
  editSegment: string;
  editSegmentAt: (time: string) => string;
  editableTranscriptField: string;
  noSegmentSearchResults: string;
  search: string;
  replace: string;
  closeSearchReplace: string;
  searchTermPlaceholder: string;
  replacementPlaceholder: string;
  matchCount: (count: number) => string;
  replaceAll: string;
  replaceNotice: (count: number, replaceAll: boolean) => string;
  noMatchNotice: string;
  regenerateAiSummary: string;
  copyInsight: string;
  timestampedSegments: (count: number) => string;
};

const transcriptionControlCopy: Record<Locale, TranscriptionControlCopy> = {
  ar: {
    searchTranscript: "البحث في التفريغ",
    replaceTranscriptText: "استبدال نص التفريغ",
    copyTranscript: "نسخ التفريغ",
    saveTranscript: "حفظ التفريغ",
    speakerRecognitionDetails: "تفاصيل التعرف على المتحدثين",
    speakerOptions: "خيارات المتحدثين",
    speakerRecognitionEnabled: "تم تفعيل التعرف على المتحدثين لهذا التفريغ.",
    speakerRecognitionDisabled: "لم يكن التعرف على المتحدثين مفعلاً عند إنشاء هذا التفريغ.",
    details: "التفاصيل",
    displayMode: "وضع العرض",
    showSpeakerLabels: "إظهار تسميات المتحدثين",
    displayNamesNextToText: "عرض الأسماء بجانب النص",
    filterSpeakers: "تصفية المتحدثين",
    selectAll: "تحديد الكل",
    unselectAll: "إلغاء تحديد الكل",
    savingRating: "جار حفظ التقييم...",
    rateTranscriptQuality: "قيّم جودة التفريغ:",
    rateLabel: (value) => `تقييم ${value}`,
    playFrom: (time) => `تشغيل من ${time}`,
    copySegment: "نسخ المقطع",
    editSegment: "تحرير المقطع",
    editSegmentAt: (time) => `تحرير المقطع عند ${time}`,
    editableTranscriptField: "حقل التفريغ القابل للتحرير",
    noSegmentSearchResults: "لا توجد مقاطع تطابق هذا البحث.",
    search: "بحث",
    replace: "استبدال",
    closeSearchReplace: "إغلاق البحث والاستبدال",
    searchTermPlaceholder: "أدخل عبارة البحث",
    replacementPlaceholder: "أدخل نص الاستبدال",
    matchCount: (count) => `${count} نتيجة نصية في التفريغ`,
    replaceAll: "استبدال الكل",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "تم استبدال" : "تم استبدال أول"} ${count} نتيجة. استخدم الحفظ لتثبيت التغييرات.`,
    noMatchNotice: "لم يتم العثور على نص مطابق في التفريغ.",
    regenerateAiSummary: "إعادة إنشاء ملخص AI",
    copyInsight: "نسخ الرؤية",
    timestampedSegments: (count) => `${count} مقطعاً بطابع زمني`
  },
  de: {
    searchTranscript: "Transkript durchsuchen",
    replaceTranscriptText: "Transkripttext ersetzen",
    copyTranscript: "Transkript kopieren",
    saveTranscript: "Transkript speichern",
    speakerRecognitionDetails: "Details zur Sprechererkennung",
    speakerOptions: "Sprecheroptionen",
    speakerRecognitionEnabled: "Sprechererkennung ist fur dieses Transkript aktiviert.",
    speakerRecognitionDisabled: "Sprechererkennung war bei der Erstellung dieses Transkripts nicht aktiviert.",
    details: "Details",
    displayMode: "Anzeigemodus",
    showSpeakerLabels: "Sprecherlabels anzeigen",
    displayNamesNextToText: "Namen neben dem Text anzeigen",
    filterSpeakers: "Sprecher filtern",
    selectAll: "Alle auswahlen",
    unselectAll: "Alle abwahlen",
    savingRating: "Bewertung wird gespeichert...",
    rateTranscriptQuality: "Transkriptqualitat bewerten:",
    rateLabel: (value) => `Bewertung ${value}`,
    playFrom: (time) => `Ab ${time} abspielen`,
    copySegment: "Segment kopieren",
    editSegment: "Segment bearbeiten",
    editSegmentAt: (time) => `Segment bei ${time} bearbeiten`,
    editableTranscriptField: "Bearbeitbares Transkriptfeld",
    noSegmentSearchResults: "Keine Transkriptsegmente passen zu dieser Suche.",
    search: "Suchen",
    replace: "Ersetzen",
    closeSearchReplace: "Suchen und Ersetzen schliessen",
    searchTermPlaceholder: "Suchbegriff eingeben",
    replacementPlaceholder: "Ersatztext eingeben",
    matchCount: (count) => `${count} Treffer im Transkript`,
    replaceAll: "Alle ersetzen",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "Ersetzt" : "Ersten Treffer ersetzt"}: ${count}. Speichere, um die Anderungen zu sichern.`,
    noMatchNotice: "Kein passender Transkripttext gefunden.",
    regenerateAiSummary: "AI-Zusammenfassung erneut erstellen",
    copyInsight: "Insight kopieren",
    timestampedSegments: (count) => `${count} Segmente mit Zeitstempel`
  },
  en: {
    searchTranscript: "Search transcript",
    replaceTranscriptText: "Replace transcript text",
    copyTranscript: "Copy transcript",
    saveTranscript: "Save transcript",
    speakerRecognitionDetails: "Speaker recognition details",
    speakerOptions: "Speaker options",
    speakerRecognitionEnabled: "Speaker recognition is enabled for this transcript.",
    speakerRecognitionDisabled: "Speaker recognition wasn't enabled when this transcript was created.",
    details: "Details",
    displayMode: "Display mode",
    showSpeakerLabels: "Show speaker labels",
    displayNamesNextToText: "Display names next to text",
    filterSpeakers: "Filter speakers",
    selectAll: "Select all",
    unselectAll: "Unselect all",
    savingRating: "Saving rating...",
    rateTranscriptQuality: "Rate transcript quality:",
    rateLabel: (value) => `Rate ${value}`,
    playFrom: (time) => `Play from ${time}`,
    copySegment: "Copy segment",
    editSegment: "Edit segment",
    editSegmentAt: (time) => `Edit segment at ${time}`,
    editableTranscriptField: "Editable transcript backing field",
    noSegmentSearchResults: "No transcript segments match this search.",
    search: "Search",
    replace: "Replace",
    closeSearchReplace: "Close search and replace",
    searchTermPlaceholder: "Enter search term",
    replacementPlaceholder: "Enter replacement text",
    matchCount: (count) => `${count} text match${count === 1 ? "" : "es"} in transcript`,
    replaceAll: "Replace all",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "Replaced" : "Replaced first"} ${count} match${count === 1 ? "" : "es"}. Use Save to persist changes.`,
    noMatchNotice: "No matching transcript text found.",
    regenerateAiSummary: "Regenerate AI summary",
    copyInsight: "Copy insight",
    timestampedSegments: (count) => `${count} timestamped segments`
  },
  es: {
    searchTranscript: "Buscar en la transcripcion",
    replaceTranscriptText: "Reemplazar texto de la transcripcion",
    copyTranscript: "Copiar transcripcion",
    saveTranscript: "Guardar transcripcion",
    speakerRecognitionDetails: "Detalles de reconocimiento de hablantes",
    speakerOptions: "Opciones de hablantes",
    speakerRecognitionEnabled: "El reconocimiento de hablantes esta activado para esta transcripcion.",
    speakerRecognitionDisabled: "El reconocimiento de hablantes no estaba activado cuando se creo esta transcripcion.",
    details: "Detalles",
    displayMode: "Modo de visualizacion",
    showSpeakerLabels: "Mostrar etiquetas de hablantes",
    displayNamesNextToText: "Mostrar nombres junto al texto",
    filterSpeakers: "Filtrar hablantes",
    selectAll: "Seleccionar todo",
    unselectAll: "Deseleccionar todo",
    savingRating: "Guardando valoracion...",
    rateTranscriptQuality: "Valora la calidad de la transcripcion:",
    rateLabel: (value) => `Valorar ${value}`,
    playFrom: (time) => `Reproducir desde ${time}`,
    copySegment: "Copiar segmento",
    editSegment: "Editar segmento",
    editSegmentAt: (time) => `Editar segmento en ${time}`,
    editableTranscriptField: "Campo editable de transcripcion",
    noSegmentSearchResults: "Ningun segmento coincide con esta busqueda.",
    search: "Buscar",
    replace: "Reemplazar",
    closeSearchReplace: "Cerrar buscar y reemplazar",
    searchTermPlaceholder: "Introduce el termino de busqueda",
    replacementPlaceholder: "Introduce el texto de reemplazo",
    matchCount: (count) => `${count} coincidencias en la transcripcion`,
    replaceAll: "Reemplazar todo",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "Reemplazadas" : "Primera coincidencia reemplazada"}: ${count}. Usa Guardar para conservar los cambios.`,
    noMatchNotice: "No se encontro texto coincidente en la transcripcion.",
    regenerateAiSummary: "Regenerar resumen AI",
    copyInsight: "Copiar insight",
    timestampedSegments: (count) => `${count} segmentos con marca de tiempo`
  },
  fr: {
    searchTranscript: "Rechercher dans la transcription",
    replaceTranscriptText: "Remplacer le texte de la transcription",
    copyTranscript: "Copier la transcription",
    saveTranscript: "Enregistrer la transcription",
    speakerRecognitionDetails: "Details de reconnaissance des intervenants",
    speakerOptions: "Options des intervenants",
    speakerRecognitionEnabled: "La reconnaissance des intervenants est activee pour cette transcription.",
    speakerRecognitionDisabled: "La reconnaissance des intervenants n'etait pas activee lors de la creation de cette transcription.",
    details: "Details",
    displayMode: "Mode d'affichage",
    showSpeakerLabels: "Afficher les libelles des intervenants",
    displayNamesNextToText: "Afficher les noms a cote du texte",
    filterSpeakers: "Filtrer les intervenants",
    selectAll: "Tout selectionner",
    unselectAll: "Tout deselectionner",
    savingRating: "Enregistrement de la note...",
    rateTranscriptQuality: "Noter la qualite de la transcription :",
    rateLabel: (value) => `Noter ${value}`,
    playFrom: (time) => `Lire depuis ${time}`,
    copySegment: "Copier le segment",
    editSegment: "Modifier le segment",
    editSegmentAt: (time) => `Modifier le segment a ${time}`,
    editableTranscriptField: "Champ de transcription modifiable",
    noSegmentSearchResults: "Aucun segment ne correspond a cette recherche.",
    search: "Rechercher",
    replace: "Remplacer",
    closeSearchReplace: "Fermer recherche et remplacement",
    searchTermPlaceholder: "Saisir le terme de recherche",
    replacementPlaceholder: "Saisir le texte de remplacement",
    matchCount: (count) => `${count} correspondance(s) dans la transcription`,
    replaceAll: "Tout remplacer",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "Remplacement effectue" : "Premiere correspondance remplacee"} : ${count}. Enregistrez pour conserver les modifications.`,
    noMatchNotice: "Aucun texte correspondant trouve dans la transcription.",
    regenerateAiSummary: "Regenerer le resume AI",
    copyInsight: "Copier l'insight",
    timestampedSegments: (count) => `${count} segments horodates`
  },
  hu: {
    searchTranscript: "Kereses az atiratban",
    replaceTranscriptText: "Atiratszoveg csereje",
    copyTranscript: "Atirat masolasa",
    saveTranscript: "Atirat mentese",
    speakerRecognitionDetails: "Beszelofelismeres reszletei",
    speakerOptions: "Beszelo beallitasok",
    speakerRecognitionEnabled: "A beszelofelismeres engedelyezve van ehhez az atirathoz.",
    speakerRecognitionDisabled: "A beszelofelismeres nem volt engedelyezve az atirat letrehozasakor.",
    details: "Reszletek",
    displayMode: "Megjelenitesi mod",
    showSpeakerLabels: "Beszelocimkek mutatasa",
    displayNamesNextToText: "Nevek megjelenitese a szoveg mellett",
    filterSpeakers: "Beszelok szurese",
    selectAll: "Osszes kijelolese",
    unselectAll: "Osszes kijeloles torlese",
    savingRating: "Ertekeles mentese...",
    rateTranscriptQuality: "Atirat minosegenek ertekelese:",
    rateLabel: (value) => `Ertekeles ${value}`,
    playFrom: (time) => `Lejatszas innen: ${time}`,
    copySegment: "Szakasz masolasa",
    editSegment: "Szakasz szerkesztese",
    editSegmentAt: (time) => `Szakasz szerkesztese itt: ${time}`,
    editableTranscriptField: "Szerkesztheto atirat mezo",
    noSegmentSearchResults: "Nincs a keresesnek megfelelo atiratszakasz.",
    search: "Kereses",
    replace: "Csere",
    closeSearchReplace: "Kereses es csere bezarasa",
    searchTermPlaceholder: "Keresokifejezes megadasa",
    replacementPlaceholder: "Csereszoveg megadasa",
    matchCount: (count) => `${count} talalat az atiratban`,
    replaceAll: "Osszes csereje",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "Cserelve" : "Elso talalat cserelve"}: ${count}. A modositasokhoz mentsd el.`,
    noMatchNotice: "Nem talalhato egyezo atiratszoveg.",
    regenerateAiSummary: "AI osszefoglalo ujrageneralasa",
    copyInsight: "Insight masolasa",
    timestampedSegments: (count) => `${count} idobelyeges szakasz`
  },
  id: {
    searchTranscript: "Cari transkrip",
    replaceTranscriptText: "Ganti teks transkrip",
    copyTranscript: "Salin transkrip",
    saveTranscript: "Simpan transkrip",
    speakerRecognitionDetails: "Detail pengenalan pembicara",
    speakerOptions: "Opsi pembicara",
    speakerRecognitionEnabled: "Pengenalan pembicara aktif untuk transkrip ini.",
    speakerRecognitionDisabled: "Pengenalan pembicara belum aktif saat transkrip ini dibuat.",
    details: "Detail",
    displayMode: "Mode tampilan",
    showSpeakerLabels: "Tampilkan label pembicara",
    displayNamesNextToText: "Tampilkan nama di samping teks",
    filterSpeakers: "Filter pembicara",
    selectAll: "Pilih semua",
    unselectAll: "Batalkan semua",
    savingRating: "Menyimpan rating...",
    rateTranscriptQuality: "Nilai kualitas transkrip:",
    rateLabel: (value) => `Nilai ${value}`,
    playFrom: (time) => `Putar dari ${time}`,
    copySegment: "Salin segmen",
    editSegment: "Edit segmen",
    editSegmentAt: (time) => `Edit segmen pada ${time}`,
    editableTranscriptField: "Kolom transkrip yang dapat diedit",
    noSegmentSearchResults: "Tidak ada segmen transkrip yang cocok dengan pencarian ini.",
    search: "Cari",
    replace: "Ganti",
    closeSearchReplace: "Tutup cari dan ganti",
    searchTermPlaceholder: "Masukkan kata kunci",
    replacementPlaceholder: "Masukkan teks pengganti",
    matchCount: (count) => `${count} kecocokan teks di transkrip`,
    replaceAll: "Ganti semua",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "Mengganti" : "Mengganti kecocokan pertama"} ${count} kecocokan. Gunakan Simpan untuk menyimpan perubahan.`,
    noMatchNotice: "Tidak ada teks transkrip yang cocok.",
    regenerateAiSummary: "Buat ulang ringkasan AI",
    copyInsight: "Salin insight",
    timestampedSegments: (count) => `${count} segmen bertanda waktu`
  },
  it: {
    searchTranscript: "Cerca nella trascrizione",
    replaceTranscriptText: "Sostituisci testo della trascrizione",
    copyTranscript: "Copia trascrizione",
    saveTranscript: "Salva trascrizione",
    speakerRecognitionDetails: "Dettagli riconoscimento relatori",
    speakerOptions: "Opzioni relatori",
    speakerRecognitionEnabled: "Il riconoscimento dei relatori e attivo per questa trascrizione.",
    speakerRecognitionDisabled: "Il riconoscimento dei relatori non era attivo quando questa trascrizione e stata creata.",
    details: "Dettagli",
    displayMode: "Modalita di visualizzazione",
    showSpeakerLabels: "Mostra etichette relatori",
    displayNamesNextToText: "Mostra i nomi accanto al testo",
    filterSpeakers: "Filtra relatori",
    selectAll: "Seleziona tutto",
    unselectAll: "Deseleziona tutto",
    savingRating: "Salvataggio valutazione...",
    rateTranscriptQuality: "Valuta la qualita della trascrizione:",
    rateLabel: (value) => `Valuta ${value}`,
    playFrom: (time) => `Riproduci da ${time}`,
    copySegment: "Copia segmento",
    editSegment: "Modifica segmento",
    editSegmentAt: (time) => `Modifica segmento a ${time}`,
    editableTranscriptField: "Campo trascrizione modificabile",
    noSegmentSearchResults: "Nessun segmento corrisponde a questa ricerca.",
    search: "Cerca",
    replace: "Sostituisci",
    closeSearchReplace: "Chiudi cerca e sostituisci",
    searchTermPlaceholder: "Inserisci termine di ricerca",
    replacementPlaceholder: "Inserisci testo sostitutivo",
    matchCount: (count) => `${count} corrispondenze nella trascrizione`,
    replaceAll: "Sostituisci tutto",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "Sostituite" : "Prima corrispondenza sostituita"}: ${count}. Usa Salva per mantenere le modifiche.`,
    noMatchNotice: "Nessun testo corrispondente trovato nella trascrizione.",
    regenerateAiSummary: "Rigenera riepilogo AI",
    copyInsight: "Copia insight",
    timestampedSegments: (count) => `${count} segmenti con timestamp`
  },
  ja: {
    searchTranscript: "文字起こしを検索",
    replaceTranscriptText: "文字起こしテキストを置換",
    copyTranscript: "文字起こしをコピー",
    saveTranscript: "文字起こしを保存",
    speakerRecognitionDetails: "話者認識の詳細",
    speakerOptions: "話者オプション",
    speakerRecognitionEnabled: "この文字起こしでは話者認識が有効です。",
    speakerRecognitionDisabled: "この文字起こしの作成時に話者認識は有効ではありませんでした。",
    details: "詳細",
    displayMode: "表示モード",
    showSpeakerLabels: "話者ラベルを表示",
    displayNamesNextToText: "テキスト横に名前を表示",
    filterSpeakers: "話者を絞り込み",
    selectAll: "すべて選択",
    unselectAll: "すべて解除",
    savingRating: "評価を保存中...",
    rateTranscriptQuality: "文字起こし品質を評価:",
    rateLabel: (value) => `${value}で評価`,
    playFrom: (time) => `${time}から再生`,
    copySegment: "セグメントをコピー",
    editSegment: "セグメントを編集",
    editSegmentAt: (time) => `${time}のセグメントを編集`,
    editableTranscriptField: "編集可能な文字起こし欄",
    noSegmentSearchResults: "この検索に一致するセグメントはありません。",
    search: "検索",
    replace: "置換",
    closeSearchReplace: "検索と置換を閉じる",
    searchTermPlaceholder: "検索語を入力",
    replacementPlaceholder: "置換テキストを入力",
    matchCount: (count) => `文字起こし内 ${count} 件一致`,
    replaceAll: "すべて置換",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "置換しました" : "最初の一致を置換しました"}: ${count}件。変更を保存してください。`,
    noMatchNotice: "一致する文字起こしテキストが見つかりません。",
    regenerateAiSummary: "AI要約を再生成",
    copyInsight: "インサイトをコピー",
    timestampedSegments: (count) => `${count} 件のタイムスタンプ付きセグメント`
  },
  ko: {
    searchTranscript: "전사본 검색",
    replaceTranscriptText: "전사 텍스트 바꾸기",
    copyTranscript: "전사본 복사",
    saveTranscript: "전사본 저장",
    speakerRecognitionDetails: "화자 인식 세부 정보",
    speakerOptions: "화자 옵션",
    speakerRecognitionEnabled: "이 전사본에는 화자 인식이 활성화되어 있습니다.",
    speakerRecognitionDisabled: "이 전사본을 만들 때 화자 인식이 활성화되지 않았습니다.",
    details: "세부 정보",
    displayMode: "표시 모드",
    showSpeakerLabels: "화자 라벨 표시",
    displayNamesNextToText: "텍스트 옆에 이름 표시",
    filterSpeakers: "화자 필터",
    selectAll: "모두 선택",
    unselectAll: "모두 해제",
    savingRating: "평가 저장 중...",
    rateTranscriptQuality: "전사 품질 평가:",
    rateLabel: (value) => `${value}점 평가`,
    playFrom: (time) => `${time}부터 재생`,
    copySegment: "세그먼트 복사",
    editSegment: "세그먼트 편집",
    editSegmentAt: (time) => `${time} 세그먼트 편집`,
    editableTranscriptField: "편집 가능한 전사 필드",
    noSegmentSearchResults: "이 검색과 일치하는 전사 세그먼트가 없습니다.",
    search: "검색",
    replace: "바꾸기",
    closeSearchReplace: "검색 및 바꾸기 닫기",
    searchTermPlaceholder: "검색어 입력",
    replacementPlaceholder: "대체 텍스트 입력",
    matchCount: (count) => `전사본에서 ${count}개 일치`,
    replaceAll: "모두 바꾸기",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "바꿈" : "첫 일치 항목 바꿈"}: ${count}개. 저장을 눌러 변경 사항을 유지하세요.`,
    noMatchNotice: "일치하는 전사 텍스트가 없습니다.",
    regenerateAiSummary: "AI 요약 다시 생성",
    copyInsight: "인사이트 복사",
    timestampedSegments: (count) => `타임스탬프 세그먼트 ${count}개`
  },
  nl: {
    searchTranscript: "Transcript doorzoeken",
    replaceTranscriptText: "Transcripttekst vervangen",
    copyTranscript: "Transcript kopieren",
    saveTranscript: "Transcript opslaan",
    speakerRecognitionDetails: "Details sprekerherkenning",
    speakerOptions: "Sprekeropties",
    speakerRecognitionEnabled: "Sprekerherkenning is ingeschakeld voor dit transcript.",
    speakerRecognitionDisabled: "Sprekerherkenning was niet ingeschakeld toen dit transcript werd gemaakt.",
    details: "Details",
    displayMode: "Weergavemodus",
    showSpeakerLabels: "Sprekerlabels tonen",
    displayNamesNextToText: "Namen naast tekst tonen",
    filterSpeakers: "Sprekers filteren",
    selectAll: "Alles selecteren",
    unselectAll: "Alles deselecteren",
    savingRating: "Beoordeling opslaan...",
    rateTranscriptQuality: "Beoordeel transcriptkwaliteit:",
    rateLabel: (value) => `Beoordeel ${value}`,
    playFrom: (time) => `Afspelen vanaf ${time}`,
    copySegment: "Segment kopieren",
    editSegment: "Segment bewerken",
    editSegmentAt: (time) => `Segment bewerken op ${time}`,
    editableTranscriptField: "Bewerkbaar transcriptveld",
    noSegmentSearchResults: "Geen transcriptsegmenten komen overeen met deze zoekopdracht.",
    search: "Zoeken",
    replace: "Vervangen",
    closeSearchReplace: "Zoeken en vervangen sluiten",
    searchTermPlaceholder: "Zoekterm invoeren",
    replacementPlaceholder: "Vervangende tekst invoeren",
    matchCount: (count) => `${count} tekstmatch(es) in transcript`,
    replaceAll: "Alles vervangen",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "Vervangen" : "Eerste match vervangen"}: ${count}. Gebruik Opslaan om wijzigingen te bewaren.`,
    noMatchNotice: "Geen overeenkomende transcripttekst gevonden.",
    regenerateAiSummary: "AI-samenvatting opnieuw genereren",
    copyInsight: "Inzicht kopieren",
    timestampedSegments: (count) => `${count} segmenten met tijdstempel`
  },
  pl: {
    searchTranscript: "Przeszukaj transkrypcje",
    replaceTranscriptText: "Zamien tekst transkrypcji",
    copyTranscript: "Kopiuj transkrypcje",
    saveTranscript: "Zapisz transkrypcje",
    speakerRecognitionDetails: "Szczegoly rozpoznawania mowcow",
    speakerOptions: "Opcje mowcow",
    speakerRecognitionEnabled: "Rozpoznawanie mowcow jest wlaczone dla tej transkrypcji.",
    speakerRecognitionDisabled: "Rozpoznawanie mowcow nie bylo wlaczone podczas tworzenia tej transkrypcji.",
    details: "Szczegoly",
    displayMode: "Tryb wyswietlania",
    showSpeakerLabels: "Pokaz etykiety mowcow",
    displayNamesNextToText: "Pokaz nazwy obok tekstu",
    filterSpeakers: "Filtruj mowcow",
    selectAll: "Zaznacz wszystko",
    unselectAll: "Odznacz wszystko",
    savingRating: "Zapisywanie oceny...",
    rateTranscriptQuality: "Ocen jakosc transkrypcji:",
    rateLabel: (value) => `Ocen ${value}`,
    playFrom: (time) => `Odtworz od ${time}`,
    copySegment: "Kopiuj segment",
    editSegment: "Edytuj segment",
    editSegmentAt: (time) => `Edytuj segment o ${time}`,
    editableTranscriptField: "Edytowalne pole transkrypcji",
    noSegmentSearchResults: "Brak segmentow pasujacych do tego wyszukiwania.",
    search: "Szukaj",
    replace: "Zamien",
    closeSearchReplace: "Zamknij wyszukiwanie i zamiane",
    searchTermPlaceholder: "Wpisz szukana fraze",
    replacementPlaceholder: "Wpisz tekst zamiany",
    matchCount: (count) => `${count} dopasowan w transkrypcji`,
    replaceAll: "Zamien wszystko",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "Zamieniono" : "Zamieniono pierwsze dopasowanie"}: ${count}. Uzyj Zapisz, aby utrwalic zmiany.`,
    noMatchNotice: "Nie znaleziono pasujacego tekstu transkrypcji.",
    regenerateAiSummary: "Wygeneruj ponownie podsumowanie AI",
    copyInsight: "Kopiuj insight",
    timestampedSegments: (count) => `${count} segmentow ze znacznikami czasu`
  },
  pt: {
    searchTranscript: "Pesquisar transcricao",
    replaceTranscriptText: "Substituir texto da transcricao",
    copyTranscript: "Copiar transcricao",
    saveTranscript: "Salvar transcricao",
    speakerRecognitionDetails: "Detalhes de reconhecimento de falantes",
    speakerOptions: "Opcoes de falantes",
    speakerRecognitionEnabled: "O reconhecimento de falantes esta ativado para esta transcricao.",
    speakerRecognitionDisabled: "O reconhecimento de falantes nao estava ativado quando esta transcricao foi criada.",
    details: "Detalhes",
    displayMode: "Modo de exibicao",
    showSpeakerLabels: "Mostrar rotulos de falantes",
    displayNamesNextToText: "Mostrar nomes ao lado do texto",
    filterSpeakers: "Filtrar falantes",
    selectAll: "Selecionar tudo",
    unselectAll: "Desmarcar tudo",
    savingRating: "Salvando avaliacao...",
    rateTranscriptQuality: "Avaliar qualidade da transcricao:",
    rateLabel: (value) => `Avaliar ${value}`,
    playFrom: (time) => `Reproduzir de ${time}`,
    copySegment: "Copiar segmento",
    editSegment: "Editar segmento",
    editSegmentAt: (time) => `Editar segmento em ${time}`,
    editableTranscriptField: "Campo de transcricao editavel",
    noSegmentSearchResults: "Nenhum segmento corresponde a esta pesquisa.",
    search: "Pesquisar",
    replace: "Substituir",
    closeSearchReplace: "Fechar pesquisar e substituir",
    searchTermPlaceholder: "Digite o termo de busca",
    replacementPlaceholder: "Digite o texto de substituicao",
    matchCount: (count) => `${count} correspondencias na transcricao`,
    replaceAll: "Substituir tudo",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "Substituidas" : "Primeira correspondencia substituida"}: ${count}. Use Salvar para manter as alteracoes.`,
    noMatchNotice: "Nenhum texto correspondente encontrado na transcricao.",
    regenerateAiSummary: "Gerar novamente resumo AI",
    copyInsight: "Copiar insight",
    timestampedSegments: (count) => `${count} segmentos com timestamp`
  },
  ru: {
    searchTranscript: "Поиск по расшифровке",
    replaceTranscriptText: "Заменить текст расшифровки",
    copyTranscript: "Скопировать расшифровку",
    saveTranscript: "Сохранить расшифровку",
    speakerRecognitionDetails: "Сведения о распознавании говорящих",
    speakerOptions: "Параметры говорящих",
    speakerRecognitionEnabled: "Распознавание говорящих включено для этой расшифровки.",
    speakerRecognitionDisabled: "Распознавание говорящих не было включено при создании этой расшифровки.",
    details: "Сведения",
    displayMode: "Режим отображения",
    showSpeakerLabels: "Показывать метки говорящих",
    displayNamesNextToText: "Показывать имена рядом с текстом",
    filterSpeakers: "Фильтр говорящих",
    selectAll: "Выбрать все",
    unselectAll: "Снять все",
    savingRating: "Сохранение оценки...",
    rateTranscriptQuality: "Оцените качество расшифровки:",
    rateLabel: (value) => `Оценить ${value}`,
    playFrom: (time) => `Воспроизвести с ${time}`,
    copySegment: "Скопировать сегмент",
    editSegment: "Редактировать сегмент",
    editSegmentAt: (time) => `Редактировать сегмент на ${time}`,
    editableTranscriptField: "Редактируемое поле расшифровки",
    noSegmentSearchResults: "Нет сегментов, соответствующих этому поиску.",
    search: "Поиск",
    replace: "Заменить",
    closeSearchReplace: "Закрыть поиск и замену",
    searchTermPlaceholder: "Введите поисковый запрос",
    replacementPlaceholder: "Введите текст замены",
    matchCount: (count) => `${count} совпадений в расшифровке`,
    replaceAll: "Заменить все",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "Заменено" : "Заменено первое совпадение"}: ${count}. Нажмите Сохранить, чтобы применить изменения.`,
    noMatchNotice: "Совпадающий текст в расшифровке не найден.",
    regenerateAiSummary: "Создать AI-сводку заново",
    copyInsight: "Скопировать инсайт",
    timestampedSegments: (count) => `${count} сегментов с таймкодами`
  },
  th: {
    searchTranscript: "ค้นหาทรานสคริปต์",
    replaceTranscriptText: "แทนที่ข้อความทรานสคริปต์",
    copyTranscript: "คัดลอกทรานสคริปต์",
    saveTranscript: "บันทึกทรานสคริปต์",
    speakerRecognitionDetails: "รายละเอียดการจดจำผู้พูด",
    speakerOptions: "ตัวเลือกผู้พูด",
    speakerRecognitionEnabled: "เปิดใช้การจดจำผู้พูดสำหรับทรานสคริปต์นี้แล้ว",
    speakerRecognitionDisabled: "ไม่ได้เปิดใช้การจดจำผู้พูดเมื่อสร้างทรานสคริปต์นี้",
    details: "รายละเอียด",
    displayMode: "โหมดแสดงผล",
    showSpeakerLabels: "แสดงป้ายผู้พูด",
    displayNamesNextToText: "แสดงชื่อข้างข้อความ",
    filterSpeakers: "กรองผู้พูด",
    selectAll: "เลือกทั้งหมด",
    unselectAll: "ยกเลิกทั้งหมด",
    savingRating: "กำลังบันทึกคะแนน...",
    rateTranscriptQuality: "ให้คะแนนคุณภาพทรานสคริปต์:",
    rateLabel: (value) => `ให้คะแนน ${value}`,
    playFrom: (time) => `เล่นจาก ${time}`,
    copySegment: "คัดลอกช่วง",
    editSegment: "แก้ไขช่วง",
    editSegmentAt: (time) => `แก้ไขช่วงที่ ${time}`,
    editableTranscriptField: "ช่องทรานสคริปต์ที่แก้ไขได้",
    noSegmentSearchResults: "ไม่มีช่วงทรานสคริปต์ที่ตรงกับการค้นหานี้",
    search: "ค้นหา",
    replace: "แทนที่",
    closeSearchReplace: "ปิดค้นหาและแทนที่",
    searchTermPlaceholder: "ป้อนคำค้นหา",
    replacementPlaceholder: "ป้อนข้อความแทนที่",
    matchCount: (count) => `พบ ${count} รายการในทรานสคริปต์`,
    replaceAll: "แทนที่ทั้งหมด",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "แทนที่แล้ว" : "แทนที่รายการแรกแล้ว"} ${count} รายการ ใช้บันทึกเพื่อเก็บการเปลี่ยนแปลง`,
    noMatchNotice: "ไม่พบข้อความทรานสคริปต์ที่ตรงกัน",
    regenerateAiSummary: "สร้างสรุป AI ใหม่",
    copyInsight: "คัดลอกอินไซต์",
    timestampedSegments: (count) => `${count} ช่วงพร้อมเวลา`
  },
  tr: {
    searchTranscript: "Transkriptte ara",
    replaceTranscriptText: "Transkript metnini degistir",
    copyTranscript: "Transkripti kopyala",
    saveTranscript: "Transkripti kaydet",
    speakerRecognitionDetails: "Konusmaci tanima ayrintilari",
    speakerOptions: "Konusmaci secenekleri",
    speakerRecognitionEnabled: "Bu transkript icin konusmaci tanima etkin.",
    speakerRecognitionDisabled: "Bu transkript olusturulurken konusmaci tanima etkin degildi.",
    details: "Ayrintilar",
    displayMode: "Gorunum modu",
    showSpeakerLabels: "Konusmaci etiketlerini goster",
    displayNamesNextToText: "Adlari metnin yaninda goster",
    filterSpeakers: "Konusmacilari filtrele",
    selectAll: "Tumunu sec",
    unselectAll: "Tumunu kaldir",
    savingRating: "Puan kaydediliyor...",
    rateTranscriptQuality: "Transkript kalitesini degerlendir:",
    rateLabel: (value) => `${value} puan ver`,
    playFrom: (time) => `${time} konumundan oynat`,
    copySegment: "Segmenti kopyala",
    editSegment: "Segmenti duzenle",
    editSegmentAt: (time) => `${time} konumundaki segmenti duzenle`,
    editableTranscriptField: "Duzenlenebilir transkript alani",
    noSegmentSearchResults: "Bu aramayla eslesen transkript segmenti yok.",
    search: "Ara",
    replace: "Degistir",
    closeSearchReplace: "Ara ve degistiri kapat",
    searchTermPlaceholder: "Arama terimi gir",
    replacementPlaceholder: "Degistirme metni gir",
    matchCount: (count) => `Transkriptte ${count} eslesme`,
    replaceAll: "Tumunu degistir",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "Degistirildi" : "Ilk eslesme degistirildi"}: ${count}. Degisiklikleri kalici yapmak icin Kaydet'i kullan.`,
    noMatchNotice: "Eslesen transkript metni bulunamadi.",
    regenerateAiSummary: "AI ozetini yeniden olustur",
    copyInsight: "Insight'i kopyala",
    timestampedSegments: (count) => `${count} zaman damgali segment`
  },
  uk: {
    searchTranscript: "Пошук у транскрипції",
    replaceTranscriptText: "Замінити текст транскрипції",
    copyTranscript: "Копіювати транскрипцію",
    saveTranscript: "Зберегти транскрипцію",
    speakerRecognitionDetails: "Відомості про розпізнавання мовців",
    speakerOptions: "Параметри мовців",
    speakerRecognitionEnabled: "Розпізнавання мовців увімкнено для цієї транскрипції.",
    speakerRecognitionDisabled: "Розпізнавання мовців не було увімкнено під час створення цієї транскрипції.",
    details: "Відомості",
    displayMode: "Режим відображення",
    showSpeakerLabels: "Показувати мітки мовців",
    displayNamesNextToText: "Показувати імена поруч із текстом",
    filterSpeakers: "Фільтр мовців",
    selectAll: "Вибрати все",
    unselectAll: "Скасувати вибір",
    savingRating: "Збереження оцінки...",
    rateTranscriptQuality: "Оцініть якість транскрипції:",
    rateLabel: (value) => `Оцінити ${value}`,
    playFrom: (time) => `Відтворити з ${time}`,
    copySegment: "Копіювати сегмент",
    editSegment: "Редагувати сегмент",
    editSegmentAt: (time) => `Редагувати сегмент на ${time}`,
    editableTranscriptField: "Редаговане поле транскрипції",
    noSegmentSearchResults: "Немає сегментів, що відповідають цьому пошуку.",
    search: "Пошук",
    replace: "Замінити",
    closeSearchReplace: "Закрити пошук і заміну",
    searchTermPlaceholder: "Введіть пошуковий запит",
    replacementPlaceholder: "Введіть текст заміни",
    matchCount: (count) => `${count} збігів у транскрипції`,
    replaceAll: "Замінити все",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "Замінено" : "Замінено перший збіг"}: ${count}. Натисніть Зберегти, щоб застосувати зміни.`,
    noMatchNotice: "Текст, що збігається, у транскрипції не знайдено.",
    regenerateAiSummary: "Створити AI-підсумок знову",
    copyInsight: "Копіювати інсайт",
    timestampedSegments: (count) => `${count} сегментів із часовими мітками`
  },
  vi: {
    searchTranscript: "Tim trong ban ghi",
    replaceTranscriptText: "Thay the van ban ban ghi",
    copyTranscript: "Sao chep ban ghi",
    saveTranscript: "Luu ban ghi",
    speakerRecognitionDetails: "Chi tiet nhan dien nguoi noi",
    speakerOptions: "Tuy chon nguoi noi",
    speakerRecognitionEnabled: "Nhan dien nguoi noi da bat cho ban ghi nay.",
    speakerRecognitionDisabled: "Nhan dien nguoi noi chua bat khi ban ghi nay duoc tao.",
    details: "Chi tiet",
    displayMode: "Che do hien thi",
    showSpeakerLabels: "Hien thi nhan nguoi noi",
    displayNamesNextToText: "Hien thi ten ben canh van ban",
    filterSpeakers: "Loc nguoi noi",
    selectAll: "Chon tat ca",
    unselectAll: "Bo chon tat ca",
    savingRating: "Dang luu danh gia...",
    rateTranscriptQuality: "Danh gia chat luong ban ghi:",
    rateLabel: (value) => `Danh gia ${value}`,
    playFrom: (time) => `Phat tu ${time}`,
    copySegment: "Sao chep doan",
    editSegment: "Sua doan",
    editSegmentAt: (time) => `Sua doan tai ${time}`,
    editableTranscriptField: "Truong ban ghi co the sua",
    noSegmentSearchResults: "Khong co doan nao khop voi tim kiem nay.",
    search: "Tim",
    replace: "Thay the",
    closeSearchReplace: "Dong tim va thay the",
    searchTermPlaceholder: "Nhap tu khoa tim kiem",
    replacementPlaceholder: "Nhap van ban thay the",
    matchCount: (count) => `${count} ket qua trong ban ghi`,
    replaceAll: "Thay the tat ca",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "Da thay the" : "Da thay the ket qua dau tien"} ${count} ket qua. Bam Luu de giu thay doi.`,
    noMatchNotice: "Khong tim thay van ban khop trong ban ghi.",
    regenerateAiSummary: "Tao lai tom tat AI",
    copyInsight: "Sao chep insight",
    timestampedSegments: (count) => `${count} doan co moc thoi gian`
  },
  zh: {
    searchTranscript: "搜索转写稿",
    replaceTranscriptText: "替换转写文本",
    copyTranscript: "复制转写稿",
    saveTranscript: "保存转写稿",
    speakerRecognitionDetails: "发言人识别详情",
    speakerOptions: "发言人选项",
    speakerRecognitionEnabled: "此转写稿已启用发言人识别。",
    speakerRecognitionDisabled: "创建此转写稿时未启用发言人识别。",
    details: "详情",
    displayMode: "显示模式",
    showSpeakerLabels: "显示发言人标签",
    displayNamesNextToText: "在文本旁显示名称",
    filterSpeakers: "筛选发言人",
    selectAll: "全选",
    unselectAll: "取消全选",
    savingRating: "正在保存评分...",
    rateTranscriptQuality: "评价转写质量：",
    rateLabel: (value) => `评分 ${value}`,
    playFrom: (time) => `从 ${time} 播放`,
    copySegment: "复制片段",
    editSegment: "编辑片段",
    editSegmentAt: (time) => `编辑 ${time} 的片段`,
    editableTranscriptField: "可编辑转写稿字段",
    noSegmentSearchResults: "没有匹配此搜索的转写片段。",
    search: "搜索",
    replace: "替换",
    closeSearchReplace: "关闭搜索与替换",
    searchTermPlaceholder: "输入搜索词",
    replacementPlaceholder: "输入替换文本",
    matchCount: (count) => `转写稿中有 ${count} 个匹配`,
    replaceAll: "全部替换",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "已替换" : "已替换第一个"} ${count} 个匹配。请点击保存以保留更改。`,
    noMatchNotice: "未找到匹配的转写文本。",
    regenerateAiSummary: "重新生成 AI 摘要",
    copyInsight: "复制洞察",
    timestampedSegments: (count) => `${count} 个带时间戳的片段`
  },
  "zh-TW": {
    searchTranscript: "搜尋轉寫稿",
    replaceTranscriptText: "替換轉寫文字",
    copyTranscript: "複製轉寫稿",
    saveTranscript: "儲存轉寫稿",
    speakerRecognitionDetails: "發言人識別詳情",
    speakerOptions: "發言人選項",
    speakerRecognitionEnabled: "此轉寫稿已啟用發言人識別。",
    speakerRecognitionDisabled: "建立此轉寫稿時未啟用發言人識別。",
    details: "詳情",
    displayMode: "顯示模式",
    showSpeakerLabels: "顯示發言人標籤",
    displayNamesNextToText: "在文字旁顯示名稱",
    filterSpeakers: "篩選發言人",
    selectAll: "全選",
    unselectAll: "取消全選",
    savingRating: "正在儲存評分...",
    rateTranscriptQuality: "評價轉寫品質：",
    rateLabel: (value) => `評分 ${value}`,
    playFrom: (time) => `從 ${time} 播放`,
    copySegment: "複製片段",
    editSegment: "編輯片段",
    editSegmentAt: (time) => `編輯 ${time} 的片段`,
    editableTranscriptField: "可編輯轉寫稿欄位",
    noSegmentSearchResults: "沒有符合此搜尋的轉寫片段。",
    search: "搜尋",
    replace: "替換",
    closeSearchReplace: "關閉搜尋與替換",
    searchTermPlaceholder: "輸入搜尋詞",
    replacementPlaceholder: "輸入替換文字",
    matchCount: (count) => `轉寫稿中有 ${count} 個符合項目`,
    replaceAll: "全部替換",
    replaceNotice: (count, replaceAll) => `${replaceAll ? "已替換" : "已替換第一個"} ${count} 個符合項目。請點擊儲存以保留變更。`,
    noMatchNotice: "未找到符合的轉寫文字。",
    regenerateAiSummary: "重新生成 AI 摘要",
    copyInsight: "複製洞察",
    timestampedSegments: (count) => `${count} 個帶時間戳的片段`
  }
};

type TranscriptionLocaleCopy = {
  summaryLabels: {
    overview: string;
    keyPoints: string;
    takeaways: string;
  };
  status: Record<PreprocessingStatusKey, readonly [string, string]>;
  summaryEmptyTitle: string;
  generateGeneralSummary: string;
  chooseAnotherTemplate: string;
  generatingSummary: string;
  seekTitle: string;
};

const transcriptionLocaleCopy: Record<Locale, TranscriptionLocaleCopy> = {
  ar: {
    summaryLabels: {overview: "نظرة عامة", keyPoints: "النقاط الرئيسية", takeaways: "الخلاصات"},
    status: {
      UPLOADING: ["جار الرفع", "جار رفع ملفك..."],
      QUEUED: ["في قائمة الانتظار", "بانتظار المعالجة..."],
      TRANSCRIBING: ["جار التفريغ", "جار تحويل الكلام إلى نص..."],
      ANALYZING: ["جار التحليل", "جار إنشاء الملخص والخريطة الذهنية..."],
      FAILED: ["فشل التفريغ", "لم يكتمل التفريغ. يرجى المحاولة مرة أخرى."],
      CANCELED: ["تم الإلغاء", "تم إلغاء هذه المهمة."],
      PROCESSING: ["جار التحضير", "جار تجهيز ملفك..."]
    },
    summaryEmptyTitle: "أنشئ ملخصاً لهذا النص",
    generateGeneralSummary: "إنشاء ملخص عام",
    chooseAnotherTemplate: "اختيار قالب آخر",
    generatingSummary: "جار إنشاء الملخص...",
    seekTitle: "الانتقال إلى الموضع المقابل في الصوت"
  },
  de: {
    summaryLabels: {overview: "Ubersicht", keyPoints: "Kernpunkte", takeaways: "Erkenntnisse"},
    status: {
      UPLOADING: ["Wird hochgeladen", "Deine Datei wird hochgeladen..."],
      QUEUED: ["In Warteschlange", "Wartet auf Verarbeitung..."],
      TRANSCRIBING: ["Transkription lauft", "Sprache wird in Text umgewandelt..."],
      ANALYZING: ["Analyse lauft", "Zusammenfassung und Mindmap werden erstellt..."],
      FAILED: ["Transkription fehlgeschlagen", "Die Transkription konnte nicht abgeschlossen werden. Bitte versuche es erneut."],
      CANCELED: ["Abgebrochen", "Diese Aufgabe wurde abgebrochen."],
      PROCESSING: ["Vorbereitung", "Deine Datei wird vorbereitet..."]
    },
    summaryEmptyTitle: "Zusammenfassung fur dieses Transkript erstellen",
    generateGeneralSummary: "Allgemeine Zusammenfassung erstellen",
    chooseAnotherTemplate: "Andere Vorlage auswahlen",
    generatingSummary: "Zusammenfassung wird erstellt...",
    seekTitle: "Zur passenden Audioposition springen"
  },
  en: {
    summaryLabels: {overview: "Overview", keyPoints: "Key Points", takeaways: "Takeaways"},
    status: {
      UPLOADING: ["Uploading", "Uploading your file..."],
      QUEUED: ["Queued", "Waiting in queue..."],
      TRANSCRIBING: ["Transcribing", "Converting speech to text..."],
      ANALYZING: ["Analyzing", "Generating summary and mind map..."],
      FAILED: ["Failed", "Transcription failed. Please try again."],
      CANCELED: ["Canceled", "This task was canceled."],
      PROCESSING: ["Preprocessing", "Preparing your file..."]
    },
    summaryEmptyTitle: "Generate a summary for this transcript",
    generateGeneralSummary: "Generate General Summary",
    chooseAnotherTemplate: "Choose another template",
    generatingSummary: "Generating summary...",
    seekTitle: "Jump to the matching audio position"
  },
  es: {
    summaryLabels: {overview: "Resumen", keyPoints: "Puntos clave", takeaways: "Conclusiones"},
    status: {
      UPLOADING: ["Subiendo", "Subiendo tu archivo..."],
      QUEUED: ["En cola", "Esperando procesamiento..."],
      TRANSCRIBING: ["Transcribiendo", "Convirtiendo voz a texto..."],
      ANALYZING: ["Analizando", "Generando resumen y mapa mental..."],
      FAILED: ["Error", "La transcripcion no se completo. Intentalo de nuevo."],
      CANCELED: ["Cancelado", "Esta tarea fue cancelada."],
      PROCESSING: ["Preprocesando", "Preparando tu archivo..."]
    },
    summaryEmptyTitle: "Generar un resumen de esta transcripcion",
    generateGeneralSummary: "Generar resumen general",
    chooseAnotherTemplate: "Elegir otra plantilla",
    generatingSummary: "Generando resumen...",
    seekTitle: "Saltar a la posicion correspondiente del audio"
  },
  fr: {
    summaryLabels: {overview: "Vue d'ensemble", keyPoints: "Points cles", takeaways: "A retenir"},
    status: {
      UPLOADING: ["Televersement", "Televersement de votre fichier..."],
      QUEUED: ["En file d'attente", "En attente de traitement..."],
      TRANSCRIBING: ["Transcription", "Conversion de la parole en texte..."],
      ANALYZING: ["Analyse", "Generation du resume et de la carte mentale..."],
      FAILED: ["Echec", "La transcription a echoue. Veuillez reessayer."],
      CANCELED: ["Annule", "Cette tache a ete annulee."],
      PROCESSING: ["Preparation", "Preparation de votre fichier..."]
    },
    summaryEmptyTitle: "Generer un resume pour cette transcription",
    generateGeneralSummary: "Generer un resume general",
    chooseAnotherTemplate: "Choisir un autre modele",
    generatingSummary: "Generation du resume...",
    seekTitle: "Aller a la position audio correspondante"
  },
  hu: {
    summaryLabels: {overview: "Attekintes", keyPoints: "Fobb pontok", takeaways: "Tanulsagok"},
    status: {
      UPLOADING: ["Feltoltes", "A fajlod feltoltese folyamatban..."],
      QUEUED: ["Varakozik", "Varakozas feldolgozasra..."],
      TRANSCRIBING: ["Atiras", "Beszed atalakitasa szovegge..."],
      ANALYZING: ["Elemzes", "Osszefoglalo es gondolatterkep keszul..."],
      FAILED: ["Sikertelen", "Az atiras nem fejezodott be. Probald ujra."],
      CANCELED: ["Megszakitva", "Ez a feladat meg lett szakitva."],
      PROCESSING: ["Elokeszites", "A fajlod elokeszitese..."]
    },
    summaryEmptyTitle: "Osszefoglalo keszitese ehhez az atirathoz",
    generateGeneralSummary: "Altalanos osszefoglalo keszitese",
    chooseAnotherTemplate: "Masik sablon valasztasa",
    generatingSummary: "Osszefoglalo keszul...",
    seekTitle: "Ugras a megfelelo hangpoziciohoz"
  },
  id: {
    summaryLabels: {overview: "Ikhtisar", keyPoints: "Poin Utama", takeaways: "Kesimpulan"},
    status: {
      UPLOADING: ["Mengunggah", "Mengunggah file Anda..."],
      QUEUED: ["Dalam antrean", "Menunggu diproses..."],
      TRANSCRIBING: ["Mentranskripsi", "Mengubah ucapan menjadi teks..."],
      ANALYZING: ["Menganalisis", "Membuat ringkasan dan peta pikiran..."],
      FAILED: ["Gagal", "Transkripsi gagal. Silakan coba lagi."],
      CANCELED: ["Dibatalkan", "Tugas ini dibatalkan."],
      PROCESSING: ["Pra-pemrosesan", "Menyiapkan file Anda..."]
    },
    summaryEmptyTitle: "Buat ringkasan untuk transkrip ini",
    generateGeneralSummary: "Buat Ringkasan Umum",
    chooseAnotherTemplate: "Pilih template lain",
    generatingSummary: "Membuat ringkasan...",
    seekTitle: "Lompat ke posisi audio yang sesuai"
  },
  it: {
    summaryLabels: {overview: "Panoramica", keyPoints: "Punti chiave", takeaways: "Conclusioni"},
    status: {
      UPLOADING: ["Caricamento", "Caricamento del file..."],
      QUEUED: ["In coda", "In attesa di elaborazione..."],
      TRANSCRIBING: ["Trascrizione", "Conversione del parlato in testo..."],
      ANALYZING: ["Analisi", "Generazione di riepilogo e mappa mentale..."],
      FAILED: ["Non riuscito", "La trascrizione non e stata completata. Riprova."],
      CANCELED: ["Annullato", "Questa attivita e stata annullata."],
      PROCESSING: ["Preparazione", "Preparazione del file..."]
    },
    summaryEmptyTitle: "Genera un riepilogo per questa trascrizione",
    generateGeneralSummary: "Genera riepilogo generale",
    chooseAnotherTemplate: "Scegli un altro modello",
    generatingSummary: "Generazione del riepilogo...",
    seekTitle: "Vai alla posizione audio corrispondente"
  },
  ja: {
    summaryLabels: {overview: "概要", keyPoints: "要点", takeaways: "学び"},
    status: {
      UPLOADING: ["アップロード中", "ファイルをアップロードしています..."],
      QUEUED: ["待機中", "処理待ちです..."],
      TRANSCRIBING: ["文字起こし中", "音声をテキストに変換しています..."],
      ANALYZING: ["分析中", "要約とマインドマップを生成しています..."],
      FAILED: ["失敗", "文字起こしを完了できませんでした。もう一度お試しください。"],
      CANCELED: ["キャンセル済み", "このタスクはキャンセルされました。"],
      PROCESSING: ["前処理中", "ファイルを準備しています..."]
    },
    summaryEmptyTitle: "この文字起こしの要約を生成",
    generateGeneralSummary: "一般要約を生成",
    chooseAnotherTemplate: "別のテンプレートを選択",
    generatingSummary: "要約を生成しています...",
    seekTitle: "対応する音声位置へ移動"
  },
  ko: {
    summaryLabels: {overview: "개요", keyPoints: "핵심 포인트", takeaways: "요약 인사이트"},
    status: {
      UPLOADING: ["업로드 중", "파일을 업로드하는 중..."],
      QUEUED: ["대기 중", "처리를 기다리는 중..."],
      TRANSCRIBING: ["전사 중", "음성을 텍스트로 변환하는 중..."],
      ANALYZING: ["분석 중", "요약과 마인드맵을 생성하는 중..."],
      FAILED: ["실패", "전사가 완료되지 않았습니다. 다시 시도하세요."],
      CANCELED: ["취소됨", "이 작업은 취소되었습니다."],
      PROCESSING: ["전처리 중", "파일을 준비하는 중..."]
    },
    summaryEmptyTitle: "이 전사본의 요약 생성",
    generateGeneralSummary: "일반 요약 생성",
    chooseAnotherTemplate: "다른 템플릿 선택",
    generatingSummary: "요약 생성 중...",
    seekTitle: "해당 오디오 위치로 이동"
  },
  nl: {
    summaryLabels: {overview: "Overzicht", keyPoints: "Kernpunten", takeaways: "Inzichten"},
    status: {
      UPLOADING: ["Uploaden", "Je bestand wordt geupload..."],
      QUEUED: ["In wachtrij", "Wachten op verwerking..."],
      TRANSCRIBING: ["Transcriberen", "Spraak wordt omgezet naar tekst..."],
      ANALYZING: ["Analyseren", "Samenvatting en mindmap worden gemaakt..."],
      FAILED: ["Mislukt", "Transcriptie is mislukt. Probeer het opnieuw."],
      CANCELED: ["Geannuleerd", "Deze taak is geannuleerd."],
      PROCESSING: ["Voorbewerken", "Je bestand wordt voorbereid..."]
    },
    summaryEmptyTitle: "Maak een samenvatting voor dit transcript",
    generateGeneralSummary: "Algemene samenvatting maken",
    chooseAnotherTemplate: "Andere template kiezen",
    generatingSummary: "Samenvatting wordt gemaakt...",
    seekTitle: "Spring naar de bijbehorende audiopositie"
  },
  pl: {
    summaryLabels: {overview: "Przeglad", keyPoints: "Kluczowe punkty", takeaways: "Wnioski"},
    status: {
      UPLOADING: ["Przesylanie", "Przesylanie pliku..."],
      QUEUED: ["W kolejce", "Oczekiwanie na przetwarzanie..."],
      TRANSCRIBING: ["Transkrypcja", "Konwersja mowy na tekst..."],
      ANALYZING: ["Analiza", "Generowanie podsumowania i mapy mysli..."],
      FAILED: ["Niepowodzenie", "Transkrypcja nie zostala ukonczona. Sprobuj ponownie."],
      CANCELED: ["Anulowano", "To zadanie zostalo anulowane."],
      PROCESSING: ["Przygotowanie", "Przygotowywanie pliku..."]
    },
    summaryEmptyTitle: "Wygeneruj podsumowanie tej transkrypcji",
    generateGeneralSummary: "Wygeneruj podsumowanie ogolne",
    chooseAnotherTemplate: "Wybierz inny szablon",
    generatingSummary: "Generowanie podsumowania...",
    seekTitle: "Przejdz do odpowiedniej pozycji audio"
  },
  pt: {
    summaryLabels: {overview: "Visao geral", keyPoints: "Pontos principais", takeaways: "Conclusoes"},
    status: {
      UPLOADING: ["Enviando", "Enviando seu arquivo..."],
      QUEUED: ["Na fila", "Aguardando processamento..."],
      TRANSCRIBING: ["Transcrevendo", "Convertendo fala em texto..."],
      ANALYZING: ["Analisando", "Gerando resumo e mapa mental..."],
      FAILED: ["Falhou", "A transcricao falhou. Tente novamente."],
      CANCELED: ["Cancelado", "Esta tarefa foi cancelada."],
      PROCESSING: ["Pre-processando", "Preparando seu arquivo..."]
    },
    summaryEmptyTitle: "Gerar um resumo para esta transcricao",
    generateGeneralSummary: "Gerar resumo geral",
    chooseAnotherTemplate: "Escolher outro modelo",
    generatingSummary: "Gerando resumo...",
    seekTitle: "Ir para a posicao correspondente no audio"
  },
  ru: {
    summaryLabels: {overview: "Обзор", keyPoints: "Ключевые пункты", takeaways: "Выводы"},
    status: {
      UPLOADING: ["Загрузка", "Ваш файл загружается..."],
      QUEUED: ["В очереди", "Ожидание обработки..."],
      TRANSCRIBING: ["Транскрибация", "Речь преобразуется в текст..."],
      ANALYZING: ["Анализ", "Создается сводка и майнд-карта..."],
      FAILED: ["Ошибка", "Транскрибация не завершена. Попробуйте еще раз."],
      CANCELED: ["Отменено", "Эта задача была отменена."],
      PROCESSING: ["Предобработка", "Ваш файл подготавливается..."]
    },
    summaryEmptyTitle: "Создать сводку для этой расшифровки",
    generateGeneralSummary: "Создать общую сводку",
    chooseAnotherTemplate: "Выбрать другой шаблон",
    generatingSummary: "Создается сводка...",
    seekTitle: "Перейти к соответствующей позиции в аудио"
  },
  th: {
    summaryLabels: {overview: "ภาพรวม", keyPoints: "ประเด็นสำคัญ", takeaways: "ข้อสรุป"},
    status: {
      UPLOADING: ["กำลังอัปโหลด", "กำลังอัปโหลดไฟล์ของคุณ..."],
      QUEUED: ["อยู่ในคิว", "กำลังรอประมวลผล..."],
      TRANSCRIBING: ["กำลังถอดเสียง", "กำลังแปลงเสียงพูดเป็นข้อความ..."],
      ANALYZING: ["กำลังวิเคราะห์", "กำลังสร้างสรุปและแผนผังความคิด..."],
      FAILED: ["ล้มเหลว", "การถอดเสียงไม่สำเร็จ โปรดลองอีกครั้ง"],
      CANCELED: ["ยกเลิกแล้ว", "งานนี้ถูกยกเลิกแล้ว"],
      PROCESSING: ["กำลังเตรียม", "กำลังเตรียมไฟล์ของคุณ..."]
    },
    summaryEmptyTitle: "สร้างสรุปสำหรับทรานสคริปต์นี้",
    generateGeneralSummary: "สร้างสรุปทั่วไป",
    chooseAnotherTemplate: "เลือกเทมเพลตอื่น",
    generatingSummary: "กำลังสร้างสรุป...",
    seekTitle: "ข้ามไปยังตำแหน่งเสียงที่ตรงกัน"
  },
  tr: {
    summaryLabels: {overview: "Genel bakis", keyPoints: "Onemli noktalar", takeaways: "Cikarimlar"},
    status: {
      UPLOADING: ["Yukleniyor", "Dosyaniz yukleniyor..."],
      QUEUED: ["Sirada", "Islenmeyi bekliyor..."],
      TRANSCRIBING: ["Metne dokuluyor", "Konusma metne donusturuluyor..."],
      ANALYZING: ["Analiz ediliyor", "Ozet ve zihin haritasi olusturuluyor..."],
      FAILED: ["Basarisiz", "Transkripsiyon tamamlanamadi. Lutfen tekrar deneyin."],
      CANCELED: ["Iptal edildi", "Bu gorev iptal edildi."],
      PROCESSING: ["On isleme", "Dosyaniz hazirlaniyor..."]
    },
    summaryEmptyTitle: "Bu transkript icin ozet olustur",
    generateGeneralSummary: "Genel Ozet Olustur",
    chooseAnotherTemplate: "Baska sablon sec",
    generatingSummary: "Ozet olusturuluyor...",
    seekTitle: "Eslesen ses konumuna git"
  },
  uk: {
    summaryLabels: {overview: "Огляд", keyPoints: "Ключові пункти", takeaways: "Висновки"},
    status: {
      UPLOADING: ["Завантаження", "Ваш файл завантажується..."],
      QUEUED: ["У черзі", "Очікування обробки..."],
      TRANSCRIBING: ["Транскрибування", "Мовлення перетворюється на текст..."],
      ANALYZING: ["Аналіз", "Створюється підсумок і ментальна карта..."],
      FAILED: ["Помилка", "Транскрибування не завершено. Спробуйте ще раз."],
      CANCELED: ["Скасовано", "Це завдання було скасовано."],
      PROCESSING: ["Попередня обробка", "Ваш файл готується..."]
    },
    summaryEmptyTitle: "Створити підсумок для цієї транскрипції",
    generateGeneralSummary: "Створити загальний підсумок",
    chooseAnotherTemplate: "Вибрати інший шаблон",
    generatingSummary: "Створюється підсумок...",
    seekTitle: "Перейти до відповідної позиції аудіо"
  },
  vi: {
    summaryLabels: {overview: "Tong quan", keyPoints: "Y chinh", takeaways: "Ket luan"},
    status: {
      UPLOADING: ["Dang tai len", "Dang tai tep cua ban len..."],
      QUEUED: ["Dang xep hang", "Dang cho xu ly..."],
      TRANSCRIBING: ["Dang phien am", "Dang chuyen giong noi thanh van ban..."],
      ANALYZING: ["Dang phan tich", "Dang tao tom tat va ban do tu duy..."],
      FAILED: ["That bai", "Phien am khong hoan tat. Vui long thu lai."],
      CANCELED: ["Da huy", "Tac vu nay da bi huy."],
      PROCESSING: ["Dang tien xu ly", "Dang chuan bi tep cua ban..."]
    },
    summaryEmptyTitle: "Tao tom tat cho ban ghi nay",
    generateGeneralSummary: "Tao tom tat chung",
    chooseAnotherTemplate: "Chon mau khac",
    generatingSummary: "Dang tao tom tat...",
    seekTitle: "Chuyen den vi tri am thanh tuong ung"
  },
  zh: {
    summaryLabels: {overview: "概述", keyPoints: "要点", takeaways: "启示"},
    status: {
      UPLOADING: ["正在上传", "正在上传你的文件..."],
      QUEUED: ["排队中", "正在排队等待处理..."],
      TRANSCRIBING: ["正在转录", "正在将语音转换为文字..."],
      ANALYZING: ["分析中", "正在生成 AI 摘要和思维导图..."],
      FAILED: ["转录失败", "转录未能完成，请重试。"],
      CANCELED: ["已取消", "此任务已取消。"],
      PROCESSING: ["预处理中", "正在准备你的文件..."]
    },
    summaryEmptyTitle: "为此转录稿生成摘要",
    generateGeneralSummary: "生成 General 摘要",
    chooseAnotherTemplate: "选择其他模板",
    generatingSummary: "正在生成摘要...",
    seekTitle: "跳转到音频对应位置"
  },
  "zh-TW": {
    summaryLabels: {overview: "概述", keyPoints: "重點", takeaways: "啟示"},
    status: {
      UPLOADING: ["正在上傳", "正在上傳你的檔案..."],
      QUEUED: ["排隊中", "正在排隊等待處理..."],
      TRANSCRIBING: ["正在轉錄", "正在將語音轉換為文字..."],
      ANALYZING: ["分析中", "正在生成 AI 摘要和心智圖..."],
      FAILED: ["轉錄失敗", "轉錄未能完成，請重試。"],
      CANCELED: ["已取消", "此任務已取消。"],
      PROCESSING: ["預處理中", "正在準備你的檔案..."]
    },
    summaryEmptyTitle: "為此轉錄稿生成摘要",
    generateGeneralSummary: "生成 General 摘要",
    chooseAnotherTemplate: "選擇其他範本",
    generatingSummary: "正在生成摘要...",
    seekTitle: "跳轉到音訊對應位置"
  }
};

function transcriptionCopyFor(locale: string) {
  return transcriptionLocaleCopy[isLocale(locale) ? locale : "en"];
}

type TranscriptionRuntimeCopy = {
  ratingSaved: string;
  transcriptionUnavailable: string;
  unableSaveRating: string;
};

const transcriptionRuntimeCopy: Record<Locale, TranscriptionRuntimeCopy> = {
  ar: {ratingSaved: "تم حفظ تقييم التفريغ.", transcriptionUnavailable: "التفريغ غير متاح", unableSaveRating: "تعذر حفظ تقييم التفريغ."},
  de: {ratingSaved: "Transkriptbewertung gespeichert.", transcriptionUnavailable: "Transkript nicht verfügbar", unableSaveRating: "Transkriptbewertung konnte nicht gespeichert werden."},
  en: {ratingSaved: "Transcript rating saved.", transcriptionUnavailable: "Transcript unavailable", unableSaveRating: "Unable to save transcript rating."},
  es: {ratingSaved: "Calificación de transcripción guardada.", transcriptionUnavailable: "Transcripción no disponible", unableSaveRating: "No se pudo guardar la calificación de transcripción."},
  fr: {ratingSaved: "Note de transcription enregistrée.", transcriptionUnavailable: "Transcription indisponible", unableSaveRating: "Impossible d'enregistrer la note de transcription."},
  hu: {ratingSaved: "Átiratértékelés mentve.", transcriptionUnavailable: "Az átirat nem érhető el", unableSaveRating: "Az átiratértékelés nem menthető."},
  id: {ratingSaved: "Rating transkrip disimpan.", transcriptionUnavailable: "Transkrip tidak tersedia", unableSaveRating: "Tidak dapat menyimpan rating transkrip."},
  it: {ratingSaved: "Valutazione della trascrizione salvata.", transcriptionUnavailable: "Trascrizione non disponibile", unableSaveRating: "Impossibile salvare la valutazione della trascrizione."},
  ja: {ratingSaved: "文字起こしの評価を保存しました。", transcriptionUnavailable: "文字起こしを利用できません", unableSaveRating: "文字起こしの評価を保存できません。"},
  ko: {ratingSaved: "전사 평가가 저장되었습니다.", transcriptionUnavailable: "전사를 사용할 수 없습니다", unableSaveRating: "전사 평가를 저장할 수 없습니다."},
  nl: {ratingSaved: "Transcriptbeoordeling opgeslagen.", transcriptionUnavailable: "Transcript niet beschikbaar", unableSaveRating: "Kan transcriptbeoordeling niet opslaan."},
  pl: {ratingSaved: "Ocena transkrypcji zapisana.", transcriptionUnavailable: "Transkrypcja niedostępna", unableSaveRating: "Nie można zapisać oceny transkrypcji."},
  pt: {ratingSaved: "Avaliação da transcrição salva.", transcriptionUnavailable: "Transcrição indisponível", unableSaveRating: "Não foi possível salvar a avaliação da transcrição."},
  ru: {ratingSaved: "Оценка расшифровки сохранена.", transcriptionUnavailable: "Расшифровка недоступна", unableSaveRating: "Не удалось сохранить оценку расшифровки."},
  th: {ratingSaved: "บันทึกคะแนนทรานสคริปต์แล้ว", transcriptionUnavailable: "ทรานสคริปต์ไม่พร้อมใช้งาน", unableSaveRating: "ไม่สามารถบันทึกคะแนนทรานสคริปต์ได้"},
  tr: {ratingSaved: "Transkript puanı kaydedildi.", transcriptionUnavailable: "Transkript kullanılamıyor", unableSaveRating: "Transkript puanı kaydedilemedi."},
  uk: {ratingSaved: "Оцінку транскрипції збережено.", transcriptionUnavailable: "Транскрипція недоступна", unableSaveRating: "Не вдалося зберегти оцінку транскрипції."},
  vi: {ratingSaved: "Đã lưu đánh giá bản chép lời.", transcriptionUnavailable: "Bản chép lời không khả dụng", unableSaveRating: "Không thể lưu đánh giá bản chép lời."},
  zh: {ratingSaved: "转写评分已保存。", transcriptionUnavailable: "转写不可用", unableSaveRating: "无法保存转写评分。"},
  "zh-TW": {ratingSaved: "轉寫評分已儲存。", transcriptionUnavailable: "轉寫不可用", unableSaveRating: "無法儲存轉寫評分。"}
};

const translationSettingsCopy: Record<Locale, TranslationSettingsCopy> = {
  ar: {openTranslationSettings: "فتح إعدادات الترجمة", translationSettings: "إعدادات الترجمة", selectTargetLanguage: "اختر اللغة الهدف", searchLanguagePlaceholder: "ابحث عن لغة...", popularLanguages: "لغات شائعة", allLanguages: "كل اللغات", generateTranslation: "إنشاء الترجمة", generatingTranslation: "جار الترجمة...", regenerateTranslation: "إعادة إنشاء الترجمة", translationGenerated: "تم إنشاء الترجمة.", translationFailed: "تعذر إنشاء الترجمة.", translationResult: "الترجمة", close: "إغلاق", noLanguageResults: "لا توجد لغات مطابقة."},
  de: {openTranslationSettings: "Übersetzungseinstellungen öffnen", translationSettings: "Übersetzungseinstellungen", selectTargetLanguage: "Zielsprache auswählen", searchLanguagePlaceholder: "Sprache suchen...", popularLanguages: "Beliebte Sprachen", allLanguages: "Alle Sprachen", generateTranslation: "Übersetzung erzeugen", generatingTranslation: "Übersetzen...", regenerateTranslation: "Übersetzung neu erzeugen", translationGenerated: "Übersetzung wurde erzeugt.", translationFailed: "Übersetzung konnte nicht erzeugt werden.", translationResult: "Übersetzung", close: "Schliessen", noLanguageResults: "Keine passenden Sprachen."},
  en: {openTranslationSettings: "Open translation settings", translationSettings: "Translation settings", selectTargetLanguage: "Select target language", searchLanguagePlaceholder: "Search languages...", popularLanguages: "Popular languages", allLanguages: "All languages", generateTranslation: "Generate translation", generatingTranslation: "Translating...", regenerateTranslation: "Regenerate translation", translationGenerated: "Translation has been generated.", translationFailed: "Unable to generate translation.", translationResult: "Translation", close: "Close", noLanguageResults: "No matching languages."},
  es: {openTranslationSettings: "Abrir ajustes de traducción", translationSettings: "Ajustes de traducción", selectTargetLanguage: "Selecciona el idioma de destino", searchLanguagePlaceholder: "Buscar idiomas...", popularLanguages: "Idiomas populares", allLanguages: "Todos los idiomas", generateTranslation: "Generar traducción", generatingTranslation: "Traduciendo...", regenerateTranslation: "Regenerar traducción", translationGenerated: "La traducción se ha generado.", translationFailed: "No se pudo generar la traducción.", translationResult: "Traducción", close: "Cerrar", noLanguageResults: "No hay idiomas coincidentes."},
  fr: {openTranslationSettings: "Ouvrir les paramètres de traduction", translationSettings: "Paramètres de traduction", selectTargetLanguage: "Choisir la langue cible", searchLanguagePlaceholder: "Rechercher une langue...", popularLanguages: "Langues populaires", allLanguages: "Toutes les langues", generateTranslation: "Générer la traduction", generatingTranslation: "Traduction...", regenerateTranslation: "Regénérer la traduction", translationGenerated: "La traduction a été générée.", translationFailed: "Impossible de générer la traduction.", translationResult: "Traduction", close: "Fermer", noLanguageResults: "Aucune langue correspondante."},
  hu: {openTranslationSettings: "Fordítási beállítások megnyitása", translationSettings: "Fordítási beállítások", selectTargetLanguage: "Célnyelv kiválasztása", searchLanguagePlaceholder: "Nyelv keresése...", popularLanguages: "Népszerű nyelvek", allLanguages: "Minden nyelv", generateTranslation: "Fordítás generálása", generatingTranslation: "Fordítás...", regenerateTranslation: "Fordítás újragenerálása", translationGenerated: "A fordítás elkészült.", translationFailed: "Nem sikerült fordítást generálni.", translationResult: "Fordítás", close: "Bezárás", noLanguageResults: "Nincs találat."},
  id: {openTranslationSettings: "Buka pengaturan terjemahan", translationSettings: "Pengaturan terjemahan", selectTargetLanguage: "Pilih bahasa target", searchLanguagePlaceholder: "Cari bahasa...", popularLanguages: "Bahasa populer", allLanguages: "Semua bahasa", generateTranslation: "Buat terjemahan", generatingTranslation: "Menerjemahkan...", regenerateTranslation: "Buat ulang terjemahan", translationGenerated: "Terjemahan telah dibuat.", translationFailed: "Tidak dapat membuat terjemahan.", translationResult: "Terjemahan", close: "Tutup", noLanguageResults: "Tidak ada bahasa yang cocok."},
  it: {openTranslationSettings: "Apri impostazioni traduzione", translationSettings: "Impostazioni traduzione", selectTargetLanguage: "Seleziona lingua di destinazione", searchLanguagePlaceholder: "Cerca lingue...", popularLanguages: "Lingue popolari", allLanguages: "Tutte le lingue", generateTranslation: "Genera traduzione", generatingTranslation: "Traduzione...", regenerateTranslation: "Rigenera traduzione", translationGenerated: "La traduzione è stata generata.", translationFailed: "Impossibile generare la traduzione.", translationResult: "Traduzione", close: "Chiudi", noLanguageResults: "Nessuna lingua corrispondente."},
  ja: {openTranslationSettings: "翻訳設定を開く", translationSettings: "翻訳設定", selectTargetLanguage: "翻訳先言語を選択", searchLanguagePlaceholder: "言語を検索...", popularLanguages: "人気の言語", allLanguages: "すべての言語", generateTranslation: "翻訳を生成", generatingTranslation: "翻訳中...", regenerateTranslation: "翻訳を再生成", translationGenerated: "翻訳を生成しました。", translationFailed: "翻訳を生成できません。", translationResult: "翻訳", close: "閉じる", noLanguageResults: "一致する言語がありません。"},
  ko: {openTranslationSettings: "번역 설정 열기", translationSettings: "번역 설정", selectTargetLanguage: "대상 언어 선택", searchLanguagePlaceholder: "언어 검색...", popularLanguages: "인기 언어", allLanguages: "모든 언어", generateTranslation: "번역 생성", generatingTranslation: "번역 중...", regenerateTranslation: "번역 다시 생성", translationGenerated: "번역이 생성되었습니다.", translationFailed: "번역을 생성할 수 없습니다.", translationResult: "번역", close: "닫기", noLanguageResults: "일치하는 언어가 없습니다."},
  nl: {openTranslationSettings: "Vertaalinstellingen openen", translationSettings: "Vertaalinstellingen", selectTargetLanguage: "Doeltaal selecteren", searchLanguagePlaceholder: "Talen zoeken...", popularLanguages: "Populaire talen", allLanguages: "Alle talen", generateTranslation: "Vertaling genereren", generatingTranslation: "Vertalen...", regenerateTranslation: "Vertaling opnieuw genereren", translationGenerated: "Vertaling is gegenereerd.", translationFailed: "Kan vertaling niet genereren.", translationResult: "Vertaling", close: "Sluiten", noLanguageResults: "Geen overeenkomende talen."},
  pl: {openTranslationSettings: "Otwórz ustawienia tłumaczenia", translationSettings: "Ustawienia tłumaczenia", selectTargetLanguage: "Wybierz język docelowy", searchLanguagePlaceholder: "Szukaj języków...", popularLanguages: "Popularne języki", allLanguages: "Wszystkie języki", generateTranslation: "Generuj tłumaczenie", generatingTranslation: "Tłumaczenie...", regenerateTranslation: "Wygeneruj ponownie", translationGenerated: "Tłumaczenie zostało wygenerowane.", translationFailed: "Nie można wygenerować tłumaczenia.", translationResult: "Tłumaczenie", close: "Zamknij", noLanguageResults: "Brak pasujących języków."},
  pt: {openTranslationSettings: "Abrir configurações de tradução", translationSettings: "Configurações de tradução", selectTargetLanguage: "Selecionar idioma de destino", searchLanguagePlaceholder: "Pesquisar idiomas...", popularLanguages: "Idiomas populares", allLanguages: "Todos os idiomas", generateTranslation: "Gerar tradução", generatingTranslation: "Traduzindo...", regenerateTranslation: "Gerar tradução novamente", translationGenerated: "A tradução foi gerada.", translationFailed: "Não foi possível gerar a tradução.", translationResult: "Tradução", close: "Fechar", noLanguageResults: "Nenhum idioma correspondente."},
  ru: {openTranslationSettings: "Открыть настройки перевода", translationSettings: "Настройки перевода", selectTargetLanguage: "Выберите целевой язык", searchLanguagePlaceholder: "Поиск языков...", popularLanguages: "Популярные языки", allLanguages: "Все языки", generateTranslation: "Создать перевод", generatingTranslation: "Перевод...", regenerateTranslation: "Создать перевод заново", translationGenerated: "Перевод создан.", translationFailed: "Не удалось создать перевод.", translationResult: "Перевод", close: "Закрыть", noLanguageResults: "Подходящих языков нет."},
  th: {openTranslationSettings: "เปิดการตั้งค่าการแปล", translationSettings: "การตั้งค่าการแปล", selectTargetLanguage: "เลือกภาษาเป้าหมาย", searchLanguagePlaceholder: "ค้นหาภาษา...", popularLanguages: "ภาษายอดนิยม", allLanguages: "ทุกภาษา", generateTranslation: "สร้างคำแปล", generatingTranslation: "กำลังแปล...", regenerateTranslation: "สร้างคำแปลอีกครั้ง", translationGenerated: "สร้างคำแปลแล้ว", translationFailed: "ไม่สามารถสร้างคำแปลได้", translationResult: "คำแปล", close: "ปิด", noLanguageResults: "ไม่พบภาษาที่ตรงกัน"},
  tr: {openTranslationSettings: "Çeviri ayarlarını aç", translationSettings: "Çeviri ayarları", selectTargetLanguage: "Hedef dili seç", searchLanguagePlaceholder: "Dil ara...", popularLanguages: "Popüler diller", allLanguages: "Tüm diller", generateTranslation: "Çeviri oluştur", generatingTranslation: "Çevriliyor...", regenerateTranslation: "Çeviriyi yeniden oluştur", translationGenerated: "Çeviri oluşturuldu.", translationFailed: "Çeviri oluşturulamadı.", translationResult: "Çeviri", close: "Kapat", noLanguageResults: "Eşleşen dil yok."},
  uk: {openTranslationSettings: "Відкрити налаштування перекладу", translationSettings: "Налаштування перекладу", selectTargetLanguage: "Виберіть цільову мову", searchLanguagePlaceholder: "Шукати мови...", popularLanguages: "Популярні мови", allLanguages: "Усі мови", generateTranslation: "Створити переклад", generatingTranslation: "Переклад...", regenerateTranslation: "Створити переклад знову", translationGenerated: "Переклад створено.", translationFailed: "Не вдалося створити переклад.", translationResult: "Переклад", close: "Закрити", noLanguageResults: "Немає відповідних мов."},
  vi: {openTranslationSettings: "Mở cài đặt dịch", translationSettings: "Cài đặt dịch", selectTargetLanguage: "Chọn ngôn ngữ đích", searchLanguagePlaceholder: "Tìm ngôn ngữ...", popularLanguages: "Ngôn ngữ phổ biến", allLanguages: "Tất cả ngôn ngữ", generateTranslation: "Tạo bản dịch", generatingTranslation: "Đang dịch...", regenerateTranslation: "Tạo lại bản dịch", translationGenerated: "Bản dịch đã được tạo.", translationFailed: "Không thể tạo bản dịch.", translationResult: "Bản dịch", close: "Đóng", noLanguageResults: "Không có ngôn ngữ phù hợp."},
  zh: {openTranslationSettings: "打开翻译设置", translationSettings: "翻译设置", selectTargetLanguage: "选择目标语言", searchLanguagePlaceholder: "搜索语言...", popularLanguages: "热门语言", allLanguages: "所有语言", generateTranslation: "生成翻译", generatingTranslation: "正在翻译...", regenerateTranslation: "重新生成翻译", translationGenerated: "翻译内容已生成。", translationFailed: "无法创建翻译。", translationResult: "翻译", close: "关闭", noLanguageResults: "没有匹配的语言。"},
  "zh-TW": {openTranslationSettings: "開啟翻譯設定", translationSettings: "翻譯設定", selectTargetLanguage: "選擇目標語言", searchLanguagePlaceholder: "搜尋語言...", popularLanguages: "熱門語言", allLanguages: "所有語言", generateTranslation: "生成翻譯", generatingTranslation: "正在翻譯...", regenerateTranslation: "重新生成翻譯", translationGenerated: "翻譯內容已生成。", translationFailed: "無法建立翻譯。", translationResult: "翻譯", close: "關閉", noLanguageResults: "沒有相符的語言。"}
};

function translationSettingsFor(locale: string) {
  return translationSettingsCopy[isLocale(locale) ? locale : "en"];
}

function transcriptionControlsFor(locale: string) {
  const safeLocale = isLocale(locale) ? locale : "en";
  return {...transcriptionControlCopy[safeLocale], ...transcriptionRuntimeCopy[safeLocale]};
}

type SummaryTemplateUiCopy = {
  summaryTemplate: string;
  selectTemplate: string;
  pro: string;
  labels: Record<SummaryTemplateInput, string>;
};

const summaryTemplateUiCopy: Record<Locale, SummaryTemplateUiCopy> = {
  ar: {
    summaryTemplate: "قالب الملخص",
    selectTemplate: "اختر قالباً",
    pro: "احترافي",
    labels: {none: "إيقاف", standard: "عام", meeting: "اجتماع", study: "دراسة", course_lecture: "دورة", interview: "مقابلة", podcast: "بودكاست"}
  },
  de: {
    summaryTemplate: "Zusammenfassungsvorlage",
    selectTemplate: "Vorlage auswahlen",
    pro: "PRO",
    labels: {none: "Aus", standard: "Allgemein", meeting: "Meeting", study: "Studium", course_lecture: "Kurs", interview: "Interview", podcast: "Podcast"}
  },
  en: {
    summaryTemplate: "Summary template",
    selectTemplate: "Select a template",
    pro: "PRO",
    labels: {none: "Off", standard: "General", meeting: "Meeting", study: "Study", course_lecture: "Course", interview: "Interview", podcast: "Podcast"}
  },
  es: {
    summaryTemplate: "Plantilla de resumen",
    selectTemplate: "Selecciona una plantilla",
    pro: "PRO",
    labels: {none: "Desactivado", standard: "General", meeting: "Reunion", study: "Estudio", course_lecture: "Curso", interview: "Entrevista", podcast: "Podcast"}
  },
  fr: {
    summaryTemplate: "Modele de resume",
    selectTemplate: "Choisir un modele",
    pro: "PRO",
    labels: {none: "Desactive", standard: "General", meeting: "Reunion", study: "Etude", course_lecture: "Cours", interview: "Entretien", podcast: "Podcast"}
  },
  hu: {
    summaryTemplate: "Osszefoglalo sablon",
    selectTemplate: "Sablon valasztasa",
    pro: "PRO",
    labels: {none: "Kikapcsolva", standard: "Altalanos", meeting: "Megbeszeles", study: "Tanulas", course_lecture: "Kurzus", interview: "Interju", podcast: "Podcast"}
  },
  id: {
    summaryTemplate: "Template ringkasan",
    selectTemplate: "Pilih template",
    pro: "PRO",
    labels: {none: "Mati", standard: "Umum", meeting: "Rapat", study: "Belajar", course_lecture: "Kursus", interview: "Wawancara", podcast: "Podcast"}
  },
  it: {
    summaryTemplate: "Modello riepilogo",
    selectTemplate: "Scegli un modello",
    pro: "PRO",
    labels: {none: "Disattivato", standard: "Generale", meeting: "Riunione", study: "Studio", course_lecture: "Corso", interview: "Intervista", podcast: "Podcast"}
  },
  ja: {
    summaryTemplate: "要約テンプレート",
    selectTemplate: "テンプレートを選択",
    pro: "PRO",
    labels: {none: "オフ", standard: "一般", meeting: "会議", study: "学習", course_lecture: "コース", interview: "インタビュー", podcast: "ポッドキャスト"}
  },
  ko: {
    summaryTemplate: "요약 템플릿",
    selectTemplate: "템플릿 선택",
    pro: "PRO",
    labels: {none: "끄기", standard: "일반", meeting: "회의", study: "학습", course_lecture: "강의", interview: "인터뷰", podcast: "팟캐스트"}
  },
  nl: {
    summaryTemplate: "Samenvattingssjabloon",
    selectTemplate: "Kies een sjabloon",
    pro: "PRO",
    labels: {none: "Uit", standard: "Algemeen", meeting: "Vergadering", study: "Studie", course_lecture: "Cursus", interview: "Interview", podcast: "Podcast"}
  },
  pl: {
    summaryTemplate: "Szablon podsumowania",
    selectTemplate: "Wybierz szablon",
    pro: "PRO",
    labels: {none: "Wylaczone", standard: "Ogolne", meeting: "Spotkanie", study: "Nauka", course_lecture: "Kurs", interview: "Wywiad", podcast: "Podcast"}
  },
  pt: {
    summaryTemplate: "Modelo de resumo",
    selectTemplate: "Escolha um modelo",
    pro: "PRO",
    labels: {none: "Desativado", standard: "Geral", meeting: "Reuniao", study: "Estudo", course_lecture: "Curso", interview: "Entrevista", podcast: "Podcast"}
  },
  ru: {
    summaryTemplate: "Шаблон сводки",
    selectTemplate: "Выберите шаблон",
    pro: "PRO",
    labels: {none: "Выкл.", standard: "Общий", meeting: "Встреча", study: "Учеба", course_lecture: "Курс", interview: "Интервью", podcast: "Подкаст"}
  },
  th: {
    summaryTemplate: "เทมเพลตสรุป",
    selectTemplate: "เลือกเทมเพลต",
    pro: "PRO",
    labels: {none: "ปิด", standard: "ทั่วไป", meeting: "ประชุม", study: "ศึกษา", course_lecture: "คอร์ส", interview: "สัมภาษณ์", podcast: "พอดแคสต์"}
  },
  tr: {
    summaryTemplate: "Ozet sablonu",
    selectTemplate: "Sablon sec",
    pro: "PRO",
    labels: {none: "Kapali", standard: "Genel", meeting: "Toplanti", study: "Calisma", course_lecture: "Kurs", interview: "Ropörtaj", podcast: "Podcast"}
  },
  uk: {
    summaryTemplate: "Шаблон підсумку",
    selectTemplate: "Виберіть шаблон",
    pro: "PRO",
    labels: {none: "Вимк.", standard: "Загальний", meeting: "Зустріч", study: "Навчання", course_lecture: "Курс", interview: "Інтерв'ю", podcast: "Подкаст"}
  },
  vi: {
    summaryTemplate: "Mau tom tat",
    selectTemplate: "Chon mau",
    pro: "PRO",
    labels: {none: "Tat", standard: "Chung", meeting: "Hop", study: "Hoc tap", course_lecture: "Khoa hoc", interview: "Phong van", podcast: "Podcast"}
  },
  zh: {
    summaryTemplate: "摘要模板",
    selectTemplate: "选择模板",
    pro: "会员",
    labels: {none: "关闭", standard: "通用", meeting: "会议", study: "学习", course_lecture: "课程", interview: "采访", podcast: "播客"}
  },
  "zh-TW": {
    summaryTemplate: "摘要範本",
    selectTemplate: "選擇範本",
    pro: "會員",
    labels: {none: "關閉", standard: "通用", meeting: "會議", study: "學習", course_lecture: "課程", interview: "訪談", podcast: "Podcast"}
  }
};

function summaryTemplateUiFor(locale: string) {
  return summaryTemplateUiCopy[isLocale(locale) ? locale : "en"];
}

function summaryTemplateLabel(locale: string, value: SummaryTemplateInput) {
  return summaryTemplateUiFor(locale).labels[value] ?? summaryTemplateUiCopy.en.labels[value];
}

type MindMapUiCopy = {
  title: string;
  emptyText: string;
  generate: string;
  loading: string;
  closeFullScreen: string;
  regenerate: string;
  download: string;
  imageFile: string;
  markdownFile: string;
  xmindFile: string;
  zoomIn: string;
  zoomOut: string;
  fitToView: string;
  fullScreen: string;
  exitFullScreen: string;
  unableRender: string;
  canvasUnavailable: string;
  unableDownload: string;
};

const mindMapUiCopy: Record<Locale, MindMapUiCopy> = {
  ar: {title: "خريطة ذهنية", emptyText: "سيُنشئ الذكاء الاصطناعي خريطة ذهنية مرئية من بنية التفريغ", generate: "إنشاء", loading: "جار تحليل بنية المحتوى...", closeFullScreen: "إغلاق ملء الشاشة", regenerate: "إعادة إنشاء الخريطة الذهنية", download: "تنزيل الخريطة الذهنية", imageFile: "ملف صورة (.png)", markdownFile: "ملف Markdown (.md)", xmindFile: "ملف XMind (.xmind)", zoomIn: "تكبير", zoomOut: "تصغير", fitToView: "ملاءمة العرض", fullScreen: "ملء الشاشة", exitFullScreen: "الخروج من ملء الشاشة", unableRender: "تعذر عرض صورة الخريطة الذهنية.", canvasUnavailable: "لوحة الرسم غير متاحة.", unableDownload: "تعذر تنزيل صورة الخريطة الذهنية."},
  de: {title: "Mindmap", emptyText: "AI erstellt aus der Transkriptstruktur eine visuelle Mindmap", generate: "Erstellen", loading: "Inhaltsstruktur wird analysiert...", closeFullScreen: "Vollbild schliessen", regenerate: "Mindmap neu erstellen", download: "Mindmap herunterladen", imageFile: "Bilddatei (.png)", markdownFile: "Markdown-Datei (.md)", xmindFile: "XMind-Datei (.xmind)", zoomIn: "Vergrossern", zoomOut: "Verkleinern", fitToView: "An Ansicht anpassen", fullScreen: "Vollbild", exitFullScreen: "Vollbild verlassen", unableRender: "Mindmap-Bild konnte nicht gerendert werden.", canvasUnavailable: "Canvas ist nicht verfugbar.", unableDownload: "Mindmap-Bild konnte nicht heruntergeladen werden."},
  en: {title: "Mind Map", emptyText: "AI will generate a visual mind map from the transcription structure", generate: "Generate", loading: "Analyzing content structure...", closeFullScreen: "Close full screen", regenerate: "Regenerate mind map", download: "Download mind map", imageFile: "Image File (.png)", markdownFile: "Markdown File (.md)", xmindFile: "XMind File (.xmind)", zoomIn: "Zoom in", zoomOut: "Zoom out", fitToView: "Fit to view", fullScreen: "Full screen", exitFullScreen: "Exit full screen", unableRender: "Unable to render the mind map image.", canvasUnavailable: "Canvas is not available.", unableDownload: "Unable to download the mind map image."},
  es: {title: "Mapa mental", emptyText: "La IA generara un mapa mental visual a partir de la estructura de la transcripcion", generate: "Generar", loading: "Analizando la estructura del contenido...", closeFullScreen: "Cerrar pantalla completa", regenerate: "Regenerar mapa mental", download: "Descargar mapa mental", imageFile: "Archivo de imagen (.png)", markdownFile: "Archivo Markdown (.md)", xmindFile: "Archivo XMind (.xmind)", zoomIn: "Acercar", zoomOut: "Alejar", fitToView: "Ajustar a la vista", fullScreen: "Pantalla completa", exitFullScreen: "Salir de pantalla completa", unableRender: "No se pudo renderizar la imagen del mapa mental.", canvasUnavailable: "El lienzo no esta disponible.", unableDownload: "No se pudo descargar la imagen del mapa mental."},
  fr: {title: "Carte mentale", emptyText: "L'IA generera une carte mentale visuelle a partir de la structure de la transcription", generate: "Generer", loading: "Analyse de la structure du contenu...", closeFullScreen: "Fermer le plein ecran", regenerate: "Regenerer la carte mentale", download: "Telecharger la carte mentale", imageFile: "Fichier image (.png)", markdownFile: "Fichier Markdown (.md)", xmindFile: "Fichier XMind (.xmind)", zoomIn: "Zoom avant", zoomOut: "Zoom arriere", fitToView: "Ajuster a la vue", fullScreen: "Plein ecran", exitFullScreen: "Quitter le plein ecran", unableRender: "Impossible de rendre l'image de la carte mentale.", canvasUnavailable: "Le canevas n'est pas disponible.", unableDownload: "Impossible de telecharger l'image de la carte mentale."},
  hu: {title: "Gondolatterkep", emptyText: "Az AI vizualis gondolatterkepet keszit az atirat szerkezetebol", generate: "Generalas", loading: "Tartalomszerkezet elemzese...", closeFullScreen: "Teljes kepernyo bezarasa", regenerate: "Gondolatterkep ujrageneralasa", download: "Gondolatterkep letoltese", imageFile: "Kepfajl (.png)", markdownFile: "Markdown fajl (.md)", xmindFile: "XMind fajl (.xmind)", zoomIn: "Nagyitas", zoomOut: "Kicsinyites", fitToView: "Nezethez igazit", fullScreen: "Teljes kepernyo", exitFullScreen: "Kilepes teljes kepernyobol", unableRender: "A gondolatterkep kep nem renderelheto.", canvasUnavailable: "A canvas nem elerheto.", unableDownload: "A gondolatterkep kep nem toltheto le."},
  id: {title: "Peta pikiran", emptyText: "AI akan membuat peta pikiran visual dari struktur transkrip", generate: "Buat", loading: "Menganalisis struktur konten...", closeFullScreen: "Tutup layar penuh", regenerate: "Buat ulang peta pikiran", download: "Unduh peta pikiran", imageFile: "File gambar (.png)", markdownFile: "File Markdown (.md)", xmindFile: "File XMind (.xmind)", zoomIn: "Perbesar", zoomOut: "Perkecil", fitToView: "Sesuaikan tampilan", fullScreen: "Layar penuh", exitFullScreen: "Keluar layar penuh", unableRender: "Tidak dapat merender gambar peta pikiran.", canvasUnavailable: "Canvas tidak tersedia.", unableDownload: "Tidak dapat mengunduh gambar peta pikiran."},
  it: {title: "Mappa mentale", emptyText: "L'AI generera una mappa mentale visiva dalla struttura della trascrizione", generate: "Genera", loading: "Analisi della struttura del contenuto...", closeFullScreen: "Chiudi schermo intero", regenerate: "Rigenera mappa mentale", download: "Scarica mappa mentale", imageFile: "File immagine (.png)", markdownFile: "File Markdown (.md)", xmindFile: "File XMind (.xmind)", zoomIn: "Ingrandisci", zoomOut: "Riduci", fitToView: "Adatta alla vista", fullScreen: "Schermo intero", exitFullScreen: "Esci da schermo intero", unableRender: "Impossibile renderizzare l'immagine della mappa mentale.", canvasUnavailable: "Canvas non disponibile.", unableDownload: "Impossibile scaricare l'immagine della mappa mentale."},
  ja: {title: "マインドマップ", emptyText: "AIが文字起こしの構造から視覚的なマインドマップを生成します", generate: "生成", loading: "コンテンツ構造を分析しています...", closeFullScreen: "全画面を閉じる", regenerate: "マインドマップを再生成", download: "マインドマップをダウンロード", imageFile: "画像ファイル (.png)", markdownFile: "Markdown ファイル (.md)", xmindFile: "XMind ファイル (.xmind)", zoomIn: "拡大", zoomOut: "縮小", fitToView: "表示に合わせる", fullScreen: "全画面", exitFullScreen: "全画面を終了", unableRender: "マインドマップ画像をレンダリングできません。", canvasUnavailable: "Canvas を利用できません。", unableDownload: "マインドマップ画像をダウンロードできません。"},
  ko: {title: "마인드맵", emptyText: "AI가 전사 구조에서 시각적 마인드맵을 생성합니다", generate: "생성", loading: "콘텐츠 구조 분석 중...", closeFullScreen: "전체 화면 닫기", regenerate: "마인드맵 다시 생성", download: "마인드맵 다운로드", imageFile: "이미지 파일 (.png)", markdownFile: "Markdown 파일 (.md)", xmindFile: "XMind 파일 (.xmind)", zoomIn: "확대", zoomOut: "축소", fitToView: "화면에 맞춤", fullScreen: "전체 화면", exitFullScreen: "전체 화면 종료", unableRender: "마인드맵 이미지를 렌더링할 수 없습니다.", canvasUnavailable: "Canvas를 사용할 수 없습니다.", unableDownload: "마인드맵 이미지를 다운로드할 수 없습니다."},
  nl: {title: "Mindmap", emptyText: "AI maakt een visuele mindmap van de transcriptstructuur", generate: "Genereren", loading: "Contentstructuur analyseren...", closeFullScreen: "Volledig scherm sluiten", regenerate: "Mindmap opnieuw genereren", download: "Mindmap downloaden", imageFile: "Afbeeldingsbestand (.png)", markdownFile: "Markdown-bestand (.md)", xmindFile: "XMind-bestand (.xmind)", zoomIn: "Inzoomen", zoomOut: "Uitzoomen", fitToView: "Passend maken", fullScreen: "Volledig scherm", exitFullScreen: "Volledig scherm verlaten", unableRender: "Kan de mindmapafbeelding niet renderen.", canvasUnavailable: "Canvas is niet beschikbaar.", unableDownload: "Kan de mindmapafbeelding niet downloaden."},
  pl: {title: "Mapa mysli", emptyText: "AI wygeneruje wizualna mape mysli ze struktury transkrypcji", generate: "Generuj", loading: "Analiza struktury tresci...", closeFullScreen: "Zamknij pelny ekran", regenerate: "Wygeneruj mape mysli ponownie", download: "Pobierz mape mysli", imageFile: "Plik obrazu (.png)", markdownFile: "Plik Markdown (.md)", xmindFile: "Plik XMind (.xmind)", zoomIn: "Powieksz", zoomOut: "Pomniejsz", fitToView: "Dopasuj do widoku", fullScreen: "Pelny ekran", exitFullScreen: "Opusc pelny ekran", unableRender: "Nie mozna wyrenderowac obrazu mapy mysli.", canvasUnavailable: "Canvas jest niedostepny.", unableDownload: "Nie mozna pobrac obrazu mapy mysli."},
  pt: {title: "Mapa mental", emptyText: "A AI vai gerar um mapa mental visual a partir da estrutura da transcricao", generate: "Gerar", loading: "Analisando a estrutura do conteudo...", closeFullScreen: "Fechar tela cheia", regenerate: "Gerar mapa mental novamente", download: "Baixar mapa mental", imageFile: "Arquivo de imagem (.png)", markdownFile: "Arquivo Markdown (.md)", xmindFile: "Arquivo XMind (.xmind)", zoomIn: "Aumentar zoom", zoomOut: "Diminuir zoom", fitToView: "Ajustar a visualizacao", fullScreen: "Tela cheia", exitFullScreen: "Sair da tela cheia", unableRender: "Nao foi possivel renderizar a imagem do mapa mental.", canvasUnavailable: "Canvas nao esta disponivel.", unableDownload: "Nao foi possivel baixar a imagem do mapa mental."},
  ru: {title: "Майнд-карта", emptyText: "AI создаст визуальную майнд-карту из структуры расшифровки", generate: "Создать", loading: "Анализ структуры контента...", closeFullScreen: "Закрыть полноэкранный режим", regenerate: "Создать майнд-карту заново", download: "Скачать майнд-карту", imageFile: "Файл изображения (.png)", markdownFile: "Файл Markdown (.md)", xmindFile: "Файл XMind (.xmind)", zoomIn: "Увеличить", zoomOut: "Уменьшить", fitToView: "По размеру окна", fullScreen: "Полный экран", exitFullScreen: "Выйти из полного экрана", unableRender: "Не удалось отрисовать изображение майнд-карты.", canvasUnavailable: "Canvas недоступен.", unableDownload: "Не удалось скачать изображение майнд-карты."},
  th: {title: "แผนผังความคิด", emptyText: "AI จะสร้างแผนผังความคิดจากโครงสร้างทรานสคริปต์", generate: "สร้าง", loading: "กำลังวิเคราะห์โครงสร้างเนื้อหา...", closeFullScreen: "ปิดเต็มหน้าจอ", regenerate: "สร้างแผนผังความคิดใหม่", download: "ดาวน์โหลดแผนผังความคิด", imageFile: "ไฟล์รูปภาพ (.png)", markdownFile: "ไฟล์ Markdown (.md)", xmindFile: "ไฟล์ XMind (.xmind)", zoomIn: "ซูมเข้า", zoomOut: "ซูมออก", fitToView: "พอดีกับหน้าจอ", fullScreen: "เต็มหน้าจอ", exitFullScreen: "ออกจากเต็มหน้าจอ", unableRender: "ไม่สามารถแสดงรูปแผนผังความคิดได้", canvasUnavailable: "Canvas ไม่พร้อมใช้งาน", unableDownload: "ไม่สามารถดาวน์โหลดรูปแผนผังความคิดได้"},
  tr: {title: "Zihin haritasi", emptyText: "AI transkript yapisindan gorsel bir zihin haritasi olusturur", generate: "Olustur", loading: "Icerik yapisi analiz ediliyor...", closeFullScreen: "Tam ekrani kapat", regenerate: "Zihin haritasini yeniden olustur", download: "Zihin haritasini indir", imageFile: "Gorsel dosyasi (.png)", markdownFile: "Markdown dosyasi (.md)", xmindFile: "XMind dosyasi (.xmind)", zoomIn: "Yakinlastir", zoomOut: "Uzaklastir", fitToView: "Gorunume sigdir", fullScreen: "Tam ekran", exitFullScreen: "Tam ekrandan cik", unableRender: "Zihin haritasi gorseli olusturulamadi.", canvasUnavailable: "Canvas kullanilamiyor.", unableDownload: "Zihin haritasi gorseli indirilemedi."},
  uk: {title: "Ментальна карта", emptyText: "AI створить візуальну ментальну карту зі структури транскрипції", generate: "Створити", loading: "Аналіз структури контенту...", closeFullScreen: "Закрити повний екран", regenerate: "Створити ментальну карту знову", download: "Завантажити ментальну карту", imageFile: "Файл зображення (.png)", markdownFile: "Файл Markdown (.md)", xmindFile: "Файл XMind (.xmind)", zoomIn: "Збільшити", zoomOut: "Зменшити", fitToView: "За розміром вікна", fullScreen: "Повний екран", exitFullScreen: "Вийти з повного екрана", unableRender: "Не вдалося відтворити зображення ментальної карти.", canvasUnavailable: "Canvas недоступний.", unableDownload: "Не вдалося завантажити зображення ментальної карти."},
  vi: {title: "Ban do tu duy", emptyText: "AI se tao ban do tu duy truc quan tu cau truc ban ghi", generate: "Tao", loading: "Dang phan tich cau truc noi dung...", closeFullScreen: "Dong toan man hinh", regenerate: "Tao lai ban do tu duy", download: "Tai ban do tu duy", imageFile: "Tep hinh anh (.png)", markdownFile: "Tep Markdown (.md)", xmindFile: "Tep XMind (.xmind)", zoomIn: "Phong to", zoomOut: "Thu nho", fitToView: "Vua khung nhin", fullScreen: "Toan man hinh", exitFullScreen: "Thoat toan man hinh", unableRender: "Khong the hien thi hinh ban do tu duy.", canvasUnavailable: "Canvas khong kha dung.", unableDownload: "Khong the tai hinh ban do tu duy."},
  zh: {title: "思维导图", emptyText: "AI 将根据转写结构生成可视化思维导图", generate: "生成", loading: "正在分析内容结构...", closeFullScreen: "关闭全屏", regenerate: "重新生成思维导图", download: "下载思维导图", imageFile: "图片文件 (.png)", markdownFile: "Markdown 文件 (.md)", xmindFile: "XMind 文件 (.xmind)", zoomIn: "放大", zoomOut: "缩小", fitToView: "适应视图", fullScreen: "全屏", exitFullScreen: "退出全屏", unableRender: "无法渲染思维导图图片。", canvasUnavailable: "Canvas 不可用。", unableDownload: "无法下载思维导图图片。"},
  "zh-TW": {title: "心智圖", emptyText: "AI 會根據轉寫結構生成視覺化心智圖", generate: "生成", loading: "正在分析內容結構...", closeFullScreen: "關閉全螢幕", regenerate: "重新生成心智圖", download: "下載心智圖", imageFile: "圖片檔案 (.png)", markdownFile: "Markdown 檔案 (.md)", xmindFile: "XMind 檔案 (.xmind)", zoomIn: "放大", zoomOut: "縮小", fitToView: "適應視圖", fullScreen: "全螢幕", exitFullScreen: "退出全螢幕", unableRender: "無法渲染心智圖圖片。", canvasUnavailable: "Canvas 不可用。", unableDownload: "無法下載心智圖圖片。"}
};

function mindMapUiFor(locale: string) {
  return mindMapUiCopy[isLocale(locale) ? locale : "en"];
}

type UpgradeUiCopy = {
  upgradeTitle: string;
  upgradeDescription: string;
  upgradeNow: string;
  collapseUpgradeBanner: string;
  detailUpgradeText: string;
  close: string;
  premiumFeature: string;
  mindMapExportTitle: string;
  mindMapPremiumDescription: string;
  maybeLater: string;
  yearlyPlan: string;
  yearlyNote: string;
  yearlyBadge: string;
  monthlyPlan: string;
  monthlyNote: string;
  perMonth: string;
  summaryLimitTitle: string;
  summaryLimitDescription: string;
  subscription: string;
  upgradeBasicTitle: string;
  basicFeatures: string[];
  seeAllPlans: string;
  cancelAnytime: string;
  instantAccess: string;
};

const upgradeUiCopy: Record<Locale, UpgradeUiCopy> = {
  ar: {
    upgradeTitle: "قم بترقية خطتك",
    upgradeDescription: "افتح تفريغات أطول، وقوالب ملخصات مميزة، والتعرف على المتحدثين، ورؤى AI غير محدودة.",
    upgradeNow: "ترقية الآن",
    collapseUpgradeBanner: "طي شريط الترقية",
    detailUpgradeText: "قم بالترقية لمزيد من وقت التفريغ والميزات المميزة",
    close: "إغلاق",
    premiumFeature: "ميزة مميزة",
    mindMapExportTitle: "تصدير الخريطة الذهنية ميزة مميزة",
    mindMapPremiumDescription: "هذه الميزة المتقدمة متاحة للمستخدمين المدفوعين فقط. قم بترقية خطتك لفتحها مع ميزات قوية أخرى.",
    maybeLater: "ربما لاحقاً",
    yearlyPlan: "الخطة السنوية",
    yearlyNote: "فوترة سنوية (72 دولار/سنة)",
    yearlyBadge: "خصم 40%",
    monthlyPlan: "الخطة الشهرية",
    monthlyNote: "إلغاء في أي وقت",
    perMonth: "/شهر",
    summaryLimitTitle: "تم الوصول إلى حد الملخص",
    summaryLimitDescription: "لقد وصلت إلى الحد المجاني وهو ملخصان لهذا التفريغ.",
    subscription: "اشتراك",
    upgradeBasicTitle: "قم بالترقية إلى خطة Basic الآن",
    basicFeatures: ["1200 دقيقة تفريغ شهرياً", "نموذج تفريغ مميز بأعلى دقة", "كل ملف حتى 10 ساعات / 5 GB. ارفع 50 ملفاً دفعة واحدة.", "بدون حد يومي لعدد ملفات التفريغ"],
    seeAllPlans: "عرض كل الخطط",
    cancelAnytime: "إلغاء في أي وقت",
    instantAccess: "وصول فوري"
  },
  de: {
    upgradeTitle: "Plan upgraden",
    upgradeDescription: "Schalte längere Transkriptionen, Premium-Zusammenfassungsvorlagen, Sprechererkennung und unbegrenzte AI-Insights frei.",
    upgradeNow: "Jetzt upgraden",
    collapseUpgradeBanner: "Upgrade-Hinweis einklappen",
    detailUpgradeText: "Upgrade für mehr Transkriptionszeit und Premium-Funktionen",
    close: "Schließen",
    premiumFeature: "Premium-Funktion",
    mindMapExportTitle: "Mindmap-Export ist eine Premium-Funktion",
    mindMapPremiumDescription: "Diese erweiterte Funktion ist nur für zahlende Nutzer verfügbar. Upgrade deinen Plan, um sie und viele weitere starke Funktionen freizuschalten.",
    maybeLater: "Vielleicht später",
    yearlyPlan: "Jahresplan",
    yearlyNote: "Jährlich abgerechnet (72 $/Jahr)",
    yearlyBadge: "40% Rabatt",
    monthlyPlan: "Monatsplan",
    monthlyNote: "Jederzeit kündbar",
    perMonth: "/Monat",
    summaryLimitTitle: "Zusammenfassungslimit erreicht",
    summaryLimitDescription: "Du hast das kostenlose Limit von 2 Zusammenfassungen für dieses Transkript erreicht.",
    subscription: "Abo",
    upgradeBasicTitle: "Jetzt auf Basic upgraden",
    basicFeatures: ["1200 Minuten Transkription pro Monat", "Premium-Transkriptionsmodell mit höchster Genauigkeit", "Jede Datei bis zu 10 Stunden / 5 GB. 50 Dateien gleichzeitig hochladen.", "Kein tägliches Dateilimit für Transkriptionen"],
    seeAllPlans: "Alle Pläne anzeigen",
    cancelAnytime: "Jederzeit kündbar",
    instantAccess: "Sofortiger Zugriff"
  },
  en: {
    upgradeTitle: "Upgrade Your Plan",
    upgradeDescription: "Unlock longer transcriptions, premium summary templates, speaker identification, and unlimited AI insights.",
    upgradeNow: "Upgrade Now",
    collapseUpgradeBanner: "Collapse upgrade banner",
    detailUpgradeText: "Upgrade for more transcription time and premium features",
    close: "Close",
    premiumFeature: "Premium Feature",
    mindMapExportTitle: "Mindmap Export is a Premium Feature",
    mindMapPremiumDescription: "This advanced feature is available exclusively for paid users. Upgrade your plan to unlock this and many other powerful features.",
    maybeLater: "Maybe Later",
    yearlyPlan: "Yearly Plan",
    yearlyNote: "Billed yearly ($72/year)",
    yearlyBadge: "40% OFF",
    monthlyPlan: "Monthly Plan",
    monthlyNote: "Cancel anytime",
    perMonth: "/mo",
    summaryLimitTitle: "Summary Limit Reached",
    summaryLimitDescription: "You have reached the free limit of 2 summaries for this transcript.",
    subscription: "SUBSCRIPTION",
    upgradeBasicTitle: "Upgrade to Basic Plan Now",
    basicFeatures: ["1200 minutes of transcription per month", "Premium transcription model (highest accuracy)", "Each file can be up to 10 hours long / 5 GB. Upload 50 files at a time.", "No daily file limit for transcription"],
    seeAllPlans: "See All Plans",
    cancelAnytime: "Cancel anytime",
    instantAccess: "Instant access"
  },
  es: {
    upgradeTitle: "Mejora tu plan",
    upgradeDescription: "Desbloquea transcripciones más largas, plantillas premium de resumen, identificación de hablantes e insights de AI ilimitados.",
    upgradeNow: "Mejorar ahora",
    collapseUpgradeBanner: "Contraer aviso de mejora",
    detailUpgradeText: "Mejora para obtener más tiempo de transcripción y funciones premium",
    close: "Cerrar",
    premiumFeature: "Función premium",
    mindMapExportTitle: "Exportar mapa mental es una función premium",
    mindMapPremiumDescription: "Esta función avanzada está disponible exclusivamente para usuarios de pago. Mejora tu plan para desbloquearla junto con muchas otras funciones potentes.",
    maybeLater: "Quizá más tarde",
    yearlyPlan: "Plan anual",
    yearlyNote: "Facturado anualmente ($72/año)",
    yearlyBadge: "40% dto.",
    monthlyPlan: "Plan mensual",
    monthlyNote: "Cancela cuando quieras",
    perMonth: "/mes",
    summaryLimitTitle: "Límite de resumen alcanzado",
    summaryLimitDescription: "Has alcanzado el límite gratuito de 2 resúmenes para esta transcripción.",
    subscription: "Suscripción",
    upgradeBasicTitle: "Mejora al plan Basic ahora",
    basicFeatures: ["1200 minutos de transcripción al mes", "Modelo premium de transcripción con la mayor precisión", "Cada archivo puede durar hasta 10 horas / 5 GB. Sube 50 archivos a la vez.", "Sin límite diario de archivos para transcribir"],
    seeAllPlans: "Ver todos los planes",
    cancelAnytime: "Cancela cuando quieras",
    instantAccess: "Acceso instantáneo"
  },
  fr: {
    upgradeTitle: "Passez à un plan supérieur",
    upgradeDescription: "Débloquez des transcriptions plus longues, des modèles de résumé premium, l'identification des intervenants et des insights AI illimités.",
    upgradeNow: "Mettre à niveau",
    collapseUpgradeBanner: "Réduire la bannière de mise à niveau",
    detailUpgradeText: "Passez à un plan supérieur pour plus de temps de transcription et de fonctions premium",
    close: "Fermer",
    premiumFeature: "Fonction premium",
    mindMapExportTitle: "L'export de carte mentale est une fonction premium",
    mindMapPremiumDescription: "Cette fonction avancée est réservée aux utilisateurs payants. Mettez à niveau votre plan pour la débloquer, ainsi que de nombreuses autres fonctions puissantes.",
    maybeLater: "Peut-être plus tard",
    yearlyPlan: "Plan annuel",
    yearlyNote: "Facturé annuellement (72 $/an)",
    yearlyBadge: "-40%",
    monthlyPlan: "Plan mensuel",
    monthlyNote: "Annulation à tout moment",
    perMonth: "/mois",
    summaryLimitTitle: "Limite de résumé atteinte",
    summaryLimitDescription: "Vous avez atteint la limite gratuite de 2 résumés pour cette transcription.",
    subscription: "Abonnement",
    upgradeBasicTitle: "Passez au plan Basic maintenant",
    basicFeatures: ["1200 minutes de transcription par mois", "Modèle de transcription premium avec la meilleure précision", "Chaque fichier peut durer jusqu'à 10 heures / 5 GB. Téléversez 50 fichiers à la fois.", "Aucune limite quotidienne de fichiers à transcrire"],
    seeAllPlans: "Voir tous les plans",
    cancelAnytime: "Annulation à tout moment",
    instantAccess: "Accès immédiat"
  },
  hu: {
    upgradeTitle: "Csomag frissítése",
    upgradeDescription: "Nyiss meg hosszabb átiratokat, prémium összefoglaló sablonokat, beszélőazonosítást és korlátlan AI insightokat.",
    upgradeNow: "Frissítés most",
    collapseUpgradeBanner: "Frissítési sáv összecsukása",
    detailUpgradeText: "Frissíts több átírási időért és prémium funkciókért",
    close: "Bezárás",
    premiumFeature: "Prémium funkció",
    mindMapExportTitle: "A gondolattérkép export prémium funkció",
    mindMapPremiumDescription: "Ez a fejlett funkció csak fizető felhasználóknak érhető el. Frissítsd a csomagod, hogy ezt és sok más erős funkciót megnyiss.",
    maybeLater: "Talán később",
    yearlyPlan: "Éves csomag",
    yearlyNote: "Évente számlázva (72 $/év)",
    yearlyBadge: "40% kedvezmény",
    monthlyPlan: "Havi csomag",
    monthlyNote: "Bármikor lemondható",
    perMonth: "/hó",
    summaryLimitTitle: "Elérted az összefoglaló limitet",
    summaryLimitDescription: "Elérted az ingyenes limitet: 2 összefoglaló ehhez az átirathoz.",
    subscription: "Előfizetés",
    upgradeBasicTitle: "Frissítés Basic csomagra most",
    basicFeatures: ["1200 perc átírás havonta", "Prémium átírási modell a legjobb pontossággal", "Egy fájl akár 10 óra / 5 GB lehet. Egyszerre 50 fájlt tölthetsz fel.", "Nincs napi fájllimit az átíráshoz"],
    seeAllPlans: "Összes csomag",
    cancelAnytime: "Bármikor lemondható",
    instantAccess: "Azonnali hozzáférés"
  },
  id: {
    upgradeTitle: "Tingkatkan paket Anda",
    upgradeDescription: "Buka transkripsi lebih panjang, template ringkasan premium, identifikasi pembicara, dan insight AI tanpa batas.",
    upgradeNow: "Tingkatkan sekarang",
    collapseUpgradeBanner: "Ciutkan banner upgrade",
    detailUpgradeText: "Upgrade untuk waktu transkripsi lebih banyak dan fitur premium",
    close: "Tutup",
    premiumFeature: "Fitur premium",
    mindMapExportTitle: "Ekspor peta pikiran adalah fitur premium",
    mindMapPremiumDescription: "Fitur lanjutan ini hanya tersedia untuk pengguna berbayar. Tingkatkan paket untuk membukanya bersama banyak fitur kuat lainnya.",
    maybeLater: "Nanti saja",
    yearlyPlan: "Paket tahunan",
    yearlyNote: "Ditagih tahunan ($72/tahun)",
    yearlyBadge: "Diskon 40%",
    monthlyPlan: "Paket bulanan",
    monthlyNote: "Batal kapan saja",
    perMonth: "/bln",
    summaryLimitTitle: "Batas ringkasan tercapai",
    summaryLimitDescription: "Anda telah mencapai batas gratis 2 ringkasan untuk transkrip ini.",
    subscription: "Langganan",
    upgradeBasicTitle: "Tingkatkan ke paket Basic sekarang",
    basicFeatures: ["1200 menit transkripsi per bulan", "Model transkripsi premium dengan akurasi tertinggi", "Setiap file hingga 10 jam / 5 GB. Unggah 50 file sekaligus.", "Tidak ada batas file harian untuk transkripsi"],
    seeAllPlans: "Lihat semua paket",
    cancelAnytime: "Batal kapan saja",
    instantAccess: "Akses instan"
  },
  it: {
    upgradeTitle: "Aggiorna il piano",
    upgradeDescription: "Sblocca trascrizioni più lunghe, modelli di riepilogo premium, identificazione dei parlanti e insight AI illimitati.",
    upgradeNow: "Aggiorna ora",
    collapseUpgradeBanner: "Comprimi banner upgrade",
    detailUpgradeText: "Aggiorna per più tempo di trascrizione e funzioni premium",
    close: "Chiudi",
    premiumFeature: "Funzione premium",
    mindMapExportTitle: "L'esportazione della mappa mentale è una funzione premium",
    mindMapPremiumDescription: "Questa funzione avanzata è disponibile solo per utenti a pagamento. Aggiorna il piano per sbloccarla insieme a molte altre funzioni potenti.",
    maybeLater: "Forse più tardi",
    yearlyPlan: "Piano annuale",
    yearlyNote: "Fatturato annualmente ($72/anno)",
    yearlyBadge: "40% sconto",
    monthlyPlan: "Piano mensile",
    monthlyNote: "Annulla quando vuoi",
    perMonth: "/mese",
    summaryLimitTitle: "Limite riepiloghi raggiunto",
    summaryLimitDescription: "Hai raggiunto il limite gratuito di 2 riepiloghi per questa trascrizione.",
    subscription: "Abbonamento",
    upgradeBasicTitle: "Aggiorna subito al piano Basic",
    basicFeatures: ["1200 minuti di trascrizione al mese", "Modello di trascrizione premium con la massima accuratezza", "Ogni file può durare fino a 10 ore / 5 GB. Carica 50 file alla volta.", "Nessun limite giornaliero di file per la trascrizione"],
    seeAllPlans: "Vedi tutti i piani",
    cancelAnytime: "Annulla quando vuoi",
    instantAccess: "Accesso immediato"
  },
  ja: {
    upgradeTitle: "プランをアップグレード",
    upgradeDescription: "より長い文字起こし、プレミアム要約テンプレート、話者識別、無制限のAIインサイトを利用できます。",
    upgradeNow: "今すぐアップグレード",
    collapseUpgradeBanner: "アップグレードバナーを閉じる",
    detailUpgradeText: "文字起こし時間とプレミアム機能を増やすにはアップグレード",
    close: "閉じる",
    premiumFeature: "プレミアム機能",
    mindMapExportTitle: "マインドマップのエクスポートはプレミアム機能です",
    mindMapPremiumDescription: "この高度な機能は有料ユーザー専用です。プランをアップグレードすると、この機能と多くの強力な機能を利用できます。",
    maybeLater: "後で",
    yearlyPlan: "年額プラン",
    yearlyNote: "年払い（$72/年）",
    yearlyBadge: "40%オフ",
    monthlyPlan: "月額プラン",
    monthlyNote: "いつでもキャンセル可能",
    perMonth: "/月",
    summaryLimitTitle: "要約の上限に達しました",
    summaryLimitDescription: "この文字起こしで無料枠の2件の要約に達しました。",
    subscription: "サブスクリプション",
    upgradeBasicTitle: "今すぐBasicプランへアップグレード",
    basicFeatures: ["月1200分の文字起こし", "最高精度のプレミアム文字起こしモデル", "各ファイルは最大10時間 / 5 GB。50ファイルを同時にアップロードできます。", "文字起こしの1日あたりファイル数制限なし"],
    seeAllPlans: "すべてのプランを見る",
    cancelAnytime: "いつでもキャンセル可能",
    instantAccess: "すぐに利用可能"
  },
  ko: {
    upgradeTitle: "요금제 업그레이드",
    upgradeDescription: "더 긴 전사, 프리미엄 요약 템플릿, 화자 식별, 무제한 AI 인사이트를 이용하세요.",
    upgradeNow: "지금 업그레이드",
    collapseUpgradeBanner: "업그레이드 배너 접기",
    detailUpgradeText: "더 많은 전사 시간과 프리미엄 기능을 위해 업그레이드하세요",
    close: "닫기",
    premiumFeature: "프리미엄 기능",
    mindMapExportTitle: "마인드맵 내보내기는 프리미엄 기능입니다",
    mindMapPremiumDescription: "이 고급 기능은 유료 사용자에게만 제공됩니다. 요금제를 업그레이드하면 이 기능과 다른 강력한 기능을 사용할 수 있습니다.",
    maybeLater: "나중에",
    yearlyPlan: "연간 요금제",
    yearlyNote: "연간 결제($72/년)",
    yearlyBadge: "40% 할인",
    monthlyPlan: "월간 요금제",
    monthlyNote: "언제든 취소",
    perMonth: "/월",
    summaryLimitTitle: "요약 한도 도달",
    summaryLimitDescription: "이 전사본의 무료 요약 한도 2회에 도달했습니다.",
    subscription: "구독",
    upgradeBasicTitle: "지금 Basic 요금제로 업그레이드",
    basicFeatures: ["월 1200분 전사", "최고 정확도의 프리미엄 전사 모델", "파일당 최대 10시간 / 5 GB. 한 번에 50개 파일 업로드.", "전사 파일 일일 제한 없음"],
    seeAllPlans: "모든 요금제 보기",
    cancelAnytime: "언제든 취소",
    instantAccess: "즉시 이용"
  },
  nl: {
    upgradeTitle: "Upgrade je abonnement",
    upgradeDescription: "Ontgrendel langere transcripties, premium samenvattingssjablonen, sprekerherkenning en onbeperkte AI-inzichten.",
    upgradeNow: "Nu upgraden",
    collapseUpgradeBanner: "Upgradebanner inklappen",
    detailUpgradeText: "Upgrade voor meer transcriptietijd en premiumfuncties",
    close: "Sluiten",
    premiumFeature: "Premiumfunctie",
    mindMapExportTitle: "Mindmap-export is een premiumfunctie",
    mindMapPremiumDescription: "Deze geavanceerde functie is alleen beschikbaar voor betalende gebruikers. Upgrade je abonnement om dit en veel andere krachtige functies te ontgrendelen.",
    maybeLater: "Misschien later",
    yearlyPlan: "Jaarabonnement",
    yearlyNote: "Jaarlijks gefactureerd ($72/jaar)",
    yearlyBadge: "40% korting",
    monthlyPlan: "Maandabonnement",
    monthlyNote: "Altijd opzegbaar",
    perMonth: "/mnd",
    summaryLimitTitle: "Samenvattingslimiet bereikt",
    summaryLimitDescription: "Je hebt de gratis limiet van 2 samenvattingen voor dit transcript bereikt.",
    subscription: "Abonnement",
    upgradeBasicTitle: "Upgrade nu naar Basic",
    basicFeatures: ["1200 minuten transcriptie per maand", "Premium transcriptiemodel met hoogste nauwkeurigheid", "Elk bestand mag tot 10 uur / 5 GB zijn. Upload 50 bestanden tegelijk.", "Geen dagelijkse bestandslimiet voor transcriptie"],
    seeAllPlans: "Alle abonnementen bekijken",
    cancelAnytime: "Altijd opzegbaar",
    instantAccess: "Directe toegang"
  },
  pl: {
    upgradeTitle: "Ulepsz plan",
    upgradeDescription: "Odblokuj dłuższe transkrypcje, szablony podsumowań premium, identyfikację mówców i nielimitowane insighty AI.",
    upgradeNow: "Ulepsz teraz",
    collapseUpgradeBanner: "Zwiń baner ulepszenia",
    detailUpgradeText: "Ulepsz, aby mieć więcej czasu transkrypcji i funkcje premium",
    close: "Zamknij",
    premiumFeature: "Funkcja premium",
    mindMapExportTitle: "Eksport mapy myśli to funkcja premium",
    mindMapPremiumDescription: "Ta zaawansowana funkcja jest dostępna wyłącznie dla płatnych użytkowników. Ulepsz plan, aby odblokować ją i wiele innych mocnych funkcji.",
    maybeLater: "Może później",
    yearlyPlan: "Plan roczny",
    yearlyNote: "Rozliczany rocznie ($72/rok)",
    yearlyBadge: "40% zniżki",
    monthlyPlan: "Plan miesięczny",
    monthlyNote: "Anuluj w dowolnym momencie",
    perMonth: "/mies.",
    summaryLimitTitle: "Osiągnięto limit podsumowań",
    summaryLimitDescription: "Osiągnięto darmowy limit 2 podsumowań dla tej transkrypcji.",
    subscription: "Subskrypcja",
    upgradeBasicTitle: "Ulepsz teraz do planu Basic",
    basicFeatures: ["1200 minut transkrypcji miesięcznie", "Model transkrypcji premium o najwyższej dokładności", "Każdy plik może mieć do 10 godzin / 5 GB. Prześlij 50 plików naraz.", "Brak dziennego limitu plików do transkrypcji"],
    seeAllPlans: "Zobacz wszystkie plany",
    cancelAnytime: "Anuluj w dowolnym momencie",
    instantAccess: "Natychmiastowy dostęp"
  },
  pt: {
    upgradeTitle: "Atualize seu plano",
    upgradeDescription: "Desbloqueie transcrições mais longas, modelos premium de resumo, identificação de falantes e insights de AI ilimitados.",
    upgradeNow: "Atualizar agora",
    collapseUpgradeBanner: "Recolher banner de upgrade",
    detailUpgradeText: "Atualize para mais tempo de transcrição e recursos premium",
    close: "Fechar",
    premiumFeature: "Recurso premium",
    mindMapExportTitle: "Exportar mapa mental é um recurso premium",
    mindMapPremiumDescription: "Este recurso avançado está disponível apenas para usuários pagantes. Atualize seu plano para desbloqueá-lo junto com muitos outros recursos poderosos.",
    maybeLater: "Talvez depois",
    yearlyPlan: "Plano anual",
    yearlyNote: "Cobrado anualmente ($72/ano)",
    yearlyBadge: "40% OFF",
    monthlyPlan: "Plano mensal",
    monthlyNote: "Cancele quando quiser",
    perMonth: "/mês",
    summaryLimitTitle: "Limite de resumo atingido",
    summaryLimitDescription: "Você atingiu o limite grátis de 2 resumos para esta transcrição.",
    subscription: "Assinatura",
    upgradeBasicTitle: "Atualize para o plano Basic agora",
    basicFeatures: ["1200 minutos de transcrição por mês", "Modelo premium de transcrição com maior precisão", "Cada arquivo pode ter até 10 horas / 5 GB. Envie 50 arquivos de uma vez.", "Sem limite diário de arquivos para transcrição"],
    seeAllPlans: "Ver todos os planos",
    cancelAnytime: "Cancele quando quiser",
    instantAccess: "Acesso imediato"
  },
  ru: {
    upgradeTitle: "Обновите план",
    upgradeDescription: "Откройте более длинные расшифровки, премиум-шаблоны сводок, распознавание спикеров и неограниченные AI-инсайты.",
    upgradeNow: "Обновить сейчас",
    collapseUpgradeBanner: "Свернуть баннер обновления",
    detailUpgradeText: "Обновитесь, чтобы получить больше времени расшифровки и премиум-функции",
    close: "Закрыть",
    premiumFeature: "Премиум-функция",
    mindMapExportTitle: "Экспорт майнд-карты — премиум-функция",
    mindMapPremiumDescription: "Эта расширенная функция доступна только платным пользователям. Обновите план, чтобы открыть ее и другие мощные возможности.",
    maybeLater: "Может быть позже",
    yearlyPlan: "Годовой план",
    yearlyNote: "Оплата ежегодно ($72/год)",
    yearlyBadge: "Скидка 40%",
    monthlyPlan: "Месячный план",
    monthlyNote: "Отмена в любое время",
    perMonth: "/мес.",
    summaryLimitTitle: "Достигнут лимит сводок",
    summaryLimitDescription: "Вы достигли бесплатного лимита: 2 сводки для этой расшифровки.",
    subscription: "Подписка",
    upgradeBasicTitle: "Обновитесь до Basic сейчас",
    basicFeatures: ["1200 минут расшифровки в месяц", "Премиум-модель расшифровки с максимальной точностью", "Каждый файл до 10 часов / 5 GB. Загружайте 50 файлов за раз.", "Без дневного лимита файлов для расшифровки"],
    seeAllPlans: "Все планы",
    cancelAnytime: "Отмена в любое время",
    instantAccess: "Мгновенный доступ"
  },
  th: {
    upgradeTitle: "อัปเกรดแพ็กเกจ",
    upgradeDescription: "ปลดล็อกทรานสคริปต์ที่ยาวขึ้น เทมเพลตสรุประดับพรีเมียม การระบุผู้พูด และ AI insights แบบไม่จำกัด",
    upgradeNow: "อัปเกรดตอนนี้",
    collapseUpgradeBanner: "ยุบแถบอัปเกรด",
    detailUpgradeText: "อัปเกรดเพื่อเวลาแปลงเสียงเพิ่มขึ้นและฟีเจอร์พรีเมียม",
    close: "ปิด",
    premiumFeature: "ฟีเจอร์พรีเมียม",
    mindMapExportTitle: "การส่งออกแผนผังความคิดเป็นฟีเจอร์พรีเมียม",
    mindMapPremiumDescription: "ฟีเจอร์ขั้นสูงนี้มีให้เฉพาะผู้ใช้แบบชำระเงิน อัปเกรดแพ็กเกจเพื่อปลดล็อกฟีเจอร์นี้และฟีเจอร์ทรงพลังอื่น ๆ",
    maybeLater: "ไว้ทีหลัง",
    yearlyPlan: "แพ็กเกจรายปี",
    yearlyNote: "เรียกเก็บรายปี ($72/ปี)",
    yearlyBadge: "ลด 40%",
    monthlyPlan: "แพ็กเกจรายเดือน",
    monthlyNote: "ยกเลิกได้ทุกเมื่อ",
    perMonth: "/เดือน",
    summaryLimitTitle: "ถึงขีดจำกัดสรุปแล้ว",
    summaryLimitDescription: "คุณใช้ขีดจำกัดฟรี 2 สรุปสำหรับทรานสคริปต์นี้แล้ว",
    subscription: "สมัครสมาชิก",
    upgradeBasicTitle: "อัปเกรดเป็น Basic ตอนนี้",
    basicFeatures: ["ถอดเสียง 1200 นาทีต่อเดือน", "โมเดลถอดเสียงพรีเมียม ความแม่นยำสูงสุด", "แต่ละไฟล์ยาวได้สูงสุด 10 ชั่วโมง / 5 GB อัปโหลดได้ครั้งละ 50 ไฟล์", "ไม่มีขีดจำกัดไฟล์ต่อวันสำหรับการถอดเสียง"],
    seeAllPlans: "ดูแพ็กเกจทั้งหมด",
    cancelAnytime: "ยกเลิกได้ทุกเมื่อ",
    instantAccess: "ใช้งานได้ทันที"
  },
  tr: {
    upgradeTitle: "Planını yükselt",
    upgradeDescription: "Daha uzun transkripsiyonlar, premium özet şablonları, konuşmacı tanıma ve sınırsız AI içgörüleri aç.",
    upgradeNow: "Şimdi yükselt",
    collapseUpgradeBanner: "Yükseltme bandını daralt",
    detailUpgradeText: "Daha fazla transkripsiyon süresi ve premium özellikler için yükselt",
    close: "Kapat",
    premiumFeature: "Premium özellik",
    mindMapExportTitle: "Zihin haritası dışa aktarma premium özelliktir",
    mindMapPremiumDescription: "Bu gelişmiş özellik yalnızca ücretli kullanıcılar içindir. Bunu ve birçok güçlü özelliği açmak için planını yükselt.",
    maybeLater: "Belki sonra",
    yearlyPlan: "Yıllık plan",
    yearlyNote: "Yıllık faturalandırılır ($72/yıl)",
    yearlyBadge: "%40 indirim",
    monthlyPlan: "Aylık plan",
    monthlyNote: "İstediğin zaman iptal",
    perMonth: "/ay",
    summaryLimitTitle: "Özet sınırına ulaşıldı",
    summaryLimitDescription: "Bu transkript için ücretsiz 2 özet sınırına ulaştın.",
    subscription: "Abonelik",
    upgradeBasicTitle: "Şimdi Basic plana yükselt",
    basicFeatures: ["Ayda 1200 dakika transkripsiyon", "En yüksek doğrulukta premium transkripsiyon modeli", "Her dosya 10 saate / 5 GB'a kadar olabilir. Tek seferde 50 dosya yükle.", "Transkripsiyon için günlük dosya sınırı yok"],
    seeAllPlans: "Tüm planları gör",
    cancelAnytime: "İstediğin zaman iptal",
    instantAccess: "Anında erişim"
  },
  uk: {
    upgradeTitle: "Оновіть план",
    upgradeDescription: "Відкрийте довші транскрипції, преміум-шаблони підсумків, розпізнавання спікерів і необмежені AI-інсайти.",
    upgradeNow: "Оновити зараз",
    collapseUpgradeBanner: "Згорнути банер оновлення",
    detailUpgradeText: "Оновіться для більшого часу транскрипції та преміум-функцій",
    close: "Закрити",
    premiumFeature: "Преміум-функція",
    mindMapExportTitle: "Експорт ментальної карти — преміум-функція",
    mindMapPremiumDescription: "Ця розширена функція доступна лише платним користувачам. Оновіть план, щоб відкрити її та інші потужні функції.",
    maybeLater: "Можливо пізніше",
    yearlyPlan: "Річний план",
    yearlyNote: "Річна оплата ($72/рік)",
    yearlyBadge: "Знижка 40%",
    monthlyPlan: "Місячний план",
    monthlyNote: "Скасування будь-коли",
    perMonth: "/міс.",
    summaryLimitTitle: "Досягнуто ліміту підсумків",
    summaryLimitDescription: "Ви досягли безкоштовного ліміту: 2 підсумки для цієї транскрипції.",
    subscription: "Підписка",
    upgradeBasicTitle: "Оновіться до Basic зараз",
    basicFeatures: ["1200 хвилин транскрипції на місяць", "Преміум-модель транскрипції з найвищою точністю", "Кожен файл до 10 годин / 5 GB. Завантажуйте 50 файлів за раз.", "Без денного ліміту файлів для транскрипції"],
    seeAllPlans: "Усі плани",
    cancelAnytime: "Скасування будь-коли",
    instantAccess: "Миттєвий доступ"
  },
  vi: {
    upgradeTitle: "Nâng cấp gói",
    upgradeDescription: "Mở khóa bản ghi dài hơn, mẫu tóm tắt cao cấp, nhận diện người nói và AI insights không giới hạn.",
    upgradeNow: "Nâng cấp ngay",
    collapseUpgradeBanner: "Thu gọn banner nâng cấp",
    detailUpgradeText: "Nâng cấp để có thêm thời lượng chuyển văn bản và tính năng cao cấp",
    close: "Đóng",
    premiumFeature: "Tính năng cao cấp",
    mindMapExportTitle: "Xuất bản đồ tư duy là tính năng cao cấp",
    mindMapPremiumDescription: "Tính năng nâng cao này chỉ dành cho người dùng trả phí. Nâng cấp gói để mở khóa tính năng này và nhiều tính năng mạnh mẽ khác.",
    maybeLater: "Để sau",
    yearlyPlan: "Gói năm",
    yearlyNote: "Thanh toán hằng năm ($72/năm)",
    yearlyBadge: "Giảm 40%",
    monthlyPlan: "Gói tháng",
    monthlyNote: "Hủy bất cứ lúc nào",
    perMonth: "/tháng",
    summaryLimitTitle: "Đã đạt giới hạn tóm tắt",
    summaryLimitDescription: "Bạn đã đạt giới hạn miễn phí 2 bản tóm tắt cho transcript này.",
    subscription: "Gói đăng ký",
    upgradeBasicTitle: "Nâng cấp lên gói Basic ngay",
    basicFeatures: ["1200 phút chuyển văn bản mỗi tháng", "Mô hình chuyển văn bản cao cấp với độ chính xác cao nhất", "Mỗi tệp tối đa 10 giờ / 5 GB. Tải lên 50 tệp cùng lúc.", "Không giới hạn số tệp chuyển văn bản mỗi ngày"],
    seeAllPlans: "Xem tất cả gói",
    cancelAnytime: "Hủy bất cứ lúc nào",
    instantAccess: "Truy cập tức thì"
  },
  zh: {
    upgradeTitle: "升级你的套餐",
    upgradeDescription: "解锁更长转写、高级摘要模板、说话人识别和不限量 AI 洞察。",
    upgradeNow: "立即升级",
    collapseUpgradeBanner: "收起升级提示",
    detailUpgradeText: "升级以获得更多转写时长和高级功能",
    close: "关闭",
    premiumFeature: "高级功能",
    mindMapExportTitle: "思维导图导出是高级功能",
    mindMapPremiumDescription: "此高级功能仅面向付费用户开放。升级套餐即可解锁它以及更多强大功能。",
    maybeLater: "稍后再说",
    yearlyPlan: "年付套餐",
    yearlyNote: "按年计费（$72/年）",
    yearlyBadge: "省 40%",
    monthlyPlan: "月付套餐",
    monthlyNote: "可随时取消",
    perMonth: "/月",
    summaryLimitTitle: "已达到摘要上限",
    summaryLimitDescription: "你已达到此转写稿 2 次免费摘要的上限。",
    subscription: "订阅",
    upgradeBasicTitle: "立即升级到 Basic 套餐",
    basicFeatures: ["每月 1200 分钟转写", "高级转写模型，准确率最高", "每个文件最长 10 小时 / 5 GB。一次可上传 50 个文件。", "转写文件无每日数量限制"],
    seeAllPlans: "查看全部套餐",
    cancelAnytime: "可随时取消",
    instantAccess: "立即生效"
  },
  "zh-TW": {
    upgradeTitle: "升級你的方案",
    upgradeDescription: "解鎖更長轉寫、高級摘要範本、說話者識別和不限量 AI 洞察。",
    upgradeNow: "立即升級",
    collapseUpgradeBanner: "收合升級提示",
    detailUpgradeText: "升級以取得更多轉寫時長和高級功能",
    close: "關閉",
    premiumFeature: "高級功能",
    mindMapExportTitle: "心智圖匯出是高級功能",
    mindMapPremiumDescription: "此高級功能僅提供給付費使用者。升級方案即可解鎖它以及更多強大功能。",
    maybeLater: "稍後再說",
    yearlyPlan: "年付方案",
    yearlyNote: "按年計費（$72/年）",
    yearlyBadge: "省 40%",
    monthlyPlan: "月付方案",
    monthlyNote: "可隨時取消",
    perMonth: "/月",
    summaryLimitTitle: "已達摘要上限",
    summaryLimitDescription: "你已達到此轉寫稿 2 次免費摘要的上限。",
    subscription: "訂閱",
    upgradeBasicTitle: "立即升級到 Basic 方案",
    basicFeatures: ["每月 1200 分鐘轉寫", "高級轉寫模型，準確率最高", "每個檔案最長 10 小時 / 5 GB。一次可上傳 50 個檔案。", "轉寫檔案無每日數量限制"],
    seeAllPlans: "查看全部方案",
    cancelAnytime: "可隨時取消",
    instantAccess: "立即啟用"
  }
};

function upgradeUiFor(locale: string) {
  return upgradeUiCopy[isLocale(locale) ? locale : "en"];
}

function summarySectionLabels(locale: string) {
  return transcriptionCopyFor(locale).summaryLabels;
}

function formatSummaryForCopy(summary: Record<string, unknown> | null | undefined) {
  if (!summary) return "";
  const lines: string[] = [];
  if (typeof summary.overview === "string" && summary.overview.trim()) {
    lines.push(summary.overview.trim());
  }
  const bullets = Array.isArray(summary.bullets) ? summary.bullets : [];
  const takeaways = Array.isArray(summary.takeaways) ? summary.takeaways : Array.isArray(summary.insights) ? summary.insights : [];
  for (const item of bullets) {
    const text = summaryEntryText(item as SummaryEntry);
    if (text) lines.push(`- ${text}`);
  }
  for (const item of takeaways) {
    const text = summaryEntryText(item as SummaryEntry);
    if (text) lines.push(`- ${text}`);
  }
  return lines.join("\n\n");
}

function SummaryContent({summary, locale, onSeek}: {summary: Record<string, any>; locale: string; onSeek?: (seconds: number) => void}) {
  const labels = summarySectionLabels(locale);
  const takeaways = summary.takeaways?.length ? summary.takeaways : summary.insights;

  return (
    <div className="grid gap-5">
      {summary.overview ? (
        <div>
          <h2 className="text-base font-semibold leading-6 text-[rgb(2,8,23)]">{labels.overview}</h2>
          <p className="mt-2 text-[14px] leading-5 text-[rgba(2,8,23,0.8)]">{summary.overview}</p>
        </div>
      ) : null}
      {summary.bullets?.length ? (
        <div>
          <h2 className="text-base font-semibold leading-6 text-[rgb(2,8,23)]">{labels.keyPoints}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] leading-[22.75px] text-[rgba(2,8,23,0.8)]">
            {summary.bullets.map((item: SummaryEntry, index: number) => (
              <SummaryEntryItem key={`${summaryEntryText(item)}-${index}`} entry={item} locale={locale} onSeek={onSeek} />
            ))}
          </ul>
        </div>
      ) : null}
      {takeaways?.length ? (
        <div>
          <h2 className="text-base font-semibold leading-6 text-[rgb(2,8,23)]">{labels.takeaways}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] leading-[22.75px] text-[rgba(2,8,23,0.8)]">
            {takeaways.map((item: SummaryEntry, index: number) => (
              <SummaryEntryItem key={`${summaryEntryText(item)}-${index}`} entry={item} locale={locale} onSeek={onSeek} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function preprocessingStatusCopy(status: string, locale: string) {
  const copy = transcriptionCopyFor(locale);
  const statusKey = status as PreprocessingStatusKey;
  const selected = copy.status[statusKey] ?? copy.status.PROCESSING;
  const [title, subtitle] = selected;
  return {title, subtitle};
}

function PreprocessingStatusCard({status, progress, locale}: {status: string; progress: number; locale: string}) {
  const failed = status === "FAILED" || status === "CANCELED";
  const {title, subtitle} = preprocessingStatusCopy(status, locale);
  return (
    <div className="flex w-full max-w-[280px] flex-col items-center text-center">
      <div className="relative">
        <div className={clsx("grid h-14 w-14 place-items-center rounded-2xl", failed ? "bg-coral/10" : "bg-violet/10")}>
          {failed ? <RotateCcw className="text-coral" size={24} /> : <FileText className="text-violet" size={24} />}
        </div>
        {!failed ? (
          <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brass text-white shadow-sm">
            <Sparkles size={11} />
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-base font-bold text-ink">{title}</p>
      <p className="mt-1 text-sm font-medium text-ink/50">{subtitle}</p>
      <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
        <div className={clsx("h-full rounded-full transition-all duration-500", failed ? "bg-coral" : "bg-violet")} style={{width: `${Math.min(100, Math.max(0, progress))}%`}} />
      </div>
    </div>
  );
}

function SummarySkeletonBar({className}: {className?: string}) {
  return <div className={clsx("h-2.5 rounded-full bg-slate-200/80", className)} />;
}

function SummaryEmptyState({
  locale,
  onGenerateGeneral,
  onChooseTemplate,
  disabled
}: {
  locale: string;
  onGenerateGeneral: () => void;
  onChooseTemplate: () => void;
  disabled?: boolean;
}) {
  const labels = summarySectionLabels(locale);
  const copy = transcriptionCopyFor(locale);

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-6">
      <div className="flex flex-col items-center text-center">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet/10">
          <Wand2 className="text-violet" size={18} />
        </div>
        <p className="mt-3 text-sm font-semibold leading-5 text-ink">
          {copy.summaryEmptyTitle}
        </p>
      </div>

      <div className="mt-6 grid gap-5">
        {[
          {icon: Lightbulb, label: labels.overview, bars: ["w-full", "w-[92%]", "w-[78%]"]},
          {icon: ListChecks, label: labels.keyPoints, bars: ["w-full", "w-[88%]", "w-[70%]"]},
          {icon: List, label: labels.takeaways, bars: ["w-[86%]", "w-[74%]"]}
        ].map(({icon: Icon, label, bars}) => (
          <div key={label}>
            <div className="flex items-center gap-2 text-sm font-semibold leading-5 text-ink/75">
              <Icon size={15} className="text-slate-400" />
              {label}
            </div>
            <div className="mt-2.5 grid gap-2">
              {bars.map((width, index) => (
                <SummarySkeletonBar key={`${label}-${index}`} className={width} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onGenerateGeneral}
        disabled={disabled}
        className="focus-ring mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-violet text-sm font-semibold text-white shadow-sm shadow-violet/20 transition hover:bg-violetDark disabled:cursor-not-allowed disabled:opacity-45"
      >
        {copy.generateGeneralSummary}
      </button>
      <button
        type="button"
        onClick={onChooseTemplate}
        disabled={disabled}
        className="focus-ring mt-3 w-full text-center text-sm font-medium text-violet transition hover:text-violetDark disabled:cursor-not-allowed disabled:opacity-45"
      >
        {copy.chooseAnotherTemplate}
      </button>
    </div>
  );
}

function SummaryLoadingState({locale}: {locale: string}) {
  const copy = transcriptionCopyFor(locale);
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-8 text-center">
      <div className="relative grid h-11 w-11 place-items-center rounded-full bg-violet/10">
        <Sparkles className="text-violet/70" size={20} />
        <span className="absolute bottom-0.5 right-0.5 h-2 w-2 animate-bounce rounded-full bg-violet" />
      </div>
      <p className="mt-4 text-[13px] font-medium leading-5 text-slate-500">
        {copy.generatingSummary}
      </p>
      <div className="mt-3 h-1.5 w-[200px] overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-violet/40 to-violet animate-mind-map-loading" />
      </div>
    </div>
  );
}

function SummaryEntryItem({entry, locale, onSeek}: {entry: SummaryEntry; locale: string; onSeek?: (seconds: number) => void}) {
  const text = summaryEntryText(entry);
  const timestamps = summaryEntryTimestamps(entry);
  const copy = transcriptionCopyFor(locale);
  return (
    <li>
      <span>{text}</span>
      {timestamps.length ? (
        <span className="ml-1.5 inline-flex flex-wrap gap-1 align-baseline">
          {timestamps.map((timestamp, index) => {
            const canSeek = onSeek && typeof timestamp.start === "number";
            const className = "inline-flex rounded border border-violet/20 bg-violet/5 px-1.5 py-0.5 text-[11px] font-medium leading-4 text-violet";
            return canSeek ? (
              <button
                key={`${timestamp.label}-${index}`}
                type="button"
                onClick={() => onSeek!(timestamp.start as number)}
                className={clsx(className, "cursor-pointer transition hover:bg-violet/15")}
                title={copy.seekTitle}
              >
                {timestamp.label}
              </button>
            ) : (
              <span key={`${timestamp.label}-${index}`} className={className}>
                {timestamp.label}
              </span>
            );
          })}
        </span>
      ) : null}
    </li>
  );
}

function DeleteTranscriptionConfirmDialog({busy, copy, title, onCancel, onConfirm}: {busy: boolean; copy: ReturnType<typeof getWorkspaceCopy>; title: string; onCancel: () => void; onConfirm: () => void}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <section className="relative grid h-[216px] w-full max-w-[448px] gap-4 rounded-lg border border-slate-200 bg-white p-0 text-[rgb(2,8,23)] shadow-none" role="dialog" aria-modal="true" aria-labelledby="delete-transcription-title">
        <div className="flex flex-col px-6 pb-4 pt-6 text-center sm:text-left">
          <h2 id="delete-transcription-title" className="text-xl font-semibold leading-7 text-[rgb(2,8,23)]">{copy.deleteTranscription}</h2>
          <p className="mt-1.5 text-sm font-normal leading-5 text-slate-500">
            {copy.deleteTranscriptionConfirm(title)}
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button type="button" onClick={onCancel} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium leading-5 text-[rgb(2,8,23)] transition hover:bg-slate-50">{copy.cancel}</button>
          <button type="button" onClick={onConfirm} disabled={busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium leading-5 text-slate-50 transition hover:bg-red-500/90 disabled:pointer-events-none disabled:opacity-50">
            {busy ? <Loader2 className="animate-spin" size={16} /> : null}
            {copy.delete}
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

type DetailMindMapNode = {
  label?: string;
  children?: DetailMindMapNode[];
};

type SummaryTimestamp = {
  label?: string;
  start?: number;
  end?: number;
};

type SummaryEntry = string | {
  text?: string;
  label?: string;
  timestamps?: Array<string | SummaryTimestamp>;
  timestamp?: string | SummaryTimestamp;
};

function summaryEntryText(entry: SummaryEntry) {
  if (typeof entry === "string") return entry;
  return entry.text ?? entry.label ?? "";
}

// 将时间戳标签（如 "01:42" 或 "01:42-02:01"）解析为起始秒数，用于点击跳转播放。
function parseTimestampLabelToSeconds(label: string): number | undefined {
  const first = label.split(/[-–~]/)[0]?.trim();
  if (!first) return undefined;
  const parts = first.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) return undefined;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return undefined;
}

type SummaryTimestampChip = {label: string; start?: number};

function summaryEntryTimestamps(entry: SummaryEntry): SummaryTimestampChip[] {
  if (typeof entry === "string") return [];
  const values = [...(entry.timestamps ?? [])];
  if (entry.timestamp) values.push(entry.timestamp);
  return values.map((value): SummaryTimestampChip | null => {
    if (typeof value === "string") return {label: value, start: parseTimestampLabelToSeconds(value)};
    if (typeof value.start === "number") {
      const label = typeof value.end === "number" ? `${formatTime(value.start)}-${formatTime(value.end)}` : formatTime(value.start);
      return {label, start: value.start};
    }
    if (value.label) return {label: value.label, start: parseTimestampLabelToSeconds(value.label)};
    return null;
  }).filter(Boolean) as SummaryTimestampChip[];
}

type DetailMindMapLayoutNode = {
  label: string;
  lines: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  branchIndex: number;
  subtreeHeight: number;
  children: DetailMindMapLayoutNode[];
};

function normalizeMindMapNode(node: DetailMindMapNode | null | undefined, fallbackLabel: string): DetailMindMapNode | null {
  if (!node || typeof node !== "object") return null;
  const label = typeof node.label === "string" && node.label.trim() ? node.label.trim() : fallbackLabel;
  const children = Array.isArray(node.children) ? node.children.map((child) => normalizeMindMapNode(child, fallbackLabel)).filter(Boolean) as DetailMindMapNode[] : [];
  return {label, children};
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function mindMapTextUnits(value: string) {
  return Array.from(value).reduce((sum, char) => sum + (/[\u3000-\u9fff\uff00-\uffef]/.test(char) ? 1 : 0.58), 0);
}

function splitLongMindMapToken(token: string, maxUnits: number) {
  const lines: string[] = [];
  let current = "";
  for (const char of Array.from(token)) {
    const next = `${current}${char}`;
    if (current && mindMapTextUnits(next) > maxUnits) {
      lines.push(current);
      current = char;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function splitMindMapLabel(label: string, maxUnits: number, fallbackLabel: string) {
  const normalized = label.replace(/\s+/g, " ").trim();
  if (!normalized) return [fallbackLabel];

  const words = normalized.split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words.length > 1 ? words : splitLongMindMapToken(normalized, maxUnits)) {
    if (mindMapTextUnits(word) > maxUnits) {
      if (current) {
        lines.push(current);
        current = "";
      }
      lines.push(...splitLongMindMapToken(word, maxUnits));
      continue;
    }

    const next = current ? `${current} ${word}` : word;
    if (current && mindMapTextUnits(next) > maxUnits) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  if (lines.length <= 3) return lines;
  const visible = lines.slice(0, 3);
  visible[2] = `${visible[2].replace(/[.\u2026]+$/u, "")}...`;
  return visible;
}

function measureMindMapNode(node: DetailMindMapNode, depth: number, branchIndex: number, fallbackLabel: string): DetailMindMapLayoutNode {
  const label = node.label ?? fallbackLabel;
  const maxUnits = depth === 0 ? 20 : depth === 1 ? 22 : 28;
  const lines = splitMindMapLabel(label, maxUnits, fallbackLabel);
  const widestLineUnits = Math.max(...lines.map(mindMapTextUnits), 8);
  const width = clamp(Math.ceil(widestLineUnits * 8 + (depth === 0 ? 44 : 34)), depth === 0 ? 170 : 112, depth === 0 ? 260 : 260);
  const height = clamp(18 + lines.length * (depth === 0 ? 18 : 16), depth === 0 ? 46 : 36, 78);
  const nextBranchBase = depth === 0 ? 0 : branchIndex;
  const children = node.children ?? [];
  return {
    label,
    lines,
    x: 0,
    y: 0,
    width,
    height,
    depth,
    branchIndex,
    subtreeHeight: height,
    children: children.map((child, index) => measureMindMapNode(child, depth + 1, depth === 0 ? index : nextBranchBase, fallbackLabel))
  };
}

function collectMindMapStats(node: DetailMindMapLayoutNode, stats = {maxDepth: 0, widths: [] as number[]}) {
  stats.maxDepth = Math.max(stats.maxDepth, node.depth);
  stats.widths[node.depth] = Math.max(stats.widths[node.depth] ?? 0, node.width);
  node.children.forEach((child) => collectMindMapStats(child, stats));
  return stats;
}

function assignMindMapSubtreeHeights(node: DetailMindMapLayoutNode) {
  const children = node.children;
  if (!children.length) {
    node.subtreeHeight = node.height;
    return node.subtreeHeight;
  }

  const gap = node.depth === 0 ? 34 : 22;
  const childrenHeight = children.reduce((sum, child) => sum + assignMindMapSubtreeHeights(child), 0) + gap * (children.length - 1);
  node.subtreeHeight = Math.max(node.height, childrenHeight);
  return node.subtreeHeight;
}

function assignMindMapPositions(node: DetailMindMapLayoutNode, xByDepth: number[], yStart: number) {
  node.x = xByDepth[node.depth] + node.width / 2;
  if (!node.children.length) {
    node.y = yStart + node.subtreeHeight / 2;
    return;
  }

  const gap = node.depth === 0 ? 34 : 22;
  let childY = yStart + Math.max(0, (node.subtreeHeight - (node.children.reduce((sum, child) => sum + child.subtreeHeight, 0) + gap * (node.children.length - 1))) / 2);
  node.children.forEach((child) => {
    assignMindMapPositions(child, xByDepth, childY);
    childY += child.subtreeHeight + gap;
  });
  node.y = (node.children[0].y + node.children[node.children.length - 1].y) / 2;
}

function collectMindMapLayout(node: DetailMindMapLayoutNode, nodes: DetailMindMapLayoutNode[] = [], links: Array<[DetailMindMapLayoutNode, DetailMindMapLayoutNode]> = []) {
  nodes.push(node);
  node.children.forEach((child) => {
    links.push([node, child]);
    collectMindMapLayout(child, nodes, links);
  });
  return {nodes, links};
}

function createMindMapLayout(node: DetailMindMapNode, fallbackLabel: string) {
  const root = measureMindMapNode(node, 0, 0, fallbackLabel);
  const stats = collectMindMapStats(root);
  assignMindMapSubtreeHeights(root);

  const leftPadding = 48;
  const topPadding = 42;
  const rightPadding = 64;
  const bottomPadding = 48;
  const levelGap = 96;
  const xByDepth = stats.widths.reduce<number[]>((positions, width, depth) => {
    if (depth === 0) return [leftPadding];
    const previousWidth = stats.widths[depth - 1] ?? 160;
    positions[depth] = positions[depth - 1] + previousWidth + levelGap;
    return positions;
  }, []);

  assignMindMapPositions(root, xByDepth, topPadding);
  const {nodes, links} = collectMindMapLayout(root);
  const width = Math.max(640, (xByDepth[stats.maxDepth] ?? leftPadding) + (stats.widths[stats.maxDepth] ?? root.width) + rightPadding);
  const height = Math.max(520, root.subtreeHeight + topPadding + bottomPadding);

  return {
    root,
    nodes,
    links,
    width,
    height,
    signature: `${nodes.length}-${width}-${height}-${root.label}`
  };
}

function safeDownloadName(value: string | undefined) {
  return (value || "uniscribe").replace(/[^\w.\-]+/g, "_").replace(/^_+|_+$/g, "") || "uniscribe";
}

function MindMapToolButton({children, label, onClick, disabled, active}: {children: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean; active?: boolean}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={clsx(
        "focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md border border-violet bg-violet text-white shadow-sm shadow-violet/10 transition hover:bg-violetDark disabled:cursor-not-allowed disabled:opacity-45",
        active && "bg-violetDark"
      )}
    >
      {children}
    </button>
  );
}

const mindMapBranchColors = ["#6467f2", "#0f766e", "#e11d48", "#2563eb", "#b45309", "#7c3aed", "#0891b2", "#be185d"];

function MindMapEmptyState({locale, onGenerate, disabled}: {locale: string; onGenerate: () => void; disabled?: boolean}) {
  const copy = mindMapUiFor(locale);
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100">
        <Brain className="text-violet" size={26} />
      </div>
      <p className="mt-5 max-w-[300px] text-[13px] font-medium leading-5 text-slate-500">
        {copy.emptyText}
      </p>
      <button
        type="button"
        onClick={onGenerate}
        disabled={disabled}
        className="focus-ring mt-5 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-violet px-4 text-[13px] font-semibold text-white shadow-sm shadow-violet/20 transition hover:bg-violetDark disabled:cursor-not-allowed disabled:opacity-45"
      >
        <Sparkles size={15} />
        {copy.generate}
      </button>
    </div>
  );
}

function MindMapLoadingState({locale}: {locale: string}) {
  const copy = mindMapUiFor(locale);
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <div className="relative grid h-11 w-11 place-items-center rounded-full bg-violet/10">
        <Brain className="text-violet/70" size={21} />
        <span className="absolute bottom-0.5 right-0.5 h-2 w-2 animate-bounce rounded-full bg-violet" />
      </div>
      <p className="mt-4 text-[13px] font-medium leading-5 text-slate-500">{copy.loading}</p>
      <div className="mt-3 h-1.5 w-[200px] overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-violet/40 to-violet animate-mind-map-loading" />
      </div>
    </div>
  );
}

function DetailMindMap({
  node,
  taskId,
  title,
  locale,
  busy,
  isMember,
  onRegenerate,
  onRequirePremium,
  onError
}: {
  node?: DetailMindMapNode;
  taskId?: string;
  title?: string;
  locale: string;
  busy?: boolean;
  isMember: boolean;
  onRegenerate: () => void;
  onRequirePremium: () => void;
  onError: (message: string | null) => void;
}) {
  const copy = mindMapUiFor(locale);
  const [zoom, setZoom] = useState(0.76);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const downloadMenuRef = useRef<HTMLDivElement | null>(null);
  const layout = useMemo(() => {
    const normalized = normalizeMindMapNode(node, copy.title);
    return normalized ? createMindMapLayout(normalized, copy.title) : null;
  }, [copy.title, node]);

  useEffect(() => {
    if (!downloadOpen) return;
    function closeDownloadMenu(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node) || downloadMenuRef.current?.contains(target)) return;
      setDownloadOpen(false);
    }
    document.addEventListener("pointerdown", closeDownloadMenu);
    return () => document.removeEventListener("pointerdown", closeDownloadMenu);
  }, [downloadOpen]);

  useEffect(() => {
    if (!fullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setFullscreen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [fullscreen]);

  useEffect(() => {
    if (!layout) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const frame = window.requestAnimationFrame(() => {
      viewport.scrollLeft = 0;
      viewport.scrollTop = Math.max(0, layout.root.y * zoom - viewport.clientHeight / 2);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [fullscreen, layout, zoom]);

  if (!layout) return null;
  const currentLayout = layout;

  function fitToViewport() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const fit = Math.min((viewport.clientWidth - 32) / currentLayout.width, (viewport.clientHeight - 32) / currentLayout.height);
    setZoom(clamp(Number(fit.toFixed(2)), 0.42, 1.15));
    window.requestAnimationFrame(() => {
      viewport.scrollLeft = 0;
      viewport.scrollTop = Math.max(0, currentLayout.root.y * clamp(fit, 0.42, 1.15) - viewport.clientHeight / 2);
    });
  }

  async function downloadPng() {
    setDownloadOpen(false);
    const svg = svgRef.current;
    if (!svg) return;
    try {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("width", String(currentLayout.width));
      clone.setAttribute("height", String(currentLayout.height));
      const svgBlob = new Blob([new XMLSerializer().serializeToString(clone)], {type: "image/svg+xml;charset=utf-8"});
      const url = URL.createObjectURL(svgBlob);
      const image = new window.Image();
      image.decoding = "async";
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error(copy.unableRender));
        image.src = url;
      });
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(currentLayout.width * scale);
      canvas.height = Math.ceil(currentLayout.height * scale);
      const context = canvas.getContext("2d");
      if (!context) throw new Error(copy.canvasUnavailable);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `${safeDownloadName(title)}-mind-map.png`;
      link.click();
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : copy.unableDownload);
    }
  }

  function downloadPremiumFormat(format: "md" | "xmind") {
    setDownloadOpen(false);
    if (!isMember) {
      onRequirePremium();
      return;
    }
    if (!taskId) return;
    window.location.href = `/api/tasks/${taskId}/mind-map/${format}?locale=${encodeURIComponent(locale)}`;
  }

  const scaledWidth = Math.ceil(layout.width * zoom);
  const scaledHeight = Math.ceil(layout.height * zoom);

  return (
    <div className={clsx("relative flex w-full flex-col bg-white", fullscreen ? "fixed inset-0 z-40 p-5" : "min-h-[420px]")}>
      {fullscreen ? (
        <button
          type="button"
          onClick={() => setFullscreen(false)}
          className="focus-ring absolute left-5 top-5 z-10 grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-ink"
          aria-label={copy.closeFullScreen}
        >
          <X size={18} />
        </button>
      ) : null}
      <div className="mb-3 flex flex-wrap items-center justify-end gap-1.5">
        <MindMapToolButton label={copy.regenerate} onClick={onRegenerate} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" size={15} /> : <RefreshCw size={15} />}
        </MindMapToolButton>
        <div ref={downloadMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setDownloadOpen((value) => !value)}
            className="focus-ring inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-violet bg-violet px-2.5 text-white shadow-sm shadow-violet/10 transition hover:bg-violetDark"
            aria-label={copy.download}
            aria-expanded={downloadOpen}
          >
            <Download size={15} />
            <ChevronDown className={clsx("transition", downloadOpen && "rotate-180")} size={13} />
          </button>
          {downloadOpen ? (
            <div className="absolute right-0 z-40 mt-2 w-[230px] rounded-lg border border-slate-200 bg-white p-2 text-sm shadow-xl">
              <button type="button" onClick={downloadPng} className="flex h-10 w-full items-center gap-3 rounded-md px-2.5 text-left font-medium text-ink transition hover:bg-slate-50">
                <ImageIcon size={16} />
                {copy.imageFile}
              </button>
              <button type="button" onClick={() => downloadPremiumFormat("md")} className="mt-1 flex h-10 w-full items-center justify-between gap-3 rounded-md px-2.5 text-left font-medium text-ink transition hover:bg-slate-50">
                <span className="flex items-center gap-3">
                  <FileText size={16} />
                  {copy.markdownFile}
                </span>
                {!isMember ? <Crown className="text-amber-500" size={16} /> : null}
              </button>
              <button type="button" onClick={() => downloadPremiumFormat("xmind")} className="mt-1 flex h-10 w-full items-center justify-between gap-3 rounded-md px-2.5 text-left font-medium text-ink transition hover:bg-slate-50">
                <span className="flex items-center gap-3">
                  <FileArchive size={16} />
                  {copy.xmindFile}
                </span>
                {!isMember ? <Crown className="text-amber-500" size={16} /> : null}
              </button>
            </div>
          ) : null}
        </div>
        <MindMapToolButton label={copy.zoomIn} onClick={() => setZoom((value) => clamp(Number((value + 0.12).toFixed(2)), 0.42, 1.6))}>
          <ZoomIn size={15} />
        </MindMapToolButton>
        <MindMapToolButton label={copy.zoomOut} onClick={() => setZoom((value) => clamp(Number((value - 0.12).toFixed(2)), 0.42, 1.6))}>
          <ZoomOut size={15} />
        </MindMapToolButton>
        <MindMapToolButton label={copy.fitToView} onClick={fitToViewport}>
          <Scan size={15} />
        </MindMapToolButton>
        <MindMapToolButton label={fullscreen ? copy.exitFullScreen : copy.fullScreen} onClick={() => setFullscreen((value) => !value)} active={fullscreen}>
          {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </MindMapToolButton>
      </div>

      <div
        ref={viewportRef}
        className={clsx(
          "min-h-0 flex-1 overflow-auto rounded-lg border border-slate-200 bg-[radial-gradient(circle_at_1px_1px,rgba(100,103,242,0.16)_1px,transparent_0)] [background-size:22px_22px]",
          fullscreen ? "h-[calc(100dvh-112px)]" : "h-[calc(100vh-292px)] min-h-[420px]"
        )}
      >
        <svg
          ref={svgRef}
          className="block max-w-none"
          width={scaledWidth}
          height={scaledHeight}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          role="img"
          aria-label={copy.title}
          style={{width: scaledWidth, height: scaledHeight}}
        >
          <defs>
            <filter id="mind-map-node-shadow" x="-20%" y="-30%" width="140%" height="160%">
              <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#64748b" floodOpacity="0.12" />
            </filter>
          </defs>
          <rect width={layout.width} height={layout.height} fill="#ffffff" />
          <g>
            {layout.links.map(([from, to]) => {
              const color = mindMapBranchColors[to.branchIndex % mindMapBranchColors.length] ?? "#6467f2";
              const startX = from.x + from.width / 2;
              const endX = to.x - to.width / 2;
              const midX = startX + Math.max(48, (endX - startX) * 0.56);
              return (
                <g key={`${from.label}-${to.label}-${to.x}-${to.y}`}>
                  <path
                    d={`M ${startX} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${endX} ${to.y}`}
                    fill="none"
                    stroke={color}
                    strokeLinecap="round"
                    strokeOpacity={to.depth === 1 ? 0.78 : 0.48}
                    strokeWidth={to.depth === 1 ? 2.4 : 1.6}
                  />
                  <circle cx={endX} cy={to.y} r={to.depth === 1 ? 3.5 : 2.5} fill="#ffffff" stroke={color} strokeWidth={1.6} />
                </g>
              );
            })}
            {layout.nodes.map((item) => {
              const isRoot = item.depth === 0;
              const isPrimary = item.depth === 1;
              const color = mindMapBranchColors[item.branchIndex % mindMapBranchColors.length] ?? "#6467f2";
              const lineHeight = isRoot ? 18 : 15.5;
              const firstLineY = -((item.lines.length - 1) * lineHeight) / 2 + (isRoot ? 5 : 4);
              return (
                <g key={`${item.label}-${item.x}-${item.y}`} transform={`translate(${item.x}, ${item.y})`}>
                  <rect
                    x={-item.width / 2}
                    y={-item.height / 2}
                    width={item.width}
                    height={item.height}
                    rx={isRoot ? 10 : 7}
                    fill={isRoot ? "#6467f2" : isPrimary ? `${color}14` : "#ffffff"}
                    stroke={isRoot ? "#6467f2" : isPrimary ? `${color}66` : "#e2e8f0"}
                    strokeWidth={isRoot ? 0 : 1}
                    filter="url(#mind-map-node-shadow)"
                  />
                  {!isRoot ? (
                    <line x1={-item.width / 2 + 12} y1={item.height / 2 - 4} x2={item.width / 2 - 12} y2={item.height / 2 - 4} stroke={color} strokeLinecap="round" strokeOpacity={isPrimary ? 0.7 : 0.38} strokeWidth={1.4} />
                  ) : null}
                  <text
                    textAnchor="middle"
                    fill={isRoot ? "#ffffff" : "#1f2937"}
                    fontSize={isRoot ? 13.5 : isPrimary ? 12.5 : 12}
                    fontWeight={isRoot ? 700 : isPrimary ? 650 : 500}
                  >
                    {item.lines.map((line, index) => (
                      <tspan key={`${line}-${index}`} x={0} y={firstLineY + index * lineHeight}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}

function UpgradeYourPlanCard({locale, onUpgrade}: {locale: string; onUpgrade: () => void}) {
  const copy = upgradeUiFor(locale);

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/10 via-violet/5 to-transparent p-5">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-violet/15 text-violet">
          <Crown size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-6 text-ink">{copy.upgradeTitle}</h3>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            {copy.upgradeDescription}
          </p>
          <button
            type="button"
            onClick={onUpgrade}
            className="focus-ring mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-violet px-5 text-sm font-semibold text-white shadow-sm shadow-violet/20 transition hover:bg-violetDark"
          >
            <Crown size={16} />
            {copy.upgradeNow}
          </button>
        </div>
      </div>
    </section>
  );
}

function DetailUpgradeCard({locale, onUpgrade}: {locale: string; onUpgrade: () => void}) {
  const copy = upgradeUiFor(locale);

  return (
    <section className="flex min-h-[142px] w-[242px] items-center gap-2 bg-violet px-4 py-3 text-sm font-semibold text-white xl:min-h-[53px] xl:w-full xl:justify-between xl:gap-3 xl:py-2">
      <button type="button" className="focus-ring inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30" aria-label={copy.collapseUpgradeBanner}>
        <ArrowLeft className="rotate-90" size={15} />
      </button>
      <p className="min-w-0 max-w-[54px] flex-1 whitespace-normal leading-[17px] xl:max-w-none xl:truncate xl:leading-normal">{copy.detailUpgradeText}</p>
      <button type="button" onClick={onUpgrade} className="inline-flex h-8 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-4 text-xs font-bold leading-4 text-violet shadow-lg shadow-black/10 transition-all hover:bg-white/90 hover:text-violet active:scale-95">
        {copy.upgradeNow}
      </button>
    </section>
  );
}

function MindMapPremiumDialog({locale, onClose, onShowPlans}: {locale: string; onClose: () => void; onShowPlans: () => void}) {
  const copy = upgradeUiFor(locale);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
      <section className="relative w-full max-w-[512px] rounded-2xl border border-slate-200 bg-white px-8 pb-7 pt-6 text-ink shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="mind-map-premium-title">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-ink" aria-label={copy.close}>
          <X size={18} />
        </button>
        <h2 id="mind-map-premium-title" className="text-xl font-bold leading-7 text-ink">{copy.premiumFeature}</h2>
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-violet text-white shadow-lg shadow-violet/20">
            <Crown size={36} />
          </div>
          <h3 className="mt-6 text-xl font-bold leading-7 text-ink">{copy.mindMapExportTitle}</h3>
          <p className="mt-3 max-w-[420px] text-[15px] font-medium leading-7 text-slate-500">
            {copy.mindMapPremiumDescription}
          </p>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onClose} className="focus-ring inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-base font-semibold text-ink transition hover:bg-slate-50">
            {copy.maybeLater}
          </button>
          <button type="button" onClick={onShowPlans} className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-violet px-5 text-base font-semibold text-white transition hover:bg-violetDark">
            <Crown size={18} />
            {copy.upgradeNow}
          </button>
        </div>
      </section>
    </div>
  );
}

function SummaryLimitDialog({locale, onClose, onShowPlans}: {locale: string; onClose: () => void; onShowPlans: () => void}) {
  const copy = upgradeUiFor(locale);
  const [selectedCycle, setSelectedCycle] = useState<"annual" | "monthly">("annual");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const planChoices: Array<{key: "annual" | "monthly"; label: string; price: string; note: string; badge?: string}> = [
    {key: "annual", label: copy.yearlyPlan, price: "$6", note: copy.yearlyNote, badge: copy.yearlyBadge},
    {key: "monthly", label: copy.monthlyPlan, price: "$10", note: copy.monthlyNote}
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <section className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-white/20 bg-white text-ink shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="summary-limit-title">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 z-10 grid h-9 w-9 place-items-center rounded-full text-ink transition hover:bg-slate-100" aria-label={copy.close}>
          <X size={20} />
        </button>

        <div className="bg-gradient-to-b from-violet/10 to-white px-8 pb-4 pt-8 text-center">
          <div className="relative mb-4 inline-flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-violet/20" />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-violet/20 bg-white text-violet shadow-sm">
              <AlertCircle size={26} />
            </span>
          </div>
          <h2 id="summary-limit-title" className="mb-1.5 text-2xl font-black leading-8 tracking-[-0.025em] text-ink">{copy.summaryLimitTitle}</h2>
          <p className="mx-auto max-w-[280px] text-sm font-medium leading-[22.75px] text-slate-500">{copy.summaryLimitDescription}</p>
        </div>

        <div className="space-y-5 px-7 pb-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-100/50 p-4 text-left">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex items-center gap-1 rounded-full bg-violet px-2 py-0.5 text-[10px] font-black leading-[15px] text-white shadow-sm">
                <TicketCheck size={12} />
                {copy.subscription}
              </div>
              <span className="text-base font-bold leading-6 tracking-tight text-ink">{copy.upgradeBasicTitle}</span>
            </div>
            <div className="grid gap-2.5">
              {copy.basicFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-violet" />
                  <span className="text-sm font-medium leading-snug text-slate-500">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {planChoices.map((choice) => {
              const active = selectedCycle === choice.key;
              return (
                <button
                  key={choice.key}
                  type="button"
                  onClick={() => setSelectedCycle(choice.key)}
                  className={clsx(
                    "relative flex h-[86.5px] w-full items-start justify-between rounded-2xl border-2 p-3 text-left transition",
                    active ? "border-violet bg-violet/10 shadow-sm" : "border-slate-200 bg-white hover:border-violet/50"
                  )}
                >
                  <span className="w-full">
                    <span className="flex items-start justify-between gap-3">
                      <span className="block text-xs font-black uppercase leading-4 tracking-wider text-slate-500">{choice.label}</span>
                      <span className="shrink-0 text-right">
                        <span className="text-3xl font-black leading-9 text-ink">{choice.price}</span>
                        <span className="text-sm font-bold leading-5 text-slate-500">{copy.perMonth}</span>
                      </span>
                    </span>
                    <span className="mt-1.5 flex items-center justify-between gap-3">
                      <span className="block text-sm font-medium leading-5 text-slate-500">{choice.note}</span>
                      {choice.badge ? <span className="shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold leading-3 text-white">{choice.badge}</span> : null}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <PricingAction
              plan="BASIC"
              mode={selectedCycle === "annual" ? "annual" : "monthly"}
              label={copy.upgradeNow}
              showIcon={false}
              wrapperClassName="mt-0"
              buttonClassName="h-11 rounded-2xl text-base font-black shadow-lg shadow-violet/20"
            />
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={onShowPlans}
                className="text-sm font-bold leading-5 text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-violet"
              >
                {copy.seeAllPlans}
              </button>
              <div className="flex items-center gap-3 text-xs font-bold uppercase leading-4 tracking-wider text-slate-400">
                <span>{copy.cancelAnytime}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{copy.instantAccess}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
