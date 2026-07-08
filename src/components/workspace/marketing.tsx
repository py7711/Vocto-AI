"use client";

import {useMemo, useState} from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Brain,
  CheckCircle2,
  ChevronDown,
  Download,
  FileAudio,
  Info,
  Languages,
  Share2,
  Sparkles,
  Star,
  UploadCloud
} from "lucide-react";
import clsx from "clsx";
import {PricingAction} from "@/components/pricing-actions";
import {getBlogPosts} from "@/lib/blog";
import type {WorkspaceCopy} from "./copy";

type PaidPlan = "BASIC" | "STANDARD" | "PRO";
type OneTimePack = "LITE" | "PLUS";
type PricingMode = "one-time" | "monthly" | "annual";
type PricingFeature = string | {label: string; badge?: string; href?: string; info?: boolean};
type MarketingWorkspaceCopy = WorkspaceCopy &
  Partial<{
    aiPostText: string;
    blog: string;
    exportText: string;
    faqTitle: string;
    homeFaqs: readonly (readonly [string, string])[];
    plansTitle: string;
    workflowExport: string;
    workflowExportText: string;
    workflowTitle: string;
    workflowTranscribe: string;
    workflowTranscribeText: string;
    workflowUpload: string;
    workflowUploadText: string;
  }>;

type PricingPlan = {
  name: string;
  price: string;
  priceSuffix: string;
  quota: string;
  cta: string;
  tagline?: string;
  plan?: PaidPlan;
  pack?: OneTimePack;
  popular?: boolean;
  previousPrice?: string;
  note?: string;
  features: PricingFeature[];
};

const asset = (name: string) => `/votxt-assets/${name}`;

const converterLinks = [
  ["Speech to Text", "l/speech-to-text"],
  ["Voice to Text", "l/voice-to-text"],
  ["Audio to Text", "tools/audio-to-text"],
  ["Video to Text", "l/video-to-text"],
  ["Link to Text", "tools/video-link-to-text"],
  ["MP3 to Text", "l/mp3-to-text"],
  ["MP4 to Text", "l/mp4-to-text-converter"],
  ["FLAC to Text", "l/flac-to-text"],
  ["AMR to Text", "l/amr-to-text"],
  ["WMA to Text", "l/wma-to-text"],
  ["MKV to Text", "l/mkv-to-text"],
  ["WMV to Text", "l/wmv-to-text"]
] as const;

const workflow = [
  {
    title: "Upload or Paste",
    text: "Upload audio and video files from your local device or simply paste an online video link.",
    icon: UploadCloud
  },
  {
    title: "Transcribe to Text",
    text: "Click 'Transcribe' to convert audio or video into accurate, editable text.",
    icon: Brain
  },
  {
    title: "Export or Share",
    text: "Download Word, CSV, PDF, TXT, SRT, and VTT, or create a share link directly.",
    icon: Download
  }
] as const;

const featureBlocks = [
  {
    title: "Convert Audio & Video to Text in Seconds",
    text: "With AI technology, you can quickly turn your audio and video files into text in just a few minutes. It supports 63 languages and a range of common audio and video formats.",
    image: asset("transcription.png"),
    icon: FileAudio
  },
  {
    title: "Generate Summary, Mind Map, Key Points from Audio & Video",
    text: "Automatically create summaries, mind maps, key points, and questions from long recordings so reviews, research, and meetings are easier to understand.",
    image: asset("summary.png"),
    icon: Brain
  },
  {
    title: "Export Transcription or Share Link Directly",
    text: "Export transcription files in the format you need, or share a private link with clients, teammates, classmates, and collaborators.",
    image: asset("export.png"),
    icon: Share2
  }
] as const;

const languages = [
  ["German", "DE"],
  ["English", "EN"],
  ["Spanish", "ES"],
  ["French", "FR"],
  ["Italian", "IT"],
  ["Dutch", "NL"],
  ["Polish", "PL"],
  ["Portuguese", "PT"]
] as const;

