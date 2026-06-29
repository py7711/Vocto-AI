"use client";

import type {ReactNode} from "react";
import {useEffect, useMemo, useState} from "react";
import {useLocale} from "next-intl";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Cloud,
  CreditCard,
  Globe2,
  Languages,
  LockKeyhole,
  Save,
  ShieldCheck,
  Trash2,
  UserRound
} from "lucide-react";
import clsx from "clsx";
import {SiteHeader} from "@/components/site-shell";
import type {CurrentUser, UsageSnapshot} from "@/components/workspace/types";

const tabs = [
  {id: "profile", label: "Profile", icon: UserRound},
  {id: "security", label: "Account Security", icon: ShieldCheck},
  {id: "usage", label: "Usage", icon: CreditCard},
  {id: "preferences", label: "Preferences", icon: Languages},
  {id: "notifications", label: "Notifications", icon: Bell},
  {id: "integrations", label: "Integrations", icon: Cloud},
  {id: "danger", label: "Danger Zone", icon: AlertTriangle}
] as const;

type TabId = (typeof tabs)[number]["id"];

function splitName(name?: string | null) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ")
  };
}

function formatDateTime(value?: string | null) {
  const date = value ? new Date(value) : (() => {
    const fallback = new Date();
    fallback.setMonth(fallback.getMonth() + 1);
    return fallback;
  })();
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function SettingSection({
  id,
  title,
  description,
  children
}: {
  id: TabId;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="rounded-xl border border-ink/10 bg-white p-5 shadow-soft">
      <div>
        <h2 className="text-lg font-black text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-ink/60">{description}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function TextField({label, value, placeholder, type = "text", onChange}: {label: string; value?: string; placeholder?: string; type?: string; onChange: (value: string) => void}) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-ink/70">
      {label}
      <input className="field" value={value ?? ""} placeholder={placeholder} type={type} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ToggleRow({title, description, defaultChecked = true}: {title: string; description: string; defaultChecked?: boolean}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-ink/10 bg-paper/50 p-4">
      <div>
        <p className="font-black text-ink">{title}</p>
        <p className="mt-1 text-sm leading-6 text-ink/60">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked((value) => !value)}
        className={clsx(
          "relative h-7 w-12 shrink-0 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet",
          checked ? "bg-violet" : "bg-ink/20"
        )}
      >
        <span className={clsx("absolute top-1 h-5 w-5 rounded-full bg-white shadow-soft transition", checked ? "left-6" : "left-1")} />
      </button>
    </div>
  );
}

function Badge({children, tone = "neutral"}: {children: React.ReactNode; tone?: "neutral" | "success" | "beta"}) {
  return (
    <span className={clsx(
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-black",
      tone === "success" && "bg-sage/15 text-sage",
      tone === "beta" && "bg-violet/10 text-violet",
      tone === "neutral" && "bg-ink/7 text-ink/65"
    )}>
      {children}
    </span>
  );
}

export function SettingsPage() {
  const locale = useLocale();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [usage, setUsage] = useState<UsageSnapshot | null>(null);
  const [active, setActive] = useState<TabId>("profile");
  const [notice, setNotice] = useState<string | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", {cache: "no-store"})
      .then((response) => (response.ok ? response.json() : {user: null}))
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));

    fetch("/api/account/usage", {cache: "no-store"})
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setUsage(data))
      .catch(() => setUsage(null));
  }, []);

  const nameParts = useMemo(() => splitName(user?.name), [user?.name]);
  useEffect(() => {
    setFirstName(nameParts.firstName);
    setLastName(nameParts.lastName);
    setEmailDraft(user?.email ?? "");
  }, [nameParts.firstName, nameParts.lastName, user?.email]);

  const plan = usage?.subscription.plan ?? user?.subscriptions?.[0]?.plan ?? "Free";
  const quota = usage?.subscription.monthlyMinuteQuota ?? user?.subscriptions?.[0]?.monthlyMinuteQuota ?? 120;
  const remaining = usage?.subscription.remainingMinutes ?? user?.subscriptions?.[0]?.remainingMinutes ?? quota;
  const used = usage?.subscription.usedMinutes ?? Math.max(0, quota - remaining);
  const resetAt = formatDateTime(usage?.subscription.currentPeriodEnd ?? user?.dailyResetAt);
  const isPaid = plan !== "FREE" && plan !== "Free";

  async function openBillingPortal() {
    setPortalBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({returnPath: `/${locale}/settings?portal=returned`})
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        window.location.href = `/${locale}/auth/signin`;
        return;
      }
      if (response.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setNotice(data.error ?? "Billing portal is available after a paid subscription is connected.");
    } finally {
      setPortalBusy(false);
    }
  }

  async function updateAccountSettings(payload: {firstName?: string; lastName?: string; email?: string; password?: string}, successMessage: string) {
    setSettingsBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        window.location.href = `/${locale}/auth/signin`;
        return;
      }
      if (!response.ok) throw new Error(data.error ?? "无法更新账号设置。");
      setUser(data.user ?? user);
      setNotice(successMessage);
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSettingsBusy(false);
    }
  }

  async function saveProfile() {
    await updateAccountSettings({firstName, lastName}, "个人资料已更新。");
  }

  async function updateEmail() {
    await updateAccountSettings({email: emailDraft}, "邮箱登录地址已更新。");
  }

  async function updatePassword() {
    if (newPassword !== confirmPassword) {
      setNotice("两次输入的密码不一致。");
      return;
    }
    await updateAccountSettings({password: newPassword}, "密码已更新。");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function deactivateAccount() {
    if (!window.confirm("确定要永久删除你的 UniScribe 账号和所有数据吗？")) return;
    const response = await fetch("/api/account/deactivate", {method: "DELETE"});
    if (response.ok) {
      window.location.href = `/${locale}`;
      return;
    }
    const data = await response.json().catch(() => ({}));
    setNotice(data.error ?? "无法删除账号。");
  }

  return (
    <main className="min-h-screen bg-paper">
      <SiteHeader />
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="grid content-start gap-4">
          <section className="rounded-xl border border-ink/10 bg-white p-4 shadow-soft">
            <a href={`/${locale}/dashboard`} className="btn-ghost w-fit px-2.5 py-2">
              <ArrowLeft size={16} />
              Back
            </a>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-ink">Settings</h1>
            <p className="mt-2 text-sm leading-6 text-ink/60">Manage your account settings and preferences</p>
          </section>

          <nav className="rounded-xl border border-ink/10 bg-white p-2 shadow-soft" aria-label="Settings sections">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <a
                  key={tab.id}
                  href={`#${tab.id}`}
                  onClick={() => setActive(tab.id)}
                  className={clsx(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-black transition",
                    active === tab.id ? "bg-violet text-white shadow-soft" : "text-ink/65 hover:bg-paper hover:text-ink"
                  )}
                >
                  <Icon size={16} />
                  {tab.label}
                </a>
              );
            })}
          </nav>
        </aside>

        <div className="grid gap-5">
          {notice ? <p className="rounded-xl border border-violet/20 bg-violet/10 px-4 py-3 text-sm font-bold text-violet">{notice}</p> : null}

          <SettingSection id="profile" title="Profile" description="Manage your personal information">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-violet text-lg font-black uppercase text-white">
                {(nameParts.firstName || user?.email || "U").slice(0, 1)}
              </div>
              <div>
                <h3 className="text-lg font-black text-ink">{user?.name || "UniScribe user"}</h3>
                <p className="text-sm font-bold text-ink/55">{user?.email || "Sign in to sync your profile"}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="First Name" value={firstName} onChange={setFirstName} />
              <TextField label="Last Name" value={lastName} onChange={setLastName} />
            </div>
            <button type="button" className="btn-primary mt-5" onClick={saveProfile} disabled={settingsBusy}>
              <Save size={16} />
              {settingsBusy ? "Saving..." : "Save"}
            </button>
          </SettingSection>

          <SettingSection id="security" title="Account Security" description="Manage your sign-in methods, email, and password security.">
            <p className="text-sm font-black text-ink">Sign-in methods</p>
            <p className="mt-1 text-sm leading-6 text-ink/60">Google 邮箱由 Google 管理；邮箱登录地址在这里管理。</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-ink/10 bg-paper/55 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black">Email + Password</p>
                  <Badge>Password not set</Badge>
                </div>
                <p className="mt-2 break-words text-sm font-bold text-ink/60">{user?.email || "Not signed in"}</p>
              </div>
              <div className="rounded-lg border border-ink/10 bg-paper/55 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black">Google Sign-In</p>
                  <Badge tone="success">Linked</Badge>
                </div>
                <p className="mt-2 break-words text-sm font-bold text-ink/60">{user?.email || "Connect Google to sign in faster"}</p>
              </div>
            </div>
            <div className="mt-5 border-t border-ink/10 pt-5">
              <h3 className="font-black">Change Email Login Address</h3>
              <p className="mt-1 text-sm leading-6 text-ink/60">Current email login address: {user?.email || "Not signed in"}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input className="field" placeholder="Enter a new email login address" value={emailDraft} onChange={(event) => setEmailDraft(event.target.value)} />
                <button type="button" className="btn-outline" onClick={updateEmail} disabled={settingsBusy || !emailDraft.includes("@")}>Update Email</button>
              </div>
            </div>
            <div className="mt-5 border-t border-ink/10 pt-5">
              <h3 className="font-black">Set or Change Password</h3>
              <p className="mt-1 text-sm leading-6 text-ink/60">Set a password to complete email login setup.</p>
              <p className="mt-2 rounded-lg bg-paper px-3 py-2 text-sm font-bold text-ink/60">Email identity is linked, but password is not set yet.</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <TextField label="New Password" placeholder="New password" type="password" value={newPassword} onChange={setNewPassword} />
                <TextField label="Confirm Password" placeholder="Confirm password" type="password" value={confirmPassword} onChange={setConfirmPassword} />
              </div>
              <button type="button" className="btn-primary mt-4" onClick={updatePassword} disabled={settingsBusy || newPassword.length < 8 || confirmPassword.length < 8}>
                <LockKeyhole size={16} />
                {settingsBusy ? "Saving..." : "Set Password"}
              </button>
            </div>
          </SettingSection>

          <SettingSection id="usage" title="Usage" description="View your account usage and remaining credits">
            <div className="rounded-xl border border-ink/10 bg-paper/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black capitalize">{String(plan).toLowerCase()}</h3>
                  <Badge>{plan}</Badge>
                </div>
                <button type="button" className="btn-primary" onClick={openBillingPortal} disabled={portalBusy}>
                  {portalBusy ? "Opening..." : isPaid ? "Manage Billing" : "Upgrade Now"}
                </button>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-ink/10">
                <div className="h-full rounded-full bg-violet" style={{width: `${quota ? Math.min(100, Math.round((used / quota) * 100)) : 0}%`}} />
              </div>
              <div className="mt-3 grid gap-3 text-sm font-bold text-ink/65 sm:grid-cols-3">
                <p>Used: <span className="text-ink">{used}</span></p>
                <p>Total: <span className="text-ink">{quota}</span></p>
                <p>Resets on {resetAt}</p>
              </div>
            </div>
          </SettingSection>

          <SettingSection id="preferences" title="Preferences" description="Manage your application preferences">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-ink/10 bg-paper/55 p-4">
                <div className="flex items-center gap-2 font-black"><Globe2 size={17} /> Interface Language</div>
                <p className="mt-1 text-sm leading-6 text-ink/60">Choose your preferred language for the application interface</p>
                <button type="button" className="btn-outline mt-3 w-full justify-between">English</button>
              </div>
              <div className="rounded-lg border border-ink/10 bg-paper/55 p-4">
                <div className="flex items-center gap-2 font-black"><Globe2 size={17} /> Time Zone</div>
                <p className="mt-1 text-sm leading-6 text-ink/60">Select your time zone</p>
                <button type="button" className="btn-outline mt-3 w-full justify-between">Asia/Hong Kong</button>
              </div>
            </div>
          </SettingSection>

          <SettingSection id="notifications" title="Email Notifications" description="Manage your email notification preferences">
            <div className="grid gap-3">
              <ToggleRow title="Transcription Success Notifications" description="Receive notifications when your audio transcription is complete" />
              <ToggleRow title="Transcription Quota Reset Notifications" description="Receive notifications when your transcription quota is reset" />
              <ToggleRow title="Product Updates and New Features" description="Receive notifications about product updates and new features" />
            </div>
          </SettingSection>

          <SettingSection id="integrations" title="Integrations" description="Manage your connections with third-party cloud storage and services">
            <div className="rounded-xl border border-ink/10 bg-paper/55 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 font-black"><Cloud size={17} /> Google Drive</h3>
                  <p className="mt-1 text-sm leading-6 text-ink/60">Import audio and video files directly from your Google Drive.</p>
                </div>
                <Badge>Not Connected</Badge>
              </div>
              <button type="button" className="btn-outline mt-4" onClick={() => setNotice("Google Drive connection is currently read-only.")}>Connect</button>
            </div>
          </SettingSection>

          <SettingSection id="danger" title="Danger Zone" description="Actions that cannot be undone">
            <div className="rounded-xl border border-coral/25 bg-coral/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-black text-coral">Delete Account</p>
                  <p className="mt-1 text-sm leading-6 text-ink/60">永久删除你的账号和所有数据</p>
                </div>
                <button type="button" className="btn border border-coral/30 bg-white text-coral hover:bg-coral/10" onClick={deactivateAccount}>
                  <Trash2 size={16} />
                  Delete Account
                </button>
              </div>
            </div>
          </SettingSection>
        </div>
      </div>
    </main>
  );
}
