-- Votxt 演示数据，适用于 TiDB/MySQL。
-- 请在完成数据库结构初始化或 `prisma db push` 后执行。

SET @demo_user_id = 'user_votxt_demo';
SET @demo_subscription_id = 'sub_votxt_demo_free';
SET @demo_task_id = 'task_votxt_demo_complete';
SET @demo_transcript_id = 'tr_votxt_demo_complete';

INSERT INTO `User` (`id`, `email`, `name`, `image`, `locale`, `dailyFreeCount`, `dailyResetAt`, `createdAt`, `updatedAt`)
VALUES (@demo_user_id, 'demo@votxt.local', 'Votxt Demo', NULL, 'en', 0, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `locale` = VALUES(`locale`), `updatedAt` = NOW();

INSERT INTO `Subscription` (
  `id`, `userId`, `plan`, `status`, `stripeCustomerId`, `stripeSubscriptionId`,
  `monthlyMinuteQuota`, `remainingMinutes`, `maxSingleFileMinutes`, `maxUploadBytes`,
  `currentPeriodStart`, `currentPeriodEnd`, `createdAt`, `updatedAt`
)
VALUES (
  @demo_subscription_id, @demo_user_id, 'FREE', 'ACTIVE', NULL, NULL,
  120, 118, 30, 2147483648,
  NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), NOW(), NOW()
)
ON DUPLICATE KEY UPDATE
  `monthlyMinuteQuota` = VALUES(`monthlyMinuteQuota`),
  `remainingMinutes` = VALUES(`remainingMinutes`),
  `updatedAt` = NOW();

INSERT INTO `MediaTask` (
  `id`, `userId`, `sourceType`, `originalName`, `sourceUrl`, `normalizedUrl`, `objectKey`,
  `status`, `statusMessage`, `language`, `detectedLanguage`, `durationSeconds`, `fileSizeBytes`,
  `provider`, `speakerCount`, `progress`, `quotaMinutes`, `errorCode`, `createdAt`, `updatedAt`, `completedAt`
)
VALUES (
  @demo_task_id, @demo_user_id, 'UPLOAD', 'product-interview.mp3',
  'https://assets.votxt.local/demo/product-interview.mp3', NULL, 'uploads/demo/product-interview.mp3',
  'COMPLETED', 'Transcript is ready.', 'auto', 'en', 126, 5242880,
  'deepgram', 2, 100, 3, NULL, NOW(), NOW(), NOW()
)
ON DUPLICATE KEY UPDATE
  `status` = VALUES(`status`),
  `statusMessage` = VALUES(`statusMessage`),
  `progress` = VALUES(`progress`),
  `updatedAt` = NOW();

INSERT INTO `Transcript` (`id`, `mediaTaskId`, `plainText`, `segments`, `words`, `editedText`, `createdAt`, `updatedAt`)
VALUES (
  @demo_transcript_id,
  @demo_task_id,
  'Speaker 1: Votxt should turn long recordings into usable text quickly.\nSpeaker 2: The most important outputs are a clean transcript, summary, mind map, Q&A, translation, and subtitle files.',
  JSON_ARRAY(
    JSON_OBJECT('start', 0, 'end', 8.4, 'speaker', 'Speaker 1', 'text', 'Votxt should turn long recordings into usable text quickly.'),
    JSON_OBJECT('start', 8.5, 'end', 18.9, 'speaker', 'Speaker 2', 'text', 'The most important outputs are a clean transcript, summary, mind map, Q&A, translation, and subtitle files.')
  ),
  JSON_ARRAY(
    JSON_OBJECT('start', 0, 'end', 0.4, 'word', 'Votxt', 'confidence', 0.99, 'speaker', 'Speaker 1'),
    JSON_OBJECT('start', 0.5, 'end', 1.0, 'word', 'should', 'confidence', 0.98, 'speaker', 'Speaker 1')
  ),
  NULL,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  `plainText` = VALUES(`plainText`),
  `segments` = VALUES(`segments`),
  `words` = VALUES(`words`),
  `updatedAt` = NOW();

INSERT INTO `AIInsight` (`id`, `mediaTaskId`, `type`, `locale`, `title`, `content`, `model`, `createdAt`, `updatedAt`)
VALUES
  (
    'ai_votxt_demo_summary', @demo_task_id, 'SUMMARY', 'en', 'Summary',
    JSON_OBJECT('overview', 'The conversation defines Votxt as a fast media-to-text workspace.', 'bullets', JSON_ARRAY('Clean transcripts are the primary output.', 'AI insights make the transcript reusable.', 'Subtitle and document exports are required.')),
    'seed', NOW(), NOW()
  ),
  (
    'ai_votxt_demo_mindmap', @demo_task_id, 'MIND_MAP', 'en', 'Mind map',
    JSON_OBJECT('label', 'Votxt', 'children', JSON_ARRAY(JSON_OBJECT('label', 'Transcript', 'children', JSON_ARRAY()), JSON_OBJECT('label', 'AI insights', 'children', JSON_ARRAY()), JSON_OBJECT('label', 'Exports', 'children', JSON_ARRAY()))),
    'seed', NOW(), NOW()
  ),
  (
    'ai_votxt_demo_qa', @demo_task_id, 'QA', 'en', 'Q&A',
    JSON_ARRAY(JSON_OBJECT('question', 'What is Votxt for?', 'answer', 'It converts audio, video, and YouTube links into transcript assets.')),
    'seed', NOW(), NOW()
  ),
  (
    'ai_votxt_demo_translation', @demo_task_id, 'TRANSLATION', 'en', 'Translation',
    JSON_OBJECT('target', 'en', 'text', 'Speaker 1: Votxt should turn long recordings into usable text quickly.'),
    'seed', NOW(), NOW()
  )
ON DUPLICATE KEY UPDATE
  `content` = VALUES(`content`),
  `model` = VALUES(`model`),
  `updatedAt` = NOW();

INSERT INTO `ExportAsset` (`id`, `mediaTaskId`, `format`, `objectKey`, `url`, `createdAt`)
VALUES
  ('ex_votxt_demo_txt', @demo_task_id, 'TXT', NULL, '/api/tasks/task_votxt_demo_complete/exports/txt', NOW()),
  ('ex_votxt_demo_srt', @demo_task_id, 'SRT', NULL, '/api/tasks/task_votxt_demo_complete/exports/srt', NOW()),
  ('ex_votxt_demo_vtt', @demo_task_id, 'VTT', NULL, '/api/tasks/task_votxt_demo_complete/exports/vtt', NOW()),
  ('ex_votxt_demo_json', @demo_task_id, 'JSON', NULL, '/api/tasks/task_votxt_demo_complete/exports/json', NOW()),
  ('ex_votxt_demo_pdf', @demo_task_id, 'PDF', NULL, '/api/tasks/task_votxt_demo_complete/exports/pdf', NOW())
ON DUPLICATE KEY UPDATE `url` = VALUES(`url`);