const localizedConverterLabels: Record<string, string[]> = {
  ar: ["الكلام إلى نص", "الصوت إلى نص", "الصوتيات إلى نص", "الفيديو إلى نص", "الرابط إلى نص", "MP3 إلى نص", "MP4 إلى نص", "FLAC إلى نص", "AMR إلى نص", "WMA إلى نص", "MKV إلى نص", "WMV إلى نص"],
  de: ["Sprache zu Text", "Stimme zu Text", "Audio zu Text", "Video zu Text", "Link zu Text", "MP3 zu Text", "MP4 zu Text", "FLAC zu Text", "AMR zu Text", "WMA zu Text", "MKV zu Text", "WMV zu Text"],
  en: converterLinks.map(([label]) => label),
  es: ["Voz a texto", "Voz a texto", "Audio a texto", "Video a texto", "Enlace a texto", "MP3 a texto", "MP4 a texto", "FLAC a texto", "AMR a texto", "WMA a texto", "MKV a texto", "WMV a texto"],
  fr: ["Parole en texte", "Voix en texte", "Audio en texte", "Vidéo en texte", "Lien en texte", "MP3 en texte", "MP4 en texte", "FLAC en texte", "AMR en texte", "WMA en texte", "MKV en texte", "WMV en texte"],
  hu: ["Beszéd szöveggé", "Hang szöveggé", "Audio szöveggé", "Videó szöveggé", "Link szöveggé", "MP3 szöveggé", "MP4 szöveggé", "FLAC szöveggé", "AMR szöveggé", "WMA szöveggé", "MKV szöveggé", "WMV szöveggé"],
  id: ["Ucapan ke teks", "Suara ke teks", "Audio ke teks", "Video ke teks", "Tautan ke teks", "MP3 ke teks", "MP4 ke teks", "FLAC ke teks", "AMR ke teks", "WMA ke teks", "MKV ke teks", "WMV ke teks"],
  it: ["Parlato in testo", "Voce in testo", "Audio in testo", "Video in testo", "Link in testo", "MP3 in testo", "MP4 in testo", "FLAC in testo", "AMR in testo", "WMA in testo", "MKV in testo", "WMV in testo"],
  ja: ["音声をテキスト化", "声をテキスト化", "音声ファイルをテキスト化", "動画をテキスト化", "リンクをテキスト化", "MP3 をテキスト化", "MP4 をテキスト化", "FLAC をテキスト化", "AMR をテキスト化", "WMA をテキスト化", "MKV をテキスト化", "WMV をテキスト化"],
  ko: ["음성을 텍스트로", "목소리를 텍스트로", "오디오를 텍스트로", "비디오를 텍스트로", "링크를 텍스트로", "MP3를 텍스트로", "MP4를 텍스트로", "FLAC을 텍스트로", "AMR을 텍스트로", "WMA를 텍스트로", "MKV를 텍스트로", "WMV를 텍스트로"],
  nl: ["Spraak naar tekst", "Stem naar tekst", "Audio naar tekst", "Video naar tekst", "Link naar tekst", "MP3 naar tekst", "MP4 naar tekst", "FLAC naar tekst", "AMR naar tekst", "WMA naar tekst", "MKV naar tekst", "WMV naar tekst"],
  pl: ["Mowa na tekst", "Głos na tekst", "Audio na tekst", "Wideo na tekst", "Link na tekst", "MP3 na tekst", "MP4 na tekst", "FLAC na tekst", "AMR na tekst", "WMA na tekst", "MKV na tekst", "WMV na tekst"],
  pt: ["Fala para texto", "Voz para texto", "Áudio para texto", "Vídeo para texto", "Link para texto", "MP3 para texto", "MP4 para texto", "FLAC para texto", "AMR para texto", "WMA para texto", "MKV para texto", "WMV para texto"],
  ru: ["Речь в текст", "Голос в текст", "Аудио в текст", "Видео в текст", "Ссылка в текст", "MP3 в текст", "MP4 в текст", "FLAC в текст", "AMR в текст", "WMA в текст", "MKV в текст", "WMV в текст"],
  th: ["คำพูดเป็นข้อความ", "เสียงเป็นข้อความ", "ไฟล์เสียงเป็นข้อความ", "วิดีโอเป็นข้อความ", "ลิงก์เป็นข้อความ", "MP3 เป็นข้อความ", "MP4 เป็นข้อความ", "FLAC เป็นข้อความ", "AMR เป็นข้อความ", "WMA เป็นข้อความ", "MKV เป็นข้อความ", "WMV เป็นข้อความ"],
  tr: ["Konuşmayı metne", "Sesi metne", "Audio metne", "Videoyu metne", "Linki metne", "MP3 metne", "MP4 metne", "FLAC metne", "AMR metne", "WMA metne", "MKV metne", "WMV metne"],
  uk: ["Мовлення в текст", "Голос у текст", "Аудіо в текст", "Відео в текст", "Посилання в текст", "MP3 у текст", "MP4 у текст", "FLAC у текст", "AMR у текст", "WMA у текст", "MKV у текст", "WMV у текст"],
  vi: ["Lời nói thành văn bản", "Giọng nói thành văn bản", "Audio thành văn bản", "Video thành văn bản", "Liên kết thành văn bản", "MP3 thành văn bản", "MP4 thành văn bản", "FLAC thành văn bản", "AMR thành văn bản", "WMA thành văn bản", "MKV thành văn bản", "WMV thành văn bản"],
  zh: ["语音转文字", "人声转文字", "音频转文字", "视频转文字", "链接转文字", "MP3 转文字", "MP4 转文字", "FLAC 转文字", "AMR 转文字", "WMA 转文字", "MKV 转文字", "WMV 转文字"],
  "zh-TW": ["語音轉文字", "人聲轉文字", "音訊轉文字", "影片轉文字", "連結轉文字", "MP3 轉文字", "MP4 轉文字", "FLAC 轉文字", "AMR 轉文字", "WMA 轉文字", "MKV 轉文字", "WMV 轉文字"]
};

