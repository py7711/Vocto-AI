"use client";

import {usePathname} from "next/navigation";
import {useLocale} from "next-intl";
import {useEffect, useRef, useState} from "react";
import type {ReactNode} from "react";
import {Check, ChevronDown, CreditCard, Globe, HelpCircle, LayoutDashboard, Link2, LockKeyhole, LogIn, Mail, Menu, Moon, Sparkles, Sun, Users, X} from "lucide-react";
import {BrandLogo} from "@/components/brand-logo";
import {isLocale, localeEnglishNames, localeNativeNames, locales} from "@/lib/locales";

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
  },
  id: {
    features: "Fitur",
    pricing: "Harga",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "Dasbor",
    signin: "Masuk",
    startFree: "Mulai Gratis",
    product: "Produk",
    resources: "Sumber daya",
    terms: "Ketentuan",
    privacy: "Privasi",
    security: "Keamanan",
    affiliate: "Afiliasi",
    tools: "Alat",
    videoToAudio: "Video ke Audio",
    wavToMp3: "WAV ke MP3",
    language: "Bahasa",
    transcription: "Audio dan video ke teks",
    footerText: "UniScribe adalah ruang kerja transkripsi AI berbasis browser untuk unggahan, tautan, rekaman, transkrip, ringkasan, terjemahan, dan ekspor.",
    rights: "Seluruh hak cipta dilindungi."
  },
  ru: {
    features: "Функции",
    pricing: "Цены",
    faq: "FAQ",
    blog: "Блог",
    dashboard: "Панель",
    signin: "Войти",
    startFree: "Начать бесплатно",
    product: "Продукт",
    resources: "Ресурсы",
    terms: "Условия",
    privacy: "Конфиденциальность",
    security: "Безопасность",
    affiliate: "Партнерская программа",
    tools: "Инструменты",
    videoToAudio: "Видео в аудио",
    wavToMp3: "WAV в MP3",
    language: "Язык",
    transcription: "Аудио и видео в текст",
    footerText: "UniScribe — браузерное AI-пространство для загрузок, ссылок, записи, транскриптов, резюме, перевода и экспорта.",
    rights: "Все права защищены."
  },
  vi: {
    features: "Tính năng",
    pricing: "Giá",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "Bảng điều khiển",
    signin: "Đăng nhập",
    startFree: "Bắt đầu miễn phí",
    product: "Sản phẩm",
    resources: "Tài nguyên",
    terms: "Điều khoản",
    privacy: "Quyền riêng tư",
    security: "Bảo mật",
    affiliate: "Tiếp thị liên kết",
    tools: "Công cụ",
    videoToAudio: "Video sang âm thanh",
    wavToMp3: "WAV sang MP3",
    language: "Ngôn ngữ",
    transcription: "Âm thanh và video sang văn bản",
    footerText: "UniScribe là không gian làm việc phiên âm AI trên trình duyệt cho tải lên, liên kết, ghi âm, bản chép lời, tóm tắt, dịch và xuất file.",
    rights: "Đã đăng ký bản quyền."
  },
  ar: {
    features: "الميزات",
    pricing: "الأسعار",
    faq: "الأسئلة الشائعة",
    blog: "المدونة",
    dashboard: "لوحة التحكم",
    signin: "تسجيل الدخول",
    startFree: "ابدأ مجانا",
    product: "المنتج",
    resources: "الموارد",
    terms: "الشروط",
    privacy: "الخصوصية",
    security: "الأمان",
    affiliate: "الشراكة",
    tools: "الأدوات",
    videoToAudio: "من فيديو إلى صوت",
    wavToMp3: "من WAV إلى MP3",
    language: "اللغة",
    transcription: "تحويل الصوت والفيديو إلى نص",
    footerText: "UniScribe مساحة عمل للنسخ بالذكاء الاصطناعي داخل المتصفح للرفع والروابط والتسجيل والنصوص والملخصات والترجمة والتصدير.",
    rights: "جميع الحقوق محفوظة."
  },
  "zh-TW": {
    features: "功能",
    pricing: "價格",
    faq: "FAQ",
    blog: "部落格",
    dashboard: "儀表板",
    signin: "登入",
    startFree: "免費開始",
    product: "產品",
    resources: "資源",
    terms: "服務條款",
    privacy: "隱私權",
    security: "安全",
    affiliate: "聯盟計畫",
    tools: "工具",
    videoToAudio: "影片轉音訊",
    wavToMp3: "WAV 轉 MP3",
    language: "語言",
    transcription: "音訊與影片轉文字",
    footerText: "UniScribe 是瀏覽器中的 AI 轉寫工作台，支援上傳、連結、錄音、逐字稿、摘要、翻譯與匯出。",
    rights: "保留所有權利。"
  },
  it: {
    features: "Funzioni",
    pricing: "Prezzi",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "Dashboard",
    signin: "Accedi",
    startFree: "Inizia gratis",
    product: "Prodotto",
    resources: "Risorse",
    terms: "Termini",
    privacy: "Privacy",
    security: "Sicurezza",
    affiliate: "Affiliazione",
    tools: "Strumenti",
    videoToAudio: "Video in audio",
    wavToMp3: "WAV in MP3",
    language: "Lingua",
    transcription: "Audio e video in testo",
    footerText: "UniScribe è uno spazio di lavoro di trascrizione AI nel browser per caricamenti, link, registrazioni, trascrizioni, riepiloghi, traduzioni ed esportazioni.",
    rights: "Tutti i diritti riservati."
  },
  th: {
    features: "ฟีเจอร์",
    pricing: "ราคา",
    faq: "FAQ",
    blog: "บล็อก",
    dashboard: "แดชบอร์ด",
    signin: "เข้าสู่ระบบ",
    startFree: "เริ่มใช้ฟรี",
    product: "ผลิตภัณฑ์",
    resources: "แหล่งข้อมูล",
    terms: "ข้อกำหนด",
    privacy: "ความเป็นส่วนตัว",
    security: "ความปลอดภัย",
    affiliate: "พันธมิตร",
    tools: "เครื่องมือ",
    videoToAudio: "วิดีโอเป็นเสียง",
    wavToMp3: "WAV เป็น MP3",
    language: "ภาษา",
    transcription: "เสียงและวิดีโอเป็นข้อความ",
    footerText: "UniScribe คือพื้นที่ทำงานถอดเสียงด้วย AI บนเบราว์เซอร์ สำหรับอัปโหลด ลิงก์ การบันทึก ถอดเสียง สรุป แปล และส่งออก",
    rights: "สงวนลิขสิทธิ์."
  },
  uk: {
    features: "Функції",
    pricing: "Ціни",
    faq: "FAQ",
    blog: "Блог",
    dashboard: "Панель",
    signin: "Увійти",
    startFree: "Почати безкоштовно",
    product: "Продукт",
    resources: "Ресурси",
    terms: "Умови",
    privacy: "Конфіденційність",
    security: "Безпека",
    affiliate: "Партнерство",
    tools: "Інструменти",
    videoToAudio: "Відео в аудіо",
    wavToMp3: "WAV у MP3",
    language: "Мова",
    transcription: "Аудіо й відео в текст",
    footerText: "UniScribe — браузерний AI-робочий простір для завантажень, посилань, запису, транскриптів, підсумків, перекладу та експорту.",
    rights: "Усі права захищено."
  },
  tr: {
    features: "Özellikler",
    pricing: "Fiyatlandırma",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "Panel",
    signin: "Giriş yap",
    startFree: "Ücretsiz Başla",
    product: "Ürün",
    resources: "Kaynaklar",
    terms: "Şartlar",
    privacy: "Gizlilik",
    security: "Güvenlik",
    affiliate: "İş ortaklığı",
    tools: "Araçlar",
    videoToAudio: "Videodan sese",
    wavToMp3: "WAV'dan MP3'e",
    language: "Dil",
    transcription: "Ses ve videoyu metne çevir",
    footerText: "UniScribe; yüklemeler, bağlantılar, kayıt, transkriptler, özetler, çeviri ve dışa aktarma için tarayıcı tabanlı bir AI transkripsiyon çalışma alanıdır.",
    rights: "Tüm hakları saklıdır."
  },
  nl: {
    features: "Functies",
    pricing: "Prijzen",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "Dashboard",
    signin: "Inloggen",
    startFree: "Gratis starten",
    product: "Product",
    resources: "Bronnen",
    terms: "Voorwaarden",
    privacy: "Privacy",
    security: "Beveiliging",
    affiliate: "Affiliate",
    tools: "Tools",
    videoToAudio: "Video naar audio",
    wavToMp3: "WAV naar MP3",
    language: "Taal",
    transcription: "Audio en video naar tekst",
    footerText: "UniScribe is een AI-transcriptiewerkruimte in de browser voor uploads, links, opnames, transcripties, samenvattingen, vertaling en exports.",
    rights: "Alle rechten voorbehouden."
  },
  pl: {
    features: "Funkcje",
    pricing: "Cennik",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "Panel",
    signin: "Zaloguj",
    startFree: "Zacznij za darmo",
    product: "Produkt",
    resources: "Zasoby",
    terms: "Warunki",
    privacy: "Prywatność",
    security: "Bezpieczeństwo",
    affiliate: "Afiliacja",
    tools: "Narzędzia",
    videoToAudio: "Wideo na audio",
    wavToMp3: "WAV na MP3",
    language: "Język",
    transcription: "Audio i wideo na tekst",
    footerText: "UniScribe to przeglądarkowe środowisko transkrypcji AI do przesyłania plików, linków, nagrań, transkryptów, podsumowań, tłumaczeń i eksportu.",
    rights: "Wszelkie prawa zastrzeżone."
  },
  hu: {
    features: "Funkciók",
    pricing: "Árak",
    faq: "FAQ",
    blog: "Blog",
    dashboard: "Irányítópult",
    signin: "Bejelentkezés",
    startFree: "Kezdés ingyen",
    product: "Termék",
    resources: "Források",
    terms: "Feltételek",
    privacy: "Adatvédelem",
    security: "Biztonság",
    affiliate: "Partnerprogram",
    tools: "Eszközök",
    videoToAudio: "Videóból hang",
    wavToMp3: "WAV-ból MP3",
    language: "Nyelv",
    transcription: "Hang és videó szöveggé",
    footerText: "A UniScribe böngészőalapú AI-átíró munkaterület feltöltésekhez, linkekhez, felvételhez, leiratokhoz, összefoglalókhoz, fordításhoz és exporthoz.",
    rights: "Minden jog fenntartva."
  }
};

