-- 手动补发 Stripe 已支付但系统未成功发放的会员套餐权益。
-- 使用前先在 Stripe Dashboard 确认 Checkout Session / Invoice 已支付成功。
-- 二选一填写：@order_id 或 @checkout_session_id。

SET @order_id = '';
SET @checkout_session_id = '';

-- 可选：如需按 Stripe 实际账期手动指定，请填写 UTC 时间；为空则按订单 interval 自动给 1 个月或 1 年。
SET @manual_period_start = NULL;
SET @manual_period_end = NULL;

START TRANSACTION;

SELECT
  `id`,
  `userId`,
  `itemCode`,
  `interval`,
  `stripeCustomerId`,
  `stripeSubscriptionId`
INTO
  @resolved_order_id,
  @user_id,
  @plan_code,
  @billing_interval,
  @stripe_customer_id,
  @stripe_subscription_id
FROM `BillingOrder`
WHERE
  (`id` = @order_id AND @order_id <> '')
  OR (`stripeCheckoutSessionId` = @checkout_session_id AND @checkout_session_id <> '')
ORDER BY `createdAt` DESC
LIMIT 1
FOR UPDATE;

SET @minutes = CASE @plan_code
  WHEN 'BASIC' THEN 1200
  WHEN 'STANDARD' THEN 3000
  WHEN 'PRO' THEN 6000
  ELSE NULL
END;

SET @max_single_file_minutes = CASE @plan_code
  WHEN 'BASIC' THEN 600
  WHEN 'STANDARD' THEN 900
  WHEN 'PRO' THEN 1200
  ELSE NULL
END;

SET @period_start = COALESCE(@manual_period_start, NOW());
SET @period_end = COALESCE(
  @manual_period_end,
  CASE
    WHEN @billing_interval = 'ANNUAL' THEN DATE_ADD(@period_start, INTERVAL 1 YEAR)
    ELSE DATE_ADD(@period_start, INTERVAL 1 MONTH)
  END
);

SET @subscription_id = (
  SELECT `id`
  FROM `Subscription`
  WHERE
    (`stripeSubscriptionId` = @stripe_subscription_id AND @stripe_subscription_id IS NOT NULL)
    OR (`stripeCustomerId` = @stripe_customer_id AND @stripe_customer_id IS NOT NULL)
    OR (`userId` = @user_id)
  ORDER BY `createdAt` DESC
  LIMIT 1
);

SET @subscription_id = COALESCE(@subscription_id, CONCAT('manual_', LEFT(REPLACE(UUID(), '-', ''), 25)));
SET @ledger_reason = CONCAT('Manual membership grant for BillingOrder ', @resolved_order_id);
SET @ledger_idempotency_key = CONCAT('manual:membership:', @resolved_order_id);

-- 如果下面任一条件返回 0 行，请 ROLLBACK 并人工检查订单是否为 BASIC/STANDARD/PRO 订阅订单。
SELECT @resolved_order_id AS order_id, @user_id AS user_id, @plan_code AS plan_code, @minutes AS minutes;

INSERT INTO `Subscription` (
  `id`,
  `userId`,
  `plan`,
  `status`,
  `stripeCustomerId`,
  `stripeSubscriptionId`,
  `monthlyMinuteQuota`,
  `remainingMinutes`,
  `maxSingleFileMinutes`,
  `currentPeriodStart`,
  `currentPeriodEnd`,
  `createdAt`,
  `updatedAt`
) VALUES (
  @subscription_id,
  @user_id,
  @plan_code,
  'ACTIVE',
  @stripe_customer_id,
  @stripe_subscription_id,
  @minutes,
  @minutes,
  @max_single_file_minutes,
  @period_start,
  @period_end,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  `plan` = VALUES(`plan`),
  `status` = 'ACTIVE',
  `stripeCustomerId` = COALESCE(VALUES(`stripeCustomerId`), `stripeCustomerId`),
  `stripeSubscriptionId` = COALESCE(VALUES(`stripeSubscriptionId`), `stripeSubscriptionId`),
  `monthlyMinuteQuota` = VALUES(`monthlyMinuteQuota`),
  `remainingMinutes` = VALUES(`remainingMinutes`),
  `maxSingleFileMinutes` = VALUES(`maxSingleFileMinutes`),
  `currentPeriodStart` = VALUES(`currentPeriodStart`),
  `currentPeriodEnd` = VALUES(`currentPeriodEnd`),
  `updatedAt` = NOW();

INSERT INTO `UsageLedger` (
  `id`,
  `userId`,
  `subscriptionId`,
  `type`,
  `minutesDelta`,
  `reason`,
  `idempotencyKey`,
  `createdAt`
)
SELECT
  CONCAT('manual_', LEFT(REPLACE(UUID(), '-', ''), 25)),
  @user_id,
  @subscription_id,
  'ADJUST',
  @minutes,
  @ledger_reason,
  @ledger_idempotency_key,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `UsageLedger` WHERE `idempotencyKey` = @ledger_idempotency_key
);

UPDATE `BillingOrder`
SET
  `subscriptionId` = @subscription_id,
  `status` = 'ACTIVE',
  `stripePaymentStatus` = COALESCE(`stripePaymentStatus`, 'paid'),
  `paidAt` = COALESCE(`paidAt`, NOW()),
  `metadata` = JSON_SET(
    COALESCE(`metadata`, JSON_OBJECT()),
    '$.manualEntitlementGrantedAt',
    DATE_FORMAT(UTC_TIMESTAMP(3), '%Y-%m-%dT%H:%i:%s.%fZ'),
    '$.manualEntitlementReason',
    'Stripe paid but automatic entitlement failed'
  ),
  `updatedAt` = NOW()
WHERE `id` = @resolved_order_id;

COMMIT;
