export type BlogLocale = "zh" | "en" | "es" | "fr" | "de" | "ja" | "ko" | "pt";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
};

const zhPosts: BlogPost[] = [
  {
    slug: "compress-large-audio-for-transcription",
    title: "如何把大音频压缩成适合转写的 MP3",
    excerpt: "面向长会议和课程，讲解压缩、采样率和转写准确率之间的取舍。",
    date: "2026-03-05",
    category: "音频处理",
    readTime: "6 分钟",
    sections: [
      {
        heading: "为什么压缩会影响转写体验",
        body: [
          "企业会议、课堂录音和采访素材经常超过 1GB。直接上传原始视频会增加等待时间，也会放大对象存储、队列和转写服务商的失败概率。",
          "Votxt 推荐先把长素材转成清晰、体积可控的音频文件。对于语音内容，单声道 MP3 或 M4A 通常已经足够，关键是保留人声清晰度和稳定音量。"
        ]
      },
      {
        heading: "推荐参数",
        body: [
          "如果素材主要是会议或课程，建议使用 16kHz 到 24kHz 采样率、单声道、64kbps 到 96kbps 码率。访谈、播客或多说话人素材可以使用 128kbps 保留更多细节。",
          "不要为了追求极小体积把码率压到过低，否则发言人分离、标点和专有名词识别会变差。"
        ]
      },
      {
        heading: "在 Votxt 中的流程",
        body: [
          "上传文件后，任务会进入队列，并根据是否开启发言人标签在 Groq、Deepgram、AssemblyAI 之间自动降级。",
          "转写完成后可以继续生成摘要、问答、翻译和公开分享链接，适合把长录音转成团队知识资产。"
        ]
      }
    ]
  },
  {
    slug: "public-video-to-text-workflow",
    title: "公开视频转文字的完整工作流",
    excerpt: "从 YouTube 链接、队列处理、发言人识别到字幕导出。",
    date: "2026-02-18",
    category: "视频转写",
    readTime: "7 分钟",
    sections: [
      {
        heading: "从链接开始，而不是从下载开始",
        body: [
          "很多团队需要把公开视频、课程或发布会内容整理成文字。手动下载再上传会拖慢流程，也容易引入格式问题。",
          "Votxt 支持粘贴公开视频链接创建任务，Worker 会解析可处理的音频流，再进入统一转写队列。"
        ]
      },
      {
        heading: "发言人标签和字幕",
        body: [
          "公开视频常见问题是多人讲话、背景音乐和片段切换。开启发言人标签后，系统优先使用 Deepgram 和 AssemblyAI，失败时再回退到 Groq。",
          "完成后可以导出 SRT、VTT、TXT、JSON 和 PDF。字幕文件适合视频剪辑，JSON 适合自动化系统继续处理。"
        ]
      },
      {
        heading: "企业自动化",
        body: [
          "团队可以使用 API Key 创建链接任务，并通过 Webhook 在任务完成时同步到内容系统。",
          "公开分享链接适合给客户、老师或外部协作者审阅，分享页只读展示，不开放编辑权限。"
        ]
      }
    ]
  },
  {
    slug: "interview-recording-summary-qa",
    title: "采访录音如何整理成摘要和问答",
    excerpt: "适合研究、媒体和客户访谈的 AI 后处理流程。",
    date: "2026-01-30",
    category: "AI 洞察",
    readTime: "6 分钟",
    sections: [
      {
        heading: "先保留原始语境",
        body: [
          "采访类内容不能只看最终摘要。研究、媒体和客户成功团队通常还需要可追溯的原文、时间戳和发言人段落。",
          "Votxt 会保存完整转写、分段和用户编辑稿，便于后续校对和引用。"
        ]
      },
      {
        heading: "摘要、问答和思维导图",
        body: [
          "转写完成后，可以生成概览、要点、关键问答和思维导图。AI 模型会按 deepseek-v4、Gemini、Groq 的顺序降级，全部失败时使用本地规则兜底。",
          "问答适合沉淀客户需求，思维导图适合整理主题结构，翻译适合跨语言团队共享。"
        ]
      },
      {
        heading: "团队协作",
        body: [
          "企业控制台提供成员、API Key、Webhook 和审计日志。团队可以把采访任务放在统一空间，并追踪谁创建了任务、分享链接或自动化回调。",
          "这让采访整理从个人手工笔记变成可审计、可交付、可复用的内容流程。"
        ]
      }
    ]
  },
  {
    slug: "choose-srt-vtt-txt-pdf",
    title: "SRT、VTT、TXT、PDF 应该怎么选",
    excerpt: "不同导出格式在字幕、归档和自动化场景中的最佳实践。",
    date: "2026-01-12",
    category: "导出格式",
    readTime: "5 分钟",
    sections: [
      {
        heading: "字幕优先选择 SRT 或 VTT",
        body: [
          "SRT 是剪辑软件和视频平台常用格式，结构简单，适合交付字幕文件。VTT 更适合网页播放器，也支持更丰富的 Web 场景。",
          "如果任务包含发言人标签，导出时会尽量保留说话人信息，方便后期校对。"
        ]
      },
      {
        heading: "归档选择 TXT 或 PDF",
        body: [
          "TXT 适合继续编辑、搜索和导入知识库。PDF 更适合客户交付、会议归档和不可编辑阅读。",
          "Votxt 导出会优先使用用户保存过的编辑稿，确保交付内容是校对后的版本。"
        ]
      },
      {
        heading: "自动化选择 JSON",
        body: [
          "JSON 包含全文、分段和词级信息，适合后续接入数据管道、内部搜索和分析系统。",
          "企业 API Key 和 Webhook 可以把 JSON 导出与外部系统串起来，减少人工复制粘贴。"
        ]
      }
    ]
  }
];

