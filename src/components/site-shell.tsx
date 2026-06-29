"use client";

import Image from "next/image";
import {usePathname} from "next/navigation";
import {useLocale} from "next-intl";
import {useEffect, useState} from "react";
import type {ReactNode} from "react";
import {BookOpen, Check, CreditCard, Globe, HelpCircle, LayoutDashboard, Link2, LockKeyhole, LogIn, Mail, MessageCircle, Moon, Sparkles, Users} from "lucide-react";
import {locales} from "@/lib/locales";

const localeNames: Record<string, string> = {
  ar: "العربية",
  de: "Deutsch",
  en: "English",
  es: "Español",
  fr: "Français",
  hu: "Magyar",
  id: "Bahasa Indonesia",
  it: "Italiano",
  ja: "日本語",
  ko: "한국어",
  nl: "Nederlands",
  pl: "Polski",
  pt: "Português",
  ru: "Русский",
  th: "ไทย",
  tr: "Türkçe",
  uk: "Українська",
  vi: "Tiếng Việt",
  zh: "中文",
  "zh-TW": "繁體中文"
};

const labels: Record<string, Record<string, string>> = {
  zh: {
    features: "功能",
    pricing: "价格",
    faq: "FAQ",
    blog: "博客",
    dashboard: "仪表盘",
    signin: "登录",
    startFree: "免费开始",
    product: "产品",
    resources: "资源",
    terms: "服务条款",
    privacy: "隐私政策",
    security: "安全",
    affiliate: "联盟计划",
    tools: "工具",
    videoToAudio: "视频转音频",
    wavToMp3: "WAV 转 MP3",
    language: "语言",
    transcription: "音视频转文字",
    footerText: "UniScribe 是面向浏览器的 AI 音视频转写工作台，覆盖上传、链接、录音、转写、摘要、翻译和导出。",
    rights: "保留所有权利。"
  },
  en: {
    features: "Features",
    pricing: "Pricing",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "Dashboard",
    signin: "Sign in",
    startFree: "Start for Free",
    product: "Product",
    resources: "Resources",
    terms: "Terms",
    privacy: "Privacy",
    security: "Security",
    affiliate: "Affiliate",
    tools: "Tools",
    videoToAudio: "Video to Audio",
    wavToMp3: "WAV to MP3",
    language: "Language",
    transcription: "Audio and video to text",
    footerText: "UniScribe is a browser-based AI transcription workspace for uploads, links, recording, transcripts, summaries, translation, and exports.",
    rights: "All rights reserved."
  },
  es: {
    features: "Funciones",
    pricing: "Precios",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "Panel",
    signin: "Entrar",
    startFree: "Empezar gratis",
    product: "Producto",
    resources: "Recursos",
    terms: "Términos",
    privacy: "Privacidad",
    security: "Seguridad",
    affiliate: "Afiliados",
    tools: "Herramientas",
    videoToAudio: "Video a audio",
    wavToMp3: "WAV a MP3",
    language: "Idioma",
    transcription: "Audio y video a texto",
    footerText: "UniScribe es un workspace de transcripción con IA para subidas, enlaces, grabación, texto, resúmenes, traducción y exportación.",
    rights: "Todos los derechos reservados."
  },
  fr: {
    features: "Fonctions",
    pricing: "Tarifs",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "Tableau",
    signin: "Connexion",
    startFree: "Commencer gratuitement",
    product: "Produit",
    resources: "Ressources",
    terms: "Conditions",
    privacy: "Confidentialité",
    security: "Sécurité",
    affiliate: "Affiliation",
    tools: "Outils",
    videoToAudio: "Vidéo en audio",
    wavToMp3: "WAV en MP3",
    language: "Langue",
    transcription: "Audio et vidéo en texte",
    footerText: "UniScribe est un espace de transcription IA pour imports, liens, enregistrements, textes, résumés, traduction et exports.",
    rights: "Tous droits réservés."
  },
  de: {
    features: "Funktionen",
    pricing: "Preise",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "Dashboard",
    signin: "Anmelden",
    startFree: "Kostenlos starten",
    product: "Produkt",
    resources: "Ressourcen",
    terms: "Bedingungen",
    privacy: "Datenschutz",
    security: "Sicherheit",
    affiliate: "Affiliate",
    tools: "Tools",
    videoToAudio: "Video zu Audio",
    wavToMp3: "WAV zu MP3",
    language: "Sprache",
    transcription: "Audio und Video zu Text",
    footerText: "UniScribe ist ein KI-Transkriptionsarbeitsbereich für Uploads, Links, Aufnahme, Texte, Zusammenfassungen, Übersetzung und Exporte.",
    rights: "Alle Rechte vorbehalten."
  },
  ja: {
    features: "機能",
    pricing: "料金",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "ダッシュボード",
    signin: "ログイン",
    startFree: "無料で開始",
    product: "製品",
    resources: "リソース",
    terms: "利用規約",
    privacy: "プライバシー",
    security: "セキュリティ",
    affiliate: "アフィリエイト",
    tools: "ツール",
    videoToAudio: "動画を音声へ",
    wavToMp3: "WAV から MP3",
    language: "言語",
    transcription: "音声・動画をテキストへ",
    footerText: "UniScribe はアップロード、リンク、録音、文字起こし、要約、翻訳、書き出しに対応するブラウザ型AIワークスペースです。",
    rights: "All rights reserved."
  },
  ko: {
    features: "기능",
    pricing: "가격",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "대시보드",
    signin: "로그인",
    startFree: "무료 시작",
    product: "제품",
    resources: "리소스",
    terms: "약관",
    privacy: "개인정보",
    security: "보안",
    affiliate: "제휴",
    tools: "도구",
    videoToAudio: "비디오를 오디오로",
    wavToMp3: "WAV를 MP3로",
    language: "언어",
    transcription: "오디오와 비디오를 텍스트로",
    footerText: "UniScribe는 업로드, 링크, 녹음, 전사, 요약, 번역, 내보내기를 위한 브라우저 기반 AI 전사 워크스페이스입니다.",
    rights: "All rights reserved."
  },
  pt: {
    features: "Recursos",
    pricing: "Preços",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "Painel",
    signin: "Entrar",
    startFree: "Começar grátis",
    product: "Produto",
    resources: "Recursos",
    terms: "Termos",
    privacy: "Privacidade",
    security: "Segurança",
    affiliate: "Afiliados",
    tools: "Ferramentas",
    videoToAudio: "Vídeo para áudio",
    wavToMp3: "WAV para MP3",
    language: "Idioma",
    transcription: "Áudio e vídeo para texto",
    footerText: "UniScribe é um workspace de transcrição com IA para uploads, links, gravação, textos, resumos, tradução e exportações.",
    rights: "Todos os direitos reservados."
  }
};

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

