import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/honeybee/' : '/',
  preview: {
    allowedHosts: true,
  },
  server: {
    allowedHosts: true,
    port: 5174,
  },
}))
