"use client";

import {useState} from "react";
import Image from "next/image";
import {useLocale} from "next-intl";
import {CheckCircle2, ChevronRight, FileText, HelpCircle, Sparkles, Star} from "lucide-react";
import {PricingAction} from "@/components/pricing-actions";
import {SiteFooter, SiteHeader, PageHero} from "@/components/site-shell";
import {getBlogPosts} from "@/lib/blog";

type PaidPlan = "BASIC" | "STANDARD" | "PRO";
type PricingPlan = {
  name: string;
  price: string;
  quota: string;
  plan?: PaidPlan;
  cta: string;
  tagline?: string;
  annualPrice?: string;
  annualNote?: string;
  features: string[];
};
type PricingMode = "one-time" | "monthly" | "annual";

const paidPlanFeatures = [
  "Each file can be up to 10 hours long / 5 GB. Upload 50 files at a time.",
  "No daily file limit for transcription",
  "Premium transcription model (highest accuracy)",
  "Transcription available in 87 languages",
  "AI translation",
  "Word, CSV, PDF, TXT, SRT, VTT export formats",
  "Enhanced AI Insights",
  "YouTube transcription",
  "Speaker identification",
  "Automation-ready exports",
  "Bulk transcription",
  "No retention period for media files",
  "Priority email support"
];

const freePlanFeatures = [
  "120 minutes of transcription per month",
  "Each file can be up to 30 minutes long. Upload 1 file at a time.",
  "Limited to transcribe 3 files per day",
  "Basic transcription model (standard accuracy)",
  "Transcription available in 87 languages",
  "AI translation",
  "Word, CSV, PDF, TXT, SRT, VTT export formats",
  "Limited AI Insights",
  "30-day retention period for media files",
  "Email support"
];

const oneTimePlanFeatures = [
  "90-day validity",
  "Each file can be up to 10 hours long / 5 GB. Upload 50 files at a time.",
  "No daily file limit for transcription",
  "Premium transcription model (highest accuracy)",
  "Transcription available in 87 languages",
  "AI translation",
  "Word, CSV, PDF, TXT, SRT, VTT export formats",
  "Enhanced AI Insights",
  "YouTube transcription",
  "Speaker identification",
  "Bulk transcription",
  "No retention period for media files",
  "Priority email support"
];

