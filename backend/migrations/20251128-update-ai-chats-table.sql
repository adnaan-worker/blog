-- 更新 ai_chats 表结构以支持多角色消息
-- 执行时间: 2025-11-28
-- 注意: 此操作会删除旧数据

USE `adnaan_blog`;

-- 1. 清空表数据（不兼容旧数据）
TRUNCATE TABLE `ai_chats`;

-- 2. 删除旧字段
ALTER TABLE `ai_chats`
DROP COLUMN `message`,
DROP COLUMN `response`;

-- 3. 添加新字段
ALTER TABLE `ai_chats`
ADD COLUMN `role` ENUM('user', 'assistant', 'system') NOT NULL COMMENT '消息角色' AFTER `session_id`,
ADD COLUMN `content` TEXT NOT NULL COMMENT '消息内容' AFTER `role`;

-- 4. 添加索引
ALTER TABLE `ai_chats`
ADD INDEX `idx_ai_chats_role` (`role` ASC) COMMENT '角色索引';

-- 完成
SELECT '✅ ai_chats 表结构更新完成（旧数据已清空）' AS status;
