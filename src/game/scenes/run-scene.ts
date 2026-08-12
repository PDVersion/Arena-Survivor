import Phaser from "phaser";
import { activeTheme } from "../content/active-theme";
import { archetypeIds } from "../core/archetypes/ids";
import type {
  EnemyDefinition,
  PickupDefinition,
  UpgradeDefinition,
  WeaponDefinition,
} from "../core/archetypes/contracts";
import { EnemyActor } from "../entities/enemy-actor";
import { PickupActor } from "../entities/pickup-actor";
import { PlayerActor } from "../entities/player-actor";
import { ProjectileActor } from "../entities/projectile-actor";
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
import { findNearestTarget } from "../systems/targeting";
import { createSeededRandom, selectUpgradeChoices } from "../systems/upgrades";
import { LevelUpChoiceUi } from "../ui/level-up-choice-ui";
import { claimExperiencePickup } from "../systems/xp";
import { Hud } from "../ui/hud";
import { RunEndOverlay } from "../ui/run-end-overlay";
import { selectHudValues } from "../state/statistics";
import { updateTestTelemetry } from "../../test-support/telemetry-bridge";

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

interface MovementKeys {
  readonly up: Phaser.Input.Keyboard.Key;
  readonly down: Phaser.Input.Keyboard.Key;
  readonly left: Phaser.Input.Keyboard.Key;
  readonly right: Phaser.Input.Keyboard.Key;
}

export class RunScene extends Phaser.Scene {
  private player?: PlayerActor;
  private runState?: RunState;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: MovementKeys;
  private pauseKey?: Phaser.Input.Keyboard.Key;
  private choiceKeys: readonly Phaser.Input.Keyboard.Key[] = [];
  private enemyGroup?: Phaser.Physics.Arcade.Group;
  private projectileGroup?: Phaser.Physics.Arcade.Group;
  private pickupGroup?: Phaser.Physics.Arcade.Group;
  private enemies = new Set<EnemyActor>();
  private projectiles = new Set<ProjectileActor>();
  private pickups = new Set<PickupActor>();
  private enemyDefinition?: EnemyDefinition;
  private weaponDefinition?: WeaponDefinition;
  private pickupDefinition?: PickupDefinition;
  private levelUpUi?: LevelUpChoiceUi;
  private hud?: Hud;
  private runEndOverlay?: RunEndOverlay;
  private currentChoices: readonly UpgradeDefinition[] = [];
  private upgradeRandom = createSeededRandom(DEFAULT_UPGRADE_SEED);
  private nextSpawnAtMs = 0;
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
    this.enemyDefinition = activeTheme.enemies.find(
      (enemy) => enemy.id === archetypeIds.enemy.swarmBasic,
    );
    this.weaponDefinition = activeTheme.weapons.find(
      (weapon) => weapon.id === archetypeIds.weapon.starterProjectile,
    );
    this.pickupDefinition = activeTheme.pickups.find(
      (pickup) => pickup.id === archetypeIds.pickup.experience,
    );
    if (!this.enemyDefinition || !this.weaponDefinition || !this.pickupDefinition) {
      throw new Error("The active theme is missing required run content");
    }