const localizedMarketingSections: Record<string, {convertTitle: string; featureTitles: string[]; languageTitle: string; languageText: string; seeAllLanguages: string; reviewExcellent: string; reviewRating: string}> = {
  ar: {convertTitle: "محولات صوت وفيديو إلى نص أخرى", featureTitles: ["حوّل الصوت والفيديو إلى نص خلال ثوانٍ", "أنشئ ملخصاً وخريطة ذهنية ونقاطاً رئيسية", "صدّر التفريغ أو شارك الرابط مباشرة"], languageTitle: "اللغات المدعومة", languageText: "فيما يلي أهم اللغات التي ندعمها للتفريغ والترجمات.", seeAllLanguages: "عرض كل اللغات", reviewExcellent: "ممتاز", reviewRating: "4.8 من 5 على Trustpilot"},
  de: {convertTitle: "Weitere Audio- und Video-zu-Text-Konverter", featureTitles: ["Audio und Video in Sekunden in Text umwandeln", "Zusammenfassung, Mindmap und Kernpunkte erstellen", "Transkript exportieren oder Link direkt teilen"], languageTitle: "Unterstützte Sprachen", languageText: "Dies sind die wichtigsten Sprachen, die wir für Transkription und Untertitel unterstützen.", seeAllLanguages: "Alle Sprachen ansehen", reviewExcellent: "Ausgezeichnet", reviewRating: "4,8 von 5 auf Trustpilot"},
  en: {convertTitle: "More Audio&Video to Text Converters", featureTitles: featureBlocks.map((item) => item.title), languageTitle: "Supported Languages", languageText: "Below are the main languages we support for transcription and subtitles", seeAllLanguages: "See all languages", reviewExcellent: "Excellent", reviewRating: "4.8 out of 5 on Trustpilot"},
  es: {convertTitle: "Más convertidores de audio y video a texto", featureTitles: ["Convierte audio y video en texto en segundos", "Genera resumen, mapa mental y puntos clave", "Exporta la transcripción o comparte un enlace"], languageTitle: "Idiomas compatibles", languageText: "Estos son los principales idiomas compatibles para transcripción y subtítulos.", seeAllLanguages: "Ver todos los idiomas", reviewExcellent: "Excelente", reviewRating: "4,8 de 5 en Trustpilot"},
  fr: {convertTitle: "Autres convertisseurs audio et vidéo en texte", featureTitles: ["Convertir audio et vidéo en texte en quelques secondes", "Générer résumé, carte mentale et points clés", "Exporter la transcription ou partager un lien"], languageTitle: "Langues prises en charge", languageText: "Voici les principales langues prises en charge pour la transcription et les sous-titres.", seeAllLanguages: "Voir toutes les langues", reviewExcellent: "Excellent", reviewRating: "4,8 sur 5 sur Trustpilot"},
  hu: {convertTitle: "További audio és videó szöveggé alakítók", featureTitles: ["Hang és videó szöveggé másodpercek alatt", "Összefoglaló, gondolattérkép és fő pontok", "Átirat exportálása vagy link megosztása"], languageTitle: "Támogatott nyelvek", languageText: "Ezek a fő nyelvek, amelyeket átíráshoz és feliratokhoz támogatunk.", seeAllLanguages: "Összes nyelv", reviewExcellent: "Kiváló", reviewRating: "4,8/5 a Trustpiloton"},
  id: {convertTitle: "Konverter audio dan video ke teks lainnya", featureTitles: ["Ubah audio dan video menjadi teks dalam hitungan detik", "Buat ringkasan, mind map, dan poin kunci", "Ekspor transkrip atau bagikan tautan"], languageTitle: "Bahasa yang didukung", languageText: "Berikut bahasa utama yang didukung untuk transkripsi dan subtitle.", seeAllLanguages: "Lihat semua bahasa", reviewExcellent: "Luar biasa", reviewRating: "4,8 dari 5 di Trustpilot"},
  it: {convertTitle: "Altri convertitori audio e video in testo", featureTitles: ["Converti audio e video in testo in pochi secondi", "Genera riepilogo, mappa mentale e punti chiave", "Esporta la trascrizione o condividi un link"], languageTitle: "Lingue supportate", languageText: "Di seguito le principali lingue supportate per trascrizione e sottotitoli.", seeAllLanguages: "Vedi tutte le lingue", reviewExcellent: "Eccellente", reviewRating: "4,8 su 5 su Trustpilot"},
  ja: {convertTitle: "その他の音声・動画テキスト変換", featureTitles: ["音声と動画を数秒でテキスト化", "要約、マインドマップ、重要ポイントを生成", "文字起こしをエクスポートまたはリンク共有"], languageTitle: "対応言語", languageText: "文字起こしと字幕で主に対応している言語です。", seeAllLanguages: "すべての言語を見る", reviewExcellent: "優秀", reviewRating: "Trustpilot で 5 点中 4.8"},
  ko: {convertTitle: "더 많은 오디오/비디오 텍스트 변환기", featureTitles: ["오디오와 비디오를 몇 초 만에 텍스트로 변환", "요약, 마인드맵, 핵심 포인트 생성", "전사문 내보내기 또는 링크 공유"], languageTitle: "지원 언어", languageText: "전사와 자막에서 주로 지원되는 언어입니다.", seeAllLanguages: "모든 언어 보기", reviewExcellent: "우수", reviewRating: "Trustpilot 평점 5점 만점에 4.8"},
  nl: {convertTitle: "Meer audio- en video-naar-tekstconverters", featureTitles: ["Audio en video in seconden naar tekst", "Maak samenvatting, mindmap en kernpunten", "Exporteer transcript of deel een link"], languageTitle: "Ondersteunde talen", languageText: "Dit zijn de belangrijkste talen voor transcriptie en ondertitels.", seeAllLanguages: "Alle talen bekijken", reviewExcellent: "Uitstekend", reviewRating: "4,8 van 5 op Trustpilot"},
  pl: {convertTitle: "Więcej konwerterów audio i wideo na tekst", featureTitles: ["Zamień audio i wideo na tekst w kilka sekund", "Generuj podsumowanie, mapę myśli i kluczowe punkty", "Eksportuj transkrypcję lub udostępnij link"], languageTitle: "Obsługiwane języki", languageText: "Oto główne języki obsługiwane dla transkrypcji i napisów.", seeAllLanguages: "Zobacz wszystkie języki", reviewExcellent: "Znakomity", reviewRating: "4,8 z 5 na Trustpilot"},
  pt: {convertTitle: "Mais conversores de áudio e vídeo para texto", featureTitles: ["Converta áudio e vídeo em texto em segundos", "Gere resumo, mapa mental e pontos-chave", "Exporte a transcrição ou compartilhe um link"], languageTitle: "Idiomas suportados", languageText: "Estes são os principais idiomas suportados para transcrição e legendas.", seeAllLanguages: "Ver todos os idiomas", reviewExcellent: "Excelente", reviewRating: "4,8 de 5 no Trustpilot"},
  ru: {convertTitle: "Другие конвертеры аудио и видео в текст", featureTitles: ["Преобразуйте аудио и видео в текст за секунды", "Создавайте сводки, интеллект-карты и ключевые пункты", "Экспортируйте расшифровку или делитесь ссылкой"], languageTitle: "Поддерживаемые языки", languageText: "Основные языки, поддерживаемые для расшифровки и субтитров.", seeAllLanguages: "Все языки", reviewExcellent: "Отлично", reviewRating: "4,8 из 5 на Trustpilot"},
  th: {convertTitle: "ตัวแปลงเสียงและวิดีโอเป็นข้อความเพิ่มเติม", featureTitles: ["แปลงเสียงและวิดีโอเป็นข้อความในไม่กี่วินาที", "สร้างสรุป แผนผังความคิด และประเด็นสำคัญ", "ส่งออกข้อความหรือแชร์ลิงก์โดยตรง"], languageTitle: "ภาษาที่รองรับ", languageText: "นี่คือภาษาหลักที่รองรับสำหรับการถอดเสียงและคำบรรยาย", seeAllLanguages: "ดูทุกภาษา", reviewExcellent: "ยอดเยี่ยม", reviewRating: "4.8 จาก 5 บน Trustpilot"},
  tr: {convertTitle: "Daha fazla ses ve video metin dönüştürücü", featureTitles: ["Ses ve videoyu saniyeler içinde metne dönüştürün", "Özet, zihin haritası ve kilit noktalar oluşturun", "Transkripti dışa aktarın veya bağlantı paylaşın"], languageTitle: "Desteklenen diller", languageText: "Transkripsiyon ve altyazı için desteklenen başlıca diller.", seeAllLanguages: "Tüm dilleri gör", reviewExcellent: "Mükemmel", reviewRating: "Trustpilot'ta 5 üzerinden 4,8"},
  uk: {convertTitle: "Інші конвертери аудіо й відео в текст", featureTitles: ["Перетворюйте аудіо й відео на текст за секунди", "Створюйте підсумки, ментальні карти й ключові пункти", "Експортуйте транскрипцію або діліться посиланням"], languageTitle: "Підтримувані мови", languageText: "Основні мови, які ми підтримуємо для транскрипції та субтитрів.", seeAllLanguages: "Усі мови", reviewExcellent: "Відмінно", reviewRating: "4,8 із 5 на Trustpilot"},
  vi: {convertTitle: "Thêm công cụ chuyển âm thanh và video thành văn bản", featureTitles: ["Chuyển audio và video thành văn bản trong vài giây", "Tạo tóm tắt, sơ đồ tư duy và ý chính", "Xuất bản chép lời hoặc chia sẻ liên kết"], languageTitle: "Ngôn ngữ hỗ trợ", languageText: "Đây là các ngôn ngữ chính được hỗ trợ cho chép lời và phụ đề.", seeAllLanguages: "Xem tất cả ngôn ngữ", reviewExcellent: "Xuất sắc", reviewRating: "4,8 trên 5 trên Trustpilot"},
  zh: {convertTitle: "更多音视频转文字转换器", featureTitles: ["快速将音频和视频转成文字", "生成摘要、思维导图和关键要点", "直接导出转写或分享链接"], languageTitle: "支持的语言", languageText: "以下是转写和字幕支持的主要语言。", seeAllLanguages: "查看全部语言", reviewExcellent: "优秀", reviewRating: "Trustpilot 评分 4.8/5"},
  "zh-TW": {convertTitle: "更多音影片轉文字轉換器", featureTitles: ["快速將音訊和影片轉成文字", "產生摘要、心智圖和關鍵重點", "直接匯出轉寫或分享連結"], languageTitle: "支援的語言", languageText: "以下是轉寫和字幕支援的主要語言。", seeAllLanguages: "查看全部語言", reviewExcellent: "優秀", reviewRating: "Trustpilot 評分 4.8/5"}
};

