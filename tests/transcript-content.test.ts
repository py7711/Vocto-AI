import assert from "node:assert/strict";
import test from "node:test";
import {transcriptText} from "../src/lib/transcript-content";

test("edited transcript text is the canonical full text", () => {
  assert.equal(transcriptText({editedText: " Edited text ", segments: [{text: "Segment text"}]}), "Edited text");
});

test("segment text is joined when edited text is empty", () => {
  assert.equal(transcriptText({editedText: "", segments: [{text: "First"}, {text: "Second"}]}), "First\n\nSecond");
});

test("invalid or empty transcript content produces an empty string", () => {
  assert.equal(transcriptText({segments: [{start: 0}, null]}), "");
  assert.equal(transcriptText(null), "");
});
