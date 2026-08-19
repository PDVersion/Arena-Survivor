import { describe, expect, it } from "vitest";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import type { ShrinesTuning } from "../../../src/game/core/archetypes/tuning";
import {
  placeShrine,
  scheduleShrineArrivals,
  shrineMarker,
} from "../../../src/game/systems/shrines/shrine-placement";
import { createSeededRandom } from "../../../src/game/systems/upgrades";

const ARENA = { width: 3600, height: 2400 };
const CENTRE = { x: 1800, y: 1200 };
const tuning = ecoGuardianTheme.tuning.shrines;

function distance(
  from: Readonly<{ x: number; y: number }>,
  to: Readonly<{ x: number; y: number }>,
): number {
  return Math.hypot(from.x - to.x, from.y - to.y);
}

/** Place the whole run's worth of shrines from one seed, as the scene does. */
function placeRun(
  shrineTuning: ShrinesTuning = tuning,
  seed = 0x5471_0008,
  player: Readonly<{ x: number; y: number }> = CENTRE,
): { x: number; y: number }[] {
  const random = createSeededRandom(seed);
  const placed: { x: number; y: number }[] = [];
  for (let index = 0; index < shrineTuning.arrivals.length; index += 1) {
    placed.push(placeShrine(shrineTuning, ARENA, player, placed, random));
  }
  return placed;
}

describe("shrine arrivals", () => {
  it("spreads arrivals across the run instead of stacking them at the start", () => {
    const arrivals = scheduleShrineArrivals(tuning, 300_000);

    expect(arrivals).toHaveLength(tuning.arrivals.length);
    expect(arrivals.filter((arrival) => arrival.appearAtMs === 0)).toHaveLength(0);
    // The whole point of the change: no two shrines arrive together, and the
    // last one lands well after the opening.
    const times = arrivals.map((arrival) => arrival.appearAtMs);
    expect(new Set(times).size).toBe(times.length);
    expect(times.at(-1)).toBeGreaterThan(150_000);
  });

  it("is ordered by arrival and restretches with run length", () => {
    const short = scheduleShrineArrivals(tuning, 300_000);
    const long = scheduleShrineArrivals(tuning, 600_000);

    for (let index = 1; index < short.length; index += 1) {
      expect(short[index]!.appearAtMs).toBeGreaterThanOrEqual(short[index - 1]!.appearAtMs);
    }
    // Progress, not minutes: doubling the run doubles every arrival time.
    short.forEach((arrival, index) => {
      expect(long[index]!.appearAtMs).toBeCloseTo(arrival.appearAtMs * 2);
      expect(long[index]!.shrineId).toBe(arrival.shrineId);
    });
  });

  it.each([
    ["eco-guardian", ecoGuardianTheme],
    ["knight-magic", knightMagicTheme],
  ])("keeps every %s arrival inside the run", (_name, theme) => {
    const arrivals = scheduleShrineArrivals(theme.tuning.shrines, 300_000);
    for (const arrival of arrivals) {
      expect(arrival.appearAtMs).toBeGreaterThanOrEqual(0);
      expect(arrival.appearAtMs).toBeLessThan(300_000);
    }
  });

  it("rejects a run with no duration", () => {
    expect(() => scheduleShrineArrivals(tuning, 0)).toThrow(/greater than zero/);
  });
});