const localizedMarketingUi: Record<string, {bestPracticesTitle: string; moreInformation: string; reviewsText: string; reviewsTitle: string; showMore: string}> = {
  ar: {bestPracticesTitle: "أفضل ممارسات تفريغ الصوت والفيديو", moreInformation: "مزيد من المعلومات", reviewsText: "ساعد Votxt المستخدمين على تحويل التسجيلات القصيرة والطويلة إلى نصوص قابلة للعمل.", reviewsTitle: "ماذا يقول مستخدمونا", showMore: "عرض المزيد"},
  de: {bestPracticesTitle: "Best Practices für Audio- und Video-Transkription", moreInformation: "Weitere Informationen", reviewsText: "Votxt hilft bei kurzen Sprachnotizen ebenso wie bei langen Aufnahmen.", reviewsTitle: "Was unsere Nutzer sagen", showMore: "Mehr anzeigen"},
  en: {bestPracticesTitle: "Best Practices for Audio & Video Transcription", moreInformation: "More information", reviewsText: "Votxt has helped people transcribe 52,272,840 minutes of audio and video, from short voice notes to long-form recordings.", reviewsTitle: "What Our Users Say", showMore: "Show More"},
  es: {bestPracticesTitle: "Buenas prácticas para transcribir audio y video", moreInformation: "Más información", reviewsText: "Votxt ayuda a convertir notas de voz cortas y grabaciones largas en texto útil.", reviewsTitle: "Lo que dicen nuestros usuarios", showMore: "Ver más"},
  fr: {bestPracticesTitle: "Bonnes pratiques de transcription audio et vidéo", moreInformation: "Plus d'informations", reviewsText: "Votxt aide à transformer notes vocales et longs enregistrements en texte exploitable.", reviewsTitle: "Ce que disent nos utilisateurs", showMore: "Voir plus"},
  hu: {bestPracticesTitle: "Hang- és videóátírási bevált gyakorlatok", moreInformation: "További információ", reviewsText: "A Votxt rövid hangjegyzetekből és hosszú felvételekből is használható szöveget készít.", reviewsTitle: "Mit mondanak a felhasználók", showMore: "Továbbiak"},
  id: {bestPracticesTitle: "Praktik terbaik transkripsi audio dan video", moreInformation: "Informasi selengkapnya", reviewsText: "Votxt membantu mengubah catatan suara pendek dan rekaman panjang menjadi teks yang siap dipakai.", reviewsTitle: "Apa kata pengguna kami", showMore: "Tampilkan lagi"},
  it: {bestPracticesTitle: "Buone pratiche per trascrivere audio e video", moreInformation: "Maggiori informazioni", reviewsText: "Votxt aiuta a trasformare note vocali brevi e registrazioni lunghe in testo utilizzabile.", reviewsTitle: "Cosa dicono gli utenti", showMore: "Mostra altro"},
  ja: {bestPracticesTitle: "音声・動画文字起こしのベストプラクティス", moreInformation: "詳細情報", reviewsText: "Votxt は短い音声メモから長時間の録音まで、使いやすいテキスト化を支援します。", reviewsTitle: "ユーザーの声", showMore: "もっと見る"},
  ko: {bestPracticesTitle: "오디오 및 비디오 전사 모범 사례", moreInformation: "자세히 보기", reviewsText: "Votxt는 짧은 음성 메모부터 긴 녹음까지 바로 쓸 수 있는 텍스트로 바꿔 줍니다.", reviewsTitle: "사용자 후기", showMore: "더 보기"},
  nl: {bestPracticesTitle: "Best practices voor audio- en videotranscriptie", moreInformation: "Meer informatie", reviewsText: "Votxt helpt korte spraaknotities en lange opnames om te zetten in bruikbare tekst.", reviewsTitle: "Wat gebruikers zeggen", showMore: "Meer tonen"},
  pl: {bestPracticesTitle: "Dobre praktyki transkrypcji audio i wideo", moreInformation: "Więcej informacji", reviewsText: "Votxt pomaga zamieniać krótkie notatki głosowe i długie nagrania w użyteczny tekst.", reviewsTitle: "Co mówią użytkownicy", showMore: "Pokaż więcej"},
  pt: {bestPracticesTitle: "Boas práticas para transcrição de áudio e vídeo", moreInformation: "Mais informações", reviewsText: "Votxt ajuda a transformar notas de voz curtas e gravações longas em texto útil.", reviewsTitle: "O que os usuários dizem", showMore: "Ver mais"},
  ru: {bestPracticesTitle: "Лучшие практики расшифровки аудио и видео", moreInformation: "Подробнее", reviewsText: "Votxt помогает превращать короткие голосовые заметки и длинные записи в полезный текст.", reviewsTitle: "Что говорят пользователи", showMore: "Показать больше"},
  th: {bestPracticesTitle: "แนวทางที่ดีสำหรับการถอดเสียงและวิดีโอ", moreInformation: "ข้อมูลเพิ่มเติม", reviewsText: "Votxt ช่วยเปลี่ยนบันทึกเสียงสั้นและไฟล์ยาวให้เป็นข้อความที่ใช้งานได้", reviewsTitle: "เสียงจากผู้ใช้", showMore: "ดูเพิ่มเติม"},
  tr: {bestPracticesTitle: "Ses ve video transkripsiyonu için iyi uygulamalar", moreInformation: "Daha fazla bilgi", reviewsText: "Votxt kısa ses notlarını ve uzun kayıtları kullanışlı metne dönüştürmeye yardımcı olur.", reviewsTitle: "Kullanıcılarımız ne söylüyor", showMore: "Daha fazla göster"},
  uk: {bestPracticesTitle: "Найкращі практики транскрипції аудіо й відео", moreInformation: "Докладніше", reviewsText: "Votxt допомагає перетворювати короткі голосові нотатки й довгі записи на корисний текст.", reviewsTitle: "Що кажуть користувачі", showMore: "Показати більше"},
  vi: {bestPracticesTitle: "Thực hành tốt khi phiên âm audio và video", moreInformation: "Thông tin thêm", reviewsText: "Votxt giúp biến ghi chú thoại ngắn và bản ghi dài thành văn bản dễ sử dụng.", reviewsTitle: "Người dùng nói gì", showMore: "Xem thêm"},
  zh: {bestPracticesTitle: "音视频转写最佳实践", moreInformation: "更多信息", reviewsText: "Votxt 已帮助用户把短语音和长录音转成可直接使用的文字。", reviewsTitle: "用户评价", showMore: "查看更多"},
  "zh-TW": {bestPracticesTitle: "音影片轉寫最佳實踐", moreInformation: "更多資訊", reviewsText: "Votxt 已協助使用者把短語音和長錄音轉成可直接使用的文字。", reviewsTitle: "使用者評價", showMore: "查看更多"}
};

