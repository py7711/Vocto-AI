-- Votxt 企业级团队空间、API Key 与审计日志增量迁移
-- 适用于已执行 003_auth_fields.sql、004_optimize_field_lengths.sql、005_oauth_email_verification.sql、006_usage_ledger.sql 的数据库。
-- 本脚本新增团队、成员、企业 API Key、审计日志，并把转写任务归属扩展为用户 + 团队双维度。

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `Team` (
  `id` VARCHAR(32) NOT NULL COMMENT '团队空间 ID，应用层使用 cuid 生成',
  `name` VARCHAR(160) NOT NULL COMMENT '团队名称',
  `slug` VARCHAR(80) NULL COMMENT '团队短标识，可用于后续公开链接或企业域名',
  `ownerId` VARCHAR(32) NOT NULL COMMENT '团队所有者用户 ID',
  `defaultLocale` VARCHAR(16) NOT NULL DEFAULT 'zh' COMMENT '团队默认界面语言',
  `retentionDays` INT NULL DEFAULT 180 COMMENT '企业数据保留天数，空值表示跟随系统默认策略',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '团队创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '团队更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Team_slug_key` (`slug`),
  KEY `Team_ownerId_createdAt_idx` (`ownerId`, `createdAt`),
  CONSTRAINT `Team_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='团队空间表，保存企业工作区、默认语言和数据保留策略';

CREATE TABLE IF NOT EXISTS `TeamMember` (
  `id` VARCHAR(32) NOT NULL COMMENT '团队成员记录 ID，应用层使用 cuid 生成',
  `teamId` VARCHAR(32) NOT NULL COMMENT '关联团队 ID',
  `userId` VARCHAR(32) NULL COMMENT '关联用户 ID，邀请未注册邮箱时为空',
  `invitedEmail` VARCHAR(320) NULL COMMENT '被邀请邮箱，便于未注册用户后续认领',
  `role` ENUM('OWNER', 'ADMIN', 'MEMBER', 'VIEWER') NOT NULL DEFAULT 'MEMBER' COMMENT '团队角色：所有者、管理员、成员或只读成员',
  `status` ENUM('ACTIVE', 'INVITED', 'DISABLED') NOT NULL DEFAULT 'ACTIVE' COMMENT '成员状态：已加入、已邀请或已停用',
  `title` VARCHAR(120) NULL COMMENT '团队内职务或备注',
  `invitedById` VARCHAR(32) NULL COMMENT '邀请发起人用户 ID',
  `joinedAt` DATETIME(3) NULL COMMENT '成员加入时间',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '成员记录创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '成员记录更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `TeamMember_teamId_userId_key` (`teamId`, `userId`),
  UNIQUE KEY `TeamMember_teamId_invitedEmail_key` (`teamId`, `invitedEmail`),
  KEY `TeamMember_userId_idx` (`userId`),
  KEY `TeamMember_teamId_role_idx` (`teamId`, `role`),
  CONSTRAINT `TeamMember_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `TeamMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='团队成员表，保存企业工作区成员、邀请邮箱、角色和状态';

CREATE TABLE IF NOT EXISTS `ApiKey` (
  `id` VARCHAR(32) NOT NULL COMMENT 'API Key 记录 ID，应用层使用 cuid 生成',
  `teamId` VARCHAR(32) NOT NULL COMMENT '关联团队 ID',
  `name` VARCHAR(120) NOT NULL COMMENT 'API Key 名称',
  `key_prefix` VARCHAR(24) NOT NULL COMMENT '明文 Key 前缀，只用于界面展示和排查',
  `key_hash` VARCHAR(128) NOT NULL COMMENT 'API Key 哈希值，数据库不保存明文 Key',
  `status` ENUM('ACTIVE', 'REVOKED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'API Key 状态',
  `created_by_id` VARCHAR(32) NULL COMMENT '创建人用户 ID',
  `last_used_at` DATETIME(3) NULL COMMENT '最后使用时间',
  `expires_at` DATETIME(3) NULL COMMENT '过期时间，为空表示长期有效',
  `revoked_at` DATETIME(3) NULL COMMENT '吊销时间',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'API Key 创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'API Key 更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ApiKey_key_prefix_key` (`key_prefix`),
  UNIQUE KEY `ApiKey_key_hash_key` (`key_hash`),
  KEY `ApiKey_teamId_status_idx` (`teamId`, `status`),
  KEY `ApiKey_created_by_id_idx` (`created_by_id`),
  CONSTRAINT `ApiKey_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ApiKey_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业 API Key 表，保存团队 API Key 的哈希、状态、过期时间和吊销信息';

CREATE TABLE IF NOT EXISTS `AuditLog` (
  `id` VARCHAR(32) NOT NULL COMMENT '审计日志 ID，应用层使用 cuid 生成',
  `teamId` VARCHAR(32) NULL COMMENT '关联团队 ID',
  `userId` VARCHAR(32) NULL COMMENT '操作用户 ID，系统或 API Key 自动操作时可为空',
  `action` VARCHAR(80) NOT NULL COMMENT '审计动作，例如 task.create、api_key.revoke',
  `target_type` VARCHAR(80) NOT NULL COMMENT '操作对象类型',
  `target_id` VARCHAR(80) NULL COMMENT '操作对象 ID',
  `ip_address` VARCHAR(64) NULL COMMENT '请求 IP 地址',
  `user_agent` VARCHAR(512) NULL COMMENT '请求 User-Agent',
  `metadata` JSON NULL COMMENT '结构化审计元数据',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '审计日志创建时间',
  PRIMARY KEY (`id`),
  KEY `AuditLog_teamId_createdAt_idx` (`teamId`, `createdAt`),
  KEY `AuditLog_userId_createdAt_idx` (`userId`, `createdAt`),
  KEY `AuditLog_action_createdAt_idx` (`action`, `createdAt`),
  CONSTRAINT `AuditLog_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业审计日志表，记录登录、任务、团队成员和 API Key 等关键操作';

ALTER TABLE `Subscription`
  MODIFY COLUMN `plan` ENUM('FREE', 'BASIC', 'STANDARD', 'PRO', 'TEAM', 'ENTERPRISE') NOT NULL DEFAULT 'FREE' COMMENT '订阅套餐：免费版、基础版、标准版、专业版、团队版或企业合同版';

ALTER TABLE `MediaTask`
  ADD COLUMN `teamId` VARCHAR(32) NULL COMMENT '关联团队 ID，登录或 API Key 创建的任务默认进入团队空间' AFTER `userId`;

CREATE INDEX `MediaTask_teamId_createdAt_idx` ON `MediaTask` (`teamId`, `createdAt`);

ALTER TABLE `MediaTask`
  ADD CONSTRAINT `MediaTask_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
