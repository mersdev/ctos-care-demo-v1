import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ctos-care-demo-v1/',
  server: {
    port: 5173
  }
})
