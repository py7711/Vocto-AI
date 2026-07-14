import {normalizePublicMediaUrl} from "@/lib/media-url";

type PublicMetadataProvider = "youtube" | "tiktok" | "instagram" | "facebook" | "x" | "vimeo" | "google_drive" | "generic";

export type PublicMediaMetadata = {
  title?: string;
  thumbnailUrl?: string;
  sourceUrl: string;
  providerName: string;
  durationSeconds?: number;
  contentLength?: number;
  extension?: string;
};

const MAX_PAGE_BYTES = 1_000_000;
const requestHeaders = {
  accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
  "user-agent": "Mozilla/5.0 (compatible; VotxtMediaPreview/1.0; +https://votxt.io)"
};

function oEmbedEndpoint(url: string, provider: PublicMetadataProvider) {
  if (provider === "youtube") return `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  if (provider === "tiktok") return `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
  if (provider === "vimeo") return `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
  if (provider === "x") return `https://publish.twitter.com/oembed?omit_script=true&dnt=true&url=${encodeURIComponent(url)}`;
  return undefined;
}

async function fetchOEmbedMetadata(url: string, provider: PublicMetadataProvider) {
  const endpoint = oEmbedEndpoint(url, provider);
  if (!endpoint) return undefined;
  const response = await fetch(endpoint, {
    headers: requestHeaders,
    signal: AbortSignal.timeout(8_000)
  });
  if (!response.ok) return undefined;
  const payload = await response.json() as {
    title?: string;
    thumbnail_url?: string;
    provider_name?: string;
  };
  if (!payload.title && !payload.thumbnail_url) return undefined;
  return {
    title: payload.title?.trim() || undefined,
    thumbnailUrl: normalizeImageUrl(payload.thumbnail_url, url),
    sourceUrl: url,
    providerName: payload.provider_name?.trim() || `${provider}:oembed`
  } satisfies PublicMediaMetadata;
}

async function readLimitedText(response: Response) {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_PAGE_BYTES) return undefined;
  if (!response.body) return (await response.text()).slice(0, MAX_PAGE_BYTES);

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total <= MAX_PAGE_BYTES) {
    const {done, value} = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_PAGE_BYTES) {
      await reader.cancel();
      return undefined;
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

function decodeHtml(value: string) {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: "\""
  };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|quot);/gi, (match, entity: string) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return namedEntities[entity.toLowerCase()] ?? match;
  });
}

function metaAttributes(tag: string) {
  const attributes: Record<string, string> = {};
  const pattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  for (const match of tag.matchAll(pattern)) {
    attributes[match[1].toLowerCase()] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attributes;
}

function metadataFromHtml(html: string, pageUrl: string) {
  const values = new Map<string, string>();
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attributes = metaAttributes(tag);
    const key = (attributes.property || attributes.name || attributes.itemprop)?.toLowerCase();
    const content = attributes.content?.trim();
    if (key && content && !values.has(key)) values.set(key, content);
  }
  const documentTitle = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    ?.replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const title = values.get("og:title") || values.get("twitter:title") || (documentTitle ? decodeHtml(documentTitle) : undefined);
  const image = values.get("og:image:secure_url") || values.get("og:image") || values.get("twitter:image") || values.get("thumbnailurl");
  return {
    title,
    thumbnailUrl: normalizeImageUrl(image, pageUrl)
  };
}

function normalizeImageUrl(imageUrl: string | undefined, pageUrl: string) {
  if (!imageUrl) return undefined;
  try {
    return normalizePublicMediaUrl(new URL(imageUrl, pageUrl).toString());
  } catch {
    return undefined;
  }
}

async function fetchPageMetadata(url: string, provider: PublicMetadataProvider) {
  let finalUrl = normalizePublicMediaUrl(url);
  let response: Response | undefined;
  for (let redirectCount = 0; redirectCount <= 3; redirectCount += 1) {
    response = await fetch(finalUrl, {
      headers: requestHeaders,
      redirect: "manual",
      signal: AbortSignal.timeout(8_000)
    });
    if (response.status < 300 || response.status >= 400) break;
    const location = response.headers.get("location");
    if (!location) return undefined;
    finalUrl = normalizePublicMediaUrl(new URL(location, finalUrl).toString());
    response = undefined;
  }
  if (!response) return undefined;
  if (!response.ok) return undefined;
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType && !contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) return undefined;
  const html = await readLimitedText(response);
  if (!html) return undefined;
  const metadata = metadataFromHtml(html, finalUrl);
  if (!metadata.title && !metadata.thumbnailUrl) return undefined;
  return {
    ...metadata,
    sourceUrl: url,
    providerName: `${provider}:open-graph`
  } satisfies PublicMediaMetadata;
}

export async function resolvePublicMediaMetadata(url: string, provider: PublicMetadataProvider) {
  const normalizedUrl = normalizePublicMediaUrl(url);
  let oEmbed: PublicMediaMetadata | undefined;
  try {
    oEmbed = await fetchOEmbedMetadata(normalizedUrl, provider);
    if (oEmbed?.title && oEmbed.thumbnailUrl) return oEmbed;
  } catch {
    // 继续尝试页面公开的 Open Graph/Twitter Card 元数据。
  }

  try {
    const page = await fetchPageMetadata(normalizedUrl, provider);
    if (!page) return oEmbed;
    return {
      ...page,
      title: oEmbed?.title || page.title,
      thumbnailUrl: oEmbed?.thumbnailUrl || page.thumbnailUrl,
      providerName: oEmbed ? `${oEmbed.providerName}+open-graph` : page.providerName
    };
  } catch {
    return oEmbed;
  }
}
