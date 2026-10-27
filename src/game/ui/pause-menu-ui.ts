import Phaser from "phaser";
import { selectEliteCodex } from "../systems/codex/describe-shrine";
import type { CapabilityProgress } from "../systems/mastery/run-review";
import type { ThemeManifest } from "../core/archetypes/contracts";
import type { StatLine, WorldLine } from "../systems/upgrades/describe-upgrade";
import type { RunSettings, SettingKey } from "../state/settings-state";
import type {
  CodexEnemyEntry,
  CodexEntry,
  CodexSessionLine,
  CodexUpgradeEntry,
} from "../systems/codex/describe-shrine";
import { addUiText, configureUiContainer, uiPointer, uiViewport, UI_SCALE } from "./ui-text";

export const pauseTabs = ["stats", "upgrades", "world", "codex", "settings"] as const;
export type PauseTab = (typeof pauseTabs)[number];

/**
 * Sections inside the Field Guide.
 *
 * The catalogue outgrew one page as soon as it covered the eighteen-entry
 * upgrade pool, and the tab strip is already tight at five tabs, so the split
 * lives inside the tab rather than adding more of them.
 */
export const codexSections = ["shrines", "enemies", "elites", "equipment", "capabilities", "session"] as const;
export type CodexSection = (typeof codexSections)[number];

export interface PauseMenuView {
  readonly codexEnemies: readonly CodexEnemyEntry[];
  readonly capabilities: readonly CapabilityProgress[];
  readonly stats: readonly StatLine[];
  readonly world: readonly Pick<WorldLine, "label" | "display">[];
  /** Upgrades taken, already formatted by the shared run-summary selector. */
  readonly upgrades: readonly string[];
  /** Shrine reference entries. */
  readonly codex: readonly CodexEntry[];
  /** The whole upgrade pool, with what the player has taken from it. */
  readonly codexUpgrades: readonly CodexUpgradeEntry[];
  /** Session totals, shown beside the catalogue. */
  readonly codexSession: readonly CodexSessionLine[];
  readonly settings: RunSettings;
}

/**
 * The pause overlay.
 *
 * Everything shown here comes from the same selectors as the upgrade cards and
 * the terminal tally, so the three surfaces cannot disagree about a number.
 */
export class PauseMenuUi {
  private readonly scene: Phaser.Scene;
  private readonly theme: ThemeManifest;
  private container?: Phaser.GameObjects.Container;
  private tab: PauseTab = "stats";
  private codexSection: CodexSection = "shrines";
  private enemyPage = 0;
  private scrollBody?: Phaser.GameObjects.Container;
  private scrollMask?: Phaser.Display.Masks.GeometryMask;
  private scrollGraphics?: Phaser.GameObjects.Graphics;
  private scrollArea?: Phaser.Geom.Rectangle;
  private scrollBarBounds?: Phaser.Geom.Rectangle;
  private scrollThumb?: Phaser.GameObjects.Rectangle;
  private scrollOffset = 0;
  private maxScroll = 0;
  private scrollKey = "";
  private readonly scrollHome = (event: KeyboardEvent) => this.handleScrollEnd(event, false);
  private readonly scrollEnd = (event: KeyboardEvent) => this.handleScrollEnd(event, true);
  private handleScrollEnd(event: KeyboardEvent, end: boolean): void {
    if (!this.isOpen || !this.maxScroll) return;
    event.preventDefault();
    this.setScroll(end ? this.maxScroll : 0);
  }
  private readonly handleWheel = (pointer: Phaser.Input.Pointer, _objects: unknown[], _dx: number, dy: number): void => {
    const point = uiPointer(this.scene, pointer);
    if (!this.isOpen || !this.maxScroll || !this.scrollArea?.contains(point.x, point.y)) return;
    pointer.event?.preventDefault();
    this.setScroll(this.scrollOffset + dy / UI_SCALE);
  };
  private enemyPageBounds: { direction: 1 | -1; bounds: Phaser.Geom.Rectangle }[] = [];
  private readonly previousEnemy = (event: KeyboardEvent) => this.handleEnemyPage(event, -1);
  private readonly nextEnemy = (event: KeyboardEvent) => this.handleEnemyPage(event, 1);
  private handleEnemyPage(event: KeyboardEvent, direction: 1 | -1): void {
    if (!this.isOpen) return;
    if (this.tab === "codex" && this.codexSection === "enemies") {
      event.preventDefault();
      this.cycleEnemyPage(direction);
    } else if (this.maxScroll && this.scrollArea) {
      event.preventDefault();
      this.setScroll(this.scrollOffset + direction * this.scrollArea.height * 0.85);
    }
  }
  cycleEnemyPage(direction: 1 | -1): void {
    if (!this.isOpen || this.tab !== "codex" || this.codexSection !== "enemies") return;
    const count = this.view?.codexEnemies.length ?? 0;
    if (!count) return;
    this.enemyPage = (this.enemyPage + direction + count) % count;
    this.render();
  }
  private view?: PauseMenuView;
  private tabBounds: { readonly tab: PauseTab; readonly bounds: Phaser.Geom.Rectangle }[] = [];
  private settingBounds: { readonly key: SettingKey; readonly bounds: Phaser.Geom.Rectangle }[] = [];
  private sectionBounds: { readonly section: CodexSection; readonly bounds: Phaser.Geom.Rectangle }[] = [];
  private onToggle?: (key: SettingKey) => void;
  private menuContext = false;
  private onManageSave?: () => void;
  private onQuit?: () => void;
  private quitBounds?: Phaser.Geom.Rectangle;
  private readonly handleQuitKey = () => { if (this.isOpen && !this.menuContext) this.onQuit?.(); };
  private manageSaveBounds?: Phaser.Geom.Rectangle;

