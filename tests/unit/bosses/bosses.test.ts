import { readFileSync } from "node:fs";
import ts from "typescript";
import { tierMultiplier } from "../../../src/game/systems/upgrades/upgrade-tiers";
import { skillMaxLevel } from "../../../src/game/systems/skills/resolve-skill";
import { describe, expect, it, vi } from "vitest";
import { themeRegistry } from "../../../src/game/content/theme-registry";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import { validateTheme } from "../../../src/game/content/define-theme";
import { createBossAttack, advanceBossAttack, dueBosses } from "../../../src/game/systems/bosses/bosses";
import { advanceRunState, applyRunUpgrade, awardRunExperience, chooseRunMode, createRunState, damageRunPlayer, observeRunChaos, defeatFinalBoss, isRunActive, regenerateRunPlayer, resetRunState, runEscalationProgress, setRunStatus } from "../../../src/game/state/run-state";
import { selectHudValues } from "../../../src/game/state/statistics";
import { findBuildModel } from "../../../src/game/systems/simulation/build-models";
import { formatTimeToKill } from "../../../src/game/systems/simulation/format-report";
import { simulatePacing, timeToKillTable } from "../../../src/game/systems/simulation/pacing-simulator";

for (const { theme } of themeRegistry) describe(`${theme.id} unique bosses`, () => {
  const final = theme.enemies.find((e) => e.boss?.kind === "final")!;
  const mini = theme.enemies.find((e) => e.boss?.kind === "mini")!;
  const start = () => createRunState({ themeId: theme.id, characterId: theme.characters[0]!.id, baseStats: theme.characters[0]!.baseStats, durationMs: 1000, finalBossEnabled: true });
  it("keeps milestone work due until successful creation is recorded, once per run", () => {
    const spawned = new Set<string>();
    expect(dueBosses(theme.enemies, 0.49, spawned)).toEqual([]);
    expect(dueBosses(theme.enemies, 0.5, spawned)).toEqual([mini]);
    expect(dueBosses(theme.enemies, 0.9, spawned)).toEqual([mini]);
    spawned.add(mini.id);
    expect(dueBosses(theme.enemies, 1, spawned)).toEqual([final]);
    spawned.add(final.id);
    expect(dueBosses(theme.enemies, 100, spawned)).toEqual([]);
    expect(dueBosses(theme.enemies, 0, new Set())).toEqual([]);
  });
  it("replaces the timer hold with live boss combat and requires a final lethal before choosing", () => {
    const boss = advanceRunState(start(), 1000);
    expect(boss.status).toBe("boss_fight"); expect(isRunActive(boss)).toBe(true);
    expect(chooseRunMode(boss, "endless")).toBe(boss);
    const later = advanceRunState(boss, 2500);
    expect(later.elapsedMs).toBe(3500);
    expect(selectHudValues(later).time).toBe("+0:03");
    const decision = defeatFinalBoss(later);
    expect(decision.status).toBe("time_up"); expect(decision.finalBossDefeated).toBe(true);
    expect(defeatFinalBoss(decision)).toBe(decision);
    expect(advanceRunState(decision, 100)).toBe(decision);
    for (const mode of ["endless", "clearing"] as const) {
      const resumed = chooseRunMode(decision, mode);
      expect(resumed.status).toBe("playing"); expect(resumed.activePhase).toBe("playing");
      expect(advanceRunState(resumed, 100).elapsedMs).toBe(3600);
    }
  });
  it("preserves boss intent through pause and multiple earned upgrade choices", () => {
    const boss = advanceRunState(start(), 1000);
    const paused = setRunStatus(boss, "paused");
    expect(advanceRunState(paused, 1000)).toBe(paused);
    expect(setRunStatus(paused, "playing").status).toBe("boss_fight");
    let level = awardRunExperience(boss, 20);
    expect(level.status).toBe("level_up");
    const upgrade = theme.upgrades.find((u) => u.id === archetypeIds.upgrade.damage)!;
    while (level.progression.pendingChoices > 0) level = applyRunUpgrade(level, upgrade);
    expect(level.status).toBe("boss_fight");
  });
  it("retains an existing level choice if a queued final lethal commits during the overlay", () => {
    let level = awardRunExperience(advanceRunState(start(), 1000), 3);
    expect(level.status).toBe("level_up");
    level = defeatFinalBoss(level); expect(level.status).toBe("level_up");
    level = applyRunUpgrade(level, theme.upgrades.find((u) => u.id === archetypeIds.upgrade.damage)!);
    expect(level.status).toBe("time_up");
  });
  it("keeps damage, regeneration and terminal ownership live during the fight", () => {
    const boss = advanceRunState(start(), 1000);
    const injured = damageRunPlayer(boss, 10);
    expect(injured.player.health).toBe(boss.player.health - 10);
    const healing = { ...injured, player: { ...injured.player, stats: { ...injured.player.stats, regeneration: 5 } } };
    expect(regenerateRunPlayer(healing, 1000).player.health).toBe(injured.player.health + 5);
    const dead = damageRunPlayer(injured, 10000);
    expect(dead.status).toBe("dead"); expect(defeatFinalBoss(dead)).toBe(dead);
    const reset = resetRunState(dead); expect(reset.finalBossEnabled).toBe(true);
    expect(reset.finalBossDefeated).toBe(false); expect(reset.activePhase).toBe("playing");
  });
  it("plateaus timed and clearing pressure while only endless escalates", () => {
    const boss = advanceRunState(advanceRunState(start(), 1000), 5000);
    expect(runEscalationProgress(boss)).toBe(1);
    const decision = defeatFinalBoss(boss);
    expect(runEscalationProgress(chooseRunMode(decision, "clearing"))).toBe(1);
    expect(runEscalationProgress(chooseRunMode(decision, "endless"))).toBe(6);
  });
  it("requires a harmless fixed warning before each single bounded pulse", () => {
    const definition = final.boss!; const attack = definition.attack;
    const origin = { x: 10, y: 20 }; const target = { ...origin, radius: 12 };
    const initial = createBossAttack(0, definition);
    expect(advanceBossAttack(initial, definition, attack.recoveryMs - 1, origin, target).state).toBe(initial);
    const warn = advanceBossAttack(initial, definition, attack.recoveryMs, origin, target);
    expect(warn.damage).toBe(0); expect(warn.state.warning).toMatchObject(origin);
    const moved = { x: 900, y: 900 };
    expect(advanceBossAttack(warn.state, definition, attack.recoveryMs + attack.telegraphMs - 1, moved, target).damage).toBe(0);
    const hit = advanceBossAttack(warn.state, definition, 1000000, moved, target);
    expect(hit.damage).toBe(attack.damage); expect(hit.released).toBe(true);
    expect(hit.state.nextAtMs).toBe(1000000 + attack.recoveryMs);
    expect(advanceBossAttack(hit.state, definition, 1000000, moved, target).damage).toBe(0);
    const dodge = advanceBossAttack(warn.state, definition, 1000000, origin, { ...moved, radius: 12 });
    expect(dodge.damage).toBe(0); expect(dodge.released).toBe(true);
  });
  it("rejects malformed patterns and recursive/ambient/duplicate bosses", () => {
    const mutate = (changed: typeof final) => validateTheme({ ...theme, enemies: theme.enemies.map((e) => e.id === final.id ? changed : e) });
    expect(mutate({ ...final, boss: { ...final.boss!, appearAt: 0.5 } })).toContain(`${final.id} invalid boss milestone`);
    expect(mutate({ ...final, boss: { ...final.boss!, attack: { ...final.boss!.attack, radius: Infinity } } })).toContain(`${final.id} boss attack values must be finite and positive`);
    expect(mutate({ ...final, boss: { kind: "final", appearAt: 1 } as typeof final.boss })).toContain(`${final.id} boss attack is required`);
    expect(mutate({ ...final, fragmentInto: mini.id })).toContain(`${final.id} unique boss cannot create descendants`);
    expect(validateTheme({ ...theme, enemies: [...theme.enemies, { ...mini, id: archetypeIds.enemy.stationaryFragment }] })).toContain(`${mini.id} boss kind must be unique`);
  });
  it("reports boss TTK only from its authored encounter, preserving ordinary build pacing", () => {
    const options = { theme, build: findBuildModel("damage-rush")!, durationMs: 300000 };
    const rows = timeToKillTable(simulatePacing(options), options);
    for (const row of rows) {
      expect(final.id in row.seconds).toBe(row.progress >= final.boss!.appearAt);
      expect(mini.id in row.seconds).toBe(row.progress >= mini.boss!.appearAt);
    }
    expect(formatTimeToKill(rows, [final.id])).toContain("—");
    expect(formatTimeToKill(rows, [final.id])).not.toContain("0.00s");
    expect(rows.at(-1)!.seconds[final.id]).toBeGreaterThan(0);
    expect(rows.at(-1)!.seconds[final.id]).toBeLessThan(25);
  });
});

