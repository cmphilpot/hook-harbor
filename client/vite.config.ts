import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      // Trailing slash so the /piers/... page isn't proxied too
      '/p/': 'http://localhost:3000',
    },
  },
})
