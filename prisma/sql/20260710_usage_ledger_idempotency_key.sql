-- 为 Stripe 权益发放流水增加数据库级幂等键，防止 webhook 并发或重试导致重复发放。
ALTER TABLE `UsageLedger`
  ADD COLUMN `idempotencyKey` VARCHAR(191) NULL COMMENT '外部事件幂等键，例如 Stripe Checkout Session，用于防止重复发放权益' AFTER `reason`,
  ADD UNIQUE KEY `UsageLedger_idempotencyKey_key` (`idempotencyKey`);
