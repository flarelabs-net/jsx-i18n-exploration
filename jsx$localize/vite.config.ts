import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		emptyOutDir: true,
    minify: false,
		lib: {
			entry: {
				react: new URL('src/react/index.ts', import.meta.url).pathname,
				vite: new URL('src/vite/index.ts', import.meta.url).pathname,
			},
			formats: ['es'],
		},
		rollupOptions: {
      external: [
        'os', // suppress vite warning when processing recast
        'react',
        'react/jsx-runtime',
      ],
		},
	},
});
