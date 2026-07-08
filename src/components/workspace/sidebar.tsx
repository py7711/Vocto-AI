"use client";

import {useEffect, useRef, useState} from "react";
import {usePathname} from "next/navigation";
import {Check, ChevronDown, ChevronUp, Clock, Copy, CreditCard, Crown, Edit3, FileText, FolderOpen, Globe, Home, LogOut, Mail, Monitor, Moon, MoreHorizontal, Plus, Settings, Sun, SunMoon, Trash2, X} from "lucide-react";
import {BrandLogo} from "@/components/brand-logo";
import {isLocale, localeEnglishNames, localeNativeNames, locales, type Locale} from "@/lib/locales";
import type {WorkspaceCopy} from "./copy";
import type {AssetView, CurrentUser, FolderItem, TaskListItem, UsageSnapshot} from "./types";

function clampPercent(value: number, total: number) {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.max(0, Math.min(100, (value / total) * 100));
}

function QuotaRow({
  icon,
  label,
  used,
  total,
  suffix,
  barClassName
}: {
  icon: React.ReactNode;
  label: string;
  used: number;
  total: number;
  suffix?: string;
  barClassName: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase leading-[15px] tracking-tight">
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="grid h-[15px] w-[12px] place-items-center">{icon}</span>
          <span>{label}</span>
        </div>
        <p className="whitespace-nowrap text-[10px] font-bold leading-[15px] text-ink">
          {used}
          <span className="text-slate-500">
            /{total}
            {suffix ? <span className="normal-case text-[11px] font-normal leading-[16.5px]">{suffix}</span> : null}
          </span>
        </p>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/65">
        <div className={`h-full rounded-full ${barClassName}`} style={{width: `${clampPercent(used, total)}%`}} />
      </div>
    </div>
  );
}

function userInitials(user: CurrentUser | null) {
  const display = (user?.name || user?.email?.split("@")[0] || "U").trim();
  const digits = display.match(/\d/g);
  if (digits && digits.length >= 2) return digits.slice(0, 2).join("");
  const words = display.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  return display.slice(0, 2).toUpperCase();
}

type WorkspaceTheme = "Light" | "Dark" | "System";

