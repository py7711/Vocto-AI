import {isLocale, type Locale} from "@/lib/locales";
import {localizedSupportedLanguageName} from "@/lib/language-pages";

const languageNames: Record<string, string> = Object.fromEntries([
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
].map((language) => [`transcribe-${language.toLowerCase().replace(/\s+/g, "-")}-audio`, language]));

const pageTitles: Record<string, string> = {
  "speech-to-text": "Free Online Speech to Text Converter",
  "voice-to-text": "Free Online Voice to Text Converter",
  "audio-to-text": "Convert Audio to Text for Free Online | Fast and Accurate",
  "video-to-text": "Convert Video to Text in Seconds for Free",
  "video-link-to-text": "Link to Text",
  "mp3-to-text": "MP3 Audio to Text Converter Online for Free - No Download",
  "mp4-to-text-converter": "MP4 to Text",
  "wav-to-text": "WAV to Text",
  "m4a-to-text": "M4A to Text",
  "aac-to-text": "AAC to Text",
  "opus-to-text": "OPUS to Text",
  "webm-to-text": "WebM to Text",
  "flac-to-text": "FLAC to Text",
  "amr-to-text": "AMR to Text",
  "wma-to-text": "WMA to Text",
  "mkv-to-text": "MKV to Text",
  "wmv-to-text": "WMV to Text",
  "video-to-audio-extractor": "Free Browser-Based Video to Audio Extractor | UniScribe Tools",
  "wav-to-mp3-converter": "Free Browser-Based WAV to MP3 Converter | UniScribe Tools",
  "youtube-subtitle-downloader": "YouTube Subtitle Downloader | Download SRT and VTT Captions",
  "youtube-video-downloader": "YouTube Video Downloader | UniScribe Tools"
};

const canonicalToolSlugs = new Set(["audio-to-text", "video-link-to-text", "video-to-audio-extractor", "wav-to-mp3-converter", "youtube-subtitle-downloader", "youtube-video-downloader"]);

const localizedTitleTemplates: Record<Locale, {language: string; tool: string}> = {
  ar: {language: "حوّل صوت {language} إلى نص مجاناً خلال ثوانٍ", tool: "{name} | أداة UniScribe"},
  de: {language: "{language}-Audio kostenlos in Sekunden transkribieren", tool: "{name} | UniScribe-Werkzeug"},
  en: {language: "Transcribe {language} Audio to Text in Seconds for Free", tool: "{name} | UniScribe Tool"},
  es: {language: "Transcribe audio en {language} a texto gratis en segundos", tool: "{name} | Herramienta UniScribe"},
  fr: {language: "Transcrire l'audio en {language} gratuitement en quelques secondes", tool: "{name} | Outil UniScribe"},
  hu: {language: "{language} hang átírása szöveggé ingyen, másodpercek alatt", tool: "{name} | UniScribe eszköz"},
  id: {language: "Transkripsikan audio {language} ke teks gratis dalam hitungan detik", tool: "{name} | Alat UniScribe"},
  it: {language: "Trascrivi audio in {language} in testo gratis in pochi secondi", tool: "{name} | Strumento UniScribe"},
  ja: {language: "{language} 音声を無料で数秒でテキスト化", tool: "{name} | UniScribe ツール"},
  ko: {language: "{language} 오디오를 무료로 몇 초 만에 텍스트로 변환", tool: "{name} | UniScribe 도구"},
  nl: {language: "{language} audio gratis in seconden naar tekst transcriberen", tool: "{name} | UniScribe-tool"},
  pl: {language: "Transkrybuj audio w języku {language} na tekst za darmo w kilka sekund", tool: "{name} | Narzędzie UniScribe"},
  pt: {language: "Transcreva áudio em {language} para texto grátis em segundos", tool: "{name} | Ferramenta UniScribe"},
  ru: {language: "Расшифруйте аудио на {language} в текст бесплатно за секунды", tool: "{name} | Инструмент UniScribe"},
  th: {language: "ถอดเสียงภาษา {language} เป็นข้อความฟรีในไม่กี่วินาที", tool: "{name} | เครื่องมือ UniScribe"},
  tr: {language: "{language} sesi ücretsiz olarak saniyeler içinde metne dönüştürün", tool: "{name} | UniScribe aracı"},
  uk: {language: "Транскрибуйте аудіо мовою {language} у текст безкоштовно за секунди", tool: "{name} | Інструмент UniScribe"},
  vi: {language: "Chép lời âm thanh {language} thành văn bản miễn phí trong vài giây", tool: "{name} | Công cụ UniScribe"},
  zh: {language: "免费快速将 {language} 音频转成文字", tool: "{name} | UniScribe 工具"},
  "zh-TW": {language: "免費快速將 {language} 音訊轉成文字", tool: "{name} | UniScribe 工具"}
};

