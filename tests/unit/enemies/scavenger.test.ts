import { readFileSync } from "node:fs";
import ts from "typescript";
import { expect, it, vi } from "vitest";
import { applyDamage } from "../../../src/game/systems/combat";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
// Execute actual actor movement/hit methods without creating a browser renderer.
const source = ts.createSourceFile("enemy.ts", readFileSync("src/game/entities/enemy-actor.ts", "utf8"), ts.ScriptTarget.Latest, true);
const methods: string[] = [];
function visit(node: ts.Node): void {
  if (ts.isMethodDeclaration(node) && ["advance", "takeDamage"].includes(node.name.getText(source))) methods.push(node.getText(source));
  ts.forEachChild(node, visit);
}
visit(source);
const js = ts.transpileModule(`class Subject { ${methods.join("\n")} }`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const Subject = new Function("applyDamage", `${js}; return Subject`)(applyDamage);
function actor() {
  const subject = new Subject();
  Object.assign(subject, { definition: ecoGuardianTheme.enemies.find((e) => e.id === "enemy.scavenger"), x: 100, y: 100, health: 180, hitsTaken: 0,
    ageMs: 0, fleeUntil: 0, wanderUntil: 0, wanderAngle: 0, moveSpeed: 110,
    scene: { physics: { world: { bounds: { width: 3000, height: 3000 } } } },
    view: { flash: vi.fn() }, arcadeBody: { setVelocity: vi.fn() } });
  return subject;
}
it("wanders without homing and holds its authored random heading between choices", () => {
  const random = vi.spyOn(Math, "random").mockReturnValue(.25);
  try {
    const rat = actor(); rat.advance({ x: 0, y: 100 }, 100);
    const first = rat.arcadeBody.setVelocity.mock.lastCall;
    expect(first[0]).toBeCloseTo(0); expect(first[1]).toBeCloseTo(110);
    rat.advance({ x: 500, y: 100 }, 100);
    expect(rat.arcadeBody.setVelocity.mock.lastCall).toEqual(first);
  } finally { random.mockRestore(); }
});
it("flees away from the player after a real nonlethal hit, then returns to normal speed", () => {
  const rat = actor(); rat.takeDamage(10);
  expect(rat.health).toBe(170); expect(rat.hitsTaken).toBe(1);
  rat.advance({ x: 0, y: 0 }, 100);
  let [x, y] = rat.arcadeBody.setVelocity.mock.lastCall;
  expect(x).toBeGreaterThan(0); expect(y).toBeGreaterThan(0); expect(Math.hypot(x, y)).toBeCloseTo(176);
  rat.advance({ x: 0, y: 0 }, 2500); [x, y] = rat.arcadeBody.setVelocity.mock.lastCall;
  expect(Math.hypot(x, y)).toBeCloseTo(110);
});
it("commits a lethal rat hit once and ignores subsequent hits", () => {
  const rat = actor(); expect(rat.takeDamage(1000)).toMatchObject({ applied: true, killed: true });
  expect(rat.takeDamage(1000)).toMatchObject({ applied: false, killed: false }); expect(rat.hitsTaken).toBe(1);
});
