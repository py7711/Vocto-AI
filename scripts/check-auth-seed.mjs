import {readFileSync} from "node:fs";
import {createHash, scryptSync} from "node:crypto";

const rawPassword = "aa123456";
const seedSalt = "uniscribe_seed_salt";
const expectedCredential = "sha256:4a2cd5cd5f2cd1531e4e97c6852efb529e3e201e8abe60e707e9c639e8ed49dd";
const expectedHash = "scrypt:uniscribe_seed_salt:77JAoUhIrsHWYj5Ky3sPzgZWxm5oQjsvpfSjNk0wIhslHeg_cIxeGpSf0UfNSvBVkpAtv2Ybifyn6Kq3iTtvWw";
const sqlFiles = ["prisma/sql/all.sql"];

function createPasswordCredential(password) {
  return `sha256:${createHash("sha256").update(`uniscribe-password-v1:${password}`).digest("hex")}`;
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