  constructor(scene: Phaser.Scene, theme: ThemeManifest) {
    this.scene = scene;
    this.theme = theme;
  }

  get isOpen(): boolean {
    return this.container !== undefined;
  }

  /** Rendered control centres in logical canvas space for read-only UI inspection. */
  get settingsControlPoints(): Readonly<Record<string, Readonly<{ x: number; y: number }>>> {
    if (!this.isOpen || this.tab !== "settings") return {};
    const centreX = this.scene.scale.width / 2, centreY = this.scene.scale.height / 2;
    const controls = this.settingBounds.map(({ key, bounds }) => ({ key: String(key), bounds }));
    if (this.manageSaveBounds) controls.push({ key: "manageSave", bounds: this.manageSaveBounds });
    return Object.fromEntries(controls.map(({ key, bounds }) => [key, {
      x: centreX + (bounds.centerX - centreX) * UI_SCALE,
      y: centreY + (bounds.centerY - centreY) * UI_SCALE,
    }]));
  }

  get activeTab(): PauseTab {
    return this.tab;
  }

  get activeCodexSection(): CodexSection {
    return this.codexSection;
  }

  private get visibleCodexSections(): readonly CodexSection[] {
    return codexSections.filter((section) => section !== "elites" || Boolean(this.theme.copy.eliteGuide));
  }

  /** Move within the Field Guide. Ignored on every other tab. */
  cycleCodexSection(direction: 1 | -1): void {
    if (this.tab !== "codex") return;
    const sections = this.visibleCodexSections;
    const index = sections.indexOf(this.codexSection);
    this.codexSection =
      sections[(index + direction + sections.length) % sections.length]!;
    if (this.view) this.render();
  }

  show(
    view: PauseMenuView,
    onToggle: (key: SettingKey) => void,
    options: Readonly<{ tab?: PauseTab; menuContext?: boolean; onManageSave?: () => void; onQuit?: () => void }> = {},
  ): void {
    this.view = view;
    this.onToggle = onToggle;
    this.tab = options.tab ?? this.tab;
    this.menuContext = options.menuContext ?? false;
    this.onManageSave = options.onManageSave;
    this.onQuit = options.onQuit;
    this.render();
  }

  /** Cycle tabs, so the overlay is usable without a pointer. */
  cycleTab(direction: 1 | -1): void {
    const index = pauseTabs.indexOf(this.tab);
    this.tab = pauseTabs[(index + direction + pauseTabs.length) % pauseTabs.length]!;
    if (this.view) this.render();
  }

