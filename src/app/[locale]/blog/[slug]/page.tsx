import type {Metadata} from "next";
import {BlogPostPage} from "@/components/blog-post-page";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import {getAllBlogSlugs, getBlogPost, getBlogSeoTitle} from "@/lib/blog";
import {isLocale, locales, type Locale} from "@/lib/locales";
import {articleJsonLd, breadcrumbJsonLd, buildSeoMetadata, jsonLdString} from "@/lib/seo";

type BlogPostParams = {locale: string; slug: string};

const blogFallbackTitles: Record<Locale, string> = {
  ar: "مدونة Votxt",
  de: "Votxt Blog",
  en: "Votxt Blog",
  es: "Blog de Votxt",
  fr: "Blog Votxt",
  hu: "Votxt blog",
  id: "Blog Votxt",
  it: "Blog Votxt",
  ja: "Votxt ブログ",
  ko: "Votxt 블로그",
  nl: "Votxt-blog",
  pl: "Blog Votxt",
  pt: "Blog da Votxt",
  ru: "Блог Votxt",
  th: "บล็อก Votxt",
  tr: "Votxt blogu",
  uk: "Блог Votxt",
  vi: "Blog Votxt",
  zh: "Votxt 博客",
  "zh-TW": "Votxt 部落格"
};

export function generateStaticParams() {
  return locales.flatMap((locale) => getAllBlogSlugs().map((slug) => ({locale, slug})));
}

export function generateMetadata({params}: {params: BlogPostParams}): Metadata {
  const post = getBlogPost(params.locale, params.slug);
  if (!post) {
    const locale = isLocale(params.locale) ? params.locale : "en";
    return {title: blogFallbackTitles[locale]};
  }
  const copy = getWorkspaceCopy(params.locale) as ReturnType<typeof getWorkspaceCopy> & Partial<{marketingIntro: string; subheadline: string}>;
  const supportingDescription = copy.marketingIntro ?? copy.subheadline ?? "Learn practical workflows for transcription, subtitles, audio, and video.";

  return buildSeoMetadata({
    locale: params.locale,
    path: `/blog/${params.slug}`,
    title: `${getBlogSeoTitle(params.locale, params.slug, post.title)} | Votxt`,
    description: `${post.excerpt} ${supportingDescription}`,
    image: `/blog/${params.slug}/og.jpg`,
    imageWidth: 1200,
    imageHeight: 630,
    type: "article"
  });
}

export default function BlogPostRoute({params}: {params: BlogPostParams}) {
  const post = getBlogPost(params.locale, params.slug);
  const copy = getWorkspaceCopy(params.locale);
  return (
    <>
      {post ? <script type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLdString(articleJsonLd({
        locale: params.locale,
        slug: params.slug,
        title: post.title,
        description: post.excerpt,
        image: `/blog/${params.slug}/og.jpg`,
        datePublished: post.date,
        author: post.author
      }))}} /> : null}
      {post ? <script type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLdString(breadcrumbJsonLd(params.locale, [
        {name: "Votxt", path: "/"},
        {name: copy.blog, path: "/blog"},
        {name: post.title, path: `/blog/${params.slug}`}
      ]))}} /> : null}
      <BlogPostPage locale={params.locale} slug={params.slug} />
    </>
  );
}
