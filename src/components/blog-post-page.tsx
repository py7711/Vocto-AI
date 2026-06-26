import {notFound} from "next/navigation";
import {ArrowLeft, CalendarDays, Clock, FileText} from "lucide-react";
import {getBlogPost} from "@/lib/blog";
import {SiteFooter, SiteHeader} from "@/components/site-shell";

const backLabels: Record<string, string> = {
  zh: "返回博客",
  en: "Back to Blog",
  es: "Volver al Blog",
  fr: "Retour au Blog",
  de: "Zurück zum Blog",
  ja: "Blog に戻る",
  ko: "Blog로 돌아가기",
  pt: "Voltar ao Blog"
};

export function BlogPostPage({locale, slug}: {locale: string; slug: string}) {
  const post = getBlogPost(locale, slug);
  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-4xl px-4 py-10 md:px-8">
        <a href={`/${locale}/blog`} className="btn-outline px-3 py-2">
          <ArrowLeft size={16} />
          {backLabels[locale] ?? backLabels.en}
        </a>
        <div className="mt-8">
          <p className="chip-tide uppercase">
            <FileText size={14} />
            {post.category}
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight text-ink md:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg leading-8 text-ink/68">{post.excerpt}</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-ink/55">
            <span className="inline-flex items-center gap-2"><CalendarDays size={16} />{post.date}</span>
            <span className="inline-flex items-center gap-2"><Clock size={16} />{post.readTime}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-6">
          {post.sections.map((section) => (
            <section key={section.heading} className="rounded-2xl border border-ink/10 bg-white/75 p-6 shadow-soft">
              <h2 className="text-2xl font-black text-ink">{section.heading}</h2>
              <div className="mt-4 grid gap-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-8 text-ink/72">{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
