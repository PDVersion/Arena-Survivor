import { describe, expect, it } from "vitest";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { createInitialProfile } from "../../../src/game/state/profile-state";
import {
  advanceRunState,
  chooseRunMode,
  completeRun,
  createRunState,
  damageRunPlayer,
  isRunStateSerializable,
  resetRunState,
  setRunStatus,
} from "../../../src/game/state/run-state";
import { alternateTheme } from "../../fixtures/alternate-theme";

const characterId = archetypeIds.character.starter;
const character = knightMagicTheme.characters[0];

if (!character) throw new Error("Missing test character");

describe("run state", () => {
  it("starts a five-minute run from the themed character baseline", () => {
    const run = createRunState({
      themeId: knightMagicTheme.id,
      characterId,
      baseStats: character.baseStats,
    });

    expect(run).toMatchObject({
      version: 1,
      themeId: "knight_magic",
      status: "playing",
      elapsedMs: 0,
      durationMs: 300_000,
      player: { characterId, health: 100, stats: { moveSpeed: 200 } },
    });
    expect(isRunStateSerializable(run)).toBe(true);
  });

  it("stops at the duration for a decision rather than ending outright", () => {
    const run = createRunState({
      themeId: knightMagicTheme.id,
      characterId,
      baseStats: character.baseStats,
      durationMs: 1000,
    });
    const timeUp = advanceRunState(advanceRunState(run, 750), 500);

    // A timed run reaching its limit is a question, not an ending: the player
    // chooses whether it goes endless or plays out the enemies still alive.
    expect(timeUp.status).toBe("time_up");
    expect(timeUp.elapsedMs).toBe(1000);
    expect(advanceRunState(timeUp, 100)).toBe(timeUp);
  });

  it("keeps the clock running once the limit is lifted", () => {
    const run = createRunState({
      themeId: knightMagicTheme.id,
      characterId,
      baseStats: character.baseStats,
      durationMs: 1000,
    });
    const timeUp = advanceRunState(run, 1000);

    for (const mode of ["endless", "clearing"] as const) {
      const resumed = chooseRunMode(timeUp, mode);
      expect(resumed.status).toBe("playing");
      expect(resumed.mode).toBe(mode);

      // Overtime is measurable, and the director keeps escalating from t > 1.
      const overtime = advanceRunState(resumed, 2500);
      expect(overtime.elapsedMs).toBe(3500);
      expect(overtime.status).toBe("playing");
    }
  });

  it("only answers the decision while it is being asked", () => {
    const run = createRunState({
      themeId: knightMagicTheme.id,
      characterId,
      baseStats: character.baseStats,
      durationMs: 1000,
    });

    expect(chooseRunMode(run, "endless")).toBe(run);
    expect(completeRun(advanceRunState(run, 1000)).status).toBe("complete");
    // A death already ended the run; clearing the field cannot undo it.
    const dead = setRunStatus(run, "dead");
    expect(completeRun(dead)).toBe(dead);
  });

  it("does not advance while paused or after an end state", () => {
    const run = createRunState({
      themeId: knightMagicTheme.id,
      characterId,
      baseStats: character.baseStats,
    });
    const paused = setRunStatus(run, "paused");
    const dead = setRunStatus(setRunStatus(paused, "playing"), "dead");

    expect(advanceRunState(paused, 500)).toBe(paused);
    expect(advanceRunState(dead, 500)).toBe(dead);
    expect(setRunStatus(dead, "playing")).toBe(dead);
  });

  it("enters death exactly when health reaches zero", () => {
    const run = createRunState({
      themeId: knightMagicTheme.id,
      characterId,
      baseStats: character.baseStats,
    });
    const injured = damageRunPlayer(run, 90);
    const dead = damageRunPlayer(injured, 10);

    expect(injured).toMatchObject({ status: "playing", player: { health: 10 } });
    expect(dead).toMatchObject({ status: "dead", player: { health: 0 } });
    expect(damageRunPlayer(dead, 10)).toBe(dead);
  });

  it("resets all transient values to a fresh independent baseline", () => {
    const run = createRunState({
      themeId: knightMagicTheme.id,
      characterId,
      baseStats: character.baseStats,
    });
    const reset = resetRunState(advanceRunState(run, 5000));

    expect(reset.status).toBe("playing");
    expect(reset.elapsedMs).toBe(0);
    expect(reset.player.health).toBe(reset.player.stats.maxHealth);
    expect(reset.player.stats).not.toBe(run.player.stats);
  });

  it("keeps profile data serializable and separate from the active run", () => {
    const profile = createInitialProfile({
      activeThemeId: knightMagicTheme.id,
      contentSchemaVersion: knightMagicTheme.schemaVersion,
      starterCharacterId: characterId,
    });

    expect(profile).toEqual({
      schemaVersion: 1,
      activeThemeId: "knight_magic",
      contentSchemaVersion: 1,
      selectedCharacterId: characterId,
      unlockedCharacterIds: [characterId],
    });
    expect(JSON.parse(JSON.stringify(profile))).toEqual(profile);
    expect(profile).not.toHaveProperty("elapsedMs");
  });

  it("produces the same simulation baseline for alternate presentation", () => {
    const alternateCharacter = alternateTheme.characters[0];
    if (!alternateCharacter) throw new Error("Missing alternate test character");

    const currentRun = createRunState({
      themeId: knightMagicTheme.id,
      characterId,
      baseStats: character.baseStats,
    });
    const alternateRun = createRunState({
      themeId: alternateTheme.id,
      characterId,
      baseStats: alternateCharacter.baseStats,
    });

    expect(alternateRun.player).toEqual(currentRun.player);
    expect(advanceRunState(alternateRun, 1000).elapsedMs).toBe(
      advanceRunState(currentRun, 1000).elapsedMs,
    );
  });
});
