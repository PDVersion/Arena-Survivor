import { describe, expect, it } from "vitest";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import type { HazardDefinition } from "../../../src/game/core/archetypes/contracts";
import {
  avoidObstacle,
  hazardIntervalMs,
  hazardPhase,
  isInsideHazard,
  resolveHazardEffect,
  selectHazard,
  type HazardState,
} from "../../../src/game/systems/hazards/hazards";
import { createSeededRandom } from "../../../src/game/systems/upgrades";

const tuning = ecoGuardianTheme.tuning.hazards;

function definition(id: string): HazardDefinition {
  const found = ecoGuardianTheme.hazards.find((hazard) => hazard.id === id);
  if (!found) throw new Error(`Missing hazard ${id}`);
  return found;
}

function stateFor(hazard: HazardDefinition, spawnedAtMs = 0): HazardState {
  return {
    id: "hazard-1",
    definitionId: hazard.id,
    x: 100,
    y: 100,
    radius: hazard.radius,
    spawnedAtMs,
    health: hazard.kind === "obstacle" ? hazard.health : 0,
    nextTickAtMs: spawnedAtMs + hazard.telegraphMs,
  };
}

const player = { x: 100, y: 100, radius: 18 };
const distant = { x: 5_000, y: 5_000, radius: 18 };

describe("hazard placement cadence", () => {
  it("tightens with run progress and never passes its floor", () => {
    expect(hazardIntervalMs(tuning, 0)).toBeCloseTo(tuning.baseIntervalMs);
    expect(hazardIntervalMs(tuning, 1)).toBeLessThan(hazardIntervalMs(tuning, 0));
    expect(hazardIntervalMs(tuning, 50)).toBe(tuning.minIntervalMs);
  });

  it("tightens further under Chaos pressure", () => {
    expect(hazardIntervalMs(tuning, 0.5, 4)).toBeLessThan(hazardIntervalMs(tuning, 0.5, 0));
  });

  it("selects deterministically and only from declared hazards", () => {
    const declared = new Set(ecoGuardianTheme.hazards.map((hazard) => hazard.id));
    const first = createSeededRandom(0x77);
    const second = createSeededRandom(0x77);
    for (let index = 0; index < 50; index += 1) {
      const choice = selectHazard(tuning, first);
      expect(declared.has(choice!)).toBe(true);
      expect(choice).toBe(selectHazard(tuning, second));
    }
  });
});

describe("hazard lifecycle", () => {
  it("telegraphs before it can hurt anything", () => {
    const zone = definition(archetypeIds.hazard.damageZone);
    const state = stateFor(zone);

    expect(hazardPhase(zone, state, 0)).toBe("telegraphing");
    expect(hazardPhase(zone, state, zone.telegraphMs - 1)).toBe("telegraphing");
    // Harmless while warning, which is the whole point of the warning.
    expect(resolveHazardEffect(zone, state, player, 10)).toEqual({ damage: 0, moveMultiplier: 1 });
    expect(hazardPhase(zone, state, zone.telegraphMs)).toBe("active");
  });

  it("expires after its lifetime", () => {
    const zone = definition(archetypeIds.hazard.damageZone);
    const state = stateFor(zone);
    const end = zone.telegraphMs + (zone.kind === "damage_zone" ? zone.lifetimeMs : 0);

    expect(hazardPhase(zone, state, end - 1)).toBe("active");
    expect(hazardPhase(zone, state, end)).toBe("expired");
    expect(resolveHazardEffect(zone, state, player, end + 100).damage).toBe(0);
  });

  it("keeps an obstacle alive until it is cleared, not until a timer runs out", () => {
    const obstacle = definition(archetypeIds.hazard.obstacle);
    const state = stateFor(obstacle);

    expect(hazardPhase(obstacle, state, 1_000_000)).toBe("active");
    state.health = 0;
    expect(hazardPhase(obstacle, state, obstacle.telegraphMs + 1)).toBe("expired");
  });
});

