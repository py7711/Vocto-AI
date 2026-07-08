import arMessages from "../../../messages/ar.json";
import deMessages from "../../../messages/de.json";
import enMessages from "../../../messages/en.json";
import esMessages from "../../../messages/es.json";
import frMessages from "../../../messages/fr.json";
import huMessages from "../../../messages/hu.json";
import idMessages from "../../../messages/id.json";
import itMessages from "../../../messages/it.json";
import jaMessages from "../../../messages/ja.json";
import koMessages from "../../../messages/ko.json";
import nlMessages from "../../../messages/nl.json";
import plMessages from "../../../messages/pl.json";
import ptMessages from "../../../messages/pt.json";
import ruMessages from "../../../messages/ru.json";
import thMessages from "../../../messages/th.json";
import trMessages from "../../../messages/tr.json";
import ukMessages from "../../../messages/uk.json";
import viMessages from "../../../messages/vi.json";
import zhTwMessages from "../../../messages/zh-TW.json";
import zhMessages from "../../../messages/zh.json";
import {isLocale, localeEnglishNames, localeNativeNames, locales, type Locale} from "@/lib/locales";

export const languageChoices = ["auto", ...locales] as const;
export const localeLanguageOptions = locales.map((locale) => [locale, languageChoiceLabel(locale)] as const);
export const exportFormats = ["txt", "srt", "vtt", "json", "md", "csv", "docx", "pdf"];
export const outlineFormats = ["md", "txt", "json", "docx", "pdf"];

export function languageChoiceLabel(locale: Locale) {
  const english = localeEnglishNames[locale];
  const native = localeNativeNames[locale];
  return english === native ? english : `${english} (${native})`;
}

type WorkspacePanelCopy = {
  close: string;
  cancel: string;
  disable: string;
  shareDialogTitle: string;
  shareDialogDescription: string;
  sharingEnabled: (views: number) => string;
  shareExpires: (date: string) => string;
  publicLinkGenerated: string;
  sharingDisabledDescription: string;
  enableSharing: string;
  disableSharing: string;
  disableSharingTitle: string;
  disableSharingConfirm: string;
  exportOptions: string;
  exportAction: string;
  exportContentLabel: string;
  exportTargetLabel: string;
  exportOriginal: string;
  exportTranslation: string;
  exportBilingual: string;
  speakerNames: string;
  showSpeakerNames: string;
  timestamps: string;
  showTimestamps: string;
  subtitleMaxChars: string;
  subtitleMaxSeconds: string;
  segments: string;
  speakersLabel: string;
  outline: string;
};

const workspacePanelCopy: Record<Locale, WorkspacePanelCopy> = {
  ar: {
    close: "إغلاق",
    cancel: "إلغاء",
    disable: "تعطيل",
    shareDialogTitle: "مشاركة التفريغ",
    shareDialogDescription: "يمكن لأي شخص لديه الرابط عرض هذا التفريغ",
    sharingEnabled: (views) => `المشاركة مفعلة · ${views} مشاهدة`,
    shareExpires: (date) => `ينتهي في ${date}`,
    publicLinkGenerated: "تم إنشاء رابط عام لهذا التفريغ.",
    sharingDisabledDescription: "المشاركة معطلة حالياً. فعّلها لإنشاء رابط عام.",
    enableSharing: "تفعيل المشاركة",
    disableSharing: "تعطيل المشاركة",
    disableSharingTitle: "تعطيل المشاركة",
    disableSharingConfirm: "هل تريد بالتأكيد تعطيل رابط المشاركة العام لهذا التفريغ؟",
    exportOptions: "خيارات التصدير",
    exportAction: "تصدير",
    exportContentLabel: "محتوى التصدير",
    exportTargetLabel: "لغة التصدير",
    exportOriginal: "الأصل",
    exportTranslation: "الترجمة",
    exportBilingual: "ثنائي اللغة",
    speakerNames: "أسماء المتحدثين",
    showSpeakerNames: "إظهار أسماء المتحدثين",
    timestamps: "الطوابع الزمنية",
    showTimestamps: "إظهار الطوابع الزمنية",
    subtitleMaxChars: "الحد الأقصى لأحرف الترجمة",
    subtitleMaxSeconds: "الحد الأقصى لثواني الترجمة",
    segments: "المقاطع",
    speakersLabel: "المتحدثون",
    outline: "المخطط"
  },
  de: {
    close: "Schliessen",
    cancel: "Abbrechen",
    disable: "Deaktivieren",
    shareDialogTitle: "Transkript teilen",
    shareDialogDescription: "Jeder mit dem Link kann dieses Transkript ansehen",
    sharingEnabled: (views) => `Teilen ist aktiv · ${views} Aufrufe`,
    shareExpires: (date) => `Lauft am ${date} ab`,
    publicLinkGenerated: "Fur dieses Transkript wurde bereits ein offentlicher Link erstellt.",
    sharingDisabledDescription: "Teilen ist derzeit deaktiviert. Aktiviere es, um einen offentlichen Link zu erstellen.",
    enableSharing: "Teilen aktivieren",
    disableSharing: "Teilen deaktivieren",
    disableSharingTitle: "Teilen deaktivieren",
    disableSharingConfirm: "Mochtest du den offentlichen Link fur dieses Transkript wirklich deaktivieren?",
    exportOptions: "Exportoptionen",
    exportAction: "Exportieren",
    exportContentLabel: "Exportinhalt",
    exportTargetLabel: "Exportsprache",
    exportOriginal: "Original",
    exportTranslation: "Ubersetzung",
    exportBilingual: "Zweisprachig",
    speakerNames: "Sprechernamen",
    showSpeakerNames: "Sprechernamen anzeigen",
    timestamps: "Zeitstempel",
    showTimestamps: "Zeitstempel anzeigen",
    subtitleMaxChars: "Max. Untertitelzeichen",
    subtitleMaxSeconds: "Max. Untertitelsekunden",
    segments: "Segmente",
    speakersLabel: "Sprecher",
    outline: "Gliederung"
  },
  en: {
    close: "Close",
    cancel: "Cancel",
    disable: "Disable",
    shareDialogTitle: "Share Transcription",
    shareDialogDescription: "Anyone with the link can view this transcription",
    sharingEnabled: (views) => `Sharing is enabled · ${views} view${views === 1 ? "" : "s"}`,
    shareExpires: (date) => `Expires ${date}`,
    publicLinkGenerated: "A public link has already been generated for this transcription.",
    sharingDisabledDescription: "Sharing is currently disabled. Enable it to generate a public link.",
    enableSharing: "Enable sharing",
    disableSharing: "Disable sharing",
    disableSharingTitle: "Disable Sharing",
    disableSharingConfirm: "Are you sure you want to disable the public sharing link for this transcription?",
    exportOptions: "Export Options",
    exportAction: "Export",
    exportContentLabel: "Export content",
    exportTargetLabel: "Export target language",
    exportOriginal: "Original",
    exportTranslation: "Translation",
    exportBilingual: "Bilingual",
    speakerNames: "Speaker names",
    showSpeakerNames: "Show speaker names",
    timestamps: "Timestamps",
    showTimestamps: "Show timestamps",
    subtitleMaxChars: "Subtitle max chars",
    subtitleMaxSeconds: "Subtitle max seconds",
    segments: "Segments",
    speakersLabel: "Speakers",
    outline: "Outline"
  },
  es: {
    close: "Cerrar",
    cancel: "Cancelar",
    disable: "Desactivar",
    shareDialogTitle: "Compartir transcripción",
    shareDialogDescription: "Cualquier persona con el enlace puede ver esta transcripción",
    sharingEnabled: (views) => `Compartir está activado · ${views} vista${views === 1 ? "" : "s"}`,
    shareExpires: (date) => `Vence el ${date}`,
    publicLinkGenerated: "Ya se generó un enlace público para esta transcripción.",
    sharingDisabledDescription: "Compartir está desactivado. Actívalo para generar un enlace público.",
    enableSharing: "Activar compartir",
    disableSharing: "Desactivar compartir",
    disableSharingTitle: "Desactivar compartir",
    disableSharingConfirm: "¿Seguro que quieres desactivar el enlace público de esta transcripción?",
    exportOptions: "Opciones de exportación",
    exportAction: "Exportar",
    exportContentLabel: "Contenido de exportación",
    exportTargetLabel: "Idioma de exportación",
    exportOriginal: "Original",
    exportTranslation: "Traducción",
    exportBilingual: "Bilingüe",
    speakerNames: "Nombres de hablantes",
    showSpeakerNames: "Mostrar hablantes",
    timestamps: "Marcas de tiempo",
    showTimestamps: "Mostrar marcas de tiempo",
    subtitleMaxChars: "Máx. caracteres de subtítulo",
    subtitleMaxSeconds: "Máx. segundos de subtítulo",
    segments: "Segmentos",
    speakersLabel: "Hablantes",
    outline: "Esquema"
  },
  fr: {
    close: "Fermer",
    cancel: "Annuler",
    disable: "Désactiver",
    shareDialogTitle: "Partager la transcription",
    shareDialogDescription: "Toute personne avec le lien peut voir cette transcription",
    sharingEnabled: (views) => `Partage activé · ${views} vue${views === 1 ? "" : "s"}`,
    shareExpires: (date) => `Expire le ${date}`,
    publicLinkGenerated: "Un lien public a déjà été généré pour cette transcription.",
    sharingDisabledDescription: "Le partage est désactivé. Activez-le pour générer un lien public.",
    enableSharing: "Activer le partage",
    disableSharing: "Désactiver le partage",
    disableSharingTitle: "Désactiver le partage",
    disableSharingConfirm: "Voulez-vous vraiment désactiver le lien public de cette transcription ?",
    exportOptions: "Options d'export",
    exportAction: "Exporter",
    exportContentLabel: "Contenu exporté",
    exportTargetLabel: "Langue d'export",
    exportOriginal: "Original",
    exportTranslation: "Traduction",
    exportBilingual: "Bilingue",
    speakerNames: "Noms des intervenants",
    showSpeakerNames: "Afficher les intervenants",
    timestamps: "Horodatages",
    showTimestamps: "Afficher les horodatages",
    subtitleMaxChars: "Caractères max. par sous-titre",
    subtitleMaxSeconds: "Secondes max. par sous-titre",
    segments: "Segments",
    speakersLabel: "Intervenants",
    outline: "Plan"
  },
  hu: {
    close: "Bezárás",
    cancel: "Mégse",
    disable: "Letiltás",
    shareDialogTitle: "Átirat megosztása",
    shareDialogDescription: "A link birtokában bárki megtekintheti ezt az átiratot",
    sharingEnabled: (views) => `Megosztás bekapcsolva · ${views} megtekintés`,
    shareExpires: (date) => `Lejár: ${date}`,
    publicLinkGenerated: "Ehhez az átirathoz már készült nyilvános link.",
    sharingDisabledDescription: "A megosztás jelenleg ki van kapcsolva. Kapcsold be nyilvános link létrehozásához.",
    enableSharing: "Megosztás bekapcsolása",
    disableSharing: "Megosztás letiltása",
    disableSharingTitle: "Megosztás letiltása",
    disableSharingConfirm: "Biztosan letiltod az átirat nyilvános megosztási linkjét?",
    exportOptions: "Exportálási beállítások",
    exportAction: "Exportálás",
    exportContentLabel: "Export tartalma",
    exportTargetLabel: "Export nyelve",
    exportOriginal: "Eredeti",
    exportTranslation: "Fordítás",
    exportBilingual: "Kétnyelvű",
    speakerNames: "Beszélőnevek",
    showSpeakerNames: "Beszélőnevek mutatása",
    timestamps: "Időbélyegek",
    showTimestamps: "Időbélyegek mutatása",
    subtitleMaxChars: "Felirat max. karakter",
    subtitleMaxSeconds: "Felirat max. másodperc",
    segments: "Szegmensek",
    speakersLabel: "Beszélők",
    outline: "Vázlat"
  },
  id: {
    close: "Tutup",
    cancel: "Batal",
    disable: "Nonaktifkan",
    shareDialogTitle: "Bagikan Transkripsi",
    shareDialogDescription: "Siapa pun yang memiliki tautan dapat melihat transkripsi ini",
    sharingEnabled: (views) => `Berbagi aktif · ${views} tayangan`,
    shareExpires: (date) => `Berakhir ${date}`,
    publicLinkGenerated: "Tautan publik sudah dibuat untuk transkripsi ini.",
    sharingDisabledDescription: "Berbagi saat ini nonaktif. Aktifkan untuk membuat tautan publik.",
    enableSharing: "Aktifkan berbagi",
    disableSharing: "Nonaktifkan berbagi",
    disableSharingTitle: "Nonaktifkan Berbagi",
    disableSharingConfirm: "Yakin ingin menonaktifkan tautan publik untuk transkripsi ini?",
    exportOptions: "Opsi Ekspor",
    exportAction: "Ekspor",
    exportContentLabel: "Konten ekspor",
    exportTargetLabel: "Bahasa ekspor",
    exportOriginal: "Asli",
    exportTranslation: "Terjemahan",
    exportBilingual: "Dwibahasa",
    speakerNames: "Nama pembicara",
    showSpeakerNames: "Tampilkan nama pembicara",
    timestamps: "Stempel waktu",
    showTimestamps: "Tampilkan stempel waktu",
    subtitleMaxChars: "Maks. karakter subtitle",
    subtitleMaxSeconds: "Maks. detik subtitle",
    segments: "Segmen",
    speakersLabel: "Pembicara",
    outline: "Kerangka"
  },
  it: {
    close: "Chiudi",
    cancel: "Annulla",
    disable: "Disattiva",
    shareDialogTitle: "Condividi trascrizione",
    shareDialogDescription: "Chiunque abbia il link può visualizzare questa trascrizione",
    sharingEnabled: (views) => `Condivisione attiva · ${views} visualizzazioni`,
    shareExpires: (date) => `Scade il ${date}`,
    publicLinkGenerated: "È già stato generato un link pubblico per questa trascrizione.",
    sharingDisabledDescription: "La condivisione è disattivata. Attivala per generare un link pubblico.",
    enableSharing: "Attiva condivisione",
    disableSharing: "Disattiva condivisione",
    disableSharingTitle: "Disattiva condivisione",
    disableSharingConfirm: "Vuoi davvero disattivare il link pubblico per questa trascrizione?",
    exportOptions: "Opzioni di esportazione",
    exportAction: "Esporta",
    exportContentLabel: "Contenuto esportato",
    exportTargetLabel: "Lingua di esportazione",
    exportOriginal: "Originale",
    exportTranslation: "Traduzione",
    exportBilingual: "Bilingue",
    speakerNames: "Nomi speaker",
    showSpeakerNames: "Mostra nomi speaker",
    timestamps: "Timestamp",
    showTimestamps: "Mostra timestamp",
    subtitleMaxChars: "Caratteri max sottotitolo",
    subtitleMaxSeconds: "Secondi max sottotitolo",
    segments: "Segmenti",
    speakersLabel: "Speaker",
    outline: "Scaletta"
  },
  ja: {
    close: "閉じる",
    cancel: "キャンセル",
    disable: "無効化",
    shareDialogTitle: "文字起こしを共有",
    shareDialogDescription: "リンクを知っている人はこの文字起こしを閲覧できます",
    sharingEnabled: (views) => `共有中 · ${views} 回表示`,
    shareExpires: (date) => `${date} に期限切れ`,
    publicLinkGenerated: "この文字起こしの公開リンクはすでに生成されています。",
    sharingDisabledDescription: "共有は現在無効です。有効にすると公開リンクを生成できます。",
    enableSharing: "共有を有効化",
    disableSharing: "共有を無効化",
    disableSharingTitle: "共有を無効化",
    disableSharingConfirm: "この文字起こしの公開共有リンクを無効にしますか？",
    exportOptions: "エクスポート設定",
    exportAction: "エクスポート",
    exportContentLabel: "エクスポート内容",
    exportTargetLabel: "エクスポート言語",
    exportOriginal: "原文",
    exportTranslation: "翻訳",
    exportBilingual: "対訳",
    speakerNames: "話者名",
    showSpeakerNames: "話者名を表示",
    timestamps: "タイムスタンプ",
    showTimestamps: "タイムスタンプを表示",
    subtitleMaxChars: "字幕の最大文字数",
    subtitleMaxSeconds: "字幕の最大秒数",
    segments: "セグメント",
    speakersLabel: "話者",
    outline: "アウトライン"
  },
  ko: {
    close: "닫기",
    cancel: "취소",
    disable: "비활성화",
    shareDialogTitle: "전사 공유",
    shareDialogDescription: "링크가 있는 사람은 이 전사를 볼 수 있습니다",
    sharingEnabled: (views) => `공유 활성화됨 · ${views}회 조회`,
    shareExpires: (date) => `${date} 만료`,
    publicLinkGenerated: "이 전사에 대한 공개 링크가 이미 생성되었습니다.",
    sharingDisabledDescription: "공유가 현재 비활성화되어 있습니다. 활성화하면 공개 링크가 생성됩니다.",
    enableSharing: "공유 활성화",
    disableSharing: "공유 비활성화",
    disableSharingTitle: "공유 비활성화",
    disableSharingConfirm: "이 전사의 공개 공유 링크를 비활성화하시겠습니까?",
    exportOptions: "내보내기 옵션",
    exportAction: "내보내기",
    exportContentLabel: "내보낼 콘텐츠",
    exportTargetLabel: "내보내기 언어",
    exportOriginal: "원본",
    exportTranslation: "번역",
    exportBilingual: "이중 언어",
    speakerNames: "화자 이름",
    showSpeakerNames: "화자 이름 표시",
    timestamps: "타임스탬프",
    showTimestamps: "타임스탬프 표시",
    subtitleMaxChars: "자막 최대 글자 수",
    subtitleMaxSeconds: "자막 최대 초",
    segments: "세그먼트",
    speakersLabel: "화자",
    outline: "개요"
  },
  nl: {
    close: "Sluiten",
    cancel: "Annuleren",
    disable: "Uitschakelen",
    shareDialogTitle: "Transcriptie delen",
    shareDialogDescription: "Iedereen met de link kan deze transcriptie bekijken",
    sharingEnabled: (views) => `Delen is ingeschakeld · ${views} weergaven`,
    shareExpires: (date) => `Verloopt op ${date}`,
    publicLinkGenerated: "Er is al een openbare link voor deze transcriptie gemaakt.",
    sharingDisabledDescription: "Delen is momenteel uitgeschakeld. Schakel het in om een openbare link te maken.",
    enableSharing: "Delen inschakelen",
    disableSharing: "Delen uitschakelen",
    disableSharingTitle: "Delen uitschakelen",
    disableSharingConfirm: "Weet je zeker dat je de openbare link voor deze transcriptie wilt uitschakelen?",
    exportOptions: "Exportopties",
    exportAction: "Exporteren",
    exportContentLabel: "Exportinhoud",
    exportTargetLabel: "Exporttaal",
    exportOriginal: "Origineel",
    exportTranslation: "Vertaling",
    exportBilingual: "Tweetalig",
    speakerNames: "Sprekernamen",
    showSpeakerNames: "Sprekernamen tonen",
    timestamps: "Tijdstempels",
    showTimestamps: "Tijdstempels tonen",
    subtitleMaxChars: "Max. ondertiteltekens",
    subtitleMaxSeconds: "Max. ondertitelseconden",
    segments: "Segmenten",
    speakersLabel: "Sprekers",
    outline: "Overzicht"
  },
  pl: {
    close: "Zamknij",
    cancel: "Anuluj",
    disable: "Wyłącz",
    shareDialogTitle: "Udostępnij transkrypcję",
    shareDialogDescription: "Każdy z linkiem może zobaczyć tę transkrypcję",
    sharingEnabled: (views) => `Udostępnianie włączone · ${views} wyświetleń`,
    shareExpires: (date) => `Wygasa ${date}`,
    publicLinkGenerated: "Publiczny link dla tej transkrypcji został już wygenerowany.",
    sharingDisabledDescription: "Udostępnianie jest wyłączone. Włącz je, aby utworzyć publiczny link.",
    enableSharing: "Włącz udostępnianie",
    disableSharing: "Wyłącz udostępnianie",
    disableSharingTitle: "Wyłącz udostępnianie",
    disableSharingConfirm: "Czy na pewno chcesz wyłączyć publiczny link do tej transkrypcji?",
    exportOptions: "Opcje eksportu",
    exportAction: "Eksportuj",
    exportContentLabel: "Treść eksportu",
    exportTargetLabel: "Język eksportu",
    exportOriginal: "Oryginał",
    exportTranslation: "Tłumaczenie",
    exportBilingual: "Dwujęzycznie",
    speakerNames: "Nazwy mówców",
    showSpeakerNames: "Pokaż nazwy mówców",
    timestamps: "Znaczniki czasu",
    showTimestamps: "Pokaż znaczniki czasu",
    subtitleMaxChars: "Maks. znaki napisów",
    subtitleMaxSeconds: "Maks. sekundy napisów",
    segments: "Segmenty",
    speakersLabel: "Mówcy",
    outline: "Konspekt"
  },
  pt: {
    close: "Fechar",
    cancel: "Cancelar",
    disable: "Desativar",
    shareDialogTitle: "Compartilhar transcrição",
    shareDialogDescription: "Qualquer pessoa com o link pode ver esta transcrição",
    sharingEnabled: (views) => `Compartilhamento ativo · ${views} visualização${views === 1 ? "" : "ões"}`,
    shareExpires: (date) => `Expira em ${date}`,
    publicLinkGenerated: "Um link público já foi gerado para esta transcrição.",
    sharingDisabledDescription: "O compartilhamento está desativado. Ative para gerar um link público.",
    enableSharing: "Ativar compartilhamento",
    disableSharing: "Desativar compartilhamento",
    disableSharingTitle: "Desativar compartilhamento",
    disableSharingConfirm: "Tem certeza de que deseja desativar o link público desta transcrição?",
    exportOptions: "Opções de exportação",
    exportAction: "Exportar",
    exportContentLabel: "Conteúdo exportado",
    exportTargetLabel: "Idioma de exportação",
    exportOriginal: "Original",
    exportTranslation: "Tradução",
    exportBilingual: "Bilíngue",
    speakerNames: "Nomes dos falantes",
    showSpeakerNames: "Mostrar falantes",
    timestamps: "Carimbos de tempo",
    showTimestamps: "Mostrar carimbos de tempo",
    subtitleMaxChars: "Máx. caracteres da legenda",
    subtitleMaxSeconds: "Máx. segundos da legenda",
    segments: "Segmentos",
    speakersLabel: "Falantes",
    outline: "Esboço"
  },
  ru: {
    close: "Закрыть",
    cancel: "Отмена",
    disable: "Отключить",
    shareDialogTitle: "Поделиться расшифровкой",
    shareDialogDescription: "Любой, у кого есть ссылка, сможет просмотреть эту расшифровку",
    sharingEnabled: (views) => `Общий доступ включен · ${views} просмотров`,
    shareExpires: (date) => `Истекает ${date}`,
    publicLinkGenerated: "Публичная ссылка для этой расшифровки уже создана.",
    sharingDisabledDescription: "Общий доступ сейчас отключен. Включите его, чтобы создать публичную ссылку.",
    enableSharing: "Включить общий доступ",
    disableSharing: "Отключить доступ",
    disableSharingTitle: "Отключить общий доступ",
    disableSharingConfirm: "Вы уверены, что хотите отключить публичную ссылку для этой расшифровки?",
    exportOptions: "Параметры экспорта",
    exportAction: "Экспорт",
    exportContentLabel: "Содержимое экспорта",
    exportTargetLabel: "Язык экспорта",
    exportOriginal: "Оригинал",
    exportTranslation: "Перевод",
    exportBilingual: "Двуязычно",
    speakerNames: "Имена спикеров",
    showSpeakerNames: "Показать имена спикеров",
    timestamps: "Метки времени",
    showTimestamps: "Показать метки времени",
    subtitleMaxChars: "Макс. символов субтитров",
    subtitleMaxSeconds: "Макс. секунд субтитров",
    segments: "Сегменты",
    speakersLabel: "Спикеры",
    outline: "План"
  },
  th: {
    close: "ปิด",
    cancel: "ยกเลิก",
    disable: "ปิดใช้งาน",
    shareDialogTitle: "แชร์ทรานสคริปต์",
    shareDialogDescription: "ทุกคนที่มีลิงก์สามารถดูทรานสคริปต์นี้ได้",
    sharingEnabled: (views) => `เปิดการแชร์แล้ว · ${views} ครั้งที่ดู`,
    shareExpires: (date) => `หมดอายุ ${date}`,
    publicLinkGenerated: "มีการสร้างลิงก์สาธารณะสำหรับทรานสคริปต์นี้แล้ว",
    sharingDisabledDescription: "ขณะนี้การแชร์ปิดอยู่ เปิดใช้งานเพื่อสร้างลิงก์สาธารณะ",
    enableSharing: "เปิดการแชร์",
    disableSharing: "ปิดการแชร์",
    disableSharingTitle: "ปิดการแชร์",
    disableSharingConfirm: "คุณแน่ใจหรือไม่ว่าต้องการปิดลิงก์แชร์สาธารณะสำหรับทรานสคริปต์นี้",
    exportOptions: "ตัวเลือกการส่งออก",
    exportAction: "ส่งออก",
    exportContentLabel: "เนื้อหาที่ส่งออก",
    exportTargetLabel: "ภาษาส่งออก",
    exportOriginal: "ต้นฉบับ",
    exportTranslation: "คำแปล",
    exportBilingual: "สองภาษา",
    speakerNames: "ชื่อผู้พูด",
    showSpeakerNames: "แสดงชื่อผู้พูด",
    timestamps: "เวลา",
    showTimestamps: "แสดงเวลา",
    subtitleMaxChars: "อักขระสูงสุดของคำบรรยาย",
    subtitleMaxSeconds: "วินาทีสูงสุดของคำบรรยาย",
    segments: "ช่วง",
    speakersLabel: "ผู้พูด",
    outline: "โครงร่าง"
  },
  tr: {
    close: "Kapat",
    cancel: "Iptal",
    disable: "Devre disi birak",
    shareDialogTitle: "Transkripti Paylas",
    shareDialogDescription: "Baglantiya sahip herkes bu transkripti goruntuleyebilir",
    sharingEnabled: (views) => `Paylasim etkin · ${views} goruntuleme`,
    shareExpires: (date) => `${date} tarihinde sona erer`,
    publicLinkGenerated: "Bu transkript icin herkese acik bir baglanti zaten olusturuldu.",
    sharingDisabledDescription: "Paylasim su anda kapali. Herkese acik baglanti olusturmak icin etkinlestirin.",
    enableSharing: "Paylasimi etkinlestir",
    disableSharing: "Paylasimi devre disi birak",
    disableSharingTitle: "Paylasimi devre disi birak",
    disableSharingConfirm: "Bu transkriptin herkese acik paylasim baglantisini devre disi birakmak istediginize emin misiniz?",
    exportOptions: "Disa Aktarma Secenekleri",
    exportAction: "Disa aktar",
    exportContentLabel: "Disa aktarilacak icerik",
    exportTargetLabel: "Disa aktarma dili",
    exportOriginal: "Orijinal",
    exportTranslation: "Ceviri",
    exportBilingual: "Iki dilli",
    speakerNames: "Konusmaci adlari",
    showSpeakerNames: "Konusmaci adlarini goster",
    timestamps: "Zaman damgalari",
    showTimestamps: "Zaman damgalarini goster",
    subtitleMaxChars: "Maks. altyazi karakteri",
    subtitleMaxSeconds: "Maks. altyazi saniyesi",
    segments: "Segmentler",
    speakersLabel: "Konusmacilar",
    outline: "Taslak"
  },
  uk: {
    close: "Закрити",
    cancel: "Скасувати",
    disable: "Вимкнути",
    shareDialogTitle: "Поділитися транскрипцією",
    shareDialogDescription: "Будь-хто з посиланням може переглянути цю транскрипцію",
    sharingEnabled: (views) => `Спільний доступ увімкнено · ${views} переглядів`,
    shareExpires: (date) => `Діє до ${date}`,
    publicLinkGenerated: "Публічне посилання для цієї транскрипції вже створено.",
    sharingDisabledDescription: "Спільний доступ зараз вимкнено. Увімкніть його, щоб створити публічне посилання.",
    enableSharing: "Увімкнути доступ",
    disableSharing: "Вимкнути доступ",
    disableSharingTitle: "Вимкнути спільний доступ",
    disableSharingConfirm: "Ви впевнені, що хочете вимкнути публічне посилання для цієї транскрипції?",
    exportOptions: "Параметри експорту",
    exportAction: "Експорт",
    exportContentLabel: "Вміст експорту",
    exportTargetLabel: "Мова експорту",
    exportOriginal: "Оригінал",
    exportTranslation: "Переклад",
    exportBilingual: "Двомовно",
    speakerNames: "Імена спікерів",
    showSpeakerNames: "Показати імена спікерів",
    timestamps: "Позначки часу",
    showTimestamps: "Показати позначки часу",
    subtitleMaxChars: "Макс. символів субтитрів",
    subtitleMaxSeconds: "Макс. секунд субтитрів",
    segments: "Сегменти",
    speakersLabel: "Спікери",
    outline: "План"
  },
  vi: {
    close: "Đóng",
    cancel: "Hủy",
    disable: "Tắt",
    shareDialogTitle: "Chia sẻ bản ghi",
    shareDialogDescription: "Bất kỳ ai có liên kết đều có thể xem bản ghi này",
    sharingEnabled: (views) => `Đã bật chia sẻ · ${views} lượt xem`,
    shareExpires: (date) => `Hết hạn ${date}`,
    publicLinkGenerated: "Liên kết công khai đã được tạo cho bản ghi này.",
    sharingDisabledDescription: "Chia sẻ hiện đang tắt. Bật để tạo liên kết công khai.",
    enableSharing: "Bật chia sẻ",
    disableSharing: "Tắt chia sẻ",
    disableSharingTitle: "Tắt chia sẻ",
    disableSharingConfirm: "Bạn có chắc muốn tắt liên kết chia sẻ công khai cho bản ghi này không?",
    exportOptions: "Tùy chọn xuất",
    exportAction: "Xuất",
    exportContentLabel: "Nội dung xuất",
    exportTargetLabel: "Ngôn ngữ xuất",
    exportOriginal: "Gốc",
    exportTranslation: "Bản dịch",
    exportBilingual: "Song ngữ",
    speakerNames: "Tên người nói",
    showSpeakerNames: "Hiển thị tên người nói",
    timestamps: "Mốc thời gian",
    showTimestamps: "Hiển thị mốc thời gian",
    subtitleMaxChars: "Ký tự phụ đề tối đa",
    subtitleMaxSeconds: "Giây phụ đề tối đa",
    segments: "Đoạn",
    speakersLabel: "Người nói",
    outline: "Dàn ý"
  },
  zh: {
    close: "关闭",
    cancel: "取消",
    disable: "停用",
    shareDialogTitle: "分享转写",
    shareDialogDescription: "任何获得链接的人都可以查看此转写",
    sharingEnabled: (views) => `分享已启用 · ${views} 次查看`,
    shareExpires: (date) => `${date} 到期`,
    publicLinkGenerated: "此转写已生成公开链接。",
    sharingDisabledDescription: "分享当前已关闭。启用后会生成公开链接。",
    enableSharing: "启用分享",
    disableSharing: "停用分享",
    disableSharingTitle: "停用分享",
    disableSharingConfirm: "确定要停用该转写的公开分享链接吗？",
    exportOptions: "导出选项",
    exportAction: "导出",
    exportContentLabel: "导出内容",
    exportTargetLabel: "导出目标语言",
    exportOriginal: "原文",
    exportTranslation: "翻译",
    exportBilingual: "双语",
    speakerNames: "发言人名称",
    showSpeakerNames: "显示发言人名称",
    timestamps: "时间戳",
    showTimestamps: "显示时间戳",
    subtitleMaxChars: "字幕最大字符数",
    subtitleMaxSeconds: "字幕最大秒数",
    segments: "分段",
    speakersLabel: "发言人",
    outline: "大纲"
  },
  "zh-TW": {
    close: "關閉",
    cancel: "取消",
    disable: "停用",
    shareDialogTitle: "分享轉寫",
    shareDialogDescription: "任何取得連結的人都可以查看此轉寫",
    sharingEnabled: (views) => `分享已啟用 · ${views} 次查看`,
    shareExpires: (date) => `${date} 到期`,
    publicLinkGenerated: "此轉寫已生成公開連結。",
    sharingDisabledDescription: "分享目前已關閉。啟用後會生成公開連結。",
    enableSharing: "啟用分享",
    disableSharing: "停用分享",
    disableSharingTitle: "停用分享",
    disableSharingConfirm: "確定要停用此轉寫的公開分享連結嗎？",
    exportOptions: "匯出選項",
    exportAction: "匯出",
    exportContentLabel: "匯出內容",
    exportTargetLabel: "匯出目標語言",
    exportOriginal: "原文",
    exportTranslation: "翻譯",
    exportBilingual: "雙語",
    speakerNames: "發言人名稱",
    showSpeakerNames: "顯示發言人名稱",
    timestamps: "時間戳",
    showTimestamps: "顯示時間戳",
    subtitleMaxChars: "字幕最大字元數",
    subtitleMaxSeconds: "字幕最大秒數",
    segments: "分段",
    speakersLabel: "發言人",
    outline: "大綱"
  }
};

type WorkspaceActionCopy = {
  renameFile: string;
  rename: string;
  enterNewFilename: string;
  moveToFolder: string;
  move: string;
  movingFileFrom: (title: string, folder: string) => string;
  movingSelectedFiles: (count: number) => string;
  exportSelectedFiles: (count: number) => string;
  fileFormat: string;
  exportDescription: string;
  noFoldersAvailable: string;
  deleteTranscription: string;
  deleteTranscriptionConfirm: (title: string) => string;
  delete: string;
  deleteSelectedFiles: string;
  deleteSelectedFilesConfirm: (count: number) => string;
  deleteCannotBeUndone: string;
  deleteFiles: string;
  deleteOriginalMedia: string;
  cancelTranscription: string;
  cancelTask: string;
  rowsPerPage: string;
};

const workspaceActionCopy: Record<Locale, WorkspaceActionCopy> = {
  ar: {
    renameFile: "إعادة تسمية الملف",
    rename: "إعادة تسمية",
    enterNewFilename: "أدخل اسم ملف جديد",
    moveToFolder: "نقل إلى مجلد",
    move: "نقل",
    movingFileFrom: (title, folder) => `نقل "${title}" من ${folder}`,
    movingSelectedFiles: (count) => `نقل ${count} ملفات محددة`,
    exportSelectedFiles: (count) => `تصدير ${count} ملفات محددة`,
    fileFormat: "تنسيق الملف",
    exportDescription: "اختر تنسيق التصدير وخصص إعدادات الإخراج",
    noFoldersAvailable: "لا توجد مجلدات متاحة",
    deleteTranscription: "حذف التفريغ",
    deleteTranscriptionConfirm: (title) => `هل أنت متأكد من حذف ${title}؟`,
    delete: "حذف",
    deleteSelectedFiles: "حذف الملفات المحددة",
    deleteSelectedFilesConfirm: (count) => `هل أنت متأكد من حذف ${count} ملفات محددة؟`,
    deleteCannotBeUndone: "لا يمكن التراجع عن هذا الإجراء. سيتم حذف كل الملفات المحددة نهائياً.",
    deleteFiles: "حذف الملفات",
    deleteOriginalMedia: "حذف الوسائط الأصلية",
    cancelTranscription: "إلغاء التفريغ",
    cancelTask: "إلغاء المهمة",
    rowsPerPage: "صفوف لكل صفحة"
  },
  de: {
    renameFile: "Datei umbenennen",
    rename: "Umbenennen",
    enterNewFilename: "Neuen Dateinamen eingeben",
    moveToFolder: "In Ordner verschieben",
    move: "Verschieben",
    movingFileFrom: (title, folder) => `"${title}" aus ${folder} verschieben`,
    movingSelectedFiles: (count) => `${count} ausgewahlte Dateien verschieben`,
    exportSelectedFiles: (count) => `${count} ausgewahlte Dateien exportieren`,
    fileFormat: "Dateiformat",
    exportDescription: "Wahle dein Exportformat und passe die Ausgabe an",
    noFoldersAvailable: "Keine Ordner verfugbar",
    deleteTranscription: "Transkript loschen",
    deleteTranscriptionConfirm: (title) => `Mochtest du ${title} wirklich loschen?`,
    delete: "Loschen",
    deleteSelectedFiles: "Ausgewahlte Dateien loschen",
    deleteSelectedFilesConfirm: (count) => `Mochtest du ${count} ausgewahlte Dateien wirklich loschen?`,
    deleteCannotBeUndone: "Diese Aktion kann nicht ruckgangig gemacht werden. Alle ausgewahlten Dateien werden dauerhaft geloscht.",
    deleteFiles: "Dateien loschen",
    deleteOriginalMedia: "Originalmedien loschen",
    cancelTranscription: "Transkription abbrechen",
    cancelTask: "Aufgabe abbrechen",
    rowsPerPage: "Zeilen pro Seite"
  },
  en: {
    renameFile: "Rename File",
    rename: "Rename",
    enterNewFilename: "Enter new filename",
    moveToFolder: "Move to Folder",
    move: "Move",
    movingFileFrom: (title, folder) => `Moving "${title}" from ${folder}`,
    movingSelectedFiles: (count) => `Moving ${count} selected files`,
    exportSelectedFiles: (count) => `Export ${count} selected files`,
    fileFormat: "File Format",
    exportDescription: "Choose your export format and customize the output settings",
    noFoldersAvailable: "No folders available",
    deleteTranscription: "Delete Transcription",
    deleteTranscriptionConfirm: (title) => `Are you sure you want to delete ${title}?`,
    delete: "Delete",
    deleteSelectedFiles: "Delete Selected Files",
    deleteSelectedFilesConfirm: (count) => `Are you sure you want to delete ${count} selected files?`,
    deleteCannotBeUndone: "This action cannot be undone. All selected files will be permanently deleted.",
    deleteFiles: "Delete Files",
    deleteOriginalMedia: "Delete Original Media",
    cancelTranscription: "Cancel Transcription",
    cancelTask: "Cancel Task",
    rowsPerPage: "Rows per page"
  },
  es: {
    renameFile: "Renombrar archivo",
    rename: "Renombrar",
    enterNewFilename: "Introduce un nuevo nombre",
    moveToFolder: "Mover a carpeta",
    move: "Mover",
    movingFileFrom: (title, folder) => `Moviendo "${title}" desde ${folder}`,
    movingSelectedFiles: (count) => `Moviendo ${count} archivos seleccionados`,
    exportSelectedFiles: (count) => `Exportar ${count} archivos seleccionados`,
    fileFormat: "Formato de archivo",
    exportDescription: "Elige el formato de exportación y personaliza la salida",
    noFoldersAvailable: "No hay carpetas disponibles",
    deleteTranscription: "Eliminar transcripción",
    deleteTranscriptionConfirm: (title) => `¿Seguro que quieres eliminar ${title}?`,
    delete: "Eliminar",
    deleteSelectedFiles: "Eliminar archivos seleccionados",
    deleteSelectedFilesConfirm: (count) => `¿Seguro que quieres eliminar ${count} archivos seleccionados?`,
    deleteCannotBeUndone: "Esta acción no se puede deshacer. Todos los archivos seleccionados se eliminarán permanentemente.",
    deleteFiles: "Eliminar archivos",
    deleteOriginalMedia: "Eliminar medio original",
    cancelTranscription: "Cancelar transcripción",
    cancelTask: "Cancelar tarea",
    rowsPerPage: "Filas por página"
  },
  fr: {
    renameFile: "Renommer le fichier",
    rename: "Renommer",
    enterNewFilename: "Saisir un nouveau nom",
    moveToFolder: "Déplacer vers un dossier",
    move: "Déplacer",
    movingFileFrom: (title, folder) => `Déplacement de "${title}" depuis ${folder}`,
    movingSelectedFiles: (count) => `Déplacement de ${count} fichiers sélectionnés`,
    exportSelectedFiles: (count) => `Exporter ${count} fichiers sélectionnés`,
    fileFormat: "Format de fichier",
    exportDescription: "Choisissez le format d'export et personnalisez la sortie",
    noFoldersAvailable: "Aucun dossier disponible",
    deleteTranscription: "Supprimer la transcription",
    deleteTranscriptionConfirm: (title) => `Voulez-vous vraiment supprimer ${title} ?`,
    delete: "Supprimer",
    deleteSelectedFiles: "Supprimer les fichiers sélectionnés",
    deleteSelectedFilesConfirm: (count) => `Voulez-vous vraiment supprimer ${count} fichiers sélectionnés ?`,
    deleteCannotBeUndone: "Cette action est irréversible. Tous les fichiers sélectionnés seront définitivement supprimés.",
    deleteFiles: "Supprimer les fichiers",
    deleteOriginalMedia: "Supprimer le média original",
    cancelTranscription: "Annuler la transcription",
    cancelTask: "Annuler la tâche",
    rowsPerPage: "Lignes par page"
  },
  hu: {
    renameFile: "Fájl átnevezése",
    rename: "Átnevezés",
    enterNewFilename: "Új fájlnév megadása",
    moveToFolder: "Áthelyezés mappába",
    move: "Áthelyezés",
    movingFileFrom: (title, folder) => `"${title}" áthelyezése innen: ${folder}`,
    movingSelectedFiles: (count) => `${count} kijelölt fájl áthelyezése`,
    exportSelectedFiles: (count) => `${count} kijelölt fájl exportálása`,
    fileFormat: "Fájlformátum",
    exportDescription: "Válassz exportformátumot és állítsd be a kimenetet",
    noFoldersAvailable: "Nincs elérhető mappa",
    deleteTranscription: "Átirat törlése",
    deleteTranscriptionConfirm: (title) => `Biztosan törlöd ezt: ${title}?`,
    delete: "Törlés",
    deleteSelectedFiles: "Kijelölt fájlok törlése",
    deleteSelectedFilesConfirm: (count) => `Biztosan törlöd a(z) ${count} kijelölt fájlt?`,
    deleteCannotBeUndone: "Ez a művelet nem vonható vissza. Minden kijelölt fájl véglegesen törlődik.",
    deleteFiles: "Fájlok törlése",
    deleteOriginalMedia: "Eredeti média törlése",
    cancelTranscription: "Átírás megszakítása",
    cancelTask: "Feladat megszakítása",
    rowsPerPage: "Sor oldalanként"
  },
  id: {
    renameFile: "Ganti Nama File",
    rename: "Ganti nama",
    enterNewFilename: "Masukkan nama file baru",
    moveToFolder: "Pindahkan ke Folder",
    move: "Pindahkan",
    movingFileFrom: (title, folder) => `Memindahkan "${title}" dari ${folder}`,
    movingSelectedFiles: (count) => `Memindahkan ${count} file yang dipilih`,
    exportSelectedFiles: (count) => `Ekspor ${count} file yang dipilih`,
    fileFormat: "Format File",
    exportDescription: "Pilih format ekspor dan sesuaikan pengaturan output",
    noFoldersAvailable: "Tidak ada folder tersedia",
    deleteTranscription: "Hapus Transkripsi",
    deleteTranscriptionConfirm: (title) => `Yakin ingin menghapus ${title}?`,
    delete: "Hapus",
    deleteSelectedFiles: "Hapus File Terpilih",
    deleteSelectedFilesConfirm: (count) => `Yakin ingin menghapus ${count} file yang dipilih?`,
    deleteCannotBeUndone: "Tindakan ini tidak dapat dibatalkan. Semua file yang dipilih akan dihapus permanen.",
    deleteFiles: "Hapus File",
    deleteOriginalMedia: "Hapus Media Asli",
    cancelTranscription: "Batalkan Transkripsi",
    cancelTask: "Batalkan Tugas",
    rowsPerPage: "Baris per halaman"
  },
  it: {
    renameFile: "Rinomina file",
    rename: "Rinomina",
    enterNewFilename: "Inserisci nuovo nome file",
    moveToFolder: "Sposta nella cartella",
    move: "Sposta",
    movingFileFrom: (title, folder) => `Spostamento di "${title}" da ${folder}`,
    movingSelectedFiles: (count) => `Spostamento di ${count} file selezionati`,
    exportSelectedFiles: (count) => `Esporta ${count} file selezionati`,
    fileFormat: "Formato file",
    exportDescription: "Scegli il formato di esportazione e personalizza l'output",
    noFoldersAvailable: "Nessuna cartella disponibile",
    deleteTranscription: "Elimina trascrizione",
    deleteTranscriptionConfirm: (title) => `Vuoi eliminare ${title}?`,
    delete: "Elimina",
    deleteSelectedFiles: "Elimina file selezionati",
    deleteSelectedFilesConfirm: (count) => `Vuoi eliminare ${count} file selezionati?`,
    deleteCannotBeUndone: "Questa azione non può essere annullata. Tutti i file selezionati saranno eliminati definitivamente.",
    deleteFiles: "Elimina file",
    deleteOriginalMedia: "Elimina media originale",
    cancelTranscription: "Annulla trascrizione",
    cancelTask: "Annulla attività",
    rowsPerPage: "Righe per pagina"
  },
  ja: {
    renameFile: "ファイル名を変更",
    rename: "名前を変更",
    enterNewFilename: "新しいファイル名を入力",
    moveToFolder: "フォルダへ移動",
    move: "移動",
    movingFileFrom: (title, folder) => `"${title}" を ${folder} から移動`,
    movingSelectedFiles: (count) => `選択した ${count} 件のファイルを移動`,
    exportSelectedFiles: (count) => `選択した ${count} 件のファイルをエクスポート`,
    fileFormat: "ファイル形式",
    exportDescription: "エクスポート形式を選択し、出力設定をカスタマイズします",
    noFoldersAvailable: "利用できるフォルダがありません",
    deleteTranscription: "文字起こしを削除",
    deleteTranscriptionConfirm: (title) => `${title} を削除してもよろしいですか？`,
    delete: "削除",
    deleteSelectedFiles: "選択したファイルを削除",
    deleteSelectedFilesConfirm: (count) => `選択した ${count} 件のファイルを削除してもよろしいですか？`,
    deleteCannotBeUndone: "この操作は元に戻せません。選択したファイルは完全に削除されます。",
    deleteFiles: "ファイルを削除",
    deleteOriginalMedia: "元メディアを削除",
    cancelTranscription: "文字起こしをキャンセル",
    cancelTask: "タスクをキャンセル",
    rowsPerPage: "1ページあたりの行数"
  },
  ko: {
    renameFile: "파일 이름 변경",
    rename: "이름 변경",
    enterNewFilename: "새 파일 이름 입력",
    moveToFolder: "폴더로 이동",
    move: "이동",
    movingFileFrom: (title, folder) => `"${title}"을(를) ${folder}에서 이동`,
    movingSelectedFiles: (count) => `선택한 파일 ${count}개 이동`,
    exportSelectedFiles: (count) => `선택한 파일 ${count}개 내보내기`,
    fileFormat: "파일 형식",
    exportDescription: "내보내기 형식을 선택하고 출력 설정을 조정하세요",
    noFoldersAvailable: "사용 가능한 폴더가 없습니다",
    deleteTranscription: "전사 삭제",
    deleteTranscriptionConfirm: (title) => `${title}을(를) 삭제하시겠습니까?`,
    delete: "삭제",
    deleteSelectedFiles: "선택한 파일 삭제",
    deleteSelectedFilesConfirm: (count) => `선택한 파일 ${count}개를 삭제하시겠습니까?`,
    deleteCannotBeUndone: "이 작업은 되돌릴 수 없습니다. 선택한 모든 파일이 영구적으로 삭제됩니다.",
    deleteFiles: "파일 삭제",
    deleteOriginalMedia: "원본 미디어 삭제",
    cancelTranscription: "전사 취소",
    cancelTask: "작업 취소",
    rowsPerPage: "페이지당 행"
  },
  nl: {
    renameFile: "Bestand hernoemen",
    rename: "Hernoemen",
    enterNewFilename: "Nieuwe bestandsnaam invoeren",
    moveToFolder: "Naar map verplaatsen",
    move: "Verplaatsen",
    movingFileFrom: (title, folder) => `"${title}" verplaatsen vanuit ${folder}`,
    movingSelectedFiles: (count) => `${count} geselecteerde bestanden verplaatsen`,
    exportSelectedFiles: (count) => `${count} geselecteerde bestanden exporteren`,
    fileFormat: "Bestandsindeling",
    exportDescription: "Kies je exportindeling en pas de uitvoerinstellingen aan",
    noFoldersAvailable: "Geen mappen beschikbaar",
    deleteTranscription: "Transcriptie verwijderen",
    deleteTranscriptionConfirm: (title) => `Weet je zeker dat je ${title} wilt verwijderen?`,
    delete: "Verwijderen",
    deleteSelectedFiles: "Geselecteerde bestanden verwijderen",
    deleteSelectedFilesConfirm: (count) => `Weet je zeker dat je ${count} geselecteerde bestanden wilt verwijderen?`,
    deleteCannotBeUndone: "Deze actie kan niet ongedaan worden gemaakt. Alle geselecteerde bestanden worden permanent verwijderd.",
    deleteFiles: "Bestanden verwijderen",
    deleteOriginalMedia: "Originele media verwijderen",
    cancelTranscription: "Transcriptie annuleren",
    cancelTask: "Taak annuleren",
    rowsPerPage: "Rijen per pagina"
  },
  pl: {
    renameFile: "Zmień nazwę pliku",
    rename: "Zmień nazwę",
    enterNewFilename: "Wpisz nową nazwę pliku",
    moveToFolder: "Przenieś do folderu",
    move: "Przenieś",
    movingFileFrom: (title, folder) => `Przenoszenie „${title}” z ${folder}`,
    movingSelectedFiles: (count) => `Przenoszenie ${count} zaznaczonych plików`,
    exportSelectedFiles: (count) => `Eksportuj ${count} zaznaczonych plików`,
    fileFormat: "Format pliku",
    exportDescription: "Wybierz format eksportu i dostosuj ustawienia wyjściowe",
    noFoldersAvailable: "Brak dostępnych folderów",
    deleteTranscription: "Usuń transkrypcję",
    deleteTranscriptionConfirm: (title) => `Czy na pewno chcesz usunąć ${title}?`,
    delete: "Usuń",
    deleteSelectedFiles: "Usuń zaznaczone pliki",
    deleteSelectedFilesConfirm: (count) => `Czy na pewno chcesz usunąć ${count} zaznaczonych plików?`,
    deleteCannotBeUndone: "Tej akcji nie można cofnąć. Wszystkie zaznaczone pliki zostaną trwale usunięte.",
    deleteFiles: "Usuń pliki",
    deleteOriginalMedia: "Usuń oryginalne media",
    cancelTranscription: "Anuluj transkrypcję",
    cancelTask: "Anuluj zadanie",
    rowsPerPage: "Wierszy na stronę"
  },
  pt: {
    renameFile: "Renomear arquivo",
    rename: "Renomear",
    enterNewFilename: "Digite o novo nome do arquivo",
    moveToFolder: "Mover para pasta",
    move: "Mover",
    movingFileFrom: (title, folder) => `Movendo "${title}" de ${folder}`,
    movingSelectedFiles: (count) => `Movendo ${count} arquivos selecionados`,
    exportSelectedFiles: (count) => `Exportar ${count} arquivos selecionados`,
    fileFormat: "Formato do arquivo",
    exportDescription: "Escolha o formato de exportação e personalize a saída",
    noFoldersAvailable: "Nenhuma pasta disponível",
    deleteTranscription: "Excluir transcrição",
    deleteTranscriptionConfirm: (title) => `Tem certeza de que deseja excluir ${title}?`,
    delete: "Excluir",
    deleteSelectedFiles: "Excluir arquivos selecionados",
    deleteSelectedFilesConfirm: (count) => `Tem certeza de que deseja excluir ${count} arquivos selecionados?`,
    deleteCannotBeUndone: "Esta ação não pode ser desfeita. Todos os arquivos selecionados serão excluídos permanentemente.",
    deleteFiles: "Excluir arquivos",
    deleteOriginalMedia: "Excluir mídia original",
    cancelTranscription: "Cancelar transcrição",
    cancelTask: "Cancelar tarefa",
    rowsPerPage: "Linhas por página"
  },
  ru: {
    renameFile: "Переименовать файл",
    rename: "Переименовать",
    enterNewFilename: "Введите новое имя файла",
    moveToFolder: "Переместить в папку",
    move: "Переместить",
    movingFileFrom: (title, folder) => `Перемещение «${title}» из ${folder}`,
    movingSelectedFiles: (count) => `Перемещение выбранных файлов: ${count}`,
    exportSelectedFiles: (count) => `Экспорт выбранных файлов: ${count}`,
    fileFormat: "Формат файла",
    exportDescription: "Выберите формат экспорта и настройте параметры вывода",
    noFoldersAvailable: "Нет доступных папок",
    deleteTranscription: "Удалить расшифровку",
    deleteTranscriptionConfirm: (title) => `Вы уверены, что хотите удалить ${title}?`,
    delete: "Удалить",
    deleteSelectedFiles: "Удалить выбранные файлы",
    deleteSelectedFilesConfirm: (count) => `Вы уверены, что хотите удалить выбранные файлы (${count})?`,
    deleteCannotBeUndone: "Это действие нельзя отменить. Все выбранные файлы будут удалены навсегда.",
    deleteFiles: "Удалить файлы",
    deleteOriginalMedia: "Удалить исходные медиа",
    cancelTranscription: "Отменить транскрибацию",
    cancelTask: "Отменить задачу",
    rowsPerPage: "Строк на странице"
  },
  th: {
    renameFile: "เปลี่ยนชื่อไฟล์",
    rename: "เปลี่ยนชื่อ",
    enterNewFilename: "ป้อนชื่อไฟล์ใหม่",
    moveToFolder: "ย้ายไปยังโฟลเดอร์",
    move: "ย้าย",
    movingFileFrom: (title, folder) => `กำลังย้าย "${title}" จาก ${folder}`,
    movingSelectedFiles: (count) => `กำลังย้ายไฟล์ที่เลือก ${count} ไฟล์`,
    exportSelectedFiles: (count) => `ส่งออกไฟล์ที่เลือก ${count} ไฟล์`,
    fileFormat: "รูปแบบไฟล์",
    exportDescription: "เลือกรูปแบบการส่งออกและปรับแต่งการตั้งค่าเอาต์พุต",
    noFoldersAvailable: "ไม่มีโฟลเดอร์ที่ใช้ได้",
    deleteTranscription: "ลบทรานสคริปต์",
    deleteTranscriptionConfirm: (title) => `คุณแน่ใจหรือไม่ว่าต้องการลบ ${title}?`,
    delete: "ลบ",
    deleteSelectedFiles: "ลบไฟล์ที่เลือก",
    deleteSelectedFilesConfirm: (count) => `คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ที่เลือก ${count} ไฟล์?`,
    deleteCannotBeUndone: "การดำเนินการนี้ย้อนกลับไม่ได้ ไฟล์ที่เลือกทั้งหมดจะถูกลบอย่างถาวร",
    deleteFiles: "ลบไฟล์",
    deleteOriginalMedia: "ลบสื่อต้นฉบับ",
    cancelTranscription: "ยกเลิกการถอดเสียง",
    cancelTask: "ยกเลิกงาน",
    rowsPerPage: "แถวต่อหน้า"
  },
  tr: {
    renameFile: "Dosyayi yeniden adlandir",
    rename: "Yeniden adlandir",
    enterNewFilename: "Yeni dosya adini girin",
    moveToFolder: "Klasore tasi",
    move: "Tasi",
    movingFileFrom: (title, folder) => `"${title}" ${folder} konumundan tasiniyor`,
    movingSelectedFiles: (count) => `${count} secili dosya tasiniyor`,
    exportSelectedFiles: (count) => `${count} secili dosya disa aktariliyor`,
    fileFormat: "Dosya formati",
    exportDescription: "Disa aktarma formatini secin ve cikti ayarlarini ozellestirin",
    noFoldersAvailable: "Kullanilabilir klasor yok",
    deleteTranscription: "Transkripti sil",
    deleteTranscriptionConfirm: (title) => `${title} silinsin mi?`,
    delete: "Sil",
    deleteSelectedFiles: "Secili dosyalari sil",
    deleteSelectedFilesConfirm: (count) => `${count} secili dosyayi silmek istediginize emin misiniz?`,
    deleteCannotBeUndone: "Bu islem geri alinamaz. Secili tum dosyalar kalici olarak silinir.",
    deleteFiles: "Dosyalari sil",
    deleteOriginalMedia: "Orijinal medyayi sil",
    cancelTranscription: "Transkripsiyonu iptal et",
    cancelTask: "Gorevi iptal et",
    rowsPerPage: "Sayfa basina satir"
  },
  uk: {
    renameFile: "Перейменувати файл",
    rename: "Перейменувати",
    enterNewFilename: "Введіть нову назву файлу",
    moveToFolder: "Перемістити до папки",
    move: "Перемістити",
    movingFileFrom: (title, folder) => `Переміщення «${title}» з ${folder}`,
    movingSelectedFiles: (count) => `Переміщення вибраних файлів: ${count}`,
    exportSelectedFiles: (count) => `Експорт вибраних файлів: ${count}`,
    fileFormat: "Формат файлу",
    exportDescription: "Виберіть формат експорту та налаштуйте параметри виводу",
    noFoldersAvailable: "Немає доступних папок",
    deleteTranscription: "Видалити транскрипцію",
    deleteTranscriptionConfirm: (title) => `Ви впевнені, що хочете видалити ${title}?`,
    delete: "Видалити",
    deleteSelectedFiles: "Видалити вибрані файли",
    deleteSelectedFilesConfirm: (count) => `Ви впевнені, що хочете видалити вибрані файли (${count})?`,
    deleteCannotBeUndone: "Цю дію не можна скасувати. Усі вибрані файли буде остаточно видалено.",
    deleteFiles: "Видалити файли",
    deleteOriginalMedia: "Видалити оригінальні медіа",
    cancelTranscription: "Скасувати транскрипцію",
    cancelTask: "Скасувати завдання",
    rowsPerPage: "Рядків на сторінці"
  },
  vi: {
    renameFile: "Đổi tên tệp",
    rename: "Đổi tên",
    enterNewFilename: "Nhập tên tệp mới",
    moveToFolder: "Chuyển vào thư mục",
    move: "Chuyển",
    movingFileFrom: (title, folder) => `Đang chuyển "${title}" từ ${folder}`,
    movingSelectedFiles: (count) => `Đang chuyển ${count} tệp đã chọn`,
    exportSelectedFiles: (count) => `Xuất ${count} tệp đã chọn`,
    fileFormat: "Định dạng tệp",
    exportDescription: "Chọn định dạng xuất và tùy chỉnh đầu ra",
    noFoldersAvailable: "Không có thư mục nào",
    deleteTranscription: "Xóa bản ghi",
    deleteTranscriptionConfirm: (title) => `Bạn có chắc muốn xóa ${title}?`,
    delete: "Xóa",
    deleteSelectedFiles: "Xóa tệp đã chọn",
    deleteSelectedFilesConfirm: (count) => `Bạn có chắc muốn xóa ${count} tệp đã chọn?`,
    deleteCannotBeUndone: "Không thể hoàn tác hành động này. Tất cả tệp đã chọn sẽ bị xóa vĩnh viễn.",
    deleteFiles: "Xóa tệp",
    deleteOriginalMedia: "Xóa media gốc",
    cancelTranscription: "Hủy bản ghi",
    cancelTask: "Hủy tác vụ",
    rowsPerPage: "Hàng mỗi trang"
  },
  zh: {
    renameFile: "重命名文件",
    rename: "重命名",
    enterNewFilename: "输入新的文件名",
    moveToFolder: "移动到文件夹",
    move: "移动",
    movingFileFrom: (title, folder) => `正在将“${title}”从 ${folder} 移动`,
    movingSelectedFiles: (count) => `正在移动 ${count} 个已选文件`,
    exportSelectedFiles: (count) => `导出 ${count} 个已选文件`,
    fileFormat: "文件格式",
    exportDescription: "选择导出格式并自定义输出设置",
    noFoldersAvailable: "暂无可用文件夹",
    deleteTranscription: "删除转写",
    deleteTranscriptionConfirm: (title) => `确定要删除 ${title} 吗？`,
    delete: "删除",
    deleteSelectedFiles: "删除已选文件",
    deleteSelectedFilesConfirm: (count) => `确定要删除 ${count} 个已选文件吗？`,
    deleteCannotBeUndone: "此操作无法撤销。所有已选文件都会被永久删除。",
    deleteFiles: "删除文件",
    deleteOriginalMedia: "删除原始媒体",
    cancelTranscription: "取消转写",
    cancelTask: "取消任务",
    rowsPerPage: "每页行数"
  },
  "zh-TW": {
    renameFile: "重新命名檔案",
    rename: "重新命名",
    enterNewFilename: "輸入新的檔案名稱",
    moveToFolder: "移動到資料夾",
    move: "移動",
    movingFileFrom: (title, folder) => `正在將「${title}」從 ${folder} 移動`,
    movingSelectedFiles: (count) => `正在移動 ${count} 個已選檔案`,
    exportSelectedFiles: (count) => `匯出 ${count} 個已選檔案`,
    fileFormat: "檔案格式",
    exportDescription: "選擇匯出格式並自訂輸出設定",
    noFoldersAvailable: "暫無可用資料夾",
    deleteTranscription: "刪除轉寫",
    deleteTranscriptionConfirm: (title) => `確定要刪除 ${title} 嗎？`,
    delete: "刪除",
    deleteSelectedFiles: "刪除已選檔案",
    deleteSelectedFilesConfirm: (count) => `確定要刪除 ${count} 個已選檔案嗎？`,
    deleteCannotBeUndone: "此操作無法復原。所有已選檔案都會被永久刪除。",
    deleteFiles: "刪除檔案",
    deleteOriginalMedia: "刪除原始媒體",
    cancelTranscription: "取消轉寫",
    cancelTask: "取消任務",
    rowsPerPage: "每頁列數"
  }
};

const appMessagesByLocale: Record<Locale, typeof enMessages.app> = {
  ar: arMessages.app,
  de: deMessages.app,
  en: enMessages.app,
  es: esMessages.app,
  fr: frMessages.app,
  hu: huMessages.app,
  id: idMessages.app,
  it: itMessages.app,
  ja: jaMessages.app,
  ko: koMessages.app,
  nl: nlMessages.app,
  pl: plMessages.app,
  pt: ptMessages.app,
  ru: ruMessages.app,
  th: thMessages.app,
  tr: trMessages.app,
  uk: ukMessages.app,
  vi: viMessages.app,
  zh: zhMessages.app,
  "zh-TW": zhTwMessages.app
};

function workspaceMessageOverrides(locale: Locale) {
  const app = appMessagesByLocale[locale];
  const orLabel: Record<Locale, string> = {
    ar: "أو",
    de: "oder",
    en: "or",
    es: "o",
    fr: "ou",
    hu: "vagy",
    id: "atau",
    it: "o",
    ja: "または",
    ko: "또는",
    nl: "of",
    pl: "lub",
    pt: "ou",
    ru: "или",
    th: "หรือ",
    tr: "veya",
    uk: "або",
    vi: "hoặc",
    zh: "或",
    "zh-TW": "或"
  };
  const legalNoticeCopy: Record<Locale, {prefix: string; terms: string; connector: string; privacy: string; suffix: string}> = {
    ar: {prefix: "باستخدام Votxt، فإنك توافق على ", terms: "شروط الخدمة", connector: " و", privacy: "سياسة الخصوصية", suffix: "."},
    de: {prefix: "Mit der Nutzung von Votxt stimmst du den ", terms: "Nutzungsbedingungen", connector: " und der ", privacy: "Datenschutzerklaerung", suffix: " zu."},
    en: {prefix: "By using Votxt, you agree to our ", terms: "Terms of Service", connector: " and ", privacy: "Privacy Policy", suffix: "."},
    es: {prefix: "Al usar Votxt, aceptas nuestros ", terms: "Terminos de servicio", connector: " y la ", privacy: "Politica de privacidad", suffix: "."},
    fr: {prefix: "En utilisant Votxt, vous acceptez les ", terms: "conditions d'utilisation", connector: " et la ", privacy: "politique de confidentialite", suffix: "."},
    hu: {prefix: "A Votxt hasznalataval elfogadod a ", terms: "szolgaltatasi felteteleket", connector: " es az ", privacy: "adatvedelmi szabalyzatot", suffix: "."},
    id: {prefix: "Dengan menggunakan Votxt, Anda menyetujui ", terms: "Ketentuan Layanan", connector: " dan ", privacy: "Kebijakan Privasi", suffix: "."},
    it: {prefix: "Usando Votxt accetti i ", terms: "Termini di servizio", connector: " e l'", privacy: "Informativa sulla privacy", suffix: "."},
    ja: {prefix: "Votxt を使用すると、", terms: "利用規約", connector: "および", privacy: "プライバシーポリシー", suffix: "に同意したものとみなされます。"},
    ko: {prefix: "Votxt를 사용하면 ", terms: "서비스 약관", connector: " 및 ", privacy: "개인정보 처리방침", suffix: "에 동의하는 것입니다."},
    nl: {prefix: "Door Votxt te gebruiken ga je akkoord met de ", terms: "servicevoorwaarden", connector: " en het ", privacy: "privacybeleid", suffix: "."},
    pl: {prefix: "Korzystajac z Votxt akceptujesz ", terms: "warunki korzystania", connector: " oraz ", privacy: "polityke prywatnosci", suffix: "."},
    pt: {prefix: "Ao usar o Votxt, voce concorda com os ", terms: "Termos de Servico", connector: " e a ", privacy: "Politica de Privacidade", suffix: "."},
    ru: {prefix: "Используя Votxt, вы соглашаетесь с ", terms: "условиями сервиса", connector: " и ", privacy: "политикой конфиденциальности", suffix: "."},
    th: {prefix: "เมื่อใช้ Votxt คุณยอมรับ", terms: "ข้อกำหนดการให้บริการ", connector: "และ", privacy: "นโยบายความเป็นส่วนตัว", suffix: ""},
    tr: {prefix: "Votxt'i kullanarak ", terms: "Hizmet Sartlari", connector: " ve ", privacy: "Gizlilik Politikasi", suffix: "ni kabul edersiniz."},
    uk: {prefix: "Використовуючи Votxt, ви погоджуєтесь з ", terms: "умовами сервісу", connector: " і ", privacy: "політикою конфіденційності", suffix: "."},
    vi: {prefix: "Khi su dung Votxt, ban dong y voi ", terms: "Dieu khoan dich vu", connector: " va ", privacy: "Chinh sach quyen rieng tu", suffix: "."},
    zh: {prefix: "使用 Votxt 即表示你同意", terms: "服务条款", connector: "和", privacy: "隐私政策", suffix: "。"},
    "zh-TW": {prefix: "使用 Votxt 即表示你同意", terms: "服務條款", connector: "和", privacy: "隱私權政策", suffix: "。"}
  };

  return {
    ...workspacePanelCopy[locale],
    ...workspaceActionCopy[locale],
    marketingIntro: app.subheadline,
    freeSignup: app.tryFree,
    converterTools: app.features,
    freePlan: app.freePlan,
    dailyFiles: app.quotaFiles,
    monthlyMinutes: app.quotaMinutes,
    monthTasks: app.taskList,
    transcriptTab: app.transcript,
    translationTab: app.translation,
    targetLanguage: app.language,
    youtubeTask: app.youtube,
    unnamedTask: app.transcript,
    waiting: app.processing,
    remainingMinutes: app.quotaMinutes,
    usedThisMonth: app.quotaMinutes,
    whyTitle: app.features,
    workflowTitle: app.workflowTitle,
    workflowUpload: app.workflowUpload,
    workflowUploadText: app.workflowUploadText,
    workflowTranscribe: app.workflowTranscribe,
    workflowTranscribeText: app.workflowTranscribeText,
    workflowExport: app.workflowExport,
    workflowExportText: app.workflowExportText,
    plansTitle: app.plansTitle,
    minutesUnit: app.languages.includes("63") ? "min" : "min",
    viewFullPricing: app.pricing,
    blog: app.blog,
    needFile: app.drop,
    createTaskError: app.failed,
    readTasksError: app.failed,
    readUsageError: app.failed,
    readTaskError: app.failed,
    shareTitle: app.transcript,
    transcriptSaved: app.save,
    translationGenerated: app.translation,
    uploadPrompt: app.localUploadHint,
    legalNotice: legalNoticeCopy[locale],
    pastePrompt: app.youtubePlaceholder,
    dragFilesHere: app.drop,
    or: orLabel[locale],
    uploadAFile: app.choose,
    mediaLinkPlaceholder: app.youtubePlaceholder,
    search: app.searchPlaceholder,
    transcribeForFree: app.tryFree,
    manageTranscriptions: app.allTranscriptions,
    goToDashboard: app.workspace
  };
}

type WorkspaceLinkUploadCopy = {
  recentFiles: string;
  clear: string;
  filesSelected: (count: number, max: number) => string;
  startUpload: (count: number) => string;
  supportedFormatsLimits: string;
  audioFormats: string;
  videoFormats: string;
  maximumFiles: string;
  maximumFilesValue: string;
  maximumFileSize: string;
  maximumFileSizeValue: string;
  supportedPlatformsLabel: string;
  manyOtherLinks: string;
  linkInput: string;
  checkLink: string;
  checkingLink: string;
  availableMinutes: string;
  buyMoreMinutes: string;
  transcribe: string;
  downloadVideo: string;
  changeLink: string;
};

const workspaceLinkUploadCopy: Record<Locale, WorkspaceLinkUploadCopy> = {
  ar: {recentFiles: "الملفات الأخيرة", clear: "مسح", filesSelected: (count, max) => `${count} / ${max} ملفات`, startUpload: (count) => (count > 1 ? `بدء رفع ${count} ملفات` : "بدء الرفع"), supportedFormatsLimits: "الصيغ والحدود المدعومة", audioFormats: "صيغ الصوت", videoFormats: "صيغ الفيديو", maximumFiles: "الحد الأقصى للملفات", maximumFilesValue: "50 ملفاً كحد أقصى", maximumFileSize: "الحد الأقصى لحجم الملف", maximumFileSizeValue: "5GB لكل ملف", supportedPlatformsLabel: "المنصات المدعومة", manyOtherLinks: "روابط أخرى كثيرة", linkInput: "إدخال الرابط", checkLink: "فحص الرابط", checkingLink: "جار فحص الرابط...", availableMinutes: "الدقائق المتاحة:", buyMoreMinutes: "شراء دقائق إضافية", transcribe: "تفريغ", downloadVideo: "انقر هنا لتنزيل الفيديو", changeLink: "تغيير الرابط"},
  de: {recentFiles: "Letzte Dateien", clear: "Leeren", filesSelected: (count, max) => `${count} / ${max} Dateien`, startUpload: (count) => (count > 1 ? `${count} Uploads starten` : "Upload starten"), supportedFormatsLimits: "Unterstützte Formate & Limits", audioFormats: "Audioformate", videoFormats: "Videoformate", maximumFiles: "Maximale Dateien", maximumFilesValue: "Maximal 50 Dateien", maximumFileSize: "Maximale Dateigröße", maximumFileSizeValue: "5GB pro Datei", supportedPlatformsLabel: "Unterstützte Plattformen", manyOtherLinks: "Viele weitere Links", linkInput: "Link-Eingabe", checkLink: "Link prüfen", checkingLink: "Link wird geprüft...", availableMinutes: "Verfügbare Minuten:", buyMoreMinutes: "Mehr Minuten kaufen", transcribe: "Transkribieren", downloadVideo: "Hier klicken, um das Video herunterzuladen", changeLink: "Link ändern"},
  en: {recentFiles: "Recent Files", clear: "Clear", filesSelected: (count, max) => `${count} / ${max} files`, startUpload: (count) => (count > 1 ? `Start ${count} Uploads` : "Start Upload"), supportedFormatsLimits: "Supported Formats & Limits", audioFormats: "Audio Formats", videoFormats: "Video Formats", maximumFiles: "Maximum files", maximumFilesValue: "Maximum 50 files", maximumFileSize: "Maximum file size", maximumFileSizeValue: "Maximum file size: 5GB per file", supportedPlatformsLabel: "Supported platforms", manyOtherLinks: "Many other links", linkInput: "Link input", checkLink: "Check link", checkingLink: "Checking link...", availableMinutes: "Available minutes:", buyMoreMinutes: "Buy More Minutes", transcribe: "Transcribe", downloadVideo: "Click here to download video", changeLink: "Change link"},
  es: {recentFiles: "Archivos recientes", clear: "Limpiar", filesSelected: (count, max) => `${count} / ${max} archivos`, startUpload: (count) => (count > 1 ? `Iniciar ${count} cargas` : "Iniciar carga"), supportedFormatsLimits: "Formatos y límites admitidos", audioFormats: "Formatos de audio", videoFormats: "Formatos de video", maximumFiles: "Máximo de archivos", maximumFilesValue: "Máximo 50 archivos", maximumFileSize: "Tamaño máximo de archivo", maximumFileSizeValue: "Tamaño máximo: 5GB por archivo", supportedPlatformsLabel: "Plataformas admitidas", manyOtherLinks: "Muchos otros enlaces", linkInput: "Campo de enlace", checkLink: "Comprobar enlace", checkingLink: "Comprobando enlace...", availableMinutes: "Minutos disponibles:", buyMoreMinutes: "Comprar más minutos", transcribe: "Transcribir", downloadVideo: "Haz clic aquí para descargar el video", changeLink: "Cambiar enlace"},
  fr: {recentFiles: "Fichiers récents", clear: "Effacer", filesSelected: (count, max) => `${count} / ${max} fichiers`, startUpload: (count) => (count > 1 ? `Démarrer ${count} imports` : "Démarrer l'import"), supportedFormatsLimits: "Formats et limites pris en charge", audioFormats: "Formats audio", videoFormats: "Formats vidéo", maximumFiles: "Nombre maximal de fichiers", maximumFilesValue: "50 fichiers maximum", maximumFileSize: "Taille maximale du fichier", maximumFileSizeValue: "Taille maximale : 5GB par fichier", supportedPlatformsLabel: "Plateformes prises en charge", manyOtherLinks: "De nombreux autres liens", linkInput: "Champ de lien", checkLink: "Vérifier le lien", checkingLink: "Vérification du lien...", availableMinutes: "Minutes disponibles :", buyMoreMinutes: "Acheter plus de minutes", transcribe: "Transcrire", downloadVideo: "Cliquez ici pour télécharger la vidéo", changeLink: "Modifier le lien"},
  hu: {recentFiles: "Legutóbbi fájlok", clear: "Törlés", filesSelected: (count, max) => `${count} / ${max} fájl`, startUpload: (count) => (count > 1 ? `${count} feltöltés indítása` : "Feltöltés indítása"), supportedFormatsLimits: "Támogatott formátumok és limitek", audioFormats: "Hangformátumok", videoFormats: "Videóformátumok", maximumFiles: "Maximális fájlszám", maximumFilesValue: "Legfeljebb 50 fájl", maximumFileSize: "Maximális fájlméret", maximumFileSizeValue: "Maximális fájlméret: 5GB fájlonként", supportedPlatformsLabel: "Támogatott platformok", manyOtherLinks: "Sok más link", linkInput: "Link mező", checkLink: "Link ellenőrzése", checkingLink: "Link ellenőrzése...", availableMinutes: "Elérhető percek:", buyMoreMinutes: "Több perc vásárlása", transcribe: "Átírás", downloadVideo: "Kattints ide a videó letöltéséhez", changeLink: "Link módosítása"},
  id: {recentFiles: "File terbaru", clear: "Bersihkan", filesSelected: (count, max) => `${count} / ${max} file`, startUpload: (count) => (count > 1 ? `Mulai ${count} unggahan` : "Mulai unggah"), supportedFormatsLimits: "Format & batas yang didukung", audioFormats: "Format audio", videoFormats: "Format video", maximumFiles: "Jumlah file maksimum", maximumFilesValue: "Maksimum 50 file", maximumFileSize: "Ukuran file maksimum", maximumFileSizeValue: "Ukuran maksimum: 5GB per file", supportedPlatformsLabel: "Platform yang didukung", manyOtherLinks: "Banyak tautan lainnya", linkInput: "Input tautan", checkLink: "Periksa tautan", checkingLink: "Memeriksa tautan...", availableMinutes: "Menit tersedia:", buyMoreMinutes: "Beli menit tambahan", transcribe: "Transkripsi", downloadVideo: "Klik di sini untuk mengunduh video", changeLink: "Ubah tautan"},
  it: {recentFiles: "File recenti", clear: "Svuota", filesSelected: (count, max) => `${count} / ${max} file`, startUpload: (count) => (count > 1 ? `Avvia ${count} caricamenti` : "Avvia caricamento"), supportedFormatsLimits: "Formati e limiti supportati", audioFormats: "Formati audio", videoFormats: "Formati video", maximumFiles: "File massimi", maximumFilesValue: "Massimo 50 file", maximumFileSize: "Dimensione massima file", maximumFileSizeValue: "Dimensione massima: 5GB per file", supportedPlatformsLabel: "Piattaforme supportate", manyOtherLinks: "Molti altri link", linkInput: "Campo link", checkLink: "Controlla link", checkingLink: "Controllo link...", availableMinutes: "Minuti disponibili:", buyMoreMinutes: "Acquista più minuti", transcribe: "Trascrivi", downloadVideo: "Clicca qui per scaricare il video", changeLink: "Cambia link"},
  ja: {recentFiles: "最近のファイル", clear: "クリア", filesSelected: (count, max) => `${count} / ${max} ファイル`, startUpload: (count) => (count > 1 ? `${count}件のアップロードを開始` : "アップロードを開始"), supportedFormatsLimits: "対応形式と制限", audioFormats: "音声形式", videoFormats: "動画形式", maximumFiles: "最大ファイル数", maximumFilesValue: "最大50ファイル", maximumFileSize: "最大ファイルサイズ", maximumFileSizeValue: "最大ファイルサイズ：1ファイル5GB", supportedPlatformsLabel: "対応プラットフォーム", manyOtherLinks: "その他多数のリンク", linkInput: "リンク入力", checkLink: "リンクを確認", checkingLink: "リンクを確認中...", availableMinutes: "利用可能な分数:", buyMoreMinutes: "分数を追加購入", transcribe: "文字起こし", downloadVideo: "動画をダウンロードするにはここをクリック", changeLink: "リンクを変更"},
  ko: {recentFiles: "최근 파일", clear: "지우기", filesSelected: (count, max) => `${count} / ${max}개 파일`, startUpload: (count) => (count > 1 ? `${count}개 업로드 시작` : "업로드 시작"), supportedFormatsLimits: "지원 형식 및 제한", audioFormats: "오디오 형식", videoFormats: "비디오 형식", maximumFiles: "최대 파일 수", maximumFilesValue: "최대 50개 파일", maximumFileSize: "최대 파일 크기", maximumFileSizeValue: "파일당 최대 5GB", supportedPlatformsLabel: "지원 플랫폼", manyOtherLinks: "기타 여러 링크", linkInput: "링크 입력", checkLink: "링크 확인", checkingLink: "링크 확인 중...", availableMinutes: "사용 가능 분:", buyMoreMinutes: "분 추가 구매", transcribe: "전사", downloadVideo: "동영상을 다운로드하려면 여기를 클릭", changeLink: "링크 변경"},
  nl: {recentFiles: "Recente bestanden", clear: "Wissen", filesSelected: (count, max) => `${count} / ${max} bestanden`, startUpload: (count) => (count > 1 ? `${count} uploads starten` : "Upload starten"), supportedFormatsLimits: "Ondersteunde formaten en limieten", audioFormats: "Audioformaten", videoFormats: "Videoformaten", maximumFiles: "Maximaal aantal bestanden", maximumFilesValue: "Maximaal 50 bestanden", maximumFileSize: "Maximale bestandsgrootte", maximumFileSizeValue: "Maximale bestandsgrootte: 5GB per bestand", supportedPlatformsLabel: "Ondersteunde platforms", manyOtherLinks: "Veel andere links", linkInput: "Linkinvoer", checkLink: "Link controleren", checkingLink: "Link controleren...", availableMinutes: "Beschikbare minuten:", buyMoreMinutes: "Meer minuten kopen", transcribe: "Transcriberen", downloadVideo: "Klik hier om de video te downloaden", changeLink: "Link wijzigen"},
  pl: {recentFiles: "Ostatnie pliki", clear: "Wyczyść", filesSelected: (count, max) => `${count} / ${max} plików`, startUpload: (count) => (count > 1 ? `Rozpocznij ${count} przesyłania` : "Rozpocznij przesyłanie"), supportedFormatsLimits: "Obsługiwane formaty i limity", audioFormats: "Formaty audio", videoFormats: "Formaty wideo", maximumFiles: "Maksymalna liczba plików", maximumFilesValue: "Maksymalnie 50 plików", maximumFileSize: "Maksymalny rozmiar pliku", maximumFileSizeValue: "Maksymalny rozmiar: 5GB na plik", supportedPlatformsLabel: "Obsługiwane platformy", manyOtherLinks: "Wiele innych linków", linkInput: "Pole linku", checkLink: "Sprawdź link", checkingLink: "Sprawdzanie linku...", availableMinutes: "Dostępne minuty:", buyMoreMinutes: "Kup więcej minut", transcribe: "Transkrybuj", downloadVideo: "Kliknij tutaj, aby pobrać wideo", changeLink: "Zmień link"},
  pt: {recentFiles: "Arquivos recentes", clear: "Limpar", filesSelected: (count, max) => `${count} / ${max} arquivos`, startUpload: (count) => (count > 1 ? `Iniciar ${count} envios` : "Iniciar envio"), supportedFormatsLimits: "Formatos e limites suportados", audioFormats: "Formatos de áudio", videoFormats: "Formatos de vídeo", maximumFiles: "Máximo de arquivos", maximumFilesValue: "Máximo de 50 arquivos", maximumFileSize: "Tamanho máximo do arquivo", maximumFileSizeValue: "Tamanho máximo: 5GB por arquivo", supportedPlatformsLabel: "Plataformas compatíveis", manyOtherLinks: "Muitos outros links", linkInput: "Campo de link", checkLink: "Verificar link", checkingLink: "Verificando link...", availableMinutes: "Minutos disponíveis:", buyMoreMinutes: "Comprar mais minutos", transcribe: "Transcrever", downloadVideo: "Clique aqui para baixar o vídeo", changeLink: "Alterar link"},
  ru: {recentFiles: "Последние файлы", clear: "Очистить", filesSelected: (count, max) => `${count} / ${max} файлов`, startUpload: (count) => (count > 1 ? `Начать ${count} загрузок` : "Начать загрузку"), supportedFormatsLimits: "Поддерживаемые форматы и лимиты", audioFormats: "Аудиоформаты", videoFormats: "Видеоформаты", maximumFiles: "Максимум файлов", maximumFilesValue: "Максимум 50 файлов", maximumFileSize: "Максимальный размер файла", maximumFileSizeValue: "Максимальный размер: 5GB на файл", supportedPlatformsLabel: "Поддерживаемые платформы", manyOtherLinks: "Много других ссылок", linkInput: "Поле ссылки", checkLink: "Проверить ссылку", checkingLink: "Проверка ссылки...", availableMinutes: "Доступные минуты:", buyMoreMinutes: "Купить больше минут", transcribe: "Расшифровать", downloadVideo: "Нажмите здесь, чтобы скачать видео", changeLink: "Изменить ссылку"},
  th: {recentFiles: "ไฟล์ล่าสุด", clear: "ล้าง", filesSelected: (count, max) => `${count} / ${max} ไฟล์`, startUpload: (count) => (count > 1 ? `เริ่มอัปโหลด ${count} รายการ` : "เริ่มอัปโหลด"), supportedFormatsLimits: "รูปแบบและขีดจำกัดที่รองรับ", audioFormats: "รูปแบบเสียง", videoFormats: "รูปแบบวิดีโอ", maximumFiles: "จำนวนไฟล์สูงสุด", maximumFilesValue: "สูงสุด 50 ไฟล์", maximumFileSize: "ขนาดไฟล์สูงสุด", maximumFileSizeValue: "ขนาดสูงสุด: 5GB ต่อไฟล์", supportedPlatformsLabel: "แพลตฟอร์มที่รองรับ", manyOtherLinks: "ลิงก์อื่นอีกมากมาย", linkInput: "ช่องลิงก์", checkLink: "ตรวจสอบลิงก์", checkingLink: "กำลังตรวจสอบลิงก์...", availableMinutes: "นาทีที่ใช้ได้:", buyMoreMinutes: "ซื้อเวลานาทีเพิ่ม", transcribe: "ถอดเสียง", downloadVideo: "คลิกที่นี่เพื่อดาวน์โหลดวิดีโอ", changeLink: "เปลี่ยนลิงก์"},
  tr: {recentFiles: "Son dosyalar", clear: "Temizle", filesSelected: (count, max) => `${count} / ${max} dosya`, startUpload: (count) => (count > 1 ? `${count} yüklemeyi başlat` : "Yüklemeyi başlat"), supportedFormatsLimits: "Desteklenen formatlar ve limitler", audioFormats: "Ses formatları", videoFormats: "Video formatları", maximumFiles: "Maksimum dosya", maximumFilesValue: "En fazla 50 dosya", maximumFileSize: "Maksimum dosya boyutu", maximumFileSizeValue: "Maksimum boyut: dosya başına 5GB", supportedPlatformsLabel: "Desteklenen platformlar", manyOtherLinks: "Birçok başka bağlantı", linkInput: "Bağlantı alanı", checkLink: "Bağlantıyı kontrol et", checkingLink: "Bağlantı kontrol ediliyor...", availableMinutes: "Kullanılabilir dakika:", buyMoreMinutes: "Daha fazla dakika satın al", transcribe: "Transkribe et", downloadVideo: "Videoyu indirmek için buraya tıkla", changeLink: "Bağlantıyı değiştir"},
  uk: {recentFiles: "Останні файли", clear: "Очистити", filesSelected: (count, max) => `${count} / ${max} файлів`, startUpload: (count) => (count > 1 ? `Почати ${count} завантажень` : "Почати завантаження"), supportedFormatsLimits: "Підтримувані формати й ліміти", audioFormats: "Аудіоформати", videoFormats: "Відеоформати", maximumFiles: "Максимум файлів", maximumFilesValue: "Максимум 50 файлів", maximumFileSize: "Максимальний розмір файлу", maximumFileSizeValue: "Максимальний розмір: 5GB на файл", supportedPlatformsLabel: "Підтримувані платформи", manyOtherLinks: "Багато інших посилань", linkInput: "Поле посилання", checkLink: "Перевірити посилання", checkingLink: "Перевірка посилання...", availableMinutes: "Доступні хвилини:", buyMoreMinutes: "Купити більше хвилин", transcribe: "Транскрибувати", downloadVideo: "Натисніть тут, щоб завантажити відео", changeLink: "Змінити посилання"},
  vi: {recentFiles: "Tệp gần đây", clear: "Xóa", filesSelected: (count, max) => `${count} / ${max} tệp`, startUpload: (count) => (count > 1 ? `Bắt đầu ${count} lượt tải lên` : "Bắt đầu tải lên"), supportedFormatsLimits: "Định dạng & giới hạn hỗ trợ", audioFormats: "Định dạng âm thanh", videoFormats: "Định dạng video", maximumFiles: "Số tệp tối đa", maximumFilesValue: "Tối đa 50 tệp", maximumFileSize: "Dung lượng tệp tối đa", maximumFileSizeValue: "Dung lượng tối đa: 5GB mỗi tệp", supportedPlatformsLabel: "Nền tảng hỗ trợ", manyOtherLinks: "Nhiều liên kết khác", linkInput: "Ô nhập liên kết", checkLink: "Kiểm tra liên kết", checkingLink: "Đang kiểm tra liên kết...", availableMinutes: "Số phút khả dụng:", buyMoreMinutes: "Mua thêm phút", transcribe: "Chuyển văn bản", downloadVideo: "Nhấp vào đây để tải video", changeLink: "Đổi liên kết"},
  zh: {recentFiles: "最近文件", clear: "清除", filesSelected: (count, max) => `${count} / ${max} 个文件`, startUpload: (count) => (count > 1 ? `开始上传 ${count} 个文件` : "开始上传"), supportedFormatsLimits: "支持的格式与限制", audioFormats: "音频格式", videoFormats: "视频格式", maximumFiles: "最大文件数", maximumFilesValue: "最多 50 个文件", maximumFileSize: "最大文件大小", maximumFileSizeValue: "最大文件大小：每个文件 5GB", supportedPlatformsLabel: "支持的平台", manyOtherLinks: "更多链接", linkInput: "链接输入框", checkLink: "检查链接", checkingLink: "正在检查链接...", availableMinutes: "可用分钟数：", buyMoreMinutes: "购买更多分钟", transcribe: "转写", downloadVideo: "点击这里下载视频", changeLink: "更换链接"},
  "zh-TW": {recentFiles: "最近檔案", clear: "清除", filesSelected: (count, max) => `${count} / ${max} 個檔案`, startUpload: (count) => (count > 1 ? `開始上傳 ${count} 個檔案` : "開始上傳"), supportedFormatsLimits: "支援的格式與限制", audioFormats: "音訊格式", videoFormats: "影片格式", maximumFiles: "最大檔案數", maximumFilesValue: "最多 50 個檔案", maximumFileSize: "最大檔案大小", maximumFileSizeValue: "最大檔案大小：每個檔案 5GB", supportedPlatformsLabel: "支援的平台", manyOtherLinks: "更多連結", linkInput: "連結輸入框", checkLink: "檢查連結", checkingLink: "正在檢查連結...", availableMinutes: "可用分鐘數：", buyMoreMinutes: "購買更多分鐘", transcribe: "轉寫", downloadVideo: "點擊這裡下載影片", changeLink: "更換連結"}
};

type WorkspaceOperationalCopy = {
  googleDrive: string;
  googleDriveImport: string;
  googleDriveDescription: string;
  googleDriveConnected: string;
  connectYourGoogleDrive: string;
  driveAccessDescription: string;
  refresh: string;
  disconnect: string;
  connecting: string;
  connectDrive: string;
  searchDrivePlaceholder: string;
  importFile: string;
  importFromGoogleDrive: string;
  loadingDriveFiles: string;
  noDriveFilesFound: string;
  googleDriveLink: string;
  publicDriveImportHint: string;
  pastePublicDriveLink: string;
  driveFileQueued: string;
  unableStartDriveAuthorization: string;
  unableCheckDriveConnection: string;
  audioLanguage: string;
  audioLanguageHelp: string;
  popularLanguages: string;
  generateSubtitle: string;
  speakerIdentification: string;
  aiSummary: string;
  summaryLanguage: string;
  premiumTranscriptionModel: string;
  premiumModelDescription: string;
  moreInformation: string;
  premiumFeatureEnabled: string;
  speakerPaidFeatureTrial: string;
  closePremiumFeatureNotice: string;
  upgradePlan: string;
  media: string;
  summaryTemplateLabels: {
    none: string;
    standard: string;
    meetingNotes: string;
    meeting: string;
    course: string;
    interview: string;
    podcast: string;
  };
};

const workspaceOperationalCopy: Record<Locale, WorkspaceOperationalCopy> = {
  ar: {googleDrive: "Google Drive", googleDriveImport: "استيراد من Google Drive", googleDriveDescription: "اربط Google Drive لاختيار ملفات صوت أو فيديو خاصة، أو الصق رابط ملف Drive عام.", googleDriveConnected: "Google Drive متصل", connectYourGoogleDrive: "اربط Google Drive الخاص بك", driveAccessDescription: "يُستخدم الوصول إلى ملفات Drive لعرض واستيراد ملفات الوسائط المحددة.", refresh: "تحديث", disconnect: "قطع الاتصال", connecting: "جار الاتصال...", connectDrive: "ربط Drive", searchDrivePlaceholder: "ابحث عن ملفات صوت أو فيديو في Drive", importFile: "استيراد", importFromGoogleDrive: "استيراد من Google Drive", loadingDriveFiles: "جار تحميل ملفات Drive...", noDriveFilesFound: "لم يتم العثور على ملفات صوت أو فيديو.", googleDriveLink: "رابط Google Drive", publicDriveImportHint: "استيراد الروابط العامة يعمل للملفات المشتركة. استخدم ربط Drive للملفات الخاصة في حسابك.", pastePublicDriveLink: "الصق رابط ملف Google Drive عام", driveFileQueued: "تمت إضافة ملف Google Drive إلى الصف.", unableStartDriveAuthorization: "تعذر بدء تفويض Google Drive.", unableCheckDriveConnection: "تعذر التحقق من اتصال Google Drive.", audioLanguage: "لغة الصوت", audioLanguageHelp: "اختر اللغة المنطوقة في الصوت. ليست لغة الترجمة.", popularLanguages: "لغات شائعة", generateSubtitle: "إنشاء ترجمة", speakerIdentification: "تحديد المتحدثين", aiSummary: "ملخص AI", summaryLanguage: "لغة الملخص", premiumTranscriptionModel: "نموذج تفريغ مميز", premiumModelDescription: "امنح الأولوية لـ Deepgram أو AssemblyAI عند توفر توقيت وميزات متحدث أغنى.", moreInformation: "مزيد من المعلومات", premiumFeatureEnabled: "تم تفعيل الميزة المميزة", speakerPaidFeatureTrial: "تحديد المتحدثين ميزة مدفوعة. يمكنك تجربتها الآن.", closePremiumFeatureNotice: "إغلاق إشعار الميزة المميزة", upgradePlan: "ترقية الخطة", media: "وسائط", summaryTemplateLabels: {none: "إيقاف", standard: "عام", meetingNotes: "ملاحظات اجتماع", meeting: "اجتماع", course: "دورة", interview: "مقابلة", podcast: "بودكاست"}},
  de: {googleDrive: "Google Drive", googleDriveImport: "Google Drive Import", googleDriveDescription: "Verbinde Google Drive, um private Audio- oder Videodateien auszuwählen, oder füge einen öffentlichen Drive-Dateilink ein.", googleDriveConnected: "Google Drive verbunden", connectYourGoogleDrive: "Google Drive verbinden", driveAccessDescription: "Der Drive-Dateizugriff wird verwendet, um ausgewählte Mediendateien aufzulisten und zu importieren.", refresh: "Aktualisieren", disconnect: "Trennen", connecting: "Verbindung...", connectDrive: "Drive verbinden", searchDrivePlaceholder: "Drive-Audio- oder Videodateien suchen", importFile: "Importieren", importFromGoogleDrive: "Aus Google Drive importieren", loadingDriveFiles: "Drive-Dateien werden geladen...", noDriveFilesFound: "Keine Audio- oder Videodateien gefunden.", googleDriveLink: "Google Drive-Link", publicDriveImportHint: "Der Import öffentlicher Links funktioniert weiterhin für geteilte Dateien. Nutze Drive verbinden für private Dateien in deinem Konto.", pastePublicDriveLink: "Öffentlichen Google Drive-Dateilink einfügen", driveFileQueued: "Google Drive-Datei wurde in die Warteschlange gestellt.", unableStartDriveAuthorization: "Google Drive-Autorisierung konnte nicht gestartet werden.", unableCheckDriveConnection: "Google Drive-Verbindung konnte nicht geprüft werden.", audioLanguage: "Audiosprache", audioLanguageHelp: "Wähle die gesprochene Sprache im Audio, nicht die Übersetzungssprache.", popularLanguages: "Beliebte Sprachen", generateSubtitle: "Untertitel generieren", speakerIdentification: "Sprechererkennung", aiSummary: "AI-Zusammenfassung", summaryLanguage: "Zusammenfassungssprache", premiumTranscriptionModel: "Premium-Transkriptionsmodell", premiumModelDescription: "Priorisiere Deepgram oder AssemblyAI, wenn bessere Zeitmarken und Sprecherfunktionen verfügbar sind.", moreInformation: "Weitere Informationen", premiumFeatureEnabled: "Premium-Funktion aktiviert", speakerPaidFeatureTrial: "Sprechererkennung ist eine bezahlte Funktion. Du kannst sie jetzt testen.", closePremiumFeatureNotice: "Premium-Hinweis schließen", upgradePlan: "Plan upgraden", media: "Medien", summaryTemplateLabels: {none: "Aus", standard: "Allgemein", meetingNotes: "Meeting-Notizen", meeting: "Meeting", course: "Kurs", interview: "Interview", podcast: "Podcast"}},
  en: {googleDrive: "Google Drive", googleDriveImport: "Google Drive Import", googleDriveDescription: "Connect Google Drive to pick private audio or video files, or paste a public Drive file link.", googleDriveConnected: "Google Drive connected", connectYourGoogleDrive: "Connect your Google Drive", driveAccessDescription: "Drive file access is used to list and import selected media files.", refresh: "Refresh", disconnect: "Disconnect", connecting: "Connecting...", connectDrive: "Connect Drive", searchDrivePlaceholder: "Search Drive audio or video files", importFile: "Import", importFromGoogleDrive: "Import from Google Drive", loadingDriveFiles: "Loading Drive files...", noDriveFilesFound: "No audio or video files found.", googleDriveLink: "Google Drive link", publicDriveImportHint: "Public link import still works for shared files. Use Connect Drive for private files in your account.", pastePublicDriveLink: "Paste a public Google Drive file link", driveFileQueued: "Google Drive file queued.", unableStartDriveAuthorization: "Unable to start Google Drive authorization.", unableCheckDriveConnection: "Unable to check Google Drive connection.", audioLanguage: "Audio Language", audioLanguageHelp: "Choose the language spoken in your audio. Not your translation language.", popularLanguages: "Popular languages", generateSubtitle: "Generate Subtitle", speakerIdentification: "Speaker identification", aiSummary: "AI Summary", summaryLanguage: "Summary language", premiumTranscriptionModel: "Premium transcription model", premiumModelDescription: "Prioritize Deepgram or AssemblyAI when richer timing and speaker features are available.", moreInformation: "More information", premiumFeatureEnabled: "Premium feature enabled", speakerPaidFeatureTrial: "Speaker identification is a paid feature. You can try it now.", closePremiumFeatureNotice: "Close premium feature notice", upgradePlan: "Upgrade Plan", media: "media", summaryTemplateLabels: {none: "Off", standard: "General", meetingNotes: "Meeting notes", meeting: "Meeting", course: "Course", interview: "Interview", podcast: "Podcast"}},
  es: {googleDrive: "Google Drive", googleDriveImport: "Importar de Google Drive", googleDriveDescription: "Conecta Google Drive para elegir archivos privados de audio o video, o pega un enlace público de Drive.", googleDriveConnected: "Google Drive conectado", connectYourGoogleDrive: "Conecta tu Google Drive", driveAccessDescription: "El acceso a Drive se usa para listar e importar los archivos multimedia seleccionados.", refresh: "Actualizar", disconnect: "Desconectar", connecting: "Conectando...", connectDrive: "Conectar Drive", searchDrivePlaceholder: "Buscar archivos de audio o video en Drive", importFile: "Importar", importFromGoogleDrive: "Importar desde Google Drive", loadingDriveFiles: "Cargando archivos de Drive...", noDriveFilesFound: "No se encontraron archivos de audio o video.", googleDriveLink: "Enlace de Google Drive", publicDriveImportHint: "La importación por enlace público sigue funcionando para archivos compartidos. Usa Conectar Drive para archivos privados de tu cuenta.", pastePublicDriveLink: "Pega un enlace público de archivo de Google Drive", driveFileQueued: "Archivo de Google Drive en cola.", unableStartDriveAuthorization: "No se pudo iniciar la autorización de Google Drive.", unableCheckDriveConnection: "No se pudo comprobar la conexión de Google Drive.", audioLanguage: "Idioma del audio", audioLanguageHelp: "Elige el idioma hablado en tu audio, no el idioma de traducción.", popularLanguages: "Idiomas populares", generateSubtitle: "Generar subtítulos", speakerIdentification: "Identificación de hablantes", aiSummary: "Resumen AI", summaryLanguage: "Idioma del resumen", premiumTranscriptionModel: "Modelo premium de transcripción", premiumModelDescription: "Prioriza Deepgram o AssemblyAI cuando haya mejor temporización y funciones de hablantes.", moreInformation: "Más información", premiumFeatureEnabled: "Función premium activada", speakerPaidFeatureTrial: "La identificación de hablantes es una función de pago. Puedes probarla ahora.", closePremiumFeatureNotice: "Cerrar aviso de función premium", upgradePlan: "Mejorar plan", media: "medio", summaryTemplateLabels: {none: "Desactivado", standard: "General", meetingNotes: "Notas de reunión", meeting: "Reunión", course: "Curso", interview: "Entrevista", podcast: "Podcast"}},
  fr: {googleDrive: "Google Drive", googleDriveImport: "Import Google Drive", googleDriveDescription: "Connectez Google Drive pour choisir des fichiers audio ou vidéo privés, ou collez un lien public Drive.", googleDriveConnected: "Google Drive connecté", connectYourGoogleDrive: "Connecter votre Google Drive", driveAccessDescription: "L'accès aux fichiers Drive sert à lister et importer les médias sélectionnés.", refresh: "Actualiser", disconnect: "Déconnecter", connecting: "Connexion...", connectDrive: "Connecter Drive", searchDrivePlaceholder: "Rechercher des fichiers audio ou vidéo Drive", importFile: "Importer", importFromGoogleDrive: "Importer depuis Google Drive", loadingDriveFiles: "Chargement des fichiers Drive...", noDriveFilesFound: "Aucun fichier audio ou vidéo trouvé.", googleDriveLink: "Lien Google Drive", publicDriveImportHint: "L'import par lien public fonctionne toujours pour les fichiers partagés. Utilisez Connecter Drive pour les fichiers privés de votre compte.", pastePublicDriveLink: "Collez un lien public de fichier Google Drive", driveFileQueued: "Fichier Google Drive ajouté à la file.", unableStartDriveAuthorization: "Impossible de lancer l'autorisation Google Drive.", unableCheckDriveConnection: "Impossible de vérifier la connexion Google Drive.", audioLanguage: "Langue de l'audio", audioLanguageHelp: "Choisissez la langue parlée dans l'audio, pas la langue de traduction.", popularLanguages: "Langues populaires", generateSubtitle: "Générer des sous-titres", speakerIdentification: "Identification des intervenants", aiSummary: "Résumé AI", summaryLanguage: "Langue du résumé", premiumTranscriptionModel: "Modèle de transcription premium", premiumModelDescription: "Priorisez Deepgram ou AssemblyAI lorsque des minutages et fonctions de locuteur plus riches sont disponibles.", moreInformation: "Plus d'informations", premiumFeatureEnabled: "Fonction premium activée", speakerPaidFeatureTrial: "L'identification des intervenants est une fonction payante. Vous pouvez l'essayer maintenant.", closePremiumFeatureNotice: "Fermer l'avis de fonction premium", upgradePlan: "Mettre à niveau", media: "média", summaryTemplateLabels: {none: "Désactivé", standard: "Général", meetingNotes: "Notes de réunion", meeting: "Réunion", course: "Cours", interview: "Entretien", podcast: "Podcast"}},
  hu: {googleDrive: "Google Drive", googleDriveImport: "Google Drive import", googleDriveDescription: "Csatlakoztasd a Google Drive-ot privát hang- vagy videófájlok kiválasztásához, vagy illessz be nyilvános Drive-fájllinket.", googleDriveConnected: "Google Drive csatlakoztatva", connectYourGoogleDrive: "Google Drive csatlakoztatása", driveAccessDescription: "A Drive fájlhozzáférés a kiválasztott médiafájlok listázására és importálására szolgál.", refresh: "Frissítés", disconnect: "Leválasztás", connecting: "Csatlakozás...", connectDrive: "Drive csatlakoztatása", searchDrivePlaceholder: "Drive hang- vagy videófájlok keresése", importFile: "Importálás", importFromGoogleDrive: "Importálás Google Drive-ból", loadingDriveFiles: "Drive fájlok betöltése...", noDriveFilesFound: "Nem található hang- vagy videófájl.", googleDriveLink: "Google Drive link", publicDriveImportHint: "A nyilvános linkes import továbbra is működik megosztott fájlokhoz. Privát fiókfájlokhoz használd a Drive csatlakoztatását.", pastePublicDriveLink: "Nyilvános Google Drive-fájllink beillesztése", driveFileQueued: "Google Drive fájl sorba állítva.", unableStartDriveAuthorization: "Nem sikerült elindítani a Google Drive engedélyezést.", unableCheckDriveConnection: "Nem sikerült ellenőrizni a Google Drive kapcsolatot.", audioLanguage: "Hang nyelve", audioLanguageHelp: "Válaszd ki a hangban beszélt nyelvet, ne a fordítás nyelvét.", popularLanguages: "Népszerű nyelvek", generateSubtitle: "Felirat generálása", speakerIdentification: "Beszélőazonosítás", aiSummary: "AI összefoglaló", summaryLanguage: "Összefoglaló nyelve", premiumTranscriptionModel: "Prémium átírási modell", premiumModelDescription: "Részesítsd előnyben a Deepgramot vagy AssemblyAI-t, ha gazdagabb időzítés és beszélőfunkciók érhetők el.", moreInformation: "További információ", premiumFeatureEnabled: "Prémium funkció bekapcsolva", speakerPaidFeatureTrial: "A beszélőazonosítás fizetős funkció. Most kipróbálhatod.", closePremiumFeatureNotice: "Prémium funkció értesítés bezárása", upgradePlan: "Csomag frissítése", media: "média", summaryTemplateLabels: {none: "Kikapcsolva", standard: "Általános", meetingNotes: "Megbeszélés jegyzetek", meeting: "Megbeszélés", course: "Kurzus", interview: "Interjú", podcast: "Podcast"}},
  id: {googleDrive: "Google Drive", googleDriveImport: "Impor Google Drive", googleDriveDescription: "Hubungkan Google Drive untuk memilih file audio atau video pribadi, atau tempel tautan file Drive publik.", googleDriveConnected: "Google Drive terhubung", connectYourGoogleDrive: "Hubungkan Google Drive Anda", driveAccessDescription: "Akses file Drive digunakan untuk menampilkan dan mengimpor file media yang dipilih.", refresh: "Segarkan", disconnect: "Putuskan", connecting: "Menghubungkan...", connectDrive: "Hubungkan Drive", searchDrivePlaceholder: "Cari file audio atau video Drive", importFile: "Impor", importFromGoogleDrive: "Impor dari Google Drive", loadingDriveFiles: "Memuat file Drive...", noDriveFilesFound: "Tidak ada file audio atau video ditemukan.", googleDriveLink: "Tautan Google Drive", publicDriveImportHint: "Impor tautan publik tetap berfungsi untuk file yang dibagikan. Gunakan Hubungkan Drive untuk file pribadi di akun Anda.", pastePublicDriveLink: "Tempel tautan file Google Drive publik", driveFileQueued: "File Google Drive masuk antrean.", unableStartDriveAuthorization: "Tidak dapat memulai otorisasi Google Drive.", unableCheckDriveConnection: "Tidak dapat memeriksa koneksi Google Drive.", audioLanguage: "Bahasa audio", audioLanguageHelp: "Pilih bahasa yang diucapkan dalam audio, bukan bahasa terjemahan.", popularLanguages: "Bahasa populer", generateSubtitle: "Buat subtitle", speakerIdentification: "Identifikasi pembicara", aiSummary: "Ringkasan AI", summaryLanguage: "Bahasa ringkasan", premiumTranscriptionModel: "Model transkripsi premium", premiumModelDescription: "Prioritaskan Deepgram atau AssemblyAI saat timing dan fitur pembicara yang lebih kaya tersedia.", moreInformation: "Informasi selengkapnya", premiumFeatureEnabled: "Fitur premium aktif", speakerPaidFeatureTrial: "Identifikasi pembicara adalah fitur berbayar. Anda dapat mencobanya sekarang.", closePremiumFeatureNotice: "Tutup pemberitahuan fitur premium", upgradePlan: "Tingkatkan paket", media: "media", summaryTemplateLabels: {none: "Mati", standard: "Umum", meetingNotes: "Catatan rapat", meeting: "Rapat", course: "Kursus", interview: "Wawancara", podcast: "Podcast"}},
  it: {googleDrive: "Google Drive", googleDriveImport: "Importazione Google Drive", googleDriveDescription: "Collega Google Drive per scegliere file audio o video privati, oppure incolla un link pubblico di Drive.", googleDriveConnected: "Google Drive collegato", connectYourGoogleDrive: "Collega il tuo Google Drive", driveAccessDescription: "L'accesso ai file Drive serve a elencare e importare i file multimediali selezionati.", refresh: "Aggiorna", disconnect: "Disconnetti", connecting: "Connessione...", connectDrive: "Collega Drive", searchDrivePlaceholder: "Cerca file audio o video in Drive", importFile: "Importa", importFromGoogleDrive: "Importa da Google Drive", loadingDriveFiles: "Caricamento file Drive...", noDriveFilesFound: "Nessun file audio o video trovato.", googleDriveLink: "Link Google Drive", publicDriveImportHint: "L'importazione tramite link pubblico funziona ancora per i file condivisi. Usa Collega Drive per i file privati del tuo account.", pastePublicDriveLink: "Incolla un link pubblico di file Google Drive", driveFileQueued: "File Google Drive in coda.", unableStartDriveAuthorization: "Impossibile avviare l'autorizzazione Google Drive.", unableCheckDriveConnection: "Impossibile controllare la connessione Google Drive.", audioLanguage: "Lingua audio", audioLanguageHelp: "Scegli la lingua parlata nell'audio, non la lingua di traduzione.", popularLanguages: "Lingue popolari", generateSubtitle: "Genera sottotitoli", speakerIdentification: "Identificazione parlanti", aiSummary: "Riepilogo AI", summaryLanguage: "Lingua del riepilogo", premiumTranscriptionModel: "Modello di trascrizione premium", premiumModelDescription: "Dai priorità a Deepgram o AssemblyAI quando sono disponibili timing e funzioni parlante più ricche.", moreInformation: "Maggiori informazioni", premiumFeatureEnabled: "Funzione premium attivata", speakerPaidFeatureTrial: "L'identificazione dei parlanti è una funzione a pagamento. Puoi provarla ora.", closePremiumFeatureNotice: "Chiudi avviso funzione premium", upgradePlan: "Aggiorna piano", media: "media", summaryTemplateLabels: {none: "Disattivato", standard: "Generale", meetingNotes: "Note riunione", meeting: "Riunione", course: "Corso", interview: "Intervista", podcast: "Podcast"}},
  ja: {googleDrive: "Google Drive", googleDriveImport: "Google Drive 取り込み", googleDriveDescription: "Google Drive を接続して非公開の音声・動画ファイルを選ぶか、公開 Drive ファイルリンクを貼り付けます。", googleDriveConnected: "Google Drive 接続済み", connectYourGoogleDrive: "Google Drive を接続", driveAccessDescription: "Drive ファイルへのアクセスは、選択したメディアファイルの一覧表示と取り込みに使われます。", refresh: "更新", disconnect: "切断", connecting: "接続中...", connectDrive: "Drive を接続", searchDrivePlaceholder: "Drive の音声または動画ファイルを検索", importFile: "取り込む", importFromGoogleDrive: "Google Drive から取り込む", loadingDriveFiles: "Drive ファイルを読み込み中...", noDriveFilesFound: "音声または動画ファイルが見つかりません。", googleDriveLink: "Google Drive リンク", publicDriveImportHint: "共有ファイルは公開リンクでも取り込めます。アカウント内の非公開ファイルには Drive 接続を使用してください。", pastePublicDriveLink: "公開 Google Drive ファイルリンクを貼り付け", driveFileQueued: "Google Drive ファイルをキューに追加しました。", unableStartDriveAuthorization: "Google Drive 認証を開始できません。", unableCheckDriveConnection: "Google Drive 接続を確認できません。", audioLanguage: "音声の言語", audioLanguageHelp: "音声で話されている言語を選択します。翻訳先言語ではありません。", popularLanguages: "人気の言語", generateSubtitle: "字幕を生成", speakerIdentification: "話者識別", aiSummary: "AI 要約", summaryLanguage: "要約の言語", premiumTranscriptionModel: "プレミアム文字起こしモデル", premiumModelDescription: "より詳細なタイミングや話者機能が利用できる場合、Deepgram または AssemblyAI を優先します。", moreInformation: "詳細情報", premiumFeatureEnabled: "プレミアム機能が有効です", speakerPaidFeatureTrial: "話者識別は有料機能です。今すぐお試しいただけます。", closePremiumFeatureNotice: "プレミアム機能通知を閉じる", upgradePlan: "プランをアップグレード", media: "メディア", summaryTemplateLabels: {none: "オフ", standard: "一般", meetingNotes: "会議メモ", meeting: "会議", course: "コース", interview: "インタビュー", podcast: "ポッドキャスト"}},
  ko: {googleDrive: "Google Drive", googleDriveImport: "Google Drive 가져오기", googleDriveDescription: "Google Drive를 연결해 비공개 오디오 또는 비디오 파일을 선택하거나 공개 Drive 파일 링크를 붙여넣으세요.", googleDriveConnected: "Google Drive 연결됨", connectYourGoogleDrive: "Google Drive 연결", driveAccessDescription: "Drive 파일 접근은 선택한 미디어 파일을 표시하고 가져오는 데 사용됩니다.", refresh: "새로고침", disconnect: "연결 해제", connecting: "연결 중...", connectDrive: "Drive 연결", searchDrivePlaceholder: "Drive 오디오 또는 비디오 파일 검색", importFile: "가져오기", importFromGoogleDrive: "Google Drive에서 가져오기", loadingDriveFiles: "Drive 파일 불러오는 중...", noDriveFilesFound: "오디오 또는 비디오 파일을 찾을 수 없습니다.", googleDriveLink: "Google Drive 링크", publicDriveImportHint: "공유 파일은 공개 링크 가져오기도 계속 사용할 수 있습니다. 계정의 비공개 파일은 Drive 연결을 사용하세요.", pastePublicDriveLink: "공개 Google Drive 파일 링크 붙여넣기", driveFileQueued: "Google Drive 파일이 대기열에 추가되었습니다.", unableStartDriveAuthorization: "Google Drive 인증을 시작할 수 없습니다.", unableCheckDriveConnection: "Google Drive 연결을 확인할 수 없습니다.", audioLanguage: "오디오 언어", audioLanguageHelp: "번역 언어가 아니라 오디오에서 말하는 언어를 선택하세요.", popularLanguages: "인기 언어", generateSubtitle: "자막 생성", speakerIdentification: "화자 식별", aiSummary: "AI 요약", summaryLanguage: "요약 언어", premiumTranscriptionModel: "프리미엄 전사 모델", premiumModelDescription: "더 풍부한 타이밍 및 화자 기능을 사용할 수 있을 때 Deepgram 또는 AssemblyAI를 우선합니다.", moreInformation: "자세한 정보", premiumFeatureEnabled: "프리미엄 기능 활성화됨", speakerPaidFeatureTrial: "화자 식별은 유료 기능입니다. 지금 사용해 볼 수 있습니다.", closePremiumFeatureNotice: "프리미엄 기능 알림 닫기", upgradePlan: "요금제 업그레이드", media: "미디어", summaryTemplateLabels: {none: "끄기", standard: "일반", meetingNotes: "회의 메모", meeting: "회의", course: "강의", interview: "인터뷰", podcast: "팟캐스트"}},
  nl: {googleDrive: "Google Drive", googleDriveImport: "Google Drive importeren", googleDriveDescription: "Verbind Google Drive om privé audio- of videobestanden te kiezen, of plak een openbare Drive-bestandslink.", googleDriveConnected: "Google Drive verbonden", connectYourGoogleDrive: "Verbind je Google Drive", driveAccessDescription: "Drive-bestandstoegang wordt gebruikt om geselecteerde mediabestanden te tonen en te importeren.", refresh: "Vernieuwen", disconnect: "Loskoppelen", connecting: "Verbinden...", connectDrive: "Drive verbinden", searchDrivePlaceholder: "Zoek Drive-audio- of videobestanden", importFile: "Importeren", importFromGoogleDrive: "Importeren uit Google Drive", loadingDriveFiles: "Drive-bestanden laden...", noDriveFilesFound: "Geen audio- of videobestanden gevonden.", googleDriveLink: "Google Drive-link", publicDriveImportHint: "Importeren via openbare link werkt nog steeds voor gedeelde bestanden. Gebruik Drive verbinden voor privébestanden in je account.", pastePublicDriveLink: "Plak een openbare Google Drive-bestandslink", driveFileQueued: "Google Drive-bestand in de wachtrij.", unableStartDriveAuthorization: "Kan Google Drive-autorisatie niet starten.", unableCheckDriveConnection: "Kan Google Drive-verbinding niet controleren.", audioLanguage: "Audiotaal", audioLanguageHelp: "Kies de gesproken taal in je audio, niet je vertaallanguage.", popularLanguages: "Populaire talen", generateSubtitle: "Ondertitels genereren", speakerIdentification: "Sprekerherkenning", aiSummary: "AI-samenvatting", summaryLanguage: "Samenvattingstaal", premiumTranscriptionModel: "Premium transcriptiemodel", premiumModelDescription: "Geef prioriteit aan Deepgram of AssemblyAI wanneer rijkere timing en sprekerfuncties beschikbaar zijn.", moreInformation: "Meer informatie", premiumFeatureEnabled: "Premiumfunctie ingeschakeld", speakerPaidFeatureTrial: "Sprekerherkenning is een betaalde functie. Je kunt het nu proberen.", closePremiumFeatureNotice: "Premiumfunctiemelding sluiten", upgradePlan: "Abonnement upgraden", media: "media", summaryTemplateLabels: {none: "Uit", standard: "Algemeen", meetingNotes: "Vergadernotities", meeting: "Vergadering", course: "Cursus", interview: "Interview", podcast: "Podcast"}},
  pl: {googleDrive: "Google Drive", googleDriveImport: "Import z Google Drive", googleDriveDescription: "Połącz Google Drive, aby wybrać prywatne pliki audio lub wideo, albo wklej publiczny link do pliku Drive.", googleDriveConnected: "Google Drive połączony", connectYourGoogleDrive: "Połącz Google Drive", driveAccessDescription: "Dostęp do plików Drive służy do listowania i importu wybranych plików multimedialnych.", refresh: "Odśwież", disconnect: "Odłącz", connecting: "Łączenie...", connectDrive: "Połącz Drive", searchDrivePlaceholder: "Szukaj plików audio lub wideo w Drive", importFile: "Importuj", importFromGoogleDrive: "Importuj z Google Drive", loadingDriveFiles: "Ładowanie plików Drive...", noDriveFilesFound: "Nie znaleziono plików audio ani wideo.", googleDriveLink: "Link Google Drive", publicDriveImportHint: "Import z publicznego linku nadal działa dla udostępnionych plików. Użyj Połącz Drive dla prywatnych plików na koncie.", pastePublicDriveLink: "Wklej publiczny link do pliku Google Drive", driveFileQueued: "Plik Google Drive dodany do kolejki.", unableStartDriveAuthorization: "Nie można rozpocząć autoryzacji Google Drive.", unableCheckDriveConnection: "Nie można sprawdzić połączenia Google Drive.", audioLanguage: "Język audio", audioLanguageHelp: "Wybierz język mówiony w audio, nie język tłumaczenia.", popularLanguages: "Popularne języki", generateSubtitle: "Generuj napisy", speakerIdentification: "Identyfikacja mówców", aiSummary: "Podsumowanie AI", summaryLanguage: "Język podsumowania", premiumTranscriptionModel: "Model transkrypcji premium", premiumModelDescription: "Priorytet dla Deepgram lub AssemblyAI, gdy dostępne są bogatsze znaczniki czasu i funkcje mówców.", moreInformation: "Więcej informacji", premiumFeatureEnabled: "Funkcja premium włączona", speakerPaidFeatureTrial: "Identyfikacja mówców jest funkcją płatną. Możesz ją teraz wypróbować.", closePremiumFeatureNotice: "Zamknij powiadomienie o funkcji premium", upgradePlan: "Ulepsz plan", media: "media", summaryTemplateLabels: {none: "Wyłączone", standard: "Ogólne", meetingNotes: "Notatki ze spotkania", meeting: "Spotkanie", course: "Kurs", interview: "Wywiad", podcast: "Podcast"}},
  pt: {googleDrive: "Google Drive", googleDriveImport: "Importação do Google Drive", googleDriveDescription: "Conecte o Google Drive para escolher arquivos privados de áudio ou vídeo, ou cole um link público do Drive.", googleDriveConnected: "Google Drive conectado", connectYourGoogleDrive: "Conecte seu Google Drive", driveAccessDescription: "O acesso aos arquivos do Drive é usado para listar e importar os arquivos de mídia selecionados.", refresh: "Atualizar", disconnect: "Desconectar", connecting: "Conectando...", connectDrive: "Conectar Drive", searchDrivePlaceholder: "Buscar arquivos de áudio ou vídeo no Drive", importFile: "Importar", importFromGoogleDrive: "Importar do Google Drive", loadingDriveFiles: "Carregando arquivos do Drive...", noDriveFilesFound: "Nenhum arquivo de áudio ou vídeo encontrado.", googleDriveLink: "Link do Google Drive", publicDriveImportHint: "A importação por link público ainda funciona para arquivos compartilhados. Use Conectar Drive para arquivos privados da sua conta.", pastePublicDriveLink: "Cole um link público de arquivo do Google Drive", driveFileQueued: "Arquivo do Google Drive na fila.", unableStartDriveAuthorization: "Não foi possível iniciar a autorização do Google Drive.", unableCheckDriveConnection: "Não foi possível verificar a conexão do Google Drive.", audioLanguage: "Idioma do áudio", audioLanguageHelp: "Escolha o idioma falado no áudio, não o idioma de tradução.", popularLanguages: "Idiomas populares", generateSubtitle: "Gerar legenda", speakerIdentification: "Identificação de falantes", aiSummary: "Resumo AI", summaryLanguage: "Idioma do resumo", premiumTranscriptionModel: "Modelo premium de transcrição", premiumModelDescription: "Priorize Deepgram ou AssemblyAI quando houver timing e recursos de falantes mais ricos.", moreInformation: "Mais informações", premiumFeatureEnabled: "Recurso premium ativado", speakerPaidFeatureTrial: "Identificação de falantes é um recurso pago. Você pode experimentar agora.", closePremiumFeatureNotice: "Fechar aviso de recurso premium", upgradePlan: "Atualizar plano", media: "mídia", summaryTemplateLabels: {none: "Desativado", standard: "Geral", meetingNotes: "Notas de reunião", meeting: "Reunião", course: "Curso", interview: "Entrevista", podcast: "Podcast"}},
  ru: {googleDrive: "Google Drive", googleDriveImport: "Импорт из Google Drive", googleDriveDescription: "Подключите Google Drive, чтобы выбрать приватные аудио- или видеофайлы, либо вставьте публичную ссылку Drive.", googleDriveConnected: "Google Drive подключен", connectYourGoogleDrive: "Подключите Google Drive", driveAccessDescription: "Доступ к файлам Drive используется для просмотра и импорта выбранных медиафайлов.", refresh: "Обновить", disconnect: "Отключить", connecting: "Подключение...", connectDrive: "Подключить Drive", searchDrivePlaceholder: "Искать аудио или видео в Drive", importFile: "Импорт", importFromGoogleDrive: "Импортировать из Google Drive", loadingDriveFiles: "Загрузка файлов Drive...", noDriveFilesFound: "Аудио- или видеофайлы не найдены.", googleDriveLink: "Ссылка Google Drive", publicDriveImportHint: "Импорт по публичной ссылке работает для общих файлов. Для приватных файлов аккаунта подключите Drive.", pastePublicDriveLink: "Вставьте публичную ссылку на файл Google Drive", driveFileQueued: "Файл Google Drive добавлен в очередь.", unableStartDriveAuthorization: "Не удалось начать авторизацию Google Drive.", unableCheckDriveConnection: "Не удалось проверить подключение Google Drive.", audioLanguage: "Язык аудио", audioLanguageHelp: "Выберите язык речи в аудио, а не язык перевода.", popularLanguages: "Популярные языки", generateSubtitle: "Создать субтитры", speakerIdentification: "Распознавание спикеров", aiSummary: "AI-сводка", summaryLanguage: "Язык сводки", premiumTranscriptionModel: "Премиум-модель расшифровки", premiumModelDescription: "Приоритет Deepgram или AssemblyAI, когда доступны более точные таймкоды и функции спикеров.", moreInformation: "Подробнее", premiumFeatureEnabled: "Премиум-функция включена", speakerPaidFeatureTrial: "Распознавание спикеров — платная функция. Вы можете попробовать ее сейчас.", closePremiumFeatureNotice: "Закрыть уведомление о премиум-функции", upgradePlan: "Обновить план", media: "медиа", summaryTemplateLabels: {none: "Выкл.", standard: "Общий", meetingNotes: "Заметки встречи", meeting: "Встреча", course: "Курс", interview: "Интервью", podcast: "Подкаст"}},
  th: {googleDrive: "Google Drive", googleDriveImport: "นำเข้าจาก Google Drive", googleDriveDescription: "เชื่อมต่อ Google Drive เพื่อเลือกไฟล์เสียงหรือวิดีโอส่วนตัว หรือวางลิงก์ไฟล์ Drive แบบสาธารณะ", googleDriveConnected: "เชื่อมต่อ Google Drive แล้ว", connectYourGoogleDrive: "เชื่อมต่อ Google Drive ของคุณ", driveAccessDescription: "การเข้าถึงไฟล์ Drive ใช้เพื่อแสดงและนำเข้าไฟล์สื่อที่เลือก", refresh: "รีเฟรช", disconnect: "ตัดการเชื่อมต่อ", connecting: "กำลังเชื่อมต่อ...", connectDrive: "เชื่อมต่อ Drive", searchDrivePlaceholder: "ค้นหาไฟล์เสียงหรือวิดีโอใน Drive", importFile: "นำเข้า", importFromGoogleDrive: "นำเข้าจาก Google Drive", loadingDriveFiles: "กำลังโหลดไฟล์ Drive...", noDriveFilesFound: "ไม่พบไฟล์เสียงหรือวิดีโอ", googleDriveLink: "ลิงก์ Google Drive", publicDriveImportHint: "การนำเข้าลิงก์สาธารณะยังใช้ได้กับไฟล์ที่แชร์ ใช้เชื่อมต่อ Drive สำหรับไฟล์ส่วนตัวในบัญชีของคุณ", pastePublicDriveLink: "วางลิงก์ไฟล์ Google Drive แบบสาธารณะ", driveFileQueued: "เพิ่มไฟล์ Google Drive เข้าคิวแล้ว", unableStartDriveAuthorization: "ไม่สามารถเริ่มการอนุญาต Google Drive ได้", unableCheckDriveConnection: "ไม่สามารถตรวจสอบการเชื่อมต่อ Google Drive ได้", audioLanguage: "ภาษาเสียง", audioLanguageHelp: "เลือกภาษาที่พูดในเสียง ไม่ใช่ภาษาสำหรับแปล", popularLanguages: "ภาษายอดนิยม", generateSubtitle: "สร้างคำบรรยาย", speakerIdentification: "ระบุผู้พูด", aiSummary: "สรุป AI", summaryLanguage: "ภาษาสรุป", premiumTranscriptionModel: "โมเดลถอดเสียงพรีเมียม", premiumModelDescription: "ให้ความสำคัญกับ Deepgram หรือ AssemblyAI เมื่อมีเวลาและฟีเจอร์ผู้พูดที่ละเอียดกว่า", moreInformation: "ข้อมูลเพิ่มเติม", premiumFeatureEnabled: "เปิดใช้ฟีเจอร์พรีเมียมแล้ว", speakerPaidFeatureTrial: "การระบุผู้พูดเป็นฟีเจอร์แบบชำระเงิน คุณสามารถลองใช้ได้ตอนนี้", closePremiumFeatureNotice: "ปิดประกาศฟีเจอร์พรีเมียม", upgradePlan: "อัปเกรดแพ็กเกจ", media: "สื่อ", summaryTemplateLabels: {none: "ปิด", standard: "ทั่วไป", meetingNotes: "บันทึกการประชุม", meeting: "ประชุม", course: "คอร์ส", interview: "สัมภาษณ์", podcast: "พอดแคสต์"}},
  tr: {googleDrive: "Google Drive", googleDriveImport: "Google Drive içe aktarma", googleDriveDescription: "Özel ses veya video dosyalarını seçmek için Google Drive'ı bağla ya da herkese açık Drive dosya bağlantısı yapıştır.", googleDriveConnected: "Google Drive bağlı", connectYourGoogleDrive: "Google Drive'ını bağla", driveAccessDescription: "Drive dosya erişimi, seçilen medya dosyalarını listelemek ve içe aktarmak için kullanılır.", refresh: "Yenile", disconnect: "Bağlantıyı kes", connecting: "Bağlanıyor...", connectDrive: "Drive bağla", searchDrivePlaceholder: "Drive ses veya video dosyalarında ara", importFile: "İçe aktar", importFromGoogleDrive: "Google Drive'dan içe aktar", loadingDriveFiles: "Drive dosyaları yükleniyor...", noDriveFilesFound: "Ses veya video dosyası bulunamadı.", googleDriveLink: "Google Drive bağlantısı", publicDriveImportHint: "Herkese açık bağlantı içe aktarma paylaşılan dosyalar için çalışır. Hesabındaki özel dosyalar için Drive bağla.", pastePublicDriveLink: "Herkese açık Google Drive dosya bağlantısı yapıştır", driveFileQueued: "Google Drive dosyası sıraya alındı.", unableStartDriveAuthorization: "Google Drive yetkilendirmesi başlatılamadı.", unableCheckDriveConnection: "Google Drive bağlantısı kontrol edilemedi.", audioLanguage: "Ses dili", audioLanguageHelp: "Sesindeki konuşulan dili seç. Bu çeviri dili değildir.", popularLanguages: "Popüler diller", generateSubtitle: "Altyazı oluştur", speakerIdentification: "Konuşmacı tanıma", aiSummary: "AI özeti", summaryLanguage: "Özet dili", premiumTranscriptionModel: "Premium transkripsiyon modeli", premiumModelDescription: "Daha zengin zamanlama ve konuşmacı özellikleri mevcut olduğunda Deepgram veya AssemblyAI'yi önceliklendir.", moreInformation: "Daha fazla bilgi", premiumFeatureEnabled: "Premium özellik etkin", speakerPaidFeatureTrial: "Konuşmacı tanıma ücretli bir özelliktir. Şimdi deneyebilirsin.", closePremiumFeatureNotice: "Premium özellik bildirimini kapat", upgradePlan: "Planı yükselt", media: "medya", summaryTemplateLabels: {none: "Kapalı", standard: "Genel", meetingNotes: "Toplantı notları", meeting: "Toplantı", course: "Kurs", interview: "Röportaj", podcast: "Podcast"}},
  uk: {googleDrive: "Google Drive", googleDriveImport: "Імпорт із Google Drive", googleDriveDescription: "Підключіть Google Drive, щоб вибрати приватні аудіо чи відеофайли, або вставте публічне посилання Drive.", googleDriveConnected: "Google Drive підключено", connectYourGoogleDrive: "Підключіть Google Drive", driveAccessDescription: "Доступ до файлів Drive використовується для показу та імпорту вибраних медіафайлів.", refresh: "Оновити", disconnect: "Відключити", connecting: "Підключення...", connectDrive: "Підключити Drive", searchDrivePlaceholder: "Шукати аудіо чи відео в Drive", importFile: "Імпорт", importFromGoogleDrive: "Імпортувати з Google Drive", loadingDriveFiles: "Завантаження файлів Drive...", noDriveFilesFound: "Аудіо чи відеофайли не знайдено.", googleDriveLink: "Посилання Google Drive", publicDriveImportHint: "Імпорт за публічним посиланням працює для спільних файлів. Для приватних файлів акаунта використовуйте підключення Drive.", pastePublicDriveLink: "Вставте публічне посилання на файл Google Drive", driveFileQueued: "Файл Google Drive додано до черги.", unableStartDriveAuthorization: "Не вдалося почати авторизацію Google Drive.", unableCheckDriveConnection: "Не вдалося перевірити підключення Google Drive.", audioLanguage: "Мова аудіо", audioLanguageHelp: "Виберіть мову, якою говорять в аудіо, не мову перекладу.", popularLanguages: "Популярні мови", generateSubtitle: "Створити субтитри", speakerIdentification: "Розпізнавання спікерів", aiSummary: "AI-підсумок", summaryLanguage: "Мова підсумку", premiumTranscriptionModel: "Преміум-модель транскрипції", premiumModelDescription: "Пріоритет Deepgram або AssemblyAI, коли доступні точніші таймкоди та функції спікерів.", moreInformation: "Докладніше", premiumFeatureEnabled: "Преміум-функцію ввімкнено", speakerPaidFeatureTrial: "Розпізнавання спікерів — платна функція. Ви можете спробувати її зараз.", closePremiumFeatureNotice: "Закрити повідомлення про преміум-функцію", upgradePlan: "Оновити план", media: "медіа", summaryTemplateLabels: {none: "Вимк.", standard: "Загальний", meetingNotes: "Нотатки зустрічі", meeting: "Зустріч", course: "Курс", interview: "Інтерв'ю", podcast: "Подкаст"}},
  vi: {googleDrive: "Google Drive", googleDriveImport: "Nhập từ Google Drive", googleDriveDescription: "Kết nối Google Drive để chọn tệp âm thanh hoặc video riêng tư, hoặc dán liên kết tệp Drive công khai.", googleDriveConnected: "Google Drive đã kết nối", connectYourGoogleDrive: "Kết nối Google Drive của bạn", driveAccessDescription: "Quyền truy cập tệp Drive dùng để liệt kê và nhập các tệp media đã chọn.", refresh: "Làm mới", disconnect: "Ngắt kết nối", connecting: "Đang kết nối...", connectDrive: "Kết nối Drive", searchDrivePlaceholder: "Tìm tệp âm thanh hoặc video trên Drive", importFile: "Nhập", importFromGoogleDrive: "Nhập từ Google Drive", loadingDriveFiles: "Đang tải tệp Drive...", noDriveFilesFound: "Không tìm thấy tệp âm thanh hoặc video.", googleDriveLink: "Liên kết Google Drive", publicDriveImportHint: "Nhập bằng liên kết công khai vẫn hoạt động với tệp đã chia sẻ. Dùng Kết nối Drive cho tệp riêng tư trong tài khoản.", pastePublicDriveLink: "Dán liên kết tệp Google Drive công khai", driveFileQueued: "Tệp Google Drive đã vào hàng đợi.", unableStartDriveAuthorization: "Không thể bắt đầu ủy quyền Google Drive.", unableCheckDriveConnection: "Không thể kiểm tra kết nối Google Drive.", audioLanguage: "Ngôn ngữ âm thanh", audioLanguageHelp: "Chọn ngôn ngữ được nói trong âm thanh, không phải ngôn ngữ dịch.", popularLanguages: "Ngôn ngữ phổ biến", generateSubtitle: "Tạo phụ đề", speakerIdentification: "Nhận diện người nói", aiSummary: "Tóm tắt AI", summaryLanguage: "Ngôn ngữ tóm tắt", premiumTranscriptionModel: "Mô hình chuyển văn bản cao cấp", premiumModelDescription: "Ưu tiên Deepgram hoặc AssemblyAI khi có timing và tính năng người nói tốt hơn.", moreInformation: "Thông tin thêm", premiumFeatureEnabled: "Đã bật tính năng cao cấp", speakerPaidFeatureTrial: "Nhận diện người nói là tính năng trả phí. Bạn có thể dùng thử ngay.", closePremiumFeatureNotice: "Đóng thông báo tính năng cao cấp", upgradePlan: "Nâng cấp gói", media: "media", summaryTemplateLabels: {none: "Tắt", standard: "Chung", meetingNotes: "Ghi chú họp", meeting: "Họp", course: "Khóa học", interview: "Phỏng vấn", podcast: "Podcast"}},
  zh: {googleDrive: "Google Drive", googleDriveImport: "Google Drive 导入", googleDriveDescription: "连接 Google Drive 选择私有音频或视频文件，或粘贴公开的 Drive 文件链接。", googleDriveConnected: "Google Drive 已连接", connectYourGoogleDrive: "连接你的 Google Drive", driveAccessDescription: "Drive 文件访问权限用于列出并导入所选媒体文件。", refresh: "刷新", disconnect: "断开连接", connecting: "正在连接...", connectDrive: "连接 Drive", searchDrivePlaceholder: "搜索 Drive 音频或视频文件", importFile: "导入", importFromGoogleDrive: "从 Google Drive 导入", loadingDriveFiles: "正在加载 Drive 文件...", noDriveFilesFound: "未找到音频或视频文件。", googleDriveLink: "Google Drive 链接", publicDriveImportHint: "共享文件仍可使用公开链接导入。账号内私有文件请使用连接 Drive。", pastePublicDriveLink: "粘贴公开 Google Drive 文件链接", driveFileQueued: "Google Drive 文件已进入队列。", unableStartDriveAuthorization: "无法启动 Google Drive 授权。", unableCheckDriveConnection: "无法检查 Google Drive 连接。", audioLanguage: "音频语言", audioLanguageHelp: "选择音频中实际说话的语言，不是翻译目标语言。", popularLanguages: "常用语言", generateSubtitle: "生成字幕", speakerIdentification: "说话人识别", aiSummary: "AI 摘要", summaryLanguage: "摘要语言", premiumTranscriptionModel: "高级转写模型", premiumModelDescription: "在可用时优先使用 Deepgram 或 AssemblyAI，以获得更丰富的时间轴和说话人能力。", moreInformation: "更多信息", premiumFeatureEnabled: "高级功能已启用", speakerPaidFeatureTrial: "说话人识别是付费功能，你现在可以试用。", closePremiumFeatureNotice: "关闭高级功能提示", upgradePlan: "升级套餐", media: "媒体", summaryTemplateLabels: {none: "关闭", standard: "通用", meetingNotes: "会议记录", meeting: "会议", course: "课程", interview: "采访", podcast: "播客"}},
  "zh-TW": {googleDrive: "Google Drive", googleDriveImport: "Google Drive 匯入", googleDriveDescription: "連接 Google Drive 選擇私有音訊或影片檔案，或貼上公開的 Drive 檔案連結。", googleDriveConnected: "Google Drive 已連接", connectYourGoogleDrive: "連接你的 Google Drive", driveAccessDescription: "Drive 檔案存取權限用於列出並匯入所選媒體檔案。", refresh: "重新整理", disconnect: "中斷連線", connecting: "正在連接...", connectDrive: "連接 Drive", searchDrivePlaceholder: "搜尋 Drive 音訊或影片檔案", importFile: "匯入", importFromGoogleDrive: "從 Google Drive 匯入", loadingDriveFiles: "正在載入 Drive 檔案...", noDriveFilesFound: "找不到音訊或影片檔案。", googleDriveLink: "Google Drive 連結", publicDriveImportHint: "共享檔案仍可使用公開連結匯入。帳號內私有檔案請使用連接 Drive。", pastePublicDriveLink: "貼上公開 Google Drive 檔案連結", driveFileQueued: "Google Drive 檔案已進入佇列。", unableStartDriveAuthorization: "無法啟動 Google Drive 授權。", unableCheckDriveConnection: "無法檢查 Google Drive 連接。", audioLanguage: "音訊語言", audioLanguageHelp: "選擇音訊中實際說話的語言，不是翻譯目標語言。", popularLanguages: "常用語言", generateSubtitle: "生成字幕", speakerIdentification: "說話者識別", aiSummary: "AI 摘要", summaryLanguage: "摘要語言", premiumTranscriptionModel: "高級轉寫模型", premiumModelDescription: "可用時優先使用 Deepgram 或 AssemblyAI，以取得更豐富的時間軸和說話者能力。", moreInformation: "更多資訊", premiumFeatureEnabled: "高級功能已啟用", speakerPaidFeatureTrial: "說話者識別是付費功能，你現在可以試用。", closePremiumFeatureNotice: "關閉高級功能提示", upgradePlan: "升級方案", media: "媒體", summaryTemplateLabels: {none: "關閉", standard: "通用", meetingNotes: "會議記錄", meeting: "會議", course: "課程", interview: "訪談", podcast: "Podcast"}}
};

type WorkspaceSidebarCopy = {
  avatarAlt: string;
  accountMenu: string;
  billing: string;
  emailSupport: string;
  discordAlt: string;
  settings: string;
  language: string;
  theme: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
  signOut: string;
  supportResponseSoon: string;
  supportPaidUsers: string;
  supportFreeUsers: string;
  supportWithin24Hours: string;
  supportWithin48Hours: string;
  copyButton: string;
  currentPlan: string;
  dailyQuota: string;
  minutesQuota: string;
  minuteSuffix: string;
  dashboardNav: string;
  createFolderAria: string;
  folderActions: (name: string) => string;
  rename: string;
  delete: string;
  renameFolderTitle: string;
  createFolderTitle: string;
  folderName: string;
  folderNamePlaceholder: string;
  folderCharacterCount: (count: number) => string;
  cancel: string;
  save: string;
  create: string;
  close: string;
  deleteFolderTitle: string;
  deleteFolderIntro: (name: string) => string;
  deleteFolderWarning: string;
  planAnonymous: string;
  planFree: string;
  planBasic: string;
  planStandard: string;
  planPro: string;
};

const workspaceSidebarCopyEn: WorkspaceSidebarCopy = {
  avatarAlt: "Avatar",
  accountMenu: "Account menu",
  billing: "Billing",
  emailSupport: "Email Support",
  discordAlt: "Discord",
  settings: "Settings",
  language: "Language",
  theme: "Theme",
  themeLight: "Light",
  themeDark: "Dark",
  themeSystem: "System",
  signOut: "Sign out",
  supportResponseSoon: "We'll respond as soon as possible",
  supportPaidUsers: "Paid users",
  supportFreeUsers: "Free users",
  supportWithin24Hours: "within 24 hours",
  supportWithin48Hours: "within 48 hours",
  copyButton: "Copy",
  currentPlan: "Current Plan",
  dailyQuota: "Daily",
  minutesQuota: "Minutes",
  minuteSuffix: "min",
  dashboardNav: "Dashboard",
  createFolderAria: "Create folder",
  folderActions: (name) => `Folder actions for ${name}`,
  rename: "Rename",
  delete: "Delete",
  renameFolderTitle: "Rename Folder",
  createFolderTitle: "Create Folder",
  folderName: "Folder Name",
  folderNamePlaceholder: "Enter folder name",
  folderCharacterCount: (count) => `Maximum 40 characters, current: ${count}/40`,
  cancel: "Cancel",
  save: "Save",
  create: "Create",
  close: "Close",
  deleteFolderTitle: "Delete Folder",
  deleteFolderIntro: (name) => `You are about to delete folder "${name}".`,
  deleteFolderWarning: "Deleting this folder will also permanently delete all transcriptions inside. This cannot be undone.",
  planAnonymous: "Free",
  planFree: "Free",
  planBasic: "Basic",
  planStandard: "Standard",
  planPro: "Pro"
};

const workspaceSidebarLanguageLabels: Record<Locale, string> = {
  ar: "اللغة",
  de: "Sprache",
  en: "Language",
  es: "Idioma",
  fr: "Langue",
  hu: "Nyelv",
  id: "Bahasa",
  it: "Lingua",
  ja: "言語",
  ko: "언어",
  nl: "Taal",
  pl: "Język",
  pt: "Idioma",
  ru: "Язык",
  th: "ภาษา",
  tr: "Dil",
  uk: "Мова",
  vi: "Ngôn ngữ",
  zh: "语言",
  "zh-TW": "語言"
};

const workspaceSidebarCopyOverrides: Record<Locale, Partial<WorkspaceSidebarCopy>> = {
  ar: {billing: "الفوترة", emailSupport: "دعم البريد", settings: "الإعدادات", theme: "السمة", themeLight: "فاتح", themeDark: "داكن", themeSystem: "النظام", signOut: "تسجيل الخروج", currentPlan: "الخطة الحالية", dailyQuota: "يومي", minutesQuota: "الدقائق", dashboardNav: "لوحة التحكم", rename: "إعادة تسمية", delete: "حذف", renameFolderTitle: "إعادة تسمية المجلد", createFolderTitle: "إنشاء مجلد", folderName: "اسم المجلد", folderNamePlaceholder: "أدخل اسم المجلد", cancel: "إلغاء", save: "حفظ", create: "إنشاء", close: "إغلاق", deleteFolderTitle: "حذف المجلد", supportPaidUsers: "المستخدمون المدفوعون", supportFreeUsers: "المستخدمون المجانيون", supportWithin24Hours: "خلال 24 ساعة", supportWithin48Hours: "خلال 48 ساعة", planAnonymous: "مجاني", planFree: "مجاني", planBasic: "Basic", planStandard: "Standard", planPro: "Pro"},
  de: {billing: "Abrechnung", emailSupport: "E-Mail-Support", settings: "Einstellungen", theme: "Design", themeLight: "Hell", themeDark: "Dunkel", themeSystem: "System", signOut: "Abmelden", currentPlan: "Aktueller Plan", dailyQuota: "Täglich", minutesQuota: "Minuten", dashboardNav: "Dashboard", rename: "Umbenennen", delete: "Löschen", renameFolderTitle: "Ordner umbenennen", createFolderTitle: "Ordner erstellen", folderName: "Ordnername", folderNamePlaceholder: "Ordnername eingeben", cancel: "Abbrechen", save: "Speichern", create: "Erstellen", close: "Schließen", deleteFolderTitle: "Ordner löschen", supportPaidUsers: "Bezahlte Nutzer", supportFreeUsers: "Kostenlose Nutzer", supportWithin24Hours: "innerhalb von 24 Stunden", supportWithin48Hours: "innerhalb von 48 Stunden", planAnonymous: "Kostenlos", planFree: "Kostenlos", planBasic: "Basic", planStandard: "Standard", planPro: "Pro"},
  en: {},
  es: {billing: "Facturación", emailSupport: "Soporte por email", settings: "Configuración", theme: "Tema", themeLight: "Claro", themeDark: "Oscuro", themeSystem: "Sistema", signOut: "Cerrar sesión", currentPlan: "Plan actual", dailyQuota: "Diario", minutesQuota: "Minutos", dashboardNav: "Panel", rename: "Renombrar", delete: "Eliminar", renameFolderTitle: "Renombrar carpeta", createFolderTitle: "Crear carpeta", folderName: "Nombre de carpeta", folderNamePlaceholder: "Introduce el nombre", cancel: "Cancelar", save: "Guardar", create: "Crear", close: "Cerrar", deleteFolderTitle: "Eliminar carpeta", supportPaidUsers: "Usuarios de pago", supportFreeUsers: "Usuarios gratis", supportWithin24Hours: "en 24 horas", supportWithin48Hours: "en 48 horas", planAnonymous: "Gratis", planFree: "Gratis", planBasic: "Basic", planStandard: "Standard", planPro: "Pro"},
  fr: {billing: "Facturation", emailSupport: "Support email", settings: "Paramètres", theme: "Thème", themeLight: "Clair", themeDark: "Sombre", themeSystem: "Système", signOut: "Se déconnecter", currentPlan: "Forfait actuel", dailyQuota: "Quotidien", minutesQuota: "Minutes", dashboardNav: "Tableau", rename: "Renommer", delete: "Supprimer", renameFolderTitle: "Renommer le dossier", createFolderTitle: "Créer un dossier", folderName: "Nom du dossier", folderNamePlaceholder: "Saisissez le nom", cancel: "Annuler", save: "Enregistrer", create: "Créer", close: "Fermer", deleteFolderTitle: "Supprimer le dossier", supportPaidUsers: "Utilisateurs payants", supportFreeUsers: "Utilisateurs gratuits", supportWithin24Hours: "sous 24 heures", supportWithin48Hours: "sous 48 heures", planAnonymous: "Gratuit", planFree: "Gratuit", planBasic: "Basic", planStandard: "Standard", planPro: "Pro"},
  hu: {billing: "Számlázás", emailSupport: "Email támogatás", settings: "Beállítások", theme: "Téma", themeLight: "Világos", themeDark: "Sötét", themeSystem: "Rendszer", signOut: "Kijelentkezés", currentPlan: "Aktuális csomag", dailyQuota: "Napi", minutesQuota: "Percek", dashboardNav: "Irányítópult", rename: "Átnevezés", delete: "Törlés", renameFolderTitle: "Mappa átnevezése", createFolderTitle: "Mappa létrehozása", folderName: "Mappa neve", folderNamePlaceholder: "Add meg a mappa nevét", cancel: "Mégse", save: "Mentés", create: "Létrehozás", close: "Bezárás", deleteFolderTitle: "Mappa törlése", supportPaidUsers: "Fizetős felhasználók", supportFreeUsers: "Ingyenes felhasználók", supportWithin24Hours: "24 órán belül", supportWithin48Hours: "48 órán belül", planAnonymous: "Ingyenes", planFree: "Ingyenes", planBasic: "Basic", planStandard: "Standard", planPro: "Pro"},
  id: {billing: "Penagihan", emailSupport: "Dukungan email", settings: "Pengaturan", theme: "Tema", themeLight: "Terang", themeDark: "Gelap", themeSystem: "Sistem", signOut: "Keluar", currentPlan: "Paket saat ini", dailyQuota: "Harian", minutesQuota: "Menit", dashboardNav: "Dasbor", rename: "Ubah nama", delete: "Hapus", renameFolderTitle: "Ubah nama folder", createFolderTitle: "Buat folder", folderName: "Nama folder", folderNamePlaceholder: "Masukkan nama folder", cancel: "Batal", save: "Simpan", create: "Buat", close: "Tutup", deleteFolderTitle: "Hapus folder", supportPaidUsers: "Pengguna berbayar", supportFreeUsers: "Pengguna gratis", supportWithin24Hours: "dalam 24 jam", supportWithin48Hours: "dalam 48 jam", planAnonymous: "Gratis", planFree: "Gratis", planBasic: "Basic", planStandard: "Standard", planPro: "Pro"},
  it: {billing: "Fatturazione", emailSupport: "Supporto email", settings: "Impostazioni", theme: "Tema", themeLight: "Chiaro", themeDark: "Scuro", themeSystem: "Sistema", signOut: "Esci", currentPlan: "Piano attuale", dailyQuota: "Giornaliero", minutesQuota: "Minuti", dashboardNav: "Dashboard", rename: "Rinomina", delete: "Elimina", renameFolderTitle: "Rinomina cartella", createFolderTitle: "Crea cartella", folderName: "Nome cartella", folderNamePlaceholder: "Inserisci nome cartella", cancel: "Annulla", save: "Salva", create: "Crea", close: "Chiudi", deleteFolderTitle: "Elimina cartella", supportPaidUsers: "Utenti paganti", supportFreeUsers: "Utenti gratuiti", supportWithin24Hours: "entro 24 ore", supportWithin48Hours: "entro 48 ore", planAnonymous: "Gratis", planFree: "Gratis", planBasic: "Basic", planStandard: "Standard", planPro: "Pro"},
  ja: {billing: "請求", emailSupport: "メールサポート", settings: "設定", theme: "テーマ", themeLight: "ライト", themeDark: "ダーク", themeSystem: "システム", signOut: "サインアウト", currentPlan: "現在のプラン", dailyQuota: "日次", minutesQuota: "分数", dashboardNav: "ダッシュボード", rename: "名前を変更", delete: "削除", renameFolderTitle: "フォルダ名を変更", createFolderTitle: "フォルダを作成", folderName: "フォルダ名", folderNamePlaceholder: "フォルダ名を入力", cancel: "キャンセル", save: "保存", create: "作成", close: "閉じる", deleteFolderTitle: "フォルダを削除", supportPaidUsers: "有料ユーザー", supportFreeUsers: "無料ユーザー", supportWithin24Hours: "24時間以内", supportWithin48Hours: "48時間以内", planAnonymous: "無料", planFree: "無料", planBasic: "Basic", planStandard: "Standard", planPro: "Pro"},
  ko: {billing: "결제", emailSupport: "이메일 지원", settings: "설정", theme: "테마", themeLight: "라이트", themeDark: "다크", themeSystem: "시스템", signOut: "로그아웃", currentPlan: "현재 플랜", dailyQuota: "일일", minutesQuota: "분", dashboardNav: "대시보드", rename: "이름 변경", delete: "삭제", renameFolderTitle: "폴더 이름 변경", createFolderTitle: "폴더 만들기", folderName: "폴더 이름", folderNamePlaceholder: "폴더 이름 입력", cancel: "취소", save: "저장", create: "만들기", close: "닫기", deleteFolderTitle: "폴더 삭제", supportPaidUsers: "유료 사용자", supportFreeUsers: "무료 사용자", supportWithin24Hours: "24시간 이내", supportWithin48Hours: "48시간 이내", planAnonymous: "무료", planFree: "무료", planBasic: "Basic", planStandard: "Standard", planPro: "Pro"},
  nl: {billing: "Facturering", emailSupport: "E-mailsupport", settings: "Instellingen", theme: "Thema", themeLight: "Licht", themeDark: "Donker", themeSystem: "Systeem", signOut: "Uitloggen", currentPlan: "Huidig plan", dailyQuota: "Dagelijks", minutesQuota: "Minuten", dashboardNav: "Dashboard", rename: "Hernoemen", delete: "Verwijderen", renameFolderTitle: "Map hernoemen", createFolderTitle: "Map maken", folderName: "Mapnaam", folderNamePlaceholder: "Voer mapnaam in", cancel: "Annuleren", save: "Opslaan", create: "Maken", close: "Sluiten", deleteFolderTitle: "Map verwijderen", supportPaidUsers: "Betaalde gebruikers", supportFreeUsers: "Gratis gebruikers", supportWithin24Hours: "binnen 24 uur", supportWithin48Hours: "binnen 48 uur", planAnonymous: "Gratis", planFree: "Gratis", planBasic: "Basic", planStandard: "Standard", planPro: "Pro"},
  pl: {billing: "Rozliczenia", emailSupport: "Wsparcie e-mail", settings: "Ustawienia", theme: "Motyw", themeLight: "Jasny", themeDark: "Ciemny", themeSystem: "System", signOut: "Wyloguj", currentPlan: "Aktualny plan", dailyQuota: "Dziennie", minutesQuota: "Minuty", dashboardNav: "Panel", rename: "Zmień nazwę", delete: "Usuń", renameFolderTitle: "Zmień nazwę folderu", createFolderTitle: "Utwórz folder", folderName: "Nazwa folderu", folderNamePlaceholder: "Wpisz nazwę folderu", cancel: "Anuluj", save: "Zapisz", create: "Utwórz", close: "Zamknij", deleteFolderTitle: "Usuń folder", supportPaidUsers: "Użytkownicy płatni", supportFreeUsers: "Użytkownicy darmowi", supportWithin24Hours: "w ciągu 24 godzin", supportWithin48Hours: "w ciągu 48 godzin", planAnonymous: "Darmowy", planFree: "Darmowy", planBasic: "Basic", planStandard: "Standard", planPro: "Pro"},
  pt: {billing: "Cobrança", emailSupport: "Suporte por email", settings: "Configurações", theme: "Tema", themeLight: "Claro", themeDark: "Escuro", themeSystem: "Sistema", signOut: "Sair", currentPlan: "Plano atual", dailyQuota: "Diário", minutesQuota: "Minutos", dashboardNav: "Painel", rename: "Renomear", delete: "Excluir", renameFolderTitle: "Renomear pasta", createFolderTitle: "Criar pasta", folderName: "Nome da pasta", folderNamePlaceholder: "Digite o nome", cancel: "Cancelar", save: "Salvar", create: "Criar", close: "Fechar", deleteFolderTitle: "Excluir pasta", supportPaidUsers: "Usuários pagos", supportFreeUsers: "Usuários gratuitos", supportWithin24Hours: "em até 24 horas", supportWithin48Hours: "em até 48 horas", planAnonymous: "Grátis", planFree: "Grátis", planBasic: "Basic", planStandard: "Standard", planPro: "Pro"},
  ru: {billing: "Оплата", emailSupport: "Поддержка по email", settings: "Настройки", theme: "Тема", themeLight: "Светлая", themeDark: "Темная", themeSystem: "Системная", signOut: "Выйти", currentPlan: "Текущий план", dailyQuota: "День", minutesQuota: "Минуты", dashboardNav: "Панель", rename: "Переименовать", delete: "Удалить", renameFolderTitle: "Переименовать папку", createFolderTitle: "Создать папку", folderName: "Название папки", folderNamePlaceholder: "Введите название папки", cancel: "Отмена", save: "Сохранить", create: "Создать", close: "Закрыть", deleteFolderTitle: "Удалить папку", supportPaidUsers: "Платные пользователи", supportFreeUsers: "Бесплатные пользователи", supportWithin24Hours: "в течение 24 часов", supportWithin48Hours: "в течение 48 часов", planAnonymous: "Бесплатно", planFree: "Бесплатно", planBasic: "Basic", planStandard: "Standard", planPro: "Pro"},
  th: {billing: "การเรียกเก็บเงิน", emailSupport: "อีเมลซัพพอร์ต", settings: "การตั้งค่า", theme: "ธีม", themeLight: "สว่าง", themeDark: "มืด", themeSystem: "ระบบ", signOut: "ออกจากระบบ", currentPlan: "แพ็กเกจปัจจุบัน", dailyQuota: "รายวัน", minutesQuota: "นาที", dashboardNav: "แดชบอร์ด", rename: "เปลี่ยนชื่อ", delete: "ลบ", renameFolderTitle: "เปลี่ยนชื่อโฟลเดอร์", createFolderTitle: "สร้างโฟลเดอร์", folderName: "ชื่อโฟลเดอร์", folderNamePlaceholder: "ใส่ชื่อโฟลเดอร์", cancel: "ยกเลิก", save: "บันทึก", create: "สร้าง", close: "ปิด", deleteFolderTitle: "ลบโฟลเดอร์", supportPaidUsers: "ผู้ใช้แบบชำระเงิน", supportFreeUsers: "ผู้ใช้ฟรี", supportWithin24Hours: "ภายใน 24 ชั่วโมง", supportWithin48Hours: "ภายใน 48 ชั่วโมง", planAnonymous: "ฟรี", planFree: "ฟรี", planBasic: "Basic", planStandard: "Standard", planPro: "Pro"},
  tr: {billing: "Faturalandırma", emailSupport: "E-posta desteği", settings: "Ayarlar", theme: "Tema", themeLight: "Açık", themeDark: "Koyu", themeSystem: "Sistem", signOut: "Çıkış yap", currentPlan: "Mevcut plan", dailyQuota: "Günlük", minutesQuota: "Dakika", dashboardNav: "Panel", rename: "Yeniden adlandır", delete: "Sil", renameFolderTitle: "Klasörü yeniden adlandır", createFolderTitle: "Klasör oluştur", folderName: "Klasör adı", folderNamePlaceholder: "Klasör adını gir", cancel: "İptal", save: "Kaydet", create: "Oluştur", close: "Kapat", deleteFolderTitle: "Klasörü sil", supportPaidUsers: "Ücretli kullanıcılar", supportFreeUsers: "Ücretsiz kullanıcılar", supportWithin24Hours: "24 saat içinde", supportWithin48Hours: "48 saat içinde", planAnonymous: "Ücretsiz", planFree: "Ücretsiz", planBasic: "Basic", planStandard: "Standard", planPro: "Pro"},
  uk: {billing: "Оплата", emailSupport: "Підтримка email", settings: "Налаштування", theme: "Тема", themeLight: "Світла", themeDark: "Темна", themeSystem: "Системна", signOut: "Вийти", currentPlan: "Поточний план", dailyQuota: "День", minutesQuota: "Хвилини", dashboardNav: "Панель", rename: "Перейменувати", delete: "Видалити", renameFolderTitle: "Перейменувати папку", createFolderTitle: "Створити папку", folderName: "Назва папки", folderNamePlaceholder: "Введіть назву папки", cancel: "Скасувати", save: "Зберегти", create: "Створити", close: "Закрити", deleteFolderTitle: "Видалити папку", supportPaidUsers: "Платні користувачі", supportFreeUsers: "Безкоштовні користувачі", supportWithin24Hours: "протягом 24 годин", supportWithin48Hours: "протягом 48 годин", planAnonymous: "Безкоштовно", planFree: "Безкоштовно", planBasic: "Basic", planStandard: "Standard", planPro: "Pro"},
  vi: {billing: "Thanh toán", emailSupport: "Hỗ trợ email", settings: "Cài đặt", theme: "Giao diện", themeLight: "Sáng", themeDark: "Tối", themeSystem: "Hệ thống", signOut: "Đăng xuất", currentPlan: "Gói hiện tại", dailyQuota: "Hằng ngày", minutesQuota: "Phút", dashboardNav: "Bảng điều khiển", rename: "Đổi tên", delete: "Xóa", renameFolderTitle: "Đổi tên thư mục", createFolderTitle: "Tạo thư mục", folderName: "Tên thư mục", folderNamePlaceholder: "Nhập tên thư mục", cancel: "Hủy", save: "Lưu", create: "Tạo", close: "Đóng", deleteFolderTitle: "Xóa thư mục", supportPaidUsers: "Người dùng trả phí", supportFreeUsers: "Người dùng miễn phí", supportWithin24Hours: "trong 24 giờ", supportWithin48Hours: "trong 48 giờ", planAnonymous: "Miễn phí", planFree: "Miễn phí", planBasic: "Basic", planStandard: "Standard", planPro: "Pro"},
  zh: {avatarAlt: "头像", accountMenu: "账号菜单", billing: "账单", emailSupport: "邮件支持", settings: "设置", theme: "主题", themeLight: "浅色", themeDark: "深色", themeSystem: "跟随系统", signOut: "退出登录", supportResponseSoon: "我们会尽快回复", supportPaidUsers: "付费用户", supportFreeUsers: "免费用户", supportWithin24Hours: "24 小时内", supportWithin48Hours: "48 小时内", currentPlan: "当前套餐", dailyQuota: "每日", minutesQuota: "分钟", minuteSuffix: "分", dashboardNav: "仪表盘", createFolderAria: "创建文件夹", folderActions: (name) => `${name} 的文件夹操作`, rename: "重命名", delete: "删除", renameFolderTitle: "重命名文件夹", createFolderTitle: "创建文件夹", folderName: "文件夹名称", folderNamePlaceholder: "输入文件夹名称", folderCharacterCount: (count) => `最多 40 个字符，当前：${count}/40`, cancel: "取消", save: "保存", create: "创建", close: "关闭", deleteFolderTitle: "删除文件夹", deleteFolderIntro: (name) => `你将删除文件夹“${name}”。`, deleteFolderWarning: "删除该文件夹也会永久删除其中的所有转写，此操作无法撤销。", planAnonymous: "免费", planFree: "免费", planBasic: "基础版", planStandard: "标准版", planPro: "专业版"},
  "zh-TW": {avatarAlt: "頭像", accountMenu: "帳號選單", billing: "帳單", emailSupport: "郵件支援", settings: "設定", theme: "主題", themeLight: "淺色", themeDark: "深色", themeSystem: "跟隨系統", signOut: "登出", supportResponseSoon: "我們會盡快回覆", supportPaidUsers: "付費使用者", supportFreeUsers: "免費使用者", supportWithin24Hours: "24 小時內", supportWithin48Hours: "48 小時內", currentPlan: "目前方案", dailyQuota: "每日", minutesQuota: "分鐘", minuteSuffix: "分", dashboardNav: "儀表板", createFolderAria: "建立資料夾", folderActions: (name) => `${name} 的資料夾操作`, rename: "重新命名", delete: "刪除", renameFolderTitle: "重新命名資料夾", createFolderTitle: "建立資料夾", folderName: "資料夾名稱", folderNamePlaceholder: "輸入資料夾名稱", folderCharacterCount: (count) => `最多 40 個字元，目前：${count}/40`, cancel: "取消", save: "儲存", create: "建立", close: "關閉", deleteFolderTitle: "刪除資料夾", deleteFolderIntro: (name) => `你將刪除資料夾「${name}」。`, deleteFolderWarning: "刪除此資料夾也會永久刪除其中所有轉寫，此操作無法復原。", planAnonymous: "免費", planFree: "免費", planBasic: "基礎版", planStandard: "標準版", planPro: "專業版"}
};

const workspaceSidebarSentenceCopy: Record<Locale, Pick<WorkspaceSidebarCopy, "deleteFolderIntro" | "deleteFolderWarning" | "folderActions" | "folderCharacterCount" | "supportResponseSoon">> = {
  ar: {supportResponseSoon: "سنرد في أقرب وقت ممكن", folderActions: (name) => `إجراءات المجلد ${name}`, folderCharacterCount: (count) => `الحد الأقصى 40 حرفاً، الحالي: ${count}/40`, deleteFolderIntro: (name) => `أنت على وشك حذف المجلد "${name}".`, deleteFolderWarning: "سيؤدي حذف هذا المجلد أيضاً إلى حذف كل التفريغات داخله نهائياً. لا يمكن التراجع عن هذا الإجراء."},
  de: {supportResponseSoon: "Wir antworten so schnell wie möglich", folderActions: (name) => `Ordneraktionen für ${name}`, folderCharacterCount: (count) => `Maximal 40 Zeichen, aktuell: ${count}/40`, deleteFolderIntro: (name) => `Du bist dabei, den Ordner "${name}" zu löschen.`, deleteFolderWarning: "Beim Löschen dieses Ordners werden auch alle Transkriptionen darin dauerhaft gelöscht. Dies kann nicht rückgängig gemacht werden."},
  en: {supportResponseSoon: "We'll respond as soon as possible", folderActions: (name) => `Folder actions for ${name}`, folderCharacterCount: (count) => `Maximum 40 characters, current: ${count}/40`, deleteFolderIntro: (name) => `You are about to delete folder "${name}".`, deleteFolderWarning: "Deleting this folder will also permanently delete all transcriptions inside. This cannot be undone."},
  es: {supportResponseSoon: "Responderemos lo antes posible", folderActions: (name) => `Acciones de carpeta para ${name}`, folderCharacterCount: (count) => `Máximo 40 caracteres, actual: ${count}/40`, deleteFolderIntro: (name) => `Vas a eliminar la carpeta "${name}".`, deleteFolderWarning: "Al eliminar esta carpeta también se eliminarán permanentemente todas las transcripciones que contiene. Esta acción no se puede deshacer."},
  fr: {supportResponseSoon: "Nous répondrons dès que possible", folderActions: (name) => `Actions du dossier ${name}`, folderCharacterCount: (count) => `40 caractères maximum, actuel : ${count}/40`, deleteFolderIntro: (name) => `Vous êtes sur le point de supprimer le dossier "${name}".`, deleteFolderWarning: "La suppression de ce dossier supprimera définitivement toutes les transcriptions qu'il contient. Cette action est irréversible."},
  hu: {supportResponseSoon: "A lehető leghamarabb válaszolunk", folderActions: (name) => `Mappaműveletek: ${name}`, folderCharacterCount: (count) => `Legfeljebb 40 karakter, jelenleg: ${count}/40`, deleteFolderIntro: (name) => `A(z) "${name}" mappa törlésére készülsz.`, deleteFolderWarning: "A mappa törlése a benne lévő összes átírást is véglegesen törli. Ez nem vonható vissza."},
  id: {supportResponseSoon: "Kami akan merespons secepat mungkin", folderActions: (name) => `Tindakan folder untuk ${name}`, folderCharacterCount: (count) => `Maksimum 40 karakter, saat ini: ${count}/40`, deleteFolderIntro: (name) => `Anda akan menghapus folder "${name}".`, deleteFolderWarning: "Menghapus folder ini juga akan menghapus permanen semua transkripsi di dalamnya. Tindakan ini tidak dapat dibatalkan."},
  it: {supportResponseSoon: "Risponderemo il prima possibile", folderActions: (name) => `Azioni cartella per ${name}`, folderCharacterCount: (count) => `Massimo 40 caratteri, attuali: ${count}/40`, deleteFolderIntro: (name) => `Stai per eliminare la cartella "${name}".`, deleteFolderWarning: "Eliminando questa cartella verranno eliminate definitivamente anche tutte le trascrizioni al suo interno. L'azione non può essere annullata."},
  ja: {supportResponseSoon: "できるだけ早く返信します", folderActions: (name) => `${name} のフォルダ操作`, folderCharacterCount: (count) => `最大 40 文字、現在: ${count}/40`, deleteFolderIntro: (name) => `フォルダ「${name}」を削除しようとしています。`, deleteFolderWarning: "このフォルダを削除すると、中のすべての文字起こしも完全に削除されます。この操作は元に戻せません。"},
  ko: {supportResponseSoon: "가능한 한 빨리 답변드리겠습니다", folderActions: (name) => `${name} 폴더 작업`, folderCharacterCount: (count) => `최대 40자, 현재: ${count}/40`, deleteFolderIntro: (name) => `"${name}" 폴더를 삭제하려고 합니다.`, deleteFolderWarning: "이 폴더를 삭제하면 안의 모든 전사도 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다."},
  nl: {supportResponseSoon: "We reageren zo snel mogelijk", folderActions: (name) => `Mapacties voor ${name}`, folderCharacterCount: (count) => `Maximaal 40 tekens, nu: ${count}/40`, deleteFolderIntro: (name) => `Je staat op het punt map "${name}" te verwijderen.`, deleteFolderWarning: "Als je deze map verwijdert, worden ook alle transcripties erin permanent verwijderd. Dit kan niet ongedaan worden gemaakt."},
  pl: {supportResponseSoon: "Odpowiemy tak szybko, jak to możliwe", folderActions: (name) => `Akcje folderu ${name}`, folderCharacterCount: (count) => `Maksymalnie 40 znaków, obecnie: ${count}/40`, deleteFolderIntro: (name) => `Zamierzasz usunąć folder "${name}".`, deleteFolderWarning: "Usunięcie tego folderu trwale usunie także wszystkie transkrypcje w środku. Tej czynności nie można cofnąć."},
  pt: {supportResponseSoon: "Responderemos o mais rápido possível", folderActions: (name) => `Ações da pasta ${name}`, folderCharacterCount: (count) => `Máximo de 40 caracteres, atual: ${count}/40`, deleteFolderIntro: (name) => `Você está prestes a excluir a pasta "${name}".`, deleteFolderWarning: "Excluir esta pasta também excluirá permanentemente todas as transcrições nela. Esta ação não pode ser desfeita."},
  ru: {supportResponseSoon: "Мы ответим как можно скорее", folderActions: (name) => `Действия с папкой ${name}`, folderCharacterCount: (count) => `Максимум 40 символов, сейчас: ${count}/40`, deleteFolderIntro: (name) => `Вы собираетесь удалить папку "${name}".`, deleteFolderWarning: "Удаление этой папки также навсегда удалит все расшифровки внутри. Это действие нельзя отменить."},
  th: {supportResponseSoon: "เราจะตอบกลับโดยเร็วที่สุด", folderActions: (name) => `การทำงานของโฟลเดอร์ ${name}`, folderCharacterCount: (count) => `สูงสุด 40 ตัวอักษร ปัจจุบัน: ${count}/40`, deleteFolderIntro: (name) => `คุณกำลังจะลบโฟลเดอร์ "${name}"`, deleteFolderWarning: "การลบโฟลเดอร์นี้จะลบทรานสคริปต์ทั้งหมดภายในอย่างถาวรด้วย การกระทำนี้ไม่สามารถย้อนกลับได้"},
  tr: {supportResponseSoon: "En kısa sürede yanıt vereceğiz", folderActions: (name) => `${name} klasörü işlemleri`, folderCharacterCount: (count) => `En fazla 40 karakter, mevcut: ${count}/40`, deleteFolderIntro: (name) => `"${name}" klasörünü silmek üzeresin.`, deleteFolderWarning: "Bu klasörü silmek, içindeki tüm transkripsiyonları da kalıcı olarak siler. Bu işlem geri alınamaz."},
  uk: {supportResponseSoon: "Ми відповімо якнайшвидше", folderActions: (name) => `Дії з папкою ${name}`, folderCharacterCount: (count) => `Максимум 40 символів, зараз: ${count}/40`, deleteFolderIntro: (name) => `Ви збираєтеся видалити папку "${name}".`, deleteFolderWarning: "Видалення цієї папки також назавжди видалить усі транскрипції всередині. Цю дію не можна скасувати."},
  vi: {supportResponseSoon: "Chúng tôi sẽ phản hồi sớm nhất có thể", folderActions: (name) => `Thao tác thư mục cho ${name}`, folderCharacterCount: (count) => `Tối đa 40 ký tự, hiện tại: ${count}/40`, deleteFolderIntro: (name) => `Bạn sắp xóa thư mục "${name}".`, deleteFolderWarning: "Xóa thư mục này cũng sẽ xóa vĩnh viễn tất cả bản chép lời bên trong. Không thể hoàn tác hành động này."},
  zh: {supportResponseSoon: "我们会尽快回复", folderActions: (name) => `${name} 的文件夹操作`, folderCharacterCount: (count) => `最多 40 个字符，当前：${count}/40`, deleteFolderIntro: (name) => `你将删除文件夹“${name}”。`, deleteFolderWarning: "删除该文件夹也会永久删除其中的所有转写，此操作无法撤销。"},
  "zh-TW": {supportResponseSoon: "我們會盡快回覆", folderActions: (name) => `${name} 的資料夾操作`, folderCharacterCount: (count) => `最多 40 個字元，目前：${count}/40`, deleteFolderIntro: (name) => `你將刪除資料夾「${name}」。`, deleteFolderWarning: "刪除此資料夾也會永久刪除其中所有轉寫，此操作無法復原。"}
};

function getWorkspaceSidebarCopy(locale: Locale): WorkspaceSidebarCopy {
  const overrides = workspaceSidebarCopyOverrides[locale] ?? {};
  return {
    ...workspaceSidebarCopyEn,
    ...workspaceSidebarSentenceCopy[locale],
    ...overrides,
    language: workspaceSidebarLanguageLabels[locale]
  };
}

type WorkspaceDashboardTerms = {
  oneTime: string;
  monthly: string;
  annual: string;
  save40: string;
  save50: string;
  newBadge: string;
  oneTimePayment: string;
  oneTimeNote: string;
  billedYearly: (amount: string) => string;
  cancelAnytime: string;
  instantAccess: string;
  buyNow: string;
  subscribeNow: string;
  upgradeNow: string;
  seeAllPlans: string;
  limitedTime: string;
  justFivePerMonth: string;
  subscription: string;
  mostPopular: string;
  fileLimit: string;
  noDailyLimit: string;
  noRetention: string;
  validity90: string;
  totalMinutes: (minutes: string) => string;
  monthlyMinutes: (minutes: string) => string;
  extraMinutes: (price: string, minutes: string) => string;
  emptyTitle: string;
  emptyAria: string;
  loadingAria: string;
  selectAllVisible: string;
  selectTask: (title: string) => string;
  actionsFor: (title: string) => string;
  itemsSelected: (count: number) => string;
  retranscribe: string;
  retryTranscription: string;
  youtubeFallbackRetry: string;
  downloadOriginalFile: string;
  deleteOriginalFile: string;
  preparingAudio: string;
  smartChunks: string;
  segmentLabel: (count: number) => string;
  notNeeded: string;
  provider: string;
  fallbackReady: string;
  regenerate: string;
  translationTargetLanguage: string;
  generateTranslation: string;
};

const workspaceDashboardTerms: Record<Locale, WorkspaceDashboardTerms> = {
  ar: {oneTime: "مرة واحدة", monthly: "شهري", annual: "سنوي", save40: "وفر 40%", save50: "خصم 50%", newBadge: "جديد", oneTimePayment: "دفعة واحدة", oneTimeNote: "تدعم كل باقات الدفع لمرة واحدة الدفع بالبطاقة والعملات المشفرة عبر Stripe.", billedYearly: (amount) => `يُفوتر سنوياً (${amount}/سنة)`, cancelAnytime: "إلغاء في أي وقت", instantAccess: "وصول فوري", buyNow: "اشتر الآن", subscribeNow: "اشترك الآن", upgradeNow: "رق الآن", seeAllPlans: "عرض كل الخطط", limitedTime: "وقت محدود", justFivePerMonth: "فقط $5.00 شهرياً", subscription: "اشتراك", mostPopular: "الأكثر شيوعاً", fileLimit: "كل ملف حتى 10 ساعات / 5GB. ارفع 50 ملفاً في كل مرة.", noDailyLimit: "لا حد يومي لملفات التفريغ", noRetention: "لا توجد مدة احتفاظ بملفات الوسائط", validity90: "صلاحية 90 يوماً", totalMinutes: (minutes) => `${minutes} دقيقة تفريغ إجمالاً`, monthlyMinutes: (minutes) => `${minutes} دقيقة تفريغ شهرياً`, extraMinutes: (price, minutes) => `${price} لكل ${minutes} دقيقة إضافية`, emptyTitle: "لا توجد تفريغات هنا بعد!", emptyAria: "لم يتم العثور على تفريغ", loadingAria: "جار تحميل التفريغات", selectAllVisible: "تحديد كل التفريغات الظاهرة", selectTask: (title) => `تحديد ${title}`, actionsFor: (title) => `إجراءات ${title}`, itemsSelected: (count) => `${count} عنصر محدد`, retranscribe: "إعادة التفريغ", retryTranscription: "إعادة محاولة التفريغ", youtubeFallbackRetry: "إعادة محاولة YouTube الاحتياطية", downloadOriginalFile: "تنزيل الملف الأصلي", deleteOriginalFile: "حذف الملف الأصلي", preparingAudio: "جار تجهيز الصوت", smartChunks: "مقاطع ذكية", segmentLabel: (count) => `${count} مقطع`, notNeeded: "غير مطلوب", provider: "المزود", fallbackReady: "البديل جاهز", regenerate: "إعادة الإنشاء", translationTargetLanguage: "لغة الترجمة الهدف", generateTranslation: "إنشاء ترجمة"},
  de: {oneTime: "Einmalig", monthly: "Monatlich", annual: "Jährlich", save40: "40% sparen", save50: "50% Rabatt", newBadge: "Neu", oneTimePayment: "Einmalzahlung", oneTimeNote: "Alle Einmalpakete unterstützen Karten- und Kryptozahlungen über Stripe.", billedYearly: (amount) => `Jährlich berechnet (${amount}/Jahr)`, cancelAnytime: "Jederzeit kündbar", instantAccess: "Sofortiger Zugriff", buyNow: "Jetzt kaufen", subscribeNow: "Jetzt abonnieren", upgradeNow: "Jetzt upgraden", seeAllPlans: "Alle Pläne ansehen", limitedTime: "Nur kurze Zeit", justFivePerMonth: "Nur $5.00 pro Monat", subscription: "Abo", mostPopular: "Am beliebtesten", fileLimit: "Jede Datei bis 10 Stunden / 5GB. 50 Dateien gleichzeitig hochladen.", noDailyLimit: "Kein tägliches Dateilimit für Transkription", noRetention: "Keine Aufbewahrungsfrist für Mediendateien", validity90: "90 Tage gültig", totalMinutes: (minutes) => `${minutes} Transkriptionsminuten gesamt`, monthlyMinutes: (minutes) => `${minutes} Transkriptionsminuten pro Monat`, extraMinutes: (price, minutes) => `${price} pro ${minutes} Zusatzminuten`, emptyTitle: "Noch keine Transkriptionen hier!", emptyAria: "Keine Transkription gefunden", loadingAria: "Transkriptionen werden geladen", selectAllVisible: "Alle sichtbaren Transkriptionen auswählen", selectTask: (title) => `${title} auswählen`, actionsFor: (title) => `Aktionen für ${title}`, itemsSelected: (count) => `${count} Elemente ausgewählt`, retranscribe: "Neu transkribieren", retryTranscription: "Transkription erneut versuchen", youtubeFallbackRetry: "YouTube-Fallback erneut versuchen", downloadOriginalFile: "Originaldatei herunterladen", deleteOriginalFile: "Originaldatei löschen", preparingAudio: "Audio wird vorbereitet", smartChunks: "Smarte Abschnitte", segmentLabel: (count) => `${count} Segment${count === 1 ? "" : "e"}`, notNeeded: "Nicht nötig", provider: "Anbieter", fallbackReady: "Fallback bereit", regenerate: "Neu generieren", translationTargetLanguage: "Zielsprache der Übersetzung", generateTranslation: "Übersetzung generieren"},
  en: {oneTime: "One-Time", monthly: "Monthly", annual: "Annual", save40: "Save 40%", save50: "50% OFF", newBadge: "New", oneTimePayment: "One-time payment", oneTimeNote: "All one-time plans support card and crypto payments via Stripe.", billedYearly: (amount) => `Billed yearly (${amount}/year)`, cancelAnytime: "Cancel anytime", instantAccess: "Instant access", buyNow: "Buy now", subscribeNow: "Subscribe now", upgradeNow: "Upgrade Now", seeAllPlans: "See All Plans", limitedTime: "Limited Time", justFivePerMonth: "Just $5.00 per month", subscription: "Subscription", mostPopular: "Most popular", fileLimit: "Each file can be up to 10 hours long / 5 GB. Upload 50 files at a time.", noDailyLimit: "No daily file limit for transcription", noRetention: "No retention period for media files", validity90: "90-day validity", totalMinutes: (minutes) => `${minutes} minutes total transcription`, monthlyMinutes: (minutes) => `${minutes} minutes of transcription per month`, extraMinutes: (price, minutes) => `${price} per ${minutes} extra minutes`, emptyTitle: "No Transcriptions Here Yet!", emptyAria: "No transcription found", loadingAria: "Loading transcriptions", selectAllVisible: "Select all visible transcriptions", selectTask: (title) => `Select ${title}`, actionsFor: (title) => `Actions for ${title}`, itemsSelected: (count) => `${count} item${count === 1 ? "" : "s"} selected`, retranscribe: "Retranscribe", retryTranscription: "Retry transcription", youtubeFallbackRetry: "YouTube fallback retry", downloadOriginalFile: "Download original file", deleteOriginalFile: "Delete original file", preparingAudio: "Preparing audio", smartChunks: "Smart chunks", segmentLabel: (count) => `${count} segment${count === 1 ? "" : "s"}`, notNeeded: "Not needed", provider: "Provider", fallbackReady: "Fallback ready", regenerate: "Regenerate", translationTargetLanguage: "Translation target language", generateTranslation: "Generate translation"},
  es: {oneTime: "Pago único", monthly: "Mensual", annual: "Anual", save40: "Ahorra 40%", save50: "50% OFF", newBadge: "Nuevo", oneTimePayment: "Pago único", oneTimeNote: "Todos los planes de pago único admiten tarjeta y cripto mediante Stripe.", billedYearly: (amount) => `Facturado anualmente (${amount}/año)`, cancelAnytime: "Cancela cuando quieras", instantAccess: "Acceso instantáneo", buyNow: "Comprar ahora", subscribeNow: "Suscribirse", upgradeNow: "Mejorar ahora", seeAllPlans: "Ver todos los planes", limitedTime: "Tiempo limitado", justFivePerMonth: "Solo $5.00 al mes", subscription: "Suscripción", mostPopular: "Más popular", fileLimit: "Cada archivo puede durar hasta 10 horas / 5GB. Sube 50 archivos a la vez.", noDailyLimit: "Sin límite diario de archivos para transcribir", noRetention: "Sin periodo de retención para archivos multimedia", validity90: "Validez de 90 días", totalMinutes: (minutes) => `${minutes} minutos totales de transcripción`, monthlyMinutes: (minutes) => `${minutes} minutos de transcripción al mes`, extraMinutes: (price, minutes) => `${price} por ${minutes} minutos extra`, emptyTitle: "¡Aún no hay transcripciones aquí!", emptyAria: "No se encontró ninguna transcripción", loadingAria: "Cargando transcripciones", selectAllVisible: "Seleccionar todas las transcripciones visibles", selectTask: (title) => `Seleccionar ${title}`, actionsFor: (title) => `Acciones para ${title}`, itemsSelected: (count) => `${count} elementos seleccionados`, retranscribe: "Retranscribir", retryTranscription: "Reintentar transcripción", youtubeFallbackRetry: "Reintento alternativo de YouTube", downloadOriginalFile: "Descargar archivo original", deleteOriginalFile: "Eliminar archivo original", preparingAudio: "Preparando audio", smartChunks: "Fragmentos inteligentes", segmentLabel: (count) => `${count} segmento${count === 1 ? "" : "s"}`, notNeeded: "No necesario", provider: "Proveedor", fallbackReady: "Alternativa lista", regenerate: "Regenerar", translationTargetLanguage: "Idioma destino de traducción", generateTranslation: "Generar traducción"},
  fr: {oneTime: "Paiement unique", monthly: "Mensuel", annual: "Annuel", save40: "Économisez 40%", save50: "50% OFF", newBadge: "Nouveau", oneTimePayment: "Paiement unique", oneTimeNote: "Tous les forfaits uniques acceptent les paiements par carte et crypto via Stripe.", billedYearly: (amount) => `Facturé annuellement (${amount}/an)`, cancelAnytime: "Annulation à tout moment", instantAccess: "Accès instantané", buyNow: "Acheter", subscribeNow: "S'abonner", upgradeNow: "Mettre à niveau", seeAllPlans: "Voir tous les forfaits", limitedTime: "Durée limitée", justFivePerMonth: "Seulement $5.00 par mois", subscription: "Abonnement", mostPopular: "Le plus populaire", fileLimit: "Chaque fichier peut durer jusqu'à 10 heures / 5GB. Importez 50 fichiers à la fois.", noDailyLimit: "Aucune limite quotidienne de fichiers pour la transcription", noRetention: "Aucune période de conservation des médias", validity90: "Validité 90 jours", totalMinutes: (minutes) => `${minutes} minutes totales de transcription`, monthlyMinutes: (minutes) => `${minutes} minutes de transcription par mois`, extraMinutes: (price, minutes) => `${price} pour ${minutes} minutes supplémentaires`, emptyTitle: "Aucune transcription ici pour l'instant !", emptyAria: "Aucune transcription trouvée", loadingAria: "Chargement des transcriptions", selectAllVisible: "Sélectionner toutes les transcriptions visibles", selectTask: (title) => `Sélectionner ${title}`, actionsFor: (title) => `Actions pour ${title}`, itemsSelected: (count) => `${count} éléments sélectionnés`, retranscribe: "Retranscrire", retryTranscription: "Réessayer la transcription", youtubeFallbackRetry: "Réessai de secours YouTube", downloadOriginalFile: "Télécharger le fichier original", deleteOriginalFile: "Supprimer le fichier original", preparingAudio: "Préparation de l'audio", smartChunks: "Segments intelligents", segmentLabel: (count) => `${count} segment${count === 1 ? "" : "s"}`, notNeeded: "Non nécessaire", provider: "Fournisseur", fallbackReady: "Secours prêt", regenerate: "Régénérer", translationTargetLanguage: "Langue cible de traduction", generateTranslation: "Générer la traduction"},
  hu: {oneTime: "Egyszeri", monthly: "Havi", annual: "Éves", save40: "40% megtakarítás", save50: "50% kedvezmény", newBadge: "Új", oneTimePayment: "Egyszeri fizetés", oneTimeNote: "Minden egyszeri csomag támogat kártyás és kriptós fizetést Stripe-on keresztül.", billedYearly: (amount) => `Évente számlázva (${amount}/év)`, cancelAnytime: "Bármikor lemondható", instantAccess: "Azonnali hozzáférés", buyNow: "Vásárlás", subscribeNow: "Feliratkozás", upgradeNow: "Frissítés most", seeAllPlans: "Összes csomag", limitedTime: "Korlátozott idő", justFivePerMonth: "Csak $5.00 havonta", subscription: "Előfizetés", mostPopular: "Legnépszerűbb", fileLimit: "Fájlonként legfeljebb 10 óra / 5GB. Egyszerre 50 fájl tölthető fel.", noDailyLimit: "Nincs napi fájllimit az átíráshoz", noRetention: "Nincs megőrzési idő a médiafájlokra", validity90: "90 napig érvényes", totalMinutes: (minutes) => `${minutes} perc átírás összesen`, monthlyMinutes: (minutes) => `${minutes} perc átírás havonta`, extraMinutes: (price, minutes) => `${price} / ${minutes} extra perc`, emptyTitle: "Még nincs itt átírás!", emptyAria: "Nem található átírás", loadingAria: "Átírások betöltése", selectAllVisible: "Minden látható átírás kijelölése", selectTask: (title) => `${title} kijelölése`, actionsFor: (title) => `Műveletek: ${title}`, itemsSelected: (count) => `${count} elem kijelölve`, retranscribe: "Újraátírás", retryTranscription: "Átírás újrapróbálása", youtubeFallbackRetry: "YouTube tartalék újrapróbálása", downloadOriginalFile: "Eredeti fájl letöltése", deleteOriginalFile: "Eredeti fájl törlése", preparingAudio: "Hang előkészítése", smartChunks: "Okos darabok", segmentLabel: (count) => `${count} szegmens`, notNeeded: "Nem szükséges", provider: "Szolgáltató", fallbackReady: "Tartalék kész", regenerate: "Újragenerálás", translationTargetLanguage: "Fordítás cél nyelve", generateTranslation: "Fordítás generálása"},
  id: {oneTime: "Sekali bayar", monthly: "Bulanan", annual: "Tahunan", save40: "Hemat 40%", save50: "Diskon 50%", newBadge: "Baru", oneTimePayment: "Pembayaran sekali", oneTimeNote: "Semua paket sekali bayar mendukung kartu dan kripto melalui Stripe.", billedYearly: (amount) => `Ditagih tahunan (${amount}/tahun)`, cancelAnytime: "Batal kapan saja", instantAccess: "Akses instan", buyNow: "Beli sekarang", subscribeNow: "Berlangganan", upgradeNow: "Tingkatkan sekarang", seeAllPlans: "Lihat semua paket", limitedTime: "Waktu terbatas", justFivePerMonth: "Hanya $5.00 per bulan", subscription: "Langganan", mostPopular: "Paling populer", fileLimit: "Setiap file hingga 10 jam / 5GB. Unggah 50 file sekaligus.", noDailyLimit: "Tanpa batas file harian untuk transkripsi", noRetention: "Tanpa masa retensi untuk file media", validity90: "Berlaku 90 hari", totalMinutes: (minutes) => `${minutes} menit transkripsi total`, monthlyMinutes: (minutes) => `${minutes} menit transkripsi per bulan`, extraMinutes: (price, minutes) => `${price} per ${minutes} menit tambahan`, emptyTitle: "Belum ada transkripsi di sini!", emptyAria: "Transkripsi tidak ditemukan", loadingAria: "Memuat transkripsi", selectAllVisible: "Pilih semua transkripsi yang terlihat", selectTask: (title) => `Pilih ${title}`, actionsFor: (title) => `Tindakan untuk ${title}`, itemsSelected: (count) => `${count} item dipilih`, retranscribe: "Transkripsi ulang", retryTranscription: "Coba transkripsi lagi", youtubeFallbackRetry: "Coba fallback YouTube lagi", downloadOriginalFile: "Unduh file asli", deleteOriginalFile: "Hapus file asli", preparingAudio: "Menyiapkan audio", smartChunks: "Potongan pintar", segmentLabel: (count) => `${count} segmen`, notNeeded: "Tidak diperlukan", provider: "Penyedia", fallbackReady: "Fallback siap", regenerate: "Buat ulang", translationTargetLanguage: "Bahasa target terjemahan", generateTranslation: "Buat terjemahan"},
  it: {oneTime: "Una tantum", monthly: "Mensile", annual: "Annuale", save40: "Risparmia 40%", save50: "50% OFF", newBadge: "Nuovo", oneTimePayment: "Pagamento una tantum", oneTimeNote: "Tutti i piani una tantum supportano pagamenti con carta e crypto tramite Stripe.", billedYearly: (amount) => `Fatturato annualmente (${amount}/anno)`, cancelAnytime: "Annulla quando vuoi", instantAccess: "Accesso immediato", buyNow: "Acquista ora", subscribeNow: "Abbonati ora", upgradeNow: "Aggiorna ora", seeAllPlans: "Vedi tutti i piani", limitedTime: "Tempo limitato", justFivePerMonth: "Solo $5.00 al mese", subscription: "Abbonamento", mostPopular: "Più popolare", fileLimit: "Ogni file può durare fino a 10 ore / 5GB. Carica 50 file alla volta.", noDailyLimit: "Nessun limite giornaliero di file per la trascrizione", noRetention: "Nessun periodo di conservazione per i file media", validity90: "Validità 90 giorni", totalMinutes: (minutes) => `${minutes} minuti totali di trascrizione`, monthlyMinutes: (minutes) => `${minutes} minuti di trascrizione al mese`, extraMinutes: (price, minutes) => `${price} per ${minutes} minuti extra`, emptyTitle: "Ancora nessuna trascrizione qui!", emptyAria: "Nessuna trascrizione trovata", loadingAria: "Caricamento trascrizioni", selectAllVisible: "Seleziona tutte le trascrizioni visibili", selectTask: (title) => `Seleziona ${title}`, actionsFor: (title) => `Azioni per ${title}`, itemsSelected: (count) => `${count} elementi selezionati`, retranscribe: "Ritrascrivi", retryTranscription: "Riprova trascrizione", youtubeFallbackRetry: "Riprova fallback YouTube", downloadOriginalFile: "Scarica file originale", deleteOriginalFile: "Elimina file originale", preparingAudio: "Preparazione audio", smartChunks: "Segmenti intelligenti", segmentLabel: (count) => `${count} segmento${count === 1 ? "" : "i"}`, notNeeded: "Non necessario", provider: "Provider", fallbackReady: "Fallback pronto", regenerate: "Rigenera", translationTargetLanguage: "Lingua di destinazione", generateTranslation: "Genera traduzione"},
  ja: {oneTime: "買い切り", monthly: "月額", annual: "年額", save40: "40% お得", save50: "50% OFF", newBadge: "新規", oneTimePayment: "一回払い", oneTimeNote: "すべての買い切りプランは Stripe 経由のカード決済と暗号資産決済に対応しています。", billedYearly: (amount) => `年払い (${amount}/年)`, cancelAnytime: "いつでもキャンセル", instantAccess: "すぐに利用開始", buyNow: "今すぐ購入", subscribeNow: "今すぐ登録", upgradeNow: "今すぐアップグレード", seeAllPlans: "すべてのプランを見る", limitedTime: "期間限定", justFivePerMonth: "月 $5.00 のみ", subscription: "サブスクリプション", mostPopular: "一番人気", fileLimit: "各ファイルは最大 10 時間 / 5GB。50 ファイルを同時にアップロードできます。", noDailyLimit: "文字起こしの 1 日あたりファイル制限なし", noRetention: "メディアファイルの保持期限なし", validity90: "90 日間有効", totalMinutes: (minutes) => `合計 ${minutes} 分の文字起こし`, monthlyMinutes: (minutes) => `月 ${minutes} 分の文字起こし`, extraMinutes: (price, minutes) => `${minutes} 分追加ごとに ${price}`, emptyTitle: "まだ文字起こしはありません！", emptyAria: "文字起こしが見つかりません", loadingAria: "文字起こしを読み込み中", selectAllVisible: "表示中の文字起こしをすべて選択", selectTask: (title) => `${title} を選択`, actionsFor: (title) => `${title} の操作`, itemsSelected: (count) => `${count} 件選択中`, retranscribe: "再文字起こし", retryTranscription: "文字起こしを再試行", youtubeFallbackRetry: "YouTube 代替を再試行", downloadOriginalFile: "元ファイルをダウンロード", deleteOriginalFile: "元ファイルを削除", preparingAudio: "音声を準備中", smartChunks: "スマート分割", segmentLabel: (count) => `${count} セグメント`, notNeeded: "不要", provider: "プロバイダー", fallbackReady: "代替準備完了", regenerate: "再生成", translationTargetLanguage: "翻訳先言語", generateTranslation: "翻訳を生成"},
  ko: {oneTime: "일회성", monthly: "월간", annual: "연간", save40: "40% 절약", save50: "50% 할인", newBadge: "신규", oneTimePayment: "일회성 결제", oneTimeNote: "모든 일회성 플랜은 Stripe를 통한 카드 및 암호화폐 결제를 지원합니다.", billedYearly: (amount) => `연간 청구 (${amount}/년)`, cancelAnytime: "언제든 취소", instantAccess: "즉시 이용", buyNow: "지금 구매", subscribeNow: "지금 구독", upgradeNow: "지금 업그레이드", seeAllPlans: "모든 플랜 보기", limitedTime: "한정 시간", justFivePerMonth: "월 $5.00만", subscription: "구독", mostPopular: "가장 인기", fileLimit: "파일당 최대 10시간 / 5GB. 한 번에 50개 파일 업로드.", noDailyLimit: "전사 파일 일일 제한 없음", noRetention: "미디어 파일 보관 기간 없음", validity90: "90일 유효", totalMinutes: (minutes) => `총 ${minutes}분 전사`, monthlyMinutes: (minutes) => `월 ${minutes}분 전사`, extraMinutes: (price, minutes) => `${minutes}분 추가당 ${price}`, emptyTitle: "아직 전사가 없습니다!", emptyAria: "전사를 찾을 수 없음", loadingAria: "전사 불러오는 중", selectAllVisible: "보이는 모든 전사 선택", selectTask: (title) => `${title} 선택`, actionsFor: (title) => `${title} 작업`, itemsSelected: (count) => `${count}개 선택됨`, retranscribe: "다시 전사", retryTranscription: "전사 재시도", youtubeFallbackRetry: "YouTube 대체 재시도", downloadOriginalFile: "원본 파일 다운로드", deleteOriginalFile: "원본 파일 삭제", preparingAudio: "오디오 준비 중", smartChunks: "스마트 청크", segmentLabel: (count) => `${count}개 세그먼트`, notNeeded: "필요 없음", provider: "제공자", fallbackReady: "대체 준비됨", regenerate: "다시 생성", translationTargetLanguage: "번역 대상 언어", generateTranslation: "번역 생성"},
  nl: {oneTime: "Eenmalig", monthly: "Maandelijks", annual: "Jaarlijks", save40: "Bespaar 40%", save50: "50% korting", newBadge: "Nieuw", oneTimePayment: "Eenmalige betaling", oneTimeNote: "Alle eenmalige plannen ondersteunen kaart- en cryptobetalingen via Stripe.", billedYearly: (amount) => `Jaarlijks gefactureerd (${amount}/jaar)`, cancelAnytime: "Altijd opzegbaar", instantAccess: "Directe toegang", buyNow: "Nu kopen", subscribeNow: "Nu abonneren", upgradeNow: "Nu upgraden", seeAllPlans: "Alle plannen bekijken", limitedTime: "Beperkte tijd", justFivePerMonth: "Slechts $5.00 per maand", subscription: "Abonnement", mostPopular: "Populairst", fileLimit: "Elk bestand tot 10 uur / 5GB. Upload 50 bestanden tegelijk.", noDailyLimit: "Geen dagelijkse bestandslimiet voor transcriptie", noRetention: "Geen bewaartermijn voor mediabestanden", validity90: "90 dagen geldig", totalMinutes: (minutes) => `${minutes} transcriptieminuten totaal`, monthlyMinutes: (minutes) => `${minutes} transcriptieminuten per maand`, extraMinutes: (price, minutes) => `${price} per ${minutes} extra minuten`, emptyTitle: "Nog geen transcripties hier!", emptyAria: "Geen transcriptie gevonden", loadingAria: "Transcripties laden", selectAllVisible: "Alle zichtbare transcripties selecteren", selectTask: (title) => `${title} selecteren`, actionsFor: (title) => `Acties voor ${title}`, itemsSelected: (count) => `${count} items geselecteerd`, retranscribe: "Opnieuw transcriberen", retryTranscription: "Transcriptie opnieuw proberen", youtubeFallbackRetry: "YouTube-fallback opnieuw proberen", downloadOriginalFile: "Origineel bestand downloaden", deleteOriginalFile: "Origineel bestand verwijderen", preparingAudio: "Audio voorbereiden", smartChunks: "Slimme segmenten", segmentLabel: (count) => `${count} segment${count === 1 ? "" : "en"}`, notNeeded: "Niet nodig", provider: "Provider", fallbackReady: "Fallback klaar", regenerate: "Opnieuw genereren", translationTargetLanguage: "Doeltaal voor vertaling", generateTranslation: "Vertaling genereren"},
  pl: {oneTime: "Jednorazowo", monthly: "Miesięcznie", annual: "Rocznie", save40: "Oszczędź 40%", save50: "50% zniżki", newBadge: "Nowe", oneTimePayment: "Płatność jednorazowa", oneTimeNote: "Wszystkie plany jednorazowe obsługują płatności kartą i krypto przez Stripe.", billedYearly: (amount) => `Rozliczane rocznie (${amount}/rok)`, cancelAnytime: "Anuluj w dowolnym momencie", instantAccess: "Natychmiastowy dostęp", buyNow: "Kup teraz", subscribeNow: "Subskrybuj", upgradeNow: "Ulepsz teraz", seeAllPlans: "Zobacz wszystkie plany", limitedTime: "Ograniczony czas", justFivePerMonth: "Tylko $5.00 miesięcznie", subscription: "Subskrypcja", mostPopular: "Najpopularniejszy", fileLimit: "Każdy plik do 10 godzin / 5GB. Przesyłaj 50 plików naraz.", noDailyLimit: "Brak dziennego limitu plików do transkrypcji", noRetention: "Brak okresu przechowywania plików multimedialnych", validity90: "Ważne 90 dni", totalMinutes: (minutes) => `${minutes} minut transkrypcji łącznie`, monthlyMinutes: (minutes) => `${minutes} minut transkrypcji miesięcznie`, extraMinutes: (price, minutes) => `${price} za ${minutes} dodatkowych minut`, emptyTitle: "Nie ma tu jeszcze transkrypcji!", emptyAria: "Nie znaleziono transkrypcji", loadingAria: "Ładowanie transkrypcji", selectAllVisible: "Zaznacz wszystkie widoczne transkrypcje", selectTask: (title) => `Zaznacz ${title}`, actionsFor: (title) => `Akcje dla ${title}`, itemsSelected: (count) => `${count} elementów zaznaczonych`, retranscribe: "Transkrybuj ponownie", retryTranscription: "Ponów transkrypcję", youtubeFallbackRetry: "Ponów tryb zapasowy YouTube", downloadOriginalFile: "Pobierz oryginalny plik", deleteOriginalFile: "Usuń oryginalny plik", preparingAudio: "Przygotowywanie audio", smartChunks: "Inteligentne fragmenty", segmentLabel: (count) => `${count} segmentów`, notNeeded: "Niepotrzebne", provider: "Dostawca", fallbackReady: "Tryb zapasowy gotowy", regenerate: "Wygeneruj ponownie", translationTargetLanguage: "Język docelowy tłumaczenia", generateTranslation: "Wygeneruj tłumaczenie"},
  pt: {oneTime: "Pagamento único", monthly: "Mensal", annual: "Anual", save40: "Economize 40%", save50: "50% OFF", newBadge: "Novo", oneTimePayment: "Pagamento único", oneTimeNote: "Todos os planos únicos aceitam cartão e cripto via Stripe.", billedYearly: (amount) => `Cobrado anualmente (${amount}/ano)`, cancelAnytime: "Cancele quando quiser", instantAccess: "Acesso instantâneo", buyNow: "Comprar agora", subscribeNow: "Assinar agora", upgradeNow: "Atualizar agora", seeAllPlans: "Ver todos os planos", limitedTime: "Tempo limitado", justFivePerMonth: "Apenas $5.00 por mês", subscription: "Assinatura", mostPopular: "Mais popular", fileLimit: "Cada arquivo pode ter até 10 horas / 5GB. Envie 50 arquivos por vez.", noDailyLimit: "Sem limite diário de arquivos para transcrição", noRetention: "Sem período de retenção para arquivos de mídia", validity90: "Validade de 90 dias", totalMinutes: (minutes) => `${minutes} minutos totais de transcrição`, monthlyMinutes: (minutes) => `${minutes} minutos de transcrição por mês`, extraMinutes: (price, minutes) => `${price} por ${minutes} minutos extras`, emptyTitle: "Ainda não há transcrições aqui!", emptyAria: "Nenhuma transcrição encontrada", loadingAria: "Carregando transcrições", selectAllVisible: "Selecionar todas as transcrições visíveis", selectTask: (title) => `Selecionar ${title}`, actionsFor: (title) => `Ações para ${title}`, itemsSelected: (count) => `${count} itens selecionados`, retranscribe: "Retranscrever", retryTranscription: "Tentar transcrição novamente", youtubeFallbackRetry: "Tentar fallback do YouTube", downloadOriginalFile: "Baixar arquivo original", deleteOriginalFile: "Excluir arquivo original", preparingAudio: "Preparando áudio", smartChunks: "Partes inteligentes", segmentLabel: (count) => `${count} segmento${count === 1 ? "" : "s"}`, notNeeded: "Não necessário", provider: "Provedor", fallbackReady: "Fallback pronto", regenerate: "Gerar novamente", translationTargetLanguage: "Idioma de destino da tradução", generateTranslation: "Gerar tradução"},
  ru: {oneTime: "Разово", monthly: "Ежемесячно", annual: "Ежегодно", save40: "Скидка 40%", save50: "Скидка 50%", newBadge: "Новое", oneTimePayment: "Разовый платеж", oneTimeNote: "Все разовые планы поддерживают оплату картой и криптовалютой через Stripe.", billedYearly: (amount) => `Оплата за год (${amount}/год)`, cancelAnytime: "Отмена в любое время", instantAccess: "Мгновенный доступ", buyNow: "Купить сейчас", subscribeNow: "Оформить подписку", upgradeNow: "Обновить сейчас", seeAllPlans: "Все планы", limitedTime: "Ограниченное время", justFivePerMonth: "Всего $5.00 в месяц", subscription: "Подписка", mostPopular: "Самый популярный", fileLimit: "Каждый файл до 10 часов / 5GB. Загружайте 50 файлов за раз.", noDailyLimit: "Нет дневного лимита файлов для расшифровки", noRetention: "Нет срока хранения медиафайлов", validity90: "Действует 90 дней", totalMinutes: (minutes) => `${minutes} минут расшифровки всего`, monthlyMinutes: (minutes) => `${minutes} минут расшифровки в месяц`, extraMinutes: (price, minutes) => `${price} за ${minutes} дополнительных минут`, emptyTitle: "Здесь пока нет расшифровок!", emptyAria: "Расшифровка не найдена", loadingAria: "Загрузка расшифровок", selectAllVisible: "Выбрать все видимые расшифровки", selectTask: (title) => `Выбрать ${title}`, actionsFor: (title) => `Действия для ${title}`, itemsSelected: (count) => `Выбрано: ${count}`, retranscribe: "Расшифровать заново", retryTranscription: "Повторить расшифровку", youtubeFallbackRetry: "Повторить резервный YouTube", downloadOriginalFile: "Скачать исходный файл", deleteOriginalFile: "Удалить исходный файл", preparingAudio: "Подготовка аудио", smartChunks: "Умные фрагменты", segmentLabel: (count) => `${count} сегм.`, notNeeded: "Не требуется", provider: "Провайдер", fallbackReady: "Резерв готов", regenerate: "Создать заново", translationTargetLanguage: "Целевой язык перевода", generateTranslation: "Создать перевод"},
  th: {oneTime: "ครั้งเดียว", monthly: "รายเดือน", annual: "รายปี", save40: "ประหยัด 40%", save50: "ลด 50%", newBadge: "ใหม่", oneTimePayment: "ชำระครั้งเดียว", oneTimeNote: "แพ็กเกจแบบครั้งเดียวทั้งหมดรองรับบัตรและคริปโตผ่าน Stripe", billedYearly: (amount) => `เรียกเก็บรายปี (${amount}/ปี)`, cancelAnytime: "ยกเลิกได้ทุกเมื่อ", instantAccess: "เข้าใช้ทันที", buyNow: "ซื้อเลย", subscribeNow: "สมัครเลย", upgradeNow: "อัปเกรดเลย", seeAllPlans: "ดูทุกแพ็กเกจ", limitedTime: "เวลาจำกัด", justFivePerMonth: "เพียง $5.00 ต่อเดือน", subscription: "สมัครสมาชิก", mostPopular: "ยอดนิยม", fileLimit: "แต่ละไฟล์ยาวได้สูงสุด 10 ชั่วโมง / 5GB อัปโหลดได้ครั้งละ 50 ไฟล์", noDailyLimit: "ไม่จำกัดไฟล์ต่อวันสำหรับการถอดเสียง", noRetention: "ไม่มีระยะเวลาเก็บไฟล์สื่อ", validity90: "ใช้ได้ 90 วัน", totalMinutes: (minutes) => `ถอดเสียงรวม ${minutes} นาที`, monthlyMinutes: (minutes) => `ถอดเสียง ${minutes} นาทีต่อเดือน`, extraMinutes: (price, minutes) => `${price} ต่อ ${minutes} นาทีเพิ่มเติม`, emptyTitle: "ยังไม่มีทรานสคริปต์ที่นี่!", emptyAria: "ไม่พบทรานสคริปต์", loadingAria: "กำลังโหลดทรานสคริปต์", selectAllVisible: "เลือกทรานสคริปต์ที่มองเห็นทั้งหมด", selectTask: (title) => `เลือก ${title}`, actionsFor: (title) => `การทำงานสำหรับ ${title}`, itemsSelected: (count) => `เลือก ${count} รายการ`, retranscribe: "ถอดเสียงใหม่", retryTranscription: "ลองถอดเสียงอีกครั้ง", youtubeFallbackRetry: "ลอง YouTube สำรองอีกครั้ง", downloadOriginalFile: "ดาวน์โหลดไฟล์ต้นฉบับ", deleteOriginalFile: "ลบไฟล์ต้นฉบับ", preparingAudio: "กำลังเตรียมเสียง", smartChunks: "ชิ้นส่วนอัจฉริยะ", segmentLabel: (count) => `${count} ช่วง`, notNeeded: "ไม่จำเป็น", provider: "ผู้ให้บริการ", fallbackReady: "สำรองพร้อม", regenerate: "สร้างใหม่", translationTargetLanguage: "ภาษาเป้าหมายของคำแปล", generateTranslation: "สร้างคำแปล"},
  tr: {oneTime: "Tek seferlik", monthly: "Aylık", annual: "Yıllık", save40: "%40 tasarruf", save50: "%50 indirim", newBadge: "Yeni", oneTimePayment: "Tek seferlik ödeme", oneTimeNote: "Tüm tek seferlik planlar Stripe ile kart ve kripto ödemelerini destekler.", billedYearly: (amount) => `Yıllık faturalandırılır (${amount}/yıl)`, cancelAnytime: "İstediğin zaman iptal", instantAccess: "Anında erişim", buyNow: "Şimdi satın al", subscribeNow: "Abone ol", upgradeNow: "Şimdi yükselt", seeAllPlans: "Tüm planları gör", limitedTime: "Sınırlı süre", justFivePerMonth: "Ayda sadece $5.00", subscription: "Abonelik", mostPopular: "En popüler", fileLimit: "Her dosya en fazla 10 saat / 5GB olabilir. Tek seferde 50 dosya yükle.", noDailyLimit: "Transkripsiyon için günlük dosya limiti yok", noRetention: "Medya dosyaları için saklama süresi yok", validity90: "90 gün geçerli", totalMinutes: (minutes) => `Toplam ${minutes} dakika transkripsiyon`, monthlyMinutes: (minutes) => `Ayda ${minutes} dakika transkripsiyon`, extraMinutes: (price, minutes) => `${minutes} ek dakika için ${price}`, emptyTitle: "Burada henüz transkripsiyon yok!", emptyAria: "Transkripsiyon bulunamadı", loadingAria: "Transkripsiyonlar yükleniyor", selectAllVisible: "Görünen tüm transkripsiyonları seç", selectTask: (title) => `${title} seç`, actionsFor: (title) => `${title} işlemleri`, itemsSelected: (count) => `${count} öğe seçildi`, retranscribe: "Yeniden transkribe et", retryTranscription: "Transkripsiyonu tekrar dene", youtubeFallbackRetry: "YouTube yedeğini tekrar dene", downloadOriginalFile: "Orijinal dosyayı indir", deleteOriginalFile: "Orijinal dosyayı sil", preparingAudio: "Ses hazırlanıyor", smartChunks: "Akıllı parçalar", segmentLabel: (count) => `${count} segment`, notNeeded: "Gerekli değil", provider: "Sağlayıcı", fallbackReady: "Yedek hazır", regenerate: "Yeniden oluştur", translationTargetLanguage: "Çeviri hedef dili", generateTranslation: "Çeviri oluştur"},
  uk: {oneTime: "Разово", monthly: "Щомісяця", annual: "Щороку", save40: "Заощадьте 40%", save50: "Знижка 50%", newBadge: "Нове", oneTimePayment: "Разовий платіж", oneTimeNote: "Усі разові плани підтримують оплату карткою та криптовалютою через Stripe.", billedYearly: (amount) => `Оплата за рік (${amount}/рік)`, cancelAnytime: "Скасувати будь-коли", instantAccess: "Миттєвий доступ", buyNow: "Купити зараз", subscribeNow: "Підписатися", upgradeNow: "Оновити зараз", seeAllPlans: "Усі плани", limitedTime: "Обмежений час", justFivePerMonth: "Лише $5.00 на місяць", subscription: "Підписка", mostPopular: "Найпопулярніше", fileLimit: "Кожен файл до 10 годин / 5GB. Завантажуйте 50 файлів одночасно.", noDailyLimit: "Немає денного ліміту файлів для транскрипції", noRetention: "Немає строку зберігання медіафайлів", validity90: "Дійсно 90 днів", totalMinutes: (minutes) => `${minutes} хвилин транскрипції загалом`, monthlyMinutes: (minutes) => `${minutes} хвилин транскрипції на місяць`, extraMinutes: (price, minutes) => `${price} за ${minutes} додаткових хвилин`, emptyTitle: "Тут ще немає транскрипцій!", emptyAria: "Транскрипцію не знайдено", loadingAria: "Завантаження транскрипцій", selectAllVisible: "Вибрати всі видимі транскрипції", selectTask: (title) => `Вибрати ${title}`, actionsFor: (title) => `Дії для ${title}`, itemsSelected: (count) => `Вибрано: ${count}`, retranscribe: "Транскрибувати знову", retryTranscription: "Повторити транскрипцію", youtubeFallbackRetry: "Повторити резерв YouTube", downloadOriginalFile: "Завантажити оригінальний файл", deleteOriginalFile: "Видалити оригінальний файл", preparingAudio: "Підготовка аудіо", smartChunks: "Розумні фрагменти", segmentLabel: (count) => `${count} сегм.`, notNeeded: "Не потрібно", provider: "Провайдер", fallbackReady: "Резерв готовий", regenerate: "Створити знову", translationTargetLanguage: "Цільова мова перекладу", generateTranslation: "Створити переклад"},
  vi: {oneTime: "Một lần", monthly: "Hằng tháng", annual: "Hằng năm", save40: "Tiết kiệm 40%", save50: "Giảm 50%", newBadge: "Mới", oneTimePayment: "Thanh toán một lần", oneTimeNote: "Tất cả gói một lần hỗ trợ thanh toán thẻ và crypto qua Stripe.", billedYearly: (amount) => `Tính phí hằng năm (${amount}/năm)`, cancelAnytime: "Hủy bất cứ lúc nào", instantAccess: "Truy cập tức thì", buyNow: "Mua ngay", subscribeNow: "Đăng ký ngay", upgradeNow: "Nâng cấp ngay", seeAllPlans: "Xem tất cả gói", limitedTime: "Thời gian giới hạn", justFivePerMonth: "Chỉ $5.00 mỗi tháng", subscription: "Đăng ký", mostPopular: "Phổ biến nhất", fileLimit: "Mỗi tệp tối đa 10 giờ / 5GB. Tải lên 50 tệp cùng lúc.", noDailyLimit: "Không giới hạn tệp hằng ngày cho phiên âm", noRetention: "Không có thời hạn lưu giữ tệp media", validity90: "Hiệu lực 90 ngày", totalMinutes: (minutes) => `${minutes} phút phiên âm tổng cộng`, monthlyMinutes: (minutes) => `${minutes} phút phiên âm mỗi tháng`, extraMinutes: (price, minutes) => `${price} cho ${minutes} phút bổ sung`, emptyTitle: "Chưa có bản chép lời nào ở đây!", emptyAria: "Không tìm thấy bản chép lời", loadingAria: "Đang tải bản chép lời", selectAllVisible: "Chọn tất cả bản chép lời đang hiển thị", selectTask: (title) => `Chọn ${title}`, actionsFor: (title) => `Thao tác cho ${title}`, itemsSelected: (count) => `Đã chọn ${count} mục`, retranscribe: "Phiên âm lại", retryTranscription: "Thử phiên âm lại", youtubeFallbackRetry: "Thử dự phòng YouTube", downloadOriginalFile: "Tải tệp gốc", deleteOriginalFile: "Xóa tệp gốc", preparingAudio: "Đang chuẩn bị âm thanh", smartChunks: "Đoạn thông minh", segmentLabel: (count) => `${count} đoạn`, notNeeded: "Không cần", provider: "Nhà cung cấp", fallbackReady: "Dự phòng sẵn sàng", regenerate: "Tạo lại", translationTargetLanguage: "Ngôn ngữ đích bản dịch", generateTranslation: "Tạo bản dịch"},
  zh: {oneTime: "一次性", monthly: "月付", annual: "年付", save40: "省 40%", save50: "5 折优惠", newBadge: "新", oneTimePayment: "一次性付款", oneTimeNote: "所有一次性方案均支持通过 Stripe 使用银行卡和加密货币付款。", billedYearly: (amount) => `按年计费（${amount}/年）`, cancelAnytime: "随时取消", instantAccess: "即时开通", buyNow: "立即购买", subscribeNow: "立即订阅", upgradeNow: "立即升级", seeAllPlans: "查看全部套餐", limitedTime: "限时优惠", justFivePerMonth: "每月仅 $5.00", subscription: "订阅", mostPopular: "最受欢迎", fileLimit: "单个文件最长 10 小时 / 5GB。一次可上传 50 个文件。", noDailyLimit: "转写文件无每日数量限制", noRetention: "媒体文件无保留期限", validity90: "90 天有效期", totalMinutes: (minutes) => `共 ${minutes} 分钟转写额度`, monthlyMinutes: (minutes) => `每月 ${minutes} 分钟转写额度`, extraMinutes: (price, minutes) => `每 ${minutes} 分钟额外额度 ${price}`, emptyTitle: "这里还没有转写！", emptyAria: "未找到转写", loadingAria: "正在加载转写", selectAllVisible: "选择当前可见的全部转写", selectTask: (title) => `选择 ${title}`, actionsFor: (title) => `${title} 的操作`, itemsSelected: (count) => `已选择 ${count} 项`, retranscribe: "重新转写", retryTranscription: "重试转写", youtubeFallbackRetry: "重试 YouTube 备用方案", downloadOriginalFile: "下载原始文件", deleteOriginalFile: "删除原始文件", preparingAudio: "正在准备音频", smartChunks: "智能分段", segmentLabel: (count) => `${count} 个片段`, notNeeded: "无需处理", provider: "服务商", fallbackReady: "备用方案就绪", regenerate: "重新生成", translationTargetLanguage: "翻译目标语言", generateTranslation: "生成翻译"},
  "zh-TW": {oneTime: "一次性", monthly: "月付", annual: "年付", save40: "省 40%", save50: "5 折優惠", newBadge: "新", oneTimePayment: "一次性付款", oneTimeNote: "所有一次性方案均支援透過 Stripe 使用信用卡和加密貨幣付款。", billedYearly: (amount) => `按年計費（${amount}/年）`, cancelAnytime: "隨時取消", instantAccess: "即時開通", buyNow: "立即購買", subscribeNow: "立即訂閱", upgradeNow: "立即升級", seeAllPlans: "查看全部方案", limitedTime: "限時優惠", justFivePerMonth: "每月僅 $5.00", subscription: "訂閱", mostPopular: "最受歡迎", fileLimit: "單個檔案最長 10 小時 / 5GB。一次可上傳 50 個檔案。", noDailyLimit: "轉寫檔案無每日數量限制", noRetention: "媒體檔案無保留期限", validity90: "90 天有效期", totalMinutes: (minutes) => `共 ${minutes} 分鐘轉寫額度`, monthlyMinutes: (minutes) => `每月 ${minutes} 分鐘轉寫額度`, extraMinutes: (price, minutes) => `每 ${minutes} 分鐘額外額度 ${price}`, emptyTitle: "這裡還沒有轉寫！", emptyAria: "找不到轉寫", loadingAria: "正在載入轉寫", selectAllVisible: "選擇目前可見的全部轉寫", selectTask: (title) => `選擇 ${title}`, actionsFor: (title) => `${title} 的操作`, itemsSelected: (count) => `已選擇 ${count} 項`, retranscribe: "重新轉寫", retryTranscription: "重試轉寫", youtubeFallbackRetry: "重試 YouTube 備用方案", downloadOriginalFile: "下載原始檔案", deleteOriginalFile: "刪除原始檔案", preparingAudio: "正在準備音訊", smartChunks: "智慧分段", segmentLabel: (count) => `${count} 個片段`, notNeeded: "無需處理", provider: "服務商", fallbackReady: "備用方案就緒", regenerate: "重新生成", translationTargetLanguage: "翻譯目標語言", generateTranslation: "生成翻譯"}
};

const workspaceTaskActionCopy: Record<Locale, {
  cancelFailed: string;
  canceled: string;
  retryFailed: string;
  retryQueued: string;
  youtubeFallbackQueued: string;
}> = {
  ar: {cancelFailed: "تعذر إلغاء التفريغ.", canceled: "تم إلغاء التفريغ.", retryFailed: "تعذر إعادة محاولة التفريغ.", retryQueued: "تمت إضافة إعادة المحاولة إلى الصف.", youtubeFallbackQueued: "تمت إضافة مهمة YouTube الاحتياطية إلى الصف."},
  de: {cancelFailed: "Transkription konnte nicht abgebrochen werden.", canceled: "Transkription wurde abgebrochen.", retryFailed: "Transkription konnte nicht erneut versucht werden.", retryQueued: "Wiederholungsaufgabe wurde in die Warteschlange gestellt.", youtubeFallbackQueued: "YouTube-Fallback-Aufgabe wurde in die Warteschlange gestellt."},
  en: {cancelFailed: "Unable to cancel transcription.", canceled: "Transcription canceled.", retryFailed: "Unable to retry transcription.", retryQueued: "Retry task queued.", youtubeFallbackQueued: "YouTube fallback task queued."},
  es: {cancelFailed: "No se pudo cancelar la transcripción.", canceled: "Transcripción cancelada.", retryFailed: "No se pudo reintentar la transcripción.", retryQueued: "Tarea de reintento en cola.", youtubeFallbackQueued: "Tarea alternativa de YouTube en cola."},
  fr: {cancelFailed: "Impossible d'annuler la transcription.", canceled: "Transcription annulée.", retryFailed: "Impossible de réessayer la transcription.", retryQueued: "Tâche de nouvelle tentative ajoutée à la file.", youtubeFallbackQueued: "Tâche de secours YouTube ajoutée à la file."},
  hu: {cancelFailed: "Az átírás nem szakítható meg.", canceled: "Átírás megszakítva.", retryFailed: "Az átírás újrapróbálása sikertelen.", retryQueued: "Újrapróbálási feladat sorba állítva.", youtubeFallbackQueued: "YouTube tartalék feladat sorba állítva."},
  id: {cancelFailed: "Tidak dapat membatalkan transkripsi.", canceled: "Transkripsi dibatalkan.", retryFailed: "Tidak dapat mencoba ulang transkripsi.", retryQueued: "Tugas coba ulang masuk antrean.", youtubeFallbackQueued: "Tugas fallback YouTube masuk antrean."},
  it: {cancelFailed: "Impossibile annullare la trascrizione.", canceled: "Trascrizione annullata.", retryFailed: "Impossibile riprovare la trascrizione.", retryQueued: "Attività di retry in coda.", youtubeFallbackQueued: "Attività fallback YouTube in coda."},
  ja: {cancelFailed: "文字起こしをキャンセルできません。", canceled: "文字起こしをキャンセルしました。", retryFailed: "文字起こしを再試行できません。", retryQueued: "再試行タスクをキューに追加しました。", youtubeFallbackQueued: "YouTube 代替タスクをキューに追加しました。"},
  ko: {cancelFailed: "전사를 취소할 수 없습니다.", canceled: "전사가 취소되었습니다.", retryFailed: "전사를 다시 시도할 수 없습니다.", retryQueued: "재시도 작업이 대기열에 추가되었습니다.", youtubeFallbackQueued: "YouTube 대체 작업이 대기열에 추가되었습니다."},
  nl: {cancelFailed: "Kan transcriptie niet annuleren.", canceled: "Transcriptie geannuleerd.", retryFailed: "Kan transcriptie niet opnieuw proberen.", retryQueued: "Retrytaak in wachtrij geplaatst.", youtubeFallbackQueued: "YouTube-fallbacktaak in wachtrij geplaatst."},
  pl: {cancelFailed: "Nie można anulować transkrypcji.", canceled: "Transkrypcja anulowana.", retryFailed: "Nie można ponowić transkrypcji.", retryQueued: "Zadanie ponowienia dodane do kolejki.", youtubeFallbackQueued: "Zadanie zapasowe YouTube dodane do kolejki."},
  pt: {cancelFailed: "Não foi possível cancelar a transcrição.", canceled: "Transcrição cancelada.", retryFailed: "Não foi possível tentar a transcrição novamente.", retryQueued: "Tarefa de nova tentativa na fila.", youtubeFallbackQueued: "Tarefa fallback do YouTube na fila."},
  ru: {cancelFailed: "Не удалось отменить расшифровку.", canceled: "Расшифровка отменена.", retryFailed: "Не удалось повторить расшифровку.", retryQueued: "Повторная задача добавлена в очередь.", youtubeFallbackQueued: "Резервная задача YouTube добавлена в очередь."},
  th: {cancelFailed: "ไม่สามารถยกเลิกการถอดเสียงได้", canceled: "ยกเลิกการถอดเสียงแล้ว", retryFailed: "ไม่สามารถลองถอดเสียงอีกครั้งได้", retryQueued: "เพิ่มงานลองใหม่เข้าคิวแล้ว", youtubeFallbackQueued: "เพิ่มงาน YouTube สำรองเข้าคิวแล้ว"},
  tr: {cancelFailed: "Transkripsiyon iptal edilemedi.", canceled: "Transkripsiyon iptal edildi.", retryFailed: "Transkripsiyon tekrar denenemedi.", retryQueued: "Tekrar deneme görevi sıraya alındı.", youtubeFallbackQueued: "YouTube yedek görevi sıraya alındı."},
  uk: {cancelFailed: "Не вдалося скасувати транскрипцію.", canceled: "Транскрипцію скасовано.", retryFailed: "Не вдалося повторити транскрипцію.", retryQueued: "Завдання повтору додано до черги.", youtubeFallbackQueued: "Резервне завдання YouTube додано до черги."},
  vi: {cancelFailed: "Không thể hủy bản chép lời.", canceled: "Đã hủy bản chép lời.", retryFailed: "Không thể thử lại bản chép lời.", retryQueued: "Tác vụ thử lại đã vào hàng đợi.", youtubeFallbackQueued: "Tác vụ dự phòng YouTube đã vào hàng đợi."},
  zh: {cancelFailed: "无法取消转写。", canceled: "转写已取消。", retryFailed: "无法重试转写。", retryQueued: "重试任务已进入队列。", youtubeFallbackQueued: "YouTube 备用任务已进入队列。"},
  "zh-TW": {cancelFailed: "無法取消轉寫。", canceled: "轉寫已取消。", retryFailed: "無法重試轉寫。", retryQueued: "重試任務已進入佇列。", youtubeFallbackQueued: "YouTube 備用任務已進入佇列。"}
};

const workspaceTaskActionExtraCopy: Record<Locale, {
  readFoldersFailed: string;
  createFolderFailed: string;
  renameFolderFailed: string;
  deleteFolderFailed: string;
  moveTaskFailed: string;
  renameTaskFailed: string;
  taskRenamed: string;
  retranscribeFailed: string;
  retranscribeQueued: string;
  deleteTaskFailed: string;
  taskDeleted: string;
  downloadOriginalFailed: string;
  deleteOriginalFailed: string;
  originalDeleted: string;
  batchActionFailed: string;
  batchDeleted: string;
  batchOriginalsDeleted: string;
  batchMoved: string;
  batchExportFailed: string;
  batchExported: (count: number) => string;
  disableShareFailed: string;
  shareDisabled: string;
  translationFailed: string;
  speakersFailed: string;
  speakersUpdated: (count: number) => string;
}> = {
  ar: {readFoldersFailed: "تعذر قراءة المجلدات.", createFolderFailed: "تعذر إنشاء المجلد.", renameFolderFailed: "تعذر إعادة تسمية المجلد.", deleteFolderFailed: "تعذر حذف المجلد.", moveTaskFailed: "تعذر نقل التفريغ.", renameTaskFailed: "تعذر إعادة تسمية التفريغ.", taskRenamed: "تمت إعادة تسمية التفريغ.", retranscribeFailed: "تعذر إضافة إعادة التفريغ إلى الصف.", retranscribeQueued: "تمت إضافة إعادة التفريغ إلى الصف.", deleteTaskFailed: "تعذر حذف التفريغ.", taskDeleted: "تم حذف التفريغ.", downloadOriginalFailed: "تعذر تنزيل الوسائط الأصلية.", deleteOriginalFailed: "تعذر حذف الوسائط الأصلية.", originalDeleted: "تم حذف الوسائط الأصلية.", batchActionFailed: "تعذر تنفيذ الإجراء الدفعي.", batchDeleted: "تم حذف التفريغات المحددة.", batchOriginalsDeleted: "تم حذف الوسائط الأصلية المحددة.", batchMoved: "تم نقل التفريغات المحددة.", batchExportFailed: "تعذر تصدير التفريغات المحددة.", batchExported: (count) => `تم تصدير ${count} تفريغ محدد.`, disableShareFailed: "تعذر تعطيل رابط المشاركة.", shareDisabled: "تم تعطيل رابط المشاركة.", translationFailed: "تعذر إنشاء الترجمة.", speakersFailed: "تعذر تحديث المتحدثين.", speakersUpdated: (count) => `تم تحديث أسماء المتحدثين في ${count} مقاطع.`},
  de: {readFoldersFailed: "Ordner konnten nicht gelesen werden.", createFolderFailed: "Ordner konnte nicht erstellt werden.", renameFolderFailed: "Ordner konnte nicht umbenannt werden.", deleteFolderFailed: "Ordner konnte nicht gelöscht werden.", moveTaskFailed: "Transkription konnte nicht verschoben werden.", renameTaskFailed: "Transkription konnte nicht umbenannt werden.", taskRenamed: "Transkription wurde umbenannt.", retranscribeFailed: "Neu-Transkription konnte nicht eingereiht werden.", retranscribeQueued: "Neu-Transkription wurde eingereiht.", deleteTaskFailed: "Transkription konnte nicht gelöscht werden.", taskDeleted: "Transkription wurde gelöscht.", downloadOriginalFailed: "Originalmedium konnte nicht heruntergeladen werden.", deleteOriginalFailed: "Originalmedium konnte nicht gelöscht werden.", originalDeleted: "Originalmedium wurde gelöscht.", batchActionFailed: "Stapelaktion konnte nicht ausgeführt werden.", batchDeleted: "Ausgewählte Transkriptionen wurden gelöscht.", batchOriginalsDeleted: "Ausgewählte Originalmedien wurden gelöscht.", batchMoved: "Ausgewählte Transkriptionen wurden verschoben.", batchExportFailed: "Ausgewählte Transkriptionen konnten nicht exportiert werden.", batchExported: (count) => `${count} ausgewählte Transkriptionen wurden exportiert.`, disableShareFailed: "Freigabelink konnte nicht deaktiviert werden.", shareDisabled: "Freigabelink wurde deaktiviert.", translationFailed: "Übersetzung konnte nicht erstellt werden.", speakersFailed: "Sprecher konnten nicht aktualisiert werden.", speakersUpdated: (count) => `Sprechernamen wurden in ${count} Segmenten aktualisiert.`},
  en: {readFoldersFailed: "Unable to read folders.", createFolderFailed: "Unable to create folder.", renameFolderFailed: "Unable to rename folder.", deleteFolderFailed: "Unable to delete folder.", moveTaskFailed: "Unable to move transcription.", renameTaskFailed: "Unable to rename transcription.", taskRenamed: "Transcription renamed.", retranscribeFailed: "Unable to queue retranscription.", retranscribeQueued: "Retranscription queued.", deleteTaskFailed: "Unable to delete transcription.", taskDeleted: "Transcription deleted.", downloadOriginalFailed: "Unable to download original media.", deleteOriginalFailed: "Unable to delete original media.", originalDeleted: "Original media deleted.", batchActionFailed: "Unable to run batch action.", batchDeleted: "Selected transcriptions deleted.", batchOriginalsDeleted: "Selected original media deleted.", batchMoved: "Selected transcriptions moved.", batchExportFailed: "Unable to export selected transcriptions.", batchExported: (count) => `Exported ${count} selected transcription${count === 1 ? "" : "s"}.`, disableShareFailed: "Unable to disable share link.", shareDisabled: "Share link disabled.", translationFailed: "Unable to create translation.", speakersFailed: "Unable to update speakers.", speakersUpdated: (count) => `Updated speaker names in ${count} segment${count === 1 ? "" : "s"}.`},
  es: {readFoldersFailed: "No se pudieron leer las carpetas.", createFolderFailed: "No se pudo crear la carpeta.", renameFolderFailed: "No se pudo renombrar la carpeta.", deleteFolderFailed: "No se pudo eliminar la carpeta.", moveTaskFailed: "No se pudo mover la transcripción.", renameTaskFailed: "No se pudo renombrar la transcripción.", taskRenamed: "Transcripción renombrada.", retranscribeFailed: "No se pudo poner en cola la retranscripción.", retranscribeQueued: "Retranscripción en cola.", deleteTaskFailed: "No se pudo eliminar la transcripción.", taskDeleted: "Transcripción eliminada.", downloadOriginalFailed: "No se pudo descargar el medio original.", deleteOriginalFailed: "No se pudo eliminar el medio original.", originalDeleted: "Medio original eliminado.", batchActionFailed: "No se pudo ejecutar la acción por lotes.", batchDeleted: "Transcripciones seleccionadas eliminadas.", batchOriginalsDeleted: "Medios originales seleccionados eliminados.", batchMoved: "Transcripciones seleccionadas movidas.", batchExportFailed: "No se pudieron exportar las transcripciones seleccionadas.", batchExported: (count) => `Se exportaron ${count} transcripciones seleccionadas.`, disableShareFailed: "No se pudo desactivar el enlace compartido.", shareDisabled: "Enlace compartido desactivado.", translationFailed: "No se pudo crear la traducción.", speakersFailed: "No se pudieron actualizar los hablantes.", speakersUpdated: (count) => `Nombres de hablantes actualizados en ${count} segmentos.`},
  fr: {readFoldersFailed: "Impossible de lire les dossiers.", createFolderFailed: "Impossible de créer le dossier.", renameFolderFailed: "Impossible de renommer le dossier.", deleteFolderFailed: "Impossible de supprimer le dossier.", moveTaskFailed: "Impossible de déplacer la transcription.", renameTaskFailed: "Impossible de renommer la transcription.", taskRenamed: "Transcription renommée.", retranscribeFailed: "Impossible d'ajouter la retranscription à la file.", retranscribeQueued: "Retranscription ajoutée à la file.", deleteTaskFailed: "Impossible de supprimer la transcription.", taskDeleted: "Transcription supprimée.", downloadOriginalFailed: "Impossible de télécharger le média original.", deleteOriginalFailed: "Impossible de supprimer le média original.", originalDeleted: "Média original supprimé.", batchActionFailed: "Impossible d'exécuter l'action groupée.", batchDeleted: "Transcriptions sélectionnées supprimées.", batchOriginalsDeleted: "Médias originaux sélectionnés supprimés.", batchMoved: "Transcriptions sélectionnées déplacées.", batchExportFailed: "Impossible d'exporter les transcriptions sélectionnées.", batchExported: (count) => `${count} transcriptions sélectionnées exportées.`, disableShareFailed: "Impossible de désactiver le lien de partage.", shareDisabled: "Lien de partage désactivé.", translationFailed: "Impossible de créer la traduction.", speakersFailed: "Impossible de mettre à jour les intervenants.", speakersUpdated: (count) => `Noms des intervenants mis à jour dans ${count} segments.`},
  hu: {readFoldersFailed: "A mappák nem olvashatók.", createFolderFailed: "A mappa nem hozható létre.", renameFolderFailed: "A mappa nem nevezhető át.", deleteFolderFailed: "A mappa nem törölhető.", moveTaskFailed: "Az átírás nem helyezhető át.", renameTaskFailed: "Az átírás nem nevezhető át.", taskRenamed: "Átírás átnevezve.", retranscribeFailed: "Az újraátírás nem állítható sorba.", retranscribeQueued: "Újraátírás sorba állítva.", deleteTaskFailed: "Az átírás nem törölhető.", taskDeleted: "Átírás törölve.", downloadOriginalFailed: "Az eredeti média nem tölthető le.", deleteOriginalFailed: "Az eredeti média nem törölhető.", originalDeleted: "Eredeti média törölve.", batchActionFailed: "A csoportos művelet nem futtatható.", batchDeleted: "Kijelölt átírások törölve.", batchOriginalsDeleted: "Kijelölt eredeti médiák törölve.", batchMoved: "Kijelölt átírások áthelyezve.", batchExportFailed: "A kijelölt átírások nem exportálhatók.", batchExported: (count) => `${count} kijelölt átírás exportálva.`, disableShareFailed: "A megosztási link nem kapcsolható ki.", shareDisabled: "Megosztási link kikapcsolva.", translationFailed: "A fordítás nem hozható létre.", speakersFailed: "A beszélők nem frissíthetők.", speakersUpdated: (count) => `Beszélőnevek frissítve ${count} szegmensben.`},
  id: {readFoldersFailed: "Tidak dapat membaca folder.", createFolderFailed: "Tidak dapat membuat folder.", renameFolderFailed: "Tidak dapat mengganti nama folder.", deleteFolderFailed: "Tidak dapat menghapus folder.", moveTaskFailed: "Tidak dapat memindahkan transkripsi.", renameTaskFailed: "Tidak dapat mengganti nama transkripsi.", taskRenamed: "Transkripsi diganti nama.", retranscribeFailed: "Tidak dapat mengantrekan transkripsi ulang.", retranscribeQueued: "Transkripsi ulang masuk antrean.", deleteTaskFailed: "Tidak dapat menghapus transkripsi.", taskDeleted: "Transkripsi dihapus.", downloadOriginalFailed: "Tidak dapat mengunduh media asli.", deleteOriginalFailed: "Tidak dapat menghapus media asli.", originalDeleted: "Media asli dihapus.", batchActionFailed: "Tidak dapat menjalankan aksi batch.", batchDeleted: "Transkripsi terpilih dihapus.", batchOriginalsDeleted: "Media asli terpilih dihapus.", batchMoved: "Transkripsi terpilih dipindahkan.", batchExportFailed: "Tidak dapat mengekspor transkripsi terpilih.", batchExported: (count) => `${count} transkripsi terpilih diekspor.`, disableShareFailed: "Tidak dapat menonaktifkan tautan berbagi.", shareDisabled: "Tautan berbagi dinonaktifkan.", translationFailed: "Tidak dapat membuat terjemahan.", speakersFailed: "Tidak dapat memperbarui pembicara.", speakersUpdated: (count) => `Nama pembicara diperbarui di ${count} segmen.`},
  it: {readFoldersFailed: "Impossibile leggere le cartelle.", createFolderFailed: "Impossibile creare la cartella.", renameFolderFailed: "Impossibile rinominare la cartella.", deleteFolderFailed: "Impossibile eliminare la cartella.", moveTaskFailed: "Impossibile spostare la trascrizione.", renameTaskFailed: "Impossibile rinominare la trascrizione.", taskRenamed: "Trascrizione rinominata.", retranscribeFailed: "Impossibile mettere in coda la ritrascrizione.", retranscribeQueued: "Ritrascrizione in coda.", deleteTaskFailed: "Impossibile eliminare la trascrizione.", taskDeleted: "Trascrizione eliminata.", downloadOriginalFailed: "Impossibile scaricare il media originale.", deleteOriginalFailed: "Impossibile eliminare il media originale.", originalDeleted: "Media originale eliminato.", batchActionFailed: "Impossibile eseguire l'azione batch.", batchDeleted: "Trascrizioni selezionate eliminate.", batchOriginalsDeleted: "Media originali selezionati eliminati.", batchMoved: "Trascrizioni selezionate spostate.", batchExportFailed: "Impossibile esportare le trascrizioni selezionate.", batchExported: (count) => `${count} trascrizioni selezionate esportate.`, disableShareFailed: "Impossibile disattivare il link di condivisione.", shareDisabled: "Link di condivisione disattivato.", translationFailed: "Impossibile creare la traduzione.", speakersFailed: "Impossibile aggiornare i parlanti.", speakersUpdated: (count) => `Nomi parlanti aggiornati in ${count} segmenti.`},
  ja: {readFoldersFailed: "フォルダーを読み込めません。", createFolderFailed: "フォルダーを作成できません。", renameFolderFailed: "フォルダー名を変更できません。", deleteFolderFailed: "フォルダーを削除できません。", moveTaskFailed: "文字起こしを移動できません。", renameTaskFailed: "文字起こし名を変更できません。", taskRenamed: "文字起こし名を変更しました。", retranscribeFailed: "再文字起こしをキューに追加できません。", retranscribeQueued: "再文字起こしをキューに追加しました。", deleteTaskFailed: "文字起こしを削除できません。", taskDeleted: "文字起こしを削除しました。", downloadOriginalFailed: "元メディアをダウンロードできません。", deleteOriginalFailed: "元メディアを削除できません。", originalDeleted: "元メディアを削除しました。", batchActionFailed: "一括操作を実行できません。", batchDeleted: "選択した文字起こしを削除しました。", batchOriginalsDeleted: "選択した元メディアを削除しました。", batchMoved: "選択した文字起こしを移動しました。", batchExportFailed: "選択した文字起こしをエクスポートできません。", batchExported: (count) => `選択した文字起こし ${count} 件をエクスポートしました。`, disableShareFailed: "共有リンクを無効にできません。", shareDisabled: "共有リンクを無効にしました。", translationFailed: "翻訳を作成できません。", speakersFailed: "話者を更新できません。", speakersUpdated: (count) => `${count} セグメントで話者名を更新しました。`},
  ko: {readFoldersFailed: "폴더를 읽을 수 없습니다.", createFolderFailed: "폴더를 만들 수 없습니다.", renameFolderFailed: "폴더 이름을 변경할 수 없습니다.", deleteFolderFailed: "폴더를 삭제할 수 없습니다.", moveTaskFailed: "전사를 이동할 수 없습니다.", renameTaskFailed: "전사 이름을 변경할 수 없습니다.", taskRenamed: "전사 이름이 변경되었습니다.", retranscribeFailed: "재전사를 대기열에 추가할 수 없습니다.", retranscribeQueued: "재전사가 대기열에 추가되었습니다.", deleteTaskFailed: "전사를 삭제할 수 없습니다.", taskDeleted: "전사가 삭제되었습니다.", downloadOriginalFailed: "원본 미디어를 다운로드할 수 없습니다.", deleteOriginalFailed: "원본 미디어를 삭제할 수 없습니다.", originalDeleted: "원본 미디어가 삭제되었습니다.", batchActionFailed: "일괄 작업을 실행할 수 없습니다.", batchDeleted: "선택한 전사가 삭제되었습니다.", batchOriginalsDeleted: "선택한 원본 미디어가 삭제되었습니다.", batchMoved: "선택한 전사가 이동되었습니다.", batchExportFailed: "선택한 전사를 내보낼 수 없습니다.", batchExported: (count) => `선택한 전사 ${count}개를 내보냈습니다.`, disableShareFailed: "공유 링크를 비활성화할 수 없습니다.", shareDisabled: "공유 링크가 비활성화되었습니다.", translationFailed: "번역을 만들 수 없습니다.", speakersFailed: "화자를 업데이트할 수 없습니다.", speakersUpdated: (count) => `${count}개 세그먼트에서 화자 이름을 업데이트했습니다.`},
  nl: {readFoldersFailed: "Kan mappen niet lezen.", createFolderFailed: "Kan map niet maken.", renameFolderFailed: "Kan map niet hernoemen.", deleteFolderFailed: "Kan map niet verwijderen.", moveTaskFailed: "Kan transcriptie niet verplaatsen.", renameTaskFailed: "Kan transcriptie niet hernoemen.", taskRenamed: "Transcriptie hernoemd.", retranscribeFailed: "Kan hertranscriptie niet in de wachtrij plaatsen.", retranscribeQueued: "Hertranscriptie in wachtrij geplaatst.", deleteTaskFailed: "Kan transcriptie niet verwijderen.", taskDeleted: "Transcriptie verwijderd.", downloadOriginalFailed: "Kan originele media niet downloaden.", deleteOriginalFailed: "Kan originele media niet verwijderen.", originalDeleted: "Originele media verwijderd.", batchActionFailed: "Kan batchactie niet uitvoeren.", batchDeleted: "Geselecteerde transcripties verwijderd.", batchOriginalsDeleted: "Geselecteerde originele media verwijderd.", batchMoved: "Geselecteerde transcripties verplaatst.", batchExportFailed: "Kan geselecteerde transcripties niet exporteren.", batchExported: (count) => `${count} geselecteerde transcripties geëxporteerd.`, disableShareFailed: "Kan deellink niet uitschakelen.", shareDisabled: "Deellink uitgeschakeld.", translationFailed: "Kan vertaling niet maken.", speakersFailed: "Kan sprekers niet bijwerken.", speakersUpdated: (count) => `Sprekernamen bijgewerkt in ${count} segmenten.`},
  pl: {readFoldersFailed: "Nie można odczytać folderów.", createFolderFailed: "Nie można utworzyć folderu.", renameFolderFailed: "Nie można zmienić nazwy folderu.", deleteFolderFailed: "Nie można usunąć folderu.", moveTaskFailed: "Nie można przenieść transkrypcji.", renameTaskFailed: "Nie można zmienić nazwy transkrypcji.", taskRenamed: "Zmieniono nazwę transkrypcji.", retranscribeFailed: "Nie można dodać ponownej transkrypcji do kolejki.", retranscribeQueued: "Ponowna transkrypcja dodana do kolejki.", deleteTaskFailed: "Nie można usunąć transkrypcji.", taskDeleted: "Transkrypcja usunięta.", downloadOriginalFailed: "Nie można pobrać oryginalnych mediów.", deleteOriginalFailed: "Nie można usunąć oryginalnych mediów.", originalDeleted: "Oryginalne media usunięte.", batchActionFailed: "Nie można wykonać akcji zbiorczej.", batchDeleted: "Wybrane transkrypcje usunięte.", batchOriginalsDeleted: "Wybrane oryginalne media usunięte.", batchMoved: "Wybrane transkrypcje przeniesione.", batchExportFailed: "Nie można wyeksportować wybranych transkrypcji.", batchExported: (count) => `Wyeksportowano ${count} wybranych transkrypcji.`, disableShareFailed: "Nie można wyłączyć linku udostępniania.", shareDisabled: "Link udostępniania wyłączony.", translationFailed: "Nie można utworzyć tłumaczenia.", speakersFailed: "Nie można zaktualizować mówców.", speakersUpdated: (count) => `Zaktualizowano nazwy mówców w ${count} segmentach.`},
  pt: {readFoldersFailed: "Não foi possível ler as pastas.", createFolderFailed: "Não foi possível criar a pasta.", renameFolderFailed: "Não foi possível renomear a pasta.", deleteFolderFailed: "Não foi possível excluir a pasta.", moveTaskFailed: "Não foi possível mover a transcrição.", renameTaskFailed: "Não foi possível renomear a transcrição.", taskRenamed: "Transcrição renomeada.", retranscribeFailed: "Não foi possível colocar a retranscrição na fila.", retranscribeQueued: "Retranscrição na fila.", deleteTaskFailed: "Não foi possível excluir a transcrição.", taskDeleted: "Transcrição excluída.", downloadOriginalFailed: "Não foi possível baixar a mídia original.", deleteOriginalFailed: "Não foi possível excluir a mídia original.", originalDeleted: "Mídia original excluída.", batchActionFailed: "Não foi possível executar a ação em lote.", batchDeleted: "Transcrições selecionadas excluídas.", batchOriginalsDeleted: "Mídias originais selecionadas excluídas.", batchMoved: "Transcrições selecionadas movidas.", batchExportFailed: "Não foi possível exportar as transcrições selecionadas.", batchExported: (count) => `${count} transcrições selecionadas exportadas.`, disableShareFailed: "Não foi possível desativar o link de compartilhamento.", shareDisabled: "Link de compartilhamento desativado.", translationFailed: "Não foi possível criar a tradução.", speakersFailed: "Não foi possível atualizar os falantes.", speakersUpdated: (count) => `Nomes de falantes atualizados em ${count} segmentos.`},
  ru: {readFoldersFailed: "Не удалось прочитать папки.", createFolderFailed: "Не удалось создать папку.", renameFolderFailed: "Не удалось переименовать папку.", deleteFolderFailed: "Не удалось удалить папку.", moveTaskFailed: "Не удалось переместить расшифровку.", renameTaskFailed: "Не удалось переименовать расшифровку.", taskRenamed: "Расшифровка переименована.", retranscribeFailed: "Не удалось поставить повторную расшифровку в очередь.", retranscribeQueued: "Повторная расшифровка добавлена в очередь.", deleteTaskFailed: "Не удалось удалить расшифровку.", taskDeleted: "Расшифровка удалена.", downloadOriginalFailed: "Не удалось скачать исходное медиа.", deleteOriginalFailed: "Не удалось удалить исходное медиа.", originalDeleted: "Исходное медиа удалено.", batchActionFailed: "Не удалось выполнить массовое действие.", batchDeleted: "Выбранные расшифровки удалены.", batchOriginalsDeleted: "Выбранные исходные медиа удалены.", batchMoved: "Выбранные расшифровки перемещены.", batchExportFailed: "Не удалось экспортировать выбранные расшифровки.", batchExported: (count) => `Экспортировано выбранных расшифровок: ${count}.`, disableShareFailed: "Не удалось отключить ссылку общего доступа.", shareDisabled: "Ссылка общего доступа отключена.", translationFailed: "Не удалось создать перевод.", speakersFailed: "Не удалось обновить спикеров.", speakersUpdated: (count) => `Имена спикеров обновлены в ${count} сегментах.`},
  th: {readFoldersFailed: "ไม่สามารถอ่านโฟลเดอร์ได้", createFolderFailed: "ไม่สามารถสร้างโฟลเดอร์ได้", renameFolderFailed: "ไม่สามารถเปลี่ยนชื่อโฟลเดอร์ได้", deleteFolderFailed: "ไม่สามารถลบโฟลเดอร์ได้", moveTaskFailed: "ไม่สามารถย้ายทรานสคริปต์ได้", renameTaskFailed: "ไม่สามารถเปลี่ยนชื่อทรานสคริปต์ได้", taskRenamed: "เปลี่ยนชื่อทรานสคริปต์แล้ว", retranscribeFailed: "ไม่สามารถเพิ่มการถอดเสียงใหม่เข้าคิวได้", retranscribeQueued: "เพิ่มการถอดเสียงใหม่เข้าคิวแล้ว", deleteTaskFailed: "ไม่สามารถลบทรานสคริปต์ได้", taskDeleted: "ลบทรานสคริปต์แล้ว", downloadOriginalFailed: "ไม่สามารถดาวน์โหลดสื่อต้นฉบับได้", deleteOriginalFailed: "ไม่สามารถลบสื่อต้นฉบับได้", originalDeleted: "ลบสื่อต้นฉบับแล้ว", batchActionFailed: "ไม่สามารถดำเนินการแบบกลุ่มได้", batchDeleted: "ลบทรานสคริปต์ที่เลือกแล้ว", batchOriginalsDeleted: "ลบสื่อต้นฉบับที่เลือกแล้ว", batchMoved: "ย้ายทรานสคริปต์ที่เลือกแล้ว", batchExportFailed: "ไม่สามารถส่งออกทรานสคริปต์ที่เลือกได้", batchExported: (count) => `ส่งออกทรานสคริปต์ที่เลือก ${count} รายการแล้ว`, disableShareFailed: "ไม่สามารถปิดใช้งานลิงก์แชร์ได้", shareDisabled: "ปิดใช้งานลิงก์แชร์แล้ว", translationFailed: "ไม่สามารถสร้างคำแปลได้", speakersFailed: "ไม่สามารถอัปเดตผู้พูดได้", speakersUpdated: (count) => `อัปเดตชื่อผู้พูดใน ${count} ช่วงแล้ว`},
  tr: {readFoldersFailed: "Klasörler okunamadı.", createFolderFailed: "Klasör oluşturulamadı.", renameFolderFailed: "Klasör yeniden adlandırılamadı.", deleteFolderFailed: "Klasör silinemedi.", moveTaskFailed: "Transkripsiyon taşınamadı.", renameTaskFailed: "Transkripsiyon yeniden adlandırılamadı.", taskRenamed: "Transkripsiyon yeniden adlandırıldı.", retranscribeFailed: "Yeniden transkripsiyon sıraya alınamadı.", retranscribeQueued: "Yeniden transkripsiyon sıraya alındı.", deleteTaskFailed: "Transkripsiyon silinemedi.", taskDeleted: "Transkripsiyon silindi.", downloadOriginalFailed: "Orijinal medya indirilemedi.", deleteOriginalFailed: "Orijinal medya silinemedi.", originalDeleted: "Orijinal medya silindi.", batchActionFailed: "Toplu işlem çalıştırılamadı.", batchDeleted: "Seçili transkripsiyonlar silindi.", batchOriginalsDeleted: "Seçili orijinal medyalar silindi.", batchMoved: "Seçili transkripsiyonlar taşındı.", batchExportFailed: "Seçili transkripsiyonlar dışa aktarılamadı.", batchExported: (count) => `${count} seçili transkripsiyon dışa aktarıldı.`, disableShareFailed: "Paylaşım bağlantısı devre dışı bırakılamadı.", shareDisabled: "Paylaşım bağlantısı devre dışı bırakıldı.", translationFailed: "Çeviri oluşturulamadı.", speakersFailed: "Konuşmacılar güncellenemedi.", speakersUpdated: (count) => `${count} segmentte konuşmacı adları güncellendi.`},
  uk: {readFoldersFailed: "Не вдалося прочитати папки.", createFolderFailed: "Не вдалося створити папку.", renameFolderFailed: "Не вдалося перейменувати папку.", deleteFolderFailed: "Не вдалося видалити папку.", moveTaskFailed: "Не вдалося перемістити транскрипцію.", renameTaskFailed: "Не вдалося перейменувати транскрипцію.", taskRenamed: "Транскрипцію перейменовано.", retranscribeFailed: "Не вдалося додати повторну транскрипцію до черги.", retranscribeQueued: "Повторну транскрипцію додано до черги.", deleteTaskFailed: "Не вдалося видалити транскрипцію.", taskDeleted: "Транскрипцію видалено.", downloadOriginalFailed: "Не вдалося завантажити оригінальне медіа.", deleteOriginalFailed: "Не вдалося видалити оригінальне медіа.", originalDeleted: "Оригінальне медіа видалено.", batchActionFailed: "Не вдалося виконати пакетну дію.", batchDeleted: "Вибрані транскрипції видалено.", batchOriginalsDeleted: "Вибрані оригінальні медіа видалено.", batchMoved: "Вибрані транскрипції переміщено.", batchExportFailed: "Не вдалося експортувати вибрані транскрипції.", batchExported: (count) => `Експортовано вибраних транскрипцій: ${count}.`, disableShareFailed: "Не вдалося вимкнути посилання поширення.", shareDisabled: "Посилання поширення вимкнено.", translationFailed: "Не вдалося створити переклад.", speakersFailed: "Не вдалося оновити спікерів.", speakersUpdated: (count) => `Імена спікерів оновлено в ${count} сегментах.`},
  vi: {readFoldersFailed: "Không thể đọc thư mục.", createFolderFailed: "Không thể tạo thư mục.", renameFolderFailed: "Không thể đổi tên thư mục.", deleteFolderFailed: "Không thể xóa thư mục.", moveTaskFailed: "Không thể di chuyển bản chép lời.", renameTaskFailed: "Không thể đổi tên bản chép lời.", taskRenamed: "Đã đổi tên bản chép lời.", retranscribeFailed: "Không thể đưa phiên âm lại vào hàng đợi.", retranscribeQueued: "Phiên âm lại đã vào hàng đợi.", deleteTaskFailed: "Không thể xóa bản chép lời.", taskDeleted: "Đã xóa bản chép lời.", downloadOriginalFailed: "Không thể tải media gốc.", deleteOriginalFailed: "Không thể xóa media gốc.", originalDeleted: "Đã xóa media gốc.", batchActionFailed: "Không thể chạy thao tác hàng loạt.", batchDeleted: "Đã xóa các bản chép lời đã chọn.", batchOriginalsDeleted: "Đã xóa media gốc đã chọn.", batchMoved: "Đã di chuyển các bản chép lời đã chọn.", batchExportFailed: "Không thể xuất các bản chép lời đã chọn.", batchExported: (count) => `Đã xuất ${count} bản chép lời đã chọn.`, disableShareFailed: "Không thể tắt liên kết chia sẻ.", shareDisabled: "Đã tắt liên kết chia sẻ.", translationFailed: "Không thể tạo bản dịch.", speakersFailed: "Không thể cập nhật người nói.", speakersUpdated: (count) => `Đã cập nhật tên người nói trong ${count} đoạn.`},
  zh: {readFoldersFailed: "无法读取文件夹。", createFolderFailed: "无法创建文件夹。", renameFolderFailed: "无法重命名文件夹。", deleteFolderFailed: "无法删除文件夹。", moveTaskFailed: "无法移动转写。", renameTaskFailed: "无法重命名转写。", taskRenamed: "转写已重命名。", retranscribeFailed: "无法排队重新转写。", retranscribeQueued: "重新转写已进入队列。", deleteTaskFailed: "无法删除转写。", taskDeleted: "转写已删除。", downloadOriginalFailed: "无法下载原始媒体。", deleteOriginalFailed: "无法删除原始媒体。", originalDeleted: "原始媒体已删除。", batchActionFailed: "无法执行批量操作。", batchDeleted: "已删除选中的转写。", batchOriginalsDeleted: "已删除选中的原始媒体文件。", batchMoved: "已移动选中的转写。", batchExportFailed: "无法导出选中的转写。", batchExported: (count) => `已导出 ${count} 个选中的转写。`, disableShareFailed: "无法停用分享链接。", shareDisabled: "分享链接已停用。", translationFailed: "无法创建翻译。", speakersFailed: "无法更新发言人。", speakersUpdated: (count) => `已在 ${count} 个片段中更新发言人名称。`},
  "zh-TW": {readFoldersFailed: "無法讀取資料夾。", createFolderFailed: "無法建立資料夾。", renameFolderFailed: "無法重新命名資料夾。", deleteFolderFailed: "無法刪除資料夾。", moveTaskFailed: "無法移動轉寫。", renameTaskFailed: "無法重新命名轉寫。", taskRenamed: "轉寫已重新命名。", retranscribeFailed: "無法排入重新轉寫。", retranscribeQueued: "重新轉寫已進入佇列。", deleteTaskFailed: "無法刪除轉寫。", taskDeleted: "轉寫已刪除。", downloadOriginalFailed: "無法下載原始媒體。", deleteOriginalFailed: "無法刪除原始媒體。", originalDeleted: "原始媒體已刪除。", batchActionFailed: "無法執行批次操作。", batchDeleted: "已刪除選取的轉寫。", batchOriginalsDeleted: "已刪除選取的原始媒體檔案。", batchMoved: "已移動選取的轉寫。", batchExportFailed: "無法匯出選取的轉寫。", batchExported: (count) => `已匯出 ${count} 個選取的轉寫。`, disableShareFailed: "無法停用分享連結。", shareDisabled: "分享連結已停用。", translationFailed: "無法建立翻譯。", speakersFailed: "無法更新說話者。", speakersUpdated: (count) => `已在 ${count} 個片段中更新說話者名稱。`}
};

const workspaceRetranscribeDialogCopy: Record<Locale, {
  retranscribeSettingsTitle: string;
  retranscribeSettingsDescription: (name: string) => string;
  retranscribeSettingsWarning: string;
  queueRetranscription: string;
}> = {
  ar: {retranscribeSettingsTitle: "إعدادات إعادة التفريغ", retranscribeSettingsDescription: (name) => `أعد صف ${name} بلغة ومتحدثين وترجمات ونموذج وملخص جديد.`, retranscribeSettingsWarning: "سيتم إنشاء رؤى الذكاء الاصطناعي وذاكرة التصدير المؤقتة من جديد.", queueRetranscription: "إضافة إعادة التفريغ إلى الصف"},
  de: {retranscribeSettingsTitle: "Einstellungen für Neu-Transkription", retranscribeSettingsDescription: (name) => `Stelle ${name} mit neuer Sprache, Sprechern, Untertiteln, Modell und Zusammenfassung erneut in die Warteschlange.`, retranscribeSettingsWarning: "Vorhandene KI-Insights und Export-Caches werden neu erstellt.", queueRetranscription: "Neu-Transkription einreihen"},
  en: {retranscribeSettingsTitle: "Retranscription settings", retranscribeSettingsDescription: (name) => `Queue ${name} again with new language, speaker, subtitle, model, and summary settings.`, retranscribeSettingsWarning: "Existing AI insights and export caches will be regenerated.", queueRetranscription: "Queue retranscription"},
  es: {retranscribeSettingsTitle: "Ajustes de retranscripción", retranscribeSettingsDescription: (name) => `Vuelve a poner ${name} en cola con nuevos ajustes de idioma, hablantes, subtítulos, modelo y resumen.`, retranscribeSettingsWarning: "Los insights de IA y las cachés de exportación existentes se regenerarán.", queueRetranscription: "Poner retranscripción en cola"},
  fr: {retranscribeSettingsTitle: "Paramètres de retranscription", retranscribeSettingsDescription: (name) => `Remettez ${name} en file avec de nouveaux réglages de langue, d'intervenants, de sous-titres, de modèle et de résumé.`, retranscribeSettingsWarning: "Les insights IA et caches d'export existants seront régénérés.", queueRetranscription: "Ajouter la retranscription à la file"},
  hu: {retranscribeSettingsTitle: "Újraátírás beállításai", retranscribeSettingsDescription: (name) => `Állítsd újra sorba ezt: ${name}, új nyelv-, beszélő-, felirat-, modell- és összefoglaló-beállításokkal.`, retranscribeSettingsWarning: "A meglévő AI-elemzések és export gyorsítótárak újragenerálódnak.", queueRetranscription: "Újraátírás sorba állítása"},
  id: {retranscribeSettingsTitle: "Pengaturan transkripsi ulang", retranscribeSettingsDescription: (name) => `Antrekan ${name} lagi dengan pengaturan bahasa, pembicara, subtitle, model, dan ringkasan baru.`, retranscribeSettingsWarning: "Insight AI dan cache ekspor yang ada akan dibuat ulang.", queueRetranscription: "Antrekan transkripsi ulang"},
  it: {retranscribeSettingsTitle: "Impostazioni di ritrascrizione", retranscribeSettingsDescription: (name) => `Rimetti in coda ${name} con nuove impostazioni di lingua, parlanti, sottotitoli, modello e riepilogo.`, retranscribeSettingsWarning: "Gli insight IA e le cache di esportazione esistenti verranno rigenerati.", queueRetranscription: "Metti in coda la ritrascrizione"},
  ja: {retranscribeSettingsTitle: "再文字起こし設定", retranscribeSettingsDescription: (name) => `${name} を新しい言語、話者、字幕、モデル、要約設定で再度キューに追加します。`, retranscribeSettingsWarning: "既存の AI インサイトとエクスポートキャッシュは再生成されます。", queueRetranscription: "再文字起こしをキューに追加"},
  ko: {retranscribeSettingsTitle: "재전사 설정", retranscribeSettingsDescription: (name) => `${name}을(를) 새 언어, 화자, 자막, 모델, 요약 설정으로 다시 대기열에 추가합니다.`, retranscribeSettingsWarning: "기존 AI 인사이트와 내보내기 캐시는 다시 생성됩니다.", queueRetranscription: "재전사 대기열 추가"},
  nl: {retranscribeSettingsTitle: "Instellingen voor hertranscriptie", retranscribeSettingsDescription: (name) => `Zet ${name} opnieuw in de wachtrij met nieuwe taal-, spreker-, ondertitel-, model- en samenvattingsinstellingen.`, retranscribeSettingsWarning: "Bestaande AI-inzichten en exportcaches worden opnieuw gegenereerd.", queueRetranscription: "Hertranscriptie in wachtrij plaatsen"},
  pl: {retranscribeSettingsTitle: "Ustawienia ponownej transkrypcji", retranscribeSettingsDescription: (name) => `Dodaj ${name} ponownie do kolejki z nowymi ustawieniami języka, mówców, napisów, modelu i podsumowania.`, retranscribeSettingsWarning: "Istniejące wnioski AI i pamięci podręczne eksportu zostaną wygenerowane ponownie.", queueRetranscription: "Dodaj ponowną transkrypcję do kolejki"},
  pt: {retranscribeSettingsTitle: "Configurações de retranscrição", retranscribeSettingsDescription: (name) => `Coloque ${name} novamente na fila com novas configurações de idioma, falantes, legendas, modelo e resumo.`, retranscribeSettingsWarning: "Insights de IA e caches de exportação existentes serão gerados novamente.", queueRetranscription: "Colocar retranscrição na fila"},
  ru: {retranscribeSettingsTitle: "Настройки повторной расшифровки", retranscribeSettingsDescription: (name) => `Поставьте ${name} в очередь заново с новыми настройками языка, спикеров, субтитров, модели и сводки.`, retranscribeSettingsWarning: "Существующие AI-инсайты и кэши экспорта будут созданы заново.", queueRetranscription: "Поставить повторную расшифровку в очередь"},
  th: {retranscribeSettingsTitle: "การตั้งค่าถอดเสียงใหม่", retranscribeSettingsDescription: (name) => `เพิ่ม ${name} เข้าคิวอีกครั้งด้วยการตั้งค่าภาษา ผู้พูด คำบรรยาย โมเดล และสรุปใหม่`, retranscribeSettingsWarning: "ข้อมูลเชิงลึก AI และแคชการส่งออกที่มีอยู่จะถูกสร้างใหม่", queueRetranscription: "เพิ่มการถอดเสียงใหม่เข้าคิว"},
  tr: {retranscribeSettingsTitle: "Yeniden transkripsiyon ayarları", retranscribeSettingsDescription: (name) => `${name} öğesini yeni dil, konuşmacı, altyazı, model ve özet ayarlarıyla yeniden sıraya al.`, retranscribeSettingsWarning: "Mevcut AI içgörüleri ve dışa aktarma önbellekleri yeniden oluşturulur.", queueRetranscription: "Yeniden transkripsiyonu sıraya al"},
  uk: {retranscribeSettingsTitle: "Налаштування повторної транскрипції", retranscribeSettingsDescription: (name) => `Додайте ${name} до черги з новими налаштуваннями мови, спікерів, субтитрів, моделі й підсумку.`, retranscribeSettingsWarning: "Наявні AI-інсайти та кеші експорту буде створено заново.", queueRetranscription: "Додати повторну транскрипцію до черги"},
  vi: {retranscribeSettingsTitle: "Cài đặt phiên âm lại", retranscribeSettingsDescription: (name) => `Đưa ${name} vào hàng đợi lại với cài đặt ngôn ngữ, người nói, phụ đề, mô hình và tóm tắt mới.`, retranscribeSettingsWarning: "Insight AI và bộ nhớ đệm hiện có sẽ được tạo lại.", queueRetranscription: "Đưa phiên âm lại vào hàng đợi"},
  zh: {retranscribeSettingsTitle: "重新转写设置", retranscribeSettingsDescription: (name) => `使用新的语言、说话人、字幕、模型和摘要设置重新排队 ${name}。`, retranscribeSettingsWarning: "已有 AI 洞察和导出缓存会重新生成。", queueRetranscription: "排队重新转写"},
  "zh-TW": {retranscribeSettingsTitle: "重新轉寫設定", retranscribeSettingsDescription: (name) => `使用新的語言、說話者、字幕、模型和摘要設定重新排入 ${name}。`, retranscribeSettingsWarning: "既有 AI 洞察和匯出快取會重新產生。", queueRetranscription: "排入重新轉寫"}
};

const workspaceTranslationEditorCopy: Record<Locale, {
  saveTranslation: string;
  saveTranslationFailed: string;
}> = {
  ar: {saveTranslation: "حفظ الترجمة", saveTranslationFailed: "تعذر حفظ الترجمة."},
  de: {saveTranslation: "Übersetzung speichern", saveTranslationFailed: "Übersetzung konnte nicht gespeichert werden."},
  en: {saveTranslation: "Save translation", saveTranslationFailed: "Unable to save translation."},
  es: {saveTranslation: "Guardar traducción", saveTranslationFailed: "No se pudo guardar la traducción."},
  fr: {saveTranslation: "Enregistrer la traduction", saveTranslationFailed: "Impossible d'enregistrer la traduction."},
  hu: {saveTranslation: "Fordítás mentése", saveTranslationFailed: "A fordítás nem menthető."},
  id: {saveTranslation: "Simpan terjemahan", saveTranslationFailed: "Tidak dapat menyimpan terjemahan."},
  it: {saveTranslation: "Salva traduzione", saveTranslationFailed: "Impossibile salvare la traduzione."},
  ja: {saveTranslation: "翻訳を保存", saveTranslationFailed: "翻訳を保存できません。"},
  ko: {saveTranslation: "번역 저장", saveTranslationFailed: "번역을 저장할 수 없습니다."},
  nl: {saveTranslation: "Vertaling opslaan", saveTranslationFailed: "Kan vertaling niet opslaan."},
  pl: {saveTranslation: "Zapisz tłumaczenie", saveTranslationFailed: "Nie można zapisać tłumaczenia."},
  pt: {saveTranslation: "Salvar tradução", saveTranslationFailed: "Não foi possível salvar a tradução."},
  ru: {saveTranslation: "Сохранить перевод", saveTranslationFailed: "Не удалось сохранить перевод."},
  th: {saveTranslation: "บันทึกคำแปล", saveTranslationFailed: "ไม่สามารถบันทึกคำแปลได้"},
  tr: {saveTranslation: "Çeviriyi kaydet", saveTranslationFailed: "Çeviri kaydedilemedi."},
  uk: {saveTranslation: "Зберегти переклад", saveTranslationFailed: "Не вдалося зберегти переклад."},
  vi: {saveTranslation: "Lưu bản dịch", saveTranslationFailed: "Không thể lưu bản dịch."},
  zh: {saveTranslation: "保存翻译", saveTranslationFailed: "无法保存翻译。"},
  "zh-TW": {saveTranslation: "儲存翻譯", saveTranslationFailed: "無法儲存翻譯。"}
};

function getWorkspaceDashboardCopy(locale: Locale) {
  const terms = workspaceDashboardTerms[locale];
  const taskActions = workspaceTaskActionCopy[locale];
  const taskActionExtras = workspaceTaskActionExtraCopy[locale];
  const retranscribeDialog = workspaceRetranscribeDialogCopy[locale];
  const translationEditor = workspaceTranslationEditorCopy[locale];
  const app = appMessagesByLocale[locale];
  const operations = workspaceOperationalCopy[locale];
  const sidebar = getWorkspaceSidebarCopy(locale);

  const planText: Record<string, string> = {
    "note.oneTime": terms.oneTimeNote,
    Lite: "Lite",
    Plus: "Plus",
    Basic: app.basicPlan,
    Standard: app.standardPlan,
    Pro: app.proPlan,
    "tagline.lite": `${terms.oneTime} · ${app.uploadFiles}`,
    "tagline.plus": `${terms.oneTime} · ${app.quotaMinutes}`,
    "tagline.basic": `${app.basicPlan} · ${app.taskList}`,
    "tagline.standard": `${app.standardPlan} · ${app.taskList}`,
    "tagline.pro": `${app.proPlan} · ${app.taskList}`,
    "extra.10.500": terms.extraMinutes("$10", "500"),
    "extra.15.1000": terms.extraMinutes("$15", "1000"),
    "extra.20.3000": terms.extraMinutes("$20", "3000"),
    "suffix.oneTime": terms.oneTimePayment,
    "suffix.month": app.perMonth,
    "quota.total.300": terms.totalMinutes("300"),
    "quota.total.600": terms.totalMinutes("600"),
    "quota.month.1200": terms.monthlyMinutes("1200"),
    "quota.month.3000": terms.monthlyMinutes("3000"),
    "quota.month.6000": terms.monthlyMinutes("6000"),
    "cta.buy": terms.buyNow,
    "cta.subscribe": terms.subscribeNow,
    "note.annual.72": terms.billedYearly("$72"),
    "note.annual.144": terms.billedYearly("$144"),
    "note.annual.216": terms.billedYearly("$216"),
    "feature.fileLimit": terms.fileLimit,
    "feature.noDailyLimit": terms.noDailyLimit,
    "feature.premiumModel": operations.premiumTranscriptionModel,
    "feature.languages": app.languages,
    "feature.aiTranslation": `${app.translation} AI`,
    "feature.exportFormats": `${app.exports}: Word, CSV, PDF, TXT, SRT, VTT`,
    "feature.enhancedInsights": app.generateInsights,
    "feature.youtubeTranscription": `${app.youtube} ${app.transcript}`,
    "feature.speakerIdentification": operations.speakerIdentification,
    "feature.apiAccess": "API",
    "feature.bulkTranscription": `${app.bulkActions} · ${app.transcript}`,
    "feature.noRetention": terms.noRetention,
    "feature.prioritySupport": sidebar.emailSupport,
    "feature.validity90": terms.validity90
  };

  return {
    dashboardPricing: {
      close: workspacePanelCopy[locale].close,
      plansTitle: app.pricing,
      subtitle: app.subheadline,
      billingOptions: app.pricing,
      faqTitle: app.faqTitle,
      mostPopular: terms.mostPopular,
      moreInformation: operations.moreInformation,
      badges: {New: terms.newBadge},
      modes: {
        "one-time": {label: terms.oneTime},
        monthly: {label: terms.monthly},
        annual: {label: terms.annual, badge: terms.save40}
      },
      text: planText,
      faqs: [
        [app.faqTitle, app.localUploadHint],
        [app.languages, app.languages],
        [app.exports, app.workflowExportText],
        [app.pricing, app.plansTitle],
        [operations.speakerIdentification, operations.speakerPaidFeatureTrial],
        [app.translation, operations.aiSummary]
      ],
      upgradePrompt: {
        title: app.upgradePlan,
        description: app.subheadline,
        subscriptionLabel: terms.subscription.toUpperCase(),
        planTitle: `${app.upgradePlan} ${app.basicPlan}`,
        features: [terms.monthlyMinutes("1200"), operations.premiumTranscriptionModel, terms.fileLimit, terms.noDailyLimit],
        annualLabel: terms.annual,
        annualNote: terms.billedYearly("$72"),
        annualBadge: terms.save40,
        monthlyLabel: terms.monthly,
        monthlyNote: terms.cancelAnytime,
        monthSuffix: app.perMonth,
        upgradeNow: terms.upgradeNow,
        seeAllPlans: terms.seeAllPlans,
        trust: [terms.cancelAnytime, terms.instantAccess]
      },
      upgradeCard: {
        title: `${terms.annual} ${app.basicPlan}`,
        monthlyBadge: terms.justFivePerMonth,
        discountBadge: terms.save50,
        billedYearly: terms.billedYearly("$60"),
        features: [terms.monthlyMinutes("1200"), operations.premiumTranscriptionModel, operations.speakerIdentification, sidebar.emailSupport],
        upgradeNow: terms.upgradeNow,
        seeAllPlans: terms.seeAllPlans,
        limitedTime: terms.limitedTime
      }
    },
    dashboardTable: {
      emptyTitle: terms.emptyTitle,
      emptyAria: terms.emptyAria,
      loadingAria: terms.loadingAria,
      selectAllVisible: terms.selectAllVisible,
      selectTask: terms.selectTask,
      actionsFor: terms.actionsFor,
      itemsSelected: terms.itemsSelected
    },
    taskWorkspace: {
      ...taskActions,
      ...taskActionExtras,
      ...retranscribeDialog,
      ...translationEditor,
      retranscribe: terms.retranscribe,
      retryTranscription: terms.retryTranscription,
      youtubeFallbackRetry: terms.youtubeFallbackRetry,
      downloadOriginalFile: terms.downloadOriginalFile,
      deleteOriginalFile: terms.deleteOriginalFile,
      preparingAudio: terms.preparingAudio,
      smartChunks: terms.smartChunks,
      segmentLabel: terms.segmentLabel,
      notNeeded: terms.notNeeded,
      provider: terms.provider,
      fallbackReady: terms.fallbackReady,
      regenerate: terms.regenerate,
      translationTargetLanguage: terms.translationTargetLanguage,
      generateTranslation: terms.generateTranslation
    },
    appSumoWelcome: {
      badge: "Votxt x AppSumo",
      activeTitle: `AppSumo · ${app.ready}`,
      activeText: (plan: string, account: string) => `${plan} · ${account}`,
      steps: [
        {title: app.uploadFiles, text: app.localUploadHint},
        {title: app.generateInsights, text: app.workflowExportText},
        {title: app.workspace, text: app.workflowUploadText}
      ],
      planLabel: app.pricing,
      minutesLabel: app.quotaMinutes,
      stepAria: (index: number) => `${app.workspace} ${index}`,
      skipTour: workspacePanelCopy[locale].close,
      startTranscribing: app.start,
      nextStep: app.start
    }
  };
}

export const plans = [
  {key: "freePlan", price: "$0", minutes: "120", detail: "每日 3 个文件，单文件 30 分钟，适合轻量试用。"},
  {key: "basicPlan", price: "$6", minutes: "1200", detail: "支持 YouTube、发言人识别、批量任务和自动化导出。"},
  {key: "standardPlan", price: "$12", minutes: "3000", detail: "更高并发、更长文件和优先队列。"},
  {key: "proPlan", price: "$18", minutes: "6000", detail: "面向个人高频转写、课程整理和内容生产。"}
];

const faqs = [
  ["可以免费试用吗？", "可以。免费版包含月度分钟数、每日文件次数、转写编辑和标准导出能力。"],
  ["支持哪些文件？", "支持常见音频和视频格式，包括 mp3、wav、m4a、flac、mp4、mov、mkv、webm 和 wmv。"],
  ["如何生成发言人标签？", "开启后会优先使用 Deepgram 或 AssemblyAI 的说话人分离能力，失败时再 fallback 到 Groq 转写。"],
  ["可以导出字幕吗？", "可以。任务完成后可导出 SRT 和 VTT，也可以导出 TXT、JSON 和 PDF。"]
];

export const workspaceCopy = {
  zh: {
    intlLocale: "zh-CN",
    marketingIntro: "首屏即可上传、粘贴链接或录音，不需要先读完营销页。",
    freeSignup: "免费注册",
    viewDashboard: "查看仪表盘",
    converterTools: "转换工具",
    converters: ["语音转文字", "人声转文字", "音频转文字", "视频转文字", "链接转文字", "MP3 转文字", "MP4 转文字", "WAV 转文字"],
    freePlan: "免费计划",
    dailyFiles: "每日文件",
    monthlyMinutes: "每月分钟",
    queueTasks: "队列任务",
    account: "账号",
    anonymousUser: "未登录用户",
    loginSyncHint: "登录后同步任务和额度",
    retention: "保留期",
    days: "天",
    monthTasks: "本月任务",
    remainingMinutes: "剩余分钟",
    transcriptTab: "转写",
    translationTab: "翻译",
    noTranscriptAssets: "暂无转写资产。创建任务后会显示在这里。",
    noTranslationAssets: "暂无翻译资产。任务完成后点击生成 AI 洞察即可创建翻译。",
    targetLanguage: "目标语言",
    youtubeTask: "视频链接任务",
    unnamedTask: "未命名转写任务",
    waiting: "等待处理",
    speakers: (count: number) => `${count} 位发言人`,
    share: "分享",
    assetManagement: "资产管理",
    assetManagementText: "文件夹、搜索和批量操作用于管理会议、课程、采访和公开视频转写资产。",
    aiPost: "AI 后处理",
    aiPostText: "完成转写后继续生成摘要、思维导图、问答和翻译，减少手动整理成本。",
    exportText: "面向字幕、归档和自动化工作流，支持 TXT、SRT、VTT、JSON 和 PDF。",
    usageLedger: "用量流水",
    plan: "套餐",
    usedThisMonth: "本月已用",
    noLedger: "还没有用量流水。创建转写任务后会记录预留、结算和释放。",
    usageLoginEmpty: "登录并初始化订阅后会显示个人用量、账期和最近流水。",
    periodUnset: "未设置",
    whyTitle: "为什么选择 Votxt",
    useCases: [
      ["学生和课程", "把讲座、网课、公开视频转成可检索笔记。"],
      ["个人会议", "保存会议录音、访谈、培训和语音备忘中的关键内容。"],
      ["创作者", "从视频生成字幕、脚本、博客草稿和社媒素材。"],
      ["研究和媒体", "快速处理采访、口述史、播客和新闻发布会。"]
    ],
    planDetails: {
      freePlan: "每日 3 个文件，单文件 30 分钟，适合轻量试用。",
      basicPlan: "支持 YouTube、发言人识别、批量任务和自动化导出。",
      standardPlan: "更高并发、更长文件和优先队列。",
      proPlan: "面向个人高频转写、课程整理和内容生产。"
    },
    minutesUnit: "分钟",
    viewFullPricing: "查看完整套餐",
    homeFaqs: faqs,
    needRecording: "请先完成一段录音。",
    needFile: "请先选择文件。",
    uploadUrlError: "无法创建上传地址。",
    uploadFailed: "文件上传失败，请检查对象存储配置。",
    createTaskError: "无法创建转写任务。",
    readTasksError: "无法读取转写任务列表。",
    readUsageError: "无法读取用量数据。",
    readTaskError: "无法读取转写任务。",
    shareTitle: "Votxt 转写分享",
    shareError: "无法创建分享链接。",
    shareDone: "分享链接已创建并复制到剪贴板。",
    insightError: "无法生成 AI 洞察。",
    transcriptSaved: "转写文本已保存。",
    recordingReady: "录音已生成，可直接开始转写。",
    micError: "无法访问麦克风，请检查浏览器权限。",
    translationGenerated: "翻译内容已生成。"
  },
  en: {
    intlLocale: "en-US",
    marketingIntro: "Upload a file, paste a video link, or record audio and turn it into transcripts, summaries, and exports.",
    freeSignup: "Sign up free",
    viewDashboard: "View dashboard",
    converterTools: "Converters",
    converters: ["Speech to Text", "Voice to Text", "Audio to Text", "Video to Text", "Link to Text", "MP3 to Text", "MP4 to Text", "FLAC to Text", "AMR to Text", "WMA to Text", "MKV to Text", "WMV to Text"],
    freePlan: "Free plan",
    dailyFiles: "Daily files",
    monthlyMinutes: "Monthly minutes",
    queueTasks: "Queue tasks",
    account: "Account",
    anonymousUser: "Guest user",
    loginSyncHint: "Sign in to sync jobs and quota",
    retention: "Retention",
    days: "days",
    monthTasks: "Month tasks",
    remainingMinutes: "Remaining",
    transcriptTab: "Transcription",
    translationTab: "Translation",
    noTranscriptAssets: "No transcription assets yet. Create a job and it will appear here.",
    noTranslationAssets: "No translation assets yet. Generate AI insights after a completed job to create one.",
    targetLanguage: "Target",
    youtubeTask: "Video link task",
    unnamedTask: "Untitled transcription",
    waiting: "Waiting",
    speakers: (count: number) => `${count} speaker${count === 1 ? "" : "s"}`,
    share: "Share",
    assetManagement: "Asset management",
    assetManagementText: "Folders, search, and asset views help manage meetings, classes, interviews, and public-video transcripts.",
    aiPost: "AI post-processing",
    aiPostText: "After transcription, generate summaries, mind maps, Q&A, and translations to reduce manual cleanup.",
    exportText: "For captions, archives, and automation workflows, export TXT, SRT, VTT, JSON, and PDF.",
    usageLedger: "Usage ledger",
    plan: "Plan",
    usedThisMonth: "Used this month",
    noLedger: "No usage ledger yet. Creating transcription jobs will record reserve, settle, and release events.",
    usageLoginEmpty: "Sign in and initialize a subscription to see personal usage, billing period, and recent ledger entries.",
    periodUnset: "Not set",
    whyTitle: "Why Votxt",
    useCases: [
      ["Students and courses", "Turn lectures, online classes, and public videos into searchable notes."],
      ["Personal meetings", "Preserve the key details from meetings, interviews, training, and voice memos."],
      ["Creators", "Create captions, scripts, blog drafts, and social content from video."],
      ["Research and media", "Process interviews, oral histories, podcasts, and press events faster."]
    ],
    planDetails: {
      freePlan: "3 files per day, 30 minutes per file, ideal for lightweight trials.",
      basicPlan: "YouTube links, speaker labels, batch tasks, and automation-ready exports.",
      standardPlan: "Higher concurrency, longer files, and priority queueing.",
      proPlan: "Built for high-volume personal transcription, courses, and content production."
    },
    minutesUnit: "min",
    viewFullPricing: "View full pricing",
    homeFaqs: [
      ["Can I try it for free?", "Yes. The Free plan includes monthly minutes, daily file limits, transcript editing, and standard exports."],
      ["Which files are supported?", "Common audio and video formats are supported, including mp3, wav, m4a, flac, mp4, mov, mkv, webm, and wmv."],
      ["How are speaker labels generated?", "When enabled, Votxt prioritizes Deepgram or AssemblyAI diarization and falls back to Groq transcription if needed."],
      ["Can I export subtitles?", "Yes. Completed jobs can export SRT and VTT, plus TXT, JSON, and PDF."]
    ],
    needRecording: "Please finish a recording first.",
    needFile: "Please choose a file first.",
    uploadUrlError: "Unable to create upload URL.",
    uploadFailed: "File upload failed. Check object storage settings.",
    createTaskError: "Unable to create transcription task.",
    readTasksError: "Unable to read transcription tasks.",
    readUsageError: "Unable to read usage data.",
    readTaskError: "Unable to read transcription task.",
    shareTitle: "Votxt transcript share",
    shareError: "Unable to create share link.",
    shareDone: "Share link created and copied to clipboard.",
    insightError: "Unable to generate AI insights.",
    transcriptSaved: "Transcript saved.",
    recordingReady: "Recording is ready. You can start transcription.",
    micError: "Unable to access microphone. Check browser permissions.",
    translationGenerated: "Translation has been generated."
  },
  es: {
    intlLocale: "es-ES",
    marketingIntro: "Sube, pega un enlace o graba de inmediato sin pasar primero por una página comercial.",
    freeSignup: "Regístrate gratis",
    viewDashboard: "Ver panel",
    converterTools: "Convertidores",
    converters: ["Voz a texto", "Audio a texto", "Video a texto", "Enlace a texto", "MP3 a texto", "MP4 a texto", "WAV a texto", "Subtítulos"],
    freePlan: "Plan gratis",
    dailyFiles: "Archivos diarios",
    monthlyMinutes: "Minutos mensuales",
    queueTasks: "Tareas en cola",
    account: "Cuenta",
    anonymousUser: "Usuario invitado",
    loginSyncHint: "Inicia sesión para sincronizar tareas y cuota",
    retention: "Retención",
    days: "días",
    monthTasks: "Tareas del mes",
    remainingMinutes: "Restante",
    transcriptTab: "Transcripción",
    translationTab: "Traducción",
    noTranscriptAssets: "Aún no hay transcripciones. Crea una tarea y aparecerá aquí.",
    noTranslationAssets: "Aún no hay traducciones. Genera insights de IA después de una tarea completada.",
    targetLanguage: "Destino",
    youtubeTask: "Tarea de enlace de video",
    unnamedTask: "Transcripción sin título",
    waiting: "En espera",
    speakers: (count: number) => `${count} hablante${count === 1 ? "" : "s"}`,
    share: "Compartir",
    assetManagement: "Gestión de activos",
    assetManagementText: "Carpetas, búsqueda y vistas de activos ayudan a gestionar reuniones, clases, entrevistas y transcripciones de videos públicos.",
    aiPost: "Postproceso con IA",
    aiPostText: "Después de transcribir, genera resúmenes, mapas mentales, preguntas y respuestas, y traducciones para reducir el trabajo manual.",
    exportText: "Para subtítulos, archivo y automatización, exporta TXT, SRT, VTT, JSON y PDF.",
    usageLedger: "Registro de uso",
    plan: "Plan",
    usedThisMonth: "Usado este mes",
    noLedger: "Aún no hay registro de uso. Las tareas de transcripción registrarán reservas, liquidaciones y liberaciones.",
    usageLoginEmpty: "Inicia sesión e inicializa una suscripción para ver tu uso, periodo de facturación y movimientos recientes.",
    periodUnset: "Sin definir",
    whyTitle: "Por qué Votxt",
    useCases: [
      ["Estudiantes y cursos", "Convierte clases, cursos online y videos públicos en notas buscables."],
      ["Reuniones personales", "Conserva los puntos clave de Zoom, entrevistas, formaciones y reuniones con clientes."],
      ["Creadores", "Genera subtítulos, guiones, borradores de blog y contenido social desde video."],
      ["Investigación y medios", "Procesa entrevistas, historias orales, podcasts y ruedas de prensa más rápido."]
    ],
    planDetails: {
      freePlan: "3 archivos al día, 30 minutos por archivo, ideal para pruebas ligeras.",
      basicPlan: "Enlaces de YouTube, etiquetas de hablante, tareas por lote y exportaciones automatizadas.",
      standardPlan: "Más concurrencia, archivos más largos y cola prioritaria.",
      proPlan: "Para transcripción de alto volumen, reuniones frecuentes y flujos de producción de contenido."
    },
    minutesUnit: "min",
    viewFullPricing: "Ver precios completos",
    homeFaqs: [
      ["¿Puedo probarlo gratis?", "Sí. El plan gratuito incluye minutos mensuales, límites diarios, edición de transcripción y exportaciones estándar."],
      ["¿Qué archivos admite?", "Admite formatos comunes de audio y video, como mp3, wav, m4a, flac, mp4, mov, mkv, webm y wmv."],
      ["¿Cómo se generan las etiquetas de hablante?", "Al activarlas, Votxt prioriza la diarización de Deepgram o AssemblyAI y recurre a Groq si hace falta."],
      ["¿Puedo exportar subtítulos?", "Sí. Las tareas completadas exportan SRT y VTT, además de TXT, JSON y PDF."]
    ],
    needRecording: "Primero termina una grabación.",
    needFile: "Primero elige un archivo.",
    uploadUrlError: "No se pudo crear la URL de carga.",
    uploadFailed: "Falló la carga del archivo. Revisa la configuración del almacenamiento.",
    createTaskError: "No se pudo crear la tarea de transcripción.",
    readTasksError: "No se pudieron leer las tareas de transcripción.",
    readUsageError: "No se pudieron leer los datos de uso.",
    readTaskError: "No se pudo leer la tarea de transcripción.",
    shareTitle: "Compartir transcripción de Votxt",
    shareError: "No se pudo crear el enlace compartido.",
    shareDone: "Enlace compartido creado y copiado al portapapeles.",
    insightError: "No se pudieron generar insights de IA.",
    transcriptSaved: "Transcripción guardada.",
    recordingReady: "La grabación está lista. Puedes iniciar la transcripción.",
    micError: "No se pudo acceder al micrófono. Revisa los permisos del navegador.",
    translationGenerated: "La traducción se ha generado."
  },
  fr: {
    intlLocale: "fr-FR",
    marketingIntro: "Importez, collez un lien ou enregistrez immédiatement, sans lire d'abord une page marketing.",
    freeSignup: "Inscription gratuite",
    viewDashboard: "Voir le tableau",
    converterTools: "Convertisseurs",
    converters: ["Parole en texte", "Voix en texte", "Audio en texte", "Vidéo en texte", "Lien en texte", "MP3 en texte", "MP4 en texte", "WAV en texte"],
    freePlan: "Forfait gratuit",
    dailyFiles: "Fichiers par jour",
    monthlyMinutes: "Minutes mensuelles",
    queueTasks: "Tâches en file",
    account: "Compte",
    anonymousUser: "Utilisateur invité",
    loginSyncHint: "Connectez-vous pour synchroniser tâches et quota",
    retention: "Conservation",
    days: "jours",
    monthTasks: "Tâches du mois",
    remainingMinutes: "Restant",
    transcriptTab: "Transcription",
    translationTab: "Traduction",
    noTranscriptAssets: "Aucune transcription pour le moment. Créez une tâche et elle apparaîtra ici.",
    noTranslationAssets: "Aucune traduction pour le moment. Générez des analyses IA après une tâche terminée.",
    targetLanguage: "Cible",
    youtubeTask: "Tâche de lien vidéo",
    unnamedTask: "Transcription sans titre",
    waiting: "En attente",
    speakers: (count: number) => `${count} intervenant${count === 1 ? "" : "s"}`,
    share: "Partager",
    assetManagement: "Gestion des actifs",
    assetManagementText: "Dossiers, recherche et vues d'actifs aident à gérer réunions, cours, interviews et transcriptions de vidéos publiques.",
    aiPost: "Post-traitement IA",
    aiPostText: "Après transcription, générez résumés, cartes mentales, questions-réponses et traductions pour réduire le nettoyage manuel.",
    exportText: "Pour les sous-titres, archives et automatisations, exportez en TXT, SRT, VTT, JSON et PDF.",
    usageLedger: "Journal d'utilisation",
    plan: "Forfait",
    usedThisMonth: "Utilisé ce mois-ci",
    noLedger: "Aucun journal d'utilisation pour le moment. Les tâches de transcription enregistreront réservations, validations et libérations.",
    usageLoginEmpty: "Connectez-vous et initialisez un abonnement pour voir votre utilisation, la période de facturation et les mouvements récents.",
    periodUnset: "Non défini",
    whyTitle: "Pourquoi Votxt",
    useCases: [
      ["Étudiants et cours", "Transformez conférences, cours en ligne et vidéos publiques en notes consultables."],
      ["Réunions personnelles", "Conservez les détails clés de Zoom, interviews, formations et réunions client."],
      ["Créateurs", "Créez sous-titres, scripts, brouillons de blog et contenus sociaux depuis une vidéo."],
      ["Recherche et médias", "Traitez plus vite interviews, récits oraux, podcasts et conférences de presse."]
    ],
    planDetails: {
      freePlan: "3 fichiers par jour, 30 minutes par fichier, idéal pour un essai léger.",
      basicPlan: "Liens YouTube, étiquettes d'intervenants, tâches par lot et exports automatisables.",
      standardPlan: "Plus de concurrence, fichiers plus longs et file prioritaire.",
      proPlan: "Conçu pour la transcription à haut volume, les réunions fréquentes et les chaînes de production de contenu."
    },
    minutesUnit: "min",
    viewFullPricing: "Voir tous les tarifs",
    homeFaqs: [
      ["Puis-je essayer gratuitement ?", "Oui. Le forfait gratuit inclut des minutes mensuelles, des limites quotidiennes, l'édition de transcription et les exports standard."],
      ["Quels fichiers sont pris en charge ?", "Les formats audio et vidéo courants sont pris en charge, dont mp3, wav, m4a, flac, mp4, mov, mkv, webm et wmv."],
      ["Comment les intervenants sont-ils identifiés ?", "Une fois activé, Votxt privilégie Deepgram ou AssemblyAI pour la diarisation, puis bascule vers Groq si nécessaire."],
      ["Puis-je exporter des sous-titres ?", "Oui. Les tâches terminées exportent SRT et VTT, ainsi que TXT, JSON et PDF."]
    ],
    needRecording: "Terminez d'abord un enregistrement.",
    needFile: "Choisissez d'abord un fichier.",
    uploadUrlError: "Impossible de créer l'URL d'import.",
    uploadFailed: "Échec de l'import du fichier. Vérifiez le stockage objet.",
    createTaskError: "Impossible de créer la tâche de transcription.",
    readTasksError: "Impossible de lire les tâches de transcription.",
    readUsageError: "Impossible de lire les données d'utilisation.",
    readTaskError: "Impossible de lire la tâche de transcription.",
    shareTitle: "Partage de transcription Votxt",
    shareError: "Impossible de créer le lien de partage.",
    shareDone: "Lien de partage créé et copié dans le presse-papiers.",
    insightError: "Impossible de générer les analyses IA.",
    transcriptSaved: "Transcription enregistrée.",
    recordingReady: "L'enregistrement est prêt. Vous pouvez lancer la transcription.",
    micError: "Impossible d'accéder au microphone. Vérifiez les autorisations du navigateur.",
    translationGenerated: "La traduction a été générée."
  },
  de: {
    intlLocale: "de-DE",
    marketingIntro: "Sofort hochladen, Link einfügen oder aufnehmen, ohne zuerst eine Marketingseite zu lesen.",
    freeSignup: "Kostenlos registrieren",
    viewDashboard: "Dashboard ansehen",
    converterTools: "Konverter",
    converters: ["Sprache zu Text", "Stimme zu Text", "Audio zu Text", "Video zu Text", "Link zu Text", "MP3 zu Text", "MP4 zu Text", "WAV zu Text"],
    freePlan: "Kostenloser Plan",
    dailyFiles: "Dateien pro Tag",
    monthlyMinutes: "Monatsminuten",
    queueTasks: "Warteschlange",
    account: "Konto",
    anonymousUser: "Gastnutzer",
    loginSyncHint: "Anmelden, um Aufgaben und Kontingent zu synchronisieren",
    retention: "Aufbewahrung",
    days: "Tage",
    monthTasks: "Monatsaufgaben",
    remainingMinutes: "Verbleibend",
    transcriptTab: "Transkription",
    translationTab: "Übersetzung",
    noTranscriptAssets: "Noch keine Transkriptionsdateien. Erstelle eine Aufgabe, dann erscheint sie hier.",
    noTranslationAssets: "Noch keine Übersetzungen. Erzeuge nach einer abgeschlossenen Aufgabe KI-Insights.",
    targetLanguage: "Ziel",
    youtubeTask: "Video-Link-Aufgabe",
    unnamedTask: "Unbenannte Transkription",
    waiting: "Wartet",
    speakers: (count: number) => `${count} Sprecher`,
    share: "Teilen",
    assetManagement: "Asset-Verwaltung",
    assetManagementText: "Ordner, Suche und Asset-Ansichten helfen bei Meetings, Kursen, Interviews und Transkripten öffentlicher Videos.",
    aiPost: "KI-Nachbearbeitung",
    aiPostText: "Erzeuge nach der Transkription Zusammenfassungen, Mindmaps, Q&A und Übersetzungen, um manuelle Arbeit zu reduzieren.",
    exportText: "Für Untertitel, Archive und Automatisierung exportierst du TXT, SRT, VTT, JSON und PDF.",
    usageLedger: "Nutzungsprotokoll",
    plan: "Plan",
    usedThisMonth: "Diesen Monat genutzt",
    noLedger: "Noch kein Nutzungsprotokoll. Transkriptionsaufgaben erfassen Reservierung, Abrechnung und Freigabe.",
    usageLoginEmpty: "Melde dich an und initialisiere ein Abo, um persönliche Nutzung, Abrechnungszeitraum und aktuelle Einträge zu sehen.",
    periodUnset: "Nicht gesetzt",
    whyTitle: "Warum Votxt",
    useCases: [
      ["Studierende und Kurse", "Verwandle Vorlesungen, Onlinekurse und öffentliche Videos in durchsuchbare Notizen."],
      ["Persönliche Meetings", "Bewahre wichtige Details aus Zoom-Calls, Interviews, Trainings und Kundengesprächen."],
      ["Creator", "Erstelle Untertitel, Skripte, Blogentwürfe und Social Content aus Videos."],
      ["Recherche und Medien", "Verarbeite Interviews, Oral-History-Material, Podcasts und Presseevents schneller."]
    ],
    planDetails: {
      freePlan: "3 Dateien pro Tag, 30 Minuten pro Datei, ideal für leichte Tests.",
      basicPlan: "YouTube-Links, Sprecherlabels, Batch-Aufgaben und automatisierbare Exporte.",
      standardPlan: "Mehr Parallelität, längere Dateien und priorisierte Warteschlange.",
      proPlan: "Für häufige Meetings und Content-Produktionsabläufe."
    },
    minutesUnit: "Min.",
    viewFullPricing: "Alle Preise ansehen",
    homeFaqs: [
      ["Kann ich kostenlos testen?", "Ja. Der kostenlose Plan enthält Monatsminuten, Tageslimits, Transkriptbearbeitung und Standardexporte."],
      ["Welche Dateien werden unterstützt?", "Unterstützt werden gängige Audio- und Videoformate wie mp3, wav, m4a, flac, mp4, mov, mkv, webm und wmv."],
      ["Wie werden Sprecherlabels erzeugt?", "Wenn aktiviert, priorisiert Votxt Deepgram oder AssemblyAI für Diarisierung und fällt bei Bedarf auf Groq zurück."],
      ["Kann ich Untertitel exportieren?", "Ja. Abgeschlossene Aufgaben können SRT und VTT sowie TXT, JSON und PDF exportieren."]
    ],
    needRecording: "Bitte beende zuerst eine Aufnahme.",
    needFile: "Bitte wähle zuerst eine Datei.",
    uploadUrlError: "Upload-URL konnte nicht erstellt werden.",
    uploadFailed: "Dateiupload fehlgeschlagen. Prüfe die Objektspeicher-Einstellungen.",
    createTaskError: "Transkriptionsaufgabe konnte nicht erstellt werden.",
    readTasksError: "Transkriptionsaufgaben konnten nicht gelesen werden.",
    readUsageError: "Nutzungsdaten konnten nicht gelesen werden.",
    readTaskError: "Transkriptionsaufgabe konnte nicht gelesen werden.",
    shareTitle: "Votxt-Transkript teilen",
    shareError: "Teillink konnte nicht erstellt werden.",
    shareDone: "Teillink erstellt und in die Zwischenablage kopiert.",
    insightError: "KI-Insights konnten nicht erzeugt werden.",
    transcriptSaved: "Transkript gespeichert.",
    recordingReady: "Aufnahme ist bereit. Du kannst die Transkription starten.",
    micError: "Mikrofonzugriff nicht möglich. Prüfe die Browserberechtigungen.",
    translationGenerated: "Übersetzung wurde erzeugt."
  },
  ja: {
    intlLocale: "ja-JP",
    marketingIntro: "マーケティングページを読まなくても、すぐにアップロード、リンク貼り付け、録音を開始できます。",
    freeSignup: "無料登録",
    viewDashboard: "ダッシュボード",
    converterTools: "変換ツール",
    converters: ["音声をテキスト化", "声をテキスト化", "音声ファイルをテキスト化", "動画をテキスト化", "リンクをテキスト化", "MP3 をテキスト化", "MP4 をテキスト化", "WAV をテキスト化"],
    freePlan: "無料プラン",
    dailyFiles: "1日のファイル数",
    monthlyMinutes: "月間分数",
    queueTasks: "キュータスク",
    account: "アカウント",
    anonymousUser: "ゲストユーザー",
    loginSyncHint: "ログインしてタスクと利用枠を同期",
    retention: "保存期間",
    days: "日",
    monthTasks: "今月のタスク",
    remainingMinutes: "残り",
    transcriptTab: "文字起こし",
    translationTab: "翻訳",
    noTranscriptAssets: "文字起こし資産はまだありません。タスクを作成するとここに表示されます。",
    noTranslationAssets: "翻訳資産はまだありません。完了したタスクで AI インサイトを生成してください。",
    targetLanguage: "対象",
    youtubeTask: "動画リンクタスク",
    unnamedTask: "無題の文字起こし",
    waiting: "待機中",
    speakers: (count: number) => `${count} 名の話者`,
    share: "共有",
    assetManagement: "資産管理",
    assetManagementText: "フォルダ、検索、資産ビューで会議、授業、インタビュー、公開動画の文字起こしを管理できます。",
    aiPost: "AI 後処理",
    aiPostText: "文字起こし後に要約、マインドマップ、Q&A、翻訳を生成し、手作業の整理を減らします。",
    exportText: "字幕、保管、自動化ワークフロー向けに TXT、SRT、VTT、JSON、PDF を出力できます。",
    usageLedger: "利用履歴",
    plan: "プラン",
    usedThisMonth: "今月の使用量",
    noLedger: "利用履歴はまだありません。文字起こしタスク作成後に予約、確定、解放が記録されます。",
    usageLoginEmpty: "ログインしてサブスクリプションを初期化すると、個人利用状況、請求期間、最近の履歴が表示されます。",
    periodUnset: "未設定",
    whyTitle: "Votxt が選ばれる理由",
    useCases: [
      ["学生と授業", "講義、オンライン授業、公開動画を検索可能なノートに変換します。"],
      ["個人の会議", "Zoom、インタビュー、研修、顧客会議の重要ポイントを保存します。"],
      ["クリエイター", "動画から字幕、台本、ブログ下書き、SNS 素材を作成します。"],
      ["調査とメディア", "インタビュー、オーラルヒストリー、ポッドキャスト、記者会見を素早く処理します。"]
    ],
    planDetails: {
      freePlan: "1日3ファイル、1ファイル30分まで。軽い試用に最適です。",
      basicPlan: "YouTube リンク、話者ラベル、バッチタスク、自動化向けエクスポートに対応。",
      standardPlan: "同時処理数、長時間ファイル、優先キューを強化。",
      proPlan: "高頻度の会議、コンテンツ制作パイプライン向け。"
    },
    minutesUnit: "分",
    viewFullPricing: "料金をすべて見る",
    homeFaqs: [
      ["無料で試せますか？", "はい。無料プランには月間分数、1日のファイル制限、文字起こし編集、標準エクスポートが含まれます。"],
      ["どのファイルに対応していますか？", "mp3、wav、m4a、flac、mp4、mov、mkv、webm、wmv など一般的な音声・動画形式に対応しています。"],
      ["話者ラベルはどう生成されますか？", "有効化すると Deepgram または AssemblyAI の話者分離を優先し、必要に応じて Groq にフォールバックします。"],
      ["字幕を出力できますか？", "はい。完了したタスクは SRT、VTT に加えて TXT、JSON、PDF を出力できます。"]
    ],
    needRecording: "先に録音を完了してください。",
    needFile: "先にファイルを選択してください。",
    uploadUrlError: "アップロード URL を作成できません。",
    uploadFailed: "ファイルのアップロードに失敗しました。オブジェクトストレージ設定を確認してください。",
    createTaskError: "文字起こしタスクを作成できません。",
    readTasksError: "文字起こしタスク一覧を取得できません。",
    readUsageError: "利用データを取得できません。",
    readTaskError: "文字起こしタスクを取得できません。",
    shareTitle: "Votxt 文字起こし共有",
    shareError: "共有リンクを作成できません。",
    shareDone: "共有リンクを作成し、クリップボードへコピーしました。",
    insightError: "AI インサイトを生成できません。",
    transcriptSaved: "文字起こしを保存しました。",
    recordingReady: "録音の準備ができました。文字起こしを開始できます。",
    micError: "マイクにアクセスできません。ブラウザ権限を確認してください。",
    translationGenerated: "翻訳を生成しました。"
  },
  ko: {
    intlLocale: "ko-KR",
    marketingIntro: "마케팅 페이지를 읽지 않아도 바로 업로드, 링크 붙여넣기, 녹음을 시작할 수 있습니다.",
    freeSignup: "무료 가입",
    viewDashboard: "대시보드 보기",
    converterTools: "변환 도구",
    converters: ["음성을 텍스트로", "목소리를 텍스트로", "오디오를 텍스트로", "비디오를 텍스트로", "링크를 텍스트로", "MP3를 텍스트로", "MP4를 텍스트로", "WAV를 텍스트로"],
    freePlan: "무료 플랜",
    dailyFiles: "일일 파일",
    monthlyMinutes: "월간 분수",
    queueTasks: "대기 작업",
    account: "계정",
    anonymousUser: "게스트 사용자",
    loginSyncHint: "로그인하면 작업과 할당량이 동기화됩니다",
    retention: "보관 기간",
    days: "일",
    monthTasks: "이번 달 작업",
    remainingMinutes: "남은 시간",
    transcriptTab: "전사",
    translationTab: "번역",
    noTranscriptAssets: "아직 전사 자산이 없습니다. 작업을 만들면 여기에 표시됩니다.",
    noTranslationAssets: "아직 번역 자산이 없습니다. 완료된 작업에서 AI 인사이트를 생성하세요.",
    targetLanguage: "대상",
    youtubeTask: "동영상 링크 작업",
    unnamedTask: "제목 없는 전사",
    waiting: "대기 중",
    speakers: (count: number) => `${count}명 화자`,
    share: "공유",
    assetManagement: "자산 관리",
    assetManagementText: "폴더, 검색, 자산 보기로 회의, 수업, 인터뷰, 공개 동영상 전사를 관리합니다.",
    aiPost: "AI 후처리",
    aiPostText: "전사 후 요약, 마인드맵, Q&A, 번역을 생성해 수작업 정리를 줄입니다.",
    exportText: "자막, 보관, 자동화 워크플로를 위해 TXT, SRT, VTT, JSON, PDF로 내보냅니다.",
    usageLedger: "사용량 내역",
    plan: "플랜",
    usedThisMonth: "이번 달 사용량",
    noLedger: "아직 사용량 내역이 없습니다. 전사 작업 생성 후 예약, 정산, 해제가 기록됩니다.",
    usageLoginEmpty: "로그인하고 구독을 초기화하면 개인 사용량, 청구 기간, 최근 내역을 볼 수 있습니다.",
    periodUnset: "미설정",
    whyTitle: "Votxt를 선택하는 이유",
    useCases: [
      ["학생과 강의", "강의, 온라인 수업, 공개 영상을 검색 가능한 노트로 바꿉니다."],
      ["개인 회의", "Zoom, 인터뷰, 교육, 고객 회의의 핵심 내용을 보존합니다."],
      ["크리에이터", "영상에서 자막, 스크립트, 블로그 초안, 소셜 콘텐츠를 만듭니다."],
      ["리서치와 미디어", "인터뷰, 구술 기록, 팟캐스트, 기자회견을 더 빠르게 처리합니다."]
    ],
    planDetails: {
      freePlan: "하루 3개 파일, 파일당 30분. 가벼운 체험에 적합합니다.",
      basicPlan: "YouTube 링크, 화자 라벨, 일괄 작업, 자동화용 내보내기를 지원합니다.",
      standardPlan: "더 높은 동시 처리, 더 긴 파일, 우선 대기열을 제공합니다.",
      proPlan: "잦은 회의, 콘텐츠 제작 파이프라인에 적합합니다."
    },
    minutesUnit: "분",
    viewFullPricing: "전체 요금 보기",
    homeFaqs: [
      ["무료로 체험할 수 있나요?", "네. 무료 플랜에는 월간 분수, 일일 파일 제한, 전사 편집, 표준 내보내기가 포함됩니다."],
      ["어떤 파일을 지원하나요?", "mp3, wav, m4a, flac, mp4, mov, mkv, webm, wmv 등 일반적인 오디오와 비디오 형식을 지원합니다."],
      ["화자 라벨은 어떻게 생성되나요?", "활성화하면 Votxt는 Deepgram 또는 AssemblyAI의 화자 분리를 우선 사용하고 필요 시 Groq로 전환합니다."],
      ["자막을 내보낼 수 있나요?", "네. 완료된 작업은 SRT, VTT와 함께 TXT, JSON, PDF로 내보낼 수 있습니다."]
    ],
    needRecording: "먼저 녹음을 완료하세요.",
    needFile: "먼저 파일을 선택하세요.",
    uploadUrlError: "업로드 URL을 만들 수 없습니다.",
    uploadFailed: "파일 업로드에 실패했습니다. 객체 스토리지 설정을 확인하세요.",
    createTaskError: "전사 작업을 만들 수 없습니다.",
    readTasksError: "전사 작업 목록을 읽을 수 없습니다.",
    readUsageError: "사용량 데이터를 읽을 수 없습니다.",
    readTaskError: "전사 작업을 읽을 수 없습니다.",
    shareTitle: "Votxt 전사 공유",
    shareError: "공유 링크를 만들 수 없습니다.",
    shareDone: "공유 링크가 생성되어 클립보드에 복사되었습니다.",
    insightError: "AI 인사이트를 생성할 수 없습니다.",
    transcriptSaved: "전사가 저장되었습니다.",
    recordingReady: "녹음이 준비되었습니다. 전사를 시작할 수 있습니다.",
    micError: "마이크에 접근할 수 없습니다. 브라우저 권한을 확인하세요.",
    translationGenerated: "번역이 생성되었습니다."
  },
  pt: {
    intlLocale: "pt-BR",
    marketingIntro: "Envie, cole um link ou grave imediatamente, sem passar primeiro por uma página de marketing.",
    freeSignup: "Cadastrar grátis",
    viewDashboard: "Ver painel",
    converterTools: "Conversores",
    converters: ["Fala para texto", "Voz para texto", "Áudio para texto", "Vídeo para texto", "Link para texto", "MP3 para texto", "MP4 para texto", "WAV para texto"],
    freePlan: "Plano grátis",
    dailyFiles: "Arquivos diários",
    monthlyMinutes: "Minutos mensais",
    queueTasks: "Tarefas na fila",
    account: "Conta",
    anonymousUser: "Usuário convidado",
    loginSyncHint: "Entre para sincronizar tarefas e cota",
    retention: "Retenção",
    days: "dias",
    monthTasks: "Tarefas do mês",
    remainingMinutes: "Restante",
    transcriptTab: "Transcrição",
    translationTab: "Tradução",
    noTranscriptAssets: "Ainda não há transcrições. Crie uma tarefa e ela aparecerá aqui.",
    noTranslationAssets: "Ainda não há traduções. Gere insights de IA após uma tarefa concluída.",
    targetLanguage: "Destino",
    youtubeTask: "Tarefa de link de vídeo",
    unnamedTask: "Transcrição sem título",
    waiting: "Aguardando",
    speakers: (count: number) => `${count} locutor${count === 1 ? "" : "es"}`,
    share: "Compartilhar",
    assetManagement: "Gestão de ativos",
    assetManagementText: "Pastas, busca e visualizações de ativos ajudam a gerenciar reuniões, aulas, entrevistas e transcrições de vídeos públicos.",
    aiPost: "Pós-processamento com IA",
    aiPostText: "Depois da transcrição, gere resumos, mapas mentais, perguntas e respostas, e traduções para reduzir a revisão manual.",
    exportText: "Para legendas, arquivos e automações, exporte TXT, SRT, VTT, JSON e PDF.",
    usageLedger: "Histórico de uso",
    plan: "Plano",
    usedThisMonth: "Usado este mês",
    noLedger: "Ainda não há histórico de uso. Tarefas de transcrição registrarão reserva, liquidação e liberação.",
    usageLoginEmpty: "Entre e inicialize uma assinatura para ver seu uso, período de cobrança e histórico recente.",
    periodUnset: "Não definido",
    whyTitle: "Por que Votxt",
    useCases: [
      ["Estudantes e cursos", "Transforme palestras, aulas online e vídeos públicos em notas pesquisáveis."],
      ["Reuniões pessoais", "Preserve detalhes importantes de Zoom, entrevistas, treinamentos e reuniões com clientes."],
      ["Criadores", "Crie legendas, roteiros, rascunhos de blog e conteúdo social a partir de vídeo."],
      ["Pesquisa e mídia", "Processe entrevistas, histórias orais, podcasts e coletivas mais rápido."]
    ],
    planDetails: {
      freePlan: "3 arquivos por dia, 30 minutos por arquivo, ideal para testes leves.",
      basicPlan: "Links do YouTube, rótulos de locutor, tarefas em lote e exportações automatizáveis.",
      standardPlan: "Mais concorrência, arquivos mais longos e fila prioritária.",
      proPlan: "Para transcrição em alto volume, reuniões frequentes e pipelines de produção de conteúdo."
    },
    minutesUnit: "min",
    viewFullPricing: "Ver preços completos",
    homeFaqs: [
      ["Posso testar grátis?", "Sim. O plano grátis inclui minutos mensais, limites diários, edição de transcrição e exportações padrão."],
      ["Quais arquivos são suportados?", "Formatos comuns de áudio e vídeo são suportados, incluindo mp3, wav, m4a, flac, mp4, mov, mkv, webm e wmv."],
      ["Como os rótulos de locutor são gerados?", "Quando ativado, o Votxt prioriza a diarização da Deepgram ou AssemblyAI e alterna para Groq se necessário."],
      ["Posso exportar legendas?", "Sim. Tarefas concluídas exportam SRT e VTT, além de TXT, JSON e PDF."]
    ],
    needRecording: "Conclua uma gravação primeiro.",
    needFile: "Escolha um arquivo primeiro.",
    uploadUrlError: "Não foi possível criar a URL de upload.",
    uploadFailed: "Falha no upload do arquivo. Verifique o armazenamento de objetos.",
    createTaskError: "Não foi possível criar a tarefa de transcrição.",
    readTasksError: "Não foi possível ler as tarefas de transcrição.",
    readUsageError: "Não foi possível ler os dados de uso.",
    readTaskError: "Não foi possível ler a tarefa de transcrição.",
    shareTitle: "Compartilhar transcrição Votxt",
    shareError: "Não foi possível criar o link de compartilhamento.",
    shareDone: "Link de compartilhamento criado e copiado para a área de transferência.",
    insightError: "Não foi possível gerar insights de IA.",
    transcriptSaved: "Transcrição salva.",
    recordingReady: "A gravação está pronta. Você pode iniciar a transcrição.",
    micError: "Não foi possível acessar o microfone. Verifique as permissões do navegador.",
    translationGenerated: "A tradução foi gerada."
  }
} as const;

export type WorkspaceCopy = ReturnType<typeof getWorkspaceCopy>;

export function getWorkspaceCopy(locale: string) {
  const normalizedLocale = isLocale(locale) ? locale : "en";
  const localeKey = normalizedLocale.toLowerCase().split("-")[0] as keyof typeof workspaceCopy;
  const copy = workspaceCopy[normalizedLocale as keyof typeof workspaceCopy] ?? workspaceCopy[localeKey] ?? workspaceCopy.en;
  const localized = {
    zh: {
      uploadPrompt: "从设备上传音频/视频文件进行转写",
      pastePrompt: "粘贴媒体链接，转写视频或音频内容。",
      dragFilesHere: "拖拽文件到此处上传",
      or: "或",
      uploadAFile: "上传文件",
      mediaLinkPlaceholder: "粘贴媒体链接",
      search: "搜索",
      transcribeForFree: "免费转写",
      signInToUpload: "请先登录后上传文件，即将跳转至登录页面。",
      signInToTranscribe: "请先登录后开始转写，即将跳转至登录页面。",
      resolveLinkError: "无法检查该链接。",
      manageTranscriptions: "查看和管理你的转写任务",
      goToDashboard: "前往仪表盘",
      welcomeBack: (name: string) => `欢迎回来，${name}`
    },
    en: {
      uploadPrompt: "Upload audio/video files from device to transcribe",
      pastePrompt: "Paste a media link to transcribe video or audio content.",
      dragFilesHere: "Drag files here to upload",
      or: "or",
      uploadAFile: "Upload a file",
      mediaLinkPlaceholder: "Paste a media link",
      search: "Search",
      transcribeForFree: "Transcribe for Free",
      signInToUpload: "Please sign in to upload files. Redirecting to sign in.",
      signInToTranscribe: "Please sign in to start transcription. Redirecting to sign in.",
      resolveLinkError: "Unable to check this link.",
      manageTranscriptions: "View and manage your transcriptions",
      goToDashboard: "Go to dashboard",
      welcomeBack: (name: string) => `Welcome back, ${name}`
    },
    es: {
      uploadPrompt: "Sube archivos de audio/video desde tu dispositivo para transcribir",
      pastePrompt: "Pega un enlace multimedia para transcribir video o audio.",
      dragFilesHere: "Arrastra archivos aquí para subirlos",
      or: "O",
      uploadAFile: "Subir archivo",
      mediaLinkPlaceholder: "Pega un enlace multimedia",
      search: "Buscar",
      transcribeForFree: "Transcribir gratis",
      signInToUpload: "Inicia sesión para subir archivos. Redirigiendo al inicio de sesión.",
      signInToTranscribe: "Inicia sesión para transcribir. Redirigiendo al inicio de sesión.",
      resolveLinkError: "No se pudo comprobar este enlace.",
      manageTranscriptions: "Ver y gestionar tus transcripciones",
      goToDashboard: "Ir al panel",
      welcomeBack: (name: string) => `Bienvenido de nuevo, ${name}`
    },
    fr: {
      uploadPrompt: "Importez des fichiers audio/vidéo depuis votre appareil pour transcrire",
      pastePrompt: "Collez un lien média pour transcrire une vidéo ou un audio.",
      dragFilesHere: "Déposez les fichiers ici",
      or: "OU",
      uploadAFile: "Importer un fichier",
      mediaLinkPlaceholder: "Collez un lien média",
      search: "Rechercher",
      transcribeForFree: "Transcrire gratuitement",
      signInToUpload: "Connectez-vous pour importer des fichiers. Redirection vers la connexion.",
      signInToTranscribe: "Connectez-vous pour lancer la transcription. Redirection vers la connexion.",
      resolveLinkError: "Impossible de vérifier ce lien.",
      manageTranscriptions: "Consulter et gérer vos transcriptions",
      goToDashboard: "Aller au tableau",
      welcomeBack: (name: string) => `Bon retour, ${name}`
    },
    de: {
      uploadPrompt: "Audio-/Videodateien vom Gerät zur Transkription hochladen",
      pastePrompt: "Füge einen Medienlink ein, um Video oder Audio zu transkribieren.",
      dragFilesHere: "Dateien zum Hochladen hierher ziehen",
      or: "ODER",
      uploadAFile: "Datei hochladen",
      mediaLinkPlaceholder: "Medienlink einfügen",
      search: "Suchen",
      transcribeForFree: "Kostenlos transkribieren",
      signInToUpload: "Bitte melde dich zum Hochladen an. Weiterleitung zur Anmeldung.",
      signInToTranscribe: "Bitte melde dich zum Transkribieren an. Weiterleitung zur Anmeldung.",
      resolveLinkError: "Dieser Link konnte nicht geprüft werden.",
      manageTranscriptions: "Transkriptionen ansehen und verwalten",
      goToDashboard: "Zum Dashboard",
      welcomeBack: (name: string) => `Willkommen zurück, ${name}`
    },
    ja: {
      uploadPrompt: "デバイスから音声/動画ファイルをアップロードして文字起こし",
      pastePrompt: "メディアリンクを貼り付けて動画または音声を文字起こしします。",
      dragFilesHere: "ここにファイルをドラッグしてアップロード",
      or: "または",
      uploadAFile: "ファイルをアップロード",
      mediaLinkPlaceholder: "メディアリンクを貼り付け",
      search: "検索",
      transcribeForFree: "無料で文字起こし",
      signInToUpload: "ファイルをアップロードするにはログインしてください。ログインページへ移動します。",
      signInToTranscribe: "文字起こしを開始するにはログインしてください。ログインページへ移動します。",
      resolveLinkError: "このリンクを確認できませんでした。",
      manageTranscriptions: "文字起こしを表示・管理",
      goToDashboard: "ダッシュボードへ",
      welcomeBack: (name: string) => `おかえりなさい、${name}`
    },
    ko: {
      uploadPrompt: "기기에서 오디오/비디오 파일을 업로드해 전사",
      pastePrompt: "미디어 링크를 붙여넣어 비디오 또는 오디오를 전사하세요.",
      dragFilesHere: "파일을 여기에 끌어 업로드",
      or: "또는",
      uploadAFile: "파일 업로드",
      mediaLinkPlaceholder: "미디어 링크 붙여넣기",
      search: "검색",
      transcribeForFree: "무료 전사",
      signInToUpload: "파일을 업로드하려면 로그인하세요. 로그인 페이지로 이동합니다.",
      signInToTranscribe: "전사를 시작하려면 로그인하세요. 로그인 페이지로 이동합니다.",
      resolveLinkError: "이 링크를 확인할 수 없습니다.",
      manageTranscriptions: "전사 작업 보기 및 관리",
      goToDashboard: "대시보드로 이동",
      welcomeBack: (name: string) => `다시 오신 것을 환영합니다, ${name}`
    },
    pt: {
      uploadPrompt: "Envie arquivos de áudio/vídeo do dispositivo para transcrever",
      pastePrompt: "Cole um link de mídia para transcrever vídeo ou áudio.",
      dragFilesHere: "Arraste arquivos aqui para enviar",
      or: "OU",
      uploadAFile: "Enviar arquivo",
      mediaLinkPlaceholder: "Cole um link de mídia",
      search: "Buscar",
      transcribeForFree: "Transcrever grátis",
      signInToUpload: "Entre para enviar arquivos. Redirecionando para o login.",
      signInToTranscribe: "Entre para iniciar a transcrição. Redirecionando para o login.",
      resolveLinkError: "Não foi possível verificar este link.",
      manageTranscriptions: "Ver e gerenciar suas transcrições",
      goToDashboard: "Ir para o painel",
      welcomeBack: (name: string) => `Bem-vindo de volta, ${name}`
    }
  } as const;
  const home = localized[normalizedLocale as keyof typeof localized] ?? localized[localeKey as keyof typeof localized] ?? localized.en;
  return {
    ...copy,
    ...home,
    ...workspaceMessageOverrides(normalizedLocale),
    ...workspaceLinkUploadCopy[normalizedLocale],
    ...workspaceOperationalCopy[normalizedLocale],
    ...getWorkspaceSidebarCopy(normalizedLocale),
    ...getWorkspaceDashboardCopy(normalizedLocale),
    supportedPlatforms: ["YouTube", "TikTok", "Instagram", "Facebook", "X", "Many other links"]
  };
}

export const fallbackMessages: Record<string, string> = {
  uploadFile: "上传文件",
  pasteLink: "粘贴链接",
  recordAudio: "录音",
  headline: "音视频一键转文字",
  subheadline:
    "上传文件、粘贴视频链接或直接录音。Votxt 会生成可编辑转写、发言人段落、AI 总结、思维导图、问答、翻译和多格式导出。",
  formats: "支持 11+ 媒体格式",
  languages: "支持 63 种语言",
  exportCount: "支持 5 种导出",
  allTranscriptions: "全部转写",
  uploadFiles: "上传文件",
  mediaLinkTranscription: "媒体链接转写",
  supportedPlatforms: "支持的平台",
  name: "名称",
  duration: "时长",
  created: "创建时间",
  type: "类型",
  folder: "文件夹",
  localUploadHint: "音频: aac, amr, awb, flac, m4a, mka, mp2, mp3, oga, ogg, opus, wav, weba, webm, wma。视频: 3gp, mkv, mov, mp4, mpg, ts, webm, wmv。",
  terms: "使用 Votxt 即表示你同意服务条款和隐私政策。",
  ready: "就绪",
  save: "保存",
  workspace: "工作台",
  features: "功能",
  pricing: "价格",
  faq: "FAQ",
  blog: "博客",
  tryFree: "开始转写",
  workflowTitle: "从媒体到可用文本",
  workflowUpload: "上传、链接或录音",
  workflowUploadText: "本地文件直传对象存储，在线视频链接进入解析队列，浏览器录音会作为音频文件处理。",
  workflowTranscribe: "队列转写",
  workflowTranscribeText: "根据发言人标签、语言和服务可用性，在 Groq、Deepgram、AssemblyAI 之间自动切换。",
  workflowExport: "编辑与导出",
  workflowExportText: "完成后编辑全文，生成摘要、思维导图、问答、翻译，并下载字幕或文档。",
  insightTitle: "AI 工作区",
  summaryEmpty: "转写完成后可生成摘要和要点。",
  mindMapEmpty: "思维导图节点会显示在这里。",
  qaEmpty: "关键问答会显示在这里。",
  translationEmpty: "翻译会显示在这里。",
  plansTitle: "适合不同工作量的方案",
  freePlan: "免费版",
  basicPlan: "基础版",
  standardPlan: "标准版",
  proPlan: "专业版",
  perMonth: "/ 月",
  faqTitle: "常见问题",
  drop: "拖入音频或视频",
  choose: "或点击选择文件",
  youtube: "视频链接",
  youtubePlaceholder: "粘贴 YouTube、课程或公开视频链接",
  language: "转写语言",
  auto: "自动识别",
  speakerLabels: "发言人标签",
  start: "开始转写",
  status: "任务状态",
  transcript: "转写编辑器",
  summary: "摘要",
  mindMap: "思维导图",
  qa: "问答",
  translation: "翻译",
  exports: "导出中心",
  generateInsights: "生成 AI 洞察",
  empty: "选择一种输入方式开始。任务进度、转写文本和 AI 工作区会显示在这里。",
  processing: "处理中",
  completed: "已完成",
  failed: "失败",
  quotaTitle: "免费额度",
  quotaFiles: "今日文件",
  quotaMinutes: "本月分钟",
  taskList: "转写任务",
  searchPlaceholder: "搜索文件名",
  folders: "文件夹",
  uncategorized: "未分类",
  bulkActions: "批量操作",
  copied: "已复制到剪贴板",
  recordHint: "录音会在浏览器中生成 WebM 音频文件，然后走同一套上传和转写队列。",
  startRecord: "开始录音",
  stopRecord: "停止录音",
  noTranscript: "任务创建后，实时进度和转写结果会出现在这里。"
};