const reviews = [
  ["AN", "Anikó", "Accurate transcription even in Hungarian, the best app in its league I have tried so far."],
  ["KA", "Karen", "It is exactly what I'm looking for. It is quick and simple with a nice vibe."],
  ["BR", "BrrGrrDelux", "I've used it several times since and the accuracy and quality have been amazing each time. Thank you!"],
  ["RE", "reem", "They did just like I wanted! Amazing, must try!"],
  ["LL", "Lucas Leone Dos Santos", "Praticidade e velocidade. There are small writing errors, but nothing that compromises the result."],
  ["JA", "Jason", "Easy to use. No extra steps. You did what you said you were going to do. Thank you."]
] as const;

const planFeatureKeys = [
  "feature.fileLimit",
  "feature.noDailyLimit",
  "feature.premiumModel",
  "feature.languages",
  "feature.aiTranslation",
  "feature.exportFormats",
  "feature.enhancedInsights",
  "feature.youtubeTranscription",
  "feature.speakerIdentification",
  "feature.apiAccess",
  "feature.bulkTranscription",
  "feature.noRetention",
  "feature.prioritySupport"
] as const;

function buildPricingModes(copy: MarketingWorkspaceCopy): Record<PricingMode, {label: string; badge?: string; plans: PricingPlan[]}> {
  const pricing = copy.dashboardPricing;
  const text = pricing.text as Record<string, string>;
  const badgeNew = pricing.badges.New;
  const paidPlanFeatures: PricingFeature[] = planFeatureKeys.map((key) => {
    const label = text[key] ?? key;
    if (key === "feature.aiTranslation" || key === "feature.enhancedInsights") return {label, badge: badgeNew, info: true};
    if (key === "feature.apiAccess") return {label, href: "/docs"};
    return label;
  });
  const freePlanFeatures: PricingFeature[] = [
    `${copy.monthlyMinutes}: 120`,
    `${copy.dailyFiles}: 3`,
    text["feature.languages"],
    {label: text["feature.aiTranslation"], badge: badgeNew, info: true},
    text["feature.exportFormats"],
    {label: text["feature.enhancedInsights"], badge: badgeNew, info: true}
  ].filter(Boolean) as PricingFeature[];

  return {
    "one-time": {
      label: pricing.modes["one-time"].label,
      plans: [
        {name: text.Lite, tagline: text["tagline.lite"], price: "$12.9", priceSuffix: text["suffix.oneTime"], quota: text["quota.total.300"], cta: text["cta.buy"], pack: "LITE", features: [text["feature.validity90"], ...paidPlanFeatures]},
        {name: text.Plus, tagline: text["tagline.plus"], price: "$19.9", priceSuffix: text["suffix.oneTime"], quota: text["quota.total.600"], cta: text["cta.buy"], pack: "PLUS", popular: true, features: [text["feature.validity90"], ...paidPlanFeatures]}
      ]
    },
    monthly: {
      label: pricing.modes.monthly.label,
      plans: [
        {name: copy.freePlan, tagline: copy.freeSignup, price: "$0", priceSuffix: text["suffix.month"], quota: `${copy.monthlyMinutes}: 120`, cta: copy.freeSignup, features: freePlanFeatures},
        {name: text.Basic, tagline: text["tagline.basic"], price: "$10", priceSuffix: text["suffix.month"], quota: text["quota.month.1200"], cta: text["cta.subscribe"], plan: "BASIC", features: [text["extra.10.500"], ...paidPlanFeatures]},
        {name: text.Standard, tagline: text["tagline.standard"], price: "$20", priceSuffix: text["suffix.month"], quota: text["quota.month.3000"], cta: text["cta.subscribe"], plan: "STANDARD", popular: true, features: [text["extra.15.1000"], ...paidPlanFeatures]},
        {name: text.Pro, tagline: text["tagline.pro"], price: "$30", priceSuffix: text["suffix.month"], quota: text["quota.month.6000"], cta: text["cta.subscribe"], plan: "PRO", features: [text["extra.20.3000"], ...paidPlanFeatures]}
      ]
    },
    annual: {
      label: pricing.modes.annual.label,
      badge: pricing.modes.annual.badge,
      plans: [
        {name: copy.freePlan, tagline: copy.freeSignup, price: "$0", priceSuffix: text["suffix.month"], quota: `${copy.monthlyMinutes}: 120`, cta: copy.freeSignup, features: freePlanFeatures},
        {name: text.Basic, tagline: text["tagline.basic"], price: "$6", previousPrice: "$10", note: text["note.annual.72"], priceSuffix: text["suffix.month"], quota: text["quota.month.1200"], cta: text["cta.subscribe"], plan: "BASIC", features: [text["extra.10.500"], ...paidPlanFeatures]},
        {name: text.Standard, tagline: text["tagline.standard"], price: "$12", previousPrice: "$20", note: text["note.annual.144"], priceSuffix: text["suffix.month"], quota: text["quota.month.3000"], cta: text["cta.subscribe"], plan: "STANDARD", popular: true, features: [text["extra.15.1000"], ...paidPlanFeatures]},
        {name: text.Pro, tagline: text["tagline.pro"], price: "$18", previousPrice: "$30", note: text["note.annual.216"], priceSuffix: text["suffix.month"], quota: text["quota.month.6000"], cta: text["cta.subscribe"], plan: "PRO", features: [text["extra.20.3000"], ...paidPlanFeatures]}
      ]
    }
  };
}

