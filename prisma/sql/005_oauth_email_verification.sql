-- 为 Votxt 增加 Google OAuth 和邮箱验证数据表
-- 适用于已经执行过基础建表脚本的 MySQL/TiDB 数据库。

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
