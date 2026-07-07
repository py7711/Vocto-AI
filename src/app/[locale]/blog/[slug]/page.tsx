import type {Metadata} from "next";
import {BlogPostPage} from "@/components/blog-post-page";
import {getAllBlogSlugs, getBlogPost} from "@/lib/blog";
import {isLocale, locales, type Locale} from "@/lib/locales";

type BlogPostParams = {locale: string; slug: string};

const blogFallbackTitles: Record<Locale, string> = {
  ar: "مدونة UniScribe",
  de: "UniScribe Blog",
  en: "UniScribe Blog",
  es: "Blog de UniScribe",
  fr: "Blog UniScribe",
  hu: "UniScribe blog",
  id: "Blog UniScribe",
  it: "Blog UniScribe",
  ja: "UniScribe ブログ",
  ko: "UniScribe 블로그",
  nl: "UniScribe-blog",
  pl: "Blog UniScribe",
  pt: "Blog da UniScribe",
  ru: "Блог UniScribe",
  th: "บล็อก UniScribe",
  tr: "UniScribe blogu",
  uk: "Блог UniScribe",
  vi: "Blog UniScribe",
  zh: "UniScribe 博客",
  "zh-TW": "UniScribe 部落格"
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
