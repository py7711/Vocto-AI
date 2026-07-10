"use client";

import {useState} from "react";
import {useLocale} from "next-intl";
import {ArrowRight, ExternalLink, Loader2} from "lucide-react";
import clsx from "clsx";
import {isLocale} from "@/lib/locales";
import {billingActionCopy} from "@/lib/billing-copy";

type PaidPlan = "BASIC" | "STANDARD" | "PRO";
type OneTimePack = "LITE" | "PLUS";
type AddonPack = "ADDON_BASIC" | "ADDON_STANDARD" | "ADDON_PRO";
export type PricingCampaign = "BASIC_ANNUAL_BFY60";

type PricingActionProps = {
  plan?: PaidPlan;
  pack?: OneTimePack;
  addon?: AddonPack;
  label: string;
  showPortal?: boolean;
  mode?: "one-time" | "monthly" | "annual";
  campaign?: PricingCampaign;
  successPath?: string;
  cancelPath?: string;
  variant?: "primary" | "outline";
  wrapperClassName?: string;
  buttonClassName?: string;
  showIcon?: boolean;
};

async function readJson(response: Response) {
  return response.json().catch(() => ({})) as Promise<{url?: string; error?: string}>;
}

const internalBillingErrorPatterns = [
  /api\s*key/i,
  /expired/i,
  /stripe/i,
  /sk_(?:test|live)_/i,
  /price_[A-Za-z0-9]+/,
  /whsec_[A-Za-z0-9]+/
];

function toPublicBillingError(message: string | undefined, fallback: string) {
  if (!message) return fallback;
  return internalBillingErrorPatterns.some((pattern) => pattern.test(message)) ? fallback : message;
}

export function PricingAction({plan, pack, addon, label, showPortal = false, mode, campaign, successPath, cancelPath, variant = "primary", wrapperClassName, buttonClassName, showIcon = true}: PricingActionProps) {
  const locale = useLocale();
  const normalizedLocale = isLocale(locale) ? locale : "en";
  const copy = billingActionCopy[normalizedLocale];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    if (!plan && !pack && !addon) {
      window.location.href = `/${locale}/auth/signup`;
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          plan,
          pack,
          addon,
          mode,
          campaign,
          locale,
          successPath: successPath ?? `/${locale}/dashboard?checkout=success`,
          cancelPath: cancelPath ?? (pack || addon ? `/${locale}/dashboard?checkout=cancel` : `/${locale}/pricing?checkout=cancel`)
        })
      });
      const data = await readJson(response);
      if (response.status === 401) {
        window.location.href = `/${locale}/auth/signin`;
        return;
      }
      if (!response.ok || !data.url) throw new Error(toPublicBillingError(data.error, copy.checkoutError));
      window.location.href = data.url;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function openPortal() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({returnPath: `/${locale}/dashboard?portal=returned`})
      });
      const data = await readJson(response);
      if (response.status === 401) {
        window.location.href = `/${locale}/auth/signin`;
        return;
      }
      if (!response.ok || !data.url) throw new Error(toPublicBillingError(data.error, copy.portalError));
      window.location.href = data.url;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={clsx("mt-6 grid gap-2", wrapperClassName)}>
      <button
        type="button"
        onClick={startCheckout}
        disabled={busy}
        className={clsx(
          "inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45",
          variant === "primary" ? "bg-violet text-white hover:bg-violet/90" : "border border-slate-200 bg-white text-ink hover:border-violet hover:bg-white",
          buttonClassName
        )}
      >
        {busy ? <Loader2 size={17} className="animate-spin" /> : showIcon ? <ArrowRight size={17} /> : null}
        {busy ? copy.busy : label}
      </button>
      {showPortal ? (
        <button type="button" onClick={openPortal} disabled={busy} className="btn-outline w-full py-3">
          <ExternalLink size={16} />
          {copy.manage}
        </button>
      ) : null}
      {error ? <p className="animate-fade-in rounded-xl border border-coral/25 bg-coral/10 px-3 py-2 text-xs font-bold leading-5 text-coral">{error}</p> : null}
    </div>
  );
}
