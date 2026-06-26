-- Votxt MySQL 数据库结构初始化脚本
-- 说明：
-- 1. 本文件与 prisma/schema.prisma 的当前模型保持一致。
-- 2. 所有业务字段都带中文 COMMENT，便于在 MySQL/TiDB 管理工具中直接查看含义。
-- 3. 如需导入演示数据，请在执行本文件后再执行 001_initial_data.sql 和 002_test_data.sql。

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `ExportAsset`;
DROP TABLE IF EXISTS `ShareLink`;
DROP TABLE IF EXISTS `WebhookDelivery`;
DROP TABLE IF EXISTS `WebhookEndpoint`;
DROP TABLE IF EXISTS `AIInsight`;
DROP TABLE IF EXISTS `Transcript`;
DROP TABLE IF EXISTS `UsageLedger`;
DROP TABLE IF EXISTS `MediaTask`;
DROP TABLE IF EXISTS `Subscription`;
DROP TABLE IF EXISTS `EmailVerificationToken`;
DROP TABLE IF EXISTS `OAuthAccount`;
DROP TABLE IF EXISTS `AuditLog`;
DROP TABLE IF EXISTS `ApiKey`;
DROP TABLE IF EXISTS `TeamMember`;
DROP TABLE IF EXISTS `Team`;
DROP TABLE IF EXISTS `User`;
CREATE TABLE IF NOT EXISTS `User` (
  `id` VARCHAR(32) NOT NULL COMMENT '用户唯一 ID，应用层使用 cuid 生成',
  `email` VARCHAR(320) NOT NULL COMMENT '用户邮箱，登录和通知使用，按 RFC 邮箱最大长度预留',
  `password_hash` VARCHAR(255) NULL COMMENT '登录密码哈希，OAuth 用户可为空',
  `name` VARCHAR(120) NULL COMMENT '用户显示名称',
  `image` VARCHAR(2048) NULL COMMENT '用户头像 URL',
  `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER' COMMENT '用户角色：普通用户或管理员',
  `locale` VARCHAR(16) NOT NULL DEFAULT 'en' COMMENT '用户首选界面语言',
  `email_verified_at` DATETIME(3) NULL COMMENT '邮箱验证时间，为空表示未验证',
  `last_login_at` DATETIME(3) NULL COMMENT '用户最后登录时间',
  `dailyFreeCount` INT NOT NULL DEFAULT 0 COMMENT '免费用户当日已使用次数',
  `dailyResetAt` DATETIME(3) NULL COMMENT '免费次数下次重置时间',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '用户创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '用户更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表，保存账号、头像、语言和免费额度计数';

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

CREATE TABLE IF NOT EXISTS `WebhookEndpoint` (
  `id` VARCHAR(32) NOT NULL COMMENT 'Webhook Endpoint ID，应用层使用 cuid 生成',
  `teamId` VARCHAR(32) NOT NULL COMMENT '关联团队 ID',
  `name` VARCHAR(120) NOT NULL COMMENT 'Webhook 名称',
  `url` VARCHAR(2048) NOT NULL COMMENT '回调目标 URL',
  `secret_hash` VARCHAR(128) NOT NULL COMMENT 'Webhook 签名密钥哈希，数据库不保存明文密钥',
  `secret_prefix` VARCHAR(24) NOT NULL COMMENT 'Webhook 签名密钥前缀，只用于界面展示',
  `events` JSON NOT NULL COMMENT '订阅事件列表 JSON，例如 task.completed、task.failed',
  `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'Webhook 状态',
  `failure_count` INT NOT NULL DEFAULT 0 COMMENT '连续失败次数',
  `last_delivery_at` DATETIME(3) NULL COMMENT '最后投递时间',
  `created_by_id` VARCHAR(32) NULL COMMENT '创建人用户 ID',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Webhook 创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Webhook 更新时间',
  PRIMARY KEY (`id`),
  KEY `WebhookEndpoint_teamId_status_idx` (`teamId`, `status`),
  KEY `WebhookEndpoint_created_by_id_idx` (`created_by_id`),
  CONSTRAINT `WebhookEndpoint_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `WebhookEndpoint_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业 Webhook Endpoint 表，保存团队回调地址、订阅事件和签名密钥哈希';

CREATE TABLE IF NOT EXISTS `WebhookDelivery` (
  `id` VARCHAR(32) NOT NULL COMMENT 'Webhook 投递记录 ID，应用层使用 cuid 生成',
  `endpointId` VARCHAR(32) NOT NULL COMMENT '关联 Webhook Endpoint ID',
  `teamId` VARCHAR(32) NOT NULL COMMENT '关联团队 ID',
  `event` VARCHAR(80) NOT NULL COMMENT '事件类型',
  `target_type` VARCHAR(80) NOT NULL COMMENT '业务对象类型',
  `target_id` VARCHAR(80) NULL COMMENT '业务对象 ID',
  `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING' COMMENT '投递状态',
  `response_status` INT NULL COMMENT 'HTTP 响应状态码',
  `response_body` VARCHAR(1024) NULL COMMENT '响应或错误摘要',
  `duration_ms` INT NULL COMMENT '投递耗时毫秒',
  `payload` JSON NOT NULL COMMENT '事件载荷 JSON',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '投递创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '投递更新时间',
  PRIMARY KEY (`id`),
  KEY `WebhookDelivery_endpointId_createdAt_idx` (`endpointId`, `createdAt`),
  KEY `WebhookDelivery_teamId_createdAt_idx` (`teamId`, `createdAt`),
  KEY `WebhookDelivery_event_createdAt_idx` (`event`, `createdAt`),
  CONSTRAINT `WebhookDelivery_endpointId_fkey` FOREIGN KEY (`endpointId`) REFERENCES `WebhookEndpoint` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `WebhookDelivery_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业 Webhook 投递记录表，保存每次事件投递的状态、响应和载荷';

CREATE TABLE IF NOT EXISTS `Subscription` (
  `id` VARCHAR(32) NOT NULL COMMENT '订阅记录 ID，应用层使用 cuid 生成',
  `userId` VARCHAR(32) NOT NULL COMMENT '关联用户 ID',
  `plan` ENUM('FREE', 'BASIC', 'STANDARD', 'PRO', 'TEAM', 'ENTERPRISE') NOT NULL DEFAULT 'FREE' COMMENT '订阅套餐：免费版、基础版、标准版、专业版、团队版或企业合同版',
  `status` ENUM('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE') NOT NULL DEFAULT 'ACTIVE' COMMENT '订阅状态',
  `stripeCustomerId` VARCHAR(128) NULL COMMENT 'Stripe 客户 ID',
  `stripeSubscriptionId` VARCHAR(128) NULL COMMENT 'Stripe 订阅 ID',
  `monthlyMinuteQuota` INT NOT NULL DEFAULT 120 COMMENT '每月分钟额度',
  `remainingMinutes` INT NOT NULL DEFAULT 120 COMMENT '当前账期剩余可用分钟数',
  `maxSingleFileMinutes` INT NOT NULL DEFAULT 30 COMMENT '单次任务最大音视频分钟数',
  `maxUploadBytes` BIGINT NOT NULL DEFAULT 2147483648 COMMENT '单文件上传大小上限，单位为字节',
  `currentPeriodStart` DATETIME(3) NULL COMMENT '当前账期开始时间',
  `currentPeriodEnd` DATETIME(3) NULL COMMENT '当前账期结束时间',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '订阅创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '订阅更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Subscription_stripeCustomerId_key` (`stripeCustomerId`),
  UNIQUE KEY `Subscription_stripeSubscriptionId_key` (`stripeSubscriptionId`),
  KEY `Subscription_userId_idx` (`userId`),
  CONSTRAINT `Subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订阅表，保存套餐、额度、Stripe 订阅和账期信息';

CREATE TABLE IF NOT EXISTS `OAuthAccount` (
  `id` VARCHAR(32) NOT NULL COMMENT 'OAuth 账号绑定 ID，应用层使用 cuid 生成',
  `userId` VARCHAR(32) NOT NULL COMMENT '关联用户 ID',
  `provider` VARCHAR(32) NOT NULL COMMENT 'OAuth 服务商，例如 google',
  `provider_account_id` VARCHAR(191) NOT NULL COMMENT '服务商返回的用户唯一 ID',
  `email` VARCHAR(320) NULL COMMENT '服务商返回的邮箱',
  `avatar_url` VARCHAR(2048) NULL COMMENT '服务商返回的头像 URL',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'OAuth 账号绑定创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'OAuth 账号绑定更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `OAuthAccount_provider_provider_account_id_key` (`provider`, `provider_account_id`),
  KEY `OAuthAccount_userId_idx` (`userId`),
  CONSTRAINT `OAuthAccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='OAuth 账号绑定表，保存 Google 等第三方登录账号与本地用户的关系';

CREATE TABLE IF NOT EXISTS `EmailVerificationToken` (
  `id` VARCHAR(32) NOT NULL COMMENT '邮箱验证 Token ID，应用层使用 cuid 生成',
  `userId` VARCHAR(32) NOT NULL COMMENT '关联用户 ID',
  `token_hash` VARCHAR(128) NOT NULL COMMENT 'Token 哈希值，避免明文 Token 入库',
  `expires_at` DATETIME(3) NOT NULL COMMENT 'Token 过期时间',
  `used_at` DATETIME(3) NULL COMMENT 'Token 使用时间，为空表示未使用',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '邮箱验证 Token 创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `EmailVerificationToken_token_hash_key` (`token_hash`),
  KEY `EmailVerificationToken_userId_expires_at_idx` (`userId`, `expires_at`),
  CONSTRAINT `EmailVerificationToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='邮箱验证 Token 表，保存注册验证和重新发送验证邮件的短期 Token';

CREATE TABLE IF NOT EXISTS `MediaTask` (
  `id` VARCHAR(32) NOT NULL COMMENT '转写任务 ID，应用层使用 cuid 生成',
  `userId` VARCHAR(32) NULL COMMENT '关联用户 ID，匿名用户为空',
  `teamId` VARCHAR(32) NULL COMMENT '关联团队 ID，登录或 API Key 创建的任务默认进入团队空间',
  `sourceType` ENUM('UPLOAD', 'YOUTUBE') NOT NULL COMMENT '来源类型：上传文件或 YouTube 链接',
  `originalName` VARCHAR(512) NULL COMMENT '原始文件名或视频标题，兼容较长本地文件名和公开视频标题',
  `sourceUrl` VARCHAR(2048) NOT NULL COMMENT '原始媒体 URL、R2 对象 URL 或 YouTube 链接',
  `normalizedUrl` VARCHAR(2048) NULL COMMENT 'FFmpeg 预处理后的音频 URL',
  `objectKey` VARCHAR(1024) NULL COMMENT 'R2 对象存储 Key',
  `status` ENUM('UPLOADING', 'QUEUED', 'PROCESSING', 'TRANSCRIBING', 'ANALYZING', 'COMPLETED', 'FAILED', 'CANCELED') NOT NULL DEFAULT 'UPLOADING' COMMENT '当前处理状态',
  `statusMessage` VARCHAR(1024) NULL COMMENT '面向用户的状态说明或错误摘要',
  `language` VARCHAR(16) NULL COMMENT '转写语言代码，auto 表示自动检测',
  `detectedLanguage` VARCHAR(16) NULL COMMENT '服务商检测到的语言代码',
  `durationSeconds` INT NULL COMMENT '音视频时长，单位为秒',
  `fileSizeBytes` BIGINT NULL COMMENT '原始文件大小，单位为字节',
  `provider` VARCHAR(64) NULL COMMENT '实际完成转写的服务商',
  `speakerCount` INT NULL COMMENT '识别到的发言人数',
  `progress` INT NOT NULL DEFAULT 0 COMMENT '处理进度百分比，范围 0 到 100',
  `quotaMinutes` INT NOT NULL DEFAULT 0 COMMENT '本任务扣减的额度分钟数',
  `errorCode` VARCHAR(64) NULL COMMENT '错误代码，便于排查和统计',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '任务创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '任务更新时间',
  `completedAt` DATETIME(3) NULL COMMENT '任务完成时间',
  PRIMARY KEY (`id`),
  KEY `MediaTask_userId_createdAt_idx` (`userId`, `createdAt`),
  KEY `MediaTask_teamId_createdAt_idx` (`teamId`, `createdAt`),
  KEY `MediaTask_status_updatedAt_idx` (`status`, `updatedAt`),
  CONSTRAINT `MediaTask_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `MediaTask_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='媒体转写任务表，保存上传、队列、进度、服务商和失败信息';

CREATE TABLE IF NOT EXISTS `UsageLedger` (
  `id` VARCHAR(32) NOT NULL COMMENT '用量流水 ID，应用层使用 cuid 生成',
  `userId` VARCHAR(32) NOT NULL COMMENT '关联用户 ID',
  `subscriptionId` VARCHAR(32) NOT NULL COMMENT '关联订阅 ID',
  `mediaTaskId` VARCHAR(32) NULL COMMENT '关联任务 ID，手工调整时可为空',
  `type` ENUM('RESERVE', 'SETTLE', 'RELEASE', 'ADJUST') NOT NULL COMMENT '流水类型：预留、结算、释放或手工调整',
  `minutesDelta` INT NOT NULL COMMENT '分钟变化量，扣减为负数，释放或赠送为正数',
  `reason` VARCHAR(255) NULL COMMENT '流水备注，便于排查额度变化原因',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '用量流水创建时间',
  PRIMARY KEY (`id`),
  KEY `UsageLedger_userId_createdAt_idx` (`userId`, `createdAt`),
  KEY `UsageLedger_subscriptionId_createdAt_idx` (`subscriptionId`, `createdAt`),
  KEY `UsageLedger_mediaTaskId_idx` (`mediaTaskId`),
  CONSTRAINT `UsageLedger_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UsageLedger_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UsageLedger_mediaTaskId_fkey` FOREIGN KEY (`mediaTaskId`) REFERENCES `MediaTask` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用量流水表，记录任务预留、结算、释放和手工调整等额度变化';

CREATE TABLE IF NOT EXISTS `Transcript` (
  `id` VARCHAR(32) NOT NULL COMMENT '转写文本 ID，应用层使用 cuid 生成',
  `mediaTaskId` VARCHAR(32) NOT NULL COMMENT '关联转写任务 ID',
  `plainText` LONGTEXT NOT NULL COMMENT '完整纯文本转写结果',
  `segments` JSON NOT NULL COMMENT '带时间戳和发言人标签的段落 JSON',
  `words` JSON NULL COMMENT '词级时间戳与置信度 JSON',
  `editedText` LONGTEXT NULL COMMENT '用户编辑后的文本',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '转写结果创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '转写结果更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Transcript_mediaTaskId_key` (`mediaTaskId`),
  CONSTRAINT `Transcript_mediaTaskId_fkey` FOREIGN KEY (`mediaTaskId`) REFERENCES `MediaTask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='转写结果表，保存全文、分段、词级时间戳和用户编辑稿';

CREATE TABLE IF NOT EXISTS `AIInsight` (
  `id` VARCHAR(32) NOT NULL COMMENT 'AI 洞察 ID，应用层使用 cuid 生成',
  `mediaTaskId` VARCHAR(32) NOT NULL COMMENT '关联转写任务 ID',
  `type` ENUM('SUMMARY', 'MIND_MAP', 'QA', 'TRANSLATION') NOT NULL COMMENT '洞察类型：总结、思维导图、问答或翻译',
  `locale` VARCHAR(16) NOT NULL DEFAULT 'en' COMMENT '洞察生成语言',
  `title` VARCHAR(255) NULL COMMENT '洞察标题',
  `content` JSON NOT NULL COMMENT '洞察结构化内容 JSON',
  `model` VARCHAR(128) NULL COMMENT '生成洞察使用的模型',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '洞察创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '洞察更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `AIInsight_mediaTaskId_type_locale_key` (`mediaTaskId`, `type`, `locale`),
  CONSTRAINT `AIInsight_mediaTaskId_fkey` FOREIGN KEY (`mediaTaskId`) REFERENCES `MediaTask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI 洞察表，保存摘要、思维导图、问答和翻译结果';

CREATE TABLE IF NOT EXISTS `ExportAsset` (
  `id` VARCHAR(32) NOT NULL COMMENT '导出文件 ID，应用层使用 cuid 生成',
  `mediaTaskId` VARCHAR(32) NOT NULL COMMENT '关联转写任务 ID',
  `format` ENUM('TXT', 'SRT', 'VTT', 'JSON', 'PDF') NOT NULL COMMENT '导出格式',
  `objectKey` VARCHAR(1024) NULL COMMENT 'R2 对象 Key，保存持久化导出文件时使用',
  `url` VARCHAR(2048) NULL COMMENT '导出文件访问 URL',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '导出创建时间',
  PRIMARY KEY (`id`),
  KEY `ExportAsset_mediaTaskId_format_idx` (`mediaTaskId`, `format`),
  CONSTRAINT `ExportAsset_mediaTaskId_fkey` FOREIGN KEY (`mediaTaskId`) REFERENCES `MediaTask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='导出资产表，保存字幕、文本、JSON 和 PDF 等导出记录';

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

SET FOREIGN_KEY_CHECKS = 1;
