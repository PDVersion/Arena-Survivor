import { writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import os from "node:os";
import { createRunStatistics, recordCommittedKill } from "../src/game/systems/statistics/run-statistics";

// A fixed-work complement to browser recordings. No timing threshold enters CI.
const results = [];
let checksum = 0;
for (const count of [0, 300, 3000]) {
  const input = { ...createRunStatistics(),
    recentKillTimesMs: Object.freeze(Array.from({ length: count }, (_, index) => 1000 + index)),
  };
  for (let warmup = 0; warmup < 1000; warmup += 1) recordCommittedKill(input, 4500);
  for (let repeat = 1; repeat <= 3; repeat += 1) {
    const start = performance.now();
    for (let call = 0; call < 10000; call += 1) {
      const next = recordCommittedKill(input, 4500);
      checksum += next.recentKillTimesMs.length;
    }
    results.push({ count, repeat, calls: 10000, elapsedMs: performance.now() - start });
  }
}
const outputIndex = process.argv.indexOf("--output");
const output = process.argv[outputIndex + 1];
if (outputIndex < 0 || !output) throw new Error("Provide --output path.json");
await writeFile(output, JSON.stringify({ recordedAt: new Date().toISOString(),
  sourceSha256: createHash("sha256").update(await readFile("src/game/systems/statistics/run-statistics.ts")).digest("hex"),
  device: { cpu: os.cpus()[0]?.model, platform: os.platform(), release: os.release(), node: process.version },
  note: "Fixed frozen inputs, sequential 10000 calls; microbenchmark only, not browser throughput/device acceptance",
  checksum, results,
}, null, 2) + "\n");
console.log(JSON.stringify({ output, checksum, results }));
