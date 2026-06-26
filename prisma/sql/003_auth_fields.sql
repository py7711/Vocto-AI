-- 为企业级账号体系补充认证字段
-- 适用于已经执行过旧版建表脚本的 MySQL/TiDB 数据库。

ALTER TABLE `User`
  ADD COLUMN `password_hash` VARCHAR(255) NULL COMMENT '登录密码哈希，OAuth 用户可为空' AFTER `email`,
  ADD COLUMN `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER' COMMENT '用户角色：普通用户或管理员' AFTER `image`,
  ADD COLUMN `email_verified_at` DATETIME(3) NULL COMMENT '邮箱验证时间，为空表示未验证' AFTER `locale`,
  ADD COLUMN `last_login_at` DATETIME(3) NULL COMMENT '用户最后登录时间' AFTER `email_verified_at`;