const toTextTitleTemplates: Record<Locale, string> = {
  ar: "{format} إلى نص",
  de: "{format} zu Text",
  en: "{format} to Text",
  es: "{format} a texto",
  fr: "{format} en texte",
  hu: "{format} szöveggé",
  id: "{format} ke teks",
  it: "{format} in testo",
  ja: "{format} をテキスト化",
  ko: "{format}를 텍스트로",
  nl: "{format} naar tekst",
  pl: "{format} na tekst",
  pt: "{format} para texto",
  ru: "{format} в текст",
  th: "{format} เป็นข้อความ",
  tr: "{format} metne",
  uk: "{format} у текст",
  vi: "{format} thành văn bản",
  zh: "{format} 转文字",
  "zh-TW": "{format} 轉文字"
};

const formatSlugTitles: Record<string, string> = {
  "mp3-to-text": "MP3",
  "mp4-to-text-converter": "MP4",
  "wav-to-text": "WAV",
  "m4a-to-text": "M4A",
  "aac-to-text": "AAC",
  "opus-to-text": "OPUS",
  "webm-to-text": "WebM",
  "flac-to-text": "FLAC",
  "amr-to-text": "AMR",
  "wma-to-text": "WMA",
  "mkv-to-text": "MKV",
  "wmv-to-text": "WMV"
};

