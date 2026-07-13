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

const checkoutOpenCopy = {
  ar: {button: "فتح صفحة الدفع عبر Stripe", blocked: "إذا لم تُفتح صفحة الدفع تلقائيًا، استخدم الزر أدناه."},
  de: {button: "Stripe-Zahlungsseite öffnen", blocked: "Wenn sich die Zahlungsseite nicht automatisch öffnet, nutze die Schaltfläche unten."},
  en: {button: "Open Stripe checkout", blocked: "If the payment page did not open automatically, use the button below."},
  es: {button: "Abrir pago de Stripe", blocked: "Si la página de pago no se abrió automáticamente, usa el botón de abajo."},
  fr: {button: "Ouvrir le paiement Stripe", blocked: "Si la page de paiement ne s'est pas ouverte automatiquement, utilisez le bouton ci-dessous."},
  hu: {button: "Stripe fizetés megnyitása", blocked: "Ha a fizetési oldal nem nyílt meg automatikusan, használd az alábbi gombot."},
  id: {button: "Buka pembayaran Stripe", blocked: "Jika halaman pembayaran tidak terbuka otomatis, gunakan tombol di bawah."},
  it: {button: "Apri pagamento Stripe", blocked: "Se la pagina di pagamento non si è aperta automaticamente, usa il pulsante qui sotto."},
  ja: {button: "Stripe 決済を開く", blocked: "決済ページが自動で開かない場合は、下のボタンを使用してください。"},
  ko: {button: "Stripe 결제 열기", blocked: "결제 페이지가 자동으로 열리지 않았다면 아래 버튼을 사용하세요."},
  nl: {button: "Stripe-betaling openen", blocked: "Als de betaalpagina niet automatisch is geopend, gebruik dan de knop hieronder."},
  pl: {button: "Otwórz płatność Stripe", blocked: "Jeśli strona płatności nie otworzyła się automatycznie, użyj przycisku poniżej."},
  pt: {button: "Abrir pagamento Stripe", blocked: "Se a página de pagamento não abriu automaticamente, use o botão abaixo."},
  ru: {button: "Открыть оплату Stripe", blocked: "Если страница оплаты не открылась автоматически, используйте кнопку ниже."},
  th: {button: "เปิดหน้าชำระเงิน Stripe", blocked: "หากหน้าชำระเงินไม่เปิดโดยอัตโนมัติ ให้ใช้ปุ่มด้านล่าง"},
  tr: {button: "Stripe ödeme sayfasını aç", blocked: "Ödeme sayfası otomatik açılmadıysa aşağıdaki düğmeyi kullanın."},
  uk: {button: "Відкрити оплату Stripe", blocked: "Якщо сторінка оплати не відкрилася автоматично, скористайтеся кнопкою нижче."},
  vi: {button: "Mở thanh toán Stripe", blocked: "Nếu trang thanh toán không tự mở, hãy dùng nút bên dưới."},
  zh: {button: "打开 Stripe 支付页面", blocked: "如果支付页面没有自动打开，请点击下方按钮继续。"},
  "zh-TW": {button: "開啟 Stripe 付款頁面", blocked: "如果付款頁面沒有自動開啟，請點擊下方按鈕繼續。"}
};

function openCheckoutUrl(url: string) {
  const checkoutWindow = window.open(url, "_blank");
  if (!checkoutWindow) return false;
  checkoutWindow.opener = null;
  return true;
}

export function PricingAction({plan, pack, addon, label, showPortal = false, mode, campaign, successPath, cancelPath, variant = "primary", wrapperClassName, buttonClassName, showIcon = true}: PricingActionProps) {
  const locale = useLocale();
  const normalizedLocale = isLocale(locale) ? locale : "en";
  const copy = billingActionCopy[normalizedLocale];
  const checkoutCopy = checkoutOpenCopy[normalizedLocale];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  async function startCheckout() {
    if (!plan && !pack && !addon) {
      window.location.href = `/${locale}/auth/signup`;
      return;
    }

    setBusy(true);
    setError(null);
    setCheckoutUrl(null);
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
      if (!openCheckoutUrl(data.url)) setCheckoutUrl(data.url);
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
      {checkoutUrl ? (
        <div className="animate-fade-in rounded-xl border border-violet/20 bg-violet/5 px-3 py-3 text-xs font-bold leading-5 text-slate-600">
          <p>{checkoutCopy.blocked}</p>
          <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-violet px-3 text-sm font-bold text-white transition hover:bg-violet/90">
            <ExternalLink size={15} />
            {checkoutCopy.button}
          </a>
        </div>
      ) : null}
      {error ? <p className="animate-fade-in rounded-xl border border-coral/25 bg-coral/10 px-3 py-2 text-xs font-bold leading-5 text-coral">{error}</p> : null}
    </div>
  );
}
