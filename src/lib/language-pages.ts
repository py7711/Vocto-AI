import type {Locale} from "@/lib/locales";

export const supportedLanguageNames = [
  "Afrikaans",
  "Albanian",
  "Arabic",
  "Azerbaijani",
  "Basque",
  "Belarusian",
  "Bengali",
  "Bosnian",
  "Bulgarian",
  "Cantonese",
  "Catalan",
  "Chinese",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Estonian",
  "Finnish",
  "French",
  "Galician",
  "German",
  "Greek",
  "Gujarati",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Indonesian",
  "Italian",
  "Japanese",
  "Kannada",
  "Kazakh",
  "Korean",
  "Latvian",
  "Lithuanian",
  "Macedonian",
  "Malay",
  "Malayalam",
  "Marathi",
  "Norwegian",
  "Persian",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Romanian",
  "Russian",
  "Serbian",
  "Slovak",
  "Slovenian",
  "Spanish",
  "Swahili",
  "Swedish",
  "Tagalog",
  "Tamil",
  "Telugu",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Urdu",
  "Vietnamese",
  "Welsh"
] as const;

export function languageSlug(language: string) {
  return language.toLowerCase().replace(/\s+/g, "-");
}

const supportedLanguageCodes: Record<(typeof supportedLanguageNames)[number], string> = {
  Afrikaans: "af",
  Albanian: "sq",
  Arabic: "ar",
  Azerbaijani: "az",
  Basque: "eu",
  Belarusian: "be",
  Bengali: "bn",
  Bosnian: "bs",
  Bulgarian: "bg",
  Cantonese: "yue",
  Catalan: "ca",
  Chinese: "zh",
  Croatian: "hr",
  Czech: "cs",
  Danish: "da",
  Dutch: "nl",
  English: "en",
  Estonian: "et",
  Finnish: "fi",
  French: "fr",
  Galician: "gl",
  German: "de",
  Greek: "el",
  Gujarati: "gu",
  Hebrew: "he",
  Hindi: "hi",
  Hungarian: "hu",
  Indonesian: "id",
  Italian: "it",
  Japanese: "ja",
  Kannada: "kn",
  Kazakh: "kk",
  Korean: "ko",
  Latvian: "lv",
  Lithuanian: "lt",
  Macedonian: "mk",
  Malay: "ms",
  Malayalam: "ml",
  Marathi: "mr",
  Norwegian: "no",
  Persian: "fa",
  Polish: "pl",
  Portuguese: "pt",
  Punjabi: "pa",
  Romanian: "ro",
  Russian: "ru",
  Serbian: "sr",
  Slovak: "sk",
  Slovenian: "sl",
  Spanish: "es",
  Swahili: "sw",
  Swedish: "sv",
  Tagalog: "tl",
  Tamil: "ta",
  Telugu: "te",
  Thai: "th",
  Turkish: "tr",
  Ukrainian: "uk",
  Urdu: "ur",
  Vietnamese: "vi",
  Welsh: "cy"
};

export function localizedSupportedLanguageName(language: string, locale: Locale) {
  const code = supportedLanguageCodes[language as (typeof supportedLanguageNames)[number]];
  if (!code) return language;
  try {
    return new Intl.DisplayNames([locale], {type: "language"}).of(code) ?? language;
  } catch {
    return language;
  }
}

export const supportedLanguagePages = supportedLanguageNames.map((language) => ({
  slug: `transcribe-${languageSlug(language)}-audio`,
  title: language,
  description: `Turn ${language} audio and video into text, subtitles, summaries, translations, and export-ready transcript files.`
}));

type LanguagePageCopy = {
  description: (language: string) => string;
};

const languagePageCopy: Record<Locale, LanguagePageCopy> = {
  ar: {description: (language) => `حوّل الصوت والفيديو باللغة ${language} إلى نصوص وترجمات وملخصات وملفات جاهزة للتصدير.`},
  de: {description: (language) => `Wandle ${language}-Audio und -Video in Text, Untertitel, Zusammenfassungen, Übersetzungen und exportfertige Dateien um.`},
  en: {description: (language) => `Turn ${language} audio and video into text, subtitles, summaries, translations, and export-ready transcript files.`},
  es: {description: (language) => `Convierte audio y video en ${language} en texto, subtítulos, resúmenes, traducciones y archivos listos para exportar.`},
  fr: {description: (language) => `Convertissez l'audio et la vidéo en ${language} en texte, sous-titres, résumés, traductions et fichiers prêts à exporter.`},
  hu: {description: (language) => `Alakítsd a(z) ${language} hangot és videót szöveggé, felirattá, összefoglalóvá, fordítássá és exportálható fájlokká.`},
  id: {description: (language) => `Ubah audio dan video ${language} menjadi teks, subtitle, ringkasan, terjemahan, dan file siap ekspor.`},
  it: {description: (language) => `Trasforma audio e video in ${language} in testo, sottotitoli, riepiloghi, traduzioni e file pronti per l'export.`},
  ja: {description: (language) => `${language} の音声と動画をテキスト、字幕、要約、翻訳、エクスポート用ファイルに変換します。`},
  ko: {description: (language) => `${language} 오디오와 비디오를 텍스트, 자막, 요약, 번역, 내보내기 파일로 변환하세요.`},
  nl: {description: (language) => `Zet ${language} audio en video om naar tekst, ondertitels, samenvattingen, vertalingen en exportklare bestanden.`},
  pl: {description: (language) => `Zamień audio i wideo w języku ${language} na tekst, napisy, podsumowania, tłumaczenia i pliki do eksportu.`},
  pt: {description: (language) => `Converta áudio e vídeo em ${language} em texto, legendas, resumos, traduções e arquivos prontos para exportar.`},
  ru: {description: (language) => `Преобразуйте аудио и видео на языке ${language} в текст, субтитры, сводки, переводы и файлы для экспорта.`},
  th: {description: (language) => `แปลงเสียงและวิดีโอภาษา ${language} เป็นข้อความ คำบรรยาย สรุป คำแปล และไฟล์พร้อมส่งออก`},
  tr: {description: (language) => `${language} ses ve videolarını metne, altyazıya, özetlere, çevirilere ve dışa aktarmaya hazır dosyalara dönüştürün.`},
  uk: {description: (language) => `Перетворюйте аудіо й відео мовою ${language} на текст, субтитри, підсумки, переклади та файли для експорту.`},
  vi: {description: (language) => `Chuyển audio và video ${language} thành văn bản, phụ đề, tóm tắt, bản dịch và tệp sẵn sàng xuất.`},
  zh: {description: (language) => `将 ${language} 音频和视频转换为文字、字幕、摘要、翻译和可导出的转写文件。`},
  "zh-TW": {description: (language) => `將 ${language} 音訊和影片轉換為文字、字幕、摘要、翻譯和可匯出的轉寫檔。`}
};

export function getSupportedLanguagePages(locale: Locale) {
  const copy = languagePageCopy[locale] ?? languagePageCopy.en;
  return supportedLanguageNames.map((language) => ({
    slug: `transcribe-${languageSlug(language)}-audio`,
    title: localizedSupportedLanguageName(language, locale),
    description: copy.description(localizedSupportedLanguageName(language, locale))
  }));
}
