import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/FrontManuscript/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'british-museum-logo.svg'],
      manifest: {
        name: 'Manuscript Analyzer',
        short_name: 'Manuscript',
        description: 'App for identifying ancient Russian manuscript periods',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    // Разрешаем Vite слушать сеть (нужно для доступа с телефона/Tauri)
    host: '0.0.0.0', 
    proxy: {
      '/api': {
        // Указываем ваш реальный IP и порт бекенда
        target: 'http://172.20.10.3:8081', 
        changeOrigin: true,
        secure: false,
      },
      '/manuscripts': {
        // MinIO тоже ищем по этому IP
        target: 'http://172.20.10.3:9000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
  