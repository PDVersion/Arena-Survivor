import Phaser from "phaser";
import type { ThemeTokens } from "../core/archetypes/contracts";
import type { EnemyActor } from "./enemy-actor";

/** Essential gameplay warning, independent of optional effects and sprite art. */
export class EnemyMotionCue {
  readonly image: Phaser.GameObjects.Graphics;
  constructor(source: EnemyActor, tokens: ThemeTokens) {
    const definition = source.definition.committedMotion!;
    const colour = Phaser.Display.Color.HexStringToColor(tokens.palette[definition.cueToken]).color;
    const scene = source.scene;
    this.image = scene.add.graphics();
    const sync = () => {
      this.image.clear().setPosition(source.x, source.y).setDepth(source.depth - 1);
      const state = source.motionState;
      if (!source.active || source.defeated || state.phase === "approach") return;
      this.image.lineStyle(definition.cueWidth, colour, 1);
      this.image.strokeCircle(0, 0, source.displayDiameter / 2);
      if (state.phase === "recover") return;
      const remainingMs = state.phase === "travel" ? definition.travelMs - state.elapsedMs : definition.travelMs;
      const distance = source.moveSpeed * definition.speedMultiplier * remainingMs / 1000;
      const dx = state.headingX * distance, dy = state.headingY * distance;
      this.image.lineBetween(0, 0, dx, dy);
      // Arrowhead uses the authored visual footprint, never a collision input.
      const head = source.displayDiameter / 2;
      this.image.lineBetween(dx, dy, dx - state.headingX * head - state.headingY * head, dy - state.headingY * head + state.headingX * head);
      this.image.lineBetween(dx, dy, dx - state.headingX * head + state.headingY * head, dy - state.headingY * head - state.headingX * head);
    };
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, sync);
    source.once(Phaser.GameObjects.Events.DESTROY, () => {
      scene.events.off(Phaser.Scenes.Events.POST_UPDATE, sync);
      this.image.destroy();
    });
    sync();
  }
}
