import assert from "node:assert/strict";
import test from "node:test";
import {calculateMindMapFitZoom} from "../src/lib/mind-map-viewport";

test("full-screen mind map fits inside the image-viewer viewport", () => {
  assert.equal(calculateMindMapFitZoom({
    contentWidth: 1800,
    contentHeight: 900,
    viewportWidth: 1440,
    viewportHeight: 900,
    padding: 40
  }), 0.76);
});

test("mind-map fit zoom stays within interactive zoom limits", () => {
  assert.equal(calculateMindMapFitZoom({
    contentWidth: 320,
    contentHeight: 240,
    viewportWidth: 1920,
    viewportHeight: 1080,
    padding: 40
  }), 1.15);
  assert.equal(calculateMindMapFitZoom({
    contentWidth: 5000,
    contentHeight: 4000,
    viewportWidth: 320,
    viewportHeight: 568,
    padding: 24
  }), 0.2);
});
