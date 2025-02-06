import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '' : '/live_interfaces/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
}))