import { describe, expect, it } from "vitest";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import { statKeys, worldKeys } from "../../../src/game/core/archetypes/contracts";
import {
  describeUpgrade,
  selectPlayerStats,
  selectWorldLines,
} from "../../../src/game/systems/upgrades/describe-upgrade";
import { applyUpgrade, createWeaponStatModifiers, type UpgradeableState } from "../../../src/game/systems/upgrades";
import { createWorldState } from "../../../src/game/systems/chaos/world-modifiers";
import { skillMaxLevel } from "../../../src/game/systems/skills/resolve-skill";
import {
  createSettings,
  resetSessionSettings,
  toggleSetting,
} from "../../../src/game/state/settings-state";

const theme = ecoGuardianTheme;
const character = theme.characters[0]!;
const weapon = theme.weapons[0]!;

function upgrade(id: string) {
  const found = theme.upgrades.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing upgrade ${id}`);
  return found;
}

function state(overrides: Partial<UpgradeableState> = {}): UpgradeableState {
  return {
    player: { health: character.baseStats.maxHealth, stats: { ...character.baseStats } },
    weaponModifiers: createWeaponStatModifiers(),
    selectedUpgradeIds: [],
    skillLevels: {},
    world: createWorldState(),
    ...overrides,
  };
}

const maxLevelFor = (skillId: Parameters<typeof skillMaxLevel>[1]): number =>
  skillMaxLevel(theme.skills, skillId);

describe("player stat lines", () => {
  it("covers every declared stat key exactly once", () => {
    const lines = selectPlayerStats(state(), theme);
    expect(lines.map((line) => line.key)).toEqual([...statKeys]);
  });

  it("resolves what the player experiences, not the raw stat", () => {
    const boosted = state({
      player: {
        health: character.baseStats.maxHealth,
        stats: { ...character.baseStats, damageBonus: 1, attackSpeedBonus: 1 },
      },
    });
    const lines = selectPlayerStats(boosted, theme);
    const damage = lines.find((line) => line.key === "damage")!;
    const rate = lines.find((line) => line.key === "attackRate")!;

    // Weapon damage after the bonus, and shots per second after attack speed.
    expect(damage.value).toBeCloseTo(weapon.damage * 2);
    expect(rate.value).toBeCloseTo((1000 / weapon.cooldownMs) * 2);
  });

  it("reads the weapon's generic stats so a second weapon needs no new path", () => {
    const lines = selectPlayerStats(state(), theme);
    expect(lines.find((line) => line.key === "range")!.value).toBe(weapon.range);
    expect(lines.find((line) => line.key === "knockback")!.value).toBe(weapon.knockback);
    expect(lines.find((line) => line.key === "armourPierce")!.value).toBe(weapon.armourPierce);
  });

  it("labels every line from theme copy", () => {
    for (const line of selectPlayerStats(state(), theme)) {
      expect(line.label).toBe(theme.copy.stats[line.key]);
      expect(line.label.length).toBeGreaterThan(0);
    }
  });
});

describe("world lines", () => {
  it("covers every declared world key with theme labels", () => {
    const lines = selectWorldLines(createWorldState(), theme);
    expect(lines.map((line) => line.key)).toEqual([...worldKeys]);
    for (const line of lines) expect(line.label).toBe(theme.copy.world[line.key]);
  });

  it("reflects escalation from run progress", () => {
    const early = selectWorldLines(createWorldState(), theme, 0);
    const late = selectWorldLines(createWorldState(), theme, 1);
    const health = (lines: typeof early): number =>
      lines.find((line) => line.key === "enemyHealth")!.value;

    expect(health(late)).toBeGreaterThan(health(early));
  });
});

describe("upgrade descriptions", () => {
  it("marks a first take as new and a repeat with its levels", () => {
    const first = describeUpgrade(state(), upgrade(archetypeIds.upgrade.damage), theme);
    expect(first).toMatchObject({ level: 0, nextLevel: 1, isNew: true });

    const repeat = describeUpgrade(
      state({ selectedUpgradeIds: [archetypeIds.upgrade.damage, archetypeIds.upgrade.damage] }),
      upgrade(archetypeIds.upgrade.damage),
      theme,
    );
    expect(repeat).toMatchObject({ level: 2, nextLevel: 3, isNew: false });
  });

  it("states the resolved before and after, not the raw stat", () => {
    const description = describeUpgrade(state(), upgrade(archetypeIds.upgrade.damage), theme);
    const line = description.lines.find((entry) => entry.label === theme.copy.stats.damage);

    expect(line).toBeDefined();
    expect(line!.from).toBe("10");
    expect(line!.to).toBe("12.5");
    expect(line!.delta).toBe("+25%");
  });

  it("reads multi-projectile upgrades as counts", () => {
    const description = describeUpgrade(state(), upgrade(archetypeIds.upgrade.projectileCount), theme);
    const line = description.lines.find((entry) => entry.label === theme.copy.stats.projectiles)!;
    expect([line.from, line.to]).toEqual(["1", "2"]);

    const later = describeUpgrade(
      state({ weaponModifiers: { pierce: 0, projectileCount: 8 } }),
      upgrade(archetypeIds.upgrade.projectileCount),
      theme,
    );
    const laterLine = later.lines.find((entry) => entry.label === theme.copy.stats.projectiles)!;
    expect([laterLine.from, laterLine.to]).toEqual(["9", "10"]);
  });

  it("omits the from value for something the player does not have yet", () => {
    const description = describeUpgrade(state(), upgrade(archetypeIds.upgrade.onKillExplosion), theme);
    expect(description.isNew).toBe(true);
    expect(description.lines.length).toBeGreaterThan(0);
    for (const line of description.lines) expect(line.from).toBeUndefined();
  });

  it("shows a skill's resolved effect moving between levels", () => {
    const taken = state({
      selectedUpgradeIds: [archetypeIds.upgrade.onKillExplosion],
      skillLevels: { [archetypeIds.skill.onKillExplosion]: 1 },
    });
    const description = describeUpgrade(taken, upgrade(archetypeIds.upgrade.onKillExplosion), theme);
    const radius = description.lines.find((line) => line.label === theme.copy.stats.range)!;

    expect(radius.from).toBe("44");
    expect(radius.to).toBe("56");
  });

  it("describes a dangerous upgrade's world cost", () => {
    const description = describeUpgrade(state(), upgrade(archetypeIds.upgrade.worldSurge), theme);
    const labels = description.lines.map((line) => line.label);
    expect(labels).toContain(theme.copy.world.enemySpawn);
    expect(labels).toContain(theme.copy.world.xpGain);
  });

  it("never claims a change the upgrade does not make", () => {
    // The anti-drift guarantee: descriptions come from applying the upgrade and
    // diffing, so every stated line must be reproducible by applying it.
    for (const entry of theme.upgrades) {
      const before = state();
      const description = describeUpgrade(before, entry, theme);
      const after = applyUpgrade(before, entry, maxLevelFor);

      const beforeLines = selectPlayerStats(before, theme);
      const afterLines = selectPlayerStats(after, theme);
      const changed = afterLines
        .filter((line, index) => line.value !== beforeLines[index]!.value)
        .map((line) => line.label);

      for (const label of changed) {
        expect(description.lines.map((line) => line.label)).toContain(label);
      }
      // Every upgrade must say something; a silent card is a wasted pick.
      expect(description.lines.length).toBeGreaterThan(0);
    }
  });

  it.each([
    ["eco-guardian", ecoGuardianTheme],
    ["knight-magic", knightMagicTheme],
  ])("produces a named, non-empty description for every %s upgrade", (_name, pack) => {
    const packState: UpgradeableState = {
      player: { health: 100, stats: { ...pack.characters[0]!.baseStats } },
      weaponModifiers: createWeaponStatModifiers(),
      selectedUpgradeIds: [],
      skillLevels: {},
      world: createWorldState(),
    };
    for (const entry of pack.upgrades) {
      const description = describeUpgrade(packState, entry, pack);
      expect(description.name).toBe(pack.copy.content[entry.id]!.name);
      expect(description.summary.length).toBeGreaterThan(0);
      expect(description.maxLevel).toBe(entry.maxLevel);
    }
  });
});

describe("session settings", () => {
  it("defaults detailed cards on", () => {
    expect(createSettings().detailedUpgradeCards).toBe(true);
  });

  it("toggles one key without disturbing the others", () => {
    const initial = createSettings();
    const muted = toggleSetting(initial, "muted");
    expect(muted.muted).toBe(true);
    expect(muted.detailedUpgradeCards).toBe(initial.detailedUpgradeCards);
    expect(toggleSetting(muted, "muted").muted).toBe(false);
  });

  it("stays serializable for the deferred persistence adapter", () => {
    const settings = toggleSetting(createSettings(), "reducedMotion");
    expect(JSON.parse(JSON.stringify(settings))).toEqual(settings);
  });

  it("resets cleanly for tests", () => {
    expect(resetSessionSettings({ muted: true }).muted).toBe(true);
    expect(resetSessionSettings().muted).toBe(false);
  });
});
