import assert from "node:assert/strict";
import test from "node:test";
import {fitTaskStatusMessage, TASK_STATUS_MESSAGE_MAX_LENGTH} from "../src/lib/task-status-message";

test("limits task status messages to the database column length", () => {
  const message = "错".repeat(TASK_STATUS_MESSAGE_MAX_LENGTH + 1);

  assert.equal(
    fitTaskStatusMessage(message),
    "错".repeat(TASK_STATUS_MESSAGE_MAX_LENGTH)
  );
});

test("does not split Unicode code points when limiting a task status message", () => {
  const message = "😀".repeat(TASK_STATUS_MESSAGE_MAX_LENGTH + 1);
  const fitted = fitTaskStatusMessage(message);

  assert.equal(Array.from(fitted).length, TASK_STATUS_MESSAGE_MAX_LENGTH);
  assert.equal(fitted.endsWith("😀"), true);
});
