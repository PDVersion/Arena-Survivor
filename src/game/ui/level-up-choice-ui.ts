import Phaser from "phaser";
import type { ThemeManifest, UpgradeDefinition } from "../core/archetypes/contracts";
import { isTiered } from "../systems/upgrades/upgrade-tiers";
import type { UpgradeTier } from "../core/archetypes/tiers";
import type { UpgradeDescription } from "../systems/upgrades/describe-upgrade";
import { addUiText, configureUiContainer, uiPointer, uiViewport } from "./ui-text";

export interface LevelUpView {
  readonly descriptions: readonly UpgradeDescription[];
  /** Choices still queued after this one, so stacked pauses are legible. */
  readonly pendingAfterThis: number;
  readonly showDetail: boolean;
}

/** Space between a card's border and its text, on every side. */
const CARD_PADDING = 14;
/** Vertical gap between the heading, the summary, and the detail block. */
const CARD_ROW_GAP = 6;
const CARD_GAP = 12;
/**
 * Shortest a card may be.
 *
 * Purely so three plain cards and three detailed ones produce panels of similar
 * height — the overlay should not visibly resize when the detail toggle flips,
 * and a card should not shrink to a strip around one line of text.
 */
const MIN_CARD_HEIGHT = 120;
/** Detail rows shown before the rest are dropped, so one card cannot fill the panel. */
const MAX_DETAIL_LINES = 3;

export class LevelUpChoiceUi {
  private readonly scene: Phaser.Scene;
  private readonly theme: ThemeManifest;
  private container?: Phaser.GameObjects.Container;
  private choices: readonly UpgradeDefinition[] = [];
  private choiceBounds: readonly Phaser.Geom.Rectangle[] = [];
  private choiceCallback?: (choice: UpgradeDefinition) => void;
  private layoutScale = 1;

  constructor(scene: Phaser.Scene, theme: ThemeManifest) {
    this.scene = scene;
    this.theme = theme;
  }

  /**
   * A tier-sensitive card's border communicates its rolled gain.
   *
   * Fixed-value cards use the theme accent instead. For a tier-sensitive card,
   * the same upgrade can come up white or yellow, and the colour is the whole
   * point of the roll: it has to be readable before any of the text is.
   */
  private tierColour(tier: UpgradeTier): number {
    return Phaser.Display.Color.HexStringToColor(this.theme.tokens.tiers[tier]).color;
  }