function getSiteShellText(locale: string): Record<string, string> {
  const raw = labels[locale] ?? labels.en;
  return {
    ...labels.en,
    ...raw,
    openMenu: raw.openMenu ?? raw.tools,
    closeMenu: raw.closeMenu ?? raw.tools,
    theme: raw.theme ?? raw.resources,
    toggleTheme: raw.toggleTheme ?? raw.resources,
    themeLight: raw.themeLight ?? raw.language,
    themeDark: raw.themeDark ?? raw.security,
    themeSystem: raw.themeSystem ?? raw.resources,
    freeTools: raw.freeTools ?? raw.tools,
    company: raw.company ?? raw.resources,
    videoToAudioExtractor: raw.videoToAudioExtractor ?? raw.videoToAudio,
    wavToMp3Converter: raw.wavToMp3Converter ?? raw.wavToMp3,
    termsOfService: raw.termsOfService ?? raw.terms,
    privacyPolicy: raw.privacyPolicy ?? raw.privacy,
    refundPolicy: raw.refundPolicy ?? raw.pricing,
    securityPrivacy: raw.securityPrivacy ?? raw.security,
    affiliateProgram: raw.affiliateProgram ?? raw.affiliate,
    support: raw.support ?? raw.resources,
    email: raw.email ?? raw.support ?? raw.resources
  };
}

