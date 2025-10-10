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
          threshold: 10240, // 只压缩大于10kb的文件
          verbose: true,
          disable: false,
        }),
      isProduction &&
        compression({
          algorithm: 'brotliCompress',
          ext: '.br',
          deleteOriginFile: false,
          threshold: 10240, // 只压缩大于10kb的文件
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
        // Socket.IO代理 - 这是必需的！
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
      ],
      // 处理ESM兼容性
      esbuildOptions: {
        target: 'es2020',
      },
      // 强制重新构建
      force: true,
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
          // 简化分块策略，避免循环依赖
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'ui-vendor': ['@emotion/react', '@emotion/styled', 'framer-motion'],
            'router': ['react-router-dom'],
            'redux': ['@reduxjs/toolkit', 'react-redux'],
            'icons': ['react-icons/fi'],
            'vendor': ['adnaan-ui'],
          },
          // 优化文件名和路径
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            // 根据文件类型分类资源
            const extType = assetInfo.name?.split('.').at(-1);
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name || '')) {
              return 'assets/images/[name].[hash][extname]';
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || '')) {
              return 'assets/fonts/[name].[hash][extname]';
            }
            if (extType === 'css') {
              return 'assets/css/[name].[hash][extname]';
            }
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
      devSourcemap: true,
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
