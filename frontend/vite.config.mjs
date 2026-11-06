import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// DEMO_BASE publica el frontend en una subcarpeta, como /khalifa-barbershop/ en GitHub Pages.
export default defineConfig({
  base: process.env.DEMO_BASE || '/',
  plugins: [react()],
  build: { outDir: 'build' },
  server: {
    port: 3001,
    proxy: { '/api': 'http://127.0.0.1:3000', '/admin': 'http://127.0.0.1:3000', '/panel': 'http://127.0.0.1:3000' },
    // ../shared tiene las reglas de la agenda que también usa el servidor.
    fs: { allow: ['..'] }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js']
  }
});
