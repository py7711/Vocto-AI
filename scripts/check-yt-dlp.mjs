#!/usr/bin/env node
import {existsSync} from "node:fs";
import {spawn} from "node:child_process";
import {join} from "node:path";

const appDir = process.cwd();
const ytDlpPath = process.env.YT_DLP_PATH || "/root/.local/bin/yt-dlp";
const cookiesPath = process.env.YT_DLP_COOKIES_PATH || join(appDir, "config/youtube-cookies.txt");
const testUrl = process.argv[2] || "https://www.youtube.com/watch?v=wfEMxnfyNMI";

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {stdio: ["ignore", "pipe", "pipe"]});
    const chunks = [];
    const errors = [];
    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.stderr.on("data", (chunk) => errors.push(chunk));
    child.on("close", (code) => {
      resolve({
        code,
        stdout: Buffer.concat(chunks).toString("utf8"),
        stderr: Buffer.concat(errors).toString("utf8")
      });
    });
    child.on("error", (error) => {
      resolve({code: 1, stdout: "", stderr: error.message});
    });
  });
}

console.log("yt-dlp path:", ytDlpPath, existsSync(ytDlpPath) ? "OK" : "MISSING");
console.log("cookies path:", cookiesPath, existsSync(cookiesPath) ? "OK" : "MISSING");
console.log("node path:", process.execPath);
console.log("test url:", testUrl);

const args = [
  "--js-runtimes", `node:${process.execPath}`,
  "--remote-components", "ejs:github",
  "--extractor-args", "youtube:player_client=android,web",
  "--dump-json", "--no-playlist", "--skip-download", testUrl
];
if (existsSync(cookiesPath)) {
  args.unshift("--cookies", cookiesPath);
}

const result = await run(ytDlpPath, args);
if (result.code === 0) {
  const metadata = JSON.parse(result.stdout);
  console.log("yt-dlp metadata: OK");
  console.log("title:", metadata.title);
  console.log("duration:", metadata.duration);
  console.log("thumbnail:", metadata.thumbnail);
  process.exit(0);
}

console.error("yt-dlp metadata: FAILED");
console.error(result.stderr.trim() || result.stdout.trim());
if (/not a bot/i.test(result.stderr) && !existsSync(cookiesPath)) {
  console.error("\nHint: export YouTube cookies to config/youtube-cookies.txt then rerun.");
}
process.exit(1);
