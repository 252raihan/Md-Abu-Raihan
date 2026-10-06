import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Frontend-only application. No backend, no proxy, no external API calls.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    // pdfjs-dist ships large worker/asset files; raise the warning limit so a
    // warning is not mistaken for a failure.
    chunkSizeWarningLimit: 1500,
  },
})