  refresh(view: PauseMenuView): void {
    this.view = view;
    if (this.container) this.render();
  }

  private render(): void {
    const view = this.view;
    if (!view) return;
    this.destroyContainer();

    const { width, height } = this.scene.scale;
    const palette = this.theme.tokens.palette;
    const background = Phaser.Display.Color.HexStringToColor(palette.background).color;
    const accent = Phaser.Display.Color.HexStringToColor(palette.accent).color;
    const floor = Phaser.Display.Color.HexStringToColor(palette.floor).color;

    const viewport = uiViewport(this.scene);
    const panelWidth = Math.min(880, viewport.width - 32);
    const panelHeight = Math.min(600, viewport.height - 32);
    const panel = this.scene.add
      .rectangle(width / 2, height / 2, panelWidth, panelHeight, background, 1)
      .setStrokeStyle(3, accent);
    const top = height / 2 - panelHeight / 2;
    const left = width / 2 - panelWidth / 2;

    const children: Phaser.GameObjects.GameObject[] = [panel];
    children.push(
      addUiText(this.scene, width / 2, top + 26, this.menuContext ? this.theme.copy.codex.title : this.theme.copy.vocabulary.paused, {
          color: palette.accent,
          fontFamily: "Georgia, serif",
          fontSize: "24px",
          fontStyle: "bold",
        })
        .setOrigin(0.5),
    );

    this.tabBounds = [];
    const tabWidth = (panelWidth - 48) / pauseTabs.length;
    // Labels are theme copy of unknown length, and the tab strip narrows every
    // time a tab is added, so each label wraps inside its own tab and is scaled
    // down if a single word still will not fit.
    const labelWidth = tabWidth - 20;
    const tabHeight = 44;
    pauseTabs.forEach((tab, index) => {
      const x = left + 24 + tabWidth * index + tabWidth / 2;
      const y = top + 72;
      const active = tab === this.tab;
      const label = addUiText(this.scene, x, y, this.tabLabel(tab), {
          align: "center",
          color: active ? palette.background : palette.text,
          fontFamily: "Georgia, serif",
          fontSize: "15px",
          fontStyle: "bold",
          wordWrap: { width: labelWidth },
        })
        .setOrigin(0.5);
      if (label.width > labelWidth) label.setScale(labelWidth / label.width);
      children.push(
        this.scene.add
          .rectangle(x, y, tabWidth - 8, tabHeight, active ? accent : floor, active ? 0.85 : 1)
          .setStrokeStyle(2, accent),
        label,
      );
      this.tabBounds.push({
        tab,
        bounds: new Phaser.Geom.Rectangle(x - tabWidth / 2, y - tabHeight / 2, tabWidth, tabHeight),
      });
    });

    this.settingBounds = [];
    this.manageSaveBounds = undefined;
    this.sectionBounds = [];
    this.enemyPageBounds = [];
    const bodyTop = top + 116;
    // Everything above the footer hint. Sections that can grow with content
    // measure against this rather than assuming they fit.
    const bodyHeight = top + panelHeight - 46 - bodyTop - (this.onQuit ? 44 : 0);
    const rowStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      color: palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "17px",
      lineSpacing: 7,
    };

