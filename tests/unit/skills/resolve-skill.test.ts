import { describe, expect, it } from "vitest";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import {
  chainScaleAtDepth,
  explosionDamage,
  findSkillEffect,
  isSkillActive,
  raiseSkillLevel,
  resolveBloodlust,
  resolveChain,
  resolveExplosion,
  resolveFractureChance,
  resolveMomentum,
  skillLevel,
  skillMaxLevel,
} from "../../../src/game/systems/skills/resolve-skill";

const skills = ecoGuardianTheme.skills;
const explosion = findSkillEffect(skills, archetypeIds.skill.onKillExplosion, "on_kill_explosion")!;
const chain = findSkillEffect(skills, archetypeIds.skill.chainReaction, "chain_reaction")!;

describe("skill levels", () => {
  it("treats an untaken skill as inactive at level zero", () => {
    expect(skillLevel({}, archetypeIds.skill.fracture)).toBe(0);
    expect(isSkillActive({}, archetypeIds.skill.fracture)).toBe(false);
    expect(isSkillActive({ [archetypeIds.skill.fracture]: 1 }, archetypeIds.skill.fracture)).toBe(true);
  });

  it("raises a level and stops at the cap", () => {
    let levels = raiseSkillLevel({}, archetypeIds.skill.fracture, 3);
    expect(skillLevel(levels, archetypeIds.skill.fracture)).toBe(1);
    for (let take = 0; take < 10; take += 1) {
      levels = raiseSkillLevel(levels, archetypeIds.skill.fracture, 3);
    }
    expect(skillLevel(levels, archetypeIds.skill.fracture)).toBe(3);
  });

  it("stays serializable", () => {
    const levels = raiseSkillLevel({}, archetypeIds.skill.bloodlust, 4);
    expect(JSON.parse(JSON.stringify(levels))).toEqual(levels);
  });
});

describe("detonation scaling", () => {
  it("matches the declared level table", () => {
    const table: readonly (readonly [number, number, number, number])[] = [
      [1, 44, 0.3, 3],
      [2, 56, 0.38, 5],
      [3, 68, 0.46, 7],
      [4, 80, 0.54, 9],
      [6, 104, 0.7, 13],
      [8, 128, 0.86, 17],
    ];

    for (const [level, radius, share, flat] of table) {
      const resolved = resolveExplosion(explosion, level);
      expect(resolved.radius).toBeCloseTo(radius);
      expect(resolved.victimHealthShare).toBeCloseTo(share);
      expect(resolved.flatDamage).toBeCloseTo(flat);
    }
  });

  it("starts smaller than the V0.2 fixed blast so investment has somewhere to go", () => {
    // V0.2 was a permanent 96-unit radius regardless of investment.
    expect(resolveExplosion(explosion, 1).radius).toBeLessThan(96);
    expect(resolveExplosion(explosion, explosion.maxShare > 0 ? 8 : 8).radius).toBeGreaterThan(96);
  });

  it("never exceeds the declared share cap", () => {
    expect(resolveExplosion(explosion, 99).victimHealthShare).toBeLessThanOrEqual(explosion.maxShare);
  });

  it("scales damage from what died rather than a flat number", () => {
    const resolved = resolveExplosion(explosion, 1);
    const light = explosionDamage(resolved, 11);
    const durable = explosionDamage(resolved, 96);

    // Clearing a durable target must be worth far more than popping a light one.
    expect(durable).toBeGreaterThan(light * 2);
    expect(light).toBeGreaterThan(0);
  });

  it("pays out more as spawn-time health scaling raises the victim", () => {
    const resolved = resolveExplosion(explosion, 3);
    expect(explosionDamage(resolved, 20 * 1.5)).toBeGreaterThan(explosionDamage(resolved, 20));
  });

  it("never returns negative damage for a nonsense victim", () => {
    expect(explosionDamage(resolveExplosion(explosion, 1), -100)).toBeGreaterThanOrEqual(0);
  });
});

