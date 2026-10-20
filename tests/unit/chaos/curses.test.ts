import { describe, expect, it } from "vitest";
import { archetypeIds as ids } from "../../../src/game/core/archetypes/ids";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { validateTheme } from "../../../src/game/content/define-theme";
import { acceptCurse, applyWorldChoice, createWorldState, selectWorldModifiers } from "../../../src/game/systems/chaos/world-modifiers";
import { applyRunUpgrade, awardRunExperience, createRunState, resetRunState } from "../../../src/game/state/run-state";
import { applyUpgrade, createSeededRandom, isUpgradeAvailable, selectUpgradeChoices } from "../../../src/game/systems/upgrades";
import { describeUpgrade } from "../../../src/game/systems/upgrades/describe-upgrade";
import { isTiered } from "../../../src/game/systems/upgrades/upgrade-tiers";
import { selectShrineCodex } from "../../../src/game/systems/codex/describe-shrine";
import { scheduleShrineArrivals } from "../../../src/game/systems/shrines/shrine-placement";
import { findBuildModel } from "../../../src/game/systems/simulation/build-models";
import { simulatePacing, timeToKillTable } from "../../../src/game/systems/simulation/pacing-simulator";

describe.each([ecoGuardianTheme, knightMagicTheme])("C3 world choices in $id", (theme) => {
  const shrine = theme.shrines.find((entry) => entry.id === ids.shrine.escalation)!;
  const offers = theme.upgrades.filter((entry) => entry.effects.some((effect) => effect.kind === "curse.accept"));
  const base = () => ({ ...createRunState({ themeId: theme.id, characterId: ids.character.starter,
    baseStats: theme.characters[0]!.baseStats, weaponSlotCount: theme.weaponSlotCount }), status: "level_up" as const,
    progression: { level: 2, xp: 0, xpToNextLevel: 4, pendingChoices: 3 } });
  const applyShrine = (world = createWorldState()) => applyWorldChoice(world, { ...shrine, shrineId: shrine.id });

  it("schedules a distinct late shrine and derives its actual world bargain in the guide", () => {
    const arrivals = scheduleShrineArrivals(theme.tuning.shrines, 300000);
    expect(arrivals.find((entry) => entry.shrineId === shrine.id)?.appearAtMs).toBe(258000);
    expect(arrivals).toHaveLength(6);
    expect(scheduleShrineArrivals(theme.tuning.shrines, 600000).at(-1)?.appearAtMs).toBe(516000);
    const guide = selectShrineCodex(theme).find((entry) => entry.id === shrine.id)!;
    expect(guide.effects).toContainEqual({ label: theme.copy.world.chaos, display: "+1.2" });
    expect(guide.effects).toContainEqual({ label: theme.copy.world.xpGain, display: "×1.4" });
    expect(shrine.effectKind).toBe("world_multiplier");
    expect(shrine.spawnCount).toBe(0);
  });

  it("applies each curse once, immutably, through the same world products", () => {
    const old = createWorldState();
    let world = old;
    for (const curse of theme.curses) {
      const before = JSON.stringify(world);
      const after = acceptCurse(world, curse);
      expect(JSON.stringify(world)).toBe(before);
      expect(acceptCurse(after, curse)).toBe(after);
      world = after;
    }
    expect(world).toMatchObject({ chaos: 1.8, enemySpawnMultiplier: 1.3, xpMultiplier: 1.5,
      acceptedCurseIds: [ids.curse.frenzy, ids.curse.escalation], shrineActivations: {} });
    expect(old).toEqual(createWorldState());
    expect(Object.isFrozen(world.acceptedCurseIds)).toBe(true);
    expect(JSON.parse(JSON.stringify(world))).toEqual(world);
  });

  it("composes shrine and curse pressure/reward in either order, retaining separate source IDs", () => {
    let first = applyShrine();
    for (const curse of theme.curses) first = acceptCurse(first, curse);
    let second = createWorldState();
    for (const curse of [...theme.curses].reverse()) second = acceptCurse(second, curse);
    second = applyShrine(second);
    expect(first.chaos).toBeCloseTo(3);
    expect(first.enemySpawnMultiplier).toBeCloseTo(1.3);
    expect(first.xpMultiplier).toBeCloseTo(2.1);
    expect(first.shrineActivations).toEqual({ [shrine.id]: 1 });
    for (const progress of [0, 1, 1.5]) {
      const a = selectWorldModifiers(first, theme.tuning.difficulty, progress);
      const b = selectWorldModifiers(second, theme.tuning.difficulty, progress);
      for (const key of Object.keys(a) as (keyof typeof a)[]) expect(a[key]).toBeCloseTo(b[key], 12);
    }
  });

  it("offers two one-time untiered curses and spends exactly one choice/tally per accepted curse", () => {
    let state = base();
    expect(offers).toHaveLength(2);
    const choices = selectUpgradeChoices(theme.upgrades, theme.upgrades.filter((u) => isUpgradeAvailable(u, [], state)).length, createSeededRandom(5), state);
    for (const offer of offers) {
      expect(choices).toContain(offer);
      const curse = theme.curses.find((c) => offer.effects.some((e) => e.kind === "curse.accept" && e.curseId === c.id))!;
      expect(isTiered(offer)).toBe(false);
      const next = applyRunUpgrade(state, offer, undefined, 2.5, theme.weapons, theme.curses);
      expect(next.progression.pendingChoices).toBe(state.progression.pendingChoices - 1);
      expect(next.statistics.upgradeCounts[offer.id]).toBe(1);
      expect(next.world.acceptedCurseIds).toContain(curse.id);
      expect(isUpgradeAvailable(offer, [], next)).toBe(false); // even stale selected-history data cannot reapply it
      expect(applyRunUpgrade(next, offer, undefined, 1, theme.weapons, theme.curses)).toBe(next);
      state = { ...next, status: "level_up" };
    }
    expect(state.world.xpMultiplier).toBeCloseTo(1.5);
    expect(state.selectedUpgradeIds).toEqual(offers.map((offer) => offer.id));
  });

  it("previews resolved pressure and reward at the authored terms even on a unique roll", () => {
    for (const offer of offers) {
      const view = describeUpgrade(base(), offer, theme, "unique");
      expect(view).toMatchObject({ level: 0, nextLevel: 1, maxLevel: 1, tier: "common", tierMultiplier: 1 });
      expect(view.lines[0]?.label).toBe(theme.copy.world.xpGain);
      expect(view.lines.slice(0, 3).some((line) => line.label === theme.copy.world.xpGain && line.from !== line.to)).toBe(true);
      expect(view.lines.some((line) => line.label === theme.copy.world.enemySpawn && line.from !== line.to)).toBe(true);
      expect(view.summary).toContain("rest of this run");
    }
    const first = applyUpgrade(base(), offers[0]!, undefined, 1, theme.weapons, theme.curses);
    const composed = describeUpgrade(first, offers[1]!, theme);
    // XP product1.2×1.25 also receives Chaos1.8's ×1.2 XP curve.
    expect(composed.lines[0]).toMatchObject({ from: "×1.2", to: "×1.8" });
  });

  it("refuses missing curse catalogs or non-level-up/terminal acceptance without consuming a choice", () => {
    const offer = offers[0]!;
    expect(applyUpgrade(base(), offer, undefined, 1, theme.weapons)).toEqual(base());
    for (const status of ["playing", "paused", "time_up", "dead", "complete"] as const) {
      const state = { ...base(), status };
      expect(applyRunUpgrade(state, offer, undefined, 1, theme.weapons, theme.curses)).toBe(state);
    }
  });

  it("resets all accepted curses, world products and picks while retaining the original difficulty/loadout", () => {
    const cursed = applyRunUpgrade(base(), offers[0]!, undefined, 1, theme.weapons, theme.curses);
    const reset = resetRunState({ ...cursed, world: applyShrine(cursed.world) });
    expect(reset.world).toEqual(createWorldState());
    expect(reset.selectedUpgradeIds).toEqual([]);
    expect(reset.statistics.upgradeCounts).toEqual({});
    expect(reset.weaponSlots).toEqual(base().weaponSlots);
    expect(reset.difficulty).toBe(base().difficulty);
  });

  it("retains fractional source XP and applies the resolved world multiplier exactly once", () => {
    const rawSourceXp = 1.5;
    const state = { ...base(), status: "playing" as const, world: applyShrine(acceptCurse(createWorldState(), theme.curses[0]!)) };
    const worldXp = selectWorldModifiers(state.world, theme.tuning.difficulty).xpMultiplier;
    const next = awardRunExperience(state, rawSourceXp * worldXp);
    const expected = rawSourceXp * worldXp * state.player.stats.xpMultiplier;
    expect(next.progression.xp + (next.progression.level > state.progression.level ? state.progression.xpToNextLevel : 0)).toBeCloseTo(expected);
    expect(state.world.acceptedCurseIds).toHaveLength(1);
    expect(next.world).toBe(state.world);
  });

  it("rejects malformed pressure/rewards, duplicate IDs, missing references and repeatable/mixed curse offers", () => {
    const curse = theme.curses[0]!;
    for (const change of [{ xpMultiplier: 1 }, { xpMultiplier: Infinity }, { chaosIncrease: -1 }, { enemySpawnMultiplier: NaN }, { enemySpawnMultiplier: 1, chaosIncrease: 0 }]) {
      expect(validateTheme({ ...theme, curses: [{ ...curse, ...change }, theme.curses[1]!] }).join("\n")).toContain("requires finite positive pressure and XP reward");
    }
    expect(validateTheme({ ...theme, curses: [curse, curse] }).join("\n")).toContain("duplicate curse id");
    expect(validateTheme({ ...theme, curses: [] }).join("\n")).toContain("references missing curse");
    for (const maxLevel of [null, 2]) expect(validateTheme({ ...theme, upgrades: theme.upgrades.map((u) => u.id === offers[0]!.id ? { ...u, maxLevel } : u) }).join("\n")).toContain("standalone one-time choice");
    expect(validateTheme({ ...theme, upgrades: theme.upgrades.map((u) => u.id === offers[0]!.id
      ? { ...u, effects: [...u.effects, { kind: "world.modify" as const, chaosIncrease: 1 }] } : u) }).join("\n")).toContain("standalone one-time choice");
    expect(validateTheme(theme)).toEqual([]);
  });

  it("models an explicit combined world fixture deterministically without mutating it", () => {
    let world = applyShrine();
    for (const curse of theme.curses) world = acceptCurse(world, curse);
    const before = JSON.stringify(world);
    const options = { theme, build: findBuildModel("evolved-single")!, durationMs: 30000, initialWorld: world };
    const report = simulatePacing(options);
    expect(report.chaos).toBeCloseTo(world.chaos);
    expect(report).toEqual(simulatePacing(options));
    expect(report.peakLiveEnemies).toBeLessThanOrEqual(300);
    expect(timeToKillTable(report, options).every((row) => Number.isFinite(row.damagePerSecond))).toBe(true);
    expect(JSON.stringify(world)).toBe(before);
  });
});
