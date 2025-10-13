import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd());
  const isProduction = mode === 'production';

  return {
    plugins: [
      react({
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
        // 开发模式启用热刷新
        jsxImportSource: '@emotion/react',
      }),
      // 生产环境启用Gzip/Brotli压缩
      isProduction &&
        compression({
          algorithm: 'gzip',
          ext: '.gz',
          deleteOriginFile: false,
          threshold: 5120, // 降低阈值到5kb，压缩更多文件
          verbose: true,
          disable: false,
        }),
      isProduction &&
        compression({
          algorithm: 'brotliCompress',
          ext: '.br',
          deleteOriginFile: false,
          threshold: 5120, // 降低阈值到5kb
          verbose: true,
          disable: false,
        }),
      // 生产环境启用包大小分析
      isProduction &&
        visualizer({
          open: false,
          gzipSize: true,
          brotliSize: true,
          filename: 'dist/stats.html',
          template: 'treemap', // 使用树状图，更直观
        }),
    ].filter(Boolean),
    base: '/',
    server: {
      port: Number(env.VITE_API_PORT) || 3000,
      open: false,
      host: '0.0.0.0',
      // 根据环境变量配置代理
      proxy: {
        // API代理
        '/api': {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
          secure: false,
          // 只在明确设置时才重写路径
          rewrite: env.VITE_PROXY_REWRITE === 'true' ? (path) => path.replace(/^\/api/, '') : undefined,
        },
        // 文件上传代理
        '/uploads': {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
          secure: false,
        },
        // Socket.IO代理
        '/socket.io': {
          target: env.VITE_SOCKET_URL,
          changeOrigin: true,
          ws: true, // 启用WebSocket代理
          secure: false,
          // 添加超时配置
          timeout: 60000,
          // 保持连接活跃
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              // 设置Socket.IO相关的请求头
              if (req.url?.includes('socket.io')) {
                proxyReq.setHeader('Connection', 'keep-alive');
              }
            });
          },
        },
      },
      // 启用HMR
      hmr: {
        overlay: true,
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      // 导入时忽略文件扩展名
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    // 优化依赖预构建
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@emotion/styled',
        '@emotion/react',
        'framer-motion',
        'react-icons/fi',
        'react-router-dom',
        '@reduxjs/toolkit',
        'react-redux',
        'adnaan-ui',
        // TipTap 编辑器相关 - 提升开发体验
        '@tiptap/react',
        '@tiptap/core',
        '@tiptap/starter-kit',
        'highlight.js',
        'socket.io-client',
      ],
      // 处理ESM兼容性
      esbuildOptions: {
        target: 'es2020',
      },
    },
    // 构建选项
    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      // 启用源码映射（仅在开发环境）
      sourcemap: !isProduction,
      // 清除输出目录
      emptyOutDir: true,
      // 启用CSS代码分割
      cssCodeSplit: true,
      // 禁用CSS内联到JavaScript
      cssInlineLimit: 0,
      // 提高构建性能
      reportCompressedSize: false, // 禁用压缩大小报告以提高性能
      chunkSizeWarningLimit: 1000, // 调整警告阈值
      // 压缩选项
      minify: isProduction ? 'terser' : false,
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: isProduction ? ['console.log', 'console.info'] : [],
        },
        format: {
          comments: false, // 移除注释
        },
      },
      // 分块策略
      rollupOptions: {
        output: {
          // 优化分块策略 - 修复 React 调度器依赖问题
          manualChunks: (id) => {
            // React 生态系统必须放在一起，包括 scheduler
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')
            ) {
              return 'react-core';
            }

            // UI 基础库 - 高频使用
            if (id.includes('@emotion/react') || id.includes('@emotion/styled') || id.includes('framer-motion')) {
              return 'ui-base';
            }

            // 路由和状态管理 - 高频使用
            if (id.includes('react-router-dom') || id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
              return 'router-redux';
            }

            // TipTap 编辑器 - 仅编辑器页面使用，单独分块
            if (id.includes('@tiptap/')) {
              return 'editor';
            }

            // Socket.IO - 实时通信
            if (id.includes('socket.io-client')) {
              return 'socket';
            }

            // 图标库 - 按需加载
            if (id.includes('react-icons') || id.includes('lucide-react')) {
              return 'icons';
            }

            // adnaan-ui 组件库
            if (id.includes('adnaan-ui')) {
              return 'adnaan-ui';
            }

            // 其他 node_modules 依赖
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          // 优化文件名和路径 - 清晰的目录结构
          entryFileNames: 'js/[name].[hash].js',
          chunkFileNames: (chunkInfo) => {
            // 根据chunk名称分类到不同目录
            const name = chunkInfo.name;

            // 核心库放在 js/core 目录
            if (['react-core', 'ui-base', 'router-redux'].includes(name)) {
              return 'js/core/[name].[hash].js';
            }

            // 功能模块放在 js/modules 目录
            if (['editor', 'socket'].includes(name)) {
              return 'js/modules/[name].[hash].js';
            }

            // UI和工具库放在 js/libs 目录
            if (['adnaan-ui', 'icons', 'vendor'].includes(name)) {
              return 'js/libs/[name].[hash].js';
            }

            // 页面chunk放在 js/pages 目录
            return 'js/pages/[name].[hash].js';
          },
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';

            // 图片资源
            if (/\.(png|jpe?g|gif|svg|webp|ico|avif)$/i.test(name)) {
              return 'images/[name].[hash][extname]';
            }

            // 字体文件
            if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
              return 'fonts/[name].[hash][extname]';
            }

            // CSS文件
            if (/\.css$/i.test(name)) {
              return 'css/[name].[hash][extname]';
            }

            // 媒体文件
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i.test(name)) {
              return 'media/[name].[hash][extname]';
            }

            // JSON等数据文件
            if (/\.(json|xml|txt)$/i.test(name)) {
              return 'data/[name].[hash][extname]';
            }

            // 其他文件
            return 'assets/[name].[hash][extname]';
          },
        },
      },
    },
    // CSS 处理配置
    css: {
      // 启用 CSS 模块化
      modules: {
        localsConvention: 'camelCaseOnly',
      },
      // 预处理器选项
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
        scss: {
          additionalData: `@import "@/styles/variables.scss";`,
        },
      },
      // 开发工具
      devSourcemap: !isProduction, // 仅开发环境启用
    },
    // 性能优化
    esbuild: {
      // 默认在开发环境下启用
      legalComments: 'none',
      // 生产环境下移除console和debugger
      drop: isProduction ? ['console', 'debugger'] : [],
      // 默认启用 JSX 转换
      jsx: 'automatic',
      // TypeScript配置
      tsconfigRaw: `{
        "compilerOptions": {
          "skipLibCheck": true,
          "noUnusedLocals": false,
          "noUnusedParameters": false
        }
      }`,
    },
  };
});
