export const spawnOrigins = ["natural", "fragmentation", "baggedWaste", "environment", "benchmark"] as const;
export type SpawnOrigin = (typeof spawnOrigins)[number];
export type SpawnCounts = Record<SpawnOrigin, number>;
const zeroCounts = (): SpawnCounts => ({ natural: 0, fragmentation: 0, baggedWaste: 0, environment: 0, benchmark: 0 });

/** Account at successful creation/removal, never by scanning the population. */
export class SpawnStatistics {
  readonly live = zeroCounts();
  readonly spawned = zeroCounts();
  private readonly actors = new Map<string, SpawnOrigin>();

  add(id: string, origin: SpawnOrigin): void {
    if (this.actors.has(id)) return;
    this.actors.set(id, origin);
    this.live[origin] += 1;
    this.spawned[origin] += 1;
  }

  remove(id: string): void {
    const origin = this.actors.get(id);
    if (!origin) return;
    this.actors.delete(id);
    this.live[origin] -= 1;
  }

  snapshot(): Readonly<{ live: SpawnCounts; spawned: SpawnCounts }> {
    return { live: { ...this.live }, spawned: { ...this.spawned } };
  }
}
