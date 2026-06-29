"use client";

import {useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useSearchParams} from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  ChevronDown,
  CheckCircle2,
  Clock,
  Download,
  FileAudio,
  FolderOpen,
  Globe2,
  HardDrive,
  HelpCircle,
  Languages,
  Link2,
  Loader2,
  Mic,
  Network,
  Pencil,
  PlayCircle,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings2,
  Sparkles,
  Star,
  TicketCheck,
  Trash2,
  UploadCloud,
  X
} from "lucide-react";
import clsx from "clsx";
import {SiteHeader} from "@/components/site-shell";
import {TranslationEditor} from "@/components/translation-editor";
import {exportFormats, fallbackMessages, getWorkspaceCopy, languageChoices} from "./copy";
import type {AssetView, CurrentUser, FolderItem, InputMode, Task, TaskListItem, TranscriptSegment, UsageSnapshot} from "./types";
import {Fact, InsightPanel, MindMap, ModeButton, PanelTitle, StatusStrip} from "./primitives";
import {WorkspaceSidebar} from "./sidebar";
import {ExportPanel, TranscriptPanel} from "./panels";
import {ProductSections} from "./marketing";
import {formatDateTime, formatDuration, taskDisplayName} from "./format";

const maxBatchFiles = 50;

const supportedFormatItems = ["mpg", "mp3", "mp4", "m4a", "wav", "mov", "mkv", "webm", "wmv", "flac", "media links"] as const;

const supportedLanguageItems = [
  "Arabic",
  "Amharic",
  "Azerbaijani",
  "Irish",
  "Estonian",
  "Occitan",
  "Odia",
  "Basque",
  "Belarusian",
  "Bulgarian",
  "Icelandic",
  "Polish",
  "Persian",
  "Afrikaans",
  "Breton",
  "Danish",
  "German",
  "Russian",
  "French",
  "Filipino (Tagalog)",
  "Finnish",
  "Frisian",
  "Georgian",
  "Gujarati",
  "Haitian Creole",
  "Korean",
  "Hausa",
  "Dutch",
  "Galician",
  "Catalan",
  "Czech",
  "Kannada",
  "Croatian",
  "Kurdish",
  "Latin",
  "Latvian",
  "Lao",
  "Lithuanian",
  "Lingala",
  "Romanian",
  "Maltese",
  "Marathi",
  "Malayalam",
  "Malay",
  "Macedonian",
  "Bengali",
  "Burmese",
  "Moldovan",
  "Norwegian",
  "Punjabi",
  "Portuguese",
  "Japanese",
  "Swedish",
  "Serbian",
  "Sinhala",
  "Esperanto",
  "Slovak",
  "Slovenian",
  "Swahili",
  "Cebuano",
  "Somali",
  "Telugu",
  "Tamil",
  "Thai",
  "Turkish",
  "Uyghur",
  "Urdu",
  "Ukrainian",
  "Uzbek",
  "Spanish",
  "Hebrew",
  "Greek",
  "Hawaiian",
  "Modern Standard Arabic",
  "Hungarian",
  "Armenian",
  "Igbo",
  "Italian",
  "Yiddish",
  "Hindi",
  "Indonesian",
  "English",
  "Vietnamese",
  "Yoruba",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Zulu"
] as const;

const exportFormatItems = ["txt", "pdf", "docx", "srt", "csv", "vtt"] as const;

type ResolvedMedia = {
  sourceUrl: string;
  resolvedUrl?: string;
  provider: string;
  providerLabel: string;
  sourceType: "YOUTUBE" | "GOOGLE_DRIVE";
  title: string;
  filename?: string;
  durationSeconds?: number;
  contentLength?: number;
  contentType?: string;
  thumbnailUrl?: string;
  warnings: string[];
};

type DriveConnectionState = {
  connected: boolean;
  connection?: {
    email?: string | null;
    expiresAt?: string;
    updatedAt?: string;
  } | null;
};

type DriveFileItem = {
  id: string;
  name: string;
  mimeType?: string;
  sizeBytes?: number;
  webViewLink?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
};

