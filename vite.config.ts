import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      react({
        babel: {
          plugins: ['@emotion/babel-plugin']
        }
      })
    ],
    base: '/',
    server: {
      port: Number(env.VITE_API_PORT),
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
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
})
