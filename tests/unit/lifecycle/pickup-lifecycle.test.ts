import { readFileSync } from "node:fs";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";
import { PickupActor } from "../../../src/game/entities/pickup-actor";
import { themeRegistry } from "../../../src/game/content/theme-registry";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import { createRunState, awardRunExperience } from "../../../src/game/state/run-state";
import { claimExperiencePickup } from "../../../src/game/systems/xp";

// Model synchronous DESTROY ordering only. Real Phaser ownership is checked in
// the small lifecycle browser fixture; these body/group counts are test doubles.
vi.mock("phaser", async () => {
  const { EventEmitter } = await import("node:events");
  class Arc extends EventEmitter {
    active = true;
    body?: { setCircle: () => void; enable: boolean };
    radius: number;
    constructor(public scene: unknown, public x: number, public y: number, radius: number) { super(); this.radius = radius; }
    setRadius(radius: number) { this.radius = radius; return this; }
    setDepth() { return this; }
    setStrokeStyle() { return this; }
    destroy() { if (!this.active) return; this.emit("destroy", this); this.active = false; this.removeAllListeners(); }
  }
  return { default: { GameObjects: { Arc, Events: { DESTROY: "destroy" } }, Display: { Color: { HexStringToColor: () => ({ color: 0 }) } }, Math: { Distance: { Between: (x: number, y: number, a: number, b: number) => Math.hypot(x - a, y - b) } } } };
});
vi.mock("../../../src/game/systems/sprites/sprite-view", () => ({ createSpriteView: () => undefined }));

