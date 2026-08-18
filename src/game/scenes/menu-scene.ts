import Phaser from "phaser";
import { activeTheme } from "../content/active-theme";
import { getSessionStatistics } from "../state/session-statistics";
import { updateTestTelemetry } from "../../test-support/telemetry-bridge";

/**
 * The title screen.
 *
 * The build previously dropped straight from boot into a live run, so a player
 * arrived already being attacked, with no statement of what the game is and
 * nowhere to return to. The menu is deliberately thin — it starts a run, states
 * the fiction, and reports what the session has done so far. Character select,
 * mode select, and the save export/import surface belong to V0.4 and have room
 * here when they land.
 *
 * It owns no simulation. Everything it shows is read from the theme and the
 * session statistics slice, so it cannot drift from the run it starts.
 */
export class MenuScene extends Phaser.Scene {
  private startBounds?: Phaser.Geom.Rectangle;

  constructor() {
    super("menu");
  }

  create(): void {
    const { width, height } = this.scale;
    const palette = activeTheme.tokens.palette;
    const copy = activeTheme.copy;
    this.cameras.main.setBackgroundColor(palette.background);
    this.drawBackdrop();

    const centreX = width / 2;
    this.add
      .text(centreX, height * 0.24, copy.gameTitle, {
        color: palette.accent,
        fontFamily: "Georgia, serif",
        fontSize: "64px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(centreX, height * 0.24 + 62, copy.arenaName, {
        color: palette.text,
        fontFamily: "Georgia, serif",
        fontSize: "24px",
      })
      .setOrigin(0.5)
      .setAlpha(0.75);

    const startY = height * 0.52;
    const startLabel = this.add
      .text(centreX, startY, copy.vocabulary.startAction, {
        color: palette.background,
        fontFamily: "Georgia, serif",
        fontSize: "26px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    // Sized to its own label, because the label is theme copy of unknown length.
    const buttonWidth = startLabel.width + 72;
    const button = this.add
      .rectangle(centreX, startY, buttonWidth, 58, Phaser.Display.Color.HexStringToColor(palette.accent).color, 1)
      .setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(palette.text).color);
    button.setInteractive({ useHandCursor: true });
    this.children.bringToTop(startLabel);
    this.startBounds = new Phaser.Geom.Rectangle(
      centreX - buttonWidth / 2,
      startY - 29,
      buttonWidth,
      58,
    );
    this.tweens.add({
      targets: button,
      alpha: 0.72,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    this.add
      .text(centreX, startY + 62, copy.vocabulary.startHint, {
        color: palette.text,
        fontFamily: "Georgia, serif",
        fontSize: "17px",
      })
      .setOrigin(0.5)
      .setAlpha(0.7);

    this.add
      .text(centreX, height * 0.76, copy.movementHint, {
        align: "center",
        color: palette.text,
        fontFamily: "Georgia, serif",
        fontSize: "17px",
      })
      .setOrigin(0.5)
      .setAlpha(0.6);

    const session = getSessionStatistics();
    if (session.runsPlayed > 0) {
      const codex = copy.codex;
      this.add
        .text(
          centreX,
          height * 0.76 + 30,
          [
            `${codex.runsPlayed} ${session.runsPlayed}`,
            `${codex.best} ${copy.vocabulary.level} ${session.bestLevel}`,
            `${codex.best} ${copy.vocabulary.kills} ${session.bestKills}`,
          ].join("   ·   "),
          {
            color: palette.pickup,
            fontFamily: "Georgia, serif",
            fontSize: "16px",
          },
        )
        .setOrigin(0.5)
        .setAlpha(0.85);
    }

    this.input.keyboard?.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.handleKey, this);
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointer, this);
    this.publishTelemetry();
  }

  /** The same grid the arena draws, so the menu reads as part of the game. */
  private drawBackdrop(): void {
    const { width, height } = this.scale;
    const palette = activeTheme.tokens.palette;
    const grid = this.add.graphics();
    grid.fillStyle(Phaser.Display.Color.HexStringToColor(palette.floor).color, 1);
    grid.fillRect(0, 0, width, height);
    grid.lineStyle(1, Phaser.Display.Color.HexStringToColor(palette.grid).color, 0.6);
    for (let x = 0; x <= width; x += 64) grid.lineBetween(x, 0, x, height);
    for (let y = 0; y <= height; y += 64) grid.lineBetween(0, y, width, y);
    grid.setDepth(-1);
  }

  private handleKey(event: KeyboardEvent): void {
    if (event.code === "Enter" || event.code === "Space" || event.code === "NumpadEnter") {
      this.startRun();
    }
  }

  private handlePointer(pointer: Phaser.Input.Pointer): void {
    if (this.startBounds?.contains(pointer.x, pointer.y)) this.startRun();
  }

  private startRun(): void {
    this.input.keyboard?.off(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.handleKey, this);
    this.input.off(Phaser.Input.Events.POINTER_DOWN, this.handlePointer, this);
    this.scene.start("run");
  }

  private publishTelemetry(): void {
    const session = getSessionStatistics();
    updateTestTelemetry({
      status: "ready",
      scene: this.scene.key,
      themeId: activeTheme.id,
      canvas: { width: this.scale.width, height: this.scale.height },
      menu: {
        title: activeTheme.copy.gameTitle,
        startAction: activeTheme.copy.vocabulary.startAction,
        runsPlayed: session.runsPlayed,
        bestLevel: session.bestLevel,
      },
    });
  }
}
