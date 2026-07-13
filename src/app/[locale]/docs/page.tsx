import type {Metadata} from "next";
import {SiteFooter, SiteHeader} from "@/components/site-shell";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import {isLocale, type Locale} from "@/lib/locales";

export function generateMetadata({params}: {params: {locale: string}}): Metadata {
  const locale = isLocale(params.locale) ? params.locale : "en";
  const docs = getDocsText(locale);

  return {
    title: docs.metaTitle,
    description: docs.metaDescription
  };
}

const toc = [
  ["Votxt OpenAPI Documentation (Beta)", "votxt-openapi-documentation-beta"],
  ["Overview", "overview"],
  ["Base URL", "base-url"],
  ["Authentication", "authentication"],
  ["API Key Authentication", "api-key-authentication"],
  ["Getting Your API Key", "getting-your-api-key"],
  ["File Upload Workflow", "file-upload-workflow"],
  ["Option 1: Upload Files Directly", "option-1-upload-files-directly"],
  ["Option 2: External File URLs", "option-2-external-file-urls"],
  ["Endpoints", "endpoints"],
  ["1. Get File Upload URLs", "1-get-file-upload-urls"],
  ["2. Create Transcription", "2-create-transcription"],
  ["3. List Transcriptions", "3-list-transcriptions"],
  ["4. Get Transcription Details", "4-get-transcription-details"],
  ["5. Get Transcription Status", "5-get-transcription-status"],
  ["6. Create YouTube Transcription", "6-create-youtube-transcription"],
  ["Status Values", "status-values"],
  ["Webhook Notifications", "webhook-notifications"],
  ["Webhook Events", "webhook-events"],
  ["Transcription Completed", "transcription-completed"],
  ["Transcription Failed", "transcription-failed"],
  ["Webhook Requirements", "webhook-requirements"],
  ["Error Handling", "error-handling"],
  ["Understanding Different Types of Errors", "understanding-different-types-of-errors"],
  ["1. API Call Errors", "1-api-call-errors"],
  ["2. Async Task Failures", "2-async-task-failures"],
  ["Client-Side Error Handling", "client-side-error-handling"],
  ["JavaScript Example", "javascript-example"],
  ["Python Example", "python-example"],
  ["Error Response Format", "error-response-format"],
  ["Common Error Codes", "common-error-codes"],
  ["Rate Limits", "rate-limits"],
  ["Supported File Formats", "supported-file-formats"],
  ["Language Support", "language-support"],
  ["Integration Examples", "integration-examples"],
  ["n8n Workflow", "n8n-workflow"],
  ["Python Example", "python-example"],
  ["Create transcription", "create-transcription"],
  ["Check status", "check-status"],
  ["cURL Examples", "curl-examples"],
  ["1. Get upload URLs", "1-get-upload-urls"],
  ["2. Upload file using the returned upload_url", "2-upload-file-using-the-returned-upload-url"],
  ["3. Create transcription using file_key", "3-create-transcription-using-file-key"],
  ["Alternative: Create transcription from external URL", "alternative-create-transcription-from-external-url"],
  ["Get transcription results", "get-transcription-results"],
  ["Best Practices", "best-practices"],
  ["Support", "support"]
] as const;

const audioFormats = ["mp3", "mpeg", "mpga", "m4a", "wav", "aac", "ogg", "opus", "flac"];
const videoFormats = ["mp4", "webm", "mov"];
const docsExportFormats = ["txt", "srt", "vtt", "json", "md", "csv", "docx", "pdf"];
const languageRows = [
  ["Afrikaans", "af", "Gujarati (ગુજરાતી)", "gu", "Polish (Polski)", "pl"],
  ["Arabic (العربية)", "ar", "Hebrew (עברית)", "he", "Portuguese (Português)", "pt"],
  ["Azerbaijani (Azərbaycan)", "az", "Hindi (हिन्दी)", "hi", "Romanian (Română)", "ro"],
  ["Belarusian (Беларуская)", "be", "Croatian (Hrvatski)", "hr", "Russian (Русский)", "ru"],
  ["Bulgarian (Български)", "bg", "Haitian Creole (Kreyòl ayisyen)", "ht", "Slovak (Slovenčina)", "sk"],
  ["Bengali (বাংলা)", "bn", "Hungarian (Magyar)", "hu", "Slovenian (Slovenščina)", "sl"],
  ["Bosnian (Bosanski)", "bs", "Indonesian (Bahasa Indonesia)", "id", "Albanian (Shqip)", "sq"],
  ["Catalan (Català)", "ca", "Italian (Italiano)", "it", "Serbian (Српски)", "sr"],
  ["Czech (Čeština)", "cs", "Japanese (日本語)", "ja", "Swedish (Svenska)", "sv"],
  ["Welsh (Cymraeg)", "cy", "Kazakh (Қазақ)", "kk", "Swahili (Kiswahili)", "sw"],
  ["Danish (Dansk)", "da", "Kannada (ಕನ್ನಡ)", "kn", "Tamil (தமிழ்)", "ta"],
  ["German (Deutsch)", "de", "Korean (한국어)", "ko", "Telugu (తెలుగు)", "te"],
  ["Greek (Ελληνικά)", "el", "Lithuanian (Lietuvių)", "lt", "Thai (ไทย)", "th"],
  ["English", "en", "Latvian (Latviešu)", "lv", "Tagalog (Tagalog/Filipino)", "tl"],
  ["Spanish (Español)", "es", "Macedonian (Македонски)", "mk", "Turkish (Türkçe)", "tr"],
  ["Estonian (Eesti)", "et", "Malayalam (മലയാളം)", "ml", "Ukrainian (Українська)", "uk"],
  ["Basque (Euskara)", "eu", "Marathi (मराठी)", "mr", "Urdu (اردو)", "ur"],
  ["Persian (فارسی)", "fa", "Malay (Bahasa Melayu)", "ms", "Vietnamese (Tiếng Việt)", "vi"],
  ["Finnish (Suomi)", "fi", "Dutch (Nederlands)", "nl", "Chinese (Cantonese) (粵語)", "yue"],
  ["French (Français)", "fr", "Norwegian (Norsk)", "no", "Chinese (Simplified) (中文 简体)", "zh"],
  ["Galician (Galego)", "gl", "Punjabi (ਪੰਜਾਬੀ)", "pa", "Chinese (Taiwanese Mandarin) (國語)", "zh_tw"]
] as const;
const commonErrors = [
  ["400", "10001", "Invalid request parameters"],
  ["403", "20003", "Account has been deactivated"],
  ["403", "30006", "Insufficient transcription quota"],
  ["400", "40001", "Invalid YouTube URL"],
  ["403", "40005", "YouTube video extraction error"],
  ["500", "40006", "YouTube video download error"],
  ["403", "41000", "API Access Denied (requires active subscription or LTD plan)"],
  ["401", "41001", "Invalid API Key"],
  ["401", "41002", "API Key Required"],
  ["413", "41003", "File size exceeded (5GB limit)"],
  ["400", "41004", "Invalid file format"],
  ["500", "41005", "Webhook delivery error"],
  ["400", "41006", "File upload URL generation failed"],
  ["400", "41007", "File not found (invalid file_key)"],
  ["400", "41008", "File upload expired or not completed"],
  ["404", "41009", "API key not found"],
  ["409", "41010", "API key limit exceeded (max 5 keys per user)"],
  ["409", "41011", "API key name already exists"],
  ["404", "45001", "Transcription not found"],
  ["403", "45002", "Transcription permission denied"],
  ["429", "-", "Rate limit exceeded (60 requests/minute, 1000 requests/day)"]
] as const;

type DocsText = {
  metaTitle: string;
  metaDescription: string;
  tocTitle: string;
  title: string;
  betaLabel: string;
  betaNotice: string;
  overview: string;
  overviewText: string;
  workflowText: string;
  resultsText: string;
  baseUrl: string;
  authentication: string;
  apiKey: string;
  apiKeyIntro: string;
  settingsStep: string;
  upgradeStep: string;
  createKeyStep: string;
  upload: string;
  uploadIntro: string;
  transcription: string;
  status: string;
  exports: string;
  formats: string;
  languages: string;
  languagesText: string;
  support: string;
  endpoint: string;
  method: string;
  description: string;
  exportAction: string;
  formatColumn: string;
  code: string;
  queued: string;
  preprocessing: string;
  processing: string;
  completed: string;
  failed: string;
};

