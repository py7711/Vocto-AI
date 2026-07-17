import {notFound} from "next/navigation";
import {ArrowLeft, Download, Network, Sparkles, Star} from "lucide-react";
import {MediaPlayer, MediaSeekButton} from "@/components/media-player";
import {ShareExportLinks} from "@/components/share-export-links";
import {SharedTranslationPanel} from "@/components/shared-translation-panel";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import {transcriptText} from "@/lib/transcript-content";
import {transcriptTranslationEntries} from "@/lib/transcript-translations";
import {WorkspaceLanguageSwitcher} from "@/components/workspace/sidebar";
import {isLocale, type Locale} from "@/lib/locales";
import {getPublicShare} from "@/lib/share-links";

type Segment = {start: number; end: number; text: string; speaker?: string};
type SummaryEntry = string | {text?: string; label?: string};

type ShareCopy = {
  eyebrow: string;
  fallbackTitle: string;
  accessed: (count: number) => string;
  back: string;
  export: string;
  fullTranscript: string;
  summary: string;
  noSummary: string;
  translation: string;
  noTranslation: string;
  translationLanguage: string;
  loadingTranslation: string;
  translationReadError: string;
  autoLanguage: string;
  segments: string;
  segmentCount: (count: number) => string;
  speakerFallback: string;
  quality: string;
  ratingStar: (index: number) => string;
  noSegments: string;
};

