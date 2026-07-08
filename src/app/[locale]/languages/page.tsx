import type {Metadata} from "next";
import {Languages, Sparkles} from "lucide-react";
import {SiteFooter, SiteHeader, PageHero} from "@/components/site-shell";
import {getSupportedLanguagePages} from "@/lib/language-pages";
import {isLocale, type Locale} from "@/lib/locales";

type LanguagesIndexCopy = {
  metaTitle: string;
  eyebrow: string;
  title: string;
  description: string;
  moreTitle: string;
  moreText: string;
};

const languagesIndexCopy: Record<Locale, LanguagesIndexCopy> = {
  ar: {
    metaTitle: "اللغات المدعومة | Votxt",
    eyebrow: "اللغات المدعومة",
    title: "تفريغ الصوت والفيديو بـ 63 لغة",
    description: "اختر دليل لغة للحصول على نصوص دقيقة وترجمات وملخصات وتصديرات من مساحة عمل Votxt نفسها.",
    moreTitle: "أكثر من التفريغ",
    moreText: "بعد إنشاء النص، يمكنك توليد ملخصات وخرائط ذهنية وأسئلة وترجمات وملفات ترجمة ووثائق وروابط مشاركة عامة."
  },
  de: {
    metaTitle: "Unterstützte Sprachen | Votxt",
    eyebrow: "Unterstützte Sprachen",
    title: "Audio und Video in 63 Sprachen transkribieren",
    description: "Wähle einen Sprachleitfaden für präzise Transkripte, Untertitel, Zusammenfassungen, Übersetzungen und Exporte im selben Votxt-Arbeitsbereich.",
    moreTitle: "Mehr als Transkription",
    moreText: "Nach dem Transkript kannst du Zusammenfassungen, Mindmaps, Kernfragen, Übersetzungen, Untertiteldateien, Dokumente und öffentliche Freigabelinks erstellen."
  },
  en: {
    metaTitle: "Supported Languages | Votxt",
    eyebrow: "Supported Languages",
    title: "Transcribe Audio and Video in 63 Languages",
    description: "Choose a language guide for accurate transcripts, subtitles, summaries, translations, and exports from the same Votxt workspace.",
    moreTitle: "More Than Transcription",
    moreText: "After Votxt creates the transcript, you can generate summaries, mind maps, key questions, translations, subtitle files, documents, and public share links."
  },
  es: {
    metaTitle: "Idiomas compatibles | Votxt",
    eyebrow: "Idiomas compatibles",
    title: "Transcribe audio y video en 63 idiomas",
    description: "Elige una guía de idioma para obtener transcripciones, subtítulos, resúmenes, traducciones y exportaciones precisas en el mismo workspace de Votxt.",
    moreTitle: "Más que transcripción",
    moreText: "Después de crear la transcripción, puedes generar resúmenes, mapas mentales, preguntas clave, traducciones, subtítulos, documentos y enlaces públicos."
  },
  fr: {
    metaTitle: "Langues prises en charge | Votxt",
    eyebrow: "Langues prises en charge",
    title: "Transcrivez audio et vidéo dans 63 langues",
    description: "Choisissez un guide de langue pour obtenir transcriptions, sous-titres, résumés, traductions et exports dans le même espace Votxt.",
    moreTitle: "Plus que la transcription",
    moreText: "Après la transcription, générez résumés, cartes mentales, questions clés, traductions, sous-titres, documents et liens de partage publics."
  },
  hu: {
    metaTitle: "Támogatott nyelvek | Votxt",
    eyebrow: "Támogatott nyelvek",
    title: "Hang és videó átírása 63 nyelven",
    description: "Válassz nyelvi útmutatót pontos átiratokhoz, feliratokhoz, összefoglalókhoz, fordításokhoz és exportokhoz ugyanabban a Votxt munkaterületben.",
    moreTitle: "Több mint átírás",
    moreText: "Az átirat elkészülte után összefoglalókat, gondolattérképeket, kulcskérdéseket, fordításokat, feliratokat, dokumentumokat és megosztási linkeket készíthetsz."
  },
  id: {
    metaTitle: "Bahasa yang didukung | Votxt",
    eyebrow: "Bahasa yang didukung",
    title: "Transkripsi audio dan video dalam 63 bahasa",
    description: "Pilih panduan bahasa untuk transkrip, subtitle, ringkasan, terjemahan, dan ekspor yang akurat dari workspace Votxt yang sama.",
    moreTitle: "Lebih dari transkripsi",
    moreText: "Setelah transkrip dibuat, Anda dapat membuat ringkasan, mind map, pertanyaan kunci, terjemahan, file subtitle, dokumen, dan tautan berbagi publik."
  },
  it: {
    metaTitle: "Lingue supportate | Votxt",
    eyebrow: "Lingue supportate",
    title: "Trascrivi audio e video in 63 lingue",
    description: "Scegli una guida linguistica per trascrizioni, sottotitoli, riepiloghi, traduzioni ed esportazioni accurate nello stesso workspace Votxt.",
    moreTitle: "Oltre la trascrizione",
    moreText: "Dopo la trascrizione puoi generare riepiloghi, mappe mentali, domande chiave, traduzioni, sottotitoli, documenti e link pubblici."
  },
  ja: {
    metaTitle: "対応言語 | Votxt",
    eyebrow: "対応言語",
    title: "63 言語で音声と動画を文字起こし",
    description: "同じ Votxt ワークスペースで、正確な文字起こし、字幕、要約、翻訳、エクスポートのための言語ガイドを選べます。",
    moreTitle: "文字起こし以上の機能",
    moreText: "文字起こし後に、要約、マインドマップ、重要な質問、翻訳、字幕ファイル、文書、公開共有リンクを生成できます。"
  },
  ko: {
    metaTitle: "지원 언어 | Votxt",
    eyebrow: "지원 언어",
    title: "63개 언어로 오디오와 비디오 전사",
    description: "같은 Votxt 워크스페이스에서 정확한 전사, 자막, 요약, 번역, 내보내기를 위한 언어 가이드를 선택하세요.",
    moreTitle: "전사 이상의 기능",
    moreText: "전사문이 생성된 뒤 요약, 마인드맵, 핵심 질문, 번역, 자막 파일, 문서, 공개 공유 링크를 만들 수 있습니다."
  },
  nl: {
    metaTitle: "Ondersteunde talen | Votxt",
    eyebrow: "Ondersteunde talen",
    title: "Transcribeer audio en video in 63 talen",
    description: "Kies een taalgids voor nauwkeurige transcripties, ondertitels, samenvattingen, vertalingen en exports vanuit dezelfde Votxt-workspace.",
    moreTitle: "Meer dan transcriptie",
    moreText: "Na de transcriptie kun je samenvattingen, mindmaps, kernvragen, vertalingen, ondertitelbestanden, documenten en openbare deellinks maken."
  },
  pl: {
    metaTitle: "Obsługiwane języki | Votxt",
    eyebrow: "Obsługiwane języki",
    title: "Transkrybuj audio i wideo w 63 językach",
    description: "Wybierz przewodnik językowy dla dokładnych transkrypcji, napisów, podsumowań, tłumaczeń i eksportów w tym samym workspace Votxt.",
    moreTitle: "Więcej niż transkrypcja",
    moreText: "Po utworzeniu transkrypcji możesz generować podsumowania, mapy myśli, kluczowe pytania, tłumaczenia, napisy, dokumenty i publiczne linki."
  },
  pt: {
    metaTitle: "Idiomas suportados | Votxt",
    eyebrow: "Idiomas suportados",
    title: "Transcreva áudio e vídeo em 63 idiomas",
    description: "Escolha um guia de idioma para transcrições, legendas, resumos, traduções e exportações precisas no mesmo workspace Votxt.",
    moreTitle: "Mais que transcrição",
    moreText: "Depois da transcrição, você pode gerar resumos, mapas mentais, perguntas-chave, traduções, legendas, documentos e links públicos."
  },
  ru: {
    metaTitle: "Поддерживаемые языки | Votxt",
    eyebrow: "Поддерживаемые языки",
    title: "Расшифровка аудио и видео на 63 языках",
    description: "Выберите языковой гид для точных расшифровок, субтитров, сводок, переводов и экспортов в одном рабочем пространстве Votxt.",
    moreTitle: "Больше, чем расшифровка",
    moreText: "После создания текста можно получить сводки, интеллект-карты, ключевые вопросы, переводы, субтитры, документы и публичные ссылки."
  },
  th: {
    metaTitle: "ภาษาที่รองรับ | Votxt",
    eyebrow: "ภาษาที่รองรับ",
    title: "ถอดเสียงและวิดีโอได้ 63 ภาษา",
    description: "เลือกคู่มือภาษาเพื่อสร้างข้อความ คำบรรยาย สรุป คำแปล และไฟล์ส่งออกที่แม่นยำจากพื้นที่ทำงาน Votxt เดียวกัน",
    moreTitle: "มากกว่าการถอดเสียง",
    moreText: "หลังจาก Votxt สร้างข้อความแล้ว คุณสามารถสร้างสรุป แผนผังความคิด คำถามสำคัญ คำแปล ไฟล์คำบรรยาย เอกสาร และลิงก์แชร์สาธารณะ"
  },
  tr: {
    metaTitle: "Desteklenen diller | Votxt",
    eyebrow: "Desteklenen diller",
    title: "Ses ve videoyu 63 dilde transkribe edin",
    description: "Aynı Votxt çalışma alanında doğru transkriptler, altyazılar, özetler, çeviriler ve dışa aktarımlar için bir dil rehberi seçin.",
    moreTitle: "Transkripsiyondan fazlası",
    moreText: "Transkript oluşturulduktan sonra özetler, zihin haritaları, kilit sorular, çeviriler, altyazı dosyaları, belgeler ve herkese açık paylaşım linkleri oluşturabilirsiniz."
  },
  uk: {
    metaTitle: "Підтримувані мови | Votxt",
    eyebrow: "Підтримувані мови",
    title: "Транскрибуйте аудіо й відео 63 мовами",
    description: "Оберіть мовний гід для точних транскрипцій, субтитрів, підсумків, перекладів і експортів у тому самому просторі Votxt.",
    moreTitle: "Більше, ніж транскрипція",
    moreText: "Після створення тексту можна генерувати підсумки, ментальні карти, ключові питання, переклади, субтитри, документи й публічні посилання."
  },
  vi: {
    metaTitle: "Ngôn ngữ hỗ trợ | Votxt",
    eyebrow: "Ngôn ngữ hỗ trợ",
    title: "Chép lời audio và video bằng 63 ngôn ngữ",
    description: "Chọn hướng dẫn ngôn ngữ để có bản chép lời, phụ đề, tóm tắt, bản dịch và xuất tệp chính xác trong cùng workspace Votxt.",
    moreTitle: "Hơn cả chép lời",
    moreText: "Sau khi có bản chép lời, bạn có thể tạo tóm tắt, sơ đồ tư duy, câu hỏi chính, bản dịch, tệp phụ đề, tài liệu và liên kết chia sẻ công khai."
  },
  zh: {
    metaTitle: "支持的语言 | Votxt",
    eyebrow: "支持的语言",
    title: "支持 63 种语言的音视频转写",
    description: "选择语言指南，在同一个 Votxt 工作台生成准确转写、字幕、摘要、翻译和导出文件。",
    moreTitle: "不止是转写",
    moreText: "Votxt 创建转写后，你还可以生成摘要、思维导图、关键问题、翻译、字幕文件、文档和公开分享链接。"
  },
  "zh-TW": {
    metaTitle: "支援的語言 | Votxt",
    eyebrow: "支援的語言",
    title: "支援 63 種語言的音影片轉寫",
    description: "選擇語言指南，在同一個 Votxt 工作區產生準確轉寫、字幕、摘要、翻譯和匯出檔。",
    moreTitle: "不只是轉寫",
    moreText: "Votxt 建立轉寫後，你還可以產生摘要、心智圖、關鍵問題、翻譯、字幕檔、文件和公開分享連結。"
  }
};

