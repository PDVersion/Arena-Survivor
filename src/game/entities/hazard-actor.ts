import Phaser from "phaser";
import type { HazardDefinition, ThemeTokens } from "../core/archetypes/contracts";
import type { HazardState } from "../systems/hazards/hazards";
import { hazardPhase } from "../systems/hazards/hazards";
import { createSpriteView, type SpriteView } from "../systems/sprites/sprite-view";

/**
 * A generic hazard actor, configured by definition.
 *
 * Hazards are world content: no physics body, no enemy-cap slot, no kill or
 * reward accounting. The actor only renders phase — telegraphing, active,
 * expired — so a player can always see a hazard before it can hurt them.
 */
export class HazardActor extends Phaser.GameObjects.Arc {
  readonly hazardId: string;
  readonly definition: HazardDefinition;
  /** Named `hazardState` because Phaser reserves `state` on GameObject. */
  readonly hazardState: HazardState;
  /** Present only when this pack has a sprite for the hazard. */
  readonly view?: SpriteView;
  private lastPhase: string | null = null;
  private readonly baseColour: number;

  constructor(
    scene: Phaser.Scene,
    definition: HazardDefinition,
    state: HazardState,
    tokens: ThemeTokens,
  ) {
    const colour = Phaser.Display.Color.HexStringToColor(
      tokens.palette[definition.presentationToken],
    ).color;
    super(scene, state.x, state.y, state.radius, 0, 360, false, colour, 0.16);
    this.hazardId = state.id;
    this.definition = definition;
    this.hazardState = state;
    this.baseColour = colour;
    this.setStrokeStyle(3, colour, 0.85);
    // Under the enemies, so a crowd standing in a hazard stays readable.
    this.setDepth(10);
    scene.add.existing(this);
    // Sized from the hazard's live radius, which is the same number the
    // overlap tests use.
    this.view = createSpriteView(this, tokens, definition.id, { diameter: state.radius * 2 });
  }

  /** Returns true once the hazard has expired and should be reclaimed. */
  refresh(nowMs: number): boolean {
    const phase = hazardPhase(this.definition, this.hazardState, nowMs);
    if (phase !== this.lastPhase) {
      this.lastPhase = phase;
      if (phase === "telegraphing") {
        this.setFillStyle(this.baseColour, 0.08);
        this.setStrokeStyle(3, this.baseColour, 0.5);
      } else if (phase === "active") {
        this.setFillStyle(this.baseColour, 0.2);
        this.setStrokeStyle(4, this.baseColour, 1);
      }
      // A fill alpha is invisible on a texture, so the sprite path carries the
      // same "warning" versus "live" read on the actor's own alpha, which the
      // view mirrors. The telegraph must stay unmistakable either way — it is
      // the property REC-053 cares about.
      if (this.view) this.setAlpha(phase === "telegraphing" ? 0.55 : 1);
    }

    if (phase === "telegraphing") {
      // Pulse while warning, so it reads as "not yet" rather than "harmless".
      const age = nowMs - this.hazardState.spawnedAtMs;
      this.setScale(0.6 + 0.4 * Math.min(1, age / Math.max(1, this.definition.telegraphMs)));
    } else {
      this.setScale(1);
    }

    return phase === "expired";
  }

  /** Damage a destructible obstacle. Returns true when it is cleared. */
  damage(amount: number): boolean {
    if (this.definition.kind !== "obstacle" || this.hazardState.health <= 0) return false;
    this.hazardState.health = Math.max(0, this.hazardState.health - Math.max(0, amount));
    return this.hazardState.health === 0;
  }
}
