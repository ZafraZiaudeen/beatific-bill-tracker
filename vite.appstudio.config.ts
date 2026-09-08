import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  publicDir: false,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    outDir: "dist/app-studio",
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: "index.html",
    },
  },
  server: {
    port: 5173,
  },
});
