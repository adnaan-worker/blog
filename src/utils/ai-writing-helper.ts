import { API, AIWritingParams, AIGenerateParams, AITaskStatus } from './api';

/**
 * AI写作助手工具类
 * 提供各种AI写作辅助功能的封装
 */
export class AIWritingHelper {
  private static instance: AIWritingHelper;
  private taskPollingMap = new Map<string, NodeJS.Timeout>();

  static getInstance(): AIWritingHelper {
    if (!AIWritingHelper.instance) {
      AIWritingHelper.instance = new AIWritingHelper();
    }
    return AIWritingHelper.instance;
  }

  /**
   * 生成文章内容
   * @param title 文章标题
   * @param keywords 关键词
   * @param options 生成选项
   */
  async generateArticle(
    title: string,
    keywords: string[] = [],
    options: {
      wordCount?: number;
      style?: string;
      tone?: string;
    } = {}
  ): Promise<string> {
    const params: AIGenerateParams = {
      type: 'article',
      params: {
        title,
        keywords,
        wordCount: options.wordCount || 1000,
        style: options.style || '专业且易懂',
        tone: options.tone || '友好',
      },
    };

    const response = await API.ai.generate(params);
    return response.data.content;
  }

  /**
   * 生成文章标题
   * @param content 文章内容
   * @param keywords 关键词
   */
  async generateTitle(content: string, keywords: string[] = []): Promise<string> {
    const params: AIGenerateParams = {
      type: 'title',
      params: {
        prompt: content.substring(0, 500), // 取前500字符作为提示
        keywords,
      },
    };

    const response = await API.ai.generate(params);
    return response.data.content;
  }

  /**
   * 生成文章摘要
   * @param content 文章内容
   */
  async generateSummary(content: string): Promise<string> {
    const params: AIGenerateParams = {
      type: 'summary',
      params: {
        prompt: content,
      },
    };

    const response = await API.ai.generate(params);
    return response.data.content;
  }

  /**
   * 生成文章大纲
   * @param title 文章标题
   * @param keywords 关键词
   */
  async generateOutline(title: string, keywords: string[] = []): Promise<string> {
    const params: AIGenerateParams = {
      type: 'outline',
      params: {
        title,
        keywords,
      },
    };

    const response = await API.ai.generate(params);
    return response.data.content;
  }

  /**
   * 润色文本
   * @param content 原始内容
   * @param style 润色风格
   */
  async polishText(
    content: string,
    style: string = '更加流畅和专业'
  ): Promise<{ taskId: string; onComplete: (callback: (result: string) => void) => void }> {
    const params: AIWritingParams = {
      action: 'polish',
      content,
      params: {
        style,
      },
    };

    const response = await API.ai.writingAssistant(params);
    const taskId = response.data.taskId;

    return {
      taskId,
      onComplete: (callback: (result: string) => void) => {
        this.pollTaskResult(taskId, callback);
      },
    };
  }

  /**
   * 改进文本
   * @param content 原始内容
   * @param improvements 改进要求
   */
  async improveText(
    content: string,
    improvements: string = '提高可读性和逻辑性'
  ): Promise<{ taskId: string; onComplete: (callback: (result: string) => void) => void }> {
    const params: AIWritingParams = {
      action: 'improve',
      content,
      params: {
        prompt: improvements,
      },
    };

    const response = await API.ai.writingAssistant(params);
    const taskId = response.data.taskId;

    return {
      taskId,
      onComplete: (callback: (result: string) => void) => {
        this.pollTaskResult(taskId, callback);
      },
    };
  }

