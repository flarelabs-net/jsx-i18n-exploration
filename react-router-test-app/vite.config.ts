import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import jsx$localize from '../jsx$localize/src/vite'

export default defineConfig({
  plugins: [
    jsx$localize(),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      '@flarelabs-net/jsx-localize/react': import.meta.resolve('../../../jsx$localize/src/react/index.ts'),
    }
  },
  build: {
    minify: false
  }
});
