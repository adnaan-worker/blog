import { API } from '../api';
import type { AIWritingParams, AIGenerateParams, AITaskStatus } from '@/types';
import { RichTextParser } from './parser';

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
    } = {},
  ): Promise<string> {
    const response = await API.ai.generateArticle({
      title,
      keywords,
      wordCount: options.wordCount || 1500,
      style: options.style || '专业且易懂',
    });
    return this.processContentForRichText(response.data.content);
  }

  /**
   * 生成文章标题
   * @param content 文章内容
   * @param keywords 关键词
   */
  async generateTitle(content: string, keywords: string[] = []): Promise<string> {
    const { taskId } = (
      await API.ai.writingAssistant({
        action: 'generate_title',
        content: content.substring(0, 500),
        params: { keywords },
      })
    ).data;

    return new Promise((resolve, reject) => {
      this.pollTaskResult(taskId, resolve, reject);
    });
  }

  /**
   * 生成文章摘要
   * @param content 文章内容
   */
  async generateSummary(content: string): Promise<string> {
    const { taskId } = (
      await API.ai.writingAssistant({
        action: 'generate_summary',
        content,
      })
    ).data;

    return new Promise((resolve, reject) => {
      this.pollTaskResult(taskId, resolve, reject);
    });
  }

  /**
   * 生成文章大纲
   * @param title 文章标题
   * @param keywords 关键词
   */
  async generateOutline(title: string, keywords: string[] = []): Promise<string> {
    const { taskId } = (
      await API.ai.writingAssistant({
        action: 'generate_outline',
        params: { topic: title, keywords },
      })
    ).data;

    return new Promise((resolve, reject) => {
      this.pollTaskResult(taskId, resolve, reject);
    });
  }

  /**
   * 润色文本
   * @param content 原始内容
   * @param style 润色风格
   */
  async polishText(
    content: string,
    style: string = '更加流畅和专业',
  ): Promise<{ taskId: string; onComplete: (callback: (result: string) => void) => void }> {
    const response = await API.ai.writingAssistant({
      action: 'polish',
      content,
      params: { style },
    });
    const taskId = response.data.taskId;

    return {
      taskId,
      onComplete: (callback: (result: string) => void) => {
        this.pollTaskResult(taskId, callback, () => {});
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
    improvements: string = '提高可读性和逻辑性',
  ): Promise<{ taskId: string; onComplete: (callback: (result: string) => void) => void }> {
    const response = await API.ai.writingAssistant({
      action: 'improve',
      content,
      params: { improvements },
    });
    const taskId = response.data.taskId;

    return {
      taskId,
      onComplete: (callback: (result: string) => void) => {
        this.pollTaskResult(taskId, callback, () => {});
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
    length: 'short' | 'medium' | 'long' = 'medium',
  ): Promise<{ taskId: string; onComplete: (callback: (result: string) => void) => void }> {
    const response = await API.ai.writingAssistant({
      action: 'expand',
      content,
      params: { length },
    });
    const taskId = response.data.taskId;

    return {
      taskId,
      onComplete: (callback: (result: string) => void) => {
        this.pollTaskResult(taskId, callback, () => {});
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
    targetLang: string = '英文',
  ): Promise<{ taskId: string; onComplete: (callback: (result: string) => void) => void }> {
    const response = await API.ai.writingAssistant({
      action: 'translate',
      content,
      params: { targetLang },
    });
    const taskId = response.data.taskId;

    return {
      taskId,
      onComplete: (callback: (result: string) => void) => {
        this.pollTaskResult(taskId, callback, () => {});
      },
    };
  }

  /**
   * 续写内容
   * @param content 现有内容
   * @param length 续写长度
   */
  async continueContent(
    content: string,
    length: 'short' | 'medium' | 'long' = 'medium',
  ): Promise<{ taskId: string; onComplete: (callback: (result: string) => void) => void }> {
    const response = await API.ai.writingAssistant({
      action: 'continue',
      content,
      params: { length },
    });
    const taskId = response.data.taskId;

    return {
      taskId,
      onComplete: (callback: (result: string) => void) => {
        this.pollTaskResult(taskId, callback, () => {});
      },
    };
  }

  /**
   * 改写风格
   * @param content 原始内容
   * @param style 目标风格
   */
  async rewriteStyle(
    content: string,
    style: 'professional' | 'casual' | 'academic' | 'creative' | 'storytelling' = 'professional',
  ): Promise<{ taskId: string; onComplete: (callback: (result: string) => void) => void }> {
    const response = await API.ai.writingAssistant({
      action: 'rewrite',
      content,
      params: { style },
    });
    const taskId = response.data.taskId;

    return {
      taskId,
      onComplete: (callback: (result: string) => void) => {
        this.pollTaskResult(taskId, callback, () => {});
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
    length: 'short' | 'medium' | 'long' = 'medium',
  ): Promise<{ taskId: string; onComplete: (callback: (result: string) => void) => void }> {
    const response = await API.ai.writingAssistant({
      action: 'summarize',
      content,
      params: { length },
    });
    const taskId = response.data.taskId;

    return {
      taskId,
      onComplete: (callback: (result: string) => void) => {
        this.pollTaskResult(taskId, callback, () => {});
      },
    };
  }

  /**
   * 对话聊天（带记忆）
   */
  async conversationChat(message: string): Promise<string> {
    const response = await API.ai.conversation(message);
    return response.data.message;
  }

  /**
   * 简单聊天
   */
  async chat(message: string): Promise<string> {
    const response = await API.ai.chat(message);
    return response.data.message;
  }

  /**
   * 轮询任务结果
   * @param taskId 任务ID
   * @param callback 完成回调
   * @param maxAttempts 最大尝试次数
   */
  private async pollTaskResult(
    taskId: string,
    resolve: (result: any) => void,
    reject: (reason?: any) => void,
    maxAttempts: number = 60,
  ): Promise<void> {
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const response = await API.ai.getTaskStatus(taskId);
        const task = response.data;

        if (task.status === 'completed') {
          this.clearTaskPolling(taskId);
          // 处理完成的任务结果
          const result = task.result || task;
          const processedResult = this.processContentForRichText(result);
          resolve(processedResult);
        } else if (task.status === 'failed') {
          this.clearTaskPolling(taskId);
          reject(new Error('任务执行失败'));
        } else if (attempts >= maxAttempts) {
          this.clearTaskPolling(taskId);
          reject(new Error('任务执行超时'));
        } else {
          // 继续轮询
          const timeout = setTimeout(poll, 2000);
          this.taskPollingMap.set(taskId, timeout);
        }
      } catch (error) {
        this.clearTaskPolling(taskId);
        reject(error);
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

  /**
   * 处理内容格式，确保符合富文本组件要求
   * @param content 原始内容
   * @returns 处理后的内容
   */
  private processContentForRichText(content: string): string {
    if (!content || typeof content !== 'string') {
      return '<div class="rich-text-content"><p>内容为空</p></div>';
    }

    let processedContent = content.trim();

    // 如果内容已经是HTML格式且包含rich-text-content类，直接返回
    if (processedContent.includes('class="rich-text-content"')) {
      return processedContent;
    }

    // 如果内容包含Markdown语法，转换为HTML
    if (this.isMarkdownContent(processedContent)) {
      processedContent = RichTextParser.markdownToHtml(processedContent);
    }

    // 使用统一的富文本处理工具添加样式和包装
    processedContent = RichTextParser.addContentStyles(processedContent);

    return processedContent;
  }

  /**
   * 判断内容是否为Markdown格式
   * @param content 内容
   * @returns 是否为Markdown
   */
  private isMarkdownContent(content: string): boolean {
    const markdownPatterns = [
      /^#{1,6}\s+/m, // 标题
      /\*\*[^*]+\*\*/, // 粗体
      /\*[^*\n]+\*/, // 斜体
      /^[-*+]\s+/m, // 无序列表
      /^\d+\.\s+/m, // 有序列表
      /^>\s+/m, // 引用
      /```[\s\S]*?```/, // 代码块
      /`[^`\n]+`/, // 内联代码
      /\[.+?\]\(.+?\)/, // 链接
      /!\[.*?\]\(.+?\)/, // 图片
    ];

    return markdownPatterns.some((pattern) => pattern.test(content));
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
