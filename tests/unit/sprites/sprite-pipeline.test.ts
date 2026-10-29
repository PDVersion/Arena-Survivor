import { ecoSpriteRecipes } from "../../../scripts/eco-sprite-recipes";
import { describe, expect, it } from "vitest";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildSpriteSheet, readSpritePng, checkSpriteSheet } from "../../../src/game/systems/sprites/sprite-pipeline";

describe("sprite build output", () => {
  it("ships only the selected style2 outputs with exact atlas pixels", async () => {
    const inventory = JSON.parse(await readFile("build/sprites/review/style2/ALL_SPRITES_INVENTORY.json", "utf8"));
    const atlas = await readSpritePng("public/sprites/eco-guardian/atlas.png");
    const metadata = JSON.parse(await readFile("public/sprites/eco-guardian/atlas.json", "utf8"));
    expect(ecoSpriteRecipes).toHaveLength(34);
    expect(atlas.width).toBeLessThanOrEqual(2048);
    expect(atlas.height).toBeLessThanOrEqual(2048);
    expect(Object.keys(metadata.frames)).toHaveLength(ecoSpriteRecipes.reduce((sum, recipe) => sum + recipe.frames, 0));
    for (const recipe of ecoSpriteRecipes) {
      const selected = inventory.find((row: { id: string }) => row.id === recipe.contentId);
      expect((await readFile(recipe.output)).equals(await readFile(`build/sprites/review/style2/${selected.native}`)), recipe.contentId).toBe(true);
      expect((await readFile(recipe.acceptedOutput)).equals(await readFile(recipe.output)), recipe.contentId).toBe(true);
      const sheet = await readSpritePng(recipe.output);
      for (let index = 0; index < recipe.frames; index++) {
        const frame = metadata.frames[`${recipe.textureKey}/${index}`].frame;
        expect([frame.w, frame.h]).toEqual([recipe.frameWidth, recipe.frameHeight]);
        expect(frame.x + frame.w).toBeLessThanOrEqual(atlas.width);
        expect(frame.y + frame.h).toBeLessThanOrEqual(atlas.height);
        for (let y = 0; y < frame.h; y++) {
          const atlasRow = atlas.data.subarray(((frame.y + y) * atlas.width + frame.x) * 4,
            ((frame.y + y) * atlas.width + frame.x + frame.w) * 4);
          const sheetRow = sheet.data.subarray((y * sheet.width + index * frame.w) * 4,
            (y * sheet.width + (index + 1) * frame.w) * 4);
          expect(atlasRow.equals(sheetRow), `${recipe.contentId} frame ${index} row ${y}`).toBe(true);
        }
      }
    }
  });
  it("keeps every accepted sheet within its runtime contract", async () => {
    const definitions = ecoSpriteRecipes;

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
      const source = "build/sprites/review/style2/enemy_swarm_basic.a2.png";
      const output = join(directory, "double.png");
      await buildSpriteSheet({ contentId: "fixture", source, output,
        frameWidth: 128, frameHeight: 128, frames: 4,
        sourceGrid: { left: 0, top: 0, cellWidth: 64, cellHeight: 64 } });
      const before = await readSpritePng(source);
      const after = await readSpritePng(output);
      expect([after.width, after.height]).toEqual([512, 128]);
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
      const source = "build/sprites/review/style2/enemy_swarm_basic.a2.png";
      const base = { contentId: "fixture", source, frameWidth: 32, frameHeight: 32, frames: 4,
        sourceGrid: { left: 0, top: 0, cellWidth: 64, cellHeight: 64 } };
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
      const source = "build/sprites/review/style2/enemy_swarm_basic.a2.png";
      const output = join(directory, "contain.png");
      await buildSpriteSheet({ contentId: "fixture", source, output,
        frameWidth: 64, frameHeight: 64, frames: 1,
        sourceGrid: { left: 0, top: 0, cellWidth: 256, cellHeight: 64, fit: "contain" } });
      const before = await readSpritePng(source), after = await readSpritePng(output);
      for (let y = 0; y < 64; y += 1) {
        for (let x = 0; x < 64; x += 1) {
          const expected = y < 24 || y >= 40 ? 0 : before.data[((y - 24) * 4 * 256 + x * 4) * 4 + 3];
          expect(after.data[(y * 64 + x) * 4 + 3]).toBe(expected);
        }
      }
    } finally { await rm(directory, { recursive: true, force: true }); }
  });

  it("rejects a grid that clips source artwork or changes aspect", async () => {
    const base = { contentId: "fixture", source: "build/sprites/review/style2/enemy_swarm_basic.a2.png",
      output: "/tmp/unused-arena-clipped.png", frameWidth: 32, frameHeight: 32, frames: 4 };
    await expect(buildSpriteSheet({ ...base,
      sourceGrid: { left: 0, top: 0, cellWidth: 24, cellHeight: 24 } })).rejects.toThrow("clip opaque artwork");
    await expect(buildSpriteSheet({ ...base,
      sourceGrid: { left: 0, top: 0, cellWidth: 32, cellHeight: 31 } })).rejects.toThrow("aspect ratio");
  });
  it("adds explicit virtual margins without wrapping pixels or moving individual poses", async () => {
    const directory = await mkdtemp(join(tmpdir(), "arena-sprite-padding-"));
    try {
      const source = "build/sprites/review/style2/enemy_swarm_basic.a2.png";
      const recipe = { contentId: "fixture", source, output: join(directory, "padded.png"),
        frameWidth: 68, frameHeight: 64, frames: 4,
        sourceGrid: { left: -8, top: 0, cellWidth: 68, cellHeight: 64, allowTransparentPadding: true } };
      await buildSpriteSheet(recipe);
      const before = await readSpritePng(source), after = await readSpritePng(recipe.output);
      for (let y = 0; y < 64; y++) for (let x = 0; x < 272; x++) {
        expect(after.data[(y * 272 + x) * 4 + 3]).toBe(x < 8 || x >= 264 ? 0 : before.data[(y * 256 + x - 8) * 4 + 3]);
      }
      await expect(buildSpriteSheet({ ...recipe, sourceGrid: { ...recipe.sourceGrid, allowTransparentPadding: false } })).rejects.toThrow("outside the image");
      await expect(buildSpriteSheet({ ...recipe, sourceGrid: { ...recipe.sourceGrid, cellWidth: 24 } })).rejects.toThrow();
    } finally { await rm(directory, { recursive: true, force: true }); }
  });

});
