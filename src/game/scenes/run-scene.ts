import Phaser from "phaser";
import { activeTheme } from "../content/active-theme";
import { archetypeIds } from "../core/archetypes/ids";
import { eliteIds, type FeedbackCategory } from "../core/archetypes/categories";
import type {
  EnemyDefinition,
  PickupDefinition,
  ShrineDefinition,
  UpgradeDefinition,
  WeaponDefinition,
} from "../core/archetypes/contracts";
import { EnemyActor } from "../entities/enemy-actor";
import { PickupActor } from "../entities/pickup-actor";
import { PlayerActor } from "../entities/player-actor";
import { ProjectileActor } from "../entities/projectile-actor";
import { ShrineActor } from "../entities/shrine-actor";
import type { EnemySpawnSource } from "../entities/enemy-actor";
import { createInitialProfile } from "../state/profile-state";
import {
  advanceRunState,
  applyRunUpgrade,
  awardRunExperience,
  createRunState,
  damageRunPlayer,
  recordKill,
  setLiveEnemyCount,
  setRunStatus,
  type RunState,
} from "../state/run-state";
import type { DirectionalInput } from "../systems/player-movement";
import { canApplyContactDamage, rollDamage } from "../systems/combat";
import { canSpawn, pointOnSpawnRing, V01_SPAWN_LIMITS } from "../systems/spawning";
import { createDeathSpawns, selectEnemyDefinition } from "../systems/spawning";
import { findNearestTarget } from "../systems/targeting";
import { createSeededRandom, selectUpgradeChoices } from "../systems/upgrades";
import { LevelUpChoiceUi } from "../ui/level-up-choice-ui";
import { claimExperiencePickup } from "../systems/xp";
import { Hud } from "../ui/hud";
import { RunEndOverlay } from "../ui/run-end-overlay";
import { selectHudValues } from "../state/statistics";
import {
  activateShrineSurge,
  createShrineSurgeState,
  updateShrineSurge,
  type ShrineSurgeState,
} from "../systems/shrine-surge";
import { updateTestTelemetry } from "../../test-support/telemetry-bridge";
import { CausalEventQueue } from "../systems/events/causal-events";
import {
  selectBloodlust,
  shouldExplodeOnKill,
  shouldFracture,
  targetsWithinRadius,
} from "../systems/effects/on-kill-effects";
import { applyWorldChoice, selectWorldModifiers } from "../systems/chaos/world-modifiers";
import { AudioFeedbackService, FeedbackLimiter } from "../systems/feedback/feedback-service";
import { shouldSpawnElite } from "../systems/elites/elites";

export const ARENA_SIZE = Object.freeze({ width: 2400, height: 1600 });
const GRID_SIZE = 64;
const SPAWN_INTERVAL_MS = 400;
const SPAWN_RADIUS = 360;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const DEFAULT_UPGRADE_SEED = 0xa7e4_0001;
let runGenerationSequence = 0;

function testRunDurationMs(): number | undefined {
  if (import.meta.env.MODE !== "test") return undefined;
  const configured = Number(new URLSearchParams(window.location.search).get("runDurationMs"));
  return Number.isFinite(configured) && configured > 0 ? configured : undefined;
}

function testSurgeDurationMs(): number | undefined {
  if (import.meta.env.MODE !== "test") return undefined;
  const configured = Number(new URLSearchParams(window.location.search).get("surgeDurationMs"));
  return Number.isFinite(configured) && configured > 0 ? configured : undefined;
}

function testLoadHarnessCount(): number {
  if (import.meta.env.MODE !== "test") return 0;
  const configured = Number(new URLSearchParams(window.location.search).get("loadHarness"));
  return Number.isInteger(configured) && configured > 0 ? Math.min(configured, 300) : 0;
}

function testRosterHarnessSelection(): string | null {
  if (import.meta.env.MODE !== "test") return null;
  return new URLSearchParams(window.location.search).get("enemyRoster");
}