const shareCopy: Record<Locale, ShareCopy> = {
  ar: {
    eyebrow: "مشاركة Votxt",
    fallbackTitle: "نص مشترك",
    accessed: (count: number) => `${count} مشاهدة`,
    back: "رجوع",
    export: "تصدير",
    fullTranscript: "النص",
    summary: "الملخص",
    noSummary: "لا تحتوي هذه المشاركة على ملخص بعد.",
    translation: "الترجمة",
    noTranslation: "لا تحتوي هذه المشاركة على ترجمة بعد.",
    translationLanguage: "لغة الترجمة",
    loadingTranslation: "جارٍ تحميل الترجمة...",
    translationReadError: "تعذرت قراءة الترجمة.",
    autoLanguage: "تلقائي",
    segments: "المقاطع",
    segmentCount: (count: number) => `${count} مقاطع بطوابع زمنية`,
    speakerFallback: "المتحدث 1",
    quality: "قيّم جودة النص:",
    ratingStar: (index: number) => `نجمة التقييم ${index}`,
    noSegments: "لا توجد مقاطع بطوابع زمنية حتى الآن."
  },
  de: {
    eyebrow: "Votxt-Freigabe",
    fallbackTitle: "Geteiltes Transkript",
    accessed: (count: number) => `${count} Aufruf${count === 1 ? "" : "e"}`,
    back: "Zurück",
    export: "Exportieren",
    fullTranscript: "Transkript",
    summary: "Zusammenfassung",
    noSummary: "Diese Freigabe enthält noch keine Zusammenfassung.",
    translation: "Übersetzung",
    noTranslation: "Diese Freigabe enthält noch keine Übersetzung.",
    translationLanguage: "Übersetzungssprache",
    loadingTranslation: "Übersetzung wird geladen...",
    translationReadError: "Übersetzung konnte nicht gelesen werden.",
    autoLanguage: "automatisch",
    segments: "Segmente",
    segmentCount: (count: number) => `${count} Segmente mit Zeitstempel`,
    speakerFallback: "Sprecher 1",
    quality: "Transkriptqualität bewerten:",
    ratingStar: (index: number) => `Bewertungsstern ${index}`,
    noSegments: "Noch keine Segmente mit Zeitstempel verfügbar."
  },
  en: {
    eyebrow: "Votxt Share",
    fallbackTitle: "Shared transcription",
    accessed: (count: number) => `${count} view${count === 1 ? "" : "s"}`,
    back: "Back",
    export: "Export",
    fullTranscript: "Transcript",
    summary: "Summary",
    noSummary: "This share does not include a summary yet.",
    translation: "Translation",
    noTranslation: "This share does not include a translation yet.",
    translationLanguage: "Translation language",
    loadingTranslation: "Loading translation...",
    translationReadError: "Unable to read translation.",
    autoLanguage: "auto",
    segments: "Segments",
    segmentCount: (count: number) => `${count} timestamped segment${count === 1 ? "" : "s"}`,
    speakerFallback: "Speaker 1",
    quality: "Rate transcript quality:",
    ratingStar: (index: number) => `Rating star ${index}`,
    noSegments: "No timestamped segments are available yet."
  },
  es: {
    eyebrow: "Compartir Votxt",
    fallbackTitle: "Transcripción compartida",
    accessed: (count: number) => `${count} vista${count === 1 ? "" : "s"}`,
    back: "Volver",
    export: "Exportar",
    fullTranscript: "Transcripción",
    summary: "Resumen",
    noSummary: "Este enlace aún no incluye un resumen.",
    translation: "Traducción",
    noTranslation: "Este enlace aún no incluye una traducción.",
    translationLanguage: "Idioma de traducción",
    loadingTranslation: "Cargando traducción...",
    translationReadError: "No se pudo leer la traducción.",
    autoLanguage: "automático",
    segments: "Segmentos",
    segmentCount: (count: number) => `${count} segmentos con marca de tiempo`,
    speakerFallback: "Hablante 1",
    quality: "Valora la calidad de la transcripción:",
    ratingStar: (index: number) => `Estrella de valoración ${index}`,
    noSegments: "Aún no hay segmentos con marca de tiempo."
  },
  fr: {
    eyebrow: "Partage Votxt",
    fallbackTitle: "Transcription partagée",
    accessed: (count: number) => `${count} vue${count === 1 ? "" : "s"}`,
    back: "Retour",
    export: "Exporter",
    fullTranscript: "Transcription",
    summary: "Résumé",
    noSummary: "Ce partage ne contient pas encore de résumé.",
    translation: "Traduction",
    noTranslation: "Ce partage ne contient pas encore de traduction.",
    translationLanguage: "Langue de traduction",
    loadingTranslation: "Chargement de la traduction...",
    translationReadError: "Impossible de lire la traduction.",
    autoLanguage: "auto",
    segments: "Segments",
    segmentCount: (count: number) => `${count} segments horodatés`,
    speakerFallback: "Intervenant 1",
    quality: "Noter la qualité de la transcription :",
    ratingStar: (index: number) => `Étoile de note ${index}`,
    noSegments: "Aucun segment horodaté n'est encore disponible."
  },
  hu: {
    eyebrow: "Votxt megosztás",
    fallbackTitle: "Megosztott átirat",
    accessed: (count: number) => `${count} megtekintés`,
    back: "Vissza",
    export: "Exportálás",
    fullTranscript: "Átirat",
    summary: "Összefoglaló",
    noSummary: "Ez a megosztás még nem tartalmaz összefoglalót.",
    translation: "Fordítás",
    noTranslation: "Ez a megosztás még nem tartalmaz fordítást.",
    translationLanguage: "Fordítás nyelve",
    loadingTranslation: "Fordítás betöltése...",
    translationReadError: "A fordítás nem olvasható.",
    autoLanguage: "automatikus",
    segments: "Szegmensek",
    segmentCount: (count: number) => `${count} időbélyeges szegmens`,
    speakerFallback: "Beszélő 1",
    quality: "Átirat minőségének értékelése:",
    ratingStar: (index: number) => `${index}. értékelő csillag`,
    noSegments: "Még nincsenek időbélyeges szegmensek."
  },
  id: {
    eyebrow: "Bagikan Votxt",
    fallbackTitle: "Transkripsi bersama",
    accessed: (count: number) => `${count} tayangan`,
    back: "Kembali",
    export: "Ekspor",
    fullTranscript: "Transkrip",
    summary: "Ringkasan",
    noSummary: "Bagikan ini belum memiliki ringkasan.",
    translation: "Terjemahan",
    noTranslation: "Bagikan ini belum memiliki terjemahan.",
    translationLanguage: "Bahasa terjemahan",
    loadingTranslation: "Memuat terjemahan...",
    translationReadError: "Tidak dapat membaca terjemahan.",
    autoLanguage: "otomatis",
    segments: "Segmen",
    segmentCount: (count: number) => `${count} segmen bertanda waktu`,
    speakerFallback: "Pembicara 1",
    quality: "Nilai kualitas transkrip:",
    ratingStar: (index: number) => `Bintang nilai ${index}`,
    noSegments: "Belum ada segmen bertanda waktu."
  },
  it: {
    eyebrow: "Condivisione Votxt",
    fallbackTitle: "Trascrizione condivisa",
    accessed: (count: number) => `${count} visualizzazioni`,
    back: "Indietro",
    export: "Esporta",
    fullTranscript: "Trascrizione",
    summary: "Riepilogo",
    noSummary: "Questa condivisione non include ancora un riepilogo.",
    translation: "Traduzione",
    noTranslation: "Questa condivisione non include ancora una traduzione.",
    translationLanguage: "Lingua della traduzione",
    loadingTranslation: "Caricamento traduzione...",
    translationReadError: "Impossibile leggere la traduzione.",
    autoLanguage: "automatico",
    segments: "Segmenti",
    segmentCount: (count: number) => `${count} segmenti con timestamp`,
    speakerFallback: "Relatore 1",
    quality: "Valuta la qualità della trascrizione:",
    ratingStar: (index: number) => `Stella valutazione ${index}`,
    noSegments: "Non sono ancora disponibili segmenti con timestamp."
  },
  ja: {
    eyebrow: "Votxt 共有",
    fallbackTitle: "共有された文字起こし",
    accessed: (count: number) => `${count} 回表示`,
    back: "戻る",
    export: "エクスポート",
    fullTranscript: "文字起こし",
    summary: "要約",
    noSummary: "この共有にはまだ要約がありません。",
    translation: "翻訳",
    noTranslation: "この共有にはまだ翻訳がありません。",
    translationLanguage: "翻訳言語",
    loadingTranslation: "翻訳を読み込み中...",
    translationReadError: "翻訳を読み込めません。",
    autoLanguage: "自動",
    segments: "セグメント",
    segmentCount: (count: number) => `${count} 件のタイムスタンプ付きセグメント`,
    speakerFallback: "話者 1",
    quality: "文字起こし品質を評価:",
    ratingStar: (index: number) => `評価スター ${index}`,
    noSegments: "タイムスタンプ付きセグメントはまだありません。"
  },
  ko: {
    eyebrow: "Votxt 공유",
    fallbackTitle: "공유된 전사",
    accessed: (count: number) => `${count}회 조회`,
    back: "뒤로",
    export: "내보내기",
    fullTranscript: "전사",
    summary: "요약",
    noSummary: "이 공유에는 아직 요약이 없습니다.",
    translation: "번역",
    noTranslation: "이 공유에는 아직 번역이 없습니다.",
    translationLanguage: "번역 언어",
    loadingTranslation: "번역을 불러오는 중...",
    translationReadError: "번역을 읽을 수 없습니다.",
    autoLanguage: "자동",
    segments: "세그먼트",
    segmentCount: (count: number) => `타임스탬프 세그먼트 ${count}개`,
    speakerFallback: "화자 1",
    quality: "전사 품질 평가:",
    ratingStar: (index: number) => `평점 별 ${index}`,
    noSegments: "아직 타임스탬프 세그먼트가 없습니다."
  },
  nl: {
    eyebrow: "Votxt delen",
    fallbackTitle: "Gedeelde transcriptie",
    accessed: (count: number) => `${count} weergave${count === 1 ? "" : "n"}`,
    back: "Terug",
    export: "Exporteren",
    fullTranscript: "Transcript",
    summary: "Samenvatting",
    noSummary: "Deze share bevat nog geen samenvatting.",
    translation: "Vertaling",
    noTranslation: "Deze share bevat nog geen vertaling.",
    translationLanguage: "Vertaaltaal",
    loadingTranslation: "Vertaling laden...",
    translationReadError: "Kan vertaling niet lezen.",
    autoLanguage: "automatisch",
    segments: "Segmenten",
    segmentCount: (count: number) => `${count} segmenten met tijdstempel`,
    speakerFallback: "Spreker 1",
    quality: "Beoordeel transcriptkwaliteit:",
    ratingStar: (index: number) => `Beoordelingsster ${index}`,
    noSegments: "Er zijn nog geen segmenten met tijdstempel."
  },
  pl: {
    eyebrow: "Udostępnienie Votxt",
    fallbackTitle: "Udostępniona transkrypcja",
    accessed: (count: number) => `${count} wyświetleń`,
    back: "Wstecz",
    export: "Eksport",
    fullTranscript: "Transkrypcja",
    summary: "Podsumowanie",
    noSummary: "To udostępnienie nie zawiera jeszcze podsumowania.",
    translation: "Tłumaczenie",
    noTranslation: "To udostępnienie nie zawiera jeszcze tłumaczenia.",
    translationLanguage: "Język tłumaczenia",
    loadingTranslation: "Ładowanie tłumaczenia...",
    translationReadError: "Nie można odczytać tłumaczenia.",
    autoLanguage: "automatycznie",
    segments: "Segmenty",
    segmentCount: (count: number) => `${count} segmentów ze znacznikami czasu`,
    speakerFallback: "Mówca 1",
    quality: "Oceń jakość transkrypcji:",
    ratingStar: (index: number) => `Gwiazdka oceny ${index}`,
    noSegments: "Brak dostępnych segmentów ze znacznikami czasu."
  },
  pt: {
    eyebrow: "Compartilhamento Votxt",
    fallbackTitle: "Transcrição compartilhada",
    accessed: (count: number) => `${count} visualizaç${count === 1 ? "ão" : "ões"}`,
    back: "Voltar",
    export: "Exportar",
    fullTranscript: "Transcrição",
    summary: "Resumo",
    noSummary: "Este compartilhamento ainda não inclui resumo.",
    translation: "Tradução",
    noTranslation: "Este compartilhamento ainda não inclui tradução.",
    translationLanguage: "Idioma da tradução",
    loadingTranslation: "Carregando tradução...",
    translationReadError: "Não foi possível ler a tradução.",
    autoLanguage: "automático",
    segments: "Segmentos",
    segmentCount: (count: number) => `${count} segmentos com timestamp`,
    speakerFallback: "Falante 1",
    quality: "Avaliar qualidade da transcrição:",
    ratingStar: (index: number) => `Estrela de avaliação ${index}`,
    noSegments: "Ainda não há segmentos com timestamp."
  },
  ru: {
    eyebrow: "Поделиться Votxt",
    fallbackTitle: "Общая расшифровка",
    accessed: (count: number) => `${count} просмотров`,
    back: "Назад",
    export: "Экспорт",
    fullTranscript: "Расшифровка",
    summary: "Сводка",
    noSummary: "В этой ссылке пока нет сводки.",
    translation: "Перевод",
    noTranslation: "В этой ссылке пока нет перевода.",
    translationLanguage: "Язык перевода",
    loadingTranslation: "Загрузка перевода...",
    translationReadError: "Не удалось прочитать перевод.",
    autoLanguage: "авто",
    segments: "Сегменты",
    segmentCount: (count: number) => `${count} сегментов с таймкодами`,
    speakerFallback: "Спикер 1",
    quality: "Оценить качество расшифровки:",
    ratingStar: (index: number) => `Звезда оценки ${index}`,
    noSegments: "Сегменты с таймкодами пока недоступны."
  },
  th: {
    eyebrow: "แชร์ Votxt",
    fallbackTitle: "ถอดเสียงที่แชร์",
    accessed: (count: number) => `${count} การดู`,
    back: "กลับ",
    export: "ส่งออก",
    fullTranscript: "ข้อความถอดเสียง",
    summary: "สรุป",
    noSummary: "การแชร์นี้ยังไม่มีสรุป",
    translation: "คำแปล",
    noTranslation: "การแชร์นี้ยังไม่มีคำแปล",
    translationLanguage: "ภาษาคำแปล",
    loadingTranslation: "กำลังโหลดคำแปล...",
    translationReadError: "ไม่สามารถอ่านคำแปลได้",
    autoLanguage: "อัตโนมัติ",
    segments: "ช่วงเวลา",
    segmentCount: (count: number) => `${count} ช่วงเวลาพร้อมเวลา`,
    speakerFallback: "ผู้พูด 1",
    quality: "ให้คะแนนคุณภาพข้อความ:",
    ratingStar: (index: number) => `ดาวคะแนน ${index}`,
    noSegments: "ยังไม่มีช่วงเวลาพร้อมเวลา"
  },
  tr: {
    eyebrow: "Votxt paylaşımı",
    fallbackTitle: "Paylaşılan transkripsiyon",
    accessed: (count: number) => `${count} görüntüleme`,
    back: "Geri",
    export: "Dışa aktar",
    fullTranscript: "Transkript",
    summary: "Özet",
    noSummary: "Bu paylaşım henüz özet içermiyor.",
    translation: "Çeviri",
    noTranslation: "Bu paylaşım henüz çeviri içermiyor.",
    translationLanguage: "Çeviri dili",
    loadingTranslation: "Çeviri yükleniyor...",
    translationReadError: "Çeviri okunamadı.",
    autoLanguage: "otomatik",
    segments: "Bölümler",
    segmentCount: (count: number) => `${count} zaman damgalı bölüm`,
    speakerFallback: "Konuşmacı 1",
    quality: "Transkript kalitesini değerlendir:",
    ratingStar: (index: number) => `Puan yıldızı ${index}`,
    noSegments: "Henüz zaman damgalı bölüm yok."
  },
  uk: {
    eyebrow: "Поширення Votxt",
    fallbackTitle: "Поширена транскрипція",
    accessed: (count: number) => `${count} переглядів`,
    back: "Назад",
    export: "Експорт",
    fullTranscript: "Транскрипція",
    summary: "Підсумок",
    noSummary: "Це поширення ще не містить підсумку.",
    translation: "Переклад",
    noTranslation: "Це поширення ще не містить перекладу.",
    translationLanguage: "Мова перекладу",
    loadingTranslation: "Завантаження перекладу...",
    translationReadError: "Не вдалося прочитати переклад.",
    autoLanguage: "авто",
    segments: "Сегменти",
    segmentCount: (count: number) => `${count} сегментів з часовими мітками`,
    speakerFallback: "Спікер 1",
    quality: "Оцініть якість транскрипції:",
    ratingStar: (index: number) => `Зірка оцінки ${index}`,
    noSegments: "Сегменти з часовими мітками ще недоступні."
  },
  vi: {
    eyebrow: "Chia sẻ Votxt",
    fallbackTitle: "Bản chép lời được chia sẻ",
    accessed: (count: number) => `${count} lượt xem`,
    back: "Quay lại",
    export: "Xuất",
    fullTranscript: "Bản chép lời",
    summary: "Tóm tắt",
    noSummary: "Chia sẻ này chưa có tóm tắt.",
    translation: "Bản dịch",
    noTranslation: "Chia sẻ này chưa có bản dịch.",
    translationLanguage: "Ngôn ngữ bản dịch",
    loadingTranslation: "Đang tải bản dịch...",
    translationReadError: "Không thể đọc bản dịch.",
    autoLanguage: "tự động",
    segments: "Phân đoạn",
    segmentCount: (count: number) => `${count} phân đoạn có dấu thời gian`,
    speakerFallback: "Người nói 1",
    quality: "Đánh giá chất lượng bản chép lời:",
    ratingStar: (index: number) => `Sao đánh giá ${index}`,
    noSegments: "Chưa có phân đoạn có dấu thời gian."
  },
  zh: {
    eyebrow: "Votxt 分享",
    fallbackTitle: "共享转写",
    accessed: (count: number) => `已访问 ${count} 次`,
    back: "返回",
    export: "导出",
    fullTranscript: "转写全文",
    summary: "摘要",
    noSummary: "该分享暂未包含摘要。",
    translation: "翻译",
    noTranslation: "该分享暂未包含翻译。",
    translationLanguage: "翻译语言",
    loadingTranslation: "正在加载翻译...",
    translationReadError: "无法读取翻译。",
    autoLanguage: "自动",
    segments: "分段",
    segmentCount: (count: number) => `${count} 个带时间戳的片段`,
    speakerFallback: "发言人 1",
    quality: "评价转写质量：",
    ratingStar: (index: number) => `评分星级 ${index}`,
    noSegments: "该分享暂未包含时间戳分段。"
  },
  "zh-TW": {
    eyebrow: "Votxt 分享",
    fallbackTitle: "共享轉寫",
    accessed: (count: number) => `已瀏覽 ${count} 次`,
    back: "返回",
    export: "匯出",
    fullTranscript: "轉寫全文",
    summary: "摘要",
    noSummary: "此分享尚未包含摘要。",
    translation: "翻譯",
    noTranslation: "此分享尚未包含翻譯。",
    translationLanguage: "翻譯語言",
    loadingTranslation: "正在載入翻譯...",
    translationReadError: "無法讀取翻譯。",
    autoLanguage: "自動",
    segments: "分段",
    segmentCount: (count: number) => `${count} 個含時間戳的片段`,
    speakerFallback: "發言人 1",
    quality: "評價轉寫品質：",
    ratingStar: (index: number) => `評分星級 ${index}`,
    noSegments: "此分享尚未包含時間戳分段。"
  }
};