const docsTextByLocale: Record<Locale, DocsText> = {
  ar: {
    metaTitle: "وثائق Votxt OpenAPI",
    metaDescription: "راجع أساسيات Votxt OpenAPI للرفع والتفريغ والتصدير وحالة المهام.",
    tocTitle: "محتويات API",
    title: "وثائق Votxt OpenAPI",
    betaLabel: "إصدار تجريبي",
    betaNotice: "واجهة Votxt OpenAPI في مرحلة تجريبية. اختبر التكامل في بيئة تطوير قبل الاستخدام الإنتاجي.",
    overview: "نظرة عامة",
    overviewText: "تتيح لك Votxt OpenAPI إضافة تفريغ الصوت والفيديو إلى تطبيقاتك وسير العمل الآلي.",
    workflowText: "ارفع ملفاً أو استخدم رابط ملف خارجي، ثم أنشئ مهمة تفريغ وتابع حالتها.",
    resultsText: "بعد اكتمال المهمة يمكنك تصدير النصوص والترجمات والبيانات المنظمة بعدة صيغ.",
    baseUrl: "عنوان URL الأساسي",
    authentication: "المصادقة",
    apiKey: "مفتاح API",
    apiKeyIntro: "أرسل مفتاح API في ترويسة الطلب. يتطلب الوصول خطة نشطة تدعم API.",
    settingsStep: "افتح الإعدادات في حسابك.",
    upgradeStep: "تأكد من أن خطتك تدعم الوصول إلى API.",
    createKeyStep: "أنشئ مفتاح API واحفظه في مكان آمن.",
    upload: "رفع الملفات",
    uploadIntro: "ادعم الرفع المباشر عبر رابط موقّع أو استخدم رابط ملف خارجي قابل للتنزيل.",
    transcription: "التفريغ",
    status: "الحالة",
    exports: "التصدير",
    formats: "الصيغ",
    languages: "اللغات",
    languagesText: "يدعم Votxt مجموعة واسعة من لغات التفريغ. استخدم رمز اللغة في الطلب.",
    support: "الدعم",
    endpoint: "المسار",
    method: "الطريقة",
    description: "الوصف",
    exportAction: "التصدير",
    formatColumn: "الصيغة",
    code: "الرمز",
    queued: "في قائمة الانتظار",
    preprocessing: "المعالجة المسبقة",
    processing: "قيد المعالجة",
    completed: "مكتمل",
    failed: "فشل"
  },
  de: {
    metaTitle: "Votxt OpenAPI-Dokumentation",
    metaDescription: "Grundlagen der Votxt OpenAPI fur Uploads, Transkription, Exporte und Aufgabenstatus.",
    tocTitle: "API-Inhalt",
    title: "Votxt OpenAPI-Dokumentation",
    betaLabel: "Beta",
    betaNotice: "Die Votxt OpenAPI ist in der Beta-Phase. Teste Integrationen vor dem Produktiveinsatz in einer Entwicklungsumgebung.",
    overview: "Uberblick",
    overviewText: "Mit der Votxt OpenAPI kannst du Audio- und Videotranskription in Apps und Automationen integrieren.",
    workflowText: "Lade eine Datei hoch oder nutze eine externe Datei-URL, erstelle danach eine Transkriptionsaufgabe und prufe den Status.",
    resultsText: "Nach Abschluss kannst du Transkripte, Untertitel und strukturierte Daten in mehreren Formaten exportieren.",
    baseUrl: "Basis-URL",
    authentication: "Authentifizierung",
    apiKey: "API-Schlussel",
    apiKeyIntro: "Sende deinen API-Schlussel im Request-Header. API-Zugriff erfordert einen aktiven API-fahigen Plan.",
    settingsStep: "Offne die Einstellungen deines Kontos.",
    upgradeStep: "Prufe, ob dein Plan API-Zugriff enthalt.",
    createKeyStep: "Erstelle einen API-Schlussel und speichere ihn sicher.",
    upload: "Dateiupload",
    uploadIntro: "Nutze direkten Upload uber signierte URLs oder eine extern erreichbare Datei-URL.",
    transcription: "Transkription",
    status: "Status",
    exports: "Exporte",
    formats: "Formate",
    languages: "Sprachen",
    languagesText: "Votxt unterstutzt viele Transkriptionssprachen. Verwende den Sprachcode in deiner Anfrage.",
    support: "Support",
    endpoint: "Endpunkt",
    method: "Methode",
    description: "Beschreibung",
    exportAction: "Export",
    formatColumn: "Format",
    code: "Code",
    queued: "In Warteschlange",
    preprocessing: "Vorverarbeitung",
    processing: "In Verarbeitung",
    completed: "Abgeschlossen",
    failed: "Fehlgeschlagen"
  },
  en: {
    metaTitle: "Votxt OpenAPI Documentation",
    metaDescription: "Learn the Votxt OpenAPI basics for uploads, transcription, exports, and task status.",
    tocTitle: "API contents",
    title: "Votxt OpenAPI Documentation",
    betaLabel: "Beta",
    betaNotice: "The Votxt OpenAPI is currently in beta. Test integrations in development before production use.",
    overview: "Overview",
    overviewText: "The Votxt OpenAPI lets you integrate audio and video transcription into apps and automation workflows.",
    workflowText: "Upload a file or use an external file URL, then create a transcription task and check its status.",
    resultsText: "After completion, export transcripts, subtitles, and structured data in multiple formats.",
    baseUrl: "Base URL",
    authentication: "Authentication",
    apiKey: "API key",
    apiKeyIntro: "Send your API key in the request header. API access requires an active API-enabled plan.",
    settingsStep: "Open your account settings.",
    upgradeStep: "Confirm that your plan includes API access.",
    createKeyStep: "Create an API key and store it securely.",
    upload: "File upload",
    uploadIntro: "Use direct upload with signed URLs or provide a public external file URL.",
    transcription: "Transcription",
    status: "Status",
    exports: "Exports",
    formats: "Formats",
    languages: "Languages",
    languagesText: "Votxt supports many transcription languages. Pass the language code in your request.",
    support: "Support",
    endpoint: "Endpoint",
    method: "Method",
    description: "Description",
    exportAction: "Export",
    formatColumn: "Format",
    code: "Code",
    queued: "Queued",
    preprocessing: "Preprocessing",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed"
  },
  es: {
    metaTitle: "Documentacion de Votxt OpenAPI",
    metaDescription: "Consulta los conceptos basicos de Votxt OpenAPI para cargas, transcripcion, exportaciones y estado de tareas.",
    tocTitle: "Contenido de API",
    title: "Documentacion de Votxt OpenAPI",
    betaLabel: "Beta",
    betaNotice: "Votxt OpenAPI esta en beta. Prueba la integracion en desarrollo antes de usarla en produccion.",
    overview: "Resumen",
    overviewText: "Votxt OpenAPI permite integrar transcripcion de audio y video en aplicaciones y automatizaciones.",
    workflowText: "Sube un archivo o usa una URL externa, crea una tarea de transcripcion y consulta su estado.",
    resultsText: "Al finalizar, exporta transcripciones, subtitulos y datos estructurados en varios formatos.",
    baseUrl: "URL base",
    authentication: "Autenticacion",
    apiKey: "Clave API",
    apiKeyIntro: "Envia la clave API en la cabecera de la solicitud. El acceso requiere un plan activo compatible con API.",
    settingsStep: "Abre la configuracion de tu cuenta.",
    upgradeStep: "Confirma que tu plan incluya acceso API.",
    createKeyStep: "Crea una clave API y guardala de forma segura.",
    upload: "Carga de archivos",
    uploadIntro: "Usa carga directa con URLs firmadas o proporciona una URL publica de archivo externo.",
    transcription: "Transcripcion",
    status: "Estado",
    exports: "Exportaciones",
    formats: "Formatos",
    languages: "Idiomas",
    languagesText: "Votxt admite muchos idiomas de transcripcion. Envia el codigo de idioma en la solicitud.",
    support: "Soporte",
    endpoint: "Endpoint",
    method: "Metodo",
    description: "Descripcion",
    exportAction: "Exportar",
    formatColumn: "Formato",
    code: "Codigo",
    queued: "En cola",
    preprocessing: "Preprocesando",
    processing: "Procesando",
    completed: "Completado",
    failed: "Error"
  },
  fr: {
    metaTitle: "Documentation Votxt OpenAPI",
    metaDescription: "Retrouvez les bases de Votxt OpenAPI pour l'import, la transcription, les exports et le suivi des taches.",
    tocTitle: "Sommaire API",
    title: "Documentation Votxt OpenAPI",
    betaLabel: "Beta",
    betaNotice: "Votxt OpenAPI est en beta. Testez vos integrations en developpement avant la production.",
    overview: "Apercu",
    overviewText: "Votxt OpenAPI permet d'ajouter la transcription audio et video a vos applications et automatisations.",
    workflowText: "Importez un fichier ou utilisez une URL externe, creez une tache de transcription puis suivez son etat.",
    resultsText: "Une fois terminee, exportez les transcriptions, sous-titres et donnees structurees dans plusieurs formats.",
    baseUrl: "URL de base",
    authentication: "Authentification",
    apiKey: "Cle API",
    apiKeyIntro: "Envoyez votre cle API dans l'en-tete de requete. L'acces API exige un forfait actif compatible.",
    settingsStep: "Ouvrez les parametres de votre compte.",
    upgradeStep: "Verifiez que votre forfait inclut l'acces API.",
    createKeyStep: "Creez une cle API et conservez-la en securite.",
    upload: "Import de fichiers",
    uploadIntro: "Utilisez l'import direct avec URL signee ou fournissez une URL publique de fichier externe.",
    transcription: "Transcription",
    status: "Statut",
    exports: "Exports",
    formats: "Formats",
    languages: "Langues",
    languagesText: "Votxt prend en charge de nombreuses langues de transcription. Transmettez le code langue dans la requete.",
    support: "Support",
    endpoint: "Point d'acces",
    method: "Methode",
    description: "Description",
    exportAction: "Exporter",
    formatColumn: "Format",
    code: "Code",
    queued: "En attente",
    preprocessing: "Pretraitement",
    processing: "Traitement",
    completed: "Termine",
    failed: "Echec"
  },
  hu: {
    metaTitle: "Votxt OpenAPI dokumentacio",
    metaDescription: "Votxt OpenAPI alapok feltolteshez, atirashoz, exportokhoz es feladatallapothoz.",
    tocTitle: "API tartalom",
    title: "Votxt OpenAPI dokumentacio",
    betaLabel: "Beta",
    betaNotice: "A Votxt OpenAPI jelenleg beta. Eles hasznalat elott fejlesztoi kornyezetben teszteld az integraciot.",
    overview: "Attekintes",
    overviewText: "A Votxt OpenAPI-val hang- es videotranszkripciot epithetsz alkalmazasokba es automatizmusokba.",
    workflowText: "Tolts fel fajlt vagy hasznalj kulso fajl URL-t, majd hozz letre atirasi feladatot es ellenorizd az allapotat.",
    resultsText: "Befejezes utan tobb formatumban exportalhatsz atiratokat, feliratokat es strukturalt adatokat.",
    baseUrl: "Alap URL",
    authentication: "Hitelesites",
    apiKey: "API kulcs",
    apiKeyIntro: "Kuld az API kulcsot a keres fejleceben. Az API-hozzafereshez aktiv, API-kepes csomag kell.",
    settingsStep: "Nyisd meg a fiok beallitasait.",
    upgradeStep: "Ellenorizd, hogy a csomagod tartalmaz-e API-hozzaferest.",
    createKeyStep: "Hozz letre API kulcsot, es tarold biztonsagosan.",
    upload: "Fajlfeltoltes",
    uploadIntro: "Hasznalj alairt URL-es kozvetlen feltoltest vagy nyilvanos kulso fajl URL-t.",
    transcription: "Atiras",
    status: "Allapot",
    exports: "Exportok",
    formats: "Formatumok",
    languages: "Nyelvek",
    languagesText: "A Votxt sok atirasi nyelvet tamogat. Add meg a nyelvkodot a keresben.",
    support: "Tamogatas",
    endpoint: "Vegpont",
    method: "Metodus",
    description: "Leiras",
    exportAction: "Export",
    formatColumn: "Formatum",
    code: "Kod",
    queued: "Sorban all",
    preprocessing: "Elofeldolgozas",
    processing: "Feldolgozas",
    completed: "Kesz",
    failed: "Sikertelen"
  },
  id: {
    metaTitle: "Dokumentasi Votxt OpenAPI",
    metaDescription: "Pelajari dasar Votxt OpenAPI untuk unggahan, transkripsi, ekspor, dan status tugas.",
    tocTitle: "Isi API",
    title: "Dokumentasi Votxt OpenAPI",
    betaLabel: "Beta",
    betaNotice: "Votxt OpenAPI masih beta. Uji integrasi di lingkungan pengembangan sebelum produksi.",
    overview: "Ringkasan",
    overviewText: "Votxt OpenAPI membantu menambahkan transkripsi audio dan video ke aplikasi serta otomatisasi.",
    workflowText: "Unggah file atau gunakan URL file eksternal, lalu buat tugas transkripsi dan periksa statusnya.",
    resultsText: "Setelah selesai, ekspor transkrip, subtitle, dan data terstruktur dalam berbagai format.",
    baseUrl: "URL dasar",
    authentication: "Autentikasi",
    apiKey: "Kunci API",
    apiKeyIntro: "Kirim kunci API di header permintaan. Akses API memerlukan paket aktif yang mendukung API.",
    settingsStep: "Buka pengaturan akun.",
    upgradeStep: "Pastikan paket Anda menyertakan akses API.",
    createKeyStep: "Buat kunci API dan simpan dengan aman.",
    upload: "Unggah file",
    uploadIntro: "Gunakan unggahan langsung dengan URL bertanda tangan atau berikan URL file eksternal publik.",
    transcription: "Transkripsi",
    status: "Status",
    exports: "Ekspor",
    formats: "Format",
    languages: "Bahasa",
    languagesText: "Votxt mendukung banyak bahasa transkripsi. Kirim kode bahasa dalam permintaan.",
    support: "Dukungan",
    endpoint: "Endpoint",
    method: "Metode",
    description: "Deskripsi",
    exportAction: "Ekspor",
    formatColumn: "Format",
    code: "Kode",
    queued: "Dalam antrean",
    preprocessing: "Pra-pemrosesan",
    processing: "Diproses",
    completed: "Selesai",
    failed: "Gagal"
  },
  it: {
    metaTitle: "Documentazione Votxt OpenAPI",
    metaDescription: "Scopri le basi di Votxt OpenAPI per caricamenti, trascrizione, esportazioni e stato attivita.",
    tocTitle: "Contenuti API",
    title: "Documentazione Votxt OpenAPI",
    betaLabel: "Beta",
    betaNotice: "Votxt OpenAPI e in beta. Prova le integrazioni in sviluppo prima dell'uso in produzione.",
    overview: "Panoramica",
    overviewText: "Votxt OpenAPI integra trascrizione audio e video in applicazioni e automazioni.",
    workflowText: "Carica un file o usa un URL esterno, poi crea un'attivita di trascrizione e controlla lo stato.",
    resultsText: "Al termine, esporta trascritti, sottotitoli e dati strutturati in piu formati.",
    baseUrl: "URL base",
    authentication: "Autenticazione",
    apiKey: "Chiave API",
    apiKeyIntro: "Invia la chiave API nell'header della richiesta. L'accesso API richiede un piano attivo compatibile.",
    settingsStep: "Apri le impostazioni dell'account.",
    upgradeStep: "Verifica che il piano includa accesso API.",
    createKeyStep: "Crea una chiave API e conservala in modo sicuro.",
    upload: "Caricamento file",
    uploadIntro: "Usa caricamento diretto con URL firmati o fornisci un URL pubblico di file esterno.",
    transcription: "Trascrizione",
    status: "Stato",
    exports: "Esportazioni",
    formats: "Formati",
    languages: "Lingue",
    languagesText: "Votxt supporta molte lingue di trascrizione. Passa il codice lingua nella richiesta.",
    support: "Supporto",
    endpoint: "Endpoint",
    method: "Metodo",
    description: "Descrizione",
    exportAction: "Esporta",
    formatColumn: "Formato",
    code: "Codice",
    queued: "In coda",
    preprocessing: "Pre-elaborazione",
    processing: "Elaborazione",
    completed: "Completato",
    failed: "Non riuscito"
  },
  ja: {
    metaTitle: "Votxt OpenAPI ドキュメント",
    metaDescription: "アップロード、文字起こし、エクスポート、タスク状態のための Votxt OpenAPI 基本ガイドです。",
    tocTitle: "API 目次",
    title: "Votxt OpenAPI ドキュメント",
    betaLabel: "ベータ",
    betaNotice: "Votxt OpenAPI は現在ベータ版です。本番利用前に開発環境で統合をテストしてください。",
    overview: "概要",
    overviewText: "Votxt OpenAPI で、音声と動画の文字起こしをアプリや自動化ワークフローに組み込めます。",
    workflowText: "ファイルをアップロードするか外部ファイル URL を使い、文字起こしタスクを作成して状態を確認します。",
    resultsText: "完了後は、文字起こし、字幕、構造化データを複数の形式でエクスポートできます。",
    baseUrl: "ベース URL",
    authentication: "認証",
    apiKey: "API キー",
    apiKeyIntro: "リクエストヘッダーに API キーを送信します。API アクセスには対応する有効なプランが必要です。",
    settingsStep: "アカウント設定を開きます。",
    upgradeStep: "プランに API アクセスが含まれていることを確認します。",
    createKeyStep: "API キーを作成し、安全に保存します。",
    upload: "ファイルアップロード",
    uploadIntro: "署名付き URL の直接アップロード、または公開された外部ファイル URL を使用できます。",
    transcription: "文字起こし",
    status: "状態",
    exports: "エクスポート",
    formats: "形式",
    languages: "言語",
    languagesText: "Votxt は多くの文字起こし言語に対応しています。リクエストに言語コードを渡してください。",
    support: "サポート",
    endpoint: "エンドポイント",
    method: "メソッド",
    description: "説明",
    exportAction: "エクスポート",
    formatColumn: "形式",
    code: "コード",
    queued: "待機中",
    preprocessing: "前処理中",
    processing: "処理中",
    completed: "完了",
    failed: "失敗"
  },
  ko: {
    metaTitle: "Votxt OpenAPI 문서",
    metaDescription: "업로드, 전사, 내보내기, 작업 상태를 위한 Votxt OpenAPI 기본 안내입니다.",
    tocTitle: "API 목차",
    title: "Votxt OpenAPI 문서",
    betaLabel: "베타",
    betaNotice: "Votxt OpenAPI는 현재 베타입니다. 운영 환경에 사용하기 전에 개발 환경에서 통합을 테스트하세요.",
    overview: "개요",
    overviewText: "Votxt OpenAPI로 오디오 및 비디오 전사를 앱과 자동화 워크플로에 통합할 수 있습니다.",
    workflowText: "파일을 업로드하거나 외부 파일 URL을 사용한 뒤 전사 작업을 만들고 상태를 확인합니다.",
    resultsText: "완료 후 전사문, 자막, 구조화 데이터를 여러 형식으로 내보낼 수 있습니다.",
    baseUrl: "기본 URL",
    authentication: "인증",
    apiKey: "API 키",
    apiKeyIntro: "요청 헤더에 API 키를 보내세요. API 접근에는 API가 포함된 활성 플랜이 필요합니다.",
    settingsStep: "계정 설정을 엽니다.",
    upgradeStep: "플랜에 API 접근 권한이 포함되어 있는지 확인합니다.",
    createKeyStep: "API 키를 만들고 안전하게 보관합니다.",
    upload: "파일 업로드",
    uploadIntro: "서명된 URL로 직접 업로드하거나 공개 외부 파일 URL을 제공할 수 있습니다.",
    transcription: "전사",
    status: "상태",
    exports: "내보내기",
    formats: "형식",
    languages: "언어",
    languagesText: "Votxt는 다양한 전사 언어를 지원합니다. 요청에 언어 코드를 전달하세요.",
    support: "지원",
    endpoint: "엔드포인트",
    method: "메서드",
    description: "설명",
    exportAction: "내보내기",
    formatColumn: "형식",
    code: "코드",
    queued: "대기 중",
    preprocessing: "전처리 중",
    processing: "처리 중",
    completed: "완료",
    failed: "실패"
  },
  nl: {
    metaTitle: "Votxt OpenAPI-documentatie",
    metaDescription: "Leer de basis van Votxt OpenAPI voor uploads, transcriptie, exports en taakstatus.",
    tocTitle: "API-inhoud",
    title: "Votxt OpenAPI-documentatie",
    betaLabel: "Beta",
    betaNotice: "De Votxt OpenAPI is in beta. Test integraties in ontwikkeling voordat je productie gebruikt.",
    overview: "Overzicht",
    overviewText: "Met Votxt OpenAPI integreer je audio- en videotranscriptie in apps en automatiseringen.",
    workflowText: "Upload een bestand of gebruik een externe bestands-URL, maak daarna een transcriptietaak en controleer de status.",
    resultsText: "Na voltooiing exporteer je transcripties, ondertitels en gestructureerde data in meerdere formaten.",
    baseUrl: "Basis-URL",
    authentication: "Authenticatie",
    apiKey: "API-sleutel",
    apiKeyIntro: "Stuur je API-sleutel mee in de request-header. API-toegang vereist een actief API-plan.",
    settingsStep: "Open je accountinstellingen.",
    upgradeStep: "Controleer of je plan API-toegang bevat.",
    createKeyStep: "Maak een API-sleutel en bewaar die veilig.",
    upload: "Bestand uploaden",
    uploadIntro: "Gebruik directe upload met ondertekende URLs of geef een publieke externe bestands-URL op.",
    transcription: "Transcriptie",
    status: "Status",
    exports: "Exports",
    formats: "Formaten",
    languages: "Talen",
    languagesText: "Votxt ondersteunt veel transcriptietalen. Geef de taalcode mee in je request.",
    support: "Support",
    endpoint: "Endpoint",
    method: "Methode",
    description: "Beschrijving",
    exportAction: "Export",
    formatColumn: "Formaat",
    code: "Code",
    queued: "In wachtrij",
    preprocessing: "Voorbewerking",
    processing: "Verwerken",
    completed: "Voltooid",
    failed: "Mislukt"
  },
  pl: {
    metaTitle: "Dokumentacja Votxt OpenAPI",
    metaDescription: "Poznaj podstawy Votxt OpenAPI dla przesylania plikow, transkrypcji, eksportow i statusu zadan.",
    tocTitle: "Spis API",
    title: "Dokumentacja Votxt OpenAPI",
    betaLabel: "Beta",
    betaNotice: "Votxt OpenAPI jest w wersji beta. Przetestuj integracje w srodowisku deweloperskim przed produkcja.",
    overview: "Przeglad",
    overviewText: "Votxt OpenAPI pozwala dodac transkrypcje audio i wideo do aplikacji oraz automatyzacji.",
    workflowText: "Przeslij plik albo uzyj zewnetrznego URL pliku, utworz zadanie transkrypcji i sprawdz jego status.",
    resultsText: "Po zakonczeniu wyeksportuj transkrypcje, napisy i dane strukturalne w wielu formatach.",
    baseUrl: "Bazowy URL",
    authentication: "Uwierzytelnianie",
    apiKey: "Klucz API",
    apiKeyIntro: "Wyslij klucz API w naglowku zadania. Dostep API wymaga aktywnego planu z API.",
    settingsStep: "Otworz ustawienia konta.",
    upgradeStep: "Sprawdz, czy plan obejmuje dostep API.",
    createKeyStep: "Utworz klucz API i przechowuj go bezpiecznie.",
    upload: "Przesylanie plikow",
    uploadIntro: "Uzyj bezposredniego przesylania przez podpisane URL albo podaj publiczny zewnetrzny URL pliku.",
    transcription: "Transkrypcja",
    status: "Status",
    exports: "Eksporty",
    formats: "Formaty",
    languages: "Jezyki",
    languagesText: "Votxt obsluguje wiele jezykow transkrypcji. Przekaz kod jezyka w zadaniu.",
    support: "Wsparcie",
    endpoint: "Endpoint",
    method: "Metoda",
    description: "Opis",
    exportAction: "Eksport",
    formatColumn: "Format",
    code: "Kod",
    queued: "W kolejce",
    preprocessing: "Przetwarzanie wstepne",
    processing: "Przetwarzanie",
    completed: "Zakonczone",
    failed: "Niepowodzenie"
  },
  pt: {
    metaTitle: "Documentacao da Votxt OpenAPI",
    metaDescription: "Veja os fundamentos da Votxt OpenAPI para uploads, transcricao, exportacoes e status de tarefas.",
    tocTitle: "Conteudo da API",
    title: "Documentacao da Votxt OpenAPI",
    betaLabel: "Beta",
    betaNotice: "A Votxt OpenAPI esta em beta. Teste integracoes em desenvolvimento antes de usar em producao.",
    overview: "Visao geral",
    overviewText: "A Votxt OpenAPI integra transcricao de audio e video em apps e fluxos de automacao.",
    workflowText: "Envie um arquivo ou use uma URL externa, crie uma tarefa de transcricao e acompanhe o status.",
    resultsText: "Depois de concluir, exporte transcricoes, legendas e dados estruturados em varios formatos.",
    baseUrl: "URL base",
    authentication: "Autenticacao",
    apiKey: "Chave API",
    apiKeyIntro: "Envie a chave API no cabecalho da requisicao. O acesso API requer um plano ativo compativel.",
    settingsStep: "Abra as configuracoes da conta.",
    upgradeStep: "Confirme se seu plano inclui acesso API.",
    createKeyStep: "Crie uma chave API e guarde-a com seguranca.",
    upload: "Upload de arquivos",
    uploadIntro: "Use upload direto com URLs assinadas ou informe uma URL publica de arquivo externo.",
    transcription: "Transcricao",
    status: "Status",
    exports: "Exportacoes",
    formats: "Formatos",
    languages: "Idiomas",
    languagesText: "A Votxt oferece suporte a muitos idiomas de transcricao. Envie o codigo do idioma na requisicao.",
    support: "Suporte",
    endpoint: "Endpoint",
    method: "Metodo",
    description: "Descricao",
    exportAction: "Exportar",
    formatColumn: "Formato",
    code: "Codigo",
    queued: "Na fila",
    preprocessing: "Pre-processando",
    processing: "Processando",
    completed: "Concluido",
    failed: "Falhou"
  },
  ru: {
    metaTitle: "Документация Votxt OpenAPI",
    metaDescription: "Основы Votxt OpenAPI для загрузки файлов, транскрибации, экспорта и статуса задач.",
    tocTitle: "Содержание API",
    title: "Документация Votxt OpenAPI",
    betaLabel: "Бета",
    betaNotice: "Votxt OpenAPI сейчас в бета-версии. Проверьте интеграцию в среде разработки перед продакшеном.",
    overview: "Обзор",
    overviewText: "Votxt OpenAPI позволяет встроить транскрибацию аудио и видео в приложения и автоматизации.",
    workflowText: "Загрузите файл или используйте внешний URL, затем создайте задачу транскрибации и проверьте статус.",
    resultsText: "После завершения экспортируйте текст, субтитры и структурированные данные в нескольких форматах.",
    baseUrl: "Базовый URL",
    authentication: "Аутентификация",
    apiKey: "API-ключ",
    apiKeyIntro: "Передавайте API-ключ в заголовке запроса. Для доступа API нужен активный план с поддержкой API.",
    settingsStep: "Откройте настройки аккаунта.",
    upgradeStep: "Убедитесь, что ваш план включает доступ API.",
    createKeyStep: "Создайте API-ключ и храните его безопасно.",
    upload: "Загрузка файлов",
    uploadIntro: "Используйте прямую загрузку через подписанные URL или публичный внешний URL файла.",
    transcription: "Транскрибация",
    status: "Статус",
    exports: "Экспорт",
    formats: "Форматы",
    languages: "Языки",
    languagesText: "Votxt поддерживает много языков транскрибации. Передайте код языка в запросе.",
    support: "Поддержка",
    endpoint: "Эндпоинт",
    method: "Метод",
    description: "Описание",
    exportAction: "Экспорт",
    formatColumn: "Формат",
    code: "Код",
    queued: "В очереди",
    preprocessing: "Предобработка",
    processing: "Обработка",
    completed: "Завершено",
    failed: "Ошибка"
  },
  th: {
    metaTitle: "เอกสาร Votxt OpenAPI",
    metaDescription: "เรียนรู้พื้นฐาน Votxt OpenAPI สำหรับอัปโหลด ถอดเสียง ส่งออก และสถานะงาน",
    tocTitle: "สารบัญ API",
    title: "เอกสาร Votxt OpenAPI",
    betaLabel: "เบต้า",
    betaNotice: "Votxt OpenAPI ยังอยู่ในรุ่นเบต้า โปรดทดสอบการเชื่อมต่อในสภาพแวดล้อมพัฒนาก่อนใช้งานจริง",
    overview: "ภาพรวม",
    overviewText: "Votxt OpenAPI ช่วยเพิ่มการถอดเสียงจากเสียงและวิดีโอในแอปและเวิร์กโฟลว์อัตโนมัติ",
    workflowText: "อัปโหลดไฟล์หรือใช้ URL ไฟล์ภายนอก จากนั้นสร้างงานถอดเสียงและตรวจสอบสถานะ",
    resultsText: "เมื่อเสร็จแล้ว คุณสามารถส่งออกข้อความถอดเสียง คำบรรยาย และข้อมูลแบบมีโครงสร้างได้หลายรูปแบบ",
    baseUrl: "URL พื้นฐาน",
    authentication: "การยืนยันตัวตน",
    apiKey: "คีย์ API",
    apiKeyIntro: "ส่งคีย์ API ในส่วนหัวของคำขอ การเข้าถึง API ต้องใช้แพ็กเกจที่เปิดใช้งาน API",
    settingsStep: "เปิดการตั้งค่าบัญชี",
    upgradeStep: "ตรวจสอบว่าแพ็กเกจของคุณมีการเข้าถึง API",
    createKeyStep: "สร้างคีย์ API และเก็บไว้อย่างปลอดภัย",
    upload: "อัปโหลดไฟล์",
    uploadIntro: "ใช้อัปโหลดโดยตรงผ่าน URL ที่ลงนามแล้ว หรือระบุ URL ไฟล์ภายนอกแบบสาธารณะ",
    transcription: "ถอดเสียง",
    status: "สถานะ",
    exports: "ส่งออก",
    formats: "รูปแบบ",
    languages: "ภาษา",
    languagesText: "Votxt รองรับภาษาถอดเสียงจำนวนมาก ให้ส่งรหัสภาษาในคำขอ",
    support: "ซัพพอร์ต",
    endpoint: "Endpoint",
    method: "เมธอด",
    description: "คำอธิบาย",
    exportAction: "ส่งออก",
    formatColumn: "รูปแบบ",
    code: "รหัส",
    queued: "รอคิว",
    preprocessing: "เตรียมประมวลผล",
    processing: "กำลังประมวลผล",
    completed: "เสร็จสิ้น",
    failed: "ล้มเหลว"
  },
  tr: {
    metaTitle: "Votxt OpenAPI Dokumantasyonu",
    metaDescription: "Yukleme, transkripsiyon, disa aktarma ve gorev durumu icin Votxt OpenAPI temelleri.",
    tocTitle: "API icerigi",
    title: "Votxt OpenAPI Dokumantasyonu",
    betaLabel: "Beta",
    betaNotice: "Votxt OpenAPI beta asamasindadir. Uretimden once entegrasyonlari gelistirme ortaminda test edin.",
    overview: "Genel bakis",
    overviewText: "Votxt OpenAPI ile ses ve video transkripsiyonunu uygulamalara ve otomasyonlara entegre edebilirsiniz.",
    workflowText: "Bir dosya yukleyin veya harici dosya URL'si kullanin, sonra transkripsiyon gorevi olusturup durumunu kontrol edin.",
    resultsText: "Tamamlandiktan sonra metinleri, altyazilari ve yapilandirilmis verileri birden cok formatta disa aktarabilirsiniz.",
    baseUrl: "Temel URL",
    authentication: "Kimlik dogrulama",
    apiKey: "API anahtari",
    apiKeyIntro: "API anahtarinizi istek basliginda gonderin. API erisimi aktif ve API destekli bir plan gerektirir.",
    settingsStep: "Hesap ayarlarinizi acin.",
    upgradeStep: "Planinizda API erisimi oldugunu dogrulayin.",
    createKeyStep: "Bir API anahtari olusturun ve guvenle saklayin.",
    upload: "Dosya yukleme",
    uploadIntro: "Imzali URL ile dogrudan yukleme yapin veya herkese acik harici dosya URL'si verin.",
    transcription: "Transkripsiyon",
    status: "Durum",
    exports: "Disa aktarma",
    formats: "Formatlar",
    languages: "Diller",
    languagesText: "Votxt bircok transkripsiyon dilini destekler. Istekte dil kodunu gonderin.",
    support: "Destek",
    endpoint: "Endpoint",
    method: "Metot",
    description: "Aciklama",
    exportAction: "Disa aktar",
    formatColumn: "Format",
    code: "Kod",
    queued: "Sirada",
    preprocessing: "On isleme",
    processing: "Isleniyor",
    completed: "Tamamlandi",
    failed: "Basarisiz"
  },
  uk: {
    metaTitle: "Документація Votxt OpenAPI",
    metaDescription: "Основи Votxt OpenAPI для завантаження файлів, транскрибації, експорту й статусу завдань.",
    tocTitle: "Зміст API",
    title: "Документація Votxt OpenAPI",
    betaLabel: "Бета",
    betaNotice: "Votxt OpenAPI зараз у бета-версії. Перевірте інтеграції в середовищі розробки перед продакшеном.",
    overview: "Огляд",
    overviewText: "Votxt OpenAPI дає змогу вбудувати транскрибацію аудіо й відео в застосунки та автоматизації.",
    workflowText: "Завантажте файл або використайте зовнішній URL, створіть завдання транскрибації й перевіряйте статус.",
    resultsText: "Після завершення експортуйте транскрипти, субтитри та структуровані дані в кількох форматах.",
    baseUrl: "Базовий URL",
    authentication: "Автентифікація",
    apiKey: "API-ключ",
    apiKeyIntro: "Передавайте API-ключ у заголовку запиту. Для доступу API потрібен активний план із підтримкою API.",
    settingsStep: "Відкрийте налаштування акаунта.",
    upgradeStep: "Переконайтеся, що ваш план включає доступ API.",
    createKeyStep: "Створіть API-ключ і зберігайте його безпечно.",
    upload: "Завантаження файлів",
    uploadIntro: "Використовуйте пряме завантаження через підписані URL або публічний зовнішній URL файлу.",
    transcription: "Транскрибація",
    status: "Статус",
    exports: "Експорт",
    formats: "Формати",
    languages: "Мови",
    languagesText: "Votxt підтримує багато мов транскрибації. Передайте код мови в запиті.",
    support: "Підтримка",
    endpoint: "Ендпоінт",
    method: "Метод",
    description: "Опис",
    exportAction: "Експорт",
    formatColumn: "Формат",
    code: "Код",
    queued: "У черзі",
    preprocessing: "Попередня обробка",
    processing: "Обробка",
    completed: "Завершено",
    failed: "Помилка"
  },
  vi: {
    metaTitle: "Tài liệu Votxt OpenAPI",
    metaDescription: "Tìm hiểu Votxt OpenAPI cho tải lên, chuyển văn bản, xuất dữ liệu và trạng thái tác vụ.",
    tocTitle: "Mục lục API",
    title: "Tài liệu Votxt OpenAPI",
    betaLabel: "Beta",
    betaNotice: "Votxt OpenAPI đang ở bản beta. Hãy kiểm thử tích hợp trong môi trường phát triển trước khi dùng sản xuất.",
    overview: "Tổng quan",
    overviewText: "Votxt OpenAPI giúp tích hợp chuyển văn bản âm thanh và video vào ứng dụng hoặc quy trình tự động.",
    workflowText: "Tải tệp lên hoặc dùng URL tệp bên ngoài, sau đó tạo tác vụ chuyển văn bản và kiểm tra trạng thái.",
    resultsText: "Khi hoàn tất, xuất bản ghi, phụ đề và dữ liệu có cấu trúc ở nhiều định dạng.",
    baseUrl: "URL gốc",
    authentication: "Xác thực",
    apiKey: "Khóa API",
    apiKeyIntro: "Gửi khóa API trong header của yêu cầu. Quyền truy cập API cần gói đang hoạt động có hỗ trợ API.",
    settingsStep: "Mở cài đặt tài khoản.",
    upgradeStep: "Xác nhận gói của bạn có quyền truy cập API.",
    createKeyStep: "Tạo khóa API và lưu trữ an toàn.",
    upload: "Tải tệp lên",
    uploadIntro: "Dùng tải trực tiếp với URL đã ký hoặc cung cấp URL tệp bên ngoài công khai.",
    transcription: "Chuyển văn bản",
    status: "Trạng thái",
    exports: "Xuất dữ liệu",
    formats: "Định dạng",
    languages: "Ngôn ngữ",
    languagesText: "Votxt hỗ trợ nhiều ngôn ngữ chuyển văn bản. Hãy truyền mã ngôn ngữ trong yêu cầu.",
    support: "Hỗ trợ",
    endpoint: "Endpoint",
    method: "Phương thức",
    description: "Mô tả",
    exportAction: "Xuất",
    formatColumn: "Định dạng",
    code: "Mã",
    queued: "Trong hàng đợi",
    preprocessing: "Tiền xử lý",
    processing: "Đang xử lý",
    completed: "Hoàn tất",
    failed: "Thất bại"
  },
  zh: {
    metaTitle: "Votxt OpenAPI 文档",
    metaDescription: "了解 Votxt OpenAPI 的上传、转写、导出和任务状态基础用法。",
    tocTitle: "API 目录",
    title: "Votxt OpenAPI 文档",
    betaLabel: "Beta 版本",
    betaNotice: "Votxt OpenAPI 目前处于 Beta 阶段。请先在开发环境中测试集成，再用于生产环境。",
    overview: "概览",
    overviewText: "Votxt OpenAPI 可将音频和视频转写能力集成到应用、工作流和自动化工具中。",
    workflowText: "你可以上传文件或使用外部文件 URL，然后创建转写任务并查询处理状态。",
    resultsText: "任务完成后，可将转写文本、字幕和结构化数据导出为多种格式。",
    baseUrl: "基础 URL",
    authentication: "认证",
    apiKey: "API 密钥",
    apiKeyIntro: "在请求头中发送 API 密钥。API 访问需要启用 API 权限的有效套餐。",
    settingsStep: "打开账号设置。",
    upgradeStep: "确认你的套餐包含 API 访问权限。",
    createKeyStep: "创建 API 密钥并安全保存。",
    upload: "文件上传",
    uploadIntro: "支持通过签名 URL 直接上传文件，也可以提供公开可访问的外部文件 URL。",
    transcription: "转写",
    status: "状态",
    exports: "导出",
    formats: "格式",
    languages: "语言",
    languagesText: "Votxt 支持多种转写语言。请在请求中传入对应语言代码。",
    support: "支持",
    endpoint: "端点",
    method: "方法",
    description: "说明",
    exportAction: "导出",
    formatColumn: "格式",
    code: "代码",
    queued: "排队中",
    preprocessing: "预处理中",
    processing: "处理中",
    completed: "已完成",
    failed: "失败"
  },
  "zh-TW": {
    metaTitle: "Votxt OpenAPI 文件",
    metaDescription: "了解 Votxt OpenAPI 的上傳、轉寫、匯出與任務狀態基礎用法。",
    tocTitle: "API 目錄",
    title: "Votxt OpenAPI 文件",
    betaLabel: "Beta 版本",
    betaNotice: "Votxt OpenAPI 目前處於 Beta 階段。請先在開發環境測試整合，再用於正式環境。",
    overview: "概覽",
    overviewText: "Votxt OpenAPI 可將音訊與影片轉寫能力整合到應用程式、工作流程與自動化工具中。",
    workflowText: "你可以上傳檔案或使用外部檔案 URL，接著建立轉寫任務並查詢處理狀態。",
    resultsText: "任務完成後，可將轉寫文字、字幕與結構化資料匯出為多種格式。",
    baseUrl: "基礎 URL",
    authentication: "認證",
    apiKey: "API 金鑰",
    apiKeyIntro: "在請求標頭中傳送 API 金鑰。API 存取需要啟用 API 權限的有效方案。",
    settingsStep: "開啟帳號設定。",
    upgradeStep: "確認你的方案包含 API 存取權限。",
    createKeyStep: "建立 API 金鑰並安全保存。",
    upload: "檔案上傳",
    uploadIntro: "支援透過簽名 URL 直接上傳檔案，也可以提供公開可存取的外部檔案 URL。",
    transcription: "轉寫",
    status: "狀態",
    exports: "匯出",
    formats: "格式",
    languages: "語言",
    languagesText: "Votxt 支援多種轉寫語言。請在請求中傳入對應語言代碼。",
    support: "支援",
    endpoint: "端點",
    method: "方法",
    description: "說明",
    exportAction: "匯出",
    formatColumn: "格式",
    code: "代碼",
    queued: "排隊中",
    preprocessing: "預處理中",
    processing: "處理中",
    completed: "已完成",
    failed: "失敗"
  }
};

