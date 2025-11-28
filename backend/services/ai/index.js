/**
 * AI 服务统一导出
 * 提供清晰的模块化接口
 */

const aiService = require('./ai.service');
const writingService = require('./writing.service');
const aiModel = require('./core/ai-model.service');
const streamManager = require('./core/stream-manager');
const promptManager = require('./prompts');

module.exports = {
  // 核心服务
  aiService,
  writingService,

  // 底层模块（高级用法）
  aiModel,
  streamManager,
  promptManager,

  // 便捷方法
  initialize: () => aiService.initialize(),
  isAvailable: () => aiService.isAvailable(),
  getInfo: () => aiService.getInfo(),
};
