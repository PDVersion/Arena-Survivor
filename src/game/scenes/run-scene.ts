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
  observeRunChaos,
  observeRunCrit,
  observeRunPierce,
  recordKill,
  recordRunDamage,
  setLiveEnemyCount,
  setRunStatus,
  type RunState,
} from "../state/run-state";
import type { DirectionalInput } from "../systems/player-movement";
import { canApplyContactDamage, rollDamage } from "../systems/combat";
import {
  canSpawn,
  findOffScreenSpawnPoint,
  offScreenSpawnRadius,
  V02_SPAWN_LIMITS,
  type ViewRect,
} from "../systems/spawning";
import { createDeathSpawns } from "../systems/spawning";
import {
  crossedUnlocks,
  enemiesInWave,
  resolveDirectorPlan,
  runProgress,
  selectRole,
  resolveEliteChance,
  type DirectorPlan,
} from "../systems/director/spawn-director";
import type { WaveMovement } from "../core/archetypes/tuning";
import { SpatialHash } from "../systems/spatial/spatial-hash";
import {
  knockbackDisplacement,
  resolvePlayerAgainstSolids,
  separateCrowd,
} from "../systems/separation/crowd-separation";
import { findNearestTarget } from "../systems/targeting";
import { createSeededRandom, selectUpgradeChoices } from "../systems/upgrades";
import { LevelUpChoiceUi } from "../ui/level-up-choice-ui";
import { claimExperiencePickup } from "../systems/xp";
import { Hud } from "../ui/hud";
import { RunEndOverlay } from "../ui/run-end-overlay";
import { selectHudValues, selectRunSummaryValues } from "../state/statistics";
import {
  activateShrineSurge,
  createShrineSurgeState,
  updateShrineSurge,
  type ShrineSurgeState,
} from "../systems/shrine-surge";
import { updateTestTelemetry } from "../../test-support/telemetry-bridge";
import { CausalEventQueue, type EventQueueSnapshot } from "../systems/events/causal-events";
import {
  selectBloodlust,
  shouldExplodeOnKill,
  shouldFracture,
} from "../systems/effects/on-kill-effects";
import { applyWorldChoice, selectWorldModifiers } from "../systems/chaos/world-modifiers";
import { AudioFeedbackService, FeedbackLimiter } from "../systems/feedback/feedback-service";
import { shouldSpawnElite } from "../systems/elites/elites";

// Large enough that a full off-screen spawn ring exists anywhere in the arena,
// and large enough that shrine placement is a real traversal decision.
export const ARENA_SIZE = Object.freeze({ width: 3600, height: 2400 });
const GRID_SIZE = 64;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
/** Pacing telemetry bucket, matched to the balance simulator's reporting window. */
const PACING_BUCKET_MS = 15_000;
/** How far past the arena a drifting enemy travels before it is reclaimed. */
const DRIFT_RECLAIM_MARGIN = 240;
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

/**
 * Test-only override for the ambient spawn ring.
 *
 * Since the ring is derived from the visible view it sits ~958 units out, so a
 * stationary player waits ~7s for the first enemy and far longer to accumulate
 * kills. Paths whose subject is combat, progression, or feedback use this to
 * restore close-quarters timing; the path that actually verifies off-screen
 * spawning deliberately does not. Mirrors `closeLoad` for the harness.
 */
