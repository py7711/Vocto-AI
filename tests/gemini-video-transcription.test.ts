import assert from "node:assert/strict";
import test from "node:test";
import {createGeminiVideoTranscriber} from "../src/server/transcription/gemini-video";

test("turns a complete Gemini video response into transcript and insight records", async () => {
  const requests: Array<{model: string; videoUrl: string; prompt: string}> = [];
  const transcribe = createGeminiVideoTranscriber({
    generate: async (input) => {
      requests.push(input);
      return {
        language: "en",
        durationSeconds: 634,
        segments: [
          {start: 0, end: 6.4, speaker: "Speaker 1", text: "You know exactly what you should be doing."},
          {start: 6.4, end: 12.8, speaker: "Speaker 1", text: "But your brain keeps choosing the easier task."}
        ],
        summary: {
          overview: "The video explains how to make difficult work rewarding.",
          bullets: [{text: "Reduce the perceived task cost.", timestamps: [{start: 6.4, end: 12.8}]}],
          takeaways: [{text: "Start with a smaller commitment.", timestamps: [{start: 6.4, end: 12.8}]}]
        },
        mindMap: {label: "Hard things", children: [{label: "Task design", children: []}]}
      };
    }
  });

  const result = await transcribe({
    videoUrl: "https://www.youtube.com/watch?v=muCY-KBCJUQ",
    expectedDurationSeconds: 634,
    language: "auto",
    enableSpeakerLabels: true,
    summaryTemplate: "course_lecture",
    summaryLanguage: "en"
  });

  assert.equal(requests[0]?.model, "gemini-3.1-flash-lite");
  assert.equal(requests[0]?.videoUrl, "https://www.youtube.com/watch?v=muCY-KBCJUQ");
  assert.match(requests[0]?.prompt ?? "", /course/i);
  assert.match(requests[0]?.prompt ?? "", /634 seconds/);
  assert.match(requests[0]?.prompt ?? "", /2-5 complete sentences/);
  assert.equal(result.provider, "gemini");
  assert.equal(result.text, "You know exactly what you should be doing. But your brain keeps choosing the easier task.");
  assert.equal(result.speakerCount, 1);
  assert.deepEqual(result.segments[0], {
    start: 0,
    end: 12.8,
    speaker: "Speaker 1",
    text: "You know exactly what you should be doing. But your brain keeps choosing the easier task."
  });
  assert.ok(result.insights);
  assert.deepEqual(result.insights.summary.bullets[0].timestamps[0], {start: 6.4, end: 12.8});
  assert.equal(result.insights.mindMap.children[0].label, "Task design");
});

test("groups sentence-level Gemini segments into readable paragraphs", async () => {
  const transcribe = createGeminiVideoTranscriber({
    generate: async () => ({
      language: "en",
      durationSeconds: 20,
      segments: [
        {start: 0, end: 4, speaker: "Evie", text: "Welcome to the English podcast."},
        {start: 4, end: 8, speaker: "Evie", text: "This show makes English part of your life."},
        {start: 8, end: 12, speaker: "Evie", text: "Today we are discussing study habits."},
        {start: 12, end: 16, speaker: "Evie", text: "Busy adults can make steady progress."}
      ],
      summary: {overview: "", bullets: [], takeaways: []},
      mindMap: {label: "Video", children: []}
    })
  });

  const result = await transcribe({
    videoUrl: "https://www.youtube.com/watch?v=example",
    expectedDurationSeconds: 20,
    language: "auto",
    enableSpeakerLabels: true,
    summaryTemplate: "none"
  });

  assert.deepEqual(result.segments, [{
    start: 0,
    end: 16,
    speaker: "Evie",
    text: "Welcome to the English podcast. This show makes English part of your life. Today we are discussing study habits. Busy adults can make steady progress."
  }]);
});

test("keeps speaker changes as paragraph boundaries", async () => {
  const transcribe = createGeminiVideoTranscriber({
    generate: async () => ({
      language: "en",
      durationSeconds: 20,
      segments: [
        {start: 0, end: 5, speaker: "Host", text: "Welcome to the show."},
        {start: 5, end: 10, speaker: "Host", text: "Let me introduce our guest."},
        {start: 10, end: 15, speaker: "Guest", text: "Thank you for inviting me."},
        {start: 15, end: 20, speaker: "Guest", text: "I am glad to be here."}
      ],
      summary: {overview: "", bullets: [], takeaways: []},
      mindMap: {label: "Video", children: []}
    })
  });

  const result = await transcribe({
    videoUrl: "https://www.youtube.com/watch?v=example",
    expectedDurationSeconds: 20,
    language: "auto",
    enableSpeakerLabels: true,
    summaryTemplate: "none"
  });

  assert.deepEqual(result.segments.map((segment) => segment.speaker), ["Host", "Guest"]);
  assert.equal(result.segments[0]?.end, 10);
  assert.equal(result.segments[1]?.start, 10);
});

