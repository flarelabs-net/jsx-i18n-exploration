import type { Plugin } from 'vite';
import { transform } from './transform';


export default function jsx$localize() {
  return {
    name: 'jsx$localize',
    enforce: 'pre',
    transform(code, id) {
      if (!id.match(/src\/scenarios\/.+\.tsx/)) return;

      if (!id.endsWith('.tsx')) {
        return;
      }
      console.log('\n\ntransforming', id);

      const transformed = transform(code, id);

      console.log('\n=== original ===\n', code)
      console.log('\n=== transformed ===\n', transformed.code)

      return transformed;
    }
  } as Plugin;
}