const localizedToolTitleNames: Record<Locale, Record<string, string>> = {
  ar: {"speech-to-text": "الكلام إلى نص", "voice-to-text": "الصوت إلى نص", "audio-to-text": "الصوت إلى نص", "video-to-text": "الفيديو إلى نص", "video-link-to-text": "الرابط إلى نص", "video-to-audio-extractor": "استخراج الصوت من الفيديو", "wav-to-mp3-converter": "تحويل WAV إلى MP3", "youtube-subtitle-downloader": "تنزيل ترجمات YouTube", "youtube-video-downloader": "تنزيل فيديو YouTube"},
  de: {"speech-to-text": "Sprache zu Text", "voice-to-text": "Stimme zu Text", "audio-to-text": "Audio zu Text", "video-to-text": "Video zu Text", "video-link-to-text": "Link zu Text", "video-to-audio-extractor": "Video zu Audio extrahieren", "wav-to-mp3-converter": "WAV zu MP3 konvertieren", "youtube-subtitle-downloader": "YouTube-Untertitel herunterladen", "youtube-video-downloader": "YouTube-Video herunterladen"},
  en: pageTitles,
  es: {"speech-to-text": "voz a texto", "voice-to-text": "voz a texto", "audio-to-text": "audio a texto", "video-to-text": "video a texto", "video-link-to-text": "enlace a texto", "video-to-audio-extractor": "extraer audio de video", "wav-to-mp3-converter": "convertir WAV a MP3", "youtube-subtitle-downloader": "descargar subtítulos de YouTube", "youtube-video-downloader": "descargar video de YouTube"},
  fr: {"speech-to-text": "parole en texte", "voice-to-text": "voix en texte", "audio-to-text": "audio en texte", "video-to-text": "vidéo en texte", "video-link-to-text": "lien en texte", "video-to-audio-extractor": "extraire l'audio d'une vidéo", "wav-to-mp3-converter": "convertir WAV en MP3", "youtube-subtitle-downloader": "télécharger les sous-titres YouTube", "youtube-video-downloader": "télécharger une vidéo YouTube"},
  hu: {"speech-to-text": "beszéd szöveggé", "voice-to-text": "hang szöveggé", "audio-to-text": "audio szöveggé", "video-to-text": "videó szöveggé", "video-link-to-text": "link szöveggé", "video-to-audio-extractor": "videó hangjának kinyerése", "wav-to-mp3-converter": "WAV konvertálása MP3-ba", "youtube-subtitle-downloader": "YouTube felirat letöltése", "youtube-video-downloader": "YouTube videó letöltése"},
  id: {"speech-to-text": "ucapan ke teks", "voice-to-text": "suara ke teks", "audio-to-text": "audio ke teks", "video-to-text": "video ke teks", "video-link-to-text": "tautan ke teks", "video-to-audio-extractor": "ekstrak audio dari video", "wav-to-mp3-converter": "konversi WAV ke MP3", "youtube-subtitle-downloader": "unduh subtitle YouTube", "youtube-video-downloader": "unduh video YouTube"},
  it: {"speech-to-text": "parlato in testo", "voice-to-text": "voce in testo", "audio-to-text": "audio in testo", "video-to-text": "video in testo", "video-link-to-text": "link in testo", "video-to-audio-extractor": "estrarre audio da video", "wav-to-mp3-converter": "convertire WAV in MP3", "youtube-subtitle-downloader": "scaricare sottotitoli YouTube", "youtube-video-downloader": "scaricare video YouTube"},
  ja: {"speech-to-text": "音声をテキスト化", "voice-to-text": "声をテキスト化", "audio-to-text": "音声をテキスト化", "video-to-text": "動画をテキスト化", "video-link-to-text": "リンクをテキスト化", "video-to-audio-extractor": "動画から音声を抽出", "wav-to-mp3-converter": "WAV を MP3 に変換", "youtube-subtitle-downloader": "YouTube 字幕ダウンロード", "youtube-video-downloader": "YouTube 動画ダウンロード"},
  ko: {"speech-to-text": "음성을 텍스트로", "voice-to-text": "목소리를 텍스트로", "audio-to-text": "오디오를 텍스트로", "video-to-text": "비디오를 텍스트로", "video-link-to-text": "링크를 텍스트로", "video-to-audio-extractor": "비디오에서 오디오 추출", "wav-to-mp3-converter": "WAV를 MP3로 변환", "youtube-subtitle-downloader": "YouTube 자막 다운로드", "youtube-video-downloader": "YouTube 비디오 다운로드"},
  nl: {"speech-to-text": "spraak naar tekst", "voice-to-text": "stem naar tekst", "audio-to-text": "audio naar tekst", "video-to-text": "video naar tekst", "video-link-to-text": "link naar tekst", "video-to-audio-extractor": "audio uit video halen", "wav-to-mp3-converter": "WAV naar MP3 converteren", "youtube-subtitle-downloader": "YouTube-ondertitels downloaden", "youtube-video-downloader": "YouTube-video downloaden"},
  pl: {"speech-to-text": "mowa na tekst", "voice-to-text": "głos na tekst", "audio-to-text": "audio na tekst", "video-to-text": "wideo na tekst", "video-link-to-text": "link na tekst", "video-to-audio-extractor": "wyodrębnianie audio z wideo", "wav-to-mp3-converter": "konwersja WAV na MP3", "youtube-subtitle-downloader": "pobieranie napisów YouTube", "youtube-video-downloader": "pobieranie wideo YouTube"},
  pt: {"speech-to-text": "fala para texto", "voice-to-text": "voz para texto", "audio-to-text": "áudio para texto", "video-to-text": "vídeo para texto", "video-link-to-text": "link para texto", "video-to-audio-extractor": "extrair áudio de vídeo", "wav-to-mp3-converter": "converter WAV para MP3", "youtube-subtitle-downloader": "baixar legendas do YouTube", "youtube-video-downloader": "baixar vídeo do YouTube"},
  ru: {"speech-to-text": "речь в текст", "voice-to-text": "голос в текст", "audio-to-text": "аудио в текст", "video-to-text": "видео в текст", "video-link-to-text": "ссылка в текст", "video-to-audio-extractor": "извлечь аудио из видео", "wav-to-mp3-converter": "конвертировать WAV в MP3", "youtube-subtitle-downloader": "скачать субтитры YouTube", "youtube-video-downloader": "скачать видео YouTube"},
  th: {"speech-to-text": "คำพูดเป็นข้อความ", "voice-to-text": "เสียงเป็นข้อความ", "audio-to-text": "เสียงเป็นข้อความ", "video-to-text": "วิดีโอเป็นข้อความ", "video-link-to-text": "ลิงก์เป็นข้อความ", "video-to-audio-extractor": "แยกเสียงจากวิดีโอ", "wav-to-mp3-converter": "แปลง WAV เป็น MP3", "youtube-subtitle-downloader": "ดาวน์โหลดคำบรรยาย YouTube", "youtube-video-downloader": "ดาวน์โหลดวิดีโอ YouTube"},
  tr: {"speech-to-text": "konuşmayı metne", "voice-to-text": "sesi metne", "audio-to-text": "sesi metne", "video-to-text": "videoyu metne", "video-link-to-text": "bağlantıyı metne", "video-to-audio-extractor": "videodan ses çıkarma", "wav-to-mp3-converter": "WAV'ı MP3'e dönüştürme", "youtube-subtitle-downloader": "YouTube altyazısı indirme", "youtube-video-downloader": "YouTube videosu indirme"},
  uk: {"speech-to-text": "мовлення в текст", "voice-to-text": "голос у текст", "audio-to-text": "аудіо в текст", "video-to-text": "відео в текст", "video-link-to-text": "посилання в текст", "video-to-audio-extractor": "витяг аудіо з відео", "wav-to-mp3-converter": "конвертація WAV у MP3", "youtube-subtitle-downloader": "завантажити субтитри YouTube", "youtube-video-downloader": "завантажити відео YouTube"},
  vi: {"speech-to-text": "lời nói thành văn bản", "voice-to-text": "giọng nói thành văn bản", "audio-to-text": "âm thanh thành văn bản", "video-to-text": "video thành văn bản", "video-link-to-text": "liên kết thành văn bản", "video-to-audio-extractor": "trích xuất âm thanh từ video", "wav-to-mp3-converter": "chuyển WAV sang MP3", "youtube-subtitle-downloader": "tải phụ đề YouTube", "youtube-video-downloader": "tải video YouTube"},
  zh: {"speech-to-text": "语音转文字", "voice-to-text": "人声转文字", "audio-to-text": "音频转文字", "video-to-text": "视频转文字", "video-link-to-text": "链接转文字", "video-to-audio-extractor": "从视频提取音频", "wav-to-mp3-converter": "WAV 转 MP3", "youtube-subtitle-downloader": "下载 YouTube 字幕", "youtube-video-downloader": "下载 YouTube 视频"},
  "zh-TW": {"speech-to-text": "語音轉文字", "voice-to-text": "人聲轉文字", "audio-to-text": "音訊轉文字", "video-to-text": "影片轉文字", "video-link-to-text": "連結轉文字", "video-to-audio-extractor": "從影片提取音訊", "wav-to-mp3-converter": "WAV 轉 MP3", "youtube-subtitle-downloader": "下載 YouTube 字幕", "youtube-video-downloader": "下載 YouTube 影片"}
};