function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname() ?? `/${locale}`;
  const currentLocale = isLocale(locale) ? locale : "en";
  const rootRef = useRef<HTMLDetailsElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideInteraction(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideInteraction);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideInteraction);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function pathForLocale(target: string) {
    const segments = pathname.split("/");
    if (segments.length > 1) {
      segments[1] = target;
      return segments.join("/") || `/${target}`;
    }
    return `/${target}`;
  }

  return (
    <details ref={rootRef} open={open} onToggle={(event) => setOpen(event.currentTarget.open)} className="group relative">
      <summary
        aria-label={getSiteShellText(currentLocale).language}
        className="focus-ring flex cursor-pointer list-none items-center gap-3 bg-transparent p-0 text-[22px] font-bold leading-8 text-[#020817] transition hover:text-[#020817]/80 lg:gap-[18px] lg:text-[29px] lg:leading-9 [&::-webkit-details-marker]:hidden"
        onClick={(event) => {
          event.preventDefault();
          setOpen((current) => !current);
        }}
      >
        <Globe className="h-[25px] w-[25px] lg:h-[30px] lg:w-[30px]" strokeWidth={2.4} />
        <span className="hidden sm:inline">{localeNativeNames[currentLocale]}</span>
        <span className="sm:hidden">{currentLocale.toUpperCase()}</span>
        <ChevronDown className={`h-6 w-6 transition lg:h-7 lg:w-7 ${open ? "rotate-180" : ""}`} strokeWidth={2.5} />
      </summary>
      <div className="fixed left-4 right-4 top-[72px] z-30 mt-0 grid max-h-[calc(100vh-96px)] w-auto overflow-y-auto rounded-lg border border-[#d6ddeb] bg-white px-[25px] py-4 shadow-none md:absolute md:left-auto md:right-0 md:top-auto md:mt-5 md:max-h-[min(724px,calc(100vh-112px))] md:w-[min(574px,calc(100vw-32px))]">
        {locales.map((item) => (
          <a
            key={item}
            href={pathForLocale(item)}
            className={`flex min-h-[88px] items-center justify-between gap-8 rounded-md px-0 py-2 transition hover:bg-[#fbfcff] md:min-h-[104px] ${item === currentLocale ? "text-[#6467f2]" : "text-[#020817]"}`}
          >
            <span className="grid gap-1">
              <span className="text-[24px] font-bold leading-8 tracking-normal md:text-[28px] md:leading-[34px]">{localeNativeNames[item]}</span>
              <span className="text-[21px] font-medium leading-7 text-[#64748b] md:text-[25px] md:leading-[31px]">{localeEnglishNames[item]}</span>
            </span>
            {item === currentLocale ? <Check className="h-7 w-7 shrink-0 text-[#6467f2]" strokeWidth={2.2} /> : null}
          </a>
        ))}
      </div>
    </details>
  );
}

