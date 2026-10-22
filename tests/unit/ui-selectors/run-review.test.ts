import { expect, it } from "vitest";
import { themeRegistry } from "../../../src/game/content/theme-registry";
import { archetypeIds as ids } from "../../../src/game/core/archetypes/ids";
import { createRunState, recordRunDamage, resetRunState } from "../../../src/game/state/run-state";
import { createInitialProfile } from "../../../src/game/state/profile-state";
import { selectCapabilityProgress, selectRunReview } from "../../../src/game/systems/mastery/run-review";
import { applyWorldChoice } from "../../../src/game/systems/chaos/world-modifiers";
import { foldRun, createSessionStatistics } from "../../../src/game/state/session-statistics";
import { validateTheme } from "../../../src/game/content/define-theme";
for (const { theme } of themeRegistry) {
  const start = () => createRunState({ themeId: theme.id, characterId: ids.character.starter, baseStats: theme.characters[0]!.baseStats, weaponSlotCount: 2 });
  const profile = () => createInitialProfile({ activeThemeId: theme.id, contentSchemaVersion: theme.schemaVersion, starterCharacterId: ids.character.starter, now: "2026-10-22T00:00:00.000Z" });
  it(`${theme.id} partitions actual weapon/evolved/other damage without adding kills or durable fields`, () => {
    let state = recordRunDamage(start(), { amount: 8.5, source: "direct", weaponId: ids.weapon.starter, directBase: 5, criticalBonus: 3.5 });
    state = recordRunDamage(state, { amount: 2, source: "splash", weaponId: ids.weapon.secondary });
    state = recordRunDamage(state, { amount: 7, source: "direct", weaponId: ids.weapon.secondaryEvolved, directBase: 7 });
    state = recordRunDamage(state, { amount: 3, source: "explosion", weaponId: ids.weapon.starter });
    const before = JSON.stringify(state);
    const review = selectRunReview(state, theme, [ids.weapon.secondary]);
    expect(Object.values(state.statistics.damageByWeapon).reduce((n, v) => n + v!, 0)).toBe(17.5);
    expect(review.tools).toContain(`${theme.copy.content[ids.weapon.secondaryEvolved].name}: 7`);
    expect(review.tools).toContain(`${theme.copy.mastery.otherDamage}: 3`);
    expect(state.statistics.totalDamage).toBe(20.5); expect(state.statistics.kills).toBe(0);
    expect(JSON.stringify(state)).toBe(before);
    expect(foldRun(createSessionStatistics(), { statistics: state.statistics, level: 1 })).not.toHaveProperty("damageByWeapon");
    expect(resetRunState(state).statistics.damageByWeapon).toEqual({});
    expect(recordRunDamage(state, { amount: 0, source: "direct", weaponId: ids.weapon.starter }).statistics).toBe(state.statistics);
  });
  it(`${theme.id} advice follows actual availability, owned picks and evolution`, () => {
    const initial = start();
    expect(selectRunReview(initial, theme, []).next).toContain(theme.copy.content[ids.weapon.secondary].name);
    expect(selectRunReview(initial, theme, []).next).toBe(theme.copy.mastery.tryFirst.replace("{name}", theme.copy.content[ids.weapon.secondary].name));
    const available = selectRunReview(initial, theme, [ids.weapon.secondary]);
    expect(available.next).toBe(theme.copy.mastery.tryEquip.replace("{name}", theme.copy.content[ids.weapon.secondary].name));
    const owned = { ...initial, weaponSlots: [...initial.weaponSlots, { weaponId: ids.weapon.secondary, nextAttackAtMs: 0 }] };
    expect(selectRunReview(owned, theme, []).next).toContain("0/4");
    const ready = { ...owned, selectedUpgradeIds: Array(4).fill(ids.upgrade.secondaryRange) };
    expect(selectRunReview(ready, theme, []).next).toBe(theme.copy.mastery.tryReady.replace("{name}", theme.copy.content[ids.weapon.secondaryEvolved].name));
    const evolved = { ...initial, weaponSlots: [{ weaponId: ids.weapon.secondaryEvolved, nextAttackAtMs: 0 }] };
    expect(selectRunReview(evolved, theme, []).next).toBe(theme.copy.mastery.tryRisk);
    const shrine = theme.shrines[0]!;
    const pressed = { ...evolved, world: applyWorldChoice(evolved.world, { ...shrine, shrineId: shrine.id }) };
    expect(selectRunReview(pressed, theme, []).choices).toEqual([`${theme.copy.content[shrine.id].name} ×1`]);
    expect(selectRunReview(pressed, theme, []).next).toBe(theme.copy.mastery.tryRecovery);
    expect(selectRunReview({ ...pressed, finalBossDefeated: true }, theme, []).next).toBe(theme.copy.mastery.tryCalm);
  });
  it(`${theme.id} shows current unlock progress without granting anything or interpreting unknown IDs`, () => {
    const p = profile(), before = JSON.stringify(p);
    const rows = selectCapabilityProgress(theme, p);
    expect(rows).toHaveLength(theme.unlocks!.length);
    expect(rows[0]!.display).toContain("0/1");
    expect(rows[1]!.display).toContain("0/25");
    expect(JSON.stringify(p)).toBe(before);
    const unlocked = { ...p, unlockedWeaponIds: [ids.weapon.secondary, "weapon.future"], statistics: { ...p.statistics, runsPlayed: 1 } };
    expect(selectCapabilityProgress(theme, unlocked)[0]!.display).toBe(theme.copy.profile.unlocked);
    expect(unlocked.unlockedWeaponIds).toContain("weapon.future");
    expect(validateTheme({ ...theme, copy: { ...theme.copy, mastery: { ...theme.copy.mastery, tryEquip: "" } } })).toContain("mastery.tryEquip label is required");
  });
}
