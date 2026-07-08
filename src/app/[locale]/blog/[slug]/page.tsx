import type {Metadata} from "next";
import {BlogPostPage} from "@/components/blog-post-page";
import {getAllBlogSlugs, getBlogPost} from "@/lib/blog";
import {isLocale, locales, type Locale} from "@/lib/locales";

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

  return {
    title: post.title,
    description: post.excerpt
  };
}

export default function BlogPostRoute({params}: {params: BlogPostParams}) {
  return <BlogPostPage locale={params.locale} slug={params.slug} />;
}
