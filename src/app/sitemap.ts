import type {MetadataRoute} from "next";
import {canonicalLandingSlugs, canonicalLanguageSlugs} from "@/lib/canonical-slugs";
import {getBlogPosts} from "@/lib/blog";
import {locales} from "@/lib/locales";
import {languageAlternates, localizedUrl} from "@/lib/seo";
import {canonicalToolSlugs, isCanonicalToolSlug} from "@/lib/tool-pages";

const staticPublicPaths = [
  "/",
  "/features",
  "/pricing",
  "/faq",
  "/blog",
  "/docs",
  "/languages",
  "/affiliate",
  "/security",
  "/privacy-policy",
  "/terms-of-service"
] as const;

function sitemapEntry(locale: string, path: string, lastModified?: string): MetadataRoute.Sitemap[number] {
  return {
    url: localizedUrl(locale, path),
    ...(lastModified ? {lastModified} : {}),
    alternates: {languages: languageAlternates(path)}
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) => {
    const staticEntries = staticPublicPaths.map((path) => sitemapEntry(locale, path));
    const toolEntries = canonicalToolSlugs.map((slug) => sitemapEntry(locale, `/tools/${slug}`));
    const landingEntries = canonicalLandingSlugs
      .filter((slug) => !isCanonicalToolSlug(slug))
      .map((slug) => sitemapEntry(locale, `/l/${slug}`));
    const languageEntries = canonicalLanguageSlugs.map((slug) => sitemapEntry(locale, `/languages/${slug}`));
    const blogEntries = getBlogPosts(locale).map((post) => sitemapEntry(locale, `/blog/${post.slug}`, post.date));
    return [...staticEntries, ...toolEntries, ...landingEntries, ...languageEntries, ...blogEntries];
  });
}