// Actual coordinator regression: a final lethal queued during a level choice
// must never resume physics between that choice and the held victory decision.
const file = "src/game/scenes/run-scene.ts";
const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
let chooseMethod = "";
function visit(node: ts.Node): void {
  if (ts.isMethodDeclaration(node) && node.name.getText(source) === "chooseUpgrade") chooseMethod = node.getText(source).replace(/^private /, "");
  ts.forEachChild(node, visit);
}
visit(source);
const code = ts.transpileModule(`class Handlers { ${chooseMethod} }`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const Handlers = new Function("applyRunUpgrade", "skillMaxLevel", "tierMultiplier", "observeRunChaos", "isRunActive", `${code}; return Handlers;`)(applyRunUpgrade, skillMaxLevel, tierMultiplier, observeRunChaos, isRunActive);
for (const { theme } of themeRegistry) it(`${theme.id} holds actual physics while an overlay delivers the queued boss victory`, () => {
  const base = createRunState({ themeId: theme.id, characterId: theme.characters[0]!.id, baseStats: theme.characters[0]!.baseStats, finalBossEnabled: true });
  const state = defeatFinalBoss(awardRunExperience(advanceRunState(base, base.durationMs), 3));
  const choice = theme.upgrades.find((upgrade) => upgrade.id === archetypeIds.upgrade.damage)!;
  const scene = Object.assign(new Handlers(), { runState: state, runTheme: theme, currentOffers: [], currentChoices: [choice],
    levelUpUi: { hide: vi.fn() }, physics: { world: { resume: vi.fn() } }, showOvertimeChoice: vi.fn(), publishTelemetry: vi.fn(), beginLevelUpChoice: vi.fn(),
  });
  scene.chooseUpgrade(choice);
  expect(scene.runState.status).toBe("time_up");
  expect(scene.showOvertimeChoice).toHaveBeenCalledOnce();
  expect(scene.physics.world.resume).not.toHaveBeenCalled();
});
