require('module-alias/register');
require('dotenv').config();

const { Queue } = require('bullmq');
const queueConfig = require('@/config/queue.config');

/**
 * 清理 AI 任务队列
 */
async function clearAIQueue() {
  console.log('🧹 开始清理 AI 任务队列...');

  const aiQueue = new Queue('ai-tasks', {
    connection: queueConfig.getConnection(),
  });

  try {
    // 清理所有状态的任务
    await aiQueue.obliterate({ force: true });
    console.log('✅ AI 任务队列已清空');

    // 获取队列统计
    const counts = await aiQueue.getJobCounts();
    console.log('📊 当前队列状态:', counts);

    await aiQueue.close();
    console.log('✅ 队列连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('❌ 清理失败:', error);
    process.exit(1);
  }
}

clearAIQueue();