  /**
   * Build one card's text, measure it, and report the height it needs.
   *
   * Cards were a fixed 128px tall with content placed at fixed offsets, so a
   * three-row detail block ran past the bottom border and a long name ran under
   * the level badge. Everything here is laid out from the previous element's
   * measured height instead, and the card is then sized to its own content, so
   * text cannot leave its box regardless of what an upgrade turns out to say.
   */
  private buildCard(
    index: number,
    choice: UpgradeDefinition,
    description: UpgradeDescription | undefined,
    view: LevelUpView,
    cardWidth: number,
  ): Readonly<{
    texts: Phaser.GameObjects.Text[];
    tierNote?: Phaser.GameObjects.Text;
    detailText?: Phaser.GameObjects.Text;
    tier: UpgradeTier;
    colour: number;
    associationText?: Phaser.GameObjects.Text;
    height: number;
    contentHeight: number;
  }> {
    const palette = this.theme.tokens.palette;
    const innerWidth = cardWidth - CARD_PADDING * 2;

    // Badges are identity, not detail, so they show regardless of the toggle.
    const levelBadge = description?.isNew
      ? "NEW"
      : `Lv ${description?.level ?? 0}→${description?.nextLevel ?? 1}`;
    const trackBadge = (description?.track ?? choice.track) === "weapon" ? "WEAPON"
      : choice.effects.every((effect) => effect.kind === "stat.add") ? "STAT" : "GENERAL";
    const badge = `${trackBadge} · ${description?.maxLevel === null ? "∞" : levelBadge}`;
    const badgeText = addUiText(this.scene, 0, 0, badge, {
      color: description?.isNew ? palette.overcritical : palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "17px",
      fontStyle: "bold",
    }).setOrigin(1, 0);

    const tier = description?.tier ?? "common";
    const qualityRelevant = description?.qualityRelevant ?? isTiered(choice);
    const colour = qualityRelevant ? this.tierColour(tier)
      : Phaser.Display.Color.HexStringToColor(palette.accent).color;
    const association = description?.association ?? this.theme.copy.content[choice.ownerWeaponId ?? choice.id]?.name;
    const associationText = association && (!qualityRelevant || choice.track === "weapon")
      ? addUiText(this.scene, 0, 0, association, { color: palette.accent, fontFamily: "Georgia, serif",
        fontSize: "14px", fontStyle: "bold", wordWrap: { width: innerWidth } }) : undefined;
    const heading = addUiText(this.scene, 0, 0, `${index + 1}. ${description?.name ?? choice.id}`, {
      color: qualityRelevant ? this.theme.tokens.tiers[tier] : palette.accent,
      fontFamily: "Georgia, serif",
      fontSize: "21px",
      fontStyle: "bold",
      // The badge owns the right end of this row, so the name wraps before it.
      wordWrap: { width: Math.max(80, innerWidth - badgeText.width - 16) },
    });

    // Only worth saying when the roll actually changed the numbers; a common
    // card would just be reading the baseline back to the player.
    const tierNote = qualityRelevant && description && description.tierMultiplier > 1
      ? addUiText(this.scene, 0, 0, `${description.tierLabel}  ×${description.tierMultiplier}`, {
          color: this.theme.tokens.tiers[tier],
          fontFamily: "Georgia, serif",
          fontSize: "14px",
          fontStyle: "bold",
        }).setOrigin(1, 0)
      : undefined;

    const summary = addUiText(this.scene, 0, 0, description?.summary ?? "", {
      color: palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "16px",
      wordWrap: { width: innerWidth - (tierNote ? tierNote.width + 16 : 0) },
    }).setAlpha(0.85);

    const texts = [heading, badgeText, summary];
    if (tierNote) texts.push(tierNote);
    if (associationText) texts.push(associationText);
    let height = CARD_PADDING + Math.max(heading.height, badgeText.height) + CARD_ROW_GAP +
      Math.max(summary.height, tierNote?.height ?? 0);

    if (associationText) height += associationText.height + CARD_ROW_GAP;

    let detailText: Phaser.GameObjects.Text | undefined;
    if (view.showDetail && description && description.lines.length > 0) {
      const detail = description.lines
        .slice(0, MAX_DETAIL_LINES)
        .map((line) => {
          const change = line.from === undefined ? line.to : `${line.from}  →  ${line.to}`;
          return `${line.label}   ${change}${line.delta ? `   (${line.delta})` : ""}`;
        })
        .join("\n");
      detailText = addUiText(this.scene, 0, 0, detail, {
        color: palette.pickup,
        fontFamily: "Georgia, serif",
        fontSize: "15px",
        lineSpacing: 3,
        wordWrap: { width: innerWidth },
      });
      texts.push(detailText);
      height += CARD_ROW_GAP + detailText.height;
    }

    const contentHeight = height + CARD_PADDING;
    return {
      texts,
      tierNote,
      detailText,
      tier,
      colour,
      associationText,
      contentHeight,
      height: Math.max(MIN_CARD_HEIGHT, contentHeight),
    };
  }

  show(
    choices: readonly UpgradeDefinition[],
    view: LevelUpView,
    onSelect: (choice: UpgradeDefinition) => void,
  ): void {
    this.hide();
    this.choices = choices;
    this.choiceCallback = onSelect;
    const { width, height } = this.scene.scale;
    const viewport = uiViewport(this.scene);
    const palette = this.theme.tokens.palette;
    const backgroundColour = Phaser.Display.Color.HexStringToColor(palette.background).color;
    const floorColour = Phaser.Display.Color.HexStringToColor(palette.floor).color;

    const panelWidth = Math.min(820, viewport.width - 32);
    const cardWidth = Math.min(720, panelWidth - 100);

    // Measure first: the panel is sized to the cards, not the cards to the panel.
    const cards = choices.map((choice, index) =>
      this.buildCard(index, choice, view.descriptions[index], view, cardWidth),
    );
    const cardsHeight = cards.reduce((total, card) => total + card.height, 0) +
      CARD_GAP * Math.max(0, cards.length - 1);
    const headerHeight = view.pendingAfterThis > 0 ? 108 : 84;
    // Keep the panel around its measured content. If unusually large cards
    // exceed the authored UI viewport, fit the whole overlay together.
    const panelHeight = headerHeight + cardsHeight + 28;
    this.layoutScale = Math.min(1, (viewport.height - 32) / panelHeight);

    const panel = this.scene.add
      .rectangle(width / 2, height / 2, panelWidth, panelHeight, backgroundColour, 1)
      .setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(palette.accent).color);
    const top = height / 2 - panelHeight / 2;

