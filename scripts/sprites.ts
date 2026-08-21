/**
 * Inspect, verify, and build the sprite roster.
 *
 *   npm run sprites -- status              # what is done and what is outstanding
 *   npm run sprites -- check               # verify accepted sheets
 *   npm run sprites -- build               # palette-snap, variants, atlas
 *   npm run sprites -- status --theme knight-magic
 *
 * V0.4.1 grows this roster one reviewed sheet at a time. `check` validates the
 * deterministic built output; `build` normalizes the preserved raw generation
 * into the in-game sheet and single-sheet atlas used for review.
 *
 * Themes come from `theme-registry`, not `active-theme`: the roster is built
 * per pack, and a pack the game does not currently render still has sheets to
 * verify.
 */
import { themeRegistry, type ThemeRegistryEntry } from "../src/game/content/theme-registry";
import { spriteEntries } from "../src/game/systems/sprites/resolve-sprite";
import {
  buildSpriteSheet,
  checkSpriteSheet,
  type SpriteBuildDefinition,
} from "../src/game/systems/sprites/sprite-pipeline";

const commands = ["status", "check", "build"] as const;
type Command = (typeof commands)[number];

interface Options {
  readonly command: Command;
  readonly theme: string | undefined;
}

interface ProjectSprite extends SpriteBuildDefinition {
  readonly theme: string;
}

const projectSprites: readonly ProjectSprite[] = [
  {
    theme: "eco-guardian",
    contentId: "enemy.swarm_basic",
    source: "build/sprites/raw/enemy_swarm_basic.a1.png",
    output: "public/sprites/eco-guardian/enemy_swarm_basic.png",
    atlasOutput: "public/sprites/eco-guardian/atlas.png",
    atlasJsonOutput: "public/sprites/eco-guardian/atlas.json",
    frameWidth: 32,
    frameHeight: 32,
    frames: 4,
  },
];

function parseArgs(argv: readonly string[]): Options {
  let command: Command = "status";
  let theme: string | undefined;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--theme") {
      theme = argv[index + 1];
      index += 1;
      continue;
    }
    if ((commands as readonly string[]).includes(arg)) {
      command = arg as Command;
    }
  }
  return { command, theme };
}

function selectThemes(key: string | undefined): readonly ThemeRegistryEntry[] {
  if (!key) return themeRegistry;
  const entry = themeRegistry.find((candidate) => candidate.key === key || candidate.id === key);
  if (!entry) {
    const known = themeRegistry.map((candidate) => candidate.key).join(", ");
    throw new Error(`Unknown theme: ${key}. Known themes: ${known}`);
  }
  return [entry];
}

function status(entries: readonly ThemeRegistryEntry[]): void {
  for (const entry of entries) {
    const sprites = spriteEntries(entry.theme.tokens);
    process.stdout.write(`\n${entry.key} (${entry.id})\n`);
    if (sprites.length === 0) {
      // Not a warning. A pack with no sprites renders primitives, which is a
      // complete and supported state — see `build/SPRITE_PLAN_V0.4.1.md` §1.
      process.stdout.write("  no sprites declared — every actor renders its primitive\n");
      continue;
    }
    const width = Math.max(...sprites.map(([contentId]) => contentId.length));
    for (const [contentId, sprite] of sprites) {
      const size = `${sprite.frameWidth}x${sprite.frameHeight}`;
      process.stdout.write(
        `  ${contentId.padEnd(width)}  ${size.padStart(7)}  ${String(sprite.frames).padStart(2)}f  ${sprite.path}\n`,
      );
    }
    process.stdout.write(`  ${sprites.length} sheet(s)\n`);
  }
}

function selectedProjectSprites(entries: readonly ThemeRegistryEntry[]): readonly ProjectSprite[] {
  const selected = new Set(entries.map((entry) => entry.key));
  return projectSprites.filter((entry) => selected.has(entry.theme));
}

async function check(entries: readonly ThemeRegistryEntry[]): Promise<void> {
  const sprites = selectedProjectSprites(entries);
  if (sprites.length === 0) {
    process.stdout.write("check: no sheets declared, nothing to verify\n");
    return;
  }
  const issues = (await Promise.all(sprites.map(checkSpriteSheet))).flat();
  if (issues.length > 0) throw new Error(`check failed:\n${issues.map((issue) => `  - ${issue}`).join("\n")}`);
  process.stdout.write(`check: ${sprites.length} sheet(s) valid\n`);
}

async function build(entries: readonly ThemeRegistryEntry[]): Promise<void> {
  const sprites = selectedProjectSprites(entries);
  if (sprites.length === 0) {
    process.stdout.write("build: no sheets declared, nothing to build\n");
    return;
  }
  for (const sprite of sprites) await buildSpriteSheet(sprite);
  process.stdout.write(`build: wrote ${sprites.length} sheet(s)\n`);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const entries = selectThemes(options.theme);
  if (options.command === "status") status(entries);
  if (options.command === "check") await check(entries);
  if (options.command === "build") await build(entries);
  process.stdout.write("\n");
}

await main();
