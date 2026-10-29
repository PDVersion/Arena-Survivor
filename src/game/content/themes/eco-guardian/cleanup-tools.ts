import { archetypeIds as ids } from "../../../core/archetypes/ids";
import type { CleanupToolDefinition, UpgradeDefinition } from "../../../core/archetypes/contracts";
import type { UpgradeId, WeaponId } from "../../../core/archetypes/ids";
const base = { radius: 90, damage: 4, tickMs: 750, slow: .08, count: 1, rows: 1, speed: 1.8,
  throwDistance: 150, flightMs: 500, fuseMs: 2200, dotMs: 3000, dotDamage: 2,
  headRadius: 16, rowSpacing: 42, displayWidth: 56, tracks: [] };
export const aura: CleanupToolDefinition = { ...base, kind: "aura", progression: { id: ids.upgrade.auraDamage, levels: [
  { description: "A grey cleaning aura damages and slightly slows nearby waste." },
  { radius: 105, description: "Wider suction: radius 90 →105." },
  { radius: 105, damage: 6, description: "Stronger suction: damage 4 →6 per tick." },
  { radius: 130, damage: 6, slow: .14, description: "Larger holding field: radius 130 and 14% slow." },
  { radius: 130, damage: 6, slow: .14, tickMs: 550, description: "Faster airflow: tick interval 750 →550 ms." },
  { radius: 130, damage: 9, slow: .14, tickMs: 550, description: "Heavy cleanup: damage 6 →9 per tick." },
  { radius: 150, damage: 12, slow: .22, tickMs: 450, description: "Maximum airflow: radius 150, damage 12,450 ms ticks,22% slow." },
] } };
export const bin: CleanupToolDefinition = { ...base, kind: "bin", radius: 58, damage: 28, tickMs: 650, slow: 0, displayWidth: 38,
  progression: { id: ids.upgrade.binDamage, levels: [
    { description: "One small thrown bin cleans its landing area, then bursts." },
    { radius: 70, description: "Wider cleaning pool: radius 58 →70." },
    { radius: 70, count: 2, description: "Throw two bins per cycle." },
    { radius: 70, count: 2, damage: 37, dotDamage: 4, fuseMs: 3200, dotMs: 4000, description: "Stronger burst and DOT; landed bins last an extra second." },
    { radius: 80, count: 2, damage: 48, dotDamage: 6, fuseMs: 3200, dotMs: 4000, description: "Damage 48, landing DOT 6 and radius 80." },
    { radius: 80, count: 3, damage: 48, dotDamage: 6, fuseMs: 3200, dotMs: 4000, description: "Throw three bins per cycle." },
    { radius: 95, count: 4, damage: 60, dotDamage: 8, fuseMs: 3200, dotMs: 4000, description: "Four bins, radius 95, burst 60 and landing DOT 8." },
] } };
export const rake: CleanupToolDefinition = { ...base, kind: "orbit", radius: 84, count: 2, damage: 9, tickMs: 650, slow: 0,
  progression: { id: ids.upgrade.rakeDamage, levels: [
    { description: "Two shovels orbit clockwise, with their heads leading." },
    { count: 3, description: "Add one shovel: three orbiting heads." },
    { count: 3, damage: 12, speed: 2.1, description: "Stronger, faster shovels: damage 12, rotation 2.1 rad/s." },
    { count: 4, damage: 12, speed: 2.1, description: "Add one shovel: four orbiting heads." },
    { count: 4, damage: 17, speed: 2.1, description: "Stronger blades: damage 12 →17." },
    { count: 5, damage: 17, speed: 2.1, description: "Add one shovel: five orbiting heads." },
    { count: 5, damage: 24, speed: 2.5, description: "Maximum shovels: damage 24 and rotation 2.5 rad/s." },
] } };
export const beam: CleanupToolDefinition = { ...base, kind: "beam", damage: 18, tickMs: 3000, slow: 0, speed: 550, headRadius: 22, displayWidth: 64,
  progression: { id: ids.upgrade.beamLevel, levels: [
    { description: "A rake sweeps straight to the screen edge in your last movement direction." },
    { headRadius: 29, displayWidth: 76, description: "Wider rake head: contact radius 22 →29." },
    { headRadius: 29, displayWidth: 76, damage: 25, description: "Stronger sweep: damage 18 →25." },
    { headRadius: 29, displayWidth: 76, damage: 25, count: 2, description: "Two parallel rake sweeps per cycle." },
    { headRadius: 36, displayWidth: 88, damage: 35, count: 2, description: "Broad, strong sweep: damage 35 and contact radius 36." },
    { headRadius: 36, displayWidth: 88, damage: 35, count: 2, tickMs: 2100, speed: 720, description: "Faster launch and travel:2.1 seconds between sweeps." },
    { headRadius: 40, displayWidth: 96, damage: 48, count: 3, tickMs: 2100, speed: 720, description: "Three broad rake sweeps with 48 damage each." },
] } };
export const fixedUpgrade = (id: UpgradeId, weaponId: WeaponId): UpgradeDefinition => ({ id, ownerWeaponId: weaponId,
  effects: [{ kind: "tool.upgrade", weaponId }], maxLevel: 6, track: "weapon", rarity: "common", category: "offense", presentationToken: "accent" });
export const toolUpgrades = (weaponId: WeaponId, tool: CleanupToolDefinition): UpgradeDefinition[] =>
  tool.progression ? [fixedUpgrade(tool.progression.id, weaponId)] : [];
export const toolAcquisitions: UpgradeDefinition[] = [
  [ids.upgrade.binEquip, ids.weapon.cleaningBin], [ids.upgrade.rakeEquip, ids.weapon.orbitingRake], [ids.upgrade.beamEquip, ids.weapon.rakeBeam],
].map(([id, weaponId]) => ({ id: id as UpgradeId, effects: [{ kind: "weapon.equip", weaponId: weaponId as WeaponId }],
  maxLevel: 1, track: "weapon", rarity: "common", category: "offense", presentationToken: "accent" }));
