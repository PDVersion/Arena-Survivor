import { describe, it, expect } from "vitest";
import { economy } from "../../../src/game/content/themes/eco-guardian/economy";
import { moneyTier, dropChance, purchaseImpact, applyImpactBonuses, sampleActiveClock } from "../../../src/game/systems/economy/economy";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { migrateProfile, validateProfile } from "../../../src/game/systems/persistence/profile-validation";
import { createInitialProfile } from "../../../src/game/state/profile-state";
describe("money and durable Impact", () => {
  it("uses silver/gold/note without rounding the amount", () => {
    expect([1,3.99,4,24.9,25,1000].map((v) => moneyTier(v,economy.denominations))).toEqual([0,0,1,1,2,2]);
  });
  it("makes food slightly more likely than magnet and Fortune helps with a hard cap", () => {
    expect(economy.dropChances.food).toBeGreaterThan(economy.dropChances.magnet);
    for(const base of Object.values(economy.dropChances)) {
      expect(dropChance(base,50,economy)).toBeGreaterThan(dropChance(base,0,economy));
      expect(dropChance(base,1e9,economy)).toBe(economy.maxDropChance);
    }
  });
  it("purchases once at the exact cost and cannot overspend or exceed a cap", () => {
    const item=economy.shop[0];
    const p={impact:5,upgrades:{}};
    const bought=purchaseImpact(p,item);
    expect(bought).toEqual({impact:0,upgrades:{[item.id]:1}});
    expect(purchaseImpact(bought,item)).toBe(bought);
    const capped={impact:9999,upgrades:{[item.id]:5}};
    expect(purchaseImpact(capped,item)).toBe(capped);
    expect(p.impact).toBe(5);
  });
  it("applies capped shop bonuses to a fresh copy only", () => {
    const stats=ecoGuardianTheme.characters[0]!.baseStats;
    const after=applyImpactBonuses(stats,{impact:0,upgrades:{"shop.safety":100}},economy.shop);
    expect(after.maxHealth).toBe(stats.maxHealth+25);
    expect(after).not.toBe(stats);
  });
  it("migrates schema2 to empty Impact without changing existing progress", () => {
    const p=createInitialProfile({activeThemeId:"eco_guardian",contentSchemaVersion:1,starterCharacterId:"character.starter"});
    const {economy: _old,...legacy}=p; void _old;
    const migrated=migrateProfile({...legacy,schemaVersion:2});
    expect(migrated.profile.schemaVersion).toBe(3);
    expect(migrated.profile.economy).toEqual({impact:0,upgrades:{}});
    expect(migrated.profile.statistics).toEqual(p.statistics);
    expect(()=>validateProfile({...p,economy:{impact:-1,upgrades:{}}})).toThrow();
  });
  it("counts stalled active wall time but excludes menu and resume gaps", () => {
    let c=sampleActiveClock(undefined,100,true);
    c=sampleActiveClock(c.clock,2200,true);expect(c.deltaMs).toBe(2100);
    c=sampleActiveClock(c.clock,2300,false);expect(c.deltaMs).toBe(0);
    c=sampleActiveClock(c.clock,9000,true);expect(c.deltaMs).toBe(0);
    c=sampleActiveClock(c.clock,9100,true);expect(c.deltaMs).toBe(100);
  });
});
