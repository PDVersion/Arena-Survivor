import { readFileSync } from "node:fs";
import { EventEmitter } from "node:events";
import ts from "typescript";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BootScene, BOOT_FAILURE_EVENT } from "../../../src/game/scenes/boot-scene";
import { themeRegistry } from "../../../src/game/content/theme-registry";
import { validateTheme } from "../../../src/game/content/define-theme";

vi.mock("phaser", () => ({ default: { Scene: class {}, Loader: { Events: { FILE_LOAD_ERROR: "loaderror" } } } }));
vi.mock("../../../src/game/systems/sprites/load-sprites", () => ({ loadThemeSprites: vi.fn() }));

afterEach(() => vi.unstubAllGlobals());

it("failed declared assets stop the boot transition and report the original path", () => {
  vi.stubGlobal("window", { location: { search: "" } });
  const scene = new BootScene();
  const load = new EventEmitter(), events = new EventEmitter();
  const start = vi.fn(), fail = vi.fn();
  events.on(BOOT_FAILURE_EVENT, fail);
  Object.assign(scene, { load, game: { events }, scene: { start } });
  scene.preload();
  load.emit("loaderror", { src: "/missing-atlas.png" });
  scene.create();
  expect(start).not.toHaveBeenCalled();
  expect(fail).toHaveBeenCalledOnce();
  expect(fail.mock.calls[0]?.[0]).toEqual(new Error("Unable to load asset: /missing-atlas.png"));
  load.removeAllListeners(); // Phaser owns LoaderPlugin shutdown between boots
  scene.preload();
  scene.create();
  expect(start).toHaveBeenCalledOnce();
});

function declaration(file: string, name: string): ts.FunctionDeclaration {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const node = source.statements.find((n) => ts.isFunctionDeclaration(n) && n.name?.text === name);
  if (!node || !ts.isFunctionDeclaration(node)) throw new Error(`Missing ${name}`);
  return node;
}

for (const { theme } of themeRegistry) describe(`${theme.id} boot recovery`, () => {
  it("uses theme-owned retry text and validates it", () => {
    expect(theme.copy.bootRetry.trim()).not.toBe("");
    expect(validateTheme({ ...theme, copy: { ...theme.copy, bootGraphicsFailure: "" } })).toContain("boot graphics failure copy is required");
    expect(validateTheme({ ...theme, copy: { ...theme.copy, bootRetry: "" } })).toContain("boot retry copy is required");
  });

  it("renders error details as text, with an explicit reload action and no production telemetry", () => {
    class Element {
      textContent = ""; className = ""; type = "";
      children: Element[] = [];
      handlers = new Map<string, () => void>();
      attributes = new Map<string, string>();
      append(...elements: Element[]) { this.children.push(...elements); }
      replaceChildren(...elements: Element[]) { this.children = elements; }
      setAttribute(key: string, value: string) { this.attributes.set(key, value); }
      addEventListener(key: string, callback: () => void) { this.handlers.set(key, callback); }
    }
    const app = new Element();
    const reload = vi.fn();
    const code = ts.transpileModule(declaration("src/main.ts", "showBootFailure").getText().replaceAll('import.meta.env.MODE', '"production"'), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
    const report = new Function("app", "activeTheme", "document", "window", "updateTestTelemetry", `${code}; return showBootFailure;`)(app, theme, { createElement: () => new Element() }, { location: { reload } }, () => { throw new Error("Production diagnostic work"); });
    report(new Error('<img src=x onerror="alert(1)">'));
    const message = app.children[0]!;
    expect(message.attributes.get("role")).toBe("alert");
    expect(message.children[0]!.textContent).toContain('<img src=x onerror="alert(1)">');
    expect(message.children[1]!.textContent).toBe(theme.copy.bootRetry);
    message.children[1]!.handlers.get("click")!();
    expect(reload).toHaveBeenCalledOnce();
    expect(app.children).toHaveLength(1);
  });
});

it("the recovery boundary catches dependency-import failures before a Game exists", async () => {
  const node = declaration("src/main.ts", "boot");
  const body = node.getText().replace('import.meta.env.MODE', '"production"').replace('await import("./game/start-game")', 'await loadGame()');
  const code = ts.transpileModule(body, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const fail = vi.fn();
  const error = new Error("Canvas initialization unavailable");
  const run = new Function("activeTheme", "validateTheme", "app", "showBootFailure", "loadGame", "document", `${code}; return boot;`)(themeRegistry[0]!.theme, () => [], { innerHTML: "" }, fail, () => Promise.reject(error), { createElement: () => ({ getContext: () => ({}) }) });
  await run();
  expect(fail).toHaveBeenCalledExactlyOnceWith(error);
});

it("unavailable 2D canvases fail before loading Phaser and use actionable theme copy", async () => {
  const node = declaration("src/main.ts", "boot");
  const body = node.getText().replace('import.meta.env.MODE', '"production"').replace('await import("./game/start-game")', 'await loadGame()');
  const code = ts.transpileModule(body, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const fail = vi.fn(), load = vi.fn();
  const theme = themeRegistry[0]!.theme;
  const run = new Function("activeTheme", "validateTheme", "app", "showBootFailure", "loadGame", "document", `${code}; return boot;`)(theme, () => [], { innerHTML: "" }, fail, load, { createElement: () => ({ getContext: () => null }) });
  await run();
  expect(load).not.toHaveBeenCalled();
  expect(fail).toHaveBeenCalledExactlyOnceWith(new Error(theme.copy.bootGraphicsFailure));
});

it("asynchronous boot failure schedules owned game destruction before showing recovery", () => {
  const file = "src/game/start-game.ts";
  const code = ts.transpileModule(declaration(file, "startGame").getText().replace("export ", ""), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const events = new EventEmitter();
  const destroy = vi.fn(), fail = vi.fn();
  const game = { events, destroy };
  const construct = vi.fn(function(config: { callbacks: { preBoot: (game: unknown) => void } }) { config.callbacks.preBoot(game); return game; });
  const start = new Function("Phaser", "createGameConfig", "BOOT_FAILURE_EVENT", `${code}; return startGame;`)({ Game: construct }, () => ({ type: 0 }), BOOT_FAILURE_EVENT);
  start("container", fail);
  const error = new Error("atlas failure");
  events.emit(BOOT_FAILURE_EVENT, error);
  events.emit(BOOT_FAILURE_EVENT, error);
  expect(destroy).toHaveBeenCalledExactlyOnceWith(true);
  expect(fail).toHaveBeenCalledExactlyOnceWith(error);
  expect(destroy.mock.invocationCallOrder[0]).toBeLessThan(fail.mock.invocationCallOrder[0]!);
});
