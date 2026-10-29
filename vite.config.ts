import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2022",
    rollupOptions: { input: { game: "index.html", sprites: "sprite-browser.html", testing: "testing-area.html", shop: "impact-shop.html", architecture: "build/ARCHITECTURE_MAP.html" } },
  },
});
