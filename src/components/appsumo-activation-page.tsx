"use client";

import {useMemo, useState} from "react";
import {useLocale} from "next-intl";
import {ArrowRight, BadgeCheck, CheckCircle2, Gift, Loader2, ShieldCheck, Sparkles, TicketCheck} from "lucide-react";
import {SiteHeader} from "@/components/site-shell";

type ActivationResult = {
  activated?: boolean;
  code?: string;
  subscription?: {
    id: string;
    plan: string;
    status: string;
    monthlyMinuteQuota: number;
    remainingMinutes: number;
    maxSingleFileMinutes: number;
  };
  error?: string;
};

const planOptions = [
  {id: "PRO", label: "Pro", detail: "6,000 minutes/year compatibility grant"},
  {id: "STANDARD", label: "Standard", detail: "1,800 minutes/year compatibility grant"},
  {id: "BASIC", label: "Basic", detail: "600 minutes/year compatibility grant"}
] as const;

export function AppSumoActivationPage() {
  const locale = useLocale();
  const [code, setCode] = useState("");
  const [plan, setPlan] = useState<(typeof planOptions)[number]["id"]>("PRO");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ActivationResult | null>(null);

  const normalizedCode = useMemo(() => code.trim().toUpperCase(), [code]);

  async function submitActivation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setResult(null);

    try {
      const response = await fetch("/auth/appsumo/activate", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({code: normalizedCode, plan})
      });
      const data = (await response.json().catch(() => ({}))) as ActivationResult;
      if (response.status === 401) {
        window.location.href = `/${locale}/auth/signin?next=${encodeURIComponent(`/${locale}/auth/appsumo`)}`;
        return;
      }
      if (!response.ok || !data.activated) {
        throw new Error(data.error ?? "无法激活该 AppSumo 许可证。");
      }
      localStorage.setItem("appsumo_onboarding_needed", "true");
      setResult(data);
      setMessage("许可证已激活，正在打开工作台...");
      window.setTimeout(() => {
        window.location.href = `/${locale}/dashboard`;
      }, 1200);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/10 via-white to-violet/10 text-ink">
      <SiteHeader primaryCta={{href: `/${locale}/dashboard`, label: "Dashboard", icon: <ArrowRight size={16} />}} />
      <section className="px-4 pb-16 pt-32 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet/20 bg-white px-3 py-1.5 text-sm font-black text-violet shadow-soft">
              <TicketCheck size={16} />
              UniScribe x AppSumo
            </div>
            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight text-ink md:text-5xl">Activate your AppSumo license</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-ink/65">
              Redeem your lifetime deal code, attach it to the signed-in UniScribe account, and continue to the dashboard with the AppSumo welcome flow.
            </p>
            <div className="mt-8 grid gap-3 text-sm font-bold text-ink/70 sm:grid-cols-3">
              {[
                ["Annual LTD quota", Gift],
                ["Dashboard onboarding", Sparkles],
                ["Secure account binding", ShieldCheck]
              ].map(([label, Icon]) => (
                <div key={label as string} className="rounded-lg border border-ink/10 bg-white/80 p-4 shadow-soft">
                  <Icon className="mb-3 text-violet" size={22} />
                  {label as string}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={submitActivation} className="rounded-xl border border-ink/10 bg-white p-5 shadow-card md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-violet">License code</p>
                <h2 className="mt-1 text-2xl font-black text-ink">Redeem AppSumo</h2>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-violet/10 text-violet">
                <BadgeCheck size={23} />
              </span>
            </div>

            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-black text-ink/70">AppSumo code</span>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="field text-base font-black uppercase tracking-wide"
                placeholder="APPSUMO-XXXX-XXXX"
                autoComplete="off"
                required
              />
            </label>

            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-black text-ink/70">License tier</legend>
              <div className="grid gap-2">
                {planOptions.map((option) => (
                  <label key={option.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-ink/10 bg-paper/50 p-3 transition hover:border-violet/30 hover:bg-violet/5">
                    <input type="radio" name="plan" value={option.id} checked={plan === option.id} onChange={() => setPlan(option.id)} className="h-4 w-4 accent-violet" />
                    <span className="min-w-0">
                      <span className="block font-black text-ink">{option.label}</span>
                      <span className="block text-xs font-bold text-ink/55">{option.detail}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {message ? (
              <div className={`mt-5 rounded-lg border px-4 py-3 text-sm font-bold ${result?.activated ? "border-sage/25 bg-sage/10 text-sage" : "border-coral/30 bg-coral/10 text-coral"}`}>
                {message}
              </div>
            ) : null}

            {result?.subscription ? (
              <div className="mt-5 rounded-lg border border-violet/15 bg-violet/5 p-4 text-sm text-ink/70">
                <p className="flex items-center gap-2 font-black text-ink">
                  <CheckCircle2 size={17} className="text-violet" />
                  {result.subscription.plan} activated
                </p>
                <p className="mt-2 font-bold">{result.subscription.remainingMinutes.toLocaleString()} minutes available. Max file length: {result.subscription.maxSingleFileMinutes} minutes.</p>
              </div>
            ) : null}

            <button disabled={busy || normalizedCode.length < 3} className="btn-primary mt-6 w-full text-base">
              {busy ? <Loader2 size={18} className="animate-spin" /> : <TicketCheck size={18} />}
              {busy ? "Activating..." : "Activate license"}
            </button>

            <p className="mt-4 text-xs font-bold leading-5 text-ink/50">
              Local compatibility accepts codes beginning with AS, APPSUMO, or SUMO. If you are not signed in, UniScribe will ask you to sign in first.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
