-- 对齐免费套餐默认分钟额度
-- 适用于已经执行过完整建表或旧版增量脚本的 MySQL/TiDB 数据库。
-- 目标：让数据库默认值、注册/OAuth 创建逻辑、价格页和产品文档统一为 Free 120 分钟/月。

ALTER TABLE `Subscription`
  MODIFY COLUMN `monthlyMinuteQuota` INT NOT NULL DEFAULT 120 COMMENT '每月分钟额度',
  MODIFY COLUMN `remainingMinutes` INT NOT NULL DEFAULT 120 COMMENT '当前账期剩余可用分钟数';

UPDATE `Subscription`
SET
  `monthlyMinuteQuota` = 120,
  `remainingMinutes` = CASE
    WHEN `remainingMinutes` = 90 THEN 120
    ELSE `remainingMinutes`
  END,
  `updatedAt` = NOW()
WHERE `plan` = 'FREE' AND `monthlyMinuteQuota` = 90;
