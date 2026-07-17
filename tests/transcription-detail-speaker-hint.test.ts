import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/components/transcription-page.tsx", import.meta.url), "utf8");

test("transcription detail omits the speaker-recognition hint control and popover", () => {
  assert.doesNotMatch(source, /aria-label=\{detailCopy\.speakerRecognitionDetails\}/);
  assert.doesNotMatch(source, /speakerHintOpen\s*&&\s*task\?\.transcript/);
});
