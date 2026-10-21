import { readFileSync } from "node:fs";
import ts from "typescript";
import { expect, it } from "vitest";
import { CausalEventQueue } from "../../../src/game/systems/events/causal-events";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";

// Extract the actual coordinator method, matching the existing focus-handler
// convention; no copied capacity algorithm or browser/Phaser mock is needed.
const file = "src/game/scenes/run-scene.ts";
const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
let method = "";
function visit(node: ts.Node): void {
  if (ts.isMethodDeclaration(node) && node.name.getText(source) === "processCausalEvents") method = node.getText(source).replace(/^private /, "");
  ts.forEachChild(node, visit);
}
visit(source);
if (!method) throw new Error("Missing causal processor");
const code = ts.transpileModule(`class Handler { ${method} }`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const Handler = new Function(`${code}; return Handler;`)();

it("retains the second split request at capacity and drains it with unchanged identity once space is free", () => {
  const eventQueue = new CausalEventQueue();
  const enemies = new Set<string>();
  const spawned: unknown[][] = [];
  const scene = Object.assign(new Handler(), { eventQueue, enemies, enemyCapacity: 1, enemyDefinitions: ecoGuardianTheme.enemies,
    spawnEnemy(...args: unknown[]) { spawned.push(args); enemies.add(`spawn-${spawned.length}`); return true; },
  });
  for (let i = 0; i < 2; i++) eventQueue.enqueue({ eventId: `split-${i}`, kind: "spawn.requested", entityId: "parent", provenance: { sourceCategory: "enemy", effectId: "elite.split", parentEventId: "death-parent" },
    payload: { enemyId: ecoGuardianTheme.enemies[0]!.id, spawnSource: "shrine.spawn_surge", rewardMultiplier: 0.75, reason: "elite_split", elite: "elite.split", eliteSplitDepth: 1, movement: "chase" } });
  scene.processCausalEvents();
  expect(enemies.size).toBe(1); expect(spawned).toHaveLength(1); expect(eventQueue.snapshot().backlog).toBe(1);
  scene.processCausalEvents(); expect(eventQueue.snapshot().backlog).toBe(1);
  enemies.clear(); scene.processCausalEvents();
  expect(enemies.size).toBe(1); expect(eventQueue.snapshot().backlog).toBe(0);
  expect(spawned).toHaveLength(2); expect(spawned[0]).toEqual(spawned[1]);
  expect(spawned[1]).toEqual(["shrine.spawn_surge", 0.75, ecoGuardianTheme.enemies[0], undefined, "elite.split", undefined, "chase", "environment", 1]);
});

it("keeps the existing 24-event budget for a large pending elite queue", () => {
  const eventQueue = new CausalEventQueue(); const enemies = new Set<string>();
  const scene = Object.assign(new Handler(), { eventQueue, enemies, enemyCapacity: 300, enemyDefinitions: ecoGuardianTheme.enemies,
    spawnEnemy() { enemies.add(`spawn-${enemies.size}`); return true; },
  });
  for (let i = 0; i < 100; i++) eventQueue.enqueue({ eventId: `split-${i}`, kind: "spawn.requested", provenance: { sourceCategory: "enemy", effectId: "elite.split" }, payload: { enemyId: ecoGuardianTheme.enemies[0]!.id, elite: "elite.split", eliteSplitDepth: 1 } });
  scene.processCausalEvents(); expect(enemies.size).toBe(24); expect(eventQueue.snapshot().backlog).toBe(76);
});
