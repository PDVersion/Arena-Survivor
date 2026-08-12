import { describe, expect, it } from "vitest";
import { archetypeIds, v01ContentIds } from "../../../src/game/core/archetypes/ids";
import type { ThemeManifest } from "../../../src/game/core/archetypes/contracts";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { validateTheme } from "../../../src/game/content/define-theme";
import { alternateTheme } from "../../fixtures/alternate-theme";

describe("theme manifests", () => {
  it.each([
    ["knight-magic", knightMagicTheme],
    ["alternate", alternateTheme],
  ])("validates the %s manifest", (_name, theme) => {
    expect(validateTheme(theme)).toEqual([]);
    expect(Object.keys(theme.copy.content)).toEqual(expect.arrayContaining(v01ContentIds));
  });

  it("changes presentation without changing the stable starter role", () => {
    const current = knightMagicTheme.copy.content[archetypeIds.character.starter];
    const alternate = alternateTheme.copy.content[archetypeIds.character.starter];

    expect(current.name).not.toBe(alternate.name);
    expect(knightMagicTheme.tokens.palette.player).not.toBe(alternateTheme.tokens.palette.player);
    expect(knightMagicTheme.characters[0]?.id).toBe(alternateTheme.characters[0]?.id);
    expect(knightMagicTheme.characters[0]?.radius).toBe(alternateTheme.characters[0]?.radius);
    expect(knightMagicTheme.weapons).toEqual(alternateTheme.weapons);
    expect(knightMagicTheme.enemies).toEqual(alternateTheme.enemies);
  });

  it("reports missing copy, duplicate IDs, bad values, and broken tokens", () => {
    const invalid = {
      ...alternateTheme,
      copy: {
        ...alternateTheme.copy,
        content: {
          ...alternateTheme.copy.content,
          [archetypeIds.enemy.swarmBasic]: { name: "", description: "" },
        },
      },
      characters: [
        ...alternateTheme.characters,
        {
          id: archetypeIds.character.starter,
          radius: 0,
          presentationToken: "missing",
        },
      ],
    } as unknown as ThemeManifest;

    expect(validateTheme(invalid)).toEqual(
      expect.arrayContaining([
        `${archetypeIds.enemy.swarmBasic} name is required`,
        `${archetypeIds.enemy.swarmBasic} description is required`,
        `duplicate character id: ${archetypeIds.character.starter}`,
        `${archetypeIds.character.starter} radius must be greater than zero`,
        `${archetypeIds.character.starter} references missing presentation token: missing`,
        `${archetypeIds.character.starter} baseStats are required`,
      ]),
    );
  });

  it("reports duplicate and invalid combat definitions", () => {
    const weapon = alternateTheme.weapons[0];
    const enemy = alternateTheme.enemies[0];
    if (!weapon || !enemy) throw new Error("Missing alternate combat fixture");
    const invalid = {
      ...alternateTheme,
      weapons: [weapon, { ...weapon, damage: 0, pierce: -1 }],
      enemies: [enemy, { ...enemy, maxHealth: 0, radius: 0 }],
    } as unknown as ThemeManifest;

    expect(validateTheme(invalid)).toEqual(
      expect.arrayContaining([
        `duplicate weapon id: ${archetypeIds.weapon.starterProjectile}`,
        `${archetypeIds.weapon.starterProjectile} damage must be greater than zero`,
        `${archetypeIds.weapon.starterProjectile} pierce must be a non-negative integer`,
        `duplicate enemy id: ${archetypeIds.enemy.swarmBasic}`,
        `${archetypeIds.enemy.swarmBasic} maxHealth must be greater than zero`,
        `${archetypeIds.enemy.swarmBasic} radius must be greater than zero`,
      ]),
    );
  });

  it("reports missing combat registries without throwing", () => {
    const invalid = {
      ...alternateTheme,
      weapons: undefined,
      enemies: undefined,
    } as unknown as ThemeManifest;

    expect(validateTheme(invalid)).toEqual(
      expect.arrayContaining([
        "weapons registry is required",
        `missing required weapon: ${archetypeIds.weapon.starterProjectile}`,
        "enemies registry is required",
        `missing required enemy: ${archetypeIds.enemy.swarmBasic}`,
      ]),
    );
  });
});
