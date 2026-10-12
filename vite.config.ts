import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2022",
    rollupOptions: { input: { game: "index.html", sprites: "sprite-browser.html", architecture: "build/ARCHITECTURE_MAP.html" } },
  },
});
