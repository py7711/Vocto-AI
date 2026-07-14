import assert from "node:assert/strict";
import {mkdtempSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawnSync} from "node:child_process";
import test from "node:test";

test("console logger removes ANSI styling while preserving printable text", () => {
  const logDir = mkdtempSync(join(tmpdir(), "votxt-logger-"));

  try {
    const script = [
      'import {installConsoleLogger} from "./src/lib/logger.ts";',
      'installConsoleLogger({service: "web"});',
      'console.log(" \\u001b[32m\\u001b[1m✓\\u001b[22m\\u001b[39m", "中文已就绪");'
    ].join(" ");
    const result = spawnSync(process.execPath, ["--import", "tsx", "--eval", script], {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        LOG_DIR: logDir,
        LOG_TO_CONSOLE: "true"
      }
    });

    assert.equal(result.status, 0, result.stderr);
    const entry = JSON.parse(result.stdout.trim()) as {
      message: string;
      meta: {consoleArguments: string[]};
    };

    assert.equal(entry.message, " ✓ 中文已就绪");
    assert.deepEqual(entry.meta.consoleArguments, [" ✓", "中文已就绪"]);
    assert.doesNotMatch(result.stdout, /\\u001b\[/);
  } finally {
    rmSync(logDir, {recursive: true, force: true});
  }
});
