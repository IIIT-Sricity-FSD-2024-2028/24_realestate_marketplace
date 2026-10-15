import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@buyer': path.resolve(__dirname, 'buyer-react/src'),
      '@seller': path.resolve(__dirname, 'seller-react/src'),
      '@admin': path.resolve(__dirname, 'admin-react/src'),
      '@superuser': path.resolve(__dirname, 'superuser-react/src'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    // Proxy backend API and static uploads to the NestJS server on port 3000
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
