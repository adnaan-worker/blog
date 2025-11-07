-- 数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS `blog_prod` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `blog_test` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权
CREATE USER IF NOT EXISTS 'blog_user'@'%' IDENTIFIED BY 'blog_password_123';
CREATE USER IF NOT EXISTS 'blog_test_user'@'%' IDENTIFIED BY 'blog_password_123';

-- 授权
GRANT ALL PRIVILEGES ON `blog_prod`.* TO 'blog_user'@'%';
GRANT ALL PRIVILEGES ON `blog_test`.* TO 'blog_test_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 显示创建的数据库
SHOW DATABASES;

-- 显示用户
SELECT User, Host FROM mysql.user WHERE User LIKE 'blog%'; 