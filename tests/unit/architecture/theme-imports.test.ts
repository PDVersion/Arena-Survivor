import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const guardedRoots = ["src/game/entities", "src/game/scenes", "src/game/systems", "src/game/ui"];

function typescriptFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .map((entry) => resolve(entry.parentPath, entry.name));
}

describe("theme import boundary", () => {
  it("keeps concrete production themes behind the active-theme facade", () => {
    const guardedFiles = guardedRoots.flatMap(typescriptFiles);
    const violations = guardedFiles.filter((file) =>
      /(?:from|import\()\s*["'][^"']*content\/themes\//.test(readFileSync(file, "utf8")),
    );

    expect(violations).toEqual([]);
  });

  it("selects the production theme in exactly one source file", () => {
    const facade = readFileSync(resolve("src/game/content/active-theme.ts"), "utf8");
    expect(facade).toContain("./themes/eco-guardian");
  });

  it("keeps the theme registry out of the runtime selection path", () => {
    // The registry imports every pack for tooling and validation. If the facade
    // reached for it, the production bundle would carry themes it never renders.
    const facade = readFileSync(resolve("src/game/content/active-theme.ts"), "utf8");
    expect(facade).not.toContain("theme-registry");
  });
});