const enPosts: BlogPost[] = [
  {
    slug: "compress-large-audio-for-transcription",
    title: "How to compress large audio for transcription",
    excerpt: "A practical look at compression, sample rate, and accuracy tradeoffs for meetings and courses.",
    date: "2026-03-05",
    category: "Audio",
    readTime: "6 min",
    sections: [
      {
        heading: "Why compression matters",
        body: [
          "Long meetings, lectures, and interviews often produce files that are too large for a smooth upload workflow.",
          "For speech, a clean mono MP3 or M4A usually preserves enough detail while keeping queue time and storage cost under control."
        ]
      },
      {
        heading: "Recommended settings",
        body: [
          "For meetings and courses, 16kHz to 24kHz mono audio at 64kbps to 96kbps is often enough. Interviews and podcasts can use 128kbps for more detail.",
          "Avoid extremely low bitrates because speaker labeling, punctuation, and proper nouns become harder to recover."
        ]
      },
      {
        heading: "Where Votxt fits",
        body: [
          "After upload, Votxt queues the task and falls back across Groq, Deepgram, and AssemblyAI depending on speaker-label requirements.",
          "Once complete, teams can generate summaries, Q&A, translations, exports, and share links."
        ]
      }
    ]
  },
  {
    slug: "public-video-to-text-workflow",
    title: "The complete workflow for public video to text",
    excerpt: "From YouTube links and queue processing to speaker labels and subtitle export.",
    date: "2026-02-18",
    category: "Video",
    readTime: "7 min",
    sections: [
      {
        heading: "Start from a link",
        body: [
          "Teams often need to turn public videos, courses, or webinars into searchable notes. Downloading first slows the process down.",
          "Votxt accepts public video links, resolves processable audio in the worker, and sends the task through the same transcription queue."
        ]
      },
      {
        heading: "Speaker labels and subtitles",
        body: [
          "When speaker labels are enabled, Votxt prioritizes Deepgram and AssemblyAI, then falls back to Groq.",
          "Finished tasks can be exported as SRT, VTT, TXT, JSON, and PDF."
        ]
      },
      {
        heading: "Automation",
        body: [
          "Teams can create link tasks with API keys and receive webhook events when tasks complete.",
          "Read-only share links are useful for clients, instructors, and external reviewers."
        ]
      }
    ]
  },
  {
    slug: "interview-recording-summary-qa",
    title: "Turning interview recordings into summaries and Q&A",
    excerpt: "A workflow for research, media, customer interviews, and reusable notes.",
    date: "2026-01-30",
    category: "AI insights",
    readTime: "6 min",
    sections: [
      {
        heading: "Keep the original context",
        body: [
          "Interview workflows need more than a short summary. Teams need the source transcript, timestamps, and speaker turns.",
          "Votxt keeps the transcript, segments, and edited text so reviewers can trace insights back to the original conversation."
        ]
      },
      {
        heading: "Summary, Q&A, and mind maps",
        body: [
          "After transcription, Votxt can generate summaries, key questions, mind maps, and translations.",
          "AI generation falls back from deepseek-v4 to Gemini, Groq, and a local rule-based fallback."
        ]
      },
      {
        heading: "Team workflow",
        body: [
          "The enterprise console adds members, API keys, webhooks, and audit logs.",
          "Interview processing becomes a repeatable workflow instead of a set of private notes."
        ]
      }
    ]
  },
  {
    slug: "choose-srt-vtt-txt-pdf",
    title: "How to choose between SRT, VTT, TXT, and PDF",
    excerpt: "Best practices for captions, archives, automation, and review workflows.",
    date: "2026-01-12",
    category: "Exports",
    readTime: "5 min",
    sections: [
      {
        heading: "Use SRT or VTT for captions",
        body: [
          "SRT works well with editing tools and video platforms. VTT is a better fit for web players.",
          "When speaker labels exist, exports preserve useful speaker context for review."
        ]
      },
      {
        heading: "Use TXT or PDF for archives",
        body: [
          "TXT is easy to edit, search, and import into a knowledge base. PDF is better for client delivery and fixed archives.",
          "Votxt exports the edited transcript first when one exists."
        ]
      },
      {
        heading: "Use JSON for automation",
        body: [
          "JSON includes text, segments, and word-level details for search, analytics, and downstream systems.",
          "API keys and webhooks make it easier to connect exports to internal workflows."
        ]
      }
    ]
  }
];

