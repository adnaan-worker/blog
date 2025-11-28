const swaggerJsdoc = require('swagger-jsdoc');
const environment = require('./environment');

const config = environment.get();

// Swagger 配置选项
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '光阴副本博客系统 API',
      version: '2.6.0',
      description: `
# 光阴副本博客系统 API 文档

基于 **Node.js + Express + MySQL + Redis + LangChain** 的现代化全栈博客系统。

## 核心功能
- 🔐 **用户认证**：JWT Token + Redis 会话管理
- 📝 **内容管理**：文章、笔记、项目、评论
- 🤖 **AI 功能**：LangChain 集成，支持智能对话和内容生成
- 📊 **数据统计**：访问统计、活动记录、贡献统计
- 🔍 **搜索功能**：全文搜索、标签分类
- 🎨 **主题系统**：支持亮色/暗色主题切换

## 技术栈
- **后端框架**：Express.js
- **数据库**：MySQL + Sequelize ORM
- **缓存**：Redis
- **AI集成**：LangChain + OpenAI/智谱AI
- **实时通信**：Socket.IO
- **任务队列**：BullMQ
      `,
      contact: {
        name: 'adnaan',
        email: '1662877157@qq.com',
        url: 'http://www.adnaan.cn',
      },
      license: {
        name: 'MPL-2.0',
        url: 'https://opensource.org/licenses/MPL-2.0',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: '本地开发环境',
      },
      {
        url: 'http://api.adnaan.cn',
        description: '生产环境（HTTPS）',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT 认证令牌',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: '用户ID' },
            username: { type: 'string', description: '用户名' },
            email: { type: 'string', format: 'email', description: '邮箱' },
            fullName: { type: 'string', description: '全名' },
            avatar: { type: 'string', description: '头像URL' },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: '用户角色',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: '用户状态',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间',
            },
          },
        },
        Post: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: '文章ID' },
            title: { type: 'string', description: '文章标题' },
            slug: { type: 'string', description: '文章别名' },
            content: { type: 'string', description: '文章内容' },
            excerpt: { type: 'string', description: '文章摘要' },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              description: '文章状态',
            },
            author: { $ref: '#/components/schemas/User' },
            tags: {
              type: 'array',
              items: { $ref: '#/components/schemas/Tag' },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间',
            },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: '评论ID' },
            content: { type: 'string', description: '评论内容' },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              description: '评论状态',
            },
            author: { $ref: '#/components/schemas/User' },
            postId: { type: 'integer', description: '文章ID' },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间',
            },
          },
        },
        Tag: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: '标签ID' },
            name: { type: 'string', description: '标签名称' },
            description: { type: 'string', description: '标签描述' },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间',
            },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: '分类ID' },
            name: { type: 'string', description: '分类名称' },
            slug: { type: 'string', description: '分类别名' },
            description: { type: 'string', description: '分类描述' },
            postCount: { type: 'integer', description: '文章数量' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Note: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: '笔记ID' },
            title: { type: 'string', description: '笔记标题' },
            content: { type: 'string', description: '笔记内容' },
            tags: { type: 'array', items: { type: 'string' } },
            isPublic: { type: 'boolean', description: '是否公开' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: '项目ID' },
            name: { type: 'string', description: '项目名称' },
            description: { type: 'string', description: '项目描述' },
            url: { type: 'string', description: '项目链接' },
            github: { type: 'string', description: 'GitHub仓库' },
            tags: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['active', 'archived', 'planning'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AIChat: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: '消息ID' },
            userId: { type: 'integer', description: '用户ID' },
            sessionId: { type: 'string', description: '会话ID' },
            role: {
              type: 'string',
              enum: ['human', 'ai', 'system'],
              description: '消息角色',
            },
            content: { type: 'string', description: '消息内容' },
            type: {
              type: 'string',
              enum: ['chat', 'blog_assistant', 'writing_assistant'],
              description: '聊天类型',
            },
            metadata: {
              type: 'object',
              properties: {
                tokens: { type: 'integer', description: 'Token消耗' },
                duration: { type: 'integer', description: '响应时间(ms)' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AIConversation: {
          type: 'object',
          properties: {
            sessionId: { type: 'string', description: '会话ID' },
            messages: {
              type: 'array',
              items: { $ref: '#/components/schemas/AIChat' },
            },
            total: { type: 'integer', description: '消息总数' },
          },
        },
        AIQuota: {
          type: 'object',
          properties: {
            chat: {
              type: 'object',
              properties: {
                used: { type: 'integer', description: '已使用次数' },
                limit: { type: 'integer', description: '限制次数' },
                remaining: { type: 'integer', description: '剩余次数' },
              },
            },
            generate: {
              type: 'object',
              properties: {
                used: { type: 'integer' },
                limit: { type: 'integer' },
                remaining: { type: 'integer' },
              },
            },
            resetAt: { type: 'string', format: 'date-time', description: '重置时间' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', description: '错误信息' },
            code: { type: 'integer', description: '错误代码' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', description: '字段名' },
                  message: { type: 'string', description: '字段错误信息' },
                },
              },
              description: '字段错误详情',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: '操作是否成功' },
            message: { type: 'string', description: '成功信息' },
            data: { type: 'object', description: '返回数据' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            totalPosts: { type: 'integer', description: '总文章数' },
            totalPages: { type: 'integer', description: '总页数' },
            currentPage: { type: 'integer', description: '当前页' },
            limit: { type: 'integer', description: '每页数量' },
          },
        },
      },
    },
    tags: [
      {
        name: '认证',
        description: '🔐 用户注册、登录、登出、Token刷新',
      },
      {
        name: '用户',
        description: '👤 用户信息管理、个人资料、头像上传',
      },
      {
        name: '文章',
        description: '📝 文章的增删改查、发布、草稿、归档',
      },
      {
        name: '评论',
        description: '💬 评论管理、回复、审核、删除',
      },
      {
        name: '标签',
        description: '🏷️ 标签的创建、编辑、删除、文章关联',
      },
      {
        name: '分类',
        description: '📂 分类管理、层级结构、文章分类',
      },
      {
        name: '笔记',
        description: '📔 个人笔记管理、公开/私密笔记',
      },
      {
        name: '项目',
        description: '🚀 项目展示、GitHub集成、项目状态',
      },
      {
        name: 'AI基础',
        description: '🤖 AI聊天（支持可选记忆）、文章生成、配额管理',
      },
      {
        name: 'AI会话管理',
        description: '💭 会话列表、历史记录、统计分析',
      },
      {
        name: '系统',
        description: '⚙️ 系统监控、健康检查、性能指标',
      },
      {
        name: '状态',
        description: '📊 访问统计、在线用户、系统状态',
      },
      {
        name: '活动',
        description: '📈 用户活动记录、时间线、成就系统',
      },
      {
        name: '贡献',
        description: '🎯 GitHub/Gitee贡献统计',
      },
      {
        name: '代理',
        description: '🔄 CORS代理服务、跨域请求',
      },
      {
        name: '站点设置',
        description: '🎨 站点配置、主题设置、SEO配置',
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js', './models/*.js'],
};

// 生成 Swagger 规范
const specs = swaggerJsdoc(options);

module.exports = specs;
