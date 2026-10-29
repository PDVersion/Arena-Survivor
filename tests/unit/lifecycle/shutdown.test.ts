import { readFileSync } from "node:fs";
import ts from "typescript";
import { expect, it, vi } from "vitest";
import { CausalEventQueue } from "../../../src/game/systems/events/causal-events";
import { SpatialHash } from "../../../src/game/systems/spatial/spatial-hash";
import { createDamageAggregator, accumulateDamage } from "../../../src/game/systems/feedback/impact";
import { AudioFeedbackService, FeedbackLimiter } from "../../../src/game/systems/feedback/feedback-service";
import { themeRegistry } from "../../../src/game/content/theme-registry";

it("shutdown releases retained resources and claims idempotently without altering gameplay data", () => {
  const file = "src/game/scenes/run-scene.ts";
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  let body = "";
  function visit(node: ts.Node): void {
    if (ts.isMethodDeclaration(node) && node.name.getText(source) === "shutdownRuntime") body = node.body!.getText(source);
    ts.forEachChild(node, visit);
  }
  visit(source);
  expect(body).not.toBe("");
  expect(readFileSync(file, "utf8")).toContain("this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownRuntime, this)");
  const code = ts.transpileModule(`function shutdown() ${body}`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const browserWindow = { removeEventListener: vi.fn() };
  const browserDocument = { removeEventListener: vi.fn() };
  const shutdown = new Function("Phaser", "window", "document", `${code}; return shutdown;`)(
    { Scale: { Events: { RESIZE: "resize" } }, Core: { Events: { BLUR: "blur", FOCUS: "focus" } }, Input: { Events: { POINTER_DOWN: "pointerdown" } } }, browserWindow, browserDocument,
  );
  const actor = { x: 1, y: 2, destroy: vi.fn() };
  const queue = () => {
    const result = new CausalEventQueue();
    result.enqueue({ eventId: "event", kind: "feedback.requested", provenance: { sourceCategory: "world" }, payload: {} });
    result.claimLethal("actor");
    result.claimEffect("actor", "effect");
    return result;
  };
  const ui = { destroy: vi.fn(), hide: vi.fn() };
  const enemyHash = new SpatialHash();
  enemyHash.insert(actor);
  const damageNumbers = createDamageAggregator();
  accumulateDamage(damageNumbers, { targetId: "actor", amount: 12, tier: 0, x: 1, y: 2 }, 0, 120);
  const feedbackLimiter = new FeedbackLimiter();
  feedbackLimiter.beginVisual();
  const runState = Object.freeze({ statistics: Object.freeze({ totalDamage: 12, xp: 27 }), status: "playing" });
  const scene = {
    scale: { off: vi.fn() }, game: { events: { off: vi.fn() } }, input: { off: vi.fn() },
    handleResize: vi.fn(), handleGameBlur: vi.fn(), handleGameFocus: vi.fn(), handleRestartKey: vi.fn(), handleMeasurementVisibility: vi.fn(), handlePointerGesture: vi.fn(),
    bossHealthUi: { destroy: vi.fn() }, bossSummonLabels: new Map([["boss", { destroy: vi.fn() }]]), bossCues: new Map(), bossAttacks: new Map(), spawnedBossIds: new Set(["enemy.final_boss"]),
    hud: ui, levelUpUi: ui, pauseMenu: ui, runEndOverlay: ui, overtimeUi: ui, minimap: ui,
    audioFeedback: { destroy: vi.fn() },
    enemies: new Set([actor]), projectiles: new Set([actor]), pickups: new Set([actor]), hazards: new Set([actor]), feedbackObjects: new Set([actor]),
    shrineMarkers: new Map([[actor, actor]]), shrineActors: [actor],
    minimapView: { enemies: [actor], shrines: [actor], hazards: [actor] }, enemyHash,
    eventQueue: queue(), loadEventQueue: queue(), claimedPickupIds: new Set(["pickup-1"]), damageNumbers, feedbackLimiter,
    runState,
    clearEnemyShots: vi.fn(),
  };
  // Physics, timers and tweens belong to Phaser, not a second teardown here.
  for (const property of ["physics", "time", "tweens"]) Object.defineProperty(scene, property, { get() { throw new Error(`Unexpected engine teardown: ${property}`); } });
  shutdown.call(scene);
  shutdown.call(scene);
  expect(actor.destroy).not.toHaveBeenCalled();
  expect(scene.runState).toBe(runState);
  for (const set of [scene.enemies, scene.projectiles, scene.pickups, scene.hazards, scene.feedbackObjects, scene.claimedPickupIds, scene.shrineMarkers, scene.bossCues, scene.bossSummonLabels, scene.bossAttacks, scene.spawnedBossIds]) expect(set.size).toBe(0);
  expect(scene.enemyHash.size).toBe(0);
  expect(scene.minimapView).toEqual({ enemies: [], shrines: [], hazards: [] });
  expect(scene.shrineActors).toEqual([]);
  expect(damageNumbers.pending.size).toBe(0);
  expect(damageNumbers.accumulated).toBe(12);
  expect(feedbackLimiter.snapshot().activeVisuals).toBe(0);
  expect(ui.destroy).toHaveBeenCalledTimes(2); // HUD + minimap, only on first call
  expect(ui.hide).toHaveBeenCalledTimes(4);
  expect(browserWindow.removeEventListener).toHaveBeenCalledWith("keydown", scene.handleRestartKey);
  expect(browserDocument.removeEventListener).toHaveBeenCalledWith("visibilitychange", scene.handleMeasurementVisibility);
  expect(scene.scale.off.mock.calls[0]?.slice(0, 2)).toEqual(["resize", scene.handleResize]);
  expect(scene.scale.off.mock.calls[0]?.[2]).toBe(scene);
  expect(scene.game.events.off.mock.calls[0]?.slice(0, 2)).toEqual(["blur", scene.handleGameBlur]);
  expect(scene.game.events.off.mock.calls[1]?.slice(0, 2)).toEqual(["focus", scene.handleGameFocus]);
  expect(scene.input.off).toHaveBeenCalledWith("pointerdown", scene.handlePointerGesture);
  for (const queue of [scene.eventQueue, scene.loadEventQueue]) {
    expect(queue.snapshot().backlog).toBe(0);
    expect(queue.claimLethal("actor")).toBe(true);
    expect(queue.claimEffect("actor", "effect")).toBe(true);
    expect(queue.enqueue({ eventId: "event", kind: "feedback.requested", provenance: { sourceCategory: "world" }, payload: {} })).toBe(true);
  }
});

it("audio context ownership closes once on repeated teardown", () => {
  const close = vi.fn().mockResolvedValue(undefined);
  const AudioContext = vi.fn(function() { return { close }; });
  vi.stubGlobal("window", { AudioContext });
  try {
    const audio = new AudioFeedbackService(themeRegistry[0]!.theme.tokens.sounds);
    audio.unlock();
    audio.unlock();
    expect(AudioContext).toHaveBeenCalledOnce();
    audio.destroy();
    audio.destroy();
    expect(close).toHaveBeenCalledOnce();
    expect(audio.snapshot()).toMatchObject({ unlocked: false, voices: 0 });
  } finally {
    vi.unstubAllGlobals();
  }
});
