// npx vite-node build/content/G3_CAPTURE.ts <output.json>
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { themeRegistry } from "../../src/game/content/theme-registry";
import { findBuildModel } from "../../src/game/systems/simulation/build-models";
import { simulatePacing, type TimedWorldChoice } from "../../src/game/systems/simulation/pacing-simulator";
const cases = [];
for (const { key, theme } of themeRegistry) for (const difficulty of ["beginner", "normal", "experienced"] as const)
  for (const buildId of ["damage-rush", "two-tools-packed", "evolved-packed"]) {
    const siteChoices = theme.tuning.shrines.arrivals.flatMap((arrival): TimedWorldChoice[] => {
      const definition = theme.shrines.find((shrine) => shrine.id === arrival.shrineId)!;
      return definition.effectKind === "world_multiplier" ? [{ kind: "shrine", id: arrival.shrineId, atMs: arrival.appearAt * 300000 }] : [];
    });
    const paths: Record<string, readonly TimedWorldChoice[]> = {
      ignored: [], greed: siteChoices.filter((choice) => choice.id === "shrine.greed"),
      multiplicity: siteChoices.filter((choice) => choice.id === "shrine.multiplicity"),
      worldSites: siteChoices,
      worldSitesCurses: [...siteChoices, ...theme.curses.map((curse, index): TimedWorldChoice => ({ kind: "curse", id: curse.id, atMs: [150000, 225000][index]! }))],
    };
    for (const [path, worldChoices] of Object.entries(paths)) {
      const report = simulatePacing({ theme, difficulty, build: findBuildModel(buildId)!, durationMs: 300000, worldChoices });
      cases.push({ theme: key, path, worldChoices, ...report });
    }
  }
writeFileSync(process.argv[2]!, JSON.stringify({ parent: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  limits: ["Explicit acceptance at authored reveal time; no travel or offers", "Curse acceptance at scripted150/225s, not natural offers", "Only world-multiplier sites; no surge/duplication actors, children, elites, bosses, incoming damage or movement", "Current spawn-time cohorts/100ms sampling; no cap increase"], cases }, null, 2) + "\n");