  /**
   * 扩展内容
   * @param content 原始内容
   * @param length 目标长度
   */
  async expandContent(
    content: string,
    length: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<{ taskId: string; onComplete: (callback: (result: string) => void) => void }> {
    const params: AIWritingParams = {
      action: 'expand',
      content,
      params: {
        length,
      },
    };

    const response = await API.ai.writingAssistant(params);
    const taskId = response.data.taskId;

    return {
      taskId,
      onComplete: (callback: (result: string) => void) => {
        this.pollTaskResult(taskId, callback);
      },
    };
  }

  /**
   * 翻译内容
   * @param content 原始内容
   * @param targetLang 目标语言
   */
  async translateContent(
    content: string,
    targetLang: string = '英文'
  ): Promise<{ taskId: string; onComplete: (callback: (result: string) => void) => void }> {
    const params: AIWritingParams = {
      action: 'translate',
      content,
      params: {
        targetLang,
      },
    };

    const response = await API.ai.writingAssistant(params);
    const taskId = response.data.taskId;

    return {
      taskId,
      onComplete: (callback: (result: string) => void) => {
        this.pollTaskResult(taskId, callback);
      },
    };
  }

  /**
   * 总结内容
   * @param content 原始内容
   * @param length 摘要长度
   */
  async summarizeContent(
    content: string,
    length: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<{ taskId: string; onComplete: (callback: (result: string) => void) => void }> {
    const params: AIWritingParams = {
      action: 'summarize',
      content,
      params: {
        length,
      },
    };

    const response = await API.ai.writingAssistant(params);
    const taskId = response.data.taskId;

    return {
      taskId,
      onComplete: (callback: (result: string) => void) => {
        this.pollTaskResult(taskId, callback);
      },
    };
  }

  /**
   * 流式聊天写作助手
   * @param message 用户消息
   * @param onChunk 流式数据回调
   * @param sessionId 会话ID
   */
  async streamWritingChat(
    message: string,
    onChunk: (chunk: string) => void,
    sessionId?: string
  ): Promise<string> {
    return await API.ai.streamChat(message, sessionId, onChunk);
  }

  /**
   * 批量生成内容
   * @param tasks 任务列表
   */
  async batchGenerate(
    tasks: Array<{
      type: 'title' | 'summary' | 'outline';
      content?: string;
      title?: string;
      keywords?: string[];
    }>
  ): Promise<{ taskId: string; onComplete: (callback: (results: any[]) => void) => void }> {
    const aiTasks: AIGenerateParams[] = tasks.map(task => ({
      type: task.type,
      params: {
        title: task.title,
        keywords: task.keywords || [],
        prompt: task.content,
      },
    }));

    const response = await API.ai.batchGenerate(aiTasks);
    const taskId = response.data.taskId;

    return {
      taskId,
      onComplete: (callback: (results: any[]) => void) => {
        this.pollTaskResult(taskId, callback);
      },
    };
  }

  /**
   * 轮询任务结果
   * @param taskId 任务ID
   * @param callback 完成回调
   * @param maxAttempts 最大尝试次数
   */
  private async pollTaskResult(
    taskId: string,
    callback: (result: any) => void,
    maxAttempts: number = 60
  ): Promise<void> {
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const response = await API.ai.getTaskStatus(taskId);
        const task = response.data;

        if (task.status === 'completed') {
          this.clearTaskPolling(taskId);
          
          // 修复：正确处理返回的结果格式
          let finalResult = task.result;
          
          // 如果返回的是对象格式（包含action, originalContent, result, params）
          if (finalResult && typeof finalResult === 'object' && finalResult.result) {
            finalResult = finalResult.result;
          }
          
          // 如果返回的是批量生成结果
          if (finalResult && typeof finalResult === 'object' && finalResult.results) {
            finalResult = finalResult.results;
          }
          
          callback(finalResult);
        } else if (task.status === 'failed') {
          this.clearTaskPolling(taskId);
          throw new Error(task.error || '任务执行失败');
        } else if (attempts >= maxAttempts) {
          this.clearTaskPolling(taskId);
          throw new Error('任务执行超时');
        } else {
          // 继续轮询
          const timeout = setTimeout(poll, 2000);
          this.taskPollingMap.set(taskId, timeout);
        }
      } catch (error) {
        this.clearTaskPolling(taskId);
        throw error;
      }
    };

    poll();
  }

  /**
   * 清除任务轮询
   * @param taskId 任务ID
   */
  private clearTaskPolling(taskId: string): void {
    const timeout = this.taskPollingMap.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      this.taskPollingMap.delete(taskId);
    }
  }

  /**
   * 取消任务轮询
   * @param taskId 任务ID
   */
  cancelTaskPolling(taskId: string): void {
    this.clearTaskPolling(taskId);
  }

  /**
   * 获取用户AI配额
   */
  async getQuota() {
    const response = await API.ai.getQuota();
    return response.data;
  }

  /**
   * 检查AI服务状态
   */
  async checkServiceStatus() {
    const response = await API.ai.getStatus();
    return response.data;
  }
}

/**
 * AI写作助手实例
 */
export const aiWritingHelper = AIWritingHelper.getInstance();

/**
 * AI写作预设模板
 */
export const AI_WRITING_TEMPLATES = {
  // 文章生成模板
  article: {
    technical: {
      style: '技术专业',
      tone: '严谨客观',
      keywords: ['技术', '实践', '解决方案'],
    },
    casual: {
      style: '轻松易懂',
      tone: '友好亲切',
      keywords: ['分享', '经验', '心得'],
    },
    formal: {
      style: '正式严肃',
      tone: '专业权威',
      keywords: ['分析', '研究', '报告'],
    },
  },
  
  // 润色风格模板
  polish: {
    professional: '使文本更加专业和正式',
    casual: '使文本更加轻松和易读',
    academic: '使文本符合学术写作规范',
    creative: '增加文本的创意和吸引力',
  },
  
  // 改进方向模板
  improve: {
    clarity: '提高文本的清晰度和可读性',
    logic: '改善文本的逻辑结构和条理性',
    engagement: '增强文本的吸引力和参与度',
    conciseness: '使文本更加简洁明了',
  },
};

export default aiWritingHelper; 