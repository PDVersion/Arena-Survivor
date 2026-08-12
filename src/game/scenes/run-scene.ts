import Phaser from "phaser";
import { activeTheme } from "../content/active-theme";
import { archetypeIds } from "../core/archetypes/ids";
import type { EnemyDefinition, WeaponDefinition } from "../core/archetypes/contracts";
import { EnemyActor } from "../entities/enemy-actor";
import { PlayerActor } from "../entities/player-actor";
import { ProjectileActor } from "../entities/projectile-actor";
import { createInitialProfile } from "../state/profile-state";
import {
  advanceRunState,
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
import { updateTestTelemetry } from "../../test-support/telemetry-bridge";

export const ARENA_SIZE = Object.freeze({ width: 2400, height: 1600 });
const GRID_SIZE = 64;
const SPAWN_INTERVAL_MS = 400;
const SPAWN_RADIUS = 360;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

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
  private enemyGroup?: Phaser.Physics.Arcade.Group;
  private projectileGroup?: Phaser.Physics.Arcade.Group;
  private enemies = new Set<EnemyActor>();
  private projectiles = new Set<ProjectileActor>();
  private enemyDefinition?: EnemyDefinition;
  private weaponDefinition?: WeaponDefinition;
  private nextSpawnAtMs = 0;
  private nextFireAtMs = 0;
  private lastContactDamageAtMs = Number.NEGATIVE_INFINITY;
  private invulnerableUntilMs = 0;
  private spawnSequence = 0;
  private enemySequence = 0;
  private shotsFired = 0;
  private criticalShots = 0;
  private contactHits = 0;

  constructor() {
    super("run");
  }

  create(): void {
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
    if (!this.enemyDefinition || !this.weaponDefinition) {
      throw new Error("The active theme is missing required combat content");
    }

    this.runState = createRunState({
      themeId: activeTheme.id,
      characterId: selectedCharacter.id,
      baseStats: selectedCharacter.baseStats,
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

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
      this.physics.world.resume();
    });
    this.publishTelemetry();
  }

  update(_time: number, delta: number): void {
    if (!this.player || !this.runState || !this.pauseKey) return;

    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) this.togglePause();

    this.runState = advanceRunState(this.runState, delta);
    if (this.runState.status === "playing") {
      this.player.move(this.readMovementInput());
      this.updateEnemies();
      this.updateProjectiles();
      this.spawnIfReady();
      this.fireIfReady();
      if (this.runState.elapsedMs >= this.invulnerableUntilMs) this.player.setAlpha(1);
    } else {
      this.player.stop();
      if (this.runState.status === "complete") this.physics.world.pause();
    }

    this.publishTelemetry();
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
      if (projectile.active && projectile.hasExpired(this.runState.elapsedMs)) projectile.destroy();
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
    for (let index = 0; index < this.weaponDefinition.projectileCount; index += 1) {
      if (!canSpawn(this.projectiles.size, V01_SPAWN_LIMITS.maxProjectiles)) break;
      const offset = (index - (this.weaponDefinition.projectileCount - 1) / 2) * 0.12;
      const projectile = new ProjectileActor(
        this,
        this.player.x,
        this.player.y,
        baseAngle + offset,
        this.weaponDefinition,
        activeTheme.tokens,
        damage.damage,
        damage.critical,
        this.runState.elapsedMs,
      );
      this.projectiles.add(projectile);
      this.projectileGroup.add(projectile);
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
    projectile.registerHit(enemy.targetId);
    if (!result.killed) return;
    this.runState = recordKill(this.runState);
    enemy.destroy();
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
    if (this.runState.status === "dead") {
      this.player.stop();
      this.physics.world.pause();
    }
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
    this.publishTelemetry();
  }

  private publishTelemetry(): void {
    const body = this.player?.arcadeBody;
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
          }
        : undefined,
      player: this.player
        ? {
            characterId: this.player.definition.id,
            x: this.player.x,
            y: this.player.y,
            radius: this.player.definition.radius,
            moveSpeed: this.player.definition.baseStats.moveSpeed,
            velocityX: body?.velocity.x ?? 0,
            velocityY: body?.velocity.y ?? 0,
            health: this.runState?.player.health ?? 0,
            invulnerable: Boolean(
              this.runState && this.runState.elapsedMs < this.invulnerableUntilMs,
            ),
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
      },
    });
  }
}
