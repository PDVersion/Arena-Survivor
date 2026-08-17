export interface SpatialPoint {
  readonly x: number;
  readonly y: number;
}

/**
 * A uniform grid over the arena, rebuilt once per frame.
 *
 * Crowd separation, explosion radius queries, and pickup magnetism all need
 * "what is near this point", and each was previously an O(n) scan that also
 * allocated a fresh array of every live enemy. One shared index answers all of
 * them with bounded neighbourhood lookups and no per-query allocation.
 *
 * Queries visit through a callback rather than returning an array, because at
 * 300 enemies with chained explosions the allocation was a larger cost than the
 * comparisons.
 */
export class SpatialHash<T extends SpatialPoint> {
  private readonly cells = new Map<number, T[]>();
  private readonly free: T[][] = [];
  private count = 0;

  constructor(private readonly cellSize = 64) {
    if (!Number.isFinite(cellSize) || cellSize <= 0) {
      throw new Error("Cell size must be greater than zero");
    }
  }

  get size(): number {
    return this.count;
  }

  /** Retains bucket arrays for reuse so a per-frame rebuild does not allocate. */
  clear(): void {
    for (const bucket of this.cells.values()) {
      bucket.length = 0;
      this.free.push(bucket);
    }
    this.cells.clear();
    this.count = 0;
  }

  insert(item: T): void {
    const key = this.key(this.cellIndex(item.x), this.cellIndex(item.y));
    let bucket = this.cells.get(key);
    if (!bucket) {
      bucket = this.free.pop() ?? [];
      this.cells.set(key, bucket);
    }
    bucket.push(item);
    this.count += 1;
  }

  /**
   * Visit every item whose cell overlaps the query circle.
   *
   * Cell membership is coarse, so callers still test exact distance. Returns
   * the number of items visited, which is the per-frame cost signal exposed in
   * telemetry.
   */
  forEachWithin(x: number, y: number, radius: number, visit: (item: T) => void): number {
    const reach = Math.max(0, radius);
    const minX = this.cellIndex(x - reach);
    const maxX = this.cellIndex(x + reach);
    const minY = this.cellIndex(y - reach);
    const maxY = this.cellIndex(y + reach);
    let visited = 0;

    for (let cellX = minX; cellX <= maxX; cellX += 1) {
      for (let cellY = minY; cellY <= maxY; cellY += 1) {
        const bucket = this.cells.get(this.key(cellX, cellY));
        if (!bucket) continue;
        for (const item of bucket) {
          visited += 1;
          visit(item);
        }
      }
    }
    return visited;
  }

  private cellIndex(value: number): number {
    return Math.floor(value / this.cellSize);
  }

  /**
   * Cells are offset before packing so negative coordinates — a drifting enemy
   * outside the arena — cannot collide with a positive cell's key.
   */
  private key(cellX: number, cellY: number): number {
    return (cellX + 4096) * 65_536 + (cellY + 4096);
  }
}
