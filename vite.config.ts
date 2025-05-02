import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())
  const isProduction = mode === 'production'

  return {
    plugins: [
      react({
        babel: {
          plugins: ['@emotion/babel-plugin']
        },
        // 开发模式启用热刷新
        jsxImportSource: '@emotion/react',
      }),
      // 生产环境启用Gzip/Brotli压缩
      isProduction && compression({
        algorithm: 'gzip',
        ext: '.gz',
      }),
      isProduction && compression({
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
      // 生产环境启用包大小分析
      isProduction && visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html',
      }),
    ].filter(Boolean),
    base: '/',
    server: {
      port: Number(env.VITE_API_PORT) || 3000,
      open: true,
      host: '0.0.0.0',
      // 根据环境变量配置代理
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: env.VITE_PROXY_REWRITE === 'true'
            ? (path) => path.replace(/^\/api/, '')
            : undefined,
          secure: false,
        }
      },
      // 启用HMR
      hmr: {
        overlay: true,
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      },
      // 导入时忽略文件扩展名
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    // 优化依赖预构建
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@emotion/styled',
        '@emotion/react',
        'framer-motion',
        'react-icons/fi',
        'react-router-dom',
        '@reduxjs/toolkit',
        'react-redux'
      ],
      // 强制预构建这些依赖
      force: true
    },
    // 构建选项
    build: {
      target: 'es2015',
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
      // 压缩选项
      minify: isProduction ? 'terser' : false,
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
        },
      },
      // 分块策略
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'ui-vendor': ['@emotion/styled', '@emotion/react', 'framer-motion'],
            'icons': ['react-icons/fi'],
            'router': ['react-router-dom'],
            'redux': ['@reduxjs/toolkit', 'react-redux']
          },
          // 调整入口和块名称
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]'
        }
      },
      // 启用代码分割
      chunkSizeWarningLimit: 600
    },
    // CSS 处理配置
    css: {
      // 启用 CSS 模块化
      modules: {
        localsConvention: 'camelCaseOnly'
      },
      // 预处理器选项
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        },
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      },
      // 开发工具
      devSourcemap: true
    },
    // 性能优化
    esbuild: {
      // 默认在开发环境下启用
      legalComments: 'none',
      // 生产环境下移除console和debugger
      drop: isProduction ? ['console', 'debugger'] : [],
      // 默认启用 JSX 转换
      jsx: 'automatic'
    }
  }
})
