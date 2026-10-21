import { build } from "vite";
import { mkdir, readFile, writeFile, copyFile, readdir } from "node:fs/promises";
import { resolve, relative, join } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

// Test-only artifact; never replace or publish dist as a production build.
const root = resolve("test-results/p6-device-pack");
const site = join(root, "site");
await mkdir(root, { recursive: true });
await build({ configFile: false, mode: "test", build: {
  target: "es2022", outDir: site, emptyOutDir: true,
  rollupOptions: { input: { game: resolve("index.html"), device: resolve("tests/device-pack/device-check.html") } },
} });
await copyFile("tests/device-pack/serve.mjs", join(root, "serve.mjs"));
const files: Record<string, string> = {};
async function hashTree(directory: string) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await hashTree(path);
    else files[relative(root, path).replaceAll("\\", "/")] = createHash("sha256").update(await readFile(path)).digest("hex");
  }
}
await hashTree(root);
// Exclude a prior manifest from a repeated artifact build.
delete files["site/manifest.json"];
delete files["README.txt"];
const manifest = { schema: "arena-device-pack-v1", mode: "test", createdAt: new Date().toISOString(),
  revision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  sourceDiffSha256: createHash("sha256").update(execFileSync("git", ["diff", "HEAD"])).digest("hex"),
  pendingFiles: execFileSync("git", ["status", "--short"], { encoding: "utf8" }), files,
  limitation: "Instrumented browser evidence only; physical hardware claims require actual device and review." };
await writeFile(join(site, "manifest.json"), JSON.stringify(manifest, null, 2));
await writeFile(join(root, "README.txt"), `Arena Survivor P6 device pack (TEST BUILD)\n\nRequires Node.js 20+ on the target device. No npm install or internet connection required after copying this folder.\nRun: node serve.mjs\nOpen: http://127.0.0.1:4180\nStop: Ctrl+C. Server binds loopback only and refuses an occupied port.\n\nFill in device/GPU driver/power notes. Load normal play or aided 60/150/300 benchmark.\nSelect Default/Low in the actual game Settings, then Record and focus the game.\nRecord three 60-second windows per load/quality after ten-second warmup.\nDownload each result. Report hidden/paused intervals and actual populations; no automatic pass.\nAlso play a normal authored run with hazards/contact, choose upgrades, pause/resize,\nreturn after a real tab interruption, and restart. Note any errors or unreadable controls.\nDo not describe M5, emulation or software rendering as older integrated-GPU evidence.\n\nBuild identity and file hashes: site/manifest.json\nDo not deploy this diagnostic build as production.\n`);
console.log(`Device pack ready: ${root}`);