function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();
  const text = getSiteShellText(locale);

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
      aria-label={text.toggleTheme}
      title={text.toggleTheme}
      onClick={toggleTheme}
      data-theme-toggle="true"
      data-mounted={mounted ? "true" : "false"}
      className="focus-ring hidden h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white text-ink/70 transition hover:border-violet/30 hover:bg-violet/5 hover:text-violet md:inline-flex"
    >
      <Moon size={17} />
    </button>
  );
}

function ThemeSegmentedControl() {
  const locale = useLocale();
  const text = getSiteShellText(locale);

  return (
    <div className="ml-auto flex h-[26px] items-center rounded-md bg-slate-100/70 p-0.5">
      <button type="button" aria-label={text.themeLight} className="grid h-[22px] w-[26px] place-items-center rounded-md text-slate-500 transition hover:bg-white hover:text-ink">
        <Sun size={14} />
      </button>
      <button type="button" aria-label={text.themeDark} className="grid h-[22px] w-[26px] place-items-center rounded-md text-slate-500 transition hover:bg-white hover:text-ink">
        <Moon size={14} />
      </button>
      <button type="button" aria-label={text.themeSystem} className="grid h-[22px] w-[26px] place-items-center rounded-md bg-white text-slate-900 shadow-sm transition">
        <Sparkles size={14} />
      </button>
    </div>
  );
}

