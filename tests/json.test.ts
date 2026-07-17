import assert from "node:assert/strict";
import test from "node:test";
import {jsonSafe, jsonStringifySafe} from "../src/lib/json";

test("serializes nested BigInt values for realtime task snapshots", () => {
  const input = {id: "task-1", fileSizeBytes: BigInt(42), asset: {sizeBytes: BigInt(99)}};

  assert.equal(
    jsonStringifySafe(input),
    '{"id":"task-1","fileSizeBytes":"42","asset":{"sizeBytes":"99"}}'
  );
  assert.deepEqual(jsonSafe(input), {
    id: "task-1",
    fileSizeBytes: "42",
    asset: {sizeBytes: "99"}
  });
});
