import Phaser from "phaser";
import type { EnemyPrimitivePart, ThemeTokens } from "../core/archetypes/contracts";
import type { EnemyActor } from "./enemy-actor";

/** Theme-authored primitive composition. It follows an actor, never defines a body. */
export class EnemyPrimitiveView {
  readonly image: Phaser.GameObjects.Container;
  private readonly parts: readonly { shape: Phaser.GameObjects.Rectangle; colour: number }[];
  constructor(source: EnemyActor, definitions: readonly EnemyPrimitivePart[], tokens: ThemeTokens) {
    const scene = source.scene;
    this.parts = definitions.map((part) => {
      const colour = Phaser.Display.Color.HexStringToColor(tokens.palette[part.token]).color;
      const shape = scene.add.rectangle(part.x * source.displayDiameter, part.y * source.displayDiameter,
        part.width * source.displayDiameter, part.height * source.displayDiameter, colour).setRotation(part.rotation);
      if (source.elite) shape.setStrokeStyle(source.lineWidth, source.strokeColor, source.strokeAlpha);
      return { shape, colour };
    });
    this.image = scene.add.container(source.x, source.y, this.parts.map((part) => part.shape));
    source.setVisible(false);
    const sync = () => {
      this.image.setPosition(source.x, source.y).setRotation(source.rotation).setScale(source.scaleX, source.scaleY)
        .setAlpha(source.alpha).setDepth(source.depth);
    };
    // Only the sparse composed actors register here; no per-frame work for ordinary actors.
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, sync);
    source.once(Phaser.GameObjects.Events.DESTROY, () => {
      scene.events.off(Phaser.Scenes.Events.POST_UPDATE, sync);
      this.image.destroy();
    });
    sync();
  }
  flash(colour: number, durationMs: number): void {
    for (const part of this.parts) part.shape.setFillStyle(colour);
    this.image.scene.time.delayedCall(durationMs, () => {
      if (!this.image.active) return;
      for (const part of this.parts) part.shape.setFillStyle(part.colour);
    });
  }
}
