import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "src/background.js",
      output: {
        entryFileNames: "background.js",
        format: "es"
      }
    }
  }
});
