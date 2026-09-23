import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  publicDir: false,
  resolve: {
    alias: {
      "@": `${import.meta.dirname}/src`,
    },
  },
  define: {
    "import.meta.env.VITE_CUSTOMER_BOOK_BUILD": '"true"',
  },
  build: {
    outDir: "public/customer-book-build",
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: "book-tracker-app.html",
    },
  },
});
