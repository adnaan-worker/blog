/**
 * 批量转换相对路径为路径别名
 * 使用方法: node scripts/convert-to-alias.js
 */

const fs = require('fs');
const path = require('path');

// 需要转换的目录
const directories = [
  'controllers',
  'middlewares',
  'routes',
  'services',
  'queues',
  'sockets',
  'utils',
];

// 路径别名映射
const aliasMap = {
  '/utils/': '@/utils/',
  '/config/': '@/config/',
  '/models/': '@/models/',
  '/services/': '@/services/',
  '/controllers/': '@/controllers/',
  '/middlewares/': '@/middlewares/',
  '/routes/': '@/routes/',
  '/queues/': '@/queues/',
  '/sockets/': '@/sockets/',
};

// 转换规则
const convertPatterns = [
  // ../utils/ -> @/utils/
  { from: /require\(['"]\.\.\/\.\.\/utils\//g, to: "require('@/utils/" },
  { from: /require\(['"]\.\.\/utils\//g, to: "require('@/utils/" },

  // ../config/ -> @/config/
  { from: /require\(['"]\.\.\/\.\.\/config\//g, to: "require('@/config/" },
  { from: /require\(['"]\.\.\/config\//g, to: "require('@/config/" },

  // ../models/ -> @/models/
  { from: /require\(['"]\.\.\/\.\.\/models\//g, to: "require('@/models/" },
  { from: /require\(['"]\.\.\/models\//g, to: "require('@/models/" },
  { from: /require\(['"]\.\.\/\.\.\/\.\.\/models\//g, to: "require('@/models/" },

  // ../services/ -> @/services/
  { from: /require\(['"]\.\.\/\.\.\/services\//g, to: "require('@/services/" },
  { from: /require\(['"]\.\.\/services\//g, to: "require('@/services/" },
  { from: /require\(['"]\.\.\/\.\.\/\.\.\/services\//g, to: "require('@/services/" },

  // ../controllers/ -> @/controllers/
  { from: /require\(['"]\.\.\/\.\.\/controllers\//g, to: "require('@/controllers/" },
  { from: /require\(['"]\.\.\/controllers\//g, to: "require('@/controllers/" },

  // ../middlewares/ -> @/middlewares/
  { from: /require\(['"]\.\.\/\.\.\/middlewares\//g, to: "require('@/middlewares/" },
  { from: /require\(['"]\.\.\/middlewares\//g, to: "require('@/middlewares/" },

  // ../routes/ -> @/routes/
  { from: /require\(['"]\.\.\/\.\.\/routes\//g, to: "require('@/routes/" },
  { from: /require\(['"]\.\.\/routes\//g, to: "require('@/routes/" },

  // ../queues/ -> @/queues/
  { from: /require\(['"]\.\.\/\.\.\/queues\//g, to: "require('@/queues/" },
  { from: /require\(['"]\.\.\/queues\//g, to: "require('@/queues/" },

  // ../sockets/ -> @/sockets/
  { from: /require\(['"]\.\.\/\.\.\/sockets\//g, to: "require('@/sockets/" },
  { from: /require\(['"]\.\.\/sockets\//g, to: "require('@/sockets/" },
];

// 递归获取所有 JS 文件
function getAllJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        getAllJsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// 转换单个文件
function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  let changes = [];

  convertPatterns.forEach(({ from, to }) => {
    const matches = content.match(from);
    if (matches) {
      content = content.replace(from, to);
      changed = true;
      changes.push({ pattern: from.toString(), count: matches.length });
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${path.relative(process.cwd(), filePath)}`);
    changes.forEach(({ pattern, count }) => {
      console.log(`   - 替换 ${count} 处`);
    });
    return true;
  }

  return false;
}

// 主函数
function main() {
  console.log('🔄 开始转换相对路径为路径别名...\n');

  let totalFiles = 0;
  let convertedFiles = 0;

  directories.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);

    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️  目录不存在: ${dir}`);
      return;
    }

    console.log(`\n📁 处理目录: ${dir}`);
    const files = getAllJsFiles(dirPath);

    files.forEach(file => {
      totalFiles++;
      if (convertFile(file)) {
        convertedFiles++;
      }
    });
  });

  console.log('\n========================================');
  console.log('✅ 转换完成！');
  console.log(`📊 总文件数: ${totalFiles}`);
  console.log(`✨ 已转换: ${convertedFiles}`);
  console.log(`⏭️  未变更: ${totalFiles - convertedFiles}`);
  console.log('========================================\n');
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { convertFile, getAllJsFiles };
