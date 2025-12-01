const { DynamicStructuredTool } = require('@langchain/core/tools');
const { z } = require('zod');
const postService = require('@/services/post.service');
const { VM } = require('vm2');

/**
 * 博客搜索工具 (真实数据)
 */
const blogSearchTool = new DynamicStructuredTool({
  name: 'search_blog',
  description: `搜索"光阴副本"博客中的技术文章。
  
  **仅在以下情况使用此工具**：
  - 用户明确询问"博客里有没有...文章"
  - 用户询问"博主写过...相关的内容吗"
  - 用户想查找特定技术主题的教程或分享（如 React、Node.js、AI 等）
  
  **不要在以下情况使用此工具**：
  - 用户询问通用知识（如音乐、电影、生活常识等）
  - 用户只是闲聊或问候
  - 用户询问的内容明显与编程、技术无关
  
  如果不确定是否应该搜索博客，优先使用你自己的知识库回答。`,
  schema: z.object({
    query: z.string().describe('搜索关键词'),
  }),
  func: async ({ query }) => {
    console.log(`🔍 [Tool] Searching blog for: ${query}`);
    try {
      const result = await postService.findAll({
        page: 1,
        limit: 5,
        search: query,
        status: 1,
        isAdmin: false,
      });

      const posts = result.posts;

      if (!posts || posts.length === 0) {
        return '未找到相关文章。你可以尝试换个关键词，或者告诉我你想了解什么技术。';
      }

      const simplifiedPosts = posts.map(p => ({
        id: p.id,
        title: p.title,
        summary: p.summary || p.content.substring(0, 100) + '...',
        publishedAt: p.publishedAt,
      }));

      return JSON.stringify(simplifiedPosts);
    } catch (error) {
      console.error('Blog search tool error:', error);
      return `搜索出错: ${error.message}`;
    }
  },
});

/**
 * 获取当前时间工具
 */
const currentTimeTool = new DynamicStructuredTool({
  name: 'get_current_time',
  description: '获取当前系统时间。当用户询问现在几点、今天几号时使用。',
  schema: z.object({}),
  func: async () => {
    return new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  },
});

/**
 * 随机编程名言工具
 */
const randomQuoteTool = new DynamicStructuredTool({
  name: 'get_random_quote',
  description: '获取一条随机的编程/技术相关励志名言。当用户需要鼓励、灵感或想听点有趣的话时使用。',
  schema: z.object({}),
  func: async () => {
    const quotes = [
      '代码如诗，Bug 如人生 —— 总有意外惊喜。',
      '优秀的程序员不是写代码最多的，而是删代码最狠的。',
      '先让代码跑起来，再让它跑得优雅。—— Kent Beck',
      '任何傻瓜都能写出计算机能理解的代码，只有优秀的程序员才能写出人类能理解的代码。—— Martin Fowler',
      '过早优化是万恶之源。—— Donald Knuth',
      '调试代码的难度是写代码的两倍。所以如果你尽自己所能写出最聪明的代码，那你就没有足够的智慧去调试它。—— Brian Kernighan',
      '好的代码本身就是最好的文档。—— Steve McConnell',
      'Talk is cheap, show me the code. —— Linus Torvalds',
      '编程不是关于你知道什么，而是关于你能弄清楚什么。',
      '每一个伟大的开发者都曾经是一个糟糕的开发者，关键是不要放弃。',
      'Bug 不是敌人，它们是你代码的老师。',
      '写代码就像写作，第一稿总是垃圾，重构才是艺术。',
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    return `💡 ${randomQuote}`;
  },
});

/**
 * 简单计算器工具
 */
const calculatorTool = new DynamicStructuredTool({
  name: 'calculate',
  description:
    '执行数学计算。支持基本的算术运算（加减乘除、幂运算、三角函数等）。当用户需要计算数学表达式时使用。',
  schema: z.object({
    expression: z.string().describe('数学表达式，如 "2 + 2" 或 "Math.sqrt(16)"'),
  }),
  func: async ({ expression }) => {
    console.log(`🧮 [Tool] Calculating: ${expression}`);
    try {
      // 使用 vm2 沙箱安全执行
      const vm = new VM({
        timeout: 1000,
        sandbox: { Math },
      });
      const result = vm.run(`(${expression})`);
      return `计算结果: ${result}`;
    } catch (error) {
      return `计算出错: ${error.message}。请确保表达式语法正确。`;
    }
  },
});

/**
 * 代码执行工具（沙箱）
 */
const codeRunnerTool = new DynamicStructuredTool({
  name: 'run_javascript',
  description: `在安全的沙箱环境中执行简单的 JavaScript 代码片段。
  
  **适用场景**：
  - 用户想测试一段简单的 JS 代码
  - 演示某个算法或函数的执行结果
  - 快速验证代码逻辑
  
  **限制**：
  - 仅支持纯 JavaScript，不支持 Node.js 模块
  - 执行时间限制 1 秒
  - 无法访问文件系统或网络`,
  schema: z.object({
    code: z.string().describe('要执行的 JavaScript 代码'),
  }),
  func: async ({ code }) => {
    console.log(`⚡ [Tool] Running code: ${code.substring(0, 50)}...`);
    try {
      const vm = new VM({
        timeout: 1000,
        sandbox: { console: { log: (...args) => args.join(' ') } },
      });
      const result = vm.run(code);
      return `执行结果:\n${result !== undefined ? result : '(无返回值)'}`;
    } catch (error) {
      return `执行出错: ${error.message}`;
    }
  },
});

/**
 * 随机技术建议工具
 */
const techTipTool = new DynamicStructuredTool({
  name: 'get_tech_tip',
  description: '获取一条随机的编程技巧或最佳实践建议。当用户想学习新知识或需要技术建议时使用。',
  schema: z.object({}),
  func: async () => {
    const tips = [
      '💡 使用 `console.table()` 可以更清晰地查看数组或对象数据。',
      '🔧 善用 `Array.prototype.reduce()` 可以优雅地处理复杂的数据转换。',
      '⚡ 使用 `Promise.all()` 并行执行多个异步任务，而不是串行 `await`。',
      '🎯 编写单元测试时，遵循 AAA 原则：Arrange（准备）、Act（执行）、Assert（断言）。',
      '🧹 定期重构代码，消除重复逻辑（DRY 原则）。',
      '📦 使用解构赋值可以让代码更简洁：`const { name, age } = user;`',
      '🚀 善用 `async/await` 替代 Promise 链，让异步代码更易读。',
      '🔍 使用 `Object.freeze()` 可以创建不可变对象，避免意外修改。',
      '⏱️ 使用 `performance.now()` 而不是 `Date.now()` 来精确测量代码执行时间。',
      '🎨 遵循一致的代码风格（使用 Prettier 或 ESLint），让团队协作更顺畅。',
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    return randomTip;
  },
});

module.exports = {
  blogSearchTool,
  currentTimeTool,
  randomQuoteTool,
  calculatorTool,
  codeRunnerTool,
  techTipTool,
  // 导出所有工具列表
  tools: [
    blogSearchTool,
    currentTimeTool,
    randomQuoteTool,
    calculatorTool,
    codeRunnerTool,
    techTipTool,
  ],
};
