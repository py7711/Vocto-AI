import {Brain, Download, FileText, Folder, Gauge, ListChecks, LockKeyhole, Network, ShieldCheck} from "lucide-react";
import clsx from "clsx";
import type {WorkspaceCopy} from "./copy";
import type {TeamSnapshot, UsageSnapshot} from "./types";
import {PanelTitle, UsageMetric} from "./primitives";
import {dateLocale, formatDate, formatDateTime} from "./format";

export function DashboardSections({t, copy}: {t: (key: string) => string; copy: WorkspaceCopy}) {
  return (
    <section className="border-t border-ink/10 bg-white/55 px-4 py-10 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-ink/10 bg-paper/60 p-6 transition hover:-translate-y-0.5 hover:border-tide/25 hover:shadow-card">
          <PanelTitle icon={<Folder size={18} />} label={copy.assetManagement} />
          <p className="mt-3 text-sm leading-6 text-ink/68">{copy.assetManagementText}</p>
        </article>
        <article className="rounded-2xl border border-ink/10 bg-paper/60 p-6 transition hover:-translate-y-0.5 hover:border-tide/25 hover:shadow-card">
          <PanelTitle icon={<Brain size={18} />} label={copy.aiPost} />
          <p className="mt-3 text-sm leading-6 text-ink/68">{copy.aiPostText}</p>
        </article>
        <article className="rounded-2xl border border-ink/10 bg-paper/60 p-6 transition hover:-translate-y-0.5 hover:border-tide/25 hover:shadow-card">
          <PanelTitle icon={<Download size={18} />} label={t("exports")} />
          <p className="mt-3 text-sm leading-6 text-ink/68">{copy.exportText}</p>
        </article>
      </div>
    </section>
  );
}

