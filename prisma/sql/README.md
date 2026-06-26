# Votxt MySQL SQL 脚本说明

本目录用于交付可直接导入 MySQL/TiDB 的数据库 SQL。所有业务表和业务字段都包含中文 `COMMENT`，便于研发、运维和客户在数据库管理工具中直接理解字段含义。

## 1. 新数据库初始化

全新数据库优先执行完整初始化脚本：

```bash
mysql -h HOST -u USER -p DATABASE < prisma/sql/000_schema_with_comments.sql
```

`000_schema_with_comments.sql` 会先 `DROP TABLE IF EXISTS` 再重建全部业务表，适合空库、测试库和可重建环境。生产已有数据的数据库不要直接执行该脚本。

如需写入演示数据，再执行：

```bash
mysql -h HOST -u USER -p DATABASE < prisma/sql/001_initial_data.sql
mysql -h HOST -u USER -p DATABASE < prisma/sql/002_test_data.sql
```

## 2. 旧数据库升级顺序

已有数据库请先备份，再按下面顺序执行增量脚本：

```bash
pnpm exec prisma db execute --file prisma/sql/003_auth_fields.sql --schema prisma/schema.prisma
pnpm exec prisma db execute --file prisma/sql/004_optimize_field_lengths.sql --schema prisma/schema.prisma
pnpm exec prisma db execute --file prisma/sql/005_oauth_email_verification.sql --schema prisma/schema.prisma
pnpm exec prisma db execute --file prisma/sql/006_usage_ledger.sql --schema prisma/schema.prisma
pnpm exec prisma db execute --file prisma/sql/007_enterprise_workspace.sql --schema prisma/schema.prisma
pnpm exec prisma db execute --file prisma/sql/008_share_links.sql --schema prisma/schema.prisma
pnpm exec prisma db execute --file prisma/sql/009_webhook_endpoints.sql --schema prisma/schema.prisma
pnpm exec prisma db execute --file prisma/sql/010_align_free_plan_defaults.sql --schema prisma/schema.prisma
```

这些增量脚本面向“从旧版 Votxt 升级到当前商业化版本”的数据库。部分 `ALTER TABLE ADD COLUMN` 语句不是完全幂等的，如果某个字段已经存在，需要跳过对应脚本或按实际表结构手工调整。

## 3. 字段长度优化原则

- 主键和外键 ID 使用 `VARCHAR(32)`，覆盖当前应用层 `cuid`，也预留后续短 ID 替换空间。
- 邮箱使用 `VARCHAR(320)`，覆盖 RFC 邮箱最大长度，避免企业长域名邮箱注册失败。
- URL 字段使用 `VARCHAR(2048)`，覆盖公开视频链接、R2 公网地址、预处理音频地址和导出文件地址。
- 文件名、视频标题使用 `VARCHAR(512)`，避免较长公开视频标题或本地文件名被截断。
- 对象存储 Key 使用 `VARCHAR(1024)`，支持日期目录、团队目录、随机 ID 和清理后的长文件名。
- User-Agent 使用 `VARCHAR(512)`，响应摘要和状态说明使用 `VARCHAR(1024)`，保留排障需要但避免日志字段无限膨胀。
- Token、API Key、Webhook 签名等敏感值只保存哈希，哈希字段使用 `VARCHAR(128)`，展示前缀使用 `VARCHAR(24)`。
- 大文本转写内容和用户编辑稿使用 `LONGTEXT`，分段、词级时间戳、AI 洞察、Webhook 载荷使用 `JSON`。
- Free 套餐默认额度统一为 120 分钟/月，和官网价格页、注册流程、OAuth 创建逻辑保持一致。

## 4. 与 Prisma 的关系

`prisma/schema.prisma` 是应用运行时的模型来源，`000_schema_with_comments.sql` 是带中文注释的 MySQL 交付脚本。修改数据模型时需要同步更新：

- `prisma/schema.prisma`
- `prisma/sql/000_schema_with_comments.sql`
- 对应的增量迁移脚本
- `product-doc.md` 和 `docs/deployment.md` 中的数据模型说明

本项目同时支持 `pnpm run prisma:push` 快速同步开发库，以及导入 SQL 文件让生产库保留中文字段注释。
