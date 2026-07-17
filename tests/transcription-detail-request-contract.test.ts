import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/components/transcription-page.tsx", import.meta.url), "utf8");
const routeSource = readFileSync(new URL("../src/app/api/tasks/[taskId]/route.ts", import.meta.url), "utf8");

test("transcription detail eagerly loads only its task resource", () => {
  const eagerLoadSection = source.slice(0, source.indexOf("new EventSource"));
  assert.doesNotMatch(eagerLoadSection, /fetch\(["'`]\/api\/auth\/me/);
  assert.doesNotMatch(eagerLoadSection, /fetch\(["'`]\/api\/folders/);
  assert.doesNotMatch(eagerLoadSection, /\/share\?/);
});

test("transcription detail does not combine SSE with interval polling", () => {
  assert.match(source, /new EventSource\(`/);
  assert.doesNotMatch(source, /window\.setInterval\(/);
});

test("task detail GET queries Transcript without eager operation relations", () => {
  const getHandler = routeSource.slice(routeSource.indexOf("export async function GET"), routeSource.indexOf("export async function PATCH"));
  assert.match(getHandler, /transcript:\s*\{/);
  assert.doesNotMatch(getHandler, /exports:\s*true/);
  assert.doesNotMatch(getHandler, /mediaAssets:\s*\{/);
  assert.doesNotMatch(getHandler, /shareLinks:\s*\{/);
  assert.doesNotMatch(getHandler, /ratings:\s*\{/);
  assert.doesNotMatch(getHandler, /folder:\s*\{/);
});