function getDocsText(locale: Locale): DocsText {
  return docsTextByLocale[locale] ?? docsTextByLocale.en;
}

function CodeBlock({children}: {children: string}) {
  return (
    <pre className="overflow-visible whitespace-pre font-mono text-base leading-6 text-ink">
      <code className="block overflow-x-auto rounded-md bg-[#2d2d2d] p-4 text-[#cccccc]">{children}</code>
    </pre>
  );
}

function BaseUrlBlock() {
  return (
    <pre className="overflow-visible whitespace-pre font-mono text-base leading-6 text-ink">
      <code className="rounded border border-violet/20 bg-violet/10 px-1.5 py-0.5 text-sm leading-5 text-ink/80">https://api.votxt.co</code>
    </pre>
  );
}

function DataTable({headers, rows, tallRows = []}: {headers: string[]; rows: string[][]; tallRows?: number[]}) {
  const tallRowSet = new Set(tallRows);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-slate-200 text-left text-sm leading-5">
        <thead className="text-sm font-semibold text-ink">
          <tr>
            {headers.map((header) => (
              <th key={header} className="border border-slate-200 px-4 py-2 font-semibold">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.join("-")} className={tallRowSet.has(rowIndex) ? "h-[57px]" : undefined}>
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`} className="border border-slate-200 px-4 py-2 align-top text-slate-600">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocSection({id, title, children, className = ""}: {id: string; title: string; children: React.ReactNode; className?: string}) {
  return (
    <section className={`scroll-mt-28 ${className}`}>
      <h2 id={id} className="scroll-mt-28 border-b border-slate-200 pb-2 text-xl font-semibold leading-7 text-ink md:text-2xl md:leading-8">{title}</h2>
      <div className="mt-5 text-base leading-[26px] text-ink/80 [&>div]:my-4 [&>ol]:my-4 [&>p]:my-4 [&>pre]:my-4 [&>ul]:my-4">{children}</div>
    </section>
  );
}

function DocHeading({id, children}: {id?: string; children: React.ReactNode}) {
  return <h3 id={id} className="scroll-mt-28 mb-4 mt-6 text-xl font-semibold leading-7 text-ink">{children}</h3>;
}

function DocSubHeading({id, children}: {id: string; children: React.ReactNode}) {
  return <h4 id={id} className="scroll-mt-28 my-4 text-lg font-semibold leading-7 text-ink">{children}</h4>;
}

function TableOfContentsLinks({items = toc}: {items?: ReadonlyArray<readonly [string, string]>}) {
  return (
    <div className="grid gap-2">
      {items.map(([label, href], index) => {
        const longCurlAlternative = href === "alternative-create-transcription-from-external-url";

        return (
          <a key={`${href}-${index}`} href={`#${href}`} className={`block w-full rounded px-2 py-1 text-sm font-normal leading-5 text-slate-600 transition-colors hover:bg-violet/10 hover:text-ink [&:nth-child(2)]:bg-violet/10 [&:nth-child(2)]:text-ink ${longCurlAlternative ? "min-h-[68px]" : ""}`}>
            {label}
          </a>
        );
      })}
    </div>
  );
}

