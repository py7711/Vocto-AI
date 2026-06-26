-- 为 Votxt 增加订阅用量流水表
-- 适用于已经执行过基础建表脚本的 MySQL/TiDB 数据库。

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
