import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The NestJS backend serves everything inside front-end/ as static files, so the
// production build is written to front-end/seller/ and is then reachable at
// http://127.0.0.1:3001/seller/ (and on :3000) without any backend change.
export default defineConfig({
  plugins: [react()],
  // Relative asset URLs so the bundle works from /seller/ on every port.
  base: './',
  build: {
    outDir: '../seller',
    emptyOutDir: true,
  },
  server: {
    port: 5175,
    // In development, forward API calls and uploaded files to the running
    // backend so the app can keep using relative URLs like /api/v1/...
    proxy: {
      '/api': 'http://127.0.0.1:3000',
      '/uploads': 'http://127.0.0.1:3000',
    },
  },
});