export function getSharePageTitle(locale: string) {
  const normalizedLocale = isLocale(locale) ? locale : "en";
  return shareCopy[normalizedLocale].fallbackTitle;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function readSegments(value: unknown): Segment[] {
  return Array.isArray(value) ? (value as Segment[]) : [];
}

function summaryEntryText(entry: SummaryEntry) {
  if (typeof entry === "string") return entry;
  return entry.text ?? entry.label ?? "";
}

export async function SharePage({locale, token}: {locale: string; token: string}) {
  const share = await getPublicShare(token);
  const transcript = share?.mediaTask.transcript;
  if (!share || !transcript) {
    notFound();
  }

  const normalizedLocale = isLocale(locale) ? locale : "en";
  const copy = shareCopy[normalizedLocale];
  const languageCopy = {language: getWorkspaceCopy(normalizedLocale).language};
  const task = share.mediaTask;
  const text = transcriptText(transcript);
  const segments = readSegments(transcript.segments);
  const summary = transcript.summary as any;
  const translations = transcriptTranslationEntries(transcript.translations);
  const ratings = task.ratings ?? [];
  const ratingAverage = ratings.length ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length : 0;
  const title = share.title || task.originalName || copy.fallbackTitle;
  const seekEventId = `share-${token}`;

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-white/95 px-4 py-3 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <a href={`/${locale}`} className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-ink/10 bg-white text-ink/65 transition hover:border-violet/25 hover:text-violet" aria-label={copy.back}>
            <ArrowLeft size={16} />
          </a>
          <p className="hidden min-w-0 flex-1 truncate text-sm font-black text-ink/75 md:block">{title}</p>
          <div className="flex shrink-0 items-center gap-2">
            <div className="relative z-40 w-32 sm:w-44">
              <WorkspaceLanguageSwitcher locale={normalizedLocale} copy={languageCopy} placement="below" />
            </div>
            <a href="#exports" className="btn-primary h-9 px-3 py-2">
              <Download size={16} />
              {copy.export}
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-5">
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-black leading-tight text-ink md:text-3xl">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-ink/60">
              {task.provider || "Votxt"} · {task.detectedLanguage || task.language || copy.autoLanguage} · {copy.accessed(share.accessCount)}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-ink/10 bg-paper/60 px-3 py-2 text-xs font-black text-ink/55">
            <span>{copy.quality}</span>
            {[1, 2, 3, 4, 5].map((item) => (
              <Star key={item} size={15} className="text-violet" fill={item <= Math.round(ratingAverage) ? "currentColor" : "none"} aria-label={copy.ratingStar(item)} />
            ))}
            {ratings.length ? <span className="ml-1 text-ink/45">{ratingAverage.toFixed(1)} ({ratings.length})</span> : null}
          </div>
        </div>

        <div className="mt-5">
          <MediaPlayer endpoint={`/api/share/${encodeURIComponent(token)}/original-file`} durationSeconds={task.durationSeconds} seekEventId={seekEventId} label={title} />
        </div>

        <section className="mt-6 grid gap-6">
        <article>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b border-ink/10 pb-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-ink">{copy.fullTranscript}</h2>
              <p className="mt-1 text-sm font-bold text-ink/50">{segments.length ? copy.segmentCount(segments.length) : copy.noSegments}</p>
            </div>
            <a href="#insights" className="focus-ring rounded-md border border-ink/10 px-3 py-2 text-xs font-black uppercase text-ink/55 transition hover:border-violet/25 hover:text-violet">{copy.summary}</a>
          </div>
          {segments.length > 0 ? (
            <div className="grid gap-1">
              {segments.map((segment, index) => (
                <section key={`${segment.start}-${index}`} className="grid gap-3 border-b border-ink/5 px-1 py-3 transition hover:bg-paper/45 sm:grid-cols-[88px_minmax(0,1fr)]">
                  <div className="text-xs font-black text-ink/45">
                    <div>{segment.speaker || copy.speakerFallback}</div>
                    <MediaSeekButton eventId={seekEventId} time={segment.start} className="mt-1 text-left text-violet transition hover:text-tide hover:underline">
                      {formatTime(segment.start)}
                    </MediaSeekButton>
                  </div>
                  <p className="text-base leading-7 text-ink/82">{segment.text}</p>
                </section>
              ))}
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-base leading-8 text-ink/78">{text}</div>
          )}
        </article>

        <aside id="insights" className="grid gap-4 border-t border-ink/10 pt-6 lg:grid-cols-3">
          <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase text-ink/70">
              <Sparkles size={18} className="text-tide" />
              {copy.summary}
            </h2>
            {summary ? (
              <div className="mt-3 text-sm leading-6 text-ink/70">
                <p>{summary.overview}</p>
                <ul className="mt-3 grid gap-2">
                  {summary.bullets?.map((item: SummaryEntry, index: number) => {
                    const text = summaryEntryText(item);
                    return text ? <li key={`${text}-${index}`}>- {text}</li> : null;
                  })}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-ink/60">{copy.noSummary}</p>
            )}
          </section>

          <SharedTranslationPanel
            token={token}
            title={copy.translation}
            emptyText={copy.noTranslation}
            languageLabel={copy.translationLanguage}
            loadingText={copy.loadingTranslation}
            readError={copy.translationReadError}
            translations={translations}
          />

          <section id="exports" className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase text-ink/70">
              <Network size={18} className="text-tide" />
              {copy.segments}
            </h2>
            <div className="mt-3">
              <ShareExportLinks token={token} />
            </div>
          </section>
        </aside>
        </section>
      </section>
    </main>
  );
}
