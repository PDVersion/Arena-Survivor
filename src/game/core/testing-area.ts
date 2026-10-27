import type { EnemyId, UpgradeId, WeaponId } from "./archetypes/ids";
import type { DropKind } from "../systems/economy/economy";
export interface TestingLoadout { level: number; money: number; impact: number; health: number; weapons: readonly WeaponId[]; upgrades: Readonly<Partial<Record<UpgradeId, number>>> }
export interface TestingAreaController {
  configure(loadout: TestingLoadout): void;
  spawn(id: EnemyId, count: number, distance: number): void;
  pickup(kind: DropKind, value: number, distance: number): void;
  hit(amount: number): void;
  clear(): void;
  pause(paused: boolean): void;
  natural(enabled: boolean): void;
  invincible(enabled: boolean): void;
  read(): { elapsedMs: number; level: number; money: number; impact: number; health: number; enemies: number; moneyOnGround: number; pickupCount: number; status: string };
}