describe("chain scaling", () => {
  it("matches the declared depth and falloff table", () => {
    const table: readonly (readonly [number, number, number, number])[] = [
      [1, 2, 0.7, 0.85],
      [2, 3, 0.74, 0.87],
      [3, 4, 0.78, 0.89],
      [4, 5, 0.82, 0.91],
      [5, 6, 0.86, 0.93],
    ];

    for (const [level, depth, damage, radius] of table) {
      const resolved = resolveChain(chain, level);
      expect(resolved.maxDepth).toBe(depth);
      expect(resolved.damageFalloff).toBeCloseTo(damage);
      expect(resolved.radiusFalloff).toBeCloseTo(radius);
    }
  });

  it("shrinks damage and radius with depth so a chain stays finite and readable", () => {
    const resolved = resolveChain(chain, 1);
    expect(chainScaleAtDepth(resolved, 0)).toEqual({ damage: 1, radius: 1 });
    expect(chainScaleAtDepth(resolved, 1).damage).toBeCloseTo(0.7);
    expect(chainScaleAtDepth(resolved, 2).damage).toBeCloseTo(0.49);
    expect(chainScaleAtDepth(resolved, 3).damage).toBeLessThan(
      chainScaleAtDepth(resolved, 2).damage,
    );
  });

  it("never lets falloff reach or exceed one, which would make chains infinite", () => {
    for (let level = 1; level <= 20; level += 1) {
      expect(resolveChain(chain, level).damageFalloff).toBeLessThanOrEqual(1);
    }
  });
});

describe("other skill scaling", () => {
  it("raises momentum, fracture chance, and bloodlust per level", () => {
    const momentum = findSkillEffect(skills, archetypeIds.skill.piercingMomentum, "piercing_momentum")!;
    const fracture = findSkillEffect(skills, archetypeIds.skill.fracture, "fracture")!;
    const bloodlust = findSkillEffect(skills, archetypeIds.skill.bloodlust, "bloodlust")!;

    expect(resolveMomentum(momentum, 1)).toBeCloseTo(0.1);
    expect(resolveMomentum(momentum, 3)).toBeCloseTo(0.3);

    expect(resolveFractureChance(fracture, 1)).toBeCloseTo(0.15);
    expect(resolveFractureChance(fracture, 3)).toBeCloseTo(0.25);
    expect(resolveFractureChance(fracture, 99)).toBeLessThanOrEqual(1);

    expect(resolveBloodlust(bloodlust, 1).attackSpeedPerStep).toBeCloseTo(0.01);
    expect(resolveBloodlust(bloodlust, 3).attackSpeedPerStep).toBeCloseTo(0.02);
    // Window and step count are level-independent.
    expect(resolveBloodlust(bloodlust, 5).windowMs).toBe(bloodlust.windowMs);
  });

  it("returns base values at level one for every scaled effect", () => {
    expect(resolveExplosion(explosion, 1).radius).toBe(explosion.baseRadius);
    expect(resolveChain(chain, 1).maxDepth).toBe(chain.baseDepth);
  });
});

describe("skill content", () => {
  it.each([
    ["eco-guardian", ecoGuardianTheme],
    ["knight-magic", knightMagicTheme],
  ])("declares a cap above one for every %s skill", (_name, theme) => {
    for (const skill of theme.skills) {
      expect(skill.maxLevel).toBeGreaterThan(1);
      expect(skillMaxLevel(theme.skills, skill.id)).toBe(skill.maxLevel);
    }
  });

  it.each([
    ["eco-guardian", ecoGuardianTheme],
    ["knight-magic", knightMagicTheme],
  ])("keeps every %s skill upgrade within its skill's cap", (_name, theme) => {
    for (const upgrade of theme.upgrades) {
      for (const effect of upgrade.effects) {
        if (effect.kind !== "skill.level") continue;
        // Otherwise the last upgrade levels would silently do nothing, which is
        // the wasted-pick defect in a new shape.
        expect(upgrade.maxLevel).toBeLessThanOrEqual(skillMaxLevel(theme.skills, effect.skillId));
      }
    }
  });
});
