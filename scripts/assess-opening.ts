/** Reproduce Q4's counterfactual comparison without changing theme data. */
import { writeFile } from "node:fs/promises";
import { ecoGuardianTheme } from "../src/game/content/themes/eco-guardian";
import { archetypeIds } from "../src/game/core/archetypes/ids";
import { difficultyIds } from "../src/game/core/archetypes/difficulty";
import { resolveDifficultyTheme } from "../src/game/systems/difficulty/resolve-difficulty";
import { reduceByArmour, rollDamage } from "../src/game/systems/combat";
import { buildModels } from "../src/game/systems/simulation/build-models";
import { simulatePacing } from "../src/game/systems/simulation/pacing-simulator";

const variants = [
  { name: "previous", health: 11, damage: 10 },
  { name: "lower-health", health: 9, damage: 10 },
  { name: "raise-damage", health: 11, damage: 12.2 },
];
const results = variants.flatMap((variant) => {
  const theme = { ...ecoGuardianTheme,
    enemies: ecoGuardianTheme.enemies.map((enemy) => enemy.id === archetypeIds.enemy.fastFragile ? { ...enemy, maxHealth: variant.health } : enemy),
    weapons: ecoGuardianTheme.weapons.map((weapon) => ({ ...weapon, damage: variant.damage })),
  };
  return difficultyIds.map((difficulty) => {
    const resolved = resolveDifficultyTheme(theme, difficulty);
    const enemy = resolved.enemies.find((enemy) => enemy.id === archetypeIds.enemy.fastFragile)!;
    const weapon = resolved.weapons[0]!;
    const player = resolved.characters[0]!.baseStats;
    const damage = reduceByArmour(rollDamage({ baseDamage: weapon.damage, damageBonus: player.damageBonus,
      critChance: weapon.critChance ?? player.critChance, critDamage: weapon.critDamage ?? player.critDamage, random: () => 0.99,
    }).damage, enemy.armour, weapon.armourPierce);
    return { variant: variant.name, difficulty, baseHealth: variant.health, baseDamage: variant.damage,
      startingHealth: enemy.maxHealth, ordinaryHitDamage: damage, openingHits: Math.ceil(enemy.maxHealth / damage),
      builds: buildModels.map((build) => {
        const report = simulatePacing({ theme, difficulty, build, durationMs: 300_000, chaos: 1 });
        return { id: build.id, finalLevel: report.finalLevel, totalKills: report.totalKills,
          totalXp: report.totalXp, peakLiveEnemies: report.peakLiveEnemies };
      }),
    };
  });
});
const report = { scope: "Deterministic five-simulation-minute pacing; no movement/contact survival or device performance prediction.", results };
if (process.argv[2]) await writeFile(process.argv[2], JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(results.map(({ builds, ...result }) => ({ ...result, damageRush: builds.find(({ id }) => id === "damage-rush") })), null, 2));
