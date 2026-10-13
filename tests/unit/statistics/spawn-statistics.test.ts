import { describe, expect, it } from "vitest";
import { SpawnStatistics, spawnOrigins } from "../../../src/game/systems/statistics/spawn-statistics";

describe("spawn origin accounting", () => {
  it("reconciles successful creations and idempotent removals without erasing totals", () => {
    const ledger = new SpawnStatistics();
    for (const [index, origin] of spawnOrigins.entries()) ledger.add(String(index), origin);
    ledger.add("0", "environment");
    expect(Object.values(ledger.live).reduce((sum, count) => sum + count, 0)).toBe(5);
    ledger.remove("0"); ledger.remove("0"); ledger.remove("missing");
    expect(ledger.live.natural).toBe(0);
    expect(ledger.spawned.natural).toBe(1);
    const snapshot = ledger.snapshot(); snapshot.live.environment = 99;
    expect(ledger.live.environment).toBe(1);
    expect(new SpawnStatistics().snapshot().spawned).toEqual({ natural: 0, fragmentation: 0, baggedWaste: 0, environment: 0, benchmark: 0 });
  });
});