const localizedPosts: Record<Exclude<BlogLocale, "zh" | "en">, BlogPost[]> = {
  es: [
    {
      slug: "compress-large-audio-for-transcription",
      title: "Cómo comprimir audio grande para transcripción",
      excerpt: "Compresión, frecuencia de muestreo y precisión para reuniones y cursos largos.",
      date: "2026-03-05",
      category: "Audio",
      readTime: "6 min",
      sections: [
        {heading: "Por qué importa la compresión", body: ["Los archivos largos aumentan el tiempo de subida y la probabilidad de fallos en cola o proveedores.", "Para voz, un MP3 o M4A mono limpio suele conservar suficiente detalle y reduce coste de almacenamiento."]},
        {heading: "Ajustes recomendados", body: ["Para reuniones y clases usa 16kHz a 24kHz, mono, 64kbps a 96kbps. Entrevistas y podcasts pueden usar 128kbps.", "Evita bitrates demasiado bajos porque empeoran hablantes, puntuación y nombres propios."]},
        {heading: "Flujo en Votxt", body: ["Después de subir, Votxt encola la tarea y cambia entre Groq, Deepgram y AssemblyAI según hablantes.", "Al terminar puedes generar resumen, Q&A, traducción, exportaciones y enlaces compartidos."]}
      ]
    },
    {
      slug: "public-video-to-text-workflow",
      title: "Flujo completo para convertir video público en texto",
      excerpt: "De enlaces de YouTube a cola, hablantes y exportación de subtítulos.",
      date: "2026-02-18",
      category: "Video",
      readTime: "7 min",
      sections: [
        {heading: "Empieza con un enlace", body: ["Los equipos convierten cursos, webinars y videos públicos en notas buscables.", "Votxt acepta enlaces públicos, resuelve audio procesable en el worker y usa la misma cola de transcripción."]},
        {heading: "Hablantes y subtítulos", body: ["Con hablantes activados, Votxt prioriza Deepgram y AssemblyAI y después Groq.", "Las tareas terminadas exportan SRT, VTT, TXT, JSON y PDF."]},
        {heading: "Automatización empresarial", body: ["Los equipos pueden crear tareas con API Key y recibir Webhooks al finalizar.", "Los enlaces de solo lectura sirven para clientes, docentes y revisores externos."]}
      ]
    },
    {
      slug: "interview-recording-summary-qa",
      title: "Convertir entrevistas en resumen y Q&A",
      excerpt: "Un flujo para investigación, medios, clientes y notas reutilizables.",
      date: "2026-01-30",
      category: "IA",
      readTime: "6 min",
      sections: [
        {heading: "Conserva el contexto", body: ["Las entrevistas necesitan transcripción fuente, tiempos y turnos de hablante, no solo un resumen.", "Votxt guarda texto, segmentos y edición para rastrear cada insight al audio original."]},
        {heading: "Resumen, Q&A y mapas", body: ["Tras transcribir, genera resumen, preguntas, mapa mental y traducción.", "La IA baja de deepseek-v4 a Gemini, Groq y una regla local si los proveedores fallan."]},
        {heading: "Trabajo en equipo", body: ["La consola empresarial añade miembros, API Keys, Webhooks y auditoría.", "El proceso deja de ser notas privadas y pasa a ser un flujo repetible."]}
      ]
    },
    {
      slug: "choose-srt-vtt-txt-pdf",
      title: "Cómo elegir entre SRT, VTT, TXT y PDF",
      excerpt: "Buenas prácticas para subtítulos, archivo, automatización y revisión.",
      date: "2026-01-12",
      category: "Exportación",
      readTime: "5 min",
      sections: [
        {heading: "SRT o VTT para subtítulos", body: ["SRT funciona bien con editores y plataformas. VTT encaja mejor en reproductores web.", "Si hay hablantes, la exportación conserva contexto útil para revisión."]},
        {heading: "TXT o PDF para archivo", body: ["TXT es fácil de editar y buscar. PDF es mejor para entrega a clientes y archivo fijo.", "Votxt exporta primero la versión editada cuando existe."]},
        {heading: "JSON para automatización", body: ["JSON incluye texto, segmentos y palabras para búsqueda, analítica y sistemas internos.", "API Keys y Webhooks conectan las exportaciones al flujo interno."]}
      ]
    }
  ],
  fr: [
    {
      slug: "compress-large-audio-for-transcription",
      title: "Compresser un gros fichier audio pour la transcription",
      excerpt: "Compression, fréquence d'échantillonnage et précision pour réunions et cours.",
      date: "2026-03-05",
      category: "Audio",
      readTime: "6 min",
      sections: [
        {heading: "Pourquoi compresser", body: ["Les longs fichiers augmentent l'attente, le stockage et les risques d'échec côté file ou fournisseur.", "Pour la parole, un MP3 ou M4A mono propre suffit souvent."]},
        {heading: "Réglages conseillés", body: ["Pour réunions et cours, utilisez 16kHz à 24kHz, mono, 64kbps à 96kbps.", "Un bitrate trop bas dégrade les locuteurs, la ponctuation et les noms propres."]},
        {heading: "Dans Votxt", body: ["Après import, Votxt met la tâche en file et bascule entre Groq, Deepgram et AssemblyAI.", "Une fois terminé, vous générez résumé, Q&R, traduction, exports et lien partagé."]}
      ]
    },
    {
      slug: "public-video-to-text-workflow",
      title: "Transformer une vidéo publique en texte",
      excerpt: "De YouTube à la file, aux locuteurs et aux sous-titres.",
      date: "2026-02-18",
      category: "Vidéo",
      readTime: "7 min",
      sections: [
        {heading: "Partir du lien", body: ["Les équipes convertissent cours, webinars et vidéos publiques en notes consultables.", "Votxt accepte les liens publics, résout l'audio dans le worker et utilise la même file."]},
        {heading: "Locuteurs et sous-titres", body: ["Avec les locuteurs, Votxt privilégie Deepgram puis AssemblyAI, puis Groq.", "Les tâches terminées exportent SRT, VTT, TXT, JSON et PDF."]},
        {heading: "Automatisation", body: ["Les équipes créent des tâches via API Key et reçoivent des Webhooks.", "Les liens en lecture seule conviennent aux clients et relecteurs externes."]}
      ]
    },
    {
      slug: "interview-recording-summary-qa",
      title: "Transformer des interviews en résumé et Q&R",
      excerpt: "Un flux pour recherche, médias, clients et notes réutilisables.",
      date: "2026-01-30",
      category: "IA",
      readTime: "6 min",
      sections: [
        {heading: "Garder le contexte", body: ["Une interview exige transcript source, horodatage et tours de parole.", "Votxt garde texte, segments et version éditée pour remonter à l'audio original."]},
        {heading: "Résumé, Q&R et carte mentale", body: ["Après transcription, générez résumé, questions, carte mentale et traduction.", "L'IA bascule de deepseek-v4 à Gemini, Groq puis à une règle locale."]},
        {heading: "Travail d'équipe", body: ["La console ajoute membres, API Keys, Webhooks et audit.", "Le traitement devient un flux répétable plutôt que des notes privées."]}
      ]
    },
    {
      slug: "choose-srt-vtt-txt-pdf",
      title: "Choisir entre SRT, VTT, TXT et PDF",
      excerpt: "Bonnes pratiques pour sous-titres, archives, automatisation et relecture.",
      date: "2026-01-12",
      category: "Exports",
      readTime: "5 min",
      sections: [
        {heading: "SRT ou VTT pour les sous-titres", body: ["SRT convient aux logiciels de montage. VTT convient mieux au web.", "Avec locuteurs, l'export conserve le contexte utile."]},
        {heading: "TXT ou PDF pour l'archive", body: ["TXT est modifiable et cherchable. PDF convient à la livraison client.", "Votxt exporte d'abord la version éditée si elle existe."]},
        {heading: "JSON pour automatiser", body: ["JSON contient texte, segments et mots pour recherche et analyse.", "API Keys et Webhooks relient les exports aux systèmes internes."]}
      ]
    }
  ],
  de: [
    {
      slug: "compress-large-audio-for-transcription",
      title: "Große Audiodateien für Transkription komprimieren",
      excerpt: "Kompression, Abtastrate und Genauigkeit für Meetings und Kurse.",
      date: "2026-03-05",
      category: "Audio",
      readTime: "6 Min.",
      sections: [
        {heading: "Warum Kompression zählt", body: ["Lange Dateien erhöhen Uploadzeit, Speicherkosten und Fehlerrisiko.", "Für Sprache reicht meist ein sauberes Mono-MP3 oder M4A."]},
        {heading: "Empfohlene Einstellungen", body: ["Für Meetings und Kurse: 16kHz bis 24kHz, mono, 64kbps bis 96kbps.", "Zu niedrige Bitraten verschlechtern Sprecher, Zeichensetzung und Eigennamen."]},
        {heading: "In Votxt", body: ["Nach dem Upload nutzt Votxt die Queue und wechselt zwischen Groq, Deepgram und AssemblyAI.", "Danach entstehen Zusammenfassung, Q&A, Übersetzung, Exporte und Share Links."]}
      ]
    },
    {
      slug: "public-video-to-text-workflow",
      title: "Öffentliche Videos in Text umwandeln",
      excerpt: "Von YouTube-Links zu Queue, Sprecherlabels und Untertiteln.",
      date: "2026-02-18",
      category: "Video",
      readTime: "7 Min.",
      sections: [
        {heading: "Mit dem Link starten", body: ["Teams machen Kurse, Webinare und öffentliche Videos durchsuchbar.", "Votxt akzeptiert öffentliche Links, löst Audio im Worker auf und nutzt dieselbe Queue."]},
        {heading: "Sprecher und Untertitel", body: ["Mit Sprecherlabels nutzt Votxt Deepgram, AssemblyAI und dann Groq.", "Fertige Aufgaben exportieren SRT, VTT, TXT, JSON und PDF."]},
        {heading: "Automatisierung", body: ["Teams erstellen Aufgaben per API Key und erhalten Webhooks.", "Nur-Lese-Links eignen sich für Kunden und externe Reviewer."]}
      ]
    },
    {
      slug: "interview-recording-summary-qa",
      title: "Interviews in Zusammenfassung und Q&A verwandeln",
      excerpt: "Ein Workflow für Forschung, Medien, Kundeninterviews und Notizen.",
      date: "2026-01-30",
      category: "KI",
      readTime: "6 Min.",
      sections: [
        {heading: "Kontext behalten", body: ["Interviews brauchen Quelle, Zeitstempel und Sprecherwechsel.", "Votxt speichert Transkript, Segmente und bearbeiteten Text."]},
        {heading: "Zusammenfassung, Q&A und Mindmap", body: ["Nach der Transkription entstehen Zusammenfassung, Fragen, Mindmap und Übersetzung.", "KI fällt von deepseek-v4 auf Gemini, Groq und lokale Regeln zurück."]},
        {heading: "Teamarbeit", body: ["Die Konsole bietet Mitglieder, API Keys, Webhooks und Audit Logs.", "So wird Interviewarbeit wiederholbar und nachvollziehbar."]}
      ]
    },
    {
      slug: "choose-srt-vtt-txt-pdf",
      title: "SRT, VTT, TXT oder PDF auswählen",
      excerpt: "Best Practices für Untertitel, Archiv, Automatisierung und Review.",
      date: "2026-01-12",
      category: "Export",
      readTime: "5 Min.",
      sections: [
        {heading: "SRT oder VTT für Untertitel", body: ["SRT passt zu Schnittprogrammen. VTT passt besser zu Webplayern.", "Sprecherkontext bleibt beim Export erhalten."]},
        {heading: "TXT oder PDF für Archive", body: ["TXT ist editierbar und durchsuchbar. PDF ist gut für Kundenlieferung.", "Votxt exportiert zuerst die bearbeitete Version."]},
        {heading: "JSON für Automatisierung", body: ["JSON enthält Text, Segmente und Wörter für Suche und Analyse.", "API Keys und Webhooks verbinden Exporte mit internen Workflows."]}
      ]
    }
  ],
  ja: [
    {
      slug: "compress-large-audio-for-transcription",
      title: "大きな音声を文字起こし向けに圧縮する方法",
      excerpt: "会議や講義向けに圧縮、サンプルレート、精度のバランスを整理します。",
      date: "2026-03-05",
      category: "音声",
      readTime: "6 分",
      sections: [
        {heading: "圧縮が重要な理由", body: ["長いファイルはアップロード、保存、キュー、プロバイダ失敗のリスクを増やします。", "音声中心なら、きれいなモノラル MP3 または M4A で十分な場合が多いです。"]},
        {heading: "推奨設定", body: ["会議や講義は 16kHz から 24kHz、モノラル、64kbps から 96kbps が目安です。", "低すぎるビットレートは話者分離、句読点、固有名詞に悪影響があります。"]},
        {heading: "Votxt の流れ", body: ["アップロード後、Votxt はキューに投入し Groq、Deepgram、AssemblyAI を自動切替します。", "完了後は要約、Q&A、翻訳、書き出し、共有リンクを作成できます。"]}
      ]
    },
    {
      slug: "public-video-to-text-workflow",
      title: "公開動画をテキスト化するワークフロー",
      excerpt: "YouTubeリンクからキュー、話者ラベル、字幕書き出しまで。",
      date: "2026-02-18",
      category: "動画",
      readTime: "7 分",
      sections: [
        {heading: "リンクから始める", body: ["チームは講義、ウェビナー、公開動画を検索可能なノートに変換します。", "Votxt は公開リンクを受け取り、Worker で音声を解決して同じキューに流します。"]},
        {heading: "話者ラベルと字幕", body: ["話者ラベル有効時は Deepgram、AssemblyAI、Groq の順に使います。", "完了後は SRT、VTT、TXT、JSON、PDF を書き出せます。"]},
        {heading: "自動化", body: ["API Key でタスク作成し、完了時に Webhook を受信できます。", "読み取り専用リンクは顧客や外部レビューに便利です。"]}
      ]
    },
    {
      slug: "interview-recording-summary-qa",
      title: "インタビュー録音を要約とQ&Aに変える",
      excerpt: "調査、メディア、顧客インタビュー、再利用ノート向けの流れ。",
      date: "2026-01-30",
      category: "AI",
      readTime: "6 分",
      sections: [
        {heading: "元の文脈を残す", body: ["インタビューには要約だけでなく、原文、時間、話者ターンが必要です。", "Votxt は文字起こし、セグメント、編集稿を保存します。"]},
        {heading: "要約、Q&A、マインドマップ", body: ["文字起こし後、要約、質問、マインドマップ、翻訳を生成できます。", "AI は deepseek-v4、Gemini、Groq、ローカル規則の順にフォールバックします。"]},
        {heading: "チーム作業", body: ["企業コンソールにはメンバー、API Key、Webhook、監査ログがあります。", "インタビュー整理を再現可能なワークフローにできます。"]}
      ]
    },
    {
      slug: "choose-srt-vtt-txt-pdf",
      title: "SRT、VTT、TXT、PDF の選び方",
      excerpt: "字幕、保管、自動化、レビュー向けのベストプラクティス。",
      date: "2026-01-12",
      category: "書き出し",
      readTime: "5 分",
      sections: [
        {heading: "字幕は SRT または VTT", body: ["SRT は編集ツールや動画平台に向きます。VTT はWebプレイヤー向きです。", "話者ラベルがある場合はレビュー用の文脈を保持します。"]},
        {heading: "保管は TXT または PDF", body: ["TXT は編集や検索に便利です。PDF は顧客納品に向きます。", "Votxt は編集稿があればそれを優先して書き出します。"]},
        {heading: "自動化は JSON", body: ["JSON は全文、セグメント、単語情報を含みます。", "API Key と Webhook で内部ワークフローにつなげられます。"]}
      ]
    }
  ],
  ko: [
    {
      slug: "compress-large-audio-for-transcription",
      title: "큰 오디오를 전사용으로 압축하는 방법",
      excerpt: "회의와 강의에 맞춘 압축, 샘플레이트, 정확도 균형.",
      date: "2026-03-05",
      category: "오디오",
      readTime: "6분",
      sections: [
        {heading: "압축이 중요한 이유", body: ["긴 파일은 업로드 시간, 저장 비용, 큐와 제공자 실패 가능성을 높입니다.", "음성은 깨끗한 모노 MP3 또는 M4A만으로 충분한 경우가 많습니다."]},
        {heading: "권장 설정", body: ["회의와 강의는 16kHz~24kHz, 모노, 64kbps~96kbps를 권장합니다.", "너무 낮은 비트레이트는 화자 분리, 문장부호, 고유명사 인식에 불리합니다."]},
        {heading: "Votxt 흐름", body: ["업로드 후 Votxt는 작업을 큐에 넣고 Groq, Deepgram, AssemblyAI를 자동 전환합니다.", "완료 후 요약, Q&A, 번역, 내보내기, 공유 링크를 만들 수 있습니다."]}
      ]
    },
    {
      slug: "public-video-to-text-workflow",
      title: "공개 영상을 텍스트로 바꾸는 전체 흐름",
      excerpt: "YouTube 링크부터 큐, 화자 라벨, 자막 내보내기까지.",
      date: "2026-02-18",
      category: "비디오",
      readTime: "7분",
      sections: [
        {heading: "링크에서 시작", body: ["팀은 강의, 웨비나, 공개 영상을 검색 가능한 노트로 바꿉니다.", "Votxt는 공개 링크를 받고 Worker에서 오디오를 해석해 같은 큐로 보냅니다."]},
        {heading: "화자와 자막", body: ["화자 라벨이 켜지면 Deepgram, AssemblyAI, Groq 순으로 사용합니다.", "완료 작업은 SRT, VTT, TXT, JSON, PDF로 내보낼 수 있습니다."]},
        {heading: "자동화", body: ["API Key로 작업을 만들고 완료 시 Webhook을 받을 수 있습니다.", "읽기 전용 공유 링크는 외부 검토에 적합합니다."]}
      ]
    },
    {
      slug: "interview-recording-summary-qa",
      title: "인터뷰 녹음을 요약과 Q&A로 정리하기",
      excerpt: "연구, 미디어, 고객 인터뷰, 재사용 노트를 위한 워크플로.",
      date: "2026-01-30",
      category: "AI",
      readTime: "6분",
      sections: [
        {heading: "원문 맥락 보존", body: ["인터뷰에는 요약뿐 아니라 원문, 시간, 화자 전환이 필요합니다.", "Votxt는 전사, 세그먼트, 편집본을 보관합니다."]},
        {heading: "요약, Q&A, 마인드맵", body: ["전사 후 요약, 질문, 마인드맵, 번역을 생성합니다.", "AI는 deepseek-v4, Gemini, Groq, 로컬 규칙 순으로 폴백합니다."]},
        {heading: "팀 워크플로", body: ["기업 콘솔은 멤버, API Key, Webhook, 감사 로그를 제공합니다.", "인터뷰 처리를 반복 가능한 흐름으로 바꿉니다."]}
      ]
    },
    {
      slug: "choose-srt-vtt-txt-pdf",
      title: "SRT, VTT, TXT, PDF 선택 방법",
      excerpt: "자막, 보관, 자동화, 리뷰를 위한 모범 사례.",
      date: "2026-01-12",
      category: "내보내기",
      readTime: "5분",
      sections: [
        {heading: "자막은 SRT 또는 VTT", body: ["SRT는 편집 도구와 플랫폼에 좋고 VTT는 웹 플레이어에 좋습니다.", "화자 라벨이 있으면 리뷰에 필요한 맥락을 유지합니다."]},
        {heading: "보관은 TXT 또는 PDF", body: ["TXT는 편집과 검색에 좋고 PDF는 고객 전달에 적합합니다.", "Votxt는 편집본이 있으면 먼저 내보냅니다."]},
        {heading: "자동화는 JSON", body: ["JSON은 텍스트, 세그먼트, 단어 정보를 포함합니다.", "API Key와 Webhook으로 내부 시스템에 연결할 수 있습니다."]}
      ]
    }
  ],
  pt: [
    {
      slug: "compress-large-audio-for-transcription",
      title: "Como comprimir áudio grande para transcrição",
      excerpt: "Compressão, taxa de amostragem e precisão para reuniões e cursos.",
      date: "2026-03-05",
      category: "Áudio",
      readTime: "6 min",
      sections: [
        {heading: "Por que comprimir", body: ["Arquivos longos aumentam upload, armazenamento e risco de falha em fila ou provedor.", "Para fala, um MP3 ou M4A mono limpo costuma preservar detalhes suficientes."]},
        {heading: "Configurações recomendadas", body: ["Para reuniões e aulas, use 16kHz a 24kHz, mono, 64kbps a 96kbps.", "Bitrates muito baixos prejudicam falantes, pontuação e nomes próprios."]},
        {heading: "Fluxo no Votxt", body: ["Depois do upload, Votxt enfileira a tarefa e alterna entre Groq, Deepgram e AssemblyAI.", "Ao concluir, gere resumo, Q&A, tradução, exportações e links compartilhados."]}
      ]
    },
    {
      slug: "public-video-to-text-workflow",
      title: "Fluxo completo para transformar vídeo público em texto",
      excerpt: "De links do YouTube à fila, falantes e exportação de legendas.",
      date: "2026-02-18",
      category: "Vídeo",
      readTime: "7 min",
      sections: [
        {heading: "Comece pelo link", body: ["Equipes convertem cursos, webinars e vídeos públicos em notas pesquisáveis.", "Votxt aceita links públicos, resolve áudio no Worker e usa a mesma fila."]},
        {heading: "Falantes e legendas", body: ["Com falantes ativados, Votxt prioriza Deepgram, AssemblyAI e depois Groq.", "Tarefas concluídas exportam SRT, VTT, TXT, JSON e PDF."]},
        {heading: "Automação", body: ["Equipes criam tarefas com API Key e recebem Webhooks quando terminam.", "Links somente leitura servem para clientes e revisores externos."]}
      ]
    },
    {
      slug: "interview-recording-summary-qa",
      title: "Transformar entrevistas em resumo e Q&A",
      excerpt: "Um fluxo para pesquisa, mídia, clientes e notas reutilizáveis.",
      date: "2026-01-30",
      category: "IA",
      readTime: "6 min",
      sections: [
        {heading: "Preserve o contexto", body: ["Entrevistas precisam de transcrição fonte, horários e turnos de fala.", "Votxt guarda texto, segmentos e versão editada para rastrear insights ao original."]},
        {heading: "Resumo, Q&A e mapa mental", body: ["Após transcrever, gere resumo, perguntas, mapa mental e tradução.", "A IA cai de deepseek-v4 para Gemini, Groq e regra local."]},
        {heading: "Fluxo de equipe", body: ["O console empresarial adiciona membros, API Keys, Webhooks e auditoria.", "O processamento vira fluxo repetível em vez de notas privadas."]}
      ]
    },
    {
      slug: "choose-srt-vtt-txt-pdf",
      title: "Como escolher entre SRT, VTT, TXT e PDF",
      excerpt: "Boas práticas para legendas, arquivo, automação e revisão.",
      date: "2026-01-12",
      category: "Exportação",
      readTime: "5 min",
      sections: [
        {heading: "SRT ou VTT para legendas", body: ["SRT funciona com editores e plataformas. VTT combina melhor com players web.", "Com falantes, a exportação mantém contexto útil."]},
        {heading: "TXT ou PDF para arquivo", body: ["TXT é editável e pesquisável. PDF é melhor para entrega a clientes.", "Votxt exporta primeiro a versão editada quando existe."]},
        {heading: "JSON para automação", body: ["JSON inclui texto, segmentos e palavras para busca e análise.", "API Keys e Webhooks conectam exportações aos fluxos internos."]}
      ]
    }
  ]
};

export function getBlogPosts(locale: string): BlogPost[] {
  if (locale === "zh") return zhPosts;
  if (locale === "en") return enPosts;
  return localizedPosts[locale as Exclude<BlogLocale, "zh" | "en">] ?? enPosts;
}

export function getBlogPost(locale: string, slug: string) {
  return getBlogPosts(locale).find((post) => post.slug === slug) ?? null;
}

export function getAllBlogSlugs() {
  return zhPosts.map((post) => post.slug);
}
