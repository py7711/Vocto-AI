import assert from "node:assert/strict";
import test from "node:test";
import {runMediaLinkTranscription} from "../src/server/transcription/media-link-policy";

test("YouTube links use Gemini without invoking the audio pipeline", async () => {
  const calls: string[] = [];
  const result = await runMediaLinkTranscription({
    sourceType: "YOUTUBE",
    sourceUrl: "https://www.youtube.com/watch?v=muCY-KBCJUQ",
    runMediaPipeline: async () => {
      calls.push("media");
      return "media";
    },
    runGemini: async () => {
      calls.push("gemini");
      return "gemini";
    }
  });

  assert.equal(result, "gemini");
  assert.deepEqual(calls, ["gemini"]);
});

test("non-YouTube media links prefer the audio pipeline", async () => {
  const calls: string[] = [];
  const result = await runMediaLinkTranscription({
    sourceType: "YOUTUBE",
    sourceUrl: "https://www.tiktok.com/@creator/video/123",
    runMediaPipeline: async () => {
      calls.push("media");
      return "media";
    },
    runGemini: async () => {
      calls.push("gemini");
      return "gemini";
    }
  });

  assert.equal(result, "media");
  assert.deepEqual(calls, ["media"]);
});

test("non-YouTube media links report audio preparation failures without invoking Gemini", async () => {
  const calls: string[] = [];
  await assert.rejects(() => runMediaLinkTranscription({
    sourceType: "YOUTUBE",
    sourceUrl: "https://www.instagram.com/reel/example/",
    runMediaPipeline: async () => {
      calls.push("media");
      throw new Error("yt-dlp failed");
    },
    runGemini: async () => {
      calls.push("gemini");
      return "gemini";
    }
  }), /yt-dlp failed/);
  assert.deepEqual(calls, ["media"]);
});
