import { archetypeIds as ids } from "../../../core/archetypes/ids";
import type { CleanupToolDefinition, UpgradeDefinition } from "../../../core/archetypes/contracts";
const base = { radius: 90, damage: 4, tickMs: 750, slow: .08, count: 1, rows: 1, speed: 1.8,
  throwDistance: 150, flightMs: 500, fuseMs: 2200, dotMs: 3000, dotDamage: 2,
  headRadius: 16, rowSpacing: 42, displayWidth: 56 };
export const aura = { ...base, kind: "aura", tracks: [
  { id: ids.upgrade.secondaryRange, stat: "radius", step: 15 },
  { id: ids.upgrade.auraDamage, stat: "damage", step: 2 },
  { id: ids.upgrade.auraTick, stat: "tickMs", step: -100 },
  { id: ids.upgrade.auraSlow, stat: "slow", step: .03 },
] } as const satisfies CleanupToolDefinition;
export const bin = { ...base, kind: "bin", radius: 58, damage: 28, tickMs: 650, slow: 0, tracks: [
  { id: ids.upgrade.binDamage, stat: "damage", step: 10 },
  { id: ids.upgrade.binCount, stat: "count", step: 1 },
  { id: ids.upgrade.binRadius, stat: "radius", step: 10 },
  { id: ids.upgrade.binDot, stat: "dotDamage", step: 2 },
] } as const satisfies CleanupToolDefinition;
export const rake = { ...base, kind: "orbit", radius: 84, count: 2, damage: 9, tickMs: 650, slow: 0, tracks: [
  { id: ids.upgrade.rakeDamage, stat: "damage", step: 4 },
  { id: ids.upgrade.rakeCount, stat: "count", step: 1 },
  { id: ids.upgrade.rakeRows, stat: "rows", step: 1 },
  { id: ids.upgrade.rakeSpeed, stat: "speed", step: .35 },
] } as const satisfies CleanupToolDefinition;
export const toolUpgrades = (weaponId: typeof ids.weapon[keyof typeof ids.weapon], tool: CleanupToolDefinition): UpgradeDefinition[] =>
  tool.tracks.map((track) => ({ id: track.id, ownerWeaponId: weaponId, effects: [{ kind: "tool.upgrade", weaponId }],
    maxLevel: 4, track: "weapon", rarity: "common", category: "offense", presentationToken: "accent" }));
export const toolAcquisitions: UpgradeDefinition[] = [
  [ids.upgrade.binEquip, ids.weapon.cleaningBin], [ids.upgrade.rakeEquip, ids.weapon.orbitingRake],
].map(([id, weaponId]) => ({ id: id as UpgradeDefinition["id"], effects: [{ kind: "weapon.equip", weaponId: weaponId as typeof ids.weapon.cleaningBin }],
  maxLevel: 1, track: "weapon", rarity: "common", category: "offense", presentationToken: "accent" }));
