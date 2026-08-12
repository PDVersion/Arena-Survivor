import { describe, expect, it } from "vitest";
import { findNearestTarget } from "../../../src/game/systems/targeting";

describe("nearest targeting", () => {
  it("selects the nearest active target", () => {
    const target = findNearestTarget(
      { x: 0, y: 0 },
      [
        { id: "far", x: 10, y: 0, active: true },
        { id: "near", x: 3, y: 4, active: true },
        { id: "inactive", x: 1, y: 0, active: false },
      ],
    );
    expect(target?.id).toBe("near");
  });

  it("uses stable IDs to break equal-distance ties", () => {
    const target = findNearestTarget(
      { x: 0, y: 0 },
      [
        { id: "enemy-b", x: 1, y: 0, active: true },
        { id: "enemy-a", x: -1, y: 0, active: true },
      ],
    );
    expect(target?.id).toBe("enemy-a");
  });

  it("returns null when no valid target exists", () => {
    expect(findNearestTarget({ x: 0, y: 0 }, [])).toBeNull();
  });
});