const faqs = [
  ["Can I try the service for free?", "Yes. The Free plan includes 120 minutes per month, up to 3 files per day, 30 minutes per file, standard transcription, translation, exports, and limited AI insights."],
  ["Which audio/video formats do you support?", "Audio formats include aac, amr, awb, flac, m4a, mka, mp2, mp3, oga, ogg, opus, wav, weba, webm, and wma. Video formats include 3gp, mkv, mov, mp4, mpg, ts, webm, and wmv."],
  ["Can I upload large files?", "Paid plans allow files up to 10 hours long and 5 GB, with up to 50 files uploaded at a time."],
  ["Can I export my transcript?", "Yes. Votxt supports Word, CSV, PDF, TXT, SRT, and VTT export formats."],
  ["Which languages does Votxt support for transcription?", "Votxt supports transcription in 63 languages."],
  ["How soon can I expect my transcription results?", "Most files finish quickly. The exact time depends on file duration, size, provider, and queue load."],
  ["Are my payments secure with Votxt?", "Payments are handled through secure checkout and subscription billing flows, with card and crypto payment support through Stripe."],
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
] as const;

function SectionTitle({title, text}: {title: string; text?: string}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">{title}</h2>
      {text ? <p className="mt-4 text-base leading-7 text-slate-500">{text}</p> : null}
    </div>
  );
}

