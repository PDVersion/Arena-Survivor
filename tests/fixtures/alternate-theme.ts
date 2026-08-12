import { archetypeIds } from "../../src/game/core/archetypes/ids";
import type { ThemeCopy } from "../../src/game/core/archetypes/contracts";
import { defineTheme } from "../../src/game/content/define-theme";

const content = Object.fromEntries(
  Object.values(archetypeIds).flatMap((category) =>
    Object.values(category).map((id) => [id, { name: `Test ${id}`, description: `Test copy for ${id}` }]),
  ),
) as ThemeCopy["content"];

export const alternateTheme = defineTheme({
  id: "alternate_test",
  schemaVersion: 1,
  copy: {
    gameTitle: "Test Swarm",
    arenaName: "Neon Test Grid",
    bootStatus: "Fixture ready",
    bootFailure: "Fixture failed",
    movementHint: "Use test controls",
    levelUpTitle: "Select test modifier",
    vocabulary: {
      health: "Test health",
      experience: "Test XP",
      level: "Test level",
      time: "Test time",
      kills: "Test kills",
      enemies: "Test enemies",
      paused: "Test paused",
      deathTitle: "Test defeat",
      deathMessage: "Test defeat message",
      completeTitle: "Test victory",
      completeMessage: "Test victory message",
      restartAction: "Test restart",
    },
    content,
  },
  tokens: {
    palette: {
      background: "#111111",
      floor: "#222222",
      grid: "#333333",
      accent: "#00ff00",
      text: "#ffffff",
      player: "#ff00ff",
      enemy: "#00ffff",
      projectile: "#ffff00",
      critical: "#ff8800",
      pickup: "#88ff88",
    },
    playerShape: "circle",
  },
  characters: [
    {
      id: archetypeIds.character.starter,
      radius: 18,
      presentationToken: "player",
      baseStats: {
        maxHealth: 100,
        moveSpeed: 200,
        armour: 0,
        regeneration: 0,
        pickupRadius: 80,
        damageBonus: 0,
        attackSpeedBonus: 0,
        critChance: 0.05,
        critDamage: 2,
        luck: 0,
        xpMultiplier: 1,
      },
    },
  ],
  weapons: [
    {
      id: archetypeIds.weapon.starterProjectile,
      damage: 10,
      cooldownMs: 1000,
      projectileSpeed: 400,
      projectileLifetimeMs: 2400,
      projectileRadius: 6,
      projectileCount: 1,
      pierce: 0,
      presentationToken: "projectile",
    },
  ],
  enemies: [
    {
      id: archetypeIds.enemy.swarmBasic,
      maxHealth: 20,
      moveSpeed: 70,
      contactDamage: 10,
      contactCooldownMs: 1000,
      radius: 14,
      xpReward: 1,
      presentationToken: "enemy",
    },
  ],
  pickups: [
    {
      id: archetypeIds.pickup.experience,
      radius: 7,
      magnetSpeed: 320,
      presentationToken: "pickup",
    },
  ],
  upgrades: [
    { id: archetypeIds.upgrade.damage, effects: [{ kind: "stat.add", target: "player.damageBonus", value: 0.25 }], presentationToken: "accent" },
    { id: archetypeIds.upgrade.attackSpeed, effects: [{ kind: "stat.add", target: "player.attackSpeedBonus", value: 0.2 }], presentationToken: "accent" },
    { id: archetypeIds.upgrade.critChance, effects: [{ kind: "stat.add", target: "player.critChance", value: 0.1 }], presentationToken: "accent" },
    { id: archetypeIds.upgrade.pierce, effects: [{ kind: "stat.add", target: "weapon.pierce", value: 1 }], presentationToken: "accent" },
    { id: archetypeIds.upgrade.projectileCount, effects: [{ kind: "stat.add", target: "weapon.projectileCount", value: 1 }], presentationToken: "accent" },
    { id: archetypeIds.upgrade.moveSpeed, effects: [{ kind: "stat.add", target: "player.moveSpeed", value: 30 }], presentationToken: "accent" },
    { id: archetypeIds.upgrade.health, effects: [{ kind: "stat.add", target: "player.maxHealth", value: 25 }], presentationToken: "accent" },
    { id: archetypeIds.upgrade.pickupRadius, effects: [{ kind: "stat.add", target: "player.pickupRadius", value: 40 }], presentationToken: "accent" },
  ],
});
