import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const schema = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");
const migration = readFileSync(new URL("../prisma/sql/20260716_transcript_insights.sql", import.meta.url), "utf8");
const translationWriter = readFileSync(new URL("../src/server/transcript-translations.ts", import.meta.url), "utf8");
const generationLimit = readFileSync(new URL("../src/server/ai/summary-generation-limit.ts", import.meta.url), "utf8");

test("Transcript owns generated content without plainText or AIInsight", () => {
  const transcriptModel = schema.slice(schema.indexOf("model Transcript {"), schema.indexOf("model TranscriptRating {"));
  assert.match(transcriptModel, /summary\s+Json\?/);
  assert.match(transcriptModel, /mindMap\s+Json\?/);
  assert.match(transcriptModel, /translations\s+Json\?/);
  assert.doesNotMatch(transcriptModel, /\bqa\b/);
  assert.doesNotMatch(transcriptModel, /plainText/);
  assert.doesNotMatch(schema, /model AIInsight/);
  assert.doesNotMatch(migration, /ADD COLUMN `qa`/);
});

test("locale translations and free summary slots use atomic database updates", () => {
  assert.match(translationWriter, /JSON_SET\(COALESCE\(translations, JSON_OBJECT\(\)\)/);
  assert.match(generationLimit, /summaryGenerationCount: \{lt: FREE_SUMMARY_GENERATION_LIMIT\}/);
  assert.match(generationLimit, /summaryGenerationCount: \{increment: 1\}/);
});

test("migration preserves full text before dropping legacy storage", () => {
  const copyText = migration.indexOf("SET `editedText` = COALESCE(`editedText`, `plainText`)");
  const dropInsight = migration.indexOf("DROP TABLE IF EXISTS `AIInsight`");
  const dropText = migration.indexOf("DROP COLUMN `plainText`");
  assert.ok(copyText > -1);
  assert.ok(dropInsight > copyText);
  assert.ok(dropText > dropInsight);
});
