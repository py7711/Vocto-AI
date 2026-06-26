"use client";

import {useLocale} from "next-intl";
import {CheckCircle2, ChevronRight, FileText, HelpCircle, Sparkles} from "lucide-react";
import {PricingAction} from "@/components/pricing-actions";
import {SiteFooter, SiteHeader, PageHero} from "@/components/site-shell";
import {getBlogPosts} from "@/lib/blog";

type PaidPlan = "BASIC" | "STANDARD" | "PRO";

const contentCopy = {
  zh: {
    pricingHero: {
      eyebrow: "订阅套餐",
      title: "从免费试用到高容量团队转写",
      description: "参考竞品的分钟额度、每日次数、单文件限制、批量任务、发言人识别和 API 能力，Votxt 提供清晰的升级路径。"
    },
    perMonth: "/ 月",
    plans: [
      {name: "Free", price: "$0", quota: "120 分钟/月", plan: undefined, cta: "免费开始", features: ["每日 3 个文件", "单文件 30 分钟", "标准模型", "TXT/SRT/VTT/PDF 导出"]},
      {name: "Basic", price: "$6", quota: "1200 分钟/月", plan: "BASIC", cta: "升级 Basic", features: ["YouTube 链接", "发言人识别", "批量 50 文件", "API 访问"]},
      {name: "Standard", price: "$12", quota: "3000 分钟/月", plan: "STANDARD", cta: "升级 Standard", features: ["优先队列", "更长文件", "团队协作准备", "高级导出"]},
      {name: "Pro", price: "$18", quota: "6000 分钟/月", plan: "PRO", cta: "升级 Pro", features: ["高容量团队", "更低超额成本", "优先支持", "长期保留"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "关于 Votxt 转写工作台的常见问题",
      description: "覆盖官网、登录、仪表盘、队列、AI 洞察、导出和国际化能力。"
    },
    faqs: [
      ["Votxt 和 UniScribe、VideoTranscriber 类似吗？", "是。Votxt 覆盖官网上传入口、链接转写、录音、仪表盘、额度、AI 摘要、思维导图、问答、翻译和导出。"],
      ["登录和注册现在是真实认证吗？", "是。当前已实现邮箱密码注册、登录、登出、当前用户接口、邮箱验证、Google OAuth 和签名 httpOnly Cookie 会话；生产环境需要配置 Resend 与 Google OAuth 密钥。"],
      ["支持哪些导出格式？", "当前实现 TXT、SRT、VTT、JSON、Markdown、CSV、DOCX 和 PDF 导出。"],
      ["是否支持多语言？", "应用已配置 en、zh、es、fr、de、ja、ko、pt，核心工作台与商业化页面具备国际化入口。"],
      ["仪表盘有哪些模块？", "包含免费额度、文件夹、任务列表、上传/链接/录音、转写状态、编辑器、AI 洞察和导出中心。"]
    ],
    blogHero: {
      eyebrow: "博客",
      title: "转写、字幕、摘要和内容复用指南",
      description: "参考 UniScribe 的内容型 SEO 页面和 VideoTranscriber 的工具生态，建立围绕音视频转文字的资源中心。"
    },
    readMore: "阅读全文",
    matrixTitle: "后续内容矩阵",
    matrixText: "可继续扩展语言页、格式页、YouTube 工具页、社媒转写页、竞品对比页和帮助中心文章，用于承接搜索流量。"
  },
  en: {
    pricingHero: {
      eyebrow: "Pricing",
      title: "From free trials to high-volume team transcription",
      description: "Votxt mirrors the commercial patterns users expect: monthly minutes, daily limits, file caps, batch jobs, speaker labels, API access, and a clear upgrade path."
    },
    perMonth: "/ month",
    plans: [
      {name: "Free", price: "$0", quota: "120 min/month", plan: undefined, cta: "Start free", features: ["3 files per day", "30 min per file", "Standard model", "TXT/SRT/VTT/PDF export"]},
      {name: "Basic", price: "$6", quota: "1200 min/month", plan: "BASIC", cta: "Upgrade Basic", features: ["YouTube links", "Speaker labels", "50-file batches", "API access"]},
      {name: "Standard", price: "$12", quota: "3000 min/month", plan: "STANDARD", cta: "Upgrade Standard", features: ["Priority queue", "Longer files", "Team-ready workspace", "Advanced exports"]},
      {name: "Pro", price: "$18", quota: "6000 min/month", plan: "PRO", cta: "Upgrade Pro", features: ["High-volume teams", "Lower overage cost", "Priority support", "Longer retention"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Common questions about the Votxt workspace",
      description: "Answers for the website, authentication, dashboard, queue, AI insights, exports, billing, and localization."
    },
    faqs: [
      ["Is Votxt similar to UniScribe and VideoTranscriber?", "Yes. Votxt covers website upload, link transcription, recording, dashboard quotas, AI summaries, mind maps, Q&A, translation, and exports."],
      ["Are sign in and sign up real?", "Yes. Email/password registration, login, logout, current-user API, email verification, Google OAuth, and signed httpOnly cookies are implemented. Production needs Resend and Google OAuth credentials."],
      ["Which export formats are supported?", "TXT, SRT, VTT, JSON, Markdown, CSV, DOCX, and PDF are all implemented."],
      ["Is the app localized?", "The app supports en, zh, es, fr, de, ja, ko, and pt routes. The core workspace and commercial pages expose localized copy."],
      ["What is inside the dashboard?", "Quota, folders, task list, upload/link/recording inputs, transcription status, editor, AI insights, and export center."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Guides for transcription, captions, summaries, and content reuse",
      description: "A resource center inspired by UniScribe SEO content and VideoTranscriber-style tool ecosystems."
    },
    readMore: "Read more",
    matrixTitle: "Content roadmap",
    matrixText: "Next pages can cover languages, formats, YouTube tools, social transcription, competitor comparisons, and help-center articles for search demand."
  },
  es: {
    pricingHero: {
      eyebrow: "Precios",
      title: "De prueba gratis a transcripción de equipos de alto volumen",
      description: "Votxt cubre minutos mensuales, límites diarios, tamaño de archivo, lotes, hablantes, API y una ruta clara de mejora."
    },
    perMonth: "/ mes",
    plans: [
      {name: "Free", price: "$0", quota: "120 min/mes", plan: undefined, cta: "Empezar gratis", features: ["3 archivos al día", "30 min por archivo", "Modelo estándar", "Exportar TXT/SRT/VTT/PDF"]},
      {name: "Basic", price: "$6", quota: "1200 min/mes", plan: "BASIC", cta: "Mejorar a Basic", features: ["Enlaces de YouTube", "Etiquetas de hablantes", "Lotes de 50 archivos", "Acceso API"]},
      {name: "Standard", price: "$12", quota: "3000 min/mes", plan: "STANDARD", cta: "Mejorar a Standard", features: ["Cola prioritaria", "Archivos más largos", "Espacio de equipo", "Exportaciones avanzadas"]},
      {name: "Pro", price: "$18", quota: "6000 min/mes", plan: "PRO", cta: "Mejorar a Pro", features: ["Equipos de alto volumen", "Menor coste extra", "Soporte prioritario", "Retención extendida"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Preguntas sobre el espacio de trabajo Votxt",
      description: "Respuestas sobre sitio web, autenticación, panel, cola, IA, exportación, facturación e idiomas."
    },
    faqs: [
      ["¿Votxt se parece a UniScribe y VideoTranscriber?", "Sí. Incluye carga, enlaces, grabación, cuotas, resúmenes, mapas mentales, Q&A, traducción y exportaciones."],
      ["¿El inicio de sesión y registro son reales?", "Sí. Hay registro con email, login, logout, usuario actual, verificación de email, Google OAuth y cookies httpOnly firmadas."],
      ["¿Qué formatos puedo exportar?", "TXT, SRT, VTT, JSON, Markdown, CSV, DOCX y PDF están implementados."],
      ["¿La aplicación está localizada?", "Sí. Hay rutas en en, zh, es, fr, de, ja, ko y pt con textos localizados en las páginas principales."],
      ["¿Qué incluye el panel?", "Cuotas, carpetas, tareas, carga/enlace/grabación, estado, editor, IA y centro de exportación."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Guías de transcripción, subtítulos, resumen y reutilización",
      description: "Un centro de recursos inspirado en el SEO de UniScribe y el ecosistema de herramientas de VideoTranscriber."
    },
    readMore: "Leer más",
    matrixTitle: "Hoja de ruta de contenido",
    matrixText: "Las siguientes páginas pueden cubrir idiomas, formatos, herramientas de YouTube, redes sociales, comparativas y ayuda."
  },
  fr: {
    pricingHero: {
      eyebrow: "Tarifs",
      title: "De l'essai gratuit à la transcription d'équipe à grande échelle",
      description: "Votxt couvre minutes mensuelles, limites quotidiennes, taille des fichiers, lots, locuteurs, API et montée en gamme claire."
    },
    perMonth: "/ mois",
    plans: [
      {name: "Free", price: "$0", quota: "120 min/mois", plan: undefined, cta: "Commencer", features: ["3 fichiers par jour", "30 min par fichier", "Modèle standard", "Export TXT/SRT/VTT/PDF"]},
      {name: "Basic", price: "$6", quota: "1200 min/mois", plan: "BASIC", cta: "Passer à Basic", features: ["Liens YouTube", "Étiquettes locuteurs", "Lots de 50 fichiers", "Accès API"]},
      {name: "Standard", price: "$12", quota: "3000 min/mois", plan: "STANDARD", cta: "Passer à Standard", features: ["File prioritaire", "Fichiers plus longs", "Espace équipe", "Exports avancés"]},
      {name: "Pro", price: "$18", quota: "6000 min/mois", plan: "PRO", cta: "Passer à Pro", features: ["Équipes à fort volume", "Surcoût réduit", "Support prioritaire", "Conservation longue"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Questions fréquentes sur Votxt",
      description: "Site, authentification, tableau de bord, file, IA, exports, facturation et localisation."
    },
    faqs: [
      ["Votxt ressemble-t-il à UniScribe et VideoTranscriber ?", "Oui. Votxt couvre upload, liens, enregistrement, quotas, résumés IA, cartes mentales, Q&R, traduction et exports."],
      ["La connexion et l'inscription sont-elles réelles ?", "Oui. Email/mot de passe, déconnexion, utilisateur courant, vérification email, Google OAuth et cookies httpOnly signés sont en place."],
      ["Quels exports sont disponibles ?", "TXT, SRT, VTT, JSON, Markdown, CSV, DOCX et PDF sont implémentés."],
      ["L'application est-elle multilingue ?", "Oui. Les routes en, zh, es, fr, de, ja, ko et pt exposent les pages principales localisées."],
      ["Que contient le tableau de bord ?", "Quotas, dossiers, liste de tâches, upload/lien/enregistrement, statut, éditeur, IA et exports."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Guides pour transcription, sous-titres, résumés et réutilisation",
      description: "Un centre de ressources inspiré du SEO d'UniScribe et de l'écosystème d'outils VideoTranscriber."
    },
    readMore: "Lire",
    matrixTitle: "Feuille de route contenu",
    matrixText: "Les prochaines pages peuvent couvrir langues, formats, YouTube, réseaux sociaux, comparatifs et centre d'aide."
  },
  de: {
    pricingHero: {
      eyebrow: "Preise",
      title: "Vom Gratis-Test bis zur Team-Transkription mit hohem Volumen",
      description: "Votxt deckt Monatsminuten, Tageslimits, Dateigrenzen, Stapel, Sprecherlabels, API und klare Upgrades ab."
    },
    perMonth: "/ Monat",
    plans: [
      {name: "Free", price: "$0", quota: "120 Min./Monat", plan: undefined, cta: "Gratis starten", features: ["3 Dateien pro Tag", "30 Min. pro Datei", "Standardmodell", "TXT/SRT/VTT/PDF Export"]},
      {name: "Basic", price: "$6", quota: "1200 Min./Monat", plan: "BASIC", cta: "Basic upgraden", features: ["YouTube-Links", "Sprecherlabels", "50 Dateien pro Stapel", "API-Zugriff"]},
      {name: "Standard", price: "$12", quota: "3000 Min./Monat", plan: "STANDARD", cta: "Standard upgraden", features: ["Prioritätswarteschlange", "Längere Dateien", "Team-Arbeitsbereich", "Erweiterte Exporte"]},
      {name: "Pro", price: "$18", quota: "6000 Min./Monat", plan: "PRO", cta: "Pro upgraden", features: ["Teams mit hohem Volumen", "Geringere Zusatzkosten", "Priorisierter Support", "Längere Aufbewahrung"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Häufige Fragen zum Votxt-Arbeitsbereich",
      description: "Antworten zu Website, Authentifizierung, Dashboard, Warteschlange, KI, Export, Abrechnung und Lokalisierung."
    },
    faqs: [
      ["Ist Votxt ähnlich wie UniScribe und VideoTranscriber?", "Ja. Votxt bietet Uploads, Links, Aufnahme, Quoten, KI-Zusammenfassungen, Mindmaps, Q&A, Übersetzung und Exporte."],
      ["Sind Login und Registrierung echt?", "Ja. E-Mail/Passwort, Logout, Benutzer-API, E-Mail-Verifizierung, Google OAuth und signierte httpOnly-Cookies sind umgesetzt."],
      ["Welche Exporte gibt es?", "TXT, SRT, VTT, JSON, Markdown, CSV, DOCX und PDF sind implementiert."],
      ["Ist die App lokalisiert?", "Ja. en, zh, es, fr, de, ja, ko und pt haben lokalisierte Hauptseiten."],
      ["Was enthält das Dashboard?", "Quota, Ordner, Aufgaben, Upload/Link/Aufnahme, Status, Editor, KI und Exportzentrum."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Leitfäden für Transkription, Untertitel, Zusammenfassung und Wiederverwendung",
      description: "Ein Ressourcenbereich nach dem Vorbild von UniScribe-SEO und VideoTranscriber-Tools."
    },
    readMore: "Lesen",
    matrixTitle: "Content-Roadmap",
    matrixText: "Weitere Seiten können Sprachen, Formate, YouTube-Tools, Social Transcription, Vergleiche und Hilfe abdecken."
  },
  ja: {
    pricingHero: {
      eyebrow: "料金",
      title: "無料トライアルから大容量チーム文字起こしまで",
      description: "Votxt は月間分数、日次制限、ファイル上限、バッチ、話者ラベル、API、明確なアップグレード導線を備えます。"
    },
    perMonth: "/ 月",
    plans: [
      {name: "Free", price: "$0", quota: "120 分/月", plan: undefined, cta: "無料で開始", features: ["1日3ファイル", "1ファイル30分", "標準モデル", "TXT/SRT/VTT/PDF 書き出し"]},
      {name: "Basic", price: "$6", quota: "1200 分/月", plan: "BASIC", cta: "Basic にアップグレード", features: ["YouTubeリンク", "話者ラベル", "50ファイル一括", "APIアクセス"]},
      {name: "Standard", price: "$12", quota: "3000 分/月", plan: "STANDARD", cta: "Standard にアップグレード", features: ["優先キュー", "長尺ファイル", "チーム準備済み", "高度な書き出し"]},
      {name: "Pro", price: "$18", quota: "6000 分/月", plan: "PRO", cta: "Pro にアップグレード", features: ["大容量チーム", "低い超過コスト", "優先サポート", "長期保管"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Votxt ワークスペースのよくある質問",
      description: "サイト、認証、ダッシュボード、キュー、AI、書き出し、請求、多言語対応をまとめます。"
    },
    faqs: [
      ["Votxt は UniScribe や VideoTranscriber に似ていますか？", "はい。アップロード、リンク、録音、クォータ、AI要約、マインドマップ、Q&A、翻訳、書き出しを備えます。"],
      ["ログインと登録は実装済みですか？", "はい。メール登録、ログイン、ログアウト、現在ユーザーAPI、メール検証、Google OAuth、署名付き httpOnly Cookie を実装済みです。"],
      ["どの形式で書き出せますか？", "TXT、SRT、VTT、JSON、Markdown、CSV、DOCX、PDF を実装済みです。"],
      ["多言語対応していますか？", "はい。en、zh、es、fr、de、ja、ko、pt の主要ページをローカライズしています。"],
      ["ダッシュボードには何がありますか？", "クォータ、フォルダ、タスク、アップロード/リンク/録音、ステータス、エディタ、AI、書き出しがあります。"]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "文字起こし、字幕、要約、再利用のガイド",
      description: "UniScribe のSEOコンテンツと VideoTranscriber 型ツール群を参考にしたリソースセンターです。"
    },
    readMore: "読む",
    matrixTitle: "コンテンツ計画",
    matrixText: "言語、形式、YouTubeツール、SNS文字起こし、比較、ヘルプ記事へ拡張できます。"
  },
  ko: {
    pricingHero: {
      eyebrow: "요금제",
      title: "무료 체험부터 대용량 팀 전사까지",
      description: "Votxt는 월간 분수, 일일 제한, 파일 한도, 배치 작업, 화자 라벨, API, 명확한 업그레이드 흐름을 제공합니다."
    },
    perMonth: "/ 월",
    plans: [
      {name: "Free", price: "$0", quota: "월 120분", plan: undefined, cta: "무료 시작", features: ["하루 3개 파일", "파일당 30분", "표준 모델", "TXT/SRT/VTT/PDF 내보내기"]},
      {name: "Basic", price: "$6", quota: "월 1200분", plan: "BASIC", cta: "Basic 업그레이드", features: ["YouTube 링크", "화자 라벨", "50개 파일 배치", "API 접근"]},
      {name: "Standard", price: "$12", quota: "월 3000분", plan: "STANDARD", cta: "Standard 업그레이드", features: ["우선 큐", "긴 파일", "팀 워크스페이스", "고급 내보내기"]},
      {name: "Pro", price: "$18", quota: "월 6000분", plan: "PRO", cta: "Pro 업그레이드", features: ["대용량 팀", "낮은 초과 비용", "우선 지원", "장기 보관"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Votxt 워크스페이스 FAQ",
      description: "웹사이트, 인증, 대시보드, 큐, AI, 내보내기, 결제, 현지화를 다룹니다."
    },
    faqs: [
      ["Votxt는 UniScribe, VideoTranscriber와 비슷한가요?", "네. 업로드, 링크, 녹음, 할당량, AI 요약, 마인드맵, Q&A, 번역, 내보내기를 제공합니다."],
      ["로그인과 가입이 실제로 동작하나요?", "네. 이메일 가입, 로그인, 로그아웃, 현재 사용자 API, 이메일 인증, Google OAuth, 서명된 httpOnly 쿠키가 구현되어 있습니다."],
      ["어떤 형식을 내보낼 수 있나요?", "TXT, SRT, VTT, JSON, Markdown, CSV, DOCX, PDF가 구현되어 있습니다."],
      ["앱이 현지화되어 있나요?", "네. en, zh, es, fr, de, ja, ko, pt 주요 페이지를 현지화했습니다."],
      ["대시보드에는 무엇이 있나요?", "할당량, 폴더, 작업 목록, 업로드/링크/녹음, 상태, 편집기, AI, 내보내기가 있습니다."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "전사, 자막, 요약, 콘텐츠 재사용 가이드",
      description: "UniScribe SEO 콘텐츠와 VideoTranscriber 도구 생태계를 참고한 리소스 센터입니다."
    },
    readMore: "읽기",
    matrixTitle: "콘텐츠 로드맵",
    matrixText: "언어, 형식, YouTube 도구, 소셜 전사, 비교, 도움말 문서로 확장할 수 있습니다."
  },
  pt: {
    pricingHero: {
      eyebrow: "Preços",
      title: "Do teste grátis à transcrição de equipes em alto volume",
      description: "Votxt cobre minutos mensais, limites diários, tamanho de arquivo, lotes, falantes, API e uma rota clara de upgrade."
    },
    perMonth: "/ mês",
    plans: [
      {name: "Free", price: "$0", quota: "120 min/mês", plan: undefined, cta: "Começar grátis", features: ["3 arquivos por dia", "30 min por arquivo", "Modelo padrão", "Exportar TXT/SRT/VTT/PDF"]},
      {name: "Basic", price: "$6", quota: "1200 min/mês", plan: "BASIC", cta: "Upgrade Basic", features: ["Links do YouTube", "Rótulos de falantes", "Lotes de 50 arquivos", "Acesso API"]},
      {name: "Standard", price: "$12", quota: "3000 min/mês", plan: "STANDARD", cta: "Upgrade Standard", features: ["Fila prioritária", "Arquivos maiores", "Workspace de equipe", "Exportações avançadas"]},
      {name: "Pro", price: "$18", quota: "6000 min/mês", plan: "PRO", cta: "Upgrade Pro", features: ["Equipes de alto volume", "Menor custo extra", "Suporte prioritário", "Retenção longa"]}
    ],
    faqHero: {
      eyebrow: "FAQ",
      title: "Perguntas sobre o workspace Votxt",
      description: "Site, autenticação, painel, fila, IA, exportações, cobrança e localização."
    },
    faqs: [
      ["Votxt é parecido com UniScribe e VideoTranscriber?", "Sim. Votxt cobre upload, links, gravação, cotas, resumos de IA, mapas mentais, Q&A, tradução e exportações."],
      ["Login e cadastro são reais?", "Sim. Email/senha, logout, API de usuário atual, verificação de email, Google OAuth e cookies httpOnly assinados estão implementados."],
      ["Quais formatos posso exportar?", "TXT, SRT, VTT, JSON, Markdown, CSV, DOCX e PDF estão implementados."],
      ["O app é localizado?", "Sim. As rotas en, zh, es, fr, de, ja, ko e pt têm páginas principais localizadas."],
      ["O que existe no painel?", "Cotas, pastas, tarefas, upload/link/gravação, status, editor, IA e central de exportação."]
    ],
    blogHero: {
      eyebrow: "Blog",
      title: "Guias de transcrição, legendas, resumo e reutilização",
      description: "Um centro de recursos inspirado no SEO da UniScribe e no ecossistema de ferramentas do VideoTranscriber."
    },
    readMore: "Ler mais",
    matrixTitle: "Roteiro de conteúdo",
    matrixText: "Próximas páginas podem cobrir idiomas, formatos, YouTube, redes sociais, comparativos e central de ajuda."
  }
} as const;

function getContentCopy(locale: string) {
  return contentCopy[locale as keyof typeof contentCopy] ?? contentCopy.en;
}

export function PricingPage() {
  const copy = getContentCopy(useLocale());
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <PageHero {...copy.pricingHero} />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 md:px-8 lg:grid-cols-4">
        {copy.plans.map((plan) => {
          const featured = plan.plan === "STANDARD";
          return (
            <article
              key={plan.name}
              className={
                featured
                  ? "relative flex flex-col rounded-2xl border-2 border-tide bg-white p-6 shadow-glow transition hover:-translate-y-1"
                  : "relative flex flex-col rounded-2xl border border-ink/10 bg-white/75 p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-card"
              }
            >
              {featured ? <span className="chip-tide absolute -top-3 left-6">★ Popular</span> : null}
              <h2 className="text-xl font-black">{plan.name}</h2>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="pb-1 text-sm text-ink/60">{copy.perMonth}</span>
              </div>
              <p className="mt-3 text-sm font-bold text-tide">{plan.quota}</p>
              <div className="mt-5 grid flex-1 gap-2">
                {plan.features.map((item) => (
                  <p key={item} className="flex items-center gap-2 text-sm text-ink/70"><CheckCircle2 size={16} className="text-tide" />{item}</p>
                ))}
              </div>
              <PricingAction plan={plan.plan as PaidPlan | undefined} label={plan.cta} />
            </article>
          );
        })}
      </section>
      <SiteFooter />
    </main>
  );
}

export function FAQPage() {
  const copy = getContentCopy(useLocale());
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <PageHero {...copy.faqHero} />
      <section className="mx-auto grid max-w-5xl gap-3 px-4 py-12 md:px-8">
        {copy.faqs.map(([question, answer]) => (
          <article key={question} className="rounded-2xl border border-ink/10 bg-white/75 p-5 shadow-soft transition hover:border-ink/15 hover:shadow-card">
            <h2 className="flex items-center gap-2 font-black"><HelpCircle size={18} className="text-coral" />{question}</h2>
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
    <main className="min-h-screen">
      <SiteHeader />
      <PageHero {...copy.blogHero} />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 md:px-8 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.slug} className="group rounded-2xl border border-ink/10 bg-white/75 p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-tide/25 hover:shadow-card">
            <p className="mb-3 text-xs font-black uppercase tracking-wide text-tide">{post.date} · {post.category}</p>
            <h2 className="flex items-start gap-2 text-xl font-black"><FileText size={19} className="mt-1 text-coral" />{post.title}</h2>
            <p className="mt-3 text-sm leading-6 text-ink/68">{post.excerpt}</p>
            <a href={`/${locale}/blog/${post.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-black text-tide transition group-hover:gap-2">{copy.readMore} <ChevronRight size={16} /></a>
          </article>
        ))}
      </section>
      <section className="border-t border-ink/10 bg-white/55 px-4 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="flex items-center gap-2 text-2xl font-black"><Sparkles size={22} className="text-brass" />{copy.matrixTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/68">{copy.matrixText}</p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