const pricingModes: Record<PricingMode, {label: string; badge?: string; note?: string; plans: PricingPlan[]}> = {
  "one-time": {
    label: "One-Time",
    note: "All one-time plans support card and crypto payments via Stripe.",
    plans: [
      {
        name: "Lite",
        price: "$12.9",
        quota: "300 minutes total transcription",
        cta: "Buy now",
        tagline: "Perfect for short-term projects.",
        features: oneTimePlanFeatures
      },
      {
        name: "Plus",
        price: "$19.9",
        quota: "600 minutes total transcription",
        cta: "Buy now",
        tagline: "Perfect for short-term projects.",
        features: oneTimePlanFeatures
      }
    ]
  },
  monthly: {
    label: "Monthly",
    plans: [
      {
        name: "Free",
        price: "$0",
        quota: "No credit card required",
        cta: "Get started",
        tagline: "Great for trials and individual projects.",
        features: freePlanFeatures
      },
      {
        name: "Basic",
        price: "$10",
        quota: "1200 minutes of transcription per month",
        plan: "BASIC",
        cta: "Subscribe now",
        tagline: "Perfect for regular users and daily tasks.",
        features: ["$10 per 500 extra minutes", ...paidPlanFeatures]
      },
      {
        name: "Standard",
        price: "$20",
        quota: "3000 minutes of transcription per month",
        plan: "STANDARD",
        cta: "Subscribe now",
        tagline: "The best balance for growing needs.",
        features: ["$15 per 1000 extra minutes", ...paidPlanFeatures]
      },
      {
        name: "Pro",
        price: "$30",
        quota: "6000 minutes of transcription per month",
        plan: "PRO",
        cta: "Subscribe now",
        tagline: "Ideal for high-volume individual workflows.",
        features: ["$20 per 3000 extra minutes", ...paidPlanFeatures]
      }
    ]
  },
  annual: {
    label: "Annual",
    badge: "Save 40%",
    plans: [
      {
        name: "Free",
        price: "$0",
        quota: "No credit card required",
        cta: "Get started",
        tagline: "Great for trials and individual projects.",
        features: freePlanFeatures
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
        features: ["$10 per 500 extra minutes", ...paidPlanFeatures]
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
        features: ["$15 per 1000 extra minutes", ...paidPlanFeatures]
      },
      {
        name: "Pro",
        price: "$18",
        quota: "6000 minutes of transcription per month",
        plan: "PRO",
        cta: "Subscribe now",
        tagline: "Ideal for high-volume individual workflows.",
        annualPrice: "$30",
        annualNote: "($216 / year, billed yearly)",
        features: ["$20 per 3000 extra minutes", ...paidPlanFeatures]
      }
    ]
  }
};

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
      title: "关于 UniScribe 转写工作台的常见问题",
      description: "覆盖官网、登录、仪表盘、队列、AI 洞察、导出和国际化能力。"
    },
    faqs: [
      ["UniScribe 可以完成哪些转写工作？", "UniScribe 覆盖文件上传、链接转写、录音、仪表盘额度、AI 摘要、思维导图、问答、翻译和导出。"],
      ["可以用邮箱或 Google 登录吗？", "可以。你可以使用邮箱账号或 Google 账号进入个人转写工作台。"],
      ["支持哪些导出格式？", "任务完成后可以导出 Word、CSV、PDF、TXT、SRT 和 VTT，方便归档、字幕制作和内容复用。"],
      ["支持多少种语言？", "UniScribe 支持 87 种语言的转写，并可为完成的转写生成翻译。"],
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
          "Transcription available in 87 languages",
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
          "Transcription available in 87 languages",
          "AI translation",
          "Word, CSV, PDF, TXT, SRT, VTT export formats",
          "Enhanced AI Insights",
          "YouTube transcription",
          "Speaker identification",
          "Automation-ready exports",
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
          "Transcription available in 87 languages",
          "AI translation",
          "Word, CSV, PDF, TXT, SRT, VTT export formats",
          "Enhanced AI Insights",
          "YouTube transcription",
          "Speaker identification",
          "Automation-ready exports",
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
        tagline: "Ideal for high-volume individual workflows.",
        annualPrice: "$30",
        annualNote: "($216 / year, billed yearly)",
        features: [
          "$20 per 3000 extra minutes",
          "Each file can be up to 10 hours long / 5 GB. Upload 50 files at a time.",
          "No daily file limit for transcription",
          "Premium transcription model (highest accuracy)",
          "Transcription available in 87 languages",
          "AI translation",
          "Word, CSV, PDF, TXT, SRT, VTT export formats",
          "Enhanced AI Insights",
          "YouTube transcription",
          "Speaker identification",
          "Automation-ready exports",
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
      ["Can I export my transcript?", "Yes. UniScribe supports Word, CSV, PDF, TXT, SRT, and VTT export formats."],
      ["Which languages does UniScribe support for transcription?", "UniScribe supports transcription in 87 languages."],
      ["How soon can I expect my transcription results?", "Most files finish quickly. The exact time depends on file duration, size, and queue load."],
      ["Are my payments secure with UniScribe?", "Payments are handled through secure checkout and subscription billing flows."],
      ["How does UniScribe protect the confidentiality and security of my data?", "Media and transcription access is scoped to your account, and paid plans can avoid media retention limits."],
      ["When will I be billed?", "Subscription plans are billed monthly or yearly depending on the option you choose."],
      ["What happens if I cancel my subscription?", "You keep access for the paid period, and the subscription does not renew afterward."],
      ["Can I get a refund?", "Refund handling follows the refund policy linked from the footer."],
      ["How long are one-time packages valid for?", "One-time package validity depends on the package selected at purchase."],
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
      description: "UniScribe cubre minutos mensuales, límites diarios, tamaño de archivo, lotes, hablantes, exportaciones automatizadas y una ruta clara de mejora."
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
      title: "Preguntas sobre el espacio de trabajo UniScribe",
      description: "Respuestas sobre sitio web, autenticación, panel, cola, IA, exportación, facturación e idiomas."
    },
    faqs: [
      ["¿Qué puede transcribir UniScribe?", "Incluye carga, enlaces, grabación, cuotas, resúmenes, mapas mentales, Q&A, traducción y exportaciones."],
      ["¿Puedo iniciar sesión con email o Google?", "Sí. Puedes entrar al espacio personal con email o con una cuenta de Google."],
      ["¿Qué formatos puedo exportar?", "Puedes exportar Word, CSV, PDF, TXT, SRT y VTT para archivo, subtítulos y reutilización de contenido."],
      ["¿Cuántos idiomas admite?", "UniScribe admite transcripción en 87 idiomas y también puede generar traducciones."],
      ["¿Qué incluye el panel?", "Cuotas, carpetas, tareas, carga de archivos, enlaces, estado, editor, IA y centro de exportación."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Guías de transcripción, subtítulos, resumen y reutilización",
      description: "Un centro de recursos para flujos de transcripción de audio y video con UniScribe."
    },
    readMore: "Leer más",
    matrixTitle: "Más recursos de transcripción",
    matrixText: "Explora guías de idiomas, formatos de archivo, enlaces de video, subtítulos y resúmenes con IA."
  },
  fr: {
    pricingHero: {
      eyebrow: "Tarifs",
      title: "De l'essai gratuit à la transcription personnelle à grande échelle",
      description: "UniScribe couvre minutes mensuelles, limites quotidiennes, taille des fichiers, lots, locuteurs, exports automatisables et montée en gamme claire."
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
      title: "Questions fréquentes sur UniScribe",
      description: "Site, authentification, tableau de bord, file, IA, exports, facturation et localisation."
    },
    faqs: [
      ["Que peut transcrire UniScribe ?", "UniScribe couvre l'import de fichiers, les liens, l'enregistrement, les quotas, les résumés IA, les cartes mentales, les Q&R, la traduction et les exports."],
      ["Puis-je me connecter par email ou Google ?", "Oui. Vous pouvez accéder à votre espace personnel avec un email ou un compte Google."],
      ["Quels exports sont disponibles ?", "Vous pouvez exporter Word, CSV, PDF, TXT, SRT et VTT pour l'archive, les sous-titres et la réutilisation."],
      ["Combien de langues sont prises en charge ?", "UniScribe prend en charge la transcription dans 87 langues et peut aussi générer des traductions."],
      ["Que contient le tableau de bord ?", "Quotas, dossiers, tâches, upload de fichiers, liens, statut, éditeur, IA et exports."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Guides pour transcription, sous-titres, résumés et réutilisation",
      description: "Un centre de ressources pour les flux de transcription audio et vidéo avec UniScribe."
    },
    readMore: "Lire",
    matrixTitle: "Plus de ressources de transcription",
    matrixText: "Explorez les guides de langues, les formats de fichiers, les liens vidéo, les sous-titres et les résumés IA."
  },
  de: {
    pricingHero: {
      eyebrow: "Preise",
      title: "Vom Gratis-Test bis zur persönlichen Transkription mit hohem Volumen",
      description: "UniScribe deckt Monatsminuten, Tageslimits, Dateigrenzen, Stapel, Sprecherlabels, automatisierbare Exporte und klare Upgrades ab."
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
      title: "Häufige Fragen zum UniScribe-Arbeitsbereich",
      description: "Antworten zu Website, Authentifizierung, Dashboard, Warteschlange, KI, Export, Abrechnung und Lokalisierung."
    },
    faqs: [
      ["Was kann UniScribe transkribieren?", "UniScribe bietet Uploads, Links, Aufnahme, Kontingente, KI-Zusammenfassungen, Mindmaps, Q&A, Übersetzung und Exporte."],
      ["Kann ich mich mit E-Mail oder Google anmelden?", "Ja. Du kannst deinen persönlichen Arbeitsbereich per E-Mail oder Google-Konto öffnen."],
      ["Welche Exporte gibt es?", "Du kannst Word, CSV, PDF, TXT, SRT und VTT für Archive, Untertitel und Wiederverwendung exportieren."],
      ["Wie viele Sprachen werden unterstützt?", "UniScribe unterstützt Transkription in 87 Sprachen und kann auch Übersetzungen erzeugen."],
      ["Was enthält das Dashboard?", "Quota, Ordner, Aufgaben, Datei-Upload, Links, Status, Editor, KI und Exportzentrum."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Leitfäden für Transkription, Untertitel, Zusammenfassung und Wiederverwendung",
      description: "Ein Ressourcenbereich für Audio- und Video-Transkriptions-Workflows mit UniScribe."
    },
    readMore: "Lesen",
    matrixTitle: "Content-Roadmap",
    matrixText: "Weitere Seiten können Sprachen, Formate, YouTube-Tools, Social Transcription, Vergleiche und Hilfe abdecken."
  },
  ja: {
    pricingHero: {
      eyebrow: "料金",
      title: "無料トライアルから個人向け大容量文字起こしまで",
      description: "UniScribe は月間分数、日次制限、ファイル上限、バッチ、話者ラベル、自動化向けエクスポート、明確なアップグレード導線を備えます。"
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
      title: "UniScribe ワークスペースのよくある質問",
      description: "サイト、認証、ダッシュボード、キュー、AI、書き出し、請求、多言語対応をまとめます。"
    },
    faqs: [
      ["UniScribe では何を文字起こしできますか？", "アップロード、リンク、録音、クォータ、AI要約、マインドマップ、Q&A、翻訳、書き出しに対応しています。"],
      ["メールまたは Google でログインできますか？", "はい。メールアカウントまたは Google アカウントで個人ワークスペースに入れます。"],
      ["どの形式で書き出せますか？", "Word、CSV、PDF、TXT、SRT、VTT を書き出せます。アーカイブ、字幕、再利用に使えます。"],
      ["何言語に対応していますか？", "UniScribe は 87 言語の文字起こしに対応し、翻訳も生成できます。"],
      ["ダッシュボードには何がありますか？", "クォータ、フォルダ、タスク、ファイルアップロード、リンク、ステータス、エディタ、AI、書き出しがあります。"]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "文字起こし、字幕、要約、再利用のガイド",
      description: "UniScribe で音声・動画文字起こしワークフローを進めるためのリソースセンターです。"
    },
    readMore: "読む",
    matrixTitle: "コンテンツ計画",
    matrixText: "言語、形式、YouTubeツール、SNS文字起こし、比較、ヘルプ記事へ拡張できます。"
  },
  ko: {
    pricingHero: {
      eyebrow: "요금제",
      title: "무료 체험부터 개인 대용량 전사까지",
      description: "UniScribe는 월간 분수, 일일 제한, 파일 한도, 배치 작업, 화자 라벨, 자동화용 내보내기, 명확한 업그레이드 흐름을 제공합니다."
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
      title: "UniScribe 워크스페이스 FAQ",
      description: "웹사이트, 인증, 대시보드, 큐, AI, 내보내기, 결제, 현지화를 다룹니다."
    },
    faqs: [
      ["UniScribe는 무엇을 전사할 수 있나요?", "업로드, 링크, 녹음, 할당량, AI 요약, 마인드맵, Q&A, 번역, 내보내기를 제공합니다."],
      ["이메일 또는 Google로 로그인할 수 있나요?", "네. 이메일 계정이나 Google 계정으로 개인 워크스페이스에 들어갈 수 있습니다."],
      ["어떤 형식을 내보낼 수 있나요?", "Word, CSV, PDF, TXT, SRT, VTT를 내보내 아카이브, 자막, 콘텐츠 재사용에 활용할 수 있습니다."],
      ["몇 개 언어를 지원하나요?", "UniScribe는 63개 언어 전사를 지원하며 번역도 생성할 수 있습니다."],
      ["대시보드에는 무엇이 있나요?", "할당량, 폴더, 작업 목록, 파일 업로드, 링크, 상태, 편집기, AI, 내보내기가 있습니다."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "전사, 자막, 요약, 콘텐츠 재사용 가이드",
      description: "UniScribe에서 오디오 및 비디오 전사 워크플로를 진행하기 위한 리소스 센터입니다."
    },
    readMore: "읽기",
    matrixTitle: "콘텐츠 로드맵",
    matrixText: "언어, 형식, YouTube 도구, 소셜 전사, 비교, 도움말 문서로 확장할 수 있습니다."
  },
  pt: {
    pricingHero: {
      eyebrow: "Preços",
      title: "Do teste grátis à transcrição pessoal em alto volume",
      description: "UniScribe cobre minutos mensais, limites diários, tamanho de arquivo, lotes, falantes, exportações automatizáveis e uma rota clara de upgrade."
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
      title: "Perguntas sobre o workspace UniScribe",
      description: "Site, autenticação, painel, fila, IA, exportações, cobrança e localização."
    },
    faqs: [
      ["O que o UniScribe pode transcrever?", "UniScribe cobre upload, links, gravação, cotas, resumos de IA, mapas mentais, Q&A, tradução e exportações."],
      ["Posso entrar com email ou Google?", "Sim. Você pode acessar o workspace pessoal com email ou uma conta Google."],
      ["Quais formatos posso exportar?", "Você pode exportar Word, CSV, PDF, TXT, SRT e VTT para arquivo, legendas e reutilização de conteúdo."],
      ["Quantos idiomas são suportados?", "UniScribe suporta transcrição em 87 idiomas e também pode gerar traduções."],
      ["O que existe no painel?", "Cotas, pastas, tarefas, upload de arquivos, links, status, editor, IA e central de exportação."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Guias de transcrição, legendas, resumo e reutilização",
      description: "Um centro de recursos para fluxos de transcrição de áudio e vídeo com UniScribe."
    },
    readMore: "Ler mais",
    matrixTitle: "Mais recursos de transcrição",
    matrixText: "Explore guias de idiomas, formatos de arquivo, links de vídeo, legendas e resumos com IA."
  }
} as const;

function getContentCopy(locale: string) {
  return contentCopy[locale as keyof typeof contentCopy] ?? contentCopy.en;
}

export function PricingPage() {
  const locale = useLocale();
  const copy = getContentCopy(locale);
  const [mode, setMode] = useState<PricingMode>("annual");
  const activePricing = pricingModes[mode];
  const activePlans = locale === "en" ? activePricing.plans : mode === "annual" ? copy.plans : activePricing.plans;
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-32 text-center md:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink md:text-5xl">{copy.pricingHero.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-ink/60">{copy.pricingHero.description}</p>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-8">
        <div role="tablist" aria-label="Billing options" className="mx-auto grid w-fit grid-cols-3 gap-1 rounded-lg border border-ink/10 bg-white p-1 text-sm font-black shadow-soft">
          {(Object.keys(pricingModes) as PricingMode[]).map((item) => {
            const selected = mode === item;
            const option = pricingModes[item];
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setMode(item)}
                className={selected ? "rounded-md bg-violet px-4 py-2 text-white" : "rounded-md px-4 py-2 text-ink/55 transition hover:bg-paper hover:text-ink"}
              >
                {option.label}
                {option.badge ? <span className={selected ? "ml-1 text-white/80" : "ml-1 text-violet"}>{option.badge}</span> : null}
              </button>
            );
          })}
        </div>
        {activePricing.note ? <p className="mx-auto mt-4 max-w-2xl text-center text-sm font-bold text-ink/55">{activePricing.note}</p> : null}
        <div className={mode === "one-time" ? "mx-auto mt-8 grid max-w-3xl gap-4 md:grid-cols-2" : "mt-8 grid gap-4 lg:grid-cols-4"}>
          {activePlans.map((plan) => {
            const featured = plan.plan === "STANDARD";
            const isOneTime = mode === "one-time";
            return (
              <article
                key={plan.name}
                className={
                  featured
                    ? "relative flex flex-col rounded-xl border-2 border-violet bg-white p-6 shadow-glow transition hover:-translate-y-1"
                    : "relative flex flex-col rounded-xl border border-ink/10 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-card"
                }
              >
                {featured ? <span className="chip-tide absolute -top-3 left-6">Most popular</span> : null}
                <h2 className="text-xl font-black">{plan.name}</h2>
                <p className="mt-2 min-h-10 text-sm leading-5 text-ink/55">{(plan as PricingPlan).tagline ?? (plan.name === "Free" ? "Great for trials and individual projects." : plan.name === "Basic" ? "Perfect for regular users and daily tasks." : plan.name === "Standard" ? "The best balance for growing needs." : "Ideal for high-volume users.")}</p>
                <div className="mt-5 flex items-end gap-2">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="pb-1 text-sm text-ink/60">{isOneTime ? "One-time payment" : copy.perMonth}</span>
                </div>
                {(plan as PricingPlan).annualPrice ? (
                  <p className="mt-2 text-sm font-bold text-ink/50">
                    <span className="line-through">{(plan as PricingPlan).annualPrice}</span>
                    <span className="ml-2">{(plan as PricingPlan).annualNote}</span>
                  </p>
                ) : null}
                <p className="mt-3 text-sm font-bold text-violet">{plan.quota}</p>
                <div className="mt-5 grid flex-1 gap-2">
                  {plan.features.map((item: string) => {
                    return (
                      <p key={item} className="flex items-start gap-2 text-sm leading-5 text-ink/70"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-violet" />{item}</p>
                    );
                  })}
                </div>
                <PricingAction plan={plan.plan as PaidPlan | undefined} label={plan.cta} mode={mode} />
              </article>
            );
          })}
        </div>
      </section>
      <section id="faq-refund" className="border-t border-ink/10 bg-white px-4 py-12 md:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-black tracking-tight text-ink">Frequently Asked Questions</h2>
          <div className="mt-6 grid gap-3">
            {copy.faqs.map(([question, answer]) => (
              <article key={question} className="rounded-xl border border-ink/10 bg-paper/60 p-5 transition hover:border-violet/20">
                <h3 className="flex items-center gap-2 font-black"><HelpCircle size={18} className="text-violet" />{question}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/68">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

export function FAQPage() {
  const copy = getContentCopy(useLocale());
  return (
    <main className="min-h-screen bg-paper">
      <SiteHeader />
      <PageHero {...copy.faqHero} />
      <section className="mx-auto grid max-w-5xl gap-3 px-4 py-12 md:px-8">
        {copy.faqs.map(([question, answer]) => (
          <article key={question} className="rounded-xl border border-ink/10 bg-white p-5 shadow-soft transition hover:border-violet/20 hover:shadow-card">
            <h2 className="flex items-center gap-2 font-black"><HelpCircle size={18} className="text-violet" />{question}</h2>
            <p className="mt-3 text-sm leading-6 text-ink/68">{answer}</p>
          </article>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}

export function BlogPage() {
  const locale = useLocale();
  const copy = getContentCopy(locale);
  const posts = getBlogPosts(locale);
  return (
    <main className="min-h-screen bg-paper">
      <SiteHeader />
      <PageHero {...copy.blogHero} />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 md:px-8 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.slug} className="group overflow-hidden rounded-xl border border-ink/10 bg-white shadow-soft transition hover:-translate-y-0.5 hover:border-violet/25 hover:shadow-card">
            <div className="relative aspect-[16/9] bg-violet/5">
              <Image src={post.coverImage} alt={post.coverAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
            </div>
            <div className="p-6">
              <p className="mb-3 text-xs font-black uppercase tracking-wide text-violet">{post.date} · {post.category}</p>
              <h2 className="flex items-start gap-2 text-xl font-black"><FileText size={19} className="mt-1 shrink-0 text-violet" />{post.title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/68">{post.excerpt}</p>
              <a href={`/${locale}/blog/${post.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-black text-violet transition group-hover:gap-2">{copy.readMore} <ChevronRight size={16} /></a>
            </div>
          </article>
        ))}
      </section>
      <section className="border-t border-ink/10 bg-white px-4 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="flex items-center gap-2 text-2xl font-black"><Sparkles size={22} className="text-violet" />{copy.matrixTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/68">{copy.matrixText}</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-4 py-2 text-sm font-black">
            <Star className="fill-violet text-violet" size={18} />
            Audio & video transcription guides
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
