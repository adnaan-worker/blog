-- 个人中心音乐服务管理功能 - 数据库初始化脚本 (MySQL)
-- 适用数据库: MySQL 5.7+ / MariaDB

-- 1. 创建用户音乐表
CREATE TABLE IF NOT EXISTS `user_music` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT '关联用户ID',
  `song_id` VARCHAR(255) NOT NULL COMMENT '平台歌曲ID',
  `server` VARCHAR(50) NOT NULL COMMENT '平台标识 (netease/tencent)',
  `title` VARCHAR(255) NOT NULL COMMENT '歌曲标题',
  `artist` VARCHAR(255) NOT NULL COMMENT '歌手',
  `url` TEXT COMMENT '播放链接',
  `pic` TEXT COMMENT '封面链接',
  `lrc` TEXT COMMENT '歌词链接',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重',
  `created_at` DATETIME NOT NULL COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL COMMENT '更新时间',
  INDEX `idx_user_id` (`user_id`),
  UNIQUE KEY `uk_user_song_server` (`user_id`, `song_id`, `server`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏音乐表';

-- 2. 插入初始数据 (迁移自 music-list.json)
-- 假设管理员 ID 为 1
INSERT INTO `user_music` (`user_id`, `song_id`, `server`, `title`, `artist`, `url`, `pic`, `lrc`, `sort_order`, `created_at`, `updated_at`)
VALUES 
(1, '004BJRhU4g74fg', 'tencent', '明日坐标', '林俊杰/王者荣耀', 'https://music.3e0.cn?server=tencent&type=url&id=004BJRhU4g74fg', 'https://music.3e0.cn?server=tencent&type=pic&id=000AImqc0jgZOu', 'https://music.3e0.cn?server=tencent&type=lrc&id=004BJRhU4g74fg', 1, NOW(), NOW()),
(1, '001p1Z5Z3lrPlu', 'tencent', '不死之身', '林俊杰', 'https://music.3e0.cn?server=tencent&type=url&id=001p1Z5Z3lrPlu', 'https://music.3e0.cn?server=tencent&type=pic&id=002aaUOS24kcwh', 'https://music.3e0.cn?server=tencent&type=lrc&id=001p1Z5Z3lrPlu', 2, NOW(), NOW()),
(1, '003XrK5P2xuSWF', 'tencent', '为你揭晓', '张艺兴/林俊杰', 'https://music.3e0.cn?server=tencent&type=url&id=003XrK5P2xuSWF', 'https://music.3e0.cn?server=tencent&type=pic&id=001a22ZU1kyrDf', 'https://music.3e0.cn?server=tencent&type=lrc&id=003XrK5P2xuSWF', 3, NOW(), NOW()),
(1, '0039PnSs3QC2Dh', 'tencent', '绝不绝', '林俊杰/无畏契约', 'https://music.3e0.cn?server=tencent&type=url&id=0039PnSs3QC2Dh', 'https://music.3e0.cn?server=tencent&type=pic&id=000cPuL32brjN5', 'https://music.3e0.cn?server=tencent&type=lrc&id=0039PnSs3QC2Dh', 4, NOW(), NOW()),
(1, '000nyY3h1f03BX', 'tencent', '无杂质', '蔡宥绮', 'https://music.3e0.cn?server=tencent&type=url&id=000nyY3h1f03BX', 'https://music.3e0.cn?server=tencent&type=pic&id=000nyY3h1f03BX', 'https://music.3e0.cn?server=tencent&type=lrc&id=000nyY3h1f03BX', 5, NOW(), NOW()),
(1, '001NwtwK1sBDWh', 'tencent', '光阴副本', '林俊杰', 'https://music.3e0.cn?server=tencent&type=url&id=001NwtwK1sBDWh', 'https://music.3e0.cn?server=tencent&type=pic&id=001NwtwK1sBDWh', 'https://music.3e0.cn?server=tencent&type=lrc&id=001NwtwK1sBDWh', 6, NOW(), NOW()),
(1, '001auUcH4WQs2V', 'tencent', '恋人', '李荣浩', 'https://music.3e0.cn?server=tencent&type=url&id=001auUcH4WQs2V', 'https://music.3e0.cn?server=tencent&type=pic&id=001auUcH4WQs2V', 'https://music.3e0.cn?server=tencent&type=lrc&id=001auUcH4WQs2V', 7, NOW(), NOW()),
(1, '004czErX2hy62A', 'tencent', 'Too Bad', '林俊杰', 'https://music.3e0.cn?server=tencent&type=url&id=004czErX2hy62A', 'https://music.3e0.cn?server=tencent&type=pic&id=004czErX2hy62A', 'https://music.3e0.cn?server=tencent&type=lrc&id=004czErX2hy62A', 8, NOW(), NOW()),
(1, '002E2qJq0xKZfp', 'tencent', 'BINGBIAN病变', 'Cubi /Fi9', 'https://music.3e0.cn?server=tencent&type=url&id=002E2qJq0xKZfp', 'https://music.3e0.cn?server=tencent&type=pic&id=002E2qJq0xKZfp', 'https://music.3e0.cn?server=tencent&type=lrc&id=002E2qJq0xKZfp', 9, NOW(), NOW()),
(1, '0005jrRs05ELQv', 'tencent', '我继续', '林俊杰', 'https://music.3e0.cn?server=tencent&type=url&id=0005jrRs05ELQv', 'https://music.3e0.cn?server=tencent&type=pic&id=0005jrRs05ELQv', 'https://music.3e0.cn?server=tencent&type=lrc&id=0005jrRs05ELQv', 10, NOW(), NOW())
ON DUPLICATE KEY UPDATE `updated_at` = NOW();

-- 3. 说明
-- user_id 关联到 users 表的 id 字段。
