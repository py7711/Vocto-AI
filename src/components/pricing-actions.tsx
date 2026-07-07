"use client";

import {useState} from "react";
import {useLocale} from "next-intl";
import {ArrowRight, ExternalLink, Loader2} from "lucide-react";
import clsx from "clsx";
import {isLocale, type Locale} from "@/lib/locales";

type PaidPlan = "BASIC" | "STANDARD" | "PRO";
type OneTimePack = "LITE" | "PLUS";
type AddonPack = "ADDON_BASIC" | "ADDON_STANDARD" | "ADDON_PRO";

type PricingActionProps = {
  plan?: PaidPlan;
  pack?: OneTimePack;
  addon?: AddonPack;
  label: string;
  showPortal?: boolean;
  mode?: "one-time" | "monthly" | "annual";
  successPath?: string;
  cancelPath?: string;
  variant?: "primary" | "outline";
  wrapperClassName?: string;
  buttonClassName?: string;
  showIcon?: boolean;
};

const actionCopy: Record<Locale, {manage: string; busy: string; checkoutError: string; portalError: string}> = {
  ar: {
    manage: "إدارة الاشتراك",
    busy: "جار المعالجة...",
    checkoutError: "تعذر إنشاء جلسة الدفع.",
    portalError: "تعذر فتح بوابة الفوترة."
  },
  de: {
    manage: "Abo verwalten",
    busy: "Verarbeitung...",
    checkoutError: "Checkout-Sitzung konnte nicht erstellt werden.",
    portalError: "Abo-Portal konnte nicht geöffnet werden."
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
  hu: {
    manage: "Előfizetés kezelése",
    busy: "Feldolgozás...",
    checkoutError: "Nem sikerült létrehozni a fizetési munkamenetet.",
    portalError: "Nem sikerült megnyitni a számlázási portált."
  },
  id: {
    manage: "Kelola langganan",
    busy: "Memproses...",
    checkoutError: "Tidak dapat membuat sesi checkout.",
    portalError: "Tidak dapat membuka portal penagihan."
  },
  it: {
    manage: "Gestisci abbonamento",
    busy: "Elaborazione...",
    checkoutError: "Impossibile creare la sessione di pagamento.",
    portalError: "Impossibile aprire il portale di fatturazione."
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
  nl: {
    manage: "Abonnement beheren",
    busy: "Verwerken...",
    checkoutError: "Kan checkoutsessie niet maken.",
    portalError: "Kan facturatieportaal niet openen."
  },
  pl: {
    manage: "Zarządzaj subskrypcją",
    busy: "Przetwarzanie...",
    checkoutError: "Nie można utworzyć sesji płatności.",
    portalError: "Nie można otworzyć portalu rozliczeń."
  },
  pt: {
    manage: "Gerenciar assinatura",
    busy: "Processando...",
    checkoutError: "Não foi possível criar a sessão de pagamento.",
    portalError: "Não foi possível abrir o portal de assinatura."
  },
  ru: {
    manage: "Управлять подпиской",
    busy: "Обработка...",
    checkoutError: "Не удалось создать платежную сессию.",
    portalError: "Не удалось открыть портал оплаты."
  },
  th: {
    manage: "จัดการการสมัครสมาชิก",
    busy: "กำลังประมวลผล...",
    checkoutError: "ไม่สามารถสร้างเซสชันชำระเงินได้",
    portalError: "ไม่สามารถเปิดพอร์ทัลการเรียกเก็บเงินได้"
  },
  tr: {
    manage: "Aboneliği yönet",
    busy: "İşleniyor...",
    checkoutError: "Ödeme oturumu oluşturulamadı.",
    portalError: "Faturalama portalı açılamadı."
  },
  uk: {
    manage: "Керувати підпискою",
    busy: "Обробка...",
    checkoutError: "Не вдалося створити платіжну сесію.",
    portalError: "Не вдалося відкрити портал оплат."
  },
  vi: {
    manage: "Quản lý gói đăng ký",
    busy: "Đang xử lý...",
    checkoutError: "Không thể tạo phiên thanh toán.",
    portalError: "Không thể mở cổng thanh toán."
  },
  zh: {
    manage: "管理订阅",
    busy: "处理中...",
    checkoutError: "无法创建支付会话。",
    portalError: "无法打开订阅管理。"
  },
  "zh-TW": {
    manage: "管理訂閱",
    busy: "處理中...",
    checkoutError: "無法建立付款工作階段。",
    portalError: "無法開啟訂閱管理。"
  }
};

async function readJson(response: Response) {
  return response.json().catch(() => ({})) as Promise<{url?: string; error?: string}>;
}

export function PricingAction({plan, pack, addon, label, showPortal = false, mode, successPath, cancelPath, variant = "primary", wrapperClassName, buttonClassName, showIcon = true}: PricingActionProps) {
  const locale = useLocale();
  const normalizedLocale = isLocale(locale) ? locale : "en";
  const copy = actionCopy[normalizedLocale];
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
