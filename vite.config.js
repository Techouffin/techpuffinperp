import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer:  path.resolve(__dirname, 'node_modules/buffer/index.js'),
      process: path.resolve(__dirname, 'node_modules/process/browser.js'),
      stream:  path.resolve(__dirname, 'node_modules/stream-browserify/index.js'),
      util:    path.resolve(__dirname, 'node_modules/util/util.js'),
      events:  path.resolve(__dirname, 'node_modules/events/events.js'),
    },
  },
  server: { port: 3000 },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('framer-motion'))  return 'framer'
          if (id.includes('recharts'))       return 'recharts'
          if (id.includes('@radix-ui'))      return 'radix'
          if (id.includes('node_modules/react') || id.includes('react-router')) return 'react-vendor'
          if (id.includes('lucide-react'))   return 'icons'
        },
      },
    },
  },
  define: { 'process.env':'{}', 'process.browser':'true', 'process.version':'"v18.0.0"', global:'globalThis' },
})
