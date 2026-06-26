"use client";

import Image from "next/image";
import {usePathname} from "next/navigation";
import {useLocale} from "next-intl";
import type {ReactNode} from "react";
import {BookOpen, Check, CreditCard, Globe, HelpCircle, LayoutDashboard, LogIn, Sparkles} from "lucide-react";
import {locales} from "@/lib/locales";

const localeNames: Record<string, string> = {
  en: "English",
  zh: "中文",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어",
  pt: "Português"
};

const labels: Record<string, Record<string, string>> = {
  zh: {
    features: "功能",
    pricing: "价格",
    faq: "FAQ",
    blog: "博客",
    dashboard: "仪表盘",
    signin: "登录",
    product: "产品",
    resources: "资源",
    terms: "服务条款",
    privacy: "隐私政策",
    language: "语言",
    transcription: "音视频转文字",
    footerText: "Votxt 是面向浏览器的 AI 音视频转写工作台，覆盖上传、链接、录音、转写、摘要、翻译和导出。",
    rights: "保留所有权利。"
  },
  en: {
    features: "Features",
    pricing: "Pricing",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "Dashboard",
    signin: "Sign in",
    product: "Product",
    resources: "Resources",
    terms: "Terms",
    privacy: "Privacy",
    language: "Language",
    transcription: "Audio and video to text",
    footerText: "Votxt is a browser-based AI transcription workspace for uploads, links, recording, transcripts, summaries, translation, and exports.",
    rights: "All rights reserved."
  },
  es: {
    features: "Funciones",
    pricing: "Precios",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "Panel",
    signin: "Entrar",
    product: "Producto",
    resources: "Recursos",
    terms: "Términos",
    privacy: "Privacidad",
    language: "Idioma",
    transcription: "Audio y video a texto",
    footerText: "Votxt es un workspace de transcripción con IA para subidas, enlaces, grabación, texto, resúmenes, traducción y exportación.",
    rights: "Todos los derechos reservados."
  },
  fr: {
    features: "Fonctions",
    pricing: "Tarifs",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "Tableau",
    signin: "Connexion",
    product: "Produit",
    resources: "Ressources",
    terms: "Conditions",
    privacy: "Confidentialité",
    language: "Langue",
    transcription: "Audio et vidéo en texte",
    footerText: "Votxt est un espace de transcription IA pour imports, liens, enregistrements, textes, résumés, traduction et exports.",
    rights: "Tous droits réservés."
  },
  de: {
    features: "Funktionen",
    pricing: "Preise",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "Dashboard",
    signin: "Anmelden",
    product: "Produkt",
    resources: "Ressourcen",
    terms: "Bedingungen",
    privacy: "Datenschutz",
    language: "Sprache",
    transcription: "Audio und Video zu Text",
    footerText: "Votxt ist ein KI-Transkriptionsarbeitsbereich für Uploads, Links, Aufnahme, Texte, Zusammenfassungen, Übersetzung und Exporte.",
    rights: "Alle Rechte vorbehalten."
  },
  ja: {
    features: "機能",
    pricing: "料金",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "ダッシュボード",
    signin: "ログイン",
    product: "製品",
    resources: "リソース",
    terms: "利用規約",
    privacy: "プライバシー",
    language: "言語",
    transcription: "音声・動画をテキストへ",
    footerText: "Votxt はアップロード、リンク、録音、文字起こし、要約、翻訳、書き出しに対応するブラウザ型AIワークスペースです。",
    rights: "All rights reserved."
  },
  ko: {
    features: "기능",
    pricing: "가격",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "대시보드",
    signin: "로그인",
    product: "제품",
    resources: "리소스",
    terms: "약관",
    privacy: "개인정보",
    language: "언어",
    transcription: "오디오와 비디오를 텍스트로",
    footerText: "Votxt는 업로드, 링크, 녹음, 전사, 요약, 번역, 내보내기를 위한 브라우저 기반 AI 전사 워크스페이스입니다.",
    rights: "All rights reserved."
  },
  pt: {
    features: "Recursos",
    pricing: "Preços",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "Painel",
    signin: "Entrar",
    product: "Produto",
    resources: "Recursos",
    terms: "Termos",
    privacy: "Privacidade",
    language: "Idioma",
    transcription: "Áudio e vídeo para texto",
    footerText: "Votxt é um workspace de transcrição com IA para uploads, links, gravação, textos, resumos, tradução e exportações.",
    rights: "Todos os direitos reservados."
  }
};

export function useSiteLabels() {
  const locale = useLocale();
  return labels[locale] ?? labels.en;
}