function getLanguagesCopy(locale: string) {
  return isLocale(locale) ? languagesIndexCopy[locale] : languagesIndexCopy.en;
}

export function generateMetadata({params}: {params: {locale: string}}): Metadata {
  return {
    title: getLanguagesCopy(params.locale).metaTitle
  };
}

export default function LanguagesIndexPage({params}: {params: {locale: string}}) {
  const locale = isLocale(params.locale) ? params.locale : "en";
  const copy = getLanguagesCopy(locale);
  const languagePages = getSupportedLanguagePages(locale);

  return (
    <main className="min-h-screen bg-paper">
      <SiteHeader />
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {languagePages.map((item) => (
            <a key={item.slug} href={`/${locale}/languages/${item.slug}`} className="group rounded-xl border border-ink/10 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-violet/25 hover:shadow-card">
              <Languages size={24} className="text-violet" />
              <h2 className="mt-4 text-xl font-black text-ink group-hover:text-violet">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/62">{item.description}</p>
            </a>
          ))}
        </div>
      </section>
      <section className="border-y border-ink/10 bg-white px-4 py-12 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="flex items-center gap-2 text-3xl font-black tracking-tight text-ink">
            <Sparkles size={25} className="text-violet" />
            {copy.moreTitle}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/65">
            {copy.moreText}
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
