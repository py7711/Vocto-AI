-- 优化 Votxt 业务字段长度
-- 适用于已经执行旧版建表脚本的 MySQL/TiDB 数据库。
-- 目的：
-- 1. 显式对齐 Prisma schema 中的 @db.VarChar 长度，避免不同环境生成默认长度不一致。
-- 2. 扩大真实业务中容易超长的字段，例如邮箱、公开视频标题、URL、对象存储 Key。
-- 3. 保留所有字段中文 COMMENT，方便数据库管理工具直接查看字段含义。

SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `ExportAsset` DROP FOREIGN KEY `ExportAsset_mediaTaskId_fkey`;
ALTER TABLE `AIInsight` DROP FOREIGN KEY `AIInsight_mediaTaskId_fkey`;
ALTER TABLE `Transcript` DROP FOREIGN KEY `Transcript_mediaTaskId_fkey`;
ALTER TABLE `MediaTask` DROP FOREIGN KEY `MediaTask_userId_fkey`;
ALTER TABLE `Subscription` DROP FOREIGN KEY `Subscription_userId_fkey`;

ALTER TABLE `User`
  MODIFY COLUMN `id` VARCHAR(32) NOT NULL COMMENT '用户唯一 ID，应用层使用 cuid 生成',
  MODIFY COLUMN `email` VARCHAR(320) NOT NULL COMMENT '用户邮箱，登录和通知使用，按 RFC 邮箱最大长度预留',
  MODIFY COLUMN `password_hash` VARCHAR(255) NULL COMMENT '登录密码哈希，OAuth 用户可为空',
  MODIFY COLUMN `name` VARCHAR(120) NULL COMMENT '用户显示名称',
  MODIFY COLUMN `image` VARCHAR(2048) NULL COMMENT '用户头像 URL',
  MODIFY COLUMN `locale` VARCHAR(16) NOT NULL DEFAULT 'en' COMMENT '用户首选界面语言';

ALTER TABLE `Subscription`
  MODIFY COLUMN `id` VARCHAR(32) NOT NULL COMMENT '订阅记录 ID，应用层使用 cuid 生成',
  MODIFY COLUMN `userId` VARCHAR(32) NOT NULL COMMENT '关联用户 ID',
  MODIFY COLUMN `stripeCustomerId` VARCHAR(128) NULL COMMENT 'Stripe 客户 ID',
  MODIFY COLUMN `stripeSubscriptionId` VARCHAR(128) NULL COMMENT 'Stripe 订阅 ID';

ALTER TABLE `MediaTask`
  MODIFY COLUMN `id` VARCHAR(32) NOT NULL COMMENT '转写任务 ID，应用层使用 cuid 生成',
  MODIFY COLUMN `userId` VARCHAR(32) NULL COMMENT '关联用户 ID，匿名用户为空',
  MODIFY COLUMN `originalName` VARCHAR(512) NULL COMMENT '原始文件名或视频标题，兼容较长本地文件名和公开视频标题',
  MODIFY COLUMN `sourceUrl` VARCHAR(2048) NOT NULL COMMENT '原始媒体 URL、R2 对象 URL 或 YouTube 链接',
  MODIFY COLUMN `normalizedUrl` VARCHAR(2048) NULL COMMENT 'FFmpeg 预处理后的音频 URL',
  MODIFY COLUMN `objectKey` VARCHAR(1024) NULL COMMENT 'R2 对象存储 Key',
  MODIFY COLUMN `statusMessage` VARCHAR(1024) NULL COMMENT '面向用户的状态说明或错误摘要',
  MODIFY COLUMN `language` VARCHAR(16) NULL COMMENT '转写语言代码，auto 表示自动检测',
  MODIFY COLUMN `detectedLanguage` VARCHAR(16) NULL COMMENT '服务商检测到的语言代码',
  MODIFY COLUMN `provider` VARCHAR(64) NULL COMMENT '实际完成转写的服务商',
  MODIFY COLUMN `errorCode` VARCHAR(64) NULL COMMENT '错误代码，便于排查和统计';

ALTER TABLE `Transcript`
  MODIFY COLUMN `id` VARCHAR(32) NOT NULL COMMENT '转写文本 ID，应用层使用 cuid 生成',
  MODIFY COLUMN `mediaTaskId` VARCHAR(32) NOT NULL COMMENT '关联转写任务 ID';

ALTER TABLE `AIInsight`
  MODIFY COLUMN `id` VARCHAR(32) NOT NULL COMMENT 'AI 洞察 ID，应用层使用 cuid 生成',
  MODIFY COLUMN `mediaTaskId` VARCHAR(32) NOT NULL COMMENT '关联转写任务 ID',
  MODIFY COLUMN `locale` VARCHAR(16) NOT NULL DEFAULT 'en' COMMENT '洞察生成语言',
  MODIFY COLUMN `title` VARCHAR(255) NULL COMMENT '洞察标题',
  MODIFY COLUMN `model` VARCHAR(128) NULL COMMENT '生成洞察使用的模型';

ALTER TABLE `ExportAsset`
  MODIFY COLUMN `id` VARCHAR(32) NOT NULL COMMENT '导出文件 ID，应用层使用 cuid 生成',
  MODIFY COLUMN `mediaTaskId` VARCHAR(32) NOT NULL COMMENT '关联转写任务 ID',
  MODIFY COLUMN `objectKey` VARCHAR(1024) NULL COMMENT 'R2 对象 Key，保存持久化导出文件时使用',
  MODIFY COLUMN `url` VARCHAR(2048) NULL COMMENT '导出文件访问 URL';

ALTER TABLE `Subscription`
  ADD CONSTRAINT `Subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `MediaTask`
  ADD CONSTRAINT `MediaTask_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Transcript`
  ADD CONSTRAINT `Transcript_mediaTaskId_fkey` FOREIGN KEY (`mediaTaskId`) REFERENCES `MediaTask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `AIInsight`
  ADD CONSTRAINT `AIInsight_mediaTaskId_fkey` FOREIGN KEY (`mediaTaskId`) REFERENCES `MediaTask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ExportAsset`
  ADD CONSTRAINT `ExportAsset_mediaTaskId_fkey` FOREIGN KEY (`mediaTaskId`) REFERENCES `MediaTask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
