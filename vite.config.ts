import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const forApp = env.CAPACITOR === '1' || process.env.CAPACITOR === '1'
  const base = command === 'build' ? (forApp ? '/' : '/honeybee/') : '/'

  return {
    plugins: [react()],
    base,
    preview: {
      allowedHosts: true,
    },
    server: {
      allowedHosts: true,
      port: 5174,
    },
  }
})
