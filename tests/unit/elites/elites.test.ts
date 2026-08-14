import { describe, expect, it, vi } from "vitest";
import { shouldSpawnElite } from "../../../src/game/systems/elites/elites";

describe("elite selection", () => {
  it("uses the deterministic Chaos chance boundary", () => {
    const random = vi.fn().mockReturnValueOnce(0.19).mockReturnValueOnce(0.2);
    expect(shouldSpawnElite(0.2, random)).toBe(true);
    expect(shouldSpawnElite(0.2, random)).toBe(false);
  });

  it("preserves explicit elite identity without consuming randomness", () => {
    const random = vi.fn(() => 0);
    expect(shouldSpawnElite(0, random, true)).toBe(true);
    expect(shouldSpawnElite(1, random, false)).toBe(false);
    expect(random).not.toHaveBeenCalled();
  });

  it("clamps invalid probabilities", () => {
    expect(shouldSpawnElite(-1, () => 0)).toBe(false);
    expect(shouldSpawnElite(2, () => 0.99)).toBe(true);
  });
});