export function SiteHeader({primaryCta, showAuthPair = false}: {primaryCta?: {href: string; label: string; icon?: ReactNode}; showAuthPair?: boolean}) {
  const locale = useLocale();
  const pathname = usePathname() ?? `/${locale}`;
  const text = getSiteShellText(locale);
  const base = `/${locale}`;
  const [signedIn, setSignedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cta = primaryCta ?? {href: `${base}/auth/signin`, label: text.signin, icon: <LogIn size={16} />};
  const localizedPathSuffix = pathname.replace(/^\/[^/]+/, "") || "";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", {cache: "no-store"})
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setSignedIn(Boolean(data?.user));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b border-ink/10 bg-white/85 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <a href={base} className="focus-ring flex items-center rounded-full">
          <BrandLogo />
        </a>
        <nav className="hidden items-center gap-1 text-sm font-bold text-ink/70 md:flex">
          <a className="rounded-full px-3 py-2 transition hover:bg-ink/5 hover:text-ink" href={`${base}#features`}>{text.features}</a>
          <a className="rounded-full px-3 py-2 transition hover:bg-ink/5 hover:text-ink" href={`${base}#subscription-price`}>{text.pricing}</a>
          <a className="rounded-full px-3 py-2 transition hover:bg-ink/5 hover:text-ink" href={`${base}#faq`}>{text.faq}</a>
          <a className="rounded-full px-3 py-2 transition hover:bg-ink/5 hover:text-ink" href={`${base}/blog`}>{text.blog}</a>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          {!showAuthPair ? (
            <a href={`${base}/dashboard`} className="btn-outline hidden md:inline-flex">
              <LayoutDashboard size={16} />
              {text.dashboard}
            </a>
          ) : null}
          {showAuthPair && !signedIn ? (
            <a href={`${base}/auth/signin`} className="btn-outline hidden md:inline-flex">
              <LogIn size={16} />
              {text.signin}
            </a>
          ) : null}
          {signedIn ? null : (
            <a href={cta.href} className="btn-primary">
              {cta.icon}
              {showAuthPair ? text.startFree : cta.label}
            </a>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3 md:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            aria-label={mobileMenuOpen ? text.closeMenu : text.openMenu}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="focus-ring grid h-10 w-10 place-items-center text-ink"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {mobileMenuOpen ? (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <div className="grid gap-2">
            <a className="inline-flex h-10 w-full items-center rounded-md px-4 text-base font-medium leading-6 text-ink transition hover:bg-slate-50" href={`${base}#features`}>{text.features}</a>
            <a className="inline-flex h-10 w-full items-center rounded-md px-4 text-base font-medium leading-6 text-ink transition hover:bg-slate-50" href={`${base}#subscription-price`}>{text.pricing}</a>
            <a className="inline-flex h-10 w-full items-center rounded-md px-4 text-base font-medium leading-6 text-ink transition hover:bg-slate-50" href={`${base}#faq`}>{text.faq}</a>
            <a className="inline-flex h-10 w-full items-center rounded-md px-4 text-base font-medium leading-6 text-ink transition hover:bg-slate-50" href={`${base}/blog`}>{text.blog}</a>
            <details className="group">
              <summary className="flex h-10 w-full cursor-pointer list-none items-center rounded-md px-4 text-base font-medium leading-6 text-ink transition hover:bg-slate-50">
                {localeNativeNames[isLocale(locale) ? locale : "en"]}
              </summary>
              <div className="grid max-h-72 overflow-y-auto rounded-md bg-slate-50 p-1">
                {locales.map((item) => (
                  <a
                    key={item}
                    href={`/${item}${localizedPathSuffix}`}
                    className={`flex min-h-9 items-center justify-between rounded px-3 py-2 text-sm ${item === locale ? "bg-violet/10 text-ink" : "text-slate-600"}`}
                  >
                    <span>
                      <span className="block font-semibold text-ink">{localeNativeNames[item]}</span>
                      <span className="block text-xs text-slate-500">{localeEnglishNames[item]}</span>
                    </span>
                    {item === locale ? <Check size={15} /> : null}
                  </a>
                ))}
              </div>
            </details>
            <div className="flex h-10 w-full items-center rounded-md px-4 text-base font-medium leading-6 text-ink">
              {text.theme}
              <ThemeSegmentedControl />
            </div>
            {!showAuthPair ? (
              <a href={`${base}/dashboard`} className="inline-flex h-10 w-full items-center justify-center rounded-md border border-violet/60 bg-white px-4 text-base font-medium leading-6 text-ink transition hover:bg-violet/5">
                {text.dashboard}
              </a>
            ) : signedIn ? null : (
              <a href={cta.href} className="inline-flex h-10 w-full items-center justify-center rounded-md border border-violet/60 bg-white px-4 text-base font-medium leading-6 text-ink transition hover:bg-violet/5">
                {text.signin}
              </a>
            )}
          </div>
        </div>
      ) : null}
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
  const text = getSiteShellText(locale);
  const base = `/${locale}`;
  const groups = [
    [text.freeTools, [[Link2, text.videoToAudioExtractor, `${base}/tools/video-to-audio-extractor`], [Link2, text.wavToMp3Converter, `${base}/tools/wav-to-mp3-converter`]]],
    [text.company, [[HelpCircle, text.termsOfService, `${base}/terms-of-service`], [LockKeyhole, text.privacyPolicy, `${base}/privacy-policy`], [CreditCard, text.refundPolicy, `${base}/pricing#faq-refund`], [LockKeyhole, text.securityPrivacy, `${base}/security`], [Users, text.affiliateProgram, `${base}/affiliate`], [Mail, text.support, "mailto:hi@uniscribe.co"]]]
  ] as const;

  return (
    <footer className="bg-gradient-to-b from-primary/10 via-background to-primary/10 px-4 py-12 dark:from-background dark:via-background dark:to-background sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="my-10 mb-8 flex flex-col items-start justify-between md:flex-row">
          <div className="mb-8 flex flex-col space-y-8 md:mb-0 md:w-1/3">
            <div>
              <a href={base} className="transition-opacity hover:opacity-90">
                <BrandLogo />
              </a>
              <div className="mt-4 flex space-x-6">
                <a href="mailto:hi@uniscribe.co" className="text-muted-foreground/60 hover:text-muted-foreground">
                  <span className="sr-only">{text.email}</span>
                  <Mail className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col justify-between md:w-2/3">
            <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 md:gap-x-12 md:gap-y-0">
              {groups.map(([title, links]) => (
                <div key={title}>
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">{title}</p>
                  <ul className="mt-4 space-y-3">
                    {links.map(([, label, href]) => (
                      <li key={label}>
                        <a href={href} className="text-sm text-muted-foreground hover:text-foreground">
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-base text-muted-foreground/60">© {new Date().getFullYear()} VanCode LLC. {text.rights}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
