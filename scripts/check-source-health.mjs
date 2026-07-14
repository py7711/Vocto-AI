import {existsSync, readFileSync, readdirSync, statSync} from "node:fs";
import path from "node:path";

const sourceRoots = ["src", "config"];
const sourceExtensions = new Set([".ts", ".tsx", ".mjs"]);
const appEntrypointNames = new Set(["page.tsx", "route.ts", "layout.tsx", "not-found.tsx", "loading.tsx", "error.tsx", "global-error.tsx", "robots.ts", "sitemap.ts"]);
const scriptEntrypoints = [
  "scripts/check-auth-seed.mjs",
  "scripts/check-dependencies.mjs",
  "scripts/check-docs.mjs",
  "scripts/check-public-assets.mjs",
  "scripts/check-source-health.mjs",
  "scripts/check-structure.mjs",
  "scripts/generate-blog-covers.mjs"
];
const explicitEntrypoints = [
  "src/middleware.ts",
  "src/instrumentation.ts",
  "src/instrumentation.node.ts",
  "next.config.mjs",
  "tailwind.config.ts",
  "src/i18n.ts",
  "src/worker/transcribe-worker.ts",
  ...scriptEntrypoints
];
const globalTypeFiles = new Set(["src/types/lamejs.d.ts"]);
const failures = [];

function walkFiles(dir, predicate = () => true) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === ".git") continue;
    const file = path.join(dir, name);
    const stat = statSync(file);
    if (stat.isDirectory()) files.push(...walkFiles(file, predicate));
    else if (predicate(file)) files.push(file);
  }
  return files;
}

function normalize(file) {
  return file.replace(/\\/g, "/");
}

function sourceFiles() {
  return [
    ...sourceRoots.flatMap((root) => walkFiles(root, (file) => sourceExtensions.has(path.extname(file)))),
    ...scriptEntrypoints.filter((file) => existsSync(file)),
    ...explicitEntrypoints.filter((file) => existsSync(file))
  ].map(normalize).filter((file, index, all) => all.indexOf(file) === index);
}

const allSourceFiles = sourceFiles();
const sourceFileSet = new Set(allSourceFiles);

function resolveImport(fromFile, specifier) {
  if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return [];

  const base = specifier.startsWith("@/")
    ? path.join("src", specifier.slice(2))
    : path.join(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.mjs`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
    path.join(base, "route.ts"),
    path.join(base, "page.tsx")
  ].map(normalize);

  return candidates.filter((candidate) => sourceFileSet.has(candidate));
}

function importedFiles(file) {
  const text = readFileSync(file, "utf8");
  const imports = [];
  const patterns = [
    /(?:import|export)\s+(?:type\s+)?(?:[^"'()]+?\s+from\s+)?["']([^"']+)["']/g,
    /import\(\s*["']([^"']+)["']\s*\)/g
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      imports.push(...resolveImport(file, match[1]));
    }
  }
  return imports;
}

function checkReachability() {
  const entrypoints = new Set([
    ...allSourceFiles.filter((file) => file.startsWith("src/app/") && appEntrypointNames.has(path.basename(file))),
    ...explicitEntrypoints.filter((file) => sourceFileSet.has(file)),
    ...scriptEntrypoints.filter((file) => sourceFileSet.has(file)),
    ...globalTypeFiles
  ]);
  const reachable = new Set();
  const stack = [...entrypoints];

  while (stack.length) {
    const file = stack.pop();
    if (!file || reachable.has(file)) continue;
    reachable.add(file);
    for (const imported of importedFiles(file)) {
      if (!reachable.has(imported)) stack.push(imported);
    }
  }

  const unreachable = allSourceFiles.filter((file) => {
    if (reachable.has(file)) return false;
    if (file.endsWith(".d.ts") && globalTypeFiles.has(file)) return false;
    return file.startsWith("src/") || file.startsWith("config/") || file.startsWith("scripts/");
  });

  if (unreachable.length) {
    failures.push(`发现静态入口不可达的源码文件，请删除或在检查脚本中注明保留原因：\n${unreachable.map((file) => `  - ${file}`).join("\n")}`);
  }
}

function countChineseComments(file) {
  const text = readFileSync(file, "utf8");
  const lineComments = [...text.matchAll(/(^|\s)\/\/(?!\s*eslint-)[^\n\u4e00-\u9fff]*[\u4e00-\u9fff][^\n]*/gm)].length;
  const blockComments = [...text.matchAll(/\/\*[\s\S]*?[\u4e00-\u9fff][\s\S]*?\*\//g)].length;
  return lineComments + blockComments;
}

function lineCommentIndex(line) {
  let quote = null;
  let escaped = false;
  for (let index = 0; index < line.length - 1; index += 1) {
    const char = line[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "/" && line[index + 1] === "/") return index;
  }
  return -1;
}

function checkChineseComments() {
  const requiredCommentFiles = [
    "src/lib/auth.ts",
    "src/lib/usage.ts",
    "src/lib/queue.ts",
    "src/lib/redis.ts",
    "src/lib/storage.ts",
    "src/lib/tasks.ts",
    "src/lib/task-status.ts",
    "src/lib/task-retry.ts",
    "src/lib/transcription-compat.ts",
    "src/lib/multipart-upload-compat.ts",
    "src/lib/openapi.ts",
    "src/lib/developer-settings.ts",
    "src/lib/account-compat.ts",
    "src/lib/billing.ts",
    "src/lib/webhook-delivery.ts",
    "src/server/media/prepare.ts",
    "src/server/transcription/index.ts",
    "src/server/translation/index.ts",
    "src/worker/transcribe-worker.ts",
    "config/legacy-rewrites.mjs"
  ];

  const missing = requiredCommentFiles
    .filter((file) => existsSync(file))
    .filter((file) => countChineseComments(file) === 0);

  if (missing.length) {
    failures.push(`关键边界文件缺少中文注释：\n${missing.map((file) => `  - ${file}`).join("\n")}`);
  }

  const englishOnlyComments = [];
  for (const file of allSourceFiles.filter((item) => item.startsWith("src/") || item.startsWith("config/"))) {
    const lines = readFileSync(file, "utf8").split("\n");
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const commentIndex = lineCommentIndex(line);
      if (commentIndex < 0) continue;
      const comment = line.slice(commentIndex + 2).trim();
      if (!comment || comment.startsWith("eslint-") || /^https?:/.test(comment)) continue;
      if (/[A-Za-z]/.test(comment) && !/[\u4e00-\u9fff]/.test(comment)) {
        const codeBeforeComment = line.slice(0, commentIndex);
        if (codeBeforeComment.includes("http://") || codeBeforeComment.includes("https://")) continue;
        englishOnlyComments.push(`${file}:${index + 1} ${comment}`);
      }
    }
  }

  if (englishOnlyComments.length) {
    failures.push(`发现英文代码注释，请改为中文或说明其不是注释：\n${englishOnlyComments.map((item) => `  - ${item}`).join("\n")}`);
  }
}

checkReachability();
checkChineseComments();

if (failures.length) {
  console.error("源码健康校验失败：");
  for (const failure of failures) console.error(`\n${failure}`);
  process.exit(1);
}

console.log("源码可达性与中文注释覆盖校验通过。");
