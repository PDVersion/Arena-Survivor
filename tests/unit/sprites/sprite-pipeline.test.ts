import { describe, expect, it } from "vitest";
import { checkSpriteSheet } from "../../../src/game/systems/sprites/sprite-pipeline";

describe("sprite build output", () => {
  it("keeps every accepted sheet within its runtime contract", async () => {
    const definitions = [
      {
        contentId: "enemy.swarm_basic",
        source: "build/sprites/raw/enemy_swarm_basic.a1.png",
        output: "public/sprites/eco-guardian/enemy_swarm_basic.png",
        frameWidth: 32,
        frameHeight: 32,
        frames: 4,
      },
      {
        contentId: "enemy.fast_fragile",
        source: "build/sprites/raw/enemy_fast_fragile.a2.png",
        output: "public/sprites/eco-guardian/enemy_fast_fragile.png",
        frameWidth: 24,
        frameHeight: 24,
        frames: 4,
        palette: [["#172d5f", "#94a3b8", "#e2e8f0", "#f8fafc"]],
        outline: "#172d5f",
      },
    ] as const;

    const issues = (await Promise.all(definitions.map(checkSpriteSheet))).flat();
    expect(issues).toEqual([]);
  });
});