export function EnterprisePanel({
  teamSnapshot,
  usageSnapshot,
  copy,
  inviteEmail,
  setInviteEmail,
  apiKeyName,
  setApiKeyName,
  newApiKey,
  webhookName,
  setWebhookName,
  webhookUrl,
  setWebhookUrl,
  newWebhookSecret,
  createTeamApiKey,
  createTeamWebhook,
  inviteTeamMember,
  busy,
  notice
}: {
  teamSnapshot: TeamSnapshot | null;
  usageSnapshot: UsageSnapshot | null;
  copy: WorkspaceCopy;
  inviteEmail: string;
  setInviteEmail: (value: string) => void;
  apiKeyName: string;
  setApiKeyName: (value: string) => void;
  newApiKey: string | null;
  webhookName: string;
  setWebhookName: (value: string) => void;
  webhookUrl: string;
  setWebhookUrl: (value: string) => void;
  newWebhookSecret: string | null;
  createTeamApiKey: () => void;
  createTeamWebhook: () => void;
  inviteTeamMember: () => void;
  busy: boolean;
  notice: string | null;
}) {
  return (
    <section className="border-t border-ink/10 bg-paper/70 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <PanelTitle icon={<ShieldCheck size={18} />} label={copy.enterpriseConsole} />
            <h2 className="mt-2 text-2xl font-black text-ink">{teamSnapshot?.team.name || copy.defaultTeam}</h2>
          </div>
          <span className="chip-tide">{teamSnapshot?.membership.role || "OWNER"}</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-ink/10 bg-white/75 p-5 shadow-soft">
            <PanelTitle icon={<ListChecks size={18} />} label={copy.teamMembers} />
            <div className="mt-4 flex gap-2">
              <input
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                className="field flex-1"
                placeholder="member@company.com"
              />
              <button onClick={inviteTeamMember} disabled={busy || !inviteEmail.trim()} className="btn-primary px-4">
                {copy.invite}
              </button>
            </div>
            <div className="mt-4 grid gap-2">
              {(teamSnapshot?.members ?? []).slice(0, 5).map((member) => (
                <div key={member.id} className="rounded-xl border border-ink/10 bg-paper/55 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-black">{member.user?.name || member.invitedEmail || member.user?.email}</p>
                      <p className="mt-1 break-words text-xs text-ink/55">{member.user?.email || member.invitedEmail}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-tide/10 px-2 py-1 text-[11px] font-black text-tide">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white/75 p-5 shadow-soft">
            <PanelTitle icon={<LockKeyhole size={18} />} label="API Key" />
            <div className="mt-4 flex gap-2">
              <input
                value={apiKeyName}
                onChange={(event) => setApiKeyName(event.target.value)}
                className="field flex-1"
                placeholder={copy.productionApi}
              />
              <button onClick={createTeamApiKey} disabled={busy || !apiKeyName.trim()} className="btn-primary px-4">
                {copy.create}
              </button>
            </div>
            {newApiKey ? (
              <button
                onClick={() => navigator.clipboard.writeText(newApiKey)}
                className="focus-ring mt-3 w-full rounded-xl border border-coral/30 bg-coral/[0.07] px-3 py-2 text-left text-xs font-bold leading-5 text-coral transition hover:bg-coral/10"
              >
                {newApiKey}
              </button>
            ) : null}
            <div className="mt-4 grid gap-2">
              {(teamSnapshot?.apiKeys ?? []).slice(0, 5).map((apiKey) => (
                <div key={apiKey.id} className="rounded-xl border border-ink/10 bg-paper/55 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-black">{apiKey.name}</p>
                      <p className="mt-1 text-xs text-ink/55">{apiKey.keyPrefix}... · {apiKey.status}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-bold text-ink/50">{formatDate(apiKey.createdAt, dateLocale(copy))}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white/75 p-5 shadow-soft">
            <PanelTitle icon={<Network size={18} />} label={copy.enterpriseWebhook} />
            <div className="mt-4 grid gap-2 sm:grid-cols-[0.8fr_1.2fr_auto]">
              <input
                value={webhookName}
                onChange={(event) => setWebhookName(event.target.value)}
                className="field"
                placeholder={copy.webhookName}
              />
              <input
                value={webhookUrl}
                onChange={(event) => setWebhookUrl(event.target.value)}
                className="field"
                placeholder="https://example.com/votxt/webhook"
              />
              <button onClick={createTeamWebhook} disabled={busy || !webhookName.trim() || !webhookUrl.trim()} className="btn-primary px-4">
                {copy.create}
              </button>
            </div>
            {newWebhookSecret ? (
              <button
                onClick={() => navigator.clipboard.writeText(newWebhookSecret)}
                className="focus-ring mt-3 w-full rounded-xl border border-coral/30 bg-coral/[0.07] px-3 py-2 text-left text-xs font-bold leading-5 text-coral transition hover:bg-coral/10"
              >
                {newWebhookSecret}
              </button>
            ) : null}
            <div className="mt-4 grid gap-2">
              {(teamSnapshot?.webhookEndpoints ?? []).slice(0, 5).map((webhook) => (
                <div key={webhook.id} className="rounded-xl border border-ink/10 bg-paper/55 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-black">{webhook.name}</p>
                      <p className="mt-1 break-words text-xs text-ink/55">{webhook.url}</p>
                      <p className="mt-1 text-xs text-ink/55">{webhook.status} · {copy.webhookFailure(webhook.failureCount)} · {webhook.secretPrefix}...</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-bold text-ink/50">{formatDate(webhook.createdAt, dateLocale(copy))}</span>
                  </div>
                  {webhook.deliveries?.[0] ? (
                    <p className="mt-2 rounded-lg bg-white/65 px-2 py-1 text-xs font-bold text-ink/60">
                      {copy.recentDelivery}: {webhook.deliveries[0].event} · {webhook.deliveries[0].status}
                    </p>
                  ) : null}
                </div>
              ))}
              {!teamSnapshot?.webhookEndpoints?.length ? <p className="text-sm leading-6 text-ink/60">{copy.webhookEmpty}</p> : null}
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white/75 p-5 shadow-soft">
            <PanelTitle icon={<FileText size={18} />} label={copy.auditLogs} />
            <div className="mt-4 grid max-h-80 gap-2 overflow-auto pr-1">
              {(teamSnapshot?.auditLogs ?? []).slice(0, 8).map((log) => (
                <div key={log.id} className="rounded-xl border border-ink/10 bg-paper/55 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-black">{log.action}</p>
                      <p className="mt-1 text-xs text-ink/55">{log.user?.name || log.user?.email || copy.system} · {log.targetType}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-bold text-ink/50">{formatDate(log.createdAt, dateLocale(copy))}</span>
                  </div>
                </div>
              ))}
              {!teamSnapshot?.auditLogs?.length ? <p className="text-sm leading-6 text-ink/60">{copy.auditEmpty}</p> : null}
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white/75 p-5 shadow-soft lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <PanelTitle icon={<Gauge size={18} />} label={copy.usageLedger} />
              {usageSnapshot ? (
                <span className="rounded-full bg-tide/10 px-3 py-1 text-xs font-black text-tide">
                  {formatDateTime(usageSnapshot.subscription.currentPeriodStart, copy)} - {formatDateTime(usageSnapshot.subscription.currentPeriodEnd, copy)}
                </span>
              ) : null}
            </div>
            {usageSnapshot ? (
              <>
                <div className="mt-4 grid gap-2 sm:grid-cols-4">
                  <UsageMetric label={copy.plan} value={usageSnapshot.subscription.plan} />
                  <UsageMetric label={copy.usedThisMonth} value={`${usageSnapshot.subscription.usedMinutes} min`} />
                  <UsageMetric label={copy.remainingMinutes} value={`${usageSnapshot.subscription.remainingMinutes} min`} />
                  <UsageMetric label={copy.monthTasks} value={String(usageSnapshot.tasks.periodCount)} />
                </div>
                <div className="mt-4 grid max-h-80 gap-2 overflow-auto pr-1">
                  {usageSnapshot.ledger.entries.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="rounded-xl border border-ink/10 bg-paper/55 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-black">{entry.mediaTask?.originalName || entry.reason || copy.quotaAdjustment}</p>
                          <p className="mt-1 text-xs text-ink/55">{entry.type} · {entry.reason || entry.mediaTask?.status || copy.usageChange}</p>
                        </div>
                        <div className="text-right">
                          <p className={clsx("text-sm font-black", entry.minutesDelta < 0 ? "text-coral" : "text-tide")}>{entry.minutesDelta > 0 ? "+" : ""}{entry.minutesDelta} min</p>
                          <p className="mt-1 text-[11px] font-bold text-ink/50">{formatDateTime(entry.createdAt, copy)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!usageSnapshot.ledger.entries.length ? <p className="rounded-xl border border-ink/10 bg-paper/55 p-3 text-sm leading-6 text-ink/60">{copy.noLedger}</p> : null}
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm leading-6 text-ink/60">{copy.usageLoginEmpty}</p>
            )}
          </section>
        </div>
        {notice ? <p className="mt-4 animate-fade-in rounded-xl border border-tide/30 bg-tide/10 px-3 py-2 text-sm text-tide">{notice}</p> : null}
      </div>
    </section>
  );
}
