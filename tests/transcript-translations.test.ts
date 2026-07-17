import assert from "node:assert/strict";
import test from "node:test";
import {transcriptTranslationEntries, transcriptTranslations} from "../src/lib/transcript-translations";

test("translation JSON is exposed by locale", () => {
  const translations = {zh: {text: "你好"}, en: {text: "Hello"}};
  assert.equal(transcriptTranslations(translations).zh.text, "你好");
  assert.deepEqual(transcriptTranslationEntries(translations), [
    {locale: "zh", content: {text: "你好"}},
    {locale: "en", content: {text: "Hello"}}
  ]);
});

test("invalid translation JSON becomes an empty map", () => {
  assert.deepEqual(transcriptTranslations(null), {});
  assert.deepEqual(transcriptTranslations([]), {});
  assert.deepEqual(transcriptTranslationEntries("invalid"), []);
});
