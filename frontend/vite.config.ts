import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 1. Прокси для API
      '/api': {
        target: 'http://127.0.0.1:8081', 
        changeOrigin: true,
        secure: false,

      },
      
      // 2. Прокси для картинок MinIO
      '/manuscripts': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
        secure: false,

      }
    }
  }
})