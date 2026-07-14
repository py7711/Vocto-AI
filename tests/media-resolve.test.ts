import assert from "node:assert/strict";
import {mkdtempSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import test from "node:test";

const originalFetch = globalThis.fetch;
const logDir = mkdtempSync(join(tmpdir(), "votxt-media-resolve-"));
process.env.LOG_DIR = logDir;
process.env.LOG_TO_CONSOLE = "false";

test.after(() => {
  globalThis.fetch = originalFetch;
  rmSync(logDir, {recursive: true, force: true});
});

async function resolve(url: string) {
  const {POST} = await import("../src/app/api/media/resolve/route");
  const response = await POST(new Request("http://localhost/api/media/resolve", {
    method: "POST",
    headers: {"content-type": "application/json"},
    body: JSON.stringify({url})
  }));
  assert.equal(response.status, 200);
  return response.json() as Promise<{
    title: string;
    thumbnailUrl?: string;
    providerLabel: string;
    warnings: string[];
  }>;
}

test("uses public page metadata when the media extractor cannot resolve a link", async () => {
  globalThis.fetch = async () => new Response(`<!doctype html><html><head>
    <meta property="og:title" content="Public video title">
    <meta property="og:image" content="https://cdn.example.net/video-cover.jpg">
  </head></html>`, {
    status: 200,
    headers: {"content-type": "text/html; charset=utf-8"}
  });

  const result = await resolve("https://example.com/not-a-video");

  assert.equal(result.title, "Public video title");
  assert.equal(result.thumbnailUrl, "https://cdn.example.net/video-cover.jpg");
  assert.deepEqual(result.warnings, []);
});

test("silently uses a neutral link fallback when no metadata is available", async () => {
  globalThis.fetch = async () => new Response("<html><head></head></html>", {
    status: 200,
    headers: {"content-type": "text/html; charset=utf-8"}
  });

  const result = await resolve("https://example.com/not-a-video");

  assert.equal(result.providerLabel, "URL");
  assert.deepEqual(result.warnings, []);
  assert.doesNotMatch(JSON.stringify(result), /[\u3400-\u9fff]/u);
});

test("resolves TikTok preview metadata through its public oEmbed endpoint", async () => {
  globalThis.fetch = async (input) => {
    assert.match(String(input), /^https:\/\/www\.tiktok\.com\/oembed\?/);
    return Response.json({
      title: "TikTok video title",
      thumbnail_url: "https://p16-sign.example.net/tiktok-cover.jpeg",
      provider_name: "TikTok"
    });
  };
  const {resolvePublicMediaMetadata} = await import("../src/server/media/public-metadata");

  const metadata = await resolvePublicMediaMetadata("https://www.tiktok.com/@creator/video/123456789", "tiktok");

  assert.equal(metadata?.title, "TikTok video title");
  assert.equal(metadata?.thumbnailUrl, "https://p16-sign.example.net/tiktok-cover.jpeg");
});

test("resolves Instagram, Facebook and X preview images from public page metadata", async () => {
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.startsWith("https://publish.twitter.com/oembed")) {
      return Response.json({title: "X video title", provider_name: "Twitter"});
    }
    const provider = url.includes("instagram.com") ? "Instagram" : url.includes("facebook.com") ? "Facebook" : "X";
    return new Response(`<html><head>
      <meta content="${provider} video title" property="og:title">
      <meta content="https://cdn.example.net/${provider.toLowerCase()}-cover.jpg" property="og:image">
    </head></html>`, {headers: {"content-type": "text/html"}});
  };
  const {resolvePublicMediaMetadata} = await import("../src/server/media/public-metadata");
  const cases = [
    ["https://www.instagram.com/reel/example/", "instagram", "Instagram"],
    ["https://www.facebook.com/watch/?v=123", "facebook", "Facebook"],
    ["https://x.com/example/status/123", "x", "X"]
  ] as const;

  for (const [url, provider, label] of cases) {
    const metadata = await resolvePublicMediaMetadata(url, provider);
    assert.equal(metadata?.title, `${label} video title`);
    assert.equal(metadata?.thumbnailUrl, `https://cdn.example.net/${label.toLowerCase()}-cover.jpg`);
  }
});
