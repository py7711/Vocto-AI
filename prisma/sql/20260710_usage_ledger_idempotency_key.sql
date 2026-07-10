-- 第一步：先添加 idempotencyKey 字段
ALTER TABLE `UsageLedger` 
  ADD COLUMN `idempotencyKey` VARCHAR(191) NULL COMMENT '外部事件幂等键，例如 Stripe Checkout Session，用于防止重复发放权益' AFTER `reason`;

-- 第二步：再为该字段创建唯一索引
ALTER TABLE `UsageLedger` 
  ADD UNIQUE KEY `UsageLedger_idempotencyKey_key` (`idempotencyKey`);