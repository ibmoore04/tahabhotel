import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // Exposes dev server on all network interfaces (0.0.0.0)
    port: 5173,   // Fixed port so the URL is always the same on your phone
    strictPort: true, // Fail clearly instead of silently moving to 5174/5175.
  },
})
