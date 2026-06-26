-- Votxt 企业 Webhook Endpoint 增量迁移
-- 适用于已执行 007_enterprise_workspace.sql 的数据库。
-- 本脚本新增企业回调地址和投递记录，便于把任务完成、失败和分享链接事件推送到客户系统。

SET NAMES utf8mb4;

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
