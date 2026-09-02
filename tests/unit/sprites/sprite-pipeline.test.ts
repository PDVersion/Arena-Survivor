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
      {
        contentId: "enemy.slow_durable",
        source: "build/sprites/raw/enemy_slow_durable.a2.png",
        output: "public/sprites/eco-guardian/enemy_slow_durable.png",
        frameWidth: 48,
        frameHeight: 48,
        frames: 4,
        palette: [["#0f4f52", "#169b91", "#2dd4bf", "#82eadc"]],
        outline: "#0f4f52",
      },
      {
        contentId: "enemy.death_spawner",
        source: "build/sprites/raw/enemy_death_spawner.a2.png",
        output: "public/sprites/eco-guardian/enemy_death_spawner.png",
        frameWidth: 48,
        frameHeight: 48,
        frames: 4,
        palette: [
          ["#3b1762", "#8050bd", "#c084fc", "#dcb5fd"],
          ["#374151", "#6b7280", "#d1d5db", "#f8fafc"],
          ["#3f4b26", "#68753b", "#91a657", "#c0d187"],
          ["#713f12", "#b7791f", "#fb923c", "#fdba74"],
        ],
        outline: "#3b1762",
      },
    ] as const;

    const issues = (await Promise.all(definitions.map(checkSpriteSheet))).flat();
    expect(issues).toEqual([]);
  });
});
