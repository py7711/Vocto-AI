#!/usr/bin/env node
import {createHash} from "node:crypto";
import {chmod, mkdir, rename, rm, writeFile} from "node:fs/promises";
import {dirname, resolve} from "node:path";

const version = "2026.06.09";
const artifacts = {
  "linux-x64": {name: "yt-dlp_linux", sha256: "bf8aac79b72287a6d2043074415132558b43743a8f9461a22b0141e90f16ce66"},
  "linux-arm64": {name: "yt-dlp_linux_aarch64", sha256: "cabd246445bdfde0eda0dfe68bbe90354be83f3fdbbf077df11a2ea55f41cdbd"},
  "darwin-x64": {name: "yt-dlp_macos", sha256: "b82c3626952e6c14eaf654cc565866775ffd0b9ffb7021628ac59b42c2f4f244"},
  "darwin-arm64": {name: "yt-dlp_macos", sha256: "b82c3626952e6c14eaf654cc565866775ffd0b9ffb7021628ac59b42c2f4f244"}
};

const artifact = artifacts[`${process.platform}-${process.arch}`];
if (!artifact) {
  throw new Error(`Unsupported yt-dlp build target: ${process.platform}-${process.arch}`);
}

const target = resolve(process.env.YT_DLP_INSTALL_PATH || "vendor/yt-dlp");
const temporary = `${target}.download`;
const url = `https://github.com/yt-dlp/yt-dlp/releases/download/${version}/${artifact.name}`;
const response = await fetch(url, {redirect: "follow", signal: AbortSignal.timeout(120_000)});
if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);

const bytes = Buffer.from(await response.arrayBuffer());
const actualSha256 = createHash("sha256").update(bytes).digest("hex");
if (actualSha256 !== artifact.sha256) {
  throw new Error(`yt-dlp checksum mismatch: expected ${artifact.sha256}, received ${actualSha256}`);
}

await mkdir(dirname(target), {recursive: true});
await rm(temporary, {force: true});
await writeFile(temporary, bytes, {mode: 0o755});
await rename(temporary, target);
await chmod(target, 0o755);
console.log(`Installed yt-dlp ${version} to ${target}`);
