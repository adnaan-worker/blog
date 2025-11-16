/**
 * AI 提供商配置
 * 支持多个 AI 服务提供商的统一配置
 *
 * 支持的提供商列表：
 * - openai: OpenAI (GPT-3.5, GPT-4)
 * - zhipu: 智谱AI (GLM-4)
 * - anthropic: Anthropic (Claude)
 * - google: Google (Gemini)
 * - baidu: 百度文心一言
 * - aliyun: 阿里云通义千问
 * - moonshot: 月之暗面 (Kimi)
 * - deepseek: DeepSeek
 */

/**
 * AI 提供商配置映射
 * 每个提供商包含：
 * - package: LangChain 包名
 * - className: 类名
 * - configKey: API Key 的配置键名
 * - defaultModel: 默认模型
 * - models: 支持的模型列表
 */
const AI_PROVIDERS = {
  // OpenAI
  openai: {
    package: '@langchain/openai',
    className: 'ChatOpenAI',
    configKey: 'openAIApiKey',
    defaultModel: 'gpt-3.5-turbo',
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'],
    description: 'OpenAI GPT 系列模型',
  },

  // 智谱AI
  zhipu: {
    package: '@langchain/community/chat_models/zhipuai',
    className: 'ChatZhipuAI',
    configKey: 'zhipuAIApiKey',
    defaultModel: 'glm-4',
    models: ['glm-4', 'glm-4-plus', 'glm-3-turbo'],
    description: '智谱AI GLM 系列模型',
  },

  // Anthropic Claude
  anthropic: {
    package: '@langchain/anthropic',
    className: 'ChatAnthropic',
    configKey: 'anthropicApiKey',
    defaultModel: 'claude-3-sonnet-20240229',
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    description: 'Anthropic Claude 系列模型',
  },

  // Google Gemini
  google: {
    package: '@langchain/google-genai',
    className: 'ChatGoogleGenerativeAI',
    configKey: 'googleApiKey',
    defaultModel: 'gemini-pro',
    models: ['gemini-pro', 'gemini-pro-vision'],
    description: 'Google Gemini 系列模型',
  },

  // 百度文心一言
  baidu: {
    package: '@langchain/community/chat_models/baiduwenxin',
    className: 'ChatBaiduWenxin',
    configKey: 'baiduApiKey',
    defaultModel: 'ERNIE-Bot-turbo',
    models: ['ERNIE-Bot', 'ERNIE-Bot-turbo', 'ERNIE-Bot-4'],
    description: '百度文心一言系列模型',
    extraConfig: {
      secretKey: 'baiduSecretKey', // 百度需要额外的 Secret Key
    },
  },

  // 阿里云通义千问
  aliyun: {
    package: '@langchain/community/chat_models/alibaba_tongyi',
    className: 'ChatAlibabaTongyi',
    configKey: 'aliyunApiKey',
    defaultModel: 'qwen-turbo',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
    description: '阿里云通义千问系列模型',
  },

  // 月之暗面 Kimi
  moonshot: {
    package: '@langchain/community/chat_models/moonshot',
    className: 'ChatMoonshot',
    configKey: 'moonshotApiKey',
    defaultModel: 'moonshot-v1-8k',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    description: '月之暗面 Kimi 系列模型',
  },

  // DeepSeek
  deepseek: {
    package: '@langchain/community/chat_models/deepseek',
    className: 'ChatDeepSeek',
    configKey: 'deepseekApiKey',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-coder'],
    description: 'DeepSeek 系列模型',
  },
};

/**
 * 获取提供商配置
 * @param {string} provider - 提供商名称
 * @returns {Object|null}
 */
function getProviderConfig(provider) {
  return AI_PROVIDERS[provider] || null;
}

/**
 * 获取所有支持的提供商列表
 * @returns {Array}
 */
function getSupportedProviders() {
  return Object.keys(AI_PROVIDERS);
}

/**
 * 检查提供商是否支持
 * @param {string} provider - 提供商名称
 * @returns {boolean}
 */
function isProviderSupported(provider) {
  return provider in AI_PROVIDERS;
}

/**
 * 获取提供商的模型列表
 * @param {string} provider - 提供商名称
 * @returns {Array}
 */
function getProviderModels(provider) {
  const config = getProviderConfig(provider);
  return config ? config.models : [];
}

module.exports = {
  AI_PROVIDERS,
  getProviderConfig,
  getSupportedProviders,
  isProviderSupported,
  getProviderModels,
};
