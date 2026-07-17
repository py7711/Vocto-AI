import assert from "node:assert/strict";
import test from "node:test";
import {NextRequest} from "next/server";
import middleware from "../src/middleware";

test("blog cover assets bypass locale and legacy page redirects", () => {
  const response = middleware(new NextRequest("http://localhost:3000/blog/compress-large-audio-to-mp3-vlc-guide/cover.png"));

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("location"), null);
  assert.equal(response.headers.get("x-middleware-next"), "1");
});