export function isCanonicalToolSlug(slug: string) {
  return canonicalToolSlugs.has(slug);
}

function formatTitleTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

function slugTitle(slug: string) {
  return slug.split("-").map((part) => {
    const upper = part.toUpperCase();
    return ["AI", "PDF", "SRT", "TXT", "VTT", "MP3", "MP4", "M4A", "AAC", "AMR", "MKA", "MKV", "MOV", "MPEG", "OGG", "OPUS", "WAV", "WEBM", "WMA", "WMV"].includes(upper)
      ? upper
      : `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`;
  }).join(" ");
}

function capitalizeLocalizedTitle(title: string, locale: Locale) {
  if (["ar", "ja", "ko", "th", "zh", "zh-TW"].includes(locale)) {
    return title;
  }
  return title.charAt(0).toLocaleUpperCase(locale) + title.slice(1);
}

export function getToolPageTitle(slug: string, locale = "en") {
  const safeLocale = isLocale(locale) ? locale : "en";
  const templates = localizedTitleTemplates[safeLocale];
  const language = languageNames[slug];
  if (language) {
    return formatTitleTemplate(templates.language, {language: localizedSupportedLanguageName(language, safeLocale)});
  }
  const format = formatSlugTitles[slug];
  const title = format ? formatTitleTemplate(toTextTitleTemplates[safeLocale], {format}) : localizedToolTitleNames[safeLocale][slug] ?? pageTitles[slug] ?? slugTitle(slug);
  return safeLocale === "en" ? title : formatTitleTemplate(templates.tool, {name: capitalizeLocalizedTitle(title, safeLocale)});
}
