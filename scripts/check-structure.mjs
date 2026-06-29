import {createHash} from "node:crypto";
import {existsSync, readFileSync, readdirSync, statSync} from "node:fs";
import path from "node:path";

const failures = [];
const ignoredDirs = new Set([".git", ".next", "node_modules"]);
const appDir = "src/app";

function walkFiles(dir, predicate = () => true) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const name of readdirSync(dir)) {
    if (ignoredDirs.has(name)) continue;
    const file = path.join(dir, name);
    const stat = statSync(file);
    if (stat.isDirectory()) files.push(...walkFiles(file, predicate));
    else if (predicate(file)) files.push(file);
  }
  return files;
}

function routePathFromAppFile(file) {
  const dirname = path.dirname(file).replace(/^src\/app/, "");
  return dirname ? dirname.replace(/\\/g, "/") : "/";
}

function apiRoutePath(file) {
  return routePathFromAppFile(file).replace(/\[([^\]]+)\]/g, ":$1");
}

function localePagePath(file) {
  return routePathFromAppFile(file);
}

function normalizeForHash(text) {
  return text.trim().replace(/\s+/g, " ");
}

function report(title, items) {
  if (!items.length) return;
  failures.push(`${title}\n${items.map((item) => `  - ${item}`).join("\n")}`);
}

function checkDuplicateRoutesAndPages() {
  const files = walkFiles(appDir, (file) => ["route.ts", "page.tsx"].includes(path.basename(file)));
  const byHash = new Map();
  for (const file of files) {
    const hash = createHash("sha1").update(normalizeForHash(readFileSync(file, "utf8"))).digest("hex");
    if (!byHash.has(hash)) byHash.set(hash, []);
    byHash.get(hash).push(file);
  }

  const duplicates = [...byHash.values()].filter((group) => group.length > 1).map((group) => group.join(", "));
  report("发现内容完全相同的 route.ts/page.tsx，请确认不是重复兼容代理：", duplicates);
}

function checkAppImportTargets() {
  const files = walkFiles("src", (file) => /\.(ts|tsx)$/.test(file));
  const missing = [];
  const importPattern = /(?:from\s+|import\()\s*["'](@\/app\/[^"']+)["']/g;

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(importPattern)) {
      const spec = match[1].replace("@/", "src/");
      const candidates = [
        `${spec}.ts`,
        `${spec}.tsx`,
        path.join(spec, "route.ts"),
        path.join(spec, "page.tsx"),
        path.join(spec, "index.ts")
      ];
      if (!candidates.some((candidate) => existsSync(candidate))) {
        missing.push(`${file} -> ${match[1]}`);
      }
    }
  }

  report("发现 @/app 导入目标不存在：", missing);
}

function checkProductDocApiCoverage() {
  const doc = readFileSync("product-doc.md", "utf8").replace(/\[([^\]/]+)\]/g, ":$1");
  const routes = walkFiles("src/app/api", (file) => path.basename(file) === "route.ts").map(apiRoutePath).sort();
  const missing = routes.filter((route) => !doc.includes(route));
  report("product-doc.md 未覆盖当前 /api 路由：", missing);
}

function checkProductDocPageCoverage() {
  const doc = readFileSync("product-doc.md", "utf8");
  const files = walkFiles(path.join(appDir, "[locale]"), (file) => path.basename(file) === "page.tsx");
  const ignoredPages = new Set([
    "/[locale]/auth/callback",
    "/[locale]/auth/verify-email"
  ]);
  const pages = files.map(localePagePath).filter((page) => !ignoredPages.has(page)).sort();
  const missing = pages.filter((page) => !doc.includes(page));
  report("product-doc.md 未覆盖当前多语言页面路由：", missing);
}

function checkPrismaSqlTables() {
  const schema = readFileSync("prisma/schema.prisma", "utf8");
  const sql = readFileSync("prisma/sql/all.sql", "utf8");
  const models = [...schema.matchAll(/^model\s+(\w+)\s+\{/gm)].map((match) => match[1]).sort();
  const tables = [...sql.matchAll(/CREATE TABLE(?: IF NOT EXISTS)? `([^`]+)`/g)].map((match) => match[1]).sort();
  const missingInSql = models.filter((model) => !tables.includes(model));
  const extraInSql = tables.filter((table) => !models.includes(table));

  report("prisma/sql/all.sql 缺少 Prisma model 对应表：", missingInSql);
  report("prisma/sql/all.sql 存在 Prisma schema 未声明的表：", extraInSql);
}

function checkRemovedSqlReferences() {
  const forbiddenSqlFiles = [
    "000_schema_with_comments.sql",
    "001_initial_data.sql",
    "002_test_data.sql",
    "003_auth_fields.sql",
    "004_optimize_field_lengths.sql",
    "005_oauth_email_verification.sql",
    "006_usage_ledger.sql",
    "007_enterprise_workspace.sql",
    "008_share_links.sql",
    "009_webhook_endpoints.sql",
    "010_align_free_plan_defaults.sql"
  ];
  const files = [
    ...walkFiles("docs", (file) => /\.(md|ts|tsx|js|mjs|json)$/.test(file)),
    ...walkFiles("prisma", (file) => /\.(md|sql|prisma)$/.test(file)),
    ...walkFiles("scripts", (file) => /\.(mjs|js|ts)$/.test(file)),
    "README.md",
    "product-doc.md",
    "package.json"
  ].filter((file) => existsSync(file) && file !== "scripts/check-structure.mjs");

  const hits = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const name of forbiddenSqlFiles) {
      if (text.includes(name)) hits.push(`${file} -> ${name}`);
    }
  }

  report("发现已删除的分散 SQL 脚本引用：", hits);
}

checkDuplicateRoutesAndPages();
checkAppImportTargets();
checkProductDocApiCoverage();
checkProductDocPageCoverage();
checkPrismaSqlTables();
checkRemovedSqlReferences();

if (failures.length) {
  console.error("项目结构校验失败：");
  for (const failure of failures) console.error(`\n${failure}`);
  process.exit(1);
}

console.log("项目结构、路由文档覆盖和 Prisma/SQL 一致性校验通过。");
