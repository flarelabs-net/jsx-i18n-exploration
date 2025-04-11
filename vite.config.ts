import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import jsx$localize from './jsx$localize'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    jsx$localize(),
    react()
  ],
  resolve: {
    alias: {
      'jsx$localize/react': import.meta.resolve('../../jsx$localize/react/index.ts'),
    }
  },
  build: {
    minify: false
  }
});