    const title = addUiText(this.scene, width / 2, top + 38, this.theme.copy.levelUpTitle, {
        color: palette.accent,
        fontFamily: "Georgia, serif",
        fontSize: "32px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    title.setScale(0.85);
    this.scene.tweens.add({ targets: title, scale: 1, duration: 220, ease: "Back.Out" });

    const children: Phaser.GameObjects.GameObject[] = [panel, title];

    if (view.pendingAfterThis > 0) {
      children.push(
        addUiText(this.scene, width / 2, top + 70, `+${view.pendingAfterThis} more`, {
            color: palette.text,
            fontFamily: "Georgia, serif",
            fontSize: "16px",
          })
          .setOrigin(0.5)
          .setAlpha(0.75),
      );
    }

    const bounds: Phaser.Geom.Rectangle[] = [];
    const left = width / 2 - cardWidth / 2;
    let cardTop = top + headerHeight;

    cards.forEach((card, index) => {
      const cardHeight = card.height;
      // Created after measuring, but pushed first, so the border sits behind its
      // own text rather than over it.
      children.push(
        this.scene.add
          .rectangle(width / 2, cardTop + cardHeight / 2, cardWidth, cardHeight, floorColour, 1)
          .setStrokeStyle(3, cards[index]!.colour)
          .setInteractive({ useHandCursor: true }),
      );

      const [heading, badgeText, summary] = card.texts;
      const tierNote = card.texts.find((text) => text === card.tierNote);
      const detailText = card.texts.find((text) => text === card.detailText);
      // Content is centred in a card that came out shorter than the minimum.
      let y = cardTop + (cardHeight - card.contentHeight) / 2 + CARD_PADDING;
      heading!.setPosition(left + CARD_PADDING, y);
      badgeText!.setPosition(left + cardWidth - CARD_PADDING, y);
      y += Math.max(heading!.height, badgeText!.height) + CARD_ROW_GAP;
      if (card.associationText) {
        card.associationText.setPosition(left + CARD_PADDING, y);
        y += card.associationText.height + CARD_ROW_GAP;
      }
      summary!.setPosition(left + CARD_PADDING, y);
      // Bottom-right of the card, clear of the summary text's wrap width.
      tierNote?.setPosition(left + cardWidth - CARD_PADDING, y);
      y += Math.max(summary!.height, tierNote?.height ?? 0) + CARD_ROW_GAP;
      detailText?.setPosition(left + CARD_PADDING, y);
      children.push(...card.texts);

      bounds.push(new Phaser.Geom.Rectangle(left, cardTop, cardWidth, cardHeight));
      cardTop += cardHeight + CARD_GAP;
    });

    this.choiceBounds = bounds;
    this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.container = configureUiContainer(this.scene, this.scene.add.container(0, 0, children)).setDepth(1000);
    const scale = this.container.scaleX * this.layoutScale;
    this.container.setScale(scale).setPosition(width / 2 * (1 - scale), height / 2 * (1 - scale));
  }

  hide(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.container?.destroy(true);
    this.container = undefined;
    this.choices = [];
    this.choiceBounds = [];
    this.choiceCallback = undefined;
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const point = uiPointer(this.scene, pointer);
    point.set(
      this.scene.scale.width / 2 + (point.x - this.scene.scale.width / 2) / this.layoutScale,
      this.scene.scale.height / 2 + (point.y - this.scene.scale.height / 2) / this.layoutScale,
    );
    const index = this.choiceBounds.findIndex((bounds) => bounds.contains(point.x, point.y));
    const choice = this.choices[index];
    if (choice) this.choiceCallback?.(choice);
  }
}
