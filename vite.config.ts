import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',      // Разрешить доступ снаружи контейнера
    port: 5173,
    strictPort: true,      // Не пытаться использовать другой порт если 5173 занят
    hmr: {
      host: 'localhost',   // Для Hot Module Replacement (клиентская часть)
      clientPort: 5173     // Порт для HMR соединения
    }
  }
})