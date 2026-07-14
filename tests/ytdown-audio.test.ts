import assert from "node:assert/strict";
import test from "node:test";
import {
  createYtDownAudioIngestor,
  createYtDownChallengeGate,
  createYoutubeAudioAcquirer,
  isYtDownCloudflareChallengeTitle
} from "../src/server/media/ytdown-audio";

test("resolves YTDown audio and streams the completed MP3 to R2", async () => {
  const requests: string[] = [];
  let uploadedBytes = 0;
  let jobPolls = 0;
  const ingest = createYtDownAudioIngestor({
    resolveJob: async () => ({
      jobUrl: "https://s32.worker03.com/v5/audio/video123456/123/128k",
      fileName: "video.mp3"
    }),
    fetch: async (input) => {
      const url = String(input);
      requests.push(url);
      if (url.includes("worker03.com")) {
        jobPolls += 1;
        if (jobPolls === 1) return Response.json({status: "processing", progress: "9%"});
        return Response.json({
          status: "completed",
          fileName: "video.mp3",
          fileUrl: "https://files.ytcontent.com/video123456/audio?token=temporary",
          fileSizeBytes: 3
        });
      }
      if (url.includes("files.ytcontent.com")) {
        return new Response(new Uint8Array([1, 2, 3]), {
          headers: {
            "content-length": "3",
            "content-type": "application/octet-stream"
          }
        });
      }
      throw new Error(`Unexpected request: ${url}`);
    },
    putObject: async (input) => {
      for await (const chunk of input.body) uploadedBytes += Buffer.byteLength(chunk);
      return {
        key: input.key,
        publicUrl: `https://media.example.com/${input.key}`,
        sizeBytes: input.contentLength
      };
    },
    sleep: async () => undefined
  });

  const result = await ingest({
    youtubeUrl: "https://www.youtube.com/watch?v=video123456",
    key: "tasks/task-1/audio/video.mp3"
  });

  assert.deepEqual(requests, [
    "https://s32.worker03.com/v5/audio/video123456/123/128k",
    "https://s32.worker03.com/v5/audio/video123456/123/128k",
    "https://files.ytcontent.com/video123456/audio?token=temporary"
  ]);
  assert.equal(uploadedBytes, 3);
  assert.deepEqual(result, {
    key: "tasks/task-1/audio/video.mp3",
    publicUrl: "https://media.example.com/tasks/task-1/audio/video.mp3",
    sizeBytes: 3,
    fileName: "video.mp3",
    provider: "ytdown"
  });
});

test("rejects an untrusted YTDown file URL before downloading or writing to R2", async () => {
  let uploaded = false;
  const ingest = createYtDownAudioIngestor({
    resolveJob: async () => ({
      jobUrl: "https://s1.worker03.com/v5/audio/video123456/123/128k",
      fileName: "video.mp3"
    }),
    fetch: async (input) => {
      assert.match(String(input), /worker03\.com/);
      return Response.json({
        status: "completed",
        fileUrl: "https://internal.example.com/private-data",
        fileSizeBytes: 3
      });
    },
    putObject: async () => {
      uploaded = true;
      throw new Error("should not upload");
    }
  });

  await assert.rejects(
    ingest({youtubeUrl: "https://www.youtube.com/watch?v=video123456", key: "tasks/task-1/audio/video.mp3"}),
    /untrusted audio file URL/
  );
  assert.equal(uploaded, false);
});

test("uses YTDown before yt-dlp when the primary ingestion succeeds", async () => {
  const calls: string[] = [];
  const acquire = createYoutubeAudioAcquirer({
    ingestYtDown: async () => {
      calls.push("ytdown");
      return {key: "audio.mp3", publicUrl: "https://media.example/audio.mp3", sizeBytes: 3, fileName: "audio.mp3", provider: "ytdown"};
    },
    downloadWithYtDlp: async () => {
      calls.push("yt-dlp");
      return {filePath: "/tmp/audio.mp3", directory: "/tmp"};
    }
  });

  const result = await acquire({youtubeUrl: "https://www.youtube.com/watch?v=video123456", key: "audio.mp3"});

  assert.equal(result.kind, "stored");
  assert.deepEqual(calls, ["ytdown"]);
});

test("falls back to yt-dlp after YTDown ingestion fails", async () => {
  const calls: string[] = [];
  const acquire = createYoutubeAudioAcquirer({
    ingestYtDown: async () => {
      calls.push("ytdown");
      throw new Error("Cloudflare challenge");
    },
    onYtDownError: () => calls.push("fallback"),
    downloadWithYtDlp: async () => {
      calls.push("yt-dlp");
      return {filePath: "/tmp/audio.mp3", directory: "/tmp"};
    }
  });

  const result = await acquire({youtubeUrl: "https://www.youtube.com/watch?v=video123456", key: "audio.mp3"});

  assert.deepEqual(result, {kind: "downloaded", filePath: "/tmp/audio.mp3", directory: "/tmp"});
  assert.deepEqual(calls, ["ytdown", "fallback", "yt-dlp"]);
});

test("recognizes Cloudflare challenge titles and pauses attempts during cooldown", () => {
  assert.equal(isYtDownCloudflareChallengeTitle("Just a moment..."), true);
  assert.equal(isYtDownCloudflareChallengeTitle("请稍候...正在进行安全验证"), true);
  assert.equal(isYtDownCloudflareChallengeTitle("免费YouTube转MP3转换器"), false);

  let now = 1_000;
  const gate = createYtDownChallengeGate({cooldownMs: 600_000, now: () => now});
  gate.assertAvailable();
  gate.recordChallenge();
  assert.equal(gate.isBlocked(), true);
  assert.throws(() => gate.assertAvailable(), /temporarily paused/);
  now += 600_000;
  assert.equal(gate.isBlocked(), false);
  gate.assertAvailable();
});
