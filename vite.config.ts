import { defineConfig } from "vite";

// Single-file ES bundle. HACS requires dist/open-tides-card.js (the repo name).
export default defineConfig({
  build: {
    lib: {
      entry: "src/open-tides-card.ts",
      formats: ["es"],
      fileName: () => "open-tides-card.js",
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
  server: {
    // `npm run dev` then add http://<this-host>:5173/src/open-tides-card.ts
    // as a JavaScript module resource in HA. See docs/development.md.
    host: true,
    port: 5173,
    cors: true,
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