describe("shrine placement", () => {
  it("places every shrine at a real walk from the player", () => {
    for (const shrine of placeRun()) {
      expect(distance(shrine, CENTRE)).toBeGreaterThanOrEqual(tuning.minDistanceFromPlayer);
    }
  });

  it("keeps shrines apart and inside the arena", () => {
    const placed = placeRun();
    for (const shrine of placed) {
      expect(shrine.x).toBeGreaterThanOrEqual(tuning.edgeMargin);
      expect(shrine.x).toBeLessThanOrEqual(ARENA.width - tuning.edgeMargin);
      expect(shrine.y).toBeGreaterThanOrEqual(tuning.edgeMargin);
      expect(shrine.y).toBeLessThanOrEqual(ARENA.height - tuning.edgeMargin);
    }
    for (let index = 1; index < placed.length; index += 1) {
      for (let other = 0; other < index; other += 1) {
        expect(distance(placed[index]!, placed[other]!)).toBeGreaterThanOrEqual(
          tuning.minSeparation,
        );
      }
    }
  });

  it("is deterministic for a seed and different across seeds", () => {
    expect(placeRun(tuning, 0x1234_5678)).toEqual(placeRun(tuning, 0x1234_5678));
    expect(placeRun(tuning, 0x1234_5678)).not.toEqual(placeRun(tuning, 0x8765_4321));
  });

  it("still places a shrine when the player is pinned in a corner", () => {
    // Clamping drags candidates back toward a cornered player, so no sample can
    // satisfy every constraint. Placement must still produce a usable point
    // rather than dropping the shrine or looping forever.
    const placed = placeRun(tuning, 0x5471_0008, { x: 0, y: 0 });

    expect(placed).toHaveLength(tuning.arrivals.length);
    for (const shrine of placed) {
      expect(Number.isFinite(shrine.x)).toBe(true);
      expect(Number.isFinite(shrine.y)).toBe(true);
      expect(shrine.x).toBeLessThanOrEqual(ARENA.width - tuning.edgeMargin);
      expect(shrine.y).toBeLessThanOrEqual(ARENA.height - tuning.edgeMargin);
    }
  });

  it("stays inside the view's reach so a shrine is findable", () => {
    // A shrine beyond the far edge would be an unmarked hike; the band is what
    // keeps random placement a traversal decision rather than a search.
    for (const shrine of placeRun()) {
      expect(distance(shrine, CENTRE)).toBeLessThanOrEqual(tuning.maxDistanceFromPlayer);
    }
  });

  it("schedules the surge shrine first, since the run's opening depends on it", () => {
    expect(scheduleShrineArrivals(tuning, 300_000)[0]?.shrineId).toBe(
      archetypeIds.shrine.spawnSurge,
    );
  });
});

describe("off-screen shrine markers", () => {
  // Half the 1600x900 view, less the inset the scene keeps from the edge.
  const HALF_WIDTH = 756;
  const HALF_HEIGHT = 406;

  it("pins the marker to whichever edge the shrine lies past", () => {
    const right = shrineMarker({ x: 1, y: 0 }, HALF_WIDTH, HALF_HEIGHT);
    expect(right.x).toBeCloseTo(HALF_WIDTH);
    expect(right.y).toBeCloseTo(0);
    const up = shrineMarker({ x: 0, y: -1 }, HALF_WIDTH, HALF_HEIGHT);
    expect(up.x).toBeCloseTo(0);
    expect(up.y).toBeCloseTo(-HALF_HEIGHT);
    // A wide view runs out of height first on a diagonal heading.
    const diagonal = shrineMarker({ x: 1000, y: 1000 }, HALF_WIDTH, HALF_HEIGHT);
    expect(diagonal.y).toBeCloseTo(HALF_HEIGHT);
    expect(diagonal.x).toBeCloseTo(HALF_HEIGHT);
  });

  it("points at the shrine rather than at the nearest corner", () => {
    // The marker must lie on the ray from the view centre to the shrine, or it
    // sends the player the wrong way.
    for (const offset of [
      { x: 900, y: 300 },
      { x: -1400, y: 700 },
      { x: 260, y: -1900 },
      { x: -80, y: -2000 },
    ]) {
      const marker = shrineMarker(offset, HALF_WIDTH, HALF_HEIGHT);
      expect(Math.atan2(marker.y, marker.x)).toBeCloseTo(Math.atan2(offset.y, offset.x));
      expect(Math.abs(marker.x)).toBeLessThanOrEqual(HALF_WIDTH + 1e-6);
      expect(Math.abs(marker.y)).toBeLessThanOrEqual(HALF_HEIGHT + 1e-6);
    }
  });

  it("keeps the marker on an edge, never inside the view", () => {
    for (let step = 0; step < 32; step += 1) {
      const angle = (step / 32) * Math.PI * 2;
      const marker = shrineMarker(
        { x: Math.cos(angle) * 3000, y: Math.sin(angle) * 3000 },
        HALF_WIDTH,
        HALF_HEIGHT,
      );
      const onEdge =
        Math.abs(Math.abs(marker.x) - HALF_WIDTH) < 1e-6 ||
        Math.abs(Math.abs(marker.y) - HALF_HEIGHT) < 1e-6;
      expect(onEdge).toBe(true);
    }
  });
});
