import type {Metadata} from "next";
import {isLocale, locales, type Locale} from "@/lib/locales";

export const SITE_ORIGIN = "https://votxt.io";
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/votxt-og.png`;

const hreflangByLocale: Record<Locale, string> = {
  ar: "ar-SA",
  de: "de-DE",
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  hu: "hu-HU",
  id: "id-ID",
  it: "it-IT",
  ja: "ja-JP",
  ko: "ko-KR",
  nl: "nl-NL",
  pl: "pl-PL",
  pt: "pt-BR",
  ru: "ru-RU",
  th: "th-TH",
  tr: "tr-TR",
  uk: "uk-UA",
  vi: "vi-VN",
  zh: "zh-CN",
  "zh-TW": "zh-TW"
};

function normalizedPath(path: string) {
  if (!path || path === "/") return "";
  return `/${path.replace(/^\/+|\/+$/g, "")}`;
}

function truncateAtBoundary(value: string, maxLength: number, useWordBoundary: boolean) {
  const characters = Array.from(value);
  if (characters.length <= maxLength) return value;
  const sliced = characters.slice(0, maxLength + 1).join("");
  const boundary = useWordBoundary ? sliced.lastIndexOf(" ") : maxLength;
  const end = boundary >= Math.floor(maxLength * 0.7) ? boundary : maxLength;
  return characters.slice(0, end).join("").replace(/[\s,;:|\-]+$/u, "");
}

function fittedTitle(title: string, locale: Locale) {
  const isCompactScript = ["ja", "ko", "zh", "zh-TW"].includes(locale);
  const maxLength = isCompactScript ? 25 : 60;
  const brandSuffix = title.endsWith(" | Votxt") ? " | Votxt" : "";
  const body = brandSuffix ? title.slice(0, -brandSuffix.length) : title;
  const fittedBody = truncateAtBoundary(body, maxLength - Array.from(brandSuffix).length, !isCompactScript);
  const cleanBody = isCompactScript && Array.from(body).length > Array.from(fittedBody).length
    ? fittedBody.replace(/[A-Za-z0-9]+$/u, "").trimEnd()
    : fittedBody;
  return `${cleanBody}${brandSuffix}`;
}

function fittedDescription(description: string, locale: Locale) {
  const isCompactScript = ["ja", "ko", "zh", "zh-TW"].includes(locale);
  if (!isCompactScript) return truncateAtBoundary(description, 160, true);
  if (Array.from(description).length <= 80) return description;
  const sliced = Array.from(description).slice(0, 81).join("");
  const sentenceEnd = Math.max(sliced.lastIndexOf("。"), sliced.lastIndexOf("！"), sliced.lastIndexOf("？"));
  return sentenceEnd >= 48 ? sliced.slice(0, sentenceEnd + 1) : Array.from(description).slice(0, 80).join("").replace(/[、，,\s]+$/u, "");
}

export function localizedUrl(locale: string, path = "/") {
  const safeLocale = isLocale(locale) ? locale : "en";
  return `${SITE_ORIGIN}/${safeLocale}${normalizedPath(path)}`;
}

export function canonicalRedirectUrl(requestUrl: string, host: string | null, forwardedProto: string | null) {
  const normalizedHost = host?.split(":")[0]?.toLowerCase();
  if (normalizedHost !== "votxt.io" && normalizedHost !== "www.votxt.io") return null;
  const url = new URL(requestUrl);
  const normalizedPath = canonicalPublicPath(url.pathname);
  const needsRedirect = normalizedHost === "www.votxt.io" || forwardedProto?.split(",")[0]?.trim() === "http" || url.protocol === "http:" || normalizedPath !== url.pathname;
  if (!needsRedirect) return null;
  url.protocol = "https:";
  url.hostname = "votxt.io";
  url.port = "";
  url.pathname = normalizedPath;
  return url;
}

const publicRouteSegments = new Set(["affiliate", "blog", "docs", "faq", "features", "l", "languages", "pricing", "privacy", "privacy-policy", "security", "terms", "terms-of-service", "tools"]);

function canonicalPublicPath(pathname: string) {
  const segments = pathname.split("/");
  const locale = locales.find((item) => item.toLowerCase() === segments[1]?.toLowerCase());
  if (locale && (!segments[2] || publicRouteSegments.has(segments[2].toLowerCase()))) {
    segments[1] = locale;
    for (let index = 2; index < segments.length; index += 1) segments[index] = segments[index].toLowerCase();
    return segments.join("/");
  }
  if (publicRouteSegments.has(segments[1]?.toLowerCase())) {
    for (let index = 1; index < segments.length; index += 1) segments[index] = segments[index].toLowerCase();
    return segments.join("/");
  }
  return pathname;
}

export function legacyPublicRedirectUrl(requestUrl: string) {
  const url = new URL(requestUrl);
  const segments = url.pathname.split("/").filter(Boolean);
  const locale = locales.find((item) => item.toLowerCase() === segments[0]?.toLowerCase());
  if (locale && (segments[1] === "privacy" || segments[1] === "terms") && segments.length === 2) {
    url.pathname = `/${locale}/${segments[1] === "privacy" ? "privacy-policy" : "terms-of-service"}`;
    return url;
  }
  if (locale || !segments.length) {
    if (!segments.length) {
      url.pathname = "/en";
      return url;
    }
    return null;
  }
  const root = segments[0];
  if (!publicRouteSegments.has(root)) return null;
  if (root === "privacy") segments[0] = "privacy-policy";
  if (root === "terms") segments[0] = "terms-of-service";
  url.pathname = `/en/${segments.join("/")}`;
  return url;
}

export function languageAlternates(path = "/") {
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((locale) => [hreflangByLocale[locale], localizedUrl(locale, path)])
  );
  languages["x-default"] = localizedUrl("en", path);
  return languages;
}

type SeoMetadataInput = {
  locale: string;
  path?: string;
  title: string;
  description: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  type?: "website" | "article";
  index?: boolean;
  follow?: boolean;
};

export function buildSeoMetadata({
  locale,
  path = "/",
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  imageWidth,
  imageHeight,
  type = "website",
  index = true,
  follow = true
}: SeoMetadataInput): Metadata {
  const safeLocale = isLocale(locale) ? locale : "en";
  const canonical = localizedUrl(safeLocale, path);
  const imageUrl = image.startsWith("http://") || image.startsWith("https://") ? image : `${SITE_ORIGIN}${image.startsWith("/") ? image : `/${image}`}`;
  const seoTitle = fittedTitle(title, safeLocale);
  const seoDescription = fittedDescription(description, safeLocale);

  return {
    title: {absolute: seoTitle},
    description: seoDescription,
    alternates: {
      canonical,
      languages: languageAlternates(path)
    },
    robots: {
      index,
      follow,
      googleBot: {index, follow, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1}
    },
    openGraph: {
      type,
      siteName: "Votxt",
      locale: hreflangByLocale[safeLocale].replace("-", "_"),
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      images: [image === DEFAULT_OG_IMAGE || (imageWidth && imageHeight)
        ? {url: imageUrl, width: imageWidth ?? 1200, height: imageHeight ?? 630, alt: `${seoTitle} - Votxt`}
        : {url: imageUrl, alt: `${seoTitle} - Votxt`}]
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [imageUrl]
    }
  };
}

export function buildPrivateMetadata(title: string, locale?: string, path?: string): Metadata {
  return {
    title: {absolute: `${title} | Votxt`},
    ...(locale ? {alternates: {canonical: localizedUrl(locale, path)}} : {}),
    robots: {
      index: false,
      follow: false,
      googleBot: {index: false, follow: false}
    }
  };
}

export function websiteJsonLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Votxt",
    url: localizedUrl("en"),
    description,
    publisher: {
      "@type": "Organization",
      name: "Votxt",
      url: SITE_ORIGIN,
      logo: `${SITE_ORIGIN}/votxt-app-icon.png`
    }
  } as const;
}

export function faqJsonLd(faqs: ReadonlyArray<readonly [string, string]>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {"@type": "Answer", text: answer}
    }))
  } as const;
}

export function breadcrumbJsonLd(locale: string, items: ReadonlyArray<{name: string; path: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: localizedUrl(locale, item.path)
    }))
  } as const;
}

type ArticleJsonLdInput = {
  locale: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  datePublished: string;
  author?: string;
};

export function articleJsonLd(input: ArticleJsonLdInput) {
  const image = input.image.startsWith("http://") || input.image.startsWith("https://")
    ? input.image
    : `${SITE_ORIGIN}${input.image.startsWith("/") ? input.image : `/${input.image}`}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image,
    datePublished: input.datePublished,
    author: {"@type": "Person", name: input.author ?? "Votxt Team"},
    publisher: {
      "@type": "Organization",
      name: "Votxt",
      logo: {"@type": "ImageObject", url: `${SITE_ORIGIN}/votxt-app-icon.png`}
    },
    mainEntityOfPage: localizedUrl(input.locale, `/blog/${input.slug}`)
  } as const;
}

export function jsonLdString(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
