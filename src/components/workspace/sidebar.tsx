import {BadgeCheck, Folder, Gauge, ListChecks, Search, ShieldCheck, Sparkles} from "lucide-react";
import clsx from "clsx";
import type {WorkspaceCopy} from "./copy";
import type {AssetView, CurrentUser, TaskListItem, TeamSnapshot, UsageSnapshot} from "./types";
import {AssetTab, PanelTitle, QuotaLine} from "./primitives";
import {formatDateTime, formatTaskListDetail, taskDisplayName, translationPreview, truncateText} from "./format";

export function MarketingSidebar({copy, locale}: {copy: WorkspaceCopy; locale: string}) {
  return (
    <aside className="grid content-start gap-4">
      <section className="rounded-2xl border border-ink/10 bg-white/70 p-4 shadow-soft">
        <PanelTitle icon={<Sparkles size={18} />} label="Votxt" />
        <p className="mt-3 text-sm leading-6 text-ink/68">{copy.marketingIntro}</p>
        <div className="mt-4 grid gap-2">
          <a className="btn-accent w-full" href={`/${locale}/auth/signup`}>{copy.freeSignup}</a>
          <a className="btn-outline w-full" href={`/${locale}/dashboard`}>{copy.viewDashboard}</a>
        </div>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white/70 p-4 shadow-soft">
        <PanelTitle icon={<ListChecks size={18} />} label={copy.converterTools} />
        <div className="mt-3 flex flex-wrap gap-2">
          {copy.converters.map((item) => (
            <span key={item} className="rounded-full bg-paper/70 px-2.5 py-1 text-xs font-bold text-ink/70 ring-1 ring-ink/5 transition hover:bg-tide/10 hover:text-tide">{item}</span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white/70 p-4 shadow-soft">
        <PanelTitle icon={<Gauge size={18} />} label={copy.freePlan} />
        <div className="mt-4 grid gap-3">
          <QuotaLine label={copy.dailyFiles} value="3" percent={32} />
          <QuotaLine label={copy.monthlyMinutes} value="120 min" percent={38} />
          <QuotaLine label={copy.queueTasks} value="5" percent={50} />
        </div>
      </section>
    </aside>
  );
}

export function WorkspaceSidebar({
  t,
  copy,
  locale,
  tasks,
  user,
  teamSnapshot,
  usageSnapshot,
  assetView,
  setAssetView,
  assetSearch,
  setAssetSearch,
  activeTaskId,
  onSelectTask
}: {
  t: (key: string) => string;
  copy: WorkspaceCopy;
  locale: string;
  tasks: TaskListItem[];
  user: CurrentUser | null;
  teamSnapshot: TeamSnapshot | null;
  usageSnapshot: UsageSnapshot | null;
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
  const quotaPercent = quota > 0 ? Math.min(100, Math.round((usedMinutes / quota) * 100)) : 0;
  const dailyUsed = usageSnapshot?.dailyFree.used ?? user?.dailyFreeCount ?? 0;
  const dailyLimit = usageSnapshot?.dailyFree.limit ?? 3;
  const dailyPercent = dailyLimit > 0 ? Math.min(100, Math.round((dailyUsed / dailyLimit) * 100)) : 0;
  const normalizedSearch = assetSearch.trim().toLowerCase();
  const filteredTasks = tasks.filter((item) => {
    if (!normalizedSearch) return true;
    return [item.originalName, item.status, item.provider, item.sourceType]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  });
  const translationAssets = filteredTasks
    .map((item) => ({task: item, translation: item.insights?.find((insight) => insight.type === "TRANSLATION")}))
    .filter((item): item is {task: TaskListItem; translation: NonNullable<TaskListItem["insights"]>[number]} => Boolean(item.translation));

  return (
    <aside className="grid content-start gap-4">
      <section className="rounded-2xl border border-ink/10 bg-white/70 p-4 shadow-soft">
        <PanelTitle icon={<BadgeCheck size={18} />} label={copy.account} />
        <div className="mt-3">
          <p className="break-words text-sm font-black">{user?.name || copy.anonymousUser}</p>
          <p className="mt-1 break-words text-xs font-bold text-ink/55">{user?.email || copy.loginSyncHint}</p>
          <p className="chip-tide mt-2">{planName}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white/70 p-4 shadow-soft">
        <PanelTitle icon={<ShieldCheck size={18} />} label={copy.teamSpace} />
        <div className="mt-3">
          <p className="break-words text-sm font-black">{teamSnapshot?.team.name || copy.defaultTeam}</p>
          <p className="mt-1 text-xs font-bold text-ink/55">{teamSnapshot?.membership.role || "OWNER"} · {copy.memberCount(teamSnapshot?.members.length ?? 1)}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold">
            <div className="rounded-xl bg-paper/70 p-2.5 ring-1 ring-ink/5">
              <div className="text-ink/50">{copy.members}</div>
              <div className="mt-1 text-base text-ink">{teamSnapshot?.members.length ?? 1}</div>
            </div>
            <div className="rounded-xl bg-paper/70 p-2.5 ring-1 ring-ink/5">
              <div className="text-ink/50">API Key</div>
              <div className="mt-1 text-base text-ink">{teamSnapshot?.apiKeys.length ?? 0}</div>
            </div>
            <div className="rounded-xl bg-paper/70 p-2.5 ring-1 ring-ink/5">
              <div className="text-ink/50">Webhook</div>
              <div className="mt-1 text-base text-ink">{teamSnapshot?.webhookEndpoints.length ?? 0}</div>
            </div>
            <div className="rounded-xl bg-paper/70 p-2.5 ring-1 ring-ink/5">
              <div className="text-ink/50">{copy.retention}</div>
              <div className="mt-1 text-base text-ink">{teamSnapshot?.team.retentionDays ?? 180} {copy.days}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white/70 p-4 shadow-soft">
        <PanelTitle icon={<Gauge size={18} />} label={t("quotaTitle")} />
        <div className="mt-4 grid gap-3">
          <QuotaLine label={t("quotaFiles")} value={`${dailyUsed} / ${dailyLimit}`} percent={dailyPercent} />
          <QuotaLine label={t("quotaMinutes")} value={`${usedMinutes} / ${quota} min`} percent={quotaPercent} />
        </div>
        {usageSnapshot ? (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold">
            <div className="rounded-xl bg-paper/70 p-2.5 ring-1 ring-ink/5">
              <div className="text-ink/50">{copy.monthTasks}</div>
              <div className="mt-1 text-base text-ink">{usageSnapshot.tasks.periodCount}</div>
            </div>
            <div className="rounded-xl bg-paper/70 p-2.5 ring-1 ring-ink/5">
              <div className="text-ink/50">{copy.remainingMinutes}</div>
              <div className="mt-1 text-base text-ink">{remaining}</div>
            </div>
          </div>
        ) : null}
        <a href={`/${locale}/pricing`} className="btn-primary mt-4 w-full">{t("upgradePlan")}</a>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white/70 p-4 shadow-soft">
        <PanelTitle icon={<Folder size={18} />} label={t("folders")} />
        <div className="mt-3 rounded-xl bg-paper/70 px-3 py-2 text-sm font-bold ring-1 ring-ink/5">{t("uncategorized")}</div>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white/70 p-4 shadow-soft">
        <div className="flex items-center justify-between gap-2">
          <PanelTitle icon={<ListChecks size={18} />} label={t("taskList")} />
          <span className="rounded-full bg-paper/80 px-2.5 py-1 text-xs font-black text-ink/55 ring-1 ring-ink/5">{filteredTasks.length}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-ink/[0.06] p-1">
          <AssetTab active={assetView === "transcripts"} label={copy.transcriptTab} onClick={() => setAssetView("transcripts")} />
          <AssetTab active={assetView === "translations"} label={copy.translationTab} onClick={() => setAssetView("translations")} />
        </div>
        <label className="mt-3 flex items-center gap-2 rounded-xl border border-ink/15 bg-paper/70 px-3 py-2 transition focus-within:border-tide">
          <Search size={15} className="text-ink/50" />
          <input value={assetSearch} onChange={(event) => setAssetSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder={t("searchPlaceholder")} />
        </label>
        <div className="mt-3 grid gap-2">
          {assetView === "transcripts" ? (
            <>
              {filteredTasks.map((item) => (
                <TranscriptAssetRow key={item.id} item={item} copy={copy} active={activeTaskId === item.id} onSelectTask={onSelectTask} />
              ))}
              {!filteredTasks.length ? <p className="rounded-xl border border-ink/10 bg-paper/60 p-3 text-sm leading-6 text-ink/60">{copy.noTranscriptAssets}</p> : null}
            </>
          ) : (
            <>
              {translationAssets.map(({task: item, translation}) => (
                <TranslationAssetRow key={`${item.id}-${translation.updatedAt || translation.createdAt || translation.type}`} item={item} translation={translation} copy={copy} active={activeTaskId === item.id} onSelectTask={onSelectTask} />
              ))}
              {!translationAssets.length ? <p className="rounded-xl border border-ink/10 bg-paper/60 p-3 text-sm leading-6 text-ink/60">{copy.noTranslationAssets}</p> : null}
            </>
          )}
        </div>
      </section>
    </aside>
  );
}

function TranscriptAssetRow({item, copy, active, onSelectTask}: {item: TaskListItem; copy: WorkspaceCopy; active: boolean; onSelectTask: (taskId: string) => void}) {
  return (
    <button key={item.id} type="button" onClick={() => onSelectTask(item.id)} className={clsx("focus-ring rounded-xl border border-ink/10 bg-paper/55 p-3 text-left transition hover:-translate-y-0.5 hover:border-ink/20 hover:bg-white/85 hover:shadow-soft", active && "border-tide/50 bg-tide/[0.07]")}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 break-words text-sm font-black">{taskDisplayName(item, copy)}</h3>
        <span className={clsx("shrink-0 rounded-full px-2 py-1 text-[11px] font-black", item.status === "FAILED" ? "bg-coral/10 text-coral" : "bg-tide/10 text-tide")}>{item.status}</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-ink/60">{formatTaskListDetail(item, copy)}</p>
    </button>
  );
}

function TranslationAssetRow({
  item,
  translation,
  copy,
  active,
  onSelectTask
}: {
  item: TaskListItem;
  translation: NonNullable<TaskListItem["insights"]>[number];
  copy: WorkspaceCopy;
  active: boolean;
  onSelectTask: (taskId: string) => void;
}) {
  const targetLanguage = translation.content?.targetLanguage || translation.content?.target || copy.targetLanguage;
  return (
    <button type="button" onClick={() => onSelectTask(item.id)} className={clsx("focus-ring rounded-xl border border-ink/10 bg-paper/55 p-3 text-left transition hover:-translate-y-0.5 hover:border-ink/20 hover:bg-white/85 hover:shadow-soft", active && "border-tide/50 bg-tide/[0.07]")}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 break-words text-sm font-black">{taskDisplayName(item, copy)}</h3>
        <span className="shrink-0 rounded-full bg-brass/15 px-2 py-1 text-[11px] font-black text-ink">{targetLanguage}</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-ink/60">{truncateText(translationPreview(translation.content, copy), 96)}</p>
      <p className="mt-2 text-[11px] font-bold text-ink/45">{formatDateTime(translation.updatedAt || translation.createdAt || item.completedAt || item.createdAt, copy)}</p>
    </button>
  );
}
