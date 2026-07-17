-- 将所有 AI 后处理结果收口到 Transcript，并删除 AIInsight 与 plainText。
-- 必须在部署读取新字段的应用版本之前执行。
ALTER TABLE `Transcript`
  ADD COLUMN `summary` JSON NULL COMMENT '当前摘要 JSON，未开启摘要生成时为空' AFTER `editedText`,
  ADD COLUMN `mindMap` JSON NULL COMMENT '当前思维导图 JSON' AFTER `summary`,
  ADD COLUMN `translations` JSON NULL COMMENT '按目标语言代码存储的翻译 JSON 对象' AFTER `mindMap`,
  ADD COLUMN `summaryGenerationCount` INT NOT NULL DEFAULT 0 COMMENT '摘要累计生成次数' AFTER `translations`;

-- plainText 删除前，将完整正文保存在 editedText。
UPDATE `Transcript`
SET `editedText` = COALESCE(`editedText`, `plainText`);

UPDATE `Transcript` AS transcript
LEFT JOIN (
  SELECT insight.`mediaTaskId`, insight.`content`
  FROM `AIInsight` AS insight
  INNER JOIN (
    SELECT `mediaTaskId`, MAX(`updatedAt`) AS `updatedAt`
    FROM `AIInsight`
    WHERE `type` = 'SUMMARY'
    GROUP BY `mediaTaskId`
  ) AS latest ON latest.`mediaTaskId` = insight.`mediaTaskId` AND latest.`updatedAt` = insight.`updatedAt`
  WHERE insight.`type` = 'SUMMARY'
) AS summaryInsight ON summaryInsight.`mediaTaskId` = transcript.`mediaTaskId`
LEFT JOIN (
  SELECT insight.`mediaTaskId`, insight.`content`
  FROM `AIInsight` AS insight
  INNER JOIN (
    SELECT `mediaTaskId`, MAX(`updatedAt`) AS `updatedAt`
    FROM `AIInsight`
    WHERE `type` = 'MIND_MAP'
    GROUP BY `mediaTaskId`
  ) AS latest ON latest.`mediaTaskId` = insight.`mediaTaskId` AND latest.`updatedAt` = insight.`updatedAt`
  WHERE insight.`type` = 'MIND_MAP'
) AS mindMapInsight ON mindMapInsight.`mediaTaskId` = transcript.`mediaTaskId`
LEFT JOIN (
  SELECT `mediaTaskId`, JSON_OBJECTAGG(`locale`, `content`) AS `content`
  FROM `AIInsight`
  WHERE `type` = 'TRANSLATION'
  GROUP BY `mediaTaskId`
) AS translationInsight ON translationInsight.`mediaTaskId` = transcript.`mediaTaskId`
SET
  transcript.`summary` = summaryInsight.`content`,
  transcript.`mindMap` = mindMapInsight.`content`,
  transcript.`translations` = translationInsight.`content`,
  transcript.`summaryGenerationCount` = CASE WHEN summaryInsight.`content` IS NULL THEN 0 ELSE 1 END;

DROP TABLE IF EXISTS `AIInsight`;

ALTER TABLE `Transcript`
  DROP COLUMN `plainText`,
  MODIFY COLUMN `editedText` LONGTEXT NOT NULL COMMENT '完整转写文本，可由用户编辑';
