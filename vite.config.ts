import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    root: '.',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react({ jsxRuntime: 'automatic' })],
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime', 'lunar-javascript', 'html-to-image'],
      esbuildOptions: {
        target: 'esnext'
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      },
      dedupe: ['react', 'react-dom']
    },
    build: {
      outDir: 'dist',
      emptyDirBeforeWrite: true,
      rollupOptions: {
        input: {
          // 根目录导航页
          'index.html': path.resolve(__dirname, 'index.html'),
          'liuyao-qigua.html': path.resolve(__dirname, 'liuyao-qigua.html'),
          'liuyao-paipan.html': path.resolve(__dirname, 'liuyao-paipan.html'),
          'liuyao-history.html': path.resolve(__dirname, 'liuyao-history.html'),
          'bazi-paipan.html': path.resolve(__dirname, 'bazi-paipan.html'),
          'calendar.html': path.resolve(__dirname, 'calendar.html')
        }
      }
    }
});
