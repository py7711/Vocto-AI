import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const pageSource = readFileSync(new URL("../src/components/transcription-page.tsx", import.meta.url), "utf8");
const routeSource = readFileSync(new URL("../src/app/api/tasks/[taskId]/insights/single/route.ts", import.meta.url), "utf8");

test("mind-map regeneration uses its local loading state without publishing a full task snapshot", () => {
  assert.match(pageSource, /busy=\{generatingMindMap\}/);
  assert.doesNotMatch(routeSource, /publishTaskUpdate/);
});

test("mind-map nodes render as directly connected text without endpoint symbols", () => {
  const nodeRenderStart = pageSource.indexOf("{layout.nodes.map((item) => {");
  const nodeRenderEnd = pageSource.indexOf("</svg>", nodeRenderStart);
  const nodeRender = pageSource.slice(nodeRenderStart, nodeRenderEnd);

  assert.ok(nodeRenderStart > -1 && nodeRenderEnd > nodeRenderStart);
  assert.doesNotMatch(nodeRender, /<rect/);
  assert.match(nodeRender, /<text/);
  assert.doesNotMatch(nodeRender, /<circle/);
  assert.match(nodeRender, /textAnchor="start"/);
  assert.match(nodeRender, /x=\{textInset\}/);
});

test("mind-map full screen is portaled over the entire transcript page", () => {
  assert.match(pageSource, /createPortal/);
  assert.match(pageSource, /createPortal\(mindMapSurface, document\.body\)/);
  assert.match(pageSource, /className=\{clsx\("flex w-full flex-col bg-white", fullscreen \? "fixed inset-0 z-\[100\] h-\[100dvh\] w-screen overflow-hidden" : "relative min-h-\[420px\]"\)\}/);
  assert.match(pageSource, /fixed inset-0 z-\[100\] h-\[100dvh\] w-screen overflow-hidden/);
  assert.match(pageSource, /fullscreen \? "absolute inset-0 overflow-auto rounded-none border-0"/);
  assert.match(pageSource, /fullscreen \? "absolute right-5 top-5 z-20/);
  assert.match(pageSource, /calculateMindMapFitZoom/);
  assert.match(pageSource, /aria-label=\{copy\.closeFullScreen\}/);
  assert.match(pageSource, /onClick=\{\(\) => setFullscreen\(false\)\}/);
});

test("mind-map labels and connector spans stay compact", () => {
  assert.match(pageSource, /const leftPadding = 88/);
  assert.match(pageSource, /widestLineUnits \* 8\.6/);
  assert.match(pageSource, /const maxUnits = depth === 0 \? 16 : depth === 1 \? 18 : 20/);
  assert.match(pageSource, /depth === 0 \? 240 : 220/);
  assert.match(pageSource, /const levelGap = 72/);
});
