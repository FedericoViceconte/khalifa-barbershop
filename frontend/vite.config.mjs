import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// DEMO_BASE publishes the frontend in a subfolder, such as /khalifa-barbershop/ on GitHub Pages.
export default defineConfig({
  base: process.env.DEMO_BASE || '/',
  plugins: [react()],
  build: { outDir: 'build' },
  server: {
    port: 3001,
    proxy: { '/api': 'http://127.0.0.1:3000' }
  },
  test: {
    environment: 'jsdom'
  }
});
