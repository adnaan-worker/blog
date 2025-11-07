const axios = require('axios');
const crypto = require('crypto');

/**
 * AI服务提供商基类
 */
class BaseAIProvider {
  constructor(config) {
    this.config = config;
  }

  async chat(messages) {
    throw new Error('子类必须实现chat方法');
  }

  async generateText(prompt) {
    throw new Error('子类必须实现generateText方法');
  }
}

/**
 * OpenAI服务提供商
 */
class OpenAIProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.baseURL = config.openaiBaseUrl || 'https://api.openai.com/v1';
    this.apiKey = config.openaiApiKey;
  }

  async chat(messages) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.config.modelName || 'gpt-3.5-turbo',
          messages: messages,
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI API错误: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async generateText(prompt) {
    return this.chat([{ role: 'user', content: prompt }]);
  }
}

/**
 * 智谱AI服务提供商
 */
class ZhipuAIProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.zhipuApiKey;
    this.baseURL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  }

  async chat(messages) {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          model: 'glm-4',
          messages: messages,
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`智谱AI API错误: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async generateText(prompt) {
    return this.chat([{ role: 'user', content: prompt }]);
  }
}

/**
 * 百度文心一言服务提供商
 */
class BaiduAIProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.baiduApiKey;
    this.secretKey = config.baiduSecretKey;
    this.accessToken = null;
    this.tokenExpireTime = 0;
  }

  async getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      const response = await axios.get(
        `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.secretKey}`
      );

      this.accessToken = response.data.access_token;
      this.tokenExpireTime = Date.now() + (response.data.expires_in - 60) * 1000; // 提前60秒刷新

      return this.accessToken;
    } catch (error) {
      throw new Error(`获取百度访问令牌失败: ${error.message}`);
    }
  }

  async chat(messages) {
    try {
      const accessToken = await this.getAccessToken();
      const response = await axios.post(
        `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${accessToken}`,
        {
          messages: messages,
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 1000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.result;
    } catch (error) {
      throw new Error(`百度文心一言 API错误: ${error.response?.data?.error_msg || error.message}`);
    }
  }

  async generateText(prompt) {
    return this.chat([{ role: 'user', content: prompt }]);
  }
}

/**
 * 阿里云通义千问服务提供商
 */
class AliyunAIProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.aliyunApiKey;
    this.baseURL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
  }

  async chat(messages) {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          model: 'qwen-turbo',
          input: {
            messages: messages,
          },
          parameters: {
            temperature: this.config.temperature || 0.7,
            max_tokens: this.config.maxTokens || 1000,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.output.text;
    } catch (error) {
      throw new Error(`阿里云通义千问 API错误: ${error.response?.data?.message || error.message}`);
    }
  }

  async generateText(prompt) {
    return this.chat([{ role: 'user', content: prompt }]);
  }
}

/**
 * 自定义AI服务提供商
 */
class CustomAIProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.baseURL = config.customAiUrl;
    this.apiKey = config.customAiKey;
  }

  async chat(messages) {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          messages: messages,
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 1000,
        },
        {
          headers: {
            Authorization: this.apiKey ? `Bearer ${this.apiKey}` : undefined,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.content || response.data.text || response.data.message;
    } catch (error) {
      throw new Error(`自定义AI API错误: ${error.response?.data?.error || error.message}`);
    }
  }

  async generateText(prompt) {
    return this.chat([{ role: 'user', content: prompt }]);
  }
}

/**
 * AI服务提供商工厂
 */
class AIProviderFactory {
  static createProvider(config) {
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'zhipu':
        return new ZhipuAIProvider(config);
      case 'baidu':
        return new BaiduAIProvider(config);
      case 'aliyun':
        return new AliyunAIProvider(config);
      case 'custom':
        return new CustomAIProvider(config);
      default:
        throw new Error(`不支持的AI提供商: ${config.provider}`);
    }
  }
}

module.exports = {
  BaseAIProvider,
  OpenAIProvider,
  ZhipuAIProvider,
  BaiduAIProvider,
  AliyunAIProvider,
  CustomAIProvider,
  AIProviderFactory,
};
