"use client";

import {Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useSearchParams} from "next/navigation";
import Image from "next/image";
import {createPortal} from "react-dom";
import {
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileAudio,
  FolderOpen,
  Globe2,
  HardDrive,
  HelpCircle,
  Home,
  Info,
  Languages,
  Link2,
  Loader2,
  Mic,
  MoreHorizontal,
  Network,
  Pencil,
  PlayCircle,
  RotateCcw,
  Save,
  Search,
  Send,
  Sparkles,
  Star,
  TicketCheck,
  Timer,
  TriangleAlert,
  Trash2,
  UploadCloud,
  X
} from "lucide-react";
import clsx from "clsx";
import {PricingAction} from "@/components/pricing-actions";
import {SiteFooter, SiteHeader} from "@/components/site-shell";
import {TranslationEditor} from "@/components/translation-editor";
import {fallbackMessages, getWorkspaceCopy, localeLanguageOptions} from "./copy";
import {mergeTaskSnapshot, type AssetView, type CurrentUser, type FolderItem, type InputMode, type Task, type TaskListItem, type TranscriptSegment, type UsageSnapshot} from "./types";
import {Fact, InsightPanel, MindMap, ModeButton, PanelTitle, StatusStrip} from "./primitives";
import {WorkspaceLanguageSwitcher, WorkspaceSidebar} from "./sidebar";
import {ExportPanel, ShareTranscriptionDialog, TranscriptPanel} from "./panels";
import {ProductSections} from "./marketing";
import {formatDateTime, formatDuration, formatTime, taskDisplayName} from "./format";
import {safeImageSrc} from "@/lib/image-url";
import {subscriptionGrantsMembership} from "@/lib/membership-shared";

const maxBatchFiles = 50;

type DashboardPaidPlan = "BASIC" | "STANDARD" | "PRO";
type DashboardOneTimePack = "LITE" | "PLUS";
export type DashboardPricingMode = "one-time" | "monthly" | "annual";
type DashboardPricingFeature = string | {label: string; badge?: string; href?: string; info?: boolean};

type DashboardPricingPlan = {
  name: string;
  tagline: string;
  price: string;
  suffix: string;
  quota: string;
  cta: string;
  plan?: DashboardPaidPlan;
  pack?: DashboardOneTimePack;
  popular?: boolean;
  previousPrice?: string;
  note?: string;
  features: DashboardPricingFeature[];
};

type DashboardPricingCopy = ReturnType<typeof getWorkspaceCopy>["dashboardPricing"];

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

const dashboardPaidFeatures = [
  "feature.fileLimit",
  "feature.noDailyLimit",
  "feature.premiumModel",
  "feature.languages",
  {label: "feature.aiTranslation", badge: "New", info: true},
  "feature.exportFormats",
  {label: "feature.enhancedInsights", badge: "New", info: true},
  "feature.youtubeTranscription",
  "feature.speakerIdentification",
  {label: "feature.apiAccess", href: "/docs"},
  "feature.bulkTranscription",
  "feature.noRetention",
  "feature.prioritySupport"
] as const;

const dashboardOneTimeFeatures = dashboardPaidFeatures.filter((feature) => typeof feature === "string" || !("href" in feature) || feature.href !== "/docs");

const dashboardPricingModes: Record<DashboardPricingMode, {label: string; badge?: string; note?: string; plans: DashboardPricingPlan[]}> = {
  "one-time": {
    label: "One-Time",
    note: "note.oneTime",
    plans: [
      {
        name: "Lite",
        tagline: "tagline.lite",
        price: "$12.9",
        suffix: "suffix.oneTime",
        quota: "quota.total.300",
        cta: "cta.buy",
        pack: "LITE",
        features: ["feature.validity90", ...dashboardOneTimeFeatures]
      },
      {
        name: "Plus",
        tagline: "tagline.plus",
        price: "$19.9",
        suffix: "suffix.oneTime",
        quota: "quota.total.600",
        cta: "cta.buy",
        pack: "PLUS",
        popular: true,
        features: ["feature.validity90", ...dashboardOneTimeFeatures]
      }
    ]
  },
  monthly: {
    label: "Monthly",
    plans: [
      {name: "Basic", tagline: "tagline.basic", price: "$10", suffix: "suffix.month", quota: "quota.month.1200", cta: "cta.subscribe", plan: "BASIC", features: ["extra.10.500", ...dashboardPaidFeatures]},
      {name: "Standard", tagline: "tagline.standard", price: "$20", suffix: "suffix.month", quota: "quota.month.3000", cta: "cta.subscribe", plan: "STANDARD", popular: true, features: ["extra.15.1000", ...dashboardPaidFeatures]},
      {name: "Pro", tagline: "tagline.pro", price: "$30", suffix: "suffix.month", quota: "quota.month.6000", cta: "cta.subscribe", plan: "PRO", features: ["extra.20.3000", ...dashboardPaidFeatures]}
    ]
  },
  annual: {
    label: "Annual",
    badge: "Save 40%",
    plans: [
      {name: "Basic", tagline: "tagline.basic", price: "$6", previousPrice: "$10", note: "note.annual.72", suffix: "suffix.month", quota: "quota.month.1200", cta: "cta.subscribe", plan: "BASIC", features: ["extra.10.500", ...dashboardPaidFeatures]},
      {name: "Standard", tagline: "tagline.standard", price: "$12", previousPrice: "$20", note: "note.annual.144", suffix: "suffix.month", quota: "quota.month.3000", cta: "cta.subscribe", plan: "STANDARD", popular: true, features: ["extra.15.1000", ...dashboardPaidFeatures]},
      {name: "Pro", tagline: "tagline.pro", price: "$18", previousPrice: "$30", note: "note.annual.216", suffix: "suffix.month", quota: "quota.month.6000", cta: "cta.subscribe", plan: "PRO", features: ["extra.20.3000", ...dashboardPaidFeatures]}
    ]
  }
};

function localizeDashboardPricingText(copy: DashboardPricingCopy, text: string) {
  return copy.text[text] ?? text;
}

function summaryEntryText(entry: SummaryEntry) {
  if (typeof entry === "string") return entry;
  return entry.text ?? entry.label ?? "";
}

function summaryEntryTimestamps(entry: SummaryEntry) {
  if (typeof entry === "string") return [];
  const values = [...(entry.timestamps ?? [])];
  if (entry.timestamp) values.push(entry.timestamp);
  return values.map((value) => {
    if (typeof value === "string") return value;
    if (value.label) return value.label;
    if (typeof value.start === "number") {
      return typeof value.end === "number" ? `${formatTime(value.start)}-${formatTime(value.end)}` : formatTime(value.start);
    }
    return "";
  }).filter(Boolean);
}

const dashboardPromotionCountdownDurationMs = 2 * 60 * 1000;
const dashboardPromotionInitialCountdown = dashboardPromotionCountdown(dashboardPromotionCountdownDurationMs, 0);

function dashboardPromotionCountdown(deadlineMs: number, nowMs = Date.now()) {
  let remainingMs = deadlineMs - nowMs;
  if (remainingMs <= 0) {
    remainingMs = ((remainingMs % dashboardPromotionCountdownDurationMs) + dashboardPromotionCountdownDurationMs) % dashboardPromotionCountdownDurationMs;
  }
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const centiseconds = Math.floor((remainingMs % 1000) / 10);
  return [minutes, seconds, centiseconds].map((value) => String(value).padStart(2, "0"));
}

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
const dashboardExportFormats = ["txt", "docx", "pdf", "csv", "srt", "vtt"] as const;
const dashboardPageSizes = [10, 25, 50, 100] as const;
const dashboardExportLabels: Record<(typeof dashboardExportFormats)[number], string> = {
  txt: "TXT (.txt)",
  docx: "DOCX (.docx)",
  pdf: "PDF (.pdf)",
  csv: "CSV (.csv)",
  srt: "SRT (.srt)",
  vtt: "VTT (.vtt)"
};

const mediaLinkPlatformItems = [
  ["YouTube", <PlayCircle key="youtube" size={14} />],
  ["TikTok", <Languages key="tiktok" size={14} />],
  ["Instagram", <Sparkles key="instagram" size={14} />],
  ["Facebook", <Globe2 key="facebook" size={14} />],
  ["X", <X key="x" size={14} />],
  ["Many other links", <Link2 key="other" size={14} />]
] as const;

const insufficientFreeMinutesMessage = "Insufficient free minutes, please upgrade your plan.";

function billableMinutesFromDuration(durationSeconds: number | null | undefined) {
  if (!durationSeconds || durationSeconds <= 0) return null;
  return Math.max(1, Math.ceil(durationSeconds / 60));
}

