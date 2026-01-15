-- OAuth 第三方登录账号表
-- 用于存储用户绑定的 GitHub、Google、Gitee 等第三方账号信息

CREATE TABLE IF NOT EXISTS `oauth_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '关联用户ID',
  `provider` enum('github','google','gitee') NOT NULL COMMENT '第三方平台',
  `provider_id` varchar(100) NOT NULL COMMENT '第三方用户ID',
  `access_token` varchar(500) DEFAULT NULL COMMENT '访问令牌',
  `refresh_token` varchar(500) DEFAULT NULL COMMENT '刷新令牌',
  `profile` json DEFAULT NULL COMMENT '第三方用户原始信息',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_provider_providerId` (`provider`, `provider_id`),
  KEY `idx_userId` (`user_id`),
  CONSTRAINT `fk_oauth_accounts_userId` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='OAuth第三方登录账号表';
