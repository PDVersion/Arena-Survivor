import { describe, expect, it } from "vitest";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import {
  activateShrineSurge,
  createShrineSurgeState,
  updateShrineSurge,
} from "../../../src/game/systems/shrine-surge";

const shrine = knightMagicTheme.shrines[0];
if (!shrine) throw new Error("Missing shrine fixture");

describe("spawn surge shrine", () => {
  it("activates only once and schedules exactly 100 enemies over 20 seconds", () => {
    const active = activateShrineSurge(createShrineSurgeState(), 1_000);
    expect(activateShrineSurge(active, 2_000)).toBe(active);
    expect(updateShrineSurge(active, shrine, 1_000, 80)).toMatchObject({
      spawnNow: 0,
      state: { scheduled: 0, spawned: 0, active: true },
    });
    expect(updateShrineSurge(active, shrine, 21_000, 100)).toMatchObject({
      spawnNow: 100,
      state: { scheduled: 100, spawned: 100, active: false },
    });
  });

  it("retains due spawn backlog when the live cap applies", () => {
    const active = activateShrineSurge(createShrineSurgeState(), 0);
    const blocked = updateShrineSurge(active, shrine, 1_000, 0);
    expect(blocked).toMatchObject({ spawnNow: 0, state: { scheduled: 5, spawned: 0 } });

    expect(updateShrineSurge(blocked.state, shrine, 1_200, 3)).toMatchObject({
      spawnNow: 3,
      state: { scheduled: 6, spawned: 3, active: true },
    });
  });

  it("owns the explicit reward multiplier in theme data", () => {
    expect(shrine).toMatchObject({
      id: "shrine.spawn_surge",
      spawnCount: 100,
      spawnDurationMs: 20_000,
      rewardMultiplier: 1.5,
    });
  });
});
