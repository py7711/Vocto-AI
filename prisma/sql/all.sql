-- Votxt MySQL 完整数据库脚本
-- 与 prisma/schema.prisma 当前模型保持一致。
--
-- 用法：
--   mysql -h HOST -u USER -p DATABASE < prisma/sql/all.sql
--
-- 说明：
-- 1. 执行前会先 DROP 全部业务表，再重新 CREATE，适合空库、测试库和可重建环境。
-- 2. 所有业务字段均带中文 COMMENT，字段长度遵循项目规范：
--    - 主键/外键 ID：VARCHAR(32)
--    - 邮箱：VARCHAR(320)
--    - URL：VARCHAR(2048)
--    - 文件名/视频标题：VARCHAR(512)
--    - 对象存储 Key：VARCHAR(1024)
--    - 令牌/哈希：VARCHAR(128)，展示前缀：VARCHAR(24)
--    - User-Agent：VARCHAR(512)，状态/响应摘要：VARCHAR(1024)
--    - 大文本：LONGTEXT，结构化数据：JSON
-- 3. 脚本末尾包含演示数据与 QA 测试数据，生产环境可按需删除对应 INSERT 段落。
--
-- ============================================================================
-- 第一部分：数据库结构
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `ExportAsset`;
DROP TABLE IF EXISTS `ShareLink`;
DROP TABLE IF EXISTS `WebhookDelivery`;
DROP TABLE IF EXISTS `WebhookEndpoint`;
DROP TABLE IF EXISTS `AIInsight`;
DROP TABLE IF EXISTS `TranscriptRating`;
DROP TABLE IF EXISTS `Transcript`;
DROP TABLE IF EXISTS `UsageLedger`;
DROP TABLE IF EXISTS `BillingOrder`;
DROP TABLE IF EXISTS `MediaAsset`;
DROP TABLE IF EXISTS `MediaTask`;
DROP TABLE IF EXISTS `Folder`;
DROP TABLE IF EXISTS `Subscription`;
DROP TABLE IF EXISTS `EmailVerificationToken`;
DROP TABLE IF EXISTS `GoogleDriveConnection`;
DROP TABLE IF EXISTS `OAuthAccount`;
DROP TABLE IF EXISTS `AuditLog`;
DROP TABLE IF EXISTS `ApiKey`;
DROP TABLE IF EXISTS `TeamMember`;
DROP TABLE IF EXISTS `Team`;
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
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

