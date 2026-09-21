import { describe, expect, it } from "vitest";
import { visibleWorldSize } from "../../../src/game/systems/view/configure-run-camera";

describe("visibleWorldSize", () => {
  it("preserves the current fixed world view at neutral zoom", () => {
    expect(visibleWorldSize({ width: 1600, height: 900 }, 1)).toEqual({ width: 1600, height: 900 });
  });

  it("crops world space without changing the render surface", () => {
    expect(visibleWorldSize({ width: 1600, height: 900 }, 2)).toEqual({ width: 800, height: 450 });
  });

  it("rejects invalid zoom", () => {
    expect(() => visibleWorldSize({ width: 1600, height: 900 }, 0)).toThrow(/zoom/i);
  });
});
