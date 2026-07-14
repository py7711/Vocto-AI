import assert from "node:assert/strict";
import test from "node:test";
import {normalizePublicMediaUrl} from "../src/lib/media-url";

test("normalizes public media URLs", () => {
  assert.equal(normalizePublicMediaUrl("youtu.be/dQw4w9WgXcQ"), "https://youtu.be/dQw4w9WgXcQ");
  assert.equal(normalizePublicMediaUrl("https://example.com/video.mp4"), "https://example.com/video.mp4");
});

test("rejects host-like command options before media resolution", () => {
  assert.throws(() => normalizePublicMediaUrl("--exec=bad"), /有效|主机/);
  assert.throws(() => normalizePublicMediaUrl("-o"), /有效|主机/);
});

test("rejects local, private and credentialed media URLs", () => {
  assert.throws(() => normalizePublicMediaUrl("http://localhost/video.mp4"), /公开|主机/);
  assert.throws(() => normalizePublicMediaUrl("http://127.0.0.1/video.mp4"), /公开|主机/);
  assert.throws(() => normalizePublicMediaUrl("http://192.168.1.2/video.mp4"), /公开|主机/);
  assert.throws(() => normalizePublicMediaUrl("https://user:pass@example.com/video.mp4"), /凭据/);
});