function resolveWorkspaceTheme(theme: WorkspaceTheme) {
  if (theme === "Dark") return "dark";
  if (theme === "Light") return "light";
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyWorkspaceTheme(theme: WorkspaceTheme) {
  const resolved = resolveWorkspaceTheme(theme);
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.classList.toggle("light", resolved === "light");
}

function readStoredWorkspaceTheme(): WorkspaceTheme | null {
  try {
    const value = window.localStorage.getItem("votxt-theme");
    return value === "Light" || value === "Dark" || value === "System" ? value : null;
  } catch {
    return null;
  }
}

function storeWorkspaceTheme(theme: WorkspaceTheme) {
  try {
    window.localStorage.setItem("votxt-theme", theme);
  } catch {
    // Best-effort preference persistence only.
  }
}

export function WorkspaceLanguageSwitcher({locale, copy, placement = "above"}: {locale: string; copy: Pick<WorkspaceCopy, "language">; placement?: "above" | "below"}) {
  const pathname = usePathname() ?? `/${locale}`;
  const currentLocale = isLocale(locale) ? locale : "en";
  const rootRef = useRef<HTMLDetailsElement | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const menuPlacementClass = placement === "below" ? "top-[52px]" : "bottom-[52px]";

  useEffect(() => {
    setSearch(window.location.search);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideInteraction(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideInteraction);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideInteraction);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function pathForLocale(target: Locale) {
    const segments = pathname.split("/");
    if (segments.length > 1) {
      segments[1] = target;
      return `${segments.join("/") || `/${target}`}${search}`;
    }
    return `/${target}${search}`;
  }

  return (
    <details ref={rootRef} open={open} onToggle={(event) => setOpen(event.currentTarget.open)} className="relative">
      <summary
        aria-label={copy.language}
        className="focus-ring flex h-11 cursor-pointer list-none items-center justify-between rounded-[12px] border border-slate-200 bg-white px-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
        onClick={(event) => {
          event.preventDefault();
          setOpen((value) => !value);
        }}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Globe size={17} className="shrink-0 text-violet" />
          <span className="truncate">{localeNativeNames[currentLocale]}</span>
        </span>
        <ChevronDown size={16} className={`shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </summary>
      <div className={`absolute left-0 z-50 grid max-h-[420px] w-full overflow-y-auto rounded-[12px] border border-[#d6ddeb] bg-white p-2 ${menuPlacementClass}`}>
        {locales.map((item) => (
          <a
            key={item}
            href={pathForLocale(item)}
            className={`flex min-h-[54px] items-center justify-between gap-3 rounded-lg px-3 py-2 transition hover:bg-[#f7f7ff] ${item === currentLocale ? "text-[#6467f2]" : "text-ink"}`}
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold leading-5">{localeNativeNames[item]}</span>
              <span className="block truncate text-xs font-medium leading-4 text-slate-500">{localeEnglishNames[item]}</span>
            </span>
            {item === currentLocale ? <Check size={17} className="shrink-0 text-[#6467f2]" /> : null}
          </a>
        ))}
      </div>
    </details>
  );
}

function AccountMenu({locale, user, copy}: {locale: string; user: CurrentUser | null; copy: WorkspaceCopy}) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<WorkspaceTheme>("System");
  const [supportOpen, setSupportOpen] = useState(false);
  const displayName = user?.name || copy.anonymousUser;
  const email = user?.email || copy.loginSyncHint;
  const avatarUrl = user?.image || user?.oauthAccounts?.find((account) => account.avatarUrl)?.avatarUrl || null;
  const supportEmail = "hi@votxt.co";

  async function signOut() {
    await fetch("/api/auth/logout", {method: "POST"}).catch(() => undefined);
    window.location.href = `/${locale}/auth/signin`;
  }

  async function openBilling() {
    const subscription = user?.subscriptions?.[0];
    const plan = subscription?.plan?.toUpperCase();
    if (!subscription?.stripeSubscriptionId || !plan || plan === "FREE" || plan === "ANONYMOUS") return;

    const response = await fetch("/api/billing/portal", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({returnPath: `/${locale}/dashboard?portal=returned`})
    }).catch(() => null);
    if (!response) return;
    if (response.status === 401) {
      window.location.href = `/${locale}/auth/signin`;
      return;
    }
    const data = await response.json().catch(() => ({}));
    if (response.ok && data.url) window.location.href = data.url;
  }

  useEffect(() => {
    const storedTheme = readStoredWorkspaceTheme();
    if (storedTheme) {
      setTheme(storedTheme);
      applyWorkspaceTheme(storedTheme);
      return;
    }
    applyWorkspaceTheme("System");
  }, []);

  useEffect(() => {
    applyWorkspaceTheme(theme);
    if (theme !== "System") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => applyWorkspaceTheme("System");
    media.addEventListener("change", syncSystemTheme);
    return () => media.removeEventListener("change", syncSystemTheme);
  }, [theme]);

  function chooseTheme(nextTheme: WorkspaceTheme) {
    setTheme(nextTheme);
    storeWorkspaceTheme(nextTheme);
    applyWorkspaceTheme(nextTheme);
  }

  return (
    <div className="relative z-40 mt-auto w-full transition-transform duration-200" style={open ? {transform: "translateY(-313px)"} : undefined}>
      <div className="w-[267px] rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <span className="block h-10 w-10 shrink-0 overflow-hidden rounded-full bg-emerald-700">
              {/* External avatar hosts vary, so avoid next/image remote domain constraints here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl} alt={copy.avatarAlt} className="h-full w-full object-cover" />
            </span>
          ) : (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#5d962f] text-sm font-semibold text-white" aria-label={copy.avatarAlt}>
              {userInitials(user)}
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold leading-5 text-ink">{displayName}</span>
            <span className="block truncate text-xs font-normal leading-4 text-slate-500">{email}</span>
          </span>
          <button
            type="button"
            aria-label={copy.accountMenu}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-ink"
          >
            <ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      {open ? (
        <div className="absolute left-[17px] top-[73px] z-50 grid w-[233px] gap-2 rounded-[16px] border border-slate-200 bg-white p-2 animate-in slide-in-from-top-2 duration-200">
          <button type="button" onClick={() => openBilling().catch(() => undefined)} className="focus-ring flex h-10 w-full items-center gap-2 rounded-[12px] px-4 py-2 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-ink">
            <CreditCard size={16} />
            {copy.billing}
          </button>
          <button type="button" onClick={() => setSupportOpen(true)} className="focus-ring flex h-10 w-full items-center gap-2 rounded-[12px] px-4 py-2 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-ink">
            <Mail size={16} />
            {copy.emailSupport}
          </button>
          <button type="button" onClick={() => { window.location.href = `/${locale}/settings`; }} className="focus-ring flex h-10 w-full items-center gap-2 rounded-[12px] px-4 py-2 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-ink">
            <Settings size={16} />
            {copy.settings}
          </button>
          <div className="flex h-10 w-full items-center justify-between rounded-[12px] border border-slate-200 bg-white px-4 transition hover:bg-slate-50">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <SunMoon size={16} />
              <span>{copy.theme}</span>
            </div>
            <div className="flex h-8 rounded-lg border border-slate-200 bg-white p-0.5">
              {[
                ["Light", copy.themeLight, Sun],
                ["Dark", copy.themeDark, Moon],
                ["System", copy.themeSystem, Monitor]
              ].map(([value, label, Icon]) => {
                const typedLabel = value as WorkspaceTheme;
                const ThemeIcon = Icon as typeof Sun;
                return (
                  <button
                    key={typedLabel}
                    type="button"
                    aria-label={label as string}
                    onClick={() => chooseTheme(typedLabel)}
                    className={`focus-ring grid h-[26px] w-[26px] place-items-center rounded-md transition ${theme === typedLabel ? "bg-slate-100 text-ink dark:bg-slate-900 dark:text-slate-50" : "text-slate-500 hover:bg-slate-50 hover:text-ink"}`}
                  >
                    <ThemeIcon size={14} />
                    <span className="sr-only">{label as string}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="py-1">
            <div className="h-px w-full bg-slate-200" />
          </div>
          <button type="button" onClick={signOut} className="focus-ring flex h-10 w-full items-center gap-2 rounded-[12px] px-4 py-2 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-ink">
            <LogOut size={16} />
            {copy.signOut}
          </button>
        </div>
      ) : null}
      </div>
      {supportOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="fixed left-1/2 top-1/2 grid h-[298px] w-full max-w-[448px] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-slate-200 bg-white p-6 text-[rgb(2,8,23)] shadow-none" role="dialog" aria-modal="true" aria-labelledby="email-support-title">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h2 id="email-support-title" className="flex items-center gap-2 text-lg font-semibold leading-[18px] tracking-tight text-[rgb(2,8,23)]">
                <Mail size={20} className="h-5 w-5 text-violet" />
                {copy.emailSupport}
              </h2>
              <div className="text-sm font-normal leading-5 text-slate-500">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span>{copy.supportResponseSoon}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Crown size={16} className="h-4 w-4 shrink-0 text-amber-500" />
                      <div>
                        <div className="font-medium text-[rgb(2,8,23)]">{copy.supportPaidUsers}</div>
                        <div className="text-slate-500">{copy.supportWithin24Hours}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="h-4 w-4 shrink-0 text-slate-500/60" />
                      <div>
                        <div className="font-medium text-[rgb(2,8,23)]">{copy.supportFreeUsers}</div>
                        <div className="text-slate-500">{copy.supportWithin48Hours}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex h-[54px] items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span className="select-all text-sm font-normal leading-5 text-[rgb(2,8,23)]">{supportEmail}</span>
                <button type="button" onClick={() => navigator.clipboard.writeText(supportEmail).catch(() => undefined)} className="inline-flex h-9 w-[89.16px] items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium leading-5 text-[rgb(2,8,23)] transition-colors hover:bg-slate-50">
                  <Copy size={16} className="mr-1 h-4 w-4" />
                  {copy.copyButton}
                </button>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setSupportOpen(false)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-violet px-4 py-2 text-sm font-medium leading-5 text-white transition-colors hover:bg-violet/90">{copy.close}</button>
            </div>
            <button type="button" onClick={() => setSupportOpen(false)} className="absolute right-4 top-4 grid h-4 w-4 place-items-center rounded text-[rgb(2,8,23)] opacity-70 transition hover:opacity-100" aria-label={copy.close}>
              <X size={16} />
              <span className="sr-only">{copy.close}</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function WorkspaceSidebar({
  t,
  copy,
  locale,
  tasks: _tasks,
  user,
  usageSnapshot,
  folders,
  selectedFolderId,
  setSelectedFolderId,
  createFolder,
  renameFolder,
  deleteFolder,
  assetView: _assetView,
  setAssetView: _setAssetView,
  assetSearch: _assetSearch,
  setAssetSearch: _setAssetSearch,
  activeTaskId: _activeTaskId,
  onSelectTask: _onSelectTask,
  onOpenUpgradePrompt
}: {
  t: (key: string) => string;
  copy: WorkspaceCopy;
  locale: string;
  tasks: TaskListItem[];
  user: CurrentUser | null;
  usageSnapshot: UsageSnapshot | null;
  folders: FolderItem[];
  selectedFolderId: string | null;
  setSelectedFolderId: (value: string | null) => void;
  createFolder: (name: string) => Promise<void>;
  renameFolder: (folderId: string, name: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  assetView: AssetView;
  setAssetView: (value: AssetView) => void;
  assetSearch: string;
  setAssetSearch: (value: string) => void;
  activeTaskId?: string;
  onSelectTask: (taskId: string) => void;
  onOpenUpgradePrompt?: () => void;
}) {
  const subscription = user?.subscriptions?.[0];
  const planName = usageSnapshot?.subscription.plan ?? subscription?.plan ?? "FREE";
  const planLabels: Record<string, string> = {
    ANONYMOUS: copy.planAnonymous,
    BASIC: copy.planBasic,
    FREE: copy.planFree,
    PRO: copy.planPro,
    STANDARD: copy.planStandard
  };
  const planLabel = planLabels[planName.toUpperCase()] ?? planName.charAt(0).toUpperCase() + planName.slice(1).toLowerCase();
  const isPaidPlan = planName !== "FREE" && planName !== "ANONYMOUS";
  const quota = usageSnapshot?.subscription.monthlyMinuteQuota ?? subscription?.monthlyMinuteQuota ?? 120;
  const remaining = usageSnapshot?.subscription.remainingMinutes ?? subscription?.remainingMinutes ?? quota;
  const usedMinutes = usageSnapshot?.subscription.usedMinutes ?? Math.max(0, quota - remaining);
  const dailyUsed = usageSnapshot?.dailyFree.used ?? user?.dailyFreeCount ?? 0;
  const dailyLimit = usageSnapshot?.dailyFree.limit ?? 3;
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [openFolderMenuId, setOpenFolderMenuId] = useState<string | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<FolderItem | null>(null);

  const editingFolder = folders.find((folder) => folder.id === editingFolderId) ?? null;

  async function submitFolder() {
    const nextName = folderName.trim();
    if (!nextName) return;
    await createFolder(nextName);
    setFolderName("");
    setCreatingFolder(false);
  }

  async function submitFolderRename() {
    if (!editingFolderId || !editingName.trim()) return;
    await renameFolder(editingFolderId, editingName.trim());
    setEditingFolderId(null);
    setEditingName("");
  }

  function closeFolderDialog() {
    setCreatingFolder(false);
    setFolderName("");
    setEditingFolderId(null);
    setEditingName("");
  }

  async function confirmDeleteFolder() {
    if (!deletingFolder) return;
    const folderId = deletingFolder.id;
    await deleteFolder(folderId);
    setDeletingFolder(null);
  }

  return (
    <aside className="flex h-screen min-h-0 min-w-0 flex-col gap-5 overflow-y-auto bg-white px-4 py-4">
      <a href={`/${locale}/dashboard`} className="flex h-[44px] items-center">
        <BrandLogo alt="Votxt" width={470} height={180} className="h-[32px] w-auto" />
      </a>

      <section className="h-[204.5px] min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-[#f7f7ff] px-4 py-4 shadow-soft">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <h2 className="min-w-0 text-xs font-bold uppercase leading-4 tracking-wider text-slate-500">{copy.currentPlan}</h2>
          <span className="inline-flex h-[25px] shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase leading-[15px] tracking-widest text-emerald-700 shadow-sm">
            {planLabel}
          </span>
        </div>

        <div className="mt-4 grid gap-4">
          <QuotaRow icon={<FileText size={12} />} label={copy.dailyQuota} used={dailyUsed} total={dailyLimit} barClassName="bg-violet" />
          <QuotaRow icon={<Clock size={12} />} label={copy.minutesQuota} used={usedMinutes} total={quota} suffix={copy.minuteSuffix} barClassName="bg-emerald-500" />
        </div>

        <button
          type="button"
          onClick={isPaidPlan ? () => { window.location.href = `/${locale}/settings#usage-addon`; } : onOpenUpgradePrompt ?? (() => { window.location.href = `/${locale}/pricing`; })}
          className="focus-ring mt-4 inline-flex h-9 w-full items-center justify-center rounded-md bg-violet px-4 text-sm font-bold leading-none text-white shadow-soft transition hover:bg-violetDark"
        >
          {t("upgradePlan")}
        </button>
      </section>

      <a href={`/${locale}/dashboard`} className="focus-ring flex min-h-10 min-w-0 items-center gap-3 rounded-md bg-violet/10 px-3 text-sm font-medium text-violet transition hover:bg-violet/15">
        <Home size={21} strokeWidth={1.9} />
        {copy.dashboardNav}
      </a>

      <section className="min-w-0">
        <div className="flex items-center justify-between gap-4 pl-4 pr-[9px]">
          <div className="flex items-center gap-3">
            <FolderOpen size={22} strokeWidth={1.8} className="text-slate-500" />
            <h2 className="text-base font-medium text-ink">{t("folders")}</h2>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <button type="button" onClick={() => setCreatingFolder(true)} className="focus-ring grid h-8 w-8 place-items-center rounded-lg transition hover:bg-violet/10 hover:text-violet" aria-label={copy.createFolderAria}>
              <Plus size={18} strokeWidth={1.8} />
            </button>
            <span className="grid h-8 w-8 place-items-center rounded-lg">
              <ChevronUp size={18} strokeWidth={1.8} />
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-1 pl-2 pr-[13px]">
          <button
            type="button"
            onClick={() => setSelectedFolderId(null)}
            className={`h-11 rounded-[12px] py-3 pl-7 pr-3 text-left text-sm font-medium leading-5 transition ${selectedFolderId === null ? "text-ink hover:bg-violet/10 hover:text-violet" : "text-ink hover:bg-violet/10 hover:text-violet"}`}
          >
            {t("uncategorized")}
          </button>
          {folders.map((folder) => (
            <div key={folder.id} className={`group h-[52.5px] rounded-[12px] transition ${selectedFolderId === folder.id ? "bg-violet text-white shadow-card" : "text-ink hover:bg-violet/10"}`}>
              <div className="flex h-full items-center justify-between py-3 pl-7 pr-3">
                <button type="button" onClick={() => setSelectedFolderId(folder.id)} className="min-w-0 flex-1 text-left text-sm font-medium leading-5">
                  <span className="block truncate">{folder.name}</span>
                </button>
                <div className="relative">
                  <button type="button" onClick={() => setOpenFolderMenuId((current) => (current === folder.id ? null : folder.id))} className="grid h-7 w-7 place-items-center rounded-lg opacity-0 transition group-hover:opacity-100 hover:opacity-100 focus-visible:opacity-100" aria-label={copy.folderActions(folder.name)} aria-expanded={openFolderMenuId === folder.id}>
                    <MoreHorizontal size={16} />
                  </button>
                  {openFolderMenuId === folder.id ? (
                    <div className="absolute left-0 top-8 z-50 w-36 rounded-[12px] border border-slate-200 bg-white p-1.5 text-sm font-normal text-[rgb(2,8,23)] shadow-none" role="menu">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFolderId(folder.id);
                          setEditingName(folder.name);
                          setOpenFolderMenuId(null);
                        }}
                        className="flex h-8 w-full items-center rounded-md px-2 py-1.5 text-left transition hover:bg-slate-100"
                        role="menuitem"
                      >
                        <span className="flex items-center gap-2">
                          <Edit3 size={16} className="text-slate-500" />
                          {copy.rename}
                        </span>
                      </button>
                      <div className="-mx-1 my-1 h-px bg-slate-100" role="separator" />
                      <button
                        type="button"
                        onClick={() => {
                          setOpenFolderMenuId(null);
                          setDeletingFolder(folder);
                        }}
                        className="flex h-8 w-full items-center rounded-md px-2 py-1.5 text-left text-red-600 transition hover:bg-red-50"
                        role="menuitem"
                      >
                        <span className="flex items-center gap-2">
                          <Trash2 size={16} />
                          {copy.delete}
                        </span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {creatingFolder || editingFolder ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <form
            className="relative grid w-full max-w-[425px] gap-4 rounded-lg border border-slate-200 bg-white p-6 text-ink shadow-none"
            role="dialog"
            aria-modal="true"
            onSubmit={(event) => {
              event.preventDefault();
              if (editingFolder) {
                submitFolderRename().catch(() => undefined);
              } else {
                submitFolder().catch(() => undefined);
              }
            }}
          >
            <h2 className="pr-8 text-lg font-semibold leading-none tracking-tight text-ink">{editingFolder ? copy.renameFolderTitle : copy.createFolderTitle}</h2>
            <button type="button" onClick={closeFolderDialog} className="absolute right-4 top-4 grid h-4 w-4 place-items-center rounded-sm text-ink opacity-70 transition hover:opacity-100" aria-label={copy.close}>
              <X size={16} />
            </button>
            <div>
              <div className="grid gap-2 py-4">
                <div className="grid gap-2">
                  <label className="block text-sm font-medium leading-none text-ink">{copy.folderName}</label>
                  <input
                    value={editingFolder ? editingName : folderName}
                    onChange={(event) => {
                      const value = event.target.value.slice(0, 40);
                      if (editingFolder) setEditingName(value);
                      else setFolderName(value);
                    }}
                    className="flex h-10 w-full rounded-md border border-violet bg-white px-3 py-2 text-sm font-normal leading-5 text-ink outline-none ring-[3px] ring-violet/10 transition placeholder:text-slate-500 focus-visible:border-violet"
                    placeholder={copy.folderNamePlaceholder}
                    maxLength={40}
                    autoFocus
                  />
                </div>
                <p className="text-xs leading-4 text-slate-500">
                  {copy.folderCharacterCount((editingFolder ? editingName : folderName).length)}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeFolderDialog} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium leading-5 text-ink transition hover:bg-slate-50">{copy.cancel}</button>
                <button type="submit" disabled={!(editingFolder ? editingName : folderName).trim()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-violet px-4 py-2 text-sm font-medium leading-5 text-white transition hover:bg-violetDark disabled:pointer-events-none disabled:opacity-50">
                  {editingFolder ? copy.save : copy.create}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}

      {deletingFolder ? (
        <div className="fixed inset-0 z-50 bg-black/80">
          <section className="fixed left-1/2 top-1/2 z-50 grid h-[350px] w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 gap-6 rounded-lg border border-violet/5 bg-white p-6 text-[rgb(2,8,23)] shadow-none" role="alertdialog" aria-modal="true" aria-labelledby="delete-folder-title" aria-describedby="delete-folder-description">
            <div className="flex flex-col space-y-2 text-center sm:text-left">
              <h2 id="delete-folder-title" className="text-lg font-semibold leading-7 tracking-tight text-[rgb(2,8,23)]">{copy.deleteFolderTitle}</h2>
              <div id="delete-folder-description" className="space-y-2">
                <p className="text-sm leading-5 text-slate-500">
                  {copy.deleteFolderIntro(deletingFolder.name)}
                </p>
                <p className="text-sm leading-5 text-slate-500">
                  {copy.deleteFolderWarning}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => setDeletingFolder(null)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium leading-5 text-[rgb(2,8,23)] transition hover:bg-slate-50">{copy.cancel}</button>
              <button type="button" onClick={() => confirmDeleteFolder().catch(() => undefined)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium leading-5 text-slate-50 transition hover:bg-red-500/90">
                {copy.delete}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <div className="mt-auto grid gap-3">
        <WorkspaceLanguageSwitcher locale={locale} copy={copy} />
        <AccountMenu locale={locale} user={user} copy={copy} />
      </div>
    </aside>
  );
}
