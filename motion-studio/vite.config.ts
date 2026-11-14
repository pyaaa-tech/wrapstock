import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/**
 * Standalone HTML motion site.
 * - `base: "./"` keeps the build portable: drop dist-web/ on any static host or sub-folder.
 * - The bundle is emitted as one classic script (no ES-module loader), so
 *   dist-web/index.html also plays when opened straight from disk.
 */
const classicScript = (): Plugin => ({
  name: "classic-script",
  enforce: "post",
  transformIndexHtml: (html) => html.replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/, '<script defer src="$1"></script>').replace(/ crossorigin(?=[^>]*rel="stylesheet"|[^>]*href="[^"]+\.css")/g, ""),
});

export default defineConfig({
  base: "./",
  plugins: [react(), classicScript()],
  publicDir: "public",
  build: {
    outDir: "dist-web",
    emptyOutDir: true,
    target: "es2022",
    modulePreload: false,
    rollupOptions: { output: { format: "iife", inlineDynamicImports: true } },
  },
  server: { port: 5173, host: true },
});
