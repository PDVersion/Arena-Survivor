import type { ThemeManifest } from "../../core/archetypes/contracts";
import { archetypeIds } from "../../core/archetypes/ids";
import type { RunState } from "../../state/run-state";
import type { ProfileState } from "../../state/profile-state";

const number = (value: number): string => Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
export interface CapabilityProgress { readonly name: string; readonly description: string; readonly display: string }
export function selectCapabilityProgress(theme: ThemeManifest, profile: ProfileState): readonly CapabilityProgress[] {
  return (theme.unlocks ?? []).map((grant) => {
    const unlocked = (grant.kind === "weapon" ? profile.unlockedWeaponIds : profile.unlockedUpgradeIds).includes(grant.id);
    const value = grant.metric === "runsPlayed" ? profile.statistics.runsPlayed : profile.statistics.totalKills;
    return { name: theme.copy.content[grant.id].name, description: theme.copy.content[grant.id].description,
      display: unlocked ? theme.copy.profile.unlocked : `${Math.min(value, grant.required)}/${grant.required} ${grant.metric === "runsPlayed" ? theme.copy.profile.finishedRuns : theme.copy.profile.lifetimeKills}` };
  });
}

export interface RunReview { readonly tools: readonly string[]; readonly choices: readonly string[]; readonly next: string; readonly bossDefeated: boolean }
/** Read-only evidence. Damage contributions partition the existing ledger, not add to it. */
export function selectRunReview(state: RunState, theme: ThemeManifest, availableWeaponIds: readonly string[]): RunReview {
  const copy = theme.copy.mastery;
  const name = (id: string) => theme.copy.content[id as keyof typeof theme.copy.content]?.name ?? id;
  const tools = Object.entries(state.statistics.damageByWeapon).filter(([, amount]) => amount! > 0)
    .sort(([a], [b]) => a.localeCompare(b)).map(([id, amount]) => `${name(id)}: ${number(amount!)}`);
  const attributed = Object.values(state.statistics.damageByWeapon).reduce<number>((sum, amount) => sum + (amount ?? 0), 0);
  const other = Math.max(0, state.statistics.totalDamage - attributed);
  if (number(other) !== "0") tools.push(`${copy.otherDamage}: ${number(other)}`);
  if (!tools.length) tools.push(copy.noDamage);
  const choices = [
    ...Object.entries(state.world.shrineActivations).filter(([, count]) => count! > 0).map(([id, count]) => `${name(id)} ×${count}`),
    ...state.world.acceptedCurseIds.map(name),
  ];
  const secondary = archetypeIds.weapon.secondary;
  const evolved = archetypeIds.weapon.secondaryEvolved;
  const ownsSecond = state.weaponSlots.some((slot) => slot.weaponId === secondary || slot.weaponId === evolved);
  const evolution = theme.upgrades.flatMap((upgrade) => upgrade.effects).find((effect) => effect.kind === "weapon.evolve" && effect.fromWeaponId === secondary);
  let next: string;
  if (!ownsSecond) next = (availableWeaponIds.includes(secondary) ? copy.tryEquip : copy.tryFirst).replaceAll("{name}", name(secondary));
  else if (!state.weaponSlots.some((slot) => slot.weaponId === evolved) && evolution?.kind === "weapon.evolve") {
    const picked = state.selectedUpgradeIds.filter((id) => id === evolution.requiredUpgradeId).length;
    next = picked >= evolution.requiredPicks ? copy.tryReady.replaceAll("{name}", name(evolved)) : copy.tryEvolve.replaceAll("{name}", name(evolution.requiredUpgradeId)).replaceAll("{picked}", String(picked))
      .replaceAll("{required}", String(evolution.requiredPicks)).replaceAll("{evolved}", name(evolved));
  } else if (!choices.length) next = copy.tryRisk;
  else next = state.finalBossDefeated ? copy.tryCalm : copy.tryRecovery;
  return Object.freeze({ tools: Object.freeze(tools), choices: Object.freeze(choices.length ? choices : [copy.noChoices]), next,
    bossDefeated: state.finalBossDefeated });
}
