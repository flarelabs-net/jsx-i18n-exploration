import type { Plugin } from 'vite';
import { transform } from '../transform';


export default function jsx$localize() {
  return {
    name: 'jsx$localize',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.tsx')) {
        return;
      }
      console.info('jsx$localize transforming:', id);

      const transformed = transform(code, id);

      //console.debug('\n=== original ===\n', code)
      //console.debug('\n=== transformed ===\n', transformed.code)

      return transformed;
    }
  } as Plugin;
}