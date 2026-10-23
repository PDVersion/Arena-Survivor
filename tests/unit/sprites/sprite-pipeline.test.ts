import { describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildSpriteSheet, readSpritePng, checkSpriteSheet } from "../../../src/game/systems/sprites/sprite-pipeline";

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
        source: "build/sprites/raw/enemy_fast_fragile.a3.png",
        output: "public/sprites/eco-guardian/enemy_fast_fragile.png",
        frameWidth: 24,
        frameHeight: 24,
        frames: 4,
        palette: [
          ["#172d5f", "#64748b", "#e2e8f0", "#f8fafc"],
          ["#7f1d1d", "#b91c1c", "#ef4444", "#fca5a5"],
          ["#173b73", "#356fae", "#2563eb", "#93c5fd"],
          ["#713f12", "#b7791f", "#facc15", "#fde68a"],
        ],
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
      {
        contentId: "character.starter",
        source: "build/sprites/raw/character_starter.a2.png",
        output: "public/sprites/eco-guardian/character_starter.png",
        frameWidth: 48,
        frameHeight: 48,
        frames: 8,
        palette: [
          ["#14532d", "#22a34e", "#4ade80", "#8df0ac"],
          ["#111827", "#374151", "#6b7280", "#d1d5db"],
          ["#713f12", "#b7791f", "#fde047", "#fef08a"],
          ["#7c2d12", "#c65d1a", "#fb923c", "#fdba74"],
        ],
        outline: "#14532d",
      },
    ] as const;

    const issues = (await Promise.all(definitions.map(checkSpriteSheet))).flat();
    expect(issues).toEqual([]);
  });
});

// A fixed source-cell transform must preserve different pose offsets, including
// intentional transparent margins; fitting individual silhouettes would break this.
describe("fixed-grid review conversion", () => {
  it("doubles every source alpha pixel without recentering any pose", async () => {
    const directory = await mkdtemp(join(tmpdir(), "arena-sprite-grid-"));
    try {
      const source = "build/sprites/accepted/enemy_swarm_basic.png";
      const output = join(directory, "double.png");
      await buildSpriteSheet({ contentId: "fixture", source, output,
        frameWidth: 64, frameHeight: 64, frames: 4,
        sourceGrid: { left: 0, top: 0, cellWidth: 32, cellHeight: 32 } });
      const before = await readSpritePng(source);
      const after = await readSpritePng(output);
      expect([after.width, after.height]).toEqual([256, 64]);
      for (let y = 0; y < after.height; y += 1) {
        for (let x = 0; x < after.width; x += 1) {
          expect(after.data[(y * after.width + x) * 4 + 3]).toBe(
            before.data[(Math.floor(y / 2) * before.width + Math.floor(x / 2)) * 4 + 3],
          );
        }
      }
    } finally { await rm(directory, { recursive: true, force: true }); }
  });

  it("thickens the internal outline without growing or erasing the silhouette", async () => {
    const directory = await mkdtemp(join(tmpdir(), "arena-sprite-outline-"));
    try {
      const source = "build/sprites/accepted/enemy_swarm_basic.png";
      const base = { contentId: "fixture", source, frameWidth: 32, frameHeight: 32, frames: 4,
        sourceGrid: { left: 0, top: 0, cellWidth: 32, cellHeight: 32 } };
      const first = join(directory, "one.png"), second = join(directory, "two.png");
      await buildSpriteSheet({ ...base, output: first, outlineWidth: 1 });
      await buildSpriteSheet({ ...base, output: second, outlineWidth: 2 });
      const one = await readSpritePng(first), two = await readSpritePng(second);
      let oneOutline = 0, twoOutline = 0;
      for (let i = 0; i < one.data.length; i += 4) {
        expect(two.data[i + 3]).toBe(one.data[i + 3]);
        if (one.data[i] === 23 && one.data[i + 1] === 59 && one.data[i + 2] === 115) oneOutline += 1;
        if (two.data[i] === 23 && two.data[i + 1] === 59 && two.data[i + 2] === 115) twoOutline += 1;
      }
      expect(twoOutline).toBeGreaterThan(oneOutline);
    } finally { await rm(directory, { recursive: true, force: true }); }
  });

  it("letterboxes an explicit rectangular grid with one uniform transform", async () => {
    const directory = await mkdtemp(join(tmpdir(), "arena-sprite-contain-"));
    try {
      const source = "build/sprites/accepted/enemy_swarm_basic.png";
      const output = join(directory, "contain.png");
      await buildSpriteSheet({ contentId: "fixture", source, output,
        frameWidth: 64, frameHeight: 64, frames: 1,
        sourceGrid: { left: 0, top: 0, cellWidth: 128, cellHeight: 32, fit: "contain" } });
      const before = await readSpritePng(source), after = await readSpritePng(output);
      for (let y = 0; y < 64; y += 1) {
        for (let x = 0; x < 64; x += 1) {
          const expected = y < 24 || y >= 40 ? 0 : before.data[((y - 24) * 2 * 128 + x * 2) * 4 + 3];
          expect(after.data[(y * 64 + x) * 4 + 3]).toBe(expected);
        }
      }
    } finally { await rm(directory, { recursive: true, force: true }); }
  });

  it("rejects a grid that clips source artwork or changes aspect", async () => {
    const base = { contentId: "fixture", source: "build/sprites/accepted/enemy_swarm_basic.png",
      output: "/tmp/unused-arena-clipped.png", frameWidth: 32, frameHeight: 32, frames: 4 };
    await expect(buildSpriteSheet({ ...base,
      sourceGrid: { left: 0, top: 0, cellWidth: 24, cellHeight: 24 } })).rejects.toThrow("clip opaque artwork");
    await expect(buildSpriteSheet({ ...base,
      sourceGrid: { left: 0, top: 0, cellWidth: 32, cellHeight: 31 } })).rejects.toThrow("aspect ratio");
  });
});
