import {readFileSync} from "node:fs";
import {createHash, scryptSync} from "node:crypto";

const rawPassword = "aa123456";
const seedSalt = "votxt_seed_salt";
const expectedCredential = "sha256:275f58c01515f678aaa778b32ebdf093439f4704cf697879e904dda804b30f48";
const expectedHash = "scrypt:votxt_seed_salt:f4W5HcJrdfOMp32MBb2LASjszARbdIf3ba9AEeQzjejcvvxnVWrWevCHfqi3qRX6xtS9RTNyn7hi4cZpOuv2TQ";
const sqlFiles = ["prisma/sql/all.sql"];

function createPasswordCredential(password) {
  return `sha256:${createHash("sha256").update(`votxt-password-v1:${password}`).digest("hex")}`;
}

const credential = createPasswordCredential(rawPassword);
const seedHash = `scrypt:${seedSalt}:${scryptSync(credential, seedSalt, 64).toString("base64url")}`;

if (credential !== expectedCredential) {
  throw new Error(`QA 密码 credential 不匹配：${credential}`);
}

if (seedHash !== expectedHash) {
  throw new Error(`QA 种子密码哈希不匹配：${seedHash}`);
}

for (const file of sqlFiles) {
  const sql = readFileSync(file, "utf8");
  if (!sql.includes(expectedHash)) {
    throw new Error(`${file} 缺少 QA 账号 aa123456 对应的 password_hash。`);
  }
}

console.log("QA 账号密码种子数据校验通过。");
