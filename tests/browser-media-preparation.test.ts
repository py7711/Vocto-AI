import assert from "node:assert/strict";
import test from "node:test";
import {planMediaPreparation, prepareRemoteMediaForTask, uploadBlobToR2} from "../src/lib/browser-media-preparation";
import {selectBrowserAudioStream, selectBrowserTransferStream} from "../src/lib/media-stream";

test("extracts audio from an eligible local video in the browser", () => {
  const plan = planMediaPreparation({
    kind: "local",
    contentType: "video/mp4",
    sizeBytes: 120 * 1024 * 1024,
    browser: {supportsWebAssembly: true, deviceMemoryGb: 8, mobile: false}
  });

  assert.equal(plan.strategy, "browser_extract_audio");
});

test("uploads a local audio file without browser transcoding", () => {
  const plan = planMediaPreparation({
    kind: "local",
    contentType: "audio/mpeg",
    sizeBytes: 80 * 1024 * 1024,
    browser: {supportsWebAssembly: true, deviceMemoryGb: 8, mobile: false}
  });

  assert.equal(plan.strategy, "direct_upload");
});

test("falls back to worker extraction when browser transcoding is unsafe", () => {
  const unsafeBrowsers = [
    {sizeBytes: 301 * 1024 * 1024, browser: {supportsWebAssembly: true, deviceMemoryGb: 8, mobile: false}},
    {sizeBytes: 101 * 1024 * 1024, browser: {supportsWebAssembly: true, deviceMemoryGb: 8, mobile: true}},
    {sizeBytes: 80 * 1024 * 1024, browser: {supportsWebAssembly: true, deviceMemoryGb: 2, mobile: false}},
    {sizeBytes: 80 * 1024 * 1024, browser: {supportsWebAssembly: false, deviceMemoryGb: 8, mobile: false}}
  ];

  for (const input of unsafeBrowsers) {
    const plan = planMediaPreparation({kind: "local", contentType: "video/mp4", ...input});
    assert.equal(plan.strategy, "direct_upload");
  }
});

test("uploads an eligible platform audio-only stream from the browser", () => {
  const plan = planMediaPreparation({
    kind: "remote",
    audioStreamUrl: "https://cdn.example.com/audio.m4a",
    contentType: "audio/mp4",
    sizeBytes: 40 * 1024 * 1024,
    browser: {supportsFetch: true}
  });

  assert.equal(plan.strategy, "browser_upload_audio");
});

test("keeps platform media on the worker path without a safe audio-only stream", () => {
  const workerInputs = [
    {audioStreamUrl: undefined, sizeBytes: undefined, browser: {supportsFetch: true}},
    {audioStreamUrl: "https://cdn.example.com/audio.m4a", sizeBytes: 301 * 1024 * 1024, browser: {supportsFetch: true}},
    {audioStreamUrl: "https://cdn.example.com/audio.m4a", sizeBytes: 20 * 1024 * 1024, browser: {supportsFetch: false}}
  ];

  for (const input of workerInputs) {
    const plan = planMediaPreparation({kind: "remote", contentType: "audio/mp4", ...input});
    assert.equal(plan.strategy, "worker");
  }
});