export function Workspace({variant = "marketing"}: {variant?: "marketing" | "dashboard" | "upload"}) {
  const translate = useTranslations("app");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const copy = getWorkspaceCopy(locale);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const [mode, setMode] = useState<InputMode>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [resolvedMedia, setResolvedMedia] = useState<ResolvedMedia | null>(null);
  const [language, setLanguage] = useState("auto");
  const [speakerLabels, setSpeakerLabels] = useState(true);
  const [subtitleEnabled, setSubtitleEnabled] = useState(true);
  const [premiumModel, setPremiumModel] = useState(false);
  const [summaryTemplate, setSummaryTemplate] = useState("standard");
  const [summaryLanguage, setSummaryLanguage] = useState(locale);
  const [translationTarget, setTranslationTarget] = useState(locale);
  const [task, setTask] = useState<Task | null>(null);
  const [draftText, setDraftText] = useState("");
  const [segmentDrafts, setSegmentDrafts] = useState<TranscriptSegment[]>([]);
  const [speakerDrafts, setSpeakerDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [usageSnapshot, setUsageSnapshot] = useState<UsageSnapshot | null>(null);
  const [taskList, setTaskList] = useState<TaskListItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [assetView, setAssetView] = useState<AssetView>("transcripts");
  const [assetSearch, setAssetSearch] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [batchExportFormat, setBatchExportFormat] = useState("txt");
  const [batchShowSpeaker, setBatchShowSpeaker] = useState(true);
  const [batchShowTimestamp, setBatchShowTimestamp] = useState(true);
  const [batchSubtitleMaxChars, setBatchSubtitleMaxChars] = useState(84);
  const [batchSubtitleMaxDurationSeconds, setBatchSubtitleMaxDurationSeconds] = useState(6);
  const [retranscribeDialogOpen, setRetranscribeDialogOpen] = useState(false);
  const [dashboardUploadOpen, setDashboardUploadOpen] = useState(false);
  const [dashboardLinkOpen, setDashboardLinkOpen] = useState(false);
  const [showAppSumoWelcome, setShowAppSumoWelcome] = useState(false);

  const t = (key: string) => {
    try {
      return translate(key);
    } catch {
      return fallbackMessages[key] ?? key;
    }
  };
  const file = files[0] ?? null;

  function selectFiles(nextFiles: File[] | FileList | null, options: {append?: boolean} = {}) {
    if (!nextFiles) {
      setFiles([]);
      return;
    }

    const incoming = Array.from(nextFiles);
    const merged = options.append ? [...files, ...incoming] : incoming;
    const limited = merged.slice(0, maxBatchFiles);
    setFiles(limited);

    if (merged.length > maxBatchFiles) {
      setNotice(`Only the first ${maxBatchFiles} files were added.`);
    }
  }

  function selectFile(nextFile: File | null) {
    setFiles(nextFile ? [nextFile] : []);
  }

  function updateYoutubeUrl(value: string) {
    setYoutubeUrl(value);
    setResolvedMedia(null);
  }

  function updateDriveUrl(value: string) {
    setDriveUrl(value);
    setResolvedMedia(null);
  }

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
      insights: task.insights?.map((item) => ({type: item.type})),
      mediaAssets: task.mediaAssets,
      folderId: task.folderId,
      folder: task.folder ?? null
    };
    return exists ? taskList.map((item) => (item.id === task.id ? {...item, ...liveTask} : item)) : [liveTask, ...taskList];
  }, [task, taskList]);
  const normalizedAssetSearch = assetSearch.trim().toLowerCase();
  const filteredTasks = useMemo(() => {
    if (!normalizedAssetSearch) return shownTasks;
    return shownTasks.filter((item) =>
      [item.originalName, item.status, item.provider, item.sourceType]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedAssetSearch))
    );
  }, [shownTasks, normalizedAssetSearch]);

  const refreshTaskList = useCallback(async () => {
    const params = new URLSearchParams({limit: "50"});
    if (selectedFolderId) params.set("folderId", selectedFolderId);
    const data = await fetch(`/api/tasks?${params.toString()}`, {cache: "no-store"}).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? copy.readTasksError);
      return body as {tasks: TaskListItem[]};
    });
    setTaskList(data.tasks ?? []);
  }, [copy.readTasksError, selectedFolderId]);

  async function refreshFolders() {
    const data = await fetch("/api/folders", {cache: "no-store"}).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "无法读取文件夹。");
      return body as {folders: FolderItem[]};
    });
    setFolders(data.folders ?? []);
  }

  const refreshUsageSnapshot = useCallback(async () => {
    const data = await fetch("/api/account/usage", {cache: "no-store"}).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? copy.readUsageError);
      return body as UsageSnapshot;
    });
    setUsageSnapshot(data);
  }, [copy.readUsageError]);

  useEffect(() => {
    if (variant !== "dashboard" && variant !== "upload") return;
    fetch("/api/auth/me", {cache: "no-store"})
      .then((response) => (response.ok ? response.json() : {user: null}))
      .then((data) => {
        setCurrentUser(data.user ?? null);
        if (data.user) {
          refreshTaskList().catch(() => undefined);
          refreshFolders().catch(() => undefined);
          refreshUsageSnapshot().catch(() => undefined);
        } else {
          setUsageSnapshot(null);
        }
      })
      .catch(() => {
        setCurrentUser(null);
        setUsageSnapshot(null);
      });
  }, [refreshTaskList, refreshUsageSnapshot, variant]);

  useEffect(() => {
    if (variant !== "dashboard" || !currentUser?.id) return;
    const needsWelcome = window.localStorage.getItem("appsumo_onboarding_needed") === "true";
    if (!needsWelcome) return;
    const hasAppSumoPlan = currentUser.subscriptions?.some((subscription) => {
      const plan = subscription.plan?.toUpperCase();
      const status = subscription.status?.toUpperCase();
      return ["BASIC", "STANDARD", "PRO"].includes(plan) && (!status || ["ACTIVE", "TRIALING"].includes(status));
    });
    if (hasAppSumoPlan) {
      setShowAppSumoWelcome(true);
      window.localStorage.removeItem("appsumo_onboarding_needed");
    }
  }, [currentUser, variant]);

  useEffect(() => {
    function onThemeToggle(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest("[data-theme-toggle]") : null;
      if (!target) return;
      const root = document.documentElement;
      const next = !root.classList.contains("dark");
      root.classList.toggle("dark", next);
      root.classList.toggle("light", !next);
    }

    document.addEventListener("click", onThemeToggle);
    return () => document.removeEventListener("click", onThemeToggle);
  }, []);

  useEffect(() => {
    if (variant !== "upload") return;
    const requestedMode = searchParams.get("mode");
    const requestedUrl = searchParams.get("url");
    if (requestedMode === "link") setMode("youtube");
    if (requestedMode === "file") setMode("upload");
    if (requestedUrl) setYoutubeUrl(requestedUrl);
  }, [variant, searchParams]);

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

  useEffect(() => {
    if (variant !== "dashboard") return;
    refreshTaskList().catch(() => undefined);
  }, [refreshTaskList, variant]);

  async function createFolder(name: string) {
    setError(null);
    const folder = await fetch("/api/folders", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name})
    }).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "无法创建文件夹。");
      return body as FolderItem;
    });
    setFolders((items) => [...items, folder]);
    setSelectedFolderId(folder.id);
  }

  async function renameFolder(folderId: string, name: string) {
    setError(null);
    const folder = await fetch(`/api/folders/${folderId}`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name})
    }).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "无法重命名文件夹。");
      return body as FolderItem;
    });
    setFolders((items) => items.map((item) => (item.id === folder.id ? folder : item)));
  }

  async function deleteFolder(folderId: string) {
    setError(null);
    await fetch(`/api/folders/${folderId}`, {method: "DELETE"}).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "无法删除文件夹。");
      return body;
    });
    setFolders((items) => items.filter((item) => item.id !== folderId));
    if (selectedFolderId === folderId) setSelectedFolderId(null);
    setTaskList((items) => items.map((item) => (item.folderId === folderId ? {...item, folderId: null, folder: null} : item)));
  }

  async function moveTask(taskId: string, folderId: string | null) {
    setError(null);
    const moved = await fetch(`/api/tasks/${taskId}/folder`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({folderId})
    }).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "无法移动转写。");
      return body as TaskListItem;
    });
    setTaskList((items) => items.map((item) => (item.id === taskId ? {...item, ...moved} : item)));
    if (task?.id === taskId) setTask({...task, folderId: moved.folderId, folder: moved.folder ?? null});
    refreshFolders().catch(() => undefined);
  }

  async function renameTask(taskId: string, originalName: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({originalName})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法重命名转写。");
        return body as Task;
      });

      setTask((current) => (current?.id === taskId ? {...current, originalName: updated.originalName} : current));
      setTaskList((items) => items.map((item) => (item.id === taskId ? {...item, originalName: updated.originalName} : item)));
      setNotice("转写已重命名。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function retranscribeTask(taskId: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch(`/api/tasks/${taskId}/retranscribe`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({language, enableSpeakerLabels: speakerLabels, subtitleEnabled, premiumModel, summaryTemplate, summaryLanguage})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法排队重新转写。");
      });
      await loadTaskDetail(taskId);
      await refreshTaskList().catch(() => undefined);
      setRetranscribeDialogOpen(false);
      setNotice("重新转写已进入队列。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function deleteTask(taskId: string) {
    if (!window.confirm("确定要删除该转写及其生成内容吗？")) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch(`/api/tasks/${taskId}`, {method: "DELETE"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法删除转写。");
      });
      setTask((current) => (current?.id === taskId ? null : current));
      setTaskList((items) => items.filter((item) => item.id !== taskId));
      setNotice("转写已删除。");
      refreshFolders().catch(() => undefined);
      refreshUsageSnapshot().catch(() => undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function downloadOriginalFile(taskId: string) {
    setBusy(true);
    setError(null);
    try {
      const data = await fetch(`/api/tasks/${taskId}/original-file`, {cache: "no-store"}).then(async (response) => {
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

  async function deleteOriginalFile(taskId: string) {
    if (!window.confirm("确定要删除原始媒体文件吗？转写稿和生成内容会保留。")) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch(`/api/tasks/${taskId}/original-file`, {method: "DELETE"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法删除原始媒体。");
      });
      if (task?.id === taskId) await loadTaskDetail(taskId);
      setNotice("原始媒体已删除。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function cancelTask(taskId: string) {
    if (!window.confirm("确定要取消该转写任务吗？")) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch(`/api/tasks/${taskId}/cancel`, {method: "POST"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法取消转写。");
      });
      await loadTaskDetail(taskId);
      await refreshTaskList().catch(() => undefined);
      await refreshUsageSnapshot().catch(() => undefined);
      setNotice("转写已取消。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function retryTask(taskId: string, retryType: "standard" | "youtube_fallback" = "standard") {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch(`/api/tasks/${taskId}/retry`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({retryType})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法重试转写。");
      });
      await loadTaskDetail(taskId);
      await refreshTaskList().catch(() => undefined);
      await refreshUsageSnapshot().catch(() => undefined);
      setNotice(retryType === "youtube_fallback" ? "YouTube 兜底任务已进入队列。" : "重试任务已进入队列。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function runBatchAction(action: "delete" | "move" | "delete_originals", folderId?: string | null) {
    if (!selectedTaskIds.length) return;
    if (action === "delete" && !window.confirm(`Delete ${selectedTaskIds.length} selected transcription${selectedTaskIds.length === 1 ? "" : "s"}?`)) return;
    if (action === "delete_originals" && !window.confirm(`确定要删除 ${selectedTaskIds.length} 个已选转写的原始媒体文件吗？转写稿和生成内容会保留。`)) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch("/api/tasks/batch", {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({taskIds: selectedTaskIds, action, folderId})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法执行批量操作。");
      });
      if (action === "delete" && task && selectedTaskIds.includes(task.id)) setTask(null);
      setSelectedTaskIds([]);
      await refreshTaskList().catch(() => undefined);
      await refreshFolders().catch(() => undefined);
      await refreshUsageSnapshot().catch(() => undefined);
      setNotice(action === "delete" ? "已删除选中的转写。" : action === "delete_originals" ? "已删除选中的原始媒体文件。" : "已移动选中的转写。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function exportSelectedTasks() {
    if (!selectedTaskIds.length) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/tasks/batch/export", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          taskIds: selectedTaskIds,
          format: batchExportFormat,
          showSpeaker: batchShowSpeaker,
          showTimestamp: batchShowTimestamp,
          subtitleMaxChars: batchSubtitleMaxChars,
          subtitleMaxDurationSeconds: batchSubtitleMaxDurationSeconds
        })
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "无法导出选中的转写。");
      }
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const fileName = disposition.match(/filename="([^"]+)"/)?.[1] ?? `uniscribe-batch-${batchExportFormat}.zip`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setNotice(`已导出 ${selectedTaskIds.length} 个选中的转写。`);
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
      if (task) {
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
      }
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
  }, [refreshUsageSnapshot, task?.id]);

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
  }, [refreshUsageSnapshot, task?.id, task?.status]);

  useEffect(() => {
    if (task?.transcript) {
      setDraftText(task.transcript.editedText || task.transcript.plainText || "");
      setSegmentDrafts(task.transcript.segments ?? []);
    }
  }, [task?.transcript]);

  useEffect(() => {
    setSpeakerDrafts((current) => {
      const next: Record<string, string> = {};
      for (const speaker of uniqueSpeakers) {
        next[speaker] = current[speaker] ?? speaker;
      }
      return next;
    });
  }, [uniqueSpeakers]);

  async function startTask() {
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const createTask = async (input: {
        sourceType: "UPLOAD" | "YOUTUBE" | "GOOGLE_DRIVE";
        sourceUrl: string;
        objectKey?: string;
        originalName?: string;
        fileSizeBytes?: number;
      }) => fetch("/api/tasks", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          sourceType: input.sourceType,
          sourceUrl: input.sourceUrl,
          objectKey: input.objectKey,
          originalName: input.originalName,
          folderId: selectedFolderId,
          language,
          enableSpeakerLabels: speakerLabels,
          subtitleEnabled,
          premiumModel,
          summaryTemplate,
          summaryLanguage,
          fileSizeBytes: input.fileSizeBytes
        })
      }).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? copy.createTaskError);
        return data as Task;
      });

      if (mode === "youtube") {
        const created = await createTask({
          sourceType: resolvedMedia?.sourceType ?? "YOUTUBE",
          sourceUrl: resolvedMedia?.sourceUrl ?? youtubeUrl,
          originalName: resolvedMedia?.filename || resolvedMedia?.title
        });
        setTask(created);
        await refreshTaskList().catch(() => undefined);
        await refreshUsageSnapshot().catch(() => undefined);
        return true;
      }

      if (mode === "drive") {
        const created = await createTask({
          sourceType: "GOOGLE_DRIVE",
          sourceUrl: resolvedMedia?.sourceUrl ?? driveUrl,
          originalName: resolvedMedia?.filename || resolvedMedia?.title || "Google Drive 文件"
        });
        setTask(created);
        await refreshTaskList().catch(() => undefined);
        await refreshUsageSnapshot().catch(() => undefined);
        return true;
      }

      // 文件和录音都先拿到短期有效的 R2 直传地址，再把公开地址交给转写队列。
      if (mode === "upload" || mode === "record") {
        const selected = mode === "record" ? files.slice(0, 1) : files.slice(0, maxBatchFiles);
        if (!selected.length) throw new Error(mode === "record" ? copy.needRecording : copy.needFile);

        const createdTasks: Task[] = [];
        for (const selectedFile of selected) {
          const upload = await fetch("/api/uploads", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
              fileName: selectedFile.name,
              contentType: selectedFile.type || "application/octet-stream",
              sizeBytes: selectedFile.size
            })
          }).then(async (response) => {
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error ?? copy.uploadUrlError);
            return data;
          });

          const uploaded = await fetch(upload.uploadUrl, {
            method: "PUT",
            headers: {"Content-Type": selectedFile.type || "application/octet-stream"},
            body: selectedFile
          });
          if (!uploaded.ok) throw new Error(copy.uploadFailed);

          const created = await createTask({
            sourceType: "UPLOAD",
            sourceUrl: upload.publicUrl,
            objectKey: upload.key,
            originalName: selectedFile.name,
            fileSizeBytes: selectedFile.size
          });
          createdTasks.push(created);
        }

        setTask(createdTasks[0] ?? null);
        setNotice(createdTasks.length > 1 ? `${createdTasks.length} transcription jobs queued.` : null);
        await refreshTaskList().catch(() => undefined);
        await refreshUsageSnapshot().catch(() => undefined);
        return true;
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function importDriveFile(fileId: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const created = await fetch("/api/google-drive/import", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          fileId,
          folderId: selectedFolderId,
          language,
          enableSpeakerLabels: speakerLabels,
          subtitleEnabled,
          premiumModel,
          summaryTemplate,
          summaryLanguage
        })
      }).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? "无法导入 Google Drive 文件。");
        return data as Task;
      });
      setTask(created);
      setMode("drive");
      await refreshTaskList().catch(() => undefined);
      await refreshUsageSnapshot().catch(() => undefined);
      setNotice("Google Drive 文件已进入队列。");
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
        body: JSON.stringify({locale, summaryTemplate, translationTarget: summaryLanguage})
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

  async function generateSingleInsight(taskType: "summary" | "mind_map" | "qa") {
    if (!task) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const record = await fetch(`/api/tasks/${task.id}/insights/single`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({taskType, locale, summaryTemplate, regenerate: true})
      }).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? copy.insightError);
        return data as NonNullable<Task["insights"]>[number];
      });

      const others = task.insights?.filter((item) => !(item.type === record.type && item.locale === record.locale)) ?? [];
      setTask({...task, insights: [record, ...others]});
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function generateTranslation(targetLanguageCode: string) {
    if (!task) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const record = await fetch(`/api/tasks/${task.id}/translations`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({targetLanguageCode})
      }).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? "无法创建翻译。");
        return data as NonNullable<Task["insights"]>[number];
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

  async function saveSegments() {
    if (!task?.id || !segmentDrafts.length) return;

    const transcript = await fetch(`/api/tasks/${task.id}/transcript`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({segments: segmentDrafts})
    }).then((response) => response.json());

    setTask({...task, transcript: {...task.transcript!, ...transcript}});
    setDraftText(transcript.editedText || transcript.plainText || "");
    setNotice(copy.transcriptSaved);
  }

  async function saveSpeakerNames() {
    if (!task?.id || !uniqueSpeakers.length) return;
    const speakers = uniqueSpeakers
      .map((from) => ({from, to: (speakerDrafts[from] ?? from).trim()}))
      .filter((speaker) => speaker.to && speaker.to !== speaker.from);
    if (!speakers.length) return;

    setBusy(true);
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

  function updateTranslationContent(locale: string, content: any) {
    if (!task) return;
    const insights = task.insights?.map((item) => (item.type === "TRANSLATION" && item.locale === locale ? {...item, content} : item)) ?? [];
    setTask({...task, insights});
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
        selectFile(new File([blob], `uniscribe-recording-${Date.now()}.webm`, {type: "audio/webm"}));
        setNotice(copy.recordingReady);
      };
      recorder.start();
      setRecording(true);
    } catch {
      setError(copy.micError);
    }
  }

  const isDashboard = variant === "dashboard";
  const isUpload = variant === "upload";

  return (
    <main className={clsx("min-h-screen", isDashboard || isUpload ? "bg-paper" : "bg-white", !isUpload && !isDashboard && "pt-20")}>
      {!isUpload && !isDashboard ? (
        <SiteHeader
          showAuthPair={!isDashboard}
          primaryCta={{
            href: `/${locale}/${isDashboard ? "dashboard" : "auth/signin"}`,
            label: isDashboard ? t("workspace") : "Start for Free",
            icon: <PlayCircle size={16} />
          }}
        />
      ) : null}

      {isUpload ? (
        <UploadWorkspaceShell
          t={t}
          copy={copy}
          locale={locale}
          mode={mode}
          setMode={setMode}
          files={files}
          selectFiles={selectFiles}
          youtubeUrl={youtubeUrl}
          setYoutubeUrl={updateYoutubeUrl}
          driveUrl={driveUrl}
          setDriveUrl={updateDriveUrl}
          resolvedMedia={resolvedMedia}
          setResolvedMedia={setResolvedMedia}
          language={language}
          setLanguage={setLanguage}
          speakerLabels={speakerLabels}
          setSpeakerLabels={setSpeakerLabels}
          subtitleEnabled={subtitleEnabled}
          setSubtitleEnabled={setSubtitleEnabled}
          premiumModel={premiumModel}
          setPremiumModel={setPremiumModel}
          summaryTemplate={summaryTemplate}
          setSummaryTemplate={setSummaryTemplate}
          summaryLanguage={summaryLanguage}
          setSummaryLanguage={setSummaryLanguage}
          busy={busy}
          recording={recording}
          notice={notice}
          error={error}
          inputRef={inputRef}
          toggleRecording={toggleRecording}
          startTask={startTask}
          user={currentUser}
          usageSnapshot={usageSnapshot}
          folders={folders}
          selectedFolderId={selectedFolderId}
          setSelectedFolderId={setSelectedFolderId}
          importDriveFile={importDriveFile}
        />
      ) : null}

      {!isDashboard && !isUpload ? (
        <section className="bg-gradient-to-b from-primary/10 via-white to-primary/10 px-4 pb-16 pt-16 md:px-8 md:pb-20 md:pt-20">
          <div className="mx-auto max-w-6xl text-center">
            <h1 className="mx-auto max-w-5xl text-5xl font-bold leading-tight text-ink md:text-6xl">{t("headline")}</h1>
            <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-slate-500 md:text-xl">{t("subheadline")}</p>
            <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-center gap-8 text-left lg:flex-row lg:gap-10 xl:gap-16">
              <Fact icon={<FileAudio size={40} />} label={t("formats")} items={supportedFormatItems} />
              <Fact icon={<Languages size={40} />} label={t("languages")} items={supportedLanguageItems} />
              <Fact icon={<Download size={40} />} label={t("exportCount")} items={exportFormatItems} />
            </div>
          </div>
          <div className="mx-auto mt-11 max-w-3xl">
            <TranscriptionLauncher
              t={t}
              copy={copy}
              mode={mode}
              setMode={setMode}
              file={file}
              setFile={selectFile}
              youtubeUrl={youtubeUrl}
              setYoutubeUrl={updateYoutubeUrl}
              driveUrl={driveUrl}
              setDriveUrl={updateDriveUrl}
              language={language}
              setLanguage={setLanguage}
              speakerLabels={speakerLabels}
              setSpeakerLabels={setSpeakerLabels}
              subtitleEnabled={subtitleEnabled}
              setSubtitleEnabled={setSubtitleEnabled}
              premiumModel={premiumModel}
              setPremiumModel={setPremiumModel}
              summaryTemplate={summaryTemplate}
              setSummaryTemplate={setSummaryTemplate}
              summaryLanguage={summaryLanguage}
              setSummaryLanguage={setSummaryLanguage}
              busy={busy}
              recording={recording}
              notice={notice}
              error={error}
              inputRef={inputRef}
              toggleRecording={toggleRecording}
              startTask={startTask}
              showRecordTab={false}
              sourceLike
            />
          </div>
        </section>
      ) : null}

      {isDashboard ? (
      <section id="workspace" className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-8 xl:grid-cols-[280px_1fr]">
          <WorkspaceSidebar
            t={t}
            copy={copy}
            locale={locale}
            tasks={shownTasks}
            user={currentUser}
            usageSnapshot={usageSnapshot}
            folders={folders}
            selectedFolderId={selectedFolderId}
            setSelectedFolderId={setSelectedFolderId}
            createFolder={createFolder}
            renameFolder={renameFolder}
            deleteFolder={deleteFolder}
            assetView={assetView}
            setAssetView={setAssetView}
            assetSearch={assetSearch}
            setAssetSearch={setAssetSearch}
            activeTaskId={task?.id}
            onSelectTask={loadTaskDetail}
          />
          <section className="min-h-[calc(100vh-120px)]">
            <DashboardUpgradeCard locale={locale} />

            <div className="mt-7 rounded-xl border border-ink/10 bg-white p-4 shadow-lifted md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-black tracking-tight text-ink">{t("allTranscriptions")}</h1>
                <label className="flex min-w-[240px] items-center gap-2 rounded-md border border-ink/15 bg-white px-3 py-2 transition focus-within:border-violet">
                  <Search size={16} className="text-ink/45" />
                  <input value={assetSearch} onChange={(event) => setAssetSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder={t("searchPlaceholder")} />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => { setMode("upload"); setDashboardUploadOpen(true); }} className="btn-primary">
                  <UploadCloud size={16} />
                  {t("uploadFiles")}
                  </button>
                  <button type="button" onClick={() => { setMode("youtube"); setDashboardLinkOpen(true); }} className="btn-outline">
                  <Link2 size={16} />
                  {t("pasteLink")}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                <select
                  value=""
                  onChange={(event) => {
                    if (!event.target.value) return;
                    runBatchAction("move", event.target.value === "uncategorized" ? null : event.target.value).catch(() => undefined);
                    event.target.value = "";
                  }}
                  disabled={!selectedTaskIds.length || busy}
                  className="field h-10 w-44 bg-white text-sm font-bold disabled:opacity-45"
                  aria-label="Move selected transcriptions"
                >
                  <option value="">{selectedTaskIds.length ? `Move ${selectedTaskIds.length}` : t("bulkActions")}</option>
                  <option value="uncategorized">{t("uncategorized")}</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
                <select
                  value={batchExportFormat}
                  onChange={(event) => setBatchExportFormat(event.target.value)}
                  disabled={!selectedTaskIds.length || busy}
                  className="field h-10 w-24 bg-white text-sm font-bold uppercase disabled:opacity-45"
                  aria-label="Batch export format"
                >
                  {exportFormats.map((format) => (
                    <option key={format} value={format}>{format.toUpperCase()}</option>
                  ))}
                </select>
                <button type="button" onClick={() => exportSelectedTasks().catch(() => undefined)} disabled={!selectedTaskIds.length || busy} className="btn-outline disabled:opacity-45">
                  <Download size={16} />
                  Export selected
                </button>
                <details className="relative">
                  <summary className="btn-outline h-10 cursor-pointer list-none px-3 py-2 text-sm">Export options</summary>
                  <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-ink/10 bg-white p-3 text-xs font-bold text-ink/65 shadow-card">
                    <label className="flex items-center justify-between gap-3">
                      Speaker names
                      <input type="checkbox" checked={batchShowSpeaker} onChange={(event) => setBatchShowSpeaker(event.target.checked)} className="h-4 w-4 accent-violet" />
                    </label>
                    <label className="mt-2 flex items-center justify-between gap-3">
                      Timestamps
                      <input type="checkbox" checked={batchShowTimestamp} onChange={(event) => setBatchShowTimestamp(event.target.checked)} className="h-4 w-4 accent-violet" />
                    </label>
                    <label className="mt-2 grid gap-1">
                      Subtitle max chars
                      <input type="number" min={1} max={2000} value={batchSubtitleMaxChars} onChange={(event) => setBatchSubtitleMaxChars(Number(event.target.value) || 84)} className="field h-9 bg-white text-sm" />
                    </label>
                    <label className="mt-2 grid gap-1">
                      Subtitle max seconds
                      <input type="number" min={0.1} max={60} step={0.1} value={batchSubtitleMaxDurationSeconds} onChange={(event) => setBatchSubtitleMaxDurationSeconds(Number(event.target.value) || 6)} className="field h-9 bg-white text-sm" />
                    </label>
                  </div>
                </details>
                <button type="button" onClick={() => runBatchAction("delete").catch(() => undefined)} disabled={!selectedTaskIds.length || busy} className="btn-outline border-coral/25 text-coral disabled:opacity-45">
                  <Trash2 size={16} />
                  Delete selected
                </button>
                <button type="button" onClick={() => runBatchAction("delete_originals").catch(() => undefined)} disabled={!selectedTaskIds.length || busy} className="btn-outline border-coral/25 text-coral disabled:opacity-45">
                  <X size={16} />
                  Delete originals
                </button>
                </div>
              </div>

              <div className="mt-4">
                <TranscriptionTable tasks={filteredTasks} folders={folders} copy={copy} locale={locale} t={t} activeTaskId={task?.id} selectedTaskIds={selectedTaskIds} setSelectedTaskIds={setSelectedTaskIds} onSelectTask={loadTaskDetail} moveTask={moveTask} />
              </div>

              <div className="mt-5">
                <StatusStrip task={task} t={t} />
              </div>
              {task ? (
                <TaskWorkspace
                  task={task}
                  draftText={draftText}
                  setDraftText={setDraftText}
                  segmentDrafts={segmentDrafts}
                  updateSegmentDraft={updateSegmentDraft}
                  speakerDrafts={speakerDrafts}
                  setSpeakerDrafts={setSpeakerDrafts}
                  uniqueSpeakers={uniqueSpeakers}
                  saveSpeakerNames={saveSpeakerNames}
                  saveTranscript={saveTranscript}
                  saveSegments={saveSegments}
                  copyTranscript={copyTranscript}
                  generateInsights={generateInsights}
                  generateSingleInsight={generateSingleInsight}
                  generateTranslation={generateTranslation}
                  createShareLink={createShareLink}
                  disableShareLink={disableShareLink}
                  renameTask={renameTask}
                  openRetranscribeSettings={() => setRetranscribeDialogOpen(true)}
                  deleteTask={deleteTask}
                  downloadOriginalFile={downloadOriginalFile}
                  deleteOriginalFile={deleteOriginalFile}
                  cancelTask={cancelTask}
                  retryTask={retryTask}
                  shareUrl={shareUrl}
                  busy={busy}
                  summary={summary}
                  mindMap={mindMap}
                  qa={qa}
                  translation={translation}
                  translationTarget={translationTarget}
                  setTranslationTarget={setTranslationTarget}
                  onTranslationSaved={updateTranslationContent}
                  onError={setError}
                  copy={copy}
                  t={t}
                />
              ) : null}
            </div>
            {task && retranscribeDialogOpen ? (
              <RetranscribeDialog
                task={task}
                t={t}
                busy={busy}
                language={language}
                setLanguage={setLanguage}
                speakerLabels={speakerLabels}
                setSpeakerLabels={setSpeakerLabels}
                subtitleEnabled={subtitleEnabled}
                setSubtitleEnabled={setSubtitleEnabled}
                premiumModel={premiumModel}
                setPremiumModel={setPremiumModel}
                summaryTemplate={summaryTemplate}
                setSummaryTemplate={setSummaryTemplate}
                summaryLanguage={summaryLanguage}
                setSummaryLanguage={setSummaryLanguage}
                onClose={() => setRetranscribeDialogOpen(false)}
                onSubmit={() => retranscribeTask(task.id)}
              />
            ) : null}
            {dashboardUploadOpen ? (
              <DashboardTaskDialog title="Upload Files" onClose={() => setDashboardUploadOpen(false)}>
                <DashboardUploadFlow
                  copy={copy}
                  files={files}
                  selectFiles={selectFiles}
                  inputRef={inputRef}
                  busy={busy}
                  notice={notice}
                  error={error}
                  startTask={async () => {
                    const ok = await startTask();
                    if (ok) setDashboardUploadOpen(false);
                  }}
                />
              </DashboardTaskDialog>
            ) : null}
            {dashboardLinkOpen ? (
              <DashboardTaskDialog title="Paste Link" onClose={() => setDashboardLinkOpen(false)}>
                <DashboardLinkFlow
                  copy={copy}
                  youtubeUrl={youtubeUrl}
                  setYoutubeUrl={updateYoutubeUrl}
                  setMode={setMode}
                  resolvedMedia={resolvedMedia}
                  setResolvedMedia={setResolvedMedia}
                  busy={busy}
                  notice={notice}
                  error={error}
                  startTask={async () => {
                    const ok = await startTask();
                    if (ok) setDashboardLinkOpen(false);
                  }}
                />
              </DashboardTaskDialog>
            ) : null}
          </section>
      </section>
      ) : null}

      {showAppSumoWelcome ? (
        <AppSumoWelcomeDialog
          user={currentUser}
          usageSnapshot={usageSnapshot}
          onClose={() => setShowAppSumoWelcome(false)}
          onStartUpload={() => {
            setShowAppSumoWelcome(false);
            window.location.href = `/${locale}/upload?mode=file`;
          }}
        />
      ) : null}

      {!isDashboard && !isUpload ? (
        <ProductSections t={t} copy={copy} locale={locale} />
      ) : null}
    </main>
  );
}

