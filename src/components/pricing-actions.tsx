"use client";

import {useState} from "react";
import {useLocale} from "next-intl";
import {ArrowRight, ExternalLink, Loader2} from "lucide-react";

type PaidPlan = "BASIC" | "STANDARD" | "PRO";

type PricingActionProps = {
  plan?: PaidPlan;
  label: string;
};

const actionCopy = {
  zh: {
    manage: "管理订阅",
    busy: "处理中...",
    checkoutError: "无法创建支付会话。",
    portalError: "无法打开订阅管理。"
  },
  en: {
    manage: "Manage subscription",
    busy: "Processing...",
    checkoutError: "Unable to create checkout session.",
    portalError: "Unable to open billing portal."
  },
  es: {
    manage: "Gestionar suscripción",
    busy: "Procesando...",
    checkoutError: "No se pudo crear la sesión de pago.",
    portalError: "No se pudo abrir la gestión de suscripción."
  },
  fr: {
    manage: "Gérer l'abonnement",
    busy: "Traitement...",
    checkoutError: "Impossible de créer la session de paiement.",
    portalError: "Impossible d'ouvrir la gestion d'abonnement."
  },
  de: {
    manage: "Abo verwalten",
    busy: "Verarbeitung...",
    checkoutError: "Checkout-Sitzung konnte nicht erstellt werden.",
    portalError: "Abo-Portal konnte nicht geöffnet werden."
  },
  ja: {
    manage: "サブスクリプション管理",
    busy: "処理中...",
    checkoutError: "決済セッションを作成できません。",
    portalError: "サブスクリプション管理を開けません。"
  },
  ko: {
    manage: "구독 관리",
    busy: "처리 중...",
    checkoutError: "결제 세션을 만들 수 없습니다.",
    portalError: "구독 관리를 열 수 없습니다."
  },
  pt: {
    manage: "Gerenciar assinatura",
    busy: "Processando...",
    checkoutError: "Não foi possível criar a sessão de pagamento.",
    portalError: "Não foi possível abrir o portal de assinatura."
  }
} as const;

async function readJson(response: Response) {
  return response.json().catch(() => ({})) as Promise<{url?: string; error?: string}>;
}

export function PricingAction({plan, label}: PricingActionProps) {
  const locale = useLocale();
  const copy = actionCopy[locale as keyof typeof actionCopy] ?? actionCopy.en;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    if (!plan) {
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
          successPath: `/${locale}/dashboard?checkout=success`,
          cancelPath: `/${locale}/pricing?checkout=cancel`
        })
      });
      const data = await readJson(response);
      if (response.status === 401) {
        window.location.href = `/${locale}/auth/signin`;
        return;
      }
      if (!response.ok || !data.url) throw new Error(data.error ?? copy.checkoutError);
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
      if (!response.ok || !data.url) throw new Error(data.error ?? copy.portalError);
      window.location.href = data.url;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 grid gap-2">
      <button type="button" onClick={startCheckout} disabled={busy} className="btn-primary w-full py-3">
        {busy ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}
        {busy ? copy.busy : label}
      </button>
      <button type="button" onClick={openPortal} disabled={busy} className="btn-outline w-full py-3">
        <ExternalLink size={16} />
        {copy.manage}
      </button>
      {error ? <p className="animate-fade-in rounded-xl border border-coral/25 bg-coral/10 px-3 py-2 text-xs font-bold leading-5 text-coral">{error}</p> : null}
    </div>
  );
}
