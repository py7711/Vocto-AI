-- 修复 20260716 迁移被分步执行时可能遗留的 nullable editedText。
UPDATE `Transcript`
SET `editedText` = ''
WHERE `editedText` IS NULL;

ALTER TABLE `Transcript`
  MODIFY COLUMN `editedText` LONGTEXT NOT NULL COMMENT '完整转写文本，可由用户编辑';
