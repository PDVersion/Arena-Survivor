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
    const currentShrine = knightMagicTheme.copy.content[archetypeIds.shrine.spawnSurge];
    const alternateShrine = alternateTheme.copy.content[archetypeIds.shrine.spawnSurge];

    expect(current.name).not.toBe(alternate.name);
    expect(knightMagicTheme.tokens.palette.player).not.toBe(alternateTheme.tokens.palette.player);
    expect(knightMagicTheme.characters[0]?.id).toBe(alternateTheme.characters[0]?.id);
    expect(knightMagicTheme.characters[0]?.radius).toBe(alternateTheme.characters[0]?.radius);
    expect(knightMagicTheme.weapons).toEqual(alternateTheme.weapons);
    expect(knightMagicTheme.enemies).toEqual(alternateTheme.enemies);
    expect(knightMagicTheme.shrines).toEqual(alternateTheme.shrines);
    expect(knightMagicTheme.copy.vocabulary.health).not.toBe(alternateTheme.copy.vocabulary.health);
    expect(currentShrine.name).not.toBe(alternateShrine.name);
  });

  it("requires complete theme-owned HUD and ending vocabulary", () => {
    const invalid = {
      ...alternateTheme,
      copy: {
        ...alternateTheme.copy,
        vocabulary: { ...alternateTheme.copy.vocabulary, health: "", completeTitle: "" },
      },
    } as unknown as ThemeManifest;

    expect(validateTheme(invalid)).toEqual(
      expect.arrayContaining([
        "vocabulary.health is required",
        "vocabulary.completeTitle is required",
      ]),
    );
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
      pickups: undefined,
      upgrades: undefined,
      shrines: undefined,
    } as unknown as ThemeManifest;

    expect(validateTheme(invalid)).toEqual(
      expect.arrayContaining([
        "weapons registry is required",
        `missing required weapon: ${archetypeIds.weapon.starterProjectile}`,
        "enemies registry is required",
        `missing required enemy: ${archetypeIds.enemy.swarmBasic}`,
        "pickups registry is required",
        `missing required pickup: ${archetypeIds.pickup.experience}`,
        "upgrades registry is required",
        `missing required upgrade: ${archetypeIds.upgrade.damage}`,
        "shrines registry is required",
        `missing required shrine: ${archetypeIds.shrine.spawnSurge}`,
      ]),
    );
  });

  it("reports malformed progression registries and unsupported effects", () => {
    const pickup = alternateTheme.pickups[0];
    const upgrade = alternateTheme.upgrades[0];
    if (!pickup || !upgrade) throw new Error("Missing alternate progression fixture");
    const invalid = {
      ...alternateTheme,
      pickups: [pickup, { ...pickup, radius: 0 }],
      upgrades: [
        ...alternateTheme.upgrades,
        {
          ...upgrade,
          effects: [{ kind: "unsupported", target: "player.damageBonus", value: 0 }],
        },
      ],
    } as unknown as ThemeManifest;

    expect(validateTheme(invalid)).toEqual(
      expect.arrayContaining([
        `duplicate pickup id: ${archetypeIds.pickup.experience}`,
        `${archetypeIds.pickup.experience} radius must be greater than zero`,
        `duplicate upgrade id: ${archetypeIds.upgrade.damage}`,
        `${archetypeIds.upgrade.damage} has unsupported effect kind: unsupported`,
      ]),
    );
  });

  it("reports duplicate and invalid shrine definitions", () => {
    const shrine = alternateTheme.shrines[0];
    if (!shrine) throw new Error("Missing alternate shrine fixture");
    const invalid = {
      ...alternateTheme,
      shrines: [
        shrine,
        {
          ...shrine,
          interactionRadius: 0,
          spawnCount: 0,
          spawnDurationMs: 0,
          rewardMultiplier: 1,
          presentationToken: "missing",
        },
      ],
    } as unknown as ThemeManifest;

    expect(validateTheme(invalid)).toEqual(
      expect.arrayContaining([
        `duplicate shrine id: ${archetypeIds.shrine.spawnSurge}`,
        `${archetypeIds.shrine.spawnSurge} interactionRadius must exceed its radius`,
        `${archetypeIds.shrine.spawnSurge} spawnCount must be a positive integer`,
        `${archetypeIds.shrine.spawnSurge} spawnDurationMs must be greater than zero`,
        `${archetypeIds.shrine.spawnSurge} rewardMultiplier must be greater than one`,
        `${archetypeIds.shrine.spawnSurge} references missing presentation token: missing`,
      ]),
    );
  });
});
