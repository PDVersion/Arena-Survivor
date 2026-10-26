import type { PlayerBaseStats } from "../../core/stats/player-stats";
export type DropKind = "money" | "magnet" | "food" | "impact";
export interface EconomyDefinition {
  readonly criticalPresentation: readonly { readonly colour: string; readonly size: number }[];
  readonly denominations: readonly [number, number];
  readonly dropChances: Readonly<Record<"magnet" | "food" | "impact", number>>;
  readonly fortuneScale: number;
  readonly maxDropChance: number;
  readonly foodHealth: number;
  readonly impactValue: number;
  readonly mergeDistance: number;
  readonly shop: readonly ShopItem[];
  readonly fragmentation: { readonly chance: number; readonly fortuneReduction: number; readonly cleanHitReduction: number; readonly critReduction: number; readonly parentShare: number; readonly totalShare: number; readonly childCount: number };
}
export interface ShopItem { readonly id: string; readonly name: string; readonly description: string; readonly maxLevel: number; readonly baseCost: number; readonly costGrowth: number; readonly stat: "maxHealth" | "damageBonus" | "luck" | "moveSpeed"; readonly perLevel: number }
export interface MetaEconomy { readonly impact: number; readonly upgrades: Readonly<Record<string, number>> }
export const emptyMetaEconomy = (): MetaEconomy => ({ impact: 0, upgrades: {} });
export function moneyTier(value: number, thresholds: readonly [number, number]): 0 | 1 | 2 { return value >= thresholds[1] ? 2 : value >= thresholds[0] ? 1 : 0; }
export function dropChance(base: number, fortune: number, definition: EconomyDefinition): number {
  return Math.min(definition.maxDropChance, base * (1 + Math.max(0, fortune) * definition.fortuneScale));
}
export function shopCost(item: ShopItem, level: number): number { return Math.ceil(item.baseCost * item.costGrowth ** level); }
export function purchaseImpact(economy: MetaEconomy, item: ShopItem): MetaEconomy {
  const level = economy.upgrades[item.id] ?? 0, cost = shopCost(item, level);
  if (level >= item.maxLevel || economy.impact < cost) return economy;
  return { impact: economy.impact - cost, upgrades: { ...economy.upgrades, [item.id]: level + 1 } };
}
export function applyImpactBonuses<T extends PlayerBaseStats>(stats: T, economy: MetaEconomy, shop: readonly ShopItem[]): T {
  const result = { ...stats };
  for (const item of shop) Object.assign(result, { [item.stat]: result[item.stat] + Math.min(item.maxLevel, economy.upgrades[item.id] ?? 0) * item.perLevel });
  return result;
}
export function fragmentationChance(definition: EconomyDefinition, fortune: number, hits: number, lethalFraction: number, critical: boolean, careLevel: number): number {
  const f = definition.fragmentation;
  const clean = hits <= 1 || lethalFraction >= 1;
  return Math.max(0, Math.min(1, f.chance - Math.max(0, fortune) * f.fortuneReduction - careLevel * f.cleanHitReduction
    - (clean ? f.cleanHitReduction : 0) - (critical ? f.critReduction : 0)));
}
export interface ActiveClock { readonly at: number; readonly active: boolean }
export function sampleActiveClock(previous: ActiveClock | undefined, at: number, active: boolean): { clock: ActiveClock; deltaMs: number } {
  return { clock: { at, active }, deltaMs: previous?.active && active ? Math.max(0, at - previous.at) : 0 };
}
