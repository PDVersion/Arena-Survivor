import { readFileSync } from "node:fs";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";
import { themeRegistry } from "../../../src/game/content/theme-registry";
import { validateTheme } from "../../../src/game/content/define-theme";
import { createSettings, cycleDifficulty, cycleMinimapOpacity, cyclePresentationQuality, toggleSetting, getSessionSettings, resetSessionSettings, updateSessionSettings } from "../../../src/game/state/settings-state";
import { simulatePacing } from "../../../src/game/systems/simulation/pacing-simulator";
import { findBuildModel } from "../../../src/game/systems/simulation/build-models";
import { MinimapUi } from "../../../src/game/ui/minimap-ui";

vi.mock("phaser", () => ({ default: { Display: { Color: { HexStringToColor: (hex: string) => ({ color: parseInt(hex.slice(1), 16) }) } } } }));

function fixture(theme: (typeof themeRegistry)[number]["theme"]) {
  const graphics = Object.fromEntries(["clear", "fillStyle", "fillRoundedRect", "lineStyle", "strokeRoundedRect", "fillCircle", "fillRect"].map((key) => [key, vi.fn().mockReturnThis()]));
  const container = { visible: true, setDepth: vi.fn().mockReturnThis(), setVisible: vi.fn(function(this: { visible: boolean }, value: boolean) { this.visible = value; return this; }), setPosition: vi.fn().mockReturnThis(), setScale: vi.fn().mockReturnThis(), setScrollFactor: vi.fn().mockReturnThis(), destroy: vi.fn() };
  const scene = { scale: { width: 1600, height: 900 }, cameras: { main: { zoom: 2 } }, add: { graphics: () => graphics, container: () => container } };
  const map = new MinimapUi(scene as never, theme, { width: 3200, height: 2200 }, 0.6);
  const view = Object.freeze({ player: Object.freeze({ x: 1600, y: 1100 }), enemies: Object.freeze([Object.freeze({ x: 123, y: 456 })]), hazards: Object.freeze([Object.freeze({ x: 111, y: 222 })]), shrines: Object.freeze([Object.freeze({ x: 333, y: 444 })]) });
  return { map, graphics, scene, view };
}

it("defaults to unchanged presentation, cycles reversibly and retains only session memory", () => {
  const initial = resetSessionSettings();
  expect(initial.presentationQuality).toBe("default");
  const low = cyclePresentationQuality(initial);
  expect(low.presentationQuality).toBe("low");
  expect(initial.presentationQuality).toBe("default");
  expect(Object.isFrozen(low)).toBe(true);
  updateSessionSettings(low);
  expect(getSessionSettings()).toBe(low);
  expect(cyclePresentationQuality(low)).toEqual(initial);
  expect(createSettings().presentationQuality).toBe("default");
  resetSessionSettings();
});