function testCombatNumber(name: string): number | undefined {
  if (import.meta.env.MODE !== "test") return undefined;
  const value = Number(new URLSearchParams(window.location.search).get(name));
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

function testSkillEnabled(name: string): boolean {
  return import.meta.env.MODE === "test" && new URLSearchParams(window.location.search).has(name);
}

function testWorldScenario(): string | null {
  if (import.meta.env.MODE !== "test") return null;
  return new URLSearchParams(window.location.search).get("worldScenario");
}

function prefersReducedMotion(): boolean {
  if (import.meta.env.MODE === "test" && new URLSearchParams(window.location.search).has("reducedMotion")) return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

interface MovementKeys {
  readonly up: Phaser.Input.Keyboard.Key;
  readonly down: Phaser.Input.Keyboard.Key;
  readonly left: Phaser.Input.Keyboard.Key;
  readonly right: Phaser.Input.Keyboard.Key;
}

type DamageSource = "direct" | "explosion" | "chained_explosion";
interface ExplosionEventPayload {
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly damage: number;
  readonly depth: number;
}

export class RunScene extends Phaser.Scene {
  private player?: PlayerActor;
  private runState?: RunState;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: MovementKeys;
  private pauseKey?: Phaser.Input.Keyboard.Key;
  private muteKey?: Phaser.Input.Keyboard.Key;
  private interactKeys: readonly Phaser.Input.Keyboard.Key[] = [];
  private choiceKeys: readonly Phaser.Input.Keyboard.Key[] = [];
  private enemyGroup?: Phaser.Physics.Arcade.Group;
  private projectileGroup?: Phaser.Physics.Arcade.Group;
  private pickupGroup?: Phaser.Physics.Arcade.Group;
  private enemies = new Set<EnemyActor>();
  private projectiles = new Set<ProjectileActor>();
  private pickups = new Set<PickupActor>();
  private enemyDefinition?: EnemyDefinition;
  private enemyDefinitions: readonly EnemyDefinition[] = [];
  private weaponDefinition?: WeaponDefinition;
  private pickupDefinition?: PickupDefinition;
  private shrineDefinition?: ShrineDefinition;
  private shrine?: ShrineActor;
  private shrineActors: ShrineActor[] = [];
  private surgeState: ShrineSurgeState = createShrineSurgeState();
  private levelUpUi?: LevelUpChoiceUi;
  private hud?: Hud;
  private runEndOverlay?: RunEndOverlay;
  private currentChoices: readonly UpgradeDefinition[] = [];
  private upgradeRandom = createSeededRandom(DEFAULT_UPGRADE_SEED);
  private enemyRandom = createSeededRandom(0xe11e_0002);
  private nextSpawnAtMs = 0;
  private nextFireAtMs = 0;
  private lastContactDamageAtMs = Number.NEGATIVE_INFINITY;
  private invulnerableUntilMs = 0;
  private spawnSequence = 0;
  private enemySequence = 0;
  private projectileSequence = 0;
  private shotsFired = 0;
  private criticalShots = 0;
  private highestCritTier = 0;
  private longestPierceChain = 0;
  private contactHits = 0;
  private pickupSequence = 0;
  private pickupsDropped = 0;
  private pickupsCollected = 0;
  private claimedPickupIds: ReadonlySet<string> = new Set();
  private focusPaused = false;
  private terminalShown = false;
  private runGeneration = 0;
  private hitFlashes = 0;
  private trailsEmitted = 0;
  private pickupCues = 0;
  private shrineFeedback = 0;
  private shrineEnemiesSpawned = 0;
  private shrineEnemiesDefeated = 0;
  private ambientXpDropped = 0;
  private shrineXpDropped = 0;
  private ambientXpCollected = 0;
  private shrineXpCollected = 0;
  private eventQueue = new CausalEventQueue();
  private loadEventQueue = new CausalEventQueue();
  private loadHarnessRequested = 0;
  private loadHarnessSpawned = 0;
  private liveHighWater = 0;
  private trackedHighWater = 0;
  private droppedPresentationCues = 0;
  private rosterHighWater: Record<string, number> = {};
  private offspringQueued = 0;
  private offspringSpawned = 0;
  private eventSequence = 0;
  private effectRandom = createSeededRandom(0xeffe_0004);
  private killTimesMs: number[] = [];
  private bloodlustAttackSpeedBonus = 0;
  private explosionsCommitted = 0;
  private chainExplosionsCommitted = 0;
  private fractureQueued = 0;
  private fractureSpawned = 0;
  private damageBySource = { direct: 0, explosion: 0, chained_explosion: 0 };
  private activeExplosionCues = 0;
  private testWorldScenarioApplied = false;
  private duplicatedEnemiesQueued = 0;
  private duplicatedEnemiesSpawned = 0;
  private eliteRandom = createSeededRandom(0xe117_0006);
  private eliteSpawned = 0;
  private eliteDefeated = 0;
  private eliteSpawnedByRole: Record<string, number> = {};
  private feedbackLimiter = new FeedbackLimiter();
  private audioFeedback = new AudioFeedbackService(activeTheme.tokens.sounds);
  private reducedMotion = false;

  constructor() {
    super("run");
  }

  create(): void {
    this.resetTransientRuntime();
    this.runGeneration = ++runGenerationSequence;
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable");

    const starter = activeTheme.characters.find(
      (character) => character.id === archetypeIds.character.starter,
    );
    if (!starter) throw new Error("The active theme has no starter character");

    const profile = createInitialProfile({
      activeThemeId: activeTheme.id,
      contentSchemaVersion: activeTheme.schemaVersion,
      starterCharacterId: starter.id,
    });
    const selectedCharacter = activeTheme.characters.find(
      (character) => character.id === profile.selectedCharacterId,
    );
    if (!selectedCharacter) throw new Error("The selected character is unavailable");
    this.enemyDefinitions = activeTheme.enemies;
    this.enemyDefinition = this.enemyDefinitions.find(
      (enemy) => enemy.id === archetypeIds.enemy.swarmBasic,
    );
    this.weaponDefinition = activeTheme.weapons.find(
      (weapon) => weapon.id === archetypeIds.weapon.starterProjectile,
    );
    this.pickupDefinition = activeTheme.pickups.find(
      (pickup) => pickup.id === archetypeIds.pickup.experience,
    );
    const themedShrine = activeTheme.shrines.find(
      (shrine) => shrine.id === archetypeIds.shrine.spawnSurge,
    );
    this.shrineDefinition = themedShrine
      ? { ...themedShrine, spawnDurationMs: testSurgeDurationMs() ?? themedShrine.spawnDurationMs }
      : undefined;
    if (
      !this.enemyDefinition ||
      !this.weaponDefinition ||
      !this.pickupDefinition ||
      !this.shrineDefinition
    ) {
      throw new Error("The active theme is missing required run content");
    }

    this.runState = createRunState({
      themeId: activeTheme.id,
      characterId: selectedCharacter.id,
      baseStats: selectedCharacter.baseStats,
      durationMs: testRunDurationMs(),
    });
    const testCritChance = testCombatNumber("critChance");
    const testPierce = testCombatNumber("pierce");
    const testAttackSpeedBonus = testCombatNumber("attackSpeedBonus");
    if (testCritChance !== undefined || testPierce !== undefined || testSkillEnabled("piercingMomentum")) {
      this.runState = {
        ...this.runState,
        player: testCritChance === undefined && testAttackSpeedBonus === undefined ? this.runState.player : {
          ...this.runState.player,
          stats: {
            ...this.runState.player.stats,
            critChance: testCritChance ?? this.runState.player.stats.critChance,
            attackSpeedBonus: testAttackSpeedBonus ?? this.runState.player.stats.attackSpeedBonus,
          },
        },
        weaponModifiers: testPierce === undefined ? this.runState.weaponModifiers : {
          ...this.runState.weaponModifiers,
          pierce: testPierce,
        },
        activeSkillIds: testSkillEnabled("interactions")
          ? [
              archetypeIds.skill.onKillExplosion,
              archetypeIds.skill.fracture,
              archetypeIds.skill.bloodlust,
              archetypeIds.skill.chainReaction,
            ]
          : testSkillEnabled("piercingMomentum")
          ? [archetypeIds.skill.piercingMomentum]
          : this.runState.activeSkillIds,
      };
    }

    this.physics.world.setBounds(0, 0, ARENA_SIZE.width, ARENA_SIZE.height);
    this.cameras.main.setBackgroundColor(activeTheme.tokens.palette.background);
    this.cameras.main.setBounds(0, 0, ARENA_SIZE.width, ARENA_SIZE.height);
    this.drawArena();

    this.player = new PlayerActor(
      this,
      ARENA_SIZE.width / 2,
      ARENA_SIZE.height / 2,
      selectedCharacter,
      activeTheme.tokens,
    );
    this.createShrineActors();
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.enemyGroup = this.physics.add.group({ runChildUpdate: false });
    this.projectileGroup = this.physics.add.group({ runChildUpdate: false });
    this.pickupGroup = this.physics.add.group({ runChildUpdate: false });
    this.physics.add.overlap(
      this.player,
      this.enemyGroup,
      (_player, enemy) => this.handlePlayerEnemyOverlap(enemy as EnemyActor),
    );
    this.physics.add.overlap(
      this.projectileGroup,
      this.enemyGroup,
      (projectile, enemy) =>
        this.handleProjectileEnemyOverlap(projectile as ProjectileActor, enemy as EnemyActor),
    );

    this.cursors = keyboard.createCursorKeys();
    this.wasd = keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as MovementKeys;
    this.pauseKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.muteKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.interactKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    ];
    window.addEventListener("keydown", this.handleRestartKey);
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerGesture);
    this.choiceKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    ];
    this.levelUpUi = new LevelUpChoiceUi(this, activeTheme);
    this.hud = new Hud(this, activeTheme);
    this.runEndOverlay = new RunEndOverlay(this, activeTheme);

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.game.events.on(Phaser.Core.Events.BLUR, this.handleGameBlur, this);
    this.game.events.on(Phaser.Core.Events.FOCUS, this.handleGameFocus, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
      this.game.events.off(Phaser.Core.Events.BLUR, this.handleGameBlur, this);
      this.game.events.off(Phaser.Core.Events.FOCUS, this.handleGameFocus, this);
      window.removeEventListener("keydown", this.handleRestartKey);
      this.input.off(Phaser.Input.Events.POINTER_DOWN, this.handlePointerGesture);
      this.hud?.destroy();
      this.levelUpUi?.hide();
      this.runEndOverlay?.hide();
      this.audioFeedback.destroy();
    });
    this.hud.update(this.runState);
    this.prepareTestLoadHarness();
    this.prepareTestRosterHarness();
    this.publishTelemetry();
  }

  update(_time: number, delta: number): void {
    if (!this.player || !this.runState || !this.pauseKey) return;

    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) this.togglePause();
    if (this.muteKey && Phaser.Input.Keyboard.JustDown(this.muteKey)) this.audioFeedback.toggleMuted();
    if (this.runState.status === "level_up") this.readUpgradeChoiceInput();

    this.runState = advanceRunState(this.runState, delta);
    if (this.runState.status === "complete") this.enterTerminalState();
    if (this.runState.status === "playing") {
      this.player.move(this.readMovementInput(), this.runState.player.stats.moveSpeed);
      this.updateEnemies();
      this.updateProjectiles();
      this.updatePickups();
      this.updateShrine();
      this.updateTestWorldScenario();
      this.updateSurge();
      this.processTestLoadHarness();
      this.processCausalEvents();
      this.updateBloodlust();
      if (this.loadHarnessRequested === 0 && testRosterHarnessSelection() === null) this.spawnIfReady();
      this.fireIfReady();
      this.updateLoadHighWaterMarks();
      if (this.runState.elapsedMs >= this.invulnerableUntilMs) this.player.setAlpha(1);
    } else {
      this.player.stop();
      if (this.runState.status === "complete") this.physics.world.pause();
    }

    this.hud?.update(this.runState);
    this.publishTelemetry();
  }

  private resetTransientRuntime(): void {
    this.player = undefined;
    this.runState = undefined;
    this.cursors = undefined;
    this.wasd = undefined;
    this.pauseKey = undefined;
    this.muteKey = undefined;
    this.interactKeys = [];
    this.choiceKeys = [];
    this.enemyGroup = undefined;
    this.projectileGroup = undefined;
    this.pickupGroup = undefined;
    this.enemies = new Set();
    this.projectiles = new Set();
    this.pickups = new Set();
    this.enemyDefinition = undefined;
    this.enemyDefinitions = [];
    this.weaponDefinition = undefined;
    this.pickupDefinition = undefined;
    this.shrineDefinition = undefined;
    this.shrine = undefined;
    this.shrineActors = [];
    this.surgeState = createShrineSurgeState();
    this.levelUpUi = undefined;
    this.hud = undefined;
    this.runEndOverlay = undefined;
    this.currentChoices = [];
    this.upgradeRandom = createSeededRandom(DEFAULT_UPGRADE_SEED);
    this.enemyRandom = createSeededRandom(0xe11e_0002);
    this.nextSpawnAtMs = 0;
    this.nextFireAtMs = 0;
    this.lastContactDamageAtMs = Number.NEGATIVE_INFINITY;
    this.invulnerableUntilMs = 0;
    this.spawnSequence = 0;
    this.enemySequence = 0;
    this.projectileSequence = 0;
    this.shotsFired = 0;
    this.criticalShots = 0;
    this.highestCritTier = 0;
    this.longestPierceChain = 0;
    this.contactHits = 0;
    this.pickupSequence = 0;
    this.pickupsDropped = 0;
    this.pickupsCollected = 0;
    this.claimedPickupIds = new Set();
    this.focusPaused = false;
    this.terminalShown = false;
    this.hitFlashes = 0;
    this.trailsEmitted = 0;
    this.pickupCues = 0;
    this.shrineFeedback = 0;
    this.shrineEnemiesSpawned = 0;
    this.shrineEnemiesDefeated = 0;
    this.ambientXpDropped = 0;
    this.shrineXpDropped = 0;
    this.ambientXpCollected = 0;
    this.shrineXpCollected = 0;
    this.eventQueue = new CausalEventQueue();
    this.loadEventQueue = new CausalEventQueue();
    this.loadHarnessRequested = 0;
    this.loadHarnessSpawned = 0;
    this.liveHighWater = 0;
    this.trackedHighWater = 0;
    this.droppedPresentationCues = 0;
    this.rosterHighWater = {};
    this.offspringQueued = 0;
    this.offspringSpawned = 0;
    this.eventSequence = 0;
    this.effectRandom = createSeededRandom(0xeffe_0004);
    this.killTimesMs = [];
    this.bloodlustAttackSpeedBonus = 0;
    this.explosionsCommitted = 0;
    this.chainExplosionsCommitted = 0;
    this.fractureQueued = 0;
    this.fractureSpawned = 0;
    this.damageBySource = { direct: 0, explosion: 0, chained_explosion: 0 };
    this.activeExplosionCues = 0;
    this.testWorldScenarioApplied = false;
    this.duplicatedEnemiesQueued = 0;
    this.duplicatedEnemiesSpawned = 0;
    this.eliteRandom = createSeededRandom(0xe117_0006);
    this.eliteSpawned = 0;
    this.eliteDefeated = 0;
    this.eliteSpawnedByRole = {};
    this.feedbackLimiter = new FeedbackLimiter();
    this.audioFeedback = new AudioFeedbackService(activeTheme.tokens.sounds);
    this.reducedMotion = prefersReducedMotion();
  }

  private prepareTestLoadHarness(): void {
    this.loadHarnessRequested = testLoadHarnessCount();
    for (let index = 0; index < this.loadHarnessRequested; index += 1) {
      this.loadEventQueue.enqueue({
        eventId: `load-spawn-${index + 1}`,
        kind: "spawn.requested",
        provenance: { sourceCategory: "world", sourceId: "load.harness" },
        payload: { sequence: index + 1 },
      });
    }
  }

  private processTestLoadHarness(): void {
    if (this.loadHarnessRequested === 0) return;
    const capacity = Math.max(0, V01_SPAWN_LIMITS.maxAlive - this.enemies.size);
    this.loadEventQueue.process(Math.min(12, capacity), () => {
      if (this.spawnEnemy("ambient", 1)) this.loadHarnessSpawned += 1;
    });
  }

  private prepareTestRosterHarness(): void {
    const selection = testRosterHarnessSelection();
    if (selection === null) return;
    const definitions = selection === "broodmother"
      ? this.enemyDefinitions.filter((definition) => definition.id === archetypeIds.enemy.deathSpawner)
      : this.enemyDefinitions;
    for (const definition of definitions) {
      this.enqueueSpawnRequest(definition.id, "ambient", 1, undefined, undefined, "roster");
    }
  }

  private enqueueSpawnRequest(
    enemyId: EnemyDefinition["id"],
    spawnSource: EnemySpawnSource,
    rewardMultiplier: number,
    parentEntityId?: string,
    parentEventId?: string,
    reason: "roster" | "offspring" | "fracture" | "duplication" = "offspring",
    point?: Readonly<{ x: number; y: number }>,
    elite?: boolean,
  ): void {
    this.eventSequence += 1;
    this.eventQueue.enqueue({
      eventId: `spawn-${this.eventSequence}`,
      kind: "spawn.requested",
      provenance: {
        sourceCategory: reason === "offspring" ? "enemy" : reason === "fracture" ? "skill" : reason === "duplication" ? "shrine" : "world",
        sourceId: spawnSource,
        parentEventId,
        effectId: reason === "offspring" ? "enemy.death_spawn" : reason === "fracture" ? "skill.fracture" : undefined,
      },
      entityId: parentEntityId,
      payload: { enemyId, spawnSource, rewardMultiplier, reason, point, elite },
    });
  }

  private processCausalEvents(): void {
    let capacity = Math.max(0, V01_SPAWN_LIMITS.maxAlive - this.enemies.size);
    this.eventQueue.process(24, (event) => {
      if (event.kind === "effect.explosion") {
        this.processExplosionEvent(event.payload as unknown as ExplosionEventPayload, event.eventId);
        return;
      }
      if (event.kind !== "spawn.requested") return;
      if (capacity <= 0) return false;
      const payload = event.payload as { enemyId?: string; spawnSource?: EnemySpawnSource; rewardMultiplier?: number; reason?: string; point?: Readonly<{ x: number; y: number }>; elite?: boolean };
      if (!payload.enemyId) return;
      const definition = this.enemyDefinitions.find((candidate) => candidate.id === payload.enemyId);
      if (!definition) return;
      if (this.spawnEnemy(payload.spawnSource ?? "ambient", payload.rewardMultiplier ?? 1, definition, payload.point, payload.elite)) {
        capacity -= 1;
        if (payload.reason === "offspring") this.offspringSpawned += 1;
        if (payload.reason === "fracture") this.fractureSpawned += 1;
        if (payload.reason === "duplication") this.duplicatedEnemiesSpawned += 1;
      }
    });
  }

  private updateLoadHighWaterMarks(): void {
    this.liveHighWater = Math.max(this.liveHighWater, this.enemies.size);
    this.trackedHighWater = Math.max(
      this.trackedHighWater,
      this.enemies.size + this.projectiles.size + this.pickups.size,
    );
    for (const definition of this.enemyDefinitions) {
      const count = [...this.enemies].filter((enemy) => enemy.definition.id === definition.id).length;
      this.rosterHighWater[definition.id] = Math.max(this.rosterHighWater[definition.id] ?? 0, count);
    }
  }

  private updateEnemies(): void {
    if (!this.player) return;
    const target = new Phaser.Math.Vector2(this.player.x, this.player.y);
    for (const enemy of this.enemies) {
      if (enemy.active && !enemy.defeated) enemy.chase(target);
    }
  }

  private updateProjectiles(): void {
    if (!this.runState) return;
    for (const projectile of this.projectiles) {
      if (projectile.active && projectile.hasExpired(this.runState.elapsedMs)) {
        projectile.destroy();
      } else if (projectile.emitTrail(this.runState.elapsedMs)) {
        this.trailsEmitted += 1;
      }
    }
  }

  private updatePickups(): void {
    if (!this.player || !this.runState) return;
    const target = new Phaser.Math.Vector2(this.player.x, this.player.y);
    for (const pickup of this.pickups) {
      if (!pickup.active) continue;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, pickup.x, pickup.y);
      if (distance <= this.player.definition.radius + pickup.definition.radius) {
        this.collectPickup(pickup);
        if (this.runState.status === "level_up") break;
      } else if (distance <= this.runState.player.stats.pickupRadius) {
        pickup.magnetToward(target);
      } else {
        pickup.stop();
      }
    }
  }

  private createShrineActors(): void {
    const centreX = ARENA_SIZE.width / 2;
    const centreY = ARENA_SIZE.height / 2;
    const placements: readonly [ShrineDefinition["id"], number, number][] = [
      [archetypeIds.shrine.spawnSurge, centreX + 96, centreY],
      [archetypeIds.shrine.greed, centreX - 210, centreY],
      [archetypeIds.shrine.multiplicity, centreX, centreY - 210],
      [archetypeIds.shrine.multiplicity, centreX, centreY + 210],
      [archetypeIds.shrine.duplication, centreX + 310, centreY],
    ];
    this.shrineActors = placements.flatMap(([id, x, y]) => {
      const definition = activeTheme.shrines.find((candidate) => candidate.id === id);
      if (!definition) return [];
      return [new ShrineActor(
        this, x, y, definition, activeTheme.tokens,
        activeTheme.copy.content[id].name,
        activeTheme.copy.vocabulary.shrinePrompt,
      )];
    });
    this.shrine = this.shrineActors.find((actor) => actor.definition.id === archetypeIds.shrine.spawnSurge);
  }

  private updateShrine(): void {
    if (!this.player || !this.runState) return;
    const interact = this.interactKeys.some((key) => Phaser.Input.Keyboard.JustDown(key));
    for (const shrine of this.shrineActors) {
      const inRange = Phaser.Math.Distance.Between(this.player.x, this.player.y, shrine.x, shrine.y) <= shrine.definition.interactionRadius;
      shrine.setInRange(inRange);
      if (interact && inRange && !shrine.activated) {
        this.activateShrine(shrine);
        return;
      }
    }
  }

  private updateTestWorldScenario(): void {
    const scenario = testWorldScenario();
    if (this.testWorldScenarioApplied || scenario === null || this.enemies.size === 0 || this.runGeneration > 1) return;
    this.testWorldScenarioApplied = true;
    const targets = scenario === "multiplicity2"
      ? this.shrineActors.filter((actor) => actor.definition.id === archetypeIds.shrine.multiplicity)
      : this.shrineActors;
    for (const shrine of targets) this.activateShrine(shrine);
  }

  private activateShrine(shrine: ShrineActor): void {
    if (!this.runState || shrine.activated) return;
    const definition = shrine.definition;
    if (definition.effectKind === "spawn_surge") {
      this.surgeState = activateShrineSurge(this.surgeState, this.runState.elapsedMs);
    }
    const livingSnapshot = definition.effectKind === "duplicate_living"
      ? [...this.enemies].filter((enemy) => enemy.active && !enemy.defeated)
      : [];
    this.runState = {
      ...this.runState,
      world: applyWorldChoice(this.runState.world, {
        shrineId: definition.id,
        chaosIncrease: definition.chaosIncrease,
        enemySpawnMultiplier: definition.enemySpawnMultiplier,
        xpMultiplier: definition.xpMultiplier,
      }),
    };
    if (definition.effectKind === "duplicate_living") {
      const rewardMultiplier = definition.rewardMultiplier * selectWorldModifiers(this.runState.world).shrineRewardMultiplier;
      for (const enemy of livingSnapshot) {
        this.enqueueSpawnRequest(enemy.definition.id, definition.id, rewardMultiplier, enemy.targetId, undefined, "duplication", { x: enemy.x + 12, y: enemy.y + 12 }, Boolean(enemy.elite));
        this.duplicatedEnemiesQueued += 1;
      }
    }
    shrine.activate();
    this.shrineFeedback += 1;
    this.emitFeedback("shrine", shrine.x, shrine.y, "+Chaos");
    if (!this.reducedMotion) {
      this.cameras.main.flash(240, 251, 113, 133, false);
      this.cameras.main.shake(220, 0.006);
    }
    const message = this.add.text(
      this.scale.width / 2,
      105,
      definition.effectKind === "spawn_surge"
        ? activeTheme.copy.vocabulary.surgeActive
        : activeTheme.copy.content[definition.id].name,
      {
        color: activeTheme.tokens.palette.shrine,
        fontFamily: "Georgia, serif",
        fontSize: "28px",
        fontStyle: "bold",
        stroke: activeTheme.tokens.palette.background,
        strokeThickness: 6,
      },
    ).setOrigin(0.5).setScrollFactor(0).setDepth(950);
    this.tweens.add({
      targets: message,
      alpha: 0,
      y: 80,
      duration: 900,
      onComplete: () => message.destroy(),
    });
  }

  private updateSurge(): void {
    if (!this.runState || !this.shrineDefinition || !this.player) return;
    const result = updateShrineSurge(
      this.surgeState,
      this.shrineDefinition,
      this.runState.elapsedMs,
      V01_SPAWN_LIMITS.maxAlive - this.enemies.size,
    );
    this.surgeState = result.state;
    for (let index = 0; index < result.spawnNow; index += 1) {
      this.spawnEnemy(
        archetypeIds.shrine.spawnSurge,
        this.shrineDefinition.rewardMultiplier *
          selectWorldModifiers(this.runState.world).shrineRewardMultiplier,
      );
    }
  }

  private spawnIfReady(): void {
    if (
      !this.player ||
      !this.runState ||
      !this.enemyDefinition ||
      this.runState.elapsedMs < this.nextSpawnAtMs ||
      !canSpawn(this.enemies.size, V01_SPAWN_LIMITS.maxAlive)
    ) {
      return;
    }

    const definition = selectEnemyDefinition(
      this.enemyDefinitions,
      this.runState.elapsedMs,
      this.enemyRandom,
    );
    if (!definition) return;
    this.spawnEnemy("ambient", 1, definition);
    this.nextSpawnAtMs = this.runState.elapsedMs + SPAWN_INTERVAL_MS /
      selectWorldModifiers(this.runState.world).enemySpawnMultiplier;
  }

  private spawnEnemy(
    spawnSource: EnemySpawnSource,
    rewardMultiplier: number,
    definition: EnemyDefinition = this.enemyDefinition as EnemyDefinition,
    requestedPoint?: Readonly<{ x: number; y: number }>,
    eliteOverride?: boolean,
  ): boolean {
    if (
      !this.player ||
      !this.runState ||
      !definition ||
      !this.enemyGroup ||
      !canSpawn(this.enemies.size, V01_SPAWN_LIMITS.maxAlive)
    ) {
      return false;
    }
    const point = requestedPoint ?? pointOnSpawnRing(
      this.player,
      SPAWN_RADIUS,
      this.spawnSequence * GOLDEN_ANGLE,
      ARENA_SIZE,
      definition.radius,
    );
    this.spawnSequence += 1;
    this.enemySequence += 1;
    const worldModifiers = selectWorldModifiers(this.runState.world);
    const eliteDefinition = activeTheme.elites.find((elite) => elite.id === eliteIds.baseline);
    const elite = eliteDefinition && shouldSpawnElite(
      testSkillEnabled("forceElite") ? 1 : worldModifiers.eliteChance,
      this.eliteRandom,
      eliteOverride,
    ) ? eliteDefinition : undefined;
    const enemy = new EnemyActor(
      this,
      `enemy-${this.enemySequence}`,
      point.x,
      point.y,
      definition,
      activeTheme.tokens,
      spawnSource,
      rewardMultiplier * (elite?.rewardMultiplier ?? 1),
      {
        healthMultiplier: worldModifiers.enemyHealthMultiplier * (elite?.healthMultiplier ?? 1),
        damageMultiplier: worldModifiers.enemyDamageMultiplier * (elite?.damageMultiplier ?? 1),
      },
      elite,
    );
    this.enemies.add(enemy);
    this.enemyGroup.add(enemy);
    if (elite) {
      this.eliteSpawned += 1;
      this.eliteSpawnedByRole[definition.id] = (this.eliteSpawnedByRole[definition.id] ?? 0) + 1;
      this.emitFeedback("elite", enemy.x, enemy.y, "ELITE");
    }
    if (spawnSource === archetypeIds.shrine.spawnSurge) this.shrineEnemiesSpawned += 1;
    enemy.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.enemies.delete(enemy);
      if (this.runState) this.runState = setLiveEnemyCount(this.runState, this.enemies.size);
    });
    this.runState = setLiveEnemyCount(this.runState, this.enemies.size);
    return true;
  }

  private fireIfReady(): void {
    if (
      !this.player ||
      !this.runState ||
      !this.weaponDefinition ||
      !this.projectileGroup ||
      this.runState.elapsedMs < this.nextFireAtMs ||
      !canSpawn(this.projectiles.size, V01_SPAWN_LIMITS.maxProjectiles)
    ) {
      return;
    }

    const target = findNearestTarget(
      this.player,
      [...this.enemies].map((enemy) => ({
        id: enemy.targetId,
        x: enemy.x,
        y: enemy.y,
        active: enemy.active && !enemy.defeated,
        enemy,
      })),
    );
    if (!target) return;

    const baseAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    const damage = rollDamage({
      baseDamage: this.weaponDefinition.damage,
      damageBonus: this.runState.player.stats.damageBonus,
      critChance: this.runState.player.stats.critChance,
      critDamage: this.runState.player.stats.critDamage,
      random: Math.random,
    });
    const momentum = activeTheme.skills
      .find((skill) => skill.id === archetypeIds.skill.piercingMomentum)
      ?.effects?.find((effect) => effect.kind === "piercing_momentum");
    const momentumPerHit = this.runState.activeSkillIds.includes(archetypeIds.skill.piercingMomentum)
      ? momentum?.damagePerUniqueHit ?? 0
      : 0;
    const projectileCount = Math.max(
      1,
      Math.floor(this.weaponDefinition.projectileCount + this.runState.weaponModifiers.projectileCount),
    );
    for (let index = 0; index < projectileCount; index += 1) {
      if (!canSpawn(this.projectiles.size, V01_SPAWN_LIMITS.maxProjectiles)) break;
      const offset = (index - (projectileCount - 1) / 2) * 0.12;
      const projectile = new ProjectileActor(
        this,
        `projectile-${this.projectileSequence + 1}`,
        this.player.x,
        this.player.y,
        this.weaponDefinition,
        activeTheme.tokens,
        damage.damage,
        damage.critical,
        damage.tier,
        this.runState.elapsedMs,
        Math.max(0, Math.floor(this.weaponDefinition.pierce + this.runState.weaponModifiers.pierce)),
        momentumPerHit,
      );
      this.projectiles.add(projectile);
      this.projectileGroup.add(projectile);
      this.projectileSequence += 1;
      projectile.launch(baseAngle + offset, this.weaponDefinition.projectileSpeed);
      projectile.once(Phaser.GameObjects.Events.DESTROY, () => this.projectiles.delete(projectile));
      this.shotsFired += 1;
      if (damage.critical) this.criticalShots += 1;
      this.highestCritTier = Math.max(this.highestCritTier, damage.tier);
    }
    const attackSpeedMultiplier = Math.max(
      0.01,
      1 + this.runState.player.stats.attackSpeedBonus + this.bloodlustAttackSpeedBonus,
    );
    this.nextFireAtMs = this.runState.elapsedMs + this.weaponDefinition.cooldownMs / attackSpeedMultiplier;
  }

  private handleProjectileEnemyOverlap(projectile: ProjectileActor, enemy: EnemyActor): void {
    if (!this.runState || !projectile.canHit(enemy.targetId) || enemy.defeated) return;
    const category: FeedbackCategory = projectile.critTier > 1
      ? "overcritical"
      : projectile.critTier === 1 ? "critical" : "damage";
    this.emitFeedback(category, enemy.x, enemy.y, String(Math.round(projectile.damage)));
    if (projectile.pierceChainIndex > 0) this.emitFeedback("pierce", enemy.x, enemy.y, "PIERCE");
    this.commitEnemyDamage(enemy, projectile.damage, "direct");
    projectile.registerHit(enemy.targetId);
    this.longestPierceChain = Math.max(this.longestPierceChain, projectile.pierceChainIndex);
  }

  private commitEnemyDamage(
    enemy: EnemyActor,
    damage: number,
    damageSource: DamageSource,
    parentEventId?: string,
  ): void {
    if (!this.runState || enemy.defeated) return;
    const appliedDamage = Math.min(enemy.health, Math.max(0, damage));
    const result = enemy.takeDamage(damage);
    if (!result.applied) return;
    this.hitFlashes += 1;
    this.damageBySource[damageSource] += appliedDamage;
    if (!result.killed) return;
    if (!this.eventQueue.claimLethal(enemy.targetId)) return;
    this.eventSequence += 1;
    const deathEventId = `death-${this.eventSequence}`;
    this.eventQueue.enqueue({
      eventId: deathEventId,
      kind: "death.committed",
      entityId: enemy.targetId,
      provenance: {
        sourceCategory: damageSource === "direct" ? "weapon" : "skill",
        sourceId: damageSource === "direct" ? this.weaponDefinition?.id : archetypeIds.skill.onKillExplosion,
        parentEventId,
      },
      payload: { enemyId: enemy.definition.id, damageSource, elite: Boolean(enemy.elite) },
    });
    const deathSpawns = createDeathSpawns(enemy.definition, enemy.targetId, deathEventId);
    if (
      deathSpawns &&
      this.eventQueue.claimEffect(enemy.targetId, "enemy.death_spawn")
    ) {
      for (let index = 0; index < deathSpawns.count; index += 1) {
        this.enqueueSpawnRequest(
          deathSpawns.enemyId,
          deathSpawns.spawnSource as EnemySpawnSource,
          deathSpawns.rewardMultiplier,
          deathSpawns.parentEntityId,
          deathSpawns.parentEventId,
          "offspring",
          { x: enemy.x, y: enemy.y },
          Boolean(enemy.elite),
        );
        this.offspringQueued += 1;
      }
    }
    this.enqueueConfiguredOnKillEffects(enemy, deathEventId, damageSource);
    this.killTimesMs.push(this.runState.elapsedMs);
    if (enemy.elite) this.eliteDefeated += 1;
    this.runState = recordKill(this.runState);
    const xpReward = enemy.definition.xpReward * enemy.rewardMultiplier;
    this.dropExperience(enemy.x, enemy.y, xpReward, enemy.spawnSource);
    if (enemy.spawnSource === archetypeIds.shrine.spawnSurge) {
      this.shrineEnemiesDefeated += 1;
      this.shrineXpDropped += xpReward;
    } else {
      this.ambientXpDropped += xpReward;
    }
    enemy.destroy();
  }

  private enqueueConfiguredOnKillEffects(
    enemy: EnemyActor,
    deathEventId: string,
    damageSource: DamageSource,
  ): void {
    if (!this.runState) return;
    const explosion = activeTheme.skills
      .find((skill) => skill.id === archetypeIds.skill.onKillExplosion)
      ?.effects?.find((effect) => effect.kind === "on_kill_explosion");
    const explosionEnabled = this.runState.activeSkillIds.includes(archetypeIds.skill.onKillExplosion);
    const chainEnabled = this.runState.activeSkillIds.includes(archetypeIds.skill.chainReaction);
    if (
      explosion &&
      shouldExplodeOnKill(damageSource, explosionEnabled, chainEnabled) &&
      this.eventQueue.claimEffect(enemy.targetId, archetypeIds.skill.onKillExplosion)
    ) {
      this.eventSequence += 1;
      const depth = damageSource === "direct" ? 0 : damageSource === "explosion" ? 1 : 2;
      this.eventQueue.enqueue({
        eventId: `explosion-${this.eventSequence}`,
        kind: "effect.explosion",
        entityId: enemy.targetId,
        provenance: {
          sourceCategory: "skill",
          sourceId: archetypeIds.skill.onKillExplosion,
          parentEventId: deathEventId,
          effectId: archetypeIds.skill.onKillExplosion,
        },
        payload: { x: enemy.x, y: enemy.y, radius: explosion.radius, damage: explosion.damage, depth },
      });
    }

    const fracture = activeTheme.skills
      .find((skill) => skill.id === archetypeIds.skill.fracture)
      ?.effects?.find((effect) => effect.kind === "fracture");
    if (
      fracture &&
      this.runState.activeSkillIds.includes(archetypeIds.skill.fracture) &&
      shouldFracture(fracture.chance, this.effectRandom) &&
      this.eventQueue.claimEffect(enemy.targetId, archetypeIds.skill.fracture)
    ) {
      for (let index = 0; index < fracture.childCount; index += 1) {
        this.enqueueSpawnRequest(
          fracture.childEnemyId,
          archetypeIds.skill.fracture,
          fracture.rewardMultiplier,
          enemy.targetId,
          deathEventId,
          "fracture",
          { x: enemy.x + (index === 0 ? -8 : 8), y: enemy.y },
          Boolean(enemy.elite),
        );
        this.fractureQueued += 1;
      }
    }
  }

  private processExplosionEvent(payload: ExplosionEventPayload, eventId: string): void {
    const source: DamageSource = payload.depth === 0 ? "explosion" : "chained_explosion";
    if (payload.depth === 0) this.explosionsCommitted += 1;
    else this.chainExplosionsCommitted += 1;
    const targets = targetsWithinRadius(
      [...this.enemies].map((enemy) => ({ id: enemy.targetId, x: enemy.x, y: enemy.y, active: enemy.active && !enemy.defeated, enemy })),
      payload,
      payload.radius,
    );
    for (const target of targets) this.commitEnemyDamage(target.enemy, payload.damage, source, eventId);
    this.emitFeedback("explosion", payload.x, payload.y, "BOOM");
    this.renderExplosionCue(payload);
  }

  private emitFeedback(category: FeedbackCategory, x: number, y: number, label: string): void {
    const nowMs = this.runState?.elapsedMs ?? 0;
    if (this.feedbackLimiter.allowAudio(category, nowMs)) this.audioFeedback.play(category);
    if (!this.feedbackLimiter.beginVisual()) return;
    const palette = activeTheme.tokens.palette;
    const colour = category === "critical"
      ? palette.critical
      : category === "overcritical" ? palette.overcritical
        : category === "explosion" ? palette.explosion
          : category === "elite" ? palette.elite : palette.text;
    const cue = this.add.text(x, y - 18, label, {
      color: colour,
      fontFamily: "Georgia, serif",
      fontSize: category === "damage" ? "16px" : category === "overcritical" ? "26px" : "20px",
      fontStyle: "bold",
      stroke: palette.background,
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(60);
    const impact = category === "shrine" || category === "elite"
      ? undefined
      : this.add.circle(
          x,
          y,
          category === "explosion" ? 14 : 5,
          Phaser.Display.Color.HexStringToColor(colour).color,
          0.8,
        ).setDepth(59);
    const finish = (): void => {
      this.feedbackLimiter.endVisual();
      cue.destroy();
      impact?.destroy();
    };
    if (this.reducedMotion) this.time.delayedCall(120, finish);
    else {
      if (impact) this.tweens.add({ targets: impact, alpha: 0, scale: 2.4, duration: 220 });
      this.tweens.add({ targets: cue, y: cue.y - 24, alpha: 0, duration: 360, onComplete: finish });
    }
  }

  private renderExplosionCue(payload: ExplosionEventPayload): void {
    if (this.activeExplosionCues >= 24) {
      this.droppedPresentationCues += 1;
      return;
    }
    this.activeExplosionCues += 1;
    const explosionColour = Phaser.Display.Color.HexStringToColor(activeTheme.tokens.palette.explosion).color;
    const criticalColour = Phaser.Display.Color.HexStringToColor(activeTheme.tokens.palette.critical).color;
    const cue = this.add.circle(payload.x, payload.y, payload.radius, explosionColour, 0.18)
      .setStrokeStyle(3, criticalColour, 0.75)
      .setDepth(30);
    this.tweens.add({
      targets: cue,
      alpha: 0,
      scale: 1.2,
      duration: 220,
      onComplete: () => {
        this.activeExplosionCues = Math.max(0, this.activeExplosionCues - 1);
        cue.destroy();
      },
    });
  }

  private updateBloodlust(): void {
    if (!this.runState) return;
    const bloodlust = activeTheme.skills
      .find((skill) => skill.id === archetypeIds.skill.bloodlust)
      ?.effects?.find((effect) => effect.kind === "bloodlust");
    if (!bloodlust || !this.runState.activeSkillIds.includes(archetypeIds.skill.bloodlust)) {
      this.bloodlustAttackSpeedBonus = 0;
      return;
    }
    const selected = selectBloodlust(this.killTimesMs, this.runState.elapsedMs, bloodlust);
    this.killTimesMs = [...selected.killTimesMs];
    this.bloodlustAttackSpeedBonus = selected.attackSpeedBonus;
  }

  private dropExperience(
    x: number,
    y: number,
    xpValue: number,
    rewardSource: EnemySpawnSource,
  ): void {
    if (testSkillEnabled("noXp")) return;
    if (!this.pickupDefinition || !this.pickupGroup || xpValue <= 0) return;
    this.pickupSequence += 1;
    const pickup = new PickupActor(
      this,
      `pickup-${this.pickupSequence}`,
      x,
      y,
      this.pickupDefinition,
      activeTheme.tokens,
      xpValue,
      rewardSource,
    );
    this.pickups.add(pickup);
    this.pickupGroup.add(pickup);
    this.pickupsDropped += 1;
    pickup.once(Phaser.GameObjects.Events.DESTROY, () => this.pickups.delete(pickup));
  }

  private collectPickup(pickup: PickupActor): void {
    if (!this.runState) return;
    const value = pickup.claim();
    if (value === null) return;
    const claim = claimExperiencePickup(this.claimedPickupIds, pickup.pickupId, value);
    if (!claim.claimed) return;
    this.claimedPickupIds = claim.claimedPickupIds;
    const awardedXp = claim.awardedXp * selectWorldModifiers(this.runState.world).xpMultiplier;
    this.runState = awardRunExperience(this.runState, awardedXp);
    if (pickup.rewardSource === archetypeIds.shrine.spawnSurge) {
      this.shrineXpCollected += awardedXp;
    } else {
      this.ambientXpCollected += awardedXp;
    }
    this.pickupsCollected += 1;
    pickup.playCollectCue();
    this.pickupCues += 1;
    if (this.runState.status === "level_up") this.beginLevelUpChoice();
  }

  private beginLevelUpChoice(): void {
    if (!this.runState || !this.levelUpUi || this.runState.progression.pendingChoices < 1) return;
    this.player?.stop();
    this.physics.world.pause();
    this.currentChoices = selectUpgradeChoices(activeTheme.upgrades, 3, this.upgradeRandom);
    this.levelUpUi.show(this.currentChoices, (choice) => this.chooseUpgrade(choice));
  }

  private readUpgradeChoiceInput(): void {
    for (let index = 0; index < this.choiceKeys.length; index += 1) {
      const key = this.choiceKeys[index];
      const choice = this.currentChoices[index];
      if (key && choice && Phaser.Input.Keyboard.JustDown(key)) {
        this.chooseUpgrade(choice);
        return;
      }
    }
  }

  private chooseUpgrade(choice: UpgradeDefinition): void {
    if (!this.runState || this.runState.status !== "level_up") return;
    this.runState = applyRunUpgrade(this.runState, choice);
    if (this.runState.status === "level_up") {
      this.beginLevelUpChoice();
    } else {
      this.currentChoices = [];
      this.levelUpUi?.hide();
      this.physics.world.resume();
    }
    this.publishTelemetry();
  }

  private handlePlayerEnemyOverlap(enemy: EnemyActor): void {
    if (!this.runState || !this.player || enemy.defeated) return;
    if (
      !canApplyContactDamage(
        this.runState.elapsedMs,
        this.lastContactDamageAtMs,
        enemy.definition.contactCooldownMs,
      )
    ) {
      return;
    }
    this.runState = damageRunPlayer(this.runState, enemy.contactDamage);
    this.lastContactDamageAtMs = this.runState.elapsedMs;
    this.invulnerableUntilMs = this.runState.elapsedMs + enemy.definition.contactCooldownMs;
    this.contactHits += 1;
    this.player.setAlpha(0.35);
    this.player.flashDamage(activeTheme.tokens.palette.critical);
    this.hitFlashes += 1;
    if (this.runState.status === "dead") {
      this.enterTerminalState();
    }
  }

  private enterTerminalState(): void {
    if (!this.runState || this.terminalShown) return;
    if (this.runState.status !== "dead" && this.runState.status !== "complete") return;
    this.terminalShown = true;
    this.player?.stop();
    this.eventQueue.clear();
    this.loadEventQueue.clear();
    this.killTimesMs = [];
    this.bloodlustAttackSpeedBonus = 0;
    for (const projectile of this.projectiles) projectile.destroy();
    this.physics.world.pause();
    this.runEndOverlay?.show(this.runState.status, () => this.restartRun());
  }

  private restartRun(): void {
    if (!this.runState || (this.runState.status !== "dead" && this.runState.status !== "complete")) {
      return;
    }
    this.physics.world.resume();
    const sceneKey = this.scene.key;
    this.scene.manager.stop(sceneKey);
    this.scene.manager.start(sceneKey);
  }

  private readonly handleRestartKey = (event: KeyboardEvent): void => {
    this.audioFeedback.unlock();
    if (event.code === "KeyR" || event.code === "Enter") this.restartRun();
  };

  private readonly handlePointerGesture = (): void => {
    this.audioFeedback.unlock();
  };

  private handleGameBlur(): void {
    if (!this.runState || this.runState.status !== "playing") return;
    this.runState = setRunStatus(this.runState, "paused");
    this.player?.stop();
    this.physics.world.pause();
    this.focusPaused = true;
    this.audioFeedback.setFocused(false);
    this.hud?.update(this.runState);
    this.publishTelemetry();
  }

  private handleGameFocus(): void {
    if (!this.runState || !this.focusPaused || this.runState.status !== "paused") return;
    this.focusPaused = false;
    this.audioFeedback.setFocused(true);
    this.runState = setRunStatus(this.runState, "playing");
    this.physics.world.resume();
    this.hud?.update(this.runState);
    this.publishTelemetry();
  }

  private drawArena(): void {
    const palette = activeTheme.tokens.palette;
    const graphics = this.add.graphics();
    graphics.fillStyle(Phaser.Display.Color.HexStringToColor(palette.floor).color, 1);
    graphics.fillRect(0, 0, ARENA_SIZE.width, ARENA_SIZE.height);
    graphics.lineStyle(1, Phaser.Display.Color.HexStringToColor(palette.grid).color, 0.65);

    for (let x = 0; x <= ARENA_SIZE.width; x += GRID_SIZE) {
      graphics.lineBetween(x, 0, x, ARENA_SIZE.height);
    }
    for (let y = 0; y <= ARENA_SIZE.height; y += GRID_SIZE) {
      graphics.lineBetween(0, y, ARENA_SIZE.width, y);
    }

    graphics.lineStyle(8, Phaser.Display.Color.HexStringToColor(palette.accent).color, 1);
    graphics.strokeRect(4, 4, ARENA_SIZE.width - 8, ARENA_SIZE.height - 8);

    const centreX = ARENA_SIZE.width / 2;
    const centreY = ARENA_SIZE.height / 2;
    this.add
      .text(centreX, centreY - 180, activeTheme.copy.arenaName, {
        color: palette.accent,
        fontFamily: "Georgia, serif",
        fontSize: "34px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(centreX, centreY + 120, activeTheme.copy.movementHint, {
        color: palette.text,
        fontFamily: "Georgia, serif",
        fontSize: "18px",
      })
      .setAlpha(0.8)
      .setOrigin(0.5);
  }

  private readMovementInput(): DirectionalInput {
    return {
      left: Boolean(this.cursors?.left.isDown || this.wasd?.left.isDown),
      right: Boolean(this.cursors?.right.isDown || this.wasd?.right.isDown),
      up: Boolean(this.cursors?.up.isDown || this.wasd?.up.isDown),
      down: Boolean(this.cursors?.down.isDown || this.wasd?.down.isDown),
    };
  }

  private togglePause(): void {
    if (!this.runState || !this.player) return;
    if (this.runState.status === "playing") {
      this.runState = setRunStatus(this.runState, "paused");
      this.player.stop();
      this.physics.world.pause();
    } else if (this.runState.status === "paused") {
      this.runState = setRunStatus(this.runState, "playing");
      this.physics.world.resume();
    }
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.cameras.resize(gameSize.width, gameSize.height);
    this.hud?.resize();
    if (this.runState?.status === "level_up" && this.currentChoices.length === 3) {
      this.levelUpUi?.show(this.currentChoices, (choice) => this.chooseUpgrade(choice));
    }
    if (this.runState?.status === "dead" || this.runState?.status === "complete") {
      this.runEndOverlay?.resize(() => this.restartRun());
    }
    this.publishTelemetry();
  }

  private publishTelemetry(): void {
    const body = this.player?.arcadeBody;
    const projectileSample = [...this.projectiles].find((projectile) => projectile.active);
    const hud = this.runState ? selectHudValues(this.runState) : undefined;
    const shrineDistance =
      this.player && this.shrine
        ? Phaser.Math.Distance.Between(this.player.x, this.player.y, this.shrine.x, this.shrine.y)
        : Number.POSITIVE_INFINITY;
    const world = this.runState ? selectWorldModifiers(this.runState.world) : undefined;
    const feedback = this.feedbackLimiter.snapshot();
    const audio = this.audioFeedback.snapshot();
    updateTestTelemetry({
      status: "ready",
      scene: this.scene.key,
      themeId: activeTheme.id,
      canvas: { width: this.scale.width, height: this.scale.height },
      arena: ARENA_SIZE,
      camera: {
        scrollX: this.cameras.main.scrollX,
        scrollY: this.cameras.main.scrollY,
      },
      run: this.runState
        ? {
            status: this.runState.status,
            elapsedMs: this.runState.elapsedMs,
            durationMs: this.runState.durationMs,
            kills: this.runState.statistics.kills,
            liveEnemies: this.runState.statistics.liveEnemies,
            level: this.runState.progression.level,
            xp: this.runState.progression.xp,
            xpToNextLevel: this.runState.progression.xpToNextLevel,
            pendingChoices: this.runState.progression.pendingChoices,
          }
        : undefined,
      player: this.player
        ? {
            characterId: this.player.definition.id,
            x: this.player.x,
            y: this.player.y,
            radius: this.player.definition.radius,
            moveSpeed: this.runState?.player.stats.moveSpeed ?? this.player.definition.baseStats.moveSpeed,
            velocityX: body?.velocity.x ?? 0,
            velocityY: body?.velocity.y ?? 0,
            health: this.runState?.player.health ?? 0,
            invulnerable: Boolean(
              this.runState && this.runState.elapsedMs < this.invulnerableUntilMs,
            ),
            maxHealth: this.runState?.player.stats.maxHealth ?? 0,
            pickupRadius: this.runState?.player.stats.pickupRadius ?? 0,
            damageBonus: this.runState?.player.stats.damageBonus ?? 0,
            attackSpeedBonus: this.runState?.player.stats.attackSpeedBonus ?? 0,
            critChance: this.runState?.player.stats.critChance ?? 0,
          }
        : undefined,
      combat: {
        weaponId: this.weaponDefinition?.id ?? null,
        enemyId: this.enemyDefinition?.id ?? null,
        projectiles: this.projectiles.size,
        shotsFired: this.shotsFired,
        criticalShots: this.criticalShots,
        highestCritTier: this.highestCritTier,
        longestPierceChain: this.longestPierceChain,
        contactHits: this.contactHits,
        enemyCap: V01_SPAWN_LIMITS.maxAlive,
        projectileCap: V01_SPAWN_LIMITS.maxProjectiles,
        projectileSample: projectileSample
          ? {
              id: projectileSample.projectileId,
              x: projectileSample.x,
              y: projectileSample.y,
              velocityX: projectileSample.arcadeBody.velocity.x,
              velocityY: projectileSample.arcadeBody.velocity.y,
              damage: projectileSample.damage,
              critTier: projectileSample.critTier,
              pierceChainIndex: projectileSample.pierceChainIndex,
            }
          : null,
        roster: Object.fromEntries(
          this.enemyDefinitions.map((definition) => [
            definition.id,
            [...this.enemies].filter((enemy) => enemy.definition.id === definition.id).length,
          ]),
        ),
        rosterHighWater: this.rosterHighWater,
        offspringQueued: this.offspringQueued,
        offspringSpawned: this.offspringSpawned,
      },
      progression: {
        pickups: this.pickups.size,
        pickupsDropped: this.pickupsDropped,
        pickupsCollected: this.pickupsCollected,
        choiceIds: this.currentChoices.map((choice) => choice.id),
        selectedUpgradeIds: this.runState?.selectedUpgradeIds ?? [],
        activeSkillIds: this.runState?.activeSkillIds ?? [],
        pierceBonus: this.runState?.weaponModifiers.pierce ?? 0,
        projectileCountBonus: this.runState?.weaponModifiers.projectileCount ?? 0,
      },
      hud,
      lifecycle: {
        runGeneration: this.runGeneration,
        terminalOverlay:
          this.runState?.status === "dead" || this.runState?.status === "complete"
            ? this.runState.status
            : null,
        focusPaused: this.focusPaused,
      },
      feedback: {
        hitFlashes: this.hitFlashes,
        trailsEmitted: this.trailsEmitted,
        pickupCues: this.pickupCues,
        audioUnlocked: audio.unlocked,
        muted: audio.muted,
        focused: audio.focused,
        voices: audio.voices,
        audioEmitted: audio.emitted,
        activeVisuals: feedback.activeVisuals,
        visualHighWater: feedback.visualHighWater,
        dropped: feedback.dropped,
        reducedMotion: this.reducedMotion,
      },
      elites: {
        spawned: this.eliteSpawned,
        defeated: this.eliteDefeated,
        live: [...this.enemies].filter((enemy) => Boolean(enemy.elite)).length,
        byRole: { ...this.eliteSpawnedByRole },
      },
      load: {
        enabled: this.loadHarnessRequested > 0,
        requested: this.loadHarnessRequested,
        spawned: this.loadHarnessSpawned,
        eventBacklog: this.loadEventQueue.snapshot().backlog,
        eventBacklogHighWater: this.loadEventQueue.snapshot().backlogHighWater,
        processedEffects: this.loadEventQueue.snapshot().processed,
        droppedPresentationCues: this.droppedPresentationCues + feedback.dropped,
        liveHighWater: this.liveHighWater,
        trackedHighWater: this.trackedHighWater,
      },
      effects: {
        explosionsCommitted: this.explosionsCommitted,
        chainExplosionsCommitted: this.chainExplosionsCommitted,
        fractureQueued: this.fractureQueued,
        fractureSpawned: this.fractureSpawned,
        bloodlustKills: this.killTimesMs.length,
        bloodlustAttackSpeedBonus: this.bloodlustAttackSpeedBonus,
        directDamage: this.damageBySource.direct,
        explosionDamage: this.damageBySource.explosion,
        chainedExplosionDamage: this.damageBySource.chained_explosion,
        eventBacklog: this.eventQueue.snapshot().backlog,
      },
      shrine: {
        id: this.shrineDefinition?.id ?? null,
        x: this.shrine?.x ?? 0,
        y: this.shrine?.y ?? 0,
        inRange: Boolean(
          this.shrineDefinition && shrineDistance <= this.shrineDefinition.interactionRadius,
        ),
        activated: this.shrine?.activated ?? false,
        active: this.surgeState.active,
        scheduled: this.surgeState.scheduled,
        spawned: this.surgeState.spawned,
        targetCount: this.shrineDefinition?.spawnCount ?? 0,
        durationMs: this.shrineDefinition?.spawnDurationMs ?? 0,
        rewardMultiplier: (this.shrineDefinition?.rewardMultiplier ?? 1) *
          (world?.shrineRewardMultiplier ?? 1),
        enemiesSpawned: this.shrineEnemiesSpawned,
        enemiesDefeated: this.shrineEnemiesDefeated,
        shrineXpDropped: this.shrineXpDropped,
        ambientXpDropped: this.ambientXpDropped,
        shrineXpCollected: this.shrineXpCollected,
        ambientXpCollected: this.ambientXpCollected,
        feedbackCount: this.shrineFeedback,
        instances: this.shrineActors.map((actor) => ({ id: actor.definition.id, activated: actor.activated })),
      },
      world: world && this.runState ? {
        ...world,
        activations: this.runState.world.shrineActivations,
        duplicatedEnemiesQueued: this.duplicatedEnemiesQueued,
        duplicatedEnemiesSpawned: this.duplicatedEnemiesSpawned,
      } : undefined,
    });
  }
}
