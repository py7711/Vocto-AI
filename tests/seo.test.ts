import assert from "node:assert/strict";
import test from "node:test";
import {articleJsonLd, breadcrumbJsonLd, buildPrivateMetadata, buildSeoMetadata, canonicalRedirectUrl, faqJsonLd, legacyPublicRedirectUrl, localizedUrl, SITE_ORIGIN, websiteJsonLd} from "../src/lib/seo";
import robots from "../src/app/robots";
import sitemap from "../src/app/sitemap";

test("SEO URLs always use the non-www HTTPS production origin", () => {
  assert.equal(SITE_ORIGIN, "https://votxt.io");
  assert.equal(localizedUrl("en", "/tools/audio-to-text"), "https://votxt.io/en/tools/audio-to-text");
  assert.equal(localizedUrl("zh-TW", "blog"), "https://votxt.io/zh-TW/blog");
});

test("public metadata emits a self-canonical and reciprocal language alternates", () => {
  const metadata = buildSeoMetadata({
    locale: "fr",
    path: "/blog/example",
    title: "Example",
    description: "A distinct page description."
  });

  assert.equal(metadata.alternates?.canonical, "https://votxt.io/fr/blog/example");
  assert.equal(metadata.alternates?.languages?.["en-US"], "https://votxt.io/en/blog/example");
  assert.equal(metadata.alternates?.languages?.["fr-FR"], "https://votxt.io/fr/blog/example");
  assert.equal(metadata.alternates?.languages?.["x-default"], "https://votxt.io/en/blog/example");
  assert.equal(metadata.openGraph?.url, "https://votxt.io/fr/blog/example");
  assert.equal((metadata.twitter as {card?: string} | null | undefined)?.card, "summary_large_image");
});

test("public metadata keeps long SERP copy within recommended limits", () => {
  const metadata = buildSeoMetadata({
    locale: "en",
    title: "A very long article title that would otherwise be truncated by search engines before users see the brand | Votxt",
    description: "A detailed description ".repeat(20)
  });
  assert.ok(String((metadata.title as {absolute: string}).absolute).length <= 60);
  assert.ok(String((metadata.title as {absolute: string}).absolute).endsWith(" | Votxt"));
  assert.ok(String(metadata.description).length <= 160);

  const chinese = buildSeoMetadata({locale: "zh", title: "如何用 VLC 将大型音频压缩为 MP3：Windows 完整指南 | Votxt", description: "中文说明"});
  const chineseTitle = String((chinese.title as {absolute: string}).absolute);
  assert.ok(Array.from(chineseTitle).length <= 25);
  assert.ok(!/[A-Za-z0-9] \| Votxt$/u.test(chineseTitle));
});

test("private metadata prevents indexing and link following", () => {
  const metadata = buildPrivateMetadata("Dashboard", "en", "/dashboard");
  assert.deepEqual(metadata.robots, {index: false, follow: false, googleBot: {index: false, follow: false}});
  assert.equal(metadata.alternates?.canonical, "https://votxt.io/en/dashboard");
  assert.equal(metadata.alternates?.languages, undefined);
});

test("structured data uses canonical production URLs and supplied article facts", () => {
  assert.equal(websiteJsonLd("Localized description").url, "https://votxt.io/en");
  const article = articleJsonLd({
    locale: "en",
    slug: "example",
    title: "Example article",
    description: "Example description",
    image: "/example.jpg",
    datePublished: "2026-01-02",
    author: "Votxt Team"
  });
  assert.equal(article.mainEntityOfPage, "https://votxt.io/en/blog/example");
  assert.equal(article.image, "https://votxt.io/example.jpg");
  assert.equal(article.datePublished, "2026-01-02");
  assert.equal(faqJsonLd([["Question?", "Answer."]]).mainEntity[0].acceptedAnswer.text, "Answer.");
  assert.equal(breadcrumbJsonLd("fr", [{name: "Votxt", path: "/"}]).itemListElement[0].item, "https://votxt.io/fr");
});

test("robots advertises the canonical sitemap and blocks private surfaces", () => {
  const value = robots();
  assert.equal(value.sitemap, "https://votxt.io/sitemap.xml");
  assert.ok(JSON.stringify(value.rules).includes("/api/"));
  assert.ok(JSON.stringify(value.rules).includes("/*/dashboard"));
});

test("sitemap contains public canonical pages and excludes redirects and private pages", () => {
  const urls = sitemap().map((entry) => entry.url);
  assert.ok(urls.includes("https://votxt.io/en"));
  assert.ok(urls.includes("https://votxt.io/en/tools/audio-to-text"));
  assert.ok(urls.includes("https://votxt.io/en/l/mp3-to-text"));
  assert.ok(!urls.includes("https://votxt.io/en/l/audio-to-text"));
  assert.ok(!urls.some((url) => url.includes("/dashboard")));
});

test("canonical redirect preserves path and query for www and HTTP requests", () => {
  assert.equal(
    canonicalRedirectUrl("https://www.votxt.io/en/blog?ref=search", "www.votxt.io", "https")?.toString(),
    "https://votxt.io/en/blog?ref=search"
  );
  assert.equal(
    canonicalRedirectUrl("http://votxt.io/zh/tools/audio-to-text?q=1", "votxt.io", "http")?.toString(),
    "https://votxt.io/zh/tools/audio-to-text?q=1"
  );
  assert.equal(canonicalRedirectUrl("http://localhost:3000/en", "localhost:3000", "http"), null);
  assert.equal(
    canonicalRedirectUrl("https://votxt.io/EN/Blog/EXAMPLE", "votxt.io", "https")?.toString(),
    "https://votxt.io/en/blog/example"
  );
});

test("legacy public aliases redirect directly to localized canonical paths", () => {
  assert.equal(legacyPublicRedirectUrl("http://localhost:3000/blog/example?ref=old")?.toString(), "http://localhost:3000/en/blog/example?ref=old");
  assert.equal(legacyPublicRedirectUrl("https://votxt.io/fr/privacy")?.toString(), "https://votxt.io/fr/privacy-policy");
  assert.equal(legacyPublicRedirectUrl("https://votxt.io/en/settings"), null);
});