    this.runState = createRunState({
      themeId: activeTheme.id,
      characterId: selectedCharacter.id,
      baseStats: selectedCharacter.baseStats,
      durationMs: testRunDurationMs(),
    });

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
    window.addEventListener("keydown", this.handleRestartKey);
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
      this.hud?.destroy();
      this.levelUpUi?.hide();
      this.runEndOverlay?.hide();
    });
    this.hud.update(this.runState);
    this.publishTelemetry();
  }

  update(_time: number, delta: number): void {
    if (!this.player || !this.runState || !this.pauseKey) return;

    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) this.togglePause();
    if (this.runState.status === "level_up") this.readUpgradeChoiceInput();

    this.runState = advanceRunState(this.runState, delta);
    if (this.runState.status === "complete") this.enterTerminalState();
    if (this.runState.status === "playing") {
      this.player.move(this.readMovementInput(), this.runState.player.stats.moveSpeed);
      this.updateEnemies();
      this.updateProjectiles();
      this.updatePickups();
      this.spawnIfReady();
      this.fireIfReady();
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
    this.choiceKeys = [];
    this.enemyGroup = undefined;
    this.projectileGroup = undefined;
    this.pickupGroup = undefined;
    this.enemies = new Set();
    this.projectiles = new Set();
    this.pickups = new Set();
    this.enemyDefinition = undefined;
    this.weaponDefinition = undefined;
    this.pickupDefinition = undefined;
    this.levelUpUi = undefined;
    this.hud = undefined;
    this.runEndOverlay = undefined;
    this.currentChoices = [];
    this.upgradeRandom = createSeededRandom(DEFAULT_UPGRADE_SEED);
    this.nextSpawnAtMs = 0;
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

  private spawnIfReady(): void {
    if (
      !this.player ||
      !this.runState ||
      !this.enemyDefinition ||
      !this.enemyGroup ||
      this.runState.elapsedMs < this.nextSpawnAtMs ||
      !canSpawn(this.enemies.size, V01_SPAWN_LIMITS.maxAlive)
    ) {
      return;
    }

    const point = pointOnSpawnRing(
      this.player,
      SPAWN_RADIUS,
      this.spawnSequence * GOLDEN_ANGLE,
      ARENA_SIZE,
      this.enemyDefinition.radius,
    );
    this.spawnSequence += 1;
    this.enemySequence += 1;
    const enemy = new EnemyActor(
      this,
      `enemy-${this.enemySequence}`,
      point.x,
      point.y,
      this.enemyDefinition,
      activeTheme.tokens,
    );
    this.enemies.add(enemy);
    this.enemyGroup.add(enemy);
    enemy.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.enemies.delete(enemy);
      if (this.runState) this.runState = setLiveEnemyCount(this.runState, this.enemies.size);
    });
    this.runState = setLiveEnemyCount(this.runState, this.enemies.size);
    this.nextSpawnAtMs = this.runState.elapsedMs + SPAWN_INTERVAL_MS;
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
        this.runState.elapsedMs,
        Math.max(0, Math.floor(this.weaponDefinition.pierce + this.runState.weaponModifiers.pierce)),
      );
      this.projectiles.add(projectile);
      this.projectileGroup.add(projectile);
      this.projectileSequence += 1;
      projectile.launch(baseAngle + offset, this.weaponDefinition.projectileSpeed);
      projectile.once(Phaser.GameObjects.Events.DESTROY, () => this.projectiles.delete(projectile));
      this.shotsFired += 1;
      if (damage.critical) this.criticalShots += 1;
    }
    const attackSpeedMultiplier = Math.max(0.01, 1 + this.runState.player.stats.attackSpeedBonus);
    this.nextFireAtMs = this.runState.elapsedMs + this.weaponDefinition.cooldownMs / attackSpeedMultiplier;
  }

  private handleProjectileEnemyOverlap(projectile: ProjectileActor, enemy: EnemyActor): void {
    if (!this.runState || !projectile.canHit(enemy.targetId) || enemy.defeated) return;
    const result = enemy.takeDamage(projectile.damage);
    if (result.applied) this.hitFlashes += 1;
    projectile.registerHit(enemy.targetId);
    if (!result.killed) return;
    this.runState = recordKill(this.runState);
    this.dropExperience(enemy.x, enemy.y, enemy.definition.xpReward);
    enemy.destroy();
  }

  private dropExperience(x: number, y: number, xpValue: number): void {
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
    this.runState = awardRunExperience(this.runState, claim.awardedXp);
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
    this.runState = damageRunPlayer(this.runState, enemy.definition.contactDamage);
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
    if (event.code === "KeyR" || event.code === "Enter") this.restartRun();
  };

  private handleGameBlur(): void {
    if (!this.runState || this.runState.status !== "playing") return;
    this.runState = setRunStatus(this.runState, "paused");
    this.player?.stop();
    this.physics.world.pause();
    this.focusPaused = true;
    this.hud?.update(this.runState);
    this.publishTelemetry();
  }

  private handleGameFocus(): void {
    if (!this.runState || !this.focusPaused || this.runState.status !== "paused") return;
    this.focusPaused = false;
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
            }
          : null,
      },
      progression: {
        pickups: this.pickups.size,
        pickupsDropped: this.pickupsDropped,
        pickupsCollected: this.pickupsCollected,
        choiceIds: this.currentChoices.map((choice) => choice.id),
        selectedUpgradeIds: this.runState?.selectedUpgradeIds ?? [],
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
      },
    });
  }
}
