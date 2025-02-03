import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import jsx$localize from './jsx$localize'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    jsx$localize(),
    react()
  ],
  build: {
    minify: false
  }
})

