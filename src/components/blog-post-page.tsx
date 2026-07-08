import {notFound} from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {getBlogPost, type BlogContentBlock, type BlogPost} from "@/lib/blog";
import {isLocale, type Locale} from "@/lib/locales";
import {SiteFooter, SiteHeader} from "@/components/site-shell";

type BlogPostPageCopy = {
  authorFallback: string;
  tocTitle: string;
  ctaTitle: string;
  ctaBullets: string[];
  ctaButton: string;
};

const blogPostPageCopy: Record<Locale, BlogPostPageCopy> = {
  ar: {
    authorFallback: "فريق Votxt",
    tocTitle: "جدول المحتويات",
    ctaTitle: "حوّل الصوت والفيديو إلى نص مجاناً عبر الإنترنت",
    ctaBullets: ["يحوّل ملفات الصوت والفيديو إلى نص دقيق خلال ثوانٍ.", "ينشئ ملخصات وخرائط ذهنية وأسئلة رئيسية."],
    ctaButton: "ابدأ مجاناً"
  },
  de: {
    authorFallback: "Votxt Team",
    tocTitle: "Inhaltsverzeichnis",
    ctaTitle: "Audio und Video kostenlos online in Text umwandeln",
    ctaBullets: ["Wandelt Audio- und Videodateien in Sekunden in genauen Text um.", "Erstellt Zusammenfassungen, Mindmaps und zentrale Fragen."],
    ctaButton: "Kostenlos starten"
  },
  en: {
    authorFallback: "Votxt Team",
    tocTitle: "Table of Contents",
    ctaTitle: "Convert Audio&Video to Text Online for Free",
    ctaBullets: ["Converts audio and video files to accurate text in seconds.", "Creates summaries, mind maps, and key questions."],
    ctaButton: "Start for Free"
  },
  es: {
    authorFallback: "Equipo de Votxt",
    tocTitle: "Tabla de contenidos",
    ctaTitle: "Convierte audio y video a texto gratis online",
    ctaBullets: ["Convierte archivos de audio y video en texto preciso en segundos.", "Crea resúmenes, mapas mentales y preguntas clave."],
    ctaButton: "Empezar gratis"
  },
  fr: {
    authorFallback: "Équipe Votxt",
    tocTitle: "Sommaire",
    ctaTitle: "Convertir audio et vidéo en texte gratuitement en ligne",
    ctaBullets: ["Convertit les fichiers audio et vidéo en texte précis en quelques secondes.", "Crée des résumés, cartes mentales et questions clés."],
    ctaButton: "Commencer gratuitement"
  },
  hu: {
    authorFallback: "Votxt csapat",
    tocTitle: "Tartalomjegyzék",
    ctaTitle: "Alakíts hangot és videót szöveggé ingyen online",
    ctaBullets: ["A hang- és videófájlokat másodpercek alatt pontos szöveggé alakítja.", "Összefoglalókat, gondolattérképeket és kulcskérdéseket készít."],
    ctaButton: "Ingyenes kezdés"
  },
  id: {
    authorFallback: "Tim Votxt",
    tocTitle: "Daftar Isi",
    ctaTitle: "Ubah audio dan video menjadi teks gratis online",
    ctaBullets: ["Mengubah file audio dan video menjadi teks akurat dalam hitungan detik.", "Membuat ringkasan, mind map, dan pertanyaan kunci."],
    ctaButton: "Mulai gratis"
  },
  it: {
    authorFallback: "Team Votxt",
    tocTitle: "Indice",
    ctaTitle: "Converti audio e video in testo gratis online",
    ctaBullets: ["Converte file audio e video in testo accurato in pochi secondi.", "Crea riepiloghi, mappe mentali e domande chiave."],
    ctaButton: "Inizia gratis"
  },
  ja: {
    authorFallback: "Votxt チーム",
    tocTitle: "目次",
    ctaTitle: "音声と動画を無料でオンライン文字起こし",
    ctaBullets: ["音声・動画ファイルを数秒で正確なテキストに変換します。", "要約、マインドマップ、重要な質問を作成します。"],
    ctaButton: "無料で始める"
  },
  ko: {
    authorFallback: "Votxt 팀",
    tocTitle: "목차",
    ctaTitle: "오디오와 비디오를 무료로 온라인 텍스트 변환",
    ctaBullets: ["오디오와 비디오 파일을 몇 초 만에 정확한 텍스트로 변환합니다.", "요약, 마인드맵, 핵심 질문을 만듭니다."],
    ctaButton: "무료로 시작"
  },
  nl: {
    authorFallback: "Votxt-team",
    tocTitle: "Inhoudsopgave",
    ctaTitle: "Audio en video gratis online naar tekst converteren",
    ctaBullets: ["Zet audio- en videobestanden in seconden om naar nauwkeurige tekst.", "Maakt samenvattingen, mindmaps en kernvragen."],
    ctaButton: "Gratis starten"
  },
  pl: {
    authorFallback: "Zespół Votxt",
    tocTitle: "Spis treści",
    ctaTitle: "Konwertuj audio i wideo na tekst online za darmo",
    ctaBullets: ["Zamienia pliki audio i wideo na dokładny tekst w kilka sekund.", "Tworzy podsumowania, mapy myśli i kluczowe pytania."],
    ctaButton: "Zacznij za darmo"
  },
  pt: {
    authorFallback: "Equipe Votxt",
    tocTitle: "Índice",
    ctaTitle: "Converta áudio e vídeo em texto grátis online",
    ctaBullets: ["Converte arquivos de áudio e vídeo em texto preciso em segundos.", "Cria resumos, mapas mentais e perguntas-chave."],
    ctaButton: "Começar grátis"
  },
  ru: {
    authorFallback: "Команда Votxt",
    tocTitle: "Содержание",
    ctaTitle: "Преобразуйте аудио и видео в текст онлайн бесплатно",
    ctaBullets: ["Преобразует аудио- и видеофайлы в точный текст за секунды.", "Создает сводки, интеллект-карты и ключевые вопросы."],
    ctaButton: "Начать бесплатно"
  },
  th: {
    authorFallback: "ทีม Votxt",
    tocTitle: "สารบัญ",
    ctaTitle: "แปลงเสียงและวิดีโอเป็นข้อความออนไลน์ฟรี",
    ctaBullets: ["แปลงไฟล์เสียงและวิดีโอเป็นข้อความที่แม่นยำในไม่กี่วินาที", "สร้างสรุป แผนผังความคิด และคำถามสำคัญ"],
    ctaButton: "เริ่มฟรี"
  },
  tr: {
    authorFallback: "Votxt ekibi",
    tocTitle: "İçindekiler",
    ctaTitle: "Ses ve videoyu ücretsiz online metne dönüştür",
    ctaBullets: ["Ses ve video dosyalarını saniyeler içinde doğru metne dönüştürür.", "Özetler, zihin haritaları ve kilit sorular oluşturur."],
    ctaButton: "Ücretsiz başla"
  },
  uk: {
    authorFallback: "Команда Votxt",
    tocTitle: "Зміст",
    ctaTitle: "Перетворюйте аудіо й відео на текст онлайн безкоштовно",
    ctaBullets: ["Перетворює аудіо- й відеофайли на точний текст за секунди.", "Створює підсумки, ментальні карти й ключові запитання."],
    ctaButton: "Почати безкоштовно"
  },
  vi: {
    authorFallback: "Đội ngũ Votxt",
    tocTitle: "Mục lục",
    ctaTitle: "Chuyển âm thanh và video thành văn bản miễn phí online",
    ctaBullets: ["Chuyển tệp âm thanh và video thành văn bản chính xác trong vài giây.", "Tạo tóm tắt, sơ đồ tư duy và câu hỏi chính."],
    ctaButton: "Bắt đầu miễn phí"
  },
  zh: {
    authorFallback: "Votxt 团队",
    tocTitle: "目录",
    ctaTitle: "免费在线将音视频转换为文字",
    ctaBullets: ["几秒内将音频和视频文件转换为准确文字。", "生成摘要、思维导图和关键问题。"],
    ctaButton: "免费开始"
  },
  "zh-TW": {
    authorFallback: "Votxt 團隊",
    tocTitle: "目錄",
    ctaTitle: "免費線上將音影片轉換為文字",
    ctaBullets: ["幾秒內將音訊和影片檔轉換為準確文字。", "產生摘要、心智圖和關鍵問題。"],
    ctaButton: "免費開始"
  }
};

