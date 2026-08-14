import { describe, expect, it } from "vitest";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { applyRunUpgrade, createRunState, resetRunState } from "../../../src/game/state/run-state";
import { awardRunExperience } from "../../../src/game/state/run-state";

describe("run stat modifiers", () => {
  it("applies a selected descriptor and resumes only after its queued choice", () => {
    const character = knightMagicTheme.characters[0];
    const upgrade = knightMagicTheme.upgrades.find(({ id }) => id === archetypeIds.upgrade.damage);
    if (!character || !upgrade) throw new Error("Missing themed fixture");
    const leveling = awardRunExperience(
      createRunState({
        themeId: knightMagicTheme.id,
        characterId: character.id,
        baseStats: character.baseStats,
      }),
      2,
    );

    expect(leveling).toMatchObject({
      status: "level_up",
      progression: { level: 2, pendingChoices: 1 },
    });
    const upgraded = applyRunUpgrade(leveling, upgrade);
    expect(upgraded).toMatchObject({
      status: "playing",
      player: { stats: { damageBonus: 0.25 } },
      progression: { pendingChoices: 0 },
      selectedUpgradeIds: [archetypeIds.upgrade.damage],
      activeSkillIds: [],
    });
    expect(resetRunState(upgraded)).toMatchObject({
      player: { stats: { damageBonus: 0 } },
      selectedUpgradeIds: [],
      activeSkillIds: [],
    });
  });
});