test("uploads prepared media to R2 with a completed multipart session", async () => {
  const originalFetch = globalThis.fetch;
  const completedParts: Array<{PartNumber: number; ETag: string}> = [];
  const uploadedParts: number[] = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url === "/api/upload/multipart/create") {
      return Response.json({uploadId: "upload-token", key: "uploads/audio.mp3", publicUrl: "https://r2.example/audio.mp3"});
    }
    const signMatch = url.match(/\/part\/(\d+)\/sign$/);
    if (signMatch) return Response.json({url: `https://r2.example/part-${signMatch[1]}`});
    const uploadMatch = url.match(/part-(\d+)$/);
    if (uploadMatch && init?.method === "PUT") {
      const partNumber = Number(uploadMatch[1]);
      uploadedParts.push(partNumber);
      return new Response(null, {status: 200, headers: {etag: `"etag-${partNumber}"`}});
    }
    if (url.endsWith("/complete")) {
      const body = JSON.parse(String(init?.body)) as {parts: typeof completedParts};
      completedParts.push(...body.parts);
      return Response.json({key: "uploads/audio.mp3", publicUrl: "https://r2.example/audio.mp3"});
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    const result = await uploadBlobToR2(new Blob([new Uint8Array(11 * 1024 * 1024)]), {
      fileName: "prepared.mp3",
      contentType: "audio/mpeg"
    });

    assert.deepEqual(uploadedParts, [1, 2, 3]);
    assert.deepEqual(completedParts, [
      {PartNumber: 1, ETag: "\"etag-1\""},
      {PartNumber: 2, ETag: "\"etag-2\""},
      {PartNumber: 3, ETag: "\"etag-3\""}
    ]);
    assert.equal(result.key, "uploads/audio.mp3");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("selects the highest bitrate audio-only HTTPS stream for browser transfer", () => {
  const stream = selectBrowserAudioStream([
    {url: "https://cdn.example.com/video.mp4", ext: "mp4", acodec: "aac", vcodec: "h264", tbr: 800},
    {url: "http://cdn.example.com/audio-low.m4a", ext: "m4a", acodec: "aac", vcodec: "none", abr: 64},
    {url: "https://cdn.example.com/audio-low.m4a", ext: "m4a", acodec: "aac", vcodec: "none", abr: 64, filesize: 1000},
    {url: "https://cdn.example.com/audio-high.webm", ext: "webm", acodec: "opus", vcodec: "none", abr: 128, filesize_approx: 2000}
  ]);

  assert.deepEqual(stream, {
    url: "https://cdn.example.com/audio-high.webm",
    mimeType: "audio/webm",
    contentLength: 2000
  });
});

test("falls back to the platform worker when browser CORS blocks the audio stream", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new TypeError("Failed to fetch");
  };

  try {
    const source = await prepareRemoteMediaForTask({
      sourceType: "YOUTUBE",
      sourceUrl: "https://www.tiktok.com/@creator/video/123",
      title: "Public video",
      audioStream: {
        url: "https://cdn.example.com/audio.m4a",
        mimeType: "audio/mp4",
        contentLength: 20 * 1024 * 1024
      }
    });

    assert.deepEqual(source, {
      sourceType: "YOUTUBE",
      sourceUrl: "https://www.tiktok.com/@creator/video/123",
      originalName: "Public video",
      durationSeconds: undefined
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("uses a combined HTTPS video stream when a platform has no audio-only format", () => {
  const stream = selectBrowserTransferStream([
    {url: "https://cdn.example.com/storyboard.jpg", ext: "jpg", filesize: 1},
    {url: "https://cdn.example.com/video-large.mp4", ext: "mp4", acodec: "aac", vcodec: "h264", tbr: 1200, filesize: 80_000_000},
    {url: "https://cdn.example.com/video-small.mp4", ext: "mp4", acodec: "aac", vcodec: "h264", tbr: 600, filesize: 40_000_000}
  ]);

  assert.deepEqual(stream, {
    kind: "video",
    url: "https://cdn.example.com/video-small.mp4",
    mimeType: "video/mp4",
    contentLength: 40_000_000
  });
});

test("extracts audio from an eligible remote combined video stream", () => {
  const plan = planMediaPreparation({
    kind: "remote",
    streamKind: "video",
    audioStreamUrl: "https://cdn.example.com/video.mp4",
    contentType: "video/mp4",
    sizeBytes: 40 * 1024 * 1024,
    browser: {
      supportsFetch: true,
      supportsWebAssembly: true,
      deviceMemoryGb: 8,
      mobile: false
    }
  });

  assert.equal(plan.strategy, "browser_extract_remote_audio");
});

test("safely attempts a remote video stream whose size is not declared", () => {
  const plan = planMediaPreparation({
    kind: "remote",
    streamKind: "video",
    audioStreamUrl: "https://cdn.example.com/video.mp4",
    contentType: "video/mp4",
    sizeBytes: undefined,
    browser: {
      supportsFetch: true,
      supportsWebAssembly: true,
      deviceMemoryGb: 8,
      mobile: false
    }
  });

  assert.equal(plan.strategy, "browser_extract_remote_audio");
});

test("turns a browser-readable platform audio stream into an R2 upload task", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url === "https://cdn.example.com/audio.m4a") {
      return new Response(new Uint8Array([1, 2, 3]), {headers: {"content-type": "audio/mp4"}});
    }
    if (url === "/api/upload/multipart/create") {
      return Response.json({uploadId: "remote-token", key: "uploads/remote.m4a", publicUrl: "https://r2.example/remote.m4a"});
    }
    if (url.endsWith("/part/1/sign")) return Response.json({url: "https://r2.example/remote-part-1"});
    if (url === "https://r2.example/remote-part-1" && init?.method === "PUT") {
      return new Response(null, {status: 200, headers: {etag: "\"remote-etag\""}});
    }
    if (url.endsWith("/complete")) {
      return Response.json({key: "uploads/remote.m4a", publicUrl: "https://r2.example/remote.m4a"});
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    const source = await prepareRemoteMediaForTask({
      sourceType: "YOUTUBE",
      sourceUrl: "https://x.com/creator/status/123",
      title: "Platform clip",
      durationSeconds: 30,
      browserStream: {
        kind: "audio",
        url: "https://cdn.example.com/audio.m4a",
        mimeType: "audio/mp4",
        contentLength: 3
      }
    });

    assert.deepEqual(source, {
      sourceType: "UPLOAD",
      sourceUrl: "https://r2.example/remote.m4a",
      objectKey: "uploads/remote.m4a",
      originalName: "Platform clip.m4a",
      fileSizeBytes: 3,
      durationSeconds: 30
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("keeps oversized remote audio on the worker path for mobile browsers", () => {
  const plan = planMediaPreparation({
    kind: "remote",
    streamKind: "audio",
    audioStreamUrl: "https://cdn.example.com/audio.m4a",
    contentType: "audio/mp4",
    sizeBytes: 101 * 1024 * 1024,
    browser: {supportsFetch: true, mobile: true}
  });

  assert.equal(plan.strategy, "worker");
});

test("rejects a successful HTML response before creating an R2 upload", async () => {
  const originalFetch = globalThis.fetch;
  const requests: string[] = [];
  globalThis.fetch = async (input) => {
    requests.push(String(input));
    return new Response("expired", {status: 200, headers: {"content-type": "text/html"}});
  };

  try {
    const source = await prepareRemoteMediaForTask({
      sourceType: "YOUTUBE",
      sourceUrl: "https://x.com/creator/status/expired",
      title: "Expired clip",
      browserStream: {
        kind: "audio",
        url: "https://cdn.example.com/expired",
        mimeType: "audio/mp4",
        contentLength: 7
      }
    });

    assert.equal(source.sourceType, "YOUTUBE");
    assert.deepEqual(requests, ["https://cdn.example.com/expired"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("retries a failed multipart abort before reporting cleanup failure", async () => {
  const originalFetch = globalThis.fetch;
  let abortCalls = 0;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url === "/api/upload/multipart/create") {
      return Response.json({uploadId: "failed-token", key: "uploads/failed.mp3", publicUrl: "https://r2.example/failed.mp3"});
    }
    if (url.endsWith("/part/1/sign")) return Response.json({url: "https://r2.example/failed-part"});
    if (url === "https://r2.example/failed-part" && init?.method === "PUT") return new Response(null, {status: 500});
    if (url.endsWith("/abort")) {
      abortCalls += 1;
      return new Response(null, {status: 503});
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    await assert.rejects(
      uploadBlobToR2(new Blob([new Uint8Array([1])]), {fileName: "failed.mp3", contentType: "audio/mpeg"}),
      /abort/i
    );
    assert.equal(abortCalls, 3);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("does not hide multipart cleanup failure behind a platform worker fallback", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url === "https://cdn.example.com/audio.m4a") {
      return new Response(new Uint8Array([1]), {headers: {"content-type": "audio/mp4"}});
    }
    if (url === "/api/upload/multipart/create") {
      return Response.json({uploadId: "orphan-token", key: "uploads/orphan.m4a", publicUrl: "https://r2.example/orphan.m4a"});
    }
    if (url.endsWith("/part/1/sign")) return Response.json({url: "https://r2.example/orphan-part"});
    if (url === "https://r2.example/orphan-part" && init?.method === "PUT") return new Response(null, {status: 500});
    if (url.endsWith("/abort")) return new Response(null, {status: 503});
    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    await assert.rejects(() => prepareRemoteMediaForTask({
      sourceType: "YOUTUBE",
      sourceUrl: "https://x.com/creator/status/123",
      title: "Platform clip",
      browserStream: {
        kind: "audio",
        url: "https://cdn.example.com/audio.m4a",
        mimeType: "audio/mp4",
        contentLength: 1
      }
    }), /abort/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
