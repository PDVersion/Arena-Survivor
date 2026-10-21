import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e", testMatch: "device-pack-v043.spec.ts",
  workers: 1, retries: 0, fullyParallel: false, globalTimeout: 130000,
  reporter: [["list"], ["json", { outputFile: "../build/performance/P6_DEVICE_PACK_TEST.json" }]],
  outputDir: "../test-results/device-pack-verification",
  use: { baseURL: "http://127.0.0.1:4180", viewport: { width: 1280, height: 900 } },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "node ../test-results/p6-device-pack/serve.mjs",
    url: "http://127.0.0.1:4180", reuseExistingServer: false, timeout: 10000,
  },
});
