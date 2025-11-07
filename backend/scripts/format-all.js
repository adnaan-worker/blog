#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🎨 开始格式化后端代码...\n');

try {
  // 1. 使用 Prettier 格式化所有文件
  console.log('📝 使用 Prettier 格式化代码...');
  execSync('npx prettier --write "**/*.{js,json,md}"', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  console.log('✅ Prettier 格式化完成\n');

  // 2. 使用 ESLint 修复代码问题
  console.log('🔧 使用 ESLint 修复代码问题...');
  execSync('npx eslint . --fix', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  console.log('✅ ESLint 修复完成\n');

  // 3. 再次使用 Prettier 确保格式一致
  console.log('🎯 最终格式化检查...');
  execSync('npx prettier --write "**/*.{js,json,md}"', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  console.log('✅ 最终格式化完成\n');

  console.log('🎉 所有代码格式化完成！');
  console.log('\n📊 格式化统计:');
  console.log('   - JavaScript 文件: ✅');
  console.log('   - JSON 文件: ✅');
  console.log('   - Markdown 文件: ✅');
  console.log('   - 代码风格检查: ✅');
  console.log('   - 语法错误修复: ✅');
} catch (error) {
  console.error('❌ 格式化过程中出现错误:', error.message);
  process.exit(1);
}