function isInsufficientFreeMinutesMessage(message: string | null | undefined) {
  return message === insufficientFreeMinutesMessage || message?.includes("free minutes") === true;
}

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
  const [speakerLabels, setSpeakerLabels] = useState(false);
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
  const [taskListInitialized, setTaskListInitialized] = useState(false);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [assetView, setAssetView] = useState<AssetView>("transcripts");
  const [assetSearch, setAssetSearch] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [batchMoveDialogOpen, setBatchMoveDialogOpen] = useState(false);
  const [batchMoveTargetFolderId, setBatchMoveTargetFolderId] = useState<string | null | undefined>(undefined);
  const [batchExportDialogOpen, setBatchExportDialogOpen] = useState(false);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [batchDeleteOriginalsDialogOpen, setBatchDeleteOriginalsDialogOpen] = useState(false);
  const [batchMoreOpen, setBatchMoreOpen] = useState(false);
  const [taskActionConfirm, setTaskActionConfirm] = useState<{action: "delete_original" | "cancel"; taskId: string; title: string} | null>(null);
  const [batchExportFormat, setBatchExportFormat] = useState<(typeof dashboardExportFormats)[number]>("txt");
  const [batchShowSpeaker, setBatchShowSpeaker] = useState(false);
  const [batchShowTimestamp, setBatchShowTimestamp] = useState(false);
  const [batchSubtitleMaxChars, setBatchSubtitleMaxChars] = useState(84);
  const [batchSubtitleMaxDurationSeconds, setBatchSubtitleMaxDurationSeconds] = useState(6);
  const [retranscribeDialogOpen, setRetranscribeDialogOpen] = useState(false);
  const [showAppSumoWelcome, setShowAppSumoWelcome] = useState(false);
  const [authRedirectMessage, setAuthRedirectMessage] = useState<string | null>(null);
  const [dashboardLinkDialogOpen, setDashboardLinkDialogOpen] = useState(false);
  const [dashboardLinkResolving, setDashboardLinkResolving] = useState(false);
  const [dashboardLinkResolveError, setDashboardLinkResolveError] = useState<string | null>(null);
  const [dashboardUpgradePromptOpen, setDashboardUpgradePromptOpen] = useState(false);
  const [dashboardPlansOpen, setDashboardPlansOpen] = useState(false);
  const [dashboardPlansInitialMode, setDashboardPlansInitialMode] = useState<DashboardPricingMode>("monthly");
  const [premiumSpeakerNoticeOpen, setPremiumSpeakerNoticeOpen] = useState(false);

  const t = (key: string) => {
    try {
      return translate(key);
    } catch {
      return fallbackMessages[key] ?? key;
    }
  };
  const currentSubscription = usageSnapshot?.subscription ?? currentUser?.subscriptions?.[0] ?? null;
  const hasPaidMembership = Boolean(subscriptionGrantsMembership(currentSubscription) || currentUser?.subscriptions?.some(subscriptionGrantsMembership));
  const isFreePlanUser = Boolean(currentUser?.id && !hasPaidMembership && (currentSubscription?.plan?.toUpperCase() ?? "FREE") === "FREE");
  const availableTranscriptionMinutes = Math.max(0, currentSubscription?.remainingMinutes ?? 120);
  const freeMinutesErrorForDuration = useCallback((durationSeconds: number | null | undefined) => {
    if (!isFreePlanUser) return null;
    const requiredMinutes = billableMinutesFromDuration(durationSeconds);
    if (!requiredMinutes) return null;
    return requiredMinutes > availableTranscriptionMinutes ? insufficientFreeMinutesMessage : null;
  }, [availableTranscriptionMinutes, isFreePlanUser]);
  const updateSpeakerLabels = useCallback((value: boolean) => {
    setSpeakerLabels(value);
    if (value && isFreePlanUser) {
      setPremiumSpeakerNoticeOpen(true);
    }
  }, [isFreePlanUser]);
  const file = files[0] ?? null;

  function openDashboardPlans(mode: DashboardPricingMode = "monthly") {
    setDashboardPlansInitialMode(mode);
    setDashboardPlansOpen(true);
  }

  useEffect(() => {
    if (!batchMoveDialogOpen && !batchExportDialogOpen && !batchDeleteDialogOpen && !batchDeleteOriginalsDialogOpen && !batchMoreOpen && !taskActionConfirm) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setBatchMoveDialogOpen(false);
      setBatchExportDialogOpen(false);
      setBatchDeleteDialogOpen(false);
      setBatchDeleteOriginalsDialogOpen(false);
      setBatchMoreOpen(false);
      setBatchMoreOpen(false);
      setTaskActionConfirm(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [batchMoveDialogOpen, batchExportDialogOpen, batchDeleteDialogOpen, batchDeleteOriginalsDialogOpen, batchMoreOpen, taskActionConfirm]);

  useEffect(() => {
    if (variant !== "upload") return;
    const requestedMode = searchParams.get("mode");
    if (requestedMode === "youtube" || requestedMode === "drive" || requestedMode === "upload") {
      setMode(requestedMode);
    }
  }, [searchParams, variant]);

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
    setError(null);
  }

  function updateDriveUrl(value: string) {
    setDriveUrl(value);
    setResolvedMedia(null);
    setError(null);
  }

  const resolveDashboardMediaLink = useCallback(async () => {
    const link = youtubeUrl.trim();
    if (!link) {
      setResolvedMedia(null);
      setDashboardLinkResolveError(null);
      return;
    }

    setMode("youtube");
    setDashboardLinkResolving(true);
    setDashboardLinkResolveError(null);
    setError(null);
    setResolvedMedia(null);
    try {
      const data = await fetch("/api/media/resolve", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({url: link})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.resolveLinkError);
        return body as ResolvedMedia;
      });
      setResolvedMedia(data);
      if (data.provider === "google_drive") {
        setMode("drive");
        setDriveUrl(data.sourceUrl || link);
      }
    } catch (cause) {
      setDashboardLinkResolveError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setDashboardLinkResolving(false);
    }
  }, [copy.resolveLinkError, setDriveUrl, setResolvedMedia, youtubeUrl]);

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
    const params = new URLSearchParams({limit: "50", locale});
    if (selectedFolderId) params.set("folderId", selectedFolderId);
    try {
      const data = await fetch(`/api/tasks?${params.toString()}`, {cache: "no-store"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.readTasksError);
        return body as {tasks: TaskListItem[]};
      });
      setTaskList(data.tasks ?? []);
    } finally {
      setTaskListInitialized(true);
    }
  }, [copy.readTasksError, locale, selectedFolderId]);

  async function refreshFolders() {
    const data = await fetch("/api/folders", {cache: "no-store"}).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.readFoldersFailed);
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
    fetch("/api/auth/me", {cache: "no-store"})
      .then((response) => (response.ok ? response.json() : {user: null}))
      .then((data) => {
        setCurrentUser(data.user ?? null);
        if (data.user && (variant === "dashboard" || variant === "upload")) {
          refreshTaskList().catch(() => undefined);
          refreshFolders().catch(() => undefined);
          refreshUsageSnapshot().catch(() => undefined);
        } else {
          setUsageSnapshot(null);
          setTaskListInitialized(true);
        }
      })
      .catch(() => {
        setCurrentUser(null);
        setUsageSnapshot(null);
        setTaskListInitialized(true);
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
  }

  useEffect(() => {
    if (variant !== "dashboard" || !currentUser?.id) return;
    refreshTaskList().catch(() => undefined);
  }, [currentUser?.id, refreshTaskList, variant]);

  async function createFolder(name: string) {
    setError(null);
    const folder = await fetch("/api/folders", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name})
    }).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.createFolderFailed);
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
      if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.renameFolderFailed);
      return body as FolderItem;
    });
    setFolders((items) => items.map((item) => (item.id === folder.id ? folder : item)));
  }

  async function deleteFolder(folderId: string) {
    setError(null);
    await fetch(`/api/folders/${folderId}`, {method: "DELETE"}).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.deleteFolderFailed);
      return body;
    });
    setFolders((items) => items.filter((item) => item.id !== folderId));
    if (selectedFolderId === folderId) setSelectedFolderId(null);
    setTaskList((items) => items.filter((item) => item.folderId !== folderId));
    setTask((current) => (current?.folderId === folderId ? null : current));
  }

  async function moveTask(taskId: string, folderId: string | null) {
    setError(null);
    const moved = await fetch(`/api/tasks/${taskId}/folder`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({folderId})
    }).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.moveTaskFailed);
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
        if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.renameTaskFailed);
        return body as Task;
      });

      setTask((current) => (current?.id === taskId ? {...current, originalName: updated.originalName} : current));
      setTaskList((items) => items.map((item) => (item.id === taskId ? {...item, originalName: updated.originalName} : item)));
      setNotice(copy.taskWorkspace.taskRenamed);
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
        if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.retranscribeFailed);
      });
      await loadTaskDetail(taskId);
      await refreshTaskList().catch(() => undefined);
      setRetranscribeDialogOpen(false);
      setNotice(copy.taskWorkspace.retranscribeQueued);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function deleteTask(taskId: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch(`/api/tasks/${taskId}`, {method: "DELETE"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.deleteTaskFailed);
      });
      setTask((current) => (current?.id === taskId ? null : current));
      setTaskList((items) => items.filter((item) => item.id !== taskId));
      setNotice(copy.taskWorkspace.taskDeleted);
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
        if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.downloadOriginalFailed);
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
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch(`/api/tasks/${taskId}/original-file`, {method: "DELETE"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.deleteOriginalFailed);
      });
      if (task?.id === taskId) await loadTaskDetail(taskId);
      setNotice(copy.taskWorkspace.originalDeleted);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function cancelTask(taskId: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch(`/api/tasks/${taskId}/cancel`, {method: "POST"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.cancelFailed);
      });
      await loadTaskDetail(taskId);
      await refreshTaskList().catch(() => undefined);
      await refreshUsageSnapshot().catch(() => undefined);
      setNotice(copy.taskWorkspace.canceled);
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
        if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.retryFailed);
      });
      await loadTaskDetail(taskId);
      await refreshTaskList().catch(() => undefined);
      await refreshUsageSnapshot().catch(() => undefined);
      setNotice(retryType === "youtube_fallback" ? copy.taskWorkspace.youtubeFallbackQueued : copy.taskWorkspace.retryQueued);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function runBatchAction(action: "delete" | "move" | "delete_originals", folderId?: string | null) {
    if (!selectedTaskIds.length) return;
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
        if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.batchActionFailed);
      });
      if (action === "delete" && task && selectedTaskIds.includes(task.id)) setTask(null);
      setSelectedTaskIds([]);
      setBulkMode(false);
      setBatchMoveDialogOpen(false);
      setBatchExportDialogOpen(false);
      setBatchDeleteDialogOpen(false);
      setBatchDeleteOriginalsDialogOpen(false);
      await refreshTaskList().catch(() => undefined);
      await refreshFolders().catch(() => undefined);
      await refreshUsageSnapshot().catch(() => undefined);
      setNotice(action === "delete" ? copy.taskWorkspace.batchDeleted : action === "delete_originals" ? copy.taskWorkspace.batchOriginalsDeleted : copy.taskWorkspace.batchMoved);
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
        throw new Error(body.error ?? copy.taskWorkspace.batchExportFailed);
      }
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const fileName = disposition.match(/filename="([^"]+)"/)?.[1] ?? `votxt-batch-${batchExportFormat}.zip`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setNotice(copy.taskWorkspace.batchExported(selectedTaskIds.length));
      setBulkMode(false);
      setBatchExportDialogOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function createShareLinkForTask(taskId: string, title: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const data = await fetch(`/api/tasks/${taskId}/share`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({locale, title})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.shareError);
        return body as {shareLink: {id: string; url?: string | null; title?: string | null; enabled?: boolean; expiresAt?: string | null; accessCount?: number; lastAccessAt?: string | null; createdAt: string}};
      });
      setShareUrl(data.shareLink.url ?? null);
      setTaskList((items) =>
        items.map((item) =>
          item.id === taskId
            ? {...item, shareLinks: [data.shareLink]}
            : item
        )
      );
      if (task?.id === taskId) {
        setTask({
          ...task,
          shareLinks: [{
            id: data.shareLink.id,
            url: data.shareLink.url ?? null,
            title: data.shareLink.title ?? task.originalName ?? title,
            enabled: data.shareLink.enabled ?? true,
            expiresAt: data.shareLink.expiresAt ?? null,
            accessCount: data.shareLink.accessCount ?? 0,
            lastAccessAt: data.shareLink.lastAccessAt ?? null,
            createdAt: data.shareLink.createdAt
          }]
        });
      }
      if (data.shareLink.url) await navigator.clipboard.writeText(data.shareLink.url).catch(() => undefined);
      setNotice(copy.shareDone);
      return data.shareLink.url ?? null;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function createShareLink() {
    if (!task?.id) return;
    await createShareLinkForTask(task.id, task.originalName || copy.shareTitle);
  }

  async function disableShareLink() {
    if (!task?.id) return;
    await disableShareLinkForTask(task.id);
  }

  async function disableShareLinkForTask(taskId: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch(`/api/tasks/${taskId}/share`, {method: "DELETE"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.taskWorkspace.disableShareFailed);
      });
      setShareUrl(null);
      setTaskList((items) => items.map((item) => (item.id === taskId ? {...item, shareLinks: []} : item)));
      if (task?.id === taskId) setTask({...task, shareLinks: []});
      setNotice(copy.taskWorkspace.shareDisabled);
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
      setTask((current) => mergeTaskSnapshot(current, updated));
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
          setTask((current) => mergeTaskSnapshot(current, fresh as Task));
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

  function redirectToSignIn(reason: string) {
    setAuthRedirectMessage(reason);
    window.setTimeout(() => {
      const next = `${window.location.pathname}${window.location.search}`;
      window.location.href = `/${locale}/auth/signin?next=${encodeURIComponent(next)}`;
    }, 1200);
  }

  async function startTask() {
    if (!currentUser?.id) {
      redirectToSignIn(copy.signInToTranscribe);
      return false;
    }
    if (mode === "youtube" || mode === "drive") {
      const minutesError = freeMinutesErrorForDuration(resolvedMedia?.durationSeconds);
      if (minutesError) {
        setError(minutesError);
        setNotice(null);
        return false;
      }
    }

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const openCreatedTask = (created: Task) => {
        setTask(created);
        // 上传页，以及 Media Link（youtube/drive）转写都直接跳转到转录详情页。
        if (variant === "upload" || mode === "youtube" || mode === "drive") {
          window.location.href = `/${locale}/transcriptions/${created.id}`;
        }
      };
      const createTask = async (input: {
        sourceType: "UPLOAD" | "YOUTUBE" | "GOOGLE_DRIVE";
        sourceUrl: string;
        objectKey?: string;
        originalName?: string;
        fileSizeBytes?: number;
        durationSeconds?: number;
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
          fileSizeBytes: input.fileSizeBytes,
          durationSeconds: input.durationSeconds
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
          originalName: resolvedMedia?.filename || resolvedMedia?.title,
          durationSeconds: resolvedMedia?.durationSeconds
        });
        openCreatedTask(created);
        await refreshTaskList().catch(() => undefined);
        await refreshUsageSnapshot().catch(() => undefined);
        return true;
      }

      if (mode === "drive") {
        const created = await createTask({
          sourceType: "GOOGLE_DRIVE",
          sourceUrl: resolvedMedia?.sourceUrl ?? driveUrl,
          originalName: resolvedMedia?.filename || resolvedMedia?.title || `${copy.googleDrive} ${copy.media}`,
          durationSeconds: resolvedMedia?.durationSeconds
        });
        openCreatedTask(created);
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

        if (createdTasks[0]) {
          openCreatedTask(createdTasks[0]);
        } else {
          setTask(null);
        }
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
        if (!response.ok) throw new Error(data.error ?? copy.createTaskError);
        return data as Task;
      });
      setTask(created);
      setMode("drive");
      await refreshTaskList().catch(() => undefined);
      await refreshUsageSnapshot().catch(() => undefined);
      if (variant === "upload") {
        window.location.href = `/${locale}/transcriptions/${created.id}`;
        return;
      }
      setNotice(copy.driveFileQueued);
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
        if (!response.ok) throw new Error(data.error ?? copy.taskWorkspace.translationFailed);
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
        selectFile(new File([blob], `votxt-recording-${Date.now()}.webm`, {type: "audio/webm"}));
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
  const localizedSupportedFormatItems = supportedFormatItems.map((item) => (item === "media links" ? copy.manyOtherLinks : item));
  const heroFacts = [
    {icon: <FileAudio size={40} />, label: t("formats"), items: localizedSupportedFormatItems},
    {icon: <Languages size={40} />, label: t("languages"), items: supportedLanguageItems},
    {icon: <Download size={40} />, label: t("exportCount"), items: exportFormatItems}
  ] as const;

  return (
    <main className={clsx("min-h-screen", isDashboard ? "bg-paper" : "bg-white", !isUpload && !isDashboard && "pt-20")}>
      {!isUpload && !isDashboard ? (
        <SiteHeader
          showAuthPair={!isDashboard && !currentUser}
          primaryCta={{
            href: `/${locale}/${isDashboard || currentUser ? "dashboard" : "auth/signin"}`,
            label: isDashboard || currentUser ? copy.goToDashboard : copy.freeSignup,
            icon: <PlayCircle size={16} />
          }}
        />
      ) : null}
      {authRedirectMessage ? (
        <div className="fixed left-1/2 top-24 z-50 w-[min(calc(100%-2rem),520px)] -translate-x-1/2 rounded-xl border border-violet/25 bg-white px-5 py-4 text-center text-sm font-bold text-violet shadow-lifted">
          {authRedirectMessage}
        </div>
      ) : null}
      {premiumSpeakerNoticeOpen ? <PremiumSpeakerNotice copy={copy} onClose={() => setPremiumSpeakerNoticeOpen(false)} /> : null}

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
          setSpeakerLabels={updateSpeakerLabels}
          subtitleEnabled={subtitleEnabled}
          setSubtitleEnabled={setSubtitleEnabled}
          premiumModel={premiumModel}
          setPremiumModel={setPremiumModel}
          summaryTemplate={summaryTemplate}
          setSummaryTemplate={setSummaryTemplate}
          summaryLanguage={summaryLanguage}
          setSummaryLanguage={setSummaryLanguage}
          busy={busy}
          notice={notice}
          error={error}
          clearError={() => setError(null)}
          inputRef={inputRef}
          startTask={startTask}
          user={currentUser}
          usageSnapshot={usageSnapshot}
          folders={folders}
          selectedFolderId={selectedFolderId}
          setSelectedFolderId={setSelectedFolderId}
          taskList={taskList}
          createFolder={createFolder}
          renameFolder={renameFolder}
          deleteFolder={deleteFolder}
          assetView={assetView}
          setAssetView={setAssetView}
          assetSearch={assetSearch}
          setAssetSearch={setAssetSearch}
          importDriveFile={importDriveFile}
        />
      ) : null}

      {!isDashboard && !isUpload ? (
        <MarketingHero title={t("headline")} description={t("subheadline")} facts={heroFacts}>
          <div className={clsx("mx-auto", currentUser ? "max-w-lg" : "max-w-3xl")}>
            {currentUser ? (
              <HomeWelcomeCard user={currentUser} copy={copy} locale={locale} />
            ) : (
              <TranscriptionLauncher
                t={t}
                copy={copy}
                locale={locale}
                mode={mode}
                setMode={setMode}
                file={file}
                setFile={selectFile}
                youtubeUrl={youtubeUrl}
                setYoutubeUrl={updateYoutubeUrl}
                driveUrl={driveUrl}
                setDriveUrl={updateDriveUrl}
                resolvedMedia={resolvedMedia}
                setResolvedMedia={setResolvedMedia}
                language={language}
                setLanguage={setLanguage}
                speakerLabels={speakerLabels}
                setSpeakerLabels={updateSpeakerLabels}
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
                authRedirectMessage={authRedirectMessage}
                inputRef={inputRef}
                toggleRecording={toggleRecording}
                startTask={startTask}
                onRequireAuth={redirectToSignIn}
                showRecordTab={false}
                sourceLike
              />
            )}
          </div>
        </MarketingHero>
      ) : null}

      {isDashboard ? (
        <section id="workspace" className="flex h-screen overflow-hidden bg-white">
          <div className="hidden h-screen w-[300px] shrink-0 overflow-hidden md:block">
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
              onOpenUpgradePrompt={() => setDashboardUpgradePromptOpen(true)}
            />
          </div>
          <section className="min-w-0 flex-1 overflow-y-auto p-4 md:p-8">
            <div className="flex min-h-[600px] flex-col gap-4 md:gap-6">
              <div className="relative z-40 flex justify-end md:hidden">
                <div className="w-48 max-w-full">
                  <WorkspaceLanguageSwitcher locale={locale} copy={copy} placement="below" />
                </div>
              </div>
              <DashboardUpgradeCard copy={copy} onOpenUpgradePrompt={() => setDashboardUpgradePromptOpen(true)} onShowPlans={openDashboardPlans} />

            <div className="flex flex-1 flex-col bg-white">
              <div className="flex min-w-[358px] items-center justify-between gap-3">
                <h1 className="shrink-0 text-xl font-medium leading-7 tracking-normal text-ink">{selectedFolderId ? folders.find((folder) => folder.id === selectedFolderId)?.name ?? t("allTranscriptions") : t("allTranscriptions")}</h1>
                <label className="relative flex h-10 w-64 max-w-[calc(100vw-9.5rem)] items-center rounded-md border border-slate-200 bg-white transition focus-within:border-violet">
                  <Search size={16} className="pointer-events-none absolute left-3 text-slate-500" />
                  <input value={assetSearch} onChange={(event) => setAssetSearch(event.target.value)} className="h-full w-full bg-transparent py-2 pl-10 pr-3 text-sm font-normal leading-5 text-ink outline-none placeholder:text-slate-500" placeholder={t("searchPlaceholder")} />
                </label>
              </div>

              <div className="mt-4 flex min-w-[420px] flex-nowrap items-center justify-between gap-3">
                {bulkMode ? (
                  <>
                    <p className="text-sm font-normal leading-5 text-[rgb(2,8,23)]">{copy.dashboardTable.itemsSelected(selectedTaskIds.length)}</p>
                    <div className="flex flex-wrap items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setBatchMoveTargetFolderId(undefined);
                          setBatchMoveDialogOpen(true);
                        }}
                        disabled={!selectedTaskIds.length || busy}
                        className="inline-flex h-5 items-center justify-center gap-2 rounded-md px-6 text-sm font-normal leading-5 text-blue-600 transition hover:text-blue-700 disabled:cursor-default disabled:opacity-50"
                      >
                        {copy.move}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBatchExportFormat("txt");
                          setBatchShowSpeaker(false);
                          setBatchShowTimestamp(false);
                          setBatchExportDialogOpen(true);
                        }}
                        disabled={!selectedTaskIds.length || busy}
                        className="inline-flex h-5 items-center justify-center gap-2 rounded-md px-6 text-sm font-normal leading-5 text-green-600 transition hover:text-green-700 disabled:cursor-default disabled:opacity-50"
                      >
                        {copy.exportAction}
                      </button>
                      <button type="button" onClick={() => setBatchDeleteDialogOpen(true)} disabled={!selectedTaskIds.length || busy} className="inline-flex h-5 items-center justify-center gap-2 rounded-md px-6 text-sm font-normal leading-5 text-red-600 transition hover:text-red-700 disabled:cursor-default disabled:opacity-50">
                        {copy.delete}
                      </button>
                      <span className="relative inline-flex">
                        <button type="button" onClick={() => setBatchMoreOpen((open) => !open)} disabled={!selectedTaskIds.length || busy} className="inline-flex h-4 w-10 items-center justify-center rounded-md px-3 text-[rgb(2,8,23)] transition hover:text-primary disabled:cursor-default disabled:opacity-50" aria-label={t("bulkActions")} aria-expanded={batchMoreOpen}>
                          <MoreHorizontal size={16} />
                        </button>
                        {batchMoreOpen ? (
                          <div className="absolute right-0 top-7 z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 text-sm font-normal leading-5 text-[rgb(2,8,23)] shadow-none" role="menu">
                            <button
                              type="button"
                              className="flex h-8 w-full items-center rounded-md px-2 py-1.5 text-left text-red-600 transition hover:bg-red-50"
                              role="menuitem"
                              onClick={() => {
                                setBatchMoreOpen(false);
                                setBatchDeleteOriginalsDialogOpen(true);
                              }}
                            >
                              {copy.taskWorkspace.deleteOriginalFile}
                            </button>
                          </div>
                        ) : null}
                      </span>
                      <button type="button" onClick={() => { setBulkMode(false); setSelectedTaskIds([]); }} className="inline-flex h-5 items-center justify-center gap-2 rounded-md px-6 text-sm font-normal leading-5 text-[rgb(2,8,23)] transition hover:text-primary">
                        {copy.cancel}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = `/${locale}/upload`;
                        }}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white shadow-soft transition hover:bg-primary/90"
                      >
                        <UploadCloud size={16} />
                        {t("uploadFiles")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("youtube");
                          setLanguage("en");
                          setSubtitleEnabled(false);
                          setSpeakerLabels(false);
                          setSummaryTemplate("none");
                          setYoutubeUrl("");
                          setResolvedMedia(null);
                          setDashboardLinkResolveError(null);
                          setDashboardLinkDialogOpen(true);
                        }}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-ink shadow-soft transition hover:border-primary/30 hover:text-primary"
                      >
                        <Link2 size={16} />
                        {t("pasteLink")}
                      </button>
                    </div>
                    <button type="button" onClick={() => { setSelectedTaskIds([]); setBulkMode(true); }} className="inline-flex h-8 w-[131px] items-center justify-center gap-2 px-2 text-sm font-medium text-slate-500 transition hover:text-primary">
                      <MoreHorizontal size={18} />
                      {t("bulkActions")}
                    </button>
                  </>
                )}
              </div>

              <div className="mt-2">
                <TranscriptionTable
                  tasks={filteredTasks}
                  folders={folders}
                  copy={copy}
                  locale={locale}
                  t={t}
                  activeTaskId={task?.id}
                  selectedTaskIds={selectedTaskIds}
                  setSelectedTaskIds={setSelectedTaskIds}
                  bulkMode={bulkMode}
                  loading={!taskListInitialized}
                  busy={busy}
                  onSelectTask={loadTaskDetail}
                  moveTask={moveTask}
                  renameTask={renameTask}
                  deleteTask={deleteTask}
                  createShareLinkForTask={createShareLinkForTask}
                  disableShareLinkForTask={disableShareLinkForTask}
                />
              </div>

              {task ? (
              <div className="mt-5">
                <StatusStrip task={task} t={t} />
              </div>
              ) : null}
              {batchMoveDialogOpen ? (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
                  <div className="relative w-full max-w-[448px] rounded-lg border border-slate-200 bg-white p-6 shadow-none" role="dialog" aria-modal="true">
                    <h2 className="pr-8 text-xl font-semibold leading-7 text-[rgb(2,8,23)]">{copy.moveToFolder}</h2>
                    <button type="button" onClick={() => setBatchMoveDialogOpen(false)} className="absolute right-4 top-4 grid h-4 w-4 place-items-center rounded text-[rgb(2,8,23)] opacity-70 transition hover:opacity-100" aria-label={copy.close}>
                      <X size={16} />
                      <span className="sr-only">{copy.close}</span>
                    </button>
                    <p className="mt-1.5 text-sm font-normal leading-5 text-slate-500">{copy.movingSelectedFiles(selectedTaskIds.length)}</p>
                    <div className="mt-8 grid gap-2">
                      {[{id: null, name: t("uncategorized")}, ...folders.map((folder) => ({id: folder.id, name: folder.name}))].map((folder) => (
                        <button
                          key={folder.id ?? "uncategorized"}
                          type="button"
                          onClick={() => setBatchMoveTargetFolderId(folder.id)}
                          className={clsx("flex h-[38px] items-center justify-between rounded-md border px-3 py-2 text-left text-sm font-normal leading-5 transition", batchMoveTargetFolderId !== undefined && (batchMoveTargetFolderId ?? null) === folder.id ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-white text-[rgb(2,8,23)] hover:bg-slate-50")}
                        >
                          {folder.name}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setBatchMoveDialogOpen(false)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium leading-5 text-[rgb(2,8,23)] transition hover:bg-slate-50">{copy.cancel}</button>
                      <button
                        type="button"
                        disabled={busy || batchMoveTargetFolderId === undefined}
                        onClick={() => runBatchAction("move", batchMoveTargetFolderId ?? null).catch(() => undefined)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium leading-5 text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {copy.move}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
              {batchExportDialogOpen ? (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
                  <div className="relative h-[512px] w-full max-w-[500px] rounded-lg border border-slate-200 bg-white p-6 shadow-none" role="dialog" aria-modal="true">
                    <h2 className="pr-8 text-xl font-semibold leading-7 text-[rgb(2,8,23)]">{copy.exportOptions}</h2>
                    <button type="button" onClick={() => setBatchExportDialogOpen(false)} className="absolute right-4 top-4 grid h-4 w-4 place-items-center rounded text-[rgb(2,8,23)] opacity-70 transition hover:opacity-100" aria-label={copy.close}>
                      <X size={16} />
                      <span className="sr-only">{copy.close}</span>
                    </button>
                    <p className="mt-1.5 text-sm font-normal leading-5 text-slate-500">{copy.exportSelectedFiles(selectedTaskIds.length)}</p>
                    <p className="mt-[30px] text-base font-semibold leading-6 text-[rgb(2,8,23)]">{copy.fileFormat}</p>
                    <div className="mt-2.5 grid grid-cols-2 gap-x-2.5 gap-y-2.5">
                      {dashboardExportFormats.map((format) => (
                        <label key={format} className="flex h-[52px] w-[220px] cursor-pointer items-center gap-3 text-base font-normal leading-6 text-[rgb(2,8,23)] transition hover:text-primary">
                          <input type="radio" name="batchExportFormat" value={format} checked={batchExportFormat === format} onChange={() => setBatchExportFormat(format)} className="sr-only" />
                          <span className={clsx("grid h-4 w-4 place-items-center rounded-full border", batchExportFormat === format ? "border-primary" : "border-slate-300")}>
                            {batchExportFormat === format ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                          </span>
                          {dashboardExportLabels[format]}
                        </label>
                      ))}
                    </div>
                    <p className="mt-[30px] text-base font-semibold leading-6 text-[rgb(2,8,23)]">{copy.exportOptions}</p>
                    <div className="mt-3 flex flex-wrap gap-8">
                      <label className="flex h-5 items-center gap-2 text-base font-normal leading-6 text-[rgb(2,8,23)]">
                        <input type="checkbox" checked={batchShowSpeaker} onChange={(event) => setBatchShowSpeaker(event.target.checked)} className="sr-only" />
                        <span className={clsx("grid h-4 w-4 place-items-center rounded border border-primary", batchShowSpeaker && "bg-primary")}>
                          {batchShowSpeaker ? <CheckCircle2 size={12} className="text-white" /> : null}
                        </span>
                        {copy.showSpeakerNames}
                      </label>
                      <label className="flex h-5 items-center gap-2 text-base font-normal leading-6 text-[rgb(2,8,23)]">
                        <input type="checkbox" checked={batchShowTimestamp} onChange={(event) => setBatchShowTimestamp(event.target.checked)} className="sr-only" />
                        <span className={clsx("grid h-4 w-4 place-items-center rounded border border-primary", batchShowTimestamp && "bg-primary")}>
                          {batchShowTimestamp ? <CheckCircle2 size={12} className="text-white" /> : null}
                        </span>
                        {copy.showTimestamps}
                      </label>
                    </div>
                    <div className="mt-7 flex justify-center">
                      <button type="button" onClick={() => exportSelectedTasks().catch(() => undefined)} disabled={busy} className="inline-flex h-12 w-[220px] items-center justify-center rounded-[12px] bg-primary px-7 py-2 text-base font-bold leading-6 text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
                        {copy.exportAction}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
              {batchDeleteDialogOpen ? (
                <BatchDeleteConfirmDialog
                  busy={busy}
                  copy={copy}
                  count={selectedTaskIds.length}
                  onCancel={() => setBatchDeleteDialogOpen(false)}
                  onConfirm={() => runBatchAction("delete").catch(() => undefined)}
                />
              ) : null}
              {batchDeleteOriginalsDialogOpen ? (
                <WorkspaceConfirmDialog
                  busy={busy}
                  copy={copy}
                  title={copy.deleteOriginalMedia}
                  description={`Are you sure you want to delete the original media files for ${selectedTaskIds.length} selected transcription${selectedTaskIds.length === 1 ? "" : "s"}? Transcripts and generated content will be preserved.`}
                  confirmLabel={copy.delete}
                  onCancel={() => setBatchDeleteOriginalsDialogOpen(false)}
                  onConfirm={() => runBatchAction("delete_originals").catch(() => undefined)}
                />
              ) : null}
              {taskActionConfirm ? (
                <WorkspaceConfirmDialog
                  busy={busy}
                  copy={copy}
                  title={taskActionConfirm.action === "cancel" ? copy.cancelTranscription : copy.deleteOriginalMedia}
                  description={
                    taskActionConfirm.action === "cancel"
                      ? `Are you sure you want to cancel ${taskActionConfirm.title}?`
                      : `Are you sure you want to delete the original media file for ${taskActionConfirm.title}? The transcript and generated content will be preserved.`
                  }
                  confirmLabel={taskActionConfirm.action === "cancel" ? copy.cancelTask : copy.delete}
                  onCancel={() => setTaskActionConfirm(null)}
                  onConfirm={() => {
                    const pending = taskActionConfirm;
                    setTaskActionConfirm(null);
                    if (pending.action === "cancel") {
                      cancelTask(pending.taskId).catch(() => undefined);
                    } else {
                      deleteOriginalFile(pending.taskId).catch(() => undefined);
                    }
                  }}
                />
              ) : null}
              {dashboardLinkDialogOpen ? (
                <div className="fixed inset-0 z-40 bg-black/40">
                  <section className={clsx("fixed left-1/2 top-1/2 max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-0 sm:max-w-[560px]", !resolvedMedia && "grid gap-3")} role="dialog" aria-modal="true" aria-labelledby="dashboard-link-dialog-title">
                    <button type="button" onClick={() => setDashboardLinkDialogOpen(false)} className="focus-ring absolute right-4 top-4 inline-flex h-4 w-4 items-center justify-center rounded-sm text-ink/70 transition hover:text-ink" aria-label={copy.close}>
                      <X size={16} />
                      <span className="sr-only">{copy.close}</span>
                    </button>
                    <div className="px-5 pb-3 pt-5">
                      <h2 id="dashboard-link-dialog-title" className="text-xl font-semibold text-ink">{t("mediaLinkTranscription")}</h2>
                      <p className="mt-1 text-sm leading-5 text-slate-500">{copy.pastePrompt}</p>
                    </div>
                    {!resolvedMedia ? (
                      <div className="px-5 pb-5">
                        <div className="space-y-3">
                          <div className="rounded-none border-0 border-transparent bg-transparent px-3 py-2.5 sm:rounded-[12px] sm:border sm:border-slate-200/60 sm:bg-slate-100/25">
                            <p className="inline-flex items-center gap-1.5 text-xs font-normal leading-4 text-slate-500/90">
                              <Link2 size={16} />
                              {copy.supportedPlatformsLabel}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {mediaLinkPlatformItems.map(([item, icon]) => (
                                <span key={item} className="inline-flex h-[30px] items-center gap-2 rounded-full border border-violet/20 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-950/90 shadow-soft">
                                  {icon}
                                  {item === "Many other links" ? copy.manyOtherLinks : item}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                              value={youtubeUrl}
                              onChange={(event) => {
                                setYoutubeUrl(event.target.value);
                                setResolvedMedia(null);
                                setDashboardLinkResolveError(null);
                                setError(null);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  resolveDashboardMediaLink().catch(() => undefined);
                                }
                              }}
                              className="field media-link-input min-w-0 flex-1 border-violet/60 px-3 py-2 focus-visible:ring-violet/20 focus-visible:ring-offset-0"
                              placeholder={copy.mediaLinkPlaceholder}
                              aria-label={copy.linkInput}
                              autoFocus
                            />
                            <button type="button" onClick={() => resolveDashboardMediaLink().catch(() => undefined)} disabled={dashboardLinkResolving || !youtubeUrl.trim()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-violet/60 bg-white px-6 py-2 text-sm font-medium text-violet transition-colors hover:bg-violet/5 disabled:opacity-45" aria-label={copy.checkLink}>
                              {dashboardLinkResolving ? <Loader2 className="animate-spin" size={16} /> : null}
                              {copy.search}
                            </button>
                          </div>
                          {dashboardLinkResolving ? (
                            <p className="flex items-center gap-2 text-sm font-bold text-violet">
                              <Loader2 className="animate-spin" size={16} />
                              {copy.checkingLink}
                            </p>
                          ) : null}
                          {dashboardLinkResolveError ? <p role="alert" className="animate-fade-in text-sm font-medium leading-5 text-red-500">{dashboardLinkResolveError}</p> : null}
                          <div className="border-t border-slate-200/50 pt-2">
                            <div className="mt-4 flex h-fit flex-row items-center justify-center text-sm">
                              <div className="font-normal text-ink/60">{copy.availableMinutes}</div>
                              <div className="mx-2 font-medium text-violet">{availableTranscriptionMinutes}</div>
                              <button type="button" onClick={() => openDashboardPlans("annual")} className="inline-flex h-auto items-center justify-center gap-2 whitespace-nowrap border-b border-violet/30 p-0 text-sm font-medium text-violet transition-colors hover:border-violet hover:text-violet">{copy.buyMoreMinutes}</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <MediaLinkSourceBox sourceUrl={resolvedMedia.sourceUrl} changeLabel={copy.changeLink} onChange={() => { setResolvedMedia(null); setDashboardLinkResolveError(null); }} />
                    )}
                    {resolvedMedia && mode === "youtube" ? (
                      <MediaLinkResolvedSettings
                        copy={copy}
                        media={resolvedMedia}
                        language={language}
                        setLanguage={setLanguage}
                        speakerLabels={speakerLabels}
                        setSpeakerLabels={updateSpeakerLabels}
                        subtitleEnabled={subtitleEnabled}
                        setSubtitleEnabled={setSubtitleEnabled}
                        summaryTemplate={summaryTemplate}
                        setSummaryTemplate={setSummaryTemplate}
                      />
                    ) : null}
                    {resolvedMedia ? (
                      <button
                        type="button"
                        onClick={async () => {
                          const started = await startTask();
                          if (started) setDashboardLinkDialogOpen(false);
                        }}
                        disabled={busy || dashboardLinkResolving || !resolvedMedia || mode !== "youtube"}
                        className="btn-primary mx-5 mt-5 w-[calc(100%-2.5rem)] py-3 disabled:opacity-45"
                      >
                        {busy ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        {copy.transcribe}
                      </button>
                    ) : null}
                    {resolvedMedia && error ? <MediaLinkErrorAlert message={error} upgradeLabel={copy.upgradePlan} onUpgrade={() => openDashboardPlans("annual")} /> : null}
                    {resolvedMedia?.provider === "youtube" ? (
                      <p className="mx-5 mt-3 text-center">
                        <a href={`/${locale}/tools/youtube-video-downloader?url=${encodeURIComponent(resolvedMedia.sourceUrl)}`} className="text-sm font-medium text-violet transition hover:text-violet/90">
                          {copy.downloadVideo}
                        </a>
                      </p>
                    ) : null}
                    {resolvedMedia ? <div className="mx-5 mt-4 flex items-center justify-center gap-2 border-t border-ink/10 pt-3 text-sm">
                      <p>
                        <span className="font-normal text-ink/60">{copy.availableMinutes}</span>{" "}
                        <span className="font-black text-violet">{availableTranscriptionMinutes}</span>
                      </p>
                      <button type="button" onClick={() => openDashboardPlans("annual")} className="border-b border-violet/30 p-0 text-sm font-medium text-violet transition hover:border-violet hover:text-violet">{copy.buyMoreMinutes}</button>
                    </div> : null}
                    {resolvedMedia ? <div className="h-5" /> : null}
                  </section>
                </div>
              ) : null}
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
                  openTaskActionConfirm={(action, taskId, title) => setTaskActionConfirm({action, taskId, title})}
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
                copy={copy}
                busy={busy}
                language={language}
                setLanguage={setLanguage}
                speakerLabels={speakerLabels}
                setSpeakerLabels={updateSpeakerLabels}
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
            {dashboardUpgradePromptOpen ? <DashboardUpgradePrompt copy={copy} onClose={() => setDashboardUpgradePromptOpen(false)} onShowPlans={openDashboardPlans} /> : null}
            {dashboardPlansOpen ? <DashboardPricingOverlay locale={locale} initialMode={dashboardPlansInitialMode} onClose={() => setDashboardPlansOpen(false)} /> : null}
            </div>
          </section>
      </section>
      ) : null}

      {showAppSumoWelcome ? (
        <AppSumoWelcomeDialog
          copy={copy}
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
      {!isDashboard && !isUpload ? <SiteFooter /> : null}
    </main>
  );
}

function AppSumoWelcomeDialog({
  copy,
  user,
  usageSnapshot,
  onClose,
  onStartUpload
}: {
  copy: ReturnType<typeof getWorkspaceCopy>;
  user: CurrentUser | null;
  usageSnapshot: UsageSnapshot | null;
  onClose: () => void;
  onStartUpload: () => void;
}) {
  const [step, setStep] = useState(0);
  const welcomeCopy = copy.appSumoWelcome;
  const subscription = usageSnapshot?.subscription ?? user?.subscriptions?.[0] ?? null;
  const plan = subscription?.plan ? subscription.plan.toUpperCase() : "PRO";
  const remaining = subscription?.remainingMinutes ?? 0;
  const quota = subscription?.monthlyMinuteQuota;
  const steps = [
    {
      title: welcomeCopy.activeTitle,
      text: welcomeCopy.activeText(plan, user?.email ?? copy.account),
      icon: <Star size={26} />
    },
    {
      title: welcomeCopy.steps[0].title,
      text: welcomeCopy.steps[0].text,
      icon: <UploadCloud size={26} />
    },
    {
      title: welcomeCopy.steps[1].title,
      text: welcomeCopy.steps[1].text,
      icon: <Brain size={26} />
    },
    {
      title: welcomeCopy.steps[2].title,
      text: welcomeCopy.steps[2].text,
      icon: <FolderOpen size={26} />
    }
  ];
  const active = steps[step] ?? steps[0];
  const last = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="appsumo-welcome-title">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none">
        <div className="border-b border-ink/10 bg-gradient-to-br from-violet/12 via-white to-primary/10 p-5 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet/20 bg-white px-3 py-1.5 text-xs font-black text-violet shadow-soft">
            <TicketCheck size={15} />
            {welcomeCopy.badge}
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
              <p className="text-xs uppercase tracking-wide text-ink/42">{welcomeCopy.planLabel}</p>
              <p className="mt-1 text-base font-black text-ink">{plan}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/42">{welcomeCopy.minutesLabel}</p>
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
                aria-label={welcomeCopy.stepAria(index + 1)}
              />
            ))}
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <button type="button" onClick={onClose} className="btn-outline sm:w-32">{welcomeCopy.skipTour}</button>
            {last ? (
              <button type="button" onClick={onStartUpload} className="btn-primary flex-1">
                <UploadCloud size={17} />
                {welcomeCopy.startTranscribing}
              </button>
            ) : (
              <button type="button" onClick={() => setStep((value) => Math.min(value + 1, steps.length - 1))} className="btn-primary flex-1">
                {welcomeCopy.nextStep}
                <ArrowRight size={17} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeWelcomeCard({user, copy, locale}: {user: CurrentUser; copy: ReturnType<typeof getWorkspaceCopy>; locale: string}) {
  const displayName = user.name?.trim() || user.email.split("@")[0] || copy.account;
  const avatarSrc = safeImageSrc(user.image);
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="rounded-2xl border border-white/80 bg-white px-5 py-5 text-center shadow-lifted md:px-7 md:py-7">
      <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#2f711f] text-lg font-semibold text-white shadow-card ring-1 ring-ink/10 md:h-16 md:w-16 md:text-xl">
        {avatarSrc ? (
          // 外部 OAuth 头像域名不可控，用原生 img 避免 next/image 域名限制。
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <h2 className="mt-4 text-xl font-black leading-tight text-ink md:text-2xl">{copy.welcomeBack(displayName)}</h2>
      <p className="mt-2 break-words text-sm font-semibold text-slate-500 md:text-base">{user.email}</p>
      <p className="mt-5 text-sm font-medium text-ink/78 md:text-base">{copy.manageTranscriptions}</p>
      <a href={`/${locale}/dashboard`} className="btn-primary mt-5 h-11 px-6 text-sm">
        {copy.goToDashboard}
      </a>
    </section>
  );
}

function MarketingHero({
  title,
  description,
  facts,
  children
}: {
  title: string;
  description: string;
  facts: readonly {icon: ReactNode; label: string; items: readonly string[]}[];
  children: ReactNode;
}) {
  return (
    <section className="bg-gradient-to-b from-primary/10 via-white to-primary/10 px-4 pb-16 pt-12 md:px-8 md:pb-20 md:pt-16">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="mx-auto text-2xl font-extrabold leading-normal text-ink md:text-5xl lg:text-6xl">
          <span className="text-primary">{title}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-5xl text-sm leading-6 text-slate-500 md:mt-6 md:text-xl md:leading-8">{description}</p>
      </div>

      <div className="mx-auto mt-8 hidden max-w-5xl items-center justify-center gap-8 text-left md:flex lg:gap-16">
        {facts.map((item) => (
          <Fact key={item.label} icon={item.icon} label={item.label} items={item.items} />
        ))}
      </div>

      <div className="mx-auto mt-8 md:mt-10">{children}</div>
    </section>
  );
}

function DashboardUpgradePrompt({copy, onClose, onShowPlans}: {copy: ReturnType<typeof getWorkspaceCopy>; onClose: () => void; onShowPlans: (mode: DashboardPricingMode) => void}) {
  const [selectedCycle, setSelectedCycle] = useState<"annual" | "monthly">("annual");
  const promptCopy = copy.dashboardPricing.upgradePrompt;

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
    {
      key: "annual",
      label: promptCopy.annualLabel,
      price: "$6",
      note: promptCopy.annualNote,
      badge: promptCopy.annualBadge
    },
    {
      key: "monthly",
      label: promptCopy.monthlyLabel,
      price: "$10",
      note: promptCopy.monthlyNote
    }
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <section className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-white/20 bg-card text-ink shadow-2xl animate-in zoom-in-95 duration-300" role="dialog" aria-modal="true" aria-labelledby="dashboard-upgrade-title">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 z-10 grid h-9 w-9 place-items-center rounded-full text-ink transition hover:bg-slate-100" aria-label={copy.close}>
          <X size={20} />
        </button>

        <div className="bg-gradient-to-b from-primary/10 to-white px-8 pb-4 pt-8 text-center">
          <div className="relative mb-4 inline-flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-primary/30" />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-white text-primary shadow-sm">
              <Sparkles size={26} />
            </span>
          </div>
          <h2 id="dashboard-upgrade-title" className="mb-1.5 text-2xl font-black leading-8 tracking-[-0.025em] text-ink">{promptCopy.title}</h2>
          <p className="mx-auto max-w-[260px] text-sm font-medium leading-[22.75px] text-slate-500">{promptCopy.description}</p>
        </div>

        <div className="space-y-5 px-7 pb-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-100/50 p-4 text-left">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black leading-[15px] text-primary-foreground shadow-sm">
                <TicketCheck size={12} />
                {promptCopy.subscriptionLabel}
              </div>
              <span className="text-base font-bold leading-6 tracking-tight text-foreground">{promptCopy.planTitle}</span>
            </div>
            <div className="grid gap-2.5">
              {promptCopy.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
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
                    active ? "border-primary bg-primary/10 shadow-sm" : "border-slate-200 bg-white hover:border-primary/50"
                  )}
                >
                  <span className="w-full">
                    <span className="flex items-start justify-between gap-3">
                      <span className="block text-xs font-black uppercase leading-4 tracking-wider text-slate-500">{choice.label}</span>
                      <span className="shrink-0 text-right">
                        <span className="text-3xl font-black leading-9 text-ink">{choice.price}</span>
                        <span className="text-sm font-bold leading-5 text-slate-500">{promptCopy.monthSuffix}</span>
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
              label={promptCopy.upgradeNow}
              showIcon={false}
              wrapperClassName="mt-0"
              buttonClassName="h-11 rounded-2xl text-base font-black shadow-lg shadow-primary/20"
            />
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onShowPlans("annual");
                }}
                className="text-sm font-bold leading-5 text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-primary"
              >
                {promptCopy.seeAllPlans}
              </button>
              <div className="flex items-center gap-3 text-xs font-bold uppercase leading-4 tracking-wider text-slate-400">
                <span>{promptCopy.trust[0]}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{promptCopy.trust[1]}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}

function DashboardUpgradeCard({copy, onOpenUpgradePrompt, onShowPlans}: {copy: ReturnType<typeof getWorkspaceCopy>; onOpenUpgradePrompt: () => void; onShowPlans: (mode: DashboardPricingMode) => void}) {
  const [countdown, setCountdown] = useState(() => dashboardPromotionInitialCountdown);
  const cardCopy = copy.dashboardPricing.upgradeCard;

  useEffect(() => {
    const promotionDeadline = Date.now() + dashboardPromotionCountdownDurationMs;
    setCountdown(dashboardPromotionCountdown(promotionDeadline));
    const interval = window.setInterval(() => {
      setCountdown(dashboardPromotionCountdown(promotionDeadline));
    }, 50);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="mb-8 shrink-0 overflow-hidden rounded-lg border border-border bg-card/90 text-ink shadow-xl backdrop-blur-sm">
      <div className="relative p-8">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <div className="mb-6 flex items-center gap-3">
              <h2 className="text-xl font-normal leading-7 text-foreground">{cardCopy.title}</h2>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{cardCopy.monthlyBadge}</span>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{cardCopy.discountBadge}</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-normal leading-tight text-foreground">$60.00</span>
              <span className="text-lg font-normal text-slate-500 line-through">$120.00</span>
              <span className="text-sm font-normal text-slate-500">{cardCopy.billedYearly}</span>
            </div>

            <div className="mt-6 grid max-w-[620px] grid-cols-2 gap-x-4 gap-y-4 text-sm font-normal leading-5 text-slate-500 md:gap-x-16 md:text-base md:leading-6">
              {cardCopy.features.map((item) => (
                <div key={item} className="flex min-h-5 items-center gap-2 md:gap-3">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 max-w-[542.4px] max-md:mt-6">
              <button type="button" onClick={onOpenUpgradePrompt} className="inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary bg-gradient-to-r from-primary/70 to-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-all duration-200 hover:from-primary hover:to-primary/80 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                <Sparkles size={19} />
                {cardCopy.upgradeNow}
              </button>
              <button
                type="button"
                onClick={() => onShowPlans("monthly")}
                className="mx-auto mt-3.5 flex h-5 items-center justify-center text-sm font-medium leading-5 text-slate-500 underline decoration-slate-400 underline-offset-4 transition hover:text-primary max-md:mt-4 max-md:block"
                aria-expanded="false"
                aria-controls="dashboard-all-plans"
              >
                {cardCopy.seeAllPlans}
              </button>
            </div>
          </div>

          <div className="rounded-[16px] border border-slate-200 bg-slate-100/60 p-6 text-center shadow-none backdrop-blur-sm max-md:absolute max-md:left-[386px] max-md:top-[180px] max-md:w-[288px] xl:justify-self-end">
            <div className="mb-2 flex items-center justify-center gap-2 text-lg font-normal leading-7 text-foreground">
              <Timer size={20} className="text-slate-500" />
              {cardCopy.limitedTime}
            </div>
            <div className="flex gap-2 font-mono text-2xl font-normal leading-8 text-foreground">
              {countdown.map((value, index) => (
                <Fragment key={index}>
                  {index > 0 ? <span className="text-slate-500">:</span> : null}
                  <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">{value}</span>
                </Fragment>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export function DashboardPricingOverlay({locale, onClose, initialMode = "monthly"}: {locale: string; onClose: () => void; initialMode?: DashboardPricingMode}) {
  const [pricingMode, setPricingMode] = useState<DashboardPricingMode>(initialMode);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const copy = getWorkspaceCopy(locale);
  const pricingCopy = copy.dashboardPricing;
  const activePricing = dashboardPricingModes[pricingMode];

  useEffect(() => {
    setMounted(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed left-1/2 top-1/2 z-50 grid h-screen max-h-screen w-[90vw] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-visible rounded-lg border border-slate-200 bg-white p-6 text-ink shadow-none" role="dialog" aria-modal="true" aria-labelledby="dashboard-plans-title">
      <button type="button" onClick={onClose} className="fixed right-6 top-5 z-10 grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-ink" aria-label={copy.close}>
        <X size={18} />
      </button>

      <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1070px] pt-6">
        <div className="text-center">
          <h2 id="dashboard-plans-title" className="text-4xl font-bold tracking-tight text-ink">{pricingCopy.plansTitle}</h2>
          <p className="mx-auto mt-5 max-w-4xl text-xl leading-8 text-slate-500">{pricingCopy.subtitle}</p>
        </div>

        <div role="tablist" aria-label={pricingCopy.billingOptions} className="mx-auto mt-6 grid h-10 w-[512px] grid-cols-3 items-center justify-center rounded-md bg-slate-100 p-1 text-muted-foreground">
          {(Object.keys(dashboardPricingModes) as DashboardPricingMode[]).map((mode) => {
            const option = dashboardPricingModes[mode];
            const optionCopy = pricingCopy.modes[mode];
            const active = pricingMode === mode;
            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPricingMode(mode)}
                className={clsx("inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium ring-offset-background transition-all", active ? "bg-white text-ink" : "text-slate-500 hover:bg-white/70 hover:text-ink")}
              >
                {optionCopy.label}
                {option.badge ? <span className="ml-1 inline-flex rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-semibold leading-3 text-white">{"badge" in optionCopy ? optionCopy.badge : option.badge}</span> : null}
              </button>
            );
          })}
        </div>

        {activePricing.note ? <p className="mt-4 text-center text-sm leading-5 text-slate-500">{localizeDashboardPricingText(pricingCopy, activePricing.note)}</p> : null}

        <div className={clsx("min-w-0 max-w-full overflow-x-auto px-14 pb-8 [scrollbar-width:thin]", activePricing.note ? "mt-3" : "mt-8")}>
          <div className={clsx("mx-auto flex min-w-max items-stretch gap-4", pricingMode === "one-time" && "justify-center")}>
            {activePricing.plans.map((plan) => (
              <DashboardPlanCard key={plan.name} plan={plan} locale={locale} pricingMode={pricingMode} pricingCopy={pricingCopy} />
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-12">
          <h3 className="text-center text-4xl font-bold tracking-tight text-ink">{pricingCopy.faqTitle}</h3>
          <div className="mx-auto mt-12 max-w-[718px] divide-y divide-slate-200">
            {pricingCopy.faqs.map(([question, answer], index) => {
              const active = openFaq === index;
              return (
                <article key={question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(active ? null : index)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-medium leading-6 text-ink transition hover:underline md:min-h-[76px] md:py-6 md:text-lg md:leading-7"
                    aria-expanded={active}
                  >
                    <span>{question}</span>
                    <ChevronDown size={18} className={clsx("shrink-0 text-slate-500 transition", active && "rotate-180")} />
                  </button>
                  {active ? <p className="pb-5 text-sm leading-6 text-slate-600">{answer}</p> : null}
                </article>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </div>,
    document.body
  );
}

function DashboardPricingFeatureLabel({feature, pricingCopy}: {feature: DashboardPricingFeature; pricingCopy: DashboardPricingCopy}) {
  if (typeof feature === "string") {
    return <>{localizeDashboardPricingText(pricingCopy, feature)}</>;
  }

  const featureLabel = localizeDashboardPricingText(pricingCopy, feature.label);
  const label = feature.href ? (
    <a href={feature.href} className="text-slate-700 underline decoration-slate-300 underline-offset-2 transition hover:text-primary hover:decoration-primary/40">
      {featureLabel}
    </a>
  ) : (
    <span>{featureLabel}</span>
  );

  return (
    <span className="inline-flex flex-wrap items-center gap-1 align-middle">
      {label}
      {feature.info ? (
        <button
          type="button"
          aria-label={pricingCopy.moreInformation}
          className="inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1"
        >
          <Info className="h-3.5 w-3.5 text-slate-400" />
        </button>
      ) : null}
      {feature.badge ? <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium leading-none text-primary">{pricingCopy.badges[feature.badge as keyof typeof pricingCopy.badges] ?? feature.badge}</span> : null}
    </span>
  );
}

function DashboardPlanCard({plan, locale, pricingMode, pricingCopy}: {plan: DashboardPricingPlan; locale: string; pricingMode: DashboardPricingMode; pricingCopy: DashboardPricingCopy}) {
  const ctaClassName = clsx(
    "h-10 w-full rounded-md px-4 py-2 text-sm font-medium",
    plan.popular ? "bg-primary text-white hover:bg-primary/90" : "border border-slate-200 bg-white text-ink hover:border-primary hover:bg-white"
  );
  const planName = localizeDashboardPricingText(pricingCopy, plan.name);
  const planTagline = localizeDashboardPricingText(pricingCopy, plan.tagline);
  const planCta = localizeDashboardPricingText(pricingCopy, plan.cta);
  const planSuffix = localizeDashboardPricingText(pricingCopy, plan.suffix);
  const planQuota = localizeDashboardPricingText(pricingCopy, plan.quota);
  const planNote = plan.note ? localizeDashboardPricingText(pricingCopy, plan.note) : undefined;

  return (
    <article className={clsx("relative flex shrink-0 flex-col rounded-lg border border-slate-200 bg-white text-ink shadow-sm", pricingMode === "one-time" ? "w-[402px]" : "w-[405px]")}>
      {plan.popular ? (
        <div className="absolute right-4 top-6">
          <span className="mr-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{pricingCopy.mostPopular}</span>
        </div>
      ) : null}

      <div className="flex min-h-[140px] flex-col p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">{planName}</h3>
        <p className="mb-4 pb-4 pt-2 text-sm leading-5 text-slate-500">{planTagline}</p>
      </div>

      <div className="px-6">
        {plan.plan || plan.pack ? (
          <PricingAction
            plan={plan.plan}
            pack={plan.pack}
            label={planCta}
            mode={pricingMode}
            variant={plan.popular ? "primary" : "outline"}
            wrapperClassName="!mt-0 mb-6"
            buttonClassName={ctaClassName}
            showIcon={false}
          />
        ) : (
          <button type="button" onClick={() => { window.location.href = `/${locale}/pricing`; }} className={clsx("mb-6 inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2", ctaClassName)}>
            {planCta}
          </button>
        )}

        <div className="flex items-end">
          <p className="mt-2 pb-1 font-mono text-5xl leading-none">{plan.price}</p>
          <p className="mb-1.5 ml-2 text-[13px] leading-4 text-slate-500">{planSuffix}</p>
        </div>
        {plan.previousPrice || plan.note ? (
          <p className="mt-2 text-sm font-medium text-slate-500">
            {plan.previousPrice ? <span className="text-sm text-slate-400 line-through">{plan.previousPrice}</span> : null}
            {planNote ? <span className="ml-2">{planNote}</span> : null}
          </p>
        ) : null}
        <p className="mt-4 text-sm font-semibold text-primary">{planQuota}</p>
      </div>

      <div className={clsx("mt-6 grid flex-1 content-start gap-3 px-6 pb-6", pricingMode === "one-time" ? "min-h-[480px]" : "min-h-[500px]")}>
        {plan.features.map((feature) => {
          const label = typeof feature === "string" ? feature : feature.label;
          return (
            <p key={label} className="flex items-start gap-2 text-sm leading-5 text-slate-600">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
              <DashboardPricingFeatureLabel feature={feature} pricingCopy={pricingCopy} />
            </p>
          );
        })}
      </div>
    </article>
  );
}

function TranscriptionLauncher({
  t,
  copy,
  locale,
  mode,
  setMode,
  file,
  setFile,
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
  authRedirectMessage,
  inputRef,
  toggleRecording,
  startTask,
  onRequireAuth,
  compact = false,
  showRecordTab = true,
  sourceLike = false
}: {
  t: (key: string) => string;
  copy: ReturnType<typeof getWorkspaceCopy>;
  locale: string;
  mode: InputMode;
  setMode: (value: InputMode) => void;
  file: File | null;
  setFile: (value: File | null) => void;
  youtubeUrl: string;
  setYoutubeUrl: (value: string) => void;
  driveUrl: string;
  setDriveUrl: (value: string) => void;
  resolvedMedia?: ResolvedMedia | null;
  setResolvedMedia?: (value: ResolvedMedia | null) => void;
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
  authRedirectMessage?: string | null;
  inputRef: RefObject<HTMLInputElement>;
  toggleRecording: () => void;
  startTask: () => void;
  onRequireAuth?: (reason: string) => void;
  compact?: boolean;
  showRecordTab?: boolean;
  sourceLike?: boolean;
}) {
  const liveAudioFormats = "aac, amr, awb, flac, m4a, mka, mp2, mp3, oga, ogg, opus, wav, weba, webm, wma";
  const liveVideoFormats = "3gp, mkv, mov, mp4, mpg, ts, webm, wmv";
  const [resolvingLauncherLink, setResolvingLauncherLink] = useState(false);
  const [launcherLinkError, setLauncherLinkError] = useState<string | null>(null);
  const hasLinkValue = Boolean((mode === "drive" ? driveUrl : youtubeUrl).trim());
  const renderModeTab = (targetMode: InputMode, label: string) => {
    const active = mode === targetMode;
    return (
      <button
        type="button"
        role="tab"
        aria-selected={active}
        onClick={() => setMode(targetMode)}
        className={clsx(
          "focus-ring relative flex min-h-12 items-center justify-center rounded-sm px-3 pb-4 pt-1 text-base font-medium transition md:text-lg",
          active ? "font-bold text-ink after:absolute after:bottom-0 after:h-[3px] after:w-28 after:max-w-[70%] after:bg-primary" : "text-slate-500 hover:text-ink"
        )}
      >
        {label}
      </button>
    );
  };

  async function resolveLauncherLink() {
    const link = (mode === "drive" ? driveUrl : youtubeUrl).trim();
    if (!link || !setResolvedMedia) return;
    setResolvingLauncherLink(true);
    setLauncherLinkError(null);
    setResolvedMedia(null);
    try {
      const data = await fetch("/api/media/resolve", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({url: link})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.resolveLinkError);
        return body as ResolvedMedia;
      });
      setResolvedMedia(data);
      if (data.sourceType === "GOOGLE_DRIVE") setMode("drive");
    } catch (cause) {
      setLauncherLinkError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setResolvingLauncherLink(false);
    }
  }

  return (
    <aside className={clsx("bg-white", sourceLike ? "rounded-xl p-0 md:p-6" : "rounded-2xl border border-ink/10 shadow-lifted", compact ? "p-4" : !sourceLike && "p-6 md:p-8")}>
      {sourceLike ? (
        <div className={clsx("grid h-12", showRecordTab ? "grid-cols-3" : "grid-cols-2")}>
          {renderModeTab("upload", t("uploadFile"))}
          {renderModeTab("youtube", t("pasteLink"))}
          {showRecordTab ? renderModeTab("record", t("recordAudio")) : null}
        </div>
      ) : (
        <div className={clsx("grid border-b border-ink/10 text-sm font-black text-ink/55", showRecordTab ? "grid-cols-3" : "grid-cols-2")}>
          <ModeButton active={mode === "upload"} icon={<UploadCloud size={17} />} label={t("uploadFile")} onClick={() => setMode("upload")} />
          <ModeButton active={mode === "youtube"} icon={<Link2 size={17} />} label={t("pasteLink")} onClick={() => setMode("youtube")} />
          {showRecordTab ? <ModeButton active={mode === "record"} icon={<Mic size={17} />} label={t("recordAudio")} onClick={() => setMode("record")} /> : null}
        </div>
      )}

      <div className={clsx(sourceLike ? "mt-6" : "mt-6")}>
        {mode === "upload" ? (
          <div className="text-center">
            {sourceLike ? <p className="text-base font-medium leading-7 text-slate-500 md:text-lg">{copy.uploadPrompt}</p> : null}
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (onRequireAuth) {
                  onRequireAuth(copy.signInToUpload);
                  return;
                }
                setFile(event.dataTransfer.files[0] ?? null);
              }}
              className={clsx(
                "group mt-6 flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white p-5 text-center transition",
                sourceLike ? "border-violet/55 hover:border-violet hover:bg-violet/5" : "border-violet/35 hover:border-violet hover:bg-violet/5",
                compact ? "min-h-44" : sourceLike ? "min-h-[300px]" : "min-h-72"
              )}
            >
              <h2 className="mt-1 max-w-full break-words text-lg font-semibold text-ink md:text-xl">{file?.name ?? copy.dragFilesHere}</h2>
              <div className="my-5 flex items-center justify-center gap-2 text-sm font-semibold uppercase text-slate-300 md:my-6">
                <span className="h-px w-16 bg-slate-300" />
                {copy.or}
                <span className="h-px w-16 bg-slate-300" />
              </div>
              <button
                type="button"
                data-testid="home-upload-file-button"
                onClick={() => {
                  if (onRequireAuth) {
                    onRequireAuth(copy.signInToUpload);
                    return;
                  }
                  inputRef.current?.click();
                }}
                className="btn-primary px-8 py-3 text-base"
              >
                <UploadCloud size={18} />
                {copy.uploadAFile}
              </button>
              <input ref={inputRef} type="file" className="hidden" accept=".3gp,.aac,.amr,.awb,.flac,.m4a,.mka,.mkv,.mov,.mp2,.mp3,.mp4,.mpg,.oga,.ogg,.opus,.ts,.wav,.weba,.webm,.wma,.wmv" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
              <p className="mt-6 text-sm font-medium leading-6 text-slate-400">
                {copy.audioFormats}: {liveAudioFormats}
                <br />
                {copy.videoFormats}: {liveVideoFormats}
              </p>
            </div>
          </div>
        ) : mode === "youtube" || mode === "drive" ? (
          <div className="text-center">
            {!file && !youtubeUrl ? <p className="text-base font-medium leading-7 text-slate-500 md:text-lg">{copy.pastePrompt}</p> : null}
            <div className="mt-7">
              <p className="flex items-center justify-center gap-2 text-lg font-semibold text-slate-500">
                <Link2 size={18} />
                {t("supportedPlatforms")}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {mediaLinkPlatformItems.map(([item, icon]) => (
                  <span key={item} className="inline-flex min-h-10 items-center gap-3 rounded-full border border-violet/20 bg-white px-4 py-2 text-sm font-bold text-ink shadow-card md:text-base">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet/10 text-violet">{icon}</span>
                    {item === "Many other links" ? copy.manyOtherLinks : item}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 md:flex-row">
              <input
                value={mode === "drive" ? driveUrl : youtubeUrl}
                onChange={(event) => (mode === "drive" ? setDriveUrl(event.target.value) : setYoutubeUrl(event.target.value))}
                className="field h-14 flex-1 text-lg"
                placeholder={mode === "drive" ? copy.pastePublicDriveLink : copy.mediaLinkPlaceholder}
              />
              <button type="button" data-testid="home-link-search-button" onClick={resolveLauncherLink} disabled={resolvingLauncherLink || !hasLinkValue} className="btn-primary h-14 px-8 text-lg disabled:opacity-45">
                {resolvingLauncherLink ? <Loader2 className="animate-spin" size={18} /> : null}
                {copy.search}
              </button>
            </div>
            {launcherLinkError ? <p className="mt-4 animate-fade-in rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">{launcherLinkError}</p> : null}
            {resolvedMedia ? (
              <div className="mx-auto mt-7 max-w-5xl">
                <MediaLinkPreview media={resolvedMedia} variant="source" />
                <TranscriptionSettingsPanel
                  t={t}
                  copy={copy}
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
                  compact
                  sourceLike
                />
                <button type="button" data-testid="home-transcribe-cta" onClick={startTask} disabled={busy} className="btn-primary mt-8 h-14 w-full text-lg disabled:opacity-45">
                  {busy ? <Loader2 className="animate-spin" size={18} /> : null}
                  {copy.transcribeForFree}
                </button>
              </div>
            ) : null}
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

      {!sourceLike ? (
        <>
          <TranscriptionSettingsPanel
            t={t}
            copy={copy}
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
            compact={compact}
          />

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-ink/55">
              {copy.audioFormats}: {liveAudioFormats}
              <br />
              {copy.videoFormats}: {liveVideoFormats}
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
        </>
      ) : null}
      {notice ? <p className="mt-3 animate-fade-in rounded-md border border-violet/30 bg-violet/10 px-3 py-2 text-sm text-violet">{notice}</p> : null}
      {error ? <p className="mt-3 animate-fade-in rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p> : null}
      {sourceLike ? (
        <p className="mt-8 text-center text-sm font-medium leading-6 text-slate-500">
          {copy.legalNotice.prefix}
          <a href={`/${locale}/terms-of-service`} className="font-semibold text-violet underline underline-offset-2">
            {copy.legalNotice.terms}
          </a>
          {copy.legalNotice.connector}
          <a href={`/${locale}/privacy-policy`} className="font-semibold text-violet underline underline-offset-2">
            {copy.legalNotice.privacy}
          </a>
          {copy.legalNotice.suffix}
        </p>
      ) : null}
    </aside>
  );
}

function summaryTemplateOptionsFor(copy: ReturnType<typeof getWorkspaceCopy>) {
  return [
    ["none", copy.summaryTemplateLabels.none],
    ["standard", copy.summaryTemplateLabels.standard],
    ["meeting", copy.summaryTemplateLabels.meetingNotes],
    ["course_lecture", copy.summaryTemplateLabels.course],
    ["interview", copy.summaryTemplateLabels.interview],
    ["podcast", copy.summaryTemplateLabels.podcast]
  ] as const;
}

const summaryLanguageOptions = localeLanguageOptions;

const targetMediaLanguageOptions = localeLanguageOptions;

function targetSummaryTemplateOptionsFor(copy: ReturnType<typeof getWorkspaceCopy>) {
  return [
    ["none", copy.summaryTemplateLabels.none],
    ["standard", copy.summaryTemplateLabels.standard],
    ["meeting", copy.summaryTemplateLabels.meeting],
    ["course_lecture", copy.summaryTemplateLabels.course],
    ["interview", copy.summaryTemplateLabels.interview],
    ["podcast", copy.summaryTemplateLabels.podcast]
  ] as const;
}

function TargetSelectLike({
  value,
  onChange,
  options,
  ariaLabel,
  variant = "compact",
  groupLabel,
  proValues,
  disabled = false,
  className,
  triggerClassName
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
  ariaLabel: string;
  variant?: "language" | "summary" | "compact";
  groupLabel?: string;
  proValues?: readonly string[];
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedLabel = options.find(([optionValue]) => optionValue === value)?.[1] ?? options[0]?.[1] ?? "";

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
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
    <div ref={containerRef} className={clsx("relative min-w-0 w-full sm:w-[180px] sm:shrink-0", className)}>
      <button
        type="button"
        aria-label={variant === "compact" || disabled ? ariaLabel : undefined}
        aria-expanded={open}
        disabled={disabled}
        role={variant === "summary" ? "combobox" : undefined}
        onClick={() => !disabled && setOpen((current) => !current)}
        className={clsx(
          "inline-flex h-9 w-full items-center justify-between gap-2 whitespace-nowrap rounded-xl border-0 bg-slate-100/55 px-3 py-2 text-[13px] font-medium leading-[19.5px] text-ink/85 shadow-none outline-none transition-colors hover:bg-slate-100/70 focus-visible:ring-2 focus-visible:ring-violet/20 disabled:pointer-events-none disabled:opacity-45",
          triggerClassName
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={clsx("h-4 w-4 shrink-0 text-ink/55 transition-transform", open && "rotate-180")} />
      </button>

      {open && variant === "compact" ? (
        <div role="listbox" className="absolute left-0 top-full z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 text-sm font-normal leading-5 text-[rgb(2,8,23)] shadow-none">
          {options.map(([optionValue, label]) => {
            const isSelected = optionValue === value;

            return (
              <button
                key={optionValue}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(optionValue);
                  setOpen(false);
                }}
                className={clsx("flex h-8 w-full items-center justify-between rounded-md px-2 py-1.5 text-left font-normal transition hover:bg-slate-100", isSelected && "bg-violet/10 text-violet")}
              >
                <span className="truncate">{label}</span>
                {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {open && variant === "language" ? (
        <div className="absolute left-0 top-full z-[99999] mt-1 max-h-[280px] w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {groupLabel ? (
            <div className="px-4 py-1 text-xs font-medium uppercase leading-4 tracking-wide text-slate-500">{groupLabel}</div>
          ) : null}
          <div className="py-1">
            {options.map(([optionValue, label]) => (
              <button
                key={optionValue}
                type="button"
                onClick={() => {
                  onChange(optionValue);
                  setOpen(false);
                }}
                className="flex h-10 w-full items-center justify-between px-4 py-2 text-left text-base font-normal leading-6 text-ink hover:bg-slate-100"
              >
                <span className="truncate">{label}</span>
                {optionValue === value ? <Check className="h-4 w-4 shrink-0 text-violet" /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {open && variant === "summary" ? (
        <div role="listbox" className="absolute left-0 top-auto bottom-full z-50 mb-1 flex h-[270px] max-h-96 w-[300px] overflow-hidden rounded-[16px] border border-slate-200 bg-white p-3 text-ink">
          <div className="w-full">
            {options.map(([optionValue, label]) => {
              const isSelected = optionValue === value;
              const isPro = proValues?.includes(optionValue) ?? false;

              return (
                <button
                  key={optionValue}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(optionValue);
                    setOpen(false);
                  }}
                  className={clsx(
                    "flex h-9 w-full cursor-default select-none items-center justify-between rounded-[12px] px-2.5 py-1.5 text-left text-sm font-normal leading-5 text-ink outline-none hover:bg-slate-100",
                    isSelected && "bg-violet/10"
                  )}
                >
                  <span className="min-w-0 flex-1 truncate pr-1 font-medium">{label}</span>
                  {isPro ? (
                    <span className="ml-2 rounded-md bg-violet/10 px-1.5 py-0.5 text-[10px] font-semibold leading-3 text-violet">PRO</span>
                  ) : null}
                  {isSelected ? <Check className="ml-2 h-4 w-4 shrink-0 text-violet" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PremiumSpeakerNotice({copy, onClose}: {copy: ReturnType<typeof getWorkspaceCopy>; onClose: () => void}) {
  return (
    <div role="status" className="fixed left-1/2 top-8 z-[70] w-[min(calc(100%-2rem),640px)] -translate-x-1/2 rounded-xl border border-emerald-200 bg-emerald-50 px-8 py-7 text-emerald-700 shadow-lifted">
      <button type="button" onClick={onClose} className="absolute -left-3 -top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm transition hover:bg-white" aria-label={copy.closePremiumFeatureNotice}>
        <X size={19} />
      </button>
      <div className="flex items-start gap-5">
        <span className="mt-9 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Check size={21} strokeWidth={3} />
        </span>
        <div className="min-w-0">
          <p className="text-xl font-semibold leading-7 text-emerald-700">{copy.premiumFeatureEnabled}</p>
          <p className="mt-3 text-xl font-normal leading-8 text-emerald-700">{copy.speakerPaidFeatureTrial}</p>
        </div>
      </div>
    </div>
  );
}

function MediaLinkErrorAlert({message, upgradeLabel, onUpgrade}: {message: string; upgradeLabel: string; onUpgrade: () => void}) {
  const showUpgradeAction = isInsufficientFreeMinutesMessage(message);
  return (
    <div role="alert" className="mx-5 mt-3 flex flex-col gap-3 rounded-md border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral sm:flex-row sm:items-center sm:justify-between">
      <p className="font-medium leading-6">{message}</p>
      {showUpgradeAction ? (
        <button type="button" onClick={onUpgrade} className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-violet px-4 text-sm font-semibold text-white transition hover:bg-violet/90">
          {upgradeLabel}
        </button>
      ) : null}
    </div>
  );
}

function TargetSwitch({
  checked,
  onChange,
  ariaLabel
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={clsx("inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors", checked ? "bg-violet" : "bg-slate-200")}
    >
      <span className={clsx("pointer-events-none h-5 w-5 rounded-full bg-white shadow-sm transition-transform", checked && "translate-x-5")} />
    </button>
  );
}

function MediaLinkResolvedSettings({
  copy,
  media,
  language,
  setLanguage,
  speakerLabels,
  setSpeakerLabels,
  subtitleEnabled,
  setSubtitleEnabled,
  summaryTemplate,
  setSummaryTemplate
}: {
  copy: ReturnType<typeof getWorkspaceCopy>;
  media: ResolvedMedia;
  language: string;
  setLanguage: (value: string) => void;
  speakerLabels: boolean;
  setSpeakerLabels: (value: boolean) => void;
  subtitleEnabled: boolean;
  setSubtitleEnabled: (value: boolean) => void;
  summaryTemplate: string;
  setSummaryTemplate: (value: string) => void;
}) {
  const targetSummaryOptions = targetSummaryTemplateOptionsFor(copy);

  return (
    <div className="mx-5 mt-5">
      <MediaLinkPreview media={media} variant="target-dialog" />
      <div className="mt-6 grid gap-5">
        <div className="grid grid-cols-[minmax(0,1fr)_160px] items-center gap-4">
          <div>
            <p className="text-sm font-normal leading-5 text-ink/90">{copy.audioLanguage}</p>
            <p className="mt-1 text-xs leading-[19.5px] text-slate-500">{copy.audioLanguageHelp}</p>
          </div>
          <TargetSelectLike
            value={language === "auto" ? "en" : language}
            onChange={setLanguage}
            options={targetMediaLanguageOptions}
            ariaLabel={copy.audioLanguage}
            variant="language"
            groupLabel={copy.popularLanguages}
            className="sm:w-[160px]"
          />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-4">
          <p className="flex items-center gap-2 text-sm font-normal leading-5 text-ink/90">
            {copy.generateSubtitle}
            <button type="button" aria-label={copy.moreInformation} className="inline-flex h-4 w-5 items-center justify-center rounded-full text-ink/75 focus:outline-none focus:ring-2 focus:ring-violet/30">
              <Info size={14} />
            </button>
          </p>
          <TargetSwitch checked={subtitleEnabled} onChange={setSubtitleEnabled} ariaLabel={copy.generateSubtitle} />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-4">
          <p className="flex items-center gap-2 text-sm font-normal leading-5 text-ink/90">
            {copy.speakerIdentification}
            <button type="button" aria-label={copy.moreInformation} className="inline-flex h-4 w-5 items-center justify-center rounded-full text-ink/75 focus:outline-none focus:ring-2 focus:ring-violet/30">
              <Info size={14} />
            </button>
          </p>
          <TargetSwitch checked={speakerLabels} onChange={setSpeakerLabels} ariaLabel={copy.speakerIdentification} />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_160px] items-center gap-4">
          <p className="flex items-center gap-2 text-sm font-normal leading-5 text-ink/90">
            {copy.aiSummary}
            <button type="button" aria-label={copy.moreInformation} className="inline-flex h-4 w-5 items-center justify-center rounded-full text-ink/75 focus:outline-none focus:ring-2 focus:ring-violet/30">
              <Info size={14} />
            </button>
          </p>
          <TargetSelectLike
            value={summaryTemplate}
            onChange={setSummaryTemplate}
            options={targetSummaryOptions}
            ariaLabel={copy.aiSummary}
            variant="summary"
            proValues={["meeting", "course_lecture", "interview", "podcast"]}
            className="sm:w-[160px]"
          />
        </div>
      </div>
    </div>
  );
}

function TranscriptionSettingsPanel({
  t,
  copy,
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
  compact,
  sourceLike = false
}: {
  t: (key: string) => string;
  copy: ReturnType<typeof getWorkspaceCopy>;
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
  sourceLike?: boolean;
}) {
  const languageSettingOptions = [["auto", t("auto")] as const, ...localeLanguageOptions];
  const localizedSummaryTemplateOptions = summaryTemplateOptionsFor(copy);

  if (sourceLike) {
    return (
      <section className="mt-10 text-left">
        <div className="grid gap-10">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px] md:items-center">
            <div className="flex gap-5">
              <Mic size={30} className="mt-1 shrink-0 text-violet" />
              <div>
                <p className="text-xl font-semibold text-ink">{copy.audioLanguage}</p>
                <p className="mt-2 text-base font-semibold leading-7 text-slate-500">{copy.audioLanguageHelp}</p>
              </div>
            </div>
            <TargetSelectLike value={language} onChange={setLanguage} options={languageSettingOptions} ariaLabel={copy.audioLanguage} className="sm:w-[280px]" triggerClassName="h-14 rounded-xl bg-slate-50 px-4 text-base font-semibold" />
          </div>

          <SettingSwitch icon={<FileAudio size={30} />} label={copy.generateSubtitle} checked={subtitleEnabled} onChange={setSubtitleEnabled} sourceLike />
          <SettingSwitch icon={<Globe2 size={30} />} label={copy.speakerIdentification} checked={speakerLabels} onChange={setSpeakerLabels} accent="amber" sourceLike />
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px] md:items-center">
            <div className="flex gap-5">
              <Sparkles size={30} className="mt-1 shrink-0 text-violet" />
              <p className="text-xl font-semibold text-ink">{copy.aiSummary}</p>
            </div>
            <TargetSelectLike value={summaryTemplate} onChange={setSummaryTemplate} options={localizedSummaryTemplateOptions} ariaLabel={copy.aiSummary} className="sm:w-[280px]" triggerClassName="h-14 rounded-xl bg-slate-50 px-4 text-base font-semibold" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={clsx("mt-5 rounded-xl border border-ink/10 bg-white p-4 md:p-5", compact && "bg-paper/35")}>
      <div className="grid gap-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_280px] md:items-start">
          <div className="flex gap-4">
            <Mic size={24} className="mt-1 shrink-0 text-violet" />
            <div>
              <p className="text-base font-black text-ink">{copy.audioLanguage}</p>
              <p className="mt-1 text-sm font-bold leading-6 text-ink/55">{copy.audioLanguageHelp}</p>
            </div>
          </div>
          <TargetSelectLike value={language} onChange={setLanguage} options={languageSettingOptions} ariaLabel={copy.audioLanguage} className="sm:w-[280px]" triggerClassName="h-12 rounded-md bg-paper/70 text-sm font-semibold" />
        </div>

        <SettingSwitch
          icon={<FileAudio size={24} />}
          label={copy.generateSubtitle}
          checked={subtitleEnabled}
          onChange={setSubtitleEnabled}
        />
        <SettingSwitch
          icon={<Globe2 size={24} />}
          label={copy.speakerIdentification}
          checked={speakerLabels}
          onChange={setSpeakerLabels}
          accent="amber"
        />
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_280px] md:items-center">
          <div className="flex gap-4">
            <Sparkles size={24} className="mt-1 shrink-0 text-violet" />
            <p className="text-base font-black text-ink">{copy.aiSummary}</p>
          </div>
          <TargetSelectLike value={summaryTemplate} onChange={setSummaryTemplate} options={localizedSummaryTemplateOptions} ariaLabel={copy.aiSummary} className="sm:w-[280px]" triggerClassName="h-12 rounded-md bg-paper/70 text-sm font-semibold" />
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_280px] md:items-center">
          <div className="flex gap-4">
            <Languages size={24} className="mt-1 shrink-0 text-violet" />
            <p className="text-base font-black text-ink">{copy.summaryLanguage}</p>
          </div>
          <TargetSelectLike value={summaryLanguage} onChange={setSummaryLanguage} options={summaryLanguageOptions} ariaLabel={copy.summaryLanguage} disabled={summaryTemplate === "none"} className="sm:w-[280px]" triggerClassName="h-12 rounded-md bg-paper/70 text-sm font-semibold" />
        </div>
        <SettingSwitch
          icon={<Sparkles size={24} />}
          label={copy.premiumTranscriptionModel}
          description={copy.premiumModelDescription}
          checked={premiumModel}
          onChange={setPremiumModel}
        />
      </div>
    </section>
  );
}

function SettingSwitch({
  icon,
  label,
  description,
  checked,
  onChange,
  accent = "violet",
  sourceLike = false
}: {
  icon: ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  accent?: "violet" | "amber";
  sourceLike?: boolean;
}) {
  if (sourceLike) {
    return (
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_44px] md:items-center">
        <span className="flex min-w-0 gap-5">
          <span className={clsx("mt-1 shrink-0", accent === "amber" ? "text-amber-500" : "text-violet")}>{icon}</span>
          <span>
            <span className="block text-xl font-semibold text-ink">{label}</span>
            {description ? <span className="mt-2 block text-base font-semibold leading-7 text-slate-500">{description}</span> : null}
          </span>
        </span>
        <TargetSwitch checked={checked} onChange={onChange} ariaLabel={label} />
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_44px] md:items-center">
      <span className="flex min-w-0 gap-4">
        <span className={clsx("mt-1 shrink-0", accent === "amber" ? "text-amber-500" : "text-violet")}>{icon}</span>
        <span>
          <span className="block text-base font-black text-ink">{label}</span>
          {description ? <span className="mt-1 block text-sm font-bold leading-6 text-ink/50">{description}</span> : null}
        </span>
      </span>
      <TargetSwitch checked={checked} onChange={onChange} ariaLabel={label} />
    </div>
  );
}

function RetranscribeDialog({
  task,
  t,
  copy,
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
  copy: ReturnType<typeof getWorkspaceCopy>;
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
  const retranscribeTarget = task.originalName || copy.taskWorkspace.retranscribe;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-8">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl border border-ink/10 bg-white p-5 shadow-lifted">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-ink">{copy.taskWorkspace.retranscribeSettingsTitle}</h2>
            <p className="mt-1 text-sm font-bold leading-6 text-ink/55">{copy.taskWorkspace.retranscribeSettingsDescription(retranscribeTarget)}</p>
          </div>
          <button type="button" onClick={onClose} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/55 hover:text-ink" aria-label={copy.close}>
            <X size={16} />
          </button>
        </div>
        <TranscriptionSettingsPanel
          t={t}
          copy={copy}
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
        <p className="mt-4 rounded-md border border-coral/20 bg-coral/10 px-3 py-2 text-xs font-bold leading-5 text-coral">{copy.taskWorkspace.retranscribeSettingsWarning}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-outline px-3 py-2">{copy.cancel}</button>
          <button type="button" onClick={onSubmit} disabled={busy} className="btn-primary px-3 py-2">
            {busy ? <Loader2 className="animate-spin" size={16} /> : <RotateCcw size={16} />}
            {copy.taskWorkspace.queueRetranscription}
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
  notice,
  error,
  clearError,
  inputRef,
  startTask,
  user,
  usageSnapshot,
  folders,
  selectedFolderId,
  setSelectedFolderId,
  taskList,
  createFolder,
  renameFolder,
  deleteFolder,
  assetView,
  setAssetView,
  assetSearch,
  setAssetSearch,
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
  notice: string | null;
  error: string | null;
  clearError: () => void;
  inputRef: RefObject<HTMLInputElement>;
  startTask: () => void;
  user: CurrentUser | null;
  usageSnapshot: UsageSnapshot | null;
  folders: FolderItem[];
  selectedFolderId: string | null;
  setSelectedFolderId: (value: string | null) => void;
  taskList: TaskListItem[];
  createFolder: (name: string) => Promise<void>;
  renameFolder: (folderId: string, name: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  assetView: AssetView;
  setAssetView: (value: AssetView) => void;
  assetSearch: string;
  setAssetSearch: (value: string) => void;
  importDriveFile: (fileId: string) => Promise<void>;
}) {
  const quota = usageSnapshot?.subscription.monthlyMinuteQuota ?? user?.subscriptions?.[0]?.monthlyMinuteQuota ?? 120;
  const remaining = Math.max(0, usageSnapshot?.subscription.remainingMinutes ?? user?.subscriptions?.[0]?.remainingMinutes ?? quota);
  const [linkDialogOpen, setLinkDialogOpen] = useState(mode === "youtube");
  const [driveDialogOpen, setDriveDialogOpen] = useState(mode === "drive");
  const [resolvingLink, setResolvingLink] = useState(false);
  const [linkResolveError, setLinkResolveError] = useState<string | null>(null);
  const [driveConnection, setDriveConnection] = useState<DriveConnectionState | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [driveSearch, setDriveSearch] = useState("");
  const [driveBusy, setDriveBusy] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [plansOpen, setPlansOpen] = useState(false);
  const [plansInitialMode, setPlansInitialMode] = useState<DashboardPricingMode>("annual");
  const [upgradePromptOpen, setUpgradePromptOpen] = useState(false);
  const handledInitialModeRef = useRef<InputMode | null>(null);
  const fileCount = files.length;
  const fileLabel = fileCount > 1 ? copy.filesSelected(fileCount, maxBatchFiles) : files[0]?.name;
  const canStartResolvedLink = Boolean(resolvedMedia && (mode === "youtube" || mode === "drive"));

  function openUploadPlans(nextMode: DashboardPricingMode = "annual") {
    setPlansInitialMode(nextMode);
    setPlansOpen(true);
  }

  const resolveMediaLink = useCallback(async () => {
    const link = youtubeUrl.trim();
    if (!link) {
      setResolvedMedia(null);
      setLinkResolveError(null);
      return;
    }

    setResolvingLink(true);
    setLinkResolveError(null);
    clearError();
    setResolvedMedia(null);
    try {
      const data = await fetch("/api/media/resolve", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({url: link})
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.resolveLinkError);
        return body as ResolvedMedia;
      });
      setResolvedMedia(data);
      if (data.provider === "google_drive") {
        setMode("drive");
        setDriveUrl(data.sourceUrl || link);
        setLinkDialogOpen(false);
        setDriveDialogOpen(true);
      } else {
        setMode("youtube");
      }
    } catch (cause) {
      setLinkResolveError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setResolvingLink(false);
    }
  }, [clearError, copy.resolveLinkError, setDriveUrl, setMode, setResolvedMedia, youtubeUrl]);

  const refreshDriveConnection = useCallback(async () => {
    const data = await fetch("/api/google-drive/connection", {cache: "no-store"}).then((response) => response.json());
    setDriveConnection(data as DriveConnectionState);
    return data as DriveConnectionState;
  }, []);

  const startDriveAuthorization = useCallback(async () => {
    setDriveBusy(true);
    setDriveError(null);
    try {
      const response = await fetch(`/api/google-drive/auth?locale=${encodeURIComponent(locale)}`, {
        redirect: "manual"
      });
      if (response.type === "opaqueredirect" || response.status === 0) {
        window.location.href = `/api/google-drive/auth?locale=${encodeURIComponent(locale)}`;
        return true;
      }
      const location = response.headers.get("Location");
      if (response.status >= 300 && response.status < 400 && location) {
        window.location.href = location;
        return true;
      }
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? copy.unableStartDriveAuthorization);
      if (body.url) {
        window.location.href = body.url;
        return true;
      }
      window.location.href = `/api/google-drive/auth?locale=${encodeURIComponent(locale)}`;
      return true;
    } catch (cause) {
      setDriveError(cause instanceof Error ? cause.message : copy.unableStartDriveAuthorization);
      return false;
    } finally {
      setDriveBusy(false);
    }
  }, [copy.unableStartDriveAuthorization, locale]);

  const openDriveFlow = useCallback(() => {
    setMode("drive");
    setDriveError(null);
    refreshDriveConnection()
      .then((connection) => {
        if (connection.connected) {
          setDriveDialogOpen(true);
          return;
        }
        startDriveAuthorization()
          .then((started) => {
            if (!started) setDriveDialogOpen(true);
          })
          .catch(() => setDriveDialogOpen(true));
      })
      .catch((cause) => {
        setDriveDialogOpen(true);
        setDriveError(cause instanceof Error ? cause.message : copy.unableCheckDriveConnection);
      });
  }, [copy.unableCheckDriveConnection, refreshDriveConnection, setMode, startDriveAuthorization]);

  useEffect(() => {
    if (handledInitialModeRef.current === mode) return;
    handledInitialModeRef.current = mode;
    if (mode === "youtube" && !linkDialogOpen) setLinkDialogOpen(true);
    if (mode === "drive" && !driveDialogOpen && !resolvedMedia && !driveUrl.trim()) openDriveFlow();
  }, [driveDialogOpen, driveUrl, linkDialogOpen, mode, openDriveFlow, resolvedMedia]);

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
        if (!response.ok) throw new Error(body.error ?? copy.readTasksError);
        return body as {files: DriveFileItem[]};
      });
      setDriveFiles(data.files);
    } catch (cause) {
      setDriveError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setDriveBusy(false);
    }
  }, [copy.loadingDriveFiles, driveSearch, refreshDriveConnection]);

  async function disconnectDrive() {
    setDriveBusy(true);
    setDriveError(null);
    try {
      await fetch("/api/google-drive/connection", {method: "DELETE"}).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.readTasksError);
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
    <section className="flex h-screen overflow-hidden bg-white">
      <div className="hidden h-screen w-[300px] shrink-0 overflow-hidden md:block">
        <WorkspaceSidebar
          t={t}
          copy={copy}
          locale={locale}
          tasks={taskList}
          user={user}
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
          onSelectTask={() => undefined}
          onOpenUpgradePrompt={() => setUpgradePromptOpen(true)}
        />
      </div>

      <main className="min-w-0 flex-1 overflow-y-auto px-4 py-3 md:p-8">
        <div className="w-full px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] md:px-0">
          <div className="mx-auto max-w-4xl">
            <div className="space-y-4 md:space-y-6">
              <div className="flex min-h-14 flex-wrap items-center justify-between gap-3">
                <div>
                  <nav aria-label={t("workspace")} className="flex w-fit min-w-0 items-center gap-3 text-sm font-normal leading-5">
                    <button type="button" onClick={() => { window.location.href = `/${locale}/dashboard`; }} className="inline-flex items-center gap-1 text-primary transition-colors hover:text-primary/80">
                      <Home size={16} />
                      <span className="max-w-[42vw] truncate font-medium underline underline-offset-4 md:max-w-[320px]">{copy.goToDashboard}</span>
                    </button>
                    <span className="text-slate-500/70">/</span>
                    <span className="truncate text-[rgba(2,8,23,0.8)]">{t("uploadFiles")}</span>
                  </nav>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative z-40 w-44 md:hidden">
                    <WorkspaceLanguageSwitcher locale={locale} copy={copy} placement="below" />
                  </div>
                  <button
                    type="button"
                    onClick={() => undefined}
                    className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full border border-violet/20 bg-violet text-white shadow-soft transition hover:bg-violet/90"
                    aria-label={copy.recentFiles}
                    aria-expanded="false"
                  >
                    <Clock size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <section>
                  <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      setMode("upload");
                      selectFiles(event.dataTransfer.files);
                    }}
                    className="flex min-h-[320px] flex-col items-center justify-center rounded-[16px] border-2 border-dashed border-violet/40 p-6 transition-colors duration-200"
                  >
                    <div className="flex w-full max-w-sm flex-col items-center">
                      <div className="mb-6 flex w-full cursor-pointer flex-col items-center rounded-[16px] border border-violet/5 bg-slate-100/50 p-6 text-center transition-colors hover:bg-slate-100">
                        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet/10 text-violet">
                          <UploadCloud size={24} />
                        </span>
                        <p className="text-sm font-medium text-slate-500">{fileLabel ?? copy.dragFilesHere}</p>
                      </div>
                      <div className="mb-6 flex h-4 w-full items-center text-slate-400">
                        <span className="h-px flex-1 bg-slate-200" />
                        <span className="px-4 text-xs font-medium uppercase tracking-wider leading-4">{copy.or}</span>
                        <span className="h-px flex-1 bg-slate-200" />
                      </div>
                      <div className="w-full space-y-2">
                        <button type="button" onClick={() => { setMode("upload"); inputRef.current?.click(); }} className="group flex h-16 w-full items-center rounded-[12px] p-3 text-left text-base font-normal text-slate-950 transition-colors hover:bg-paper disabled:cursor-wait disabled:opacity-80">
                          <span className="mr-4 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet/10 text-violet transition-colors group-hover:bg-violet/15">
                            <UploadCloud size={18} />
                          </span>
                          <span className="flex-1 text-left text-sm font-medium">{copy.uploadAFile}</span>
                          <ChevronRight className="h-4 w-4 text-ink/40 transition-colors group-hover:text-ink/55" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMode("youtube");
                            setLanguage("en");
                            setSubtitleEnabled(false);
                            setSpeakerLabels(false);
                            setSummaryTemplate("none");
                            setLinkDialogOpen(true);
                          }}
                          className="group flex h-16 w-full items-center rounded-[12px] p-3 text-left text-base font-normal text-slate-950 transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span className="mr-4 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500 transition-colors group-hover:bg-emerald-500/20">
                            <Link2 size={18} />
                          </span>
                          <span className="flex-1 text-left text-sm font-medium">{t("pasteLink")}</span>
                          <ChevronRight className="h-4 w-4 text-ink/40 transition-colors group-hover:text-ink/55" />
                        </button>
                        <button type="button" onClick={openDriveFlow} className="group hidden h-16 w-full items-center rounded-[12px] p-3 text-left text-base font-normal text-slate-950 transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60 md:flex">
                          <span className="mr-4 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-blue-500 transition-colors group-hover:bg-blue-500/20">
                            <HardDrive size={18} />
                          </span>
                          <span className="flex-1 text-left text-sm font-medium">{copy.googleDrive}</span>
                          <ChevronRight className="h-4 w-4 text-ink/40 transition-colors group-hover:text-ink/55" />
                        </button>
                      </div>
                    </div>
                    <input ref={inputRef} type="file" multiple className="hidden" accept=".3gp,.aac,.amr,.awb,.flac,.m4a,.mka,.mkv,.mov,.mp2,.mp3,.mp4,.mpg,.oga,.ogg,.opus,.ts,.wav,.weba,.webm,.wma,.wmv" onChange={(event) => selectFiles(event.target.files)} />
                    {fileCount ? (
                      <div className="mt-5 w-full max-w-xl rounded-lg border border-ink/10 bg-white text-left">
                        <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-3 py-2 text-xs font-black uppercase text-ink/45">
                          <span>{copy.filesSelected(fileCount, maxBatchFiles)}</span>
                          <button type="button" onClick={() => selectFiles(null)} className="text-violet transition hover:text-ink">{copy.clear}</button>
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
                        {copy.startUpload(fileCount)}
                      </button>
                    ) : null}
                    {notice ? <p className="mt-4 animate-fade-in rounded-md border border-violet/30 bg-violet/10 px-3 py-2 text-sm text-violet">{notice}</p> : null}
                    {error ? <p className="mt-4 animate-fade-in rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p> : null}
                  </div>
                </section>

                {fileCount ? (
                  <TranscriptionSettingsPanel
                    t={t}
                    copy={copy}
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
                ) : null}

                <details className="mt-6 md:hidden">
                  <summary className="flex h-14 cursor-pointer list-none items-center justify-between border-b border-slate-200 px-2 py-4 text-base font-medium leading-6 text-[rgb(2,8,23)] transition-all hover:underline [&::-webkit-details-marker]:hidden [&[data-state=open]>svg]:rotate-180">
                    {copy.supportedFormatsLimits}
                    <ChevronDown size={16} className="text-ink/45" />
                  </summary>
                  <div className="mt-4 grid gap-3">
                    {[
                      [copy.audioFormats, "aac, amr, awb, flac, m4a, mka, mp2, mp3, oga, ogg, opus, wav, weba, webm, wma"],
                      [copy.videoFormats, "3gp, mkv, mov, mp4, mpg, ts, webm, wmv"],
                      [copy.maximumFiles, copy.maximumFilesValue],
                      [copy.maximumFileSize, copy.maximumFileSizeValue]
                    ].map(([label, value]) => (
                      <article key={label} className="rounded-lg bg-paper/65 p-4 ring-1 ring-ink/5">
                        <h2 className="text-sm font-black text-ink">{label}</h2>
                        <p className="mt-2 text-sm leading-6 text-ink/60">{value}</p>
                      </article>
                    ))}
                  </div>
                </details>

                <section className="mt-6 hidden rounded-lg border-0 bg-white p-6 shadow-sm md:block">
                  <h2 className="mb-4 flex items-center gap-2 text-base font-medium text-ink">
                    <FileAudio size={18} className="text-violet" />
                    {copy.supportedFormatsLimits}
                  </h2>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    {[
                      [copy.audioFormats, "aac, amr, awb, flac, m4a, mka, mp2, mp3, oga, ogg, opus, wav, weba, webm, wma"],
                      [copy.videoFormats, "3gp, mkv, mov, mp4, mpg, ts, webm, wmv"]
                    ].map(([label, value]) => (
                      <article key={label}>
                        <h2 className="font-medium text-ink">{label}</h2>
                        <p className="mt-2 leading-6 text-slate-500">{value}</p>
                      </article>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 pt-4 text-sm text-slate-500">
                    <span>{copy.maximumFilesValue}</span>
                    <span>{copy.maximumFileSizeValue}</span>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
      {linkDialogOpen ? (
        <div className="fixed inset-0 z-40 bg-black/40">
          <section role="dialog" aria-modal="true" aria-labelledby="media-link-title" className={clsx("fixed left-1/2 top-1/2 max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-0 sm:max-w-[560px]", !resolvedMedia && "grid gap-3")}>
            <button type="button" onClick={() => setLinkDialogOpen(false)} className="focus-ring absolute right-4 top-4 inline-flex h-4 w-4 items-center justify-center rounded-sm text-ink/70 transition hover:text-ink" aria-label={copy.close}>
              <X size={16} />
              <span className="sr-only">{copy.close}</span>
            </button>
            <div className="px-5 pb-3 pt-5">
              <h2 id="media-link-title" className="text-xl font-semibold text-ink">{t("mediaLinkTranscription")}</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">{copy.pastePrompt}</p>
            </div>
            {!resolvedMedia ? (
              <div className="px-5 pb-5">
                <div className="space-y-3">
                  <div className="rounded-none border-0 border-transparent bg-transparent px-3 py-2.5 sm:rounded-[12px] sm:border sm:border-slate-200/60 sm:bg-slate-100/25">
                    <p className="inline-flex items-center gap-1.5 text-xs font-normal leading-4 text-slate-500/90">
                      <Link2 size={16} />
                      {copy.supportedPlatformsLabel}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {mediaLinkPlatformItems.map(([item, icon]) => (
                        <span key={item} className="inline-flex h-[30px] items-center gap-2 rounded-full border border-violet/20 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-950/90 shadow-soft">
                          {icon}
                          {item === "Many other links" ? copy.manyOtherLinks : item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={youtubeUrl}
                      onChange={(event) => {
                        setYoutubeUrl(event.target.value);
                        setResolvedMedia(null);
                        setLinkResolveError(null);
                        clearError();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          resolveMediaLink().catch(() => undefined);
                        }
                      }}
                      className="field media-link-input min-w-0 flex-1 border-violet/60 px-3 py-2 focus-visible:ring-violet/20 focus-visible:ring-offset-0"
                      placeholder={copy.mediaLinkPlaceholder}
                      aria-label={copy.linkInput}
                      autoFocus
                    />
                    <button type="button" onClick={() => resolveMediaLink().catch(() => undefined)} disabled={resolvingLink || !youtubeUrl.trim()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-violet/60 bg-white px-6 py-2 text-sm font-medium text-violet transition-colors hover:bg-violet/5 disabled:opacity-45" aria-label={copy.checkLink}>
                      {resolvingLink ? <Loader2 className="animate-spin" size={16} /> : null}
                      {copy.search}
                    </button>
                  </div>
                  {resolvingLink ? (
                    <p className="flex items-center gap-2 text-sm font-bold text-violet">
                      <Loader2 className="animate-spin" size={16} />
                      {copy.checkingLink}
                    </p>
                  ) : null}
                  {linkResolveError ? <p role="alert" className="animate-fade-in text-sm font-medium leading-5 text-red-500">{linkResolveError}</p> : null}
                  <div className="border-t border-slate-200/50 pt-2">
                    <div className="mt-4 flex h-fit flex-row items-center justify-center text-sm">
                      <div className="font-normal text-ink/60">{copy.availableMinutes}</div>
                      <div className="mx-2 font-medium text-violet">{remaining}</div>
                      <button type="button" onClick={() => openUploadPlans("annual")} className="inline-flex h-auto items-center justify-center gap-2 whitespace-nowrap border-b border-violet/30 p-0 text-sm font-medium text-violet transition-colors hover:border-violet hover:text-violet">{copy.buyMoreMinutes}</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <MediaLinkSourceBox sourceUrl={resolvedMedia.sourceUrl} changeLabel={copy.changeLink} onChange={() => { setResolvedMedia(null); setLinkResolveError(null); }} />
            )}
            {resolvedMedia && mode === "youtube" ? (
              <MediaLinkResolvedSettings
                copy={copy}
                media={resolvedMedia}
                language={language}
                setLanguage={setLanguage}
                speakerLabels={speakerLabels}
                setSpeakerLabels={setSpeakerLabels}
                subtitleEnabled={subtitleEnabled}
                setSubtitleEnabled={setSubtitleEnabled}
                summaryTemplate={summaryTemplate}
                setSummaryTemplate={setSummaryTemplate}
              />
            ) : null}
            {resolvedMedia ? (
              <button type="button" onClick={startTask} disabled={busy || resolvingLink || !canStartResolvedLink || mode !== "youtube"} className="btn-primary mx-5 mt-5 w-[calc(100%-2.5rem)] py-3 disabled:opacity-45">
                {busy ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {copy.transcribe}
              </button>
            ) : null}
            {resolvedMedia && error ? <MediaLinkErrorAlert message={error} upgradeLabel={copy.upgradePlan} onUpgrade={() => openUploadPlans("annual")} /> : null}
            {resolvedMedia?.provider === "youtube" ? (
              <p className="mx-5 mt-3 text-center">
                <a href={`/${locale}/tools/youtube-video-downloader?url=${encodeURIComponent(resolvedMedia.sourceUrl)}`} className="text-sm font-medium text-violet transition hover:text-violet/90">
                  {copy.downloadVideo}
                </a>
              </p>
            ) : null}
            {resolvedMedia ? <div className="mx-5 mt-4 flex items-center justify-center gap-2 border-t border-ink/10 pt-3 text-sm">
              <p>
                <span className="font-normal text-ink/60">{copy.availableMinutes}</span>{" "}
                <span className="font-black text-violet">{remaining}</span>
              </p>
              <button type="button" onClick={() => openUploadPlans("annual")} className="border-b border-violet/30 p-0 text-sm font-medium text-violet transition hover:border-violet hover:text-violet">{copy.buyMoreMinutes}</button>
            </div> : null}
            {resolvedMedia ? <div className="h-5" /> : null}
          </section>
        </div>
      ) : null}
      {upgradePromptOpen ? <DashboardUpgradePrompt copy={copy} onClose={() => setUpgradePromptOpen(false)} onShowPlans={openUploadPlans} /> : null}
      {plansOpen ? <DashboardPricingOverlay locale={locale} initialMode={plansInitialMode} onClose={() => setPlansOpen(false)} /> : null}
      {driveDialogOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 px-4 py-6">
          <section role="dialog" aria-modal="true" aria-labelledby="google-drive-import-title" className="relative max-h-[92vh] w-full max-w-[640px] overflow-auto rounded-lg border border-slate-200 bg-white p-6 text-[rgb(2,8,23)] shadow-none">
            <button type="button" onClick={() => setDriveDialogOpen(false)} className="focus-ring absolute right-4 top-4 inline-flex h-4 w-4 items-center justify-center rounded-sm text-[rgb(2,8,23)] opacity-70 transition hover:opacity-100" aria-label={copy.close}>
              <X size={16} />
            </button>
            <div className="flex items-start justify-between gap-4 pr-8">
              <div>
                <h2 id="google-drive-import-title" className="text-xl font-semibold leading-7 text-[rgb(2,8,23)]">{copy.googleDriveImport}</h2>
                <p className="mt-1.5 text-sm font-normal leading-5 text-slate-500">{copy.googleDriveDescription}</p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium leading-5 text-[rgb(2,8,23)]">{driveConnection?.connected ? copy.googleDriveConnected : copy.connectYourGoogleDrive}</p>
                  <p className="mt-1 text-xs font-normal leading-4 text-slate-500">{driveConnection?.connection?.email || copy.driveAccessDescription}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {driveConnection?.connected ? (
                    <>
                      <button type="button" onClick={() => loadDriveFiles().catch(() => undefined)} disabled={driveBusy} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium leading-5 text-[rgb(2,8,23)] transition-colors hover:bg-slate-50 disabled:opacity-45">
                        {driveBusy ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                        {copy.refresh}
                      </button>
                      <button type="button" onClick={disconnectDrive} disabled={driveBusy} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-coral/25 bg-white px-3 py-2 text-sm font-medium leading-5 text-coral transition-colors hover:bg-red-50 disabled:opacity-45">
                        {copy.disconnect}
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={startDriveAuthorization} disabled={driveBusy} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-violet px-3 py-2 text-sm font-medium leading-5 text-white transition hover:bg-violet/90 disabled:opacity-45">
                      <HardDrive size={16} />
                      {driveBusy ? copy.connecting : copy.connectDrive}
                    </button>
                  )}
                </div>
              </div>
              {driveConnection?.connected ? (
                <div className="mt-4">
                  <label className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 transition focus-within:border-violet">
                    <Search size={16} className="text-slate-500" />
                    <input
                      value={driveSearch}
                      onChange={(event) => setDriveSearch(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") loadDriveFiles(driveSearch).catch(() => undefined);
                      }}
                      className="w-full bg-transparent text-sm font-normal leading-5 outline-none"
                      placeholder={copy.searchDrivePlaceholder}
                    />
                    <button type="button" onClick={() => loadDriveFiles(driveSearch).catch(() => undefined)} className="text-xs font-medium uppercase text-violet">{copy.search}</button>
                  </label>
                  <div className="mt-3 grid max-h-60 gap-2 overflow-auto pr-1">
                    {driveFiles.length ? driveFiles.map((file) => (
                      <article key={file.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium leading-5 text-[rgb(2,8,23)]">{file.name}</p>
                          <p className="mt-1 text-xs font-normal leading-4 text-slate-500">
                            {file.mimeType || copy.media}
                            {file.sizeBytes ? ` · ${Math.max(1, Math.ceil(file.sizeBytes / 1024 / 1024))} MB` : ""}
                            {file.durationSeconds ? ` · ${formatDuration(file.durationSeconds)}` : ""}
                          </p>
                        </div>
                        <button type="button" onClick={() => importDriveFile(file.id)} disabled={busy || driveBusy} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-violet px-3 py-2 text-sm font-medium leading-5 text-white transition hover:bg-violet/90 disabled:opacity-45">
                          {busy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                          {copy.importFile}
                        </button>
                      </article>
                    )) : (
                      <p className="rounded-lg border border-slate-200 bg-white px-3 py-4 text-center text-sm font-normal leading-5 text-slate-500">
                        {driveBusy ? copy.loadingDriveFiles : copy.noDriveFilesFound}
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
              {driveError ? <p className="mt-3 rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">{driveError}</p> : null}
            </div>

            {driveConnection?.connected ? (
              <>
                <label className="mt-5 block">
                  <span className="sr-only">{copy.googleDriveLink}</span>
                  <input value={driveUrl} onChange={(event) => setDriveUrl(event.target.value)} className="field h-10 border-slate-200 text-sm font-normal" placeholder={copy.pastePublicDriveLink} autoFocus />
                </label>
                <p className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-xs font-normal leading-5 text-slate-500">{copy.publicDriveImportHint}</p>
                {resolvedMedia && mode === "drive" ? (
                  <MediaLinkPreview media={resolvedMedia} />
                ) : null}
                <button type="button" onClick={startTask} disabled={busy || !driveUrl} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-violet px-4 py-3 text-sm font-medium leading-5 text-white transition hover:bg-violet/90 disabled:opacity-45">
                  {busy ? <Loader2 className="animate-spin" size={18} /> : <HardDrive size={18} />}
                  {copy.importFromGoogleDrive}
                </button>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-medium text-slate-500">{copy.availableMinutes}</span>
                  <span className="font-semibold text-[rgb(2,8,23)]">{remaining}</span>
                </div>
              </>
            ) : null}
          </section>
        </div>
      ) : null}
    </section>
  );
}

function MediaLinkSourceBox({sourceUrl, changeLabel, onChange}: {sourceUrl: string; changeLabel: string; onChange: () => void}) {
  return (
    <div className="mx-5 mt-5 rounded-[14px] border border-slate-200 bg-white px-4 py-3.5">
      <p className="flex items-start gap-3 break-all text-sm font-normal leading-5 text-slate-600">
        <Link2 size={16} className="mt-0.5 shrink-0 text-slate-500" />
        {sourceUrl}
      </p>
      <button type="button" onClick={onChange} className="mt-3 rounded-lg bg-violet/10 px-3 py-2 text-sm font-semibold leading-5 text-violet transition hover:bg-violet/15">
        {changeLabel}
      </button>
    </div>
  );
}

function MediaLinkPreview({media, variant = "card"}: {media: ResolvedMedia; variant?: "card" | "source" | "target-dialog"}) {
  const sizeLabel = media.contentLength ? `${Math.max(1, Math.ceil(media.contentLength / 1024 / 1024))} MB` : null;

  if (variant === "source") {
    return (
      <article className="text-center">
        <h3 className="mx-auto max-w-3xl break-words text-2xl font-black leading-tight text-ink">{media.title}</h3>
        {media.durationSeconds ? (
          <p className="mt-4 flex items-center justify-center gap-2 text-xl font-semibold text-slate-500">
            <Clock size={22} />
            {formatDuration(media.durationSeconds)}
          </p>
        ) : null}
        {media.thumbnailUrl ? (
          <div className="mx-auto mt-8 w-full max-w-[560px] overflow-hidden rounded-lg bg-ink/5">
            {/* 外部媒体缩略图可能来自 YouTube、Drive 或其它公开源，不适合纳入固定 next/image 域名白名单。 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media.thumbnailUrl} alt="" className="aspect-video w-full object-cover" />
          </div>
        ) : null}
        <p className="mx-auto mt-4 max-w-3xl break-all text-sm font-semibold leading-6 text-slate-400">{media.sourceUrl}</p>
        {sizeLabel ? <p className="mt-2 text-sm font-bold text-slate-400">{sizeLabel}</p> : null}
        {media.warnings.length ? (
          <div className="mx-auto mt-4 grid max-w-3xl gap-2">
            {media.warnings.map((warning) => (
              <p key={warning} className="rounded-md border border-violet/15 bg-violet/5 px-3 py-2 text-sm font-bold leading-5 text-ink/55">{warning}</p>
            ))}
          </div>
        ) : null}
      </article>
    );
  }

  if (variant === "target-dialog") {
    return (
      <article className="mt-4 flex gap-4">
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 shadow-sm sm:w-[164px]">
          {media.thumbnailUrl ? (
            <>
              {/* 外部媒体缩略图可能来自 YouTube、Drive 或其它公开源，不适合纳入固定 next/image 域名白名单。 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={media.thumbnailUrl} alt={media.title} className="h-full w-full object-cover" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-violet">
              <PlayCircle size={28} />
            </div>
          )}
          {media.durationSeconds ? (
            <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium leading-4 text-white">
              {formatDuration(media.durationSeconds)}
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <h3 className="line-clamp-2 break-all text-[15px] font-semibold leading-[21px] text-ink">{media.title}</h3>
          <p className="mt-2 text-sm font-medium leading-5 text-violet">{media.providerLabel}</p>
          <p className="mt-1.5 line-clamp-2 break-all text-sm leading-5 text-slate-500">{media.sourceUrl}</p>
          {media.warnings.length ? (
            <div className="mt-3 grid gap-2">
              {media.warnings.map((warning) => (
                <p key={warning} className="rounded-md border border-violet/15 bg-violet/5 px-3 py-2 text-xs font-bold leading-5 text-ink/55">{warning}</p>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    );
  }

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
  bulkMode,
  loading,
  busy,
  onSelectTask,
  moveTask,
  renameTask,
  deleteTask,
  createShareLinkForTask,
  disableShareLinkForTask
}: {
  tasks: TaskListItem[];
  folders: FolderItem[];
  copy: ReturnType<typeof getWorkspaceCopy>;
  locale: string;
  t: (key: string) => string;
  activeTaskId?: string;
  selectedTaskIds: string[];
  setSelectedTaskIds: (value: string[] | ((current: string[]) => string[])) => void;
  bulkMode: boolean;
  loading: boolean;
  busy: boolean;
  onSelectTask: (taskId: string) => void;
  moveTask: (taskId: string, folderId: string | null) => Promise<void>;
  renameTask: (taskId: string, originalName: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  createShareLinkForTask: (taskId: string, title: string) => Promise<string | null>;
  disableShareLinkForTask: (taskId: string) => Promise<void>;
}) {
  const [openMenuTaskId, setOpenMenuTaskId] = useState<string | null>(null);
  const [renamingTask, setRenamingTask] = useState<TaskListItem | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [movingTask, setMovingTask] = useState<TaskListItem | null>(null);
  const [moveTargetFolderId, setMoveTargetFolderId] = useState<string | null | undefined>(undefined);
  const [exportingTask, setExportingTask] = useState<TaskListItem | null>(null);
  const [sharingTask, setSharingTask] = useState<TaskListItem | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskListItem | null>(null);
  const [taskShareUrl, setTaskShareUrl] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<(typeof dashboardExportFormats)[number]>("txt");
  const [exportShowSpeaker, setExportShowSpeaker] = useState(false);
  const [exportShowTimestamp, setExportShowTimestamp] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState<(typeof dashboardPageSizes)[number]>(10);
  const [rowsPerPageMenuOpen, setRowsPerPageMenuOpen] = useState(false);
  const visibleTasks = useMemo(() => tasks.slice(0, rowsPerPage), [rowsPerPage, tasks]);
  const allVisibleSelected = visibleTasks.length > 0 && visibleTasks.every((item) => selectedTaskIds.includes(item.id));

  const selectedFolderName = movingTask?.folder?.name ?? t("uncategorized");
  const moveChoices = useMemo(() => {
    const choices: Array<{id: string | null; name: string}> = [{id: null, name: t("uncategorized")}, ...folders.map((folder) => ({id: folder.id, name: folder.name}))];
    return choices.filter((choice) => (choice.id ?? null) !== (movingTask?.folderId ?? null));
  }, [folders, movingTask?.folderId, t]);

  useEffect(() => {
    if (!renamingTask && !movingTask && !exportingTask && !sharingTask && !deletingTask) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setRenamingTask(null);
      setMovingTask(null);
      setExportingTask(null);
      setSharingTask(null);
      setDeletingTask(null);
      setTaskShareUrl(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [renamingTask, movingTask, exportingTask, sharingTask, deletingTask]);

  useEffect(() => {
    if (bulkMode) setOpenMenuTaskId(null);
  }, [bulkMode]);

  useEffect(() => {
    if (!rowsPerPageMenuOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setRowsPerPageMenuOpen(false);
    }
    function handlePointerDown(event: PointerEvent) {
      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest("[data-dashboard-page-size]")) setRowsPerPageMenuOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [rowsPerPageMenuOpen]);

  useEffect(() => {
    setSelectedTaskIds((current) => current.filter((id) => visibleTasks.some((task) => task.id === id)));
  }, [setSelectedTaskIds, visibleTasks]);

  function toggleTask(taskId: string) {
    setSelectedTaskIds((current) => (current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId]));
  }

  function toggleAllVisible() {
    setSelectedTaskIds((current) => {
      if (allVisibleSelected) return current.filter((id) => !visibleTasks.some((task) => task.id === id));
      return Array.from(new Set([...current, ...visibleTasks.map((task) => task.id)]));
    });
  }

  function openRenameDialog(item: TaskListItem) {
    setOpenMenuTaskId(null);
    setRenamingTask(item);
    setRenameDraft(taskDisplayName(item, copy));
  }

  function openMoveDialog(item: TaskListItem) {
    setOpenMenuTaskId(null);
    setMovingTask(item);
    setMoveTargetFolderId(undefined);
  }

  function openExportDialog(item: TaskListItem) {
    setOpenMenuTaskId(null);
    setExportingTask(item);
    setExportFormat("txt");
    setExportShowSpeaker(false);
    setExportShowTimestamp(false);
  }

  function openShareDialog(item: TaskListItem) {
    setOpenMenuTaskId(null);
    setSharingTask(item);
    setTaskShareUrl(null);
  }

  function openDeleteDialog(item: TaskListItem) {
    setOpenMenuTaskId(null);
    setDeletingTask(item);
  }

  function exportUrl(item: TaskListItem) {
    const params = new URLSearchParams({
      showSpeaker: String(exportShowSpeaker),
      showTimestamp: String(exportShowTimestamp)
    });
    return `/api/tasks/${item.id}/exports/${exportFormat}?${params.toString()}`;
  }

  const renameOriginalName = renamingTask ? taskDisplayName(renamingTask, copy) : "";
  const normalizedRenameDraft = renameDraft.trim();
  const renameSubmitDisabled = busy || !normalizedRenameDraft || normalizedRenameDraft === renameOriginalName;

  if (loading) {
    return <DashboardTableLoading copy={copy} t={t} />;
  }

  if (!tasks.length) {
    return <DashboardEmptyState copy={copy} />;
  }

  return (
    <div className="mt-4 overflow-visible bg-white max-md:overflow-x-auto">
      <div className="min-w-[720px]">
      <div className={clsx("grid h-[52px] grid-cols-12 items-center gap-4 bg-slate-100/50 px-6 py-4 text-sm font-medium text-ink", bulkMode && "[&>*:nth-child(2)]:col-span-4 [&>*:nth-child(3)]:col-span-1 [&>*:nth-child(4)]:col-span-2 [&>*:nth-child(5)]:col-span-1 [&>*:nth-child(6)]:col-span-2 [&>*:nth-child(7)]:col-span-1", !bulkMode && "[&>*:nth-child(1)]:col-span-5 [&>*:nth-child(2)]:col-span-1 [&>*:nth-child(3)]:col-span-2 [&>*:nth-child(4)]:col-span-1 [&>*:nth-child(5)]:col-span-2 [&>*:nth-child(6)]:col-span-1")}>
        {bulkMode ? (
          <span className="flex items-center">
            <BulkSelectionCheckbox checked={allVisibleSelected} onChange={toggleAllVisible} label={copy.dashboardTable.selectAllVisible} />
          </span>
        ) : null}
        <span>{t("name")}</span>
        <span>{t("duration")}</span>
        <span>{t("created")}</span>
        <span>{t("type")}</span>
        <span>{t("folder")}</span>
        <span />
      </div>
      <div className="overflow-visible">
        {visibleTasks.length ? (
          visibleTasks.map((item) => (
            <div
              key={item.id}
              className={clsx(
                "relative grid min-h-[68px] w-full grid-cols-12 items-center gap-4 px-6 py-4 text-left text-sm leading-5 transition hover:bg-slate-100/30",
                bulkMode && "[&>*:nth-child(2)]:col-span-4 [&>*:nth-child(3)]:col-span-1 [&>*:nth-child(4)]:col-span-2 [&>*:nth-child(5)]:col-span-1 [&>*:nth-child(6)]:col-span-2 [&>*:nth-child(7)]:col-span-1",
                !bulkMode && "[&>*:nth-child(1)]:col-span-5 [&>*:nth-child(2)]:col-span-1 [&>*:nth-child(3)]:col-span-2 [&>*:nth-child(4)]:col-span-1 [&>*:nth-child(5)]:col-span-2 [&>*:nth-child(6)]:col-span-1",
                activeTaskId === item.id && "bg-violet/10",
                openMenuTaskId === item.id && "z-[60]"
              )}
            >
              {bulkMode ? (
              <span className="flex items-center" onClick={(event) => event.stopPropagation()}>
                <BulkSelectionCheckbox checked={selectedTaskIds.includes(item.id)} onChange={() => toggleTask(item.id)} label={copy.dashboardTable.selectTask(taskDisplayName(item, copy))} />
              </span>
              ) : null}
              <div className="flex min-w-0 items-center gap-2 whitespace-nowrap">
                <span className="grid h-4 w-4 shrink-0 place-items-center">
                  <CheckCircle2 size={16} className="h-4 w-4 text-primary" />
                </span>
                <div className="min-w-0 flex-1 truncate">
                  <a href={`/${locale}/transcriptions/${item.id}`} onClick={() => onSelectTask(item.id)} className="block truncate font-medium text-[rgb(2,8,23)] transition hover:text-primary">
                    {taskDisplayName(item, copy)}
                  </a>
                </div>
              </div>
              <span className="whitespace-nowrap text-slate-500">{item.durationSeconds ? formatDuration(item.durationSeconds) : "--"}</span>
              <span className="whitespace-nowrap text-slate-500">{formatDateTime(item.createdAt, copy)}</span>
              <span>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100/50 text-xs font-medium leading-4 text-slate-500">S</span>
              </span>
              <span className="truncate whitespace-nowrap text-slate-500">{item.folder?.name ?? t("uncategorized")}</span>
              <span className="flex justify-start">
                <span className="relative inline-flex h-9 w-10">
                  <button
                    type="button"
                    onClick={() => setOpenMenuTaskId((current) => (current === item.id ? null : item.id))}
                    className="focus-ring inline-flex h-9 w-10 items-center justify-center rounded-md text-ink transition hover:bg-slate-100"
                    aria-label={copy.dashboardTable.actionsFor(taskDisplayName(item, copy))}
                    aria-expanded={openMenuTaskId === item.id}
                  >
                    <MoreHorizontal size={17} />
                  </button>
                  {openMenuTaskId === item.id ? (
                    <div className="absolute bottom-full right-0 z-50 mb-1 w-48 rounded-[12px] border border-slate-200 bg-white p-1.5 text-sm font-normal text-[rgb(2,8,23)] shadow-none" role="menu">
                      <button type="button" onClick={() => openShareDialog(item)} className="flex h-8 w-full items-center rounded-md px-2 py-1.5 text-left transition hover:bg-slate-100" role="menuitem">
                        {copy.shareDialogTitle}
                      </button>
                      <button type="button" onClick={() => openExportDialog(item)} disabled={!item.transcript} className="flex h-8 w-full items-center rounded-md px-2 py-1.5 text-left transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50" role="menuitem">
                        {copy.exportAction}
                      </button>
                      <button type="button" onClick={() => openRenameDialog(item)} className="flex h-8 w-full items-center rounded-md px-2 py-1.5 text-left transition hover:bg-slate-100" role="menuitem">
                        {copy.rename}
                      </button>
                      <button type="button" onClick={() => openMoveDialog(item)} className="flex h-8 w-full items-center rounded-md px-2 py-1.5 text-left transition hover:bg-slate-100" role="menuitem">
                        {copy.move}
                      </button>
                      <div className="-mx-1 my-1 h-px bg-slate-100" role="separator" />
                      <button type="button" onClick={() => openDeleteDialog(item)} className="flex h-8 w-full items-center rounded-md px-2 py-1.5 text-left text-red-600 transition hover:bg-red-50" role="menuitem">
                        {copy.deleteTranscription}
                      </button>
                    </div>
                  ) : null}
                </span>
              </span>
            </div>
          ))
        ) : null}
      </div>
      <div className="flex h-16 items-center justify-center">
        <div className="flex h-8 items-center gap-2 text-sm font-normal leading-5 text-slate-500">
          <span>{copy.rowsPerPage}</span>
          <span className="relative inline-flex" data-dashboard-page-size>
            <button
              type="button"
              role="combobox"
              aria-controls="dashboard-page-size-listbox"
              aria-expanded={rowsPerPageMenuOpen}
              aria-haspopup="listbox"
              data-state={rowsPerPageMenuOpen ? "open" : "closed"}
              onClick={() => setRowsPerPageMenuOpen((current) => !current)}
              className="inline-flex h-8 w-[92px] items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal leading-5 text-[rgb(2,8,23)] outline-none transition hover:border-violet/25 focus:border-slate-200"
            >
              <span>{rowsPerPage}</span>
              <ChevronDown size={16} className="text-slate-500" />
            </button>
            {rowsPerPageMenuOpen ? (
              <div
                id="dashboard-page-size-listbox"
                role="listbox"
                data-side="top"
                data-align="start"
                data-state="open"
                className="absolute bottom-full left-0 z-50 mb-1 flex max-h-96 min-w-32 overflow-hidden rounded-md border border-slate-200 bg-white text-[rgb(2,8,23)] shadow-none"
              >
                <div className="w-[126px] overflow-y-auto p-1" role="presentation">
                  {dashboardPageSizes.map((pageSize) => (
                    <button
                      key={pageSize}
                      type="button"
                      role="option"
                      aria-selected={pageSize === rowsPerPage}
                      data-state={pageSize === rowsPerPage ? "checked" : "unchecked"}
                      onClick={() => {
                        setRowsPerPage(pageSize);
                        setRowsPerPageMenuOpen(false);
                      }}
                      className={clsx(
                        "flex h-8 w-full items-center rounded px-2 py-1.5 pl-8 text-left text-sm font-normal leading-5 outline-none transition",
                        pageSize === rowsPerPage ? "bg-slate-100 text-slate-900" : "text-[rgb(2,8,23)] hover:bg-slate-100"
                      )}
                    >
                      {pageSize}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </span>
        </div>
      </div>
      </div>
      {renamingTask ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <form
            className="relative w-full max-w-[425px] rounded-lg border border-slate-200 bg-white p-6 shadow-none"
            role="dialog"
            aria-modal="true"
            onSubmit={(event) => {
              event.preventDefault();
              if (renameSubmitDisabled) return;
              renameTask(renamingTask.id, normalizedRenameDraft).then(() => setRenamingTask(null));
            }}
          >
            <h2 className="pr-8 text-xl font-semibold leading-7 text-[rgb(2,8,23)]">{copy.renameFile}</h2>
            <button type="button" onClick={() => setRenamingTask(null)} className="absolute right-4 top-4 grid h-4 w-4 place-items-center rounded text-[rgb(2,8,23)] transition hover:text-slate-500" aria-label={copy.close}>
              <X size={16} />
              <span className="sr-only">{copy.close}</span>
            </button>
            <input
              value={renameDraft}
              onChange={(event) => setRenameDraft(event.target.value)}
              className="mt-8 h-10 w-full rounded-md border border-primary/60 bg-white px-3 py-2 text-sm font-normal leading-5 text-[rgb(2,8,23)] outline-none"
              placeholder={copy.enterNewFilename}
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setRenamingTask(null)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium leading-5 text-[rgb(2,8,23)] transition hover:bg-slate-50">{copy.cancel}</button>
              <button type="submit" disabled={renameSubmitDisabled} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium leading-5 text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-100">{copy.rename}</button>
            </div>
          </form>
        </div>
      ) : null}
      {movingTask ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="relative w-full max-w-[448px] rounded-lg border border-slate-200 bg-white p-6 shadow-none" role="dialog" aria-modal="true">
            <h2 className="pr-8 text-xl font-semibold leading-7 text-[rgb(2,8,23)]">{copy.moveToFolder}</h2>
            <button type="button" onClick={() => setMovingTask(null)} className="absolute right-4 top-4 grid h-4 w-4 place-items-center rounded text-[rgb(2,8,23)] transition hover:text-slate-500" aria-label={copy.close}>
              <X size={16} />
              <span className="sr-only">{copy.close}</span>
            </button>
            <p className="mt-1.5 text-sm font-normal leading-5 text-slate-500">
              {copy.movingFileFrom(taskDisplayName(movingTask, copy), selectedFolderName)}
            </p>
            <div className="mt-8 grid gap-2">
              {moveChoices.length ? (
                moveChoices.map((folder) => (
                  <button
                    key={folder.id ?? "uncategorized"}
                    type="button"
                    onClick={() => setMoveTargetFolderId(folder.id)}
                    className={clsx("flex h-[38px] items-center justify-between rounded-md border px-3 py-2 text-left text-sm font-normal leading-5 transition", moveTargetFolderId === folder.id ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-white text-[rgb(2,8,23)] hover:bg-slate-50")}
                  >
                    {folder.name}
                  </button>
                ))
              ) : (
                <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-normal leading-5 text-slate-500">{copy.noFoldersAvailable}</p>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setMovingTask(null)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium leading-5 text-[rgb(2,8,23)] transition hover:bg-slate-50">{copy.cancel}</button>
              <button
                type="button"
                disabled={busy || !moveChoices.length || moveTargetFolderId === undefined}
                onClick={() => moveTask(movingTask.id, moveTargetFolderId ?? null).then(() => setMovingTask(null))}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium leading-5 text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-100"
              >
                {copy.move}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {sharingTask ? (
        <ShareTranscriptionDialog
          activeShare={sharingTask.shareLinks?.[0] ?? null}
          busy={busy}
          canShare={Boolean(sharingTask.transcript)}
          copy={copy}
          shareUrl={taskShareUrl}
          onClose={() => {
            setSharingTask(null);
            setTaskShareUrl(null);
          }}
          onCopy={() => {
            const publicUrl = taskShareUrl ?? sharingTask.shareLinks?.[0]?.url;
            if (publicUrl) navigator.clipboard.writeText(publicUrl).catch(() => undefined);
          }}
          onDisable={() => {
            disableShareLinkForTask(sharingTask.id).then(() => {
              setSharingTask((current) => current ? {...current, shareLinks: []} : current);
              setTaskShareUrl(null);
            });
          }}
          onEnable={() => {
            createShareLinkForTask(sharingTask.id, taskDisplayName(sharingTask, copy)).then((url) => {
              if (url) {
                setTaskShareUrl(url);
                setSharingTask((current) => current ? {...current, shareLinks: [{id: "active", url, createdAt: new Date().toISOString()}]} : current);
              }
            });
          }}
        />
      ) : null}
      {deletingTask ? (
        <DeleteTranscriptionConfirmDialog
          busy={busy}
          copy={copy}
          title={taskDisplayName(deletingTask, copy)}
          onCancel={() => setDeletingTask(null)}
          onConfirm={() => {
            const taskId = deletingTask.id;
            setDeletingTask(null);
            deleteTask(taskId);
          }}
        />
      ) : null}
      {exportingTask ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="relative h-[512px] w-full max-w-[500px] rounded-lg border border-slate-200 bg-white p-6 shadow-none" role="dialog" aria-modal="true">
            <h2 className="text-xl font-semibold leading-7 text-ink">{copy.exportOptions}</h2>
            <p className="mt-1.5 text-sm font-normal leading-5 text-slate-500">{copy.exportDescription}</p>
            <p className="mt-[30px] text-base font-semibold leading-6 text-ink">{copy.fileFormat}</p>
            <div className="mt-2.5 grid grid-cols-2 gap-x-2.5 gap-y-2.5">
              {dashboardExportFormats.map((format) => (
                <label key={format} className="flex h-[52px] w-[220px] cursor-pointer items-center gap-3 text-base font-normal leading-6 text-ink transition hover:text-primary">
                  <input type="radio" name="dashboardExportFormat" value={format} checked={exportFormat === format} onChange={() => setExportFormat(format)} className="sr-only" />
                  <span className={clsx("grid h-4 w-4 place-items-center rounded-full border", exportFormat === format ? "border-primary" : "border-slate-300")}>
                    {exportFormat === format ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                  </span>
                  {dashboardExportLabels[format]}
                </label>
              ))}
            </div>
            <p className="mt-[30px] text-base font-semibold leading-6 text-ink">{copy.exportOptions}</p>
            <div className="mt-3 flex flex-wrap gap-8">
              <label className="flex h-5 items-center gap-2 text-base font-normal leading-6 text-ink">
                <input type="checkbox" checked={exportShowSpeaker} onChange={(event) => setExportShowSpeaker(event.target.checked)} className="sr-only" />
                <span className={clsx("grid h-4 w-4 place-items-center rounded border border-primary", exportShowSpeaker && "bg-primary")}>
                  {exportShowSpeaker ? <CheckCircle2 size={12} className="text-white" /> : null}
                </span>
                {copy.showSpeakerNames}
              </label>
              <label className="flex h-5 items-center gap-2 text-base font-normal leading-6 text-ink">
                <input type="checkbox" checked={exportShowTimestamp} onChange={(event) => setExportShowTimestamp(event.target.checked)} className="sr-only" />
                <span className={clsx("grid h-4 w-4 place-items-center rounded border border-primary", exportShowTimestamp && "bg-primary")}>
                  {exportShowTimestamp ? <CheckCircle2 size={12} className="text-white" /> : null}
                </span>
                {copy.showTimestamps}
              </label>
            </div>
            <div className="mt-7 flex justify-center">
              <a href={exportUrl(exportingTask)} onClick={() => setExportingTask(null)} className="inline-flex h-12 w-[220px] items-center justify-center rounded-[12px] bg-primary px-7 py-2 text-base font-bold leading-6 text-white transition hover:bg-primary/90">
                {copy.exportAction}
              </a>
            </div>
            <button type="button" onClick={() => setExportingTask(null)} className="absolute right-4 top-4 grid h-4 w-4 place-items-center rounded text-ink transition hover:text-slate-500" aria-label={copy.close}>
              <X size={16} />
              <span className="sr-only">{copy.close}</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DashboardEmptyState({copy}: {copy: ReturnType<typeof getWorkspaceCopy>}) {
  return (
    <section className="grid min-h-[360px] place-items-center text-center" aria-label={copy.dashboardTable.emptyAria}>
      <div className="relative h-64 w-64">
        <div className="absolute bottom-8 left-10 h-20 w-28 rounded-[50%] bg-slate-100" />
        <div className="absolute bottom-20 left-[105px] h-24 w-9 -rotate-6 rounded-full bg-ink" />
        <div className="absolute bottom-16 left-[92px] h-24 w-8 rotate-[18deg] rounded-full bg-ink" />
        <div className="absolute bottom-[118px] left-[93px] h-10 w-12 -rotate-[12deg] rounded-full bg-white ring-2 ring-slate-200" />
        <div className="absolute bottom-[125px] left-[107px] h-3 w-3 rounded-full bg-ink" />
        <div className="absolute bottom-[137px] left-[84px] h-9 w-9 rounded-full bg-white ring-2 ring-slate-200" />
        <div className="absolute bottom-[164px] left-[83px] h-3 w-14 -rotate-[18deg] rounded-full bg-slate-300" />
        <div className="absolute bottom-[132px] left-[128px] h-4 w-36 -rotate-[16deg] rounded-full bg-ink" />
        <div className="absolute bottom-[141px] left-[163px] h-12 w-24 -rotate-[16deg] rounded-[8px] bg-primary shadow-card [clip-path:polygon(0_28%,100%_0,100%_100%,0_72%)]" />
        <div className="absolute bottom-[133px] left-[154px] h-5 w-5 rounded-full border-4 border-white bg-primary" />
        <div className="absolute bottom-[73px] left-[125px] h-14 w-2 rotate-[8deg] rounded-full bg-slate-300" />
        <div className="absolute bottom-[74px] left-[143px] h-16 w-2 -rotate-[24deg] rounded-full bg-slate-300" />
        <div className="absolute bottom-[62px] left-[157px] h-2 w-16 -rotate-[16deg] rounded-full bg-slate-300" />
        <div className="absolute bottom-[58px] left-[91px] h-2 w-[5.5rem] rotate-[8deg] rounded-full bg-slate-300" />
      </div>
      <div className="-mt-8">
        <h2 className="text-2xl font-semibold text-ink">{copy.dashboardTable.emptyTitle}</h2>
      </div>
    </section>
  );
}

function DashboardTableLoading({copy, t}: {copy: ReturnType<typeof getWorkspaceCopy>; t: (key: string) => string}) {
  return (
    <div className="mt-4 min-w-[720px] bg-white" aria-label={copy.dashboardTable.loadingAria}>
      <div className="grid h-[52px] grid-cols-12 items-center gap-4 bg-slate-100/50 px-6 py-4 text-sm font-medium text-ink max-lg:hidden">
        <span className="col-span-5">{t("name")}</span>
        <span className="col-span-1">{t("duration")}</span>
        <span className="col-span-2">{t("created")}</span>
        <span className="col-span-1">{t("type")}</span>
        <span className="col-span-2">{t("folder")}</span>
        <span className="col-span-1" />
      </div>
      <div className="grid gap-0">
        {[0, 1, 2].map((row) => (
          <div key={row} className="grid min-h-[68px] grid-cols-12 items-center gap-4 px-6 py-4">
            <span className="col-span-5 h-4 rounded bg-slate-100" />
            <span className="col-span-1 h-4 rounded bg-slate-100" />
            <span className="col-span-2 h-4 rounded bg-slate-100" />
            <span className="col-span-1 h-7 w-7 rounded-full bg-slate-100" />
            <span className="col-span-2 h-4 rounded bg-slate-100" />
            <span className="col-span-1 h-8 w-10 rounded-md bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
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

function WorkspaceConfirmDialog({
  busy,
  copy,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm
}: {
  busy: boolean;
  copy: ReturnType<typeof getWorkspaceCopy>;
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <section className="relative grid h-[216px] w-full max-w-[448px] gap-4 rounded-lg border border-slate-200 bg-white p-0 text-[rgb(2,8,23)] shadow-none" role="dialog" aria-modal="true" aria-labelledby="workspace-confirm-title">
        <div className="flex flex-col px-6 pb-4 pt-6 text-center sm:text-left">
          <h2 id="workspace-confirm-title" className="text-xl font-semibold leading-7 text-[rgb(2,8,23)]">{title}</h2>
          <p className="mt-1.5 text-sm font-normal leading-5 text-slate-500">{description}</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button type="button" onClick={onCancel} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium leading-5 text-[rgb(2,8,23)] transition hover:bg-slate-50">{copy.cancel}</button>
          <button type="button" onClick={onConfirm} disabled={busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium leading-5 text-slate-50 transition hover:bg-red-500/90 disabled:pointer-events-none disabled:opacity-50">
            {busy ? <Loader2 className="animate-spin" size={16} /> : null}
            {confirmLabel}
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

function BatchDeleteConfirmDialog({busy, copy, count, onCancel, onConfirm}: {busy: boolean; copy: ReturnType<typeof getWorkspaceCopy>; count: number; onCancel: () => void; onConfirm: () => void}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 px-4">
      <section className="grid h-[330px] w-full max-w-[420px] gap-6 rounded-lg border border-[rgba(100,103,242,0.05)] bg-white p-6 text-[rgb(2,8,23)] shadow-none" role="alertdialog" aria-modal="true" aria-labelledby="batch-delete-title" aria-describedby="batch-delete-description">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <TriangleAlert className="h-6 w-6 text-red-600" />
          </div>
          <h2 id="batch-delete-title" className="text-center text-xl font-bold leading-7 text-[rgb(2,8,23)]">{copy.deleteSelectedFiles}</h2>
          <div id="batch-delete-description" className="mt-2 text-center text-sm font-normal leading-5 text-slate-500">
            <p className="text-base leading-6 text-slate-500">{copy.deleteSelectedFilesConfirm(count)}</p>
            <div role="alert" className="relative mt-4 w-full rounded-lg border-2 border-red-100 bg-red-50/50 p-4 text-left text-sm font-medium leading-5 text-red-800">
              <TriangleAlert className="absolute left-4 top-4 h-4 w-4 text-red-600" />
              <p className="pl-7 -translate-y-[3px]">{copy.deleteCannotBeUndone}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button type="button" onClick={onCancel} className="mt-0 inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-white px-4 py-2 text-sm font-medium leading-5 text-[rgb(2,8,23)] transition hover:bg-slate-100">{copy.cancel}</button>
          <button type="button" onClick={onConfirm} disabled={busy || count === 0} className="inline-flex h-10 flex-[1.5] items-center justify-center gap-2 rounded-[12px] border-0 bg-red-500 px-4 py-2 text-sm font-semibold leading-5 text-slate-50 shadow-lg shadow-red-500/25 transition hover:bg-red-500/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50">
            {busy ? <Loader2 className="animate-spin" size={16} /> : null}
            {copy.deleteFiles}
          </button>
        </div>
      </section>
    </div>
  );
}

function BulkSelectionCheckbox({checked, onChange, label}: {checked: boolean; onChange: () => void; label: string}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onChange();
      }}
      className={clsx(
        "grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border border-primary text-primary-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2",
        checked ? "bg-primary" : "bg-transparent"
      )}
    >
      {checked ? <Check size={12} className="text-white" strokeWidth={3} /> : null}
    </button>
  );
}

function WorkspaceSummaryEntryItem({entry}: {entry: SummaryEntry}) {
  const text = summaryEntryText(entry);
  const timestamps = summaryEntryTimestamps(entry);
  return (
    <li>
      <span>- {text}</span>
      {timestamps.length ? (
        <span className="ml-1.5 inline-flex flex-wrap gap-1 align-baseline">
          {timestamps.map((timestamp) => (
            <span key={timestamp} className="inline-flex rounded border border-violet/20 bg-violet/5 px-1.5 py-0.5 text-[11px] font-medium leading-4 text-violet">
              {timestamp}
            </span>
          ))}
        </span>
      ) : null}
    </li>
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
  openTaskActionConfirm,
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
  openTaskActionConfirm: (action: "delete_original" | "cancel", taskId: string, title: string) => void;
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    setTitleDraft(displayName);
    setRenaming(false);
  }, [task.id, displayName]);

  return (
    <>
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
              <button type="button" onClick={() => setRenaming(false)} className="btn-outline px-3 py-2">{copy.cancel}</button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-black text-ink">{displayName}</p>
                <p className="mt-1 text-xs font-bold text-ink/45">{task.statusMessage || task.status}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setRenaming(true)} disabled={busy} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/55 transition hover:border-violet/25 hover:text-violet disabled:opacity-40" aria-label={copy.renameFile}>
                  <Pencil size={15} />
                </button>
                <button type="button" onClick={openRetranscribeSettings} disabled={busy} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/55 transition hover:border-violet/25 hover:text-violet disabled:opacity-40" aria-label={copy.taskWorkspace.retranscribe}>
                  <RotateCcw size={15} />
                </button>
                {canCancel ? (
                  <button type="button" onClick={() => openTaskActionConfirm("cancel", task.id, displayName)} disabled={busy} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-coral/20 text-coral transition hover:bg-coral/10 disabled:opacity-40" aria-label={copy.cancelTranscription}>
                    <X size={15} />
                  </button>
                ) : null}
                {canRetry ? (
                  <button type="button" onClick={() => retryTask(task.id)} disabled={busy} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/55 transition hover:border-violet/25 hover:text-violet disabled:opacity-40" aria-label={copy.taskWorkspace.retryTranscription}>
                    <RotateCcw size={15} />
                  </button>
                ) : null}
                {canRetry && task.sourceType === "YOUTUBE" ? (
                  <button type="button" onClick={() => retryTask(task.id, "youtube_fallback")} disabled={busy} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/55 transition hover:border-violet/25 hover:text-violet disabled:opacity-40" aria-label={copy.taskWorkspace.youtubeFallbackRetry}>
                    <Link2 size={15} />
                  </button>
                ) : null}
                <button type="button" onClick={() => downloadOriginalFile(task.id)} disabled={busy} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/55 transition hover:border-violet/25 hover:text-violet disabled:opacity-40" aria-label={copy.taskWorkspace.downloadOriginalFile}>
                  <Download size={15} />
                </button>
                <button type="button" onClick={() => openTaskActionConfirm("delete_original", task.id, displayName)} disabled={busy} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-coral/20 text-coral transition hover:bg-coral/10 disabled:opacity-40" aria-label={copy.taskWorkspace.deleteOriginalFile}>
                  <X size={15} />
                </button>
                <button type="button" onClick={() => setDeleteConfirmOpen(true)} disabled={busy} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-coral/20 text-coral transition hover:bg-coral/10 disabled:opacity-40" aria-label={copy.deleteTranscription}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )}
          {normalizedAudio || audioChunks.length ? (
            <div className="mt-4 grid gap-3 rounded-lg border border-violet/15 bg-violet/5 p-3 text-sm md:grid-cols-3">
              <div>
                <p className="text-xs font-black uppercase text-ink/42">{copy.taskWorkspace.preparingAudio}</p>
                <p className="mt-1 truncate font-black text-ink">{normalizedAudio?.fileName ?? copy.taskWorkspace.preparingAudio}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-ink/42">{copy.taskWorkspace.smartChunks}</p>
                <p className="mt-1 font-black text-ink">{audioChunks.length ? copy.taskWorkspace.segmentLabel(audioChunks.length) : copy.taskWorkspace.notNeeded}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-ink/42">{copy.taskWorkspace.provider}</p>
                <p className="mt-1 font-black text-ink">{task.provider ?? copy.taskWorkspace.fallbackReady}</p>
              </div>
            </div>
          ) : null}
        </section>
        <TranscriptPanel task={task} draftText={draftText} setDraftText={setDraftText} segmentDrafts={segmentDrafts} updateSegmentDraft={updateSegmentDraft} speakerDrafts={speakerDrafts} setSpeakerDrafts={setSpeakerDrafts} uniqueSpeakers={uniqueSpeakers} saveSpeakerNames={saveSpeakerNames} saveTranscript={saveTranscript} saveSegments={saveSegments} copyTranscript={copyTranscript} copy={copy} t={t} />
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
          action={<button type="button" onClick={() => generateSingleInsight("summary")} disabled={!task.transcript || busy} className="btn-outline px-2.5 py-1.5 text-xs">{busy ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}{copy.taskWorkspace.regenerate}</button>}
        >
          {summary ? (
            <>
              <p>{summary.overview}</p>
              <ul className="mt-3 grid gap-2">
                {summary.bullets?.map((item: SummaryEntry, index: number) => (
                  <WorkspaceSummaryEntryItem key={`${summaryEntryText(item)}-${index}`} entry={item} />
                ))}
              </ul>
            </>
          ) : (
            <p>{t("summaryEmpty")}</p>
          )}
        </InsightPanel>

        <InsightPanel
          icon={<Network size={17} />}
          title={t("mindMap")}
          action={<button type="button" onClick={() => generateSingleInsight("mind_map")} disabled={!task.transcript || busy} className="btn-outline px-2.5 py-1.5 text-xs">{busy ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}{copy.taskWorkspace.regenerate}</button>}
        >
          {mindMap ? <MindMap node={mindMap} /> : <p>{t("mindMapEmpty")}</p>}
        </InsightPanel>

        <InsightPanel
          icon={<HelpCircle size={17} />}
          title={t("qa")}
          action={<button type="button" onClick={() => generateSingleInsight("qa")} disabled={!task.transcript || busy} className="btn-outline px-2.5 py-1.5 text-xs">{busy ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}{copy.taskWorkspace.regenerate}</button>}
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
            <TargetSelectLike
              value={translationTarget}
              onChange={setTranslationTarget}
              options={localeLanguageOptions}
              ariaLabel={copy.taskWorkspace.translationTargetLanguage}
              className="sm:w-44"
            />
            <button type="button" onClick={() => generateTranslation(translationTarget)} disabled={!task.transcript || busy} className="btn-outline px-3 py-2">
              {busy ? <Loader2 className="animate-spin" size={16} /> : <Languages size={16} />}
              {copy.taskWorkspace.generateTranslation}
            </button>
          </div>
          {translation ? (
            <TranslationEditor
              taskId={task.id}
              locale={translationTarget}
              content={translation}
              transcriptSegments={task.transcript?.segments}
              busy={busy}
              saveError={copy.taskWorkspace.saveTranslationFailed}
              saveLabel={copy.taskWorkspace.saveTranslation}
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
    {deleteConfirmOpen ? (
      <DeleteTranscriptionConfirmDialog
        busy={busy}
        copy={copy}
        title={displayName}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          setDeleteConfirmOpen(false);
          deleteTask(task.id);
        }}
      />
    ) : null}
    </>
  );
}
