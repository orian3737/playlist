import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    assetsDir: 'static',
  },
  server: {
    port: 5173,
    cors: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000", // Flask backend URL
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""), // Strip '/api' prefix when forwarding to backend
      },
    },
  },
});