    if (this.tab === "stats") {
      children.push(...this.scrollContent(this.renderRows(view.stats, left, bodyTop, panelWidth, rowStyle), new Phaser.Geom.Rectangle(left + 24, bodyTop, panelWidth - 48, bodyHeight)));
    } else if (this.tab === "world") {
      children.push(...this.scrollContent(this.renderRows(view.world, left, bodyTop, panelWidth, rowStyle), new Phaser.Geom.Rectangle(left + 24, bodyTop, panelWidth - 48, bodyHeight)));
    } else if (this.tab === "codex") {
      children.push(
        ...this.renderCodexTab(view, left, bodyTop, panelWidth, bodyHeight, rowStyle),
      );
    } else if (this.tab === "upgrades") {
      const text = view.upgrades.length > 0 ? view.upgrades.join("\n") : "—";
      children.push(...this.scrollContent([addUiText(this.scene, left + 32, bodyTop, text, { ...rowStyle, wordWrap: { width: panelWidth - 80 } })], new Phaser.Geom.Rectangle(left + 24, bodyTop, panelWidth - 48, bodyHeight)));
    } else {
      const labels: Readonly<Record<SettingKey, string>> = {
        detailedUpgradeCards: "Detailed upgrade cards",
        reducedMotion: "Reduced motion",
        showAttackRadius: "Show attack radius",
        muted: "Mute audio",
        minimapOpacity: "Minimap visibility",
        difficulty: this.menuContext ? this.theme.copy.difficulty.label : this.theme.copy.difficulty.nextRun,
        presentationQuality: "Presentation",
      };
      const settingPitch = Math.min(44, (bodyHeight - (this.menuContext && this.onManageSave ? 52 : 0)) / Object.keys(labels).length);
      (Object.keys(labels) as SettingKey[]).forEach((key, index) => {
        const y = bodyTop + index * settingPitch;
        const value = view.settings[key];
        const on = typeof value === "boolean" ? value : typeof value === "string" || value > 0;
        const display = key === "presentationQuality" ? (value === "low" ? "Low" : "Default") : typeof value === "string" ? this.theme.copy.difficulty.levels[value as RunSettings["difficulty"]].name : typeof value === "boolean"
          ? (value ? "ON" : "OFF")
          : value === 0 ? "OFF" : `${Math.round(value * 100)}%`;
        const valueWidth = key === "difficulty" ? 200 : 96;
        const valueX = left + panelWidth - 48 - valueWidth / 2;
        children.push(
          addUiText(this.scene, left + 32, y, labels[key], rowStyle),
          this.scene.add
            .rectangle(valueX, y + 10, valueWidth, 30, on ? accent : floor, 1)
            .setStrokeStyle(2, accent),
          addUiText(this.scene, valueX, y + 10, display, {
              ...rowStyle,
              color: on ? palette.background : palette.text,
              fontStyle: "bold",
            })
            .setOrigin(0.5),
        );
        this.settingBounds.push({
          key,
          bounds: new Phaser.Geom.Rectangle(valueX - valueWidth / 2, y - 5, valueWidth, 40),
        });
      });
      if (this.menuContext && this.onManageSave) {
        const y = bodyTop + Object.keys(labels).length * settingPitch + 12;
        children.push(this.scene.add.rectangle(width / 2, y, 260, 38, floor, 1).setStrokeStyle(2, accent),
          addUiText(this.scene, width / 2, y, this.theme.copy.saveManager.manageSave, { ...rowStyle, fontStyle: "bold", color: palette.accent }).setOrigin(0.5));
        this.manageSaveBounds = new Phaser.Geom.Rectangle(width / 2 - 130, y - 19, 260, 38);
      }
    }

    this.quitBounds = undefined;
    if (this.onQuit && !this.menuContext) {
      const y = top + panelHeight - 64;
      const buttonWidth = Math.min(360, panelWidth - 48);
      children.push(this.scene.add.rectangle(width / 2, y, buttonWidth, 36, floor, 1).setStrokeStyle(2, accent),
        addUiText(this.scene, width / 2, y, "Quit to main menu · Q (ends this run)",
          { ...rowStyle, fontSize: "15px", fontStyle: "bold" }).setOrigin(0.5));
      this.quitBounds = new Phaser.Geom.Rectangle(width / 2 - buttonWidth / 2, y - 18, buttonWidth, 36);
    }

    children.push(
      addUiText(this.scene, width / 2, top + panelHeight - 26, this.maxScroll > 0 ? "Wheel / PgUp / PgDn to scroll · Tab: tabs · Escape: back" : this.menuContext ? "Tab / arrows to switch · Escape to go back" : "Tab / arrows to switch · Escape to resume", {
          color: palette.text,
          fontFamily: "Georgia, serif",
          fontSize: "15px",
        })
        .setOrigin(0.5)
        .setAlpha(0.7),
    );

