/**
 * AI 服务验证脚本
 * 用于验证新的 AI 服务是否正常工作
 */

const { aiService, writingService } = require('../services/ai');
const { logger } = require('../utils/logger');

async function verifyAIService() {
  console.log('\n========================================');
  console.log('🔍 开始验证 AI 服务');
  console.log('========================================\n');

  const results = {
    passed: [],
    failed: [],
  };

  try {
    // 1. 验证服务初始化
    console.log('1️⃣ 验证服务初始化...');
    await aiService.initialize();
    if (aiService.isAvailable()) {
      console.log('   ✅ AI 服务初始化成功');
      results.passed.push('服务初始化');
    } else {
      throw new Error('AI 服务不可用');
    }

    // 2. 验证服务信息
    console.log('\n2️⃣ 验证服务信息...');
    const info = aiService.getInfo();
    console.log('   📊 服务信息:', JSON.stringify(info, null, 2));
    if (info.provider && info.model && info.available) {
      console.log('   ✅ 服务信息正常');
      results.passed.push('服务信息');
    } else {
      throw new Error('服务信息不完整');
    }

    // 3. 验证简单聊天
    console.log('\n3️⃣ 验证简单聊天...');
    const chatResponse = await aiService.chat('你好，请简短回复');
    if (chatResponse && chatResponse.length > 0) {
      console.log('   ✅ 简单聊天正常');
      console.log('   📝 响应:', chatResponse.substring(0, 50) + '...');
      results.passed.push('简单聊天');
    } else {
      throw new Error('聊天响应为空');
    }

    // 4. 验证流式聊天
    console.log('\n4️⃣ 验证流式聊天...');
    let streamChunks = 0;
    await aiService.streamChat(
      '数到3',
      chunk => {
        streamChunks++;
        process.stdout.write(chunk);
      },
      { taskId: 'test_stream_chat' }
    );
    console.log();
    if (streamChunks > 0) {
      console.log(`   ✅ 流式聊天正常 (收到 ${streamChunks} 个 chunks)`);
      results.passed.push('流式聊天');
    } else {
      throw new Error('未收到流式响应');
    }

    // 5. 验证生成标题
    console.log('\n5️⃣ 验证生成标题...');
    const title = await writingService.generateTitle(
      'React 是一个用于构建用户界面的 JavaScript 库',
      ['React', 'JavaScript']
    );
    if (title && title.length > 0) {
      console.log('   ✅ 生成标题正常');
      console.log('   📝 标题:', title);
      results.passed.push('生成标题');
    } else {
      throw new Error('标题生成失败');
    }

    // 6. 验证生成摘要
    console.log('\n6️⃣ 验证生成摘要...');
    const summary = await writingService.generateSummary(
      'React 是一个用于构建用户界面的 JavaScript 库。它由 Facebook 开发并维护。'
    );
    if (summary && summary.length > 0) {
      console.log('   ✅ 生成摘要正常');
      console.log('   📝 摘要:', summary);
      results.passed.push('生成摘要');
    } else {
      throw new Error('摘要生成失败');
    }

    // 7. 验证模板生成
    console.log('\n7️⃣ 验证模板生成...');
    const polished = await aiService.generate('polish', {
      content: '这是一段需要润色的文本',
      style: '更加专业',
    });
    if (polished && polished.length > 0) {
      console.log('   ✅ 模板生成正常');
      console.log('   📝 润色结果:', polished.substring(0, 50) + '...');
      results.passed.push('模板生成');
    } else {
      throw new Error('模板生成失败');
    }

    // 8. 验证流式模板生成
    console.log('\n8️⃣ 验证流式模板生成...');
    let templateStreamChunks = 0;
    await writingService.polish(
      '这是一段需要润色的文本',
      '更加简洁',
      chunk => {
        templateStreamChunks++;
        process.stdout.write(chunk);
      },
      'test_polish'
    );
    console.log();
    if (templateStreamChunks > 0) {
      console.log(`   ✅ 流式模板生成正常 (收到 ${templateStreamChunks} 个 chunks)`);
      results.passed.push('流式模板生成');
    } else {
      throw new Error('未收到流式响应');
    }

    // 9. 验证取消功能
    console.log('\n9️⃣ 验证取消功能...');
    const cancelTaskId = 'test_cancel';
    const cancelPromise = writingService.expand(
      '这是一段需要扩展的长文本',
      'long',
      chunk => {},
      cancelTaskId
    );

    // 等待一小段时间后取消
    setTimeout(() => {
      const cancelled = writingService.cancelTask(cancelTaskId);
      if (cancelled) {
        console.log('   ✅ 取消功能正常');
        results.passed.push('取消功能');
      }
    }, 100);

    try {
      await cancelPromise;
    } catch (error) {
      // 取消可能会导致错误，这是正常的
    }

    // 总结
    console.log('\n========================================');
    console.log('📊 验证结果');
    console.log('========================================\n');
    console.log(`✅ 通过: ${results.passed.length} 项`);
    console.log(`❌ 失败: ${results.failed.length} 项`);
    console.log('\n通过的测试:');
    results.passed.forEach(test => console.log(`   ✅ ${test}`));

    if (results.failed.length > 0) {
      console.log('\n失败的测试:');
      results.failed.forEach(test => console.log(`   ❌ ${test}`));
    }

    console.log('\n========================================');
    if (results.failed.length === 0) {
      console.log('🎉 所有验证通过！AI 服务运行正常');
    } else {
      console.log('⚠️  部分验证失败，请检查配置');
    }
    console.log('========================================\n');

    process.exit(results.failed.length === 0 ? 0 : 1);
  } catch (error) {
    console.error('\n❌ 验证失败:', error.message);
    console.error('\n详细错误:', error);
    console.log('\n========================================');
    console.log('💡 提示:');
    console.log('1. 检查环境变量配置 (AI_PROVIDER, AI_API_KEY)');
    console.log('2. 确保网络连接正常');
    console.log('3. 检查 API Key 是否有效');
    console.log('4. 查看日志文件获取更多信息');
    console.log('========================================\n');
    process.exit(1);
  }
}

// 运行验证
if (require.main === module) {
  verifyAIService().catch(error => {
    console.error('验证脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { verifyAIService };
