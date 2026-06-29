# UniScribe MySQL SQL 脚本说明

本目录交付可直接导入 MySQL/TiDB 的数据库 SQL。所有业务表和业务字段都包含中文 `COMMENT`，便于研发、运维和客户在数据库管理工具中直接理解字段含义。

## 初始化

全新数据库或需要重建的环境，执行合并脚本：

```bash
mysql -h HOST -u USER -p DATABASE < prisma/sql/all.sql
```

`all.sql` 会先 `DROP TABLE IF EXISTS` 再 `CREATE TABLE` 重建全部业务表，并写入演示数据与 QA 测试数据。生产已有数据的数据库不要直接执行该脚本。

生产环境若不需要种子数据，可删除脚本中「第二部分：演示数据」和「第三部分：QA 测试数据」段落后再导入。

QA 测试账号为 `qa@uniscribe.local`，原始密码为 `aa123456`。前端登录提交的是 `sha256(uniscribe-password-v1:${password})` 形式的 `passwordCredential`，`all.sql` 中的固定 `password_hash` 必须对这个 credential 做 scrypt 后生成。修改测试密码或认证算法后，请运行 `pnpm run auth:seed:check` 校验 SQL 种子数据。

## 字段长度规范

- 主键和外键 ID 使用 `VARCHAR(32)`，覆盖当前应用层 `cuid`，也预留后续短 ID 替换空间。
- 邮箱使用 `VARCHAR(320)`，覆盖 RFC 邮箱最大长度，避免长域名邮箱注册失败。
- URL 字段使用 `VARCHAR(2048)`，覆盖公开视频链接、R2 公网地址、预处理音频地址和导出文件地址。
- 文件名、视频标题使用 `VARCHAR(512)`，避免较长公开视频标题或本地文件名被截断。
- 对象存储 Key 使用 `VARCHAR(1024)`，支持日期目录、用户目录、随机 ID 和清理后的长文件名。
- User-Agent 使用 `VARCHAR(512)`，响应摘要和状态说明使用 `VARCHAR(1024)`，保留排障需要但避免日志字段无限膨胀。
- 令牌等敏感值只保存哈希，哈希字段使用 `VARCHAR(128)`，展示前缀使用 `VARCHAR(24)`。
- 大文本转写内容和用户编辑稿使用 `LONGTEXT`，分段、词级时间戳和 AI 洞察使用 `JSON`。
- Free 套餐默认额度统一为 120 分钟/月，和官网价格页、注册流程、OAuth 创建逻辑保持一致。

## 与 Prisma 的关系

`prisma/schema.prisma` 是应用运行时的模型来源，`prisma/sql/all.sql` 是带中文注释的 MySQL 交付脚本。修改数据模型时需要同步更新：

- `prisma/schema.prisma`
- `prisma/sql/all.sql`
- `product-doc.md` 和 `docs/deployment.md` 中的数据模型说明

本项目同时支持 `pnpm run prisma:push` 快速同步开发库，以及导入 SQL 文件让生产库保留中文字段注释。
