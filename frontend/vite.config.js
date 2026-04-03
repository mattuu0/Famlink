import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['famlink.aoioq.com'], // RailwayのURLを許可するよ
    host: true,
    port: 5173
  },
  server: {
    watch: {
      usePolling: true,  //windows用にポーリングを使用
      interval: 1000,    //ポーリングの負荷対策用
    }
  },
  base: "/ui/"
})
