import { defineConfig, devices } from "@playwright/test";

// Explicit local gate; the normal Chromium/CI configuration is unchanged.
export default defineConfig({
  testDir: "./e2e",
  testMatch: /(?:compatibility-environment-v043|boot|phase-two|gameplay-rate|presentation-v043|lifecycle-v043)\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  globalTimeout: 15 * 60_000,
  reporter: [["list"], ["json", { outputFile: process.env.ARENA_COMPATIBILITY_REPORT ?? "../build/performance/P5_COMPATIBILITY_RESULTS.json" }]],
  outputDir: "../test-results/compatibility",
  use: {
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 1280, height: 720 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    ...(process.env.ARENA_EDGE_EXECUTABLE ? [{
      name: "edge-stable",
      use: { ...devices["Desktop Chrome"], userAgent: undefined,
        launchOptions: { executablePath: process.env.ARENA_EDGE_EXECUTABLE } },
    }] : []),
    { name: "chrome-installed", use: { ...devices["Desktop Chrome"], userAgent: undefined, channel: "chrome" } },
    { name: "chromium", use: { ...devices["Desktop Chrome"], userAgent: undefined } },
    { name: "firefox", use: { ...devices["Desktop Firefox"], userAgent: undefined } },
    { name: "webkit", use: { ...devices["Desktop Safari"], userAgent: undefined } },
  ],
  webServer: {
    command: "npm run dev -- --mode test --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
