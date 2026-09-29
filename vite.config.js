import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Path backend dipakai apa adanya: /api/v1/..., /health/..., /uploads/...,
    // /sitemap.xml, dan /feed.xml
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/health': { target: 'http://localhost:8080', changeOrigin: true },
      '/uploads': { target: 'http://localhost:8080', changeOrigin: true },
      // Di Vercel, keduanya diteruskan oleh middleware.js.
      '/sitemap.xml': { target: 'http://localhost:8080', changeOrigin: true },
      '/feed.xml': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: true,
  },
})