const source = ts.createSourceFile("scene.ts", readFileSync("src/game/scenes/run-scene.ts", "utf8"), ts.ScriptTarget.Latest, true);
const names = ["dropExperience", "enforcePickupCap", "collectPickup"];
const methods: string[] = [];
function visit(node: ts.Node): void {
  if (ts.isMethodDeclaration(node) && names.includes(node.name.getText(source))) {
    methods.push(node.getText(source).replace(/^private /, ""));
  }
  ts.forEachChild(node, visit);
}
visit(source);
// Execute the actual scene methods without constructing a renderer in Node.
const code = ts.transpileModule(`class Methods { ${methods.join("\n")} }`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const cap = Number(source.statements.find((node) => ts.isVariableStatement(node) && node.declarationList.declarations.some((d) => d.name.getText(source) === "PICKUP_CAP"))?.getText(source).match(/= (\d+)/)?.[1]);
const makeMethods = new Function("PickupActor", "Phaser", "PICKUP_CAP", "testSkillEnabled", "testXpLevelCap", "claimExperiencePickup", "awardRunExperience", "archetypeIds", `${code}; return Methods;`);
function createMethods(levelCap?: number) { return makeMethods(PickupActor, { GameObjects: { Events: { DESTROY: "destroy" } }, Math: { Distance: { Between: (x: number, y: number, a: number, b: number) => Math.hypot(x - a, y - b) } } }, cap, () => false, () => levelCap, claimExperiencePickup, awardRunExperience, archetypeIds); }

type SceneFixture = {
  pickups: Set<PickupActor>; bodies: Set<PickupActor>; group: Set<PickupActor>;
  pickupsMerged: number; xpEarnedTotal: number; pickupsCollected: number;
  dropExperience: (x: number, y: number, value: number, source: string) => void;
  collectPickup: (pickup: PickupActor) => void;
  finishCues: () => void;
};
function fixture(theme: (typeof themeRegistry)[number]["theme"], levelCap?: number): SceneFixture {
  const Methods = createMethods(levelCap);
  const scene = new Methods();
  const bodies = new Set<PickupActor>(), group = new Set<PickupActor>();
  const cues: (() => void)[] = [];
  Object.assign(scene, {
    runTheme: theme, pickupDefinition: theme.pickups[0], pickups: new Set(),
    pickupGroup: { add: (actor: PickupActor) => { group.add(actor); actor.once("destroy", () => group.delete(actor)); } },
    pickupSequence: 0, pickupsDropped: 0, pickupsMerged: 0, pickupsCollected: 0, pickupCues: 0,
    claimedPickupIds: new Set(), xpEarnedTotal: 0, ambientXpCollected: 0, shrineXpCollected: 0,
    runState: createRunState({ themeId: theme.id, characterId: theme.characters[0]!.id, baseStats: theme.characters[0]!.baseStats, xpCurve: theme.tuning.progression.xpCurve }),
    add: { existing: () => {} },
    physics: { add: { existing: (actor: PickupActor) => {
      bodies.add(actor);
      Object.assign(actor, { body: { enable: true, setCircle: () => {} } });
      actor.once("destroy", () => bodies.delete(actor));
    } } },
    tweens: { add: ({ onComplete }: { onComplete: () => void }) => cues.push(onComplete) },
    worldModifiers: () => ({ xpMultiplier: 1 }),
    recordPacingXp: (xp: number) => { scene.xpEarnedTotal += xp; },
    beginLevelUpChoice: () => {}, bodies, group,
    finishCues: () => { for (const finish of cues.splice(0)) finish(); },
  });
  return scene;
}

for (const { theme } of themeRegistry) describe(`${theme.id} pickup lifecycle`, () => {
  it("owns cleanup before overflow absorbs the newest actor synchronously", () => {
    const scene = fixture(theme);
    for (let i = 0; i < cap; i++) scene.dropExperience(i * 10, 100, 1, "ambient");
    const keep = [...scene.pickups].at(-1)!;
    scene.dropExperience((cap - 1) * 10 + 0.1, 100, 7, archetypeIds.shrine.spawnSurge);
    expect(keep.xpValue).toBe(8);
    expect(keep.rewardSource).toBe("ambient"); // existing retained-actor provenance
    expect(scene.pickupsMerged).toBe(1);
    expect([...scene.pickups].filter((p) => !p.active)).toHaveLength(0);
    expect(scene.pickups.size).toBe(cap);
    expect(scene.group.size).toBe(cap);
    expect(scene.bodies.size).toBe(cap);
    expect([...scene.pickups].reduce((sum, p) => sum + p.xpValue, 0)).toBe(cap + 7);
  });

  it("preserves fractional rewards through overflow and exact-once collection", () => {
    const scene = fixture(theme);
    for (let i = 0; i < cap; i++) scene.dropExperience(i * 10, 100, 0.25, "ambient");
    scene.dropExperience((cap - 1) * 10 + 0.1, 100, 7.5, archetypeIds.shrine.spawnSurge);
    for (const pickup of [...scene.pickups]) { scene.collectPickup(pickup); scene.collectPickup(pickup); }
    expect(scene.xpEarnedTotal).toBe(cap * 0.25 + 7.5);
    scene.finishCues();
    expect(scene.pickups.size).toBe(0);
  });

  it("retains nearest-pair tie order and the survivor's provenance", () => {
    const scene = fixture(theme);
    for (let i = 0; i <= cap; i++) scene.dropExperience(i * 10, 100, 1, i === 0 ? archetypeIds.shrine.spawnSurge : "ambient");
    const first = [...scene.pickups][0]!;
    expect(first.pickupId).toBe("pickup-1");
    expect(first.xpValue).toBe(2);
    expect(first.rewardSource).toBe(archetypeIds.shrine.spawnSurge);
    expect([...scene.pickups].some((p) => p.pickupId === "pickup-2")).toBe(false);
  });

  it("conserves repeated overflow rewards, exact-once collection and reconstruction", () => {
    for (let cycle = 0; cycle < 3; cycle++) {
      const scene = fixture(theme);
      for (let i = 0; i < 1040; i++) scene.dropExperience(100 + (i % 80 % 10) * 10, 100 + Math.floor(i % 80 / 10) * 10, 1, "ambient");
      expect(scene.pickups.size).toBe(cap);
      expect(scene.bodies.size).toBe(cap);
      expect(scene.group.size).toBe(cap);
      expect([...scene.pickups].filter((p) => p.active)).toHaveLength(cap);
      expect(scene.pickupsMerged).toBe(1040 - cap);
      for (const pickup of [...scene.pickups]) { scene.collectPickup(pickup); scene.collectPickup(pickup); }
      expect(scene.xpEarnedTotal).toBe(1040);
      expect(scene.pickupsCollected).toBe(cap);
      scene.finishCues();
      expect([scene.pickups.size, scene.bodies.size, scene.group.size]).toEqual([0, 0, 0]);
    }
  });

  it("retires a claimed pickup even when the test harness suppresses further XP", () => {
    const scene = fixture(theme, 1);
    scene.dropExperience(100, 100, 1, "ambient");
    const pickup = [...scene.pickups][0]!;
    scene.collectPickup(pickup);
    scene.collectPickup(pickup);
    expect(scene.xpEarnedTotal).toBe(0);
    expect(scene.pickupsCollected).toBe(1);
    scene.finishCues();
    expect([scene.pickups.size, scene.bodies.size, scene.group.size]).toEqual([0, 0, 0]);
  });

  it("never adds an already-paid absorbed value to another unpaid reward", () => {
    const scene = fixture(theme);
    for (let i = 0; i < cap; i++) scene.dropExperience(i * 10, 100, 1, "ambient");
    const paid = [...scene.pickups].at(-1)!;
    paid.x = (cap - 2) * 10 + 0.1;
    scene.collectPickup(paid);
    scene.dropExperience(10000, 100, 5, "ambient");
    for (const pickup of [...scene.pickups]) scene.collectPickup(pickup);
    scene.finishCues();
    expect(scene.xpEarnedTotal).toBe(cap + 5);
    expect(scene.pickups.size).toBe(0);
  });

  it("never merges unpaid XP into an already-paid collect cue at the cap", () => {
    const scene = fixture(theme);
    for (let i = 0; i < cap; i++) scene.dropExperience(i * 10, 100, 1, "ambient");
    const paid = [...scene.pickups][0]!;
    scene.collectPickup(paid);
    scene.dropExperience(0.1, 100, 5, "ambient");
    const unpaid = [...scene.pickups].filter((p) => p !== paid);
    expect(scene.xpEarnedTotal + unpaid.reduce((sum, p) => sum + p.xpValue, 0)).toBe(cap + 5);
    expect(scene.pickups.size).toBeLessThanOrEqual(cap);
    for (const pickup of unpaid) scene.collectPickup(pickup);
    scene.finishCues();
    expect(scene.xpEarnedTotal).toBe(cap + 5);
    expect(scene.pickups.size).toBe(0);
  });
});
