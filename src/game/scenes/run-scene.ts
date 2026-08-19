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
  chooseRunMode,
  completeRun,
  awardRunExperience,
  createRunState,
  damageRunPlayer,
  observeRunChaos,
  observeRunCrit,
  observeRunPierce,
  recordKill,
  recordRunDamage,
  regenerateRunPlayer,
  setLiveEnemyCount,
  setRunStatus,
  type RunState,
} from "../state/run-state";
import type { DirectionalInput } from "../systems/player-movement";
import { canApplyContactDamage, reduceByArmour, rollDamage } from "../systems/combat";
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
import { HazardActor } from "../entities/hazard-actor";
import {
  avoidObstacle,
  hazardIntervalMs,
  hazardPhase,
  isInsideHazard,
  resolveHazardEffect,
  selectHazard,
  type HazardState,
} from "../systems/hazards/hazards";
import {
  knockbackDisplacement,
  resolvePlayerAgainstSolids,
  separateCrowd,
} from "../systems/separation/crowd-separation";
import { findNearestTarget } from "../systems/targeting";
import { createSeededRandom, selectUpgradeChoices } from "../systems/upgrades";
import {
  rollOfferTiers,
  tierMultiplier,
  type UpgradeOffer,
} from "../systems/upgrades/upgrade-tiers";
import { LevelUpChoiceUi } from "../ui/level-up-choice-ui";
import { PauseMenuUi } from "../ui/pause-menu-ui";
import {
  describeUpgrade,
  selectPlayerStats,
  selectWorldLines,
} from "../systems/upgrades/describe-upgrade";
import {
  getSessionSettings,
  toggleSetting,
  updateSessionSettings,
  type SettingKey,
} from "../state/settings-state";
import { claimExperiencePickup } from "../systems/xp";
import { Hud } from "../ui/hud";
import { RunEndOverlay } from "../ui/run-end-overlay";
import { OvertimeChoiceUi, type OvertimeChoice } from "../ui/overtime-choice-ui";
import { selectHudValues, selectRunSummaryValues } from "../state/statistics";
import {
  activateShrineSurge,
  createShrineSurgeState,
  updateShrineSurge,
  type ShrineSurgeState,
} from "../systems/shrine-surge";
import {
  selectSessionCodex,
  selectShrineCodex,
  selectUpgradeCodex,
} from "../systems/codex/describe-shrine";
import {
  getSessionStatistics,
  recordFinishedRun,
  type RunContribution,
} from "../state/session-statistics";
import {
  placeShrine,
  scheduleShrineArrivals,
  shrineMarker,
  type ScheduledShrine,
} from "../systems/shrines/shrine-placement";
import { updateTestTelemetry } from "../../test-support/telemetry-bridge";
import { CausalEventQueue, type EventQueueSnapshot } from "../systems/events/causal-events";
import {
  selectBloodlust,
  shouldExplodeOnKill,
  shouldFracture,
} from "../systems/effects/on-kill-effects";
import { applyWorldChoice, createWorldState, selectWorldModifiers } from "../systems/chaos/world-modifiers";
import { AudioFeedbackService, FeedbackLimiter } from "../systems/feedback/feedback-service";
import {
  accumulateDamage,
  createDamageAggregator,
  createHitStopState,
  drainAll,
  drainDueDamage,
  drainTarget,
  isHitStopActive,
  killChainDetune,
  requestHitStop,
  type HitStopState,
} from "../systems/feedback/impact";
import { shouldSpawnElite } from "../systems/elites/elites";
import {
  chainScaleAtDepth,
  explosionDamage,
  findSkillEffect,
  resolveBloodlust,
  resolveChain,
  resolveExplosion,
  resolveFractureChance,
  resolveMomentum,
  skillLevel,
  skillMaxLevel,
} from "../systems/skills/resolve-skill";

// Large enough that a full off-screen spawn ring exists anywhere in the arena,
// and large enough that shrine placement is a real traversal decision.
export const ARENA_SIZE = Object.freeze({ width: 3600, height: 2400 });
const GRID_SIZE = 64;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
/** Pacing telemetry bucket, matched to the balance simulator's reporting window. */
const PACING_BUCKET_MS = 15_000;
/** Window over which one enemy's damage is drawn as a single number. */
const DAMAGE_NUMBER_WINDOW_MS = 120;
/** Live reward orbs allowed before the nearest pair merges. */
const PICKUP_CAP = 250;
/** How far past the arena a drifting enemy travels before it is reclaimed. */
const DRIFT_RECLAIM_MARGIN = 240;
const DEFAULT_UPGRADE_SEED = 0xa7e4_0001;
const SHRINE_PLACEMENT_SEED = 0x5471_0008;
/** An ordinary spawn: itself, at full size. */
const NO_FRAGMENT: FragmentShape = Object.freeze({
  speedMultiplier: 1,
  healthMultiplier: 1,
  radiusMultiplier: 1,
  damageMultiplier: 1,
});
/** How far outside the view a shrine marker is pinned, so it never hides a wall. */
const SHRINE_MARKER_INSET = 44;
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

