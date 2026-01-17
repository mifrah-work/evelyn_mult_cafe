import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/evelyn_mult_cafe/',
  server: {
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  }
})