describe("hazard effects", () => {
  it("damages on a tick cadence rather than every frame", () => {
    const zone = definition(archetypeIds.hazard.damageZone);
    if (zone.kind !== "damage_zone") throw new Error("wrong kind");
    const state = stateFor(zone);
    const start = zone.telegraphMs;

    expect(resolveHazardEffect(zone, state, player, start).damage).toBe(zone.damage);
    // Immediately after a tick the zone still slows but does not damage again.
    const between = resolveHazardEffect(zone, state, player, start + 1);
    expect(between.damage).toBe(0);
    expect(between.moveMultiplier).toBe(zone.slowMultiplier);
    expect(resolveHazardEffect(zone, state, player, start + zone.tickMs).damage).toBe(zone.damage);
  });

  it("only affects what is standing in it", () => {
    const zone = definition(archetypeIds.hazard.damageZone);
    const state = stateFor(zone);
    expect(resolveHazardEffect(zone, state, distant, zone.telegraphMs)).toEqual({
      damage: 0,
      moveMultiplier: 1,
    });
  });

  it("never damages through an obstacle, which only blocks", () => {
    const obstacle = definition(archetypeIds.hazard.obstacle);
    const state = stateFor(obstacle);
    expect(resolveHazardEffect(obstacle, state, player, obstacle.telegraphMs + 5_000).damage).toBe(0);
  });

  it("bursts on a cycle and is harmless between bursts", () => {
    const vent = definition(archetypeIds.hazard.periodicBurst);
    if (vent.kind !== "periodic_burst") throw new Error("wrong kind");
    const state = stateFor(vent);
    const start = vent.telegraphMs;

    expect(resolveHazardEffect(vent, state, player, start).damage).toBe(vent.damage);
    expect(resolveHazardEffect(vent, state, player, start + 1).damage).toBe(0);
    expect(resolveHazardEffect(vent, state, player, start + vent.cycleMs).damage).toBe(vent.damage);
  });

  it("accounts for the target's radius when testing containment", () => {
    const zone = definition(archetypeIds.hazard.damageZone);
    const state = stateFor(zone);
    const grazing = { x: 100 + zone.radius + 10, y: 100, radius: 18 };

    expect(isInsideHazard(state, grazing, 0)).toBe(false);
    expect(isInsideHazard(state, grazing, grazing.radius)).toBe(true);
  });
});

describe("obstacle avoidance", () => {
  // Steering ramps in from zero at twice the clearance, so a test at exactly
  // that distance would correctly see no adjustment.
  const obstacle = { x: 60, y: 0, radius: 40 };

  it("steers a chaser heading straight into an obstacle", () => {
    const desired = { x: 100, y: 0 };
    const steered = avoidObstacle({ x: 0, y: 0 }, desired, obstacle, 10);

    expect(Math.abs(steered.y)).toBeGreaterThan(0);
    // Speed is preserved; only heading changes.
    expect(Math.hypot(steered.x, steered.y)).toBeCloseTo(Math.hypot(desired.x, desired.y));
  });

  it("leaves a chaser heading away from an obstacle alone", () => {
    const desired = { x: -100, y: 0 };
    expect(avoidObstacle({ x: 0, y: 0 }, desired, obstacle, 10)).toEqual(desired);
  });

  it("ignores obstacles that are far away", () => {
    const desired = { x: 100, y: 0 };
    const far = { x: 5_000, y: 0, radius: 40 };
    expect(avoidObstacle({ x: 0, y: 0 }, desired, far, 10)).toEqual(desired);
  });

  it("is safe for a stationary body or a coincident obstacle", () => {
    expect(avoidObstacle({ x: 0, y: 0 }, { x: 0, y: 0 }, obstacle, 10)).toEqual({ x: 0, y: 0 });
    expect(
      avoidObstacle({ x: 100, y: 0 }, { x: 10, y: 0 }, { x: 100, y: 0, radius: 40 }, 10),
    ).toEqual({ x: 10, y: 0 });
  });
});

describe("hazard content", () => {
  it.each([
    ["eco-guardian", ecoGuardianTheme],
    ["knight-magic", knightMagicTheme],
  ])("gives every %s hazard a warning before it can hurt", (_name, theme) => {
    for (const hazard of theme.hazards) {
      expect(hazard.telegraphMs).toBeGreaterThan(0);
      expect(hazard.radius).toBeGreaterThan(0);
    }
    expect(theme.hazards).toHaveLength(3);
  });

  it.each([
    ["eco-guardian", ecoGuardianTheme],
    ["knight-magic", knightMagicTheme],
  ])("never places a %s hazard on top of the player", (_name, theme) => {
    const largest = Math.max(...theme.hazards.map((hazard) => hazard.radius));
    // Placement distance must clear the biggest hazard, or one could appear
    // already covering the player with no chance to move.
    expect(theme.tuning.hazards.minDistanceFromPlayer).toBeGreaterThan(largest);
  });
});
