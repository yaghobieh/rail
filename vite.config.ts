import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({ insertTypesEntry: true }),
  ],
  build: {
    minify: 'esbuild',
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'modules/index': resolve(__dirname, 'src/modules/index.ts'),
        'hooks/index': resolve(__dirname, 'src/hooks/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
  },
});
