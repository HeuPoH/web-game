import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { patchCssModules } from 'vite-css-modules';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@game/shared-types': '/packages/shared-types/src',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        ws: true
      },
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    }
  },
  plugins: [
    react(),
    patchCssModules({
      generateSourceTypes: true
    })
  ],
  build: {
    outDir: '../server/build/public',
    sourcemap: false,
  },
  optimizeDeps: {
    exclude: ['phaser'],
  },
});
