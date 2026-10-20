import { readFileSync } from "node:fs";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";
import { advanceRunState, createRunState, isRunActive, setRunStatus } from "../../../src/game/state/run-state";
import { themeRegistry } from "../../../src/game/content/theme-registry";

// Exercise actual scene event handlers without DOM/renderer emulation. Native
// browser event delivery is independently covered by the opt-in browser case.
const file = "src/game/scenes/run-scene.ts";
const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
const methods: string[] = [];
function visit(node: ts.Node): void {
  if (ts.isMethodDeclaration(node) && ["handleGameBlur", "handleGameFocus"].includes(node.name.getText(source))) {
    methods.push(node.getText(source).replace(/^private /, ""));
  }
  ts.forEachChild(node, visit);
}
visit(source);
if (methods.length !== 2) throw new Error("Missing focus handlers");
const code = ts.transpileModule(`class Handlers { ${methods.join("\n")} }`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const Handlers = new Function("setRunStatus", "isRunActive", `${code}; return Handlers;`)(setRunStatus, isRunActive);

function fixture(theme: (typeof themeRegistry)[number]["theme"]) {
  const runState = createRunState({ themeId: theme.id, characterId: theme.characters[0]!.id, baseStats: theme.characters[0]!.baseStats });
  return Object.assign(new Handlers(), {
    runState, focusPaused: false,
    frameMeasurements: { interrupt: vi.fn() }, player: { stop: vi.fn() },
    physics: { world: { pause: vi.fn(), resume: vi.fn() } },
    audioFeedback: { setFocused: vi.fn() }, hud: { update: vi.fn() },
    hudExtras: () => ({}), publishTelemetry: vi.fn(),
  });
}

for (const { theme } of themeRegistry) describe(`${theme.id} focus state ownership`, () => {
  it("resumes only its own playing-run interruption, with duplicate events idempotent", () => {
    const scene = fixture(theme);
    const original = scene.runState;
    scene.handleGameBlur();
    expect(scene.runState.status).toBe("paused");
    expect(scene.runState.elapsedMs).toBe(original.elapsedMs);
    expect(scene.focusPaused).toBe(true);
    scene.handleGameBlur();
    expect(scene.physics.world.pause).toHaveBeenCalledOnce();
    expect(scene.audioFeedback.setFocused).toHaveBeenCalledExactlyOnceWith(false);
    scene.handleGameFocus();
    scene.handleGameFocus();
    expect(scene.runState).toEqual(original);
    expect(scene.focusPaused).toBe(false);
    expect(scene.physics.world.resume).toHaveBeenCalledOnce();
    expect(scene.audioFeedback.setFocused.mock.calls).toEqual([[false], [true]]);
  });

  it("resumes its own live boss interruption to the boss phase", () => {
    const scene = fixture(theme);
    const enabled = { ...scene.runState, finalBossEnabled: true };
    scene.runState = advanceRunState(enabled, enabled.durationMs);
    const boss = scene.runState;
    scene.handleGameBlur(); expect(scene.runState.status).toBe("paused");
    scene.handleGameFocus(); expect(scene.runState).toEqual(boss);
    expect(scene.runState.status).toBe("boss_fight");
  });

  for (const status of ["paused", "level_up", "time_up", "dead", "complete"] as const) {
    it(`keeps ${status} intent and choices through blur/focus`, () => {
      const scene = fixture(theme);
      const state = { ...scene.runState, status, elapsedMs: 1234 };
      scene.runState = state;
      scene.handleGameBlur();
      scene.handleGameFocus();
      expect(scene.runState).toBe(state);
      expect(scene.focusPaused).toBe(false);
      expect(scene.physics.world.pause).not.toHaveBeenCalled();
      expect(scene.physics.world.resume).not.toHaveBeenCalled();
      expect(scene.player.stop).not.toHaveBeenCalled();
    });
  }

  it("late focus after stop does not access engine collaborators", () => {
    const scene = fixture(theme);
    scene.runState = undefined;
    scene.focusPaused = true;
    for (const property of ["physics", "player", "hud", "audioFeedback"]) {
      Object.defineProperty(scene, property, { get() { throw new Error(`Stopped engine access: ${property}`); } });
    }
    expect(() => { scene.handleGameBlur(); scene.handleGameFocus(); }).not.toThrow();
  });
});
