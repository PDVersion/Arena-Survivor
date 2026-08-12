import Phaser from "phaser";
import { activeTheme } from "../content/active-theme";
import { archetypeIds } from "../core/archetypes/ids";
import { PlayerActor } from "../entities/player-actor";
import { createInitialProfile } from "../state/profile-state";
import {
  advanceRunState,
  createRunState,
  setRunStatus,
  type RunState,
} from "../state/run-state";
import type { DirectionalInput } from "../systems/player-movement";
import { updateTestTelemetry } from "../../test-support/telemetry-bridge";

export const ARENA_SIZE = Object.freeze({ width: 2400, height: 1600 });
const GRID_SIZE = 64;

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
    } else {
      this.player.stop();
      if (this.runState.status === "complete") this.physics.world.pause();
    }

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
          }
        : undefined,
    });
  }
}