CREATE TABLE `Team` (
  `id` VARCHAR(32) NOT NULL COMMENT '团队空间 ID，应用层使用 cuid 生成',
  `name` VARCHAR(160) NOT NULL COMMENT '团队名称',
  `slug` VARCHAR(80) NULL COMMENT '团队短标识，可用于后续公开链接或工作区域名',
  `ownerId` VARCHAR(32) NOT NULL COMMENT '团队所有者用户 ID',
  `defaultLocale` VARCHAR(16) NOT NULL DEFAULT 'zh' COMMENT '团队默认界面语言',
  `retentionDays` INT NULL DEFAULT 180 COMMENT '工作区数据保留天数，空值表示跟随系统默认策略',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '团队创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '团队更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Team_slug_key` (`slug`),
  KEY `Team_ownerId_createdAt_idx` (`ownerId`, `createdAt`),
  CONSTRAINT `Team_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='团队空间表，保存工作区、默认语言和数据保留策略';

CREATE TABLE `TeamMember` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='团队成员表，保存工作区成员、邀请邮箱、角色和状态';

CREATE TABLE `ApiKey` (
  `id` VARCHAR(32) NOT NULL COMMENT 'API 密钥记录 ID，应用层使用 cuid 生成',
  `teamId` VARCHAR(32) NOT NULL COMMENT '关联团队 ID',
  `name` VARCHAR(120) NOT NULL COMMENT 'API 密钥名称',
  `key_prefix` VARCHAR(24) NOT NULL COMMENT '明文密钥前缀，只用于界面展示和排查',
  `key_hash` VARCHAR(128) NOT NULL COMMENT 'API 密钥哈希值，数据库不保存明文密钥',
  `status` ENUM('ACTIVE', 'REVOKED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'API 密钥状态',
  `created_by_id` VARCHAR(32) NULL COMMENT '创建人用户 ID',
  `last_used_at` DATETIME(3) NULL COMMENT '最后使用时间',
  `expires_at` DATETIME(3) NULL COMMENT '过期时间，为空表示长期有效',
  `revoked_at` DATETIME(3) NULL COMMENT '吊销时间',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'API 密钥创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'API 密钥更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ApiKey_key_prefix_key` (`key_prefix`),
  UNIQUE KEY `ApiKey_key_hash_key` (`key_hash`),
  KEY `ApiKey_teamId_status_idx` (`teamId`, `status`),
  KEY `ApiKey_created_by_id_idx` (`created_by_id`),
  CONSTRAINT `ApiKey_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ApiKey_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='API 密钥表，保存团队 API 密钥的哈希、状态、过期时间和吊销信息';

CREATE TABLE `AuditLog` (
  `id` VARCHAR(32) NOT NULL COMMENT '审计日志 ID，应用层使用 cuid 生成',
  `teamId` VARCHAR(32) NULL COMMENT '关联团队 ID',
  `userId` VARCHAR(32) NULL COMMENT '操作用户 ID，系统或 API 密钥自动操作时可为空',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审计日志表，记录登录、任务、团队成员和 API 密钥等关键操作';

CREATE TABLE `WebhookEndpoint` (
  `id` VARCHAR(32) NOT NULL COMMENT 'Webhook 端点 ID，应用层使用 cuid 生成',
  `teamId` VARCHAR(32) NOT NULL COMMENT '关联团队 ID',
  `name` VARCHAR(120) NOT NULL COMMENT 'Webhook 端点名称',
  `url` VARCHAR(2048) NOT NULL COMMENT '回调目标 URL',
  `secret_hash` VARCHAR(128) NOT NULL COMMENT 'Webhook 签名密钥哈希，数据库不保存明文密钥',
  `secret_prefix` VARCHAR(24) NOT NULL COMMENT 'Webhook 签名密钥前缀，只用于界面展示',
  `events` JSON NOT NULL COMMENT '订阅事件列表 JSON，例如 task.completed、task.failed',
  `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'Webhook 端点状态',
  `failure_count` INT NOT NULL DEFAULT 0 COMMENT '连续失败次数',
  `last_delivery_at` DATETIME(3) NULL COMMENT '最后投递时间',
  `created_by_id` VARCHAR(32) NULL COMMENT '创建人用户 ID',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Webhook 端点创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Webhook 端点更新时间',
  PRIMARY KEY (`id`),
  KEY `WebhookEndpoint_teamId_status_idx` (`teamId`, `status`),
  KEY `WebhookEndpoint_created_by_id_idx` (`created_by_id`),
  CONSTRAINT `WebhookEndpoint_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `WebhookEndpoint_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Webhook 端点表，保存团队回调地址、订阅事件和签名密钥哈希';

CREATE TABLE `WebhookDelivery` (
  `id` VARCHAR(32) NOT NULL COMMENT 'Webhook 投递记录 ID，应用层使用 cuid 生成',
  `endpointId` VARCHAR(32) NOT NULL COMMENT '关联 Webhook 端点 ID',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Webhook 投递记录表，保存每次事件投递的状态、响应和载荷';

CREATE TABLE `Subscription` (
  `id` VARCHAR(32) NOT NULL COMMENT '订阅记录 ID，应用层使用 cuid 生成',
  `userId` VARCHAR(32) NOT NULL COMMENT '关联用户 ID',
  `plan` ENUM('FREE', 'BASIC', 'STANDARD', 'PRO', 'TEAM', 'ENTERPRISE') NOT NULL DEFAULT 'FREE' COMMENT '订阅套餐：免费版、基础版、标准版、专业版、团队版或定制版',
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

CREATE TABLE `BillingOrder` (
  `id` VARCHAR(32) NOT NULL COMMENT '订单记录 ID，应用层使用 cuid 生成',
  `userId` VARCHAR(32) NOT NULL COMMENT '关联用户 ID',
  `subscriptionId` VARCHAR(32) NULL COMMENT '关联订阅 ID，订阅创建前可为空',
  `type` ENUM('SUBSCRIPTION', 'ONE_TIME_PACK', 'ADDON_PACK') NOT NULL COMMENT '订单类型：订阅、一次性分钟包或订阅加购包',
  `status` ENUM('PENDING', 'CHECKOUT_OPEN', 'PAID', 'ACTIVE', 'CANCELED', 'EXPIRED', 'FAILED') NOT NULL DEFAULT 'PENDING' COMMENT '订单状态',
  `interval` ENUM('MONTHLY', 'ANNUAL', 'ONE_TIME') NOT NULL COMMENT '账单周期：月付、年付或一次性',
  `itemCode` VARCHAR(64) NOT NULL COMMENT '业务套餐代码，例如 BASIC、PLUS、ADDON_PRO',
  `itemName` VARCHAR(120) NOT NULL COMMENT '用户可见的套餐名称',
  `minutes` INT NOT NULL COMMENT '订单包含的分钟额度',
  `currency` VARCHAR(8) NOT NULL DEFAULT 'usd' COMMENT '币种，使用小写 ISO 货币代码，例如 usd',
  `amountSubtotal` INT NOT NULL COMMENT '订单小计，单位为最小货币单位，例如美分',
  `amountTotal` INT NOT NULL COMMENT '订单总额，单位为最小货币单位，例如美分',
  `stripePriceId` VARCHAR(128) NOT NULL COMMENT 'Stripe Price ID',
  `stripeCustomerId` VARCHAR(128) NULL COMMENT 'Stripe Customer ID',
  `stripeCheckoutSessionId` VARCHAR(128) NULL COMMENT 'Stripe Checkout Session ID',
  `stripePaymentIntentId` VARCHAR(128) NULL COMMENT 'Stripe PaymentIntent ID，一次性支付订单使用',
  `stripeSubscriptionId` VARCHAR(128) NULL COMMENT 'Stripe Subscription ID，订阅订单使用',
  `stripeInvoiceId` VARCHAR(128) NULL COMMENT 'Stripe Invoice ID',
  `stripePaymentStatus` VARCHAR(64) NULL COMMENT 'Stripe 支付状态，例如 paid、unpaid、no_payment_required',
  `checkoutUrl` VARCHAR(2048) NULL COMMENT 'Stripe Checkout Session URL，便于排查未完成支付',
  `checkoutExpiresAt` DATETIME(3) NULL COMMENT 'Stripe Checkout Session 过期时间',
  `paidAt` DATETIME(3) NULL COMMENT '订单支付完成时间',
  `canceledAt` DATETIME(3) NULL COMMENT '订单取消时间',
  `metadata` JSON NULL COMMENT 'Stripe 事件、优惠、税费等扩展元数据',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '订单创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '订单更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `BillingOrder_stripeCheckoutSessionId_key` (`stripeCheckoutSessionId`),
  KEY `BillingOrder_userId_createdAt_idx` (`userId`, `createdAt`),
  KEY `BillingOrder_subscriptionId_idx` (`subscriptionId`),
  KEY `BillingOrder_status_createdAt_idx` (`status`, `createdAt`),
  KEY `BillingOrder_stripeCustomerId_idx` (`stripeCustomerId`),
  KEY `BillingOrder_stripeSubscriptionId_idx` (`stripeSubscriptionId`),
  CONSTRAINT `BillingOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `BillingOrder_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账单订单表，记录套餐点击后生成的 Stripe 支付和订阅订单';

CREATE TABLE `OAuthAccount` (
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

CREATE TABLE `EmailVerificationToken` (
  `id` VARCHAR(32) NOT NULL COMMENT '邮箱验证令牌 ID，应用层使用 cuid 生成',
  `userId` VARCHAR(32) NOT NULL COMMENT '关联用户 ID',
  `token_hash` VARCHAR(128) NOT NULL COMMENT '令牌哈希值，避免明文令牌入库',
  `expires_at` DATETIME(3) NOT NULL COMMENT '令牌过期时间',
  `used_at` DATETIME(3) NULL COMMENT '令牌使用时间，为空表示未使用',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '邮箱验证令牌创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `EmailVerificationToken_token_hash_key` (`token_hash`),
  KEY `EmailVerificationToken_userId_expires_at_idx` (`userId`, `expires_at`),
  CONSTRAINT `EmailVerificationToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='邮箱验证令牌表，保存注册验证和重新发送验证邮件的短期令牌';

CREATE TABLE `GoogleDriveConnection` (
  `id` VARCHAR(32) NOT NULL COMMENT 'Google Drive 授权连接 ID，应用层使用 cuid 生成',
  `userId` VARCHAR(32) NOT NULL COMMENT '关联用户 ID',
  `email` VARCHAR(320) NULL COMMENT 'Google 账号邮箱，按 RFC 邮箱最大长度预留',
  `access_token` TEXT NOT NULL COMMENT 'OAuth 访问令牌，用于短期读取用户选择的 Drive 文件',
  `refresh_token` TEXT NULL COMMENT 'OAuth 刷新令牌，用于刷新读取权限',
  `expires_at` DATETIME(3) NOT NULL COMMENT '访问令牌过期时间',
  `scope` VARCHAR(512) NULL COMMENT '授权范围',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '连接创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '连接更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `GoogleDriveConnection_userId_key` (`userId`),
  KEY `GoogleDriveConnection_expiresAt_idx` (`expires_at`),
  CONSTRAINT `GoogleDriveConnection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Google Drive 授权连接表，用于导入用户私有云盘文件';

CREATE TABLE `Folder` (
  `id` VARCHAR(32) NOT NULL COMMENT '文件夹 ID，应用层使用 cuid 生成',
  `userId` VARCHAR(32) NOT NULL COMMENT '关联用户 ID',
  `name` VARCHAR(120) NOT NULL COMMENT '文件夹名称',
  `position` INT NOT NULL DEFAULT 0 COMMENT '文件夹排序位置',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '文件夹创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '文件夹更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Folder_userId_name_key` (`userId`, `name`),
  KEY `Folder_userId_position_idx` (`userId`, `position`),
  CONSTRAINT `Folder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件夹表，保存用户自定义转写归档目录';

CREATE TABLE `MediaTask` (
  `id` VARCHAR(32) NOT NULL COMMENT '转写任务 ID，应用层使用 cuid 生成',
  `userId` VARCHAR(32) NULL COMMENT '关联用户 ID，匿名用户为空',
  `teamId` VARCHAR(32) NULL COMMENT '关联团队 ID，登录或 API 密钥创建的任务默认进入团队空间',
  `folderId` VARCHAR(32) NULL COMMENT '关联文件夹 ID，空值表示未分类',
  `sourceType` ENUM('UPLOAD', 'YOUTUBE') NOT NULL COMMENT '来源类型：上传文件或 YouTube 链接；浏览器录音和 Google Drive 导入按上传入库',
  `originalName` VARCHAR(512) NULL COMMENT '原始文件名或视频标题，兼容较长本地文件名和公开视频标题',
  `sourceUrl` VARCHAR(2048) NOT NULL COMMENT '原始媒体 URL、R2 对象 URL 或 YouTube 链接',
  `normalizedUrl` VARCHAR(2048) NULL COMMENT '解析或规范化后的媒体 URL，用于兼容旧任务和公开视频直链',
  `objectKey` VARCHAR(1024) NULL COMMENT 'R2 对象存储键',
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
  KEY `MediaTask_folderId_createdAt_idx` (`folderId`, `createdAt`),
  KEY `MediaTask_teamId_createdAt_idx` (`teamId`, `createdAt`),
  KEY `MediaTask_status_updatedAt_idx` (`status`, `updatedAt`),
  CONSTRAINT `MediaTask_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `MediaTask_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `Folder` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `MediaTask_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='媒体转写任务表，保存上传、队列、进度、服务商和失败信息';

CREATE TABLE `MediaAsset` (
  `id` VARCHAR(32) NOT NULL COMMENT '媒体资产 ID，应用层使用 cuid 生成',
  `mediaTaskId` VARCHAR(32) NOT NULL COMMENT '关联转写任务 ID',
  `kind` ENUM('SOURCE_MEDIA', 'NORMALIZED_AUDIO', 'AUDIO_CHUNK') NOT NULL COMMENT '资产类型：原始媒体、标准化完整音频或音频切片',
  `url` VARCHAR(2048) NOT NULL COMMENT 'R2 对象地址或外部媒体 URL',
  `objectKey` VARCHAR(1024) NULL COMMENT 'R2 对象键；外部链接可为空',
  `fileName` VARCHAR(512) NULL COMMENT '文件名或切片名称',
  `contentType` VARCHAR(128) NULL COMMENT '媒体 MIME 类型',
  `sizeBytes` BIGINT NULL COMMENT '文件大小（字节）',
  `durationSeconds` INT NULL COMMENT '音频时长（秒）',
  `startSeconds` INT NULL COMMENT '切片起始时间（秒）',
  `endSeconds` INT NULL COMMENT '切片结束时间（秒）',
  `chunkIndex` INT NULL COMMENT '切片序号，从 0 开始；完整资产使用 -1',
  `metadata` JSON NULL COMMENT '处理策略、来源服务商、探测信息等扩展元数据',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '资产创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '资产更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `MediaAsset_mediaTaskId_kind_chunkIndex_key` (`mediaTaskId`, `kind`, `chunkIndex`),
  KEY `MediaAsset_mediaTaskId_kind_idx` (`mediaTaskId`, `kind`),
  KEY `MediaAsset_objectKey_idx` (`objectKey`(768)),
  CONSTRAINT `MediaAsset_mediaTaskId_fkey` FOREIGN KEY (`mediaTaskId`) REFERENCES `MediaTask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='媒体资产表，保存任务原始媒体、标准化音频和切片信息';

CREATE TABLE `UsageLedger` (
  `id` VARCHAR(32) NOT NULL COMMENT '用量流水 ID，应用层使用 cuid 生成',
  `userId` VARCHAR(32) NOT NULL COMMENT '关联用户 ID',
  `subscriptionId` VARCHAR(32) NOT NULL COMMENT '关联订阅 ID',
  `mediaTaskId` VARCHAR(32) NULL COMMENT '关联任务 ID，手工调整时可为空',
  `type` ENUM('RESERVE', 'SETTLE', 'RELEASE', 'ADJUST') NOT NULL COMMENT '流水类型：预留、结算、释放或手工调整',
  `minutesDelta` INT NOT NULL COMMENT '分钟变化量，扣减为负数，释放或赠送为正数',
  `reason` VARCHAR(255) NULL COMMENT '流水备注，便于排查额度变化原因',
  `idempotencyKey` VARCHAR(191) NULL COMMENT '外部事件幂等键，例如 Stripe Checkout Session，用于防止重复发放权益',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '用量流水创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UsageLedger_idempotencyKey_key` (`idempotencyKey`),
  KEY `UsageLedger_userId_createdAt_idx` (`userId`, `createdAt`),
  KEY `UsageLedger_subscriptionId_createdAt_idx` (`subscriptionId`, `createdAt`),
  KEY `UsageLedger_mediaTaskId_idx` (`mediaTaskId`),
  CONSTRAINT `UsageLedger_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UsageLedger_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UsageLedger_mediaTaskId_fkey` FOREIGN KEY (`mediaTaskId`) REFERENCES `MediaTask` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用量流水表，记录任务预留、结算、释放和手工调整等额度变化';

CREATE TABLE `Transcript` (
  `id` VARCHAR(32) NOT NULL COMMENT '转写文本 ID，应用层使用 cuid 生成',
  `mediaTaskId` VARCHAR(32) NOT NULL COMMENT '关联转写任务 ID',
  `summary` JSON NULL COMMENT '当前摘要 JSON，未开启摘要生成时为空',
  `mindMap` JSON NULL COMMENT '当前思维导图 JSON',
  `translations` JSON NULL COMMENT '按目标语言代码存储的翻译 JSON 对象',
  `summaryGenerationCount` INT NOT NULL DEFAULT 0 COMMENT '摘要累计生成次数',
  `segments` JSON NOT NULL COMMENT '带时间戳和发言人标签的段落 JSON',
  `words` JSON NULL COMMENT '词级时间戳与置信度 JSON',
  `editedText` LONGTEXT NOT NULL COMMENT '完整转写文本，可由用户编辑',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '转写结果创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '转写结果更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Transcript_mediaTaskId_key` (`mediaTaskId`),
  CONSTRAINT `Transcript_mediaTaskId_fkey` FOREIGN KEY (`mediaTaskId`) REFERENCES `MediaTask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='转写结果表，保存完整正文、摘要、思维导图、翻译、分段和词级时间戳';

CREATE TABLE `TranscriptRating` (
  `id` VARCHAR(32) NOT NULL COMMENT '转写质量评分 ID，应用层使用 cuid 生成',
  `mediaTaskId` VARCHAR(32) NOT NULL COMMENT '关联转写任务 ID',
  `userId` VARCHAR(32) NOT NULL COMMENT '评分用户 ID',
  `rating` INT NOT NULL COMMENT '用户评分，范围 1 到 5',
  `note` VARCHAR(1024) NULL COMMENT '可选反馈备注，便于后续质量分析',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '评分创建时间',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '评分更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `TranscriptRating_mediaTaskId_userId_key` (`mediaTaskId`, `userId`),
  KEY `TranscriptRating_userId_createdAt_idx` (`userId`, `createdAt`),
  KEY `TranscriptRating_mediaTaskId_rating_idx` (`mediaTaskId`, `rating`),
  CONSTRAINT `TranscriptRating_mediaTaskId_fkey` FOREIGN KEY (`mediaTaskId`) REFERENCES `MediaTask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `TranscriptRating_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='转写质量评分表，保存用户对转写结果的 1-5 星反馈';

CREATE TABLE `ExportAsset` (
  `id` VARCHAR(32) NOT NULL COMMENT '导出文件 ID，应用层使用 cuid 生成',
  `mediaTaskId` VARCHAR(32) NOT NULL COMMENT '关联转写任务 ID',
  `format` ENUM('TXT', 'SRT', 'VTT', 'JSON', 'PDF') NOT NULL COMMENT '导出格式',
  `objectKey` VARCHAR(1024) NULL COMMENT 'R2 对象键，保存持久化导出文件时使用',
  `url` VARCHAR(2048) NULL COMMENT '导出文件访问 URL',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '导出创建时间',
  PRIMARY KEY (`id`),
  KEY `ExportAsset_mediaTaskId_format_idx` (`mediaTaskId`, `format`),
  CONSTRAINT `ExportAsset_mediaTaskId_fkey` FOREIGN KEY (`mediaTaskId`) REFERENCES `MediaTask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='导出资产表，保存字幕、文本、JSON 和 PDF 等导出记录';

CREATE TABLE `ShareLink` (
  `id` VARCHAR(32) NOT NULL COMMENT '分享链接 ID，应用层使用 cuid 生成',
  `teamId` VARCHAR(32) NULL COMMENT '关联团队 ID',
  `mediaTaskId` VARCHAR(32) NOT NULL COMMENT '关联转写任务 ID',
  `created_by_id` VARCHAR(32) NULL COMMENT '创建人用户 ID',
  `token_hash` VARCHAR(128) NOT NULL COMMENT '分享令牌哈希值，数据库不保存明文令牌',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公开分享链接表，保存分享令牌哈希、过期时间、访问次数和任务关联';

SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================================
-- 第二部分：演示数据
-- ============================================================================

SET @demo_user_id = 'user_votxt_demo';
SET @demo_subscription_id = 'sub_votxt_demo_free';
SET @demo_task_id = 'task_votxt_demo_complete';
SET @demo_transcript_id = 'tr_votxt_demo_complete';
SET @seed_password_hash = 'scrypt:votxt_seed_salt:f4W5HcJrdfOMp32MBb2LASjszARbdIf3ba9AEeQzjejcvvxnVWrWevCHfqi3qRX6xtS9RTNyn7hi4cZpOuv2TQ';

INSERT INTO `User` (`id`, `email`, `password_hash`, `name`, `image`, `locale`, `dailyFreeCount`, `dailyResetAt`, `createdAt`, `updatedAt`)
VALUES (@demo_user_id, 'demo@votxt.local', @seed_password_hash, 'Votxt Demo', NULL, 'en', 0, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`), `name` = VALUES(`name`), `locale` = VALUES(`locale`), `updatedAt` = NOW();

INSERT INTO `Subscription` (
  `id`, `userId`, `plan`, `status`, `stripeCustomerId`, `stripeSubscriptionId`,
  `monthlyMinuteQuota`, `remainingMinutes`, `maxSingleFileMinutes`, `maxUploadBytes`,
  `currentPeriodStart`, `currentPeriodEnd`, `createdAt`, `updatedAt`
)
VALUES (
  @demo_subscription_id, @demo_user_id, 'FREE', 'ACTIVE', NULL, NULL,
  120, 118, 30, 2147483648,
  NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), NOW(), NOW()
)
ON DUPLICATE KEY UPDATE
  `monthlyMinuteQuota` = VALUES(`monthlyMinuteQuota`),
  `remainingMinutes` = VALUES(`remainingMinutes`),
  `updatedAt` = NOW();

INSERT INTO `MediaTask` (
  `id`, `userId`, `sourceType`, `originalName`, `sourceUrl`, `normalizedUrl`, `objectKey`,
  `status`, `statusMessage`, `language`, `detectedLanguage`, `durationSeconds`, `fileSizeBytes`,
  `provider`, `speakerCount`, `progress`, `quotaMinutes`, `errorCode`, `createdAt`, `updatedAt`, `completedAt`
)
VALUES (
  @demo_task_id, @demo_user_id, 'UPLOAD', 'product-interview.mp3',
  'https://assets.votxt.local/demo/product-interview.mp3', NULL, 'uploads/demo/product-interview.mp3',
  'COMPLETED', '转写稿已就绪。', 'auto', 'zh', 126, 5242880,
  'deepgram', 2, 100, 3, NULL, NOW(), NOW(), NOW()
)
ON DUPLICATE KEY UPDATE
  `status` = VALUES(`status`),
  `statusMessage` = VALUES(`statusMessage`),
  `progress` = VALUES(`progress`),
  `updatedAt` = NOW();

INSERT INTO `Transcript` (`id`, `mediaTaskId`, `editedText`, `segments`, `words`, `createdAt`, `updatedAt`)
VALUES (
  @demo_transcript_id,
  @demo_task_id,
  '发言人 1：Votxt 可以快速把长录音转成可用文字。\n发言人 2：最重要的输出是一份干净的转写稿，以及总结、思维导图、翻译和字幕文件。',
  JSON_ARRAY(
    JSON_OBJECT('start', 0, 'end', 8.4, 'speaker', '发言人 1', 'text', 'Votxt 可以快速把长录音转成可用文字。'),
    JSON_OBJECT('start', 8.5, 'end', 18.9, 'speaker', '发言人 2', 'text', '最重要的输出是一份干净的转写稿，以及总结、思维导图、翻译和字幕文件。')
  ),
  JSON_ARRAY(
    JSON_OBJECT('start', 0, 'end', 0.4, 'word', 'Votxt', 'confidence', 0.99, 'speaker', '发言人 1'),
    JSON_OBJECT('start', 0.5, 'end', 1.0, 'word', '可以', 'confidence', 0.98, 'speaker', '发言人 1')
  ),
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  `editedText` = VALUES(`editedText`),
  `segments` = VALUES(`segments`),
  `words` = VALUES(`words`),
  `updatedAt` = NOW();

INSERT INTO `ExportAsset` (`id`, `mediaTaskId`, `format`, `objectKey`, `url`, `createdAt`)
VALUES
  ('ex_votxt_demo_txt', @demo_task_id, 'TXT', NULL, '/api/tasks/task_votxt_demo_complete/exports/txt', NOW()),
  ('ex_votxt_demo_srt', @demo_task_id, 'SRT', NULL, '/api/tasks/task_votxt_demo_complete/exports/srt', NOW()),
  ('ex_votxt_demo_vtt', @demo_task_id, 'VTT', NULL, '/api/tasks/task_votxt_demo_complete/exports/vtt', NOW()),
  ('ex_votxt_demo_json', @demo_task_id, 'JSON', NULL, '/api/tasks/task_votxt_demo_complete/exports/json', NOW()),
  ('ex_votxt_demo_pdf', @demo_task_id, 'PDF', NULL, '/api/tasks/task_votxt_demo_complete/exports/pdf', NOW())
ON DUPLICATE KEY UPDATE `url` = VALUES(`url`);

-- ============================================================================
-- 第三部分：QA 测试数据
-- ============================================================================

SET @test_user_id = 'user_votxt_qa';
SET @seed_password_hash = 'scrypt:votxt_seed_salt:f4W5HcJrdfOMp32MBb2LASjszARbdIf3ba9AEeQzjejcvvxnVWrWevCHfqi3qRX6xtS9RTNyn7hi4cZpOuv2TQ';

INSERT INTO `User` (`id`, `email`, `password_hash`, `name`, `image`, `locale`, `dailyFreeCount`, `dailyResetAt`, `createdAt`, `updatedAt`)
VALUES (@test_user_id, 'gxx961208@gmail.com', @seed_password_hash, 'alx to', NULL, 'zh', 0, DATE_ADD(NOW(), INTERVAL 1 DAY), NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `email` = VALUES(`email`),
  `password_hash` = VALUES(`password_hash`),
  `name` = VALUES(`name`),
  `dailyFreeCount` = VALUES(`dailyFreeCount`),
  `updatedAt` = NOW();

INSERT INTO `OAuthAccount` (`id`, `userId`, `provider`, `provider_account_id`, `email`, `avatar_url`, `createdAt`, `updatedAt`)
VALUES ('oauth_votxt_qa_google', @test_user_id, 'google', 'gxx961208', 'gxx961208@gmail.com', 'https://lh3.googleusercontent.com/a/ACg8ocIqsiuzBf8BkPA-quJlus__fzdP0B6b4dBjSfEtJv740VFCYw=s96-c', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `email` = VALUES(`email`),
  `avatar_url` = VALUES(`avatar_url`),
  `updatedAt` = NOW();

INSERT INTO `Subscription` (
  `id`, `userId`, `plan`, `status`, `stripeCustomerId`, `stripeSubscriptionId`,
  `monthlyMinuteQuota`, `remainingMinutes`, `maxSingleFileMinutes`, `maxUploadBytes`,
  `currentPeriodStart`, `currentPeriodEnd`, `createdAt`, `updatedAt`
)
VALUES
  ('sub_votxt_qa_basic', @test_user_id, 'FREE', 'ACTIVE', NULL, NULL, 120, 78, 30, 2147483648, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `plan` = VALUES(`plan`),
  `stripeCustomerId` = VALUES(`stripeCustomerId`),
  `stripeSubscriptionId` = VALUES(`stripeSubscriptionId`),
  `monthlyMinuteQuota` = VALUES(`monthlyMinuteQuota`),
  `remainingMinutes` = VALUES(`remainingMinutes`),
  `maxSingleFileMinutes` = VALUES(`maxSingleFileMinutes`),
  `maxUploadBytes` = VALUES(`maxUploadBytes`),
  `updatedAt` = NOW();

DELETE FROM `Folder`
WHERE `userId` = @test_user_id
  AND `id` NOT IN ('folder_votxt_qa_123');

INSERT INTO `Folder` (`id`, `userId`, `name`, `position`, `createdAt`, `updatedAt`)
VALUES
  ('folder_votxt_qa_123', @test_user_id, '123', 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `position` = VALUES(`position`),
  `updatedAt` = NOW();

INSERT INTO `MediaTask` (
  `id`, `userId`, `sourceType`, `originalName`, `sourceUrl`, `normalizedUrl`, `objectKey`,
  `status`, `statusMessage`, `language`, `detectedLanguage`, `durationSeconds`, `fileSizeBytes`,
  `provider`, `speakerCount`, `progress`, `quotaMinutes`, `errorCode`, `createdAt`, `updatedAt`, `completedAt`
)
VALUES
  ('cmqyzscrp00021lvpt08gi2oo', @test_user_id, 'YOUTUBE', 'Learn How to Talk About Yourself in English | Easy Introductions for Beginners | English Podcast', 'https://www.youtube.com/watch?v=hCon8Uq_Bas', NULL, NULL, 'COMPLETED', '转写稿已就绪。', 'auto', 'en', 1129, NULL, 'assemblyai', 1, 100, 19, NULL, TIMESTAMP('2026-06-29 07:28:00'), NOW(), NOW()),
  ('task_votxt_qa_queued', NULL, 'UPLOAD', '排队中的通话.wav', 'https://assets.votxt.local/qa/queued-call.wav', NULL, 'uploads/qa/queued-call.wav', 'QUEUED', '任务已进入队列。', 'auto', NULL, NULL, 3200000, NULL, NULL, 5, 0, NULL, NOW(), NOW(), NULL),
  ('task_votxt_qa_processing', NULL, 'UPLOAD', '处理中会议.mp4', 'https://assets.votxt.local/qa/processing-meeting.mp4', NULL, 'uploads/qa/processing-meeting.mp4', 'TRANSCRIBING', '正在使用服务商降级策略转写。', 'zh', NULL, NULL, 48000000, 'deepgram', NULL, 45, 0, NULL, NOW(), NOW(), NULL),
  ('task_votxt_qa_failed', NULL, 'YOUTUBE', '私有视频', 'https://www.youtube.com/watch?v=private', NULL, NULL, 'FAILED', 'yt-dlp 无法解析音频地址。', 'auto', NULL, NULL, NULL, NULL, NULL, 100, 0, 'TRANSCRIPTION_FAILED', NOW(), NOW(), NULL),
  ('task_votxt_qa_youtube_done', @test_user_id, 'YOUTUBE', '我用 Codex 幫我剪片：AI Agent 工作流公開', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://cdn.votxt.local/audio/launch-demo.mp3', NULL, 'COMPLETED', '转写稿已就绪。', 'auto', 'zh', 405, NULL, 'assemblyai', 1, 100, 7, NULL, TIMESTAMP('2026-06-28 17:58:00'), NOW(), NOW()),
  ('task_votxt_qa_creator_done', @test_user_id, 'YOUTUBE', '做自媒体6年了，我想说…', 'https://www.youtube.com/watch?v=creator-demo', 'https://cdn.votxt.local/audio/creator-demo.mp3', NULL, 'COMPLETED', '转写稿已就绪。', 'auto', 'zh', 926, NULL, 'assemblyai', 1, 100, 16, NULL, TIMESTAMP('2026-06-26 07:39:00'), NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `userId` = VALUES(`userId`),
  `originalName` = VALUES(`originalName`),
  `sourceUrl` = VALUES(`sourceUrl`),
  `durationSeconds` = VALUES(`durationSeconds`),
  `quotaMinutes` = VALUES(`quotaMinutes`),
  `createdAt` = VALUES(`createdAt`),
  `status` = VALUES(`status`),
  `statusMessage` = VALUES(`statusMessage`),
  `progress` = VALUES(`progress`),
  `updatedAt` = NOW();

-- The captured target account opens the canonical detail task with sharing disabled.
-- Reset historical local QA share-flow tests so first-open detail parity uses the same branch.
UPDATE `ShareLink`
SET `enabled` = 0
WHERE `mediaTaskId` = 'cmqyzscrp00021lvpt08gi2oo'
  AND `enabled` = 1;

INSERT INTO `Transcript` (`id`, `mediaTaskId`, `editedText`, `segments`, `words`, `createdAt`, `updatedAt`)
VALUES (
  'tr_votxt_qa_intro_target',
  'cmqyzscrp00021lvpt08gi2oo',
  CONCAT(
    'Hello everyone and welcome back to Mr. English channel where learning English is easy and fun. I''m Emily. Hello Emily. Hello everyone. It''s great to be here. Hi Paul. How are you today? I''m doing great, thank you. And you? You look very happy today. I am very happy. I''m excited for our topic today. Oh, yes. It''s a very good topic. Very important. Yes, exactly. But before we start, everyone please remember to subscribe to our channel. ',
    'Yes. And click the like button and please share our podcast with your friends and family. It helps us a lot. It really does. Okay. So, Paul, are you ready? I am ready. So, what is our topic today? Today, our topic is tell me about yourself. Ah, a very common question. People ask this all the time. They do in a new class, at a new job, when you meet new people. It''s true. And sometimes it''s hard to know what to say. Yes. So today we will talk about it. We will make it easy and fun. ',
    'That sounds perfect. So who starts? You or me? H how about you start? Paul, tell me about yourself. Okay. Okay. My turn first. Where do I start? Let''s start with the easy one. What is your name? Okay. My name is Paul. P A U L. Nice to meet you, Paul. My name is Emily. Nice to meet you, too, Emily. So, next question. Where are you from? Ooh, good one. I am from Canada. Canada. Wow. I am from the United States. ',
    'The United States. Very cool. Do you live in a big city? I live in a small town. I like it. It''s quiet. What about you, Emily? I live in a big city. It''s very busy, very noisy, but I love it. That''s great. A small town and a big city. Very different. Yes. And do you live in a house or an apartment? I live in a house. It''s a small house. It has a garden. A garden. I love gardens. I live in an apartment. Is it a big apartment? ',
    'No, it''s a small apartment, but it''s very nice. I like it. Good. Good. Okay, so we have name, where you are from, and where you live. What''s next? H how about how old are you, Paul? If you want to say of course it''s okay. I am 28 years old. 28. Okay. And you, Emily, how old are you? I am 25 years old. 25. A very good age. Thank you. I think so, too. Okay. So, now for a big question. I''m ready. What do you do, Paul? I am a teacher. A teacher, of course. You are a teacher on Mr. English channel. ',
    'Yes, exactly. I am an English teacher. I love my job. That''s wonderful. It''s a great job. Thank you. What about you, Emily? What do you do? I am a student. A student. What do you study? I study art. I love to draw and paint. Wow. Art. That is so cool. Do you like your studies? Yes, I love it. It''s very fun and creative. I can see that. An art student and an English teacher. A perfect team for a podcast. Love it. Okay, let''s see. We have name, place, age, and job. What else can we talk about? ',
    'Let''s talk about family. Okay, family is a great topic. Do you have any brothers or sisters, Emily? Yes, I do. I have one brother. His name is Tom. Tom. Is he older or younger than you? He is older. He is 29. Oh, so he is one year older than me. Yes. What about you, Paul? Do you have brothers or sisters? I have one sister. Her name is Sarah. Sarah? That''s a beautiful name. Is she older or younger? She is younger than me. She is a student like you. ',
    'Oh, really? What does she study? She studies music. She plays the piano. Wow. A music student and an art student. That''s so creative. Yes. My family is very creative. My mother is a writer. A writer. That is amazing. And your father? My father is a doctor. A doctor. Wow. A very nice family. Paul, thank you. Emily, tell me about your parents. What do they do? My mother is a teacher too. She teaches little children. ',
    'Oh, that is a very important job. Wonderful. Yes. And my father is a chef. He works in a restaurant. A chef. Does he cook for you at home? Yes. The food is always delicious. I am jealous. That is so cool. So, we have family. Now, how about pets? Pets? Yes, I love pets. Do you have a pet Paul? Yes, I do. I have a dog. A dog. I love dogs. What is his name? His name is Max. He is very friendly and very funny. Oh, Max. What color is he? He is brown. A small brown happy dog. ',
    'That sounds so cute. I want to meet Max. Love it. Maybe one day. Do you have a pet Emily? Yes, I have a cat. A cat? See, we are different. A dog person and a cat person. It''s true. Her name is Luna. Luna. That''s a lovely name. What does she look like? She is black and white. She is very quiet and very sleepy. A sleepy cat. That sounds normal. Yes, she sleeps all day. It''s a good life. It is for a cat. Okay, so we know a lot now. name, age, job, family, pets. ',
    'Now, let''s talk about things we like, our favorite things. Good idea. This is the fun part. Let''s start with food. Yes. Okay, Paul. What is your favorite food? H, this is a difficult question. I like many foods. Just choose one. Okay. I think my favorite food is pizza. Pizza. M. A great choice. I love pizza, too. What kind of pizza do you like? I like vegetable pizza with tomatoes and peppers and onions. ',
    'That sounds healthy and delicious. I like pepperoni pizza. A classic. Good choice. So, is pizza your favorite food, too? It''s one of my favorites, but my number one favorite food is pasta. Ah, pasta is a good choice, too. Very yummy. Yes, I love it. Okay, next favorite thing. What is your favorite color? My favorite color is blue. Like the sky. Blue is a very nice calm color. I like it. Thank you. What is your favorite color? ',
    'My favorite color is green. Green. Like the trees and the grass in a garden. Exactly. I love the color of nature. That''s beautiful. Blue sky and green grass. Perfect. It is. Okay. What''s next? Favorite animal. Oh, this is easy for me. My favorite animal is a dog. Of course. I know. Because of Max. Yes, dogs are loyal and friendly. I love them. What about you? Is your favorite animal a cat? Yes, I love cats. They are so elegant and independent. ',
    'Elegant. That is a good word for cats. They are. Okay, let''s move on to hobbies. Hobbies. The things we do for fun. Great topic. What are your hobbies, Emily? Well, I am an art student, so my hobby is painting, of course. Do you paint a lot? Yes, every weekend. It helps me relax. I also like to read books. Reading is a fantastic hobby. What kind of books do you read? I like story books. Adventure stories are my favorite. ',
    'Adventure stories. How exciting. It is. What about you, Paul? What are your hobbies? I have a few hobbies. I love listening to music. music. What kind of music do you listen to? I like rock music. Old rock music. Ah, very cool. And what else? I also like to play sports. I play soccer with my friends on Saturdays. Soccer. You are very active. I try to be. It''s fun to run and play with friends. ',
    'That''s great. So, you like sports. Do you like to watch movies? Yes, I love watching movies, especially comedy movies. I love to laugh. Me too. Laughing is the best. I like comedy movies and also animated movies. Animated movies are great. So much imagination. Yes, they are beautiful to watch too. This is great. We are learning so much about each other. I know. It''s like we are answering tell me about yourself right now. Yes, we are. We are giving a very long answer. A very very long answer. ',
    'Let''s think what else. H we can talk about things we don''t like. Oh, that''s interesting. Okay. What is a food you don''t like, Paul? A food I don''t like? Let me think. I do not like olives. Olives? Really? I like olives. See, we''re different again. I don''t like the taste. What about you? Is there a food you don''t like? Yes, I don''t like spicy food. Very hot food. ',
    'An activity I don''t like. I don''t like to wait in long lines. Does anyone like that? I don''t think so. It''s so boring. I agree. I don''t like that either. I also don''t like to wake up very early. Are you not a morning person? No, not at all. I like my sleep. I understand completely. Sleeping is very important. So, this is a good way to describe yourself. ',
    'For example, hello, my name is Paul. I am a teacher. I like dogs and pizza, but I don''t like olives. That''s a great introduction. Hi, I''m Emily. I''m a student. I love cats and pasta, but I don''t like to wake up early. Perfect. It''s simple. It''s clear. And it''s friendly. I think we have covered a lot. Name from live age job family pets hobbies likes dislikes. ',
    'Oh, no. That''s a good tip. You can choose. Maybe you say your name and your job. Yes. Or your name and your hobby. It depends on the situation. If you are in a class, maybe you say your name and why you are learning English. Exactly. You can say, "My name is Paul. I''m from the United States. I like to learn new things." And if you are at a party, you can say, "Hi, I''m Emily. I love to paint and listen to music." ',
    'It is. The person can then ask, "Oh, what do you paint?" or "What music do you like?" And a new friendship begins. It all starts with, "Tell me about yourself." It really does. It''s not a scary question. It''s an invitation. An invitation to share a little bit about you. That''s a beautiful way to think about it. I think it''s been very nice to learn more about you, Paul. ',
    'And I learned you are a teacher who loves pizza and blue and you have a friendly dog named Max. It was a very successful conversation. Yes. And I hope it was helpful for all our listeners. I hope so too. Remember, you can use these simple sentences to talk about yourself. Yes. Don''t be afraid. Keep it simple and be friendly. That''s the most important part. That is the perfect advice. A smile is very important, too. Always. ',
    'Well, I think our time is almost up for today. Wow. Time goes faster when you''re having fun. It really does. This was a great chat. It was. So, before we go, we want to ask our amazing listeners for a little favor. That''s right. If you enjoyed this episode, please subscribe to our channel, Mr. English Channel, and give this episode a big thumbs up, a like. It really helps people find our podcast. ',
    'Thank you all for listening today. Thank you all. It was a pleasure. Stay safe and keep practicing. We will be back soon with another fun episode. Goodbye for now. Bye everyone. Bye Emily.'
  ),
  JSON_ARRAY(
    JSON_OBJECT('start', 0, 'end', 49, 'speaker', NULL, 'text', 'Hello everyone and welcome back to Mr. English channel where learning English is easy and fun. I''m Emily. Hello Emily. Hello everyone. It''s great to be here. Hi Paul. How are you today? I''m doing great, thank you. And you? You look very happy today. I am very happy. I''m excited for our topic today. Oh, yes. It''s a very good topic. Very important. Yes, exactly. But before we start, everyone please remember to subscribe to our channel.'),
    JSON_OBJECT('start', 49, 'end', 92, 'speaker', NULL, 'text', 'Yes. And click the like button and please share our podcast with your friends and family. It helps us a lot. It really does. Okay. So, Paul, are you ready? I am ready. So, what is our topic today? Today, our topic is tell me about yourself. Ah, a very common question. People ask this all the time. They do in a new class, at a new job, when you meet new people. It''s true. And sometimes it''s hard to know what to say. Yes. So today we will talk about it. We will make it easy and fun.'),
    JSON_OBJECT('start', 92, 'end', 134, 'speaker', NULL, 'text', 'That sounds perfect. So who starts? You or me? H how about you start? Paul, tell me about yourself. Okay. Okay. My turn first. Where do I start? Let''s start with the easy one. What is your name? Okay. My name is Paul. P A U L. Nice to meet you, Paul. My name is Emily. Nice to meet you, too, Emily. So, next question. Where are you from? Ooh, good one. I am from Canada. Canada. Wow. I am from the United States.'),
    JSON_OBJECT('start', 134, 'end', 174, 'speaker', NULL, 'text', 'The United States. Very cool. Do you live in a big city? I live in a small town. I like it. It''s quiet. What about you, Emily? I live in a big city. It''s very busy, very noisy, but I love it. That''s great. A small town and a big city. Very different. Yes. And do you live in a house or an apartment? I live in a house. It''s a small house. It has a garden. A garden. I love gardens. I live in an apartment. Is it a big apartment?'),
    JSON_OBJECT('start', 174, 'end', 234, 'speaker', NULL, 'text', 'No, it''s a small apartment, but it''s very nice. I like it. Good. Good. Okay, so we have name, where you are from, and where you live. What''s next? H how about how old are you, Paul? If you want to say of course it''s okay. I am 28 years old. 28. Okay. And you, Emily, how old are you? I am 25 years old. 25. A very good age. Thank you. I think so, too. Okay. So, now for a big question. I''m ready. What do you do, Paul? I am a teacher. A teacher, of course. You are a teacher on Mr. English channel.'),
    JSON_OBJECT('start', 233, 'end', 285, 'speaker', NULL, 'text', 'Yes, exactly. I am an English teacher. I love my job. That''s wonderful. It''s a great job. Thank you. What about you, Emily? What do you do? I am a student. A student. What do you study? I study art. I love to draw and paint. Wow. Art. That is so cool. Do you like your studies? Yes, I love it. It''s very fun and creative. I can see that. An art student and an English teacher. A perfect team for a podcast. Love it. Okay, let''s see. We have name, place, age, and job. What else can we talk about?'),
    JSON_OBJECT('start', 285, 'end', 335, 'speaker', NULL, 'text', 'Let''s talk about family. Okay, family is a great topic. Do you have any brothers or sisters, Emily? Yes, I do. I have one brother. His name is Tom. Tom. Is he older or younger than you? He is older. He is 29. Oh, so he is one year older than me. Yes. What about you, Paul? Do you have brothers or sisters? I have one sister. Her name is Sarah. Sarah? That''s a beautiful name. Is she older or younger? She is younger than me. She is a student like you.'),
    JSON_OBJECT('start', 335, 'end', 376, 'speaker', NULL, 'text', 'Oh, really? What does she study? She studies music. She plays the piano. Wow. A music student and an art student. That''s so creative. Yes. My family is very creative. My mother is a writer. A writer. That is amazing. And your father? My father is a doctor. A doctor. Wow. A very nice family. Paul, thank you. Emily, tell me about your parents. What do they do? My mother is a teacher too. She teaches little children.'),
    JSON_OBJECT('start', 376, 'end', 433, 'speaker', NULL, 'text', 'Oh, that is a very important job. Wonderful. Yes. And my father is a chef. He works in a restaurant. A chef. Does he cook for you at home? Yes. The food is always delicious. I am jealous. That is so cool. So, we have family. Now, how about pets? Pets? Yes, I love pets. Do you have a pet Paul? Yes, I do. I have a dog. A dog. I love dogs. What is his name? His name is Max. He is very friendly and very funny. Oh, Max. What color is he? He is brown. A small brown happy dog.'),
    JSON_OBJECT('start', 433, 'end', 480, 'speaker', NULL, 'text', 'That sounds so cute. I want to meet Max. Love it. Maybe one day. Do you have a pet Emily? Yes, I have a cat. A cat? See, we are different. A dog person and a cat person. It''s true. Her name is Luna. Luna. That''s a lovely name. What does she look like? She is black and white. She is very quiet and very sleepy. A sleepy cat. That sounds normal. Yes, she sleeps all day. It''s a good life. It is for a cat. Okay, so we know a lot now. name, age, job, family, pets.'),
    JSON_OBJECT('start', 480, 'end', 534, 'speaker', NULL, 'text', 'Now, let''s talk about things we like, our favorite things. Good idea. This is the fun part. Let''s start with food. Yes. Okay, Paul. What is your favorite food? H, this is a difficult question. I like many foods. Just choose one. Okay. I think my favorite food is pizza. Pizza. M. A great choice. I love pizza, too. What kind of pizza do you like? I like vegetable pizza with tomatoes and peppers and onions.'),
    JSON_OBJECT('start', 534, 'end', 580, 'speaker', NULL, 'text', 'That sounds healthy and delicious. I like pepperoni pizza. A classic. Good choice. So, is pizza your favorite food, too? It''s one of my favorites, but my number one favorite food is pasta. Ah, pasta is a good choice, too. Very yummy. Yes, I love it. Okay, next favorite thing. What is your favorite color? My favorite color is blue. Like the sky. Blue is a very nice calm color. I like it. Thank you. What is your favorite color?'),
    JSON_OBJECT('start', 580, 'end', 624, 'speaker', NULL, 'text', 'My favorite color is green. Green. Like the trees and the grass in a garden. Exactly. I love the color of nature. That''s beautiful. Blue sky and green grass. Perfect. It is. Okay. What''s next? Favorite animal. Oh, this is easy for me. My favorite animal is a dog. Of course. I know. Because of Max. Yes, dogs are loyal and friendly. I love them. What about you? Is your favorite animal a cat? Yes, I love cats. They are so elegant and independent.'),
    JSON_OBJECT('start', 624, 'end', 665, 'speaker', NULL, 'text', 'Elegant. That is a good word for cats. They are. Okay, let''s move on to hobbies. Hobbies. The things we do for fun. Great topic. What are your hobbies, Emily? Well, I am an art student, so my hobby is painting, of course. Do you paint a lot? Yes, every weekend. It helps me relax. I also like to read books. Reading is a fantastic hobby. What kind of books do you read? I like story books. Adventure stories are my favorite.'),
    JSON_OBJECT('start', 665, 'end', 710, 'speaker', NULL, 'text', 'Adventure stories. How exciting. It is. What about you, Paul? What are your hobbies? I have a few hobbies. I love listening to music. music. What kind of music do you listen to? I like rock music. Old rock music. Ah, very cool. And what else? I also like to play sports. I play soccer with my friends on Saturdays. Soccer. You are very active. I try to be. It''s fun to run and play with friends.'),
    JSON_OBJECT('start', 710, 'end', 753, 'speaker', NULL, 'text', 'That''s great. So, you like sports. Do you like to watch movies? Yes, I love watching movies, especially comedy movies. I love to laugh. Me too. Laughing is the best. I like comedy movies and also animated movies. Animated movies are great. So much imagination. Yes, they are beautiful to watch too. This is great. We are learning so much about each other. I know. It''s like we are answering tell me about yourself right now. Yes, we are. We are giving a very long answer. A very very long answer.'),
    JSON_OBJECT('start', 753, 'end', 811, 'speaker', NULL, 'text', 'Let''s think what else. H we can talk about things we don''t like. Oh, that''s interesting. Okay. What is a food you don''t like, Paul? A food I don''t like? Let me think. I do not like olives. Olives? Really? I like olives. See, we''re different again. I don''t like the taste. What about you? Is there a food you don''t like? Yes, I don''t like spicy food. Very hot food.'),
    JSON_OBJECT('start', 811, 'end', 859, 'speaker', NULL, 'text', 'An activity I don''t like. I don''t like to wait in long lines. Does anyone like that? I don''t think so. It''s so boring. I agree. I don''t like that either. I also don''t like to wake up very early. Are you not a morning person? No, not at all. I like my sleep. I understand completely. Sleeping is very important. So, this is a good way to describe yourself.'),
    JSON_OBJECT('start', 859, 'end', 911, 'speaker', NULL, 'text', 'For example, hello, my name is Paul. I am a teacher. I like dogs and pizza, but I don''t like olives. That''s a great introduction. Hi, I''m Emily. I''m a student. I love cats and pasta, but I don''t like to wake up early. Perfect. It''s simple. It''s clear. And it''s friendly. I think we have covered a lot. Name from live age job family pets hobbies likes dislikes.'),
    JSON_OBJECT('start', 911, 'end', 951, 'speaker', NULL, 'text', 'Oh, no. That''s a good tip. You can choose. Maybe you say your name and your job. Yes. Or your name and your hobby. It depends on the situation. If you are in a class, maybe you say your name and why you are learning English. Exactly. You can say, "My name is Paul. I''m from the United States. I like to learn new things." And if you are at a party, you can say, "Hi, I''m Emily. I love to paint and listen to music."'),
    JSON_OBJECT('start', 951, 'end', 993, 'speaker', NULL, 'text', 'It is. The person can then ask, "Oh, what do you paint?" or "What music do you like?" And a new friendship begins. It all starts with, "Tell me about yourself." It really does. It''s not a scary question. It''s an invitation. An invitation to share a little bit about you. That''s a beautiful way to think about it. I think it''s been very nice to learn more about you, Paul.'),
    JSON_OBJECT('start', 993, 'end', 1030, 'speaker', NULL, 'text', 'And I learned you are a teacher who loves pizza and blue and you have a friendly dog named Max. It was a very successful conversation. Yes. And I hope it was helpful for all our listeners. I hope so too. Remember, you can use these simple sentences to talk about yourself. Yes. Don''t be afraid. Keep it simple and be friendly. That''s the most important part. That is the perfect advice. A smile is very important, too. Always.'),
    JSON_OBJECT('start', 1030, 'end', 1108, 'speaker', NULL, 'text', 'Well, I think our time is almost up for today. Wow. Time goes faster when you''re having fun. It really does. This was a great chat. It was. So, before we go, we want to ask our amazing listeners for a little favor. That''s right. If you enjoyed this episode, please subscribe to our channel, Mr. English Channel, and give this episode a big thumbs up, a like. It really helps people find our podcast.'),
    JSON_OBJECT('start', 1108, 'end', 1129, 'speaker', NULL, 'text', 'Thank you all for listening today. Thank you all. It was a pleasure. Stay safe and keep practicing. We will be back soon with another fun episode. Goodbye for now. Bye everyone. Bye Emily.')
  ),
  JSON_ARRAY(),
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  `editedText` = VALUES(`editedText`),
  `segments` = VALUES(`segments`),
  `updatedAt` = NOW();
INSERT INTO `Transcript` (`id`, `mediaTaskId`, `editedText`, `segments`, `words`, `createdAt`, `updatedAt`)
VALUES (
  'tr_votxt_qa_youtube_done',
  'task_votxt_qa_youtube_done',
  '这个发布演示说明 Votxt 如何接收链接、排队转写、展示进度并导出字幕。',
  JSON_ARRAY(
    JSON_OBJECT('start', 0, 'end', 6.2, 'speaker', '发言人 1', 'text', '这个发布演示说明 Votxt 如何接收链接。'),
    JSON_OBJECT('start', 6.3, 'end', 14.4, 'speaker', '发言人 1', 'text', '它会排队转写、展示进度并导出字幕。')
  ),
  JSON_ARRAY(),
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  `editedText` = VALUES(`editedText`),
  `segments` = VALUES(`segments`),
  `updatedAt` = NOW();

INSERT INTO `Transcript` (`id`, `mediaTaskId`, `editedText`, `segments`, `words`, `createdAt`, `updatedAt`)
VALUES (
  'tr_votxt_qa_creator_done',
  'task_votxt_qa_creator_done',
  '做自媒体六年之后，我更相信持续输出、复盘和真实表达比追热点更重要。',
  JSON_ARRAY(
    JSON_OBJECT('start', 0, 'end', 12.4, 'speaker', '发言人 1', 'text', '做自媒体六年之后，我更相信持续输出比追热点更重要。'),
    JSON_OBJECT('start', 12.5, 'end', 30.2, 'speaker', '发言人 1', 'text', '每一次复盘都会让下一条内容更清楚，也更接近真实表达。')
  ),
  JSON_ARRAY(),
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  `editedText` = VALUES(`editedText`),
  `segments` = VALUES(`segments`),
  `updatedAt` = NOW();
