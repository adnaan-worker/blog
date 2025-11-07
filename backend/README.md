# 博客系统后端服务

这是一个基于 Node.js 的博客系统后端服务，提供完整的博客管理功能和 AI 辅助功能。

## 技术栈

- **框架**: Node.js + Express
- **数据库**: MySQL + Sequelize ORM
- **身份验证**: JWT
- **缓存**: Redis
- **AI 功能**: LangChain + OpenAI
- **日志**: Winston
- **文档**: Swagger

## 功能特性

- 用户管理（注册、登录、权限控制）
- 文章管理（创建、编辑、删除、发布）
- 评论系统（支持回复、审核）
- 标签系统（多对多关联）
- AI 辅助写作与内容生成
- 系统监控与日志记录

## 安装指南

1. **复制环境变量文件**

   ```bash
   cp .env.example .env
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **初始化数据库**

   ```bash
   npm run db:init
   ```

4. **启动服务**
   ```bash
   npm run dev
   ```

## API 文档

访问 [http://localhost:3000/api-docs](http://localhost:3000/api-docs) 查看完整的 API 文档。

## AI 功能

本项目集成了 AI 功能，支持内容生成、博客助手、智能分析等。

### 配置 OpenAI

在 `.env` 文件中配置以下参数：

```env
OPENAI_API_KEY=your_openai_api_key_here
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=1000
AI_MODEL_NAME=gpt-3.5-turbo
```

## 数据库设计

包含用户、文章、评论、标签等核心表，支持多对多关系。

## 贡献指南

欢迎贡献代码和改进文档。请遵循以下步骤：

1. Fork 项目
2. 创建新分支
3. 提交代码更改
4. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。详情请查看 LICENSE 文件。