    this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.scene.input.on(Phaser.Input.Events.POINTER_WHEEL, this.handleWheel);
    this.scene.input.keyboard?.on("keydown-HOME", this.scrollHome);
    this.scene.input.keyboard?.on("keydown-END", this.scrollEnd);
    this.scene.input.keyboard?.on("keydown-Q", this.handleQuitKey);
    this.scene.input.keyboard?.on("keydown-PAGE_UP", this.previousEnemy);
    this.scene.input.keyboard?.on("keydown-PAGE_DOWN", this.nextEnemy);
    this.container = configureUiContainer(this.scene, this.scene.add.container(0, 0, children)).setDepth(1050);
  }

  private renderRows(
    rows: readonly { readonly label: string; readonly display: string }[],
    left: number,
    top: number,
    panelWidth: number,
    style: Phaser.Types.GameObjects.Text.TextStyle,
  ): Phaser.GameObjects.GameObject[] {
    // Two columns so a long stat list never overflows the panel.
    const perColumn = Math.ceil(rows.length / 2);
    const columns = [rows.slice(0, perColumn), rows.slice(perColumn)];
    return columns.flatMap((column, index) => {
      const x = left + 32 + index * ((panelWidth - 64) / 2);
      return [
        addUiText(this.scene, x, top, column.map((row) => row.label).join("\n"), style),
        addUiText(this.scene,
          x + (panelWidth - 64) / 2 - 24,
          top,
          column.map((row) => row.display).join("\n"),
          { ...style, align: "right" },
        ).setOrigin(1, 0),
      ];
    });
  }

  /** Section chips, then whichever section is open. */
  private renderCodexTab(
    view: PauseMenuView,
    left: number,
    top: number,
    panelWidth: number,
    bodyHeight: number,
    style: Phaser.Types.GameObjects.Text.TextStyle,
  ): Phaser.GameObjects.GameObject[] {
    const palette = this.theme.tokens.palette;
    const accent = Phaser.Display.Color.HexStringToColor(palette.accent).color;
    const floor = Phaser.Display.Color.HexStringToColor(palette.floor).color;
    const children: Phaser.GameObjects.GameObject[] = [];

    this.sectionBounds = [];
    let chipLeft = left + 32;
    let chipTop = top;
    for (const section of this.visibleCodexSections) {
      const active = section === this.codexSection;
      const label = addUiText(this.scene, 0, 0, this.codexSectionLabel(section).toUpperCase(), {
        ...style,
        color: active ? palette.background : palette.text,
        fontSize: "13px",
        fontStyle: "bold",
      });
      // Chips are sized to their own label, because the labels are theme copy.
      const chipWidth = label.width + 24;
      if (chipLeft + chipWidth > left + panelWidth - 32 && chipLeft > left + 32) {
        chipLeft = left + 32; chipTop += 36;
      }
      const centreX = chipLeft + chipWidth / 2;
      const centreY = chipTop + 11;
      label.setPosition(centreX, centreY).setOrigin(0.5);
      children.push(
        this.scene.add
          .rectangle(centreX, centreY, chipWidth, 26, active ? accent : floor, active ? 0.9 : 1)
          .setStrokeStyle(2, accent),
        label,
      );
      this.sectionBounds.push({
        section,
        bounds: new Phaser.Geom.Rectangle(chipLeft, centreY - 13, chipWidth, 26),
      });
      chipLeft += chipWidth + 8;
    }

    const sectionTop = chipTop + 42;
    const sectionHeight = bodyHeight - (sectionTop - top);
    const content: Phaser.GameObjects.GameObject[] = [];
    if (this.codexSection === "shrines") {
      content.push(...this.renderCodex(view.codex, left, sectionTop, panelWidth, style));
    } else if (this.codexSection === "enemies") {
      const entries = view.codexEnemies;
      this.enemyPage = Math.min(this.enemyPage, Math.max(0, entries.length - 1));
      const entry = entries[this.enemyPage];
      if (entry) {
        const copy = this.theme.copy.mastery;
        const display = (value: number) => String(Number(value.toFixed(2)));
        const relations = entry.relations.map((relation) => `${relation.kind === "fractures_into" ? copy.fractures : copy.releases}: ${relation.name} ×${relation.count}`);
        const text = `${entry.name}\n\n${entry.description}\n\n${copy.gameValues}\n${copy.health}: ${display(entry.health)} · ${copy.speed}: ${display(entry.moveSpeed)} · ${copy.harm}: ${display(entry.contactDamage)}\n${relations.join("\n")}`;
        content.push(addUiText(this.scene, left + 32, sectionTop, text,
          { ...style, fontSize: "16px", wordWrap: { width: panelWidth - 64, useAdvancedWrap: true } }));
        const y = sectionTop + sectionHeight - 28;
        for (const direction of [-1, 1] as const) {
          const x = left + panelWidth / 2 + direction * 185;
          children.push(this.scene.add.rectangle(x, y, 160, 32, floor).setStrokeStyle(2, accent));
          children.push(addUiText(this.scene, x, y, direction < 0 ? copy.previous : copy.nextPage,
            { ...style, fontSize: "14px" }).setOrigin(.5));
          this.enemyPageBounds.push({ direction, bounds: new Phaser.Geom.Rectangle(x - 80, y - 16, 160, 32) });
        }
        children.push(addUiText(this.scene, left + panelWidth / 2, y, `${this.enemyPage + 1} / ${entries.length} · PgUp / PgDn`,
          { ...style, fontSize: "13px" }).setOrigin(.5));
      }
    } else if (this.codexSection === "elites" && this.theme.copy.eliteGuide) {
      const guide = this.theme.copy.eliteGuide;
      let y = sectionTop;
      const add = (text: string, bold = false) => {
        const label = addUiText(this.scene, left + 32, y, text, { ...style, fontSize: "16px", fontStyle: bold ? "bold" : "normal", wordWrap: { width: panelWidth - 64, useAdvancedWrap: true } });
        content.push(label); y += label.height + 12;
      };
      add(guide.title, true); add(guide.introduction);
      for (const elite of selectEliteCodex(this.theme)) {
        add(`${elite.marker} · ${elite.name}`, true);
        add(elite.description);
        add(elite.effects.map((effect) => `${effect.label} ${effect.display}`).join(" · "));
      }
    } else if (this.codexSection === "capabilities") {
      let y = sectionTop;
      for (const capability of view.capabilities) {
        const text = addUiText(this.scene, left + 32, y, `${capability.name} · ${capability.display}\n${capability.description}`,
          { ...style, fontSize: "17px", wordWrap: { width: panelWidth - 64, useAdvancedWrap: true } });
        content.push(text); y += text.height + 24;
      }
    } else if (this.codexSection === "equipment") {
      content.push(
        ...this.renderCodexUpgrades(
          view.codexUpgrades,
          left,
          sectionTop,
          panelWidth,
          style,
        ),
      );
    } else {
      content.push(...this.renderRows(view.codexSession, left, sectionTop, panelWidth, style));
    }
    children.push(...this.scrollContent(content, new Phaser.Geom.Rectangle(left + 24, sectionTop,
      panelWidth - 48, Math.max(1, sectionHeight - (this.codexSection === "enemies" ? 54 : 0)))));
    return children;
  }

  private codexSectionLabel(section: CodexSection): string {
    const codex = this.theme.copy.codex;
    if (section === "shrines") return codex.shrines;
    if (section === "enemies") return this.theme.copy.mastery.enemies;
    if (section === "elites") return this.theme.copy.eliteGuide?.tab ?? "";
    if (section === "capabilities") return this.theme.copy.mastery.capabilities;
    if (section === "equipment") return codex.upgrades;
    return codex.session;
  }

  /**
   * The whole upgrade pool as a table.
   *
   * Every entry is listed whether or not it has ever been taken: a zero is the
   * informative part, because it says the upgrade exists and how far it goes.
   * Columns are right-aligned at fixed offsets from the panel edge so the
   * numbers line up regardless of how long a themed name turns out to be.
   */
  private renderCodexUpgrades(
    entries: readonly CodexUpgradeEntry[],
    left: number,
    top: number,
    panelWidth: number,
    style: Phaser.Types.GameObjects.Text.TextStyle,
  ): Phaser.GameObjects.GameObject[] {
    const palette = this.theme.tokens.palette;
    const children: Phaser.GameObjects.GameObject[] = [];
    const groups = [
      { track: "weapon" as const, title: "WEAPON UPGRADES", x: left + 32 },
      { track: "general" as const, title: "GENERAL UPGRADES", x: left + panelWidth / 2 + 12 },
    ];
    const columnWidth = panelWidth / 2 - 56;
    for (const group of groups) {
      children.push(addUiText(this.scene, group.x, top, group.title, {
        ...style,
        color: palette.accent,
        fontSize: "14px",
        fontStyle: "bold",
      }));
      const groupEntries = entries.filter((entry) => entry.track === group.track);
      let y = top + 25;
      groupEntries.forEach((entry) => {
        const definition = this.theme.upgrades.find((upgrade) => upgrade.id === entry.id);
        const acquisition = definition?.effects.some((effect) => effect.kind === "weapon.equip" || effect.kind === "weapon.evolve");
        const cap = entry.maxPerRun === null
          ? "∞"
          : String(entry.track === "weapon" && !acquisition ? entry.maxPerRun + 1 : entry.maxPerRun);
        const name = addUiText(this.scene, group.x, y, `${entry.name}  ·  ${cap}`, {
          ...style, color: entry.sessionTotal > 0 ? palette.accent : palette.text,
          fontSize: "14px", fontStyle: "bold", wordWrap: { width: columnWidth },
        });
        const description = addUiText(this.scene, group.x, y + name.height + 2, entry.description, {
          ...style, fontSize: "12px", wordWrap: { width: columnWidth },
        }).setAlpha(0.8);
        children.push(name, description);
        y = description.y + description.height + 14;
      });
    }
    return children;
  }

  /**
   * The shrine reference section.
   *
   * Each entry is a name, what it costs and gives, and one line of identity.
   * Effects are read from the live definitions, so a page cannot claim a number
   * the run does not use.
   */
  private renderCodex(
    entries: readonly CodexEntry[],
    left: number,
    top: number,
    panelWidth: number,
    style: Phaser.Types.GameObjects.Text.TextStyle,
  ): Phaser.GameObjects.GameObject[] {
    const palette = this.theme.tokens.palette;
    const width = panelWidth - 64;
    const children: Phaser.GameObjects.GameObject[] = [];

    let y = top;
    for (const entry of entries) {
      const name = addUiText(this.scene, left + 32, y, entry.name, {
        ...style,
        color: palette.accent,
        fontStyle: "bold",
      });
      const effects = addUiText(this.scene, left + 32 + width, y, entry.effects.map((effect) => `${effect.label} ${effect.display}`).join("   ·   "), {
          ...style,
          color: palette.pickup,
          fontSize: "15px",
          align: "right",
        })
        .setOrigin(1, 0);
      const description = addUiText(this.scene, left + 32, y + Math.max(name.height, effects.height) + 2, entry.description, {
          ...style,
          fontSize: "15px",
          wordWrap: { width },
        })
        .setAlpha(0.75);
      children.push(name, effects, description);
      // Measured rather than assumed, so a long description cannot run into the
      // next entry the way the V0.3 upgrade cards ran out of their own box.
      y = description.y + description.height + 16;
    }
    return children;
  }

  private scrollContent(items: Phaser.GameObjects.GameObject[], area: Phaser.Geom.Rectangle): Phaser.GameObjects.GameObject[] {
    const key = `${this.tab}/${this.codexSection}/${this.enemyPage}`;
    if (key !== this.scrollKey) { this.scrollOffset = 0; this.scrollKey = key; }
    this.scrollArea = area;
    const bottom = Math.max(area.top, ...items.map((item) => {
      const object = item as Phaser.GameObjects.Text;
      return object.y + object.height;
    }));
    this.maxScroll = Math.max(0, bottom - area.bottom + 8);
    this.scrollBody = this.scene.add.container(0, 0, items);
    this.scrollGraphics = this.scene.make.graphics({ x: 0, y: 0 });
    const zoom = this.scene.cameras.main.zoom || 1, scale = UI_SCALE / zoom;
    const cx = this.scene.scale.width / 2, cy = this.scene.scale.height / 2;
    this.scrollGraphics.fillStyle(0xffffff).fillRect(area.x, area.y, area.width, area.height)
      .setPosition(cx * (1 - scale), cy * (1 - scale)).setScale(scale).setScrollFactor(0);
    this.scrollMask = this.scrollGraphics.createGeometryMask();
    this.scrollBody.setMask(this.scrollMask);
    const children: Phaser.GameObjects.GameObject[] = [this.scrollBody];
    if (this.maxScroll > 0) {
      const colour = Phaser.Display.Color.HexStringToColor(this.theme.tokens.palette.accent).color;
      this.scrollBarBounds = new Phaser.Geom.Rectangle(area.right - 6, area.y, 6, area.height);
      const track = this.scene.add.rectangle(area.right - 3, area.y, 4, area.height, colour, 0.2).setOrigin(0.5, 0);
      this.scrollThumb = this.scene.add.rectangle(area.right - 3, area.y, 6,
        Math.max(24, area.height * area.height / (area.height + this.maxScroll)), colour, 0.9).setOrigin(0.5, 0);
      children.push(track, this.scrollThumb);
    }
    this.setScroll(this.scrollOffset);
    return children;
  }

  private setScroll(offset: number): void {
    this.scrollOffset = Phaser.Math.Clamp(offset, 0, this.maxScroll);
    this.scrollBody?.setY(-this.scrollOffset);
    if (this.scrollThumb && this.scrollArea) this.scrollThumb.y = this.scrollArea.y +
      (this.scrollArea.height - this.scrollThumb.height) * this.scrollOffset / Math.max(1, this.maxScroll);
  }

  private tabLabel(tab: PauseTab): string {
    if (tab === "stats") return "STATS";
    if (tab === "upgrades") return this.theme.copy.vocabulary.upgradesTaken.toUpperCase();
    if (tab === "world") return this.theme.copy.vocabulary.chaos.toUpperCase();
    if (tab === "codex") return this.theme.copy.codex.title.toUpperCase();
    return "SETTINGS";
  }

  hide(): void {
    this.destroyContainer();
    this.view = undefined;
    this.onToggle = undefined;
    this.onManageSave = undefined;
    this.onQuit = undefined;
    this.quitBounds = undefined;
    this.manageSaveBounds = undefined;
  }

  private destroyContainer(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_WHEEL, this.handleWheel);
    this.scene.input.keyboard?.off("keydown-HOME", this.scrollHome);
    this.scene.input.keyboard?.off("keydown-END", this.scrollEnd);
    this.scrollBody = undefined;
    this.scrollThumb = undefined;
    this.scrollArea = undefined;
    this.scrollBarBounds = undefined;
    this.maxScroll = 0;
    this.scrollMask?.destroy(); this.scrollMask = undefined;
    this.scrollGraphics?.destroy(); this.scrollGraphics = undefined;
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.scene.input.keyboard?.off("keydown-Q", this.handleQuitKey);
    this.scene.input.keyboard?.off("keydown-PAGE_UP", this.previousEnemy);
    this.scene.input.keyboard?.off("keydown-PAGE_DOWN", this.nextEnemy);
    this.container?.destroy(true);
    this.container = undefined;
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const point = uiPointer(this.scene, pointer);
    if (this.scrollBarBounds?.contains(point.x, point.y) && this.scrollArea && this.scrollThumb) {
      const travel = this.scrollArea.height - this.scrollThumb.height;
      this.setScroll((point.y - this.scrollArea.y - this.scrollThumb.height / 2) / Math.max(1, travel) * this.maxScroll);
      return;
    }
    if (this.quitBounds?.contains(point.x, point.y)) { this.onQuit?.(); return; }
    if (this.manageSaveBounds?.contains(point.x, point.y)) { this.onManageSave?.(); return; }
    const tab = this.tabBounds.find((entry) => entry.bounds.contains(point.x, point.y));
    if (tab) {
      this.tab = tab.tab;
      this.render();
      return;
    }
    const page = this.enemyPageBounds.find((entry) => entry.bounds.contains(point.x, point.y));
    if (page) { this.cycleEnemyPage(page.direction); return; }
    const section = this.sectionBounds.find((entry) => entry.bounds.contains(point.x, point.y));
    if (section) {
      this.codexSection = section.section;
      this.render();
      return;
    }
    const setting = this.settingBounds.find((entry) => entry.bounds.contains(point.x, point.y));
    if (setting) this.onToggle?.(setting.key);
  }
}
