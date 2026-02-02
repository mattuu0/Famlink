import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['famlink-production.up.railway.app'], // RailwayのURLを許可するよ
    host: true,
    port: 5173
  }
})