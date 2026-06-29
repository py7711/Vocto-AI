"use client";

import {useState} from "react";
import {BadgeCheck, Clock, Folder, HelpCircle, LogOut, MessageCircle, Monitor, Moon, Pencil, Plus, Settings, Sun, Trash2} from "lucide-react";
import type {WorkspaceCopy} from "./copy";
import type {AssetView, CurrentUser, FolderItem, TaskListItem, UsageSnapshot} from "./types";
import {PanelTitle} from "./primitives";

function LiveQuotaMetric({label, used, total, suffix}: {label: string; used: number; total: number; suffix?: string}) {
  return (
    <div className="rounded-lg border border-ink/10 bg-paper/55 p-3">
      <div className="text-[11px] font-black uppercase tracking-wide text-ink/45">{label}</div>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-3xl font-black leading-none text-ink">{used}</span>
        <span className="pb-0.5 text-sm font-black text-ink/45">/{total}</span>
        {suffix ? <span className="pb-0.5 text-xs font-bold text-ink/45">{suffix}</span> : null}
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
        className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-ink/45 transition hover:bg-ink/5 hover:text-ink"
      >
        <Settings size={16} />
      </button>
      {open ? (
        <div className="absolute bottom-10 right-0 z-30 w-64 rounded-xl border border-ink/10 bg-white p-2 shadow-card">
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
          <div className="mt-2 border-t border-ink/10 pt-2">
            <p className="px-3 pb-2 text-xs font-black uppercase tracking-wide text-ink/45">Theme</p>
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
          <button type="button" onClick={signOut} className="mt-2 flex w-full items-center gap-2 rounded-lg border-t border-ink/10 px-3 py-2 pt-3 text-left text-sm font-bold text-coral hover:bg-coral/10">
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
  const planName = usageSnapshot?.subscription.plan ?? subscription?.plan ?? "ANONYMOUS";
  const quota = usageSnapshot?.subscription.monthlyMinuteQuota ?? subscription?.monthlyMinuteQuota ?? 120;
  const remaining = usageSnapshot?.subscription.remainingMinutes ?? subscription?.remainingMinutes ?? quota;
  const usedMinutes = usageSnapshot?.subscription.usedMinutes ?? (subscription ? Math.max(0, quota - remaining) : 0);
  const dailyUsed = usageSnapshot?.dailyFree.used ?? user?.dailyFreeCount ?? 0;
  const dailyLimit = usageSnapshot?.dailyFree.limit ?? 3;
  const [folderName, setFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  return (
    <aside className="grid content-start gap-4">
      <section className="rounded-xl border border-ink/10 bg-white p-4 shadow-soft">
        <PanelTitle icon={<BadgeCheck size={18} />} label="Current Plan" />
        <div className="mt-3">
          <p className="break-words text-2xl font-black uppercase">{planName === "ANONYMOUS" ? "FREE" : planName}</p>
        </div>
        <div className="mt-4 grid gap-3">
          <LiveQuotaMetric label="DAILY" used={dailyUsed} total={dailyLimit} />
          <LiveQuotaMetric label="MINUTES" used={usedMinutes} total={quota} suffix="min" />
        </div>
        {usageSnapshot ? (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold">
            <div className="rounded-lg bg-paper p-2.5 ring-1 ring-ink/5">
              <div className="text-ink/50">{copy.monthTasks}</div>
              <div className="mt-1 text-base text-ink">{usageSnapshot.tasks.periodCount}</div>
            </div>
            <div className="rounded-lg bg-paper p-2.5 ring-1 ring-ink/5">
              <div className="text-ink/50">{copy.remainingMinutes}</div>
              <div className="mt-1 text-base text-ink">{remaining}</div>
            </div>
          </div>
        ) : null}
        <a href={`/${locale}/pricing`} className="btn-primary mt-4 w-full">{t("upgradePlan")}</a>
      </section>

      <section className="rounded-xl border border-ink/10 bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <PanelTitle icon={<Folder size={18} />} label={t("folders")} />
          <button type="button" onClick={() => { if (folderName.trim()) createFolder(folderName).then(() => setFolderName("")); }} className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md border border-ink/10 text-ink/55 transition hover:border-violet/25 hover:text-violet" aria-label="Create folder">
            <Plus size={15} />
          </button>
        </div>
        <label className="mt-3 block">
          <span className="sr-only">New folder name</span>
          <input value={folderName} onChange={(event) => setFolderName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && folderName.trim()) createFolder(folderName).then(() => setFolderName("")); }} className="field h-9 text-sm" placeholder="New folder" />
        </label>
        <div className="mt-3 grid gap-1.5">
          <button type="button" onClick={() => setSelectedFolderId(null)} className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-bold ring-1 ring-ink/5 transition ${selectedFolderId === null ? "bg-violet text-white" : "bg-paper hover:bg-violet/8 hover:text-violet"}`}>
            <span>{t("uncategorized")}</span>
          </button>
          {folders.map((folder) => (
            <div key={folder.id} className={`rounded-lg ring-1 ring-ink/5 ${selectedFolderId === folder.id ? "bg-violet text-white" : "bg-paper text-ink"}`}>
              {editingFolderId === folder.id ? (
                <form
                  className="flex items-center gap-1 p-1"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!editingName.trim()) return;
                    renameFolder(folder.id, editingName).then(() => {
                      setEditingFolderId(null);
                      setEditingName("");
                    });
                  }}
                >
                  <input value={editingName} onChange={(event) => setEditingName(event.target.value)} className="field h-8 min-w-0 flex-1 bg-white text-sm text-ink" autoFocus />
                  <button type="submit" className="rounded-md px-2 text-xs font-black text-violet">保存</button>
                </form>
              ) : (
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setSelectedFolderId(folder.id)} className="min-w-0 flex-1 px-3 py-2 text-left text-sm font-bold">
                    <span className="block truncate">{folder.name}</span>
                    <span className={selectedFolderId === folder.id ? "text-xs text-white/65" : "text-xs text-ink/45"}>{folder._count?.mediaTasks ?? 0}</span>
                  </button>
                  <button type="button" onClick={() => { setEditingFolderId(folder.id); setEditingName(folder.name); }} className="grid h-8 w-8 place-items-center rounded-md opacity-70 transition hover:opacity-100" aria-label={`重命名 ${folder.name}`}>
                    <Pencil size={13} />
                  </button>
                  <button type="button" onClick={() => deleteFolder(folder.id)} className="grid h-8 w-8 place-items-center rounded-md opacity-70 transition hover:opacity-100" aria-label={`删除 ${folder.name}`}>
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-ink/10 pt-4">
          <p className="text-xs font-black uppercase tracking-wide text-ink/45">{copy.account}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-violet text-sm font-black uppercase text-white">
              {(user?.name || user?.email || "U").slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-ink">{user?.name || copy.anonymousUser}</p>
              <p className="truncate text-xs font-bold text-ink/55">{user?.email || copy.loginSyncHint}</p>
            </div>
            <AccountMenu locale={locale} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-violet/15 bg-violet p-4 text-white shadow-soft">
        <PanelTitle icon={<Clock size={18} />} label="Limited Time" />
        <h3 className="mt-3 text-lg font-black">Discounted Yearly Basic Plan</h3>
        <p className="mt-1 text-sm text-white/75">Just $5.00 per month</p>
        <div className="mt-4 rounded-lg bg-white/12 p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-black">50% OFF</span>
            <span className="font-black">$60.00 <span className="text-white/45 line-through">$120.00</span></span>
          </div>
          <p className="mt-1 text-xs font-bold text-white/65">billed yearly</p>
          <ul className="mt-3 grid gap-1.5 text-xs font-bold text-white/82">
            <li>1,200 min/mo</li>
            <li>Premium model</li>
            <li>Speaker identification</li>
            <li>Priority email support</li>
          </ul>
        </div>
        <div className="mt-4">
          <p className="text-center text-xs font-black uppercase tracking-wide text-white/60">Limited Time</p>
          <div className="mt-2 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1 text-center text-sm font-black">
            <span className="rounded-md bg-white/15 px-2 py-2">05</span>
            <span className="text-white/45">:</span>
            <span className="rounded-md bg-white/15 px-2 py-2">35</span>
            <span className="text-white/45">:</span>
            <span className="rounded-md bg-white/15 px-2 py-2">05</span>
          </div>
        </div>
        <div className="mt-4 grid gap-2">
          <a href={`/${locale}/pricing`} className="inline-flex w-full items-center justify-center rounded-md bg-white px-4 py-2.5 text-sm font-black text-violet transition hover:bg-white/90">Upgrade Now</a>
          <a href={`/${locale}/pricing`} className="inline-flex w-full items-center justify-center rounded-md border border-white/30 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/10">See All Plans</a>
        </div>
      </section>
    </aside>
  );
}
