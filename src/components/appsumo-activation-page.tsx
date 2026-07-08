"use client";

import {useMemo, useState} from "react";
import {useLocale} from "next-intl";
import {ArrowRight, BadgeCheck, CheckCircle2, Gift, Loader2, ShieldCheck, Sparkles, TicketCheck} from "lucide-react";
import {SiteHeader} from "@/components/site-shell";
import {isLocale, type Locale} from "@/lib/locales";

type ActivationResult = {
  activated?: boolean;
  code?: string;
  subscription?: {
    id: string;
    plan: string;
    status: string;
    monthlyMinuteQuota: number;
    remainingMinutes: number;
    maxSingleFileMinutes: number;
  };
  error?: string;
};

type PlanId = "PRO" | "STANDARD" | "BASIC";

type AppSumoCopy = {
  dashboard: string;
  badge: string;
  title: string;
  subtitle: string;
  features: readonly [string, string, string];
  codeEyebrow: string;
  redeemTitle: string;
  codeLabel: string;
  tierLegend: string;
  planDetails: Record<PlanId, string>;
  activateError: string;
  successMessage: string;
  activated: string;
  available: (minutes: string, maxMinutes: number) => string;
  activating: string;
  activateLicense: string;
  helpText: string;
};

const planOptions: Array<{id: PlanId; label: string}> = [
  {id: "PRO", label: "Pro"},
  {id: "STANDARD", label: "Standard"},
  {id: "BASIC", label: "Basic"}
];

