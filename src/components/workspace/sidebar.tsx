"use client";

import {useState} from "react";
import {ChevronRight, ChevronUp, Clock, FileText, FolderOpen, HelpCircle, Home, LogOut, MessageCircle, Monitor, Moon, Pencil, Plus, Settings, Sun, Trash2} from "lucide-react";
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="grid h-6 w-6 place-items-center">{icon}</span>
          <span className="text-lg font-black uppercase tracking-wide">{label}</span>
        </div>
        <p className="whitespace-nowrap text-lg font-black text-ink">
          {used}
          <span className="text-slate-500">/{total}{suffix ? ` ${suffix}` : ""}</span>
        </p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/65">
        <div className={`h-full rounded-full ${barClassName}`} style={{width: `${clampPercent(used, total)}%`}} />
      </div>
    </div>
  );
}

function AccountMenu({locale}: {locale: string}) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"Light" | "Dark" | "System">("Light");

  async function signOut() {
    await fetch("/api/auth/logout", {method: "POST"}).catch(() => undefined);
    window.location.href = `/${locale}/auth/signin`;
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-violet/8 hover:text-violet"
      >
        <Settings size={17} />
      </button>
      {open ? (
        <div className="absolute bottom-11 right-0 z-30 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-card">
          <a href="mailto:support@uniscribe.co" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-ink/72 hover:bg-paper hover:text-ink">
            <HelpCircle size={16} />
            Email Support
          </a>
          <a href="https://discord.gg/uniscribe" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-ink/72 hover:bg-paper hover:text-ink">
            <MessageCircle size={16} />
            Discord
          </a>
          <a href={`/${locale}/settings`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-ink/72 hover:bg-paper hover:text-ink">
            <Settings size={16} />
            Settings
          </a>
          <div className="mt-2 border-t border-slate-200 pt-2">
            <p className="px-3 pb-2 text-xs font-black uppercase tracking-wide text-slate-500">Theme</p>
            <div className="grid grid-cols-3 gap-1">
              {[
                ["Light", Sun],
                ["Dark", Moon],
                ["System", Monitor]
              ].map(([label, Icon]) => {
                const typedLabel = label as "Light" | "Dark" | "System";
                const ThemeIcon = Icon as typeof Sun;
                return (
                  <button
                    key={typedLabel}
                    type="button"
                    onClick={() => setTheme(typedLabel)}
                    className={`grid min-w-0 justify-items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-black transition ${theme === typedLabel ? "bg-violet text-white" : "text-ink/60 hover:bg-paper hover:text-ink"}`}
                  >
                    <ThemeIcon size={14} />
                    <span className="truncate">{typedLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <button type="button" onClick={signOut} className="mt-2 flex w-full items-center gap-2 rounded-lg border-t border-slate-200 px-3 py-2 pt-3 text-left text-sm font-bold text-coral hover:bg-coral/10">
            <LogOut size={16} />
            Sign out
          </button>
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
  onSelectTask: _onSelectTask
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
}) {
  const subscription = user?.subscriptions?.[0];
  const planName = usageSnapshot?.subscription.plan ?? subscription?.plan ?? "FREE";
  const planLabel = planName === "ANONYMOUS" ? "FREE" : planName.toUpperCase();
  const quota = usageSnapshot?.subscription.monthlyMinuteQuota ?? subscription?.monthlyMinuteQuota ?? 120;
  const remaining = usageSnapshot?.subscription.remainingMinutes ?? subscription?.remainingMinutes ?? quota;
  const usedMinutes = usageSnapshot?.subscription.usedMinutes ?? Math.max(0, quota - remaining);
  const dailyUsed = usageSnapshot?.dailyFree.used ?? user?.dailyFreeCount ?? 0;
  const dailyLimit = usageSnapshot?.dailyFree.limit ?? 3;
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  async function submitFolder() {
    const nextName = folderName.trim();
    if (!nextName) {
      setCreatingFolder((value) => !value);
      return;
    }
    await createFolder(nextName);
    setFolderName("");
    setCreatingFolder(false);
  }

  return (
    <aside className="grid content-start gap-7">
      <section className="rounded-xl border border-slate-200 bg-[#f7f7ff] p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-black uppercase tracking-wide text-slate-500">Current Plan</h2>
          <a href={`/${locale}/pricing`} className="inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-emerald-100 px-5 py-3 text-lg font-black uppercase text-emerald-700 shadow-soft transition hover:border-emerald-300 hover:bg-emerald-50">
            {planLabel}
            <ChevronRight size={20} />
          </a>
        </div>

        <div className="mt-7 grid gap-8">
          <QuotaRow icon={<FileText size={22} />} label="Daily" used={dailyUsed} total={dailyLimit} barClassName="bg-violet" />
          <QuotaRow icon={<Clock size={23} />} label="Minutes" used={usedMinutes} total={quota} suffix="min" barClassName="bg-emerald-500" />
        </div>

        <a href={`/${locale}/pricing`} className="btn-primary mt-9 h-16 w-full rounded-lg text-xl shadow-glow">
          {t("upgradePlan")}
        </a>
      </section>

      <a href={`/${locale}/dashboard`} className="focus-ring flex min-h-20 items-center gap-5 rounded-xl bg-violet/10 px-5 text-2xl font-semibold text-violet transition hover:bg-violet/15">
        <Home size={34} strokeWidth={1.9} />
        Dashboard
      </a>

      <section>
        <div className="flex items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-5">
            <FolderOpen size={36} strokeWidth={1.8} className="text-slate-500" />
            <h2 className="text-2xl font-semibold text-ink">{t("folders")}</h2>
          </div>
          <div className="flex items-center gap-8 text-slate-500">
            <button type="button" onClick={submitFolder} className="focus-ring grid h-9 w-9 place-items-center rounded-lg transition hover:bg-violet/8 hover:text-violet" aria-label="Create folder">
              <Plus size={29} strokeWidth={1.8} />
            </button>
            <ChevronUp size={28} strokeWidth={1.8} />
          </div>
        </div>

        {creatingFolder ? (
          <label className="mt-5 block px-4">
            <span className="sr-only">New folder name</span>
            <input
              value={folderName}
              onChange={(event) => setFolderName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitFolder().catch(() => undefined);
                if (event.key === "Escape") {
                  setFolderName("");
                  setCreatingFolder(false);
                }
              }}
              className="field h-12 rounded-lg text-base"
              placeholder="New folder"
              autoFocus
            />
          </label>
        ) : null}

        <div className="mt-11 grid gap-3">
          <button
            type="button"
            onClick={() => setSelectedFolderId(null)}
            className={`ml-[4.5rem] rounded-lg px-4 py-3 text-left text-2xl font-semibold transition ${selectedFolderId === null ? "bg-violet text-white shadow-card" : "text-ink hover:bg-violet/8 hover:text-violet"}`}
          >
            {t("uncategorized")}
          </button>
          {folders.map((folder) => (
            <div key={folder.id} className={`ml-[4.5rem] rounded-lg transition ${selectedFolderId === folder.id ? "bg-violet text-white shadow-card" : "text-ink hover:bg-violet/8"}`}>
              {editingFolderId === folder.id ? (
                <form
                  className="flex items-center gap-2 p-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!editingName.trim()) return;
                    renameFolder(folder.id, editingName).then(() => {
                      setEditingFolderId(null);
                      setEditingName("");
                    });
                  }}
                >
                  <input value={editingName} onChange={(event) => setEditingName(event.target.value)} className="field h-10 min-w-0 flex-1 bg-white text-sm text-ink" autoFocus />
                  <button type="submit" className="rounded-md px-2 text-xs font-black text-violet">保存</button>
                </form>
              ) : (
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setSelectedFolderId(folder.id)} className="min-w-0 flex-1 px-4 py-3 text-left text-lg font-semibold">
                    <span className="block truncate">{folder.name}</span>
                    <span className={selectedFolderId === folder.id ? "text-xs text-white/65" : "text-xs text-slate-500"}>{folder._count?.mediaTasks ?? 0}</span>
                  </button>
                  <button type="button" onClick={() => { setEditingFolderId(folder.id); setEditingName(folder.name); }} className="grid h-9 w-9 place-items-center rounded-md opacity-70 transition hover:opacity-100" aria-label={`重命名 ${folder.name}`}>
                    <Pencil size={14} />
                  </button>
                  <button type="button" onClick={() => deleteFolder(folder.id)} className="grid h-9 w-9 place-items-center rounded-md opacity-70 transition hover:opacity-100" aria-label={`删除 ${folder.name}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">{copy.account}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-violet text-sm font-black uppercase text-white">
            {(user?.name || user?.email || "U").slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-ink">{user?.name || copy.anonymousUser}</p>
            <p className="truncate text-xs font-bold text-slate-500">{user?.email || copy.loginSyncHint}</p>
          </div>
          <AccountMenu locale={locale} />
        </div>
      </section>
    </aside>
  );
}
