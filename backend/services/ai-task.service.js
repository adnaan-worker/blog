const { AITask } = require('../models');
const { aiService } = require('./ai.service');
const { aiQuotaService } = require('./ai-quota.service');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * AI异步任务管理服务
 */
class AITaskService {
  /**
   * 延迟加载 AI 任务处理器（避免循环依赖）
   */
  get taskWorker() {
    if (!this._taskWorker) {
      const { aiTaskWorker } = require('../workers/ai-task-worker');
      this._taskWorker = aiTaskWorker;
    }
    return this._taskWorker;
  }
  /**
   * 创建任务
   */
  async createTask(userId, type, params) {
    try {
      const taskId = uuidv4();

      const task = await AITask.create({
        userId,
        taskId,
        type,
        params,
        status: 'pending',
      });

      logger.info('创建AI任务', { userId, taskId, type });

      // 立即推送到队列（事件驱动，零延迟）
      await this.taskWorker.enqueueTask(taskId);

      return task;
    } catch (error) {
      logger.error('创建AI任务失败', { userId, type, error: error.message });
      throw error;
    }
  }

  /**
   * 获取任务状态
   */
  async getTaskStatus(taskId) {
    try {
      const task = await AITask.findOne({ where: { taskId } });

      if (!task) {
        throw new Error('任务不存在');
      }

      return {
        taskId: task.taskId,
        userId: task.userId,
        type: task.type,
        status: task.status,
        progress: task.progress,
        result: task.result,
        error: task.error,
        startedAt: task.startedAt,
        completedAt: task.completedAt,
        createdAt: task.createdAt,
      };
    } catch (error) {
      logger.error('获取任务状态失败', { taskId, error: error.message });
      throw error;
    }
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(taskId, status, data = {}) {
    try {
      const task = await AITask.findOne({ where: { taskId } });

      if (!task) {
        throw new Error('任务不存在');
      }

      const updateData = { status, ...data };

      if (status === 'processing' && !task.startedAt) {
        updateData.startedAt = new Date();
      } else if (status === 'completed' || status === 'failed') {
        updateData.completedAt = new Date();
      }

      await task.update(updateData);

      logger.info('更新任务状态', { taskId, status, progress: data.progress });
    } catch (error) {
      logger.error('更新任务状态失败', {
        taskId,
        status,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 处理内容生成任务
   */
  async processGenerateContentTask(taskId) {
    try {
      const task = await AITask.findOne({ where: { taskId } });

      if (!task) {
        throw new Error('任务不存在');
      }

      await this.updateTaskStatus(taskId, 'processing', { progress: 10 });

      // 检查配额
      const quota = await aiQuotaService.checkGenerateQuota(task.userId);
      if (!quota.available) {
        await this.updateTaskStatus(taskId, 'failed', {
          error: `每日内容生成次数已达上限(${quota.limit})`,
        });
        return;
      }

      await this.updateTaskStatus(taskId, 'processing', { progress: 30 });

      // 执行AI内容生成
      const { type, params } = task.params;
      const content = await aiService.generateContent(type, params);

      await this.updateTaskStatus(taskId, 'processing', { progress: 80 });

      // 更新配额
      await aiQuotaService.incrementGenerateUsage(task.userId);

      // 完成任务
      await this.updateTaskStatus(taskId, 'completed', {
        progress: 100,
        result: { content, type, params },
      });

      logger.info('内容生成任务完成', { taskId, type });
    } catch (error) {
      logger.error('处理内容生成任务失败', { taskId, error: error.message });
      await this.updateTaskStatus(taskId, 'failed', { error: error.message });
    }
  }

  /**
   * 处理批量生成任务
   */
  async processBatchGenerateTask(taskId) {
    try {
      const task = await AITask.findOne({ where: { taskId } });

      if (!task) {
        throw new Error('任务不存在');
      }

      await this.updateTaskStatus(taskId, 'processing', { progress: 5 });

      const { tasks } = task.params;
      const results = [];
      const errors = [];

      // 检查配额
      const quota = await aiQuotaService.checkGenerateQuota(task.userId);
      if (!quota.available) {
        await this.updateTaskStatus(taskId, 'failed', {
          error: `每日内容生成次数已达上限(${quota.limit})`,
        });
        return;
      }

      for (let i = 0; i < tasks.length; i++) {
        try {
          const { type, params } = tasks[i];
          const content = await aiService.generateContent(type, params);

          results.push({
            type,
            content,
            success: true,
          });

          // 更新配额
          await aiQuotaService.incrementGenerateUsage(task.userId);
        } catch (error) {
          errors.push({
            task: tasks[i],
            error: error.message,
          });
        }

        // 更新进度
        const progress = Math.round(((i + 1) / tasks.length) * 90) + 5;
        await this.updateTaskStatus(taskId, 'processing', { progress });
      }

      // 完成任务
      await this.updateTaskStatus(taskId, 'completed', {
        progress: 100,
        result: {
          results,
          errors,
          total: tasks.length,
          success: results.length,
          failed: errors.length,
        },
      });

      logger.info('批量生成任务完成', {
        taskId,
        total: tasks.length,
        success: results.length,
      });
    } catch (error) {
      logger.error('处理批量生成任务失败', { taskId, error: error.message });
      await this.updateTaskStatus(taskId, 'failed', { error: error.message });
    }
  }

  /**
   * 处理分析任务
   */
  async processAnalyzeTask(taskId) {
    try {
      const task = await AITask.findOne({ where: { taskId } });

      if (!task) {
        throw new Error('任务不存在');
      }

      await this.updateTaskStatus(taskId, 'processing', { progress: 20 });

      const { type, data } = task.params;
      const analysis = await aiService.analyze(type, data);

      await this.updateTaskStatus(taskId, 'processing', { progress: 80 });

      // 完成任务
      await this.updateTaskStatus(taskId, 'completed', {
        progress: 100,
        result: { type, analysis, data },
      });

      logger.info('分析任务完成', { taskId, type });
    } catch (error) {
      logger.error('处理分析任务失败', { taskId, error: error.message });
      await this.updateTaskStatus(taskId, 'failed', { error: error.message });
    }
  }

  /**
   * 处理写作助手任务
   */
  async processWritingAssistantTask(taskId) {
    try {
      const task = await AITask.findOne({ where: { taskId } });

      if (!task) {
        throw new Error('任务不存在');
      }

      await this.updateTaskStatus(taskId, 'processing', { progress: 10 });

      // 检查配额
      const quota = await aiQuotaService.checkChatQuota(task.userId);
      if (!quota.available) {
        await this.updateTaskStatus(taskId, 'failed', {
          error: `每日聊天次数已达上限(${quota.limit})`,
        });
        return;
      }

      await this.updateTaskStatus(taskId, 'processing', { progress: 30 });

      const { action, content, params } = task.params;
      let result = '';

      // 增强版HTML富文本写作助手系统提示词
      const htmlSystemPrompt = `你是一个高级AI写作助手，专门为富文本编辑器生成格式完美的HTML内容。

📋 核心要求：
1. 只输出纯净的HTML内容，不要任何解释、说明或礼貌用语
2. 确保HTML语法完全正确，标签必须正确闭合
3. 保持内容专业、准确、逻辑清晰
4. 适当使用格式化元素增强可读性

🎨 HTML标签使用规范：

**标题结构**：
- <h2> - 主要章节标题
- <h3> - 次级标题  
- <h4> - 三级标题
❌ 不要使用 h1（由文章标题占用）

**段落与文本**：
- <p> - 所有段落必须用p标签包装
- <strong> - 重要内容加粗
- <em> - 强调或术语斜体
- <br> - 段内换行（谨慎使用）

**列表**：
- <ul><li>...</li></ul> - 无序列表
- <ol><li>...</li></ol> - 有序列表  
- 支持嵌套，但不超过3层

**代码**：
- 内联代码：<code>代码片段</code>
- 代码块：
  <pre><code class="language-javascript">
  代码内容
  </code></pre>
- 支持语言：javascript, python, java, html, css, bash等

**引用与强调**：
- <blockquote><p>引用内容</p></blockquote> - 重要引用
- 引用可以包含多个段落

**链接**：
- <a href="https://..." target="_blank" rel="noopener noreferrer">链接文字</a>
- 外部链接必须加 target="_blank"

**表格（可选）**：
- <table>
    <thead><tr><th>列1</th><th>列2</th></tr></thead>
    <tbody><tr><td>数据1</td><td>数据2</td></tr></tbody>
  </table>

⚠️ 严格禁止：
- ❌ 不要使用 <div>、<span>（除了必要的包装）
- ❌ 不要使用行内样式 style=""
- ❌ 不要使用 class 属性（系统会自动添加）
- ❌ 不要添加任何解释性文字
- ❌ 不要使用HTML注释

✅ 输出示例：
<h2>章节标题</h2>
<p>这是一个段落，包含<strong>重点内容</strong>和<code>代码术语</code>。</p>
<ul>
  <li>列表项1</li>
  <li>列表项2</li>
</ul>
<blockquote>
  <p>这是一个重要的引用内容。</p>
</blockquote>
<pre><code class="language-javascript">
console.log('Hello World');
</code></pre>

🎯 记住：简洁、干净、标准的HTML才是最好的！`;

      switch (action) {
        case 'polish':
          const polishStyle = params?.style || '更加流畅和专业';
          result = await aiService.chat(
            `【润色任务】
要求：${polishStyle}

原文：
${content}

请润色上述内容，优化语言表达，使其更加流畅、准确、富有感染力。保持原有核心内容和结构，使用标准HTML格式输出。`,
            task.userId,
            null,
            htmlSystemPrompt
          );
          break;

        case 'improve':
          const improvementPrompt = params?.prompt || '提高可读性和逻辑性';
          result = await aiService.chat(
            `【内容改进任务】
改进目标：${improvementPrompt}

原文：
${content}

请从以下维度改进内容：
1. 优化逻辑结构，增强条理性
2. 补充必要的细节和说明
3. 添加适当的小标题划分章节
4. 使用列表、引用等元素提升可读性
5. 确保内容完整、准确、专业

使用标准HTML格式输出完整的改进内容。`,
            task.userId,
            null,
            htmlSystemPrompt
          );
          break;

        case 'expand':
          const expandLength = params?.length || 'medium';
          const lengthInstruction =
            {
              short: '适度扩展：增加20%-50%内容，补充必要的细节和说明',
              medium: '充分扩展：增加100%-200%内容，添加详细解释、实例和相关知识',
              long: '深度扩展：增加200%-400%内容，全面深入分析，包含丰富案例、背景知识和延伸思考',
            }[expandLength] || '充分扩展：增加100%-200%内容，添加详细解释、实例和相关知识';

          result = await aiService.chat(
            `【内容扩展任务】
扩展要求：${lengthInstruction}

原文：
${content}

请深度扩展上述内容：
1. 保留原有核心内容和观点
2. 添加详细的解释说明
3. 补充具体的实例和案例
4. 增加相关的背景知识
5. 使用小标题、列表等组织结构
6. 确保逻辑连贯、内容充实

使用标准HTML格式输出扩展后的完整内容。`,
            task.userId,
            null,
            htmlSystemPrompt
          );
          break;

        case 'summarize':
          const summaryLength = params?.length || 'medium';
          const summaryInstruction =
            {
              short: '简洁摘要：1-2个段落，80-150字，提炼核心要点',
              medium: '标准摘要：3-5个段落，200-400字，涵盖主要内容和关键信息',
              long: '详细摘要：6-10个段落，500-800字，全面总结包含背景、要点、结论',
            }[summaryLength] || '标准摘要：3-5个段落，200-400字，涵盖主要内容和关键信息';

          result = await aiService.chat(
            `【内容总结任务】
总结要求：${summaryInstruction}

原文：
${content}

请总结上述内容：
1. 提炼核心观点和关键信息
2. 保持逻辑清晰、条理分明
3. 使用精炼的语言表达
4. 可使用列表组织要点
5. 确保总结准确、完整

使用标准HTML格式输出总结内容。`,
            task.userId,
            null,
            htmlSystemPrompt
          );
          break;

        case 'translate':
          const targetLang = params?.targetLang || '英文';
          result = await aiService.chat(
            `【翻译任务】
目标语言：${targetLang}

原文：
${content}

请将上述内容翻译为${targetLang}：
1. 准确传达原文含义
2. 使用地道的${targetLang}表达
3. 保持原有HTML格式和结构
4. 专业术语要准确翻译
5. 保持段落和格式完整

直接输出翻译后的HTML内容。`,
            task.userId,
            null,
            htmlSystemPrompt
          );
          break;

        case 'continue':
          // 新增：续写功能
          const continueLength = params?.length || 'medium';
          result = await aiService.chat(
            `【续写任务】
续写长度：${continueLength === 'short' ? '1-2段' : continueLength === 'medium' ? '3-5段' : '5-10段'}

已有内容：
${content}

请基于上述内容进行续写：
1. 延续原有风格和语气
2. 保持逻辑连贯性
3. 深化主题或引入新观点
4. 内容充实、有深度
5. 使用适当的HTML格式

只输出续写的新内容（HTML格式）。`,
            task.userId,
            null,
            htmlSystemPrompt
          );
          break;

        case 'rewrite':
          // 新增：改写风格功能
          const rewriteStyle = params?.style || 'professional';
          const styleMap = {
            professional: '专业正式',
            casual: '轻松口语化',
            academic: '学术严谨',
            creative: '创意生动',
            storytelling: '故事叙述',
          };
          result = await aiService.chat(
            `【改写风格任务】
目标风格：${styleMap[rewriteStyle] || '专业正式'}

原文：
${content}

请用${styleMap[rewriteStyle] || '专业正式'}的风格重写上述内容：
1. 完全改变表达方式和语气
2. 保留核心内容和观点
3. 使用符合目标风格的词汇和句式
4. 调整段落结构以适应新风格
5. 保持内容完整性和准确性

使用标准HTML格式输出改写后的完整内容。`,
            task.userId,
            null,
            htmlSystemPrompt
          );
          break;

        default:
          throw new Error(`不支持的操作类型: ${action}`);
      }

      await this.updateTaskStatus(taskId, 'processing', { progress: 80 });

      // 更新配额
      await aiQuotaService.incrementChatUsage(task.userId);

      // 完成任务
      await this.updateTaskStatus(taskId, 'completed', {
        progress: 100,
        result: { action, originalContent: content, result, params },
      });

      logger.info('写作助手任务完成', { taskId, action });
    } catch (error) {
      logger.error('处理写作助手任务失败', { taskId, error: error.message });
      await this.updateTaskStatus(taskId, 'failed', { error: error.message });
    }
  }

  /**
   * 获取用户任务列表
   */
  async getUserTasks(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await AITask.findAndCountAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        tasks: rows.map(task => ({
          taskId: task.taskId,
          type: task.type,
          status: task.status,
          progress: task.progress,
          createdAt: task.createdAt,
          completedAt: task.completedAt,
        })),
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error('获取用户任务列表失败', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * 删除AI任务
   * @param {string} taskId - 任务ID
   * @returns {Promise<void>}
   */
  async deleteTask(taskId) {
    await AITask.destroy({
      where: { taskId },
    });
  }

  /**
   * 清理过期任务
   */
  async cleanupExpiredTasks(days = 30) {
    try {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() - days);

      const result = await AITask.destroy({
        where: {
          createdAt: {
            [require('sequelize').Op.lt]: expireDate,
          },
          status: {
            [require('sequelize').Op.in]: ['completed', 'failed'],
          },
        },
      });

      logger.info('清理过期任务', { deletedCount: result, days });
      return result;
    } catch (error) {
      logger.error('清理过期任务失败', { error: error.message });
      throw error;
    }
  }
}

const aiTaskService = new AITaskService();

module.exports = {
  aiTaskService,
  AITaskService,
};