function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname() ?? `/${locale}`;
  const text = labels[locale] ?? labels.en;

  function pathForLocale(target: string) {
    const segments = pathname.split("/");
    if (segments.length > 1) {
      segments[1] = target;
      return segments.join("/") || `/${target}`;
    }
    return `/${target}`;
  }

  return (
    <details className="group relative">
      <summary className="focus-ring flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-ink/15 bg-white/60 px-3 py-2 text-sm font-bold text-ink/75 transition hover:border-ink/30 hover:bg-white">
        <Globe size={16} />
        <span className="hidden sm:inline">{localeNames[locale] ?? locale.toUpperCase()}</span>
        <span className="sm:hidden">{locale.toUpperCase()}</span>
      </summary>
      <div className="absolute right-0 z-30 mt-2 grid w-44 gap-0.5 rounded-2xl border border-ink/10 bg-white/95 p-1.5 shadow-card backdrop-blur">
        <p className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-ink/40">{text.language}</p>
        {locales.map((item) => (
          <a
            key={item}
            href={pathForLocale(item)}
            className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 text-sm font-bold transition ${item === locale ? "bg-tide/10 text-tide" : "text-ink/70 hover:bg-ink/5 hover:text-ink"}`}
          >
            {localeNames[item]}
            {item === locale ? <Check size={15} /> : null}
          </a>
        ))}
      </div>
    </details>
  );
}

export function SiteHeader({primaryCta}: {primaryCta?: {href: string; label: string; icon?: ReactNode}}) {
  const locale = useLocale();
  const text = labels[locale] ?? labels.en;
  const base = `/${locale}`;
  const cta = primaryCta ?? {href: `${base}/auth/signin`, label: text.signin, icon: <LogIn size={16} />};

  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <a href={base} className="focus-ring flex items-center rounded-full">
          <Image src="/votxt-logo.svg" alt="Votxt" width={142} height={38} priority />
        </a>
        <nav className="hidden items-center gap-1 text-sm font-bold text-ink/70 md:flex">
          <a className="rounded-full px-3 py-2 transition hover:bg-ink/5 hover:text-ink" href={`${base}#features`}>{text.features}</a>
          <a className="rounded-full px-3 py-2 transition hover:bg-ink/5 hover:text-ink" href={`${base}/pricing`}>{text.pricing}</a>
          <a className="rounded-full px-3 py-2 transition hover:bg-ink/5 hover:text-ink" href={`${base}/faq`}>{text.faq}</a>
          <a className="rounded-full px-3 py-2 transition hover:bg-ink/5 hover:text-ink" href={`${base}/blog`}>{text.blog}</a>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <a href={`${base}/dashboard`} className="btn-outline hidden md:inline-flex">
            <LayoutDashboard size={16} />
            {text.dashboard}
          </a>
          <a href={cta.href} className="btn-primary">
            {cta.icon}
            {cta.label}
          </a>
        </div>
      </div>
    </header>
  );
}

export function PageHero({eyebrow, title, description}: {eyebrow: string; title: string; description: string}) {
  return (
    <section className="relative overflow-hidden border-b border-ink/10 px-4 py-16 md:px-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-tide/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-coral/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl animate-fade-up">
        <p className="eyebrow">
          <Sparkles size={14} />
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.08] tracking-tight text-ink md:text-5xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/65">{description}</p>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const locale = useLocale();
  const text = labels[locale] ?? labels.en;
  const base = `/${locale}`;
  const groups = [
    [text.product, [[CreditCard, text.pricing, `${base}/pricing`], [HelpCircle, text.faq, `${base}/faq`], [LayoutDashboard, text.dashboard, `${base}/dashboard`]]],
    [text.resources, [[BookOpen, text.blog, `${base}/blog`], [Sparkles, text.transcription, base], [HelpCircle, text.terms, `${base}/terms`], [HelpCircle, text.privacy, `${base}/privacy`]]]
  ] as const;

  return (
    <footer className="border-t border-ink/10 bg-white/50 px-4 py-12 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Image src="/votxt-logo.svg" alt="Votxt" width={138} height={36} />
          <p className="mt-4 max-w-md text-sm leading-6 text-ink/60">{text.footerText}</p>
        </div>
        {groups.map(([title, links]) => (
          <div key={title}>
            <h2 className="text-xs font-black uppercase tracking-wide text-ink/45">{title}</h2>
            <div className="mt-4 grid gap-1">
              {links.map(([Icon, label, href]) => (
                <a key={label} href={href} className="-mx-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-bold text-ink/65 transition hover:bg-ink/5 hover:text-ink">
                  <Icon size={15} className="text-tide" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-ink/10 pt-6 text-xs font-bold text-ink/45">
        © {new Date().getFullYear()} Votxt. {text.rights}
      </div>
    </footer>
  );
}