const appSumoCopyByLocale: Record<Locale, AppSumoCopy> = {
  en: {
    dashboard: "Dashboard",
    badge: "Votxt x AppSumo",
    title: "Activate your AppSumo license",
    subtitle: "Redeem your lifetime deal code, attach it to the signed-in Votxt account, and continue to the dashboard with the AppSumo welcome flow.",
    features: ["Annual LTD quota", "Dashboard onboarding", "Secure account binding"],
    codeEyebrow: "License code",
    redeemTitle: "Redeem AppSumo",
    codeLabel: "AppSumo code",
    tierLegend: "License tier",
    planDetails: {PRO: "6,000 minutes/year compatibility grant", STANDARD: "1,800 minutes/year compatibility grant", BASIC: "600 minutes/year compatibility grant"},
    activateError: "Could not activate this AppSumo license.",
    successMessage: "License activated. Opening workspace...",
    activated: "activated",
    available: (minutes, maxMinutes) => `${minutes} minutes available. Max file length: ${maxMinutes} minutes.`,
    activating: "Activating...",
    activateLicense: "Activate license",
    helpText: "Local compatibility accepts codes beginning with AS, APPSUMO, or SUMO. If you are not signed in, Votxt will ask you to sign in first."
  },
  id: {
    dashboard: "Dashboard",
    badge: "Votxt x AppSumo",
    title: "Aktifkan lisensi AppSumo Anda",
    subtitle: "Tukarkan kode lifetime deal, hubungkan ke akun Votxt yang masuk, lalu lanjutkan ke dashboard dengan alur sambutan AppSumo.",
    features: ["Kuota LTD tahunan", "Onboarding dashboard", "Pengikatan akun aman"],
    codeEyebrow: "Kode lisensi",
    redeemTitle: "Tukarkan AppSumo",
    codeLabel: "Kode AppSumo",
    tierLegend: "Tingkat lisensi",
    planDetails: {PRO: "6.000 menit/tahun", STANDARD: "1.800 menit/tahun", BASIC: "600 menit/tahun"},
    activateError: "Tidak dapat mengaktifkan lisensi AppSumo ini.",
    successMessage: "Lisensi aktif. Membuka workspace...",
    activated: "diaktifkan",
    available: (minutes, maxMinutes) => `${minutes} menit tersedia. Durasi file maksimum: ${maxMinutes} menit.`,
    activating: "Mengaktifkan...",
    activateLicense: "Aktifkan lisensi",
    helpText: "Kompatibilitas lokal menerima kode yang diawali AS, APPSUMO, atau SUMO. Jika belum masuk, Votxt akan meminta Anda masuk terlebih dahulu."
  },
  ru: {
    dashboard: "Панель",
    badge: "Votxt x AppSumo",
    title: "Активируйте лицензию AppSumo",
    subtitle: "Введите код lifetime deal, привяжите его к текущему аккаунту Votxt и перейдите в панель с приветственным сценарием AppSumo.",
    features: ["Годовой LTD-лимит", "Онбординг в панели", "Безопасная привязка аккаунта"],
    codeEyebrow: "Код лицензии",
    redeemTitle: "Активировать AppSumo",
    codeLabel: "Код AppSumo",
    tierLegend: "Уровень лицензии",
    planDetails: {PRO: "6 000 минут в год", STANDARD: "1 800 минут в год", BASIC: "600 минут в год"},
    activateError: "Не удалось активировать эту лицензию AppSumo.",
    successMessage: "Лицензия активирована. Открываем рабочую область...",
    activated: "активирован",
    available: (minutes, maxMinutes) => `Доступно минут: ${minutes}. Максимальная длина файла: ${maxMinutes} минут.`,
    activating: "Активация...",
    activateLicense: "Активировать лицензию",
    helpText: "Локальная совместимость принимает коды, начинающиеся с AS, APPSUMO или SUMO. Если вы не вошли, Votxt сначала попросит войти."
  },
  es: {
    dashboard: "Panel",
    badge: "Votxt x AppSumo",
    title: "Activa tu licencia de AppSumo",
    subtitle: "Canjea tu código lifetime deal, vincúlalo a la cuenta Votxt iniciada y continúa al panel con el flujo de bienvenida de AppSumo.",
    features: ["Cuota LTD anual", "Onboarding del panel", "Vinculación segura de cuenta"],
    codeEyebrow: "Código de licencia",
    redeemTitle: "Canjear AppSumo",
    codeLabel: "Código AppSumo",
    tierLegend: "Nivel de licencia",
    planDetails: {PRO: "6.000 minutos/año", STANDARD: "1.800 minutos/año", BASIC: "600 minutos/año"},
    activateError: "No se pudo activar esta licencia de AppSumo.",
    successMessage: "Licencia activada. Abriendo workspace...",
    activated: "activado",
    available: (minutes, maxMinutes) => `${minutes} minutos disponibles. Duración máxima de archivo: ${maxMinutes} minutos.`,
    activating: "Activando...",
    activateLicense: "Activar licencia",
    helpText: "La compatibilidad local acepta códigos que empiezan por AS, APPSUMO o SUMO. Si no has iniciado sesión, Votxt te pedirá entrar primero."
  },
  vi: {
    dashboard: "Dashboard",
    badge: "Votxt x AppSumo",
    title: "Kích hoạt giấy phép AppSumo",
    subtitle: "Đổi mã lifetime deal, gắn mã vào tài khoản Votxt đã đăng nhập và tiếp tục tới dashboard với luồng chào mừng AppSumo.",
    features: ["Hạn mức LTD hằng năm", "Onboarding dashboard", "Liên kết tài khoản an toàn"],
    codeEyebrow: "Mã giấy phép",
    redeemTitle: "Đổi AppSumo",
    codeLabel: "Mã AppSumo",
    tierLegend: "Gói giấy phép",
    planDetails: {PRO: "6.000 phút/năm", STANDARD: "1.800 phút/năm", BASIC: "600 phút/năm"},
    activateError: "Không thể kích hoạt giấy phép AppSumo này.",
    successMessage: "Giấy phép đã kích hoạt. Đang mở workspace...",
    activated: "đã kích hoạt",
    available: (minutes, maxMinutes) => `${minutes} phút khả dụng. Độ dài tệp tối đa: ${maxMinutes} phút.`,
    activating: "Đang kích hoạt...",
    activateLicense: "Kích hoạt giấy phép",
    helpText: "Tương thích cục bộ chấp nhận mã bắt đầu bằng AS, APPSUMO hoặc SUMO. Nếu bạn chưa đăng nhập, Votxt sẽ yêu cầu đăng nhập trước."
  },
  ar: {
    dashboard: "لوحة التحكم",
    badge: "Votxt x AppSumo",
    title: "فعّل ترخيص AppSumo",
    subtitle: "استبدل رمز العرض مدى الحياة، واربطه بحساب Votxt المسجل، ثم تابع إلى اللوحة مع تجربة ترحيب AppSumo.",
    features: ["حصة LTD سنوية", "تهيئة لوحة التحكم", "ربط آمن للحساب"],
    codeEyebrow: "رمز الترخيص",
    redeemTitle: "استبدال AppSumo",
    codeLabel: "رمز AppSumo",
    tierLegend: "فئة الترخيص",
    planDetails: {PRO: "6000 دقيقة/سنة", STANDARD: "1800 دقيقة/سنة", BASIC: "600 دقيقة/سنة"},
    activateError: "تعذر تفعيل ترخيص AppSumo هذا.",
    successMessage: "تم تفعيل الترخيص. جار فتح مساحة العمل...",
    activated: "تم تفعيله",
    available: (minutes, maxMinutes) => `${minutes} دقيقة متاحة. الحد الأقصى لطول الملف: ${maxMinutes} دقيقة.`,
    activating: "جار التفعيل...",
    activateLicense: "تفعيل الترخيص",
    helpText: "تقبل بيئة التوافق المحلية الرموز التي تبدأ بـ AS أو APPSUMO أو SUMO. إذا لم تكن مسجلا، سيطلب منك Votxt تسجيل الدخول أولا."
  },
  pt: {
    dashboard: "Painel",
    badge: "Votxt x AppSumo",
    title: "Ative sua licença AppSumo",
    subtitle: "Resgate seu código lifetime deal, vincule-o à conta Votxt conectada e continue ao painel com o fluxo de boas-vindas AppSumo.",
    features: ["Cota LTD anual", "Onboarding no painel", "Vínculo seguro da conta"],
    codeEyebrow: "Código da licença",
    redeemTitle: "Resgatar AppSumo",
    codeLabel: "Código AppSumo",
    tierLegend: "Nível da licença",
    planDetails: {PRO: "6.000 minutos/ano", STANDARD: "1.800 minutos/ano", BASIC: "600 minutos/ano"},
    activateError: "Não foi possível ativar esta licença AppSumo.",
    successMessage: "Licença ativada. Abrindo workspace...",
    activated: "ativado",
    available: (minutes, maxMinutes) => `${minutes} minutos disponíveis. Duração máxima do arquivo: ${maxMinutes} minutos.`,
    activating: "Ativando...",
    activateLicense: "Ativar licença",
    helpText: "A compatibilidade local aceita códigos que começam com AS, APPSUMO ou SUMO. Se você não estiver conectado, o Votxt pedirá login primeiro."
  },
  fr: {
    dashboard: "Tableau",
    badge: "Votxt x AppSumo",
    title: "Activez votre licence AppSumo",
    subtitle: "Utilisez votre code lifetime deal, associez-le au compte Votxt connecté, puis ouvrez le tableau avec le parcours d'accueil AppSumo.",
    features: ["Quota LTD annuel", "Accueil dans le tableau", "Association de compte sécurisée"],
    codeEyebrow: "Code de licence",
    redeemTitle: "Utiliser AppSumo",
    codeLabel: "Code AppSumo",
    tierLegend: "Niveau de licence",
    planDetails: {PRO: "6 000 minutes/an", STANDARD: "1 800 minutes/an", BASIC: "600 minutes/an"},
    activateError: "Impossible d'activer cette licence AppSumo.",
    successMessage: "Licence activée. Ouverture de l'espace de travail...",
    activated: "activé",
    available: (minutes, maxMinutes) => `${minutes} minutes disponibles. Durée maximale du fichier : ${maxMinutes} minutes.`,
    activating: "Activation...",
    activateLicense: "Activer la licence",
    helpText: "La compatibilité locale accepte les codes commençant par AS, APPSUMO ou SUMO. Si vous n'êtes pas connecté, Votxt vous demandera de vous connecter."
  },
  zh: {
    dashboard: "仪表盘",
    badge: "Votxt x AppSumo",
    title: "激活你的 AppSumo 许可证",
    subtitle: "兑换你的 lifetime deal 代码，将其绑定到已登录的 Votxt 账号，然后进入带有 AppSumo 欢迎流程的仪表盘。",
    features: ["年度 LTD 额度", "仪表盘引导", "安全账号绑定"],
    codeEyebrow: "许可证代码",
    redeemTitle: "兑换 AppSumo",
    codeLabel: "AppSumo 代码",
    tierLegend: "许可证档位",
    planDetails: {PRO: "每年 6,000 分钟", STANDARD: "每年 1,800 分钟", BASIC: "每年 600 分钟"},
    activateError: "无法激活该 AppSumo 许可证。",
    successMessage: "许可证已激活，正在打开工作台...",
    activated: "已激活",
    available: (minutes, maxMinutes) => `${minutes} 分钟可用。单个文件最长：${maxMinutes} 分钟。`,
    activating: "激活中...",
    activateLicense: "激活许可证",
    helpText: "本地兼容模式接受以 AS、APPSUMO 或 SUMO 开头的代码。如果你尚未登录，Votxt 会先要求登录。"
  },
  "zh-TW": {
    dashboard: "儀表板",
    badge: "Votxt x AppSumo",
    title: "啟用你的 AppSumo 授權",
    subtitle: "兌換 lifetime deal 代碼，將其綁定到已登入的 Votxt 帳號，然後進入 AppSumo 歡迎流程。",
    features: ["年度 LTD 額度", "儀表板引導", "安全帳號綁定"],
    codeEyebrow: "授權代碼",
    redeemTitle: "兌換 AppSumo",
    codeLabel: "AppSumo 代碼",
    tierLegend: "授權級別",
    planDetails: {PRO: "每年 6,000 分鐘", STANDARD: "每年 1,800 分鐘", BASIC: "每年 600 分鐘"},
    activateError: "無法啟用此 AppSumo 授權。",
    successMessage: "授權已啟用，正在開啟工作區...",
    activated: "已啟用",
    available: (minutes, maxMinutes) => `${minutes} 分鐘可用。單一檔案最長：${maxMinutes} 分鐘。`,
    activating: "啟用中...",
    activateLicense: "啟用授權",
    helpText: "本機相容模式接受以 AS、APPSUMO 或 SUMO 開頭的代碼。如果你尚未登入，Votxt 會先要求登入。"
  },
  de: {
    dashboard: "Dashboard",
    badge: "Votxt x AppSumo",
    title: "AppSumo-Lizenz aktivieren",
    subtitle: "Löse deinen Lifetime-Deal-Code ein, verknüpfe ihn mit dem angemeldeten Votxt-Konto und öffne das Dashboard mit dem AppSumo-Willkommensfluss.",
    features: ["Jährliches LTD-Kontingent", "Dashboard-Onboarding", "Sichere Kontoverknüpfung"],
    codeEyebrow: "Lizenzcode",
    redeemTitle: "AppSumo einlösen",
    codeLabel: "AppSumo-Code",
    tierLegend: "Lizenzstufe",
    planDetails: {PRO: "6.000 Minuten/Jahr", STANDARD: "1.800 Minuten/Jahr", BASIC: "600 Minuten/Jahr"},
    activateError: "Diese AppSumo-Lizenz konnte nicht aktiviert werden.",
    successMessage: "Lizenz aktiviert. Arbeitsbereich wird geöffnet...",
    activated: "aktiviert",
    available: (minutes, maxMinutes) => `${minutes} Minuten verfügbar. Maximale Dateilänge: ${maxMinutes} Minuten.`,
    activating: "Aktivierung...",
    activateLicense: "Lizenz aktivieren",
    helpText: "Die lokale Kompatibilität akzeptiert Codes, die mit AS, APPSUMO oder SUMO beginnen. Wenn du nicht angemeldet bist, fordert Votxt zuerst die Anmeldung an."
  },
  it: {
    dashboard: "Dashboard",
    badge: "Votxt x AppSumo",
    title: "Attiva la tua licenza AppSumo",
    subtitle: "Riscatta il codice lifetime deal, collegalo all'account Votxt connesso e continua al dashboard con il flusso di benvenuto AppSumo.",
    features: ["Quota LTD annuale", "Onboarding dashboard", "Collegamento account sicuro"],
    codeEyebrow: "Codice licenza",
    redeemTitle: "Riscatta AppSumo",
    codeLabel: "Codice AppSumo",
    tierLegend: "Livello licenza",
    planDetails: {PRO: "6.000 minuti/anno", STANDARD: "1.800 minuti/anno", BASIC: "600 minuti/anno"},
    activateError: "Impossibile attivare questa licenza AppSumo.",
    successMessage: "Licenza attivata. Apertura workspace...",
    activated: "attivato",
    available: (minutes, maxMinutes) => `${minutes} minuti disponibili. Durata massima file: ${maxMinutes} minuti.`,
    activating: "Attivazione...",
    activateLicense: "Attiva licenza",
    helpText: "La compatibilità locale accetta codici che iniziano con AS, APPSUMO o SUMO. Se non hai effettuato l'accesso, Votxt ti chiederà prima di accedere."
  },
  th: {
    dashboard: "แดชบอร์ด",
    badge: "Votxt x AppSumo",
    title: "เปิดใช้งานใบอนุญาต AppSumo",
    subtitle: "แลกรหัส lifetime deal ผูกเข้ากับบัญชี Votxt ที่เข้าสู่ระบบ แล้วไปยังแดชบอร์ดพร้อมขั้นตอนต้อนรับ AppSumo",
    features: ["โควตา LTD รายปี", "การเริ่มต้นใช้งานแดชบอร์ด", "ผูกบัญชีอย่างปลอดภัย"],
    codeEyebrow: "รหัสใบอนุญาต",
    redeemTitle: "แลก AppSumo",
    codeLabel: "รหัส AppSumo",
    tierLegend: "ระดับใบอนุญาต",
    planDetails: {PRO: "6,000 นาที/ปี", STANDARD: "1,800 นาที/ปี", BASIC: "600 นาที/ปี"},
    activateError: "ไม่สามารถเปิดใช้งานใบอนุญาต AppSumo นี้ได้",
    successMessage: "เปิดใช้งานใบอนุญาตแล้ว กำลังเปิดพื้นที่ทำงาน...",
    activated: "เปิดใช้งานแล้ว",
    available: (minutes, maxMinutes) => `ใช้ได้ ${minutes} นาที ความยาวไฟล์สูงสุด: ${maxMinutes} นาที`,
    activating: "กำลังเปิดใช้งาน...",
    activateLicense: "เปิดใช้งานใบอนุญาต",
    helpText: "โหมดเข้ากันได้ในเครื่องรับรหัสที่ขึ้นต้นด้วย AS, APPSUMO หรือ SUMO หากยังไม่ได้เข้าสู่ระบบ Votxt จะขอให้เข้าสู่ระบบก่อน"
  },
  uk: {
    dashboard: "Панель",
    badge: "Votxt x AppSumo",
    title: "Активуйте ліцензію AppSumo",
    subtitle: "Активуйте код lifetime deal, прив'яжіть його до поточного акаунта Votxt і перейдіть до панелі з вітальним сценарієм AppSumo.",
    features: ["Річний LTD-ліміт", "Онбординг у панелі", "Безпечна прив'язка акаунта"],
    codeEyebrow: "Код ліцензії",
    redeemTitle: "Активувати AppSumo",
    codeLabel: "Код AppSumo",
    tierLegend: "Рівень ліцензії",
    planDetails: {PRO: "6 000 хвилин/рік", STANDARD: "1 800 хвилин/рік", BASIC: "600 хвилин/рік"},
    activateError: "Не вдалося активувати цю ліцензію AppSumo.",
    successMessage: "Ліцензію активовано. Відкриваємо робочу область...",
    activated: "активовано",
    available: (minutes, maxMinutes) => `Доступно хвилин: ${minutes}. Максимальна тривалість файлу: ${maxMinutes} хвилин.`,
    activating: "Активація...",
    activateLicense: "Активувати ліцензію",
    helpText: "Локальна сумісність приймає коди, що починаються з AS, APPSUMO або SUMO. Якщо ви не ввійшли, Votxt спочатку попросить увійти."
  },
  tr: {
    dashboard: "Panel",
    badge: "Votxt x AppSumo",
    title: "AppSumo lisansını etkinleştir",
    subtitle: "Lifetime deal kodunu kullan, oturum açmış Votxt hesabına bağla ve AppSumo karşılama akışıyla panele devam et.",
    features: ["Yıllık LTD kotası", "Panel onboarding", "Güvenli hesap bağlama"],
    codeEyebrow: "Lisans kodu",
    redeemTitle: "AppSumo kullan",
    codeLabel: "AppSumo kodu",
    tierLegend: "Lisans seviyesi",
    planDetails: {PRO: "6.000 dakika/yıl", STANDARD: "1.800 dakika/yıl", BASIC: "600 dakika/yıl"},
    activateError: "Bu AppSumo lisansı etkinleştirilemedi.",
    successMessage: "Lisans etkinleştirildi. Çalışma alanı açılıyor...",
    activated: "etkinleştirildi",
    available: (minutes, maxMinutes) => `${minutes} dakika kullanılabilir. Maksimum dosya uzunluğu: ${maxMinutes} dakika.`,
    activating: "Etkinleştiriliyor...",
    activateLicense: "Lisansı etkinleştir",
    helpText: "Yerel uyumluluk AS, APPSUMO veya SUMO ile başlayan kodları kabul eder. Oturum açmadıysan Votxt önce giriş yapmanı ister."
  },
  ja: {
    dashboard: "ダッシュボード",
    badge: "Votxt x AppSumo",
    title: "AppSumo ライセンスを有効化",
    subtitle: "Lifetime deal コードを引き換え、ログイン中の Votxt アカウントに紐付けて、AppSumo のウェルカムフロー付きでダッシュボードへ進みます。",
    features: ["年間 LTD クォータ", "ダッシュボード案内", "安全なアカウント連携"],
    codeEyebrow: "ライセンスコード",
    redeemTitle: "AppSumo を引き換え",
    codeLabel: "AppSumo コード",
    tierLegend: "ライセンス階層",
    planDetails: {PRO: "年間 6,000 分", STANDARD: "年間 1,800 分", BASIC: "年間 600 分"},
    activateError: "この AppSumo ライセンスを有効化できませんでした。",
    successMessage: "ライセンスを有効化しました。ワークスペースを開いています...",
    activated: "有効化済み",
    available: (minutes, maxMinutes) => `${minutes} 分利用可能。最大ファイル長: ${maxMinutes} 分。`,
    activating: "有効化中...",
    activateLicense: "ライセンスを有効化",
    helpText: "ローカル互換では AS、APPSUMO、SUMO で始まるコードを受け付けます。未ログインの場合、Votxt は先にログインを求めます。"
  },
  nl: {
    dashboard: "Dashboard",
    badge: "Votxt x AppSumo",
    title: "Activeer je AppSumo-licentie",
    subtitle: "Wissel je lifetime deal-code in, koppel deze aan het ingelogde Votxt-account en ga door naar het dashboard met de AppSumo-welkomstflow.",
    features: ["Jaarlijkse LTD-quota", "Dashboard-onboarding", "Veilige accountkoppeling"],
    codeEyebrow: "Licentiecode",
    redeemTitle: "AppSumo inwisselen",
    codeLabel: "AppSumo-code",
    tierLegend: "Licentieniveau",
    planDetails: {PRO: "6.000 minuten/jaar", STANDARD: "1.800 minuten/jaar", BASIC: "600 minuten/jaar"},
    activateError: "Deze AppSumo-licentie kon niet worden geactiveerd.",
    successMessage: "Licentie geactiveerd. Workspace wordt geopend...",
    activated: "geactiveerd",
    available: (minutes, maxMinutes) => `${minutes} minuten beschikbaar. Maximale bestandslengte: ${maxMinutes} minuten.`,
    activating: "Activeren...",
    activateLicense: "Licentie activeren",
    helpText: "Lokale compatibiliteit accepteert codes die beginnen met AS, APPSUMO of SUMO. Als je niet bent ingelogd, vraagt Votxt je eerst in te loggen."
  },
  pl: {
    dashboard: "Panel",
    badge: "Votxt x AppSumo",
    title: "Aktywuj licencję AppSumo",
    subtitle: "Wykorzystaj kod lifetime deal, przypisz go do zalogowanego konta Votxt i przejdź do panelu z powitaniem AppSumo.",
    features: ["Roczny limit LTD", "Onboarding panelu", "Bezpieczne powiązanie konta"],
    codeEyebrow: "Kod licencji",
    redeemTitle: "Wykorzystaj AppSumo",
    codeLabel: "Kod AppSumo",
    tierLegend: "Poziom licencji",
    planDetails: {PRO: "6 000 minut/rok", STANDARD: "1 800 minut/rok", BASIC: "600 minut/rok"},
    activateError: "Nie udało się aktywować tej licencji AppSumo.",
    successMessage: "Licencja aktywowana. Otwieranie workspace...",
    activated: "aktywowany",
    available: (minutes, maxMinutes) => `${minutes} minut dostępne. Maksymalna długość pliku: ${maxMinutes} minut.`,
    activating: "Aktywowanie...",
    activateLicense: "Aktywuj licencję",
    helpText: "Lokalna zgodność akceptuje kody zaczynające się od AS, APPSUMO lub SUMO. Jeśli nie jesteś zalogowany, Votxt poprosi najpierw o logowanie."
  },
  ko: {
    dashboard: "대시보드",
    badge: "Votxt x AppSumo",
    title: "AppSumo 라이선스 활성화",
    subtitle: "Lifetime deal 코드를 사용하고 로그인된 Votxt 계정에 연결한 뒤 AppSumo 환영 흐름과 함께 대시보드로 이동하세요.",
    features: ["연간 LTD 할당량", "대시보드 온보딩", "안전한 계정 연결"],
    codeEyebrow: "라이선스 코드",
    redeemTitle: "AppSumo 사용",
    codeLabel: "AppSumo 코드",
    tierLegend: "라이선스 등급",
    planDetails: {PRO: "연 6,000분", STANDARD: "연 1,800분", BASIC: "연 600분"},
    activateError: "이 AppSumo 라이선스를 활성화할 수 없습니다.",
    successMessage: "라이선스가 활성화되었습니다. 워크스페이스를 여는 중...",
    activated: "활성화됨",
    available: (minutes, maxMinutes) => `${minutes}분 사용 가능. 최대 파일 길이: ${maxMinutes}분.`,
    activating: "활성화 중...",
    activateLicense: "라이선스 활성화",
    helpText: "로컬 호환 모드는 AS, APPSUMO 또는 SUMO로 시작하는 코드를 허용합니다. 로그인하지 않은 경우 Votxt가 먼저 로그인을 요청합니다."
  },
  hu: {
    dashboard: "Irányítópult",
    badge: "Votxt x AppSumo",
    title: "AppSumo-licenc aktiválása",
    subtitle: "Váltsd be lifetime deal kódodat, kösd a bejelentkezett Votxt-fiókhoz, majd folytasd az irányítópulton az AppSumo üdvözlő folyamattal.",
    features: ["Éves LTD kvóta", "Irányítópult onboarding", "Biztonságos fiókkapcsolás"],
    codeEyebrow: "Licenckód",
    redeemTitle: "AppSumo beváltása",
    codeLabel: "AppSumo-kód",
    tierLegend: "Licencszint",
    planDetails: {PRO: "6 000 perc/év", STANDARD: "1 800 perc/év", BASIC: "600 perc/év"},
    activateError: "Nem sikerült aktiválni ezt az AppSumo-licencet.",
    successMessage: "Licenc aktiválva. Munkaterület megnyitása...",
    activated: "aktiválva",
    available: (minutes, maxMinutes) => `${minutes} perc elérhető. Maximális fájlhossz: ${maxMinutes} perc.`,
    activating: "Aktiválás...",
    activateLicense: "Licenc aktiválása",
    helpText: "A helyi kompatibilitás elfogadja az AS, APPSUMO vagy SUMO kezdetű kódokat. Ha nem vagy bejelentkezve, a Votxt először bejelentkezést kér."
  }
};

