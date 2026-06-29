import type {Metadata} from "next";
import {BlogPostPage} from "@/components/blog-post-page";
import {getAllBlogSlugs, getBlogPost} from "@/lib/blog";
import {locales} from "@/lib/locales";

type BlogPostParams = {locale: string; slug: string};

export function generateStaticParams() {
  return locales.flatMap((locale) => getAllBlogSlugs().map((slug) => ({locale, slug})));
}

export function generateMetadata({params}: {params: BlogPostParams}): Metadata {
  const post = getBlogPost(params.locale, params.slug);
  if (!post) {
    return {title: "UniScribe Blog"};
  }

  return {
    title: post.title,
    description: post.excerpt
  };
}

export default function BlogPostRoute({params}: {params: BlogPostParams}) {
  return <BlogPostPage locale={params.locale} slug={params.slug} />;
}