test("splits an oversized Gemini segment into multiple timestamped paragraphs", async () => {
  const sentences = [
    "Sentence one introduces the topic.",
    "Sentence two supplies useful context.",
    "Sentence three develops the main idea.",
    "Sentence four gives a concrete example.",
    "Sentence five explains the consequence.",
    "Sentence six closes the discussion."
  ];
  const transcribe = createGeminiVideoTranscriber({
    generate: async () => ({
      language: "en",
      durationSeconds: 60,
      segments: [{start: 0, end: 60, speaker: "Speaker 1", text: sentences.join(" ")}],
      summary: {overview: "", bullets: [], takeaways: []},
      mindMap: {label: "Video", children: []}
    })
  });

  const result = await transcribe({
    videoUrl: "https://www.youtube.com/watch?v=example",
    expectedDurationSeconds: 60,
    language: "auto",
    enableSpeakerLabels: true,
    summaryTemplate: "none"
  });

  assert.equal(result.segments.length, 2);
  assert.equal(result.segments[0]?.start, 0);
  assert.equal(result.segments[1]?.end, 60);
  assert.equal(result.segments.map((segment) => segment.text).join(" "), sentences.join(" "));
});

test("uses trusted media duration and removes summary timestamps outside the video", async () => {
  const transcribe = createGeminiVideoTranscriber({
    generate: async () => ({
      language: "en",
      durationSeconds: 3944,
      segments: [{start: 0, end: 95, text: "A complete transcript paragraph."}],
      summary: {
        overview: "",
        bullets: [{
          text: "A summary item.",
          timestamps: [{start: 10, end: 20}, {start: 3900, end: 3944}]
        }],
        takeaways: [{text: "A takeaway.", timestamps: [{start: 90, end: 110}]}]
      },
      mindMap: {label: "Video", children: []}
    })
  });

  const result = await transcribe({
    videoUrl: "https://www.youtube.com/watch?v=example",
    expectedDurationSeconds: 100,
    language: "auto",
    enableSpeakerLabels: false,
    summaryTemplate: "standard"
  });

  assert.equal(result.durationSeconds, 100);
  assert.deepEqual(result.insights?.summary.bullets[0]?.timestamps, [{start: 10, end: 20}]);
  assert.deepEqual(result.insights?.summary.takeaways[0]?.timestamps, [{start: 90, end: 100}]);
});

test("fills in omitted children arrays on Gemini mind map leaf nodes", async () => {
  const transcribe = createGeminiVideoTranscriber({
    generate: async () => ({
      language: "en",
      durationSeconds: 12,
      segments: [{start: 0, end: 12, text: "A complete segment."}],
      summary: {overview: "", bullets: [], takeaways: []},
      mindMap: {
        label: "Video",
        children: [{
          label: "Topic",
          children: [{label: "Detail"}]
        }]
      }
    })
  });

  const result = await transcribe({
    videoUrl: "https://www.youtube.com/watch?v=muCY-KBCJUQ",
    language: "auto",
    enableSpeakerLabels: false,
    summaryTemplate: "none"
  });

  assert.deepEqual(result.insights?.mindMap, {
    label: "Video",
    children: [{
      label: "Topic",
      children: [{label: "Detail", children: []}]
    }]
  });
});

test("rejects a Gemini response without speakers when speaker labels are enabled", async () => {
  const transcribe = createGeminiVideoTranscriber({
    generate: async () => ({
      language: "en",
      durationSeconds: 12,
      segments: [{start: 0, end: 12, text: "A segment without a speaker."}],
      summary: {overview: "", bullets: [], takeaways: []},
      mindMap: {label: "Video", children: []}
    })
  });

  await assert.rejects(
    transcribe({
      videoUrl: "https://www.youtube.com/watch?v=muCY-KBCJUQ",
      language: "auto",
      enableSpeakerLabels: true,
      summaryTemplate: "none"
    }),
    /缺少第 1 个段落的发言人标签/
  );
});

test("fails a Gemini request that never returns instead of leaving the task processing forever", async () => {
  const transcribe = createGeminiVideoTranscriber({
    generate: async () => new Promise(() => undefined),
    timeoutMs: 20
  });

  await assert.rejects(() => transcribe({
    videoUrl: "https://www.youtube.com/watch?v=muCY-KBCJUQ",
    language: "auto",
    enableSpeakerLabels: false,
    summaryTemplate: "none"
  }), /Gemini 视频分析超过 1 秒后超时/);
});