function getAppSumoCopy(locale: string) {
  return appSumoCopyByLocale[isLocale(locale) ? locale : "en"];
}

export function AppSumoActivationPage() {
  const locale = useLocale();
  const text = getAppSumoCopy(locale);
  const [code, setCode] = useState("");
  const [plan, setPlan] = useState<(typeof planOptions)[number]["id"]>("PRO");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ActivationResult | null>(null);

  const normalizedCode = useMemo(() => code.trim().toUpperCase(), [code]);

  async function submitActivation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setResult(null);

    try {
      const response = await fetch("/auth/appsumo/activate", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({code: normalizedCode, plan})
      });
      const data = (await response.json().catch(() => ({}))) as ActivationResult;
      if (response.status === 401) {
        window.location.href = `/${locale}/auth/signin?next=${encodeURIComponent(`/${locale}/auth/appsumo`)}`;
        return;
      }
      if (!response.ok || !data.activated) {
        throw new Error(data.error ?? text.activateError);
      }
      localStorage.setItem("appsumo_onboarding_needed", "true");
      setResult(data);
      setMessage(text.successMessage);
      window.setTimeout(() => {
        window.location.href = `/${locale}/dashboard`;
      }, 1200);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/10 via-white to-violet/10 text-ink">
      <SiteHeader primaryCta={{href: `/${locale}/dashboard`, label: text.dashboard, icon: <ArrowRight size={16} />}} />
      <section className="px-4 pb-16 pt-32 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet/20 bg-white px-3 py-1.5 text-sm font-black text-violet shadow-soft">
              <TicketCheck size={16} />
              {text.badge}
            </div>
            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight text-ink md:text-5xl">{text.title}</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-ink/65">
              {text.subtitle}
            </p>
            <div className="mt-8 grid gap-3 text-sm font-bold text-ink/70 sm:grid-cols-3">
              {[
                [text.features[0], Gift],
                [text.features[1], Sparkles],
                [text.features[2], ShieldCheck]
              ].map(([label, Icon]) => (
                <div key={label as string} className="rounded-lg border border-ink/10 bg-white/80 p-4 shadow-soft">
                  <Icon className="mb-3 text-violet" size={22} />
                  {label as string}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={submitActivation} className="rounded-xl border border-ink/10 bg-white p-5 shadow-card md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-violet">{text.codeEyebrow}</p>
                <h2 className="mt-1 text-2xl font-black text-ink">{text.redeemTitle}</h2>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-violet/10 text-violet">
                <BadgeCheck size={23} />
              </span>
            </div>

            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-black text-ink/70">{text.codeLabel}</span>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="field text-base font-black uppercase tracking-wide"
                placeholder="APPSUMO-XXXX-XXXX"
                autoComplete="off"
                required
              />
            </label>

            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-black text-ink/70">{text.tierLegend}</legend>
              <div className="grid gap-2">
                {planOptions.map((option) => (
                  <label key={option.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-ink/10 bg-paper/50 p-3 transition hover:border-violet/30 hover:bg-violet/5">
                    <input type="radio" name="plan" value={option.id} checked={plan === option.id} onChange={() => setPlan(option.id)} className="sr-only" />
                    <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border transition ${plan === option.id ? "border-violet" : "border-ink/20 bg-white"}`} aria-hidden="true">
                      <span className={`h-2 w-2 rounded-full bg-violet transition ${plan === option.id ? "opacity-100" : "opacity-0"}`} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-black text-ink">{option.label}</span>
                      <span className="block text-xs font-bold text-ink/55">{text.planDetails[option.id]}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {message ? (
              <div className={`mt-5 rounded-lg border px-4 py-3 text-sm font-bold ${result?.activated ? "border-sage/25 bg-sage/10 text-sage" : "border-coral/30 bg-coral/10 text-coral"}`}>
                {message}
              </div>
            ) : null}

            {result?.subscription ? (
              <div className="mt-5 rounded-lg border border-violet/15 bg-violet/5 p-4 text-sm text-ink/70">
                <p className="flex items-center gap-2 font-black text-ink">
                  <CheckCircle2 size={17} className="text-violet" />
                  {result.subscription.plan} {text.activated}
                </p>
                <p className="mt-2 font-bold">{text.available(result.subscription.remainingMinutes.toLocaleString(), result.subscription.maxSingleFileMinutes)}</p>
              </div>
            ) : null}

            <button disabled={busy || normalizedCode.length < 3} className="btn-primary mt-6 w-full text-base">
              {busy ? <Loader2 size={18} className="animate-spin" /> : <TicketCheck size={18} />}
              {busy ? text.activating : text.activateLicense}
            </button>

            <p className="mt-4 text-xs font-bold leading-5 text-ink/50">
              {text.helpText}
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