function LocalizedDocsPage({locale}: {locale: Locale}) {
  const copy = getWorkspaceCopy(locale) as Record<string, any>;
  const docs = getDocsText(locale);
  const localizedToc = [
    [docs.authentication, "authentication"],
    [docs.overview, "overview"],
    [docs.baseUrl, "base-url"],
    [docs.upload, "upload"],
    [docs.transcription, "transcription"],
    [docs.status, "status"],
    [docs.exports, "exports"],
    [docs.formats, "formats"],
    [docs.languages, "languages"],
    [docs.support, "support"]
  ] as const;

  return (
    <>
      <main className="min-h-screen bg-white">
        <SiteHeader />
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-[81px] md:px-8 md:pt-[104px] lg:grid-cols-[minmax(0,920px)_256px]">
          <article className="grid content-start gap-8 md:gap-10 md:pt-8">
            <details className="group rounded-md border border-slate-200 bg-white lg:hidden">
              <summary className="flex h-11 cursor-pointer list-none items-center px-4 text-sm font-semibold leading-5 text-ink marker:hidden">
                <span className="mr-1 text-xs transition group-open:rotate-90">▶</span>
                {docs.tocTitle}
              </summary>
              <nav className="border-t border-slate-100 px-4 pb-4 pt-3">
                <TableOfContentsLinks items={localizedToc} />
              </nav>
            </details>

            <header>
              <h1 id="votxt-openapi-documentation-beta" className="border-b border-violet pb-2 text-2xl font-bold leading-8 text-ink md:text-3xl md:leading-9">{docs.title}</h1>
              <blockquote className="mt-6 border-l-4 border-violet/15 pl-4 text-base italic leading-[26px] text-ink/80">
                <strong className="font-bold text-ink">{docs.betaLabel}</strong> {docs.betaNotice}
              </blockquote>
            </header>

            <DocSection id="overview" title={docs.overview}>
              <p>{docs.overviewText}</p>
              <p>{docs.workflowText}</p>
              <p>{docs.resultsText}</p>
            </DocSection>

            <DocSection id="base-url" title={docs.baseUrl} className="md:-mt-4">
              <BaseUrlBlock />
            </DocSection>

            <DocSection id="authentication" title={docs.authentication} className="md:-mt-4">
              <p>{docs.apiKeyIntro}</p>
              <CodeBlock>{`X-API-Key: your_api_key_here`}</CodeBlock>
              <ul className="list-disc list-outside space-y-2 pl-5 md:ml-6 md:pl-0">
                <li>{docs.settingsStep}</li>
                <li>{docs.upgradeStep}</li>
                <li>{docs.createKeyStep}</li>
              </ul>
            </DocSection>

            <DocSection id="upload" title={docs.upload} className="md:-mt-4">
              <p>{docs.uploadIntro}</p>
              <ol className="list-decimal space-y-1 pl-5">
                <li><code>POST /api/v1/files/upload-url</code></li>
                <li><code>PUT upload_url</code></li>
                <li><code>POST /api/v1/transcriptions</code></li>
              </ol>
              <CodeBlock>{`POST /api/v1/files/upload-url
Content-Type: application/json
X-API-Key: your_api_key

{
  "filename": "audio.mp3",
  "file_size": 1048576,
  "upload_expires_in": 3600,
  "download_expires_in": 1800
}`}</CodeBlock>
            </DocSection>

            <DocSection id="transcription" title={docs.transcription}>
              <DataTable
                headers={[docs.endpoint, docs.method, docs.description]}
                rows={[
                  ["/api/v1/transcriptions", "POST", docs.upload],
                  ["/api/v1/transcriptions/youtube", "POST", copy.youtubeTask],
                  ["/api/v1/transcriptions", "GET", copy.monthTasks],
                  ["/api/v1/transcriptions/{id}", "GET", copy.transcriptTab],
                  ["/api/v1/transcriptions/{id}/status", "GET", docs.status]
                ]}
              />
              <CodeBlock>{`POST /api/v1/transcriptions
Content-Type: application/json
X-API-Key: your_api_key

{
  "file_key": "12345-abc123def456.mp3",
  "filename": "audio.mp3",
  "language_code": "en",
  "transcription_type": "transcript",
  "enable_speaker_diarization": false,
  "webhook_url": "https://your-app.com/webhook"
}`}</CodeBlock>
            </DocSection>

            <DocSection id="status" title={docs.status}>
              <DataTable
                headers={[docs.status, docs.transcription]}
                rows={[
                  ["queued", docs.queued],
                  ["preprocessing", docs.preprocessing],
                  ["processing", docs.processing],
                  ["completed", docs.completed],
                  ["failed", docs.failed]
                ]}
              />
            </DocSection>

            <DocSection id="exports" title={docs.exports}>
              <p>{docs.resultsText}</p>
              <DataTable headers={[docs.exportAction, docs.formatColumn]} rows={docsExportFormats.map((format) => [docs.exportAction, format.toUpperCase()])} />
            </DocSection>

            <DocSection id="formats" title={docs.formats}>
              <ul className="list-disc space-y-1 pl-5">
                <li>{copy.audioFormats}: {audioFormats.join(", ")}</li>
                <li>{copy.videoFormats}: {videoFormats.join(", ")}</li>
                <li>{copy.maximumFileSize}: {copy.maximumFileSizeValue}</li>
              </ul>
            </DocSection>

            <DocSection id="languages" title={docs.languages}>
              <p>{docs.languagesText}</p>
              <DataTable headers={[docs.languages, docs.code, docs.languages, docs.code, docs.languages, docs.code]} rows={languageRows.map((row) => [...row])} tallRows={[2, 4, 6, 20]} />
            </DocSection>

            <DocSection id="support" title={docs.support} className="md:-mt-4">
              <ul className="list-disc space-y-1 pl-5">
                <li><a href="mailto:support@votxt.io" className="font-semibold text-violet underline underline-offset-2">support@votxt.io</a></li>
                <li><a href="https://discord.gg/RJTaS28UWU" className="font-semibold text-violet underline underline-offset-2">Discord</a></li>
              </ul>
            </DocSection>
          </article>

          <aside className="hidden lg:block">
            <nav className="sticky top-24 h-fit rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-none">
              <h3 className="text-xl font-bold leading-7 text-ink">{docs.tocTitle}</h3>
              <div className="mt-4">
                <TableOfContentsLinks items={localizedToc} />
              </div>
            </nav>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export default function DocsPage({params}: {params: {locale: string}}) {
  const locale = isLocale(params.locale) ? params.locale : "en";

  if (locale !== "en") {
    return <LocalizedDocsPage locale={locale} />;
  }

  return (
    <>
      <main className="min-h-screen bg-white">
        <SiteHeader />
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-[81px] md:px-8 md:pt-[104px] lg:grid-cols-[minmax(0,920px)_256px]">
          <article className="grid content-start gap-8 md:gap-10 md:pt-8">
          <details className="group rounded-md border border-slate-200 bg-white lg:hidden">
            <summary className="flex h-11 cursor-pointer list-none items-center px-4 text-sm font-semibold leading-5 text-ink marker:hidden">
              <span className="mr-1 text-xs transition group-open:rotate-90">▶</span>
              Table of Contents
            </summary>
            <nav className="border-t border-slate-100 px-4 pb-4 pt-3">
              <TableOfContentsLinks />
            </nav>
          </details>
          <header>
            <h1 id="votxt-openapi-documentation-beta" className="border-b border-violet pb-2 text-2xl font-bold leading-8 text-ink md:text-3xl md:leading-9">Votxt OpenAPI Documentation (Beta)</h1>
            <blockquote className="mt-6 border-l-4 border-violet/15 pl-4 text-base italic leading-[26px] text-ink/80">
              <strong className="font-bold text-ink">⚠️ Beta Version Notice</strong> This API is currently in beta. Features and endpoints may change without notice. We recommend testing thoroughly in development environments before production use. Please report any issues or feedback to our support team.
            </blockquote>
          </header>

          <DocSection id="overview" title="Overview">
            <p>The Votxt OpenAPI provides programmatic access to our transcription services, enabling you to integrate audio and video transcription into your workflows, applications, and automation tools like n8n, Zapier, and Make.</p>
          </DocSection>

          <DocSection id="base-url" title="Base URL" className="md:-mt-4">
            <BaseUrlBlock />
          </DocSection>

          <DocSection id="authentication" title="Authentication" className="md:-mt-4">
            <DocHeading id="api-key-authentication">API Key Authentication</DocHeading>
            <p>Include your API key in the request header:</p>
            <CodeBlock>{`X-API-Key: your_api_key_here`}</CodeBlock>
            <DocHeading id="getting-your-api-key">Getting Your API Key</DocHeading>
            <ol className="list-decimal list-outside space-y-2 pl-5 md:ml-6 md:pl-0">
              <li>Log in to your Votxt account.</li>
              <li>Navigate to Settings → API Keys.</li>
              <li>Click &quot;Create New Key&quot;.</li>
              <li>Copy and securely store your API key.</li>
            </ol>
            <p><strong className="font-semibold text-ink">Important:</strong></p>
            <ul className="list-disc list-outside space-y-2 pl-5 md:ml-6 md:pl-0">
              <li>API access requires an active subscription or LTD plan.</li>
              <li>Free users and one-time purchase users cannot access the API.</li>
              <li>Keep your API key secure and never share it publicly.</li>
            </ul>
          </DocSection>

          <DocSection id="file-upload-workflow" title="File Upload Workflow" className="md:-mt-4">
            <p>The OpenAPI supports two ways to provide files for transcription:</p>
            <DocHeading id="option-1-upload-files-directly">Option 1: Upload Files Directly</DocHeading>
            <ol className="list-decimal space-y-1 pl-5">
              <li><strong>Get Upload URLs:</strong> Call <code>/api/v1/files/upload-url</code> to get pre-signed URLs</li>
              <li><strong>Upload File:</strong> Use the upload URL to upload your file directly to our storage</li>
              <li><strong>Create Transcription:</strong> Use the returned <code>file_key</code> to create a transcription</li>
            </ol>
            <DocHeading id="option-2-external-file-urls">Option 2: External File URLs</DocHeading>
            <p>Provide a publicly accessible file URL for transcription.</p>
            <p>Requirements for both options:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>File must be in a supported format</li>
              <li>File size must not exceed 5GB</li>
              <li>File duration must not exceed 10 hours</li>
            </ul>
            <p>Additional requirements for external URLs:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>File must be publicly accessible via HTTP/HTTPS and downloadable.</li>
              <li>YouTube URLs are not supported (use the dedicated YouTube endpoint instead)</li>
            </ul>
          </DocSection>

          <DocSection id="endpoints" title="Endpoints">
            <DocHeading id="1-get-file-upload-urls">1. Get File Upload URLs</DocHeading>
            <p><strong>Endpoint:</strong> <code>POST /api/v1/files/upload-url</code></p>
            <p><strong>Description:</strong> Generate pre-signed URLs for uploading files directly to our storage</p>
            <p><strong>Request:</strong></p>
            <CodeBlock>{`POST /api/v1/files/upload-url
Content-Type: application/json
X-API-Key: your_api_key

{
  "filename": "my-audio.mp3",
  "file_size": 1048576,
  "upload_expires_in": 3600,
  "download_expires_in": 1800
}`}</CodeBlock>
            <p><strong>Parameters:</strong></p>
            <ul className="list-disc space-y-1 pl-5">
              <li><code>filename</code> (string, required): Name of the file to upload</li>
              <li><code>file_size</code> (integer, required): Size of the file in bytes</li>
              <li><code>upload_expires_in</code> (integer, optional): Upload URL expiration time in seconds (default: 3600, max: 86400)</li>
              <li><code>download_expires_in</code> (integer, optional): Download URL expiration time in seconds (default: 1800, max: 7200)</li>
            </ul>
            <p><strong>Response:</strong></p>
            <CodeBlock>{`{
  "success": true,
  "data": {
    "upload_url": "https://r2.cloudflare.com/bucket/12345-abc123.mp3?X-Amz-Signature=...",
    "download_url": "https://r2.cloudflare.com/bucket/12345-abc123.mp3?X-Amz-Signature=...",
    "file_key": "12345-abc123def456.mp3",
    "upload_expires_at": "2024-01-16T11:30:00Z",
    "download_expires_at": "2024-01-16T10:30:00Z"
  },
  "message": "Success",
  "timestamp": "2024-01-15T10:30:00Z"
}`}</CodeBlock>
            <p><strong>Usage:</strong></p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Call this endpoint to get upload URLs</li>
              <li>Use the <code>upload_url</code> to upload your file (PUT request with file content)</li>
              <li>Use the <code>file_key</code> to create a transcription task</li>
            </ol>

            <DocHeading id="2-create-transcription">2. Create Transcription</DocHeading>
            <p><strong>Endpoint:</strong> <code>POST /api/v1/transcriptions</code></p>
            <p><strong>Description:</strong> Create a new transcription task from an uploaded file or external URL</p>
            <p><strong>Request Options:</strong></p>
            <p><strong>Option 1: Using uploaded file</strong></p>
            <CodeBlock>{`POST /api/v1/transcriptions
Content-Type: application/json
X-API-Key: your_api_key

{
  "file_key": "12345-abc123def456.mp3",
  "filename": "my_audio_file.mp3",
  "language_code": "en",
  "transcription_type": "transcript",
  "enable_speaker_diarization": false,
  "webhook_url": "https://your-webhook-url.com"
}`}</CodeBlock>
            <p><strong>Option 2: Using external file URL</strong></p>
            <CodeBlock>{`POST /api/v1/transcriptions
Content-Type: application/json
X-API-Key: your_api_key

{
  "file_url": "https://your-storage.com/audio.mp3",
  "filename": "my-audio-file.mp3",
  "language_code": "en",
  "transcription_type": "transcript",
  "enable_speaker_diarization": false,
  "webhook_url": "https://your-webhook-url.com"
}`}</CodeBlock>
            <p><strong>Parameters:</strong></p>
            <ul className="min-h-[340px] list-disc space-y-1 pl-5">
              <li><code>file_key</code> (string, required if <code>file_url</code> not provided): File key from upload API</li>
              <li><code>file_url</code> (string, required if <code>file_key</code> not provided): Public URL to audio/video file (Note: YouTube URLs are not supported here, use <code>/api/v1/transcriptions/youtube</code> instead)</li>
              <li><code>filename</code> (string, optional, but recommended): Custom filename for the transcription. If not provided:
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>For uploaded files: filename will be extracted from the <code>file_key</code></li>
                  <li>For URL downloads: filename will be extracted from the URL path</li>
                </ul>
              </li>
              <li><code>language_code</code> (string, required): Language code (e.g., &quot;en&quot;, &quot;zh&quot;, &quot;es&quot;), see Language Support</li>
              <li><code>transcription_type</code> (string, optional): &quot;transcript&quot; or &quot;subtitle&quot;</li>
              <li><code>enable_speaker_diarization</code> (boolean, optional): Enable speaker identification</li>
              <li><code>webhook_url</code> (string, optional): URL to receive completion notifications</li>
            </ul>
            <p><strong>Note:</strong> You must provide either <code>file_key</code> OR <code>file_url</code>, but not both.</p>
            <p><strong>Supported File Types:</strong></p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Audio: mp3, mpeg, mpga, m4a, wav, aac, ogg, opus, flac</li>
              <li>Video: mp4, webm, mov (audio will be extracted)</li>
            </ul>
            <p><strong>Response:</strong></p>
            <CodeBlock>{`{
  "success": true,
  "data": {
    "id": "1234567890",
    "status": "queued",
    "created_at": "2024-01-15T10:30:00Z"
  }
}`}</CodeBlock>
            <p><strong>Status Values:</strong></p>
            <ul className="min-h-[162px] list-disc space-y-1 pl-5">
              <li><code>queued</code>: Task is queued for processing</li>
              <li><code>preprocessing</code>: Media file is being preprocessed (for large files or youtube videos)</li>
              <li><code>processing</code>: Transcription is in progress</li>
              <li><code>completed</code>: Transcription is complete</li>
              <li><code>failed</code>: Transcription failed</li>
            </ul>

            <DocHeading id="3-list-transcriptions">3. List Transcriptions</DocHeading>
            <p>Retrieve a paginated list of your transcriptions.</p>
            <p><strong>Endpoint:</strong> <code>GET /api/v1/transcriptions</code></p>
            <p><strong>Parameters:</strong></p>
            <ul className="list-disc space-y-1 pl-5">
              <li><code>cursor</code> (integer, optional): Pagination cursor</li>
              <li><code>limit</code> (integer, optional): Number of items per page (1-20, default: 10)</li>
            </ul>
            <p><strong>Example:</strong></p>
            <CodeBlock>{`GET /api/v1/transcriptions?limit=10&cursor=1234567890
X-API-Key: your_api_key`}</CodeBlock>
            <p><strong>Response:</strong></p>
            <CodeBlock>{`{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1234567890",
        "filename": "audio.mp3",
        "status": "completed",
        "duration": 120.5,
        "language_code": "en",
        "transcription_type": "transcript",
        "created_at": "2024-01-15T10:30:00Z",
        "completed_at": "2024-01-15T10:35:00Z",
        "file_size": 1048576,
        "source_type": "upload"
      }
    ],
    "has_more": true,
    "next_cursor": "1234567889"
  },
  "message": "Success",
  "timestamp": "2024-01-15T10:30:00Z"
}`}</CodeBlock>

            <DocHeading id="4-get-transcription-details">4. Get Transcription Details</DocHeading>
            <p>Retrieve detailed information and results for a specific transcription.</p>
            <p><strong>Endpoint:</strong> <code>GET /api/v1/transcriptions/{"{id}"}</code></p>
            <p><strong>Example:</strong></p>
            <CodeBlock>{`GET /api/v1/transcriptions/1234567890
X-API-Key: your_api_key`}</CodeBlock>
            <p><strong>Response:</strong></p>
            <CodeBlock>{`{
  "success": true,
  "data": {
    "id": "1234567890",
    "filename": "audio.mp3",
    "status": "completed",
    "duration": 120.5,
    "language_code": "en",
    "transcription_type": "transcript",
    "created_at": "2024-01-15T10:30:00Z",
    "completed_at": "2024-01-15T10:35:00Z",
    "file_size": 1048576,
    "source_type": "upload",
    "source_url": "https://your-storage.com/audio.mp3",
    "result": {
      "text": "Full transcript text...",
      "summary": "This audio discusses...",
      "outline": "# 1. Introduction\\n2. Main Points\\n3. Conclusion",
      "language": "English",
      "segments": [
        {
          "start": 0.0,
          "end": 5.2,
          "text": "Hello, this is a sample",
          "speaker": "A",
          "words": [
            {
              "start": 0.0,
              "end": 0.8,
              "text": "Hello"
            }
          ]
        }
      ]
    }
  },
  "message": "Success",
  "timestamp": "2024-01-15T10:30:00Z"
}`}</CodeBlock>

            <DocHeading id="5-get-transcription-status">5. Get Transcription Status</DocHeading>
            <p>Check the current status of a transcription.</p>
            <p><strong>Endpoint:</strong> <code>GET /api/v1/transcriptions/{"{id}"}/status</code></p>
            <p><strong>Example:</strong></p>
            <CodeBlock>{`GET /api/v1/transcriptions/1234567890/status
X-API-Key: your_api_key`}</CodeBlock>
            <p><strong>Response:</strong></p>
            <CodeBlock>{`{
  "success": true,
  "data": {
    "id": "1234567890",
    "status": "processing",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:33:00Z",
    "error_message": null
  },
  "message": "Success",
  "timestamp": "2024-01-15T10:30:00Z"
}`}</CodeBlock>
            <p><strong>Failed Status Response:</strong></p>
            <CodeBlock>{`{
  "success": true,
  "data": {
    "id": "1234567890",
    "status": "failed",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:32:00Z",
    "error_message": "Failed to download file from URL: Connection timeout"
  },
  "message": "Success",
  "timestamp": "2024-01-15T10:30:00Z"
}`}</CodeBlock>

            <DocHeading id="6-create-youtube-transcription">6. Create YouTube Transcription</DocHeading>
            <p>Create a transcription from a YouTube video URL.</p>
            <p><strong>Endpoint:</strong> <code>POST /api/v1/transcriptions/youtube</code></p>
            <p><strong>Request:</strong></p>
            <CodeBlock>{`POST /api/v1/transcriptions/youtube
Content-Type: application/json
X-API-Key: your_api_key

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "language_code": "en",
  "transcription_type": "transcript",
  "enable_speaker_diarization": false,
  "webhook_url": "https://your-webhook-url.com"
}`}</CodeBlock>
            <p><strong>Parameters:</strong></p>
            <ul className="list-disc space-y-1 pl-5">
              <li><code>url</code> (string, required): YouTube video URL</li>
              <li><code>language_code</code> (string, required): Language code (e.g., &quot;en&quot;, &quot;zh&quot;, &quot;es&quot;), see Language Support</li>
              <li><code>transcription_type</code> (string, optional): Type of transcription</li>
              <li><code>enable_speaker_diarization</code> (boolean, optional): Enable speaker identification</li>
              <li><code>webhook_url</code> (string, optional): Webhook URL for notifications</li>
            </ul>
            <p><strong>Note:</strong> Video title and duration are automatically extracted from the YouTube URL.</p>
            <p><strong>Response:</strong> Same format as regular transcription creation - returns task status for async processing.</p>
          </DocSection>

          <DocSection id="status-values" title="Status Values">
            <p>Transcriptions progress through the following statuses:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li><code>queued</code>: Task is queued for processing</li>
              <li><code>preprocessing</code>: Media file is being preprocessed (for large files or youtube videos)</li>
              <li><code>processing</code>: Transcription is in progress</li>
              <li><code>completed</code>: Transcription is complete</li>
              <li><code>failed</code>: Transcription failed</li>
            </ul>
          </DocSection>

          <DocSection id="webhook-notifications" title="Webhook Notifications">
            <p>When you provide a <code>webhook_url</code>, Votxt will send HTTP POST notifications to your endpoint when transcription completes or fails.</p>
            <DocHeading id="webhook-events">Webhook Events</DocHeading>
            <DocSubHeading id="transcription-completed">Transcription Completed</DocSubHeading>
            <CodeBlock>{`{
  "event": "transcription.completed",
  "data": {
    "id": "1234567890",
    "filename": "audio.mp3",
    "status": "completed",
    "duration": 120.5,
    "language_code": "en",
    "transcription_type": "transcript",
    "created_at": "2024-01-15T10:30:00Z",
    "completed_at": "2024-01-15T10:35:00Z",
    "file_size": 1048576,
    "source_type": "upload"
  },
  "timestamp": "2024-01-15T10:35:00Z"
}`}</CodeBlock>
            <DocSubHeading id="transcription-failed">Transcription Failed</DocSubHeading>
            <CodeBlock>{`{
  "event": "transcription.failed",
  "data": {
    "id": "1234567890",
    "filename": "audio.mp3",
    "status": "failed",
    "created_at": "2024-01-15T10:30:00Z",
    "completed_at": "2024-01-15T10:32:00Z",
    "error_message": "Failed to download file from URL: Connection timeout"
  },
  "timestamp": "2024-01-15T10:32:00Z"
}`}</CodeBlock>
            <DocHeading id="webhook-requirements">Webhook Requirements</DocHeading>
            <ul className="list-disc space-y-1 pl-5">
              <li>Your webhook endpoint must respond with HTTP 2xx status code</li>
              <li>Timeout: 30 seconds</li>
              <li>Include User-Agent: Votxt-Webhook/1.0 header</li>
            </ul>
          </DocSection>

          <DocSection id="error-handling" title="Error Handling">
            <DocHeading id="understanding-different-types-of-errors">Understanding Different Types of Errors</DocHeading>
            <p>Votxt API distinguishes between two types of errors that require different handling approaches:</p>
            <DocSubHeading id="1-api-call-errors">1. API Call Errors</DocSubHeading>
            <p>These occur when the API request itself fails (authentication, validation, system errors, etc.). The response will have <code>success: false</code>:</p>
            <CodeBlock>{`{
  "success": false,
  "error": {
    "message": "Invalid API Key",
    "code": 41001,
    "details": "The provided API key is not valid"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}`}</CodeBlock>
            <DocSubHeading id="2-async-task-failures">2. Async Task Failures</DocSubHeading>
            <p>These occur when the API call succeeds but the transcription/preprocessing task fails during execution. The response will have <code>success: true</code> but <code>data.status: &quot;failed&quot;</code>:</p>
            <CodeBlock>{`{
  "success": true,
  "data": {
    "id": "1234567890",
    "status": "failed",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:32:00Z",
    "error_message": "Failed to download file from URL: Connection timeout"
  },
  "message": "Success",
  "timestamp": "2024-01-15T10:30:00Z"
}`}</CodeBlock>
            <DocHeading id="client-side-error-handling">Client-Side Error Handling</DocHeading>
            <p>Here&apos;s the recommended approach for handling both types of errors:</p>
            <DocSubHeading id="javascript-example">JavaScript Example</DocSubHeading>
            <CodeBlock>{`async function handleTranscriptionResponse(response) {
  const data = await response.json();

  // First, check if the API call itself succeeded
  if (!data.success) {
    // Handle API-level errors
    console.error("API Error:", data.error.message);
    throw new Error(\`API Error (\${data.error.code}): \${data.error.message}\`);
  }

  // API call succeeded, now check the task status
  if (data.data.status === "failed") {
    // Handle async task failures
    console.error("Transcription Failed:", data.data.error_message);
    throw new Error(\`Transcription Failed: \${data.data.error_message}\`);
  }

  // Success case
  return data.data;
}`}</CodeBlock>
            <DocSubHeading id="python-example">Python Example</DocSubHeading>
            <CodeBlock>{`def handle_transcription_response(response):
    data = response.json()

    # Check API call success
    if not data.get("success", False):
        error_info = data.get("error", {})
        raise APIError(f"API Error ({error_info.get('code')}): {error_info.get('message')}")

    # Check task status
    task_data = data.get("data", {})
    if task_data.get("status") == "failed":
        error_msg = task_data.get("error_message", "Unknown error")
        raise TranscriptionError(f"Transcription Failed: {error_msg}")

    return task_data`}</CodeBlock>
            <DocHeading id="error-response-format">Error Response Format</DocHeading>
            <p>API call errors follow this consistent format:</p>
            <CodeBlock>{`{
  "success": false,
  "error": {
    "message": "Error description",
    "code": 41000,
    "details": "Additional error details (optional)"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}`}</CodeBlock>
            <DocHeading id="common-error-codes">Common Error Codes</DocHeading>
            <DataTable headers={["HTTP Status", "Error Code", "Description"]} rows={commonErrors.map(([status, code, description]) => [status, code, description])} />
            <DocHeading id="rate-limits">Rate Limits</DocHeading>
            <ul className="list-disc space-y-1 pl-5">
              <li>Default: 60 requests per minute, 1000 requests per day</li>
              <li>Rate limits are per API key</li>
              <li>Higher limits can be discussed and adjusted based on your usage requirements. Contact <a href="mailto:support@votxt.io" className="font-semibold text-violet underline underline-offset-2">support@votxt.io</a> if you need a higher limit</li>
              <li>Exceeded limits return HTTP 429 with retry information</li>
            </ul>
          </DocSection>

          <DocSection id="supported-file-formats" title="Supported File Formats">
            <ul className="list-disc space-y-1 pl-5">
              <li>Audio: {audioFormats.join(", ")}</li>
              <li>Video: {videoFormats.join(", ")} (audio will be extracted)</li>
            </ul>
            <DocHeading id="language-support">Language Support</DocHeading>
            <p>Votxt supports 63 languages. Complete list of supported language codes:</p>
            <DataTable headers={["Language", "Code", "Language", "Code", "Language", "Code"]} rows={languageRows.map((row) => [...row])} tallRows={[2, 4, 6, 20]} />
          </DocSection>

          <DocSection id="integration-examples" title="Integration Examples">
            <DocHeading id="n8n-workflow">n8n Workflow</DocHeading>
            <ol className="min-h-[288px] list-decimal space-y-3 pl-5">
              <li>
                <strong>HTTP Request Node:</strong>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>Method: POST</li>
                  <li>URL: https://api.votxt.co/api/v1/transcriptions</li>
                  <li>Headers: X-API-Key: your_api_key</li>
                  <li>Body: JSON with file_url, optional filename, and webhook_url</li>
                </ul>
              </li>
              <li>
                <strong>Webhook Node:</strong>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>Listen for completion notifications</li>
                  <li>Process transcription results</li>
                </ul>
              </li>
            </ol>
            <DocHeading id="python-example">Python Example</DocHeading>
            <CodeBlock>{`import requests

# Create transcription
response = requests.post(
    'https://api.votxt.co/api/v1/transcriptions',
    headers={'X-API-Key': 'your_api_key'},
    json={
        'file_url': 'https://example.com/audio.mp3',
        'filename': 'my-recording.mp3',
        'language_code': 'en',
        'webhook_url': 'https://your-app.com/webhook'
    }
)

transcription = response.json()
transcription_id = transcription['data']['id']

# Check status
status_response = requests.get(
    f'https://api.votxt.co/api/v1/transcriptions/{transcription_id}/status',
    headers={'X-API-Key': 'your_api_key'}
)

print(status_response.json())`}</CodeBlock>
            <DocHeading id="curl-examples">cURL Examples</DocHeading>
            <CodeBlock>{`# 1. Get upload URLs
curl -X POST https://api.votxt.co/api/v1/files/upload-url \\
  -H "X-API-Key: your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "filename": "audio.mp3",
    "file_size": 1048576,
    "upload_expires_in": 3600,
    "download_expires_in": 1800
  }'

# 2. Upload file using the returned upload_url
curl -X PUT "https://r2.cloudflare.com/bucket/12345-abc123.mp3?X-Amz-Signature=..." \\
  -H "Content-Type: audio/mpeg" \\
  --data-binary @audio.mp3

# 3. Create transcription using file_key
curl -X POST https://api.votxt.co/api/v1/transcriptions \\
  -H "X-API-Key: your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "file_key": "12345-abc123def456.mp3",
    "language_code": "en",
    "webhook_url": "https://your-webhook.com"
  }'

# Alternative: Create transcription from external URL
curl -X POST https://api.votxt.co/api/v1/transcriptions \\
  -H "X-API-Key: your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "file_url": "https://example.com/audio.mp3",
    "filename": "my-audio.mp3",
    "language_code": "en",
    "webhook_url": "https://your-webhook.com"
  }'

# Get transcription results
curl -X GET https://api.votxt.co/api/v1/transcriptions/1234567890 \\
  -H "X-API-Key: your_api_key"`}</CodeBlock>
          </DocSection>

          <DocSection id="best-practices" title="Best Practices" className="md:-mt-4">
            <ol className="min-h-[684px] list-decimal space-y-3 pl-5">
              <li>
                <strong>File Upload Strategy:</strong>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>Use direct file upload (/api/v1/files/upload-url) for better performance and reliability</li>
                  <li>External URLs are suitable for files already hosted elsewhere</li>
                  <li>Set appropriate expiration times for upload URLs (shorter is more secure)</li>
                </ul>
              </li>
              <li><strong>Webhook Reliability:</strong> Always implement webhook endpoints with proper error handling and idempotency</li>
              <li><strong>File Size:</strong> Ensure files do not exceed 5GB limit</li>
              <li><strong>Language Detection:</strong> Specify <code>language_code</code> when known for better accuracy</li>
              <li><strong>Status Polling:</strong> If not using webhooks, poll status endpoint every 30-60 seconds</li>
              <li>
                <strong>Error Handling:</strong>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>Distinguish between API call errors (success: false) and task failures (success: true, status: &quot;failed&quot;)</li>
                  <li>Implement retry logic for network errors and rate limits</li>
                  <li>For task failures, check error_message for specific failure reasons</li>
                  <li>Some task failures may be retryable (network issues), others may not (invalid file format)</li>
                </ul>
              </li>
              <li>
                <strong>File Management:</strong>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>Use file_key immediately after upload to avoid expiration issues</li>
                  <li>Temporary uploaded files are automatically cleaned up after 48 hours if not used</li>
                  <li>Files used for transcription become permanent and follow normal lifecycle</li>
                </ul>
              </li>
              <li><strong>Security:</strong> Never expose API keys in client-side code or public repositories</li>
            </ol>
          </DocSection>

          <DocSection id="support" title="Support" className="md:-mt-4">
            <ul className="list-disc space-y-1 pl-5">
              <li>Support Email: <a href="mailto:support@votxt.io" className="font-semibold text-violet underline underline-offset-2">support@votxt.io</a></li>
              <li>Discord: <a href="https://discord.gg/RJTaS28UWU" className="font-semibold text-violet underline underline-offset-2">https://discord.gg/RJTaS28UWU</a></li>
            </ul>
            <p>For technical questions or integration assistance, please contact our support team.</p>
          </DocSection>
        </article>

        <aside className="hidden lg:block">
          <nav className="sticky top-24 h-fit rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-none">
            <h3 className="text-xl font-bold leading-7 text-ink">Table of Contents</h3>
            <div className="mt-4">
              <TableOfContentsLinks />
            </div>
          </nav>
        </aside>
      </section>
      </main>
      <SiteFooter />
    </>
  );
}