function AppSumoWelcomeDialog({
  user,
  usageSnapshot,
  onClose,
  onStartUpload
}: {
  user: CurrentUser | null;
  usageSnapshot: UsageSnapshot | null;
  onClose: () => void;
  onStartUpload: () => void;
}) {
  const [step, setStep] = useState(0);
  const subscription = usageSnapshot?.subscription ?? user?.subscriptions?.[0] ?? null;
  const plan = subscription?.plan ? subscription.plan.toUpperCase() : "PRO";
  const remaining = subscription?.remainingMinutes ?? 0;
  const quota = subscription?.monthlyMinuteQuota;
  const steps = [
    {
      title: "Your AppSumo license is active",
      text: `${plan} is now connected to ${user?.email ?? "this UniScribe account"}. Your transcription workspace is ready.`,
      icon: <Star size={26} />
    },
    {
      title: "Upload files or paste links",
      text: "Start with audio, video, YouTube links, Google Drive media, or an in-browser recording.",
      icon: <UploadCloud size={26} />
    },
    {
      title: "Turn transcripts into assets",
      text: "Generate summaries, mind maps, Q&A, translations, subtitles, and export bundles from completed files.",
      icon: <Brain size={26} />
    },
    {
      title: "Manage everything in one place",
      text: "Use folders, search, batch export, share links, and usage history to keep your work organized.",
      icon: <FolderOpen size={26} />
    }
  ];
  const active = steps[step] ?? steps[0];
  const last = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="appsumo-welcome-title">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-ink/10 bg-white shadow-lifted">
        <div className="border-b border-ink/10 bg-gradient-to-br from-violet/12 via-white to-primary/10 p-5 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet/20 bg-white px-3 py-1.5 text-xs font-black text-violet shadow-soft">
            <TicketCheck size={15} />
            UniScribe x AppSumo
          </div>
          <div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-xl bg-violet text-white shadow-glow">
            {active.icon}
          </div>
          <h2 id="appsumo-welcome-title" className="mt-4 text-2xl font-black text-ink">{active.title}</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-ink/62">{active.text}</p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-violet/15 bg-violet/5 p-3 text-sm font-bold text-ink/70">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/42">Plan</p>
              <p className="mt-1 text-base font-black text-ink">{plan}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/42">Minutes</p>
              <p className="mt-1 text-base font-black text-ink">{remaining.toLocaleString()}{quota ? ` / ${quota.toLocaleString()}` : ""}</p>
            </div>
          </div>
          <div className="mt-5 flex justify-center gap-2">
            {steps.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setStep(index)}
                className={clsx("h-2.5 rounded-full transition", index === step ? "w-8 bg-violet" : "w-2.5 bg-ink/18 hover:bg-ink/30")}
                aria-label={`Go to AppSumo welcome step ${index + 1}`}
              />
            ))}
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <button type="button" onClick={onClose} className="btn-outline sm:w-32">Skip tour</button>
            {last ? (
              <button type="button" onClick={onStartUpload} className="btn-primary flex-1">
                <UploadCloud size={17} />
                Start transcribing
              </button>
            ) : (
              <button type="button" onClick={() => setStep((value) => Math.min(value + 1, steps.length - 1))} className="btn-primary flex-1">
                Next step
                <ArrowRight size={17} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardUpgradeCard({locale}: {locale: string}) {
  return (
    <section className="overflow-hidden rounded-xl border border-ink/10 bg-white p-6 shadow-lifted md:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-ink">Discounted Yearly Basic Plan</h2>
            <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm font-black text-amber-700">Just $5.00 per month</span>
            <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm font-black text-amber-700">50% OFF</span>
          </div>
          <div className="mt-8 flex flex-wrap items-end gap-4">
            <span className="text-6xl font-black leading-none tracking-tight text-ink">$60.00</span>
            <span className="pb-2 text-xl font-black text-ink/45 line-through">$120.00</span>
            <span className="pb-2 text-lg font-bold text-ink/55">billed yearly</span>
          </div>
          <div className="mt-7 grid gap-3 text-base font-bold text-ink/62 sm:grid-cols-2">
            {["1,200 min/mo", "Premium model", "Speaker identification", "Priority email support"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-violet" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:max-w-3xl sm:flex-row">
            <a href={`/${locale}/pricing`} className="btn-primary flex-1 py-3">
              <Sparkles size={18} />
              Upgrade Now
            </a>
            <a href={`/${locale}/pricing`} className="inline-flex items-center justify-center text-sm font-black text-ink/55 underline decoration-ink/30 underline-offset-4 transition hover:text-violet">See All Plans</a>
          </div>
        </div>
        <div className="rounded-xl border border-ink/10 bg-paper/60 p-5 text-center">
          <div className="flex items-center justify-center gap-2 text-lg font-black text-ink">
            <Clock size={20} className="text-ink/55" />
            Limited Time
          </div>
          <div className="mt-5 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-3xl font-black text-ink">
            <span className="rounded-md border border-ink/10 bg-white px-3 py-3 shadow-soft">08</span>
            <span className="text-ink/40">:</span>
            <span className="rounded-md border border-ink/10 bg-white px-3 py-3 shadow-soft">11</span>
            <span className="text-ink/40">:</span>
            <span className="rounded-md border border-ink/10 bg-white px-3 py-3 shadow-soft">30</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardTaskDialog({title, children, onClose}: {title: string; children: ReactNode; onClose: () => void}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/35 px-4 py-8">
      <section className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-xl border border-ink/10 bg-white p-5 shadow-lifted">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-black text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/55 transition hover:border-violet/25 hover:text-violet" aria-label="Close dialog">
            <X size={17} />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  );
}

function DashboardUploadFlow({
  copy,
  files,
  selectFiles,
  inputRef,
  busy,
  notice,
  error,
  startTask
}: {
  copy: ReturnType<typeof getWorkspaceCopy>;
  files: File[];
  selectFiles: (files: File[] | FileList | null, options?: {append?: boolean}) => void;
  inputRef: RefObject<HTMLInputElement>;
  busy: boolean;
  notice: string | null;
  error: string | null;
  startTask: () => void;
}) {
  return (
    <div>
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          selectFiles(event.dataTransfer.files);
        }}
        className="flex min-h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-violet/30 bg-paper/50 px-4 py-8 text-center"
      >
        <UploadCloud className="text-violet" size={42} />
        <p className="mt-4 text-lg font-black text-ink">{files.length ? `${files.length} file${files.length === 1 ? "" : "s"} selected` : "Drag audio or video files here"}</p>
        <p className="mt-2 text-sm font-bold text-ink/55">Video files will be converted to audio before R2 storage and transcription.</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="btn-primary mt-5">
          <Plus size={17} />
          Select files
        </button>
        <input ref={inputRef} type="file" multiple className="hidden" accept=".3gp,.aac,.amr,.awb,.flac,.m4a,.mka,.mkv,.mov,.mp2,.mp3,.mp4,.mpg,.oga,.ogg,.opus,.ts,.wav,.weba,.webm,.wma,.wmv" onChange={(event) => selectFiles(event.target.files)} />
      </div>
      {files.length ? (
        <div className="mt-4 max-h-44 overflow-auto rounded-lg border border-ink/10">
          {files.map((item) => (
            <div key={`${item.name}-${item.size}-${item.lastModified}`} className="flex items-center justify-between gap-3 border-b border-ink/10 px-3 py-2 text-sm last:border-b-0">
              <span className="truncate font-bold text-ink">{item.name}</span>
              <span className="shrink-0 text-xs font-bold text-ink/45">{Math.max(1, Math.ceil(item.size / 1024 / 1024))} MB</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-5 flex flex-wrap justify-between gap-3">
        <button type="button" onClick={() => selectFiles(null)} className="btn-outline">Clear</button>
        <button type="button" onClick={startTask} disabled={busy || !files.length} className="btn-primary disabled:opacity-45">
          {busy ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          Start Upload
        </button>
      </div>
      {notice ? <p className="mt-3 rounded-md border border-violet/30 bg-violet/10 px-3 py-2 text-sm text-violet">{notice}</p> : null}
      {error ? <p className="mt-3 rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p> : null}
    </div>
  );
}

function DashboardLinkFlow({
  copy,
  youtubeUrl,
  setYoutubeUrl,
  setMode,
  resolvedMedia,
  setResolvedMedia,
  busy,
  notice,
  error,
  startTask
}: {
  copy: ReturnType<typeof getWorkspaceCopy>;
  youtubeUrl: string;
  setYoutubeUrl: (value: string) => void;
  setMode: (value: InputMode) => void;
  resolvedMedia: ResolvedMedia | null;
  setResolvedMedia: (value: ResolvedMedia | null) => void;
  busy: boolean;
  notice: string | null;
  error: string | null;
  startTask: () => void;
}) {
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  async function resolve() {
    setResolving(true);
    setResolveError(null);
    setResolvedMedia(null);
    try {
      const data = await fetch("/api/media/resolve", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({url: youtubeUrl})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法检查该链接。");
        return body as ResolvedMedia;
      });
      setResolvedMedia(data);
      setMode(data.sourceType === "GOOGLE_DRIVE" ? "drive" : "youtube");
    } catch (cause) {
      setResolveError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setResolving(false);
    }
  }

  return (
    <div>
      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
          <Link2 size={16} className="text-violet" />
          Media link
        </span>
        <input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} className="field" placeholder="Paste YouTube, Vimeo, TikTok, or a public media link" autoFocus />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        {copy.supportedPlatforms.map((item) => (
          <span key={item} className="rounded-full border border-violet/15 bg-violet/5 px-3 py-1 text-xs font-bold text-ink/65">{item}</span>
        ))}
      </div>
      <button type="button" onClick={resolve} disabled={resolving || busy || !youtubeUrl} className="btn-outline mt-5 w-full py-3 disabled:opacity-45">
        {resolving ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
        Check link
      </button>
      {resolveError ? <p className="mt-3 rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">{resolveError}</p> : null}
      {resolvedMedia ? <MediaLinkPreview media={resolvedMedia} /> : null}
      <button type="button" onClick={startTask} disabled={busy || !youtubeUrl || !resolvedMedia} className="btn-primary mt-4 w-full py-3 disabled:opacity-45">
        {busy ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        Start transcription
      </button>
      {notice ? <p className="mt-3 rounded-md border border-violet/30 bg-violet/10 px-3 py-2 text-sm text-violet">{notice}</p> : null}
      {error ? <p className="mt-3 rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p> : null}
    </div>
  );
}

function TranscriptionLauncher({
  t,
  copy,
  mode,
  setMode,
  file,
  setFile,
  youtubeUrl,
  setYoutubeUrl,
  driveUrl,
  setDriveUrl,
  language,
  setLanguage,
  speakerLabels,
  setSpeakerLabels,
  subtitleEnabled,
  setSubtitleEnabled,
  premiumModel,
  setPremiumModel,
  summaryTemplate,
  setSummaryTemplate,
  summaryLanguage,
  setSummaryLanguage,
  busy,
  recording,
  notice,
  error,
  inputRef,
  toggleRecording,
  startTask,
  compact = false,
  showRecordTab = true,
  sourceLike = false
}: {
  t: (key: string) => string;
  copy: ReturnType<typeof getWorkspaceCopy>;
  mode: InputMode;
  setMode: (value: InputMode) => void;
  file: File | null;
  setFile: (value: File | null) => void;
  youtubeUrl: string;
  setYoutubeUrl: (value: string) => void;
  driveUrl: string;
  setDriveUrl: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  speakerLabels: boolean;
  setSpeakerLabels: (value: boolean) => void;
  subtitleEnabled: boolean;
  setSubtitleEnabled: (value: boolean) => void;
  premiumModel: boolean;
  setPremiumModel: (value: boolean) => void;
  summaryTemplate: string;
  setSummaryTemplate: (value: string) => void;
  summaryLanguage: string;
  setSummaryLanguage: (value: string) => void;
  busy: boolean;
  recording: boolean;
  notice: string | null;
  error: string | null;
  inputRef: RefObject<HTMLInputElement>;
  toggleRecording: () => void;
  startTask: () => void;
  compact?: boolean;
  showRecordTab?: boolean;
  sourceLike?: boolean;
}) {
  const liveAudioFormats = "aac, amr, awb, flac, m4a, mka, mp2, mp3, oga, ogg, opus, wav, weba, webm, wma";
  const liveVideoFormats = "3gp, mkv, mov, mp4, mpg, ts, webm, wmv";

  return (
    <aside className={clsx("rounded-lg border bg-white shadow-lifted", sourceLike ? "border-slate-200 p-5 md:p-6" : "border-ink/10", compact ? "p-4" : !sourceLike && "p-6 md:p-8")}>
      <div className={clsx("grid text-sm font-semibold", sourceLike ? "rounded-md bg-slate-100 p-1 text-slate-500" : "border-b border-ink/10 font-black text-ink/55", showRecordTab ? "grid-cols-3" : "grid-cols-2")}>
        <ModeButton active={mode === "upload"} icon={<UploadCloud size={17} />} label={t("uploadFile")} onClick={() => setMode("upload")} />
        <ModeButton active={mode === "youtube"} icon={<Link2 size={17} />} label={t("pasteLink")} onClick={() => setMode("youtube")} />
        {showRecordTab ? <ModeButton active={mode === "record"} icon={<Mic size={17} />} label={t("recordAudio")} onClick={() => setMode("record")} /> : null}
      </div>

      <div className="mt-6">
        {mode === "upload" ? (
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              setFile(event.dataTransfer.files[0] ?? null);
            }}
            className={clsx(
              "group flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white p-5 text-center transition",
              sourceLike ? "border-primary/35 hover:border-primary hover:bg-primary/5" : "border-violet/35 hover:border-violet hover:bg-violet/5",
              compact ? "min-h-44" : "min-h-56"
            )}
          >
            <span className={clsx("inline-flex h-12 w-12 items-center justify-center rounded-lg text-white shadow-soft transition group-hover:scale-105", sourceLike ? "bg-primary" : "bg-violet")}>
              <UploadCloud size={25} />
            </span>
            <h2 className="mt-4 max-w-full break-words text-xl font-black">{file?.name ?? "Drag files here to upload"}</h2>
            <p className="my-4 text-xs font-black uppercase tracking-wide text-ink/38">—— OR ——</p>
            <button type="button" onClick={() => inputRef.current?.click()} className="btn-primary">
              <UploadCloud size={17} />
              Upload a file
            </button>
            <input ref={inputRef} type="file" className="hidden" accept=".3gp,.aac,.amr,.awb,.flac,.m4a,.mka,.mkv,.mov,.mp2,.mp3,.mp4,.mpg,.oga,.ogg,.opus,.ts,.wav,.weba,.webm,.wma,.wmv" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </div>
        ) : mode === "youtube" || mode === "drive" ? (
          <div className={clsx("rounded-lg border p-4", sourceLike ? "border-slate-200 bg-slate-50" : "border-ink/10 bg-paper/45")}>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                {mode === "drive" ? <HardDrive size={16} className="text-violet" /> : <Link2 size={16} className="text-violet" />}
                {mode === "drive" ? "导入 Google Drive" : t("mediaLinkTranscription")}
              </span>
              <input
                value={mode === "drive" ? driveUrl : youtubeUrl}
                onChange={(event) => (mode === "drive" ? setDriveUrl(event.target.value) : setYoutubeUrl(event.target.value))}
                className="field"
                placeholder={mode === "drive" ? "粘贴公开 Google Drive 文件链接" : t("youtubePlaceholder")}
              />
            </label>
            {mode === "youtube" ? <div className="mt-4">
              <p className="text-xs font-black uppercase text-ink/45">{t("supportedPlatforms")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {copy.supportedPlatforms.map((item) => (
                  <span key={item} className="rounded-full border border-violet/15 bg-white px-2.5 py-1 text-xs font-bold text-ink/65">{item}</span>
                ))}
              </div>
            </div> : <p className="mt-3 text-xs font-bold leading-5 text-ink/55">The Drive file must be shared so anyone with the link can view it.</p>}
          </div>
        ) : (
          <div className={clsx("rounded-lg border-2 border-dashed p-5", sourceLike ? "border-primary/30 bg-slate-50" : "border-violet/30 bg-paper/45")}>
            <div className="flex min-h-32 flex-col items-center justify-center text-center">
              <span className={clsx("inline-flex h-12 w-12 items-center justify-center rounded-lg transition", recording ? "animate-pulse bg-coral/15 text-coral" : "bg-violet text-white")}>
                <Mic size={25} />
              </span>
              <p className="mt-3 text-sm leading-6 text-ink/65">{t("recordHint")}</p>
              <button type="button" onClick={toggleRecording} className={recording ? "btn-accent mt-4" : "btn-primary mt-4"}>
                {recording ? <Loader2 className="animate-spin" size={16} /> : <Mic size={16} />}
                {recording ? t("stopRecord") : t("startRecord")}
              </button>
              {file && mode === "record" ? <p className="mt-3 max-w-full break-words text-xs font-bold text-violet">{file.name}</p> : null}
            </div>
          </div>
        )}
      </div>

      <TranscriptionSettingsPanel
        t={t}
        language={language}
        setLanguage={setLanguage}
        speakerLabels={speakerLabels}
        setSpeakerLabels={setSpeakerLabels}
        subtitleEnabled={subtitleEnabled}
        setSubtitleEnabled={setSubtitleEnabled}
        premiumModel={premiumModel}
        setPremiumModel={setPremiumModel}
        summaryTemplate={summaryTemplate}
        setSummaryTemplate={setSummaryTemplate}
        summaryLanguage={summaryLanguage}
        setSummaryLanguage={setSummaryLanguage}
        compact={sourceLike || compact}
      />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-ink/55">
          Audio: {liveAudioFormats}
          <br />
          Video: {liveVideoFormats}
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          {!showRecordTab ? (
            <button type="button" onClick={() => setMode("record")} className="btn-outline py-3">
              <Mic size={16} />
              {t("recordAudio")}
            </button>
          ) : null}
          <button type="button" onClick={startTask} disabled={busy || (mode === "youtube" ? !youtubeUrl : mode === "drive" ? !driveUrl : !file)} className="btn-primary py-3">
            {busy ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {t("start")}
          </button>
        </div>
      </div>
      {notice ? <p className="mt-3 animate-fade-in rounded-md border border-violet/30 bg-violet/10 px-3 py-2 text-sm text-violet">{notice}</p> : null}
      {error ? <p className="mt-3 animate-fade-in rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p> : null}
    </aside>
  );
}

const summaryTemplateOptions = [
  ["none", "No summary"],
  ["standard", "Summary"],
  ["meeting", "Meeting notes"],
  ["study", "Study notes"],
  ["interview", "Interview brief"]
] as const;

const summaryLanguageOptions = [
  ["en", "English"],
  ["zh", "Chinese"],
  ["es", "Spanish"],
  ["fr", "French"],
  ["de", "German"],
  ["ja", "Japanese"],
  ["ko", "Korean"],
  ["pt", "Portuguese"]
] as const;

function TranscriptionSettingsPanel({
  t,
  language,
  setLanguage,
  speakerLabels,
  setSpeakerLabels,
  subtitleEnabled,
  setSubtitleEnabled,
  premiumModel,
  setPremiumModel,
  summaryTemplate,
  setSummaryTemplate,
  summaryLanguage,
  setSummaryLanguage,
  compact
}: {
  t: (key: string) => string;
  language: string;
  setLanguage: (value: string) => void;
  speakerLabels: boolean;
  setSpeakerLabels: (value: boolean) => void;
  subtitleEnabled: boolean;
  setSubtitleEnabled: (value: boolean) => void;
  premiumModel: boolean;
  setPremiumModel: (value: boolean) => void;
  summaryTemplate: string;
  setSummaryTemplate: (value: string) => void;
  summaryLanguage: string;
  setSummaryLanguage: (value: string) => void;
  compact?: boolean;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(!compact);

  return (
    <section className="mt-5 rounded-lg border border-ink/10 bg-paper/45 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="mb-2 flex items-center gap-2 text-sm font-bold">
            <Languages size={16} className="text-violet" />
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

        <SettingSwitch
          icon={<Globe2 size={16} />}
          label={t("speakerLabels")}
          checked={speakerLabels}
          onChange={setSpeakerLabels}
        />
      </div>

      <button
        type="button"
        onClick={() => setAdvancedOpen((value) => !value)}
        className="mt-4 flex w-full items-center justify-between rounded-md border border-ink/10 bg-white px-3.5 py-2.5 text-sm font-black text-ink/70 transition hover:border-violet/25 hover:text-violet"
        aria-expanded={advancedOpen}
      >
        <span className="flex items-center gap-2">
          <Settings2 size={16} className="text-violet" />
          Advanced settings
        </span>
        <ChevronDown size={16} className={clsx("transition", advancedOpen && "rotate-180")} />
      </button>

      {advancedOpen ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <SettingSwitch
            icon={<FileAudio size={16} />}
            label="Generate subtitles"
            description="Create subtitle-ready timing for SRT and VTT exports."
            checked={subtitleEnabled}
            onChange={setSubtitleEnabled}
          />
          <SettingSwitch
            icon={<Sparkles size={16} />}
            label="Premium transcription model"
            description="Prioritize the highest-accuracy provider path when available."
            checked={premiumModel}
            onChange={setPremiumModel}
          />
          <label>
            <span className="mb-2 flex items-center gap-2 text-sm font-bold">
              <Brain size={16} className="text-violet" />
              Summary template
            </span>
            <select value={summaryTemplate} onChange={(event) => setSummaryTemplate(event.target.value)} className="field">
              {summaryTemplateOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 flex items-center gap-2 text-sm font-bold">
              <Languages size={16} className="text-violet" />
              Summary language
            </span>
            <select value={summaryLanguage} onChange={(event) => setSummaryLanguage(event.target.value)} className="field">
              {summaryLanguageOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </section>
  );
}

function SettingSwitch({
  icon,
  label,
  description,
  checked,
  onChange
}: {
  icon: ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex min-h-[52px] items-center justify-between gap-3 rounded-md border border-ink/15 bg-white px-3.5 py-3 transition hover:border-violet/30">
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-sm font-bold">
          <span className="text-violet">{icon}</span>
          {label}
        </span>
        {description ? <span className="mt-1 block text-xs leading-5 text-ink/50">{description}</span> : null}
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 shrink-0 accent-violet" />
    </label>
  );
}

function RetranscribeDialog({
  task,
  t,
  busy,
  language,
  setLanguage,
  speakerLabels,
  setSpeakerLabels,
  subtitleEnabled,
  setSubtitleEnabled,
  premiumModel,
  setPremiumModel,
  summaryTemplate,
  setSummaryTemplate,
  summaryLanguage,
  setSummaryLanguage,
  onClose,
  onSubmit
}: {
  task: Task;
  t: (key: string) => string;
  busy: boolean;
  language: string;
  setLanguage: (value: string) => void;
  speakerLabels: boolean;
  setSpeakerLabels: (value: boolean) => void;
  subtitleEnabled: boolean;
  setSubtitleEnabled: (value: boolean) => void;
  premiumModel: boolean;
  setPremiumModel: (value: boolean) => void;
  summaryTemplate: string;
  setSummaryTemplate: (value: string) => void;
  summaryLanguage: string;
  setSummaryLanguage: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/35 px-4 py-8">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl border border-ink/10 bg-white p-5 shadow-lifted">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-ink">重新转写设置</h2>
            <p className="mt-1 text-sm font-bold leading-6 text-ink/55">使用新的语言、说话人、字幕、模型和摘要设置重新排队 {task.originalName || "这个转写任务"}。</p>
          </div>
          <button type="button" onClick={onClose} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/55 hover:text-ink" aria-label="关闭重新转写设置">
            <X size={16} />
          </button>
        </div>
        <TranscriptionSettingsPanel
          t={t}
          language={language}
          setLanguage={setLanguage}
          speakerLabels={speakerLabels}
          setSpeakerLabels={setSpeakerLabels}
          subtitleEnabled={subtitleEnabled}
          setSubtitleEnabled={setSubtitleEnabled}
          premiumModel={premiumModel}
          setPremiumModel={setPremiumModel}
          summaryTemplate={summaryTemplate}
          setSummaryTemplate={setSummaryTemplate}
          summaryLanguage={summaryLanguage}
          setSummaryLanguage={setSummaryLanguage}
        />
        <p className="mt-4 rounded-md border border-coral/20 bg-coral/10 px-3 py-2 text-xs font-bold leading-5 text-coral">已有 AI 洞察和导出缓存会重新生成。</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-outline px-3 py-2">Cancel</button>
          <button type="button" onClick={onSubmit} disabled={busy} className="btn-primary px-3 py-2">
            {busy ? <Loader2 className="animate-spin" size={16} /> : <RotateCcw size={16} />}
            Queue retranscription
          </button>
        </div>
      </section>
    </div>
  );
}

function UploadWorkspaceShell({
  t,
  copy,
  locale,
  mode,
  setMode,
  files,
  selectFiles,
  youtubeUrl,
  setYoutubeUrl,
  driveUrl,
  setDriveUrl,
  resolvedMedia,
  setResolvedMedia,
  language,
  setLanguage,
  speakerLabels,
  setSpeakerLabels,
  subtitleEnabled,
  setSubtitleEnabled,
  premiumModel,
  setPremiumModel,
  summaryTemplate,
  setSummaryTemplate,
  summaryLanguage,
  setSummaryLanguage,
  busy,
  recording,
  notice,
  error,
  inputRef,
  toggleRecording,
  startTask,
  user,
  usageSnapshot,
  folders,
  selectedFolderId,
  setSelectedFolderId,
  importDriveFile
}: {
  t: (key: string) => string;
  copy: ReturnType<typeof getWorkspaceCopy>;
  locale: string;
  mode: InputMode;
  setMode: (value: InputMode) => void;
  files: File[];
  selectFiles: (files: File[] | FileList | null, options?: {append?: boolean}) => void;
  youtubeUrl: string;
  setYoutubeUrl: (value: string) => void;
  driveUrl: string;
  setDriveUrl: (value: string) => void;
  resolvedMedia: ResolvedMedia | null;
  setResolvedMedia: (value: ResolvedMedia | null) => void;
  language: string;
  setLanguage: (value: string) => void;
  speakerLabels: boolean;
  setSpeakerLabels: (value: boolean) => void;
  subtitleEnabled: boolean;
  setSubtitleEnabled: (value: boolean) => void;
  premiumModel: boolean;
  setPremiumModel: (value: boolean) => void;
  summaryTemplate: string;
  setSummaryTemplate: (value: string) => void;
  summaryLanguage: string;
  setSummaryLanguage: (value: string) => void;
  busy: boolean;
  recording: boolean;
  notice: string | null;
  error: string | null;
  inputRef: RefObject<HTMLInputElement>;
  toggleRecording: () => void;
  startTask: () => void;
  user: CurrentUser | null;
  usageSnapshot: UsageSnapshot | null;
  folders: FolderItem[];
  selectedFolderId: string | null;
  setSelectedFolderId: (value: string | null) => void;
  importDriveFile: (fileId: string) => Promise<void>;
}) {
  const quota = usageSnapshot?.subscription.monthlyMinuteQuota ?? user?.subscriptions?.[0]?.monthlyMinuteQuota ?? 120;
  const remaining = usageSnapshot?.subscription.remainingMinutes ?? user?.subscriptions?.[0]?.remainingMinutes ?? quota;
  const dailyUsed = usageSnapshot?.dailyFree.used ?? user?.dailyFreeCount ?? 0;
  const dailyLimit = usageSnapshot?.dailyFree.limit ?? 3;
  const [linkDialogOpen, setLinkDialogOpen] = useState(mode === "youtube");
  const [driveDialogOpen, setDriveDialogOpen] = useState(mode === "drive");
  const [resolvingLink, setResolvingLink] = useState(false);
  const [linkResolveError, setLinkResolveError] = useState<string | null>(null);
  const [driveConnection, setDriveConnection] = useState<DriveConnectionState | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [driveSearch, setDriveSearch] = useState("");
  const [driveBusy, setDriveBusy] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const fileCount = files.length;
  const fileLabel = fileCount > 1 ? `${fileCount} files selected` : files[0]?.name;

  useEffect(() => {
    if (mode === "youtube") setLinkDialogOpen(true);
    if (mode === "drive") setDriveDialogOpen(true);
  }, [mode]);

  async function resolveMediaLink() {
    setResolvingLink(true);
    setLinkResolveError(null);
    setResolvedMedia(null);
    try {
      const data = await fetch("/api/media/resolve", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({url: youtubeUrl})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法检查该链接。");
        return body as ResolvedMedia;
      });
      setResolvedMedia(data);
      if (data.provider === "google_drive") {
        setMode("drive");
        setDriveUrl(data.sourceUrl || youtubeUrl);
        setResolvedMedia(data);
        setLinkDialogOpen(false);
        setDriveDialogOpen(true);
      }
    } catch (cause) {
      setLinkResolveError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setResolvingLink(false);
    }
  }

  const refreshDriveConnection = useCallback(async () => {
    const data = await fetch("/api/google-drive/connection", {cache: "no-store"}).then((response) => response.json());
    setDriveConnection(data as DriveConnectionState);
    return data as DriveConnectionState;
  }, []);

  const loadDriveFiles = useCallback(async (query = driveSearch) => {
    setDriveBusy(true);
    setDriveError(null);
    try {
      const connection = await refreshDriveConnection();
      if (!connection.connected) {
        setDriveFiles([]);
        return;
      }
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      const data = await fetch(`/api/google-drive/files?${params.toString()}`, {cache: "no-store"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法加载 Google Drive 文件。");
        return body as {files: DriveFileItem[]};
      });
      setDriveFiles(data.files);
    } catch (cause) {
      setDriveError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setDriveBusy(false);
    }
  }, [driveSearch, refreshDriveConnection]);

  async function disconnectDrive() {
    setDriveBusy(true);
    setDriveError(null);
    try {
      await fetch("/api/google-drive/connection", {method: "DELETE"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "无法断开 Google Drive。");
      });
      setDriveConnection({connected: false});
      setDriveFiles([]);
    } catch (cause) {
      setDriveError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setDriveBusy(false);
    }
  }

  useEffect(() => {
    if (driveDialogOpen) {
      loadDriveFiles().catch(() => undefined);
    }
  }, [driveDialogOpen, loadDriveFiles]);

  return (
    <section className="min-h-screen bg-paper">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-ink/10 bg-white px-5 py-5 shadow-soft">
          <a href={`/${locale}/dashboard`} className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-black text-ink/70 transition hover:text-violet">
            <ArrowLeft size={16} />
            Dashboard
          </a>
          <a href={`/${locale}`} className="mt-6 flex items-center">
            <Image src="/uniscribe-logo.svg" alt="UniScribe" width={132} height={36} priority />
          </a>

          <div className="mt-8 grid gap-2">
            <button type="button" onClick={() => setMode("upload")} className={clsx("focus-ring flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-black transition", mode === "upload" ? "bg-violet text-white" : "bg-paper text-ink/70 hover:bg-violet/8 hover:text-violet")}>
              <UploadCloud size={18} />
              Select files from your device
            </button>
            <button type="button" onClick={() => { setMode("youtube"); setLinkDialogOpen(true); }} className={clsx("focus-ring flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-black transition", mode === "youtube" ? "bg-violet text-white" : "bg-paper text-ink/70 hover:bg-violet/8 hover:text-violet")}>
              <Link2 size={18} />
              Paste Link
            </button>
            <button type="button" onClick={() => { setMode("drive"); setDriveDialogOpen(true); }} className={clsx("focus-ring flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-black transition", mode === "drive" ? "bg-violet text-white" : "bg-paper text-ink/70 hover:bg-violet/8 hover:text-violet")}>
              <HardDrive size={18} />
              Google Drive
            </button>
          </div>

          <div className="mt-8 rounded-xl border border-ink/10 bg-paper/60 p-4">
            <p className="text-xs font-black uppercase text-ink/45">Current Plan</p>
            <p className="mt-1 text-2xl font-black uppercase">{usageSnapshot?.subscription.plan ?? user?.subscriptions?.[0]?.plan ?? "FREE"}</p>
            <div className="mt-4 grid gap-3 text-sm font-bold text-ink/70">
              <div className="flex justify-between"><span>DAILY</span><span>{dailyUsed}/{dailyLimit}</span></div>
              <div className="flex justify-between"><span>MINUTES</span><span>{Math.max(0, quota - remaining)}/{quota} min</span></div>
            </div>
            <a href={`/${locale}/pricing`} className="btn-primary mt-4 w-full">Upgrade Plan</a>
          </div>

          <div className="mt-5 rounded-xl border border-ink/10 bg-paper/60 p-4">
            <p className="text-xs font-black uppercase text-ink/45">Folders</p>
            <select value={selectedFolderId ?? ""} onChange={(event) => setSelectedFolderId(event.target.value || null)} className="field mt-3 bg-white text-sm font-bold">
              <option value="">Uncategorized</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
            <div className="mt-4 border-t border-ink/10 pt-4">
              <p className="break-words text-sm font-black text-ink">{user?.name || copy.anonymousUser}</p>
              <p className="mt-1 break-words text-xs font-bold text-ink/55">{user?.email || copy.loginSyncHint}</p>
            </div>
          </div>
        </aside>

        <main className="px-4 py-6 md:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm font-black text-ink/45">
                  <a href={`/${locale}/dashboard`} className="transition hover:text-violet">Dashboard</a>
                  <span>/</span>
                  <span className="text-ink">Upload Files</span>
                </div>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">Upload Files</h1>
              </div>
              <a href={`/${locale}/dashboard`} className="btn-outline">
                <FolderOpen size={16} />
                Recent Files
              </a>
            </div>

            <section className="rounded-xl border border-ink/10 bg-white p-5 shadow-lifted md:p-7">
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  setMode("upload");
                  selectFiles(event.dataTransfer.files);
                }}
                className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-violet/25 bg-paper/50 px-4 py-10 text-center"
              >
                <UploadCloud className="text-violet" size={44} />
                <p className="mt-5 text-xl font-black text-ink">{fileLabel ?? "Drag and drop files here"}</p>
                <p className="my-4 text-xs font-black uppercase tracking-wide text-ink/38">OR</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={() => { setMode("upload"); inputRef.current?.click(); }} className="btn-primary">
                    <UploadCloud size={17} />
                    Select files from your device
                  </button>
                  <button type="button" onClick={() => { setMode("youtube"); setLinkDialogOpen(true); }} className="btn-outline">
                    <Link2 size={17} />
                    Paste Link
                  </button>
                  <button type="button" onClick={() => { setMode("drive"); setDriveDialogOpen(true); }} className="btn-outline">
                    <HardDrive size={17} />
                    Google Drive
                  </button>
                </div>
                <input ref={inputRef} type="file" multiple className="hidden" accept=".3gp,.aac,.amr,.awb,.flac,.m4a,.mka,.mkv,.mov,.mp2,.mp3,.mp4,.mpg,.oga,.ogg,.opus,.ts,.wav,.weba,.webm,.wma,.wmv" onChange={(event) => selectFiles(event.target.files)} />
                {fileCount ? (
                  <div className="mt-5 w-full max-w-xl rounded-lg border border-ink/10 bg-white text-left">
                    <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-3 py-2 text-xs font-black uppercase text-ink/45">
                      <span>{fileCount} / {maxBatchFiles} files</span>
                      <button type="button" onClick={() => selectFiles(null)} className="text-violet transition hover:text-ink">Clear</button>
                    </div>
                    <div className="max-h-36 overflow-auto p-2">
                      {files.map((item) => (
                        <div key={`${item.name}-${item.size}-${item.lastModified}`} className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm font-bold text-ink/70">
                          <span className="truncate">{item.name}</span>
                          <span className="shrink-0 text-xs text-ink/40">{Math.max(1, Math.ceil(item.size / 1024 / 1024))} MB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {fileCount ? (
                  <button type="button" onClick={startTask} disabled={busy || !fileCount} className="btn-primary mt-6 py-3">
                    {busy ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    {fileCount > 1 ? `Start ${fileCount} Uploads` : "Start Upload"}
                  </button>
                ) : null}
                {notice ? <p className="mt-4 animate-fade-in rounded-md border border-violet/30 bg-violet/10 px-3 py-2 text-sm text-violet">{notice}</p> : null}
                {error ? <p className="mt-4 animate-fade-in rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p> : null}
              </div>
            </section>

            <TranscriptionSettingsPanel
              t={t}
              language={language}
              setLanguage={setLanguage}
              speakerLabels={speakerLabels}
              setSpeakerLabels={setSpeakerLabels}
              subtitleEnabled={subtitleEnabled}
              setSubtitleEnabled={setSubtitleEnabled}
              premiumModel={premiumModel}
              setPremiumModel={setPremiumModel}
              summaryTemplate={summaryTemplate}
              setSummaryTemplate={setSummaryTemplate}
              summaryLanguage={summaryLanguage}
              setSummaryLanguage={setSummaryLanguage}
            />

            <section className="mt-5 rounded-xl border border-ink/10 bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <PanelTitle icon={<FileAudio size={18} />} label="Supported Formats & Limits" />
                <span className="rounded-full bg-violet/10 px-3 py-1 text-xs font-black text-violet">Available minutes: {remaining}</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {[
                  ["Audio Formats", "aac, amr, awb, flac, m4a, mka, mp2, mp3, oga, ogg, opus, wav, weba, webm, wma"],
                  ["Video Formats", "3gp, mkv, mov, mp4, mpg, ts, webm, wmv"],
                  ["Maximum files", "Maximum 50 files"],
                  ["Maximum file size", "Maximum file size: 5GB per file"]
                ].map(([label, value]) => (
                  <article key={label} className="rounded-lg bg-paper/65 p-4 ring-1 ring-ink/5">
                    <h2 className="text-sm font-black text-ink">{label}</h2>
                    <p className="mt-2 text-sm leading-6 text-ink/60">{value}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
      {linkDialogOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-ink/35 px-4 py-6">
          <section className="w-full max-w-lg rounded-xl border border-ink/10 bg-white p-5 shadow-lifted">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-ink">Media Link Transcription</h2>
                <p className="mt-2 text-sm leading-6 text-ink/60">Paste a media link to transcribe video or audio content.</p>
              </div>
              <button type="button" onClick={() => setLinkDialogOpen(false)} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/55 transition hover:border-violet/25 hover:text-violet" aria-label="Close">
                <X size={17} />
              </button>
            </div>
            <div className="mt-5">
              <p className="text-xs font-black uppercase tracking-wide text-ink/45">Supported platforms</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {copy.supportedPlatforms.map((item) => (
                  <span key={item} className="rounded-full border border-violet/15 bg-violet/5 px-3 py-1 text-xs font-bold text-ink/65">{item}</span>
                ))}
              </div>
            </div>
            <label className="mt-5 block">
              <span className="sr-only">Link input</span>
              <input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} className="field" placeholder="Paste a media link" autoFocus />
            </label>
            <button type="button" onClick={resolveMediaLink} disabled={resolvingLink || busy || !youtubeUrl} className="btn-primary mt-4 w-full py-3">
              {resolvingLink ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
              Check link
            </button>
            {linkResolveError ? <p className="mt-3 animate-fade-in rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">{linkResolveError}</p> : null}
            {resolvedMedia && mode === "youtube" ? (
              <MediaLinkPreview media={resolvedMedia} />
            ) : null}
            {resolvedMedia && mode === "youtube" ? (
              <button type="button" onClick={startTask} disabled={busy} className="btn-primary mt-3 w-full py-3">
                {busy ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Start transcription
              </button>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-paper/65 px-4 py-3 text-sm">
              <span className="font-bold text-ink/60">Available minutes:</span>
              <span className="font-black text-ink">{remaining}</span>
            </div>
            <a href={`/${locale}/pricing`} className="btn-outline mt-3 w-full">Buy More Minutes</a>
          </section>
        </div>
      ) : null}
      {driveDialogOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-ink/35 px-4 py-6">
          <section className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-xl border border-ink/10 bg-white p-5 shadow-lifted">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-ink">Google Drive Import</h2>
                <p className="mt-2 text-sm leading-6 text-ink/60">Connect Google Drive to pick private audio or video files, or paste a public Drive file link.</p>
              </div>
              <button type="button" onClick={() => setDriveDialogOpen(false)} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/55 transition hover:border-violet/25 hover:text-violet" aria-label="Close">
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 rounded-lg border border-violet/15 bg-violet/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-ink">{driveConnection?.connected ? "Google Drive connected" : "Connect your Google Drive"}</p>
                  <p className="mt-1 text-xs font-bold text-ink/55">{driveConnection?.connection?.email || "Read-only access is used to list and import selected media files."}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {driveConnection?.connected ? (
                    <>
                      <button type="button" onClick={() => loadDriveFiles().catch(() => undefined)} disabled={driveBusy} className="btn-outline px-3 py-2">
                        {driveBusy ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                        Refresh
                      </button>
                      <button type="button" onClick={disconnectDrive} disabled={driveBusy} className="btn-outline border-coral/25 px-3 py-2 text-coral">
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <a href={`/api/google-drive/auth?locale=${encodeURIComponent(locale)}`} className="btn-primary px-3 py-2">
                      <HardDrive size={16} />
                      Connect Drive
                    </a>
                  )}
                </div>
              </div>
              {driveConnection?.connected ? (
                <div className="mt-4">
                  <label className="flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 transition focus-within:border-violet">
                    <Search size={16} className="text-ink/45" />
                    <input
                      value={driveSearch}
                      onChange={(event) => setDriveSearch(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") loadDriveFiles(driveSearch).catch(() => undefined);
                      }}
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder="Search Drive audio or video files"
                    />
                    <button type="button" onClick={() => loadDriveFiles(driveSearch).catch(() => undefined)} className="text-xs font-black uppercase text-violet">Search</button>
                  </label>
                  <div className="mt-3 grid max-h-60 gap-2 overflow-auto pr-1">
                    {driveFiles.length ? driveFiles.map((file) => (
                      <article key={file.id} className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-ink">{file.name}</p>
                          <p className="mt-1 text-xs font-bold text-ink/45">
                            {file.mimeType || "media"}
                            {file.sizeBytes ? ` · ${Math.max(1, Math.ceil(file.sizeBytes / 1024 / 1024))} MB` : ""}
                            {file.durationSeconds ? ` · ${formatDuration(file.durationSeconds)}` : ""}
                          </p>
                        </div>
                        <button type="button" onClick={() => importDriveFile(file.id)} disabled={busy || driveBusy} className="btn-primary shrink-0 px-3 py-2">
                          {busy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                          Import
                        </button>
                      </article>
                    )) : (
                      <p className="rounded-lg border border-ink/10 bg-white px-3 py-4 text-center text-sm font-bold text-ink/50">
                        {driveBusy ? "Loading Drive files..." : "No audio or video files found."}
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
              {driveError ? <p className="mt-3 rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">{driveError}</p> : null}
            </div>

            <label className="mt-5 block">
              <span className="sr-only">Google Drive link</span>
              <input value={driveUrl} onChange={(event) => setDriveUrl(event.target.value)} className="field" placeholder="https://drive.google.com/file/d/..." autoFocus />
            </label>
            <p className="mt-3 rounded-lg bg-paper/65 px-4 py-3 text-xs font-bold leading-5 text-ink/55">Public link import still works for shared files. Use Connect Drive for private files in your account.</p>
            {resolvedMedia && mode === "drive" ? (
              <MediaLinkPreview media={resolvedMedia} />
            ) : null}
            <button type="button" onClick={startTask} disabled={busy || !driveUrl} className="btn-primary mt-4 w-full py-3">
              {busy ? <Loader2 className="animate-spin" size={18} /> : <HardDrive size={18} />}
              Import from Google Drive
            </button>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-paper/65 px-4 py-3 text-sm">
              <span className="font-bold text-ink/60">Available minutes:</span>
              <span className="font-black text-ink">{remaining}</span>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function MediaLinkPreview({media}: {media: ResolvedMedia}) {
  const sizeLabel = media.contentLength ? `${Math.max(1, Math.ceil(media.contentLength / 1024 / 1024))} MB` : null;

  return (
    <article className="mt-4 overflow-hidden rounded-lg border border-violet/18 bg-violet/5">
      {media.thumbnailUrl ? (
        <div className="relative aspect-video w-full overflow-hidden bg-ink/5">
          {/* 外部媒体缩略图可能来自 YouTube、Drive 或其它公开源，不适合纳入固定 next/image 域名白名单。 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-violet ring-1 ring-violet/15">{media.providerLabel}</span>
          {media.durationSeconds ? <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-ink/55 ring-1 ring-ink/10">{formatDuration(media.durationSeconds)}</span> : null}
          {sizeLabel ? <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-ink/55 ring-1 ring-ink/10">{sizeLabel}</span> : null}
        </div>
        <h3 className="mt-3 break-words text-base font-black leading-6 text-ink">{media.title}</h3>
        <p className="mt-2 break-all text-xs leading-5 text-ink/50">{media.sourceUrl}</p>
        {media.warnings.length ? (
          <div className="mt-3 space-y-2">
            {media.warnings.map((warning) => (
              <p key={warning} className="rounded-md border border-violet/15 bg-white px-3 py-2 text-xs font-bold leading-5 text-ink/55">{warning}</p>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function TranscriptionTable({
  tasks,
  folders,
  copy,
  locale,
  t,
  activeTaskId,
  selectedTaskIds,
  setSelectedTaskIds,
  onSelectTask,
  moveTask
}: {
  tasks: TaskListItem[];
  folders: FolderItem[];
  copy: ReturnType<typeof getWorkspaceCopy>;
  locale: string;
  t: (key: string) => string;
  activeTaskId?: string;
  selectedTaskIds: string[];
  setSelectedTaskIds: (value: string[] | ((current: string[]) => string[])) => void;
  onSelectTask: (taskId: string) => void;
  moveTask: (taskId: string, folderId: string | null) => Promise<void>;
}) {
  const allVisibleSelected = tasks.length > 0 && tasks.every((item) => selectedTaskIds.includes(item.id));

  function toggleTask(taskId: string) {
    setSelectedTaskIds((current) => (current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId]));
  }

  function toggleAllVisible() {
    setSelectedTaskIds((current) => {
      if (allVisibleSelected) return current.filter((id) => !tasks.some((task) => task.id === id));
      return Array.from(new Set([...current, ...tasks.map((task) => task.id)]));
    });
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-ink/10 bg-white">
      <div className="min-w-[720px]">
      <div className="grid grid-cols-[32px_minmax(190px,1.4fr)_90px_135px_70px_100px] gap-3 border-b border-ink/10 bg-paper/60 px-4 py-3 text-xs font-black uppercase text-ink/45 max-lg:hidden">
        <label className="flex items-center">
          <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} className="h-4 w-4 rounded border-ink/20 text-violet" aria-label="Select all visible transcriptions" />
        </label>
        <span>{t("name")}</span>
        <span>{t("duration")}</span>
        <span>{t("created")}</span>
        <span>{t("type")}</span>
        <span>{t("folder")}</span>
      </div>
      <div className="max-h-[460px] overflow-auto">
        {tasks.length ? (
          tasks.map((item) => (
            <a
              key={item.id}
              href={`/${locale}/transcriptions/${item.id}`}
              onClick={() => onSelectTask(item.id)}
              className={clsx(
                "grid w-full gap-3 border-b border-ink/10 px-4 py-3 text-left text-sm transition last:border-b-0 hover:bg-violet/5 lg:grid-cols-[32px_minmax(190px,1.4fr)_90px_135px_70px_100px]",
                activeTaskId === item.id && "bg-violet/10"
              )}
            >
              <span className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTaskIds.includes(item.id)}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => {
                    event.preventDefault();
                    toggleTask(item.id);
                  }}
                  className="h-4 w-4 rounded border-ink/20 text-violet"
                  aria-label={`Select ${taskDisplayName(item, copy)}`}
                />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-black">
                  {item.status === "COMPLETED" ? <CheckCircle2 size={16} className="text-violet" /> : <FileAudio size={16} className="text-ink/45" />}
                  <span className="truncate">{taskDisplayName(item, copy)}</span>
                </span>
                <span className="mt-1 block text-xs font-bold text-ink/45 lg:hidden">{item.status}</span>
              </span>
              <span className="text-ink/65">{item.durationSeconds ? formatDuration(item.durationSeconds) : "--"}</span>
              <span className="text-ink/65">{formatDateTime(item.createdAt, copy)}</span>
              <span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet/10 text-xs font-black text-violet">{item.sourceType === "YOUTUBE" ? "L" : "S"}</span>
              </span>
              <span>
                <select
                  value={item.folderId ?? ""}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => {
                    event.preventDefault();
                    moveTask(item.id, event.target.value || null).catch(() => undefined);
                  }}
                  className="max-w-28 rounded-md border border-ink/10 bg-white px-2 py-1 text-xs font-bold text-ink/65 outline-none transition focus:border-violet"
                  aria-label={`Move ${taskDisplayName(item, copy)}`}
                >
                  <option value="">{t("uncategorized")}</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </span>
            </a>
          ))
        ) : (
          <div aria-label={copy.noTranscriptAssets}>
            {Array.from({length: 9}).map((_, index) => (
              <div key={index} className="grid h-12 grid-cols-[32px_minmax(190px,1.4fr)_90px_135px_70px_100px] gap-3 border-b border-ink/10 px-4 py-3 last:border-b-0">
                <span className="h-4 rounded bg-paper" />
                <span className="h-4 rounded bg-paper" />
                <span className="h-4 rounded bg-paper" />
                <span className="h-4 rounded bg-paper" />
                <span className="h-4 rounded bg-paper" />
                <span className="h-4 rounded bg-paper" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-ink/10 px-4 py-3 text-sm font-bold text-ink/55">
        <span>Rows per page</span>
        <span className="inline-flex items-center rounded-md border border-ink/10 bg-paper px-3 py-1 text-ink">10</span>
      </div>
      </div>
    </div>
  );
}

function TaskWorkspace({
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
  generateInsights,
  generateSingleInsight,
  generateTranslation,
  createShareLink,
  disableShareLink,
  renameTask,
  openRetranscribeSettings,
  deleteTask,
  downloadOriginalFile,
  deleteOriginalFile,
  cancelTask,
  retryTask,
  shareUrl,
  busy,
  summary,
  mindMap,
  qa,
  translation,
  translationTarget,
  setTranslationTarget,
  onTranslationSaved,
  onError,
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
  generateInsights: () => void;
  generateSingleInsight: (taskType: "summary" | "mind_map" | "qa") => Promise<void>;
  generateTranslation: (targetLanguageCode: string) => Promise<void>;
  createShareLink: () => void;
  disableShareLink: () => void;
  renameTask: (taskId: string, originalName: string) => Promise<void>;
  openRetranscribeSettings: () => void;
  deleteTask: (taskId: string) => Promise<void>;
  downloadOriginalFile: (taskId: string) => Promise<void>;
  deleteOriginalFile: (taskId: string) => Promise<void>;
  cancelTask: (taskId: string) => Promise<void>;
  retryTask: (taskId: string, retryType?: "standard" | "youtube_fallback") => Promise<void>;
  shareUrl: string | null;
  busy: boolean;
  summary: any;
  mindMap: any;
  qa: any;
  translation: any;
  translationTarget: string;
  setTranslationTarget: (value: string) => void;
  onTranslationSaved: (locale: string, content: any) => void;
  onError: (message: string) => void;
  copy: ReturnType<typeof getWorkspaceCopy>;
  t: (key: string) => string;
}) {
  const displayName = task.originalName || (task.sourceType === "YOUTUBE" ? copy.youtubeTask : copy.unnamedTask);
  const canCancel = ["UPLOADING", "QUEUED", "PROCESSING", "TRANSCRIBING", "ANALYZING"].includes(task.status);
  const canRetry = ["FAILED", "CANCELED"].includes(task.status);
  const normalizedAudio = task.mediaAssets?.find((asset) => asset.kind === "NORMALIZED_AUDIO");
  const audioChunks = task.mediaAssets?.filter((asset) => asset.kind === "AUDIO_CHUNK") ?? [];
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState(displayName);

  useEffect(() => {
    setTitleDraft(displayName);
    setRenaming(false);
  }, [task.id, displayName]);

  return (
    <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
      <div className="grid content-start gap-4">
        <section className="rounded-xl border border-ink/10 bg-white p-4 shadow-soft">
          {renaming ? (
            <form
              className="flex flex-wrap items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                renameTask(task.id, titleDraft).then(() => setRenaming(false));
              }}
            >
              <input value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} className="field min-w-0 flex-1 text-sm font-black" autoFocus />
              <button type="submit" disabled={busy || !titleDraft.trim()} className="btn-primary px-3 py-2">
                {busy ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {t("save")}
              </button>
              <button type="button" onClick={() => setRenaming(false)} className="btn-outline px-3 py-2">Cancel</button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-black text-ink">{displayName}</p>
                <p className="mt-1 text-xs font-bold text-ink/45">{task.statusMessage || task.status}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setRenaming(true)} disabled={busy} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/55 transition hover:border-violet/25 hover:text-violet disabled:opacity-40" aria-label="重命名转写任务">
                  <Pencil size={15} />
                </button>
                <button type="button" onClick={openRetranscribeSettings} disabled={busy} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/55 transition hover:border-violet/25 hover:text-violet disabled:opacity-40" aria-label="重新转写">
                  <RotateCcw size={15} />
                </button>
                {canCancel ? (
                  <button type="button" onClick={() => cancelTask(task.id)} disabled={busy} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-coral/20 text-coral transition hover:bg-coral/10 disabled:opacity-40" aria-label="取消转写">
                    <X size={15} />
                  </button>
                ) : null}
                {canRetry ? (
                  <button type="button" onClick={() => retryTask(task.id)} disabled={busy} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/55 transition hover:border-violet/25 hover:text-violet disabled:opacity-40" aria-label="Retry transcription">
                    <RotateCcw size={15} />
                  </button>
                ) : null}
                {canRetry && task.sourceType === "YOUTUBE" ? (
                  <button type="button" onClick={() => retryTask(task.id, "youtube_fallback")} disabled={busy} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/55 transition hover:border-violet/25 hover:text-violet disabled:opacity-40" aria-label="YouTube fallback retry">
                    <Link2 size={15} />
                  </button>
                ) : null}
                <button type="button" onClick={() => downloadOriginalFile(task.id)} disabled={busy} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/55 transition hover:border-violet/25 hover:text-violet disabled:opacity-40" aria-label="Download original file">
                  <Download size={15} />
                </button>
                <button type="button" onClick={() => deleteOriginalFile(task.id)} disabled={busy} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-coral/20 text-coral transition hover:bg-coral/10 disabled:opacity-40" aria-label="Delete original file">
                  <X size={15} />
                </button>
                <button type="button" onClick={() => deleteTask(task.id)} disabled={busy} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-coral/20 text-coral transition hover:bg-coral/10 disabled:opacity-40" aria-label="Delete transcription">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )}
          {normalizedAudio || audioChunks.length ? (
            <div className="mt-4 grid gap-3 rounded-lg border border-violet/15 bg-violet/5 p-3 text-sm md:grid-cols-3">
              <div>
                <p className="text-xs font-black uppercase text-ink/42">R2 audio</p>
                <p className="mt-1 truncate font-black text-ink">{normalizedAudio?.fileName ?? "Preparing audio"}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-ink/42">Smart chunks</p>
                <p className="mt-1 font-black text-ink">{audioChunks.length ? `${audioChunks.length} segment${audioChunks.length === 1 ? "" : "s"}` : "Not needed"}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-ink/42">Provider</p>
                <p className="mt-1 font-black text-ink">{task.provider ?? "Fallback ready"}</p>
              </div>
            </div>
          ) : null}
        </section>
        <TranscriptPanel task={task} draftText={draftText} setDraftText={setDraftText} segmentDrafts={segmentDrafts} updateSegmentDraft={updateSegmentDraft} speakerDrafts={speakerDrafts} setSpeakerDrafts={setSpeakerDrafts} uniqueSpeakers={uniqueSpeakers} saveSpeakerNames={saveSpeakerNames} saveTranscript={saveTranscript} saveSegments={saveSegments} copyTranscript={copyTranscript} t={t} />
      </div>
      <section className="grid content-start gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PanelTitle icon={<Brain size={18} />} label={t("insightTitle")} />
          <button onClick={generateInsights} disabled={!task.transcript || busy} className="btn-primary px-3 py-2">
            {busy ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            {t("generateInsights")}
          </button>
        </div>

        <InsightPanel
          icon={<Sparkles size={17} />}
          title={t("summary")}
          action={<button type="button" onClick={() => generateSingleInsight("summary")} disabled={!task.transcript || busy} className="btn-outline px-2.5 py-1.5 text-xs">{busy ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}Regenerate</button>}
        >
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

        <InsightPanel
          icon={<Network size={17} />}
          title={t("mindMap")}
          action={<button type="button" onClick={() => generateSingleInsight("mind_map")} disabled={!task.transcript || busy} className="btn-outline px-2.5 py-1.5 text-xs">{busy ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}Regenerate</button>}
        >
          {mindMap ? <MindMap node={mindMap} /> : <p>{t("mindMapEmpty")}</p>}
        </InsightPanel>

        <InsightPanel
          icon={<HelpCircle size={17} />}
          title={t("qa")}
          action={<button type="button" onClick={() => generateSingleInsight("qa")} disabled={!task.transcript || busy} className="btn-outline px-2.5 py-1.5 text-xs">{busy ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}Regenerate</button>}
        >
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
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <select value={translationTarget} onChange={(event) => setTranslationTarget(event.target.value)} className="field h-9 max-w-44 bg-white text-sm font-bold">
              {languageChoices.filter((item) => item !== "auto").map((item) => (
                <option key={item} value={item}>{item.toUpperCase()}</option>
              ))}
            </select>
            <button type="button" onClick={() => generateTranslation(translationTarget)} disabled={!task.transcript || busy} className="btn-outline px-3 py-2">
              {busy ? <Loader2 className="animate-spin" size={16} /> : <Languages size={16} />}
              Generate translation
            </button>
          </div>
          {translation ? (
            <TranslationEditor
              taskId={task.id}
              locale={translationTarget}
              content={translation}
              transcriptSegments={task.transcript?.segments}
              busy={busy}
              onSaved={(content) => onTranslationSaved(translationTarget, content)}
              onError={onError}
            />
          ) : (
            <p>{t("translationEmpty")}</p>
          )}
        </InsightPanel>

        <ExportPanel task={task} t={t} copy={copy} createShareLink={createShareLink} disableShareLink={disableShareLink} shareUrl={shareUrl} activeShare={task.shareLinks?.[0] ?? null} busy={busy} />
      </section>
    </div>
  );
}
