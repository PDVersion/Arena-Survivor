import { describe, expect, it } from "vitest";
import { SpatialHash } from "../../../src/game/systems/spatial/spatial-hash";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";

interface Item {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}

function collect(hash: SpatialHash<Item>, x: number, y: number, radius: number): string[] {
  const found: string[] = [];
  hash.forEachWithin(x, y, radius, (item) => {
    if (Math.hypot(item.x - x, item.y - y) <= radius) found.push(item.id);
  });
  return found.sort();
}

describe("spatial hash", () => {
  it("finds items within a radius and excludes those outside", () => {
    const hash = new SpatialHash<Item>(64);
    hash.insert({ id: "near", x: 105, y: 100 });
    hash.insert({ id: "edge", x: 190, y: 100 });
    hash.insert({ id: "far", x: 900, y: 900 });

    expect(collect(hash, 100, 100, 60)).toEqual(["near"]);
    expect(collect(hash, 100, 100, 200)).toEqual(["edge", "near"]);
  });

  it("visits every candidate whose cell overlaps, so callers can test exactly", () => {
    const hash = new SpatialHash<Item>(64);
    hash.insert({ id: "corner", x: 63, y: 63 });

    // Cell membership is coarse by design: the item is visited even though it
    // sits outside the exact circle, and the caller rejects it.
    let visited = 0;
    hash.forEachWithin(0, 0, 10, () => { visited += 1; });
    expect(visited).toBe(1);
    expect(collect(hash, 0, 0, 10)).toEqual([]);
  });

  it("handles negative coordinates without key collisions", () => {
    // A drifting enemy can leave the arena, so negative cells must not alias
    // onto positive ones.
    const hash = new SpatialHash<Item>(64);
    hash.insert({ id: "negative", x: -500, y: -500 });
    hash.insert({ id: "positive", x: 500, y: 500 });

    expect(collect(hash, -500, -500, 20)).toEqual(["negative"]);
    expect(collect(hash, 500, 500, 20)).toEqual(["positive"]);
  });

  it("clears fully and reports its size", () => {
    const hash = new SpatialHash<Item>(64);
    hash.insert({ id: "a", x: 10, y: 10 });
    hash.insert({ id: "b", x: 20, y: 20 });
    expect(hash.size).toBe(2);

    hash.clear();
    expect(hash.size).toBe(0);
    expect(collect(hash, 10, 10, 100)).toEqual([]);
  });

  it("stays correct across repeated rebuilds, since buckets are pooled", () => {
    const hash = new SpatialHash<Item>(64);
    for (let frame = 0; frame < 5; frame += 1) {
      hash.clear();
      hash.insert({ id: `f${frame}`, x: frame * 100, y: 0 });
      expect(collect(hash, frame * 100, 0, 10)).toEqual([`f${frame}`]);
      expect(hash.size).toBe(1);
    }
  });

  it("rejects a non-positive cell size", () => {
    expect(() => new SpatialHash<Item>(0)).toThrow(/greater than zero/);
    expect(() => new SpatialHash<Item>(-5)).toThrow(/greater than zero/);
  });

  it("returns a bounded candidate count for a local query in a dense field", () => {
    const hash = new SpatialHash<Item>(64);
    for (let index = 0; index < 300; index += 1) {
      hash.insert({ id: `e${index}`, x: (index % 30) * 60, y: Math.floor(index / 30) * 60 });
    }

    // The point of the index: a local query must not touch the whole swarm.
    const visited = hash.forEachWithin(100, 100, 64, () => {});
    expect(visited).toBeLessThan(60);
    expect(hash.size).toBe(300);
  });
});

describe("body tuning", () => {
  it.each([
    ["eco-guardian", ecoGuardianTheme],
    ["knight-magic", knightMagicTheme],
  ])("gives every %s role a body with room to bunch", (_name, theme) => {
    for (const enemy of theme.enemies) {
      const role = theme.tuning.bodies.roles.find((entry) => entry.enemyId === enemy.id);
      expect(role).toBeDefined();
      expect(role!.separationScale).toBeGreaterThan(0);
      expect(role!.separationScale).toBeLessThanOrEqual(1);
      expect(role!.mass).toBeGreaterThan(0);
    }
  });

  it.each([
    ["eco-guardian", ecoGuardianTheme],
    ["knight-magic", knightMagicTheme],
  ])("keeps %s small roles softer than large ones", (_name, theme) => {
    const byId = new Map(theme.tuning.bodies.roles.map((role) => [role.enemyId, role]));
    const enemies = new Map(theme.enemies.map((enemy) => [enemy.id, enemy]));

    const sorted = [...byId.values()].sort(
      (left, right) => enemies.get(left.enemyId)!.radius - enemies.get(right.enemyId)!.radius,
    );

    // Smallest role overlaps most; largest holds its ground and is solid.
    expect(sorted[0]!.separationScale).toBeLessThan(sorted.at(-1)!.separationScale);
    expect(sorted[0]!.mass).toBeLessThan(sorted.at(-1)!.mass);
    expect(sorted[0]!.solid).toBe(false);
    expect(sorted.some((role) => role.solid)).toBe(true);
  });

  it.each([
    ["eco-guardian", ecoGuardianTheme],
    ["knight-magic", knightMagicTheme],
  ])("sizes the %s cell above twice the largest body", (_name, theme) => {
    const enemies = new Map(theme.enemies.map((enemy) => [enemy.id, enemy]));
    const largest = Math.max(
      ...theme.tuning.bodies.roles.map(
        (role) => enemies.get(role.enemyId)!.radius * role.separationScale,
      ),
    );

    // A smaller cell would let an overlapping pair land in non-adjacent cells
    // and never be resolved.
    expect(theme.tuning.bodies.cellSize).toBeGreaterThanOrEqual(largest * 2);
  });
});
