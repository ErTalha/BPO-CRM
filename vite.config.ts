import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/",
  server: { port: 5173, strictPort: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ["recharts"],
          core: ["react", "react-dom", "react-router-dom"],
          translations: ["i18next", "react-i18next"],
        },
      },
    },
  },
});
