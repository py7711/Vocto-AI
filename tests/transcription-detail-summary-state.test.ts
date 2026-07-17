import assert from "node:assert/strict";
import test from "node:test";
import {hasSummaryContent} from "../src/components/transcription-detail-state";

test("empty summary payloads use the generate-summary empty state", () => {
  assert.equal(hasSummaryContent(undefined), false);
  assert.equal(hasSummaryContent(null), false);
  assert.equal(hasSummaryContent({}), false);
  assert.equal(hasSummaryContent({overview: "", bullets: [], takeaways: [], insights: []}), false);
});

test("summary payloads with visible content render as generated summaries", () => {
  assert.equal(hasSummaryContent({overview: "Overview"}), true);
  assert.equal(hasSummaryContent({bullets: ["Key point"]}), true);
  assert.equal(hasSummaryContent({takeaways: [{text: "Takeaway"}]}), true);
  assert.equal(hasSummaryContent({insights: ["Insight"]}), true);
});
