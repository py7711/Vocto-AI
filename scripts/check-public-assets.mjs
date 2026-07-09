import {readdirSync, readFileSync, statSync} from "node:fs";
import path from "node:path";

const publicDir = "public";
const searchRoots = ["src", "docs", "messages"];
const searchFiles = ["README.md", "product-doc.md", "next.config.mjs", "package.json"];
const conventionAssets = new Set([
  "/favicon.svg",
  "/votxt-logo.svg",
  "/votxt-logo-dark.svg",
  "/votxt-logo.png",
  "/votxt-logo-dark.png",
  "/votxt-app-icon.png",
  "/votxt-assets/arrow.svg",
  "/blog/mp3-to-srt-online-free/cover.svg",
  "/blog/mp4-to-text-online-free/cover.svg"
]);
const textExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".md", ".json", ".css", ".html"]);

function walkFiles(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = statSync(file);
    if (stat.isDirectory()) files.push(...walkFiles(file));
    else files.push(file);
  }
  return files;
}

const searchableFiles = [
  ...searchRoots.flatMap((root) => walkFiles(root).filter((file) => textExtensions.has(path.extname(file)))),
  ...searchFiles
];

const haystack = searchableFiles.map((file) => readFileSync(file, "utf8")).join("\n");
const unused = [];

for (const file of walkFiles(publicDir)) {
  const publicPath = file.replace(/^public/, "");
  const basename = path.basename(file);
  if (conventionAssets.has(publicPath)) continue;
  if (!haystack.includes(publicPath) && !haystack.includes(basename)) {
    unused.push(publicPath);
  }
}

if (unused.length) {
  console.error("发现未引用的 public 资源：");
  for (const file of unused) console.error(`- ${file}`);
  process.exit(1);
}

console.log("public 静态资源引用校验通过。");