function testSpawnRadius(): number | undefined {
  if (import.meta.env.MODE !== "test") return undefined;
  const value = Number(new URLSearchParams(window.location.search).get("spawnRadius"));
  return Number.isFinite(value) && value > 0 ? value : undefined;
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
  private spawnIntervalMs = 0;
  private lastDirectorProgress = 0;
  private milestoneWaves = 0;
  private waveSpawned = 0;
  private driftSpawned = 0;
  private driftReclaimed = 0;
  /** Rebuilt once per frame and shared by separation, targeting, and explosions. */
  private enemyHash = new SpatialHash<EnemyActor>(64);
  private separationPairChecks = 0;
  private separationPairChecksHighWater = 0;
  private separationAdjustments = 0;
  private solidResolutions = 0;
  private contactShoves = 0;
  private weaponShoves = 0;
  /** Ambient spawns that landed inside the visible view. Must stay at zero. */
  private spawnsInsideView = 0;
  private levelTimestampsMs: number[] = [];
  private xpByBucketMs: number[] = [];
  private xpEarnedTotal = 0;
  private nextFireAtMs = 0;
  private lastContactDamageAtMs = Number.NEGATIVE_INFINITY;
  private invulnerableUntilMs = 0;
  private spawnSequence = 0;
  private enemySequence = 0;
  private projectileSequence = 0;
  private shotsFired = 0;
  private criticalShots = 0;
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
  private terminalLoadMetrics?: EventQueueSnapshot;
  private terminalEventMetrics?: EventQueueSnapshot;
  private loadHarnessRequested = 0;
  private loadHarnessSpawned = 0;
  private liveHighWater = 0;
  private trackedHighWater = 0;
  private frameSamples = 0;
  private frameTotalMs = 0;
  private maxFrameMs = 0;
  private droppedPresentationCues = 0;
  private rosterHighWater: Record<string, number> = {};
  private offspringQueued = 0;
  private offspringSpawned = 0;
  private eventSequence = 0;
  private effectRandom = createSeededRandom(0xeffe_0004);
  private bloodlustAttackSpeedBonus = 0;
  private explosionsCommitted = 0;
  private chainExplosionsCommitted = 0;
  private fractureQueued = 0;
  private fractureSpawned = 0;
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
  private feedbackObjects = new Set<Phaser.GameObjects.GameObject>();

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
      xpCurve: activeTheme.tuning.progression.xpCurve,
    });
    this.spawnIntervalMs = activeTheme.tuning.director.baseIntervalMs;
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
        activeSkillIds: testSkillEnabled("compoundBuild")
          ? [
              archetypeIds.skill.piercingMomentum,
              archetypeIds.skill.onKillExplosion,
              archetypeIds.skill.fracture,
              archetypeIds.skill.bloodlust,
              archetypeIds.skill.chainReaction,
            ]
          : testSkillEnabled("interactions")
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
    this.runState = observeRunCrit(this.runState);

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

    const preparingRepresentativeLoad =
      testSkillEnabled("representativeLoad") &&
      testSkillEnabled("closeLoad") &&
      this.loadHarnessSpawned < this.loadHarnessRequested;
    if (!preparingRepresentativeLoad) this.runState = advanceRunState(this.runState, delta);
    if (this.runState.status === "complete") this.enterTerminalState();
    if (this.runState.status === "playing") {
      if (testSkillEnabled("representativeLoad")) {
        this.frameSamples += 1;
        this.frameTotalMs += delta;
        this.maxFrameMs = Math.max(this.maxFrameMs, delta);
      }
      this.player.move(this.readMovementInput(), this.runState.player.stats.moveSpeed);
      this.updateEnemies();
      this.rebuildEnemyIndex();
      this.resolveCrowd();
      this.updateProjectiles();
      this.updatePickups();
      this.updateShrine();
      this.updateTestWorldScenario();
      this.updateSurge();
      this.processTestLoadHarness();
      this.processCausalEvents();
      this.updateBloodlust();
      if (this.loadHarnessRequested === 0 && testRosterHarnessSelection() === null) {
        this.releaseMilestoneWaves();
        this.spawnIfReady();
      }
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
    this.spawnIntervalMs = 0;
    this.lastDirectorProgress = 0;
    this.milestoneWaves = 0;
    this.waveSpawned = 0;
    this.driftSpawned = 0;
    this.driftReclaimed = 0;
    this.enemyHash = new SpatialHash<EnemyActor>(activeTheme.tuning.bodies.cellSize);
    this.separationPairChecks = 0;
    this.separationPairChecksHighWater = 0;
    this.separationAdjustments = 0;
    this.solidResolutions = 0;
    this.contactShoves = 0;
    this.weaponShoves = 0;
    this.spawnsInsideView = 0;
    this.levelTimestampsMs = [];
    this.xpByBucketMs = [];
    this.xpEarnedTotal = 0;
    this.nextFireAtMs = 0;
    this.lastContactDamageAtMs = Number.NEGATIVE_INFINITY;
    this.invulnerableUntilMs = 0;
    this.spawnSequence = 0;
    this.enemySequence = 0;
    this.projectileSequence = 0;
    this.shotsFired = 0;
    this.criticalShots = 0;
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
    this.terminalLoadMetrics = undefined;
    this.terminalEventMetrics = undefined;
    this.loadHarnessRequested = 0;
    this.loadHarnessSpawned = 0;
    this.liveHighWater = 0;
    this.trackedHighWater = 0;
    this.frameSamples = 0;
    this.frameTotalMs = 0;
    this.maxFrameMs = 0;
    this.droppedPresentationCues = 0;
    this.rosterHighWater = {};
    this.offspringQueued = 0;
    this.offspringSpawned = 0;
    this.eventSequence = 0;
    this.effectRandom = createSeededRandom(0xeffe_0004);
    this.bloodlustAttackSpeedBonus = 0;
    this.explosionsCommitted = 0;
    this.chainExplosionsCommitted = 0;
    this.fractureQueued = 0;
    this.fractureSpawned = 0;
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
    this.feedbackObjects = new Set();
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
    const capacity = Math.max(0, V02_SPAWN_LIMITS.maxAlive - this.enemies.size);
    this.loadEventQueue.process(Math.min(12, capacity), (event) => {
      const sequence = Number((event.payload as { sequence?: number }).sequence ?? 1);
      const representative = testSkillEnabled("representativeLoad");
      const definition = representative
        ? this.enemyDefinitions[(sequence - 1) % this.enemyDefinitions.length]
        : this.enemyDefinition;
      const closeAngle = sequence * GOLDEN_ANGLE;
      // `closeLoad` places harness spawns next to the player so a path that is
      // about combat density does not also depend on travel time across the
      // off-screen spawn ring. Usable on its own, not only with
      // `representativeLoad`.
      const requestedPoint = testSkillEnabled("closeLoad") && this.player && definition
        ? {
            x: Math.min(ARENA_SIZE.width - definition.radius, Math.max(definition.radius, this.player.x + Math.cos(closeAngle) * 100)),
            y: Math.min(ARENA_SIZE.height - definition.radius, Math.max(definition.radius, this.player.y + Math.sin(closeAngle) * 100)),
          }
        : undefined;
      if (definition && this.spawnEnemy("ambient", 1, definition, requestedPoint, representative && sequence % 5 === 0)) {
        this.loadHarnessSpawned += 1;
      }
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
    reason: "roster" | "offspring" | "fracture" | "duplication" | "wave" = "offspring",
    point?: Readonly<{ x: number; y: number }>,
    elite?: boolean,
    movement: WaveMovement = "chase",
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
      payload: { enemyId, spawnSource, rewardMultiplier, reason, point, elite, movement },
    });
  }

  private processCausalEvents(): void {
    let capacity = Math.max(0, V02_SPAWN_LIMITS.maxAlive - this.enemies.size);
    this.eventQueue.process(24, (event) => {
      if (event.kind === "effect.explosion") {
        this.processExplosionEvent(event.payload as unknown as ExplosionEventPayload, event.eventId);
        return;
      }
      if (event.kind !== "spawn.requested") return;
      if (capacity <= 0) return false;
      const payload = event.payload as { enemyId?: string; spawnSource?: EnemySpawnSource; rewardMultiplier?: number; reason?: string; point?: Readonly<{ x: number; y: number }>; elite?: boolean; movement?: WaveMovement };
      if (!payload.enemyId) return;
      const definition = this.enemyDefinitions.find((candidate) => candidate.id === payload.enemyId);
      if (!definition) return;
      if (this.spawnEnemy(payload.spawnSource ?? "ambient", payload.rewardMultiplier ?? 1, definition, payload.point, payload.elite, undefined, payload.movement)) {
        capacity -= 1;
        if (payload.reason === "offspring") this.offspringSpawned += 1;
        if (payload.reason === "fracture") this.fractureSpawned += 1;
        if (payload.reason === "duplication") this.duplicatedEnemiesSpawned += 1;
        if (payload.reason === "wave") this.waveSpawned += 1;
      }
    });
  }

  /**
   * Rebuild the shared spatial index from targetable enemies.
   *
   * Defeated-but-not-yet-destroyed enemies are excluded, so every consumer of
   * the index gets a pre-filtered view and none of them needs to allocate a
   * snapshot array of the whole swarm.
   */
  private rebuildEnemyIndex(): void {
    this.enemyHash.clear();
    for (const enemy of this.enemies) {
      if (enemy.active && !enemy.defeated) this.enemyHash.insert(enemy);
    }
  }

  private resolveCrowd(): void {
    if (!this.player) return;
    const bodies = activeTheme.tuning.bodies;
    const stats = separateCrowd(this.enemies, this.enemyHash, {
      maxNeighbours: bodies.maxNeighbours,
      maxDisplacement: bodies.maxDisplacement,
    });
    this.separationPairChecks = stats.pairChecks;
    this.separationPairChecksHighWater = Math.max(this.separationPairChecksHighWater, stats.pairChecks);
    this.separationAdjustments += stats.adjustments;

    const maxSolidRadius = Math.max(
      ...this.enemyDefinitions.map((definition) => definition.radius),
    ) * 1.3;
    this.solidResolutions += resolvePlayerAgainstSolids(
      this.player,
      this.enemyHash,
      ARENA_SIZE,
      maxSolidRadius,
    );
  }

  /** The world-space rectangle currently visible, used to keep spawns off screen. */
  private viewRect(): ViewRect {
    const camera = this.cameras.main;
    return {
      centreX: camera.worldView.centerX,
      centreY: camera.worldView.centerY,
      width: camera.worldView.width || this.scale.width,
      height: camera.worldView.height || this.scale.height,
    };
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
      if (!enemy.active || enemy.defeated) continue;
      enemy.advance(target);
      // Drifting enemies never turn back, so reclaim them once they are gone
      // rather than letting a wave accumulate against the arena edge.
      if (enemy.movement === "drift" && enemy.hasLeftArena(ARENA_SIZE, DRIFT_RECLAIM_MARGIN)) {
        this.driftReclaimed += 1;
        enemy.destroy();
      }
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
    if (testSkillEnabled("representativeLoad") && this.loadHarnessSpawned < this.loadHarnessRequested) return;
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
    this.runState = observeRunChaos(this.runState);
    if (definition.effectKind === "duplicate_living") {
      const rewardMultiplier = definition.rewardMultiplier * selectWorldModifiers(this.runState.world, activeTheme.tuning.difficulty).shrineRewardMultiplier;
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
      V02_SPAWN_LIMITS.maxAlive - this.enemies.size,
    );
    this.surgeState = result.state;
    for (let index = 0; index < result.spawnNow; index += 1) {
      this.spawnEnemy(
        archetypeIds.shrine.spawnSurge,
        this.shrineDefinition.rewardMultiplier *
          selectWorldModifiers(this.runState.world, activeTheme.tuning.difficulty).shrineRewardMultiplier,
      );
    }
  }

  /** Resolve every director output for the current moment. */
  private currentDirectorPlan(): DirectorPlan | undefined {
    if (!this.runState) return undefined;
    const world = selectWorldModifiers(this.runState.world, activeTheme.tuning.difficulty);
    return resolveDirectorPlan(
      activeTheme.tuning.director,
      runProgress(this.runState.elapsedMs, this.runState.durationMs),
      world,
    );
  }

  /**
   * Announce and release a wave when run progress crosses a role's unlock.
   *
   * The player should know the game just got harder, and why. Fired from the
   * director's own thresholds so no milestone is tracked by hand.
   */
  private releaseMilestoneWaves(): void {
    if (!this.runState || testSkillEnabled("noAmbient")) return;
    const progress = runProgress(this.runState.elapsedMs, this.runState.durationMs);
    const crossed = crossedUnlocks(activeTheme.tuning.director, this.lastDirectorProgress, progress);
    this.lastDirectorProgress = progress;
    if (crossed.length === 0) return;

    const burst = enemiesInWave(activeTheme.tuning.director, progress);
    for (const role of crossed) {
      this.milestoneWaves += 1;
      for (let index = 0; index < burst; index += 1) {
        this.enqueueSpawnRequest(
          role.enemyId,
          "ambient",
          1,
          undefined,
          undefined,
          "wave",
          undefined,
          undefined,
          role.waveMovement,
        );
      }
      this.announceWave(activeTheme.copy.content[role.enemyId]?.name ?? role.enemyId);
    }
  }

  private announceWave(roleName: string): void {
    this.emitFeedback("elite", this.player?.x ?? 0, this.player?.y ?? 0, roleName);
    const banner = this.add.text(this.scale.width / 2, 140, roleName, {
      color: activeTheme.tokens.palette.accent,
      fontFamily: "Georgia, serif",
      fontSize: "30px",
      fontStyle: "bold",
      stroke: activeTheme.tokens.palette.background,
      strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(950);
    this.feedbackObjects.add(banner);
    this.tweens.add({
      targets: banner,
      alpha: 0,
      y: 110,
      duration: 1100,
      onComplete: () => {
        this.feedbackObjects.delete(banner);
        banner.destroy();
      },
    });
  }

  private spawnIfReady(): void {
    if (testSkillEnabled("noAmbient")) return;
    if (
      !this.player ||
      !this.runState ||
      this.runState.elapsedMs < this.nextSpawnAtMs ||
      !canSpawn(this.enemies.size, V02_SPAWN_LIMITS.maxAlive)
    ) {
      return;
    }

    const plan = this.currentDirectorPlan();
    if (!plan) return;

    // A batch shares one ring arc so it reads as a wave rather than a trickle.
    const arc = this.spawnSequence * GOLDEN_ANGLE;
    for (let index = 0; index < plan.batchSize; index += 1) {
      if (!canSpawn(this.enemies.size, V02_SPAWN_LIMITS.maxAlive)) break;
      const enemyId = selectRole(plan.weights, this.enemyRandom);
      const definition = this.enemyDefinitions.find((candidate) => candidate.id === enemyId);
      if (!definition) continue;
      const spread = plan.batchSize === 1
        ? 0
        : (index / (plan.batchSize - 1) - 0.5) * activeTheme.tuning.director.batchSpreadRadians;
      this.spawnEnemy("ambient", 1, definition, undefined, undefined, arc + spread);
    }

    this.spawnIntervalMs = plan.intervalMs;
    this.nextSpawnAtMs = this.runState.elapsedMs + this.spawnIntervalMs;
  }

  private spawnEnemy(
    spawnSource: EnemySpawnSource,
    rewardMultiplier: number,
    definition: EnemyDefinition = this.enemyDefinition as EnemyDefinition,
    requestedPoint?: Readonly<{ x: number; y: number }>,
    eliteOverride?: boolean,
    angleRadians?: number,
    movement: WaveMovement = "chase",
  ): boolean {
    if (
      !this.player ||
      !this.runState ||
      !definition ||
      !this.enemyGroup ||
      !canSpawn(this.enemies.size, V02_SPAWN_LIMITS.maxAlive)
    ) {
      return false;
    }
    const view = this.viewRect();
    const radiusOverride = testSpawnRadius();
    const point = requestedPoint ?? findOffScreenSpawnPoint({
      origin: this.player,
      radius: radiusOverride ?? offScreenSpawnRadius(view, activeTheme.tuning.director.spawnMargin),
      angleRadians: angleRadians ?? this.spawnSequence * GOLDEN_ANGLE,
      arena: ARENA_SIZE,
      view,
      margin: definition.radius,
    });
    if (
      !requestedPoint &&
      radiusOverride === undefined &&
      Math.abs(point.x - view.centreX) <= view.width / 2 &&
      Math.abs(point.y - view.centreY) <= view.height / 2
    ) {
      this.spawnsInsideView += 1;
    }
    this.spawnSequence += 1;
    this.enemySequence += 1;
    const worldModifiers = selectWorldModifiers(this.runState.world, activeTheme.tuning.difficulty);
    const eliteDefinition = activeTheme.elites.find((elite) => elite.id === eliteIds.baseline);
    const directorEliteChance = resolveEliteChance(
      activeTheme.tuning.director,
      runProgress(this.runState.elapsedMs, this.runState.durationMs),
      worldModifiers.eliteChance,
    );
    const elite = eliteDefinition && shouldSpawnElite(
      testSkillEnabled("forceElite") ? 1 : directorEliteChance,
      this.eliteRandom,
      eliteOverride,
    ) ? eliteDefinition : undefined;
    // Tougher spawns are worth more. The share applies to the world health
    // multiplier only: elite reward is already an explicit multiplier, so
    // folding elite health in here would pay for the same thing twice.
    const toughnessReward = 1 +
      (worldModifiers.enemyHealthMultiplier - 1) * activeTheme.tuning.progression.toughnessRewardShare;
    const enemy = new EnemyActor(
      this,
      `enemy-${this.enemySequence}`,
      point.x,
      point.y,
      definition,
      activeTheme.tokens,
      spawnSource,
      rewardMultiplier * (elite?.rewardMultiplier ?? 1) * toughnessReward,
      {
        healthMultiplier: worldModifiers.enemyHealthMultiplier * (elite?.healthMultiplier ?? 1),
        damageMultiplier: worldModifiers.enemyDamageMultiplier * (elite?.damageMultiplier ?? 1),
      },
      elite,
      movement,
      {
        role: activeTheme.tuning.bodies.roles.find((role) => role.enemyId === definition.id) ??
          { enemyId: definition.id, separationScale: 1, mass: 1, solid: false },
        eliteMassMultiplier: activeTheme.tuning.bodies.eliteMassMultiplier,
      },
    );
    if (movement === "drift") this.driftSpawned += 1;
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
      testSkillEnabled("representativeLoad") &&
      testSkillEnabled("closeLoad") &&
      this.loadHarnessSpawned < this.loadHarnessRequested
    ) return;
    if (
      !this.player ||
      !this.runState ||
      !this.weaponDefinition ||
      !this.projectileGroup ||
      this.runState.elapsedMs < this.nextFireAtMs ||
      !canSpawn(this.projectiles.size, V02_SPAWN_LIMITS.maxProjectiles)
    ) {
      return;
    }

    // The index is pre-filtered to targetable enemies, so the actors go straight
    // in. V0.2 allocated a snapshot of the whole swarm on every shot.
    const target = findNearestTarget(this.player, this.enemies);
    if (!target) return;

    const baseAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    const damage = rollDamage({
      baseDamage: this.weaponDefinition.damage,
      damageBonus: this.runState.player.stats.damageBonus,
      // A weapon may override the player's crit stats; both production weapons
      // leave them undefined and inherit.
      critChance: this.weaponDefinition.critChance ?? this.runState.player.stats.critChance,
      critDamage: this.weaponDefinition.critDamage ?? this.runState.player.stats.critDamage,
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
      if (!canSpawn(this.projectiles.size, V02_SPAWN_LIMITS.maxProjectiles)) break;
      const offset = (index - (projectileCount - 1) / 2) * 0.12;
      const projectile = new ProjectileActor(
        this,
        `projectile-${this.projectileSequence + 1}`,
        this.player.x,
        this.player.y,
        this.weaponDefinition,
        activeTheme.tokens,
        damage.damage,
        damage.baseDamage,
        damage.bonusDamage,
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
      this.runState = observeRunCrit(this.runState, damage.tier);
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
    this.commitEnemyDamage(enemy, projectile.damage, "direct", undefined, {
      directBase: projectile.normalDamage,
      criticalBonus: projectile.criticalBonusDamage,
      piercingMomentum: projectile.damage - projectile.baseDamage,
    });
    this.applyWeaponKnockback(enemy);
    projectile.registerHit(enemy.targetId);
    this.runState = observeRunPierce(this.runState, projectile.pierceChainIndex);
  }

  /** A solid enemy shoves the player on contact, selling the mass difference. */
  private shovePlayer(enemy: EnemyActor): void {
    if (!this.player) return;
    const push = knockbackDisplacement(
      enemy,
      this.player,
      activeTheme.tuning.bodies.contactKnockback,
      1,
    );
    this.player.x = Phaser.Math.Clamp(
      this.player.x + push.x,
      this.player.definition.radius,
      ARENA_SIZE.width - this.player.definition.radius,
    );
    this.player.y = Phaser.Math.Clamp(
      this.player.y + push.y,
      this.player.definition.radius,
      ARENA_SIZE.height - this.player.definition.radius,
    );
    this.contactShoves += 1;
  }

  /**
   * Weapon knockback, scaled by the target's mass so heavy roles shrug it off.
   * Both production weapons declare `0`, so this is inert until a weapon uses it.
   */
  private applyWeaponKnockback(enemy: EnemyActor): void {
    const strength = this.weaponDefinition?.knockback ?? 0;
    if (strength <= 0 || !this.player) return;
    const push = knockbackDisplacement(this.player, enemy, strength, enemy.mass);
    enemy.x += push.x;
    enemy.y += push.y;
    this.weaponShoves += 1;
  }

  private commitEnemyDamage(
    enemy: EnemyActor,
    damage: number,
    damageSource: DamageSource,
    parentEventId?: string,
    direct?: Readonly<{ directBase: number; criticalBonus: number; piercingMomentum: number }>,
  ): void {
    if (!this.runState || enemy.defeated) return;
    const appliedDamage = Math.min(enemy.health, Math.max(0, damage));
    const result = enemy.takeDamage(damage);
    if (!result.applied) return;
    this.hitFlashes += 1;
    this.runState = recordRunDamage(this.runState, {
      amount: appliedDamage,
      source: damageSource,
      ...direct,
    });
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
    // Explosions are local, so the shared index answers them without scanning or
    // allocating a snapshot of every live enemy per blast -- which mattered most
    // exactly when chains made blasts frequent.
    const radiusSquared = payload.radius * payload.radius;
    const caught: EnemyActor[] = [];
    this.enemyHash.forEachWithin(payload.x, payload.y, payload.radius, (enemy) => {
      if (!enemy.active || enemy.defeated) return;
      const dx = enemy.x - payload.x;
      const dy = enemy.y - payload.y;
      if (dx * dx + dy * dy <= radiusSquared) caught.push(enemy);
    });
    for (const target of caught) this.commitEnemyDamage(target, payload.damage, source, eventId);
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
    this.feedbackObjects.add(cue);
    if (impact) this.feedbackObjects.add(impact);
    const finish = (): void => {
      this.feedbackLimiter.endVisual();
      this.feedbackObjects.delete(cue);
      if (impact) this.feedbackObjects.delete(impact);
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
    this.feedbackObjects.add(cue);
    this.tweens.add({
      targets: cue,
      alpha: 0,
      scale: 1.2,
      duration: 220,
      onComplete: () => {
        this.activeExplosionCues = Math.max(0, this.activeExplosionCues - 1);
        this.feedbackObjects.delete(cue);
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
    const selected = selectBloodlust(this.runState.statistics.recentKillTimesMs, this.runState.elapsedMs, bloodlust);
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
    const awardedXp = claim.awardedXp * selectWorldModifiers(this.runState.world, activeTheme.tuning.difficulty).xpMultiplier;
    const levelBefore = this.runState.progression.level;
    this.runState = awardRunExperience(this.runState, awardedXp);
    this.recordPacingXp(awardedXp, levelBefore);
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

  /** Record pacing evidence so a live run can be compared against the simulator. */
  private recordPacingXp(awardedXp: number, levelBefore: number): void {
    if (!this.runState) return;
    this.xpEarnedTotal += awardedXp;
    const bucket = Math.floor(this.runState.elapsedMs / PACING_BUCKET_MS);
    while (this.xpByBucketMs.length <= bucket) this.xpByBucketMs.push(0);
    this.xpByBucketMs[bucket] = (this.xpByBucketMs[bucket] ?? 0) + awardedXp;
    for (let level = levelBefore; level < this.runState.progression.level; level += 1) {
      this.levelTimestampsMs.push(this.runState.elapsedMs);
    }
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
    if (testSkillEnabled("noContact")) return;
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
    if (enemy.solid) this.shovePlayer(enemy);
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
    this.terminalLoadMetrics = this.loadEventQueue.snapshot();
    this.terminalEventMetrics = this.eventQueue.snapshot();
    this.eventQueue.clear();
    this.loadEventQueue.clear();
    this.bloodlustAttackSpeedBonus = 0;
    for (const projectile of this.projectiles) projectile.destroy();
    for (const object of this.feedbackObjects) object.destroy();
    this.feedbackObjects.clear();
    this.feedbackLimiter.clearVisuals();
    this.activeExplosionCues = 0;
    this.audioFeedback.destroy();
    this.physics.world.pause();
    this.runEndOverlay?.show(this.runState, () => this.restartRun());
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

  /**
   * Enemy pairs sharing effectively the same position.
   *
   * The invariant separation exists to hold: nothing should stay perfectly
   * stacked. Test-build only, and quadratic, so it is skipped in production.
   */
  private countCoincidentPairs(): number {
    if (import.meta.env.MODE !== "test") return 0;
    const live = [...this.enemies].filter((enemy) => enemy.active && !enemy.defeated);
    let pairs = 0;
    for (let index = 0; index < live.length; index += 1) {
      for (let other = index + 1; other < live.length; other += 1) {
        const first = live[index]!;
        const second = live[other]!;
        if (Math.hypot(first.x - second.x, first.y - second.y) < 0.5) pairs += 1;
      }
    }
    return pairs;
  }

  private publishTelemetry(): void {
    const body = this.player?.arcadeBody;
    const projectileSample = [...this.projectiles].find((projectile) => projectile.active);
    const hud = this.runState ? selectHudValues(this.runState) : undefined;
    const shrineDistance =
      this.player && this.shrine
        ? Phaser.Math.Distance.Between(this.player.x, this.player.y, this.shrine.x, this.shrine.y)
        : Number.POSITIVE_INFINITY;
    const world = this.runState ? selectWorldModifiers(this.runState.world, activeTheme.tuning.difficulty) : undefined;
    const feedback = this.feedbackLimiter.snapshot();
    const audio = this.audioFeedback.snapshot();
    const loadMetrics = this.terminalLoadMetrics ?? this.loadEventQueue.snapshot();
    const eventMetrics = this.terminalEventMetrics ?? this.eventQueue.snapshot();
    const directorPlan = this.currentDirectorPlan();
    const summary = this.runState
      ? selectRunSummaryValues(this.runState, activeTheme.copy.vocabulary, activeTheme.copy.content)
      : undefined;
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
        highestCritTier: this.runState?.statistics.highestCritTier ?? 0,
        longestPierceChain: this.runState?.statistics.longestPierceChain ?? 0,
        contactHits: this.contactHits,
        enemyCap: V02_SPAWN_LIMITS.maxAlive,
        projectileCap: V02_SPAWN_LIMITS.maxProjectiles,
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
      statistics: this.runState && summary ? {
        kills: this.runState.statistics.kills,
        peakEnemiesAlive: this.runState.statistics.peakEnemiesAlive,
        highestChaos: this.runState.statistics.highestChaos,
        highestCritChance: this.runState.statistics.highestCritChance,
        highestCritTier: this.runState.statistics.highestCritTier,
        longestPierceChain: this.runState.statistics.longestPierceChain,
        largestKillChain: this.runState.statistics.largestKillChain,
        totalDamage: this.runState.statistics.totalDamage,
        damageBreakdown: this.runState.statistics.damageBreakdown,
        summaryMetrics: summary.metrics,
        summaryDamage: summary.damage,
        upgradeCounts: { ...this.runState.statistics.upgradeCounts },
        summaryUpgrades: summary.upgrades,
      } : undefined,
      crowd: {
        indexed: this.enemyHash.size,
        pairChecks: this.separationPairChecks,
        pairChecksHighWater: this.separationPairChecksHighWater,
        adjustments: this.separationAdjustments,
        solidResolutions: this.solidResolutions,
        contactShoves: this.contactShoves,
        weaponShoves: this.weaponShoves,
        coincidentPairs: this.countCoincidentPairs(),
      },
      view: {
        logicalWidth: this.scale.width,
        logicalHeight: this.scale.height,
        displayWidth: Math.round(this.scale.displaySize.width),
        displayHeight: Math.round(this.scale.displaySize.height),
        worldWidth: Math.round(this.viewRect().width),
        worldHeight: Math.round(this.viewRect().height),
        spawnRadius: Math.round(
          offScreenSpawnRadius(this.viewRect(), activeTheme.tuning.director.spawnMargin),
        ),
      },
      pacing: this.runState
        ? {
            progress: this.runState.durationMs === 0
              ? 0
              : Math.min(1, this.runState.elapsedMs / this.runState.durationMs),
            spawnIntervalMs: this.spawnIntervalMs,
            baseSpawnIntervalMs: activeTheme.tuning.director.baseIntervalMs,
            liveByRole: Object.fromEntries(
              this.enemyDefinitions.map((definition) => [
                definition.id,
                [...this.enemies].filter((enemy) => enemy.definition.id === definition.id).length,
              ]),
            ),
            xpEarned: this.xpEarnedTotal,
            xpByBucket: [...this.xpByBucketMs],
            bucketMs: PACING_BUCKET_MS,
            levelTimestampsMs: [...this.levelTimestampsMs],
            batchSize: directorPlan?.batchSize ?? 0,
            eliteChance: directorPlan?.eliteChance ?? 0,
            roleWeights: Object.fromEntries(
              (directorPlan?.weights ?? []).map((entry) => [entry.enemyId, entry.weight]),
            ),
            milestoneWaves: this.milestoneWaves,
            waveSpawned: this.waveSpawned,
            driftSpawned: this.driftSpawned,
            driftReclaimed: this.driftReclaimed,
            driftLive: [...this.enemies].filter((enemy) => enemy.movement === "drift").length,
            spawnsInsideView: this.spawnsInsideView,
          }
        : undefined,
      load: {
        enabled: this.loadHarnessRequested > 0,
        requested: this.loadHarnessRequested,
        spawned: this.loadHarnessSpawned,
        eventBacklog: this.loadEventQueue.snapshot().backlog,
        eventBacklogHighWater: loadMetrics.backlogHighWater,
        processedEffects: loadMetrics.processed,
        gameplayBacklogHighWater: eventMetrics.backlogHighWater,
        processedGameplayEvents: eventMetrics.processed,
        droppedPresentationCues: this.droppedPresentationCues + feedback.dropped,
        liveHighWater: this.liveHighWater,
        trackedHighWater: this.trackedHighWater,
        frameSamples: this.frameSamples,
        averageFrameMs: this.frameSamples === 0 ? 0 : this.frameTotalMs / this.frameSamples,
        maxFrameMs: this.maxFrameMs,
      },
      effects: {
        explosionsCommitted: this.explosionsCommitted,
        chainExplosionsCommitted: this.chainExplosionsCommitted,
        fractureQueued: this.fractureQueued,
        fractureSpawned: this.fractureSpawned,
        bloodlustKills: this.runState?.statistics.recentKillTimesMs.length ?? 0,
        bloodlustAttackSpeedBonus: this.bloodlustAttackSpeedBonus,
        directDamage: (this.runState?.statistics.damageBreakdown.direct ?? 0) +
          (this.runState?.statistics.damageBreakdown.criticalBonus ?? 0) +
          (this.runState?.statistics.damageBreakdown.piercingMomentum ?? 0),
        explosionDamage: this.runState?.statistics.damageBreakdown.explosion ?? 0,
        chainedExplosionDamage: this.runState?.statistics.damageBreakdown.chainedExplosion ?? 0,
        eventBacklog: this.eventQueue.snapshot().backlog,
        eventBacklogHighWater: eventMetrics.backlogHighWater,
        processedEvents: eventMetrics.processed,
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
