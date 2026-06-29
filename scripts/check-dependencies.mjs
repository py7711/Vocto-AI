import {existsSync, readFileSync, readdirSync, statSync} from "node:fs";
import path from "node:path";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};
const ignoredDirs = new Set([".git", ".next", "node_modules"]);
const scannedRoots = ["src", "scripts", "config", "messages", "docs"];
const scannedFiles = [
  "README.md",
  "product-doc.md",
  "middleware.ts",
  "next.config.mjs",
  "postcss.config.js",
  "tailwind.config.ts",
  "tsconfig.json",
  "package.json",
  "prisma/schema.prisma"
];
const textExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".css", ".prisma"]);
const implicitToolchainDependencies = new Set([
  "react-dom",
  "eslint-config-next",
  "@types/node",
  "@types/react",
  "@types/react-dom"
]);

function walkFiles(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    if (ignoredDirs.has(name)) continue;
    const file = path.join(dir, name);
    const stat = statSync(file);
    if (stat.isDirectory()) files.push(...walkFiles(file));
    else if (textExtensions.has(path.extname(file))) files.push(file);
  }
  return files;
}

const files = [
  ...scannedRoots.flatMap((root) => existsSync(root) ? walkFiles(root) : []),
  ...scannedFiles.filter((file) => existsSync(file))
];
const haystack = files.map((file) => readFileSync(file, "utf8")).join("\n");
const unused = [];

for (const name of Object.keys(dependencies).sort()) {
  if (implicitToolchainDependencies.has(name)) continue;
  if (!haystack.includes(name)) unused.push(name);
}

if (unused.length) {
  console.error("发现疑似未使用依赖：");
  for (const name of unused) console.error(`- ${name}`);
  console.error("如果依赖由框架隐式使用，请把原因写入 check-dependencies.mjs 的白名单。");
  process.exit(1);
}

console.log("依赖引用校验通过。");
