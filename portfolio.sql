-- =========================
-- 创建数据库
-- =========================

DROP DATABASE IF EXISTS portfolio;

CREATE DATABASE portfolio
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE portfolio;

-- =========================
-- 管理员表
-- =========================

DROP TABLE IF EXISTS admin;

CREATE TABLE admin(

                      id BIGINT PRIMARY KEY AUTO_INCREMENT,

                      username VARCHAR(50)
                          NOT NULL UNIQUE,

                      password VARCHAR(255)
                          NOT NULL,

                      nickname VARCHAR(50),

                      avatar VARCHAR(255),

                      create_time DATETIME
                          DEFAULT CURRENT_TIMESTAMP

);

INSERT INTO admin(

    username,
    password,
    nickname

)

VALUES(

          'admin',

          '$2a$10$7jTqZ4Wl3O6d0YVx9K7vWOT6z8J6P2S2d8N0sJ1Y3v8Q0m9R2nKqC',

          '超级管理员'

      );

-- =========================
-- 文章表
-- =========================

DROP TABLE IF EXISTS article;

CREATE TABLE article(

                        id BIGINT PRIMARY KEY AUTO_INCREMENT,

                        title VARCHAR(255)
                            NOT NULL,

                        summary VARCHAR(500),

                        content LONGTEXT,

                        cover VARCHAR(255),

                        views INT
                            DEFAULT 0,

                        create_time DATETIME,

                        update_time DATETIME

);

-- =========================
-- 项目表
-- =========================

DROP TABLE IF EXISTS project;

CREATE TABLE project(

                        id BIGINT PRIMARY KEY AUTO_INCREMENT,

                        project_name VARCHAR(100),

                        description TEXT,

                        tech_stack VARCHAR(255),

                        github_url VARCHAR(255),

                        demo_url VARCHAR(255),

                        image_url VARCHAR(255),

                        create_time DATETIME
                            DEFAULT CURRENT_TIMESTAMP

);

-- =========================
-- 留言表
-- =========================

DROP TABLE IF EXISTS message;

CREATE TABLE message(

                        id BIGINT PRIMARY KEY AUTO_INCREMENT,

                        username VARCHAR(100),

                        email VARCHAR(100),

                        content TEXT,

                        create_time DATETIME
                            DEFAULT CURRENT_TIMESTAMP

);

-- =========================
-- 站点配置表 (Logo/站点信息)
-- =========================

DROP TABLE IF EXISTS site_config;

CREATE TABLE site_config(

                            id INT PRIMARY KEY AUTO_INCREMENT,

                            config_key VARCHAR(100) UNIQUE NOT NULL,

                            config_value TEXT,

                            update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

);

-- 插入默认 Logo 路径
INSERT INTO site_config (config_key, config_value) VALUES ('site_logo', '/upload/default_logo.png');

-- ==========================================
-- 3. 初始化打字机控制配置
-- ==========================================
-- 5.x 建议分步执行或使用 REPLACE INTO
REPLACE INTO site_config (config_key, config_value) VALUES ('hero_greeting', '你好，我是');
REPLACE INTO site_config (config_key, config_value) VALUES ('typewriter_prefix', '我是一名');
REPLACE INTO site_config (config_key, config_value) VALUES ('site_subtitle', '追求卓越的后端架构师');
REPLACE INTO site_config (config_key, config_value) VALUES ('hero_description', '精通 SpringBoot + Redis 高吞吐后端系统研发，擅长微服务拦截器 design 与拟物化磨砂前端视觉传达。');
REPLACE INTO site_config (config_key, config_value) VALUES ('typewriter_strings', '后端开发工程师\n分布式架构探索者\n像素级美学细节控');
REPLACE INTO site_config (config_key, config_value) VALUES ('type_speed', '60');
REPLACE INTO site_config (config_key, config_value) VALUES ('back_speed', '30');
REPLACE INTO site_config (config_key, config_value) VALUES ('typewriter_loop', 'true');

-- =========================
-- 默认项目
-- =========================

INSERT INTO project(

    project_name,
    description,
    tech_stack

)

VALUES

    (
        '个人博客系统',
        'SpringBoot博客管理平台',
        'SpringBoot,MySQL,Redis'
    ),

    (
        '在线点餐系统',
        '餐饮管理平台',
        'JavaWeb,MySQL'
    );

-- =========================
-- 默认文章
-- =========================

INSERT INTO article(

    title,
    summary,
    content

)

VALUES

    (
        'SpringBoot项目搭建',
        '快速搭建企业级项目',
        'SpringBoot项目正文内容'
    ),

    (
        'Redis缓存优化',
        '提升系统性能',
        'Redis正文内容'
    );

-- =========================
-- 音乐表
-- =========================

DROP TABLE IF EXISTS music;

CREATE TABLE music(

                     id BIGINT PRIMARY KEY AUTO_INCREMENT,

                     title VARCHAR(255)
                         NOT NULL,

                     artist VARCHAR(100),

                     url VARCHAR(500)
                         NOT NULL,

                     cover VARCHAR(255),

                     duration INT
                         DEFAULT 0,

                     sort INT
                         DEFAULT 0,

                     status INT
                         DEFAULT 1,

                     create_time DATETIME,

                     update_time DATETIME

);

-- =========================
-- 感悟表
-- =========================

DROP TABLE IF EXISTS insight;

CREATE TABLE insight(

                        id BIGINT PRIMARY KEY AUTO_INCREMENT,

                        content TEXT
                            NOT NULL,

                        author VARCHAR(100),

                        source VARCHAR(255),

                        sort INT
                            DEFAULT 0,

                        status INT
                            DEFAULT 1,

                        create_time DATETIME,

                        update_time DATETIME

);

-- =========================
-- 默认音乐
-- =========================

INSERT INTO music(
    title,
    artist,
    url,
    duration,
    sort,
    status
)
VALUES
    ('秋色溢满山丘', 'Eample', '/upload/music/sample1.mp3', 240, 1, 1),
    ('星河漫游', 'Sound', '/upload/music/sample2.mp3', 180, 2, 1);

-- =========================
-- 轮播图表
-- =========================

DROP TABLE IF EXISTS carousel;

CREATE TABLE carousel(

                        id BIGINT PRIMARY KEY AUTO_INCREMENT,

                        title VARCHAR(255),

                        image_url VARCHAR(500) NOT NULL,

                        sort INT DEFAULT 0,

                        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- 默认轮播图
INSERT INTO carousel (title, image_url, sort) VALUES 
('生活记录：远处海边景色', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80', 1),
('行迹足迹：自然山径', 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=500&q=80', 2),
('静心片刻：森林呼吸', 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=500&q=80', 3);

-- =========================
-- 默认感悟
-- =========================

INSERT INTO insight(
    content,
    author,
    source,
    sort,
    status
)
VALUES
    ('代码是写给人看的，顺便能在机器上运行。', '李纳斯·托沃兹', 'Linux创始人', 1, 1),
    ('简单是可靠的先决条件。', '艾兹格·迪杰斯特拉', '计算机科学家', 2, 1);
