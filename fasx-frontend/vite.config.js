import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
      host: true, // слушать 0.0.0.0, чтобы был доступ с внешних устройств
      port: 5173, // твой dev-порт
      strictPort: true, // если порт занят, не подбирать другой
      proxy: {
        '/api': {
          target: 'http://46.173.18.36:4000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
        outDir: 'dist',
      },
      // вот это нужно для React Router
      preview: {
        port: 5173,
        strictPort: true,
        // чтобы любые пути отдавали index.html
        historyApiFallback: true,
      },
})

