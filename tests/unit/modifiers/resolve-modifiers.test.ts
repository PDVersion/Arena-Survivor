import { describe, expect, it } from "vitest";
import { resolveModifiers } from "../../../src/game/systems/modifiers/resolve-modifiers";

describe("modifier resolution", () => {
  it("centralizes additive-then-multiplicative stacking in stable layer order", () => {
    const result = resolveModifiers(10, [
      { layer: "reward", sourceId: "z", multiplicative: 1.5 },
      { layer: "player", sourceId: "a", additive: 5 },
      { layer: "world", sourceId: "b", multiplicative: 2 },
      { layer: "weapon", sourceId: "c", additive: 1 },
    ]);
    expect(result.value).toBe(48);
    expect(result.additiveTotal).toBe(6);
    expect(result.multiplicativeProduct).toBe(3);
    expect(result.orderedInputs.map((input) => input.layer)).toEqual(["player", "weapon", "world", "reward"]);
  });

  it("does not mutate inputs and preserves fractional products", () => {
    const inputs = Object.freeze([{ layer: "world" as const, sourceId: "chaos", multiplicative: 1.25 }]);
    expect(resolveModifiers(1, inputs).value).toBe(1.25);
    expect(inputs).toHaveLength(1);
  });
});
