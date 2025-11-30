import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// ТВОЙ РЕАЛЬНЫЙ IP (из ipconfig)
const myIP = '192.168.0.106'; 

// Определяем, где мы: GitHub Pages или локалка
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const BASE_URL = isGitHubPages ? '/FrontManuscript/' : '/';

export default defineConfig({
  base: BASE_URL,
  
  // ВОТ ЭТО САМОЕ ВАЖНОЕ: Передаем IP внутрь React-приложения
  define: {
    '__SERVER_IP__': JSON.stringify(myIP),
  },

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'british-museum-logo.svg'],
      manifest: {
        name: 'Manuscript Analyzer',
        short_name: 'Manuscript',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        scope: BASE_URL,
        start_url: BASE_URL,
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: `http://${myIP}:8081`,
        changeOrigin: true,
        secure: false,
      },
      '/manuscripts': {
        target: `http://${myIP}:9000`,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})