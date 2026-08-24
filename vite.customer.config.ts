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
    "import.meta.env.VITE_CUSTOMER_BUILD": '"true"',
  },
  build: {
    outDir: "public/customer-build",
    emptyOutDir: true,
    cssCodeSplit: false,
  },
});
