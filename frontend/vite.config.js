import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
  },
  // Fix "global is not defined" error thrown by amazon-cognito-identity-js
  define: {
    global: "globalThis",
  },
});
