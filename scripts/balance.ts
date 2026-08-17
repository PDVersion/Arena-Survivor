/**
 * Print run pacing tables without opening a browser.
 *
 *   npm run balance
 *   npm run balance -- --build crit --minutes 10 --chaos 3
 *   npm run balance -- --build all --theme knight-magic
 *
 * A five-minute balance question becomes a sub-second one. See
 * `src/game/systems/simulation/pacing-simulator.ts` for what the model does
 * and does not cover.
 */
import { activeTheme } from "../src/game/content/active-theme";
import { themeRegistry } from "../src/game/content/theme-registry";
import { buildModels, findBuildModel } from "../src/game/systems/simulation/build-models";
import { formatPacingReport } from "../src/game/systems/simulation/format-report";
import { simulatePacing } from "../src/game/systems/simulation/pacing-simulator";

interface Options {
  readonly build: string;
  readonly minutes: number;
  readonly chaos: number;
  readonly theme: string | undefined;
}

function parseArgs(argv: readonly string[]): Options {
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const [flag, inline] = arg.slice(2).split("=", 2);
    values.set(flag, inline ?? argv[index + 1] ?? "");
  }
  const minutes = Number(values.get("minutes") ?? 5);
  const chaos = Number(values.get("chaos") ?? 1);
  if (!Number.isFinite(minutes) || minutes <= 0) throw new Error("--minutes must be positive");
  if (!Number.isFinite(chaos) || chaos < 1) throw new Error("--chaos must be at least 1");
  return {
    build: values.get("build") ?? "all",
    minutes,
    chaos,
    theme: values.get("theme"),
  };
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const theme = options.theme
    ? themeRegistry.find((entry) => entry.id === options.theme || entry.key === options.theme)?.theme
    : activeTheme;
  if (!theme) {
    const known = themeRegistry.map((entry) => entry.key).join(", ");
    throw new Error(`Unknown theme: ${options.theme}. Known themes: ${known}`);
  }

  const models =
    options.build === "all"
      ? buildModels
      : [findBuildModel(options.build)].filter((model) => model !== undefined);
  if (models.length === 0) {
    const known = buildModels.map((model) => model.id).join(", ");
    throw new Error(`Unknown build: ${options.build}. Known builds: all, ${known}`);
  }

  for (const build of models) {
    const report = simulatePacing({
      theme,
      build,
      durationMs: options.minutes * 60_000,
      chaos: options.chaos,
    });
    process.stdout.write(`\n${build.description}\n`);
    process.stdout.write(`${formatPacingReport(report)}\n`);
  }
  process.stdout.write("\n");
}

main();
