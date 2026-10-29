import { expect, it } from "vitest";
import type { ThemeManifest } from "../../../src/game/core/archetypes/contracts";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { selectEliteCodex } from "../../../src/game/systems/codex/describe-shrine";
const theme: ThemeManifest = ecoGuardianTheme;
it("explains all actual elite markers and shared modifiers without making them material enemies", () => {
  const entries = selectEliteCodex(theme);
  expect(entries.map((entry) => entry.marker)).toEqual(["No symbol", "2", "◇", "»"]);
  expect(entries.map((entry) => entry.name)).toEqual(["Standard elite", "Dispersing Waste", "Wrapped Waste", "Rolling Waste"]);
  for (const entry of entries) expect(entry.effects.map((effect) => effect.display)).toEqual(["×2", "×1.5", "×2.5", "×1.3"]);
  expect(entries[1]!.description).toContain("2 copies");
  expect(entries[1]!.description).toContain("1 generation");
  expect(entries[2]!.description).toContain("50% of incoming damage");
  expect(entries[2]!.description).toContain("above 50% health");
  expect(entries[3]!.description).toContain("×1.5 normal movement speed");
  expect(entries.every((entry) => !entry.description.includes("{"))).toBe(true);
});
it("retunes the guide with the same definition changes used by combat", () => {
  const changed = { ...theme, elites: theme.elites.map((elite) => elite.shield ? { ...elite, healthMultiplier: 3, shield: { damageMultiplier: .3, untilHealthFraction: .6 } } : elite) };
  const entry = selectEliteCodex(changed).find((entry) => entry.marker === "◇")!;
  expect(entry.description).toContain("30% of incoming damage");
  expect(entry.description).toContain("above 60% health");
  expect(entry.effects[0]!.display).toBe("×3");
});
it("keeps the optional guide absent when a pack does not provide its copy", () => {
  expect(selectEliteCodex({ ...theme, copy: { ...theme.copy, eliteGuide: undefined } })).toEqual([]);
});