function headingId(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getPostBlocks(post: BlogPost): BlogContentBlock[] {
  if (post.content?.length) return post.content;

  return post.sections.flatMap((section) => [
    {type: "heading" as const, id: headingId(section.heading), text: section.heading},
    ...section.body.map((text) => ({type: "paragraph" as const, text}))
  ]);
}

function BlogContent({blocks}: {blocks: BlogContentBlock[]}) {
  return (
    <div>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h2
              key={`${block.id}-${index}`}
              id={block.id}
              className="relative mb-6 mt-10 scroll-mt-24 border-b border-gray-200 pb-2 text-2xl font-semibold leading-8 text-foreground"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "subheading") {
          return (
            <h3 key={`${block.text}-${index}`} className="mb-4 mt-6 text-xl font-semibold leading-7 text-foreground">
              {block.text}
            </h3>
          );
        }

        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={`${block.items[0]}-${index}`} className={`${block.ordered ? "list-decimal" : "list-disc"} my-4 ml-6 list-outside space-y-2 text-foreground`}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </List>
          );
        }

        return (
          <p key={`${block.text}-${index}`} className="my-4 text-[16px] leading-relaxed text-muted-foreground">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

export function BlogPostPage({locale, slug}: {locale: string; slug: string}) {
  const post = getBlogPost(locale, slug);
  if (!post) {
    notFound();
  }

  const pageCopy = blogPostPageCopy[isLocale(locale) ? locale : "en"];
  const blocks = getPostBlocks(post);
  const tableOfContents = blocks.filter((block): block is Extract<BlogContentBlock, {type: "heading"}> => block.type === "heading");

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <article className="mx-auto mt-20 flex max-w-[1400px] px-4 py-2 md:px-8">
        <div className="min-w-0 flex-1">
          <header className="flex flex-col py-6 md:flex-row md:py-10">
            <div className="relative flex-1 overflow-hidden md:mr-10 md:flex-[0_0_440px]">
              <Image
                src={post.coverImage}
                alt={post.coverAlt}
                width={540}
                height={301}
                sizes="(min-width: 768px) 440px, 100vw"
                className="h-auto w-full rounded object-cover md:h-[230px] md:w-[440px]"
                priority
              />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <h1 className="mt-3 break-words text-3xl font-bold leading-[1.4em] text-foreground md:mt-0 md:line-clamp-2 md:text-[36px]">
                {post.title}
              </h1>
              <p className="block pb-2 pt-12 text-lg font-semibold leading-7 text-foreground">{post.author ?? pageCopy.authorFallback}</p>
              <time className="block py-1 text-base leading-6 text-muted-foreground sm:py-2">{post.date}</time>
            </div>
          </header>

          <div className="flex flex-row">
            <div className="min-w-0 flex-1">
              <BlogContent blocks={blocks} />
            </div>

            <aside className="sticky top-24 ml-8 hidden h-fit w-64 shrink-0 space-y-4 md:block">
              {tableOfContents.length ? (
                <div className="w-64 rounded-lg border border-border bg-card p-4">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">{pageCopy.tocTitle}</h3>
                  <nav className="space-y-2">
                    {tableOfContents.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className="block w-full rounded px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              ) : null}

              <div className="w-64 rounded-lg border border-border bg-gradient-to-b from-primary/10 via-card to-primary/10 p-4">
                <h2 className="text-xl font-semibold leading-7 text-foreground">{pageCopy.ctaTitle}</h2>
                <p className="my-4 text-sm leading-5 text-muted-foreground">
                  {pageCopy.ctaBullets.map((bullet, index) => (
                    <span key={bullet}>
                      - {bullet}
                      {index < pageCopy.ctaBullets.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </p>
                <Link
                  href={`/${locale}?utm_source=blog&utm_medium=get_started_free_button&utm_campaign=none`}
                  className="block w-full rounded bg-primary py-2 text-center text-primary-foreground hover:bg-primary/90"
                >
                  {pageCopy.ctaButton}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
