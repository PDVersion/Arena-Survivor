import { expect, it } from "vitest";
import { clearToolBranches, toggleTreeLevel } from "../../../src/tools/upgrade-tree";
it("selects prerequisite paths and removes a clicked acquired node and descendants", () => {
  expect(toggleTreeLevel(0, 5, 4)).toBe(4);
  expect(toggleTreeLevel(4, 3, 4)).toBe(1);
  expect(toggleTreeLevel(4, 1, 4)).toBe(0);
  expect(toggleTreeLevel(0, 99, 4)).toBe(4);
});
it("clears only this tool's branches without mutating the draft", () => {
  const picks = { "upgrade.tool.aura_damage": 4, "upgrade.tool.bin_count": 2 } as const;
  expect(clearToolBranches(picks, ["upgrade.tool.aura_damage"])).toEqual({ "upgrade.tool.aura_damage": 0, "upgrade.tool.bin_count": 2 });
  expect(picks["upgrade.tool.aura_damage"]).toBe(4);
});
