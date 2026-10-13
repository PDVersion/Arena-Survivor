import { readFileSync } from "node:fs";
import ts from "typescript";
import { describe, expect, it } from "vitest";

function methodBody(file: string, name: string): string {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  let body = "";
  const visit = (node: ts.Node): void => {
    if (ts.isMethodDeclaration(node) && node.name.getText(source) === name) body = node.body!.getText(source);
    ts.forEachChild(node, visit);
  };
  visit(source);
  if (!body) throw new Error(`Missing ${name}`);
  return body;
}

describe("production diagnostic boundaries", () => {
  for (const [file, method] of [
    ["src/game/scenes/run-scene.ts", "publishTelemetry"],
    ["src/game/scenes/run-scene.ts", "updateLoadHighWaterMarks"],
    ["src/game/scenes/menu-scene.ts", "publishTelemetry"],
  ]) it(`${file} ${method} returns before any diagnostic dependency is read`, () => {
    const body = methodBody(file!, method!);
    const touched = new Proxy({}, { get: () => { throw new Error("Diagnostic read"); } });
    const compile = (mode: string) => {
      const result = ts.transpileModule(`function probe() ${body.replaceAll("import.meta.env.MODE", JSON.stringify(mode))}`, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
      }).outputText;
      return new Function(`${result}; return probe;`)() as (this: object) => void;
    };
    expect(() => compile("production").call(touched)).not.toThrow();
    expect(() => compile("development").call(touched)).not.toThrow();
    // Positive control: the same actual method still executes in test mode.
    expect(() => compile("test").call(touched)).toThrow();
  });
});


it("production ignores benchmark capacity even when a URL requests more enemies", () => {
  const file = "src/game/scenes/run-scene.ts";
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const declaration = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "testEnemyCapacity") as ts.FunctionDeclaration;
  const body = declaration.body!.getText(source);
  const run = (mode: string, search: string): number => {
    const result = ts.transpileModule(`function probe() ${body.replaceAll("import.meta.env.MODE", JSON.stringify(mode))}`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
    const probe = new Function("window", `const V02_SPAWN_LIMITS = { maxAlive: 300 }; ${result}; return probe;`)({ location: { search } }) as () => number;
    return probe();
  };
  expect(run("production", "?enemyCap=600")).toBe(300);
  expect(run("test", "?enemyCap=450")).toBe(450);
  expect(run("test", "?enemyCap=1000000")).toBe(300);
});
