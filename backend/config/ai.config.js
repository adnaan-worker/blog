const { AIProviderFactory } = require('./ai-providers');
const environment = require('./environment');

const config = environment.get();

/**
 * AI服务配置类
 */
class AIConfig {
  constructor() {
    this.provider = null;
    this.isConfigured = false;
  }

  /**
   * 初始化AI配置
   */
  init() {
    try {
      const aiConfig = config.ai;

      // 检查是否有可用的API密钥
      const hasValidConfig = this.checkProviderConfig(aiConfig);

      if (!hasValidConfig) {
        console.warn('⚠️  未找到有效的AI服务配置，AI功能将不可用');
        console.log('💡 支持的AI服务提供商:');
        console.log('   - OpenAI: 设置 OPENAI_API_KEY');
        console.log('   - 智谱AI: 设置 ZHIPU_API_KEY');
        console.log('   - 百度文心一言: 设置 BAIDU_API_KEY 和 BAIDU_SECRET_KEY');
        console.log('   - 阿里云通义千问: 设置 ALIYUN_API_KEY');
        console.log('   - 自定义AI: 设置 CUSTOM_AI_URL');
        return false;
      }

      // 创建AI服务提供商
      this.provider = AIProviderFactory.createProvider(aiConfig);
      this.isConfigured = true;

      console.log(`✅ AI服务配置成功 - 使用 ${aiConfig.provider} 提供商`);
      return true;
    } catch (error) {
      console.error('❌ AI服务配置失败:', error.message);
      return false;
    }
  }

  /**
   * 检查提供商配置是否有效
   */
  checkProviderConfig(aiConfig) {
    switch (aiConfig.provider) {
      case 'openai':
        return !!aiConfig.openaiApiKey;
      case 'zhipu':
        return !!aiConfig.zhipuApiKey;
      case 'baidu':
        return !!(aiConfig.baiduApiKey && aiConfig.baiduSecretKey);
      case 'aliyun':
        return !!aiConfig.aliyunApiKey;
      case 'custom':
        return !!aiConfig.customAiUrl;
      default:
        return false;
    }
  }

  /**
   * 获取AI服务提供商
   */
  getProvider() {
    if (!this.isConfigured) {
      throw new Error('AI服务未配置，请检查环境变量');
    }
    return this.provider;
  }

  /**
   * 聊天功能
   */
  async chat(messages) {
    const provider = this.getProvider();
    return await provider.chat(messages);
  }

  /**
   * 生成文本
   */
  async generateText(prompt) {
    const provider = this.getProvider();
    return await provider.generateText(prompt);
  }

  /**
   * 检查AI服务是否可用
   */
  isAvailable() {
    return this.isConfigured;
  }

  /**
   * 获取当前提供商信息
   */
  getProviderInfo() {
    if (!this.isConfigured) {
      return { provider: 'none', available: false };
    }
    return {
      provider: config.ai.provider,
      available: true,
      config: {
        temperature: config.ai.temperature,
        maxTokens: config.ai.maxTokens,
        modelName: config.ai.modelName,
      },
    };
  }
}

// 创建全局AI配置实例
const aiConfig = new AIConfig();

module.exports = {
  aiConfig,
  AIConfig,
};
