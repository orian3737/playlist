import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './client',  // Root directory for Vite
  base: './',  // Base path for assets
  build: {
    outDir: '../dist',  // Output directory for the build
    assetsDir: 'static',
    rollupOptions: {
      input: {
        main: './src/main.jsx', // Path to the index file
      },
    },
  },
  server: {
    port: 5173,
    cors: true,
    proxy: {
      "/api": {
        target: "http://localhost:5555/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
