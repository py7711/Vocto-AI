-- Votxt QA 测试数据，适用于 TiDB/MySQL。
-- 覆盖排队、处理中、失败、完成和 YouTube 链接任务状态。

SET @test_user_id = 'user_votxt_qa';

INSERT INTO `User` (`id`, `email`, `name`, `image`, `locale`, `dailyFreeCount`, `dailyResetAt`, `createdAt`, `updatedAt`)
VALUES (@test_user_id, 'qa@votxt.local', 'Votxt QA', NULL, 'zh', 2, DATE_ADD(NOW(), INTERVAL 1 DAY), NOW(), NOW())
ON DUPLICATE KEY UPDATE `dailyFreeCount` = VALUES(`dailyFreeCount`), `updatedAt` = NOW();

INSERT INTO `Subscription` (
  `id`, `userId`, `plan`, `status`, `stripeCustomerId`, `stripeSubscriptionId`,
  `monthlyMinuteQuota`, `remainingMinutes`, `maxSingleFileMinutes`, `maxUploadBytes`,
  `currentPeriodStart`, `currentPeriodEnd`, `createdAt`, `updatedAt`
)
VALUES
  ('sub_votxt_qa_basic', @test_user_id, 'PRO', 'ACTIVE', 'cus_test_votxt', 'sub_test_votxt', 1200, 875, 600, 5368709120, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), NOW(), NOW())
ON DUPLICATE KEY UPDATE `remainingMinutes` = VALUES(`remainingMinutes`), `updatedAt` = NOW();

INSERT INTO `MediaTask` (
  `id`, `userId`, `sourceType`, `originalName`, `sourceUrl`, `normalizedUrl`, `objectKey`,
  `status`, `statusMessage`, `language`, `detectedLanguage`, `durationSeconds`, `fileSizeBytes`,
  `provider`, `speakerCount`, `progress`, `quotaMinutes`, `errorCode`, `createdAt`, `updatedAt`, `completedAt`
)
VALUES
  ('task_votxt_qa_queued', @test_user_id, 'UPLOAD', 'queued-call.wav', 'https://assets.votxt.local/qa/queued-call.wav', NULL, 'uploads/qa/queued-call.wav', 'QUEUED', 'Task has been queued.', 'auto', NULL, NULL, 3200000, NULL, NULL, 5, 0, NULL, NOW(), NOW(), NULL),
  ('task_votxt_qa_processing', @test_user_id, 'UPLOAD', 'processing-meeting.mp4', 'https://assets.votxt.local/qa/processing-meeting.mp4', NULL, 'uploads/qa/processing-meeting.mp4', 'TRANSCRIBING', 'Transcribing with provider fallback.', 'en', NULL, NULL, 48000000, 'deepgram', NULL, 45, 0, NULL, NOW(), NOW(), NULL),
  ('task_votxt_qa_failed', @test_user_id, 'YOUTUBE', 'Private video', 'https://www.youtube.com/watch?v=private', NULL, NULL, 'FAILED', 'yt-dlp could not resolve an audio URL.', 'auto', NULL, NULL, NULL, NULL, NULL, 100, 0, 'TRANSCRIPTION_FAILED', NOW(), NOW(), NULL),
  ('task_votxt_qa_youtube_done', @test_user_id, 'YOUTUBE', 'Launch demo', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://cdn.votxt.local/audio/launch-demo.mp3', NULL, 'COMPLETED', 'Transcript is ready.', 'auto', 'en', 214, NULL, 'assemblyai', 1, 100, 4, NULL, NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `status` = VALUES(`status`),
  `statusMessage` = VALUES(`statusMessage`),
  `progress` = VALUES(`progress`),
  `updatedAt` = NOW();

INSERT INTO `Transcript` (`id`, `mediaTaskId`, `plainText`, `segments`, `words`, `editedText`, `createdAt`, `updatedAt`)
VALUES (
  'tr_votxt_qa_youtube_done',
  'task_votxt_qa_youtube_done',
  'This launch demo explains how Votxt accepts a link, queues transcription, shows progress, and exports subtitles.',
  JSON_ARRAY(
    JSON_OBJECT('start', 0, 'end', 6.2, 'speaker', 'Speaker 1', 'text', 'This launch demo explains how Votxt accepts a link.'),
    JSON_OBJECT('start', 6.3, 'end', 14.4, 'speaker', 'Speaker 1', 'text', 'It queues transcription, shows progress, and exports subtitles.')
  ),
  JSON_ARRAY(),
  'This launch demo explains how Votxt accepts a link, queues transcription, shows progress, and exports subtitles.',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  `plainText` = VALUES(`plainText`),
  `segments` = VALUES(`segments`),
  `editedText` = VALUES(`editedText`),
  `updatedAt` = NOW();

INSERT INTO `AIInsight` (`id`, `mediaTaskId`, `type`, `locale`, `title`, `content`, `model`, `createdAt`, `updatedAt`)
VALUES
  ('ai_votxt_qa_summary', 'task_votxt_qa_youtube_done', 'SUMMARY', 'zh', '总结', JSON_OBJECT('overview', '演示说明了 Votxt 的链接转写流程。', 'bullets', JSON_ARRAY('粘贴链接', '队列处理', '导出字幕')), 'seed', NOW(), NOW()),
  ('ai_votxt_qa_mindmap', 'task_votxt_qa_youtube_done', 'MIND_MAP', 'zh', '思维导图', JSON_OBJECT('label', '链接转写', 'children', JSON_ARRAY(JSON_OBJECT('label', '输入', 'children', JSON_ARRAY()), JSON_OBJECT('label', '处理', 'children', JSON_ARRAY()), JSON_OBJECT('label', '导出', 'children', JSON_ARRAY()))), 'seed', NOW(), NOW()),
  ('ai_votxt_qa_qa', 'task_votxt_qa_youtube_done', 'QA', 'zh', '问答', JSON_ARRAY(JSON_OBJECT('question', '这个演示说明了什么？', 'answer', '说明 Votxt 如何从链接生成转写和字幕。')), 'seed', NOW(), NOW()),
  ('ai_votxt_qa_translation', 'task_votxt_qa_youtube_done', 'TRANSLATION', 'zh', '翻译', JSON_OBJECT('target', 'zh', 'text', '该演示说明 Votxt 接收链接、排队转写、显示进度并导出字幕。'), 'seed', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `content` = VALUES(`content`),
  `updatedAt` = NOW();
