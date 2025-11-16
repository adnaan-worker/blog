-- ===================================================================
-- AI聊天表结构更新
-- 从存储消息对改为存储单条消息，支持LangChain消息历史
-- ===================================================================

-- 备份旧表（如果有数据）
CREATE TABLE IF NOT EXISTS `ai_chats_backup` LIKE `ai_chats`;
INSERT INTO `ai_chats_backup` SELECT * FROM `ai_chats`;

-- 删除旧表
DROP TABLE IF EXISTS `ai_chats`;

-- 创建新表结构
CREATE TABLE `ai_chats` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `session_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '会话ID',
  `role` enum('human','ai','system') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息角色：human(用户), ai(AI回复), system(系统提示)',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息内容',
  `type` enum('chat','blog_assistant','writing_assistant') COLLATE utf8mb4_unicode_ci DEFAULT 'chat' COMMENT '聊天类型',
  `metadata` json DEFAULT NULL COMMENT '消息元数据（tokens、duration等）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_user_id` (`user_id`) USING BTREE,
  KEY `idx_session_id` (`session_id`) USING BTREE,
  KEY `idx_session_created` (`session_id`,`created_at`) USING BTREE COMMENT '用于按时间排序获取历史'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI聊天历史表';

-- 如果需要迁移旧数据（将消息对拆分为单条消息）
-- 注意：这个脚本假设旧表有 message 和 response 字段
-- 如果旧表结构不同，请根据实际情况调整

-- 迁移用户消息
INSERT INTO `ai_chats` (`user_id`, `session_id`, `role`, `content`, `type`, `metadata`, `created_at`)
SELECT 
  `user_id`,
  `session_id`,
  'human' as `role`,
  `message` as `content`,
  `type`,
  JSON_OBJECT('tokens', IFNULL(`tokens`, 0), 'duration', IFNULL(`duration`, 0)) as `metadata`,
  `created_at`
FROM `ai_chats_backup`
WHERE `message` IS NOT NULL AND `message` != '';

-- 迁移AI回复
INSERT INTO `ai_chats` (`user_id`, `session_id`, `role`, `content`, `type`, `metadata`, `created_at`)
SELECT 
  `user_id`,
  `session_id`,
  'ai' as `role`,
  `response` as `content`,
  `type`,
  JSON_OBJECT('tokens', IFNULL(`tokens`, 0), 'duration', IFNULL(`duration`, 0)) as `metadata`,
  DATE_ADD(`created_at`, INTERVAL 1 SECOND) as `created_at` -- AI回复时间稍晚于用户消息
FROM `ai_chats_backup`
WHERE `response` IS NOT NULL AND `response` != '';

-- 验证迁移结果
SELECT 
  '迁移完成' as status,
  COUNT(*) as total_messages,
  SUM(CASE WHEN role = 'human' THEN 1 ELSE 0 END) as human_messages,
  SUM(CASE WHEN role = 'ai' THEN 1 ELSE 0 END) as ai_messages,
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(DISTINCT user_id) as total_users
FROM `ai_chats`;

-- 如果迁移成功，可以删除备份表
-- DROP TABLE IF EXISTS `ai_chats_backup`;
