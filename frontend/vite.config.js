import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use environment variable for production API URL, fallback to localhost for dev
const apiTarget = process.env.VITE_API_URL || 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true
      }
    }
  }
})