import assert from "node:assert/strict";
import test from "node:test";
import {fallbackSummary, sanitizeSummaryTimestamps, transcriptTimedSegments} from "../src/server/ai/summary-source";

test("fallback summaries retain transcript segment timestamps", () => {
  const summary = fallbackSummary(
    "Confidence can feel uncomfortable. Keep believing in yourself.",
    "en",
    "study",
    [
      {start: 24, end: 45, text: "Confidence can feel uncomfortable."},
      {start: 45, end: 58, text: "Keep believing in yourself."}
    ]
  );

  assert.deepEqual(summary.bullets.map((entry) => entry.timestamps), [
    [{start: 24, end: 45}],
    [{start: 45, end: 58}]
  ]);
  assert.notEqual(summary.bullets[0]?.timestamps[0]?.end, 0);
});

test("fallback summaries omit timestamps when the transcript has no valid ranges", () => {
  const summary = fallbackSummary("A transcript without timing.", "en", "standard");
  assert.deepEqual(summary.bullets[0]?.timestamps, []);
});

test("transcript timestamp extraction rejects zero-length ranges", () => {
  assert.deepEqual(transcriptTimedSegments([
    {start: 0, end: 0, text: "Invalid range"},
    {start: 24, end: 45, text: "Valid range"}
  ]), [{start: 24, end: 45, text: "Valid range", speaker: undefined}]);
});

test("invalid model timestamps are repaired from the matching transcript segment", () => {
  const summary = sanitizeSummaryTimestamps({
    overview: "Study notes",
    bullets: [{text: "Confidence can feel uncomfortable.", timestamps: [{start: 0, end: 0}]}],
    takeaways: [{text: "A paraphrase without a source match.", timestamps: [{start: 1000, end: 1001}]}]
  }, [{start: 24, end: 45, text: "Confidence can feel uncomfortable."}]);

  assert.deepEqual(summary.bullets[0]?.timestamps, [{start: 24, end: 45}]);
  assert.deepEqual(summary.takeaways[0]?.timestamps, []);
});

test("model timestamps are removed when no timed transcript source exists", () => {
  const summary = sanitizeSummaryTimestamps({
    bullets: [{text: "Unsupported timestamp.", timestamps: [{start: 12, end: 18}]}]
  }, []);

  assert.deepEqual(summary.bullets[0]?.timestamps, []);
});