function StarRow() {
  return (
    <span className="inline-flex items-center gap-0.5 text-[#00b87a]">
      {Array.from({length: 5}).map((_, index) => (
        <Star key={index} size={17} className="fill-current" />
      ))}
    </span>
  );
}

function PricingFeatureLabel({feature, moreInfoLabel}: {feature: PricingFeature; moreInfoLabel: string}) {
  if (typeof feature === "string") {
    return <>{feature}</>;
  }

  const label = feature.href ? (
    <a href={feature.href} className="text-slate-700 underline decoration-slate-300 underline-offset-2 transition hover:text-primary hover:decoration-primary/40">
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
          aria-label={moreInfoLabel}
          className="inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1"
        >
          <Info className="h-3.5 w-3.5 text-slate-400" />
        </button>
      ) : null}
      {feature.badge ? <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium leading-none text-primary">{feature.badge}</span> : null}
    </span>
  );
}

export function ProductSections({copy, locale}: {t: (key: string) => string; copy: WorkspaceCopy; locale: string}) {
  const [pricingMode, setPricingMode] = useState<PricingMode>("one-time");
  const [openFaq, setOpenFaq] = useState(0);
  const posts = useMemo(() => getBlogPosts(locale).slice(0, 6), [locale]);
  const marketingCopy = copy as MarketingWorkspaceCopy;
  const localizedPricingModes = useMemo(() => buildPricingModes(marketingCopy), [marketingCopy]);
  const activePricing = localizedPricingModes[pricingMode];
  const localizedFaqs = marketingCopy.homeFaqs ?? faqs;
  const localeText = localizedMarketingSections[locale] ?? localizedMarketingSections.en;
  const uiText = localizedMarketingUi[locale] ?? localizedMarketingUi.en;
  const converterLabels = localizedConverterLabels[locale] ?? copy.converters ?? localizedConverterLabels.en;
  const localizedWorkflow = [
    {title: marketingCopy.workflowUpload ?? workflow[0].title, text: marketingCopy.workflowUploadText ?? workflow[0].text, icon: UploadCloud},
    {title: marketingCopy.workflowTranscribe ?? workflow[1].title, text: marketingCopy.workflowTranscribeText ?? workflow[1].text, icon: Brain},
    {title: marketingCopy.workflowExport ?? workflow[2].title, text: marketingCopy.workflowExportText ?? workflow[2].text, icon: Download}
  ];
  const localizedFeatureBlocks = featureBlocks.map((item, index) => ({
    ...item,
    title: localeText.featureTitles[index] ?? item.title,
    text: index === 0 ? copy.marketingIntro : index === 1 ? marketingCopy.aiPostText ?? item.text : marketingCopy.exportText ?? item.text
  }));

  return (
    <>
      <section id="features" className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle title={marketingCopy.workflowTitle ?? "How to Convert Audio & Video to Text"} />
        <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3 md:gap-10 lg:gap-12">
          {localizedWorkflow.map((item, index) => (
            <article key={item.title} className="relative rounded-lg border border-slate-200 bg-white px-5 py-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:px-6 sm:py-5">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <item.icon size={24} />
              </span>
              <h3 className="mt-4 text-lg font-semibold leading-6 text-ink">{item.title}</h3>
              <p className="mx-auto mt-2 max-w-[21rem] text-sm leading-6 text-slate-500">{item.text}</p>
              {index < localizedWorkflow.length - 1 ? (
                <span aria-hidden="true" className="pointer-events-none absolute left-[calc(100%+0.25rem)] top-1/2 z-10 hidden h-4 w-10 -translate-y-1/2 md:block lg:w-12">
                  <span className="absolute left-0 top-1/2 h-0 w-8 -translate-y-1/2 border-t-2 border-dashed border-primary lg:w-10" />
                  <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-primary" />
                </span>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-lavender px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle title={localeText.convertTitle} />
        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {converterLinks.map(([, href], index) => (
            <a
              key={href}
              href={`/${locale}/${href}`}
              className="flex min-h-[52px] items-center justify-center rounded-lg border border-primary/25 bg-white/95 px-4 text-center text-sm font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-primary/45 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-lavender sm:min-h-[56px]"
            >
              {converterLabels[index] ?? localizedConverterLabels.en[index]}
            </a>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-12">
          {localizedFeatureBlocks.map((item, index) => (
            <article key={item.title} className={clsx("grid gap-8 lg:grid-cols-2 lg:items-center", index % 2 === 1 && "lg:[&>div:first-child]:order-2")}>
              <div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
                  <item.icon size={24} />
                </span>
                <h2 className="mt-5 text-3xl font-bold leading-tight text-ink">{item.title}</h2>
                <p className="mt-4 text-base leading-7 text-slate-500">{item.text}</p>
                <a href={`/${locale}/auth/signin`} className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
                  {copy.freeSignup}
                  <Sparkles size={16} />
                </a>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-2xl">
                <Image src={item.image} alt={item.title} width={1440} height={960} className="h-auto w-full" sizes="(min-width: 1024px) 50vw, 100vw" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle title={localeText.languageTitle} text={localeText.languageText} />
        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {languages.map(([name, code]) => (
            <a key={name} href={`/${locale}/languages/transcribe-${name.toLowerCase()}-audio`} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary">
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">{code}</span>
                <span className="font-semibold">{name}</span>
              </span>
              <Languages size={18} className="text-slate-400" />
            </a>
          ))}
        </div>
        <div className="mt-7 text-center">
          <a href={`/${locale}/languages`} className="inline-flex items-center rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary">
            {localeText.seeAllLanguages}
          </a>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          title={uiText.reviewsTitle}
          text={uiText.reviewsText}
        />
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold">
          <span>{localeText.reviewExcellent}</span>
          <StarRow />
          <span>{localeText.reviewRating}</span>
        </div>
        <div className="mx-auto mt-10 columns-1 gap-5 md:columns-2 lg:columns-3">
          {reviews.map(([initials, name, text]) => (
            <a key={`${initials}-${name}`} href="https://www.trustpilot.com/review/votxt.co" className="mb-5 inline-block w-full break-inside-avoid rounded-lg border border-slate-200 bg-card p-6 text-left shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{initials}</span>
                <div>
                  <p className="font-semibold text-ink">{name}</p>
                  <StarRow />
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{text}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="subscription-price" className="px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle title={marketingCopy.plansTitle ?? marketingCopy.viewFullPricing ?? "Affordable Pricing"} text={marketingCopy.marketingIntro} />
        <div role="tablist" aria-label={copy.dashboardPricing.billingOptions} className="mx-auto mt-8 grid w-full max-w-[504px] grid-cols-3 gap-0 rounded-lg border border-slate-200 bg-slate-100 p-1 text-sm font-medium shadow-sm">
          {(Object.keys(localizedPricingModes) as PricingMode[]).map((mode) => {
            const option = localizedPricingModes[mode];
            const active = pricingMode === mode;
            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPricingMode(mode)}
                className={clsx("inline-flex min-h-8 items-center justify-center rounded-md px-3 py-1.5 transition", active ? "bg-white text-ink shadow-soft" : "text-slate-600 hover:bg-white/70 hover:text-ink")}
              >
                {option.label}
                {option.badge ? <span className="ml-1 inline-flex rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-semibold leading-3 text-white">{option.badge}</span> : null}
              </button>
            );
          })}
        </div>
        <div className={clsx("mx-auto mt-8 grid max-w-7xl gap-4", pricingMode === "one-time" ? "md:max-w-3xl md:grid-cols-2" : "lg:grid-cols-4")}>
          {activePricing.plans.map((plan) => (
            <article key={plan.name} className={clsx("relative flex flex-col rounded-lg bg-card p-6 shadow-sm transition hover:-translate-y-1", plan.popular ? "border-2 border-primary shadow-glow" : "border border-slate-200 hover:shadow-md")}>
              {plan.popular ? <span className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">{copy.dashboardPricing.mostPopular}</span> : null}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-ink">{plan.name}</h3>
                  <p className="mt-2 text-sm leading-5 text-slate-500">{plan.tagline ?? plan.quota}</p>
                </div>
                <BadgeCheck className="shrink-0 text-primary" size={21} />
              </div>
              <div className="mt-5">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="ml-2 text-sm text-slate-500">{plan.priceSuffix}</span>
              </div>
              {plan.previousPrice ? (
                <p className="mt-2 text-sm font-medium text-slate-500">
                  <span className="line-through">{plan.previousPrice}</span>
                  {plan.note ? <span className="ml-2">{plan.note}</span> : null}
                </p>
              ) : null}
              <p className="mt-4 text-sm font-semibold text-primary">{plan.quota}</p>
              <div className="mt-5 grid flex-1 gap-2">
                {plan.features.slice(0, pricingMode === "one-time" ? 12 : 14).map((feature) => {
                  const key = typeof feature === "string" ? feature : feature.label;
                  return (
                    <p key={key} className="flex items-start gap-2 text-sm leading-5 text-slate-600">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                      <PricingFeatureLabel feature={feature} moreInfoLabel={uiText.moreInformation} />
                    </p>
                  );
                })}
              </div>
              <PricingAction plan={plan.plan} pack={plan.pack} label={plan.cta} mode={pricingMode} />
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle title={marketingCopy.faqTitle ?? copy.dashboardPricing.faqTitle} />
        <div className="mx-auto mt-8 max-w-4xl divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {localizedFaqs.map(([question, answer], index) => {
            const active = openFaq === index;
            return (
              <article key={question}>
                <button type="button" onClick={() => setOpenFaq(active ? -1 : index)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium transition hover:bg-slate-50 md:text-lg" aria-expanded={active}>
                  <span>{question}</span>
                  <ChevronDown size={18} className={clsx("shrink-0 transition", active && "rotate-180")} />
                </button>
                {active ? <p className="px-5 pb-5 text-sm leading-6 text-slate-600">{answer}</p> : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle title={uiText.bestPracticesTitle} />
        <div className="mx-auto mt-10 grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <a key={post.slug} href={`/${locale}/blog/${post.slug}`} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/10 via-white to-[#00b87a]/10">
                <Image src={post.coverImage} alt={post.coverAlt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-500">{post.date}</p>
                <h3 className="mt-2 text-lg font-semibold leading-snug text-ink transition group-hover:text-primary">{post.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{post.excerpt}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-9 text-center">
          <a href={`/${locale}/blog`} className="inline-flex items-center rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
            {uiText.showMore}
          </a>
        </div>
      </section>
    </>
  );
}
