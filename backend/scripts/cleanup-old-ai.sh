#!/bin/bash

# AI 架构迁移 - 清理旧文件脚本

echo "========================================="
echo "🧹 开始清理旧的 AI 服务文件..."
echo "========================================="

# 删除旧的服务文件
echo "1️⃣ 删除旧的 AI 服务..."
rm -f services/ai.service.js
rm -f services/ai-task.service.js
echo "✅ 旧的 AI 服务已删除"

# 删除旧的 Worker
echo "2️⃣ 删除旧的 AI Worker..."
rm -f workers/ai-task-worker.js
echo "✅ 旧的 AI Worker 已删除"

# 删除旧的控制器
echo "3️⃣ 删除旧的 AI 控制器..."
rm -f controllers/ai.controller.js
echo "✅ 旧的 AI 控制器已删除"

# 删除旧的路由
echo "4️⃣ 删除旧的 AI 路由..."
rm -f routes/ai.js
echo "✅ 旧的 AI 路由已删除"

# 删除旧的配置
echo "5️⃣ 删除旧的 AI 配置..."
rm -f config/ai-providers.js
rm -f config/ai.config.js
echo "✅ 旧的 AI 配置已删除"

echo ""
echo "========================================="
echo "✅ 清理完成！"
echo "========================================="
echo ""
echo "📝 下一步："
echo "1. 检查 package.json 中的依赖"
echo "2. 运行: npm install"
echo "3. 配置 .env 文件中的 OPENAI_API_KEY"
echo "4. 运行: npm run dev"
echo ""
