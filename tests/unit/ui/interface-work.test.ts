import { readFileSync } from "node:fs";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";
import { themeRegistry } from "../../../src/game/content/theme-registry";
import { createRunState, isRunActive, type RunState } from "../../../src/game/state/run-state";
import { selectHudValues } from "../../../src/game/state/statistics";
import { SpawnStatistics } from "../../../src/game/systems/statistics/spawn-statistics";
import type { HudExtras } from "../../../src/game/ui/hud";

// Execute actual presentation methods without booting Phaser's DOM renderer.
function declaration(file: string, name: string): string {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  let found: ts.Node | undefined;
  const visit = (node: ts.Node): void => {
    if ((ts.isClassDeclaration(node) || ts.isMethodDeclaration(node)) && node.name?.getText(source) === name) found = node;
    ts.forEachChild(node, visit);
  };
  visit(source);
  if (!found) throw new Error(`Missing ${name}`);
  return found.getText(source).replace(/^export /, "");
}

const hudCode = ts.transpileModule(declaration("src/game/ui/hud.ts", "Hud"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;
const Hud = new Function("selectHudValues", `${hudCode}; return Hud;`)(selectHudValues);

for (const { theme } of themeRegistry) describe(`${theme.id} HUD change detection`, () => {
  function fixture() {
    const run = createRunState({ themeId: theme.id, characterId: theme.characters[0]!.id, baseStats: theme.characters[0]!.baseStats });
    const hud = Object.create(Hud.prototype);
    hud.theme = theme;
    for (const key of ["healthLabel", "experienceLabel", "right", "status", "levelLabel"]) {
      hud[key] = { text: "", setText: vi.fn(function(this: { text: string }, value: string | string[]) { this.text = Array.isArray(value) ? value.join("\n") : value; }) };
    }
    hud.healthFill = { width: 0 };
    hud.xpFill = { width: 0 };
    const origins = new SpawnStatistics();
    const extras: HudExtras = { spawnCounts: origins.live, threatStep: 0, killChain: 0, levelProgress: 0 };
    return { run, hud, origins, extras };
  }

  it("skips stable formatted text while fractional health/XP bars stay immediate", () => {
    const { run, hud, extras } = fixture();
    hud.update(run, extras);
    const next = { ...run, elapsedMs: 100, player: { ...run.player, health: run.player.health - 0.1 } };
    hud.update(next, { ...extras, levelProgress: 0.125 });
    expect(hud.healthLabel.setText).toHaveBeenCalledTimes(1);
    expect(hud.right.setText).toHaveBeenCalledTimes(1);
    expect(hud.healthFill.width).toBeCloseTo(200 * next.player.health / next.player.stats.maxHealth);
    expect(hud.xpFill.width).toBe(25);
  });

  it("updates damage, XP, level and status on the next call", () => {
    const { run, hud, extras } = fixture();
    hud.update(run, extras);
    const next: RunState = { ...run, status: "level_up", player: { ...run.player, health: 72 }, progression: { ...run.progression, level: 2, xp: 1.5, xpToNextLevel: 8 } };
    hud.update(next, { ...extras, levelProgress: 1.5 / 8 });
    const values = selectHudValues(next);
    expect(hud.healthLabel.text).toContain(values.health);
    expect(hud.experienceLabel.text).toContain(values.experience);
    expect(hud.levelLabel.text).toContain(values.level);
    hud.update({ ...next, status: "paused" }, extras);
    expect(hud.status.text).toBe(theme.copy.vocabulary.paused);
    hud.update({ ...next, status: "playing" }, extras);
    expect(hud.status.text).toBe("");
  });

  it("observes in-place origin counts and keeps cumulative counts untouched", () => {
    const { run, hud, extras, origins } = fixture();
    hud.update(run, extras);
    for (const origin of ["natural", "fragmentation", "baggedWaste", "environment"] as const) {
      origins.add(origin, origin);
      hud.update(run, extras);
      expect(hud.right.text).toContain(`${theme.copy.spawnOrigins[origin]}: 1`);
      origins.remove(origin);
      hud.update(run, extras);
      expect(hud.right.text).toContain(`${theme.copy.spawnOrigins[origin]}: 0`);
      expect(origins.spawned[origin]).toBe(1);
    }
  });

  it("preserves countdown ceiling, overtime prefix, chain removal and terminal transitions", () => {
    const { run, hud, extras } = fixture();
    hud.update(run, extras);
    hud.update({ ...run, elapsedMs: 1000 }, { ...extras, killChain: 3 });
    expect(hud.right.text).toContain("4:59");
    expect(hud.right.text).toContain(`${theme.copy.vocabulary.largestKillChain}: 3`);
    for (const mode of ["endless", "clearing"] as const) {
      hud.update({ ...run, mode, elapsedMs: run.durationMs + 1 }, extras);
      expect(hud.right.text).toContain("+0:01");
      expect(hud.right.text).not.toContain(theme.copy.vocabulary.largestKillChain);
    }
    for (const status of ["time_up", "dead", "complete"] as const) {
      hud.update({ ...run, status }, extras);
      expect(hud.textInputs.status).toBe(status);
    }
  });
});

const minimapMethod = declaration("src/game/scenes/run-scene.ts", "updateMinimap");
const minimapCode = ts.transpileModule(`function updateMinimap() ${minimapMethod.slice(minimapMethod.indexOf("{"))}`, {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;
const updateMinimap = new Function("isRunActive", `${minimapCode}; return updateMinimap;`)(isRunActive);

it("hidden minimaps never iterate or prepare actor collections", () => {
  const touched = new Proxy({}, { get: () => { throw new Error("Hidden map actor scan"); } });
  const scene = { minimap: { visible: false, setOverlayHidden: vi.fn(), update: vi.fn() }, player: touched, runState: { status: "paused" }, enemies: touched, hazards: touched, shrineActors: touched, minimapView: touched };
  expect(() => updateMinimap.call(scene)).not.toThrow();
  expect(scene.minimap.update).not.toHaveBeenCalled();
  expect(scene.minimap.setOverlayHidden).toHaveBeenCalledWith(true);
});

it("visible minimaps reuse buffers and drop defeated, removed and consumed actors", () => {
  const alive = { x: 1, y: 2, active: true, defeated: false };
  const consumed = { x: 3, y: 4, active: true, activated: true };
  const site = { ...consumed, activated: false };
  const view = { player: { x: 0, y: 0 }, enemies: [], shrines: [], hazards: [] };
  const scene = { minimap: { visible: true, setOverlayHidden: vi.fn(), update: vi.fn() }, player: { x: 7, y: 8 }, runState: { status: "playing" }, enemies: new Set([alive, { ...alive, defeated: true }]), hazards: new Set([{ ...alive, active: false }]), shrineActors: [consumed, site], minimapView: view };
  updateMinimap.call(scene);
  expect(view.enemies).toEqual([alive]);
  expect(view.shrines).toEqual([site]);
  expect(view.hazards).toEqual([]);
  expect(view.player).toEqual({ x: 7, y: 8 });
  const buffer = view.enemies;
  scene.enemies.clear();
  site.activated = true;
  updateMinimap.call(scene);
  expect(view.enemies).toBe(buffer);
  expect(view.enemies).toEqual([]);
  expect(view.shrines).toEqual([]);
  expect(scene.minimap.update).toHaveBeenLastCalledWith(view);
});
