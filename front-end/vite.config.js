/**
 * vite.config.js
 * Purpose: Build and dev-server settings for the React frontend.
 * Inputs:  BACKEND_URL env var (optional) — where the NestJS API runs in dev.
 * Outputs: `npm run build` writes the production bundle to front-end/dist,
 *          which the NestJS backend serves on ports 3000/3001/3002.
 * API calls: none directly; in dev the proxy forwards /api, /uploads and
 *            /health to the backend so the browser sees a single origin.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Where the backend listens during `npm run dev:frontend` (default NestJS port).
const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

export default defineConfig({
  // Enables JSX and fast refresh for React components.
  plugins: [react()],
  server: {
    port: 5173,
    // Forward API + uploaded files to NestJS so relative URLs keep working.
    proxy: {
      '/api': backendUrl,
      '/uploads': backendUrl,
      '/health': backendUrl,
    },
  },
  build: {
    // NestJS serves this folder (see back-end/src/main.ts FRONTEND_DIR).
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    // Browser-like DOM for component tests.
    environment: 'jsdom',
    // Adds toBeInTheDocument() and friends to expect().
    setupFiles: './src/test/setup.js',
    globals: true,
    css: false,
  },
});
