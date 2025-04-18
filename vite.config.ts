import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import jsx$localize from './jsx$localize/src/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    jsx$localize(),
    react()
  ],
  resolve: {
    alias: {
      '@flarelabs-net/jsx-localize/react': import.meta.resolve('../../jsx$localize/src/react/index.ts'),
    }
  },
  build: {
    minify: false
  }
});