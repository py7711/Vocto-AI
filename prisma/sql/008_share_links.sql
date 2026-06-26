-- Votxt 公开分享链接增量迁移
-- 适用于已执行 007_enterprise_workspace.sql 的数据库。
-- 本脚本新增只读公开分享能力，数据库只保存 Token 哈希，不保存明文分享 Token。

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `ShareLink` (
  `id` VARCHAR(32) NOT NULL COMMENT '分享链接 ID，应用层使用 cuid 生成',
  `teamId` VARCHAR(32) NULL COMMENT '关联团队 ID',
  `mediaTaskId` VARCHAR(32) NOT NULL COMMENT '关联转写任务 ID',
  `created_by_id` VARCHAR(32) NULL COMMENT '创建人用户 ID',
  `token_hash` VARCHAR(128) NOT NULL COMMENT '分享 Token 哈希值，数据库不保存明文 Token',
  `title` VARCHAR(160) NULL COMMENT '分享链接标题',
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '分享链接是否启用',
  `expires_at` DATETIME(3) NULL COMMENT '过期时间，为空表示长期有效',
  `access_count` INT NOT NULL DEFAULT 0 COMMENT '访问次数',
  `last_access_at` DATETIME(3) NULL COMMENT '最后访问时间',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '分享链接创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '分享链接更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ShareLink_token_hash_key` (`token_hash`),
  KEY `ShareLink_teamId_createdAt_idx` (`teamId`, `createdAt`),
  KEY `ShareLink_mediaTaskId_createdAt_idx` (`mediaTaskId`, `createdAt`),
  KEY `ShareLink_created_by_id_idx` (`created_by_id`),
  CONSTRAINT `ShareLink_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ShareLink_mediaTaskId_fkey` FOREIGN KEY (`mediaTaskId`) REFERENCES `MediaTask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ShareLink_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公开分享链接表，保存分享 Token 哈希、过期时间、访问次数和任务关联';
