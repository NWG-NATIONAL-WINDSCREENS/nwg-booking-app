import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['prop-types', 'react-dropzone'],
  },
  build: {
    commonjsOptions: {
      include: [/prop-types/, /react-dropzone/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      maxParallelFileOps: 256,
      external: ['async_hooks', 'stream'], // Only Node.js modules, NOT prop-types
    },
  },
});
