import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const shareRoute = readFileSync(new URL("../src/app/[locale]/share/[token]/page.tsx", import.meta.url), "utf8");
const detailPage = readFileSync(new URL("../src/components/transcription-page.tsx", import.meta.url), "utf8");
const sharedAdapter = readFileSync(new URL("../src/components/shared-transcription-page.tsx", import.meta.url), "utf8");

test("public shares reuse the transcript detail page in read-only mode", () => {
  assert.match(shareRoute, /SharedTranscriptionPage/);
  assert.doesNotMatch(shareRoute, /SharePage/);
  assert.match(detailPage, /shareToken\?: string/);
  assert.match(detailPage, /const readOnly = Boolean\(shareToken\)/);
  assert.match(detailPage, /initialTask\?: Task/);
  assert.match(detailPage, /if \(!readOnly \|\| !initialTask\) return;\s+setTask\(initialTask\)/);
});

test("public transcript detail uses token-scoped media and export APIs", () => {
  assert.match(detailPage, /`\/api\/share\/\$\{encodeURIComponent\(shareToken\)\}\/original-file`/);
  assert.match(detailPage, /`\/api\/share\/\$\{encodeURIComponent\(shareToken\)\}\/exports\/\$\{exportFormat\}`/);
});

test("read-only detail hides private controls at render boundaries", () => {
  assert.match(detailPage, /!readOnly \? \([\s\S]*copy\.shareDialogTitle/);
  assert.match(detailPage, /!readOnly \? \([\s\S]*detailCopy\.replaceTranscriptText/);
  assert.match(detailPage, /!readOnly && !ratingDismissed/);
  assert.match(detailPage, /!readOnly \? \([\s\S]*detailCopy\.editSegment/);
  assert.match(detailPage, /readOnly=\{readOnly\}/);
  assert.match(detailPage, /async function saveTranscript\(\) \{\s+if \(readOnly\) return;/);
  assert.match(detailPage, /async function generateSingleInsight[\s\S]*?\{\s+if \(readOnly\) return;/);
  assert.match(detailPage, /async function deleteTask\(\) \{\s+if \(readOnly\) return;/);
});

test("public task serialization uses an explicit safe field allowlist", () => {
  const initializerStart = sharedAdapter.indexOf("const publicTask: Task = {");
  const initializerEnd = sharedAdapter.indexOf("return <TranscriptionPage", initializerStart);
  assert.notEqual(initializerStart, -1);
  assert.notEqual(initializerEnd, -1);
  const publicTaskInitializer = sharedAdapter.slice(initializerStart, initializerEnd);

  assert.match(publicTaskInitializer, /sourceUrl: youtubeSourceUrl/);
  assert.doesNotMatch(publicTaskInitializer, /objectKey|normalizedUrl|mediaAssets|userId|teamId/);
});
