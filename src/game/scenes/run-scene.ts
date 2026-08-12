import Phaser from "phaser";
import { archetypeIds } from "../core/archetypes/ids";
import { activeTheme } from "../content/active-theme";
import { updateTestTelemetry } from "../../test-support/telemetry-bridge";

const GRID_SIZE = 64;

export class RunScene extends Phaser.Scene {
  constructor() {
    super("run");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(activeTheme.tokens.palette.background);
    this.drawArena(this.scale.width, this.scale.height);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    });
    this.publishTelemetry();
  }

  private drawArena(width: number, height: number): void {
    this.children.removeAll(true);

    const palette = activeTheme.tokens.palette;
    const graphics = this.add.graphics();
    graphics.fillStyle(Phaser.Display.Color.HexStringToColor(palette.floor).color, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.lineStyle(1, Phaser.Display.Color.HexStringToColor(palette.grid).color, 0.65);

    for (let x = 0; x <= width; x += GRID_SIZE) graphics.lineBetween(x, 0, x, height);
    for (let y = 0; y <= height; y += GRID_SIZE) graphics.lineBetween(0, y, width, y);

    const player = activeTheme.characters.find(
      (character) => character.id === archetypeIds.character.starter,
    );
    if (!player) throw new Error("The active theme has no starter character");

    const playerColour = Phaser.Display.Color.HexStringToColor(
      palette[player.presentationToken],
    ).color;
    const centreX = width / 2;
    const centreY = height / 2 + 34;
    const marker = this.add.rectangle(
      centreX,
      centreY,
      player.radius * 2,
      player.radius * 2,
      playerColour,
    );
    if (activeTheme.tokens.playerShape === "diamond") marker.setRotation(Math.PI / 4);

    const title = this.add
      .text(centreX, Math.max(54, height * 0.2), activeTheme.copy.gameTitle, {
        color: palette.text,
        fontFamily: "Georgia, serif",
        fontSize: `${Phaser.Math.Clamp(width * 0.05, 30, 58)}px`,
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(centreX, title.y + 58, activeTheme.copy.arenaName, {
        color: palette.accent,
        fontFamily: "Georgia, serif",
        fontSize: `${Phaser.Math.Clamp(width * 0.024, 16, 26)}px`,
      })
      .setOrigin(0.5);

    this.add
      .text(centreX, height - 48, activeTheme.copy.bootStatus, {
        color: palette.text,
        fontFamily: "Georgia, serif",
        fontSize: "18px",
      })
      .setAlpha(0.8)
      .setOrigin(0.5);
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.cameras.resize(gameSize.width, gameSize.height);
    this.drawArena(gameSize.width, gameSize.height);
    this.publishTelemetry();
  }

  private publishTelemetry(): void {
    updateTestTelemetry({
      status: "ready",
      scene: this.scene.key,
      themeId: activeTheme.id,
      canvas: { width: this.scale.width, height: this.scale.height },
    });
  }
}
