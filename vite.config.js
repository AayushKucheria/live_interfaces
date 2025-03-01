import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig(({ command }) => ({
  plugins: [react(), {
    name: 'vite-plugin-raw-loader',
    transform(code, id) {
      if (id.endsWith('?raw')) {
        const filePath = id.slice(0, -4);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return `export default ${JSON.stringify(fileContent)};`;
      }
    }
  }],
  base: command === 'serve' ? '' : '/live_interfaces/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
}))