import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: './',
  preview: {
    allowedHosts: true,
  },
  server: {
    allowedHosts: true,
    port: 5174,
  },
})