for (const { theme } of themeRegistry) describe(`${theme.id} presentation isolation`, () => {
  it("changes only enemy marker geometry, preserving positions, extents and every input", () => {
    const { map, graphics, view } = fixture(theme);
    const before = JSON.stringify(view);
    map.update(view);
    const circles = graphics.fillCircle!.mock.calls.map((args) => [...args]);
    expect(circles).toHaveLength(4);
    map.setPresentationQuality("low");
    graphics.fillCircle!.mockClear();
    map.update(view);
    expect(graphics.fillRect).toHaveBeenCalledExactlyOnceWith(circles[0]![0] - 1.4, circles[0]![1] - 1.4, 2.8, 2.8);
    expect(graphics.fillCircle!.mock.calls).toEqual(circles.slice(1));
    map.setPresentationQuality("default");
    graphics.fillCircle!.mockClear();
    map.update(view);
    expect(graphics.fillCircle!.mock.calls).toEqual(circles);
    expect(JSON.stringify(view)).toBe(before);
  });

  it("keeps resize, opacity, overlay and newly consumed sites prompt in Low", () => {
    const { map, graphics, scene, view } = fixture(theme);
    map.setPresentationQuality("low");
    map.setOpacity(0);
    map.update(view);
    expect(graphics.clear).not.toHaveBeenCalled();
    map.setOpacity(0.85);
    map.setOverlayHidden(true);
    map.update(view);
    expect(graphics.clear).not.toHaveBeenCalled();
    scene.scale.width = 1200;
    map.resize(scene as never);
    map.setOverlayHidden(false);
    map.update({ ...view, shrines: [] });
    expect(graphics.clear).toHaveBeenCalledOnce();
    expect(graphics.fillCircle).toHaveBeenCalledTimes(2); // hazard and player, no spent site
    expect(map.bounds.left + map.bounds.width).toBeLessThan(1200);
    expect(graphics.fillStyle).toHaveBeenCalledWith(expect.any(Number), 0.85);
  });

  it("keeps seeded spawn/kill/reward/XP reports identical when marker tuning changes", () => {
    const options = { theme, build: findBuildModel("explosion")!, durationMs: 300_000, seed: 4312, chaos: 4 };
    const baseline = simulatePacing(options);
    const allLow = { ...theme, tuning: { ...theme.tuning, view: { ...theme.tuning.view, minimapEnemyShapes: { default: "square" as const, low: "square" as const } } } };
    expect(simulatePacing({ ...options, theme: allLow })).toEqual(baseline);
    expect(baseline.peakLiveEnemies).toBeLessThanOrEqual(300);
    expect(baseline.gameplayRate).toBe(0.5);
  });

  it("validates both presentation modes at the theme boundary", () => {
    expect(validateTheme(theme)).toEqual([]);
    const broken = { ...theme, tuning: { ...theme.tuning, view: { ...theme.tuning.view, minimapEnemyShapes: { default: "circle", low: "invalid" } } } };
    expect(validateTheme(broken as never)).toContain("tuning.view.minimapEnemyShapes.low must be circle or square");
  });
});

it("live mode dispatch needs only settings and presentation collaborators", () => {
  const source = ts.createSourceFile("scene.ts", readFileSync("src/game/scenes/run-scene.ts", "utf8"), ts.ScriptTarget.Latest, true);
  let body = "";
  function visit(node: ts.Node): void {
    if (ts.isMethodDeclaration(node) && node.name.getText(source) === "applySetting") body = node.body!.getText(source);
    ts.forEachChild(node, visit);
  }
  visit(source);
  expect(body).not.toBe("");
  const code = ts.transpileModule(`function applySetting(key: string) ${body}`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const apply = new Function("getSessionSettings", "updateSessionSettings", "cyclePresentationQuality", "cycleDifficulty", "cycleMinimapOpacity", "toggleSetting", "prefersReducedMotion", `${code}; return applySetting;`)(getSessionSettings, updateSessionSettings, cyclePresentationQuality, cycleDifficulty, cycleMinimapOpacity, toggleSetting, () => false);
  const scene = {
    reducedMotion: false,
    audioFeedback: { setMuted: vi.fn() },
    minimap: { setOpacity: vi.fn(), setPresentationQuality: vi.fn() },
    pauseMenu: { refresh: vi.fn() }, pauseMenuView: () => ({}), publishTelemetry: vi.fn(),
  };
  for (const key of ["runState", "causalEvents", "enemies", "pickups", "physics"]) {
    Object.defineProperty(scene, key, { get: () => { throw new Error(`Gameplay access: ${key}`); }, set: () => { throw new Error(`Gameplay mutation: ${key}`); } });
  }
  resetSessionSettings();
  expect(() => apply.call(scene, "presentationQuality")).not.toThrow();
  expect(scene.minimap.setPresentationQuality).toHaveBeenLastCalledWith("low");
  expect(() => apply.call(scene, "presentationQuality")).not.toThrow();
  expect(scene.minimap.setPresentationQuality).toHaveBeenLastCalledWith("default");
  resetSessionSettings();
});
