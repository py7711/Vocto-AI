import {readdirSync, readFileSync, statSync} from "node:fs";
import path from "node:path";

const ignoredDirs = new Set([".git", ".next", "node_modules"]);
const expectedDocs = new Set([
  "README.md",
  "product-doc.md",
  "docs/deployment.md",
  "docs/project-structure.md",
  "prisma/sql/README.md"
]);
const forbiddenPatterns = [
  /Votxt/i,
  /VideoTranscriber/i,
  /竞品账号/,
  /竞品密码/,
  /复制克隆/,
  /read-only in this clone/i,
  /Build Command/,
  /Install Command/
];

function walkFiles(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    if (ignoredDirs.has(name)) continue;
    const file = path.join(dir, name);
    const stat = statSync(file);
    if (stat.isDirectory()) files.push(...walkFiles(file));
    else if (/\.mdx?$/.test(name)) files.push(file);
  }
  return files;
}

const docs = walkFiles(".").map((file) => file.replace(/^\.\//, "")).sort();
const unexpectedDocs = docs.filter((file) => !expectedDocs.has(file));
const missingDocs = [...expectedDocs].filter((file) => !docs.includes(file));
const failures = [];

if (unexpectedDocs.length) {
  failures.push(`发现未登记的 Markdown 文档：${unexpectedDocs.join(", ")}`);
}

if (missingDocs.length) {
  failures.push(`缺少必要 Markdown 文档：${missingDocs.join(", ")}`);
}

for (const file of docs) {
  const text = readFileSync(file, "utf8");
  const hanCount = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  if (hanCount < 50) failures.push(`${file} 中文内容过少，请确认不是英文过程文档或临时材料。`);
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(text)) failures.push(`${file} 命中禁止内容：${pattern}`);
  }
}

if (failures.length) {
  console.error("项目文档校验失败：");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("项目文档中文化与登记校验通过。");
