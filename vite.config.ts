import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5137,  // Порт для dev сервера
    host: true   // Для доступа с других устройств в сети
  },
  preview: {
    port: 5137   // Порт для preview сервера
  }
})