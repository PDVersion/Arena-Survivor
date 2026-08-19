/**
 * Inspect, verify, and build the sprite roster.
 *
 *   npm run sprites -- status              # what is done and what is outstanding
 *   npm run sprites -- check               # verify accepted sheets
 *   npm run sprites -- build               # palette-snap, variants, atlas
 *   npm run sprites -- status --theme knight-magic
 *
 * This is the V0.4.0 skeleton: the commands exist, resolve the manifest, and
 * report honestly, but the roster is empty so all three have nothing to do. The
 * pipeline behind `check` and `build` — palette snapping, alpha cleaning, hue
 * variants, and atlas packing — is V0.4.1's, and is specified in
 * `build/SPRITE_PLAN_V0.4.1.md` §2 and §6.
 *
 * Themes come from `theme-registry`, not `active-theme`: the roster is built
 * per pack, and a pack the game does not currently render still has sheets to
 * verify.
 */
import { themeRegistry, type ThemeRegistryEntry } from "../src/game/content/theme-registry";
import { spriteEntries } from "../src/game/systems/sprites/resolve-sprite";

const commands = ["status", "check", "build"] as const;
type Command = (typeof commands)[number];

interface Options {
  readonly command: Command;
  readonly theme: string | undefined;
}

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

function declaredCount(entries: readonly ThemeRegistryEntry[]): number {
  return entries.reduce((total, entry) => total + spriteEntries(entry.theme.tokens).length, 0);
}

function check(entries: readonly ThemeRegistryEntry[]): void {
  const total = declaredCount(entries);
  if (total === 0) {
    process.stdout.write("check: no sheets declared, nothing to verify\n");
    return;
  }
  // Canvas size, strip width, alpha binarity, tonal step count, and outline
  // closure all need the file rather than the manifest, which is why they are
  // not in `define-theme`'s validation.
  throw new Error(
    `check: ${total} sheet(s) declared but sheet verification is not implemented yet (V0.4.1 Phase S1)`,
  );
}

function build(entries: readonly ThemeRegistryEntry[]): void {
  const total = declaredCount(entries);
  if (total === 0) {
    process.stdout.write("build: no sheets declared, nothing to build\n");
    return;
  }
  throw new Error(
    `build: ${total} sheet(s) declared but the pipeline is not implemented yet (V0.4.1 Phase S1)`,
  );
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const entries = selectThemes(options.theme);
  if (options.command === "status") status(entries);
  if (options.command === "check") check(entries);
  if (options.command === "build") build(entries);
  process.stdout.write("\n");
}

main();