/** Test-only override for hazard cadence, so a path need not wait a full interval. */
function testHazardIntervalMs(): number | undefined {
  if (import.meta.env.MODE !== "test") return undefined;
  const value = Number(new URLSearchParams(window.location.search).get("hazardIntervalMs"));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

/**
 * Test-only override that restores the V0.3 shrine layout.
 *
 * Shrines now arrive across the run at randomized positions, so a path whose
 * subject is shrine *effects* rather than shrine discovery would otherwise
 * spend its budget walking. `adjacent` places every instance beside the player
 * and reveals them all at once, which is exactly what the V0.3 layout did.
 */
function testShrineLayout(): string | null {
  if (import.meta.env.MODE !== "test") return null;
  return new URLSearchParams(window.location.search).get("shrineLayout");
}

/**
 * Test-only override for the end-of-timer decision.
 *
 * Seventeen browser assertions poll for a `complete` run once the duration
 * expires; their subject is restart, world reset, or terminal accounting, not
 * the decision itself. `complete` ends the run on the last tick, which is
 * exactly what V0.3 did, so those paths keep measuring what they measured.
 * `endless` and `clearing` answer the decision instead, for the path whose
 * subject *is* the decision.
 */
function testOvertimeChoice(): OvertimeChoice | "complete" | null {
  if (import.meta.env.MODE !== "test") return null;
  const value = new URLSearchParams(window.location.search).get("atTimeUp");
  if (value === "endless" || value === "clearing" || value === "complete") return value;
  return null;
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
type FragmentShape = Readonly<{
  speedMultiplier: number;
  healthMultiplier: number;
  radiusMultiplier: number;
  damageMultiplier: number;
}>;
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
  private tabKey?: Phaser.Input.Keyboard.Key;
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
  private shrineArrivals: readonly ScheduledShrine[] = [];
  private shrinesRevealed = 0;
  private shrineRandom = createSeededRandom(SHRINE_PLACEMENT_SEED);
  private shrineMarkers = new Map<
    ShrineActor,
    Readonly<{ arrow: Phaser.GameObjects.Triangle; label: Phaser.GameObjects.Text }>
  >();
  private surgeState: ShrineSurgeState = createShrineSurgeState();
  private levelUpUi?: LevelUpChoiceUi;
  private pauseMenu?: PauseMenuUi;
  private hud?: Hud;
  private runEndOverlay?: RunEndOverlay;
  private overtimeUi?: OvertimeChoiceUi;
  private overtimeChoicesMade = 0;
  private currentChoices: readonly UpgradeDefinition[] = [];
  /** The same draw, carrying each card's rolled tier. */
  private currentOffers: readonly UpgradeOffer[] = [];
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
  private hazards = new Set<HazardActor>();
  private hazardRandom = createSeededRandom(0x4a20_0007);
  private nextHazardAtMs = 0;
  private hazardSequence = 0;
  private hazardsPlaced = 0;
  private hazardsCleared = 0;
  private hazardDamageDealt = 0;
  private hazardSlowActive = false;
  private hazardSlow = 1;
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
  private pickupsMerged = 0;
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
  private hitStop: HitStopState = createHitStopState();
  private damageNumbers = createDamageAggregator();
  private lastFrameMs = 16;
  private deathSlowUntilMs = 0;
  private killChainDetuneCents = 0;

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
        skillLevels: testSkillEnabled("compoundBuild")
          ? {
              [archetypeIds.skill.piercingMomentum]: 3,
              [archetypeIds.skill.onKillExplosion]: 3,
              [archetypeIds.skill.fracture]: 2,
              [archetypeIds.skill.bloodlust]: 2,
              [archetypeIds.skill.chainReaction]: 2,
            }
          : testSkillEnabled("interactions")
          ? {
              [archetypeIds.skill.onKillExplosion]: 2,
              [archetypeIds.skill.fracture]: 2,
              [archetypeIds.skill.bloodlust]: 2,
              [archetypeIds.skill.chainReaction]: 2,
            }
          : testSkillEnabled("piercingMomentum")
          ? { [archetypeIds.skill.piercingMomentum]: 1 }
          : this.runState.skillLevels,
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
    this.planShrineArrivals();
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
    this.tabKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
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
    this.pauseMenu = new PauseMenuUi(this, activeTheme);
    this.hud = new Hud(this, activeTheme);
    this.runEndOverlay = new RunEndOverlay(this, activeTheme);
    this.overtimeUi = new OvertimeChoiceUi(this, activeTheme);

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
      this.pauseMenu?.hide();
      this.runEndOverlay?.hide();
    this.overtimeUi?.hide();
      this.audioFeedback.destroy();
    });
    this.hud.update(this.runState, this.hudExtras());
    this.prepareTestLoadHarness();
    this.prepareTestRosterHarness();
    this.publishTelemetry();
  }

  update(time: number, delta: number): void {
    if (!this.player || !this.runState || !this.pauseKey) return;
    this.lastFrameMs = delta;

    // Hit-stop and the death moment slow the mapping from wall time to
    // simulated time. They never change how much simulation a run performs:
    // the run still ends after its full simulated duration.
    const frozen = isHitStopActive(this.hitStop, time);
    const dying = time < this.deathSlowUntilMs;
    const timeScale = this.reducedMotion ? 1 : frozen ? 0.08 : dying ? 0.35 : 1;
    if (this.physics.world.timeScale !== 1 / timeScale) {
      this.physics.world.timeScale = 1 / timeScale;
    }
    delta *= timeScale;

    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) this.togglePause();
    if (this.runState.status === "paused" && this.pauseMenu?.isOpen) {
      if (this.tabKey && Phaser.Input.Keyboard.JustDown(this.tabKey)) this.pauseMenu.cycleTab(1);
      if (this.cursors?.right && Phaser.Input.Keyboard.JustDown(this.cursors.right)) this.pauseMenu.cycleTab(1);
      if (this.cursors?.left && Phaser.Input.Keyboard.JustDown(this.cursors.left)) this.pauseMenu.cycleTab(-1);
      // Up/down move within a tab; only the Field Guide has anywhere to move.
      if (this.cursors?.down && Phaser.Input.Keyboard.JustDown(this.cursors.down)) this.pauseMenu.cycleCodexSection(1);
      if (this.cursors?.up && Phaser.Input.Keyboard.JustDown(this.cursors.up)) this.pauseMenu.cycleCodexSection(-1);
    }
    if (this.muteKey && Phaser.Input.Keyboard.JustDown(this.muteKey)) this.applySetting("muted");
    if (this.runState.status === "level_up") this.readUpgradeChoiceInput();
    if (this.runState.status === "time_up") this.readOvertimeChoiceInput();

    const preparingRepresentativeLoad =
      testSkillEnabled("representativeLoad") &&
      testSkillEnabled("closeLoad") &&
      this.loadHarnessSpawned < this.loadHarnessRequested;
    if (!preparingRepresentativeLoad) this.runState = advanceRunState(this.runState, delta);
    if (this.runState.status === "time_up") this.showOvertimeChoice();
    if (this.runState.status === "complete") this.enterTerminalState();
    if (this.runState.status === "playing") {
      if (testSkillEnabled("representativeLoad")) {
        this.frameSamples += 1;
        this.frameTotalMs += delta;
        this.maxFrameMs = Math.max(this.maxFrameMs, delta);
      }
      this.player.move(
        this.readMovementInput(),
        this.runState.player.stats.moveSpeed * this.hazardSlow,
      );
      this.updateEnemies();
      this.rebuildEnemyIndex();
      this.resolveCrowd();
      this.updateHazards();
      this.updateProjectiles();
      this.updatePickups();
      this.updateShrine();
      this.updateTestWorldScenario();
      this.updateSurge();
      this.processTestLoadHarness();
      this.processCausalEvents();
      this.updateBloodlust();
      this.flushDamageNumbers();
      this.runState = regenerateRunPlayer(this.runState, delta);
      // Clearing keeps every other system running — projectiles, pickups,
      // hazards, on-kill effects — and only stops the arrivals, so the field
      // empties by being fought rather than by being deleted.
      if (
        this.runState.mode !== "clearing" &&
        this.loadHarnessRequested === 0 &&
        testRosterHarnessSelection() === null
      ) {
        this.releaseMilestoneWaves();
        this.spawnIfReady();
      }
      if (this.runState.mode === "clearing" && this.isFieldClear()) {
        this.runState = completeRun(this.runState);
        this.enterTerminalState();
      }
      this.fireIfReady();
      this.updateLoadHighWaterMarks();
      if (this.runState.elapsedMs >= this.invulnerableUntilMs) this.player.setAlpha(1);
    } else {
      this.player.stop();
      if (this.runState.status === "complete") this.physics.world.pause();
    }

    this.hud?.update(this.runState, this.hudExtras());
    this.publishTelemetry();
  }

  private resetTransientRuntime(): void {
    this.player = undefined;
    this.runState = undefined;
    this.cursors = undefined;
    this.wasd = undefined;
    this.pauseKey = undefined;
    this.muteKey = undefined;
    this.tabKey = undefined;
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
    this.shrineArrivals = [];
    this.shrinesRevealed = 0;
    this.shrineRandom = createSeededRandom(SHRINE_PLACEMENT_SEED);
    for (const marker of this.shrineMarkers.values()) {
      marker.arrow.destroy();
      marker.label.destroy();
    }
    this.shrineMarkers = new Map();
    this.surgeState = createShrineSurgeState();
    this.levelUpUi = undefined;
    this.pauseMenu = undefined;
    this.hud = undefined;
    this.runEndOverlay = undefined;
    this.overtimeUi = undefined;
    this.overtimeChoicesMade = 0;
    this.currentChoices = [];
    this.currentOffers = [];
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
    for (const hazard of this.hazards) hazard.destroy();
    this.hazards = new Set();
    this.hazardRandom = createSeededRandom(0x4a20_0007);
    this.nextHazardAtMs = testHazardIntervalMs() ?? activeTheme.tuning.hazards.baseIntervalMs;
    this.hazardSequence = 0;
    this.hazardsPlaced = 0;
    this.hazardsCleared = 0;
    this.hazardDamageDealt = 0;
    this.hazardSlowActive = false;
    this.hazardSlow = 1;
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
    this.pickupsMerged = 0;
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
    this.reducedMotion = prefersReducedMotion() || getSessionSettings().reducedMotion;
    this.feedbackObjects = new Set();
    this.hitStop = createHitStopState();
    this.damageNumbers = createDamageAggregator();
    this.lastFrameMs = 16;
    this.deathSlowUntilMs = 0;
    this.killChainDetuneCents = 0;
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
      if (this.spawnEnemy(payload.spawnSource ?? "ambient", payload.rewardMultiplier ?? 1, definition, payload.point, payload.elite, undefined, payload.movement, payload.reason === "fracture")) {
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

    // Obstacles are solid for the player using the same resolution.
    for (const obstacle of this.activeObstacles()) {
      if (!isInsideHazard(obstacle.hazardState, this.player, this.player.definition.radius)) continue;
      const dx = this.player.x - obstacle.hazardState.x;
      const dy = this.player.y - obstacle.hazardState.y;
      const distance = Math.hypot(dx, dy);
      const minDistance = obstacle.hazardState.radius + this.player.definition.radius;
      const normalX = distance > 0 ? dx / distance : 1;
      const normalY = distance > 0 ? dy / distance : 0;
      const overlap = minDistance - distance;
      this.player.x = Phaser.Math.Clamp(
        this.player.x + normalX * overlap,
        this.player.definition.radius,
        ARENA_SIZE.width - this.player.definition.radius,
      );
      this.player.y = Phaser.Math.Clamp(
        this.player.y + normalY * overlap,
        this.player.definition.radius,
        ARENA_SIZE.height - this.player.definition.radius,
      );
      this.solidResolutions += 1;
    }
  }

  /**
   * Place, age, and apply hazards.
   *
   * Hazards are world content: they never touch the enemy cap, kill count, or
   * damage ledger. Damage to the player is recorded separately so the ledger
   * keeps meaning "damage the player dealt".
   */
  private updateHazards(): void {
    if (!this.runState || !this.player) return;
    if (testSkillEnabled("noHazards")) return;
    const nowMs = this.runState.elapsedMs;
    const tuning = activeTheme.tuning.hazards;
    const progress = runProgress(nowMs, this.runState.durationMs);

    if (nowMs >= this.nextHazardAtMs && this.hazards.size < tuning.maxActive) {
      this.placeHazard(nowMs);
      this.nextHazardAtMs = nowMs + (testHazardIntervalMs() ?? hazardIntervalMs(
        tuning,
        progress,
        Math.max(0, this.runState.world.chaos - 1),
      ));
    }

    let slowed = 1;
    for (const hazard of [...this.hazards]) {
      if (hazard.refresh(nowMs)) {
        this.hazards.delete(hazard);
        hazard.destroy();
        continue;
      }

      const effect = resolveHazardEffect(hazard.definition, hazard.hazardState, {
        x: this.player.x,
        y: this.player.y,
        radius: this.player.definition.radius,
      }, nowMs);
      if (effect.damage > 0) {
        this.runState = damageRunPlayer(this.runState, effect.damage, {
          sourceId: hazard.definition.id,
          elite: false,
        });
        this.hazardDamageDealt += effect.damage;
        this.player.flashDamage(activeTheme.tokens.palette.critical);
        this.emitFeedback("explosion", this.player.x, this.player.y, "!");
        if (this.runState.status === "dead") {
          this.enterTerminalState();
          return;
        }
      }
      slowed = Math.min(slowed, effect.moveMultiplier);
    }
    this.hazardSlowActive = slowed < 1;
    this.hazardSlow = slowed;
  }

  private placeHazard(nowMs: number): void {
    if (!this.player || !this.runState) return;
    const tuning = activeTheme.tuning.hazards;
    const hazardId = selectHazard(tuning, this.hazardRandom);
    const definition = activeTheme.hazards.find((candidate) => candidate.id === hazardId);
    if (!definition) return;

    // Never on top of the player, and always inside the arena.
    const angle = this.hazardSequence * GOLDEN_ANGLE;
    const distance = tuning.minDistanceFromPlayer +
      this.hazardRandom() * tuning.minDistanceFromPlayer;
    const margin = definition.radius + 20;
    const state: HazardState = {
      id: `hazard-${++this.hazardSequence}`,
      definitionId: definition.id,
      x: Phaser.Math.Clamp(
        this.player.x + Math.cos(angle) * distance,
        margin,
        ARENA_SIZE.width - margin,
      ),
      y: Phaser.Math.Clamp(
        this.player.y + Math.sin(angle) * distance,
        margin,
        ARENA_SIZE.height - margin,
      ),
      radius: definition.radius,
      spawnedAtMs: nowMs,
      health: definition.kind === "obstacle" ? definition.health : 0,
      nextTickAtMs: nowMs + definition.telegraphMs,
    };

    const hazard = new HazardActor(this, definition, state, activeTheme.tokens);
    this.hazards.add(hazard);
    this.hazardsPlaced += 1;
  }

  /** Solid, active obstacles, used for player blocking and enemy steering. */
  private activeObstacles(): readonly HazardActor[] {
    if (!this.runState) return [];
    const nowMs = this.runState.elapsedMs;
    return [...this.hazards].filter(
      (hazard) =>
        hazard.definition.kind === "obstacle" &&
        hazardPhase(hazard.definition, hazard.hazardState, nowMs) === "active",
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
    const obstacles = this.activeObstacles();
    for (const enemy of this.enemies) {
      if (!enemy.active || enemy.defeated) continue;
      enemy.advance(target);
      // One tangential steer, no pathfinding: enough to stop a crowd stalling
      // permanently against an obstacle without paying for navigation.
      if (obstacles.length > 0 && enemy.movement === "chase") {
        const body = enemy.arcadeBody;
        let velocity = { x: body.velocity.x, y: body.velocity.y };
        for (const obstacle of obstacles) {
          velocity = avoidObstacle(enemy, velocity, obstacle.hazardState, enemy.separationRadius);
        }
        body.setVelocity(velocity.x, velocity.y);
      }
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

  /**
   * Schedule the run's shrine arrivals.
   *
   * No actor exists yet: a shrine is created at the moment it arrives, at a
   * position resolved against wherever the player is then. V0.3 laid all five
   * out around the arena centre at run start, which collapsed every risk/reward
   * decision into the opening seconds.
   */
  private planShrineArrivals(): void {
    this.shrineArrivals = scheduleShrineArrivals(
      activeTheme.tuning.shrines,
      this.runState?.durationMs ?? 1,
    );
    this.shrinesRevealed = 0;
    if (testShrineLayout() === "adjacent") this.revealAllShrines();
  }

  /**
   * Create every scheduled shrine beside the player, immediately.
   *
   * Test-only, and used by the paths whose subject is what a shrine does rather
   * than how it is found. Also used by the world scenarios, which activate all
   * five directly and so need all five to exist.
   */
  private revealAllShrines(): void {
    const player = this.player;
    if (!player) return;
    // The V0.3 offsets: one adjacent, the rest on a ring the player can reach in
    // a step. Reproduced exactly so the paths that used them still measure what
    // they measured before.
    const offsets: readonly (readonly [number, number])[] = [
      [96, 0], [-210, 0], [0, -210], [0, 210], [310, 0],
    ];
    while (this.shrinesRevealed < this.shrineArrivals.length) {
      const index = this.shrinesRevealed;
      const [dx, dy] = offsets[index % offsets.length]!;
      this.revealShrine(this.shrineArrivals[index]!, {
        x: Phaser.Math.Clamp(player.x + dx, 96, ARENA_SIZE.width - 96),
        y: Phaser.Math.Clamp(player.y + dy, 96, ARENA_SIZE.height - 96),
      }, false);
    }
  }

  /** Bring one scheduled shrine into the world and announce it. */
  private revealShrine(
    arrival: ScheduledShrine,
    at: Readonly<{ x: number; y: number }>,
    announce: boolean,
  ): void {
    this.shrinesRevealed += 1;
    const definition = activeTheme.shrines.find((candidate) => candidate.id === arrival.shrineId);
    if (!definition) return;
    const actor = new ShrineActor(
      this,
      at.x,
      at.y,
      definition,
      activeTheme.tokens,
      activeTheme.copy.content[definition.id].name,
      activeTheme.copy.vocabulary.shrinePrompt,
    );
    this.shrineActors.push(actor);
    this.shrine ??= definition.id === archetypeIds.shrine.spawnSurge ? actor : undefined;
    if (announce) {
      this.announceShrine(activeTheme.copy.vocabulary.shrineArrived);
      this.emitFeedback("shrine", at.x, at.y, activeTheme.copy.content[definition.id].name);
    }
  }

  /**
   * Reveal due shrines, keep their off-screen markers current, and read intent.
   *
   * A shrine placed anywhere in a 3600x2400 arena is invisible from most of it,
   * so every revealed, unactivated shrine carries a marker pinned to the edge of
   * the view pointing at it. Without one, random placement would just make the
   * shrines undiscoverable.
   */
  private updateShrine(): void {
    if (!this.player || !this.runState) return;
    while (
      this.shrinesRevealed < this.shrineArrivals.length &&
      this.runState.elapsedMs >= this.shrineArrivals[this.shrinesRevealed]!.appearAtMs
    ) {
      this.revealShrine(
        this.shrineArrivals[this.shrinesRevealed]!,
        placeShrine(
          activeTheme.tuning.shrines,
          ARENA_SIZE,
          this.player,
          this.shrineActors,
          this.shrineRandom,
        ),
        true,
      );
    }

    const interact = this.interactKeys.some((key) => Phaser.Input.Keyboard.JustDown(key));
    let activated: ShrineActor | undefined;
    for (const shrine of this.shrineActors) {
      const inRange = Phaser.Math.Distance.Between(this.player.x, this.player.y, shrine.x, shrine.y) <= shrine.definition.interactionRadius;
      shrine.setInRange(inRange);
      if (interact && inRange && !shrine.activated && !activated) activated = shrine;
    }
    this.updateShrineMarkers();
    if (activated) this.activateShrine(activated);
  }

  /** One edge-pinned, named pointer per revealed, unactivated, off-screen shrine. */
  private updateShrineMarkers(): void {
    const camera = this.cameras.main;
    const centreX = this.scale.width / 2;
    const centreY = this.scale.height / 2;
    for (const shrine of this.shrineActors) {
      const marker = this.shrineMarkers.get(shrine);
      if (shrine.activated || camera.worldView.contains(shrine.x, shrine.y)) {
        marker?.arrow.destroy();
        marker?.label.destroy();
        this.shrineMarkers.delete(shrine);
        continue;
      }
      const offset = shrineMarker(
        { x: shrine.x - camera.worldView.centerX, y: shrine.y - camera.worldView.centerY },
        centreX - SHRINE_MARKER_INSET,
        centreY - SHRINE_MARKER_INSET,
      );
      const x = centreX + offset.x;
      const y = centreY + offset.y;
      // The triangle's apex points up at rotation zero, so the heading turns by
      // a quarter turn to aim it.
      const rotation = offset.angle + Math.PI / 2;
      // Below the arrow, except near the bottom edge where that would put the
      // label off the screen.
      const labelY = y > centreY ? y - 24 : y + 22;
      if (marker) {
        marker.arrow.setPosition(x, y).setRotation(rotation);
        marker.label.setPosition(x, labelY);
        continue;
      }
      this.shrineMarkers.set(shrine, {
        arrow: this.add
          .triangle(x, y, 0, 22, 11, 0, 22, 22, Phaser.Display.Color.HexStringToColor(activeTheme.tokens.palette.shrine).color)
          .setRotation(rotation)
          .setScrollFactor(0)
          .setDepth(940),
        label: this.add
          .text(x, labelY, activeTheme.copy.content[shrine.definition.id].name, {
            color: activeTheme.tokens.palette.shrine,
            fontFamily: "Georgia, serif",
            fontSize: "14px",
            stroke: activeTheme.tokens.palette.background,
            strokeThickness: 4,
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(940),
      });
    }
  }

  /** The banner used by both shrine arrival and shrine activation. */
  private announceShrine(text: string): void {
    const message = this.add.text(this.scale.width / 2, 105, text, {
      color: activeTheme.tokens.palette.shrine,
      fontFamily: "Georgia, serif",
      fontSize: "28px",
      fontStyle: "bold",
      stroke: activeTheme.tokens.palette.background,
      strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(950);
    this.tweens.add({
      targets: message,
      alpha: 0,
      y: 80,
      duration: 900,
      onComplete: () => message.destroy(),
    });
  }

  private updateTestWorldScenario(): void {
    const scenario = testWorldScenario();
    if (testSkillEnabled("representativeLoad") && this.loadHarnessSpawned < this.loadHarnessRequested) return;
    if (this.testWorldScenarioApplied || scenario === null || this.enemies.size === 0 || this.runGeneration > 1) return;
    this.testWorldScenarioApplied = true;
    // Scenarios activate shrines directly, so every instance must exist first.
    this.revealAllShrines();
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
      const rewardMultiplier = definition.rewardMultiplier * this.worldModifiers().shrineRewardMultiplier;
      for (const enemy of livingSnapshot) {
        this.enqueueSpawnRequest(enemy.definition.id, definition.id, rewardMultiplier, enemy.targetId, undefined, "duplication", { x: enemy.x + 12, y: enemy.y + 12 }, Boolean(enemy.elite));
        this.duplicatedEnemiesQueued += 1;
      }
    }
    shrine.activate();
    const marker = this.shrineMarkers.get(shrine);
    marker?.arrow.destroy();
    marker?.label.destroy();
    this.shrineMarkers.delete(shrine);
    this.shrineFeedback += 1;
    this.emitFeedback("shrine", shrine.x, shrine.y, "+Chaos");
    if (!this.reducedMotion) {
      this.cameras.main.flash(240, 251, 113, 133, false);
      this.cameras.main.shake(220, 0.006);
    }
    this.announceShrine(
      definition.effectKind === "spawn_surge"
        ? activeTheme.copy.vocabulary.surgeActive
        : activeTheme.copy.content[definition.id].name,
    );
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
          this.worldModifiers().shrineRewardMultiplier,
      );
    }
  }

  /**
   * World pressure at this instant, including elapsed-time escalation.
   *
   * Every consumer goes through here so Chaos and time can never be resolved at
   * different progress values in the same frame.
   */
  private worldModifiers() {
    const runState = this.runState;
    if (!runState) {
      return selectWorldModifiers(createWorldState(), activeTheme.tuning.difficulty, 0);
    }
    return selectWorldModifiers(
      runState.world,
      activeTheme.tuning.difficulty,
      runProgress(runState.elapsedMs, runState.durationMs),
    );
  }

  /** Resolve every director output for the current moment. */
  private currentDirectorPlan(): DirectorPlan | undefined {
    if (!this.runState) return undefined;
    const world = this.worldModifiers();
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
    fragment = false,
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
    const worldModifiers = this.worldModifiers();
    const fragmentShape = fragment ? this.fragmentShape() : NO_FRAGMENT;
    const eliteDefinition = activeTheme.elites.find((elite) => elite.id === eliteIds.baseline);
    const directorEliteChance = resolveEliteChance(
      activeTheme.tuning.director,
      runProgress(this.runState.elapsedMs, this.runState.durationMs),
      worldModifiers.eliteChance,
    );
    const elite = eliteDefinition && shouldSpawnElite(
      testSkillEnabled("forceElite") ? 1 : directorEliteChance * this.luckScale(),
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
        healthMultiplier: worldModifiers.enemyHealthMultiplier *
          (elite?.healthMultiplier ?? 1) * fragmentShape.healthMultiplier,
        damageMultiplier: worldModifiers.enemyDamageMultiplier *
          (elite?.damageMultiplier ?? 1) * fragmentShape.damageMultiplier,
        moveSpeedMultiplier: worldModifiers.enemyMoveSpeedMultiplier * fragmentShape.speedMultiplier,
        radiusMultiplier: fragmentShape.radiusMultiplier,
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
    const momentumEffect = findSkillEffect(
      activeTheme.skills,
      archetypeIds.skill.piercingMomentum,
      "piercing_momentum",
    );
    const momentumLevel = skillLevel(this.runState.skillLevels, archetypeIds.skill.piercingMomentum);
    const momentumPerHit = momentumEffect && momentumLevel > 0
      ? resolveMomentum(momentumEffect, momentumLevel)
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

  /** Projectiles clear destructible obstacles; clearing one is the reward. */
  private damageObstacles(projectile: ProjectileActor): boolean {
    for (const obstacle of this.activeObstacles()) {
      if (!isInsideHazard(obstacle.hazardState, projectile, projectile.displayWidth / 2)) continue;
      if (obstacle.damage(projectile.damage)) {
        this.hazardsCleared += 1;
        this.emitFeedback("explosion", obstacle.x, obstacle.y, "CLEARED");
      }
      projectile.destroy();
      return true;
    }
    return false;
  }

  private handleProjectileEnemyOverlap(projectile: ProjectileActor, enemy: EnemyActor): void {
    if (!this.runState || !projectile.canHit(enemy.targetId) || enemy.defeated) return;
    if (this.damageObstacles(projectile)) return;
    accumulateDamage(
      this.damageNumbers,
      {
        targetId: enemy.targetId,
        amount: projectile.damage,
        tier: projectile.critTier,
        x: enemy.x,
        y: enemy.y,
      },
      this.runState.elapsedMs,
      DAMAGE_NUMBER_WINDOW_MS,
    );
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
    // Enemy armour is multiplicative and the weapon may ignore a share of it.
    const reduced = reduceByArmour(
      damage,
      enemy.definition.armour,
      this.weaponDefinition?.armourPierce ?? 0,
    );
    const appliedDamage = Math.min(enemy.health, Math.max(0, reduced));
    const result = enemy.takeDamage(reduced);
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
    const pendingNumber = drainTarget(this.damageNumbers, enemy.targetId);
    if (pendingNumber) {
      this.renderDamageNumber(enemy.x, enemy.y, pendingNumber.amount, pendingNumber.tier);
    }
    if (enemy.elite) {
      this.eliteDefeated += 1;
      this.requestImpactFreeze(70);
    }
    this.runState = recordKill(this.runState);
    const chain = this.runState.statistics.recentKillTimesMs.length;
    // A big chain is worth a freeze, and the streak has an audible shape.
    if (chain >= 25 && chain % 25 === 0) this.requestImpactFreeze(60);
    this.killChainDetuneCents = killChainDetune(chain);
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
    const explosionEffect = findSkillEffect(
      activeTheme.skills,
      archetypeIds.skill.onKillExplosion,
      "on_kill_explosion",
    );
    const explosionLevel = skillLevel(this.runState.skillLevels, archetypeIds.skill.onKillExplosion);
    const chainEffect = findSkillEffect(
      activeTheme.skills,
      archetypeIds.skill.chainReaction,
      "chain_reaction",
    );
    const chainLevel = skillLevel(this.runState.skillLevels, archetypeIds.skill.chainReaction);
    const chain = chainEffect && chainLevel > 0 ? resolveChain(chainEffect, chainLevel) : undefined;
    const depth = damageSource === "direct" ? 0 : damageSource === "explosion" ? 1 : 2;

    if (
      explosionEffect &&
      explosionLevel > 0 &&
      shouldExplodeOnKill(damageSource, true, chain !== undefined) &&
      // An explicit depth limit keeps a 300-enemy chain finite and measurable.
      (depth === 0 || (chain !== undefined && depth <= chain.maxDepth)) &&
      this.eventQueue.claimEffect(enemy.targetId, archetypeIds.skill.onKillExplosion)
    ) {
      const resolved = resolveExplosion(explosionEffect, explosionLevel);
      const scale = chain ? chainScaleAtDepth(chain, depth) : { damage: 1, radius: 1 };
      // Blast damage scales from what died, so target choice becomes the play.
      const damage = explosionDamage(resolved, enemy.maxHealth) * scale.damage;
      this.eventSequence += 1;
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
        payload: {
          x: enemy.x,
          y: enemy.y,
          radius: resolved.radius * scale.radius,
          damage,
          depth,
        },
      });
    }

    const fracture = findSkillEffect(activeTheme.skills, archetypeIds.skill.fracture, "fracture");
    const fractureLevel = skillLevel(this.runState.skillLevels, archetypeIds.skill.fracture);
    if (
      fracture &&
      fractureLevel > 0 &&
      shouldFracture(
        resolveFractureChance(fracture, fractureLevel) * this.luckScale(),
        this.effectRandom,
      ) &&
      this.eventQueue.claimEffect(enemy.targetId, archetypeIds.skill.fracture)
    ) {
      for (let index = 0; index < fracture.childCount; index += 1) {
        // The parent's own id: a fragment is a smaller, quicker piece of what
        // broke, not a spawn of the fast role.
        this.enqueueSpawnRequest(
          enemy.definition.id,
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

  /**
   * How a fragment differs from what it broke off.
   *
   * Theme data, read from the fracture skill itself, so the shape of a fragment
   * cannot drift from the skill that produces it.
   */
  private fragmentShape(): FragmentShape {
    const fracture = findSkillEffect(activeTheme.skills, archetypeIds.skill.fracture, "fracture");
    return fracture?.fragment ?? NO_FRAGMENT;
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

  /** Draw one number per enemy per window rather than one per hit. */
  private flushDamageNumbers(): void {
    if (!this.runState) return;
    for (const entry of drainDueDamage(this.damageNumbers, this.runState.elapsedMs)) {
      this.renderDamageNumber(entry.x, entry.y, entry.amount, entry.tier);
    }
  }

  private renderDamageNumber(x: number, y: number, amount: number, tier: number): void {
    const category: FeedbackCategory = tier > 1 ? "overcritical" : tier === 1 ? "critical" : "damage";
    this.emitFeedback(category, x, y, String(Math.round(amount)));
  }

  private emitFeedback(category: FeedbackCategory, x: number, y: number, label: string): void {
    const nowMs = this.runState?.elapsedMs ?? 0;
    if (this.feedbackLimiter.allowAudio(category, nowMs)) {
      // Only kill-driven cues ramp; interface cues stay at their own pitch.
      const detune = category === "damage" || category === "critical" || category === "overcritical"
        ? this.killChainDetuneCents
        : 0;
      this.audioFeedback.play(category, detune);
    }
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
    const bloodlust = findSkillEffect(activeTheme.skills, archetypeIds.skill.bloodlust, "bloodlust");
    const level = skillLevel(this.runState.skillLevels, archetypeIds.skill.bloodlust);
    if (!bloodlust || level === 0) {
      this.bloodlustAttackSpeedBonus = 0;
      return;
    }
    const selected = selectBloodlust(
      this.runState.statistics.recentKillTimesMs,
      this.runState.elapsedMs,
      resolveBloodlust(bloodlust, level),
    );
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
    this.enforcePickupCap();
    pickup.once(Phaser.GameObjects.Events.DESTROY, () => this.pickups.delete(pickup));
  }

  /**
   * Bound the pickup population by merging the two nearest into one.
   *
   * Every kill drops a pickup, so a 300-enemy chain creates a second unbounded
   * entity population competing for frame time. Merging keeps the reward exact
   * while capping the count.
   */
  private enforcePickupCap(): void {
    if (this.pickups.size <= PICKUP_CAP) return;
    const live = [...this.pickups].filter((pickup) => pickup.active);
    let best: readonly [PickupActor, PickupActor] | undefined;
    let bestDistance = Number.POSITIVE_INFINITY;

    // Sampled rather than exhaustive: this runs on a spawn, and an approximate
    // nearest pair is entirely adequate for merging reward orbs.
    for (let index = 0; index < live.length; index += 1) {
      const first = live[index]!;
      for (let step = 1; step <= 6 && index + step < live.length; step += 1) {
        const second = live[index + step]!;
        const distance = Phaser.Math.Distance.Between(first.x, first.y, second.x, second.y);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = [first, second];
        }
      }
    }

    if (!best) return;
    const [keep, absorbed] = best;
    keep.absorb(absorbed);
    this.pickupsMerged += 1;
    absorbed.destroy();
  }

  private collectPickup(pickup: PickupActor): void {
    if (!this.runState) return;
    const value = pickup.claim();
    if (value === null) return;
    const claim = claimExperiencePickup(this.claimedPickupIds, pickup.pickupId, value);
    if (!claim.claimed) return;
    this.claimedPickupIds = claim.claimedPickupIds;
    const awardedXp = claim.awardedXp * this.worldModifiers().xpMultiplier;
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
    const luck = this.runState.player.stats.luck;
    const drawn = selectUpgradeChoices(activeTheme.upgrades, 3, this.upgradeRandom, {
      selectedUpgradeIds: this.runState.selectedUpgradeIds,
      luck,
    });
    // Which upgrades appeared, then how good each one rolled. Luck feeds both,
    // but only the second makes a card actually stronger.
    this.currentOffers = rollOfferTiers(drawn, activeTheme.tuning.upgradeTiers, this.upgradeRandom, luck);
    this.currentChoices = this.currentOffers.map((offer) => offer.definition);
    this.levelUpUi.show(this.currentChoices, this.levelUpView(), (choice) => this.chooseUpgrade(choice));
  }

  /** Luck nudges chance-based rolls, with a ceiling so it cannot dominate. */
  private luckScale(): number {
    const luck = this.runState?.player.stats.luck ?? 0;
    return 1 + Math.min(0.5, Math.max(0, luck) / 400);
  }

  private hudExtras() {
    const runState = this.runState;
    const progression = runState?.progression;
    const required = progression?.xpToNextLevel ?? 1;
    return {
      threatStep: runState
        ? selectWorldModifiers(
            runState.world,
            activeTheme.tuning.difficulty,
            runProgress(runState.elapsedMs, runState.durationMs),
          ).threatStep
        : 0,
      killChain: runState?.statistics.recentKillTimesMs.length ?? 0,
      levelProgress: required > 0 ? (progression?.xp ?? 0) / required : 0,
    };
  }

  /** Card content, derived from the same code that applies the upgrade. */
  private levelUpView() {
    const runState = this.runState;
    return {
      descriptions: runState
        ? this.currentOffers.map((offer) =>
            describeUpgrade(runState, offer.definition, activeTheme, offer.tier),
          )
        : [],
      pendingAfterThis: Math.max(0, (runState?.progression.pendingChoices ?? 1) - 1),
      showDetail: getSessionSettings().detailedUpgradeCards,
    };
  }

  private pauseMenuView() {
    const runState = this.runState;
    const session = getSessionStatistics(this.liveRunContribution());
    const summary = runState
      ? selectRunSummaryValues(runState, activeTheme.copy.vocabulary, activeTheme.copy.content)
      : undefined;
    return {
      stats: runState ? selectPlayerStats(runState, activeTheme) : [],
      world: runState
        ? selectWorldLines(
            runState.world,
            activeTheme,
            runProgress(runState.elapsedMs, runState.durationMs),
          )
        : [],
      upgrades: summary?.upgrades ?? [],
      codex: selectShrineCodex(activeTheme),
      codexUpgrades: selectUpgradeCodex(activeTheme, session),
      codexSession: selectSessionCodex(activeTheme, session),
      settings: getSessionSettings(),
    };
  }

  /**
   * What the live run contributes to the session totals.
   *
   * Only while it is still being played. Once it reaches a terminal state it
   * has been folded into the session for real, and counting it here as well
   * would double it.
   */
  private liveRunContribution(): RunContribution | undefined {
    const runState = this.runState;
    if (!runState || runState.status === "dead" || runState.status === "complete") return undefined;
    return { level: runState.progression.level, statistics: runState.statistics };
  }

  private applySetting(key: SettingKey): void {
    const next = updateSessionSettings(toggleSetting(getSessionSettings(), key));
    this.reducedMotion = prefersReducedMotion() || next.reducedMotion;
    this.audioFeedback.setMuted(next.muted);
    this.pauseMenu?.refresh(this.pauseMenuView());
    this.publishTelemetry();
  }

  private readOvertimeChoiceInput(): void {
    if (!this.overtimeUi?.isOpen) return;
    const [first, second] = this.choiceKeys;
    if (first && Phaser.Input.Keyboard.JustDown(first)) this.resolveOvertimeChoice("endless");
    else if (second && Phaser.Input.Keyboard.JustDown(second)) this.resolveOvertimeChoice("clearing");
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
    const offer = this.currentOffers.find((candidate) => candidate.definition.id === choice.id);
    this.runState = applyRunUpgrade(
      this.runState,
      choice,
      (skillId) => skillMaxLevel(activeTheme.skills, skillId),
      tierMultiplier(activeTheme.tuning.upgradeTiers, offer?.tier ?? "common"),
    );
    this.runState = observeRunChaos(this.runState);
    if (this.runState.status === "level_up") {
      this.beginLevelUpChoice();
    } else {
      this.currentChoices = [];
      this.currentOffers = [];
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
    const mitigated = reduceByArmour(enemy.contactDamage, this.runState.player.stats.armour);
    this.runState = damageRunPlayer(this.runState, mitigated, {
      sourceId: enemy.definition.id,
      elite: Boolean(enemy.elite),
    });
    this.lastContactDamageAtMs = this.runState.elapsedMs;
    this.invulnerableUntilMs = this.runState.elapsedMs + enemy.definition.contactCooldownMs;
    this.contactHits += 1;
    if (enemy.solid) this.shovePlayer(enemy);
    this.player.setAlpha(0.35);
    this.player.flashDamage(activeTheme.tokens.palette.critical);
    this.hitFlashes += 1;
    if (this.runState.status === "dead") {
      // A moment of slow motion before the overlay, so death reads as an event.
      if (!this.reducedMotion) this.deathSlowUntilMs = this.time.now + 550;
      this.enterTerminalState();
    }
  }

  /**
   * Ask for a brief freeze. Budgeted and skipped under frame pressure, so
   * emphasis can never become a stall.
   */
  private requestImpactFreeze(durationMs: number): void {
    if (this.reducedMotion) return;
    this.hitStop = requestHitStop(this.hitStop, this.time.now, durationMs, this.lastFrameMs);
  }

  /**
   * Whether a clearing run has anything left to do.
   *
   * Queued spawn work counts: a death-spawner that has just died still owes its
   * offspring, and ending the run before they appear would drop enemies the
   * player was told they had to clear.
   */
  private isFieldClear(): boolean {
    return this.enemies.size === 0 && this.eventQueue.snapshot().backlog === 0;
  }

  /** The end-of-timer decision. Simulation is frozen until it is answered. */
  private showOvertimeChoice(): void {
    if (!this.runState || this.overtimeUi?.isOpen) return;
    this.player?.stop();
    this.physics.world.pause();
    const forced = testOvertimeChoice();
    if (forced === "complete") {
      this.runState = completeRun(this.runState);
      this.enterTerminalState();
      return;
    }
    if (forced) {
      this.resolveOvertimeChoice(forced);
      return;
    }
    this.overtimeUi?.show(this.enemies.size, (choice) => this.resolveOvertimeChoice(choice));
  }

  private resolveOvertimeChoice(choice: OvertimeChoice): void {
    if (!this.runState || this.runState.status !== "time_up") return;
    this.overtimeUi?.hide();
    this.overtimeChoicesMade += 1;
    this.runState = chooseRunMode(this.runState, choice);
    this.physics.world.resume();
    // Clearing an already-empty field would otherwise wait a frame for the
    // update loop, showing a live run for no reason.
    if (choice === "clearing" && this.isFieldClear()) {
      this.runState = completeRun(this.runState);
      this.enterTerminalState();
    }
    this.publishTelemetry();
  }

  private enterTerminalState(): void {
    if (!this.runState || this.terminalShown) return;
    if (this.runState.status !== "dead" && this.runState.status !== "complete") return;
    this.terminalShown = true;
    this.player?.stop();
    for (const entry of drainAll(this.damageNumbers)) {
      this.renderDamageNumber(entry.x, entry.y, entry.amount, entry.tier);
    }
    this.physics.world.timeScale = 1;
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
    recordFinishedRun({
      level: this.runState.progression.level,
      statistics: this.runState.statistics,
    });
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
    this.hud?.update(this.runState, this.hudExtras());
    this.publishTelemetry();
  }

  private handleGameFocus(): void {
    if (!this.runState || !this.focusPaused || this.runState.status !== "paused") return;
    this.focusPaused = false;
    this.audioFeedback.setFocused(true);
    this.runState = setRunStatus(this.runState, "playing");
    this.physics.world.resume();
    this.hud?.update(this.runState, this.hudExtras());
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
      this.pauseMenu?.show(this.pauseMenuView(), (key) => this.applySetting(key));
    } else if (this.runState.status === "paused") {
      this.pauseMenu?.hide();
      this.runState = setRunStatus(this.runState, "playing");
      this.physics.world.resume();
    }
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.cameras.resize(gameSize.width, gameSize.height);
    this.hud?.resize();
    if (this.runState?.status === "level_up" && this.currentChoices.length === 3) {
      this.levelUpUi?.show(this.currentChoices, this.levelUpView(), (choice) => this.chooseUpgrade(choice));
    }
    if (this.runState?.status === "paused" && this.pauseMenu?.isOpen) {
      this.pauseMenu.refresh(this.pauseMenuView());
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
    const world = this.runState ? this.worldModifiers() : undefined;
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
            mode: this.runState.mode,
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
        pickupsMerged: this.pickupsMerged,
        choiceIds: this.currentChoices.map((choice) => choice.id),
        selectedUpgradeIds: this.runState?.selectedUpgradeIds ?? [],
        skillLevels: { ...(this.runState?.skillLevels ?? {}) },
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
      impact: {
        hitStopGranted: this.hitStop.granted,
        hitStopDenied: this.hitStop.denied,
        hitStopSpentMs: this.hitStop.spentMs,
        damageAccumulated: this.damageNumbers.accumulated,
        damageFlushed: this.damageNumbers.flushed,
        pendingNumbers: this.damageNumbers.pending.size,
        killChainDetuneCents: this.killChainDetuneCents,
        deathCause: this.runState?.deathCause
          ? { ...this.runState.deathCause }
          : null,
      },
      ui: {
        pauseOpen: Boolean(this.pauseMenu?.isOpen),
        pauseTab: this.pauseMenu?.activeTab ?? null,
        settings: { ...getSessionSettings() },
        cardDescriptions: this.runState
          ? this.currentChoices.map((choice) => {
              const offer = this.currentOffers.find(
                (candidate) => candidate.definition.id === choice.id,
              );
              const description = describeUpgrade(
                this.runState!,
                choice,
                activeTheme,
                offer?.tier ?? "common",
              );
              return {
                id: description.id,
                level: description.level,
                nextLevel: description.nextLevel,
                isNew: description.isNew,
                rarity: description.rarity,
                tier: description.tier,
                tierMultiplier: description.tierMultiplier,
                lines: description.lines.map((line) => ({
                  label: line.label,
                  from: line.from ?? null,
                  to: line.to,
                })),
              };
            })
          : [],
        codexEntries: selectShrineCodex(activeTheme).map((entry) => ({
          id: entry.id,
          name: entry.name,
          effects: entry.effects.map((effect) => ({ label: effect.label, display: effect.display })),
        })),
        codexSection: this.pauseMenu?.activeCodexSection ?? null,
        codexUpgrades: selectUpgradeCodex(
          activeTheme,
          getSessionStatistics(this.liveRunContribution()),
        ).map((entry) => ({
          id: entry.id,
          name: entry.name,
          sessionTotal: entry.sessionTotal,
          bestInRun: entry.bestInRun,
          maxPerRun: entry.maxPerRun,
        })),
        codexSession: selectSessionCodex(
          activeTheme,
          getSessionStatistics(this.liveRunContribution()),
        ).map((line) => ({ label: line.label, display: line.display })),
        statLines: this.runState
          ? selectPlayerStats(this.runState, activeTheme).map((line) => ({
              key: line.key,
              display: line.display,
            }))
          : [],
      },
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
      hazards: {
        active: this.hazards.size,
        placed: this.hazardsPlaced,
        cleared: this.hazardsCleared,
        damageDealt: this.hazardDamageDealt,
        slowActive: this.hazardSlowActive,
        byKind: Object.fromEntries(
          activeTheme.hazards.map((definition) => [
            definition.id,
            [...this.hazards].filter((hazard) => hazard.definition.id === definition.id).length,
          ]),
        ),
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
        instances: this.shrineActors.map((actor) => ({
          id: actor.definition.id,
          activated: actor.activated,
          x: actor.x,
          y: actor.y,
        })),
        plannedCount: this.shrineArrivals.length,
        revealedCount: this.shrineActors.length,
        nextAppearAtMs: this.shrineArrivals[this.shrinesRevealed]?.appearAtMs ?? null,
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