function ThemeToggle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.classList.toggle("light", !next);
  }

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={toggleTheme}
      data-theme-toggle="true"
      data-mounted={mounted ? "true" : "false"}
      className="focus-ring hidden h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white text-ink/70 transition hover:border-violet/30 hover:bg-violet/5 hover:text-violet md:inline-flex"
    >
      <Moon size={17} />
    </button>
  );
}

export function SiteHeader({primaryCta, showAuthPair = false}: {primaryCta?: {href: string; label: string; icon?: ReactNode}; showAuthPair?: boolean}) {
  const locale = useLocale();
  const text = labels[locale] ?? labels.en;
  const base = `/${locale}`;
  const cta = primaryCta ?? {href: `${base}/auth/signin`, label: text.signin, icon: <LogIn size={16} />};

  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b border-ink/10 bg-white/85 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <a href={base} className="focus-ring flex items-center rounded-full">
          <Image src="/uniscribe-logo.svg" alt="UniScribe" width={142} height={38} priority />
        </a>
        <nav className="hidden items-center gap-1 text-sm font-bold text-ink/70 md:flex">
          <a className="rounded-full px-3 py-2 transition hover:bg-ink/5 hover:text-ink" href={`${base}#features`}>{text.features}</a>
          <a className="rounded-full px-3 py-2 transition hover:bg-ink/5 hover:text-ink" href={`${base}#subscription-price`}>{text.pricing}</a>
          <a className="rounded-full px-3 py-2 transition hover:bg-ink/5 hover:text-ink" href={`${base}#faq`}>{text.faq}</a>
          <a className="rounded-full px-3 py-2 transition hover:bg-ink/5 hover:text-ink" href={`${base}/blog`}>{text.blog}</a>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {!showAuthPair ? (
            <a href={`${base}/dashboard`} className="btn-outline hidden md:inline-flex">
              <LayoutDashboard size={16} />
              {text.dashboard}
            </a>
          ) : null}
          {showAuthPair ? (
            <a href={`${base}/auth/signin`} className="btn-outline hidden md:inline-flex">
              <LogIn size={16} />
              {text.signin}
            </a>
          ) : null}
          <a href={cta.href} className="btn-primary">
            {cta.icon}
            {showAuthPair ? text.startFree : cta.label}
          </a>
        </div>
      </div>
    </header>
  );
}

export function PageHero({eyebrow, title, description}: {eyebrow: string; title: string; description: string}) {
  return (
    <section className="relative overflow-hidden border-b border-ink/10 bg-lavender px-4 pb-16 pt-32 md:px-8">
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
    ["FREE TOOLS", [[Link2, "Video to Audio Extractor", `${base}/tools/video-to-audio-extractor`], [Link2, "WAV to MP3 Converter", `${base}/tools/wav-to-mp3-converter`], [Link2, "Mac Dictation", "https://macdictation.com/"]]],
    ["COMPANY", [[HelpCircle, "Terms of Service", `${base}/terms-of-service`], [LockKeyhole, "Privacy Policy", `${base}/privacy-policy`], [CreditCard, "Refund Policy", `${base}/pricing#faq-refund`], [LockKeyhole, "Security & Privacy", `${base}/security`], [Users, "Affiliate Program", `${base}/affiliate`], [Mail, "Support", "mailto:hi@uniscribe.co"], [MessageCircle, "Discord", "https://discord.gg/RJTaS28UWU"]]],
    ["FIND US ON", [[Sparkles, "Product Hunt", "https://www.producthunt.com/products/uniscribe?utm_source=badge-featured#uniscribe"], [BookOpen, "Crunchbase", "https://www.crunchbase.com/organization/uniscribe"]]]
  ] as const;

  return (
    <footer className="border-t border-ink/10 bg-gradient-to-b from-primary/10 via-white to-primary/10 px-4 py-12 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Image src="/uniscribe-logo.svg" alt="UniScribe" width={138} height={36} />
          <p className="mt-4 max-w-md text-sm leading-6 text-ink/60">{text.footerText}</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
            <a href="https://x.com/UniscribeHQ" className="inline-flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2 text-ink/65 transition hover:border-violet/25 hover:text-violet">
              <Link2 size={15} className="text-tide" />
              Twitter
            </a>
            <a href="mailto:hi@uniscribe.co" className="inline-flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2 text-ink/65 transition hover:border-violet/25 hover:text-violet">
              <Mail size={15} className="text-tide" />
              Email
            </a>
          </div>
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
        © {new Date().getFullYear()} VanCode LLC. {text.rights}
      </div>
    </footer>
  );
}
