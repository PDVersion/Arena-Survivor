import { describe, expect, it } from "vitest";
import { checkSpriteSheet } from "../../../src/game/systems/sprites/sprite-pipeline";

describe("sprite build output", () => {
  it("keeps the Plastic Bottle review sheet within its runtime contract", async () => {
    await expect(
      checkSpriteSheet({
        contentId: "enemy.swarm_basic",
        source: "build/sprites/raw/enemy_swarm_basic.a1.png",
        output: "public/sprites/eco-guardian/enemy_swarm_basic.png",
        frameWidth: 32,
        frameHeight: 32,
        frames: 4,
      }),
    ).resolves.toEqual([]);
  });
});
