import { archetypeIds } from "../../../core/archetypes/ids";
import type { EnemyDefinition } from "../../../core/archetypes/contracts";

/**
 * Move speed has come down three times since V0.3 shipped, in step with the
 * production pack: this theme shares the roster shape, the player speed, and
 * REC-049's spawn envelope. The fast role also changed purpose — it now sits
 * just below the player rather than just above, so it forces movement without
 * overrunning. Health, contact harm, and rewards are unchanged.
 *
 *   role         V0.3    now    ring crossing    vs player 200
 *   Grunt         140    104          9.2 s      0.52x
 *   Runner        240    190          5.0 s      0.95x
 *   Tank           90     70         13.7 s      0.35x
 *   Broodmother   110     80         12.0 s      0.40x
 *
 * See REC-058, REC-061, and REC-066.
 */
export const enemies = [
  {
    id: archetypeIds.enemy.swarmBasic,
    maxHealth: 20,
    moveSpeed: 104,
    contactDamage: 10,
    contactCooldownMs: 1000,
    radius: 14,
    displayDiameter: 28,
    xpReward: 1,
    armour: 0,
    geometry: "circle",
    presentationToken: "enemy",
    fragmentInto: archetypeIds.enemy.fastFragile,
  },
  {
    id: archetypeIds.enemy.fastFragile,
    maxHealth: 10,
    moveSpeed: 190,
    contactDamage: 8,
    contactCooldownMs: 1000,
    radius: 10,
    displayDiameter: 20,
    xpReward: 2,
    armour: 0,
    geometry: "triangle",
    presentationToken: "enemyFast",
  },
  {
    id: archetypeIds.enemy.slowDurable,
    maxHealth: 80,
    moveSpeed: 70,
    contactDamage: 20,
    contactCooldownMs: 1000,
    radius: 22,
    displayDiameter: 44,
    xpReward: 7,
    armour: 40,
    geometry: "square",
    presentationToken: "enemyTank",
    fragmentInto: archetypeIds.enemy.fastFragile,
  },
  {
    id: archetypeIds.enemy.deathSpawner,
    maxHealth: 50,
    moveSpeed: 80,
    contactDamage: 12,
    contactCooldownMs: 1000,
    radius: 25,
    displayDiameter: 50,
    xpReward: 5,
    armour: 10,
    geometry: "hexagon",
    presentationToken: "enemySpawner",
    deathSpawns: [{ enemyId: archetypeIds.enemy.fastFragile, count: 5, rewardMultiplier: 0.5 }],
  },
  {
    id: archetypeIds.enemy.stationaryFragment,
    maxHealth: 18,
    moveSpeed: 0,
    contactDamage: 7,
    contactCooldownMs: 1000,
    radius: 12,
    displayDiameter: 24,
    xpReward: 0,
    armour: 12,
    geometry: "triangle",
    presentationToken: "enemyTank",
  },
  {
    id: archetypeIds.enemy.miniBoss,
    maxHealth: 240, moveSpeed: 60, contactDamage: 12, contactCooldownMs: 1000,
    radius: 26, displayDiameter: 64, xpReward: 18, armour: 0,
    geometry: "hexagon", presentationToken: "enemyTank",
    boss: { kind: "mini", appearAt: 0.5,
      attack: { telegraphMs: 1200, recoveryMs: 2200, radius: 90, damage: 18 } },
  },
  {
    id: archetypeIds.enemy.finalBoss,
    maxHealth: 1200, moveSpeed: 55, contactDamage: 16, contactCooldownMs: 1000,
    radius: 32, displayDiameter: 90, xpReward: 40, armour: 0,
    geometry: "hexagon", presentationToken: "enemySpawner",
    boss: { kind: "final", appearAt: 1,
      attack: { telegraphMs: 1400, recoveryMs: 1800, radius: 120, damage: 24 } },
  },
  {
    // G2A authored weak-cluster game tuning; no persistence/harm fact is implied.
    id: archetypeIds.enemy.clusterFodder,
    maxHealth: 6, moveSpeed: 64, contactDamage: 3, contactCooldownMs: 1000,
    radius: 10, displayDiameter: 28, xpReward: 1, armour: 0,
    geometry: "circle", presentationToken: "enemyFast",
    arrivalCluster: { count: 3, spacing: 34 },
    primitiveParts: [{ x: 0, y: 0, width: 0.6, height: 0.6, rotation: 0.78, token: "enemySpawner" },
      { x: 0, y: 0, width: 0.22, height: 0.6, rotation: 0.78, token: "critical" }],
  },
  {
    // G2B fictional gust/interception role; authored game values, not material facts.
    id: archetypeIds.enemy.gustDrifter,
    maxHealth: 12, moveSpeed: 80, contactDamage: 5, contactCooldownMs: 1000,
    radius: 12, displayDiameter: 34, xpReward: 2, armour: 0,
    geometry: "square", presentationToken: "enemySpawner",
    committedMotion: { triggerRange: 150, telegraphMs: 900, travelMs: 900, recoveryMs: 1300,
      speedMultiplier: 2.5, aimOffsetRadians: 0.8, cueToken: "critical", cueWidth: 3 },
    primitiveParts: [{ x: 0, y: 0, width: 0.7, height: 0.55, rotation: 0.15, token: "enemySpawner" },
      { x: 0, y: 0, width: 0.15, height: 0.65, rotation: 0.15, token: "critical" }],
  },
  {
    // G2C direct committed roll: sidestep the shown route, then clear in recovery.
    id: archetypeIds.enemy.committedCharger,
    maxHealth: 18, moveSpeed: 90, contactDamage: 7, contactCooldownMs: 1000,
    radius: 14, displayDiameter: 38, xpReward: 3, armour: 0,
    geometry: "circle", presentationToken: "enemyTank",
    committedMotion: { triggerRange: 150, telegraphMs: 1000, travelMs: 1000, recoveryMs: 1400,
      speedMultiplier: 3.5, aimOffsetRadians: 0, cueToken: "critical", cueWidth: 3 },
    primitiveParts: [{ x: 0, y: 0, width: 0.8, height: 0.65, rotation: 0, token: "enemyFast" },
      { x: 0, y: 0, width: 0.36, height: 0.65, rotation: 0, token: "enemyTank" },
      { x: -0.4, y: 0, width: 0.1, height: 0.72, rotation: 0, token: "text" },
      { x: 0.4, y: 0, width: 0.1, height: 0.72, rotation: 0, token: "text" }],
  },
] as const satisfies readonly EnemyDefinition[];
