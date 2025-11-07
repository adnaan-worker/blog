const swaggerJsdoc = require('swagger-jsdoc');
const environment = require('./environment');

const config = environment.get();

// Swagger 配置选项
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '博客系统 API 文档',
      version: '1.0.0',
      description: '基于 Node.js + Express + MySQL + Redis 的博客系统后端 API',
      contact: {
        name: 'API 支持',
        email: 'support@blog-api.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: '开发环境服务器',
      },
      {
        url: 'http://api.adnaan.cn',
        description: '生产环境服务器 (HTTP)',
      },
      {
        url: 'http://api.adnaan.cn',
        description: '生产环境服务器 (HTTPS)',
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
        description: '用户认证相关接口',
      },
      {
        name: '用户',
        description: '用户管理相关接口',
      },
      {
        name: '文章',
        description: '文章管理相关接口',
      },
      {
        name: '评论',
        description: '评论管理相关接口',
      },
      {
        name: '标签',
        description: '标签管理相关接口',
      },
      {
        name: '分类',
        description: '分类管理相关接口',
      },
      {
        name: '系统',
        description: '系统监控和健康检查接口',
      },
      {
        name: '示例',
        description: '统一响应格式示例接口',
      },
      {
        name: 'AI',
        description: 'AI聊天和智能代理接口',
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js', './models/*.js'],
};

// 生成 Swagger 规范
const specs = swaggerJsdoc(options);

module.exports = specs;
