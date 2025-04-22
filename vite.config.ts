import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['@emotion/babel-plugin']
      }
    })
  ],
  base: '/',
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0'
  }
})
