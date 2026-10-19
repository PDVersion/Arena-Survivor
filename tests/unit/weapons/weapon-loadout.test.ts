import { describe, expect, it } from "vitest";
import { archetypeIds, type WeaponId } from "../../../src/game/core/archetypes/ids";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { createWeaponStatModifiers } from "../../../src/game/systems/upgrades";
import { resolveWeaponDefinition } from "../../../src/game/systems/weapons/resolve-weapon";
import { createWeaponSlots, equipWeapon, recordWeaponAttack } from "../../../src/game/systems/weapons/weapon-loadout";
import { createRunState, resetRunState } from "../../../src/game/state/run-state";

const starter = archetypeIds.weapon.starter;
// Test-only role: this slice does not add a player-facing second weapon.
const secondary = "weapon.fixture_secondary" as WeaponId;
const definitions = [ecoGuardianTheme.weapons[0]!, { ...knightMagicTheme.weapons[0]!, id: secondary }];

describe("automatic weapon slots", () => {
  it("fills an empty slot once, preserves order and refuses duplicates/full loads", () => {
    const original = createWeaponSlots([starter]);
    const equipped = equipWeapon(original, secondary, 2, definitions);
    expect(equipped.map((slot) => slot.weaponId)).toEqual([starter, secondary]);
    expect(original).toEqual([{ weaponId: starter, nextAttackAtMs: 0 }]);
    expect(equipWeapon(equipped, secondary, 2, definitions)).toBe(equipped);
    expect(equipWeapon(original, secondary, 1, definitions)).toBe(original);
    expect(equipWeapon(equipped, starter, 3, definitions)).toBe(equipped);
    expect(JSON.parse(JSON.stringify(equipped))).toEqual(equipped);
  });

  it("rejects duplicate starting roles, unknown content and invalid capacities", () => {
    expect(() => createWeaponSlots([starter, starter])).toThrow("only one slot");
    expect(() => equipWeapon([], secondary, 2, definitions.slice(0, 1))).toThrow("Unknown weapon");
    for (const capacity of [0, -1, 1.5, Infinity, NaN]) {
      expect(() => equipWeapon([], starter, capacity, definitions)).toThrow("capacity");
    }
  });

  it("keeps independent cooldowns and schedules from the actual attack, without catch-up bursts", () => {
    const original = createWeaponSlots([starter, secondary]);
    const first = recordWeaponAttack(original, starter, 0, 1000);
    const both = recordWeaponAttack(first, secondary, 0, 300);
    expect(both.map((slot) => slot.nextAttackAtMs)).toEqual([1000, 300]);
    expect(recordWeaponAttack(both, secondary, 299, 300)).toBe(both);
    const next = recordWeaponAttack(both, secondary, 300, 300);
    expect(next.map((slot) => slot.nextAttackAtMs)).toEqual([1000, 600]);
    expect(next[0]).toBe(both[0]);
    const late = recordWeaponAttack(next, starter, 10_000, 1000);
    expect(late.map((slot) => slot.nextAttackAtMs)).toEqual([11_000, 600]);
    expect(recordWeaponAttack(late, starter, 10_000, 1000)).toBe(late);
    expect(original.every((slot) => slot.nextAttackAtMs === 0)).toBe(true);
  });

  it("rejects non-finite/negative attack times and unequipped weapons", () => {
    const slots = createWeaponSlots([starter]);
    for (const [now, cooldown] of [[NaN, 1], [-1, 1], [0, 0], [0, Infinity], [1, -1], [Number.MAX_VALUE, Number.MAX_VALUE]]) {
      expect(() => recordWeaponAttack(slots, starter, now!, cooldown!)).toThrow("attack time");
    }
    expect(() => recordWeaponAttack(slots, secondary, 0, 300)).toThrow("not equipped");
  });

  it("resolves shared modifiers for both deliveries without changing authored definitions", () => {
    const before = JSON.stringify(definitions);
    const modifiers = { ...createWeaponStatModifiers(), range: 12, pierce: 2, projectileCount: 1 };
    const melee = resolveWeaponDefinition(definitions[0]!, modifiers);
    const projectile = resolveWeaponDefinition(definitions[1]!, modifiers);
    expect(melee).toMatchObject({ reach: 90, range: 90 });
    expect(projectile).toMatchObject({ pierce: 2, projectileCount: 2 });
    expect(JSON.stringify(definitions)).toBe(before);
  });

  it("resets acquired slots/clocks/modifiers and preserves the starting loadout and difficulty", () => {
    const initialIds = [starter];
    const run = createRunState({ themeId: ecoGuardianTheme.id, characterId: archetypeIds.character.starter,
      baseStats: ecoGuardianTheme.characters[0]!.baseStats, difficulty: "experienced", startingWeaponIds: initialIds });
    initialIds.length = 0;
    const slots = recordWeaponAttack(equipWeapon(run.weaponSlots, secondary, 2, definitions), starter, 50, 1000);
    const reset = resetRunState({ ...run, weaponSlots: slots, weaponModifiers: { range: 12, pierce: 2, projectileCount: 1 } });
    expect(reset.difficulty).toBe("experienced");
    expect(reset.startingWeaponIds).toEqual([starter]);
    expect(reset.weaponSlots).toEqual([{ weaponId: starter, nextAttackAtMs: 0 }]);
    expect(reset.weaponModifiers).toEqual(createWeaponStatModifiers());
    expect(reset.weaponSlots).not.toBe(run.weaponSlots);
    expect(JSON.parse(JSON.stringify(reset))).toEqual(reset);
  });
});
