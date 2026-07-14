#!/usr/bin/env node
import {existsSync} from "node:fs";
import {copyFile, mkdtemp, rm} from "node:fs/promises";
import {spawn} from "node:child_process";
import {join} from "node:path";
import {tmpdir} from "node:os";

const appDir = process.cwd();
const expectedVersion = "2026.06.09";
const ytDlpPath = process.env.YT_DLP_PATH || "/root/.local/bin/yt-dlp";
const cookiesPath = process.env.YT_DLP_COOKIES_PATH || join(appDir, "config/youtube-cookies.txt");
const testUrlInput = process.argv[2] || "https://www.youtube.com/watch?v=wfEMxnfyNMI";

function canonicalizeYoutubeUrl(input) {
  if (input.length > 2048) throw new Error("YouTube URL is too long.");
  const parsed = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(input) ? input : `https://${input}`);
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  let videoId = null;
  if (host === "youtu.be") videoId = parsed.pathname.split("/").filter(Boolean)[0] || null;
  if (host === "youtube.com" || host.endsWith(".youtube.com")) {
    videoId = parsed.searchParams.get("v");
    if (!videoId) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const marker = parts.findIndex((part) => part === "embed" || part === "shorts" || part === "live");
      videoId = marker >= 0 ? parts[marker + 1] : null;
    }
  }
  if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) throw new Error("Invalid YouTube URL.");
  return `https://www.youtube.com/watch?v=${videoId}`;
}

const testUrl = canonicalizeYoutubeUrl(testUrlInput);

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
if (existsSync(cookiesPath)) {
  const content = await import("node:fs").then((fs) => fs.readFileSync(cookiesPath, "utf8"));
  const names = new Set();
  for (const line of content.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const parts = line.split("\t");
    if (parts.length >= 6 && parts[0].includes("youtube.com")) names.add(parts[5].trim());
  }
  const missing = ["SID", "HSID", "SSID"].filter((n) => !names.has(n));
  const hasSecure = names.has("__Secure-1PSID") || names.has("__Secure-3PSID");
  if (missing.length || !hasSecure) {
    console.error("cookies validation: INCOMPLETE (missing:", missing.join(", ") || "session", ")");
    console.error("Hint: export from logged-in browser using Get cookies.txt LOCALLY extension.");
  } else {
    console.log("cookies validation: OK");
  }
}
console.log("node path:", process.execPath);
console.log("test url:", testUrl);

const versionResult = await run(ytDlpPath, ["--version"]);
const installedVersion = versionResult.stdout.trim();
if (versionResult.code !== 0 || installedVersion !== expectedVersion) {
  console.error(`yt-dlp version: INVALID (expected ${expectedVersion}, received ${installedVersion || "unknown"})`);
  console.error(versionResult.stderr.trim());
  process.exit(1);
}
console.log("yt-dlp version:", installedVersion, "OK");

const args = [
  "--js-runtimes", `node:${process.execPath}`,
  "--dump-json", "--no-playlist", "--skip-download", "--", testUrl
];
let cookieTempDir;
if (existsSync(cookiesPath)) {
  // yt-dlp writes its cookie jar on exit. Use a temporary copy so a health check cannot mutate deployment config.
  cookieTempDir = await mkdtemp(join(tmpdir(), "votxt-yt-dlp-check-"));
  const temporaryCookiesPath = join(cookieTempDir, "cookies.txt");
  await copyFile(cookiesPath, temporaryCookiesPath);
  args.unshift("--cookies", temporaryCookiesPath);
}

const result = await run(ytDlpPath, args);
if (cookieTempDir) await rm(cookieTempDir, {recursive: true, force: true});
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
if (/not a bot/i.test(result.stderr)) {
  console.error("\nHint: cookies missing, invalid, or expired. Re-export from logged-in browser.");
}
process.exit(1);
