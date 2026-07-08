"use client";

import {useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {useLocale} from "next-intl";
import {CheckCircle2, ChevronDown, Info} from "lucide-react";
import clsx from "clsx";
import {PricingAction} from "@/components/pricing-actions";
import {SiteFooter, SiteHeader} from "@/components/site-shell";
import {getBlogPosts} from "@/lib/blog";
import {isLocale} from "@/lib/locales";

type PaidPlan = "BASIC" | "STANDARD" | "PRO";
type OneTimePack = "LITE" | "PLUS";
type PricingFeature = string | {label: string; badge?: string; href?: string; info?: boolean};
type PricingPlan = {
  name: string;
  price: string;
  quota: string;
  plan?: PaidPlan;
  pack?: OneTimePack;
  cta: string;
  tagline?: string;
  annualPrice?: string;
  annualNote?: string;
  features: PricingFeature[];
};
type PricingMode = "one-time" | "monthly" | "annual";
type PricingUiCopy = {
  modeLabels: Record<PricingMode, string>;
  annualBadge: string;
  billingOptions: string;
  oneTimeNote: string;
  oneTimePayment: string;
  mostPopular: string;
  moreInformation: string;
  stripeCrypto: string;
  taglines: Record<"Free" | "Basic" | "Standard" | "Pro" | "Lite" | "Plus", string>;
  oneTimePlans: Array<Pick<PricingPlan, "name" | "price" | "quota" | "cta" | "tagline" | "features"> & {pack: OneTimePack}>;
};

const pricingModeOrder: PricingMode[] = ["one-time", "monthly", "annual"];

const contentCopy = {
  zh: {
    pricingHero: {
      eyebrow: "订阅套餐",
      title: "从免费试用到个人高容量转写",
      description: "清晰的免费、月付和年付方案，覆盖分钟额度、每日次数、单文件限制、批量任务、发言人识别、AI 洞察和导出能力。"
    },
    perMonth: "/ 月",
    plans: [
      {name: "Free", price: "$0", quota: "120 分钟/月", plan: undefined, cta: "免费开始", features: ["每日 3 个文件", "单文件 30 分钟", "标准模型", "TXT/SRT/VTT/PDF 导出"]},
      {name: "Basic", price: "$6", quota: "1200 分钟/月", plan: "BASIC", cta: "升级 Basic", features: ["YouTube 链接", "发言人识别", "批量 50 文件", "自动化导出"]},
      {name: "Standard", price: "$12", quota: "3000 分钟/月", plan: "STANDARD", cta: "升级 Standard", features: ["优先队列", "更长文件", "个人高效工作台", "高级导出"]},
      {name: "Pro", price: "$18", quota: "6000 分钟/月", plan: "PRO", cta: "升级 Pro", features: ["个人高容量", "更低超额成本", "优先支持", "长期保留"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "关于 Votxt 转写工作台的常见问题",
      description: "覆盖官网、登录、仪表盘、队列、AI 洞察、导出和国际化能力。"
    },
    faqs: [
      ["Votxt 可以完成哪些转写工作？", "Votxt 覆盖文件上传、链接转写、录音、仪表盘额度、AI 摘要、思维导图、问答、翻译和导出。"],
      ["可以用邮箱或 Google 登录吗？", "可以。你可以使用邮箱账号或 Google 账号进入个人转写工作台。"],
      ["支持哪些导出格式？", "任务完成后可以导出 Word、CSV、PDF、TXT、SRT 和 VTT，方便归档、字幕制作和内容复用。"],
      ["支持多少种语言？", "Votxt 支持 63 种语言的转写，并可为完成的转写生成翻译。"],
      ["仪表盘有哪些模块？", "仪表盘包含额度、文件夹、任务列表、上传文件、粘贴链接、转写状态、编辑器、AI 洞察和导出中心。"]
    ],
    blogHero: {
      eyebrow: "博客",
      title: "转写、字幕、摘要和内容复用指南",
      description: "围绕音视频转文字、字幕、摘要和内容复用建立资源中心。"
    },
    readMore: "阅读全文",
    matrixTitle: "更多转写资源",
    matrixText: "继续了解不同语言、文件格式、视频链接、字幕导出和 AI 摘要工作流。"
  },
  en: {
    pricingHero: {
      eyebrow: "Pricing",
      title: "Affordable Pricing",
      description: "Effortlessly transcribe audio and video, saving you time and helping you focus on what matters"
    },
    perMonth: "/ month",
    plans: [
      {
        name: "Free",
        price: "$0",
        quota: "No credit card required",
        cta: "Get started",
        tagline: "Great for trials and individual projects.",
        features: [
          "120 minutes of transcription per month",
          "Each file can be up to 30 minutes long. Upload 1 file at a time.",
          "Limited to transcribe 3 files per day",
          "Basic transcription model (standard accuracy)",
          "Transcription available in 63 languages",
          "AI translation",
          "Word, CSV, PDF, TXT, SRT, VTT export formats",
          "Limited AI Insights",
          "30-day retention period for media files",
          "Email support"
        ]
      },
      {
        name: "Basic",
        price: "$6",
        quota: "1200 minutes of transcription per month",
        plan: "BASIC",
        cta: "Subscribe now",
        tagline: "Perfect for regular users and daily tasks.",
        annualPrice: "$10",
        annualNote: "($72 / year, billed yearly)",
        features: [
          "$10 per 500 extra minutes",
          "Each file can be up to 10 hours long / 5 GB. Upload 50 files at a time.",
          "No daily file limit for transcription",
          "Premium transcription model (highest accuracy)",
          "Transcription available in 63 languages",
          {label: "AI translation", badge: "New", info: true},
          "Word, CSV, PDF, TXT, SRT, VTT export formats",
          {label: "Enhanced AI Insights", badge: "New", info: true},
          "YouTube transcription",
          "Speaker identification",
          {label: "API access", href: "/docs"},
          "Bulk transcription",
          "No retention period for media files",
          "Priority email support"
        ]
      },
      {
        name: "Standard",
        price: "$12",
        quota: "3000 minutes of transcription per month",
        plan: "STANDARD",
        cta: "Subscribe now",
        tagline: "The best balance for growing needs.",
        annualPrice: "$20",
        annualNote: "($144 / year, billed yearly)",
        features: [
          "$15 per 1000 extra minutes",
          "Each file can be up to 10 hours long / 5 GB. Upload 50 files at a time.",
          "No daily file limit for transcription",
          "Premium transcription model (highest accuracy)",
          "Transcription available in 63 languages",
          {label: "AI translation", badge: "New", info: true},
          "Word, CSV, PDF, TXT, SRT, VTT export formats",
          {label: "Enhanced AI Insights", badge: "New", info: true},
          "YouTube transcription",
          "Speaker identification",
          {label: "API access", href: "/docs"},
          "Bulk transcription",
          "No retention period for media files",
          "Priority email support"
        ]
      },
      {
        name: "Pro",
        price: "$18",
        quota: "6000 minutes of transcription per month",
        plan: "PRO",
        cta: "Subscribe now",
        tagline: "Ideal for high-volume users and teams.",
        annualPrice: "$30",
        annualNote: "($216 / year, billed yearly)",
        features: [
          "$20 per 3000 extra minutes",
          "Each file can be up to 10 hours long / 5 GB. Upload 50 files at a time.",
          "No daily file limit for transcription",
          "Premium transcription model (highest accuracy)",
          "Transcription available in 63 languages",
          {label: "AI translation", badge: "New", info: true},
          "Word, CSV, PDF, TXT, SRT, VTT export formats",
          {label: "Enhanced AI Insights", badge: "New", info: true},
          "YouTube transcription",
          "Speaker identification",
          {label: "API access", href: "/docs"},
          "Bulk transcription",
          "No retention period for media files",
          "Priority email support"
        ]
      }
    ] satisfies PricingPlan[],
    faqHero: {
      eyebrow: "FAQ",
      title: "Frequently Asked Questions",
      description: "Answers about free use, supported formats, exports, billing, subscriptions, add-on minutes, and data security."
    },
    faqs: [
      ["Can I try the service for free?", "Yes. The Free plan includes 120 minutes per month, up to 3 files per day, 30 minutes per file, standard transcription, exports, translation, and limited AI insights."],
      ["Which audio/video formats do you support?", "Audio formats include aac, amr, awb, flac, m4a, mka, mp2, mp3, oga, ogg, opus, wav, weba, webm, and wma. Video formats include 3gp, mkv, mov, mp4, mpg, ts, webm, and wmv."],
      ["Can I upload large files?", "Paid plans allow files up to 10 hours long and 5 GB, with up to 50 files uploaded at a time."],
      ["Can I export my transcript?", "Yes. Votxt supports Word, CSV, PDF, TXT, SRT, and VTT export formats."],
      ["Which languages does Votxt support for transcription?", "Votxt supports transcription in 63 languages."],
      ["How soon can I expect my transcription results?", "Most files finish quickly. The exact time depends on file duration, size, and queue load."],
      ["Are my payments secure with Votxt?", "Payments are handled through secure checkout and subscription billing flows."],
      ["How does Votxt protect the confidentiality and security of my data?", "Media and transcription access is scoped to your account, and paid plans can avoid media retention limits."],
      ["When will I be billed?", "Subscription plans are billed monthly or yearly depending on the option you choose."],
      ["What happens if I cancel my subscription?", "You keep access for the paid period, and the subscription does not renew afterward."],
      ["Can I get a refund?", "Refund handling follows the refund policy linked from the footer."],
      ["How long are one-time packages valid for?", "One-time packages are valid for 90 days."],
      ["Can I purchase different one-time packages?", "Yes. You can buy one-time packages separately from subscriptions."],
      ["Can I subscribe after purchasing a one-time package?", "Yes. Subscription minutes and one-time package minutes can coexist."],
      ["If I have an active subscription but need more minutes, can I buy add-on minutes?", "Yes. Paid plans support add-on minutes when you need more capacity."],
      ["How do add-on minutes work?", "Add-on minutes extend your available transcription balance according to the package you buy."],
      ["If I have multiple plans, how are minutes deducted?", "Minutes are deducted according to the active balance and package priority."],
      ["What happens when I use up all minutes in my one-time package?", "You can buy another package, subscribe, or wait for subscription minutes to renew."],
      ["Can I purchase a new one-time package before my current one expires?", "Yes. You can purchase additional one-time minutes before an existing package is exhausted."],
      ["What's the difference between one-time packages and subscription plans?", "One-time packages add a fixed pool of minutes, while subscriptions renew monthly or yearly with plan benefits."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "All Blogs",
      description: "Tips, workflows, and product guides for audio and video transcription."
    },
    readMore: "Read more",
    matrixTitle: "More transcription resources",
    matrixText: "Explore language guides, file-format converters, video-link transcription, subtitle exports, and AI summary workflows."
  },
  es: {
    pricingHero: {
      eyebrow: "Precios",
      title: "De prueba gratis a transcripción personal de alto volumen",
      description: "Votxt cubre minutos mensuales, límites diarios, tamaño de archivo, lotes, hablantes, exportaciones automatizadas y una ruta clara de mejora."
    },
    perMonth: "/ mes",
    plans: [
      {name: "Free", price: "$0", quota: "120 min/mes", plan: undefined, cta: "Empezar gratis", features: ["3 archivos al día", "30 min por archivo", "Modelo estándar", "Exportar TXT/SRT/VTT/PDF"]},
      {name: "Basic", price: "$6", quota: "1200 min/mes", plan: "BASIC", cta: "Mejorar a Basic", features: ["Enlaces de YouTube", "Etiquetas de hablantes", "Lotes de 50 archivos", "Exportaciones automatizadas"]},
      {name: "Standard", price: "$12", quota: "3000 min/mes", plan: "STANDARD", cta: "Mejorar a Standard", features: ["Cola prioritaria", "Archivos más largos", "Espacio personal", "Exportaciones avanzadas"]},
      {name: "Pro", price: "$18", quota: "6000 min/mes", plan: "PRO", cta: "Mejorar a Pro", features: ["Uso personal de alto volumen", "Menor coste extra", "Soporte prioritario", "Retención extendida"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Preguntas sobre el espacio de trabajo Votxt",
      description: "Respuestas sobre sitio web, autenticación, panel, cola, IA, exportación, facturación e idiomas."
    },
    faqs: [
      ["¿Qué puede transcribir Votxt?", "Incluye carga, enlaces, grabación, cuotas, resúmenes, mapas mentales, Q&A, traducción y exportaciones."],
      ["¿Puedo iniciar sesión con email o Google?", "Sí. Puedes entrar al espacio personal con email o con una cuenta de Google."],
      ["¿Qué formatos puedo exportar?", "Puedes exportar Word, CSV, PDF, TXT, SRT y VTT para archivo, subtítulos y reutilización de contenido."],
      ["¿Cuántos idiomas admite?", "Votxt admite transcripción en 63 idiomas y también puede generar traducciones."],
      ["¿Qué incluye el panel?", "Cuotas, carpetas, tareas, carga de archivos, enlaces, estado, editor, IA y centro de exportación."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Guías de transcripción, subtítulos, resumen y reutilización",
      description: "Un centro de recursos para flujos de transcripción de audio y video con Votxt."
    },
    readMore: "Leer más",
    matrixTitle: "Más recursos de transcripción",
    matrixText: "Explora guías de idiomas, formatos de archivo, enlaces de video, subtítulos y resúmenes con IA."
  },
  fr: {
    pricingHero: {
      eyebrow: "Tarifs",
      title: "De l'essai gratuit à la transcription personnelle à grande échelle",
      description: "Votxt couvre minutes mensuelles, limites quotidiennes, taille des fichiers, lots, locuteurs, exports automatisables et montée en gamme claire."
    },
    perMonth: "/ mois",
    plans: [
      {name: "Free", price: "$0", quota: "120 min/mois", plan: undefined, cta: "Commencer", features: ["3 fichiers par jour", "30 min par fichier", "Modèle standard", "Export TXT/SRT/VTT/PDF"]},
      {name: "Basic", price: "$6", quota: "1200 min/mois", plan: "BASIC", cta: "Passer à Basic", features: ["Liens YouTube", "Étiquettes locuteurs", "Lots de 50 fichiers", "Exports automatisables"]},
      {name: "Standard", price: "$12", quota: "3000 min/mois", plan: "STANDARD", cta: "Passer à Standard", features: ["File prioritaire", "Fichiers plus longs", "Espace personnel", "Exports avancés"]},
      {name: "Pro", price: "$18", quota: "6000 min/mois", plan: "PRO", cta: "Passer à Pro", features: ["Usage personnel intensif", "Surcoût réduit", "Support prioritaire", "Conservation longue"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Questions fréquentes sur Votxt",
      description: "Site, authentification, tableau de bord, file, IA, exports, facturation et localisation."
    },
    faqs: [
      ["Que peut transcrire Votxt ?", "Votxt couvre l'import de fichiers, les liens, l'enregistrement, les quotas, les résumés IA, les cartes mentales, les Q&R, la traduction et les exports."],
      ["Puis-je me connecter par email ou Google ?", "Oui. Vous pouvez accéder à votre espace personnel avec un email ou un compte Google."],
      ["Quels exports sont disponibles ?", "Vous pouvez exporter Word, CSV, PDF, TXT, SRT et VTT pour l'archive, les sous-titres et la réutilisation."],
      ["Combien de langues sont prises en charge ?", "Votxt prend en charge la transcription dans 63 langues et peut aussi générer des traductions."],
      ["Que contient le tableau de bord ?", "Quotas, dossiers, tâches, upload de fichiers, liens, statut, éditeur, IA et exports."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Guides pour transcription, sous-titres, résumés et réutilisation",
      description: "Un centre de ressources pour les flux de transcription audio et vidéo avec Votxt."
    },
    readMore: "Lire",
    matrixTitle: "Plus de ressources de transcription",
    matrixText: "Explorez les guides de langues, les formats de fichiers, les liens vidéo, les sous-titres et les résumés IA."
  },
  de: {
    pricingHero: {
      eyebrow: "Preise",
      title: "Vom Gratis-Test bis zur persönlichen Transkription mit hohem Volumen",
      description: "Votxt deckt Monatsminuten, Tageslimits, Dateigrenzen, Stapel, Sprecherlabels, automatisierbare Exporte und klare Upgrades ab."
    },
    perMonth: "/ Monat",
    plans: [
      {name: "Free", price: "$0", quota: "120 Min./Monat", plan: undefined, cta: "Gratis starten", features: ["3 Dateien pro Tag", "30 Min. pro Datei", "Standardmodell", "TXT/SRT/VTT/PDF Export"]},
      {name: "Basic", price: "$6", quota: "1200 Min./Monat", plan: "BASIC", cta: "Basic upgraden", features: ["YouTube-Links", "Sprecherlabels", "50 Dateien pro Stapel", "Automatisierbare Exporte"]},
      {name: "Standard", price: "$12", quota: "3000 Min./Monat", plan: "STANDARD", cta: "Standard upgraden", features: ["Prioritätswarteschlange", "Längere Dateien", "Persönlicher Arbeitsbereich", "Erweiterte Exporte"]},
      {name: "Pro", price: "$18", quota: "6000 Min./Monat", plan: "PRO", cta: "Pro upgraden", features: ["Hohe persönliche Nutzung", "Geringere Zusatzkosten", "Priorisierter Support", "Längere Aufbewahrung"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Häufige Fragen zum Votxt-Arbeitsbereich",
      description: "Antworten zu Website, Authentifizierung, Dashboard, Warteschlange, KI, Export, Abrechnung und Lokalisierung."
    },
    faqs: [
      ["Was kann Votxt transkribieren?", "Votxt bietet Uploads, Links, Aufnahme, Kontingente, KI-Zusammenfassungen, Mindmaps, Q&A, Übersetzung und Exporte."],
      ["Kann ich mich mit E-Mail oder Google anmelden?", "Ja. Du kannst deinen persönlichen Arbeitsbereich per E-Mail oder Google-Konto öffnen."],
      ["Welche Exporte gibt es?", "Du kannst Word, CSV, PDF, TXT, SRT und VTT für Archive, Untertitel und Wiederverwendung exportieren."],
      ["Wie viele Sprachen werden unterstützt?", "Votxt unterstützt Transkription in 63 Sprachen und kann auch Übersetzungen erzeugen."],
      ["Was enthält das Dashboard?", "Quota, Ordner, Aufgaben, Datei-Upload, Links, Status, Editor, KI und Exportzentrum."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Leitfäden für Transkription, Untertitel, Zusammenfassung und Wiederverwendung",
      description: "Ein Ressourcenbereich für Audio- und Video-Transkriptions-Workflows mit Votxt."
    },
    readMore: "Lesen",
    matrixTitle: "Content-Roadmap",
    matrixText: "Weitere Seiten können Sprachen, Formate, YouTube-Tools, Social Transcription, Vergleiche und Hilfe abdecken."
  },
  ja: {
    pricingHero: {
      eyebrow: "料金",
      title: "無料トライアルから個人向け大容量文字起こしまで",
      description: "Votxt は月間分数、日次制限、ファイル上限、バッチ、話者ラベル、自動化向けエクスポート、明確なアップグレード導線を備えます。"
    },
    perMonth: "/ 月",
    plans: [
      {name: "Free", price: "$0", quota: "120 分/月", plan: undefined, cta: "無料で開始", features: ["1日3ファイル", "1ファイル30分", "標準モデル", "TXT/SRT/VTT/PDF 書き出し"]},
      {name: "Basic", price: "$6", quota: "1200 分/月", plan: "BASIC", cta: "Basic にアップグレード", features: ["YouTubeリンク", "話者ラベル", "50ファイル一括", "自動化向けエクスポート"]},
      {name: "Standard", price: "$12", quota: "3000 分/月", plan: "STANDARD", cta: "Standard にアップグレード", features: ["優先キュー", "長尺ファイル", "個人ワークスペース", "高度な書き出し"]},
      {name: "Pro", price: "$18", quota: "6000 分/月", plan: "PRO", cta: "Pro にアップグレード", features: ["個人向け大容量", "低い超過コスト", "優先サポート", "長期保管"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Votxt ワークスペースのよくある質問",
      description: "サイト、認証、ダッシュボード、キュー、AI、書き出し、請求、多言語対応をまとめます。"
    },
    faqs: [
      ["Votxt では何を文字起こしできますか？", "アップロード、リンク、録音、クォータ、AI要約、マインドマップ、Q&A、翻訳、書き出しに対応しています。"],
      ["メールまたは Google でログインできますか？", "はい。メールアカウントまたは Google アカウントで個人ワークスペースに入れます。"],
      ["どの形式で書き出せますか？", "Word、CSV、PDF、TXT、SRT、VTT を書き出せます。アーカイブ、字幕、再利用に使えます。"],
      ["何言語に対応していますか？", "Votxt は 63 言語の文字起こしに対応し、翻訳も生成できます。"],
      ["ダッシュボードには何がありますか？", "クォータ、フォルダ、タスク、ファイルアップロード、リンク、ステータス、エディタ、AI、書き出しがあります。"]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "文字起こし、字幕、要約、再利用のガイド",
      description: "Votxt で音声・動画文字起こしワークフローを進めるためのリソースセンターです。"
    },
    readMore: "読む",
    matrixTitle: "コンテンツ計画",
    matrixText: "言語、形式、YouTubeツール、SNS文字起こし、比較、ヘルプ記事へ拡張できます。"
  },
  ko: {
    pricingHero: {
      eyebrow: "요금제",
      title: "무료 체험부터 개인 대용량 전사까지",
      description: "Votxt는 월간 분수, 일일 제한, 파일 한도, 배치 작업, 화자 라벨, 자동화용 내보내기, 명확한 업그레이드 흐름을 제공합니다."
    },
    perMonth: "/ 월",
    plans: [
      {name: "Free", price: "$0", quota: "월 120분", plan: undefined, cta: "무료 시작", features: ["하루 3개 파일", "파일당 30분", "표준 모델", "TXT/SRT/VTT/PDF 내보내기"]},
      {name: "Basic", price: "$6", quota: "월 1200분", plan: "BASIC", cta: "Basic 업그레이드", features: ["YouTube 링크", "화자 라벨", "50개 파일 배치", "자동화용 내보내기"]},
      {name: "Standard", price: "$12", quota: "월 3000분", plan: "STANDARD", cta: "Standard 업그레이드", features: ["우선 큐", "긴 파일", "개인 워크스페이스", "고급 내보내기"]},
      {name: "Pro", price: "$18", quota: "월 6000분", plan: "PRO", cta: "Pro 업그레이드", features: ["개인 대용량 사용", "낮은 초과 비용", "우선 지원", "장기 보관"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Votxt 워크스페이스 FAQ",
      description: "웹사이트, 인증, 대시보드, 큐, AI, 내보내기, 결제, 현지화를 다룹니다."
    },
    faqs: [
      ["Votxt는 무엇을 전사할 수 있나요?", "업로드, 링크, 녹음, 할당량, AI 요약, 마인드맵, Q&A, 번역, 내보내기를 제공합니다."],
      ["이메일 또는 Google로 로그인할 수 있나요?", "네. 이메일 계정이나 Google 계정으로 개인 워크스페이스에 들어갈 수 있습니다."],
      ["어떤 형식을 내보낼 수 있나요?", "Word, CSV, PDF, TXT, SRT, VTT를 내보내 아카이브, 자막, 콘텐츠 재사용에 활용할 수 있습니다."],
      ["몇 개 언어를 지원하나요?", "Votxt는 63개 언어 전사를 지원하며 번역도 생성할 수 있습니다."],
      ["대시보드에는 무엇이 있나요?", "할당량, 폴더, 작업 목록, 파일 업로드, 링크, 상태, 편집기, AI, 내보내기가 있습니다."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "전사, 자막, 요약, 콘텐츠 재사용 가이드",
      description: "Votxt에서 오디오 및 비디오 전사 워크플로를 진행하기 위한 리소스 센터입니다."
    },
    readMore: "읽기",
    matrixTitle: "콘텐츠 로드맵",
    matrixText: "언어, 형식, YouTube 도구, 소셜 전사, 비교, 도움말 문서로 확장할 수 있습니다."
  },
  pt: {
    pricingHero: {
      eyebrow: "Preços",
      title: "Do teste grátis à transcrição pessoal em alto volume",
      description: "Votxt cobre minutos mensais, limites diários, tamanho de arquivo, lotes, falantes, exportações automatizáveis e uma rota clara de upgrade."
    },
    perMonth: "/ mês",
    plans: [
      {name: "Free", price: "$0", quota: "120 min/mês", plan: undefined, cta: "Começar grátis", features: ["3 arquivos por dia", "30 min por arquivo", "Modelo padrão", "Exportar TXT/SRT/VTT/PDF"]},
      {name: "Basic", price: "$6", quota: "1200 min/mês", plan: "BASIC", cta: "Upgrade Basic", features: ["Links do YouTube", "Rótulos de falantes", "Lotes de 50 arquivos", "Exportações automatizáveis"]},
      {name: "Standard", price: "$12", quota: "3000 min/mês", plan: "STANDARD", cta: "Upgrade Standard", features: ["Fila prioritária", "Arquivos maiores", "Workspace pessoal", "Exportações avançadas"]},
      {name: "Pro", price: "$18", quota: "6000 min/mês", plan: "PRO", cta: "Upgrade Pro", features: ["Uso pessoal em alto volume", "Menor custo extra", "Suporte prioritário", "Retenção longa"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Perguntas sobre o workspace Votxt",
      description: "Site, autenticação, painel, fila, IA, exportações, cobrança e localização."
    },
    faqs: [
      ["O que o Votxt pode transcrever?", "Votxt cobre upload, links, gravação, cotas, resumos de IA, mapas mentais, Q&A, tradução e exportações."],
      ["Posso entrar com email ou Google?", "Sim. Você pode acessar o workspace pessoal com email ou uma conta Google."],
      ["Quais formatos posso exportar?", "Você pode exportar Word, CSV, PDF, TXT, SRT e VTT para arquivo, legendas e reutilização de conteúdo."],
      ["Quantos idiomas são suportados?", "Votxt suporta transcrição em 63 idiomas e também pode gerar traduções."],
      ["O que existe no painel?", "Cotas, pastas, tarefas, upload de arquivos, links, status, editor, IA e central de exportação."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Guias de transcrição, legendas, resumo e reutilização",
      description: "Um centro de recursos para fluxos de transcrição de áudio e vídeo com Votxt."
    },
    readMore: "Ler mais",
    matrixTitle: "Mais recursos de transcrição",
    matrixText: "Explore guias de idiomas, formatos de arquivo, links de vídeo, legendas e resumos com IA."
  }
} as const;

const contentCopy20 = {
  ...contentCopy,
  ar: {
    pricingHero: {
      eyebrow: "الأسعار",
      title: "من التجربة المجانية إلى النسخ الشخصي عالي السعة",
      description: "خطط واضحة تغطي الدقائق الشهرية والحدود اليومية وحجم الملفات والدفعات والمتحدثين والتصدير."
    },
    perMonth: "/ شهر",
    plans: [
      {name: "Free", price: "$0", quota: "120 دقيقة/شهر", plan: undefined, cta: "ابدأ مجانا", features: ["3 ملفات يوميا", "30 دقيقة لكل ملف", "نموذج قياسي", "تصدير TXT/SRT/VTT/PDF"]},
      {name: "Basic", price: "$6", quota: "1200 دقيقة/شهر", plan: "BASIC", cta: "ترقية إلى Basic", features: ["روابط YouTube", "تمييز المتحدثين", "دفعات 50 ملفا", "تصدير قابل للأتمتة"]},
      {name: "Standard", price: "$12", quota: "3000 دقيقة/شهر", plan: "STANDARD", cta: "ترقية إلى Standard", features: ["أولوية في الطابور", "ملفات أطول", "مساحة عمل شخصية", "تصدير متقدم"]},
      {name: "Pro", price: "$18", quota: "6000 دقيقة/شهر", plan: "PRO", cta: "ترقية إلى Pro", features: ["سعة شخصية عالية", "تكلفة إضافية أقل", "دعم أولوية", "احتفاظ أطول"]}
    ],
    faqHero: {
      eyebrow: "الأسئلة الشائعة",
      title: "أسئلة شائعة حول مساحة عمل Votxt",
      description: "إجابات حول الموقع وتسجيل الدخول ولوحة التحكم والطابور وميزات AI والتصدير والفوترة واللغات."
    },
    faqs: [
      ["ما الذي يمكن أن ينسخه Votxt؟", "يدعم Votxt رفع الملفات والروابط والتسجيل والحصص وملخصات AI والخرائط الذهنية والأسئلة والأجوبة والترجمة والتصدير."],
      ["هل يمكنني تسجيل الدخول بالبريد أو Google؟", "نعم. يمكنك فتح مساحة عملك الشخصية باستخدام البريد الإلكتروني أو حساب Google."],
      ["ما صيغ التصدير المتاحة؟", "يمكنك تصدير Word وCSV وPDF وTXT وSRT وVTT للأرشفة والترجمات وإعادة استخدام المحتوى."],
      ["كم لغة يدعم؟", "يدعم Votxt النسخ بـ 63 لغة ويمكنه إنشاء ترجمات للنصوص المنجزة."],
      ["ماذا تتضمن لوحة التحكم؟", "الحصص والمجلدات والمهام ورفع الملفات والروابط والحالة والمحرر وميزات AI ومركز التصدير."]
    ],
    blogHero: {
      eyebrow: "المدونة",
      title: "أدلة النسخ والترجمات والملخصات وإعادة استخدام المحتوى",
      description: "مركز موارد لسير عمل تحويل الصوت والفيديو إلى نص باستخدام Votxt."
    },
    readMore: "اقرأ المزيد",
    matrixTitle: "المزيد من موارد النسخ",
    matrixText: "استكشف أدلة اللغات وصيغ الملفات وروابط الفيديو وتصدير الترجمات وملخصات AI."
  },
  hu: {
    pricingHero: {
      eyebrow: "Árazás",
      title: "Ingyenes próbától nagy mennyiségű személyes átírásig",
      description: "Átlátható csomagok havi percekkel, napi limitekkel, fájlkorlátokkal, kötegelt feladatokkal, beszélőkkel és exportokkal."
    },
    perMonth: "/ hó",
    plans: [
      {name: "Free", price: "$0", quota: "120 perc/hó", plan: undefined, cta: "Ingyenes kezdés", features: ["3 fájl naponta", "30 perc fájlonként", "Standard modell", "TXT/SRT/VTT/PDF export"]},
      {name: "Basic", price: "$6", quota: "1200 perc/hó", plan: "BASIC", cta: "Basic frissítés", features: ["YouTube-linkek", "Beszélőcímkék", "50 fájlos kötegek", "Automatizálható exportok"]},
      {name: "Standard", price: "$12", quota: "3000 perc/hó", plan: "STANDARD", cta: "Standard frissítés", features: ["Elsőbbségi sor", "Hosszabb fájlok", "Személyes munkaterület", "Fejlett exportok"]},
      {name: "Pro", price: "$18", quota: "6000 perc/hó", plan: "PRO", cta: "Pro frissítés", features: ["Nagy személyes kapacitás", "Alacsonyabb túlhasználati díj", "Elsőbbségi támogatás", "Hosszabb megőrzés"]}
    ],
    faqHero: {
      eyebrow: "GYIK",
      title: "Gyakori kérdések a Votxt munkaterületről",
      description: "Válaszok webhelyről, bejelentkezésről, irányítópultról, sorról, AI-ról, exportról, számlázásról és nyelvekről."
    },
    faqs: [
      ["Mit tud átírni a Votxt?", "Feltöltések, linkek, felvétel, kvóták, AI összefoglalók, gondolattérképek, Q&A, fordítás és export."],
      ["Beléphetek e-maillel vagy Google-lel?", "Igen. Személyes munkaterületedet e-maillel vagy Google-fiókkal is megnyithatod."],
      ["Milyen formátumokba exportálhatok?", "Word, CSV, PDF, TXT, SRT és VTT export használható archiváláshoz, feliratokhoz és újrahasznosításhoz."],
      ["Hány nyelvet támogat?", "A Votxt 63 nyelven támogat átírást, és fordítást is tud készíteni."],
      ["Mi van az irányítópulton?", "Kvóták, mappák, feladatok, fájlfeltöltés, linkek, állapot, szerkesztő, AI és exportközpont."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Átírási, felirat-, összefoglaló- és tartalom-újrahasznosítási útmutatók",
      description: "Erőforrásközpont hang- és videóátírási munkafolyamatokhoz Votxt-bal."
    },
    readMore: "Tovább",
    matrixTitle: "További átírási források",
    matrixText: "Fedezd fel a nyelvi útmutatókat, fájlformátumokat, videólinkeket, felirat-exportokat és AI összefoglalókat."
  },
  id: {
    pricingHero: {
      eyebrow: "Harga",
      title: "Dari uji coba gratis hingga transkripsi pribadi volume tinggi",
      description: "Paket jelas untuk menit bulanan, batas harian, ukuran file, batch, pembicara, ekspor, dan upgrade."
    },
    perMonth: "/ bulan",
    plans: [
      {name: "Free", price: "$0", quota: "120 menit/bulan", plan: undefined, cta: "Mulai gratis", features: ["3 file per hari", "30 menit per file", "Model standar", "Ekspor TXT/SRT/VTT/PDF"]},
      {name: "Basic", price: "$6", quota: "1200 menit/bulan", plan: "BASIC", cta: "Upgrade Basic", features: ["Tautan YouTube", "Label pembicara", "Batch 50 file", "Ekspor otomatis"]},
      {name: "Standard", price: "$12", quota: "3000 menit/bulan", plan: "STANDARD", cta: "Upgrade Standard", features: ["Antrean prioritas", "File lebih panjang", "Workspace pribadi", "Ekspor lanjutan"]},
      {name: "Pro", price: "$18", quota: "6000 menit/bulan", plan: "PRO", cta: "Upgrade Pro", features: ["Volume pribadi tinggi", "Biaya tambahan lebih rendah", "Dukungan prioritas", "Retensi panjang"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Pertanyaan umum tentang workspace Votxt",
      description: "Jawaban tentang situs, login, dashboard, antrean, AI, ekspor, penagihan, dan bahasa."
    },
    faqs: [
      ["Apa yang bisa ditranskripsi Votxt?", "Votxt mencakup unggahan, tautan, rekaman, kuota, ringkasan AI, mind map, Q&A, terjemahan, dan ekspor."],
      ["Bisakah masuk dengan email atau Google?", "Bisa. Anda dapat membuka workspace pribadi dengan email atau akun Google."],
      ["Format ekspor apa yang didukung?", "Anda dapat mengekspor Word, CSV, PDF, TXT, SRT, dan VTT untuk arsip, subtitle, dan penggunaan ulang konten."],
      ["Berapa bahasa yang didukung?", "Votxt mendukung transkripsi dalam 63 bahasa dan dapat membuat terjemahan."],
      ["Apa isi dashboard?", "Kuota, folder, tugas, unggah file, tautan, status, editor, AI, dan pusat ekspor."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Panduan transkripsi, subtitle, ringkasan, dan penggunaan ulang konten",
      description: "Pusat sumber daya untuk alur kerja transkripsi audio dan video dengan Votxt."
    },
    readMore: "Baca selengkapnya",
    matrixTitle: "Sumber transkripsi lainnya",
    matrixText: "Jelajahi panduan bahasa, format file, tautan video, ekspor subtitle, dan ringkasan AI."
  },
  it: {
    pricingHero: {
      eyebrow: "Prezzi",
      title: "Dalla prova gratuita alla trascrizione personale ad alto volume",
      description: "Piani chiari per minuti mensili, limiti giornalieri, dimensioni file, batch, parlanti, esportazioni e upgrade."
    },
    perMonth: "/ mese",
    plans: [
      {name: "Free", price: "$0", quota: "120 min/mese", plan: undefined, cta: "Inizia gratis", features: ["3 file al giorno", "30 min per file", "Modello standard", "Export TXT/SRT/VTT/PDF"]},
      {name: "Basic", price: "$6", quota: "1200 min/mese", plan: "BASIC", cta: "Passa a Basic", features: ["Link YouTube", "Etichette parlanti", "Batch da 50 file", "Export automatizzabili"]},
      {name: "Standard", price: "$12", quota: "3000 min/mese", plan: "STANDARD", cta: "Passa a Standard", features: ["Coda prioritaria", "File più lunghi", "Workspace personale", "Export avanzati"]},
      {name: "Pro", price: "$18", quota: "6000 min/mese", plan: "PRO", cta: "Passa a Pro", features: ["Uso personale alto volume", "Costo extra inferiore", "Supporto prioritario", "Retenzione lunga"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Domande frequenti sul workspace Votxt",
      description: "Risposte su sito, accesso, dashboard, coda, AI, esportazione, fatturazione e lingue."
    },
    faqs: [
      ["Cosa può trascrivere Votxt?", "Votxt copre upload, link, registrazione, quote, riepiloghi AI, mappe mentali, Q&A, traduzione ed esportazioni."],
      ["Posso accedere con email o Google?", "Sì. Puoi aprire il workspace personale con email o account Google."],
      ["Quali formati posso esportare?", "Puoi esportare Word, CSV, PDF, TXT, SRT e VTT per archivi, sottotitoli e riuso dei contenuti."],
      ["Quante lingue sono supportate?", "Votxt supporta trascrizione in 63 lingue e può generare traduzioni."],
      ["Cosa include la dashboard?", "Quote, cartelle, attività, upload, link, stato, editor, AI e centro esportazioni."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Guide per trascrizione, sottotitoli, riepiloghi e riuso contenuti",
      description: "Un centro risorse per workflow di trascrizione audio e video con Votxt."
    },
    readMore: "Leggi di più",
    matrixTitle: "Altre risorse di trascrizione",
    matrixText: "Esplora guide linguistiche, formati file, link video, export sottotitoli e riepiloghi AI."
  },
  nl: {
    pricingHero: {
      eyebrow: "Prijzen",
      title: "Van gratis proefgebruik tot persoonlijke transcriptie met hoog volume",
      description: "Heldere pakketten voor maandminuten, daglimieten, bestandsgrootte, batches, sprekers, exports en upgrades."
    },
    perMonth: "/ maand",
    plans: [
      {name: "Free", price: "$0", quota: "120 min/maand", plan: undefined, cta: "Gratis starten", features: ["3 bestanden per dag", "30 min per bestand", "Standaardmodel", "TXT/SRT/VTT/PDF export"]},
      {name: "Basic", price: "$6", quota: "1200 min/maand", plan: "BASIC", cta: "Upgrade Basic", features: ["YouTube-links", "Sprekerlabels", "Batches van 50 bestanden", "Automatiseerbare exports"]},
      {name: "Standard", price: "$12", quota: "3000 min/maand", plan: "STANDARD", cta: "Upgrade Standard", features: ["Prioriteitswachtrij", "Langere bestanden", "Persoonlijke workspace", "Geavanceerde exports"]},
      {name: "Pro", price: "$18", quota: "6000 min/maand", plan: "PRO", cta: "Upgrade Pro", features: ["Hoog persoonlijk volume", "Lagere extra kosten", "Prioriteitssupport", "Langere bewaring"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Veelgestelde vragen over de Votxt-workspace",
      description: "Antwoorden over site, login, dashboard, wachtrij, AI, export, facturatie en talen."
    },
    faqs: [
      ["Wat kan Votxt transcriberen?", "Votxt ondersteunt uploads, links, opnemen, quota, AI-samenvattingen, mindmaps, Q&A, vertaling en exports."],
      ["Kan ik inloggen met e-mail of Google?", "Ja. Je kunt je persoonlijke workspace openen met e-mail of een Google-account."],
      ["Welke exportformaten zijn er?", "Je kunt Word, CSV, PDF, TXT, SRT en VTT exporteren voor archief, ondertitels en hergebruik."],
      ["Hoeveel talen worden ondersteund?", "Votxt ondersteunt transcriptie in 63 talen en kan ook vertalingen maken."],
      ["Wat bevat het dashboard?", "Quota, mappen, taken, uploads, links, status, editor, AI en exportcentrum."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Gidsen voor transcriptie, ondertitels, samenvattingen en hergebruik",
      description: "Een kenniscentrum voor audio- en videotranscriptieworkflows met Votxt."
    },
    readMore: "Meer lezen",
    matrixTitle: "Meer transcriptiebronnen",
    matrixText: "Ontdek taalgidsen, bestandsformaten, videolinks, ondertitel-export en AI-samenvattingen."
  },
  pl: {
    pricingHero: {
      eyebrow: "Cennik",
      title: "Od darmowej próby do osobistej transkrypcji w dużym wolumenie",
      description: "Przejrzyste plany obejmują minuty, limity dzienne, rozmiar plików, wsady, mówców, eksporty i aktualizacje."
    },
    perMonth: "/ mies.",
    plans: [
      {name: "Free", price: "$0", quota: "120 min/mies.", plan: undefined, cta: "Zacznij za darmo", features: ["3 pliki dziennie", "30 min na plik", "Model standardowy", "Eksport TXT/SRT/VTT/PDF"]},
      {name: "Basic", price: "$6", quota: "1200 min/mies.", plan: "BASIC", cta: "Przejdź na Basic", features: ["Linki YouTube", "Etykiety mówców", "Wsady 50 plików", "Automatyzowalne eksporty"]},
      {name: "Standard", price: "$12", quota: "3000 min/mies.", plan: "STANDARD", cta: "Przejdź na Standard", features: ["Kolejka priorytetowa", "Dłuższe pliki", "Osobista przestrzeń", "Zaawansowane eksporty"]},
      {name: "Pro", price: "$18", quota: "6000 min/mies.", plan: "PRO", cta: "Przejdź na Pro", features: ["Duży wolumen osobisty", "Niższy koszt nadwyżek", "Wsparcie priorytetowe", "Dłuższe przechowywanie"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Najczęstsze pytania o workspace Votxt",
      description: "Odpowiedzi o stronie, logowaniu, panelu, kolejce, AI, eksporcie, rozliczeniach i językach."
    },
    faqs: [
      ["Co może transkrybować Votxt?", "Votxt obsługuje upload, linki, nagrywanie, limity, podsumowania AI, mapy myśli, Q&A, tłumaczenie i eksporty."],
      ["Czy mogę logować się e-mailem lub Google?", "Tak. Możesz otworzyć osobistą przestrzeń przez e-mail albo konto Google."],
      ["Jakie formaty eksportu są dostępne?", "Możesz eksportować Word, CSV, PDF, TXT, SRT i VTT do archiwum, napisów i ponownego użycia treści."],
      ["Ile języków jest obsługiwanych?", "Votxt obsługuje transkrypcję w 63 językach i może generować tłumaczenia."],
      ["Co zawiera panel?", "Limity, foldery, zadania, upload, linki, status, edytor, AI i centrum eksportu."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Poradniki transkrypcji, napisów, podsumowań i ponownego użycia treści",
      description: "Centrum zasobów dla workflow audio i wideo w Votxt."
    },
    readMore: "Czytaj więcej",
    matrixTitle: "Więcej zasobów transkrypcji",
    matrixText: "Poznaj przewodniki językowe, formaty plików, linki wideo, eksport napisów i podsumowania AI."
  },
  ru: {
    pricingHero: {
      eyebrow: "Цены",
      title: "От бесплатной пробы до персональной расшифровки большого объема",
      description: "Понятные планы с минутами, дневными лимитами, размером файлов, пакетами, спикерами, экспортом и апгрейдами."
    },
    perMonth: "/ мес.",
    plans: [
      {name: "Free", price: "$0", quota: "120 мин/мес.", plan: undefined, cta: "Начать бесплатно", features: ["3 файла в день", "30 мин на файл", "Стандартная модель", "Экспорт TXT/SRT/VTT/PDF"]},
      {name: "Basic", price: "$6", quota: "1200 мин/мес.", plan: "BASIC", cta: "Перейти на Basic", features: ["Ссылки YouTube", "Метки спикеров", "Пакеты по 50 файлов", "Автоматизируемый экспорт"]},
      {name: "Standard", price: "$12", quota: "3000 мин/мес.", plan: "STANDARD", cta: "Перейти на Standard", features: ["Приоритетная очередь", "Более длинные файлы", "Личное рабочее пространство", "Расширенный экспорт"]},
      {name: "Pro", price: "$18", quota: "6000 мин/мес.", plan: "PRO", cta: "Перейти на Pro", features: ["Большой личный объем", "Ниже стоимость сверх лимита", "Приоритетная поддержка", "Долгое хранение"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Частые вопросы о рабочем пространстве Votxt",
      description: "Ответы о сайте, входе, панели, очереди, AI, экспорте, оплате и языках."
    },
    faqs: [
      ["Что может расшифровывать Votxt?", "Votxt поддерживает загрузки, ссылки, запись, лимиты, AI-сводки, интеллект-карты, Q&A, перевод и экспорт."],
      ["Можно войти по e-mail или Google?", "Да. Вы можете открыть личное рабочее пространство по e-mail или через Google."],
      ["Какие форматы экспорта есть?", "Доступны Word, CSV, PDF, TXT, SRT и VTT для архива, субтитров и повторного использования контента."],
      ["Сколько языков поддерживается?", "Votxt поддерживает расшифровку на 63 языках и может создавать переводы."],
      ["Что есть в панели?", "Лимиты, папки, задачи, загрузка файлов, ссылки, статус, редактор, AI и центр экспорта."]
    ],
    blogHero: {
      eyebrow: "Блог",
      title: "Гайды по расшифровке, субтитрам, сводкам и повторному использованию контента",
      description: "Центр материалов для рабочих процессов аудио- и видеорасшифровки в Votxt."
    },
    readMore: "Читать далее",
    matrixTitle: "Больше ресурсов по расшифровке",
    matrixText: "Изучайте языковые гайды, форматы файлов, видеоссылки, экспорт субтитров и AI-сводки."
  },
  th: {
    pricingHero: {
      eyebrow: "ราคา",
      title: "ตั้งแต่ทดลองใช้ฟรีถึงการถอดเสียงส่วนตัวปริมาณสูง",
      description: "แพ็กเกจชัดเจนครอบคลุมนาทีรายเดือน ขีดจำกัดรายวัน ขนาดไฟล์ งานแบบชุด ผู้พูด การส่งออก และการอัปเกรด"
    },
    perMonth: "/ เดือน",
    plans: [
      {name: "Free", price: "$0", quota: "120 นาที/เดือน", plan: undefined, cta: "เริ่มฟรี", features: ["3 ไฟล์ต่อวัน", "30 นาทีต่อไฟล์", "โมเดลมาตรฐาน", "ส่งออก TXT/SRT/VTT/PDF"]},
      {name: "Basic", price: "$6", quota: "1200 นาที/เดือน", plan: "BASIC", cta: "อัปเกรด Basic", features: ["ลิงก์ YouTube", "ป้ายผู้พูด", "ชุดละ 50 ไฟล์", "ส่งออกอัตโนมัติได้"]},
      {name: "Standard", price: "$12", quota: "3000 นาที/เดือน", plan: "STANDARD", cta: "อัปเกรด Standard", features: ["คิวลำดับความสำคัญ", "ไฟล์ยาวขึ้น", "พื้นที่ทำงานส่วนตัว", "ส่งออกขั้นสูง"]},
      {name: "Pro", price: "$18", quota: "6000 นาที/เดือน", plan: "PRO", cta: "อัปเกรด Pro", features: ["ปริมาณส่วนตัวสูง", "ต้นทุนส่วนเกินต่ำลง", "ซัพพอร์ตลำดับความสำคัญ", "เก็บรักษานานขึ้น"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "คำถามที่พบบ่อยเกี่ยวกับพื้นที่ทำงาน Votxt",
      description: "คำตอบเกี่ยวกับเว็บไซต์ การเข้าสู่ระบบ แดชบอร์ด คิว AI การส่งออก การเรียกเก็บเงิน และภาษา"
    },
    faqs: [
      ["Votxt ถอดเสียงอะไรได้บ้าง?", "รองรับการอัปโหลด ลิงก์ การบันทึก โควตา สรุป AI แผนผังความคิด Q&A การแปล และการส่งออก"],
      ["เข้าสู่ระบบด้วยอีเมลหรือ Google ได้ไหม?", "ได้ คุณสามารถเปิดพื้นที่ทำงานส่วนตัวด้วยอีเมลหรือบัญชี Google"],
      ["ส่งออกเป็นรูปแบบใดได้บ้าง?", "ส่งออก Word, CSV, PDF, TXT, SRT และ VTT สำหรับเก็บถาวร คำบรรยาย และนำเนื้อหากลับมาใช้ใหม่"],
      ["รองรับกี่ภาษา?", "Votxt รองรับการถอดเสียง 63 ภาษา และสร้างคำแปลได้"],
      ["แดชบอร์ดมีอะไรบ้าง?", "โควตา โฟลเดอร์ งาน อัปโหลดไฟล์ ลิงก์ สถานะ เครื่องมือแก้ไข AI และศูนย์ส่งออก"]
    ],
    blogHero: {
      eyebrow: "บล็อก",
      title: "คู่มือการถอดเสียง คำบรรยาย สรุป และการนำเนื้อหากลับมาใช้ใหม่",
      description: "ศูนย์ทรัพยากรสำหรับเวิร์กโฟลว์ถอดเสียงเสียงและวิดีโอด้วย Votxt"
    },
    readMore: "อ่านเพิ่มเติม",
    matrixTitle: "แหล่งข้อมูลการถอดเสียงเพิ่มเติม",
    matrixText: "ดูคู่มือภาษา รูปแบบไฟล์ ลิงก์วิดีโอ การส่งออกคำบรรยาย และสรุปด้วย AI"
  },
  tr: {
    pricingHero: {
      eyebrow: "Fiyatlandırma",
      title: "Ücretsiz denemeden yüksek hacimli kişisel transkripsiyona",
      description: "Aylık dakikalar, günlük limitler, dosya boyutu, toplu işler, konuşmacılar, dışa aktarma ve yükseltmeleri kapsayan net planlar."
    },
    perMonth: "/ ay",
    plans: [
      {name: "Free", price: "$0", quota: "120 dk/ay", plan: undefined, cta: "Ücretsiz başla", features: ["Günde 3 dosya", "Dosya başına 30 dk", "Standart model", "TXT/SRT/VTT/PDF dışa aktar"]},
      {name: "Basic", price: "$6", quota: "1200 dk/ay", plan: "BASIC", cta: "Basic'e yükselt", features: ["YouTube bağlantıları", "Konuşmacı etiketleri", "50 dosyalık toplu işler", "Otomasyon uyumlu dışa aktarma"]},
      {name: "Standard", price: "$12", quota: "3000 dk/ay", plan: "STANDARD", cta: "Standard'a yükselt", features: ["Öncelikli kuyruk", "Daha uzun dosyalar", "Kişisel çalışma alanı", "Gelişmiş dışa aktarma"]},
      {name: "Pro", price: "$18", quota: "6000 dk/ay", plan: "PRO", cta: "Pro'ya yükselt", features: ["Yüksek kişisel hacim", "Daha düşük ek maliyet", "Öncelikli destek", "Uzun saklama"]}
    ],
    faqHero: {
      eyebrow: "SSS",
      title: "Votxt çalışma alanı hakkında sık sorular",
      description: "Site, giriş, panel, kuyruk, AI, dışa aktarma, faturalama ve diller hakkında yanıtlar."
    },
    faqs: [
      ["Votxt neleri transkribe edebilir?", "Yüklemeler, bağlantılar, kayıt, kota, AI özetleri, zihin haritaları, Q&A, çeviri ve dışa aktarma desteklenir."],
      ["E-posta veya Google ile giriş yapabilir miyim?", "Evet. Kişisel çalışma alanını e-posta veya Google hesabıyla açabilirsin."],
      ["Hangi formatlara dışa aktarabilirim?", "Arşiv, altyazı ve içerik yeniden kullanımı için Word, CSV, PDF, TXT, SRT ve VTT dışa aktarılabilir."],
      ["Kaç dil destekleniyor?", "Votxt 63 dilde transkripsiyon destekler ve çeviri oluşturabilir."],
      ["Panelde neler var?", "Kotalar, klasörler, görevler, dosya yükleme, bağlantılar, durum, editör, AI ve dışa aktarma merkezi."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Transkripsiyon, altyazı, özet ve içerik yeniden kullanım rehberleri",
      description: "Votxt ile ses ve video transkripsiyon iş akışları için kaynak merkezi."
    },
    readMore: "Devamını oku",
    matrixTitle: "Daha fazla transkripsiyon kaynağı",
    matrixText: "Dil rehberleri, dosya formatları, video bağlantıları, altyazı dışa aktarma ve AI özetlerini keşfet."
  },
  uk: {
    pricingHero: {
      eyebrow: "Ціни",
      title: "Від безкоштовної проби до персональної транскрипції великого обсягу",
      description: "Зрозумілі плани з хвилинами, денними лімітами, розміром файлів, пакетами, спікерами, експортом і оновленнями."
    },
    perMonth: "/ міс.",
    plans: [
      {name: "Free", price: "$0", quota: "120 хв/міс.", plan: undefined, cta: "Почати безкоштовно", features: ["3 файли на день", "30 хв на файл", "Стандартна модель", "Експорт TXT/SRT/VTT/PDF"]},
      {name: "Basic", price: "$6", quota: "1200 хв/міс.", plan: "BASIC", cta: "Перейти на Basic", features: ["Посилання YouTube", "Мітки спікерів", "Пакети по 50 файлів", "Автоматизований експорт"]},
      {name: "Standard", price: "$12", quota: "3000 хв/міс.", plan: "STANDARD", cta: "Перейти на Standard", features: ["Пріоритетна черга", "Довші файли", "Особистий простір", "Розширені експорти"]},
      {name: "Pro", price: "$18", quota: "6000 хв/міс.", plan: "PRO", cta: "Перейти на Pro", features: ["Великий особистий обсяг", "Нижча вартість понад ліміт", "Пріоритетна підтримка", "Довше зберігання"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Поширені питання про робочий простір Votxt",
      description: "Відповіді про сайт, вхід, панель, чергу, AI, експорт, оплату та мови."
    },
    faqs: [
      ["Що може транскрибувати Votxt?", "Votxt підтримує завантаження, посилання, запис, ліміти, AI-підсумки, ментальні карти, Q&A, переклад і експорти."],
      ["Чи можна увійти через e-mail або Google?", "Так. Ви можете відкрити особистий простір через e-mail або Google-акаунт."],
      ["Які формати експорту доступні?", "Доступні Word, CSV, PDF, TXT, SRT і VTT для архіву, субтитрів і повторного використання контенту."],
      ["Скільки мов підтримується?", "Votxt підтримує транскрипцію 63 мовами і може створювати переклади."],
      ["Що є в панелі?", "Ліміти, папки, задачі, завантаження файлів, посилання, статус, редактор, AI і центр експорту."]
    ],
    blogHero: {
      eyebrow: "Блог",
      title: "Гайди з транскрипції, субтитрів, підсумків і повторного використання контенту",
      description: "Центр ресурсів для аудіо- та відеотранскрипції з Votxt."
    },
    readMore: "Читати далі",
    matrixTitle: "Більше ресурсів з транскрипції",
    matrixText: "Досліджуйте мовні гайди, формати файлів, відеопосилання, експорт субтитрів і AI-підсумки."
  },
  vi: {
    pricingHero: {
      eyebrow: "Giá",
      title: "Từ dùng thử miễn phí đến chép lời cá nhân dung lượng cao",
      description: "Gói rõ ràng cho phút hàng tháng, giới hạn hằng ngày, kích thước tệp, xử lý hàng loạt, người nói, xuất tệp và nâng cấp."
    },
    perMonth: "/ tháng",
    plans: [
      {name: "Free", price: "$0", quota: "120 phút/tháng", plan: undefined, cta: "Bắt đầu miễn phí", features: ["3 tệp mỗi ngày", "30 phút mỗi tệp", "Mô hình tiêu chuẩn", "Xuất TXT/SRT/VTT/PDF"]},
      {name: "Basic", price: "$6", quota: "1200 phút/tháng", plan: "BASIC", cta: "Nâng cấp Basic", features: ["Liên kết YouTube", "Nhãn người nói", "Lô 50 tệp", "Xuất tự động hóa"]},
      {name: "Standard", price: "$12", quota: "3000 phút/tháng", plan: "STANDARD", cta: "Nâng cấp Standard", features: ["Hàng đợi ưu tiên", "Tệp dài hơn", "Workspace cá nhân", "Xuất nâng cao"]},
      {name: "Pro", price: "$18", quota: "6000 phút/tháng", plan: "PRO", cta: "Nâng cấp Pro", features: ["Dung lượng cá nhân cao", "Chi phí vượt thấp hơn", "Hỗ trợ ưu tiên", "Lưu trữ lâu hơn"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Câu hỏi thường gặp về workspace Votxt",
      description: "Trả lời về website, đăng nhập, dashboard, hàng đợi, AI, xuất tệp, thanh toán và ngôn ngữ."
    },
    faqs: [
      ["Votxt có thể chép lời gì?", "Votxt hỗ trợ tải lên, liên kết, ghi âm, hạn mức, tóm tắt AI, sơ đồ tư duy, Q&A, dịch và xuất tệp."],
      ["Có thể đăng nhập bằng email hoặc Google không?", "Có. Bạn có thể mở workspace cá nhân bằng email hoặc tài khoản Google."],
      ["Có thể xuất định dạng nào?", "Bạn có thể xuất Word, CSV, PDF, TXT, SRT và VTT để lưu trữ, làm phụ đề và tái sử dụng nội dung."],
      ["Hỗ trợ bao nhiêu ngôn ngữ?", "Votxt hỗ trợ chép lời 63 ngôn ngữ và có thể tạo bản dịch."],
      ["Dashboard có gì?", "Hạn mức, thư mục, tác vụ, tải tệp, liên kết, trạng thái, trình chỉnh sửa, AI và trung tâm xuất tệp."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Hướng dẫn chép lời, phụ đề, tóm tắt và tái sử dụng nội dung",
      description: "Trung tâm tài nguyên cho workflow chép lời audio và video với Votxt."
    },
    readMore: "Đọc thêm",
    matrixTitle: "Thêm tài nguyên chép lời",
    matrixText: "Khám phá hướng dẫn ngôn ngữ, định dạng tệp, liên kết video, xuất phụ đề và tóm tắt AI."
  },
  "zh-TW": {
    pricingHero: {
      eyebrow: "訂閱方案",
      title: "從免費試用到個人大容量轉寫",
      description: "清晰的免費、月付和年付方案，涵蓋分鐘額度、每日次數、單檔限制、批次任務、說話者辨識、AI 洞察和匯出能力。"
    },
    perMonth: "/ 月",
    plans: [
      {name: "Free", price: "$0", quota: "120 分鐘/月", plan: undefined, cta: "免費開始", features: ["每日 3 個檔案", "單檔 30 分鐘", "標準模型", "TXT/SRT/VTT/PDF 匯出"]},
      {name: "Basic", price: "$6", quota: "1200 分鐘/月", plan: "BASIC", cta: "升級 Basic", features: ["YouTube 連結", "說話者辨識", "批次 50 檔案", "自動化匯出"]},
      {name: "Standard", price: "$12", quota: "3000 分鐘/月", plan: "STANDARD", cta: "升級 Standard", features: ["優先佇列", "更長檔案", "個人工作區", "進階匯出"]},
      {name: "Pro", price: "$18", quota: "6000 分鐘/月", plan: "PRO", cta: "升級 Pro", features: ["個人大容量", "更低超額成本", "優先支援", "長期保留"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "關於 Votxt 轉寫工作區的常見問題",
      description: "涵蓋官網、登入、儀表板、佇列、AI 洞察、匯出和國際化能力。"
    },
    faqs: [
      ["Votxt 可以完成哪些轉寫工作？", "Votxt 涵蓋檔案上傳、連結轉寫、錄音、儀表板額度、AI 摘要、心智圖、問答、翻譯和匯出。"],
      ["可以用電子郵件或 Google 登入嗎？", "可以。你可以使用電子郵件帳號或 Google 帳號進入個人轉寫工作區。"],
      ["支援哪些匯出格式？", "任務完成後可以匯出 Word、CSV、PDF、TXT、SRT 和 VTT，方便歸檔、字幕製作和內容復用。"],
      ["支援多少種語言？", "Votxt 支援 63 種語言的轉寫，並可為完成的轉寫生成翻譯。"],
      ["儀表板有哪些模組？", "儀表板包含額度、資料夾、任務列表、上傳檔案、貼上連結、轉寫狀態、編輯器、AI 洞察和匯出中心。"]
    ],
    blogHero: {
      eyebrow: "部落格",
      title: "轉寫、字幕、摘要和內容復用指南",
      description: "圍繞音影片轉文字、字幕、摘要和內容復用建立資源中心。"
    },
    readMore: "閱讀全文",
    matrixTitle: "更多轉寫資源",
    matrixText: "繼續了解不同語言、檔案格式、影片連結、字幕匯出和 AI 摘要工作流。"
  }
} as const;

function getContentCopy(locale: string) {
  return isLocale(locale) && locale in contentCopy20 ? contentCopy20[locale as keyof typeof contentCopy20] : contentCopy20.en;
}

const pricingUiCopy20: Record<string, PricingUiCopy> = {
  en: {
    modeLabels: {"one-time": "One-Time", monthly: "Monthly", annual: "Annual"},
    annualBadge: "Save 40%",
    billingOptions: "Billing options",
    oneTimeNote: "All one-time plans support card and crypto payments via Stripe.",
    oneTimePayment: "One-time payment",
    mostPopular: "Most popular",
    moreInformation: "More information",
    stripeCrypto: "Crypto payments powered by Stripe",
    taglines: {
      Free: "Great for trials and individual projects.",
      Basic: "Perfect for regular users and daily tasks.",
      Standard: "The best balance for growing needs.",
      Pro: "Ideal for high-volume users and teams.",
      Lite: "Perfect for short-term projects.",
      Plus: "Perfect for short-term projects."
    },
    oneTimePlans: [
      {name: "Lite", price: "$12.9", quota: "300 minutes total transcription", cta: "Buy now", pack: "LITE", tagline: "Perfect for short-term projects.", features: ["90-day validity", "10 hours / 5 GB per file", "Upload 50 files at a time", "Premium transcription model", "63 transcription languages", "AI translation", "Export Word, CSV, PDF, TXT, SRT, VTT", "Enhanced AI Insights"]},
      {name: "Plus", price: "$19.9", quota: "600 minutes total transcription", cta: "Buy now", pack: "PLUS", tagline: "Perfect for short-term projects.", features: ["90-day validity", "10 hours / 5 GB per file", "Upload 50 files at a time", "Premium transcription model", "63 transcription languages", "AI translation", "Export Word, CSV, PDF, TXT, SRT, VTT", "Enhanced AI Insights"]}
    ]
  },
  zh: {
    modeLabels: {"one-time": "一次性", monthly: "月付", annual: "年付"},
    annualBadge: "省 40%",
    billingOptions: "计费选项",
    oneTimeNote: "所有一次性套餐均支持通过 Stripe 使用银行卡和加密货币付款。",
    oneTimePayment: "一次性付款",
    mostPopular: "最受欢迎",
    moreInformation: "更多信息",
    stripeCrypto: "由 Stripe 提供加密货币付款支持",
    taglines: {Free: "适合试用和个人项目。", Basic: "适合日常使用和固定任务。", Standard: "适合增长需求的均衡选择。", Pro: "适合高频用户和团队。", Lite: "适合短期项目。", Plus: "适合短期项目。"},
    oneTimePlans: [
      {name: "Lite", price: "$12.9", quota: "总计 300 分钟转写", cta: "立即购买", pack: "LITE", tagline: "适合短期项目。", features: ["90 天有效期", "单文件 10 小时 / 5 GB", "一次上传 50 个文件", "高级转写模型", "63 种转写语言", "AI 翻译", "导出 Word、CSV、PDF、TXT、SRT、VTT", "增强 AI 洞察"]},
      {name: "Plus", price: "$19.9", quota: "总计 600 分钟转写", cta: "立即购买", pack: "PLUS", tagline: "适合短期项目。", features: ["90 天有效期", "单文件 10 小时 / 5 GB", "一次上传 50 个文件", "高级转写模型", "63 种转写语言", "AI 翻译", "导出 Word、CSV、PDF、TXT、SRT、VTT", "增强 AI 洞察"]}
    ]
  },
  "zh-TW": {
    modeLabels: {"one-time": "一次性", monthly: "月付", annual: "年付"},
    annualBadge: "省 40%",
    billingOptions: "計費選項",
    oneTimeNote: "所有一次性方案均支援透過 Stripe 使用卡片和加密貨幣付款。",
    oneTimePayment: "一次性付款",
    mostPopular: "最受歡迎",
    moreInformation: "更多資訊",
    stripeCrypto: "由 Stripe 提供加密貨幣付款支援",
    taglines: {Free: "適合試用和個人專案。", Basic: "適合日常使用和固定任務。", Standard: "適合成長需求的均衡選擇。", Pro: "適合高頻使用者和團隊。", Lite: "適合短期專案。", Plus: "適合短期專案。"},
    oneTimePlans: [
      {name: "Lite", price: "$12.9", quota: "總計 300 分鐘轉寫", cta: "立即購買", pack: "LITE", tagline: "適合短期專案。", features: ["90 天有效期", "單檔 10 小時 / 5 GB", "一次上傳 50 個檔案", "進階轉寫模型", "63 種轉寫語言", "AI 翻譯", "匯出 Word、CSV、PDF、TXT、SRT、VTT", "增強 AI 洞察"]},
      {name: "Plus", price: "$19.9", quota: "總計 600 分鐘轉寫", cta: "立即購買", pack: "PLUS", tagline: "適合短期專案。", features: ["90 天有效期", "單檔 10 小時 / 5 GB", "一次上傳 50 個檔案", "進階轉寫模型", "63 種轉寫語言", "AI 翻譯", "匯出 Word、CSV、PDF、TXT、SRT、VTT", "增強 AI 洞察"]}
    ]
  }
};

const pricingUiOverrides: Record<string, Partial<PricingUiCopy>> = {
  es: {
    modeLabels: {"one-time": "Pago único", monthly: "Mensual", annual: "Anual"},
    annualBadge: "Ahorra 40%",
    billingOptions: "Opciones de facturación",
    oneTimeNote: "Todos los planes de pago único admiten tarjeta y criptomonedas mediante Stripe.",
    oneTimePayment: "Pago único",
    mostPopular: "Más popular",
    moreInformation: "Más información",
    stripeCrypto: "Pagos cripto con Stripe",
    taglines: {Free: "Ideal para pruebas y proyectos individuales.", Basic: "Perfecto para usuarios frecuentes.", Standard: "El mejor equilibrio para crecer.", Pro: "Ideal para alto volumen y equipos.", Lite: "Perfecto para proyectos cortos.", Plus: "Perfecto para proyectos cortos."}
  },
  fr: {
    modeLabels: {"one-time": "Paiement unique", monthly: "Mensuel", annual: "Annuel"},
    annualBadge: "40 % d'économie",
    billingOptions: "Options de facturation",
    oneTimeNote: "Tous les forfaits ponctuels prennent en charge carte et crypto via Stripe.",
    oneTimePayment: "Paiement unique",
    mostPopular: "Le plus populaire",
    moreInformation: "Plus d'informations",
    stripeCrypto: "Paiements crypto avec Stripe",
    taglines: {Free: "Idéal pour les essais et projets individuels.", Basic: "Parfait pour un usage régulier.", Standard: "Le meilleur équilibre pour grandir.", Pro: "Idéal pour les gros volumes et équipes.", Lite: "Parfait pour les projets courts.", Plus: "Parfait pour les projets courts."}
  },
  de: {
    modeLabels: {"one-time": "Einmalig", monthly: "Monatlich", annual: "Jährlich"},
    annualBadge: "40 % sparen",
    billingOptions: "Abrechnungsoptionen",
    oneTimeNote: "Alle Einmalpakete unterstützen Karten- und Kryptozahlungen über Stripe.",
    oneTimePayment: "Einmalzahlung",
    mostPopular: "Am beliebtesten",
    moreInformation: "Weitere Informationen",
    stripeCrypto: "Krypto-Zahlungen mit Stripe",
    taglines: {Free: "Gut für Tests und Einzelprojekte.", Basic: "Perfekt für regelmäßige Nutzung.", Standard: "Die beste Balance für wachsenden Bedarf.", Pro: "Ideal für hohes Volumen und Teams.", Lite: "Perfekt für kurze Projekte.", Plus: "Perfekt für kurze Projekte."}
  },
  ja: {
    modeLabels: {"one-time": "買い切り", monthly: "月払い", annual: "年払い"},
    annualBadge: "40% オフ",
    billingOptions: "請求オプション",
    oneTimeNote: "買い切りプランは Stripe 経由のカード決済と暗号資産決済に対応しています。",
    oneTimePayment: "一回払い",
    mostPopular: "人気",
    moreInformation: "詳細情報",
    stripeCrypto: "Stripe による暗号資産決済",
    taglines: {Free: "試用や個人プロジェクトに最適。", Basic: "定期利用や日常作業に最適。", Standard: "成長するニーズに最もバランスのよい選択。", Pro: "大容量利用とチームに最適。", Lite: "短期プロジェクトに最適。", Plus: "短期プロジェクトに最適。"}
  },
  ko: {
    modeLabels: {"one-time": "일회성", monthly: "월간", annual: "연간"},
    annualBadge: "40% 절약",
    billingOptions: "결제 옵션",
    oneTimeNote: "모든 일회성 플랜은 Stripe를 통한 카드 및 암호화폐 결제를 지원합니다.",
    oneTimePayment: "일회성 결제",
    mostPopular: "가장 인기",
    moreInformation: "자세한 정보",
    stripeCrypto: "Stripe 암호화폐 결제",
    taglines: {Free: "체험과 개인 프로젝트에 적합합니다.", Basic: "정기 사용자와 일상 작업에 적합합니다.", Standard: "성장하는 요구에 가장 균형 잡힌 선택입니다.", Pro: "대용량 사용자와 팀에 적합합니다.", Lite: "단기 프로젝트에 적합합니다.", Plus: "단기 프로젝트에 적합합니다."}
  },
  pt: {
    modeLabels: {"one-time": "Pagamento único", monthly: "Mensal", annual: "Anual"},
    annualBadge: "Economize 40%",
    billingOptions: "Opções de cobrança",
    oneTimeNote: "Todos os planos avulsos aceitam cartão e cripto via Stripe.",
    oneTimePayment: "Pagamento único",
    mostPopular: "Mais popular",
    moreInformation: "Mais informações",
    stripeCrypto: "Pagamentos cripto com Stripe",
    taglines: {Free: "Ótimo para testes e projetos individuais.", Basic: "Perfeito para uso regular.", Standard: "O melhor equilíbrio para crescer.", Pro: "Ideal para alto volume e equipes.", Lite: "Perfeito para projetos curtos.", Plus: "Perfeito para projetos curtos."}
  },
  ru: {
    modeLabels: {"one-time": "Разово", monthly: "Месяц", annual: "Год"},
    annualBadge: "Скидка 40%",
    billingOptions: "Варианты оплаты",
    oneTimeNote: "Все разовые пакеты поддерживают оплату картой и криптовалютой через Stripe.",
    oneTimePayment: "Разовый платеж",
    mostPopular: "Популярно",
    moreInformation: "Подробнее",
    stripeCrypto: "Криптоплатежи через Stripe",
    taglines: {Free: "Подходит для проб и личных проектов.", Basic: "Для регулярных пользователей и ежедневных задач.", Standard: "Оптимальный баланс для роста.", Pro: "Для большого объема и команд.", Lite: "Для коротких проектов.", Plus: "Для коротких проектов."}
  },
  it: {
    modeLabels: {"one-time": "Una tantum", monthly: "Mensile", annual: "Annuale"},
    annualBadge: "Risparmia 40%",
    billingOptions: "Opzioni di fatturazione",
    oneTimeNote: "Tutti i piani una tantum supportano carta e crypto tramite Stripe.",
    oneTimePayment: "Pagamento unico",
    mostPopular: "Più popolare",
    moreInformation: "Maggiori informazioni",
    stripeCrypto: "Pagamenti crypto con Stripe",
    taglines: {Free: "Ottimo per prove e progetti individuali.", Basic: "Perfetto per utenti regolari.", Standard: "Il miglior equilibrio per crescere.", Pro: "Ideale per alto volume e team.", Lite: "Perfetto per progetti brevi.", Plus: "Perfetto per progetti brevi."}
  },
  id: {
    modeLabels: {"one-time": "Sekali bayar", monthly: "Bulanan", annual: "Tahunan"},
    annualBadge: "Hemat 40%",
    billingOptions: "Opsi penagihan",
    oneTimeNote: "Semua paket sekali bayar mendukung kartu dan kripto melalui Stripe.",
    oneTimePayment: "Pembayaran sekali",
    mostPopular: "Paling populer",
    moreInformation: "Informasi lain",
    stripeCrypto: "Pembayaran kripto dengan Stripe",
    taglines: {Free: "Cocok untuk uji coba dan proyek pribadi.", Basic: "Cocok untuk pengguna rutin.", Standard: "Keseimbangan terbaik untuk kebutuhan berkembang.", Pro: "Ideal untuk volume tinggi dan tim.", Lite: "Cocok untuk proyek singkat.", Plus: "Cocok untuk proyek singkat."}
  },
  nl: {
    modeLabels: {"one-time": "Eenmalig", monthly: "Maandelijks", annual: "Jaarlijks"},
    annualBadge: "Bespaar 40%",
    billingOptions: "Factureringsopties",
    oneTimeNote: "Alle eenmalige pakketten ondersteunen kaart- en cryptobetalingen via Stripe.",
    oneTimePayment: "Eenmalige betaling",
    mostPopular: "Meest populair",
    moreInformation: "Meer informatie",
    stripeCrypto: "Cryptobetalingen via Stripe",
    taglines: {Free: "Goed voor tests en individuele projecten.", Basic: "Perfect voor regelmatig gebruik.", Standard: "De beste balans voor groei.", Pro: "Ideaal voor hoog volume en teams.", Lite: "Perfect voor korte projecten.", Plus: "Perfect voor korte projecten."}
  },
  pl: {
    modeLabels: {"one-time": "Jednorazowo", monthly: "Miesięcznie", annual: "Rocznie"},
    annualBadge: "Oszczędź 40%",
    billingOptions: "Opcje rozliczeń",
    oneTimeNote: "Wszystkie pakiety jednorazowe obsługują kartę i krypto przez Stripe.",
    oneTimePayment: "Płatność jednorazowa",
    mostPopular: "Najpopularniejszy",
    moreInformation: "Więcej informacji",
    stripeCrypto: "Płatności krypto przez Stripe",
    taglines: {Free: "Dobre do prób i projektów osobistych.", Basic: "Idealne do regularnego użycia.", Standard: "Najlepszy balans dla rosnących potrzeb.", Pro: "Idealne dla dużego wolumenu i zespołów.", Lite: "Idealne do krótkich projektów.", Plus: "Idealne do krótkich projektów."}
  },
  tr: {
    modeLabels: {"one-time": "Tek seferlik", monthly: "Aylık", annual: "Yıllık"},
    annualBadge: "%40 tasarruf",
    billingOptions: "Faturalama seçenekleri",
    oneTimeNote: "Tüm tek seferlik planlar Stripe ile kart ve kripto ödemelerini destekler.",
    oneTimePayment: "Tek seferlik ödeme",
    mostPopular: "En popüler",
    moreInformation: "Daha fazla bilgi",
    stripeCrypto: "Stripe ile kripto ödemeleri",
    taglines: {Free: "Denemeler ve kişisel projeler için iyi.", Basic: "Düzenli kullanım için ideal.", Standard: "Büyüyen ihtiyaçlar için en iyi denge.", Pro: "Yüksek hacim ve ekipler için ideal.", Lite: "Kısa projeler için ideal.", Plus: "Kısa projeler için ideal."}
  },
  uk: {
    modeLabels: {"one-time": "Разово", monthly: "Місяць", annual: "Рік"},
    annualBadge: "Знижка 40%",
    billingOptions: "Варіанти оплати",
    oneTimeNote: "Усі разові пакети підтримують оплату карткою та криптовалютою через Stripe.",
    oneTimePayment: "Разовий платіж",
    mostPopular: "Найпопулярніше",
    moreInformation: "Докладніше",
    stripeCrypto: "Криптоплатежі через Stripe",
    taglines: {Free: "Добре для проб і особистих проєктів.", Basic: "Підходить для регулярного використання.", Standard: "Найкращий баланс для зростання.", Pro: "Ідеально для великого обсягу і команд.", Lite: "Для коротких проєктів.", Plus: "Для коротких проєктів."}
  },
  vi: {
    modeLabels: {"one-time": "Một lần", monthly: "Hàng tháng", annual: "Hàng năm"},
    annualBadge: "Tiết kiệm 40%",
    billingOptions: "Tùy chọn thanh toán",
    oneTimeNote: "Tất cả gói một lần hỗ trợ thẻ và crypto qua Stripe.",
    oneTimePayment: "Thanh toán một lần",
    mostPopular: "Phổ biến nhất",
    moreInformation: "Thông tin thêm",
    stripeCrypto: "Thanh toán crypto qua Stripe",
    taglines: {Free: "Phù hợp để thử và dự án cá nhân.", Basic: "Phù hợp cho người dùng thường xuyên.", Standard: "Cân bằng tốt nhất cho nhu cầu tăng trưởng.", Pro: "Lý tưởng cho dung lượng cao và đội nhóm.", Lite: "Phù hợp cho dự án ngắn hạn.", Plus: "Phù hợp cho dự án ngắn hạn."}
  },
  ar: {
    modeLabels: {"one-time": "مرة واحدة", monthly: "شهري", annual: "سنوي"},
    annualBadge: "وفر 40%",
    billingOptions: "خيارات الفوترة",
    oneTimeNote: "كل الخطط لمرة واحدة تدعم الدفع بالبطاقة والعملات المشفرة عبر Stripe.",
    oneTimePayment: "دفعة واحدة",
    mostPopular: "الأكثر شيوعا",
    moreInformation: "مزيد من المعلومات",
    stripeCrypto: "مدفوعات العملات المشفرة عبر Stripe",
    taglines: {Free: "مناسب للتجارب والمشاريع الفردية.", Basic: "مناسب للاستخدام المنتظم.", Standard: "أفضل توازن للاحتياجات المتنامية.", Pro: "مثالي للسعة العالية والفرق.", Lite: "مناسب للمشاريع القصيرة.", Plus: "مناسب للمشاريع القصيرة."}
  },
  th: {
    modeLabels: {"one-time": "จ่ายครั้งเดียว", monthly: "รายเดือน", annual: "รายปี"},
    annualBadge: "ประหยัด 40%",
    billingOptions: "ตัวเลือกการเรียกเก็บเงิน",
    oneTimeNote: "แพ็กเกจจ่ายครั้งเดียวทั้งหมดรองรับบัตรและคริปโตผ่าน Stripe",
    oneTimePayment: "ชำระครั้งเดียว",
    mostPopular: "ยอดนิยม",
    moreInformation: "ข้อมูลเพิ่มเติม",
    stripeCrypto: "ชำระคริปโตผ่าน Stripe",
    taglines: {Free: "เหมาะสำหรับทดลองและโปรเจกต์ส่วนตัว", Basic: "เหมาะสำหรับผู้ใช้ประจำ", Standard: "สมดุลที่สุดสำหรับความต้องการที่เพิ่มขึ้น", Pro: "เหมาะสำหรับปริมาณสูงและทีม", Lite: "เหมาะสำหรับโปรเจกต์สั้น", Plus: "เหมาะสำหรับโปรเจกต์สั้น"}
  },
  hu: {
    modeLabels: {"one-time": "Egyszeri", monthly: "Havi", annual: "Éves"},
    annualBadge: "40% megtakarítás",
    billingOptions: "Számlázási opciók",
    oneTimeNote: "Minden egyszeri csomag támogat kártyás és kriptós fizetést Stripe-on keresztül.",
    oneTimePayment: "Egyszeri fizetés",
    mostPopular: "Legnépszerűbb",
    moreInformation: "További információ",
    stripeCrypto: "Kriptófizetés Stripe-pal",
    taglines: {Free: "Jó próbákhoz és egyéni projektekhez.", Basic: "Rendszeres használathoz ideális.", Standard: "A legjobb egyensúly növekvő igényekhez.", Pro: "Nagy mennyiséghez és csapatokhoz ideális.", Lite: "Rövid projektekhez ideális.", Plus: "Rövid projektekhez ideális."}
  }
};

function getPricingUiCopy(locale: string): PricingUiCopy {
  const base = pricingUiCopy20[locale] ?? pricingUiCopy20.en;
  const override = pricingUiOverrides[locale];
  if (!override) return base;
  return {
    ...base,
    ...override,
    modeLabels: {...base.modeLabels, ...override.modeLabels},
    taglines: {...base.taglines, ...override.taglines}
  };
}

function withOneTimePlanCopy(ui: PricingUiCopy): PricingUiCopy {
  const englishPlans = pricingUiCopy20.en.oneTimePlans;
  return {
    ...ui,
    oneTimePlans: englishPlans.map((plan, index) => ({
      ...plan,
      ...ui.oneTimePlans[index],
      features: ui.oneTimePlans[index]?.features ?? plan.features
    }))
  };
}

function PricingFeatureLabel({feature, moreInformation}: {feature: PricingFeature; moreInformation: string}) {
  if (typeof feature === "string") {
    return <>{feature}</>;
  }

  const label = feature.href ? (
    <a href={feature.href} className="text-ink underline decoration-ink/30 underline-offset-2 transition hover:text-violet hover:decoration-violet/40">
      {feature.label}
    </a>
  ) : (
    <span>{feature.label}</span>
  );

  return (
    <span className="inline-flex flex-wrap items-center gap-1 align-middle">
      {label}
      {feature.info ? (
        <button
          type="button"
          aria-label={moreInformation}
          className="inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-violet/30 focus:ring-offset-1"
        >
          <Info className="h-3.5 w-3.5 text-ink/45" />
        </button>
      ) : null}
      {feature.badge ? <span className="inline-flex rounded-full bg-violet/10 px-2 py-0.5 text-xs font-medium leading-none text-violet">{feature.badge}</span> : null}
    </span>
  );
}

const monthlyPrices = ["$0", "$10", "$20", "$30"] as const;
const annualPreviousPrices = [undefined, "$10", "$20", "$30"] as const;

function normalizePlan(plan: PricingPlan, ui: PricingUiCopy): PricingPlan {
  const name = plan.name as keyof PricingUiCopy["taglines"];
  return {
    ...plan,
    tagline: plan.tagline ?? ui.taglines[name]
  };
}

function getLocalizedPlans(copy: ReturnType<typeof getContentCopy>, ui: PricingUiCopy, mode: PricingMode, locale: string): PricingPlan[] {
  if (mode === "one-time") {
    const hasFullOneTimeCopy = locale === "en" || locale === "zh" || locale === "zh-TW";
    return ui.oneTimePlans.map((plan, index) =>
      normalizePlan(
        {
          ...plan,
          quota: hasFullOneTimeCopy ? plan.quota : `${index === 0 ? 300 : 600} min`,
          cta: hasFullOneTimeCopy ? plan.cta : ui.oneTimePayment,
          features: hasFullOneTimeCopy ? plan.features : (copy.plans[index + 1]?.features as PricingFeature[] | undefined) ?? plan.features
        },
        ui
      )
    );
  }

  const plans = copy.plans.map((plan, index) => {
    const normalized = normalizePlan(plan as PricingPlan, ui);
    if (mode === "monthly") {
      return {
        ...normalized,
        price: monthlyPrices[index] ?? normalized.price,
        annualPrice: undefined,
        annualNote: undefined
      };
    }
    return {
      ...normalized,
      annualPrice: annualPreviousPrices[index],
      annualNote: index === 0 ? undefined : normalized.annualNote
    };
  });

  return plans;
}

function PricingPlanCard({plan, mode, ui, monthSuffix}: {plan: PricingPlan; mode: PricingMode; ui: PricingUiCopy; monthSuffix: string}) {
  const popular = plan.name === "Standard";
  const highlighted = plan.name === "Basic";
  const suffix = mode === "one-time" ? ui.oneTimePayment : monthSuffix;

  return (
    <article className={clsx("relative flex w-full shrink-0 flex-col rounded-lg border bg-white text-ink shadow-sm sm:w-[320px]", highlighted ? "border-violet" : "border-slate-200")}>
      {popular ? (
        <div className="px-6 pt-5">
          <span className="inline-flex items-center rounded-full bg-violet/10 px-3 py-1 text-sm font-medium text-violet">{ui.mostPopular}</span>
        </div>
      ) : null}

      <div className={clsx("flex min-h-[140px] flex-col p-6", popular && "pt-4")}>
        <h3 className="text-2xl font-semibold leading-none tracking-tight">{plan.name}</h3>
        <p className="mb-4 pb-4 pt-2 text-sm leading-5 text-slate-500">
          {plan.tagline}
        </p>
      </div>

      <div className="px-6">
        <PricingAction
          plan={plan.plan}
          pack={plan.pack}
          label={plan.cta}
          mode={mode}
          variant={popular ? "primary" : "outline"}
          wrapperClassName="mb-6 mt-0"
          buttonClassName={popular ? "bg-violet text-white" : undefined}
          showIcon={false}
        />

        <div className="flex items-end">
          <p className="mt-2 pb-1 font-mono text-5xl leading-none">{plan.price}</p>
          <p className="mb-1.5 ml-2 text-[13px] leading-4 text-slate-500">{suffix}</p>
        </div>
        {plan.annualPrice || plan.annualNote ? (
          <p className="mt-2 text-sm font-medium text-slate-500">
            {plan.annualPrice ? <span className="text-sm text-slate-400 line-through">{plan.annualPrice}</span> : null}
            {plan.annualNote ? <span className="ml-2">{plan.annualNote}</span> : null}
          </p>
        ) : null}
        <p className="mt-4 text-sm font-semibold text-violet">{plan.quota}</p>
      </div>

      <div className="mt-6 grid flex-1 content-start gap-3 px-6 pb-6">
        {plan.features.map((item) => {
          const key = typeof item === "string" ? item : item.label;
          return (
            <p key={key} className="flex items-start gap-2 text-sm leading-5 text-slate-600">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-violet" />
              <PricingFeatureLabel feature={item} moreInformation={ui.moreInformation} />
            </p>
          );
        })}
      </div>
    </article>
  );
}

function PricingFaqAccordion({faqs}: {faqs: ReadonlyArray<readonly [string, string]>}) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-[718px] divide-y divide-slate-200">
      {faqs.map(([question, answer], index) => {
        const active = openFaq === index;
        return (
          <article key={question}>
            <button
              type="button"
              onClick={() => setOpenFaq(active ? null : index)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-medium leading-6 text-ink transition hover:underline md:min-h-[76px] md:py-6 md:text-lg md:leading-7"
              aria-expanded={active}
            >
              <span>{question}</span>
              <ChevronDown size={18} className={clsx("shrink-0 text-slate-500 transition", active && "rotate-180")} />
            </button>
            {active ? <p className="pb-5 text-sm leading-6 text-slate-600">{answer}</p> : null}
          </article>
        );
      })}
    </div>
  );
}

export function PricingPage() {
  const locale = useLocale();
  const copy = getContentCopy(locale);
  const ui = withOneTimePlanCopy(getPricingUiCopy(locale));
  const [mode, setMode] = useState<PricingMode>("annual");
  const activePlans = getLocalizedPlans(copy, ui, mode, locale);
  const activeNote = mode === "one-time" ? ui.oneTimeNote : undefined;
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white pt-20">
        <section className="w-full">
          <div className="container mx-auto max-w-[1400px] px-8">
            <h2 className="mb-6 mt-16 scroll-mt-24 text-center text-4xl font-bold leading-10 text-ink">{copy.pricingHero.title}</h2>
            <p className="pricing-hero-subtitle mb-6 text-center text-xl leading-7 text-slate-500">{copy.pricingHero.description}</p>
          </div>
        </section>
        <section className="mx-auto max-w-[1400px] px-8 pb-12">
          <div role="tablist" aria-label={ui.billingOptions} className="mx-auto grid h-10 w-full max-w-lg grid-cols-3 items-center justify-center gap-0 rounded-md bg-slate-100 p-1 text-muted-foreground">
            {pricingModeOrder.map((item) => {
              const selected = mode === item;
              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setMode(item)}
                  className={clsx("inline-flex min-h-8 items-center justify-center gap-1 whitespace-nowrap rounded-[4px] px-3 py-1.5 text-sm font-medium ring-offset-background transition-all", selected ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:bg-white/70 hover:text-ink")}
                >
                  {ui.modeLabels[item]}
                  {item === "one-time" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src="https://cdn.votxt.co/stripe-crypto.svg" alt={ui.stripeCrypto} title={ui.stripeCrypto} className="h-4 w-auto dark:invert dark:brightness-0" />
                  ) : null}
                  {item === "annual" ? <span className="ml-1 inline-flex rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-semibold leading-3 text-white">{ui.annualBadge}</span> : null}
                </button>
              );
            })}
          </div>
          {activeNote ? <p className="mx-auto mt-4 max-w-2xl text-center text-sm font-bold text-ink/55">{activeNote}</p> : null}
          <div className="mt-8 min-w-0 max-w-full overflow-x-auto px-4 pb-8 [scrollbar-width:thin]">
            <div className={clsx("mx-auto flex flex-col items-center gap-8 sm:min-w-max sm:flex-row sm:items-stretch", mode === "one-time" && "sm:justify-center")}>
              {activePlans.map((plan) => (
                <PricingPlanCard key={plan.name} plan={plan as PricingPlan} mode={mode} ui={ui} monthSuffix={copy.perMonth} />
              ))}
            </div>
          </div>
        </section>
        <section id="faq-refund" className="bg-white px-4 pb-16 pt-12 md:px-8">
          <h2 id="faq" className="mb-8 scroll-mt-24 text-center text-3xl font-bold leading-9 text-ink md:mb-12 md:text-4xl md:leading-10">{copy.faqHero.title}</h2>
          <PricingFaqAccordion faqs={copy.faqs} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export function FAQPage() {
  const copy = getContentCopy(useLocale());
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white pt-20">
        <section className="px-4 pb-16 pt-16 md:px-8">
          <h1 className="mb-8 scroll-mt-24 text-center text-3xl font-bold leading-9 text-ink md:mb-12 md:text-4xl md:leading-10">{copy.faqHero.title}</h1>
          <PricingFaqAccordion faqs={copy.faqs} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export function BlogPage() {
  const locale = useLocale();
  const copy = getContentCopy(locale);
  const posts = getBlogPosts(locale);
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white">
        <section className="mx-auto mt-16 max-w-[1400px] px-4 pb-16 pt-4 md:mt-20 lg:mt-32">
          <h1 className="mb-6 text-3xl font-bold leading-9 text-foreground">{copy.blogHero.title}</h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="block cursor-pointer overflow-hidden rounded-lg bg-card shadow-md transition-colors hover:text-foreground"
              >
                <Image
                  src={post.coverImage}
                  alt={post.coverAlt}
                  width={540}
                  height={301}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <h2 className="mb-2 text-2xl font-semibold leading-8 text-foreground">{post.title}</h2>
                  <p className="mb-4 text-base leading-6 text-muted-foreground">{post.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
